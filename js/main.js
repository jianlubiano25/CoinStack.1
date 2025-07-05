// Main JavaScript file for CoinStack Trading Dashboard
// Handles core functionality, tab switching, and initialization

// Tab switching functionality
function openTab(tabId, buttonElement) {
  // Remove active class from all tabs and contents
  const buttons = document.querySelectorAll('.tab-button');
  const contents = document.querySelectorAll('.tab-content');
  
  buttons.forEach(btn => btn.classList.remove('active'));
  contents.forEach(tab => tab.classList.remove('active'));
  
  // Add active class to selected tab and content
  const targetContent = document.getElementById(tabId);
  if (targetContent) {
    targetContent.classList.add('active');
  }
  if (buttonElement) {
    buttonElement.classList.add('active');
  }
  // Save last active tab
  localStorage.setItem('lastActiveTab', tabId);
}

// Toggle content sections
function toggleContent(el) {
  // Close all other content sections first
  const allContents = document.querySelectorAll('.content');
  const allCollapsibles = document.querySelectorAll('.collapsible');
  
  allContents.forEach(content => {
    if (content !== el.nextElementSibling) {
      content.style.display = 'none';
    }
  });
  
  // Remove active class from all collapsibles
  allCollapsibles.forEach(collapsible => {
    collapsible.classList.remove('active');
  });
  
  // Toggle the clicked content
  const content = el.nextElementSibling;
  if (content.style.display === 'block') {
    content.style.display = 'none';
    el.classList.remove('active');
  } else {
    content.style.display = 'block';
    el.classList.add('active');
  }
}

// Setup tab event listeners
function setupTabListeners() {
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const tabId = this.getAttribute('data-tab');
      if (tabId) {
        openTab(tabId, this);
      }
    });
  });
}

// Setup collapsible event listeners
function setupCollapsibleListeners() {
  const collapsibles = document.querySelectorAll('.collapsible');
  collapsibles.forEach(collapsible => {
    collapsible.addEventListener('click', function() {
      toggleContent(this);
    });
  });
}

// Setup search event listeners
function setupSearchListeners() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      if (typeof searchContent === 'function') {
        searchContent();
      }
    });
    
    searchInput.addEventListener('keyup', function(e) {
      if (e.key === 'Escape') {
        document.getElementById('searchResults').style.display = 'none';
      }
    });
  }
}

// Setup trading event listeners
function setupTradingListeners() {
  // Export button
  const exportBtn = document.querySelector('.btn-export');
  if (exportBtn) {
    exportBtn.addEventListener('click', function() {
      if (typeof exportCSV === 'function') {
        exportCSV();
      }
    });
  }
  
  // Import button
  const importBtn = document.querySelector('.btn-import');
  if (importBtn) {
    importBtn.addEventListener('click', function() {
      document.getElementById('importCSV').click();
    });
  }
  
  // Import file input
  const importInput = document.getElementById('importCSV');
  if (importInput) {
    importInput.addEventListener('change', function(event) {
      if (typeof importCSVFile === 'function') {
        importCSVFile(event);
      }
    });
  }
  
  // Bulk paste button
  const bulkBtn = document.querySelector('.btn-bulk');
  if (bulkBtn) {
    bulkBtn.addEventListener('click', function() {
      if (typeof showBulkPaste === 'function') {
        showBulkPaste();
      }
    });
  }
  
  // Clear all button
  const clearBtn = document.querySelector('.btn-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      if (typeof clearAllTrades === 'function') {
        clearAllTrades();
      }
    });
  }
  
  // Toggle add trade form button
  const toggleBtn = document.getElementById('toggleAddTradeBtn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function() {
      if (typeof toggleAddTradeForm === 'function') {
        toggleAddTradeForm();
      }
    });
  }
  
  // Trade form submission
  const tradeForm = document.getElementById('tradeForm');
  if (tradeForm) {
    tradeForm.addEventListener('submit', function(event) {
      if (typeof addTrade === 'function') {
        addTrade(event);
      }
    });
  }
  
  // Trading table event delegation
  const tradingTable = document.getElementById('tradingHistoryTable');
  if (tradingTable) {
    tradingTable.addEventListener('click', function(event) {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      
      const action = button.getAttribute('data-action');
      const index = parseInt(button.getAttribute('data-index'));
      
      if (action === 'edit' && typeof editTrade === 'function') {
        editTrade(index);
      } else if (action === 'delete' && typeof deleteTrade === 'function') {
        deleteTrade(index);
      }
    });
  }
  
  // Bulk paste modal events
  const bulkModal = document.getElementById('bulkPasteModal');
  if (bulkModal) {
    // Close button
    const closeBtn = bulkModal.querySelector('button');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        if (typeof hideBulkPaste === 'function') {
          hideBulkPaste();
        }
      });
    }
    
    // Submit button
    const submitBtn = bulkModal.querySelector('button[style*="background:#8b5cf6"]');
    if (submitBtn) {
      submitBtn.addEventListener('click', function() {
        if (typeof submitBulkPaste === 'function') {
          submitBulkPaste();
        }
      });
    }
  }
  
  // Edit trade modal events
  const editModal = document.getElementById('editTradeModal');
  if (editModal) {
    // Close button
    const closeBtn = editModal.querySelector('button');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        if (typeof hideEditTrade === 'function') {
          hideEditTrade();
        }
      });
    }
    
    // Cancel button
    const cancelBtn = editModal.querySelector('button[style*="background:#6b7280"]');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function() {
        if (typeof hideEditTrade === 'function') {
          hideEditTrade();
        }
      });
    }
    
    // Form submission
    const editForm = document.getElementById('editTradeForm');
    if (editForm) {
      editForm.addEventListener('submit', function(event) {
        if (typeof saveEditTrade === 'function') {
          saveEditTrade(event);
        }
      });
    }
  }
}

// Setup schedule event listeners
function setupScheduleListeners() {
  // Schedule form submission
  const scheduleForm = document.getElementById('scheduleForm');
  if (scheduleForm) {
    scheduleForm.addEventListener('submit', function(event) {
      if (typeof addScheduleEntry === 'function') {
        addScheduleEntry(event);
      }
    });
  }
  
  // Auto-detect session type
  const startDateTimeInput = document.getElementById('scheduleStartDateTime');
  const endDateTimeInput = document.getElementById('scheduleEndDateTime');
  const sessionSelect = document.getElementById('scheduleSession');
  
  if (startDateTimeInput) {
    startDateTimeInput.addEventListener('change', function() {
      if (typeof autoDetectSession === 'function') {
        autoDetectSession();
      }
    });
    
    startDateTimeInput.addEventListener('blur', function() {
      if (typeof autoDetectSession === 'function') {
        autoDetectSession();
      }
    });
  }
  
  if (endDateTimeInput) {
    endDateTimeInput.addEventListener('change', function() {
      if (typeof autoDetectSession === 'function') {
        autoDetectSession();
      }
    });
    
    endDateTimeInput.addEventListener('blur', function() {
      if (typeof autoDetectSession === 'function') {
        autoDetectSession();
      }
    });
  }
  
  // Schedule table event delegation
  const scheduleTable = document.getElementById('scheduleTable');
  if (scheduleTable) {
    scheduleTable.addEventListener('click', function(event) {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      
      const action = button.getAttribute('data-action');
      const index = parseInt(button.getAttribute('data-index'));
      
      if (action === 'edit' && typeof editScheduleEntry === 'function') {
        editScheduleEntry(index);
      } else if (action === 'delete' && typeof deleteScheduleEntry === 'function') {
        deleteScheduleEntry(index);
      }
    });
  }
  
  // Quick add session buttons
  const quickAddButtons = document.querySelectorAll('button[style*="background:rgba(245,158,11,0.1)"], button[style*="background:rgba(239,68,68,0.1)"]');
  quickAddButtons.forEach(button => {
    button.addEventListener('click', function() {
      const text = this.textContent;
      if (text.includes('London Open')) {
        if (typeof quickAddSession === 'function') {
          quickAddSession('London Open', '15:00', '17:00');
        }
      } else if (text.includes('London+NY Overlap')) {
        if (typeof quickAddSession === 'function') {
          quickAddSession('London + NY Overlap', '20:00', '00:00');
        }
      } else if (text.includes('NY Open')) {
        if (typeof quickAddSession === 'function') {
          quickAddSession('New York Open', '21:00', '23:00');
        }
      } else if (text.includes('NY Drift')) {
        if (typeof quickAddSession === 'function') {
          quickAddSession('NY Drift/Closing', '00:00', '02:00');
        }
      } else if (text.includes('Asian')) {
        if (typeof quickAddSession === 'function') {
          quickAddSession('Asian Session', '02:00', '10:00');
        }
      } else if (text.includes('Pre-London')) {
        if (typeof quickAddSession === 'function') {
          quickAddSession('Pre-London', '10:00', '14:00');
        }
      }
    });
  });
  
  // Export schedule button
  const exportScheduleBtn = document.querySelector('button[style*="background: rgba(16,185,129,0.1)"]');
  if (exportScheduleBtn) {
    exportScheduleBtn.addEventListener('click', function() {
      if (typeof exportScheduleCSV === 'function') {
        exportScheduleCSV();
      }
    });
  }
  
  // Clear completed sessions button
  const clearCompletedBtn = document.querySelector('button[style*="background: rgba(239,68,68,0.1)"]');
  if (clearCompletedBtn) {
    clearCompletedBtn.addEventListener('click', function() {
      if (typeof clearCompletedSessions === 'function') {
        clearCompletedSessions();
      }
    });
  }
}

// Initialize the application
function initializeApp() {
  // Setup event listeners
  setupTabListeners();
  setupCollapsibleListeners();
  setupSearchListeners();
  setupTradingListeners();
  setupScheduleListeners();
  
  // Restore last active tab
  const lastTab = localStorage.getItem('lastActiveTab');
  if (lastTab && document.getElementById(lastTab)) {
    const tabButton = document.querySelector(`[data-tab="${lastTab}"]`);
    if (tabButton) {
      openTab(lastTab, tabButton);
    }
  }
  
  // Initialize trading history
  if (typeof renderTrades === 'function') {
    renderTrades();
  }
  
  // Initialize trading schedule
  if (typeof renderSchedule === 'function') {
    renderSchedule();
  }
  
  // Set default datetime to current time in text format
  const now = new Date();
  const currentDateTime = now.getFullYear() + '-' + 
    String(now.getMonth() + 1).padStart(2, '0') + '-' + 
    String(now.getDate()).padStart(2, '0') + ' ' + 
    String(now.getHours()).padStart(2, '0') + ':' + 
    String(now.getMinutes()).padStart(2, '0') + ':' + 
    String(now.getSeconds()).padStart(2, '0');
  
  const startDateTimeInput = document.getElementById('scheduleStartDateTime');
  const endDateTimeInput = document.getElementById('scheduleEndDateTime');
  
  if (startDateTimeInput) startDateTimeInput.value = currentDateTime;
  if (endDateTimeInput) endDateTimeInput.value = currentDateTime;
}

// Close search results when clicking outside
function setupSearchClickOutside() {
  document.addEventListener('click', function(event) {
    const searchResults = document.getElementById('searchResults');
    const searchInput = document.getElementById('searchInput');
    
    if (searchResults && searchInput && !searchResults.contains(event.target) && !searchInput.contains(event.target)) {
      searchResults.style.display = 'none';
    }
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
  setupSearchClickOutside();
});

// Export functions for use in other modules
window.openTab = openTab;
window.toggleContent = toggleContent; 
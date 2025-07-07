// Main JavaScript file for CoinStack Trading Dashboard
// Handles core functionality, tab switching, and initialization

// Cache frequently used DOM elements
const DOM_CACHE = {
  tabButtons: null,
  tabContents: null,
  collapsibles: null,
  searchInput: null,
  searchResults: null
};

// Initialize DOM cache
function initDOMCache() {
  DOM_CACHE.tabButtons = document.querySelectorAll('.tab-button');
  DOM_CACHE.tabContents = document.querySelectorAll('.tab-content');
  DOM_CACHE.collapsibles = document.querySelectorAll('.collapsible');
  DOM_CACHE.searchInput = document.getElementById('searchInput');
  DOM_CACHE.searchResults = document.getElementById('searchResults');
}

// Tab switching functionality
function openTab(tabId, buttonElement) {
  // Remove active class from all tabs and contents
  DOM_CACHE.tabButtons.forEach(btn => btn.classList.remove('active'));
  DOM_CACHE.tabContents.forEach(tab => tab.classList.remove('active'));
  
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

// Toggle content sections with improved performance
function toggleContent(el) {
  const content = el.nextElementSibling;
  const isVisible = content.style.display === 'block';
  
  // Close all other content sections first
  DOM_CACHE.collapsibles.forEach(collapsible => {
    const otherContent = collapsible.nextElementSibling;
    if (otherContent && otherContent !== content) {
      otherContent.style.display = 'none';
      collapsible.classList.remove('active');
    }
  });
  
  // Toggle the clicked content
  content.style.display = isVisible ? 'none' : 'block';
  el.classList.toggle('active', !isVisible);
}

// Setup tab event listeners with event delegation
function setupTabListeners() {
  document.addEventListener('click', function(event) {
    const tabButton = event.target.closest('.tab-button');
    if (tabButton) {
      const tabId = tabButton.getAttribute('data-tab');
      if (tabId) {
        openTab(tabId, tabButton);
      }
    }
  });
}

// Setup collapsible event listeners with event delegation
function setupCollapsibleListeners() {
  document.addEventListener('click', function(event) {
    const collapsible = event.target.closest('.collapsible');
    if (collapsible) {
      toggleContent(collapsible);
    }
  });
}

// Setup search event listeners with debouncing
function setupSearchListeners() {
  if (!DOM_CACHE.searchInput) return;
  
  let searchTimeout;
  
  DOM_CACHE.searchInput.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      if (typeof searchContent === 'function') {
        searchContent();
      }
    }, 300); // Debounce search input
  });
  
  DOM_CACHE.searchInput.addEventListener('keyup', function(e) {
    if (e.key === 'Escape' && DOM_CACHE.searchResults) {
      DOM_CACHE.searchResults.style.display = 'none';
    }
  });
}

// Optimized trading event listeners with event delegation
function setupTradingListeners() {
  // Export button
  const exportBtn = document.getElementById('exportTradesBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', function() {
      if (typeof exportCSV === 'function') {
        exportCSV();
      }
    });
  }
  
  // Import button
  const importBtn = document.getElementById('importTradesBtn');
  if (importBtn) {
    importBtn.addEventListener('click', function() {
      if (typeof importCSV === 'function') {
        importCSV();
      }
    });
  }
  
  // CSV file input event listener
  const csvFileInput = document.getElementById('importCSV');
  if (csvFileInput) {
    csvFileInput.addEventListener('change', function(event) {
      if (typeof handleCSVImport === 'function') {
        handleCSVImport(event);
      }
    });
  }
  
  // Event delegation for trading buttons
  document.addEventListener('click', function(event) {
    const target = event.target;
    
    // Bulk paste button
    if (target.classList.contains('btn-bulk')) {
      if (typeof showBulkPaste === 'function') {
        showBulkPaste();
      }
    }
    
    // Clear all button
    if (target.classList.contains('btn-clear')) {
      if (typeof clearAllTrades === 'function') {
        clearAllTrades();
      }
    }
    
    // Toggle add trade form button
    if (target.id === 'toggleAddTradeBtn') {
      if (typeof toggleAddTradeForm === 'function') {
        toggleAddTradeForm();
      }
    }
  });
  
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
    
    // Add trades button
    const addTradesBtn = bulkModal.querySelector('button:last-child');
    if (addTradesBtn) {
      addTradesBtn.addEventListener('click', function() {
        if (typeof processBulkPaste === 'function') {
          processBulkPaste();
        }
      });
    }
    
    // Close modal on outside click
    bulkModal.addEventListener('click', function(event) {
      if (event.target === bulkModal) {
        if (typeof hideBulkPaste === 'function') {
          hideBulkPaste();
        }
      }
    });
  }
  
  // Edit trade modal events
  const editModal = document.getElementById('editTradeModal');
  if (editModal) {
    // Close button
    const closeBtn = editModal.querySelector('button');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        if (typeof hideEditModal === 'function') {
          hideEditModal();
        }
      });
    }
    
    // Cancel button
    const cancelBtn = editModal.querySelector('button:last-child');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function() {
        if (typeof hideEditModal === 'function') {
          hideEditModal();
        }
      });
    }
    
    // Form submission
    const editForm = document.getElementById('editTradeForm');
    if (editForm) {
      editForm.addEventListener('submit', function(event) {
        event.preventDefault();
        if (typeof saveEditTrade === 'function') {
          saveEditTrade();
        }
      });
    }
    
    // Close modal on outside click
    editModal.addEventListener('click', function(event) {
      if (event.target === editModal) {
        if (typeof hideEditModal === 'function') {
          hideEditModal();
        }
      }
    });
  }
}

// Optimized schedule event listeners
function setupScheduleListeners() {
  // Export schedule button
  const exportScheduleBtn = document.getElementById('exportScheduleBtn');
  if (exportScheduleBtn) {
    exportScheduleBtn.addEventListener('click', function() {
      if (typeof exportScheduleCSV === 'function') {
        exportScheduleCSV();
      }
    });
  }
  
  // Clear completed button
  const clearCompletedBtn = document.querySelector('.btn-clear-completed');
  if (clearCompletedBtn) {
    clearCompletedBtn.addEventListener('click', function() {
      if (typeof clearCompletedSessions === 'function') {
        clearCompletedSessions();
      }
    });
  }
  
  // Schedule form submission
  const scheduleForm = document.getElementById('scheduleForm');
  if (scheduleForm) {
    scheduleForm.addEventListener('submit', function(event) {
      if (typeof addScheduleSession === 'function') {
        addScheduleSession(event);
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
      
      if (action === 'edit' && typeof editScheduleSession === 'function') {
        editScheduleSession(index);
      } else if (action === 'delete' && typeof deleteScheduleSession === 'function') {
        deleteScheduleSession(index);
      } else if (action === 'complete' && typeof completeScheduleSession === 'function') {
        completeScheduleSession(index);
      }
    });
  }
  
  // Quick add buttons
  document.addEventListener('click', function(event) {
    const target = event.target;
    if (target.matches('button[data-quick-add]')) {
      const sessionType = target.getAttribute('data-quick-add');
      if (typeof quickAddSession === 'function') {
        quickAddSession(sessionType);
      }
    }
  });
  
  // DateTime inputs for auto-calculation
  const startDateTimeInput = document.getElementById('scheduleStartDateTime');
  const endDateTimeInput = document.getElementById('scheduleEndDateTime');
  const durationInput = document.getElementById('scheduleDuration');
  
  if (startDateTimeInput && endDateTimeInput && durationInput) {
    function calculateDuration() {
      const start = new Date(startDateTimeInput.value);
      const end = new Date(endDateTimeInput.value);
      
      if (start && end && start < end) {
        const diff = end - start;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        durationInput.value = `${hours}h ${minutes}m`;
      }
    }
    
    startDateTimeInput.addEventListener('change', calculateDuration);
    endDateTimeInput.addEventListener('change', calculateDuration);
  }
}

// Optimized knowledge base setup
function setupKnowledgeBase() {
  // Knowledge base navigation
  setupKnowledgeBaseNavigation();
  
  // Search functionality
  setupSearchClickOutside();
}

// Optimized knowledge base navigation
function setupKnowledgeBaseNavigation() {
  const kbNavButtons = document.querySelectorAll('.kb-nav-btn');
  const kbSections = document.querySelectorAll('.kb-section');
  
  kbNavButtons.forEach(button => {
    button.addEventListener('click', function() {
      const section = this.getAttribute('data-section');
      
      // Update active states
      kbNavButtons.forEach(btn => btn.classList.remove('active'));
      kbSections.forEach(sec => sec.classList.remove('active'));
      
      this.classList.add('active');
      const targetSection = document.getElementById(section);
      if (targetSection) {
        targetSection.classList.add('active');
      }
    });
  });
}

// Optimized search click outside functionality
function setupSearchClickOutside() {
  document.addEventListener('click', function(event) {
    const searchContainer = document.querySelector('.search-container');
    const searchResults = document.getElementById('searchResults');
    
    if (searchContainer && searchResults && !searchContainer.contains(event.target)) {
      searchResults.style.display = 'none';
    }
  });
}

// Optimized position calculator opener
function openPositionCalculator() {
  window.open('position-calculator.html', '_blank');
}

// Main initialization function
function initializeApp() {
  // Initialize DOM cache
  initDOMCache();
  
  // Setup all event listeners
  setupTabListeners();
  setupCollapsibleListeners();
  setupSearchListeners();
  setupTradingListeners();
  setupScheduleListeners();
  setupKnowledgeBase();
  
  // Restore last active tab
  const lastActiveTab = localStorage.getItem('lastActiveTab');
  if (lastActiveTab) {
    const tabButton = document.querySelector(`[data-tab="${lastActiveTab}"]`);
    if (tabButton) {
      openTab(lastActiveTab, tabButton);
    }
  }
  
  // Initialize any additional modules
  if (typeof initializeTradingModule === 'function') {
    initializeTradingModule();
  }
  
  if (typeof initializeScheduleModule === 'function') {
    initializeScheduleModule();
  }
  
  console.log('CoinStack Trading Dashboard initialized successfully');
}

// Performance optimization: Use requestIdleCallback for non-critical initialization
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    initializeApp();
  });
} else {
  // Fallback for browsers that don't support requestIdleCallback
  setTimeout(initializeApp, 0);
}

// Export functions for use in other modules
window.CoinStack = {
  openTab,
  toggleContent,
  openPositionCalculator,
  initializeApp
}; 
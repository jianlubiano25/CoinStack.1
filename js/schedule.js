// Trading Schedule functionality for CoinStack Trading Dashboard
// Handles schedule management, session detection, and schedule operations

// Default schedule data
const defaultSchedule = [
  {
    id: '1',
    date: '2025-01-15',
    startTime: '08:00',
    endTime: '12:00',
    sessionType: 'London Open',
    notes: 'Focus on major pairs',
    status: 'Scheduled'
  },
  {
    id: '2',
    date: '2025-01-15',
    startTime: '13:00',
    endTime: '17:00',
    sessionType: 'New York Open',
    notes: 'High volatility expected',
    status: 'Scheduled'
  }
];

// Get schedule from localStorage
function getSchedule() {
  const schedule = localStorage.getItem('tradingSchedule');
  if (schedule) return JSON.parse(schedule);
  localStorage.setItem('tradingSchedule', JSON.stringify(defaultSchedule));
  return [...defaultSchedule];
}

// Save schedule to localStorage
function saveSchedule(schedule) {
  localStorage.setItem('tradingSchedule', JSON.stringify(schedule));
}

// Calculate duration between two times
function calculateDuration(startTime, endTime) {
  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);
  const diffMs = end - start;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${diffHours}h ${diffMinutes}m`;
}

// Format date for display
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
}

// Get status color for schedule entries
function getStatusColor(status) {
  switch(status) {
    case 'Scheduled': return '#8b5cf6';
    case 'In Progress': return '#f59e0b';
    case 'Completed': return '#10b981';
    case 'Cancelled': return '#ef4444';
    default: return '#ffffff';
  }
}

// Update schedule statistics
function updateScheduleStats() {
  const schedule = getSchedule();
  const total = schedule.length;
  const completed = schedule.filter(s => s.status === 'Completed').length;
  const scheduled = schedule.filter(s => s.status === 'Scheduled').length;
  const inProgress = schedule.filter(s => s.status === 'In Progress').length;
  
  // Update stats cards
  const totalElement = document.getElementById('totalSessions');
  const scheduledElement = document.getElementById('scheduledSessions');
  const inProgressElement = document.getElementById('inProgressSessions');
  const completedElement = document.getElementById('completedSessions');
  
  if (totalElement) totalElement.textContent = total;
  if (scheduledElement) scheduledElement.textContent = scheduled;
  if (inProgressElement) inProgressElement.textContent = inProgress;
  if (completedElement) completedElement.textContent = completed;
}

// Render schedule table
function renderSchedule() {
  const schedule = getSchedule();
  const tbody = document.querySelector('#scheduleTable tbody');
  const mobileContainer = document.querySelector('.schedule-table-mobile');
  
  if (!tbody) return;
  
  tbody.innerHTML = '';
  if (mobileContainer) mobileContainer.innerHTML = '';
  
  schedule.forEach((entry, index) => {
    const tr = document.createElement('tr');
    const duration = calculateDuration(entry.startTime, entry.endTime);
    const statusColor = getStatusColor(entry.status);
    const timeRange = `${entry.startTime} - ${entry.endTime}`;
    
    tr.innerHTML = `
      <td style="text-align: center; padding: 12px;">
        <button data-action="edit" data-index="${index}" style="background:none; color:#8b5cf6; border:none; padding:4px 8px; margin-right:4px; cursor:pointer; font-size:0.9em; border-radius:4px; transition: all 0.2s ease;" title="Edit">✏️</button>
        <button data-action="delete" data-index="${index}" style="background:none; color:#ef4444; border:none; padding:4px 8px; cursor:pointer; font-size:0.9em; border-radius:4px; transition: all 0.2s ease;" title="Delete">❌</button>
      </td>
      <td style="padding: 12px; color: #d1d5db;">${formatDate(entry.date)}</td>
      <td style="padding: 12px; color: #d1d5db;">${timeRange}</td>
      <td style="padding: 12px; color: #9ca3af; font-size: 0.85rem;">${duration}</td>
      <td style="padding: 12px; color: #d1d5db;">${entry.sessionType}</td>
      <td style="padding: 12px; color: #9ca3af; font-size: 0.85rem;">${entry.notes || '-'}</td>
      <td style="padding: 12px; color: ${statusColor}; font-weight: 500;">${entry.status}</td>
    `;
    tbody.appendChild(tr);
    
    // Generate mobile card
    if (mobileContainer) {
      const card = document.createElement('div');
      card.className = 'schedule-card';
      card.setAttribute('data-index', index);
      
      const statusClass = entry.status.toLowerCase().replace(' ', '-');
      
      card.innerHTML = `
        <div class="schedule-header">
          <div class="schedule-session">${entry.sessionType}</div>
          <div class="schedule-status ${statusClass}">${entry.status}</div>
          <div class="schedule-actions">
            <button data-action="edit" data-index="${index}" class="edit" title="Edit">✏️</button>
            <button data-action="delete" data-index="${index}" class="delete" title="Delete">❌</button>
          </div>
        </div>
        <div class="schedule-details">
          <div class="schedule-detail">
            <div class="schedule-detail-label">Date</div>
            <div class="schedule-detail-value">${formatDate(entry.date)}</div>
          </div>
          <div class="schedule-detail">
            <div class="schedule-detail-label">Time</div>
            <div class="schedule-detail-value">${timeRange}</div>
          </div>
          <div class="schedule-detail">
            <div class="schedule-detail-label">Duration</div>
            <div class="schedule-detail-value">${duration}</div>
          </div>
          <div class="schedule-detail">
            <div class="schedule-detail-label">Status</div>
            <div class="schedule-detail-value" style="color: ${statusColor};">${entry.status}</div>
          </div>
        </div>
        ${entry.notes ? `<div class="schedule-notes">📝 ${entry.notes}</div>` : ''}
      `;
      mobileContainer.appendChild(card);
    }
  });
  
  updateScheduleStats();
}

// Add new schedule entry
function addScheduleEntry(event) {
  event.preventDefault();
  
  const startDateTime = document.getElementById('scheduleStartDateTime').value;
  const endDateTime = document.getElementById('scheduleEndDateTime').value;
  
  // Parse datetime inputs
  let startDate, endDate;
  
  try {
    if (startDateTime.includes('T')) {
      startDate = new Date(startDateTime);
    } else {
      startDate = new Date(startDateTime.replace(' ', 'T'));
    }
    
    if (endDateTime.includes('T')) {
      endDate = new Date(endDateTime);
    } else {
      endDate = new Date(endDateTime.replace(' ', 'T'));
    }
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      alert('Please enter valid datetime format: YYYY-MM-DD HH:MM:SS');
      return;
    }
  } catch (e) {
    alert('Please enter valid datetime format: YYYY-MM-DD HH:MM:SS');
    return;
  }
  
  const entry = {
    id: Date.now().toString(),
    date: startDate.toISOString().split('T')[0],
    startTime: startDate.toTimeString().slice(0, 5),
    endTime: endDate.toTimeString().slice(0, 5),
    sessionType: document.getElementById('scheduleSession').value,
    notes: document.getElementById('scheduleNotes').value,
    status: document.getElementById('scheduleStatus').value
  };
  
  const schedule = getSchedule();
  schedule.unshift(entry);
  saveSchedule(schedule);
  renderSchedule();
  
  // Reset form
  event.target.reset();
  
  // Set default datetime to current time
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

// Auto-detect session type based on time
function autoDetectSession() {
  const startDateTime = document.getElementById('scheduleStartDateTime').value;
  const endDateTime = document.getElementById('scheduleEndDateTime').value;
  
  if (!startDateTime || !endDateTime) return;
  
  // Parse datetime strings (format: "2025-06-20 21:51:18")
  let startDate, endDate;
  
  try {
    // Handle different datetime formats
    if (startDateTime.includes('T')) {
      startDate = new Date(startDateTime);
    } else {
      // Convert "2025-06-20 21:51:18" to ISO format
      startDate = new Date(startDateTime.replace(' ', 'T'));
    }
    
    if (endDateTime.includes('T')) {
      endDate = new Date(endDateTime);
    } else {
      endDate = new Date(endDateTime.replace(' ', 'T'));
    }
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return; // Invalid dates
    }
  } catch (e) {
    return; // Invalid date format
  }
  
  // Calculate duration
  const durationMs = endDate - startDate;
  if (durationMs < 0) return; // End time before start time
  
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  
  const durationInput = document.getElementById('scheduleDuration');
  if (durationInput) durationInput.value = `${hours}h ${minutes}m`;
  
  // Get hour in PH time
  const startHour = startDate.getHours();
  
  // Auto-detect session type based on start time
  let sessionType = '';
  
  if (startHour >= 15 && startHour < 17) {
    sessionType = 'London Open';
  } else if (startHour >= 20 && startHour < 24) {
    sessionType = 'London + NY Overlap';
  } else if (startHour >= 21 && startHour < 23) {
    sessionType = 'New York Open';
  } else if (startHour >= 0 && startHour < 2) {
    sessionType = 'NY Drift/Closing';
  } else if (startHour >= 2 && startHour < 10) {
    sessionType = 'Asian Session';
  } else if (startHour >= 10 && startHour < 14) {
    sessionType = 'Pre-London';
  } else {
    sessionType = 'Custom';
  }
  
  const sessionInput = document.getElementById('scheduleSession');
  if (sessionInput) sessionInput.value = sessionType;
}

// Quick add session function
function quickAddSession(sessionType, startTime, endTime) {
  const today = new Date().toISOString().split('T')[0];
  const entry = {
    id: Date.now().toString(),
    date: today,
    startTime: startTime,
    endTime: endTime,
    sessionType: sessionType,
    notes: '',
    status: 'Scheduled'
  };
  
  const schedule = getSchedule();
  schedule.unshift(entry);
  saveSchedule(schedule);
  renderSchedule();
}

// Edit schedule entry
function editScheduleEntry(index) {
  const schedule = getSchedule();
  const entry = schedule[index];
  
  // Create datetime strings in text format
  const startDateTime = `${entry.date} ${entry.startTime}:00`;
  const endDateTime = `${entry.date} ${entry.endTime}:00`;
  
  // Populate form with current values
  const startDateTimeInput = document.getElementById('scheduleStartDateTime');
  const endDateTimeInput = document.getElementById('scheduleEndDateTime');
  const sessionInput = document.getElementById('scheduleSession');
  const notesInput = document.getElementById('scheduleNotes');
  const statusInput = document.getElementById('scheduleStatus');
  
  if (startDateTimeInput) startDateTimeInput.value = startDateTime;
  if (endDateTimeInput) endDateTimeInput.value = endDateTime;
  if (sessionInput) sessionInput.value = entry.sessionType;
  if (notesInput) notesInput.value = entry.notes || '';
  if (statusInput) statusInput.value = entry.status;
  
  // Calculate and display duration
  const startDate = new Date(startDateTime.replace(' ', 'T'));
  const endDate = new Date(endDateTime.replace(' ', 'T'));
  const durationMs = endDate - startDate;
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  
  const durationInput = document.getElementById('scheduleDuration');
  if (durationInput) durationInput.value = `${hours}h ${minutes}m`;
  
  // Remove the old entry and add the updated one
  schedule.splice(index, 1);
  saveSchedule(schedule);
  renderSchedule();
}

// Delete schedule entry
function deleteScheduleEntry(index) {
  if (!confirm('Are you sure you want to delete this schedule entry?')) return;
  
  const schedule = getSchedule();
  schedule.splice(index, 1);
  saveSchedule(schedule);
  renderSchedule();
}

// Export schedule as CSV
function exportScheduleCSV() {
  const schedule = getSchedule();
  const headers = ['Date', 'Start Time', 'End Time', 'Duration', 'Session Type', 'Notes', 'Status'];
  let csv = headers.join(',') + '\n';
  
  schedule.forEach(entry => {
    const duration = calculateDuration(entry.startTime, entry.endTime);
    let row = [
      entry.date,
      entry.startTime,
      entry.endTime,
      duration,
      entry.sessionType,
      entry.notes || '',
      entry.status
    ].map(v => '"' + (v ? v.replace(/"/g, '""') : '') + '"').join(',');
    csv += row + '\n';
  });
  
  // Generate filename with current date and time
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-CA');
  const timeStr = now.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit' 
  }).replace(':', '-');
  const filename = `trading_schedule_${dateStr}_${timeStr}.csv`;
  
  const blob = new Blob([csv], {type: 'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Clear completed sessions
function clearCompletedSessions() {
  if (!confirm('Are you sure you want to clear all completed sessions?')) return;
  
  const schedule = getSchedule();
  const filtered = schedule.filter(entry => entry.status !== 'Completed');
  saveSchedule(filtered);
  renderSchedule();
}

// Setup schedule event listeners
function setupScheduleEventListeners() {
  // Table event listeners
  document.addEventListener('click', function(e) {
    if (e.target.matches('#scheduleTable button[data-action]')) {
      const action = e.target.getAttribute('data-action');
      const index = parseInt(e.target.getAttribute('data-index'));
      
      if (action === 'edit') {
        editScheduleEntry(index);
      } else if (action === 'delete') {
        deleteScheduleEntry(index);
      }
    }
  });
  
  // Mobile card event listeners
  document.addEventListener('click', function(e) {
    if (e.target.matches('.schedule-table-mobile button[data-action]')) {
      const action = e.target.getAttribute('data-action');
      const index = parseInt(e.target.getAttribute('data-index'));
      
      if (action === 'edit') {
        editScheduleEntry(index);
      } else if (action === 'delete') {
        deleteScheduleEntry(index);
      }
    }
  });
  
  // Form event listeners
  const scheduleForm = document.getElementById('scheduleForm');
  if (scheduleForm) {
    scheduleForm.addEventListener('submit', addScheduleEntry);
  }
  
  // Auto-detect session on datetime change
  const startDateTimeInput = document.getElementById('scheduleStartDateTime');
  const endDateTimeInput = document.getElementById('scheduleEndDateTime');
  
  if (startDateTimeInput) {
    startDateTimeInput.addEventListener('input', autoDetectSession);
  }
  if (endDateTimeInput) {
    endDateTimeInput.addEventListener('input', autoDetectSession);
  }
  
  // Export button
  const exportBtn = document.getElementById('exportScheduleBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportScheduleCSV);
  }
}

// Export functions for use in other modules
window.getSchedule = getSchedule;
window.saveSchedule = saveSchedule;
window.renderSchedule = renderSchedule;
window.addScheduleEntry = addScheduleEntry;
window.autoDetectSession = autoDetectSession;
window.quickAddSession = quickAddSession;
window.editScheduleEntry = editScheduleEntry;
window.deleteScheduleEntry = deleteScheduleEntry;
window.exportScheduleCSV = exportScheduleCSV;
window.clearCompletedSessions = clearCompletedSessions;
window.setupScheduleEventListeners = setupScheduleEventListeners; 
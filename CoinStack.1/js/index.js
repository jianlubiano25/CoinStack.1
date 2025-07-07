// Main JavaScript index file for CoinStack Trading Dashboard
// This file initializes the application after all modules are loaded

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('CoinStack: Initializing application...');
  
  // Check if all required functions are available
  if (typeof openTab === 'function') {
    console.log('CoinStack: Main module loaded');
  }
  
  if (typeof searchContent === 'function') {
    console.log('CoinStack: Search module loaded');
  }
  
  if (typeof renderTrades === 'function') {
    console.log('CoinStack: Trading module loaded');
  }
  
  if (typeof renderSchedule === 'function') {
    console.log('CoinStack: Schedule module loaded');
  }
  
  // Initialize the application
  if (typeof initializeApp === 'function') {
    console.log('CoinStack: Calling initializeApp...');
    initializeApp();
  } else {
    console.error('CoinStack: initializeApp function not found!');
  }
  
  console.log('CoinStack: Application ready');
}); 
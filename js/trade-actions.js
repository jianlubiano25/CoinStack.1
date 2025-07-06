// Trade Actions functionality for CoinStack Trading Dashboard
// Handles trade editing, deletion, bulk operations, and trade highlighting

// Edit and Delete Trade Functions
let editingTradeIndex = -1;

// Edit trade function
function editTrade(index) {
  const trades = getTrades();
  const trade = trades[index];
  editingTradeIndex = index;
  
  // Populate the edit form
  document.getElementById('editContracts').value = trade.contracts;
  document.getElementById('editFilledType').value = trade.filledType;
  document.getElementById('editFilledTotal').value = trade.filledTotal;
  document.getElementById('editFilledPriceOrderPrice').value = trade.filledPriceOrderPrice;
  document.getElementById('editFeeRate').value = trade.feeRate;
  document.getElementById('editTradingFee').value = trade.tradingFee;
  document.getElementById('editTradeType').value = trade.tradeType;
  document.getElementById('editOrderType').value = trade.orderType;
  document.getElementById('editTransactionId').value = trade.transactionId;
  document.getElementById('editTransactionTime').value = trade.transactionTime;
  
  // Show the modal
  document.getElementById('editTradeModal').style.display = 'flex';
}

// Hide edit trade modal
function hideEditTrade() {
  document.getElementById('editTradeModal').style.display = 'none';
  editingTradeIndex = -1;
}

// Save edited trade
function saveEditTrade(event) {
  event.preventDefault();
  
  if (editingTradeIndex === -1) return;
  
  const trades = getTrades();
  
  // Update the trade with new values
  trades[editingTradeIndex] = {
    contracts: document.getElementById('editContracts').value,
    filledType: document.getElementById('editFilledType').value,
    filledTotal: document.getElementById('editFilledTotal').value,
    filledPriceOrderPrice: document.getElementById('editFilledPriceOrderPrice').value,
    feeRate: document.getElementById('editFeeRate').value,
    tradingFee: document.getElementById('editTradingFee').value,
    tradeType: document.getElementById('editTradeType').value,
    orderType: document.getElementById('editOrderType').value,
    transactionId: document.getElementById('editTransactionId').value,
    transactionTime: document.getElementById('editTransactionTime').value
  };
  
  saveTrades(trades);
  renderTrades();
  hideEditTrade();
}

// Delete trade function
function deleteTrade(index) {
  if (!confirm('Are you sure you want to delete this trade?')) return;
  
  const trades = getTrades();
  trades.splice(index, 1);
  saveTrades(trades);
  renderTrades();
}

// Clear all trades
function clearAllTrades() {
  if (!confirm('Are you sure you want to clear ALL trading history? This action cannot be undone.')) return;
  
  const trades = getTrades();
  if (trades.length === 0) {
    alert('No trades to clear.');
    return;
  }
  
  // Clear all trades
  saveTrades([]);
  renderTrades();
  alert(`Cleared ${trades.length} trade(s) from history.`);
}

// Export trades as CSV
function exportCSV() {
  const trades = getTrades();
  
  if (trades.length === 0) {
    alert('No trades to export');
    return;
  }
  
  // Define CSV headers (matching import format exactly)
  const headers = [
    'Contracts', 'Filled Type', 'Filled/Total', 'Filled Price/Order Price',
    'Fee Rate', 'Trading Fee', 'Trade Type', 'Order Type', 'Transaction ID',
    'Transaction Time', 'Risk Amount'
  ];
  
  // Create CSV content
  let csvContent = headers.join(',') + '\n';
  
  trades.forEach(trade => {
    const row = [
      trade.contracts || '',
      trade.filledType || '',
      trade.filledTotal || '',
      trade.filledPriceOrderPrice || '',
      trade.feeRate || '',
      trade.tradingFee || '',
      trade.tradeType || '',
      trade.orderType || '',
      trade.transactionId || '',
      trade.transactionTime || '',
      trade.riskAmount || calculateRiskAmount(trade) || ''
    ];
    
    // Escape fields that contain commas or quotes
    const escapedRow = row.map(field => {
      if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        return '"' + field.replace(/"/g, '""') + '"';
      }
      return field;
    });
    
    csvContent += escapedRow.join(',') + '\n';
  });
  
  // Generate filename with current date
  const dateStr = new Date().toISOString().split('T')[0];
  const defaultFilename = `trading_history_${dateStr}.csv`;
  
  let filename = prompt('Save as:', defaultFilename);
  if (!filename) return;
  if (!filename.toLowerCase().endsWith('.csv')) filename += '.csv';
  
  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  console.log(`Exported ${trades.length} trades to ${filename}`);
}

// Import trades from CSV - This function is now handled in trading.js

// Bulk Paste functionality
function showBulkPaste() {
  document.getElementById('bulkPasteModal').style.display = 'flex';
  document.getElementById('bulkPasteInput').value = '';
  document.getElementById('bulkPasteError').style.display = 'none';
  document.getElementById('bulkPasteSummary').style.display = 'none';
}

function hideBulkPaste() {
  document.getElementById('bulkPasteModal').style.display = 'none';
}

function submitBulkPaste() {
  const input = document.getElementById('bulkPasteInput').value.trim();
  const errorDiv = document.getElementById('bulkPasteError');
  const summaryDiv = document.getElementById('bulkPasteSummary');
  errorDiv.style.display = 'none';
  summaryDiv.style.display = 'none';
  
  if (!input) {
    errorDiv.textContent = 'Please paste at least one line.';
    errorDiv.style.display = 'block';
    return;
  }
  
  const lines = input.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  let added = 0, skipped = 0;
  const trades = getTrades();
  
  for (let line of lines) {
    let fields = line.split(/\t/);
    if (fields.length < 10 || fields.length > 11) { skipped++; continue; }
    
    const trade = {
      contracts: fields[0],
      filledType: fields[1],
      filledTotal: fields[2],
      filledPriceOrderPrice: fields[3],
      feeRate: fields[4],
      tradingFee: fields[5],
      tradeType: fields[6],
      orderType: fields[7],
      transactionId: fields[8],
      transactionTime: fields[9],
      riskAmount: fields.length === 11 ? fields[10] : '-'
    };
    
    if (!trades.some(t => t.transactionId === trade.transactionId)) {
      trades.push(trade);
      added++;
    } else {
      skipped++;
    }
  }
  
  saveTrades(trades);
  renderTrades();
  summaryDiv.textContent = `Added ${added} trade(s), skipped ${skipped} (duplicates or invalid).`;
  summaryDiv.style.display = 'block';
  errorDiv.style.display = 'none';
  if (added > 0) document.getElementById('bulkPasteInput').value = '';
}

// Toggle Add Trade Form
function toggleAddTradeForm() {
  console.log('toggleAddTradeForm called');
  const form = document.getElementById('addTradeForm');
  const btn = document.getElementById('toggleAddTradeBtn');
  const btnText = document.getElementById('toggleBtnText');
  
  console.log('Form found:', form);
  console.log('Button found:', btn);
  console.log('Button text found:', btnText);
  console.log('Current form display:', form.style.display);
  
  if (form.style.display === 'none' || form.style.display === '') {
    console.log('Showing form...');
    // Show form
    form.style.display = 'block';
    form.style.opacity = '0';
    form.style.transform = 'translateY(-20px)';
    form.style.maxHeight = '0';
    
    // Force reflow
    form.offsetHeight;
    
    // Animate in
    form.style.transition = 'all 0.3s ease-out';
    form.style.opacity = '1';
    form.style.transform = 'translateY(0)';
    form.style.maxHeight = '500px';
    
    btnText.textContent = '➖ Hide Add Trade';
    btn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    console.log('Form should now be visible');
  } else {
    console.log('Hiding form...');
    // Hide form
    form.style.transition = 'all 0.3s ease-out';
    form.style.opacity = '0';
    form.style.transform = 'translateY(-20px)';
    form.style.maxHeight = '0';
    
    setTimeout(() => {
      form.style.display = 'none';
      form.style.transition = '';
    }, 300);
    
    btnText.textContent = '➕ Add New Trade';
    btn.style.background = 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)';
    console.log('Form should now be hidden');
  }
}

// Highlight related open/close trades on hover
function highlightRelatedTrades(row) {
  const trades = getTrades();
  const transactionId = row.getAttribute('data-transaction-id');
  const tradeType = row.getAttribute('data-trade-type');
  
  // Find the trade object
  const trade = trades.find(t => t.transactionId === transactionId);
  if (!trade) return;
  
  // For close: highlight all matching open trades used for PnL
  // For open: highlight all close trades that use this open
  const rows = document.querySelectorAll('.trade-row');
  
  if (tradeType === 'close') {
    // Find all open trades used for this close
    let size = parseFloat(trade.filledTotal.split('/')[0]);
    let closeIndex = trades.findIndex(t => t.transactionId === trade.transactionId);
    let openIds = [];
    let totalOpenSize = 0;
    
    for (let i = closeIndex + 1; i < trades.length; i++) {
      const potentialOpen = trades[i];
      if (
        potentialOpen.contracts === trade.contracts &&
        /open/i.test(potentialOpen.tradeType) &&
        /short/i.test(potentialOpen.tradeType) === /short/i.test(trade.tradeType)
      ) {
        const openSize = parseFloat(potentialOpen.filledTotal.split('/')[0]);
        openIds.push(potentialOpen.transactionId);
        totalOpenSize += openSize;
        if (totalOpenSize >= size) break;
      }
    }
    
    // Highlight this row and all openIds
    rows.forEach(r => {
      if (r.getAttribute('data-transaction-id') === transactionId || openIds.includes(r.getAttribute('data-transaction-id'))) {
        r.classList.add('trade-row-highlight');
      }
    });
  } else if (tradeType === 'open') {
    // Find all close trades that use this open
    let openIndex = trades.findIndex(t => t.transactionId === trade.transactionId);
    let openTrade = trades[openIndex];
    let openSize = parseFloat(openTrade.filledTotal.split('/')[0]);
    
    // Scan all close trades before this open
    for (let i = 0; i < openIndex; i++) {
      const closeTrade = trades[i];
      if (
        /close/i.test(closeTrade.tradeType) &&
        closeTrade.contracts === openTrade.contracts &&
        /short/i.test(closeTrade.tradeType) === /short/i.test(openTrade.tradeType)
      ) {
        // See if this open is part of the openIds for this close
        let size = parseFloat(closeTrade.filledTotal.split('/')[0]);
        let totalOpenSize = 0;
        let found = false;
        
        for (let j = i + 1; j < trades.length; j++) {
          const potentialOpen = trades[j];
          if (
            potentialOpen.contracts === closeTrade.contracts &&
            /open/i.test(potentialOpen.tradeType) &&
            /short/i.test(potentialOpen.tradeType) === /short/i.test(closeTrade.tradeType)
          ) {
            totalOpenSize += parseFloat(potentialOpen.filledTotal.split('/')[0]);
            if (potentialOpen.transactionId === openTrade.transactionId) found = true;
            if (totalOpenSize >= size) break;
          }
        }
        
        if (found) {
          // Highlight this open and the close
          rows.forEach(r => {
            if (r.getAttribute('data-transaction-id') === closeTrade.transactionId || r.getAttribute('data-transaction-id') === openTrade.transactionId) {
              r.classList.add('trade-row-highlight');
            }
          });
        }
      }
    }
  }
}

// Clear trade highlights
function clearTradeHighlights() {
  document.querySelectorAll('.trade-row-highlight').forEach(r => r.classList.remove('trade-row-highlight'));
}

// Export functions for use in other modules
window.editTrade = editTrade;
window.hideEditTrade = hideEditTrade;
window.saveEditTrade = saveEditTrade;
window.deleteTrade = deleteTrade;
window.clearAllTrades = clearAllTrades;
window.exportCSV = exportCSV;
// importCSVFile is exported from trading.js
window.showBulkPaste = showBulkPaste;
window.hideBulkPaste = hideBulkPaste;
window.submitBulkPaste = submitBulkPaste;
window.toggleAddTradeForm = toggleAddTradeForm;
window.highlightRelatedTrades = highlightRelatedTrades;
window.clearTradeHighlights = clearTradeHighlights; 
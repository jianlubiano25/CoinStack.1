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
  const headers = ['Contracts','Filled Type','Filled/Total','Filled Price/Order Price','Fee Rate','Trading Fee','Trade Type','Order Type','Transaction ID','Transaction Time','Risk Amount'];
  let csv = headers.join(',') + '\n';
  
  trades.forEach(trade => {
    let row = [
      trade.contracts,
      trade.filledType,
      trade.filledTotal,
      trade.filledPriceOrderPrice,
      trade.feeRate,
      trade.tradingFee,
      trade.tradeType,
      trade.orderType,
      trade.transactionId,
      trade.transactionTime,
      calculateRiskAmount(trade)
    ].map(v => '"' + (v ? v.replace(/"/g, '""') : '') + '"').join(',');
    csv += row + '\n';
  });
  
  // Generate filename with current date and time (without seconds)
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD format
  const timeStr = now.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit' 
  }).replace(':', '-'); // HH-MM format
  const defaultFilename = `trading_history_${dateStr}_${timeStr}.csv`;
  
  let filename = prompt('Save as:', defaultFilename);
  if (!filename) return;
  if (!filename.toLowerCase().endsWith('.csv')) filename += '.csv';
  
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

// Import trades from CSV
function importCSVFile(event) {
  const file = event.target.files[0];
  const errorSpan = document.getElementById('importError');
  if (errorSpan) errorSpan.style.display = 'none';
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    
    if (lines.length < 2) {
      if (errorSpan) {
        errorSpan.textContent = 'CSV file is empty or invalid.';
        errorSpan.style.display = 'inline';
      }
      return;
    }
    
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    if (headers.length !== 11) {
      if (errorSpan) {
        errorSpan.textContent = 'CSV must have 11 columns (including Risk Amount).';
        errorSpan.style.display = 'inline';
      }
      return;
    }
    
    const trades = getTrades();
    let added = 0;
    
    for (let i = 1; i < lines.length; i++) {
      let row = lines[i];
      // Handle quoted CSV
      let values = [];
      let inQuotes = false, value = '';
      
      for (let c = 0; c < row.length; c++) {
        let char = row[c];
        if (char === '"') {
          if (inQuotes && row[c+1] === '"') { value += '"'; c++; }
          else inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(value); value = '';
        } else {
          value += char;
        }
      }
      values.push(value);
      
      if (values.length !== 11) continue;
      
      const trade = {
        contracts: values[0],
        filledType: values[1],
        filledTotal: values[2],
        filledPriceOrderPrice: values[3],
        feeRate: values[4],
        tradingFee: values[5],
        tradeType: values[6],
        orderType: values[7],
        transactionId: values[8],
        transactionTime: values[9],
        riskAmount: values[10]
      };
      
      // Prevent duplicate transactionId
      if (!trades.some(t => t.transactionId === trade.transactionId)) {
        trades.push(trade);
        added++;
      }
    }
    
    saveTrades(trades);
    renderTrades();
    
    if (added === 0 && errorSpan) {
      errorSpan.textContent = 'No new trades imported (duplicates skipped).';
      errorSpan.style.display = 'inline';
    }
    
    event.target.value = '';
  };
  reader.readAsText(file);
}

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
    if (fields.length !== 10) { skipped++; continue; }
    
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
      transactionTime: fields[9]
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
  const form = document.getElementById('addTradeForm');
  const btn = document.getElementById('toggleAddTradeBtn');
  const btnText = document.getElementById('toggleBtnText');
  
  if (form.style.display === 'none' || form.style.display === '') {
    // Show form
    form.style.display = 'block';
    form.style.animation = 'slideDown 0.3s ease-out forwards';
    btnText.textContent = '➖ Hide Add Trade';
    btn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
  } else {
    // Hide form
    form.style.animation = 'slideUp 0.3s ease-out forwards';
    setTimeout(() => {
      form.style.display = 'none';
    }, 300);
    btnText.textContent = '➕ Add New Trade';
    btn.style.background = 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)';
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
window.importCSVFile = importCSVFile;
window.showBulkPaste = showBulkPaste;
window.hideBulkPaste = hideBulkPaste;
window.submitBulkPaste = submitBulkPaste;
window.toggleAddTradeForm = toggleAddTradeForm;
window.highlightRelatedTrades = highlightRelatedTrades;
window.clearTradeHighlights = clearTradeHighlights; 
// Trading History functionality for CoinStack Trading Dashboard
// Handles trade management, PnL calculations, and trade highlighting

// Default trades data
const defaultTrades = [
  {contracts:'SOLUSDT',filledType:'Trade',filledTotal:'0.5/0.5',filledPriceOrderPrice:'151.650/Market',feeRate:'0.055%',tradingFee:'0.04170375',tradeType:'Close Long',orderType:'Market',transactionId:'421745f5',transactionTime:'2025-07-03 23:05:42',riskAmount:'1.3700'},
  {contracts:'SOLUSDT',filledType:'Trade',filledTotal:'0.5/0.5',filledPriceOrderPrice:'154.390/154.390',feeRate:'0.02%',tradingFee:'0.01543900',tradeType:'Open Long',orderType:'Limit',transactionId:'d57124de',transactionTime:'2025-07-03 21:52:49',riskAmount:'-'},
  {contracts:'SOLUSDT',filledType:'Trade',filledTotal:'0.4/0.4',filledPriceOrderPrice:'153.470/Market',feeRate:'0.055%',tradingFee:'0.03376340',tradeType:'Close Short',orderType:'Market',transactionId:'26f7763a',transactionTime:'2025-07-03 21:31:35',riskAmount:'0.2720'},
  {contracts:'SOLUSDT',filledType:'Trade',filledTotal:'0.4/0.4',filledPriceOrderPrice:'152.790/152.790',feeRate:'0.02%',tradingFee:'0.01222320',tradeType:'Open Short',orderType:'Limit',transactionId:'23e5d61f',transactionTime:'2025-07-03 20:43:07',riskAmount:'-'},
  {contracts:'SOLUSDT',filledType:'Trade',filledTotal:'2.0/2.0',filledPriceOrderPrice:'154.810/Market',feeRate:'0.055%',tradingFee:'0.17029100',tradeType:'Close Short',orderType:'Market',transactionId:'21ad4965',transactionTime:'2025-07-03 20:30:01',riskAmount:'0.6200'},
  {contracts:'SOLUSDT',filledType:'Trade',filledTotal:'2.0/2.0',filledPriceOrderPrice:'154.500/154.500',feeRate:'0.055%',tradingFee:'0.16995000',tradeType:'Open Short',orderType:'Limit',transactionId:'5d654d18',transactionTime:'2025-07-03 20:07:52',riskAmount:'-'},
  {contracts:'SOLUSDT',filledType:'Trade',filledTotal:'5.0/5.0',filledPriceOrderPrice:'146.000/Market',feeRate:'0.055%',tradingFee:'0.40150000',tradeType:'Close Short',orderType:'Market',transactionId:'47faa02d',transactionTime:'2025-06-20 21:51:18',riskAmount:'10.7500'},
  {contracts:'SOLUSDT',filledType:'Trade',filledTotal:'5.0/5.0',filledPriceOrderPrice:'148.150/148.100',feeRate:'0.055%',tradingFee:'0.40741250',tradeType:'Open Short',orderType:'Limit',transactionId:'bcea1d95',transactionTime:'2025-06-20 20:15:55',riskAmount:'-'},
  {contracts:'SOLUSDT',filledType:'Trade',filledTotal:'1.0/1.0',filledPriceOrderPrice:'145.500/Market',feeRate:'0.055%',tradingFee:'0.08002500',tradeType:'Close Short',orderType:'Market',transactionId:'966a573e',transactionTime:'2025-06-20 04:28:17',riskAmount:'0.0600'},
  {contracts:'SOLUSDT',filledType:'Trade',filledTotal:'1.0/1.0',filledPriceOrderPrice:'145.440/145.370',feeRate:'0.055%',tradingFee:'0.07999200',tradeType:'Open Short',orderType:'Limit',transactionId:'a9552705',transactionTime:'2025-06-20 04:28:09',riskAmount:'-'}
];

// Get trades from localStorage
function getTrades() {
  const trades = localStorage.getItem('tradingHistory');
  if (trades) {
    const parsedTrades = JSON.parse(trades);
    // Sort by transaction time in descending order (latest first)
    return parsedTrades.sort((a, b) => {
      const timeA = new Date(a.transactionTime);
      const timeB = new Date(b.transactionTime);
      return timeB - timeA; // Descending order
    });
  }
  localStorage.setItem('tradingHistory', JSON.stringify(defaultTrades));
  return [...defaultTrades].sort((a, b) => {
    const timeA = new Date(a.transactionTime);
    const timeB = new Date(b.transactionTime);
    return timeB - timeA; // Descending order
  });
}

// Get today's trades count
function getTodayTradesCount() {
  const trades = getTrades();
  const today = new Date();
  const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
  
  return trades.filter(trade => {
    const tradeDate = new Date(trade.transactionTime);
    const tradeDateString = tradeDate.toISOString().split('T')[0];
    return tradeDateString === todayString;
  }).length;
}

// Save trades to localStorage
function saveTrades(trades) {
  localStorage.setItem('tradingHistory', JSON.stringify(trades));
}

// Calculate Profit/Loss for a trade
function calculatePnL(trade) {
  // Parse size (first value in filledTotal)
  let size = 0;
  if (trade.filledTotal) {
    size = parseFloat(trade.filledTotal.split('/')[0]);
  }
  // If tradeType contains 'Open', PnL is not applicable
  if (/open/i.test(trade.tradeType)) return '-';
  
  // Find all matching open trades for this contract and trade type
  const trades = getTrades();
  const closeIndex = trades.findIndex(t => t.transactionId === trade.transactionId);
  let openTrades = [];
  let totalOpenSize = 0;
  
  // Look for open trades after this close trade (since trades are sorted newest first)
  for (let i = closeIndex + 1; i < trades.length; i++) {
    const potentialOpen = trades[i];
    if (
      potentialOpen.contracts === trade.contracts &&
      /open/i.test(potentialOpen.tradeType) &&
      /short/i.test(potentialOpen.tradeType) === /short/i.test(trade.tradeType) // Match long/short direction
    ) {
      const openSize = parseFloat(potentialOpen.filledTotal.split('/')[0]);
      openTrades.push({
        trade: potentialOpen,
        size: openSize
      });
      totalOpenSize += openSize;
      
      // Stop when we have enough open trades to match the close size
      if (totalOpenSize >= size) {
        break;
      }
    }
  }
  
  // Check if we found enough open trades
  if (openTrades.length === 0 || totalOpenSize < size) {
    return '-';
  }
  
  // Calculate weighted average entry price
  let weightedEntryPrice = 0;
  let totalOpenFee = 0;
  let remainingSize = size;
  
  for (let openTradeInfo of openTrades) {
    const openTrade = openTradeInfo.trade;
    const openSize = openTradeInfo.size;
    const entryPrice = parseFloat(openTrade.filledPriceOrderPrice.split('/')[0]);
    const openFee = parseFloat(openTrade.tradingFee) || 0;
    
    // Use the smaller of remaining size or this open trade's size
    const sizeToUse = Math.min(remainingSize, openSize);
    const weight = sizeToUse / size;
    
    weightedEntryPrice += entryPrice * weight;
    totalOpenFee += openFee * weight;
    
    remainingSize -= sizeToUse;
    if (remainingSize <= 0) break;
  }
  
  // Exit price from close trade
  let exit = parseFloat(trade.filledPriceOrderPrice.split('/')[0]);
  let closeFee = parseFloat(trade.tradingFee) || 0;
  let totalFee = totalOpenFee + closeFee;
  
  if (isNaN(weightedEntryPrice) || isNaN(exit) || isNaN(size)) return '-';
  
  // Direction: Long or Short
  let isLong = /long/i.test(trade.tradeType);
  let isShort = /short/i.test(trade.tradeType);
  let pnl = 0;
  
  if (isLong) {
    pnl = (exit - weightedEntryPrice) * size - totalFee;
  } else if (isShort) {
    pnl = (weightedEntryPrice - exit) * size - totalFee;
  } else {
    return '-';
  }
  
  return pnl.toFixed(4);
}

// Calculate risk amount for close trades
function calculateRiskAmount(trade) {
  // Only for Close trades
  if (!/close/i.test(trade.tradeType)) return '-';
  
  // If risk amount is already provided in the trade data, use it
  if (trade.riskAmount && trade.riskAmount !== '-' && trade.riskAmount !== '') {
    return trade.riskAmount;
  }
  
  // Otherwise, compute it from the trade data
  // Find all matching open trades for this contract and trade type
  const trades = getTrades();
  const closeIndex = trades.findIndex(t => t.transactionId === trade.transactionId);
  let openTrades = [];
  let totalOpenSize = 0;
  let size = parseFloat(trade.filledTotal.split('/')[0]);
  
  // Look for open trades after this close trade (since trades are sorted newest first)
  for (let i = closeIndex + 1; i < trades.length; i++) {
    const potentialOpen = trades[i];
    if (
      potentialOpen.contracts === trade.contracts &&
      /open/i.test(potentialOpen.tradeType) &&
      /short/i.test(potentialOpen.tradeType) === /short/i.test(trade.tradeType) // Match long/short direction
    ) {
      const openSize = parseFloat(potentialOpen.filledTotal.split('/')[0]);
      openTrades.push({
        trade: potentialOpen,
        size: openSize
      });
      totalOpenSize += openSize;
      
      // Stop when we have enough open trades to match the close size
      if (totalOpenSize >= size) {
        break;
      }
    }
  }
  
  // Check if we found enough open trades
  if (openTrades.length === 0 || totalOpenSize < size) {
    return '-';
  }
  
  // Calculate weighted average entry price
  let weightedEntryPrice = 0;
  let remainingSize = size;
  
  for (let openTradeInfo of openTrades) {
    const openTrade = openTradeInfo.trade;
    const openSize = openTradeInfo.size;
    const entryPrice = parseFloat(openTrade.filledPriceOrderPrice.split('/')[0]);
    
    // Use the smaller of remaining size or this open trade's size
    const sizeToUse = Math.min(remainingSize, openSize);
    const weight = sizeToUse / size;
    
    weightedEntryPrice += entryPrice * weight;
    
    remainingSize -= sizeToUse;
    if (remainingSize <= 0) break;
  }
  
  // Exit price from close trade
  let exit = parseFloat(trade.filledPriceOrderPrice.split('/')[0]);
  
  if (isNaN(weightedEntryPrice) || isNaN(exit) || isNaN(size)) return '-';
  
  // Calculate risk amount (absolute difference between weighted entry and exit prices * size)
  let risk = Math.abs(weightedEntryPrice - exit) * size;
  return risk.toFixed(4);
}

// Render trades table
function renderTrades() {
  console.log('renderTrades called');
  const trades = getTrades();
  console.log('Trades to render:', trades);
  const tbody = document.querySelector('#tradingHistoryTable tbody');
  const mobileContainer = document.querySelector('.trading-table-mobile');
  
  console.log('Table body found:', tbody);
  console.log('Mobile container found:', mobileContainer);
  
  if (!tbody) {
    console.error('Table body not found!');
    return;
  }
  
  tbody.innerHTML = '';
  if (mobileContainer) mobileContainer.innerHTML = '';
  
  let totalPnL = 0;
  
  trades.forEach((trade, index) => {
    const tr = document.createElement('tr');
    tr.setAttribute('data-transaction-id', trade.transactionId);
    tr.setAttribute('data-trade-type', /open/i.test(trade.tradeType) ? 'open' : (/close/i.test(trade.tradeType) ? 'close' : 'other'));
    tr.classList.add('trade-row');
    const pnl = calculatePnL(trade);
    
    // Highlight open trades
    if (/open/i.test(trade.tradeType)) {
      tr.style.background = 'rgba(16, 185, 129, 0.10)'; // transparent green
    }
    
    const riskAmount = calculateRiskAmount(trade);
    tr.innerHTML = `
      <td style="text-align: center;">
        <button data-action="edit" data-index="${index}" style="background:none; color:#8b5cf6; border:none; padding:2px 6px; margin-right:4px; cursor:pointer; font-size:0.8em;" title="Edit">✏️</button>
        <button data-action="delete" data-index="${index}" style="background:none; color:#ef4444; border:none; padding:2px 6px; cursor:pointer; font-size:0.8em;" title="Delete">❌</button>
      </td>
      <td>${trade.contracts}</td>
      <td>${trade.filledType}</td>
      <td>${trade.filledTotal}</td>
      <td>${trade.filledPriceOrderPrice}</td>
      <td>${trade.feeRate}</td>
      <td>${trade.tradingFee}</td>
      <td class="trade-type-cell">${trade.tradeType}</td>
      <td>${trade.orderType}</td>
      <td>${trade.transactionId}</td>
      <td>${trade.transactionTime}</td>
      <td class="pnl-cell">${pnl}</td>
      <td>${riskAmount}</td>
    `;
    tbody.appendChild(tr);
    
    // Generate mobile card
    if (mobileContainer) {
      const card = document.createElement('div');
      card.className = `trade-card ${/open/i.test(trade.tradeType) ? 'open' : ''}`;
      card.setAttribute('data-transaction-id', trade.transactionId);
      card.setAttribute('data-trade-type', /open/i.test(trade.tradeType) ? 'open' : (/close/i.test(trade.tradeType) ? 'close' : 'other'));
      card.classList.add('trade-row');
      
      const tradeTypeClass = /open/i.test(trade.tradeType) ? 'open' : 'close';
      const pnlClass = !isNaN(parseFloat(pnl)) ? (parseFloat(pnl) > 0 ? 'positive' : parseFloat(pnl) < 0 ? 'negative' : 'neutral') : 'neutral';
      
      card.innerHTML = `
        <div class="trade-header">
          <div class="trade-contract">${trade.contracts}</div>
          <div class="trade-type ${tradeTypeClass}">${trade.tradeType}</div>
          <div class="trade-actions">
            <button data-action="edit" data-index="${index}" class="edit" title="Edit">✏️</button>
            <button data-action="delete" data-index="${index}" class="delete" title="Delete">❌</button>
          </div>
        </div>
        <div class="trade-details">
          <div class="trade-detail">
            <div class="trade-detail-label">Filled Type</div>
            <div class="trade-detail-value">${trade.filledType}</div>
          </div>
          <div class="trade-detail">
            <div class="trade-detail-label">Filled/Total</div>
            <div class="trade-detail-value">${trade.filledTotal}</div>
          </div>
          <div class="trade-detail">
            <div class="trade-detail-label">Price</div>
            <div class="trade-detail-value">${trade.filledPriceOrderPrice}</div>
          </div>
          <div class="trade-detail">
            <div class="trade-detail-label">Fee Rate</div>
            <div class="trade-detail-value">${trade.feeRate}</div>
          </div>
          <div class="trade-detail">
            <div class="trade-detail-label">Trading Fee</div>
            <div class="trade-detail-value">${trade.tradingFee}</div>
          </div>
          <div class="trade-detail">
            <div class="trade-detail-label">Order Type</div>
            <div class="trade-detail-value">${trade.orderType}</div>
          </div>
          <div class="trade-detail">
            <div class="trade-detail-label">Transaction ID</div>
            <div class="trade-detail-value">${trade.transactionId}</div>
          </div>
          <div class="trade-detail">
            <div class="trade-detail-label">Time</div>
            <div class="trade-detail-value">${trade.transactionTime}</div>
          </div>
          <div class="trade-detail">
            <div class="trade-detail-label">Risk Amount</div>
            <div class="trade-detail-value">${riskAmount}</div>
          </div>
        </div>
        <div class="trade-pnl">
          <div class="trade-pnl-label">Profit/Loss</div>
          <div class="trade-pnl-value ${pnlClass}">${pnl}</div>
        </div>
      `;
      mobileContainer.appendChild(card);
    }
    
    if (!isNaN(parseFloat(pnl))) totalPnL += parseFloat(pnl);
    
    // Set PnL cell color
    const pnlCell = tr.querySelector('.pnl-cell');
    if (!isNaN(parseFloat(pnl))) {
      if (parseFloat(pnl) > 0) pnlCell.style.color = '#10b981'; // green
      else if (parseFloat(pnl) < 0) pnlCell.style.color = '#ef4444'; // red
    }
    
    // Set Trade Type cell color
    const tradeTypeCell = tr.querySelector('.trade-type-cell');
    if (/open/i.test(trade.tradeType)) tradeTypeCell.style.color = '#10b981'; // green
    else if (/close/i.test(trade.tradeType)) tradeTypeCell.style.color = '#ef4444'; // red
  });
  
  // Add hover event listeners for row connection
  setTimeout(() => {
    const rows = document.querySelectorAll('.trade-row');
    rows.forEach(row => {
      row.addEventListener('mouseenter', function() {
        highlightRelatedTrades(this);
      });
      row.addEventListener('mouseleave', function() {
        clearTradeHighlights();
      });
    });
  }, 10);
  
  // Update total PnL counter
  updateTotalPnLCounter(totalPnL);
  
  // Update total trade count counter
  updateTotalTradeCounter();
  
  // Update today's trade count counter
  updateTodayTradeCounter();
}

// Update total PnL counter
function updateTotalPnLCounter(totalPnL) {
  const totalPnLValue = document.getElementById('totalPnLValue');
  const totalPnLCounter = document.getElementById('totalPnLCounter');
  
  if (totalPnLValue && totalPnLCounter) {
    totalPnLValue.textContent = totalPnL.toFixed(4);
    
    // Update counter color and glow effect based on PnL
    let color, glowColor, borderColor;
    if (totalPnL > 0) {
      color = '#10b981';
      glowColor = 'rgba(16,185,129,0.3)';
      borderColor = 'rgba(16,185,129,0.4)';
    } else if (totalPnL < 0) {
      color = '#ef4444';
      glowColor = 'rgba(239,68,68,0.3)';
      borderColor = 'rgba(239,68,68,0.4)';
    } else {
      color = '#ffffff';
      glowColor = 'rgba(139,92,246,0.2)';
      borderColor = 'rgba(139,92,246,0.2)';
    }
    
    totalPnLValue.style.color = color;
    totalPnLValue.style.textShadow = `0 0 10px ${glowColor}`;
    totalPnLCounter.style.borderColor = borderColor;
    
    // Add animation effect
    totalPnLCounter.style.transform = 'scale(1.02)';
    setTimeout(() => {
      totalPnLCounter.style.transform = 'scale(1)';
    }, 200);
  }
}

// Update today's trade count counter
function updateTodayTradeCounter() {
  const todayTradeValue = document.getElementById('todayTradeValue');
  const todayTradeCounter = document.getElementById('todayTradeCounter');
  
  if (todayTradeValue && todayTradeCounter) {
    const todayCount = getTodayTradesCount();
    todayTradeValue.textContent = todayCount;
    
    // Add animation effect
    todayTradeCounter.style.transform = 'scale(1.02)';
    setTimeout(() => {
      todayTradeCounter.style.transform = 'scale(1)';
    }, 200);
  }
}

// Update total trade count counter
function updateTotalTradeCounter() {
  const totalTradeValue = document.getElementById('totalTradeValue');
  const totalTradeCounter = document.getElementById('totalTradeCounter');
  
  if (totalTradeValue && totalTradeCounter) {
    const trades = getTrades();
    const totalCount = trades.length;
    totalTradeValue.textContent = totalCount;
    
    // Add animation effect
    totalTradeCounter.style.transform = 'scale(1.02)';
    setTimeout(() => {
      totalTradeCounter.style.transform = 'scale(1)';
    }, 200);
  }
}

// Add new trade
function addTrade(e) {
  console.log('addTrade function called');
  e.preventDefault();
  const input = document.getElementById('tradeInput');
  const errorDiv = document.getElementById('tradeFormError');
  
  console.log('Input found:', input);
  console.log('Error div found:', errorDiv);
  
  errorDiv.style.display = 'none';
  let value = input.value.trim();
  
  console.log('Input value:', value);
  
  // Split by tab or multiple spaces
  let fields = value.split(/\t|\s{2,}/);
  console.log('Parsed fields:', fields);
  console.log('Number of fields:', fields.length);
  
  if (fields.length < 10 || fields.length > 11) {
    errorDiv.textContent = 'Please enter 10-11 tab-separated values (Risk Amount is optional).';
    errorDiv.style.display = 'block';
    console.log('Validation failed - wrong number of fields');
    return;
  }
  
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
    riskAmount: fields[10] || '-' // Optional risk amount field
  };
  
  console.log('Created trade object:', trade);
  
  const trades = getTrades();
  console.log('Current trades:', trades);
  
  trades.push(trade);
  saveTrades(trades);
  renderTrades();
  input.value = '';
  
  console.log('Trade added successfully');
}





// Export functions for use in other modules
window.getTrades = getTrades;
window.saveTrades = saveTrades;
window.renderTrades = renderTrades;
window.addTrade = addTrade;
window.calculatePnL = calculatePnL;
window.calculateRiskAmount = calculateRiskAmount; 
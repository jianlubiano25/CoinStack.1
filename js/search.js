// Search functionality for CoinStack Trading Dashboard
// Handles content searching, highlighting, and navigation

// Search functionality
function searchContent() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const searchResults = document.getElementById('searchResults');
  
  if (searchTerm.length < 2) {
    searchResults.style.display = 'none';
    return;
  }
  
  const results = [];
  const collapsibles = document.querySelectorAll('.collapsible');
  
  collapsibles.forEach(collapsible => {
    const title = collapsible.textContent.toLowerCase();
    const content = collapsible.nextElementSibling.querySelector('.card').textContent.toLowerCase();
    const tabContent = collapsible.closest('.tab-content');
    const category = getCategoryName(tabContent.id);
    
    if (title.includes(searchTerm) || content.includes(searchTerm)) {
      const preview = collapsible.nextElementSibling.querySelector('.card').textContent.substring(0, 150) + '...';
      results.push({
        title: collapsible.textContent,
        category: category,
        preview: preview,
        tabId: tabContent.id,
        element: collapsible
      });
    }
  });
  
  displaySearchResults(results, searchTerm);
}

// Get category name from tab ID
function getCategoryName(tabId) {
  const categoryMap = {
    'structure': 'Market Structure',
    'gaps': 'Fair Value Gaps',
    'levels': 'EQH/EQL',
    'candles': 'Candlestick Patterns',
    'trend': 'Trend Indicators',
    'momentum': 'Momentum Indicators',
    'volatility': 'Volatility Indicators',
    'volume': 'Volume Indicators',
    'knowledge-base': 'Knowledge Base'
  };
  return categoryMap[tabId] || 'Unknown';
}

// Display search results
function displaySearchResults(results, searchTerm) {
  const searchResults = document.getElementById('searchResults');
  
  if (results.length === 0) {
    searchResults.innerHTML = '<div class="search-result-item"><div class="search-result-title">No results found</div><div class="search-result-preview">Try different keywords or check spelling</div></div>';
    searchResults.style.display = 'block';
    return;
  }
  
  let html = '';
  results.slice(0, 8).forEach(result => {
    const highlightedTitle = highlightText(result.title, searchTerm);
    const highlightedPreview = highlightText(result.preview, searchTerm);
    
    html += `
      <div class="search-result-item" onclick="navigateToResult('${result.tabId}', '${result.title}')">
        <div class="search-result-title">${highlightedTitle}</div>
        <div class="search-result-category">${result.category}</div>
        <div class="search-result-preview">${highlightedPreview}</div>
      </div>
    `;
  });
  
  if (results.length > 8) {
    html += `<div class="search-result-item"><div class="search-result-preview">... and ${results.length - 8} more results</div></div>`;
  }
  
  searchResults.innerHTML = html;
  searchResults.style.display = 'block';
}

// Highlight search terms in text
function highlightText(text, searchTerm) {
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
}

// Navigate to search result
function navigateToResult(tabId, title) {
  // Switch to the correct tab
  const tabButton = document.querySelector(`[data-tab="${tabId}"]`);
  if (tabButton) {
    openTab(tabId, tabButton);
  }
  
  // Find and expand the specific item
  setTimeout(() => {
    const collapsibles = document.querySelectorAll('.collapsible');
    collapsibles.forEach(collapsible => {
      if (collapsible.textContent === title) {
        // Close all others first
        const allContents = document.querySelectorAll('.content');
        const allCollapsibles = document.querySelectorAll('.collapsible');
        
        allContents.forEach(content => {
          content.style.display = 'none';
        });
        
        allCollapsibles.forEach(coll => {
          coll.classList.remove('active');
        });
        
        // Open the target item
        collapsible.classList.add('active');
        collapsible.nextElementSibling.style.display = 'block';
        
        // Scroll to the item
        collapsible.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }, 100);
  
  // Clear search
  document.getElementById('searchInput').value = '';
  document.getElementById('searchResults').style.display = 'none';
}

// Export functions for use in other modules
window.searchContent = searchContent;
window.navigateToResult = navigateToResult; 
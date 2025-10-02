const API_BASE = '/api';

// Toast notification
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.remove('hidden');
  
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

// Get short code from URL
function getShortCodeFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('code');
}

// Analytics Form
document.getElementById('analyticsForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const shortCode = document.getElementById('shortCodeInput').value;
  await loadAnalytics(shortCode);
});

// Load Analytics
async function loadAnalytics(shortCode) {
  const results = document.getElementById('analyticsResults');
  const errorSection = document.getElementById('errorSection');
  
  results.classList.add('hidden');
  errorSection.classList.add('hidden');
  
  try {
    const response = await fetch(`${API_BASE}/analytics/${shortCode}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to load analytics');
    }
    
    // Show results
    results.classList.remove('hidden');
    
    // URL Info
    document.getElementById('infoShortCode').textContent = data.url_info.short_code;
    document.getElementById('infoLongUrl').textContent = data.url_info.long_url;
    document.getElementById('infoLongUrl').href = data.url_info.long_url;
    document.getElementById('infoCreated').textContent = formatDate(data.url_info.created_at);
    
    if (data.url_info.expires_at) {
      document.getElementById('infoExpiresContainer').classList.remove('hidden');
      document.getElementById('infoExpires').textContent = formatDate(data.url_info.expires_at);
    } else {
      document.getElementById('infoExpiresContainer').classList.add('hidden');
    }
    
    // Stats
    document.getElementById('totalClicks').textContent = data.total_clicks;
    document.getElementById('uniqueVisitors').textContent = data.unique_visitors;
    
    const clickRate = data.unique_visitors > 0 
      ? ((data.total_clicks / data.unique_visitors - 1) * 100).toFixed(1)
      : 0;
    document.getElementById('clickRate').textContent = `${clickRate}%`;
    
    // Clicks by Day Chart
    renderClicksByDayChart(data.clicks_by_day);
    
    // Device Chart
    renderDeviceChart(data.devices);
    
    // Recent Clicks Table
    renderRecentClicksTable(data.recent_clicks);
    
  } catch (error) {
    errorSection.classList.remove('hidden');
    document.getElementById('errorMessage').textContent = error.message;
    showToast(error.message, 'error');
  }
}

// Render Clicks by Day Chart
function renderClicksByDayChart(clicksData) {
  const container = document.getElementById('clicksByDayChart');
  
  if (clicksData.length === 0) {
    container.innerHTML = '<p class="loading">No data available</p>';
    return;
  }
  
  const maxClicks = Math.max(...clicksData.map(d => d.clicks));
  
  container.innerHTML = `
    <div class="bar-chart">
      ${clicksData.map(item => {
        const height = maxClicks > 0 ? (item.clicks / maxClicks) * 100 : 0;
        const date = new Date(item.date);
        const label = `${date.getMonth() + 1}/${date.getDate()}`;
        
        return `
          <div class="bar-item">
            <div class="bar" style="height: ${height}%">
              <span class="bar-value">${item.clicks}</span>
            </div>
            <div class="bar-label">${label}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// Render Device Chart
function renderDeviceChart(devices) {
  const container = document.getElementById('deviceChart');
  
  if (devices.length === 0) {
    container.innerHTML = '<p class="loading">No data available</p>';
    return;
  }
  
  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'
  ];
  
  const total = devices.reduce((sum, d) => sum + d.count, 0);
  
  container.innerHTML = `
    <div class="pie-chart">
      ${devices.map((item, index) => {
        const percentage = ((item.count / total) * 100).toFixed(1);
        const color = colors[index % colors.length];
        
        return `
          <div class="pie-item">
            <div class="pie-color" style="background: ${color}"></div>
            <div class="pie-info">
              <div class="pie-label">${item.device}</div>
              <div class="pie-value">${item.count} clicks (${percentage}%)</div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// Render Recent Clicks Table
function renderRecentClicksTable(clicks) {
  const tbody = document.getElementById('recentClicksBody');
  
  if (clicks.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No recent clicks</td></tr>';
    return;
  }
  
  tbody.innerHTML = clicks.map(click => {
    const ua = click.userAgent || 'Unknown';
    const shortUA = ua.length > 50 ? ua.substring(0, 50) + '...' : ua;
    
    return `
      <tr>
        <td>${formatDate(click.clickTime)}</td>
        <td>${click.ipAddress || 'Unknown'}</td>
        <td title="${ua}">${shortUA}</td>
      </tr>
    `;
  }).join('');
}

// Initialize
const shortCodeFromURL = getShortCodeFromURL();
if (shortCodeFromURL) {
  document.getElementById('shortCodeInput').value = shortCodeFromURL;
  loadAnalytics(shortCodeFromURL);
}
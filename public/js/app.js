const API_BASE = '/api';
let currentPage = 1;

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

// Shorten URL Form
document.getElementById('shortenForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const longUrl = document.getElementById('longUrl').value;
  const customAlias = document.getElementById('customAlias').value;
  const expiresIn = document.getElementById('expiresIn').value;
  
  const data = { long_url: longUrl };
  if (customAlias) data.custom_alias = customAlias;
  if (expiresIn) data.expires_in_days = parseInt(expiresIn);
  
  try {
    const response = await fetch(`${API_BASE}/shorten`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();

    // Handle failure case
    if (!result.success) {
      if (result.error === "ALIAS_EXISTS") {
        alert("This alias already exists. Please try something different.");
      } else {
        showToast(result.message || 'Failed to shorten URL', 'error');
      }
      return;
    }

    // Handle success
    document.getElementById('resultSection').classList.remove('hidden');
    document.getElementById('shortUrlDisplay').value = result.short_url;
    document.getElementById('originalUrl').textContent = result.long_url;
    document.getElementById('shortCode').textContent = result.short_code;
    document.getElementById('createdAt').textContent = formatDate(result.created_at);
    
    if (result.expires_at) {
      document.getElementById('expiresInfo').classList.remove('hidden');
      document.getElementById('expiresAt').textContent = formatDate(result.expires_at);
    } else {
      document.getElementById('expiresInfo').classList.add('hidden');
    }
    
    // Set analytics link
    document.getElementById('viewAnalytics').href = `/analytics.html?code=${result.short_code}`;
    
    // Reset form
    e.target.reset();
    
    // Refresh URL list
    loadUrls();
    
    showToast('URL shortened successfully!', 'success');
    
    // Scroll to result
    document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth' });
    
  } catch (error) {
    showToast(error.message, 'error');
  }
});

// Copy to clipboard
document.getElementById('copyBtn').addEventListener('click', () => {
  const input = document.getElementById('shortUrlDisplay');
  input.select();
  input.setSelectionRange(0, 99999); // For mobile devices
  
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(input.value).then(() => {
      showToast('Copied to clipboard!', 'success');
    }).catch(() => {
      document.execCommand('copy');
      showToast('Copied to clipboard!', 'success');
    });
  } else {
    document.execCommand('copy');
    showToast('Copied to clipboard!', 'success');
  }
});

// Load URLs
async function loadUrls(page = 1) {
  currentPage = page;
  const urlList = document.getElementById('urlList');
  urlList.innerHTML = '<p class="loading">Loading...</p>';
  
  try {
    const response = await fetch(`${API_BASE}/urls?page=${page}&limit=5`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to load URLs');
    }
    
    if (result.data.length === 0) {
      urlList.innerHTML = '<p class="loading">No URLs found. Create your first short URL above!</p>';
      return;
    }
    
    urlList.innerHTML = result.data.map(url => {
      const longUrlPreview = url.longUrl.length > 60 
        ? url.longUrl.substring(0, 60) + '...' 
        : url.longUrl;
      
      return `
        <div class="url-item">
          <div class="url-info">
            <strong>/${url.shortCode}</strong>
            <small>${longUrlPreview}</small>
            <small>👁️ ${url.clickCount} clicks | 📅 ${formatDate(url.createdAt)}</small>
          </div>
          <div class="url-actions">
            <a href="/analytics.html?code=${url.shortCode}" class="btn btn-small btn-link">📊 Analytics</a>
            <button class="btn btn-small delete-btn" onclick="deleteUrl('${url.shortCode}')">Delete</button>
          </div>
        </div>
      `;
    }).join('');
    
    // Show pagination
    const pagination = document.getElementById('pagination');
    if (result.pagination.pages > 1) {
      pagination.classList.remove('hidden');
      pagination.innerHTML = `
        <button ${page === 1 ? 'disabled' : ''} onclick="loadUrls(${page - 1})">Previous</button>
        <span>Page ${page} of ${result.pagination.pages}</span>
        <button ${page === result.pagination.pages ? 'disabled' : ''} onclick="loadUrls(${page + 1})">Next</button>
      `;
    } else {
      pagination.classList.add('hidden');
    }
    
  } catch (error) {
    urlList.innerHTML = '<p class="loading">Failed to load URLs. Please refresh the page.</p>';
    showToast(error.message, 'error');
  }
}

// Delete URL
async function deleteUrl(shortCode) {
  if (!confirm('Are you sure you want to delete this URL? This action cannot be undone.')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/url/${shortCode}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to delete URL');
    }
    
    showToast('URL deleted successfully', 'success');
    loadUrls(currentPage);
    
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// Refresh button
document.getElementById('refreshBtn').addEventListener('click', () => {
  loadUrls(currentPage);
  showToast('Refreshed!', 'success');
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadUrls();
});

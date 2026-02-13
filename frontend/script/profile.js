// ========================================
// BUNKIT - Profile Page Module
// Handles user profile and product management
// ========================================

// Configuration
const API_BASE_URL = 'http://127.0.0.1:5000'; // Update with your backend URL

// State
let userProducts = [];
let productToDelete = null;

// ========================================
// Utility Functions
// ========================================

// Get token from localStorage
const getToken = () => localStorage.getItem('bunkit_token');

// Remove token
const removeToken = () => localStorage.removeItem('bunkit_token');

// Format price
const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

// Truncate text
const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// ========================================
// API Functions
// ========================================

// Fetch user profile
const fetchUserProfile = async () => {
  const token = getToken();
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        window.location.href = 'login.html';
        return;
      }
      throw new Error('Failed to fetch user profile');
    }

    const data = await response.json();
    displayUserProfile(data);

  } catch (error) {
    console.error('Error fetching user profile:', error);
    alert('Failed to load profile. Please try again.');
  }
};

// Fetch user's products
const fetchUserProducts = async () => {
  const token = getToken();
  if (!token) return;

  const adsLoading = document.getElementById('adsLoading');
  adsLoading.classList.remove('hidden');

  try {
    const response = await fetch(`${API_BASE_URL}/api/products/my`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await response.json();
    userProducts = data || [];
    
    adsLoading.classList.add('hidden');
    displayUserProducts();

  } catch (error) {
    console.error('Error fetching user products:', error);
    adsLoading.classList.add('hidden');
    document.getElementById('emptyAds').classList.remove('hidden');
  }
};

// Delete product
const deleteProduct = async (productId) => {
  const token = getToken();
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete product');
    }

    userProducts = userProducts.filter(p => p._id !== productId);
    
    displayUserProducts();
    closeDeleteModal();

  } catch (error) {
    console.error('Error deleting product:', error);
    alert('Failed to delete product. Please try again.');
  }
};

// ========================================
// UI Display Functions
// ========================================

// Display user profile
const displayUserProfile = (user) => {
  document.getElementById('userName').textContent = user.name || 'User';
  document.getElementById('userEmail').textContent = user.email || '';
  
  const whatsappElement = document.getElementById('userWhatsapp');
  if (whatsappElement && user.whatsapp) {
    whatsappElement.innerHTML = `
      <span>📱</span>
      <span>${user.whatsapp}</span>
    `;
  }
};

// Display user products
const displayUserProducts = () => {
  const container = document.getElementById('userProductsContainer');
  const emptyState = document.getElementById('emptyAds');
  const totalAds = document.getElementById('totalAds');

  container.innerHTML = '';
  totalAds.textContent = userProducts.length;

  if (userProducts.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  userProducts.forEach(product => {
    const card = createUserProductCard(product);
    container.appendChild(card);
  });
};

// Create user product card
const createUserProductCard = (product) => {
  const card = document.createElement('div');
  card.className = 'user-product-card';
  
  card.innerHTML = `
    <img 
      src="${product.imageUrl || 'https://via.placeholder.com/100'}" 
      alt="${product.title}"
      class="user-product-image"
      onerror="this.src='https://via.placeholder.com/100'"
    >
    <div class="user-product-info">
      <h3 class="user-product-title">${truncateText(product.title, 40)}</h3>
      <span class="user-product-category">${product.category}</span>
      <p class="user-product-description">${truncateText(product.description, 80)}</p>
      <div class="user-product-footer">
        <div class="user-product-price">${formatPrice(product.price)}</div>
        <button 
          class="delete-product-btn" 
          onclick="openDeleteModal('${product._id || product.id}')"
        >
          <span>🗑️</span>
          <span>Delete</span>
        </button>
      </div>
    </div>
  `;
  
  return card;
};

// ========================================
// Delete Modal Functions
// ========================================

const openDeleteModal = (productId) => {
  productToDelete = productId;
  document.getElementById('deleteModal').classList.remove('hidden');
};

const closeDeleteModal = () => {
  productToDelete = null;
  document.getElementById('deleteModal').classList.add('hidden');
};

const confirmDelete = () => {
  if (productToDelete) {
    deleteProduct(productToDelete);
  }
};

window.openDeleteModal = openDeleteModal;

// ========================================
// Logout Handler
// ========================================

const handleLogout = () => {
  if (confirm('Are you sure you want to logout?')) {
    removeToken();
    window.location.href = 'login.html';
  }
};

// ========================================
// Page Initialization
// ========================================

const initProfilePage = () => {
  const token = getToken();
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  fetchUserProfile();
  fetchUserProducts();

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', closeDeleteModal);
  }

  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', confirmDelete);
  }

  const deleteModal = document.getElementById('deleteModal');
  if (deleteModal) {
    deleteModal.addEventListener('click', (e) => {
      if (e.target === deleteModal) {
        closeDeleteModal();
      }
    });
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProfilePage);
} else {
  initProfilePage();
}

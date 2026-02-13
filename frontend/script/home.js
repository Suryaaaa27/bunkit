// ========================================
// BUNKIT - Home Page Module
// Handles product feed and categories
// ========================================

// Configuration
const API_BASE_URL = 'http://127.0.0.1:5000'; // Update with your backend URL

// State
let allProducts = [];
let selectedCategory = 'all';

// ========================================
// Utility Functions
// ========================================

// Get token from localStorage
const getToken = () => localStorage.getItem('bunkit_token');

// Format price
const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

// Get category emoji
const getCategoryEmoji = (category) => {
  const emojiMap = {
    'handmade gifts': '🎨',
    notes: '📚',
    services: '👨‍🏫',
    food: '⚡',
    books: '📖',
    electronics: '💻',
    other: '✨',
  };
  return emojiMap[category] || '✨';
};

// Truncate text
const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// ========================================
// UI Rendering Functions
// ========================================

// Show loading state
const showLoading = () => {
  document.getElementById('loadingState').classList.remove('hidden');
  document.getElementById('productsGrid').classList.add('hidden');
  document.getElementById('emptyState').classList.add('hidden');
};

// Hide loading state
const hideLoading = () => {
  const loading = document.getElementById('loadingState');
  if (loading) loading.classList.add('hidden');
};


// Show empty state
const showEmptyState = () => {
  document.getElementById('emptyState').classList.remove('hidden');
  document.getElementById('productsGrid').classList.add('hidden');
};

// Render product card
const renderProductCard = (product) => {
  const card = document.createElement('div');
  card.className = 'product-card';

  card.innerHTML = `
    <div class="product-image-container">
      <img 
        src="${product.imageUrl || 'https://via.placeholder.com/400'}"
        alt="${product.title}"
        class="product-image"
        onerror="this.src='https://via.placeholder.com/400'"
      >
    </div>

    <div class="product-content">
      <div class="product-header">
        <h3 class="product-title">${truncateText(product.title, 40)}</h3>
        <span class="product-category">${product.category}</span>
      </div>

      <p class="product-description">
        ${truncateText(product.description, 70)}
      </p>

      <div class="product-footer">
        <div class="product-price">
          ${formatPrice(product.price)}
        </div>

        <button 
          class="whatsapp-btn"
          onclick="contactSeller('${product.seller?.whatsapp || ''}')"
        >
          💬 Contact
        </button>
      </div>
    </div>
  `;

  return card;
};


// Render products
const renderProducts = (products) => {
  const productsGrid = document.getElementById('productsGrid');
  productsGrid.innerHTML = '';

  if (products.length === 0) {
    showEmptyState();
    return;
  }

  productsGrid.classList.remove('hidden');
  products.forEach(product => {
    const card = renderProductCard(product);
    productsGrid.appendChild(card);
  });
};

// ========================================
// API Functions
// ========================================

// Fetch all products
const fetchProducts = async () => {
  showLoading();

  try {
    const response = await fetch(`${API_BASE_URL}/api/products`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await response.json();
    allProducts = data || [];
    
    hideLoading();
    filterAndRenderProducts();

  } catch (error) {
    console.error('Error fetching products:', error);
    hideLoading();
    showEmptyState();
  }
};

// ========================================
// Category Filter
// ========================================

// Filter products by category
const filterAndRenderProducts = () => {
  let filteredProducts = allProducts;

  if (selectedCategory !== 'all') {
    filteredProducts = allProducts.filter(
      product => product.category === selectedCategory
    );
  }

  renderProducts(filteredProducts);
};

// Handle category click
const handleCategoryClick = (category) => {
  selectedCategory = category;

  document.querySelectorAll('.category-item').forEach(item => {
    if (item.dataset.category === category) {
      item.style.opacity = '1';
      item.querySelector('.category-icon').style.transform = 'scale(1.1)';
    } else {
      item.style.opacity = '0.6';
      item.querySelector('.category-icon').style.transform = 'scale(1)';
    }
  });

  filterAndRenderProducts();
};

// ========================================
// Contact Seller
// ========================================

const contactSeller = (whatsapp) => {
  console.log("Seller whatsapp:", whatsapp);

  if (!whatsapp) {
    alert("Seller contact not available");
    return;
  }

  const cleanNumber = whatsapp.toString().replace(/\D/g, "");

  const message = encodeURIComponent(
    "Hi! I saw your product on BUNKIT and I'm interested."
  );

  window.open(`https://wa.me/${cleanNumber}?text=${message}`, "_blank");
};


window.contactSeller = contactSeller;

// ========================================
// Page Initialization
// ========================================

const initHomePage = () => {
  fetchProducts();

  const categoryItems = document.querySelectorAll('.category-item');
  categoryItems.forEach(item => {
    item.addEventListener('click', () => {
      const category = item.dataset.category;
      handleCategoryClick(category);
    });
  });

  handleCategoryClick('all');
};

// ========================================
// Initialize on DOM Load
// ========================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHomePage);
} else {
  initHomePage();
}

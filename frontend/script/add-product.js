// ========================================
// BUNKIT - Add Product Module
// Handles product creation and image upload
// ========================================

// Configuration
const API_BASE_URL = 'http://127.0.0.1:5000'; // Update with your backend URL

// State
let selectedImage = null;

// ========================================
// Utility Functions
// ========================================

// Get token from localStorage
const getToken = () => localStorage.getItem('bunkit_token');

// Show error message
const showError = (message) => {
  const errorAlert = document.getElementById('errorAlert');
  if (errorAlert) {
    errorAlert.textContent = message;
    errorAlert.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// Hide error message
const hideError = () => {
  const errorAlert = document.getElementById('errorAlert');
  if (errorAlert) {
    errorAlert.classList.add('hidden');
  }
};

// ========================================
// Image Upload Handler
// ========================================

const handleImageSelect = (e) => {
  const file = e.target.files[0];
  
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith('image/')) {
    showError('Please select a valid image file');
    return;
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    showError('Image size should be less than 5MB');
    return;
  }

  selectedImage = file;

  // Show preview
  const reader = new FileReader();
  reader.onload = (e) => {
    const preview = document.getElementById('imagePreview');
    const placeholder = document.getElementById('uploadPlaceholder');
    const uploadArea = document.getElementById('imageUploadArea');
    const removeBtn = document.getElementById('removeImageBtn');

    preview.src = e.target.result;
    preview.classList.add('show');
    placeholder.style.display = 'none';
    uploadArea.classList.add('has-image');
    removeBtn.classList.add('show');
  };
  reader.readAsDataURL(file);

  hideError();
};

const handleRemoveImage = (e) => {
  e.preventDefault();
  e.stopPropagation();

  selectedImage = null;

  const preview = document.getElementById('imagePreview');
  const placeholder = document.getElementById('uploadPlaceholder');
  const uploadArea = document.getElementById('imageUploadArea');
  const removeBtn = document.getElementById('removeImageBtn');
  const imageInput = document.getElementById('imageInput');

  preview.classList.remove('show');
  preview.src = '';
  placeholder.style.display = 'block';
  uploadArea.classList.remove('has-image');
  removeBtn.classList.remove('show');
  imageInput.value = '';
};

// ========================================
// Character Counter
// ========================================

const updateCharCounter = (inputId, counterId, maxLength) => {
  const input = document.getElementById(inputId);
  const counter = document.getElementById(counterId);
  
  if (!input || !counter) return;

  input.addEventListener('input', () => {
    const currentLength = input.value.length;
    counter.textContent = currentLength;

    counter.parentElement.classList.remove('near-limit', 'at-limit');
    if (currentLength >= maxLength) {
      counter.parentElement.classList.add('at-limit');
    } else if (currentLength >= maxLength * 0.9) {
      counter.parentElement.classList.add('near-limit');
    }
  });
};

// ========================================
// Form Submission
// ========================================

const handleProductSubmit = async (e) => {
  e.preventDefault();
  hideError();

  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const category = document.getElementById('category').value;
  const price = document.getElementById('price').value;

  if (!title || !description || !category || !price) {
    showError('Please fill in all required fields');
    return;
  }

  if (!selectedImage) {
    showError('Please select a product image');
    return;
  }

  if (price <= 0) {
    showError('Price must be greater than 0');
    return;
  }

  const token = getToken();
  if (!token) {
    showError('Please login to add products');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);
    return;
  }

  const submitBtn = document.getElementById('submitBtn');
  const form = document.getElementById('productForm');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="loading"></span>';
  form.classList.add('form-loading');

  try {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('image', selectedImage);

    // ✅ FIXED ROUTE HERE
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create product');
    }

    showSuccessAnimation();

    setTimeout(() => {
      window.location.href = 'home.html';
    }, 2000);

  } catch (error) {
    console.error('Error creating product:', error);
    showError(error.message || 'Failed to create product. Please try again.');
    
    submitBtn.disabled = false;
    submitBtn.innerHTML = `
      <span class="submit-btn-text">
        <span>✨</span>
        <span>List Product</span>
      </span>
    `;
    form.classList.remove('form-loading');
  }
};

// ========================================
// Success Animation
// ========================================

const showSuccessAnimation = () => {
  const successOverlay = document.getElementById('successOverlay');
  successOverlay.classList.add('show');
};

// ========================================
// Page Initialization
// ========================================

const initAddProductPage = () => {
  const token = getToken();
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  const productForm = document.getElementById('productForm');
  if (productForm) {
    productForm.addEventListener('submit', handleProductSubmit);
  }

  const imageInput = document.getElementById('imageInput');
  if (imageInput) {
    imageInput.addEventListener('change', handleImageSelect);
  }

  const removeImageBtn = document.getElementById('removeImageBtn');
  if (removeImageBtn) {
    removeImageBtn.addEventListener('click', handleRemoveImage);
  }

  updateCharCounter('title', 'titleCounter', 100);
  updateCharCounter('description', 'descCounter', 500);

  document.querySelectorAll('input[type="text"], input[type="number"]').forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
    });
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAddProductPage);
} else {
  initAddProductPage();
}

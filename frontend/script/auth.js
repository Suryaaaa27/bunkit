// ========================================
// BUNKIT - Authentication Module
// Handles login, signup, and token management
// ========================================

// Configuration
const API_BASE_URL = 'http://127.0.0.1:5000/api'; // ✅ FIXED: Added /api

// ========================================
// Utility Functions
// ========================================

// Get token from localStorage
const getToken = () => localStorage.getItem('bunkit_token');

// Set token in localStorage
const setToken = (token) => localStorage.setItem('bunkit_token', token);

// Remove token from localStorage
const removeToken = () => localStorage.removeItem('bunkit_token');

// Check if user is authenticated
const isAuthenticated = () => !!getToken();

// Show error message
const showError = (message) => {
  const errorAlert = document.getElementById('errorAlert');
  if (errorAlert) {
    errorAlert.textContent = message;
    errorAlert.classList.remove('hidden');
    errorAlert.classList.add('auth-error');
  }
};

// Hide error message
const hideError = () => {
  const errorAlert = document.getElementById('errorAlert');
  if (errorAlert) {
    errorAlert.classList.add('hidden');
    errorAlert.classList.remove('auth-error');
  }
};

// Show loading state on button
const setButtonLoading = (button, isLoading) => {
  if (isLoading) {
    button.disabled = true;
    const originalText = button.querySelector('span').textContent;
    button.dataset.originalText = originalText;
    button.innerHTML = '<span class="loading"></span>';
  } else {
    button.disabled = false;
    const originalText = button.dataset.originalText || 'Submit';
    button.innerHTML = `<span>${originalText}</span>`;
  }
};

// ========================================
// Password Strength Checker
// ========================================
const checkPasswordStrength = (password) => {
  const strengthBar = document.getElementById('passwordStrengthBar');
  const strengthText = document.getElementById('passwordStrengthText');
  
  if (!strengthBar || !strengthText) return;

  let strength = 'weak';
  let strengthClass = 'weak';

  if (password.length === 0) {
    strengthBar.style.width = '0';
    strengthText.textContent = '';
    return;
  }

  if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
    strength = 'strong';
    strengthClass = 'strong';
  } else if (password.length >= 6) {
    strength = 'medium';
    strengthClass = 'medium';
  }

  strengthBar.className = `password-strength-bar ${strengthClass}`;
  strengthText.className = `password-strength-text ${strengthClass}`;
  strengthText.textContent = strength.charAt(0).toUpperCase() + strength.slice(1);
};

// ========================================
// Login Handler
// ========================================
const handleLogin = async (e) => {
  e.preventDefault();
  hideError();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const loginBtn = document.getElementById('loginBtn');

  if (!email || !password) {
    showError('Please fill in all fields');
    return;
  }

  setButtonLoading(loginBtn, true);

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {  // ✅ Correct
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    if (data.token) {
      setToken(data.token);
      window.location.href = 'home.html';
    } else {
      throw new Error('No token received');
    }

  } catch (error) {
    console.error('Login error:', error);
    showError(error.message || 'Login failed. Please try again.');
    setButtonLoading(loginBtn, false);
  }
};

// ========================================
// Signup Handler
// ========================================
const handleSignup = async (e) => {
  e.preventDefault();
  hideError();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const whatsapp = document.getElementById('whatsapp').value.trim();
  const password = document.getElementById('password').value;
  const signupBtn = document.getElementById('signupBtn');

  if (!name || !email || !whatsapp || !password) {
    showError('Please fill in all fields');
    return;
  }

  if (password.length < 6) {
    showError('Password must be at least 6 characters long');
    return;
  }

  setButtonLoading(signupBtn, true);

  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {  // ✅ Correct
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, whatsapp, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Signup failed');
    }

    if (data.token) {
      setToken(data.token);
      window.location.href = 'home.html';
    } else {
      window.location.href = 'login.html';
    }

  } catch (error) {
    console.error('Signup error:', error);
    showError(error.message || 'Signup failed. Please try again.');
    setButtonLoading(signupBtn, false);
  }
};

// ========================================
// Logout Handler
// ========================================
const handleLogout = () => {
  removeToken();
  window.location.href = 'login.html';
};

// ========================================
// Page Initialization
// ========================================
const initAuthPage = () => {
  const currentPage = window.location.pathname.split('/').pop();

  if (isAuthenticated() && (currentPage === 'login.html' || currentPage === 'signup.html')) {
    window.location.href = 'home.html';
    return;
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);

    const passwordInput = document.getElementById('password');
    if (passwordInput) {
      passwordInput.addEventListener('input', (e) => {
        checkPasswordStrength(e.target.value);
      });
    }
  }
};

// ========================================
// Initialize on DOM Load
// ========================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuthPage);
} else {
  initAuthPage();
}

// ========================================
// Export functions
// ========================================
window.BunkitAuth = {
  getToken,
  setToken,
  removeToken,
  isAuthenticated,
  handleLogout,
};

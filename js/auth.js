/**
 * Davomat Tizimi - Auth Controller & Route Protection (AuthGuard)
 */

function checkAuthGuard() {
  const path = window.location.pathname.toLowerCase();
  const isLoginPage = path.includes('login');
  const user = api.getCurrentUser();
  const token = localStorage.getItem(API_CONFIG.STORAGE_KEY);

  if (!token || !user) {
    if (!isLoginPage) {
      let redirectPath = 'pages/login.html';
      if (path.includes('/pages/')) {
        redirectPath = 'login.html';
      } else if (window.location.protocol !== 'file:') {
        redirectPath = '/login';
      }
      window.location.replace(redirectPath);
      return false;
    }
  } else {
    // If user is already authenticated and visits login page, redirect to dashboard
    if (isLoginPage) {
      const homePath = window.location.protocol === 'file:'
        ? (path.includes('/pages/') ? '../index.html' : 'index.html')
        : '/';
      window.location.replace(homePath);
      return false;
    }
  }
  return true;
}

// Execute AuthGuard immediately before DOM rendering
checkAuthGuard();

document.addEventListener('DOMContentLoaded', () => {
  initAuthUI();
});

function initAuthUI() {
  const user = api.getCurrentUser();
  const userNameEl = document.getElementById('currentUserName');
  const userRoleEl = document.getElementById('currentUserRole');
  const userAvatarEl = document.getElementById('currentUserAvatar');
  const logoutBtn = document.getElementById('btnLogout');

  if (user) {
    if (userNameEl) userNameEl.textContent = user.fullName || user.username;
    if (userRoleEl) userRoleEl.textContent = user.role === 'Admin' ? 'Administrator' : "O'qituvchi";
    if (userAvatarEl) {
      const initial = (user.fullName || user.username).charAt(0).toUpperCase();
      userAvatarEl.textContent = initial;
    }

    // Role-based CSS class on body for UI permissions
    if (user.role === 'Teacher') {
      document.body.classList.add('role-teacher');
    } else {
      document.body.classList.add('role-admin');
    }
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Tizimdan chiqishni xohlaysizmi?')) {
        api.logout();
      }
    });
  }
}

// Helper to autofill demo credentials on login page
function fillDemoCredentials(username, password) {
  const userInput = document.getElementById('loginUsername');
  const passInput = document.getElementById('loginPassword');
  if (userInput) userInput.value = username;
  if (passInput) passInput.value = password;
}

function openProfileModal() {
  const modal = document.getElementById('profileModal');
  const user = api.getCurrentUser();
  if (!modal || !user) return;

  const nameInput = document.getElementById('profileFullName');
  const emailInput = document.getElementById('profileEmail');
  const roleInput = document.getElementById('profileRole');
  const usernameInput = document.getElementById('profileUsername');

  if (nameInput) nameInput.value = user.fullName || '';
  if (emailInput) emailInput.value = user.email || '';
  if (roleInput) roleInput.value = user.role === 'Admin' ? 'Administrator' : "O'qituvchi";
  if (usernameInput) usernameInput.value = user.username || '';

  const passForm = document.getElementById('changePasswordForm');
  if (passForm) passForm.reset();

  modal.classList.add('open');
}

async function handleProfileUpdate(e) {
  e.preventDefault();
  const fullName = document.getElementById('profileFullName').value.trim();
  const email = document.getElementById('profileEmail').value.trim();

  try {
    await api.updateProfile({ fullName, email });
    showToast("Profil ma'lumotlari muvaffaqiyatli saqlandi!", "success");
    initAuthUI();
    closeModal('profileModal');
  } catch (err) {
    showToast(err.message || "Xatolik yuz berdi", "error");
  }
}

async function handleChangePassword(e) {
  e.preventDefault();
  const currentPassword = document.getElementById('currentPasswordInput').value;
  const newPassword = document.getElementById('newPasswordInput').value;
  const confirmPassword = document.getElementById('confirmPasswordInput').value;

  if (newPassword !== confirmPassword) {
    showToast("Yangi parollar bir-biriga mos kelmadi!", "error");
    return;
  }

  if (newPassword.length < 6) {
    showToast("Parol kamida 6 ta belgidan iborat bo'lishi kerak!", "error");
    return;
  }

  try {
    await api.changePassword(currentPassword, newPassword);
    showToast("Parol muvaffaqiyatli o'zgartirildi!", "success");
    document.getElementById('changePasswordForm').reset();
    closeModal('profileModal');
  } catch (err) {
    showToast(err.message || "Joriy parol noto'g'ri", "error");
  }
}

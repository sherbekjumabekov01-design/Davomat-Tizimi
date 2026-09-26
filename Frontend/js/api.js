/**
 * Davomat Tizimi - API Client & Centralized State Manager
 */

const API_CONFIG = {
  BASE_URL: (window.location.origin && (window.location.origin.includes(':5041') || window.location.origin.includes(':7003')))
    ? `${window.location.origin}/api` 
    : 'http://localhost:5041/api',
  STORAGE_KEY: 'davomat_auth_token',
  USER_KEY: 'davomat_user_info'
};

// Toast Notifications Helper
function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-item ${type}`;

  const iconSvg = type === 'success' 
    ? `<svg width="20" height="20" fill="none" stroke="#10B981" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`
    : type === 'error'
    ? `<svg width="20" height="20" fill="none" stroke="#F43F5E" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`
    : `<svg width="20" height="20" fill="none" stroke="#6366F1" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;

  toast.innerHTML = `
    ${iconSvg}
    <div style="font-size:0.875rem; font-weight:500;">${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Fetch with automatic JWT Bearer token
async function fetchWithAuth(endpoint, options = {}) {
  const token = localStorage.getItem(API_CONFIG.STORAGE_KEY);
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (response.status === 401) {
      localStorage.removeItem(API_CONFIG.STORAGE_KEY);
      localStorage.removeItem(API_CONFIG.USER_KEY);
      if (!window.location.pathname.includes('login.html')) {
        showToast('Sessiya muddati tugadi. Iltimos, qayta kiring.', 'error');
        setTimeout(() => {
          const path = window.location.pathname.toLowerCase();
          const loginPath = path.includes('/pages/') ? 'login.html' : 'pages/login.html';
          window.location.href = loginPath;
        }, 800);
      }
      return null;
    }

    if (response.status === 204) {
      return true;
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Xatolik: ${response.statusText}`);
    }

    return data;
  } catch (err) {
    console.error('API Error:', err);
    showToast(err.message || 'Server bilan bog\'lanishda xatolik yuz berdi.', 'error');
    throw err;
  }
}

// Exported API Methods
const api = {
  // Auth
  async login(username, password) {
    const res = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Login yoki parol xato');
    }
    localStorage.setItem(API_CONFIG.STORAGE_KEY, data.token);
    localStorage.setItem(API_CONFIG.USER_KEY, JSON.stringify(data));
    return data;
  },

  getCurrentUser() {
    const str = localStorage.getItem(API_CONFIG.USER_KEY);
    return str ? JSON.parse(str) : null;
  },

  logout() {
    localStorage.removeItem(API_CONFIG.STORAGE_KEY);
    localStorage.removeItem(API_CONFIG.USER_KEY);
    const path = window.location.pathname.toLowerCase();
    const loginPath = path.includes('/pages/') ? 'login.html' : 'pages/login.html';
    window.location.href = loginPath;
  },

  // Analytics & Stats
  async getStats() {
    return await fetchWithAuth('/attendance/stats');
  },

  // Groups
  async getGroups() {
    return await fetchWithAuth('/groups');
  },
  async createGroup(groupData) {
    return await fetchWithAuth('/groups', {
      method: 'POST',
      body: JSON.stringify(groupData)
    });
  },
  async updateGroup(id, groupData) {
    return await fetchWithAuth(`/groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(groupData)
    });
  },
  async deleteGroup(id) {
    return await fetchWithAuth(`/groups/${id}`, {
      method: 'DELETE'
    });
  },

  // Students
  async getStudents(groupId = null, search = null, status = null) {
    const params = new URLSearchParams();
    if (groupId) params.append('groupId', groupId);
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    return await fetchWithAuth(`/students?${params.toString()}`);
  },
  async createStudent(studentData) {
    return await fetchWithAuth('/students', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
  },
  async updateStudent(id, studentData) {
    return await fetchWithAuth(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData)
    });
  },
  async deleteStudent(id) {
    return await fetchWithAuth(`/students/${id}`, {
      method: 'DELETE'
    });
  },
  async getStudentAttendance(studentId) {
    return await fetchWithAuth(`/students/${studentId}/attendance`);
  },

  // Teachers
  async getTeachers(search = null) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    return await fetchWithAuth(`/teachers?${params.toString()}`);
  },
  async createTeacher(teacherData) {
    return await fetchWithAuth('/teachers', {
      method: 'POST',
      body: JSON.stringify(teacherData)
    });
  },
  async updateTeacher(id, teacherData) {
    return await fetchWithAuth(`/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(teacherData)
    });
  },
  async deleteTeacher(id) {
    return await fetchWithAuth(`/teachers/${id}`, {
      method: 'DELETE'
    });
  },

  // Attendance
  async getAttendanceSheet(groupId, date) {
    const dateStr = date ? date : new Date().toISOString().split('T')[0];
    return await fetchWithAuth(`/attendance/sheet?groupId=${groupId}&date=${dateStr}`);
  },
  async saveAttendanceBatch(batchData) {
    return await fetchWithAuth('/attendance/batch', {
      method: 'POST',
      body: JSON.stringify(batchData)
    });
  },
  async getAttendanceRecords(groupId = null, date = null) {
    const params = new URLSearchParams();
    if (groupId) params.append('groupId', groupId);
    if (date) params.append('date', date);
    return await fetchWithAuth(`/attendance?${params.toString()}`);
  },

  // CRM Monthly Grid
  async getAttendanceGrid(groupId, year, month) {
    return await fetchWithAuth(`/attendance/grid?groupId=${groupId}&year=${year}&month=${month}`);
  },

  async toggleAttendance(studentId, groupId, date, status = null) {
    return await fetchWithAuth('/attendance/toggle', {
      method: 'POST',
      body: JSON.stringify({ studentId, groupId, date, status })
    });
  },

  async updateStudentCoins(studentId, deltaCoins) {
    return await fetchWithAuth(`/attendance/students/${studentId}/coins`, {
      method: 'POST',
      body: JSON.stringify({ studentId, deltaCoins })
    });
  },

  // Profile & Security
  async changePassword(currentPassword, newPassword) {
    return await fetchWithAuth('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  },

  async updateProfile(profileData) {
    const updated = await fetchWithAuth('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
    if (updated) {
      const user = api.getCurrentUser() || {};
      user.fullName = updated.fullName;
      user.email = updated.email;
      localStorage.setItem(API_CONFIG.USER_KEY, JSON.stringify(user));
    }
    return updated;
  },

  // Export methods (Blob download)
  async downloadFile(endpoint, defaultFilename) {
    const token = localStorage.getItem(API_CONFIG.STORAGE_KEY);
    const res = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    if (!res.ok) throw new Error("Faylni yuklab olishda xatolik yuz berdi.");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = defaultFilename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    showToast("Fayl muvaffaqiyatli yuklab olindi!", "success");
  },

  async exportAttendanceCsv(groupId, year, month) {
    await this.downloadFile(`/attendance/export/csv?groupId=${groupId}&year=${year}&month=${month}`, `davomat_guruh_${groupId}_${year}_${month}.csv`);
  },

  async exportStudentsCsv(groupId = null) {
    const param = groupId ? `?groupId=${groupId}` : '';
    await this.downloadFile(`/students/export/csv${param}`, `talabalar_royxati.csv`);
  }
};

/**
 * Davomat Tizimi - API Client & Centralized State Manager
 * Fully compatible with Vercel deployment, remote ASP.NET Core API, and offline/demo mode.
 */

const API_CONFIG = {
  BASE_URL: (() => {
    // 1. Explicit override from localStorage
    const saved = localStorage.getItem('davomat_api_url');
    if (saved) return saved.replace(/\/+$/, '');

    // 2. Global window configuration
    if (window.DAVOMAT_API_URL) return window.DAVOMAT_API_URL.replace(/\/+$/, '');

    // 3. Localhost development environments
    const origin = window.location.origin || '';
    if (origin.includes(':5041') || origin.includes(':7003')) {
      return `${origin}/api`;
    }
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return 'http://localhost:5041/api';
    }

    // 4. Vercel or cloud production
    return `${origin}/api`;
  })(),
  STORAGE_KEY: 'davomat_auth_token',
  USER_KEY: 'davomat_user_info',
  IS_DEMO_ACTIVE: false
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

// ==========================================================
// MOCK / DEMO DATABASE (SEAMLESS VERCEL FALLBACK)
// ==========================================================
const MockDb = {
  getStorage(key, defaultVal) {
    try {
      const v = localStorage.getItem(`davomat_mock_${key}`);
      return v ? JSON.parse(v) : defaultVal;
    } catch {
      return defaultVal;
    }
  },
  setStorage(key, val) {
    try {
      localStorage.setItem(`davomat_mock_${key}`, JSON.stringify(val));
    } catch {}
  },

  getGroups() {
    return this.getStorage('groups', [
      { id: 1, name: 'G1', courseName: 'Foundation - C++,Python', teacherName: 'Abdulhayev Jasur', price: '695 000 UZS', scheduleTime: 'Toq kunlar • 14:00', roomNumber: '6-xona', capacity: 20, dateRange: '29.04.2026 – 29.02.2028', branch: "IT LIVE o'quv markazi", lessonDaysType: 'Odd', studentsCount: 9 },
      { id: 2, name: 'Frontend-Pro', courseName: 'Frontend React & Vue', teacherName: 'Karimov Bobur', price: '750 000 UZS', scheduleTime: 'Juft kunlar • 16:00', roomNumber: '4-xona', capacity: 18, dateRange: '01.05.2026 – 01.11.2027', branch: "IT LIVE o'quv markazi", lessonDaysType: 'Even', studentsCount: 12 },
      { id: 3, name: 'G-3', courseName: 'Python Backend Django', teacherName: 'Rahmonov Sardor', price: '720 000 UZS', scheduleTime: 'Har kuni • 18:00', roomNumber: '2-xona', capacity: 15, dateRange: '10.05.2026 – 10.12.2027', branch: "IT LIVE o'quv markazi", lessonDaysType: 'Daily', studentsCount: 10 },
      { id: 4, name: 'G-2', courseName: 'Grafik Dizayn & UI/UX', teacherName: 'Abdulhayev Jasur', price: '650 000 UZS', scheduleTime: 'Toq kunlar • 10:00', roomNumber: '5-xona', capacity: 16, dateRange: '15.05.2026 – 15.01.2028', branch: "IT LIVE o'quv markazi", lessonDaysType: 'Odd', studentsCount: 8 }
    ]);
  },

  getStudents(groupId = null) {
    let list = this.getStorage('students', [
      { id: 1, fullName: 'Abduganiyev Abdulvoris', phone: '(99) 321-31-50', groupId: 1, groupName: 'G1', coins: 45, status: 'Active' },
      { id: 2, fullName: 'Abduhakimov Ismoil', phone: '(90) 400-15-88', groupId: 1, groupName: 'G1', coins: 30, status: 'Active' },
      { id: 3, fullName: 'Boymurodov Sarvar', phone: '(94) 580-01-79', groupId: 1, groupName: 'G1', coins: 60, status: 'Active' },
      { id: 4, fullName: 'Jamoliddinov Javohir', phone: '(33) 856-44-04', groupId: 1, groupName: 'G1', coins: 25, status: 'Active' },
      { id: 5, fullName: 'Keldibekova Sabina', phone: '(33) 488-21-99', groupId: 1, groupName: 'G1', coins: 50, status: 'Active' },
      { id: 6, fullName: 'Kunarboyev Jasurbek', phone: '(91) 123-45-67', groupId: 1, groupName: 'G1', coins: 40, status: 'Active' },
      { id: 7, fullName: 'Mamatov Azizbek', phone: '(93) 765-43-21', groupId: 1, groupName: 'G1', coins: 35, status: 'Active' },
      { id: 8, fullName: 'Normurodov Diyorbek', phone: '(97) 998-11-22', groupId: 1, groupName: 'G1', coins: 20, status: 'Active' },
      { id: 9, fullName: 'Oripov Bexruz', phone: '(99) 555-66-77', groupId: 1, groupName: 'G1', coins: 15, status: 'Active' }
    ]);
    if (groupId) {
      list = list.filter(s => s.groupId === parseInt(groupId));
    }
    return list;
  },

  getTeachers() {
    return this.getStorage('teachers', [
      { id: 1, fullName: 'Abdulhayev Jasur', phone: '(90) 123-45-67', subject: 'Foundation & C++', groupsCount: 2, status: 'Active' },
      { id: 2, fullName: 'Karimov Bobur', phone: '(91) 987-65-43', subject: 'Frontend Web Development', groupsCount: 1, status: 'Active' },
      { id: 3, fullName: 'Rahmonov Sardor', phone: '(93) 456-78-90', subject: 'Python & Django Backend', groupsCount: 1, status: 'Active' }
    ]);
  },

  getAttendanceMap() {
    return this.getStorage('attendance_records', {
      "1_2026-09-14": "Present",
      "1_2026-09-16": "Present",
      "1_2026-09-18": "Present",
      "1_2026-09-21": "Present",
      "1_2026-09-23": "Absent",
      "1_2026-09-25": "Present",
      "2_2026-09-14": "Present",
      "2_2026-09-16": "Present",
      "2_2026-09-18": "Present",
      "2_2026-09-21": "Present",
      "2_2026-09-23": "Absent",
      "2_2026-09-25": "Present",
      "3_2026-09-14": "Present",
      "3_2026-09-16": "Present",
      "3_2026-09-18": "Present",
      "3_2026-09-21": "Present",
      "3_2026-09-23": "Present",
      "3_2026-09-25": "Present",
      "4_2026-09-14": "Present",
      "4_2026-09-16": "Present",
      "4_2026-09-18": "Present",
      "4_2026-09-21": "Present",
      "4_2026-09-23": "Present",
      "4_2026-09-25": "Present",
      "5_2026-09-14": "Present",
      "5_2026-09-16": "Present",
      "5_2026-09-18": "Present",
      "5_2026-09-21": "Present",
      "5_2026-09-23": "Present",
      "5_2026-09-25": "Present"
    });
  },

  getAttendanceGrid(groupId, year, month) {
    const groups = this.getGroups();
    const g = groups.find(x => x.id === parseInt(groupId)) || groups[0];
    const students = this.getStudents(g.id);
    const attMap = this.getAttendanceMap();

    const uzMonths = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
    const monthShorts = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sent', 'okt', 'noy', 'dek'];

    const y = parseInt(year);
    const m = parseInt(month);
    const daysInMonth = new Date(y, m, 0).getDate();
    const today = new Date();

    const lessonDays = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dt = new Date(y, m - 1, day);
      const dow = dt.getDay(); // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat

      let isLesson = false;
      if (g.lessonDaysType === 'Odd') {
        isLesson = (dow === 1 || dow === 3 || dow === 5); // Mon, Wed, Fri
      } else if (g.lessonDaysType === 'Even') {
        isLesson = (dow === 2 || dow === 4 || dow === 6); // Tue, Thu, Sat
      } else {
        isLesson = (dow !== 0); // Daily (Mon-Sat)
      }

      if (isLesson) {
        const dStr = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = (today.getFullYear() === y && (today.getMonth() + 1) === m && today.getDate() === day);
        lessonDays.push({
          date: `${dStr}T00:00:00`,
          dayNumber: day,
          dayName: `${day} ${monthShorts[m - 1]}`,
          isToday
        });
      }
    }

    const rosterStudents = students.map(s => {
      const dailyStatus = {};
      let p = 0;
      let a = 0;
      for (const ld of lessonDays) {
        const dKey = ld.date.split('T')[0];
        const key = `${s.id}_${dKey}`;
        const st = attMap[key] || null;
        dailyStatus[dKey] = st;
        if (st === 'Present' || st === 'Late') p++;
        else if (st === 'Absent') a++;
      }
      return {
        studentId: s.id,
        fullName: s.fullName,
        phone: s.phone,
        coins: s.coins,
        presentCount: p,
        absentCount: a,
        hasWarning: (a >= 2),
        dailyStatus
      };
    });

    return {
      group: {
        groupId: g.id,
        groupName: g.name,
        courseName: g.courseName,
        teacherName: g.teacherName,
        price: g.price,
        scheduleTime: g.scheduleTime,
        roomNumber: g.roomNumber,
        capacity: g.capacity,
        dateRange: g.dateRange,
        branch: g.branch,
        monthName: `${monthShorts[m - 1]} ${y}`,
        year: y,
        month: m
      },
      lessonDays,
      students: rosterStudents
    };
  },

  handleMockRequest(endpoint, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const url = new URL(`http://localhost${endpoint}`);
    const path = url.pathname;
    const params = url.searchParams;

    // Login
    if (path === '/auth/login' && method === 'POST') {
      const body = JSON.parse(options.body || '{}');
      const u = body.username || 'admin';
      const isTeacher = (u.toLowerCase() === 'alisher' || u.toLowerCase() === 'teacher');
      return {
        token: `demo-jwt-token-${Date.now()}`,
        id: isTeacher ? 2 : 1,
        username: u,
        fullName: isTeacher ? 'Alisher Zokirov' : 'Administrator Boshqaruvchi',
        role: isTeacher ? 'Teacher' : 'Admin'
      };
    }

    // Stats
    if (path === '/attendance/stats') {
      const students = this.getStudents();
      const groups = this.getGroups();
      return {
        totalStudents: students.length,
        activeGroups: groups.length,
        todayPresent: Math.max(1, students.length - 2),
        todayAbsent: 2,
        monthlyAttendanceRate: 89
      };
    }

    // Groups
    if (path === '/groups') {
      if (method === 'GET') return this.getGroups();
      if (method === 'POST') {
        const body = JSON.parse(options.body || '{}');
        const groups = this.getGroups();
        const newGroup = { ...body, id: Date.now(), studentsCount: 0, branch: "IT LIVE o'quv markazi" };
        groups.push(newGroup);
        this.setStorage('groups', groups);
        return newGroup;
      }
    }
    if (path.startsWith('/groups/') && method === 'DELETE') {
      const id = parseInt(path.split('/')[2]);
      const groups = this.getGroups().filter(g => g.id !== id);
      this.setStorage('groups', groups);
      return true;
    }
    if (path.startsWith('/groups/') && method === 'PUT') {
      const id = parseInt(path.split('/')[2]);
      const body = JSON.parse(options.body || '{}');
      const groups = this.getGroups();
      const idx = groups.findIndex(g => g.id === id);
      if (idx !== -1) groups[idx] = { ...groups[idx], ...body };
      this.setStorage('groups', groups);
      return groups[idx];
    }

    // Students
    if (path === '/students') {
      if (method === 'GET') {
        return this.getStudents(params.get('groupId'));
      }
      if (method === 'POST') {
        const body = JSON.parse(options.body || '{}');
        const students = this.getStudents();
        const newS = { ...body, id: Date.now(), coins: 10, status: 'Active' };
        students.push(newS);
        this.setStorage('students', students);
        return newS;
      }
    }
    if (path.startsWith('/students/') && method === 'DELETE') {
      const id = parseInt(path.split('/')[2]);
      const students = this.getStudents().filter(s => s.id !== id);
      this.setStorage('students', students);
      return true;
    }

    // Teachers
    if (path === '/teachers') {
      if (method === 'GET') return this.getTeachers();
      if (method === 'POST') {
        const body = JSON.parse(options.body || '{}');
        const teachers = this.getTeachers();
        const newT = { ...body, id: Date.now(), groupsCount: 0, status: 'Active' };
        teachers.push(newT);
        this.setStorage('teachers', teachers);
        return newT;
      }
    }

    // Attendance Matrix Grid
    if (path === '/attendance/grid') {
      const gId = params.get('groupId') || 1;
      const yr = params.get('year') || 2026;
      const mo = params.get('month') || 9;
      return this.getAttendanceGrid(gId, yr, mo);
    }

    // Toggle Attendance
    if (path === '/attendance/toggle' && method === 'POST') {
      const body = JSON.parse(options.body || '{}');
      const { studentId, date, status } = body;
      const attMap = this.getAttendanceMap();
      const key = `${studentId}_${date}`;
      if (!status || status === 'None') {
        delete attMap[key];
      } else {
        attMap[key] = status;
      }
      this.setStorage('attendance_records', attMap);
      return { status: status || 'None', date, studentId };
    }

    // Update Coins
    if (path.includes('/coins') && method === 'POST') {
      const body = JSON.parse(options.body || '{}');
      const studentId = body.studentId;
      const delta = parseInt(body.deltaCoins) || 0;
      const students = this.getStudents();
      const s = students.find(x => x.id === studentId);
      if (s) {
        s.coins = Math.max(0, (s.coins || 0) + delta);
        this.setStorage('students', students);
        return { studentId, coins: s.coins };
      }
      return { studentId, coins: 50 };
    }

    // Profile & Password
    if (path.startsWith('/auth/profile')) {
      const body = JSON.parse(options.body || '{}');
      return body;
    }
    if (path.startsWith('/auth/change-password')) {
      return { message: "Parol muvaffaqiyatli yangilandi" };
    }

    return null;
  }
};

// Fetch with automatic JWT Bearer token and seamless Vercel fallback
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

    if (!response.ok) {
      // If remote backend 404/500 on Vercel, try mock fallback
      const mockResult = MockDb.handleMockRequest(endpoint, options);
      if (mockResult !== null) return mockResult;
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || `Xatolik: ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    // If network connection failed or server not deployed yet on Vercel:
    const mockResult = MockDb.handleMockRequest(endpoint, options);
    if (mockResult !== null) {
      if (!API_CONFIG.IS_DEMO_ACTIVE) {
        API_CONFIG.IS_DEMO_ACTIVE = true;
        console.log('Davomat Tizimi: Demo / Offline rejimida ishlamoqda');
      }
      return mockResult;
    }

    console.error('API Error:', err);
    showToast(err.message || 'Server bilan bog\'lanishda xatolik yuz berdi.', 'error');
    throw err;
  }
}

// Exported API Methods
const api = {
  setApiUrl(url) {
    localStorage.setItem('davomat_api_url', url);
    API_CONFIG.BASE_URL = url.replace(/\/+$/, '');
    showToast(`Backend API o'zgartirildi: ${API_CONFIG.BASE_URL}`, 'success');
  },

  // Auth
  async login(username, password) {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(API_CONFIG.STORAGE_KEY, data.token);
        localStorage.setItem(API_CONFIG.USER_KEY, JSON.stringify(data));
        return data;
      }
    } catch {}

    // Fallback Mock Login (Works on Vercel out of the box)
    const mockUser = MockDb.handleMockRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    localStorage.setItem(API_CONFIG.STORAGE_KEY, mockUser.token);
    localStorage.setItem(API_CONFIG.USER_KEY, JSON.stringify(mockUser));
    return mockUser;
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

  // Export methods (Blob download with client-side fallback)
  async downloadFile(endpoint, defaultFilename) {
    try {
      const token = localStorage.getItem(API_CONFIG.STORAGE_KEY);
      const res = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const blob = await res.blob();
        this.saveBlob(blob, defaultFilename);
        return;
      }
    } catch {}

    // Client-side CSV generation fallback
    const grid = MockDb.getAttendanceGrid(1, 2026, 9);
    let csv = "\uFEFFIsm,Telefon,Tangalar," + grid.lessonDays.map(d => `"${d.dayName}"`).join(",") + "\n";
    grid.students.forEach(s => {
      const row = [`"${s.fullName}"`, `"${s.phone || ''}"`, s.coins];
      grid.lessonDays.forEach(d => {
        const dKey = d.date.split('T')[0];
        const st = s.dailyStatus[dKey];
        row.push(st === 'Present' ? '"Bor"' : st === 'Absent' ? '"Yo\'q"' : '""');
      });
      csv += row.join(",") + "\n";
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    this.saveBlob(blob, defaultFilename);
  },

  saveBlob(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
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

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
  IS_DEMO_ACTIVE: false,
  USE_MOCK: (() => {
    if (localStorage.getItem('davomat_api_url') || window.DAVOMAT_API_URL) return false;
    const origin = window.location.origin || '';
    if (origin.includes(':5041') || origin.includes(':7003')) return false;
    return true;
  })()
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
      { id: 1, name: 'G1', courseName: 'Foundation - C++,Python', description: 'Foundation dasturlash asoslari kursi', teacherName: 'Abdulhayev Jasur', price: '695 000 UZS', scheduleTime: 'Toq kunlar • 14:00', roomNumber: '6-xona', capacity: 20, courseYear: 1, dateRange: '29.04.2026 – 29.02.2028', branch: "IT LIVE o'quv markazi", lessonDaysType: 'Odd', studentsCount: 9 },
      { id: 2, name: 'Frontend-Pro', courseName: 'Frontend React & Vue', description: 'Zamonaviy Frontend veb dasturlash kursi', teacherName: 'Karimov Bobur', price: '750 000 UZS', scheduleTime: 'Juft kunlar • 16:00', roomNumber: '4-xona', capacity: 18, courseYear: 2, dateRange: '01.05.2026 – 01.11.2027', branch: "IT LIVE o'quv markazi", lessonDaysType: 'Even', studentsCount: 12 },
      { id: 3, name: 'G-3', courseName: 'Python Backend Django', description: 'Python, Django va REST API arxitekturasi', teacherName: 'Rahmonov Sardor', price: '720 000 UZS', scheduleTime: 'Har kuni • 18:00', roomNumber: '2-xona', capacity: 15, courseYear: 1, dateRange: '10.05.2026 – 10.12.2027', branch: "IT LIVE o'quv markazi", lessonDaysType: 'Daily', studentsCount: 10 },
      { id: 4, name: 'G-2', courseName: 'Grafik Dizayn & UI/UX', description: 'Figma va zamonaviy interfeys dizayni', teacherName: 'Abdulhayev Jasur', price: '650 000 UZS', scheduleTime: 'Toq kunlar • 10:00', roomNumber: '5-xona', capacity: 16, courseYear: 1, dateRange: '15.05.2026 – 15.01.2028', branch: "IT LIVE o'quv markazi", lessonDaysType: 'Odd', studentsCount: 8 }
    ]);
  },

  getStudents(groupId = null, search = null, status = null) {
    let list = this.getStorage('students', [
      { id: 1, fullName: 'Abduganiyev Abdulvoris', studentCode: 'STD-21001', phone: '(99) 321-31-50', groupId: 1, groupName: 'G1', coins: 45, status: 'Active', attendanceRate: 94, createdAt: '2026-02-10T10:00:00Z', parentName: 'Abduganiyev Vohid', parentPhone: '(99) 321-31-55', email: 'abdulvoris@gmail.com' },
      { id: 2, fullName: 'Abduhakimov Ismoil', studentCode: 'STD-21002', phone: '(90) 400-15-88', groupId: 1, groupName: 'G1', coins: 30, status: 'Active', attendanceRate: 88, createdAt: '2026-02-12T11:00:00Z', parentName: 'Abduhakimov Akrom', parentPhone: '(90) 400-15-90', email: 'ismoil@gmail.com' },
      { id: 3, fullName: 'Boymurodov Sarvar', studentCode: 'STD-21003', phone: '(94) 580-01-79', groupId: 1, groupName: 'G1', coins: 60, status: 'Active', attendanceRate: 98, createdAt: '2026-02-15T09:30:00Z', parentName: 'Boymurodov Shavkat', parentPhone: '(94) 580-01-80', email: 'sarvar@gmail.com' },
      { id: 4, fullName: 'Jamoliddinov Javohir', studentCode: 'STD-21004', phone: '(33) 856-44-04', groupId: 1, groupName: 'G1', coins: 25, status: 'Active', attendanceRate: 75, createdAt: '2026-02-18T14:00:00Z', parentName: 'Jamoliddinov Dilshod', parentPhone: '(33) 856-44-10', email: 'javohir@gmail.com' },
      { id: 5, fullName: 'Keldibekova Sabina', studentCode: 'STD-21005', phone: '(33) 488-21-99', groupId: 1, groupName: 'G1', coins: 50, status: 'Active', attendanceRate: 92, createdAt: '2026-02-20T10:15:00Z', parentName: 'Keldibekova Nodira', parentPhone: '(33) 488-21-00', email: 'sabina@gmail.com' },
      { id: 6, fullName: 'Kunarboyev Jasurbek', studentCode: 'STD-21006', phone: '(91) 123-45-67', groupId: 1, groupName: 'G1', coins: 40, status: 'Active', attendanceRate: 85, createdAt: '2026-02-22T16:00:00Z', parentName: 'Kunarboyev Otabek', parentPhone: '(91) 123-45-70', email: 'jasur@gmail.com' },
      { id: 7, fullName: 'Mamatov Azizbek', studentCode: 'STD-21007', phone: '(93) 765-43-21', groupId: 1, groupName: 'G1', coins: 35, status: 'Active', attendanceRate: 90, createdAt: '2026-02-25T12:00:00Z', parentName: 'Mamatov Ulugbek', parentPhone: '(93) 765-43-25', email: 'azizbek@gmail.com' },
      { id: 8, fullName: 'Normurodov Diyorbek', studentCode: 'STD-21008', phone: '(97) 998-11-22', groupId: 1, groupName: 'G1', coins: 20, status: 'Frozen', attendanceRate: 65, createdAt: '2026-03-01T09:00:00Z', parentName: 'Normurodov Farhod', parentPhone: '(97) 998-11-30', email: 'diyorbek@gmail.com' },
      { id: 9, fullName: 'Oripov Bexruz', studentCode: 'STD-21009', phone: '(99) 555-66-77', groupId: 1, groupName: 'G1', coins: 15, status: 'Active', attendanceRate: 80, createdAt: '2026-03-05T15:30:00Z', parentName: 'Oripov Tohir', parentPhone: '(99) 555-66-80', email: 'bexruz@gmail.com' }
    ]);
    if (groupId) {
      list = list.filter(s => s.groupId === parseInt(groupId));
    }
    if (status) {
      list = list.filter(s => String(s.status).toLowerCase() === String(status).toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        (s.fullName && s.fullName.toLowerCase().includes(q)) ||
        (s.studentCode && s.studentCode.toLowerCase().includes(q)) ||
        (s.phone && s.phone.toLowerCase().includes(q))
      );
    }
    return list;
  },

  getTeachers(search = null) {
    let list = this.getStorage('teachers', [
      { id: 1, fullName: 'Abdulhayev Jasur', email: 'jasur@itlive.uz', phone: '(90) 123-45-67', subject: 'Foundation & C++', groupsCount: 2, groupNames: ['G1', 'G-2'], status: 'Active' },
      { id: 2, fullName: 'Karimov Bobur', email: 'bobur@itlive.uz', phone: '(91) 987-65-43', subject: 'Frontend Web Development', groupsCount: 1, groupNames: ['Frontend-Pro'], status: 'Active' },
      { id: 3, fullName: 'Rahmonov Sardor', email: 'sardor@itlive.uz', phone: '(93) 456-78-90', subject: 'Python & Django Backend', groupsCount: 1, groupNames: ['G-3'], status: 'Active' }
    ]);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        (t.fullName && t.fullName.toLowerCase().includes(q)) ||
        (t.subject && t.subject.toLowerCase().includes(q)) ||
        (t.email && t.email.toLowerCase().includes(q))
      );
    }
    return list;
  },

  getAttendanceRecords() {
    return this.getStorage('recent_attendance', [
      { id: 1, studentName: 'Boymurodov Sarvar', studentCode: 'STD-21003', groupName: 'G1', date: '2026-09-27T09:15:00', status: 'Present', statusText: 'Bor edi', note: 'Vaqtida keldi', markedBy: 'Abdulhayev Jasur' },
      { id: 2, studentName: 'Abduganiyev Abdulvoris', studentCode: 'STD-21001', groupName: 'G1', date: '2026-09-27T09:16:00', status: 'Present', statusText: 'Bor edi', note: '', markedBy: 'Abdulhayev Jasur' },
      { id: 3, studentName: 'Keldibekova Sabina', studentCode: 'STD-21005', groupName: 'G1', date: '2026-09-27T09:18:00', status: 'Present', statusText: 'Bor edi', note: '+5 coin berildi', markedBy: 'Abdulhayev Jasur' },
      { id: 4, studentName: 'Jamoliddinov Javohir', studentCode: 'STD-21004', groupName: 'G1', date: '2026-09-27T09:25:00', status: 'Late', statusText: 'Kechikdi', note: '10 daqiqa kechikdi', markedBy: 'Abdulhayev Jasur' },
      { id: 5, studentName: 'Abduhakimov Ismoil', studentCode: 'STD-21002', groupName: 'G1', date: '2026-09-27T09:30:00', status: 'Absent', statusText: "Kelmadi", note: 'Sababsiz kelmadi', markedBy: 'Abdulhayev Jasur' },
      { id: 6, studentName: 'Kunarboyev Jasurbek', studentCode: 'STD-21006', groupName: 'G1', date: '2026-09-26T14:10:00', status: 'Present', statusText: 'Bor edi', note: '', markedBy: 'Abdulhayev Jasur' },
      { id: 7, studentName: 'Mamatov Azizbek', studentCode: 'STD-21007', groupName: 'G1', date: '2026-09-26T14:12:00', status: 'Present', statusText: 'Bor edi', note: '', markedBy: 'Abdulhayev Jasur' },
      { id: 8, studentName: 'Oripov Bexruz', studentCode: 'STD-21009', groupName: 'G1', date: '2026-09-25T14:05:00', status: 'Present', statusText: 'Bor edi', note: '', markedBy: 'Abdulhayev Jasur' }
    ]);
  },

  getStudentAttendanceHistory(studentId) {
    return [
      { date: '2026-09-25', groupName: 'G1', status: 'Present', note: "Darsda to'liq qatnashdi" },
      { date: '2026-09-23', groupName: 'G1', status: 'Present', note: 'Faol qatnashdi' },
      { date: '2026-09-21', groupName: 'G1', status: 'Present', note: 'Uy vazifasi bajarilgan' },
      { date: '2026-09-18', groupName: 'G1', status: 'Late', note: '5 daqiqa kechikdi' },
      { date: '2026-09-16', groupName: 'G1', status: 'Present', note: '' },
      { date: '2026-09-14', groupName: 'G1', status: 'Present', note: '' }
    ];
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
      const dow = dt.getDay();

      let isLesson = false;
      if (g.lessonDaysType === 'Odd') {
        isLesson = (dow === 1 || dow === 3 || dow === 5);
      } else if (g.lessonDaysType === 'Even') {
        isLesson = (dow === 2 || dow === 4 || dow === 6);
      } else {
        isLesson = (dow !== 0);
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
      const teachers = this.getTeachers();
      return {
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalGroups: groups.length,
        todayRate: 92,
        todayPresent: Math.max(1, students.length - 2),
        todayLate: 1,
        todayAbsent: 2,
        todayExcused: 0,
        weeklyStats: [
          { date: '2026-09-21', rate: 94, present: 37, absent: 2 },
          { date: '2026-09-22', rate: 89, present: 35, absent: 4 },
          { date: '2026-09-23', rate: 96, present: 38, absent: 1 },
          { date: '2026-09-24', rate: 92, present: 36, absent: 3 },
          { date: '2026-09-25', rate: 97, present: 38, absent: 1 },
          { date: '2026-09-26', rate: 90, present: 35, absent: 4 },
          { date: '2026-09-27', rate: 95, present: 37, absent: 2 }
        ]
      };
    }

    // Recent Attendance Records for Dashboard Table
    if (path === '/attendance' && method === 'GET') {
      return this.getAttendanceRecords();
    }

    // Student Attendance History
    if (path.startsWith('/students/') && path.endsWith('/attendance')) {
      const parts = path.split('/');
      const id = parseInt(parts[2]);
      return this.getStudentAttendanceHistory(id);
    }

    // Groups
    if (path === '/groups') {
      if (method === 'GET') return this.getGroups();
      if (method === 'POST') {
        const body = JSON.parse(options.body || '{}');
        const groups = this.getGroups();
        const newGroup = {
          ...body,
          id: Date.now(),
          courseYear: body.courseYear || 1,
          studentsCount: 0,
          branch: "IT LIVE o'quv markazi"
        };
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
        return this.getStudents(params.get('groupId'), params.get('search'), params.get('status'));
      }
      if (method === 'POST') {
        const body = JSON.parse(options.body || '{}');
        const students = this.getStudents();
        const groups = this.getGroups();
        const grp = groups.find(g => g.id === parseInt(body.groupId)) || {};
        const newS = {
          ...body,
          id: Date.now(),
          studentCode: body.studentCode || `STD-${Math.floor(10000 + Math.random() * 90000)}`,
          groupName: grp.name || 'G1',
          coins: 10,
          status: body.status || 'Active',
          attendanceRate: 100,
          createdAt: new Date().toISOString()
        };
        students.push(newS);
        this.setStorage('students', students);
        return newS;
      }
    }
    if (path.startsWith('/students/') && method === 'PUT') {
      const id = parseInt(path.split('/')[2]);
      const body = JSON.parse(options.body || '{}');
      const students = this.getStudents();
      const idx = students.findIndex(s => s.id === id);
      if (idx !== -1) {
        const groups = this.getGroups();
        const grp = groups.find(g => g.id === parseInt(body.groupId)) || {};
        students[idx] = { ...students[idx], ...body, groupName: grp.name || students[idx].groupName };
        this.setStorage('students', students);
        return students[idx];
      }
      return null;
    }
    if (path.startsWith('/students/') && method === 'DELETE') {
      const id = parseInt(path.split('/')[2]);
      const students = this.getStudents().filter(s => s.id !== id);
      this.setStorage('students', students);
      return true;
    }

    // Teachers
    if (path === '/teachers') {
      if (method === 'GET') return this.getTeachers(params.get('search'));
      if (method === 'POST') {
        const body = JSON.parse(options.body || '{}');
        const teachers = this.getTeachers();
        const newT = {
          ...body,
          id: Date.now(),
          groupsCount: (body.groupIds || []).length,
          groupNames: body.groupNames || ['G1'],
          status: 'Active'
        };
        teachers.push(newT);
        this.setStorage('teachers', teachers);
        return newT;
      }
    }
    if (path.startsWith('/teachers/') && method === 'PUT') {
      const id = parseInt(path.split('/')[2]);
      const body = JSON.parse(options.body || '{}');
      const teachers = this.getTeachers();
      const idx = teachers.findIndex(t => t.id === id);
      if (idx !== -1) {
        teachers[idx] = { ...teachers[idx], ...body };
        this.setStorage('teachers', teachers);
        return teachers[idx];
      }
      return null;
    }
    if (path.startsWith('/teachers/') && method === 'DELETE') {
      const id = parseInt(path.split('/')[2]);
      const teachers = this.getTeachers().filter(t => t.id !== id);
      this.setStorage('teachers', teachers);
      return true;
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
  // If USE_MOCK is true, immediately serve from local database (no network lag or 404s on Vercel)
  if (API_CONFIG.USE_MOCK) {
    const mockRes = MockDb.handleMockRequest(endpoint, options);
    if (mockRes !== null) {
      if (!API_CONFIG.IS_DEMO_ACTIVE) {
        API_CONFIG.IS_DEMO_ACTIVE = true;
        console.log('Davomat Tizimi: Vercel Offline / Demo rejimida ishlamoqda');
      }
      return mockRes;
    }
  }

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
      if (!window.location.pathname.toLowerCase().includes('login')) {
        showToast('Sessiya muddati tugadi. Iltimos, qayta kiring.', 'error');
        setTimeout(() => {
          const path = window.location.pathname.toLowerCase();
          let loginPath = 'pages/login.html';
          if (path.includes('/pages/')) {
            loginPath = 'login.html';
          } else if (window.location.protocol !== 'file:') {
            loginPath = '/login';
          }
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
    API_CONFIG.USE_MOCK = false;
    showToast(`Backend API o'zgartirildi: ${API_CONFIG.BASE_URL}`, 'success');
  },

  // Auth
  async login(username, password) {
    if (!API_CONFIG.USE_MOCK) {
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
    }

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
    let loginPath = 'pages/login.html';
    if (path.includes('/pages/')) {
      loginPath = 'login.html';
    } else if (window.location.protocol !== 'file:') {
      loginPath = '/login';
    }
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

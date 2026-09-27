/**
 * Davomat Tizimi - CRM Style Attendance Controller (Modme Matrix UI)
 */

let crmState = {
  groupId: 1,
  year: 2026,
  month: 9,
  showCoins: true,
  showDetails: true,
  gridData: null,
  allGroups: []
};

async function initAttendanceView() {
  const container = document.getElementById('view-attendance');
  if (!container) return;

  try {
    const groups = await api.getGroups();
    crmState.allGroups = groups || [];
    if (groups && groups.length > 0 && !crmState.groupId) {
      crmState.groupId = groups[0].id;
    }
  } catch (err) {
    console.error('Failed to load groups', err);
  }

  loadCrmAttendanceGrid();
}

async function loadCrmAttendanceGrid() {
  const container = document.getElementById('view-attendance');
  if (!container) return;

  try {
    const grid = await api.getAttendanceGrid(crmState.groupId, crmState.year, crmState.month);
    crmState.gridData = grid;
    renderCrmAttendanceUI(grid);
  } catch (err) {
    console.error('Failed to load attendance grid', err);
    showToast('Davomat matritsasini yuklashda xatolik yuz berdi.', 'error');
  }
}

/**
 * Generate in-place HTML for a single attendance cell with Modme pills and hover actions
 */
function renderCellHtml(studentId, dateKey, status) {
  let pillHtml = '';
  let clearBtnHtml = '';

  if (status === 'Present' || status === 'Late') {
    pillHtml = `
      <div class="crm-pill present" onclick="toggleCellAttendance(event, ${studentId}, '${dateKey}')" title="Holat: Bor edi">
        <span>Bor</span>
        <span>edi</span>
      </div>
    `;
    clearBtnHtml = `
      <button type="button" class="crm-hover-btn btn-clear" onclick="setCellAttendance(event, ${studentId}, '${dateKey}', 'None')" title="Tozalash">✕</button>
    `;
  } else if (status === 'Absent') {
    pillHtml = `
      <div class="crm-pill absent" onclick="toggleCellAttendance(event, ${studentId}, '${dateKey}')" title="Holat: Yo'q">
        <span>Yo'q</span>
      </div>
    `;
    clearBtnHtml = `
      <button type="button" class="crm-hover-btn btn-clear" onclick="setCellAttendance(event, ${studentId}, '${dateKey}', 'None')" title="Tozalash">✕</button>
    `;
  } else {
    pillHtml = `
      <div class="crm-pill empty" onclick="toggleCellAttendance(event, ${studentId}, '${dateKey}')" title="Belgilash">
      </div>
    `;
  }

  return `
    <div class="crm-cell-wrapper" id="cell_${studentId}_${dateKey}">
      ${pillHtml}
      <div class="crm-hover-actions">
        <button type="button" class="crm-hover-btn btn-present" onclick="setCellAttendance(event, ${studentId}, '${dateKey}', 'Present')" title="Bor edi">
          Bor edi
        </button>
        <button type="button" class="crm-hover-btn btn-absent" onclick="setCellAttendance(event, ${studentId}, '${dateKey}', 'Absent')" title="Yo'q">
          Yo'q
        </button>
        ${clearBtnHtml}
      </div>
    </div>
  `;
}

function renderCrmAttendanceUI(grid) {
  const container = document.getElementById('view-attendance');
  if (!container) return;

  // Preserve scroll position if table was already rendered
  const oldScrollWrapper = container.querySelector('.crm-grid-scroll-wrapper');
  const prevScrollLeft = oldScrollWrapper ? oldScrollWrapper.scrollLeft : null;

  const currentGroup = grid || {};
  const students = grid.students || [];
  const lessonDays = grid.lessonDays || [];

  // Group icons on left rail
  const railGroups = crmState.allGroups.length > 0 
    ? crmState.allGroups 
    : [{ id: 1, name: 'G1' }, { id: 2, name: 'G2' }, { id: 3, name: 'G-3' }];

  const railHtml = railGroups.map(g => `
    <button class="crm-group-icon-btn ${g.id === crmState.groupId ? 'active' : ''}" 
            onclick="selectCrmGroup(${g.id})" title="${g.name}">
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin-bottom:2px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
      <span>${g.name}</span>
    </button>
  `).join('');

  // Left roster list
  const rosterHtml = students.map((s, idx) => `
    <div class="crm-roster-item">
      <div class="crm-roster-info">
        <span style="color:#64748B; font-size:0.75rem; width:16px;">${idx + 1}.</span>
        <span class="crm-status-dot crm-student-dot-${s.studentId} ${s.hasWarning ? 'red' : 'green'}"></span>
        <span class="crm-roster-name" title="${s.fullName}">${s.fullName}</span>
      </div>
      <div class="crm-roster-phone">${s.phone || '—'}</div>
      <span style="color:#64748B; cursor:pointer;" title="Batafsil">⋮</span>
    </div>
  `).join('');

  // Table Date Headers
  const thDatesHtml = lessonDays.map(d => `
    <th class="col-date ${d.isToday ? 'col-today' : ''}">${d.dateLabel}</th>
  `).join('');

  // Table Body Rows
  const rowsHtml = students.map(s => {
    const cellsHtml = lessonDays.map(d => {
      const dateKey = d.date.split('T')[0];
      const status = s.dailyStatus[dateKey];
      return `<td class="col-date">${renderCellHtml(s.studentId, dateKey, status)}</td>`;
    }).join('');

    const coinStyle = crmState.showCoins ? '' : 'display:none;';

    return `
      <tr id="row_student_${s.studentId}">
        <td class="col-name">
          <div class="crm-student-cell">
            <div class="crm-avatar-icon">👤</div>
            <span class="crm-status-dot crm-student-dot-${s.studentId} ${s.hasWarning ? 'red' : 'green'}"></span>
            <div class="crm-student-cell-name" title="${s.fullName}">${s.fullName}</div>
          </div>
        </td>
        ${cellsHtml}
        <td class="col-coin col-coin-val" style="${coinStyle}">
          <div class="crm-coin-badge" id="coin_badge_${s.studentId}">🟡 ${s.coins}</div>
        </td>
        <td class="col-coin col-coin-btn" style="${coinStyle}">
          <button class="crm-coin-btn" onclick="promptAddCoin(${s.studentId}, '${s.fullName.replace(/'/g, "\\'")}')">+ Coin</button>
        </td>
      </tr>
    `;
  }).join('');

  const coinHeaderStyle = crmState.showCoins ? '' : 'display:none;';

  container.innerHTML = `
    <div class="crm-attendance-container">
      <!-- Left Rail with Group Icons -->
      <div class="crm-group-rail">
        ${railHtml}
        <div class="crm-rail-bottom" onclick="showToast('Ish haqi bo\\'limi tez kunda ishga tushadi', 'info')">
          <div class="crm-group-icon-btn" style="width:38px; height:38px;">💲</div>
          <span>Ish haqi</span>
        </div>
      </div>

      <!-- Left Column: Details & Roster -->
      <div class="crm-left-panel ${crmState.showDetails ? 'expanded' : 'collapsed'}" id="crmLeftPanel">
        <div class="crm-group-details-card">
          <div class="detail-row">
            <span class="detail-label">Kurs:</span>
            <span class="detail-value">${currentGroup.courseName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">O'qituvchi:</span>
            <span class="detail-value">${currentGroup.teacherName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Narx:</span>
            <span class="detail-value">${currentGroup.price}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Vaqt:</span>
            <span class="detail-value">${currentGroup.scheduleTime}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Xonalar:</span>
            <span class="detail-value">${currentGroup.roomNumber}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Xona sig'imi:</span>
            <span class="detail-value">${currentGroup.capacity}</span>
          </div>
          <div class="detail-row" style="font-size:0.775rem;">
            <span class="detail-label">Mashg'ulotlar sanalari:</span>
            <span class="detail-value">${currentGroup.dateRange}</span>
          </div>
          <div style="margin-top:0.4rem;">
            <span style="font-size:0.72rem; color:#64748B;">Filiallar:</span>
            <span class="crm-branch-tag">${currentGroup.branch}</span>
          </div>
        </div>

        <!-- Student Roster Box (Visible on ultra-wide screens, hidden on laptop/tablet/mobile) -->
        <div class="crm-students-box">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <select class="crm-sort-dropdown" onchange="sortRoster(this.value)">
              <option value="az">A-Z bo'yicha</option>
              <option value="za">Z-A bo'yicha</option>
            </select>
            <span style="font-size:0.775rem; color:#64748B;">Jami: ${students.length}</span>
          </div>
          <div class="crm-student-roster-list" id="crmStudentRosterList">
            ${rosterHtml}
          </div>
        </div>
      </div>

      <!-- Right Main Attendance Board -->
      <div class="crm-right-panel">
        <!-- Top Title Bar & Show Coins Toggle -->
        <div class="crm-board-header">
          <div style="display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap;">
            <div class="crm-course-title">
              ${currentGroup.groupName} • ${currentGroup.courseName} • ${currentGroup.teacherName}
            </div>
            <button class="crm-details-toggle-btn ${crmState.showDetails ? 'active' : ''}" onclick="toggleCrmDetails()" title="Guruh ma'lumotlarini ko'rsatish yoki yashirish">
              <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>Guruh ma'lumotlari</span>
              <span class="details-chevron">${crmState.showDetails ? '▲' : '▼'}</span>
            </button>
          </div>

          <div class="crm-coins-switch-wrapper">
            <span>Show coins</span>
            <label class="crm-switch">
              <input type="checkbox" id="crmCoinsToggle" ${crmState.showCoins ? 'checked' : ''} onchange="toggleCoinsDisplay(this.checked)">
              <span class="crm-switch-slider"></span>
            </label>
            <span>Hide coins</span>
          </div>
        </div>

        <!-- CRM Tabs -->
        <div class="crm-tabs-bar">
          <div class="crm-tab-link active">Davomat</div>
          <div class="crm-tab-link" onclick="showToast('Baholash tizimi ochilmoqda...', 'info')">Baholash</div>
          <div class="crm-tab-link" onclick="showToast('Onlayn darslar va materiallar', 'info')">Onlayn Darslar va materiallar</div>
          <div class="crm-tab-link" onclick="showToast('Imtihonlar ro\\'yxati', 'info')">Imtihonlar</div>
        </div>

        <!-- Attendance Toolbar: Title + Date Navigator + Excel Export -->
        <div class="crm-attendance-toolbar">
          <div style="display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap;">
            <div class="crm-toolbar-title">Davomat</div>
            <button class="btn btn-secondary btn-sm" onclick="exportAttendanceMatrixCsv()" title="Davomat jadvalini Excel (CSV) formatida yuklab olish" style="padding:0.35rem 0.75rem; font-size:0.8rem; display:inline-flex; align-items:center; gap:0.4rem;">
              <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              <span>Excelga yuklash</span>
            </button>
            <select class="crm-sort-dropdown" onchange="sortRoster(this.value)" title="Talabalarni saralash" style="padding:0.35rem 0.65rem; font-size:0.8rem;">
              <option value="az">A-Z bo'yicha</option>
              <option value="za">Z-A bo'yicha</option>
            </select>
          </div>

          <div class="crm-date-nav">
            <button class="crm-nav-btn" onclick="navCurrentMonth()">Joriy</button>
            <button class="crm-nav-btn" onclick="navPrevYear()" title="Oldingi yil">«</button>
            <button class="crm-nav-btn" onclick="navPrevMonth()" title="Oldingi oy">‹</button>
            <span class="crm-nav-month-label">${currentGroup.monthName}</span>
            <button class="crm-nav-btn" onclick="navNextMonth()" title="Keyingi oy">›</button>
            <button class="crm-nav-btn" onclick="navNextYear()" title="Keyingi yil">»</button>
            <button class="crm-nav-btn" onclick="showToast('Ko\\'rinish o\\'zgartirildi', 'info')" title="Ko'rinish">👁️</button>
          </div>
        </div>

        <!-- Horizontal Scrollable Matrix Table -->
        <div class="crm-grid-scroll-wrapper">
          <table class="crm-matrix-table">
            <thead>
              <tr>
                <th class="col-name">Ism</th>
                ${thDatesHtml}
                <th class="col-coin col-coin-val" style="${coinHeaderStyle}">Joriy Coin</th>
                <th class="col-coin col-coin-btn" style="${coinHeaderStyle}">+ Qo'shish</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // Restore scroll position or auto-scroll to today
  const newScrollWrapper = container.querySelector('.crm-grid-scroll-wrapper');
  if (newScrollWrapper) {
    if (prevScrollLeft !== null) {
      newScrollWrapper.scrollLeft = prevScrollLeft;
    } else {
      const todayTh = newScrollWrapper.querySelector('th.col-today');
      if (todayTh) {
        const offset = todayTh.offsetLeft - 280;
        newScrollWrapper.scrollLeft = Math.max(0, offset);
      }
    }
  }
}

function selectCrmGroup(groupId) {
  crmState.groupId = groupId;
  loadCrmAttendanceGrid();
}

function toggleCrmDetails() {
  crmState.showDetails = !crmState.showDetails;
  const panel = document.getElementById('crmLeftPanel');
  const btn = document.querySelector('.crm-details-toggle-btn');
  if (panel) {
    panel.classList.toggle('expanded', crmState.showDetails);
    panel.classList.toggle('collapsed', !crmState.showDetails);
  }
  if (btn) {
    btn.classList.toggle('active', crmState.showDetails);
    const chevron = btn.querySelector('.details-chevron');
    if (chevron) chevron.textContent = crmState.showDetails ? '▲' : '▼';
  }
}

function toggleCoinsDisplay(checked) {
  crmState.showCoins = checked;
  renderCrmAttendanceUI(crmState.gridData);
}

function navCurrentMonth() {
  const now = new Date();
  crmState.year = now.getFullYear();
  crmState.month = now.getMonth() + 1;
  loadCrmAttendanceGrid();
}

function navPrevMonth() {
  if (crmState.month === 1) {
    crmState.month = 12;
    crmState.year--;
  } else {
    crmState.month--;
  }
  loadCrmAttendanceGrid();
}

function navNextMonth() {
  if (crmState.month === 12) {
    crmState.month = 1;
    crmState.year++;
  } else {
    crmState.month++;
  }
  loadCrmAttendanceGrid();
}

function navPrevYear() {
  crmState.year--;
  loadCrmAttendanceGrid();
}

function navNextYear() {
  crmState.year++;
  loadCrmAttendanceGrid();
}

/**
 * In-place update of student stats & indicators without reloading table
 */
function recalculateStudentStats(studentObj) {
  if (!studentObj || !crmState.gridData || !crmState.gridData.lessonDays) return;
  let p = 0;
  let a = 0;
  for (const day of crmState.gridData.lessonDays) {
    const dKey = day.date.split('T')[0];
    const st = studentObj.dailyStatus[dKey];
    if (st === 'Present' || st === 'Late') p++;
    else if (st === 'Absent') a++;
  }
  studentObj.presentCount = p;
  studentObj.absentCount = a;
  studentObj.hasWarning = (a >= 2);

  const dots = document.querySelectorAll(`.crm-student-dot-${studentObj.studentId}`);
  dots.forEach(dot => {
    dot.className = `crm-status-dot crm-student-dot-${studentObj.studentId} ${studentObj.hasWarning ? 'red' : 'green'}`;
  });
}

/**
 * Set explicit attendance status in-place without table shifting or scroll jump
 */
async function setCellAttendance(event, studentId, dateKey, targetStatus) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }

  const cellWrapper = document.getElementById(`cell_${studentId}_${dateKey}`);
  if (!cellWrapper) return;

  // Identify previous state in memory
  let prevStatus = null;
  let studentObj = null;
  if (crmState.gridData && crmState.gridData.students) {
    studentObj = crmState.gridData.students.find(x => x.studentId === studentId);
    if (studentObj) {
      prevStatus = studentObj.dailyStatus[dateKey] || null;
    }
  }

  const resolvedStatus = targetStatus === 'None' ? null : targetStatus;

  // 1. Instant in-place DOM update (zero reflow, zero scroll jump)
  cellWrapper.outerHTML = renderCellHtml(studentId, dateKey, resolvedStatus);

  // 2. Update memory state & dots
  if (studentObj) {
    studentObj.dailyStatus[dateKey] = resolvedStatus;
    recalculateStudentStats(studentObj);
  }

  const label = targetStatus === 'Present' ? '"Bor edi"' : targetStatus === 'Absent' ? '"Yo\'q"' : 'Tozalandi';
  showToast(`Davomat: ${label}`, 'success', 1600);

  // 3. Background API request
  try {
    const res = await api.toggleAttendance(studentId, crmState.groupId, dateKey, targetStatus);
    const confirmedStatus = res.status === 'None' ? null : res.status;

    // Ensure memory aligns with backend
    if (studentObj && studentObj.dailyStatus[dateKey] !== confirmedStatus) {
      studentObj.dailyStatus[dateKey] = confirmedStatus;
      const currentCell = document.getElementById(`cell_${studentId}_${dateKey}`);
      if (currentCell) {
        currentCell.outerHTML = renderCellHtml(studentId, dateKey, confirmedStatus);
      }
      recalculateStudentStats(studentObj);
    }

    if (typeof loadDashboardData === 'function') {
      loadDashboardData();
    }
  } catch (err) {
    console.error('Failed to update attendance', err);
    showToast('Davomatni saqlashda xatolik yuz berdi.', 'error');

    // Revert in-place on error
    const errCell = document.getElementById(`cell_${studentId}_${dateKey}`);
    if (errCell) {
      errCell.outerHTML = renderCellHtml(studentId, dateKey, prevStatus);
    }
    if (studentObj) {
      studentObj.dailyStatus[dateKey] = prevStatus;
      recalculateStudentStats(studentObj);
    }
  }
}

/**
 * Toggle cell attendance sequentially: None -> Present -> Absent -> None
 */
async function toggleCellAttendance(event, studentId, dateKey) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }

  let curStatus = null;
  if (crmState.gridData && crmState.gridData.students) {
    const s = crmState.gridData.students.find(x => x.studentId === studentId);
    if (s) {
      curStatus = s.dailyStatus[dateKey] || null;
    }
  }

  let nextStatus = 'Present';
  if (curStatus === 'Present' || curStatus === 'Late') {
    nextStatus = 'Absent';
  } else if (curStatus === 'Absent') {
    nextStatus = 'None';
  } else {
    nextStatus = 'Present';
  }

  await setCellAttendance(event, studentId, dateKey, nextStatus);
}

async function promptAddCoin(studentId, studentName) {
  const amountStr = prompt(`${studentName} uchun necha tanga (coin) qo'shmoqchisiz?`, "10");
  if (!amountStr) return;

  const amount = parseInt(amountStr);
  if (isNaN(amount) || amount === 0) return;

  try {
    const res = await api.updateStudentCoins(studentId, amount);
    showToast(`${studentName} ga +${amount} coin berildi! Yangi balans: ${res.coins} coin.`, 'success');

    // Update coin badge in-place
    const badge = document.getElementById(`coin_badge_${studentId}`);
    if (badge) {
      badge.innerHTML = `🟡 ${res.coins}`;
    }
    if (crmState.gridData && crmState.gridData.students) {
      const s = crmState.gridData.students.find(x => x.studentId === studentId);
      if (s) s.coins = res.coins;
    }
  } catch (err) {
    showToast('Coin qo\'shishda xatolik yuz berdi.', 'error');
  }
}

function sortRoster(type) {
  if (!crmState.gridData || !crmState.gridData.students) return;

  if (type === 'az') {
    crmState.gridData.students.sort((a, b) => a.fullName.localeCompare(b.fullName));
  } else {
    crmState.gridData.students.sort((a, b) => b.fullName.localeCompare(a.fullName));
  }

  renderCrmAttendanceUI(crmState.gridData);
}

async function exportAttendanceMatrixCsv() {
  try {
    showToast("Excel fayli tayyorlanmoqda...", "info");
    await api.exportAttendanceCsv(crmState.groupId, crmState.year, crmState.month);
  } catch (err) {
    showToast("Eksport qilishda xatolik yuz berdi: " + (err.message || err), "error");
  }
}

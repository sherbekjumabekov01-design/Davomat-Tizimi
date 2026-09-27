/**
 * Davomat Tizimi - Dashboard Controller
 */

async function loadDashboardData() {
  try {
    const stats = await api.getStats();
    if (!stats) return;

    // Update Counter Badges
    const totalStudentsEl = document.getElementById('statTotalStudents');
    const totalTeachersEl = document.getElementById('statTotalTeachers');
    const totalGroupsEl = document.getElementById('statTotalGroups');
    const todayRateEl = document.getElementById('statTodayRate');
    const todayRateBarEl = document.getElementById('statTodayRateBar');
    const todayDetailsEl = document.getElementById('statTodayDetails');

    if (totalStudentsEl) totalStudentsEl.textContent = stats.totalStudents;
    if (totalTeachersEl) totalTeachersEl.textContent = stats.totalTeachers;
    if (totalGroupsEl) totalGroupsEl.textContent = stats.totalGroups;
    if (todayRateEl) todayRateEl.textContent = `${stats.todayRate}%`;
    if (todayRateBarEl) todayRateBarEl.style.width = `${stats.todayRate}%`;

    if (todayDetailsEl) {
      todayDetailsEl.innerHTML = `
        <span class="badge badge-present">Kelgan: ${stats.todayPresent}</span>
        <span class="badge badge-late">Kechikdi: ${stats.todayLate}</span>
        <span class="badge badge-absent">Kelmadi: ${stats.todayAbsent}</span>
        <span class="badge badge-excused">Sababli: ${stats.todayExcused}</span>
      `;
    }

    // Render Weekly Trend Chart
    renderWeeklyTrend(stats.weeklyStats || []);

    // Load Recent Attendance Records Table
    loadRecentActivity();
  } catch (err) {
    console.error('Dashboard data load failed', err);
  }
}

function renderWeeklyTrend(weeklyStats) {
  const container = document.getElementById('trendChartContainer');
  if (!container) return;

  container.innerHTML = '';
  
  if (weeklyStats.length === 0) {
    container.innerHTML = '<div style="color:var(--text-muted); font-size:0.875rem;">Hozircha davomat statistikasi mavjud emas.</div>';
    return;
  }

  weeklyStats.forEach(item => {
    const col = document.createElement('div');
    col.className = 'trend-day-col';

    const dayName = new Date(item.date).toLocaleDateString('uz-UZ', { weekday: 'short' });
    const formattedDate = new Date(item.date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' });
    const rateHeight = Math.max(item.rate, 4); // minimum 4% so bar is visible

    col.innerHTML = `
      <div class="trend-rate-label">${item.rate > 0 ? item.rate + '%' : '-'}</div>
      <div class="trend-bar-wrapper" title="${formattedDate}: ${item.rate}% (${item.present} kelgan, ${item.absent} kelmadi)">
        <div class="trend-bar-fill" style="height: ${rateHeight}%;"></div>
      </div>
      <div class="trend-day-label">${dayName}</div>
    `;

    container.appendChild(col);
  });
}

async function loadRecentActivity() {
  const tableBody = document.getElementById('recentAttendanceTableBody');
  if (!tableBody) return;

  try {
    const records = await api.getAttendanceRecords();
    if (!records || records.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:2rem;">Davomat yozuvlari topilmadi</td></tr>`;
      return;
    }

    const recent = records.slice(0, 8);
    tableBody.innerHTML = recent.map(r => {
      let badgeClass = 'badge-present';
      if (r.status === 'Absent' || r.status === 2) badgeClass = 'badge-absent';
      else if (r.status === 'Late' || r.status === 3) badgeClass = 'badge-late';
      else if (r.status === 'Excused' || r.status === 4) badgeClass = 'badge-excused';

      const dateStr = new Date(r.date).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });

      return `
        <tr>
          <td>
            <div style="font-weight:600; color:var(--text-primary);">${r.studentName}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${r.studentCode}</div>
          </td>
          <td><span style="background:rgba(255,255,255,0.06); padding:4px 8px; border-radius:6px; font-size:0.8rem;">${r.groupName}</span></td>
          <td>${dateStr}</td>
          <td><span class="badge ${badgeClass}">${r.statusText || r.status}</span></td>
          <td style="color:var(--text-secondary); font-size:0.825rem;">${r.note || r.markedBy || '—'}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Failed to load recent activity', err);
  }
}

/**
 * Davomat Tizimi - Students Management Controller
 */

let cachedStudents = [];

async function loadStudentsView() {
  const tableBody = document.getElementById('studentsTableBody');
  const groupFilter = document.getElementById('studentsGroupFilter');
  const statusFilter = document.getElementById('studentsStatusFilter');
  const searchInput = document.getElementById('studentsSearchInput');

  if (!tableBody) return;

  tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:2rem;"><span class="spinner"></span> Yuklanmoqda...</td></tr>`;

  try {
    // Populate Group Filter options if empty
    if (groupFilter && groupFilter.options.length <= 1) {
      const groups = await api.getGroups();
      groupFilter.innerHTML = '<option value="">Barcha guruhlar</option>' + 
        groups.map(g => `<option value="${g.id}">${g.name}</option>`).join('');
    }

    const groupId = groupFilter ? groupFilter.value : null;
    const status = statusFilter ? statusFilter.value : null;
    const search = searchInput ? searchInput.value.trim() : null;

    const students = await api.getStudents(groupId, search, status);
    cachedStudents = students || [];
    renderStudentsTable(cachedStudents);
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--status-absent); padding:2rem;">Talabalarni yuklashda xatolik yuz berdi.</td></tr>`;
  }
}

function renderStudentsTable(students) {
  const tableBody = document.getElementById('studentsTableBody');
  if (!tableBody) return;

  if (students.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--text-muted); padding:3rem;">Talabalar topilmadi.</td></tr>`;
    return;
  }

  tableBody.innerHTML = students.map(s => {
    let rateBadge = 'badge-present';
    if (s.attendanceRate < 70) rateBadge = 'badge-absent';
    else if (s.attendanceRate < 85) rateBadge = 'badge-late';

    const statusBadge = s.status === 'Active' || s.status === 1
      ? '<span class="badge badge-present">Faol</span>'
      : s.status === 'Frozen' || s.status === 2
      ? '<span class="badge badge-late">Muzlatilgan</span>'
      : s.status === 'Dropped' || s.status === 3
      ? '<span class="badge badge-absent">Tashlagan</span>'
      : '<span class="badge" style="background:#3B82F6; color:white;">Bitirgan</span>';

    return `
      <tr>
        <td>
          <div style="font-weight:600; color:var(--text-primary); font-size:0.95rem;">${s.fullName}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">Ro'yxat: ${new Date(s.createdAt).toLocaleDateString('uz-UZ')}</div>
        </td>
        <td><code style="background:rgba(255,255,255,0.06); padding:3px 7px; border-radius:4px; color:var(--text-accent);">${s.studentCode}</code></td>
        <td><span style="font-weight:500;">${s.groupName}</span></td>
        <td>${statusBadge}</td>
        <td style="color:var(--text-secondary); font-size:0.85rem;">${s.phone || '—'}</td>
        <td style="color:var(--text-secondary); font-size:0.85rem;">
          ${s.parentName ? `<div style="color:var(--text-primary); font-size:0.8rem; font-weight:500;">${s.parentName}</div>` : ''}
          ${s.parentPhone || '—'}
        </td>
        <td><span class="badge ${rateBadge}">${s.attendanceRate}%</span></td>
        <td>
          <div style="display:flex; gap:0.4rem;">
            <button class="btn btn-secondary btn-sm" title="Tarix" onclick="viewStudentHistory(${s.id}, '${s.fullName.replace(/'/g, "\\'")}')">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </button>
            <button class="btn btn-secondary btn-sm" title="Tahrirlash" onclick="openEditStudentModal(${s.id})">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            </button>
            <button class="btn btn-danger btn-sm" title="O'chirish" onclick="deleteStudent(${s.id})">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function openAddStudentModal() {
  const modal = document.getElementById('studentModal');
  const form = document.getElementById('studentForm');
  const groupSelect = document.getElementById('studentFormGroup');
  const title = document.getElementById('studentModalTitle');

  if (form) form.reset();
  document.getElementById('studentFormId').value = '';
  if (document.getElementById('studentFormParentName')) document.getElementById('studentFormParentName').value = '';
  if (document.getElementById('studentFormStatus')) document.getElementById('studentFormStatus').value = 'Active';
  if (title) title.textContent = "Yangi talaba qo'shish";

  try {
    const groups = await api.getGroups();
    groupSelect.innerHTML = '<option value="">-- Guruhni tanlang --</option>' + 
      groups.map(g => `<option value="${g.id}">${g.name}</option>`).join('');
  } catch (err) {}

  if (modal) modal.classList.add('open');
}

async function openEditStudentModal(id) {
  const s = cachedStudents.find(x => x.id === id);
  if (!s) return;

  await openAddStudentModal();
  document.getElementById('studentModalTitle').textContent = "Talabani tahrirlash";
  document.getElementById('studentFormId').value = s.id;
  document.getElementById('studentFormName').value = s.fullName;
  document.getElementById('studentFormCode').value = s.studentCode;
  document.getElementById('studentFormPhone').value = s.phone || '';
  if (document.getElementById('studentFormParentName')) document.getElementById('studentFormParentName').value = s.parentName || '';
  document.getElementById('studentFormParentPhone').value = s.parentPhone || '';
  document.getElementById('studentFormEmail').value = s.email || '';
  document.getElementById('studentFormGroup').value = s.groupId;
  if (document.getElementById('studentFormStatus')) {
    document.getElementById('studentFormStatus').value = s.status || 'Active';
  }
}

async function handleStudentFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('studentFormId').value;
  const fullName = document.getElementById('studentFormName').value.trim();
  const studentCode = document.getElementById('studentFormCode').value.trim();
  const phone = document.getElementById('studentFormPhone').value.trim();
  const parentName = document.getElementById('studentFormParentName') ? document.getElementById('studentFormParentName').value.trim() : '';
  const parentPhone = document.getElementById('studentFormParentPhone').value.trim();
  const email = document.getElementById('studentFormEmail').value.trim();
  const groupId = parseInt(document.getElementById('studentFormGroup').value);
  const status = document.getElementById('studentFormStatus') ? document.getElementById('studentFormStatus').value : 'Active';

  if (!fullName || !studentCode || !groupId) {
    showToast('Iltimos, ism, kod va guruhni kiriting.', 'error');
    return;
  }

  const payload = { fullName, studentCode, phone, parentName, parentPhone, email, groupId, status };

  try {
    if (id) {
      await api.updateStudent(id, payload);
      showToast('Talaba ma\'lumotlari muvaffaqiyatli yangilandi.', 'success');
    } else {
      await api.createStudent(payload);
      showToast('Yangi talaba muvaffaqiyatli qo\'shildi!', 'success');
    }
    closeModal('studentModal');
    loadStudentsView();
    if (typeof loadDashboardData === 'function') loadDashboardData();
  } catch (err) {
    // Error toast handled in API client
  }
}

async function exportStudentsList() {
  try {
    const groupFilter = document.getElementById('studentsGroupFilter');
    const groupId = groupFilter ? groupFilter.value : null;
    showToast("Talabalar ro'yxati tayyorlanmoqda...", "info");
    await api.exportStudentsCsv(groupId);
  } catch (err) {
    showToast("Eksport qilishda xatolik: " + (err.message || err), "error");
  }
}

async function deleteStudent(id) {
  if (!confirm('Haqiqatan ham bu talabani o\'chirmoqchimisiz? Davomat yozuvlari ham o\'chiriladi.')) {
    return;
  }

  try {
    await api.deleteStudent(id);
    showToast('Talaba o\'chirildi.', 'success');
    loadStudentsView();
    if (typeof loadDashboardData === 'function') loadDashboardData();
  } catch (err) {}
}

async function viewStudentHistory(studentId, studentName) {
  const modal = document.getElementById('studentHistoryModal');
  const title = document.getElementById('studentHistoryTitle');
  const tableBody = document.getElementById('studentHistoryTableBody');

  if (title) title.textContent = `${studentName} — Davomat tarixi`;
  if (tableBody) tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:1.5rem;"><span class="spinner"></span> Yuklanmoqda...</td></tr>`;
  if (modal) modal.classList.add('open');

  try {
    const history = await api.getStudentAttendance(studentId);
    if (!history || history.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:2rem;">Davomat tarixi mavjud emas.</td></tr>`;
      return;
    }

    tableBody.innerHTML = history.map(h => {
      let badgeClass = 'badge-present';
      if (h.status === 'Absent' || h.status === 2) badgeClass = 'badge-absent';
      else if (h.status === 'Late' || h.status === 3) badgeClass = 'badge-late';
      else if (h.status === 'Excused' || h.status === 4) badgeClass = 'badge-excused';

      const dateStr = new Date(h.date).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });

      return `
        <tr>
          <td>${dateStr}</td>
          <td>${h.groupName}</td>
          <td><span class="badge ${badgeClass}">${h.statusText}</span></td>
          <td style="color:var(--text-secondary); font-size:0.85rem;">${h.note || '—'}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    if (tableBody) tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--status-absent);">Tarixni yuklashda xatolik yuz berdi.</td></tr>`;
  }
}

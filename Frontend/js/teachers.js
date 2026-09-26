/**
 * Davomat Tizimi - Teachers Management Controller
 */

let cachedTeachers = [];

async function loadTeachersView() {
  const tableBody = document.getElementById('teachersTableBody');
  const searchInput = document.getElementById('teachersSearchInput');

  if (!tableBody) return;
  tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem;"><span class="spinner"></span> Yuklanmoqda...</td></tr>`;

  try {
    const search = searchInput ? searchInput.value.trim() : null;
    const teachers = await api.getTeachers(search);
    cachedTeachers = teachers || [];
    renderTeachersTable(cachedTeachers);
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--status-absent); padding:2rem;">O'qituvchilarni yuklashda xatolik yuz berdi.</td></tr>`;
  }
}

function renderTeachersTable(teachers) {
  const tableBody = document.getElementById('teachersTableBody');
  if (!tableBody) return;

  if (teachers.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:3rem;">O'qituvchilar topilmadi.</td></tr>`;
    return;
  }

  tableBody.innerHTML = teachers.map(t => {
    const groupBadges = t.groupNames && t.groupNames.length > 0
      ? t.groupNames.map(g => `<span style="background:rgba(99,102,241,0.15); color:var(--text-accent); padding:2px 8px; border-radius:4px; font-size:0.75rem; margin-right:4px;">${g}</span>`).join('')
      : '<span style="color:var(--text-muted); font-size:0.8rem;">Guruh biriktirilmagan</span>';

    return `
      <tr>
        <td>
          <div style="font-weight:600; color:var(--text-primary); font-size:0.95rem;">${t.fullName}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${t.email}</div>
        </td>
        <td><span style="font-weight:500; color:var(--primary-light);">${t.subject}</span></td>
        <td style="color:var(--text-secondary); font-size:0.875rem;">${t.phone || '—'}</td>
        <td>${groupBadges}</td>
        <td>
          <div style="display:flex; gap:0.4rem;">
            <button class="btn btn-secondary btn-sm" title="Tahrirlash" onclick="openEditTeacherModal(${t.id})">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            </button>
            <button class="btn btn-danger btn-sm" title="O'chirish" onclick="deleteTeacher(${t.id})">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function openAddTeacherModal() {
  const modal = document.getElementById('teacherModal');
  const form = document.getElementById('teacherForm');
  const groupsContainer = document.getElementById('teacherGroupsCheckboxList');
  const title = document.getElementById('teacherModalTitle');

  if (form) form.reset();
  document.getElementById('teacherFormId').value = '';
  if (title) title.textContent = "Yangi o'qituvchi qo'shish";

  try {
    const groups = await api.getGroups();
    if (groupsContainer) {
      groupsContainer.innerHTML = groups.map(g => `
        <label style="display:flex; align-items:center; gap:0.5rem; font-size:0.85rem; color:var(--text-secondary); cursor:pointer;">
          <input type="checkbox" name="teacherGroupCheckbox" value="${g.id}">
          ${g.name}
        </label>
      `).join('');
    }
  } catch (err) {}

  if (modal) modal.classList.add('open');
}

async function openEditTeacherModal(id) {
  const t = cachedTeachers.find(x => x.id === id);
  if (!t) return;

  await openAddTeacherModal();
  document.getElementById('teacherModalTitle').textContent = "O'qituvchini tahrirlash";
  document.getElementById('teacherFormId').value = t.id;
  document.getElementById('teacherFormName').value = t.fullName;
  document.getElementById('teacherFormEmail').value = t.email;
  document.getElementById('teacherFormPhone').value = t.phone;
  document.getElementById('teacherFormSubject').value = t.subject;

  if (t.groupIds && t.groupIds.length > 0) {
    document.querySelectorAll('input[name="teacherGroupCheckbox"]').forEach(cb => {
      if (t.groupIds.includes(parseInt(cb.value))) {
        cb.checked = true;
      }
    });
  }
}

async function handleTeacherFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('teacherFormId').value;
  const fullName = document.getElementById('teacherFormName').value.trim();
  const email = document.getElementById('teacherFormEmail').value.trim();
  const phone = document.getElementById('teacherFormPhone').value.trim();
  const subject = document.getElementById('teacherFormSubject').value.trim();

  const selectedGroupIds = [];
  document.querySelectorAll('input[name="teacherGroupCheckbox"]:checked').forEach(cb => {
    selectedGroupIds.push(parseInt(cb.value));
  });

  if (!fullName || !subject) {
    showToast('Iltimos, ism va fanni kiriting.', 'error');
    return;
  }

  const payload = { fullName, email, phone, subject, groupIds: selectedGroupIds };

  try {
    if (id) {
      await api.updateTeacher(id, payload);
      showToast('O\'qituvchi muvaffaqiyatli yangilandi.', 'success');
    } else {
      await api.createTeacher(payload);
      showToast('Yangi o\'qituvchi muvaffaqiyatli qo\'shildi!', 'success');
    }
    closeModal('teacherModal');
    loadTeachersView();
    if (typeof loadDashboardData === 'function') loadDashboardData();
  } catch (err) {}
}

async function deleteTeacher(id) {
  if (!confirm('Haqiqatan ham bu o\'qituvchini o\'chirmoqchimisiz?')) return;

  try {
    await api.deleteTeacher(id);
    showToast('O\'qituvchi muvaffaqiyatli o\'chirildi.', 'success');
    loadTeachersView();
    if (typeof loadDashboardData === 'function') loadDashboardData();
  } catch (err) {}
}

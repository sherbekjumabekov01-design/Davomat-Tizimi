/**
 * Davomat Tizimi - Groups Management Controller
 */

let cachedGroups = [];

async function loadGroupsView() {
  const container = document.getElementById('groupsGridContainer');
  if (!container) return;

  container.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding:2rem; grid-column:1/-1;"><span class="spinner"></span> Yuklanmoqda...</div>';

  try {
    const groups = await api.getGroups();
    cachedGroups = groups || [];
    renderGroupsGrid(cachedGroups);
  } catch (err) {
    container.innerHTML = '<div style="color:var(--status-absent); text-align:center; padding:2rem; grid-column:1/-1;">Guruhlarni yuklashda xatolik yuz berdi.</div>';
  }
}

function renderGroupsGrid(groups) {
  const container = document.getElementById('groupsGridContainer');
  if (!container) return;

  if (groups.length === 0) {
    container.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding:3rem; grid-column:1/-1;">Guruhlar topilmadi. Yangi guruh qo\'shing.</div>';
    return;
  }

  container.innerHTML = groups.map(g => {
    const daysLabel = g.lessonDaysType === 'Even' ? 'Juft kunlar' : g.lessonDaysType === 'Daily' ? 'Har kuni' : 'Toq kunlar';
    return `
      <div class="stat-card" style="gap:1rem;">
        <div class="stat-header">
          <div>
            <span style="font-size:0.75rem; color:var(--text-accent); font-weight:700; text-transform:uppercase;">${g.courseYear}-bosqich</span>
            <h3 style="font-size:1.35rem; font-weight:800; color:#FFFFFF; margin-top:0.25rem;">${g.name}</h3>
          </div>
          <div class="stat-icon purple">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          </div>
        </div>

        <div style="font-size:0.875rem; color:var(--text-secondary); min-height:36px;">
          ${g.description || 'Izoh berilmagan'}
        </div>

        <div style="background:rgba(255,255,255,0.03); border-radius:8px; padding:0.6rem 0.8rem; font-size:0.825rem; display:flex; flex-direction:column; gap:0.35rem;">
          <div style="display:flex; justify-content:space-between;">
            <span style="color:var(--text-muted);">O'qituvchi:</span>
            <strong style="color:var(--text-primary);">${g.teacherName || 'Tayinlanmagan'}</strong>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:var(--text-muted);">Kunlar:</span>
            <span class="badge badge-primary" style="font-size:0.72rem;">${daysLabel}</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:var(--text-muted);">Vaqt / Xona:</span>
            <span>${g.scheduleTime || '14:00'} • ${g.roomNumber || '—'}</span>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-subtle); padding-top:0.85rem; font-size:0.825rem; color:var(--text-muted);">
          <div>Sig'im: <strong style="color:var(--text-primary);">${g.capacity || 20} kishi</strong></div>
          <div>Talabalar: <strong style="color:var(--primary-light); font-size:1rem;">${g.studentsCount}</strong></div>
        </div>

        <div style="display:flex; gap:0.5rem; margin-top:0.25rem;">
          <button class="btn btn-primary btn-sm" style="flex:1;" onclick="openAttendanceForGroup(${g.id})">
            Davomat olish
          </button>
          <button class="btn btn-secondary btn-sm" title="Tahrirlash" onclick="openEditGroupModal(${g.id})">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          </button>
          <button class="btn btn-danger btn-sm" title="O'chirish" onclick="deleteGroup(${g.id})">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function openAttendanceForGroup(groupId) {
  switchView('attendance');
  if (typeof selectCrmGroup === 'function') {
    selectCrmGroup(groupId);
  }
}

async function openAddGroupModal() {
  const modal = document.getElementById('groupModal');
  const form = document.getElementById('groupForm');
  const title = document.getElementById('groupModalTitle');
  const teacherSelect = document.getElementById('groupFormTeacherId');

  if (form) form.reset();
  document.getElementById('groupFormId').value = '';
  if (title) title.textContent = "Yangi guruh qo'shish";

  try {
    if (teacherSelect) {
      const teachers = await api.getTeachers();
      teacherSelect.innerHTML = '<option value="">-- O\'qituvchini tanlang --</option>' +
        (teachers || []).map(t => `<option value="${t.id}">${t.fullName} (${t.subject || 'O\'qituvchi'})</option>`).join('');
    }
  } catch (err) {}

  if (modal) modal.classList.add('open');
}

async function openEditGroupModal(id) {
  const g = cachedGroups.find(x => x.id === id);
  if (!g) return;

  await openAddGroupModal();
  document.getElementById('groupModalTitle').textContent = "Guruhni tahrirlash";
  document.getElementById('groupFormId').value = g.id;
  document.getElementById('groupFormName').value = g.name || '';
  document.getElementById('groupFormDescription').value = g.description || '';
  document.getElementById('groupFormCourseYear').value = g.courseYear || 1;
  document.getElementById('groupFormRoom').value = g.roomNumber || '';
  if (document.getElementById('groupFormTeacherId')) document.getElementById('groupFormTeacherId').value = g.teacherId || '';
  if (document.getElementById('groupFormLessonDaysType')) document.getElementById('groupFormLessonDaysType').value = g.lessonDaysType || 'Odd';
  if (document.getElementById('groupFormScheduleTime')) document.getElementById('groupFormScheduleTime').value = g.scheduleTime || 'Toq kunlar • 14:00';
  if (document.getElementById('groupFormPrice')) document.getElementById('groupFormPrice').value = g.price || '695 000 UZS';
  if (document.getElementById('groupFormCapacity')) document.getElementById('groupFormCapacity').value = g.capacity || 20;
}

async function handleGroupFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('groupFormId').value;
  const name = document.getElementById('groupFormName').value.trim();
  const description = document.getElementById('groupFormDescription').value.trim();
  const courseYear = parseInt(document.getElementById('groupFormCourseYear').value) || 1;
  const roomNumber = document.getElementById('groupFormRoom').value.trim();

  const teacherIdVal = document.getElementById('groupFormTeacherId') ? document.getElementById('groupFormTeacherId').value : null;
  const teacherId = teacherIdVal ? parseInt(teacherIdVal) : null;
  const lessonDaysType = document.getElementById('groupFormLessonDaysType') ? document.getElementById('groupFormLessonDaysType').value : 'Odd';
  const scheduleTime = document.getElementById('groupFormScheduleTime') ? document.getElementById('groupFormScheduleTime').value.trim() : 'Toq kunlar • 14:00';
  const price = document.getElementById('groupFormPrice') ? document.getElementById('groupFormPrice').value.trim() : '695 000 UZS';
  const capacity = parseInt(document.getElementById('groupFormCapacity') ? document.getElementById('groupFormCapacity').value : '20') || 20;

  if (!name) {
    showToast('Iltimos, guruh nomini kiriting.', 'error');
    return;
  }

  const payload = { name, description, courseYear, roomNumber, teacherId, lessonDaysType, scheduleTime, price, capacity };

  try {
    if (id) {
      await api.updateGroup(id, payload);
      showToast('Guruh muvaffaqiyatli yangilandi.', 'success');
    } else {
      await api.createGroup(payload);
      showToast('Yangi guruh muvaffaqiyatli yaratildi!', 'success');
    }
    closeModal('groupModal');
    loadGroupsView();
    if (typeof loadDashboardData === 'function') loadDashboardData();
  } catch (err) {}
}

async function deleteGroup(id) {
  if (!confirm('Guruhni o\'chirmoqchimisiz? Agar guruhda talabalar bo\'lsa uni o\'chirib bo\'lmaydi.')) return;

  try {
    await api.deleteGroup(id);
    showToast('Guruh o\'chirildi.', 'success');
    loadGroupsView();
    if (typeof loadDashboardData === 'function') loadDashboardData();
  } catch (err) {}
}

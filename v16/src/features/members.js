import { escapeHtml } from '../utils/index.js';
import { labelFor, t } from '../utils/i18n.js';

function clean(value) {
  return String(value || '').trim();
}

export function createMemberFromForm(form) {
  return {
    id: Date.now(),
    name: clean(form.get('name')) || 'New member',
    role: clean(form.get('role')),
    group: clean(form.get('group')),
    status: clean(form.get('status')) || 'Active',
  };
}

export function addMember(state, member) {
  state.data.members.unshift(member);
  state.dirtyFlags.members = true;
}

export function updateMember(state, id, member) {
  const index = state.data.members.findIndex(row => Number(row.id) === Number(id));
  if (index < 0) return false;
  state.data.members[index] = {
    ...state.data.members[index],
    ...member,
    id: state.data.members[index].id,
  };
  state.dirtyFlags.members = true;
  return true;
}

export function deleteMember(state, id) {
  const before = state.data.members.length;
  state.data.members = state.data.members.filter(member => Number(member.id) !== Number(id));
  state.dirtyFlags.members = before !== state.data.members.length;
  return state.dirtyFlags.members;
}

export function normalizeMemberFilters(filters = {}) {
  return {
    search: clean(filters.search).toLowerCase(),
    role: clean(filters.role),
    group: clean(filters.group),
    sort: clean(filters.sort) || 'name',
  };
}

function filterMembers(members = [], filters = {}) {
  return members.filter((member) => {
    const haystack = `${member.name || ''} ${member.role || ''} ${member.group || ''} ${member.status || ''}`.toLowerCase();
    if (filters.search && !haystack.includes(filters.search)) return false;
    if (filters.role && member.role !== filters.role) return false;
    if (filters.group && member.group !== filters.group) return false;
    return true;
  });
}

function sortMembers(members = [], tasks = [], sort = 'name') {
  const statusRank = { Active: 0, Standby: 1, Away: 2 };
  const withIndex = members.map((member, index) => ({ member, index }));
  const compareText = (a, b, key) => clean(a.member[key]).localeCompare(clean(b.member[key]), 'en');
  const sorted = withIndex.sort((a, b) => {
    let result = 0;
    if (sort === 'role') result = compareText(a, b, 'role') || compareText(a, b, 'name');
    else if (sort === 'group') result = compareText(a, b, 'group') || compareText(a, b, 'name');
    else if (sort === 'status') result = (statusRank[a.member.status] ?? 9) - (statusRank[b.member.status] ?? 9) || compareText(a, b, 'name');
    else if (sort === 'open-tasks') result = memberTaskCount(tasks, b.member.name) - memberTaskCount(tasks, a.member.name) || compareText(a, b, 'name');
    else result = compareText(a, b, 'name');
    return result || a.index - b.index;
  });
  return sorted.map(row => row.member);
}

function unique(values = []) {
  return [...new Set(values.map(clean).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'en'));
}

function memberTaskCount(tasks = [], name = '') {
  return tasks.filter(task => clean(task.owner) === clean(name) && task.status !== 'Done').length;
}

function getMemberOpenTasks(tasks = [], name = '') {
  return tasks.filter(task => clean(task.owner) === clean(name) && task.status !== 'Done');
}

function getActiveMemberFilterChips(filters = {}) {
  return [
    filters.search ? { key: 'search', label: t('search'), value: filters.search } : null,
    filters.role ? { key: 'role', label: t('role'), value: filters.role } : null,
    filters.group ? { key: 'group', label: t('group'), value: filters.group } : null,
  ].filter(Boolean);
}

export function renderMembersPage(state, options = {}) {
  const members = state.data.members || [];
  const tasks = state.data.tasks || [];
  const master = state.data.masterData || {};
  const editingMember = members.find(member => Number(member.id) === Number(options.editingMemberId));
  const roles = unique([...(master.roles || []), ...members.map(member => member.role)]);
  const groups = unique([...(master.groups || []), ...members.map(member => member.group)]);
  const filters = normalizeMemberFilters(options.filters);
  const visible = sortMembers(filterMembers(members, filters), tasks, filters.sort);
  const activeFilterChips = getActiveMemberFilterChips(filters);
  const roleGroups = roles.map(role => ({
    role,
    members: visible.filter(member => member.role === role),
  })).filter(row => row.members.length);

  return `
    <section id="page-members" class="page active" style="display:grid;gap:12px">
      <div class="page-topbar">
        <div>
          <h1 style="margin:0;color:var(--navy)">${escapeHtml(t('members'))}</h1>
          <div class="page-top-summary">${escapeHtml(t('membersSummary'))}</div>
        </div>
        <div class="page-top-summary">${escapeHtml(t('members'))} ${members.length} | ${escapeHtml(t('visible'))} ${visible.length}/${members.length}</div>
      </div>

      <div class="card">
        <form data-member-form style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px;align-items:end">
          <label>${escapeHtml(t('memberName'))}<input name="name" required value="${escapeHtml(editingMember?.name || '')}" placeholder="${escapeHtml(t('memberName'))}"></label>
          <label>${escapeHtml(t('role'))}<input name="role" list="member-role-list" value="${escapeHtml(editingMember?.role || '')}" placeholder="${escapeHtml(t('role'))}"></label>
          <label>${escapeHtml(t('group'))}<input name="group" list="member-group-list" value="${escapeHtml(editingMember?.group || '')}" placeholder="${escapeHtml(t('group'))}"></label>
          <label>${escapeHtml(t('status'))}<select name="status">${['Active', 'Standby', 'Away'].map(status => `<option value="${status}" ${clean(editingMember?.status) === status ? 'selected' : ''}>${escapeHtml(labelFor(status))}</option>`).join('')}</select></label>
          <button class="btn btn-primary" type="submit">${escapeHtml(editingMember ? t('updateMember') : t('addMember'))}</button>
          ${editingMember ? `<button class="btn" type="button" data-member-cancel-edit>${escapeHtml(t('cancelEdit'))}</button>` : ''}
        </form>
        ${editingMember ? `<div style="font-size:.78rem;color:var(--muted);font-weight:800;margin-top:8px">${escapeHtml(t('editingMember'))}: ${escapeHtml(editingMember.name)}</div>` : ''}
        <datalist id="member-role-list">${roles.map(role => `<option value="${escapeHtml(role)}"></option>`).join('')}</datalist>
        <datalist id="member-group-list">${groups.map(group => `<option value="${escapeHtml(group)}"></option>`).join('')}</datalist>
      </div>

      <div class="card">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px;align-items:end;margin-bottom:10px">
          <label>${escapeHtml(t('search'))}<input data-member-search value="${escapeHtml(filters.search)}" placeholder="${escapeHtml(t('searchMembers'))}"></label>
          <label>${escapeHtml(t('role'))}<select data-member-role-filter><option value="">${escapeHtml(t('allRoles'))}</option>${roles.map(role => `<option value="${escapeHtml(role)}" ${filters.role === role ? 'selected' : ''}>${escapeHtml(role)}</option>`).join('')}</select></label>
          <label>${escapeHtml(t('group'))}<select data-member-group-filter><option value="">${escapeHtml(t('allGroups'))}</option>${groups.map(group => `<option value="${escapeHtml(group)}" ${filters.group === group ? 'selected' : ''}>${escapeHtml(group)}</option>`).join('')}</select></label>
          <label>${escapeHtml(t('sort'))}<select data-member-sort>${[
            ['name', t('sortName')],
            ['role', t('sortRole')],
            ['group', t('sortGroup')],
            ['status', t('sortStatus')],
            ['open-tasks', t('sortOpenTasks')],
          ].map(([value, label]) => `<option value="${value}" ${filters.sort === value ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('')}</select></label>
          <button class="btn btn-sm" type="button" data-member-clear-filters>${escapeHtml(t('clearFilters'))}</button>
        </div>
        <div data-member-active-filters style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:10px;min-height:24px">
          ${activeFilterChips.length ? `<strong style="font-size:.76rem;color:var(--muted)">${escapeHtml(t('activeFilters'))}</strong>${activeFilterChips.map(chip => `<button class="badge mid" type="button" data-member-remove-filter="${escapeHtml(chip.key)}" title="${escapeHtml(t('removeFilter'))}" style="cursor:pointer">${escapeHtml(chip.label)}: ${escapeHtml(chip.value)} x</button>`).join('')}` : `<span style="font-size:.76rem;color:var(--muted);font-weight:800">${escapeHtml(t('noActiveFilters'))}</span>`}
        </div>
        ${renderMemberGrid(visible, tasks, { totalCount: members.length })}
      </div>

      <details class="card" open>
        <summary>${escapeHtml(t('roleView'))}</summary>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:8px;margin-top:10px">
          ${roleGroups.map(row => `
            <div style="border:1px solid var(--border);border-left:5px solid var(--blue);border-radius:8px;background:var(--input-bg);padding:9px">
              <strong style="color:var(--navy)">${escapeHtml(row.role)}</strong>
              <div style="font-size:.78rem;color:var(--muted);font-weight:800;margin:3px 0 6px">${row.members.length} ${escapeHtml(t('members'))}</div>
              <div style="display:flex;gap:5px;flex-wrap:wrap">
                ${row.members.map(member => `<span class="badge done">${escapeHtml(member.name)}</span>`).join('')}
              </div>
            </div>
          `).join('') || `<div style="font-size:.82rem;color:var(--muted);font-weight:800">${escapeHtml(members.length ? t('noMatchingMembers') : t('noMembersYet'))}</div>`}
        </div>
      </details>

      <details class="card" open>
        <summary>${escapeHtml(t('handoffCards'))}</summary>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:8px;margin-top:10px">
          ${renderHandoffCards(visible, tasks, { totalCount: members.length })}
        </div>
      </details>
    </section>`;
}

function renderMemberGrid(members = [], tasks = [], options = {}) {
  if (!members.length) {
    return `<div style="padding:18px;text-align:center;color:var(--muted);font-weight:900">${escapeHtml(options.totalCount ? t('noMatchingMembers') : t('noMembersYet'))}</div>`;
  }
  return `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px">
      ${members.map(member => `
        <div style="border:1px solid var(--border);border-radius:8px;background:var(--input-bg);padding:10px;display:grid;gap:7px">
          <div style="display:flex;justify-content:space-between;gap:8px;align-items:start">
            <div>
              <strong style="color:var(--navy)">${escapeHtml(member.name)}</strong>
              <div style="font-size:.78rem;color:var(--muted);font-weight:800">${escapeHtml(member.role || '-')} | ${escapeHtml(member.group || '-')}</div>
            </div>
            <div style="display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end">
              <button class="btn btn-sm" type="button" data-member-edit="${escapeHtml(member.id)}">${escapeHtml(t('edit'))}</button>
              <button class="btn btn-sm btn-danger" type="button" data-member-delete="${escapeHtml(member.id)}">${escapeHtml(t('delete'))}</button>
            </div>
          </div>
          <div style="display:flex;gap:5px;flex-wrap:wrap">
            <span class="badge done">${escapeHtml(labelFor(member.status || 'Active'))}</span>
            <span class="badge mid">${escapeHtml(t('openTasks'))}: ${memberTaskCount(tasks, member.name)}</span>
          </div>
          ${renderMemberTaskList(getMemberOpenTasks(tasks, member.name))}
        </div>
      `).join('')}
    </div>`;
}

function renderMemberTaskList(tasks = []) {
  if (!tasks.length) {
    return `<div style="font-size:.76rem;color:var(--muted);font-weight:800">${escapeHtml(t('noOpenTasks'))}</div>`;
  }
  return `
    <div style="display:grid;gap:5px">
      ${tasks.slice(0, 4).map(task => `
        <div style="border:1px solid var(--border);border-radius:7px;background:var(--white);padding:6px">
          <strong style="font-size:.78rem;color:var(--navy)">${escapeHtml(task.name)}</strong>
          <div style="font-size:.72rem;color:var(--muted);font-weight:800">${escapeHtml(labelFor(task.status || 'Open'))} | ${escapeHtml(labelFor(task.priority || 'Medium'))} | ${escapeHtml(task.due || '-')}</div>
        </div>
      `).join('')}
      ${tasks.length > 4 ? `<div style="font-size:.74rem;color:var(--muted);font-weight:800">+${tasks.length - 4} ${escapeHtml(t('moreTasks'))}</div>` : ''}
    </div>`;
}

function renderHandoffCards(members = [], tasks = [], options = {}) {
  if (!members.length) {
    return `<div style="font-size:.82rem;color:var(--muted);font-weight:800">${escapeHtml(options.totalCount ? t('noMatchingMembers') : t('noMembersYet'))}</div>`;
  }
  return members.map((member) => {
    const openTasks = getMemberOpenTasks(tasks, member.name);
    const blocked = openTasks.filter(task => task.blocked).length;
    const high = openTasks.filter(task => task.priority === 'High').length;
    return `
      <div style="border:1px solid var(--border);border-left:5px solid ${blocked ? 'var(--red)' : high ? 'var(--orange)' : 'var(--green)'};border-radius:8px;background:var(--input-bg);padding:9px">
        <strong style="color:var(--navy)">${escapeHtml(member.name)}</strong>
        <div style="font-size:.76rem;color:var(--muted);font-weight:800;margin:3px 0">${escapeHtml(member.role || '-')} | ${escapeHtml(member.group || '-')}</div>
        <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:6px">
          <span class="badge mid">${escapeHtml(t('openTasks'))}: ${openTasks.length}</span>
          <span class="badge ${blocked ? 'urgent' : 'done'}">${escapeHtml(t('blocked'))}: ${blocked}</span>
          <span class="badge ${high ? 'mid' : 'done'}">${escapeHtml(labelFor('High'))}: ${high}</span>
        </div>
        ${renderMemberTaskList(openTasks)}
      </div>`;
  }).join('');
}

import { escapeHtml } from '../utils/index.js';
import { getTaskDueInfo, isOverdue, todayDateString } from '../utils/date.js';
import { labelFor, t } from '../utils/i18n.js';

function clean(value) {
  return String(value || '').trim();
}

function nowIso() {
  return new Date().toISOString();
}

function taskUpdatedAt(task = {}) {
  return clean(task.updatedAt || task.updated_at || task.modifiedAt || task.modified_at || task.createdAt || task.created_at);
}

function formatTaskUpdatedAt(value = '') {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString(undefined, { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function highlightText(value = '', query = '') {
  const text = String(value || '');
  const needle = clean(query);
  if (!needle) return escapeHtml(text);
  const lower = text.toLowerCase();
  const match = lower.indexOf(needle.toLowerCase());
  if (match < 0) return escapeHtml(text);
  const before = text.slice(0, match);
  const hit = text.slice(match, match + needle.length);
  const after = text.slice(match + needle.length);
  return `${escapeHtml(before)}<mark class="task-search-mark">${escapeHtml(hit)}</mark>${highlightText(after, query)}`;
}

function normalizeEvidence(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item, index) => ({
      id: Number(item?.id || Date.now() + index),
      label: clean(item?.label || item?.name || item?.title || item?.filename || item?.file || item?.url || item?.href),
      url: clean(item?.url || item?.href || item?.link || item?.file || item?.path),
      note: clean(item?.note || item?.notes || item?.description),
      type: clean(item?.type || item?.kind || 'reference'),
    }))
    .filter(item => item.label || item.url || item.note);
}

function parseExistingEvidence(value) {
  try {
    return normalizeEvidence(JSON.parse(clean(value) || '[]'));
  } catch {
    return [];
  }
}

function getEvidenceFromForm(form) {
  const existing = parseExistingEvidence(form.get('existingEvidence'));
  const label = clean(form.get('evidenceLabel'));
  const url = clean(form.get('evidenceUrl'));
  const note = clean(form.get('evidenceNote'));
  const nextEvidence = normalizeEvidence(label || url || note ? [{
    label: label || url || t('evidence'),
    url,
    note,
    type: url ? 'link' : 'note',
  }] : []);
  return normalizeEvidence([...existing, ...nextEvidence]);
}

export function createTaskFromForm(form) {
  const ts = nowIso();
  return {
    id: Date.now(),
    name: clean(form.get('name')) || 'Untitled task',
    owner: clean(form.get('owner')) || 'Unassigned',
    due: form.get('due') || '',
    priority: form.get('priority') || 'Medium',
    status: form.get('status') || 'Open',
    category: form.get('category') || 'General',
    blocked: form.get('blocked') === 'on',
    notes: clean(form.get('notes')),
    evidence: getEvidenceFromForm(form),
    updatedAt: ts,
  };
}

export function addTask(state, task) {
  state.data.tasks.unshift({ ...task, updatedAt: taskUpdatedAt(task) || nowIso() });
  state.dirtyFlags.tasks = true;
}

export function updateTask(state, id, task) {
  const index = state.data.tasks.findIndex(item => item.id === Number(id));
  if (index < 0) return false;
  state.data.tasks[index] = {
    ...state.data.tasks[index],
    ...task,
    id: state.data.tasks[index].id,
    updatedAt: nowIso(),
  };
  state.dirtyFlags.tasks = true;
  return true;
}

export function updateTaskStatus(state, id, status) {
  const task = state.data.tasks.find(item => item.id === Number(id));
  if (!task) return false;
  task.status = status;
  task.updatedAt = nowIso();
  state.dirtyFlags.tasks = true;
  return true;
}

export function deleteTask(state, id) {
  const before = state.data.tasks.length;
  state.data.tasks = state.data.tasks.filter(task => task.id !== Number(id));
  state.dirtyFlags.tasks = before !== state.data.tasks.length;
  return state.dirtyFlags.tasks;
}

export function getTaskStats(tasks = []) {
  const open = tasks.filter(task => task.status !== 'Done');
  const withEvidence = tasks.filter(task => normalizeEvidence(task.evidence).length);
  const needsEvidence = tasks.filter(task => (task.priority === 'High' || task.status === 'Done') && !normalizeEvidence(task.evidence).length);
  return {
    total: tasks.length,
    open: open.length,
    done: tasks.length - open.length,
    overdue: open.filter(task => isOverdue(task.due)).length,
    blocked: open.filter(task => task.blocked).length,
    withEvidence: withEvidence.length,
    withoutEvidence: tasks.length - withEvidence.length,
    needsEvidence: needsEvidence.length,
  };
}

const DEFAULT_TASK_FILTERS = {
  search: '',
  owner: '',
  status: '',
  priority: '',
  category: '',
  health: '',
  evidence: '',
  sort: 'due-asc',
};

function normalizeTaskFilters(filters = {}) {
  return {
    search: clean(filters.search).toLowerCase(),
    owner: clean(filters.owner),
    status: clean(filters.status),
    priority: clean(filters.priority),
    category: clean(filters.category),
    health: clean(filters.health),
    evidence: clean(filters.evidence),
    sort: clean(filters.sort) || DEFAULT_TASK_FILTERS.sort,
  };
}

function taskMatchesHealthFilter(task, health = '', memberNames = new Set()) {
  if (!health) return true;
  const owner = clean(task.owner);
  if (health === 'this-week') {
    if (task.status === 'Done' || !task.due) return false;
    const today = todayDateString();
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);
    const weekEndText = weekEnd.toISOString().slice(0, 10);
    return task.due >= today && task.due <= weekEndText;
  }
  if (health === 'blocked') return task.status !== 'Done' && Boolean(task.blocked);
  if (health === 'overdue') return task.status !== 'Done' && isOverdue(task.due);
  if (health === 'unassigned') return task.status !== 'Done' && (!owner || owner === 'Unassigned');
  if (health === 'missing-owner') return task.status !== 'Done' && owner && owner !== 'Unassigned' && !memberNames.has(owner);
  if (health === 'high-no-due') return task.status !== 'Done' && task.priority === 'High' && !task.due;
  return true;
}

function filterTasks(tasks = [], filters = {}, members = []) {
  const memberNames = new Set(members.map(member => clean(member.name)).filter(Boolean));
  return tasks.filter((task) => {
    const evidence = normalizeEvidence(task.evidence);
    const evidenceText = evidence.map(item => `${item.label} ${item.url} ${item.note} ${item.type}`).join(' ');
    const haystack = `${task.name || ''} ${task.owner || ''} ${task.category || ''} ${task.priority || ''} ${task.status || ''} ${task.notes || ''} ${evidenceText}`.toLowerCase();
    if (filters.search && !haystack.includes(filters.search)) return false;
    if (filters.owner && task.owner !== filters.owner) return false;
    if (filters.status === 'active' && task.status === 'Done') return false;
    if (filters.status && filters.status !== 'active' && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.category && task.category !== filters.category) return false;
    if (filters.evidence === 'with' && !evidence.length) return false;
    if (filters.evidence === 'without' && evidence.length) return false;
    if (!taskMatchesHealthFilter(task, filters.health, memberNames)) return false;
    return true;
  });
}

function sortTasks(tasks = [], sort = 'due-asc') {
  const priorityRank = { High: 0, Medium: 1, Low: 2 };
  const statusRank = { Open: 0, 'In Progress': 1, Done: 2 };
  const withIndex = tasks.map((task, index) => ({ task, index }));
  const compareText = (a, b, key) => clean(a.task[key]).localeCompare(clean(b.task[key]), 'en');
  const compareDue = (a, b) => {
    const aDue = clean(a.task.due) || '9999-12-31';
    const bDue = clean(b.task.due) || '9999-12-31';
    return aDue.localeCompare(bDue);
  };
  const comparePriority = (a, b) => (priorityRank[a.task.priority] ?? 9) - (priorityRank[b.task.priority] ?? 9);
  const compareStatus = (a, b) => (statusRank[a.task.status] ?? 9) - (statusRank[b.task.status] ?? 9);
  const compareCategory = (a, b) => String(a.task.category || '').localeCompare(String(b.task.category || ''), 'en');
  const compareUpdated = (a, b) => {
    const aUpdated = taskUpdatedAt(a.task) || String(a.task.id || '');
    const bUpdated = taskUpdatedAt(b.task) || String(b.task.id || '');
    return bUpdated.localeCompare(aUpdated);
  };
  const sorted = withIndex.sort((a, b) => {
    let result = (a.task.status === 'Done' ? 1 : 0) - (b.task.status === 'Done' ? 1 : 0);
    if (result && sort !== 'updated-desc') return result;
    if (sort === 'updated-desc') result = compareUpdated(a, b) || compareDue(a, b);
    else if (sort === 'name') result = compareText(a, b, 'name') || compareDue(a, b);
    else if (sort === 'name-desc') result = compareText(b, a, 'name') || compareDue(a, b);
    else if (sort === 'due-desc') result = compareDue(b, a);
    else if (sort === 'priority') result = comparePriority(a, b) || compareDue(a, b);
    else if (sort === 'priority-desc') result = comparePriority(b, a) || compareDue(a, b);
    else if (sort === 'category') result = compareCategory(a, b) || compareDue(a, b);
    else if (sort === 'category-desc') result = compareCategory(b, a) || compareDue(a, b);
    else if (sort === 'status') result = compareStatus(a, b) || compareDue(a, b);
    else if (sort === 'status-desc') result = compareStatus(b, a) || compareDue(a, b);
    else if (sort === 'owner') result = compareText(a, b, 'owner') || compareDue(a, b);
    else if (sort === 'owner-desc') result = compareText(b, a, 'owner') || compareDue(a, b);
    else if (sort === 'created-desc') result = Number(b.task.id || 0) - Number(a.task.id || 0);
    else result = compareDue(a, b);
    return result || a.index - b.index;
  });
  return sorted.map(row => row.task);
}

export function getVisibleTasks(tasks = [], members = [], filters = {}) {
  const normalized = normalizeTaskFilters(filters);
  return sortTasks(filterTasks(tasks, normalized, members), normalized.sort);
}

function unique(values = []) {
  return [...new Set(values.map(clean).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'en'));
}

function getTaskHealthBadges(task, memberNames = new Set()) {
  const owner = clean(task.owner);
  if (task.status === 'Done') return [];
  return [
    (!owner || owner === 'Unassigned') ? t('unassignedTasks') : '',
    (owner && owner !== 'Unassigned' && !memberNames.has(owner)) ? t('ownerNotInMembers') : '',
    (task.priority === 'High' && !task.due) ? t('highNoDue') : '',
  ].filter(Boolean);
}

function getTaskHealthSummary(tasks = [], members = []) {
  const memberNames = new Set(members.map(member => clean(member.name)).filter(Boolean));
  return {
    unassigned: tasks.filter(task => taskMatchesHealthFilter(task, 'unassigned', memberNames)).length,
    missingOwner: tasks.filter(task => taskMatchesHealthFilter(task, 'missing-owner', memberNames)).length,
    highNoDue: tasks.filter(task => taskMatchesHealthFilter(task, 'high-no-due', memberNames)).length,
  };
}

function renderTaskEvidence(evidence = []) {
  const items = normalizeEvidence(evidence);
  if (!items.length) return '';
  return `
    <div data-task-evidence style="display:flex;gap:4px;flex-wrap:wrap;margin-top:5px">
      <span class="badge done" data-task-evidence-count="${items.length}">${escapeHtml(t('evidenceCount'))}: ${items.length}</span>
      ${items.slice(0, 3).map(item => item.url
        ? `<a class="badge mid" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer" title="${escapeHtml(item.note || item.url)}">${escapeHtml(item.label || t('evidence'))}</a>`
        : `<span class="badge mid" title="${escapeHtml(item.note)}">${escapeHtml(item.label || t('evidence'))}</span>`).join('')}
    </div>`;
}

function renderTaskDetail(task = null, members = [], nav = {}) {
  if (!task) return '';
  const evidence = normalizeEvidence(task.evidence);
  const due = getTaskDueInfo(task);
  const late = isOverdue(task.due) && task.status !== 'Done';
  const healthBadges = getTaskHealthBadges(task, new Set(members.map(member => clean(member.name)).filter(Boolean)));
  const updatedAt = taskUpdatedAt(task);
  const detailRows = [
    [t('owner'), task.owner || labelFor('Unassigned')],
    [t('due'), `${task.due || '-'}${due.days !== null ? ` (${due.days}d)` : ''}`],
    [t('priority'), labelFor(task.priority || 'Medium')],
    [t('status'), labelFor(task.status || 'Open')],
    [t('category'), labelFor(task.category || 'General')],
    [t('blocked'), task.blocked ? t('blocked') : '-'],
    [t('lastUpdated'), updatedAt ? formatTaskUpdatedAt(updatedAt) : '-'],
  ];
  return `
    <div class="task-detail-view">
      <div class="task-detail-title">
        <h3>${escapeHtml(task.name || t('task'))}</h3>
        <div class="task-detail-badges">
          <span class="badge ${task.priority === 'High' ? 'urgent' : task.priority === 'Low' ? 'done' : 'mid'}">${escapeHtml(labelFor(task.priority || 'Medium'))}</span>
          <span class="badge ${late || task.blocked ? 'urgent' : task.status === 'Done' ? 'done' : 'inprog'}">${escapeHtml(late ? t('overdue') : labelFor(task.status || 'Open'))}</span>
          ${healthBadges.map(label => `<span class="badge mid">${escapeHtml(label)}</span>`).join('')}
        </div>
      </div>
      <div class="task-detail-grid">
        ${detailRows.map(([label, value]) => `
          <div class="task-detail-field">
            <div>${escapeHtml(label)}</div>
            <strong>${escapeHtml(value)}</strong>
          </div>
        `).join('')}
      </div>
      <div class="task-detail-section">
        <div class="task-detail-section-title">${escapeHtml(t('note'))}</div>
        <div class="task-detail-note">${escapeHtml(task.notes || '-')}</div>
      </div>
      <div class="task-detail-section">
        <div class="task-detail-section-title">${escapeHtml(t('evidence'))}</div>
        ${evidence.length ? `
          <div class="task-detail-evidence">
            ${evidence.map(item => item.url
              ? `<a class="badge mid" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer" title="${escapeHtml(item.note || item.url)}">${escapeHtml(item.label || item.url)}</a>`
              : `<span class="badge mid" title="${escapeHtml(item.note)}">${escapeHtml(item.label || item.note || t('evidence'))}</span>`).join('')}
          </div>
        ` : `<div class="task-detail-note">-</div>`}
      </div>
      <div class="modal-actions">
        <button class="btn" type="button" data-task-detail-nav="-1" ${nav.prevId ? '' : 'disabled'}>${escapeHtml(t('previousTask'))}</button>
        <button class="btn" type="button" data-task-detail-nav="1" ${nav.nextId ? '' : 'disabled'}>${escapeHtml(t('nextTask'))}</button>
        <button class="btn btn-primary" type="button" data-task-detail-edit="${task.id}">${escapeHtml(t('edit'))}</button>
        <button class="btn" type="button" data-task-cancel-edit>${escapeHtml(t('cancelEdit'))}</button>
      </div>
    </div>`;
}

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function getTaskIssueLabels(task = {}) {
  const evidence = normalizeEvidence(task.evidence);
  return [
    task.status !== 'Done' && (!clean(task.owner) || clean(task.owner) === 'Unassigned') ? 'Task has no owner' : '',
    task.status !== 'Done' && task.priority === 'High' && !task.due ? 'High priority task has no due date' : '',
    (task.priority === 'High' || task.status === 'Done') && !evidence.length ? 'Task missing evidence' : '',
  ].filter(Boolean);
}

export function buildTasksCsv(tasks = []) {
  const headers = ['name', 'owner', 'due', 'priority', 'status', 'category', 'blocked', 'evidenceCount', 'evidence', 'issues', 'notes'];
  const rows = tasks.map((task) => {
    const evidence = normalizeEvidence(task.evidence);
    return [
      task.name || '',
      task.owner || '',
      task.due || '',
      task.priority || '',
      task.status || '',
      task.category || '',
      task.blocked ? 'yes' : 'no',
      evidence.length,
      evidence.map(item => `${item.label || item.url || t('evidence')} ${item.url || ''}`.trim()).join('; '),
      getTaskIssueLabels(task).join('; '),
      task.notes || '',
    ];
  });
  return [headers, ...rows].map(row => row.map(csvCell).join(',')).join('\n');
}

export function exportTasksCsv(tasks = [], documentRef = document) {
  const blob = new Blob([buildTasksCsv(tasks)], { type: 'text/csv;charset=utf-8' });
  const anchor = documentRef.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.download = `rov_v16_tasks_${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}

function getActiveFilterChips(filters = {}) {
  const healthLabels = {
    'this-week': t('thisWeek'),
    blocked: t('blocked'),
    overdue: t('overdue'),
    unassigned: t('unassignedTasks'),
    'missing-owner': t('ownerNotInMembers'),
    'high-no-due': t('highNoDue'),
  };
  return [
    filters.search ? { key: 'search', label: t('search'), value: filters.search } : null,
    filters.owner ? { key: 'owner', label: t('owner'), value: filters.owner } : null,
    filters.status ? { key: 'status', label: t('status'), value: filters.status === 'active' ? t('openTasks') : labelFor(filters.status) } : null,
    filters.priority ? { key: 'priority', label: t('priority'), value: labelFor(filters.priority) } : null,
    filters.category ? { key: 'category', label: t('category'), value: filters.category } : null,
    filters.evidence ? { key: 'evidence', label: t('evidence'), value: filters.evidence === 'with' ? t('withEvidence') : t('withoutEvidence') } : null,
    filters.health ? { key: 'health', label: t('dataHealth'), value: healthLabels[filters.health] || filters.health } : null,
  ].filter(Boolean);
}

function getActiveTaskQuickTab(filters = {}, myOwner = '') {
  const hasOnlySort = !filters.search && !filters.owner && !filters.status && !filters.priority && !filters.category && !filters.health && !filters.evidence;
  if (hasOnlySort) return 'all';
  if (myOwner && filters.owner === myOwner && !filters.search && !filters.status && !filters.priority && !filters.category && !filters.health && !filters.evidence) return 'mine';
  if (filters.health === 'this-week' && !filters.search && !filters.owner && !filters.status && !filters.priority && !filters.category && !filters.evidence) return 'this-week';
  if (filters.health === 'overdue' && !filters.search && !filters.owner && !filters.status && !filters.priority && !filters.category && !filters.evidence) return 'overdue';
  if (filters.health === 'blocked' && !filters.search && !filters.owner && !filters.status && !filters.priority && !filters.category && !filters.evidence) return 'blocked';
  if (filters.priority === 'High' && !filters.search && !filters.owner && !filters.status && !filters.category && !filters.health && !filters.evidence) return 'high';
  if (filters.status === 'active' && !filters.search && !filters.owner && !filters.priority && !filters.category && !filters.health && !filters.evidence) return 'active';
  if (filters.status === 'Done' && !filters.search && !filters.owner && !filters.priority && !filters.category && !filters.health && !filters.evidence) return 'done';
  return '';
}

function getTaskQuickTabCounts(tasks = [], myOwner = '') {
  const active = tasks.filter(task => task.status !== 'Done');
  return {
    all: tasks.length,
    mine: myOwner ? tasks.filter(task => task.owner === myOwner).length : 0,
    'this-week': tasks.filter(task => taskMatchesHealthFilter(task, 'this-week')).length,
    overdue: tasks.filter(task => taskMatchesHealthFilter(task, 'overdue')).length,
    blocked: tasks.filter(task => taskMatchesHealthFilter(task, 'blocked')).length,
    high: active.filter(task => task.priority === 'High').length,
    active: active.length,
    done: tasks.filter(task => task.status === 'Done').length,
  };
}

export function renderTaskTable(tasks = [], members = [], options = {}) {
  if (!tasks.length) {
    return `<div style="padding:18px;text-align:center;color:var(--muted);font-weight:900">${escapeHtml(options.totalCount ? t('noMatchingTasks') : t('noTasksYet'))}</div>`;
  }
  const memberNames = new Set(members.map(member => clean(member.name)).filter(Boolean));
  const filters = normalizeTaskFilters(options.filters);
  const visibleColumns = new Set(options.visibleColumns || ['owner', 'due', 'priority', 'category', 'status', 'actions']);
  const searchQuery = filters.search || '';
  const ownerOptions = unique([...members.map(member => member.name), ...tasks.map(task => task.owner), 'Unassigned']);
  const selectedTaskIds = new Set((options.selectedTaskIds || []).map(id => Number(id)));
  const allVisibleSelected = tasks.length > 0 && tasks.every(task => selectedTaskIds.has(Number(task.id)));
  const sortColumns = {
    name: ['name', 'name-desc'],
    owner: ['owner', 'owner-desc'],
    due: ['due-asc', 'due-desc'],
    priority: ['priority', 'priority-desc'],
    category: ['category', 'category-desc'],
    status: ['status', 'status-desc'],
  };
  const sortHeader = (column, label) => {
    const [asc, desc] = sortColumns[column] || [];
    const activeAsc = filters.sort === asc;
    const activeDesc = filters.sort === desc;
    const nextSort = activeAsc ? desc : asc;
    const mark = activeAsc ? '^' : activeDesc ? 'v' : '';
    return `<th class="task-sort-th task-col-${escapeHtml(column)}"><button class="task-sort-button" type="button" data-task-header-sort="${escapeHtml(nextSort)}" aria-label="${escapeHtml(`${label} ${t('sort')}`)}">${escapeHtml(label)}<span>${escapeHtml(mark)}</span></button></th>`;
  };
  return `
    <div class="task-table-wrap">
      <table>
        <thead><tr><th class="task-select-col"><input type="checkbox" data-task-select-visible ${allVisibleSelected ? 'checked' : ''} aria-label="${escapeHtml(t('selectVisibleTasks'))}"></th>${sortHeader('name', t('task'))}${visibleColumns.has('owner') ? sortHeader('owner', t('owner')) : ''}${visibleColumns.has('due') ? sortHeader('due', t('due')) : ''}${visibleColumns.has('priority') ? sortHeader('priority', t('priority')) : ''}${visibleColumns.has('category') ? sortHeader('category', t('category')) : ''}${visibleColumns.has('status') ? sortHeader('status', t('status')) : ''}${visibleColumns.has('actions') ? '<th></th>' : ''}</tr></thead>
        <tbody>
          ${tasks.map((task) => {
            const due = getTaskDueInfo(task);
            const late = isOverdue(task.due) && task.status !== 'Done';
            const healthBadges = getTaskHealthBadges(task, memberNames);
            const taskCategories = options.categories || ['General'];
            const selectedCategory = taskCategories.includes(task.category) ? task.category : taskCategories[0] || 'General';
            const categoryOptions = taskCategories.length ? taskCategories : [selectedCategory];
            const rowClasses = [
              late ? 'task-overdue' : '',
              task.status === 'Done' ? 'task-done' : '',
            ].filter(Boolean).join(' ');
            const selected = selectedTaskIds.has(Number(task.id));
            return `
              <tr${rowClasses ? ` class="${rowClasses}"` : ''}>
                <td class="task-select-cell"><input type="checkbox" data-task-select="${task.id}" ${selected ? 'checked' : ''} aria-label="${escapeHtml(`${t('selectTask')} ${task.name}`)}"></td>
                <td class="task-name-cell">
                  <button class="task-name-button" type="button" data-task-view="${task.id}">${highlightText(task.name, searchQuery)}</button>
                  ${taskUpdatedAt(task) ? `<div class="task-updated-at">${escapeHtml(t('updated'))}: ${escapeHtml(formatTaskUpdatedAt(taskUpdatedAt(task)))}</div>` : ''}
                  ${task.blocked ? `<div style="font-size:.76rem;color:var(--muted)">${escapeHtml(t('blocked'))}</div>` : ''}
                  ${healthBadges.length ? `<div data-task-health-badges style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">${healthBadges.map(label => `<span class="badge mid">${escapeHtml(label)}</span>`).join('')}</div>` : ''}
                  ${searchQuery && clean(task.notes).toLowerCase().includes(searchQuery.toLowerCase()) ? `<div class="task-search-snippet">${highlightText(task.notes, searchQuery)}</div>` : ''}
                  ${renderTaskEvidence(task.evidence)}
                </td>
                ${visibleColumns.has('owner') ? `<td class="task-owner-cell">
                  <input class="task-inline-input task-owner-input" data-task-owner="${task.id}" list="task-inline-owner-list" value="${escapeHtml(task.owner || 'Unassigned')}" aria-label="${escapeHtml(t('owner'))}">
                </td>` : ''}
                ${visibleColumns.has('due') ? `<td class="task-due-cell" style="color:${late ? 'var(--red)' : 'var(--text)'}">
                  <input class="task-inline-input task-due-input" data-task-due="${task.id}" type="date" value="${escapeHtml(task.due || '')}" aria-label="${escapeHtml(t('due'))}">
                  ${due.days !== null ? `<div class="task-due-days">(${due.days}d)</div>` : ''}
                </td>` : ''}
                ${visibleColumns.has('priority') ? `<td class="task-priority-cell">
                  <select class="task-priority-select ${task.priority === 'High' ? 'urgent' : task.priority === 'Low' ? 'done' : 'mid'}" data-task-priority="${task.id}" aria-label="${escapeHtml(t('priority'))}">
                    ${['High', 'Medium', 'Low'].map(priority => `<option value="${priority}" ${task.priority === priority ? 'selected' : ''}>${escapeHtml(labelFor(priority))}</option>`).join('')}
                  </select>
                </td>` : ''}
                ${visibleColumns.has('category') ? `<td class="task-category-cell">
                  <select class="task-category-select" data-task-category="${task.id}" aria-label="${escapeHtml(t('category'))}">
                    ${categoryOptions.map(category => `<option value="${escapeHtml(category)}" ${selectedCategory === category ? 'selected' : ''}>${escapeHtml(labelFor(category))}</option>`).join('')}
                  </select>
                </td>` : ''}
                ${visibleColumns.has('status') ? `<td class="task-status-table-cell">
                  <div class="task-status-cell">
                    <select class="task-status-select" data-task-status="${task.id}" aria-label="${escapeHtml(t('status'))}">
                      ${['Open', 'In Progress', 'Done'].map(status => `<option value="${status}" ${task.status === status ? 'selected' : ''}>${escapeHtml(labelFor(status))}</option>`).join('')}
                    </select>
                  </div>
                </td>` : ''}
                ${visibleColumns.has('actions') ? `<td class="task-actions-cell">
                  <div class="task-action-row">
                    <button class="btn btn-sm" type="button" data-task-view="${task.id}" title="${escapeHtml(t('view'))}" aria-label="${escapeHtml(t('view'))}">${escapeHtml(t('viewShort'))}</button>
                    <button class="btn btn-sm" type="button" data-task-edit="${task.id}" title="${escapeHtml(t('edit'))}" aria-label="${escapeHtml(t('edit'))}">${escapeHtml(t('editShort'))}</button>
                    <button class="btn btn-sm btn-danger" type="button" data-task-delete="${task.id}" title="${escapeHtml(t('delete'))}" aria-label="${escapeHtml(t('delete'))}">${escapeHtml(t('deleteShort'))}</button>
                  </div>
                </td>` : ''}
              </tr>`;
          }).join('')}
        </tbody>
      </table>
      <datalist id="task-inline-owner-list">${ownerOptions.map(owner => `<option value="${escapeHtml(owner)}"></option>`).join('')}</datalist>
    </div>`;
}

function renderTaskForm(editingTask = null, context = {}) {
  const master = context.master || {};
  const taskCategories = master.taskTypes?.length ? master.taskTypes : ['General'];
  const selectedCategory = taskCategories.includes(editingTask?.category) ? editingTask.category : taskCategories[0];
  const existingEvidence = normalizeEvidence(editingTask?.evidence);
  const ownerSuggestions = context.ownerSuggestions || [];
  return `
    <form data-task-form style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px;align-items:end">
      <label>${escapeHtml(t('task'))}<input name="name" required value="${escapeHtml(editingTask?.name || '')}" placeholder="${escapeHtml(t('task'))}"></label>
      <label>${escapeHtml(t('owner'))}<input name="owner" list="task-owner-list" value="${escapeHtml(editingTask?.owner || '')}" placeholder="${escapeHtml(t('owner'))}"></label>
      <label>${escapeHtml(t('due'))}<input name="due" type="date" value="${escapeHtml(editingTask?.due || todayDateString())}"></label>
      <label>${escapeHtml(t('priority'))}<select name="priority">${['High', 'Medium', 'Low'].map(priority => `<option value="${priority}" ${editingTask?.priority === priority || (!editingTask && priority === 'Medium') ? 'selected' : ''}>${escapeHtml(labelFor(priority))}</option>`).join('')}</select></label>
      <label>${escapeHtml(t('category'))}<select name="category">${taskCategories.map(type => `<option value="${escapeHtml(type)}" ${selectedCategory === type ? 'selected' : ''}>${escapeHtml(labelFor(type))}</option>`).join('')}</select></label>
      <label>${escapeHtml(t('status'))}<select name="status">${['Open', 'In Progress', 'Done'].map(status => `<option value="${status}" ${editingTask?.status === status ? 'selected' : ''}>${escapeHtml(labelFor(status))}</option>`).join('')}</select></label>
      <label style="display:flex;gap:7px;align-items:center;font-weight:900"><input name="blocked" type="checkbox" ${editingTask?.blocked ? 'checked' : ''}> ${escapeHtml(t('blocked'))}</label>
      <label style="grid-column:1/-1">${escapeHtml(t('note'))}<textarea name="notes" rows="2" placeholder="${escapeHtml(t('note'))}">${escapeHtml(editingTask?.notes || '')}</textarea></label>
      <input type="hidden" name="existingEvidence" value="${escapeHtml(JSON.stringify(existingEvidence))}">
      <label data-task-evidence-label>${escapeHtml(t('evidenceLabel'))}<input name="evidenceLabel" placeholder="${escapeHtml(t('evidenceLabel'))}"></label>
      <label data-task-evidence-url>${escapeHtml(t('evidenceUrl'))}<input name="evidenceUrl" type="url" placeholder="https://..."></label>
      <label style="grid-column:1/-1">${escapeHtml(t('evidenceNote'))}<textarea name="evidenceNote" rows="2" placeholder="${escapeHtml(t('evidenceNote'))}"></textarea></label>
      <button class="btn btn-primary" type="submit">${escapeHtml(editingTask ? t('updateTask') : t('addTask'))}</button>
      <button class="btn" type="button" data-task-cancel-edit>${escapeHtml(t('cancelEdit'))}</button>
    </form>
    <datalist id="task-owner-list" data-task-owner-list>${ownerSuggestions.map(owner => `<option value="${escapeHtml(owner)}"></option>`).join('')}</datalist>
    ${editingTask && existingEvidence.length ? `<div data-task-evidence style="display:flex;gap:5px;flex-wrap:wrap;align-items:center;margin-top:8px"><strong style="font-size:.78rem;color:var(--muted)">${escapeHtml(t('existingEvidence'))}</strong>${existingEvidence.map(item => item.url ? `<a class="badge mid" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.label || t('evidence'))}</a>` : `<span class="badge mid">${escapeHtml(item.label || t('evidence'))}</span>`).join('')}</div>` : ''}`;
}

export function renderTasksPage(state, options = {}) {
  const tasks = state.data.tasks || [];
  const editingTask = tasks.find(task => task.id === Number(options.editingTaskId));
  const viewingTask = tasks.find(task => task.id === Number(options.viewingTaskId));
  const taskModalOpen = Boolean(editingTask || options.addingTask || viewingTask);
  const stats = getTaskStats(tasks);
  const master = state.data.masterData || {};
  const filters = normalizeTaskFilters(options.filters);
  const myOwner = String(options.myOwner || '');
  const owners = unique(tasks.map(task => task.owner));
  const ownerSuggestions = unique([...(state.data.members || []).map(member => member.name), ...tasks.map(task => task.owner)]);
  const categories = master.taskTypes?.length ? master.taskTypes : ['General'];
  const healthSummary = getTaskHealthSummary(tasks, state.data.members || []);
  const visibleTasks = getVisibleTasks(tasks, state.data.members || [], filters);
  const visibleTaskIds = visibleTasks.map(task => Number(task.id));
  const viewingIndex = viewingTask ? visibleTaskIds.indexOf(Number(viewingTask.id)) : -1;
  const detailNav = {
    prevId: viewingIndex > 0 ? visibleTaskIds[viewingIndex - 1] : null,
    nextId: viewingIndex >= 0 && viewingIndex < visibleTaskIds.length - 1 ? visibleTaskIds[viewingIndex + 1] : null,
  };
  const activeFilterChips = getActiveFilterChips(filters);
  const selectedTaskIds = (options.selectedTaskIds || []).map(id => Number(id));
  const selectedCount = selectedTaskIds.length;
  const visibleColumns = new Set(options.visibleColumns || ['owner', 'due', 'priority', 'category', 'status', 'actions']);
  const taskDensity = options.taskDensity === 'compact' ? 'compact' : 'comfortable';
  const columnToggles = [
    ['owner', t('owner')],
    ['due', t('due')],
    ['priority', t('priority')],
    ['category', t('category')],
    ['status', t('status')],
    ['actions', t('actions')],
  ];
  const activeQuickTab = getActiveTaskQuickTab(filters, myOwner);
  const quickTabCounts = getTaskQuickTabCounts(tasks, myOwner);
  const quickTabs = [
    ['all', t('allTasks'), false],
    ['mine', t('myTasks'), !myOwner],
    ['this-week', t('thisWeek'), false],
    ['overdue', t('overdue'), false],
    ['blocked', t('blocked'), false],
    ['high', t('highPriority'), false],
    ['active', t('openTasks'), false],
    ['done', t('doneTasks'), false],
  ];
  return `
    <section id="page-tasks" class="page active task-density-${escapeHtml(taskDensity)}" style="display:grid;gap:12px">
      <div class="page-topbar">
        <div>
          <h1 style="margin:0;color:var(--navy)">${escapeHtml(t('tasks'))}</h1>
          <div class="page-top-summary">${escapeHtml(t('taskSummary'))}</div>
        </div>
        <div class="page-top-summary">${escapeHtml(t('openTasks'))} ${stats.open} | ${escapeHtml(t('overdue'))} ${stats.overdue} | ${escapeHtml(t('blocked'))} ${stats.blocked} | ${escapeHtml(t('visible'))} ${visibleTasks.length}/${tasks.length}</div>
      </div>
      <div class="modal-bg ${taskModalOpen ? 'open' : ''}" data-task-modal-bg>
        <div class="modal wide task-modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title" data-task-modal>
          <div class="task-modal-head">
            <h3 id="task-modal-title">${escapeHtml(viewingTask ? t('taskDetails') : editingTask ? t('editingTask') : t('addTask'))}</h3>
            <button class="btn btn-sm" type="button" data-task-cancel-edit>${escapeHtml(t('cancelEdit'))}</button>
          </div>
          ${viewingTask ? renderTaskDetail(viewingTask, state.data.members || [], detailNav) : taskModalOpen ? renderTaskForm(editingTask || null, { master, ownerSuggestions }) : ''}
          ${editingTask ? `<div style="font-size:.78rem;color:var(--muted);font-weight:800;margin-top:8px">${escapeHtml(t('editingTask'))}: ${escapeHtml(editingTask.name)}</div>` : ''}
        </div>
      </div>
      <div class="card">
        <div class="task-quick-tabs" data-task-quick-tabs>
          ${quickTabs.map(([value, label, disabled]) => `
            <button class="task-quick-tab ${activeQuickTab === value ? 'active' : ''}" type="button" data-task-quick-tab="${escapeHtml(value)}" ${disabled ? 'disabled' : ''}><span>${escapeHtml(label)}</span><strong>${escapeHtml(quickTabCounts[value] ?? 0)}</strong></button>
          `).join('')}
        </div>
        <div class="task-summary-row" data-task-evidence-summary data-task-health-summary>
          ${[
            [t('withEvidence'), stats.withEvidence, 'with', 'var(--green)'],
            [t('withoutEvidence'), stats.withoutEvidence, 'without', 'var(--orange)'],
            [t('needsEvidence'), stats.needsEvidence, 'without', 'var(--red)'],
          ].map(([label, value, evidence, color]) => {
            const active = filters.evidence === evidence;
            return `
            <button class="task-summary-card" type="button" data-task-evidence-shortcut="${escapeHtml(evidence)}" ${active ? 'data-task-evidence-active="true"' : ''} style="--task-summary-accent:${Number(value) ? color : 'var(--green)'};--task-summary-active:${active ? color : 'var(--border)'};--task-summary-bg:${active ? 'rgba(59, 130, 246, .10)' : 'var(--input-bg)'}">
              <div class="task-summary-label">${escapeHtml(label)}</div>
              <div class="task-summary-value" style="color:${Number(value) ? color : 'var(--green)'}">${escapeHtml(value)}</div>
            </button>
          `; }).join('')}
          ${[
            [t('unassignedTasks'), healthSummary.unassigned, 'unassigned'],
            [t('ownerNotInMembers'), healthSummary.missingOwner, 'missing-owner'],
            [t('highNoDue'), healthSummary.highNoDue, 'high-no-due'],
          ].map(([label, value, health]) => {
            const active = filters.health === health;
            return `
            <button class="task-summary-card" type="button" data-task-health-shortcut="${escapeHtml(health)}" ${active ? 'data-task-health-active="true"' : ''} style="--task-summary-accent:${value ? 'var(--orange)' : 'var(--green)'};--task-summary-active:${active ? 'var(--orange)' : 'var(--border)'};--task-summary-bg:${active ? 'rgba(245, 158, 11, .12)' : 'var(--input-bg)'}">
              <div class="task-summary-label">${escapeHtml(label)}</div>
              <div class="task-summary-value" style="color:${value ? 'var(--orange)' : 'var(--green)'}">${escapeHtml(value)}</div>
            </button>
          `; }).join('')}
        </div>
        <div class="task-filter-bar" data-task-filter-bar>
          <label>${escapeHtml(t('owner'))}<select data-task-owner-filter><option value="">${escapeHtml(t('allOwners'))}</option>${owners.map(owner => `<option value="${escapeHtml(owner)}" ${filters.owner === owner ? 'selected' : ''}>${escapeHtml(owner)}</option>`).join('')}</select></label>
          <label>${escapeHtml(t('status'))}<select data-task-status-filter><option value="">${escapeHtml(t('allStatuses'))}</option>${[
            ['active', t('openTasks')],
            ['Open', labelFor('Open')],
            ['In Progress', labelFor('In Progress')],
            ['Done', labelFor('Done')],
          ].map(([value, label]) => `<option value="${value}" ${filters.status === value ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('')}</select></label>
          <label>${escapeHtml(t('priority'))}<select data-task-priority-filter><option value="">${escapeHtml(t('allPriorities'))}</option>${['High', 'Medium', 'Low'].map(priority => `<option value="${priority}" ${filters.priority === priority ? 'selected' : ''}>${escapeHtml(labelFor(priority))}</option>`).join('')}</select></label>
          <label>${escapeHtml(t('category'))}<select data-task-category-filter><option value="">${escapeHtml(t('allCategories'))}</option>${categories.map(category => `<option value="${escapeHtml(category)}" ${filters.category === category ? 'selected' : ''}>${escapeHtml(labelFor(category))}</option>`).join('')}</select></label>
          <label>${escapeHtml(t('evidence'))}<select data-task-evidence-filter>${[
            ['', t('allEvidence')],
            ['with', t('withEvidence')],
            ['without', t('withoutEvidence')],
          ].map(([value, label]) => `<option value="${escapeHtml(value)}" ${filters.evidence === value ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('')}</select></label>
          <label>${escapeHtml(t('dataHealth'))}<select data-task-health-filter>${[
            ['', t('allHealth')],
            ['this-week', t('thisWeek')],
            ['blocked', t('blocked')],
            ['overdue', t('overdue')],
            ['unassigned', t('unassignedTasks')],
            ['missing-owner', t('ownerNotInMembers')],
            ['high-no-due', t('highNoDue')],
          ].map(([value, label]) => `<option value="${escapeHtml(value)}" ${filters.health === value ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('')}</select></label>
          <label>${escapeHtml(t('sort'))}<select data-task-sort>${[
            ['due-asc', t('sortDueAsc')],
            ['due-desc', t('sortDueDesc')],
            ['priority', t('sortPriority')],
            ['status', t('sortStatus')],
            ['owner', t('sortOwner')],
            ['updated-desc', t('sortUpdated')],
            ['created-desc', t('sortNewest')],
          ].map(([value, label]) => `<option value="${value}" ${filters.sort === value ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('')}</select></label>
        </div>
        <div class="task-toolbar-actions" data-task-toolbar-actions>
          <div class="task-toolbar-search task-toolbar-owner">
            <label><span class="task-toolbar-label">${escapeHtml(t('myOwner'))}</span><select data-my-task-owner>
              <option value="">${escapeHtml(t('chooseOwner'))}</option>
              ${ownerSuggestions.map(owner => `<option value="${escapeHtml(owner)}" ${myOwner === owner ? 'selected' : ''}>${escapeHtml(owner)}</option>`).join('')}
            </select></label>
            <button class="btn btn-primary task-toolbar-btn" type="button" data-my-tasks ${myOwner ? '' : 'disabled'}>${escapeHtml(t('myTasks'))}</button>
          </div>
          <button class="btn task-toolbar-btn task-toolbar-clear" type="button" data-task-clear-filters>${escapeHtml(t('clearFilters'))}</button>
          <button class="btn btn-primary task-toolbar-btn" type="button" data-task-open-add>${escapeHtml(t('addTask'))}</button>
          <button class="btn btn-primary task-toolbar-btn" type="button" data-action="export-tasks-csv">${escapeHtml(t('exportTasksCsv'))}</button>
          <div class="task-toolbar-search">
            <label><span class="sr-only">${escapeHtml(t('search'))}</span><input data-task-search value="${escapeHtml(filters.search)}" placeholder="${escapeHtml(t('searchTasks'))}"></label>
            <button class="btn btn-primary task-search-submit" type="button" data-task-search-submit>${escapeHtml(t('search'))}</button>
          </div>
        </div>
        <div class="task-table-controls">
          <div class="task-density-controls" data-task-density-controls>
            <strong>${escapeHtml(t('density'))}</strong>
            <button class="task-density-button ${taskDensity === 'comfortable' ? 'active' : ''}" type="button" data-task-density="comfortable">${escapeHtml(t('comfortable'))}</button>
            <button class="task-density-button ${taskDensity === 'compact' ? 'active' : ''}" type="button" data-task-density="compact">${escapeHtml(t('compact'))}</button>
          </div>
          <div class="task-column-controls" data-task-column-controls>
            <strong>${escapeHtml(t('visibleColumns'))}</strong>
            ${columnToggles.map(([column, label]) => `
              <label><input type="checkbox" data-task-column-toggle="${escapeHtml(column)}" ${visibleColumns.has(column) ? 'checked' : ''}> ${escapeHtml(label)}</label>
            `).join('')}
          </div>
        </div>
        <div class="task-bulk-toolbar ${selectedCount ? 'active' : ''}" data-task-bulk-toolbar>
          <div class="task-bulk-count">${escapeHtml(t('selectedTasks'))}: ${selectedCount}</div>
          <select data-task-bulk-status aria-label="${escapeHtml(t('bulkUpdateStatus'))}">
            <option value="">${escapeHtml(t('bulkUpdateStatus'))}</option>
            ${['Open', 'In Progress', 'Done'].map(status => `<option value="${status}">${escapeHtml(labelFor(status))}</option>`).join('')}
          </select>
          <select data-task-bulk-priority aria-label="${escapeHtml(t('bulkUpdatePriority'))}">
            <option value="">${escapeHtml(t('bulkUpdatePriority'))}</option>
            ${['High', 'Medium', 'Low'].map(priority => `<option value="${priority}">${escapeHtml(labelFor(priority))}</option>`).join('')}
          </select>
          <select data-task-bulk-owner aria-label="${escapeHtml(t('bulkUpdateOwner'))}">
            <option value="">${escapeHtml(t('bulkUpdateOwner'))}</option>
            ${ownerSuggestions.map(owner => `<option value="${escapeHtml(owner)}">${escapeHtml(owner)}</option>`).join('')}
          </select>
          <select data-task-bulk-category aria-label="${escapeHtml(t('bulkUpdateCategory'))}">
            <option value="">${escapeHtml(t('bulkUpdateCategory'))}</option>
            ${categories.map(category => `<option value="${escapeHtml(category)}">${escapeHtml(labelFor(category))}</option>`).join('')}
          </select>
          <button class="btn btn-danger task-bulk-delete" type="button" data-task-bulk-delete ${selectedCount ? '' : 'disabled'}>${escapeHtml(t('deleteSelected'))}</button>
          <button class="btn task-bulk-clear" type="button" data-task-bulk-clear ${selectedCount ? '' : 'disabled'}>${escapeHtml(t('clearSelection'))}</button>
        </div>
        <div data-task-active-filters style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:10px;min-height:24px">
          ${activeFilterChips.length ? `<strong style="font-size:.76rem;color:var(--muted)">${escapeHtml(t('activeFilters'))}</strong>${activeFilterChips.map(chip => `<button class="badge mid" type="button" data-task-remove-filter="${escapeHtml(chip.key)}" title="${escapeHtml(t('removeFilter'))}" style="cursor:pointer">${escapeHtml(chip.label)}: ${escapeHtml(chip.value)} x</button>`).join('')}` : `<span style="font-size:.76rem;color:var(--muted);font-weight:800">${escapeHtml(t('noActiveFilters'))}</span>`}
        </div>
        ${renderTaskTable(visibleTasks, state.data.members || [], { totalCount: tasks.length, filters, categories, selectedTaskIds, visibleColumns: [...visibleColumns], taskDensity })}
      </div>
    </section>`;
}

import { escapeHtml } from '../utils/index.js';
import { getTaskDueInfo, isOverdue } from '../utils/date.js';
import { labelFor, t } from '../utils/i18n.js';

function clean(value) {
  return String(value || '').trim();
}

function unique(values = []) {
  return [...new Set(values.map(clean).filter(Boolean))];
}

function isOpenTask(task = {}) {
  return task.status !== 'Done';
}

function isThisWeek(task = {}) {
  const dueInfo = getTaskDueInfo(task);
  return dueInfo.days !== null && dueInfo.days >= 0 && dueInfo.days <= 7;
}

function hasEvidence(task = {}) {
  return Array.isArray(task.evidence) && task.evidence.some(item => clean(item?.label || item?.url || item?.note));
}

function needsEvidence(task = {}) {
  return (task.priority === 'High' || task.status === 'Done') && !hasEvidence(task);
}

function taskUpdatedAt(task = {}) {
  return clean(task.updatedAt || task.updated_at || task.modifiedAt || task.modified_at || task.createdAt || task.created_at);
}

function formatTaskUpdatedAt(value = '') {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString(undefined, { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function isStaleTask(task = {}, staleDays = 7) {
  if (!isOpenTask(task)) return false;
  const updated = Date.parse(taskUpdatedAt(task));
  if (!Number.isFinite(updated)) return true;
  return Date.now() - updated > staleDays * 24 * 60 * 60 * 1000;
}

function sortByDue(tasks = []) {
  return [...tasks].sort((a, b) => {
    const aDue = a.due || '9999-12-31';
    const bDue = b.due || '9999-12-31';
    if (aDue !== bDue) return aDue.localeCompare(bDue);
    return clean(a.priority).localeCompare(clean(b.priority));
  });
}

function sortByStudentPriority(tasks = []) {
  const priorityScore = task => (
    (isOverdue(task.due) ? 100 : 0)
    + (task.blocked ? 80 : 0)
    + (task.priority === 'High' ? 50 : task.priority === 'Medium' ? 20 : 0)
    + (isStaleTask(task) ? 25 : 0)
    + (isThisWeek(task) ? 15 : 0)
  );
  return sortByDue(tasks).sort((a, b) => (priorityScore(b) - priorityScore(a)) || 0);
}

function taskBadge(task = {}) {
  if (task.blocked) return `<span class="badge blocked">${escapeHtml(t('blocked'))}</span>`;
  if (isOverdue(task.due)) return `<span class="badge overdue">${escapeHtml(t('overdue'))}</span>`;
  if (task.priority === 'High') return `<span class="badge high">${escapeHtml(t('high'))}</span>`;
  return `<span class="badge mid">${escapeHtml(labelFor(task.status || 'Open'))}</span>`;
}

function taskReasonBadges(task = {}) {
  const reasons = [
    isOverdue(task.due) ? ['urgent', t('overdue')] : null,
    task.blocked ? ['blocked', t('blocked')] : null,
    task.priority === 'High' ? ['high', t('high')] : null,
    isStaleTask(task) ? ['high', t('staleTasks')] : null,
    isThisWeek(task) ? ['mid', t('thisWeek')] : null,
    needsEvidence(task) ? ['urgent', t('needsEvidence')] : null,
  ].filter(Boolean);
  if (!reasons.length) return '';
  return `<div class="student-task-reasons">${reasons.map(([kind, label]) => `<span class="badge ${escapeHtml(kind)}">${escapeHtml(label)}</span>`).join('')}</div>`;
}

function renderStudentTaskList(tasks = [], emptyLabel = t('noOpenTasks'), categories = [], options = {}) {
  const rows = (options.preserveOrder ? [...tasks] : sortByDue(tasks)).slice(0, 8);
  const taskCategories = categories.length ? categories : ['General'];
  if (!rows.length) return `<div class="student-empty">${escapeHtml(emptyLabel)}</div>`;
  return rows.map((task) => {
    const selectedCategory = taskCategories.includes(task.category) ? task.category : taskCategories[0] || 'General';
    return `
      <div class="student-task-row">
        <div class="student-task-main">
          <strong>${escapeHtml(task.name || t('task'))}</strong>
          <span>${escapeHtml(task.due || '-')} | ${escapeHtml(labelFor(task.category || 'General'))}</span>
          <span class="student-task-updated">${escapeHtml(t('lastUpdated'))}: ${escapeHtml(formatTaskUpdatedAt(taskUpdatedAt(task)))}</span>
          ${taskReasonBadges(task)}
        </div>
        <div class="student-task-actions">
          ${taskBadge(task)}
          <select class="student-status-select" data-task-status="${escapeHtml(task.id)}" aria-label="${escapeHtml(t('status'))}">
            ${['Open', 'In Progress', 'Done'].map(status => `<option value="${escapeHtml(status)}" ${task.status === status ? 'selected' : ''}>${escapeHtml(labelFor(status))}</option>`).join('')}
          </select>
          <select class="student-priority-select ${task.priority === 'High' ? 'urgent' : task.priority === 'Low' ? 'done' : 'mid'}" data-task-priority="${escapeHtml(task.id)}" aria-label="${escapeHtml(t('priority'))}">
            ${['High', 'Medium', 'Low'].map(priority => `<option value="${escapeHtml(priority)}" ${task.priority === priority ? 'selected' : ''}>${escapeHtml(labelFor(priority))}</option>`).join('')}
          </select>
          <select class="student-category-select" data-task-category="${escapeHtml(task.id)}" aria-label="${escapeHtml(t('category'))}">
            ${taskCategories.map(category => `<option value="${escapeHtml(category)}" ${selectedCategory === category ? 'selected' : ''}>${escapeHtml(labelFor(category))}</option>`).join('')}
          </select>
          <input class="student-due-input" type="date" data-task-due="${escapeHtml(task.id)}" value="${escapeHtml(task.due || '')}" aria-label="${escapeHtml(t('due'))}">
          <button class="btn btn-sm ${task.blocked ? 'btn-danger' : ''}" type="button" data-student-blocked-toggle="${escapeHtml(task.id)}">${escapeHtml(task.blocked ? t('unblockTask') : t('markBlocked'))}</button>
          ${task.status !== 'Done' ? `<button class="btn btn-sm btn-success" type="button" data-student-complete="${escapeHtml(task.id)}">${escapeHtml(labelFor('Done'))}</button>` : ''}
          <button class="btn btn-sm" type="button" data-page="tasks" data-task-search-preset="${escapeHtml(task.name || '')}" data-student-task-open>${escapeHtml(t('open'))}</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderTodayFocusPanel(openTasks = [], categories = []) {
  const rows = sortByStudentPriority(openTasks).slice(0, 3);
  return `
    <div class="card student-panel student-today-focus-panel">
      <div class="student-panel-head">
        <h2>${escapeHtml(t('todayFocus'))}</h2>
        <button class="btn btn-sm" type="button" data-student-scroll-target="student-next-actions">${escapeHtml(t('todayNextActions'))}</button>
      </div>
      ${renderStudentTaskList(rows, t('noOpenTasks'), categories, { preserveOrder: true })}
    </div>`;
}

function renderNeedsEvidenceList(tasks = []) {
  const rows = sortByDue(tasks.filter(needsEvidence)).slice(0, 6);
  if (!rows.length) return `<div class="student-empty">${escapeHtml(t('noEvidenceNeeded'))}</div>`;
  return rows.map(task => `
    <div class="student-task-row student-evidence-needed-row">
      <div class="student-task-main">
        <strong>${escapeHtml(task.name || t('task'))}</strong>
        <span>${escapeHtml(task.due || '-')} | ${escapeHtml(labelFor(task.priority || 'Medium'))} | ${escapeHtml(labelFor(task.status || 'Open'))}</span>
      </div>
      <div class="student-task-actions">
        <span class="badge urgent">${escapeHtml(t('needsEvidence'))}</span>
        <button class="btn btn-sm btn-primary" type="button" data-student-evidence-focus="${escapeHtml(task.id)}">${escapeHtml(t('saveEvidence'))}</button>
      </div>
    </div>
  `).join('');
}

function renderStudentReportForm(tasks = []) {
  const rows = sortByDue(tasks);
  return `
    <div class="card student-panel student-report-panel" data-student-report-root>
      <div class="student-panel-head">
        <h2>${escapeHtml(t('quickProgressReport'))}</h2>
      </div>
      <div class="student-report-grid">
        <label>${escapeHtml(t('task'))}<select data-student-report-task>
          <option value="">${escapeHtml(t('chooseTask'))}</option>
          ${rows.map(task => `<option value="${escapeHtml(task.id)}">${escapeHtml(task.name || t('task'))}</option>`).join('')}
        </select></label>
        <label>${escapeHtml(t('reportDone'))}<textarea rows="2" data-student-report-done placeholder="${escapeHtml(t('reportDone'))}"></textarea></label>
        <label>${escapeHtml(t('reportBlocker'))}<textarea rows="2" data-student-report-blocker placeholder="${escapeHtml(t('reportBlocker'))}"></textarea></label>
        <label>${escapeHtml(t('reportNext'))}<textarea rows="2" data-student-report-next placeholder="${escapeHtml(t('reportNext'))}"></textarea></label>
      </div>
      <div class="student-report-actions">
        <button class="btn btn-primary" type="button" data-student-report-save>${escapeHtml(t('saveReport'))}</button>
      </div>
    </div>`;
}

function renderStudentEvidenceForm(tasks = []) {
  const rows = sortByDue(tasks);
  return `
    <div class="card student-panel student-evidence-panel" data-student-evidence-root>
      <div class="student-panel-head">
        <h2>${escapeHtml(t('quickEvidenceSubmit'))}</h2>
      </div>
      <div class="student-evidence-grid">
        <label>${escapeHtml(t('task'))}<select data-student-evidence-task>
          <option value="">${escapeHtml(t('chooseTask'))}</option>
          ${rows.map(task => `<option value="${escapeHtml(task.id)}">${escapeHtml(task.name || t('task'))}</option>`).join('')}
        </select></label>
        <label>${escapeHtml(t('evidenceLabel'))}<input data-student-evidence-label placeholder="${escapeHtml(t('evidenceLabel'))}"></label>
        <label>${escapeHtml(t('evidenceUrl'))}<input data-student-evidence-url type="url" placeholder="https://..."></label>
        <label>${escapeHtml(t('evidenceNote'))}<textarea rows="2" data-student-evidence-note placeholder="${escapeHtml(t('evidenceNote'))}"></textarea></label>
      </div>
      <div class="student-report-actions">
        <button class="btn btn-primary" type="button" data-student-evidence-save>${escapeHtml(t('saveEvidence'))}</button>
      </div>
    </div>`;
}

function renderStudentAddTaskForm(selectedOwner = '', categories = []) {
  const taskCategories = categories.length ? categories : ['General'];
  return `
    <div class="card student-panel student-add-task-panel" data-student-add-task-root>
      <div class="student-panel-head">
        <h2>${escapeHtml(t('addMyTask'))}</h2>
      </div>
      <div class="student-add-task-grid">
        <label>${escapeHtml(t('task'))}<input data-student-task-name placeholder="${escapeHtml(t('task'))}"></label>
        <label>${escapeHtml(t('due'))}<input data-student-task-due type="date"></label>
        <label>${escapeHtml(t('priority'))}<select data-student-task-priority>
          ${['High', 'Medium', 'Low'].map(priority => `<option value="${escapeHtml(priority)}" ${priority === 'Medium' ? 'selected' : ''}>${escapeHtml(labelFor(priority))}</option>`).join('')}
        </select></label>
        <label>${escapeHtml(t('category'))}<select data-student-task-category>
          ${taskCategories.map(category => `<option value="${escapeHtml(category)}">${escapeHtml(labelFor(category))}</option>`).join('')}
        </select></label>
        <input type="hidden" data-student-task-owner value="${escapeHtml(selectedOwner)}">
        <button class="btn btn-primary" type="button" data-student-task-add>${escapeHtml(t('addMyTask'))}</button>
      </div>
    </div>`;
}

function buildStudentDailySummary(owner = '', openTasks = [], overdueTasks = [], blockedTasks = [], evidenceTasks = [], nextTasks = []) {
  const lineFor = task => `- ${task.name || t('task')} (${task.due || '-'})`;
  return [
    `${t('student')}: ${owner || '-'}`,
    `${t('myActiveTasks')}: ${openTasks.length}`,
    `${t('overdue')}: ${overdueTasks.length}`,
    `${t('blocked')}: ${blockedTasks.length}`,
    `${t('needsEvidence')}: ${evidenceTasks.length}`,
    '',
    `${t('todayNextActions')}:`,
    ...(nextTasks.length ? nextTasks.slice(0, 5).map(lineFor) : [`- ${t('noOpenTasks')}`]),
  ].join('\n');
}

function renderStudentDailySummary(owner = '', openTasks = [], overdueTasks = [], blockedTasks = [], evidenceTasks = [], nextTasks = []) {
  return `
    <div class="card student-panel student-summary-panel">
      <div class="student-panel-head">
        <h2>${escapeHtml(t('dailyReportSummary'))}</h2>
        <button class="btn btn-sm btn-primary" type="button" data-student-summary-copy>${escapeHtml(t('copySummary'))}</button>
      </div>
      <textarea class="student-summary-text" data-student-summary-text readonly>${escapeHtml(buildStudentDailySummary(owner, openTasks, overdueTasks, blockedTasks, evidenceTasks, nextTasks))}</textarea>
    </div>`;
}

function renderMentorOverview(members = [], tasks = []) {
  const owners = unique([...members.map(member => member.name), ...tasks.map(task => task.owner)])
    .filter(owner => owner !== 'Unassigned');
  const rows = owners.map((owner) => {
    const open = tasks.filter(task => clean(task.owner) === owner && isOpenTask(task));
    return {
      owner,
      open: open.length,
      overdue: open.filter(task => isOverdue(task.due)).length,
      blocked: open.filter(task => task.blocked).length,
      week: open.filter(isThisWeek).length,
      evidence: tasks.filter(task => clean(task.owner) === owner && needsEvidence(task)).length,
      stale: open.filter(isStaleTask).length,
    };
  }).sort((a, b) => (b.overdue - a.overdue) || (b.blocked - a.blocked) || (b.evidence - a.evidence) || (b.stale - a.stale) || (b.open - a.open) || a.owner.localeCompare(b.owner));
  const riskRows = rows
    .filter(row => row.overdue || row.blocked || row.evidence || row.stale || row.week)
    .slice(0, 3);

  return `
    <details id="student-mentor-overview" class="card student-panel student-mentor-panel">
      <summary class="student-mentor-summary">
        <h2>${escapeHtml(t('mentorOverview'))}</h2>
        <div class="student-mentor-summary-actions">
          <button class="btn btn-sm btn-primary" type="button" data-mentor-summary-copy>${escapeHtml(t('copySummary'))}</button>
          <button class="btn btn-sm" type="button" data-mentor-export-csv>${escapeHtml(t('exportCsv'))}</button>
          <button class="btn btn-sm" type="button" data-page="members">${escapeHtml(t('members'))}</button>
        </div>
      </summary>
      <div class="student-mentor-controls">
        <label><input type="checkbox" data-mentor-risk-only> ${escapeHtml(t('showRiskOnly'))}</label>
        <label>${escapeHtml(t('sort'))}<select data-mentor-sort>
          <option value="risk">${escapeHtml(t('sortRiskFirst'))}</option>
          <option value="owner">${escapeHtml(t('sortName'))}</option>
          <option value="open">${escapeHtml(t('sortOpenTasks'))}</option>
          <option value="overdue">${escapeHtml(t('sortOverdueTasks'))}</option>
          <option value="blocked">${escapeHtml(t('sortBlockedTasks'))}</option>
          <option value="evidence">${escapeHtml(t('needsEvidence'))}</option>
          <option value="stale">${escapeHtml(t('staleTasks'))}</option>
          <option value="week">${escapeHtml(t('sortWeekTasks'))}</option>
        </select></label>
      </div>
      <div class="student-mentor-risk-panel">
        <div class="student-mentor-risk-title">${escapeHtml(t('mentorFollowUpToday'))}</div>
        <div class="student-mentor-risk-grid">
          ${riskRows.map(row => `
            <div class="student-mentor-risk-card">
              <button class="student-mentor-owner" type="button" data-student-owner-switch="${escapeHtml(row.owner)}">${escapeHtml(row.owner)}</button>
              <div>
                ${row.overdue ? `<button class="badge urgent student-mentor-count" type="button" data-page="tasks" data-task-owner-preset="${escapeHtml(row.owner)}" data-task-health-preset="overdue">${escapeHtml(t('overdue'))}: ${escapeHtml(row.overdue)}</button>` : ''}
                ${row.blocked ? `<button class="badge blocked student-mentor-count" type="button" data-page="tasks" data-task-owner-preset="${escapeHtml(row.owner)}" data-task-health-preset="blocked">${escapeHtml(t('blocked'))}: ${escapeHtml(row.blocked)}</button>` : ''}
                ${row.evidence ? `<button class="badge urgent student-mentor-count" type="button" data-page="tasks" data-task-owner-preset="${escapeHtml(row.owner)}" data-task-evidence-preset="without">${escapeHtml(t('needsEvidence'))}: ${escapeHtml(row.evidence)}</button>` : ''}
                ${row.stale ? `<button class="badge high student-mentor-count" type="button" data-page="tasks" data-task-owner-preset="${escapeHtml(row.owner)}" data-task-health-preset="stale" data-task-sort-preset="updated-desc">${escapeHtml(t('staleTasks'))}: ${escapeHtml(row.stale)}</button>` : ''}
                ${row.week ? `<button class="badge mid student-mentor-count" type="button" data-page="tasks" data-task-owner-preset="${escapeHtml(row.owner)}" data-task-health-preset="this-week">${escapeHtml(t('thisWeek'))}: ${escapeHtml(row.week)}</button>` : ''}
              </div>
            </div>
          `).join('') || `<div class="student-empty">${escapeHtml(t('noActionItems'))}</div>`}
        </div>
      </div>
      <div class="student-mentor-table">
        <div class="student-mentor-row head">
          <span>${escapeHtml(t('student'))}</span>
          <span>${escapeHtml(t('myActiveTasks'))}</span>
          <span>${escapeHtml(t('overdue'))}</span>
          <span>${escapeHtml(t('blocked'))}</span>
          <span>${escapeHtml(t('needsEvidence'))}</span>
          <span>${escapeHtml(t('staleTasks'))}</span>
          <span>${escapeHtml(t('thisWeek'))}</span>
          <span></span>
        </div>
        ${rows.map(row => `
          <div class="student-mentor-row" data-mentor-summary-row data-owner="${escapeHtml(row.owner)}" data-open="${escapeHtml(row.open)}" data-overdue="${escapeHtml(row.overdue)}" data-blocked="${escapeHtml(row.blocked)}" data-evidence="${escapeHtml(row.evidence)}" data-stale="${escapeHtml(row.stale)}" data-week="${escapeHtml(row.week)}">
            <button class="student-mentor-owner" type="button" data-student-owner-switch="${escapeHtml(row.owner)}">${escapeHtml(row.owner)}</button>
            <button class="badge mid student-mentor-count" type="button" data-page="tasks" data-task-owner-preset="${escapeHtml(row.owner)}" data-task-status-preset="active" title="${escapeHtml(t('myActiveTasks'))}">${escapeHtml(row.open)}</button>
            <button class="badge ${row.overdue ? 'urgent' : 'done'} student-mentor-count" type="button" data-page="tasks" data-task-owner-preset="${escapeHtml(row.owner)}" data-task-health-preset="overdue" title="${escapeHtml(t('overdue'))}">${escapeHtml(row.overdue)}</button>
            <button class="badge ${row.blocked ? 'blocked' : 'done'} student-mentor-count" type="button" data-page="tasks" data-task-owner-preset="${escapeHtml(row.owner)}" data-task-health-preset="blocked" title="${escapeHtml(t('blocked'))}">${escapeHtml(row.blocked)}</button>
            <button class="badge ${row.evidence ? 'urgent' : 'done'} student-mentor-count" type="button" data-page="tasks" data-task-owner-preset="${escapeHtml(row.owner)}" data-task-evidence-preset="without" title="${escapeHtml(t('needsEvidence'))}">${escapeHtml(row.evidence)}</button>
            <button class="badge ${row.stale ? 'high' : 'done'} student-mentor-count" type="button" data-page="tasks" data-task-owner-preset="${escapeHtml(row.owner)}" data-task-health-preset="stale" data-task-sort-preset="updated-desc" title="${escapeHtml(t('staleTasks'))}">${escapeHtml(row.stale)}</button>
            <button class="badge mid student-mentor-count" type="button" data-page="tasks" data-task-owner-preset="${escapeHtml(row.owner)}" data-task-health-preset="this-week" title="${escapeHtml(t('thisWeek'))}">${escapeHtml(row.week)}</button>
            <div class="student-mentor-actions">
              <button class="btn btn-sm" type="button" data-mentor-row-copy>${escapeHtml(t('copySummary'))}</button>
              <button class="btn btn-sm" type="button" data-page="tasks" data-task-owner-preset="${escapeHtml(row.owner)}" data-task-status-preset="active">${escapeHtml(t('open'))}</button>
            </div>
          </div>
        `).join('') || `<div class="student-empty">${escapeHtml(t('noMemberWorkload'))}</div>`}
      </div>
    </details>`;
}

export function renderStudentWorkspace(state, options = {}) {
  const tasks = Array.isArray(state.data.tasks) ? state.data.tasks : [];
  const members = Array.isArray(state.data.members) ? state.data.members : [];
  const taskCategories = state.data.masterData?.taskTypes || [];
  const ownerSuggestions = unique([...members.map(member => member.name), ...tasks.map(task => task.owner)]);
  const selectedOwner = clean(options.myOwner) || ownerSuggestions[0] || '';
  const ownerTasks = tasks.filter(task => clean(task.owner) === selectedOwner);
  const openTasks = ownerTasks.filter(isOpenTask);
  const overdueTasks = openTasks.filter(task => isOverdue(task.due));
  const thisWeekTasks = openTasks.filter(isThisWeek);
  const blockedTasks = openTasks.filter(task => task.blocked);
  const evidenceTasks = ownerTasks.filter(needsEvidence);
  const nextTasks = sortByDue(openTasks).slice(0, 5);

  return `
    <section id="page-student" class="page active student-page" style="display:grid;gap:12px">
      <div class="page-topbar">
        <div>
          <h1 style="margin:0;color:var(--navy)">${escapeHtml(t('studentWorkspace'))}</h1>
          <div class="page-top-summary">${escapeHtml(t('studentWorkspaceSummary'))}</div>
        </div>
        <div class="student-owner-control">
          <label>${escapeHtml(t('student'))}<select data-student-owner>
            <option value="">${escapeHtml(t('chooseOwner'))}</option>
            ${ownerSuggestions.map(owner => `<option value="${escapeHtml(owner)}" ${selectedOwner === owner ? 'selected' : ''}>${escapeHtml(owner)}</option>`).join('')}
          </select></label>
          <button class="btn btn-sm btn-primary" type="button" data-student-scroll-mentor>${escapeHtml(t('mentorOverview'))}</button>
        </div>
      </div>

      <div class="student-stat-row">
        ${[
          [t('myActiveTasks'), openTasks.length, 'active'],
          [t('overdue'), overdueTasks.length, 'overdue'],
          [t('thisWeek'), thisWeekTasks.length, 'week'],
          [t('blocked'), blockedTasks.length, 'blocked'],
        ].map(([label, value, kind]) => `
          <button class="student-stat-card ${escapeHtml(kind)}" type="button" data-page="tasks" data-task-owner-preset="${escapeHtml(selectedOwner)}" ${kind === 'overdue' ? 'data-task-health-preset="overdue"' : ''} ${kind === 'week' ? 'data-task-health-preset="this-week"' : ''} ${kind === 'blocked' ? 'data-task-health-preset="blocked"' : ''} ${kind === 'active' ? 'data-task-status-preset="active"' : ''}>
            <span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong>
          </button>
        `).join('')}
      </div>

      <div class="student-jump-row">
        ${[
          ['page-student', t('top')],
          ['student-next-actions', t('todayNextActions')],
          ['student-week', t('thisWeek')],
          ['student-evidence-needed', t('needsEvidence')],
          ['student-report-panel', t('quickProgressReport')],
          ['student-mentor-overview', t('mentorOverview')],
        ].map(([target, label]) => `<button class="btn btn-sm" type="button" data-student-scroll-target="${escapeHtml(target)}">${escapeHtml(label)}</button>`).join('')}
      </div>

      ${renderTodayFocusPanel(openTasks, taskCategories)}

      <div class="student-grid">
        <div id="student-next-actions" class="card student-panel student-panel-wide student-today-focus-panel">
          <div class="student-panel-head">
            <h2>${escapeHtml(t('todayNextActions'))}</h2>
            <button class="btn btn-sm" type="button" data-page="tasks" data-task-owner-preset="${escapeHtml(selectedOwner)}" data-task-status-preset="active">${escapeHtml(t('open'))}</button>
          </div>
          ${renderStudentTaskList(nextTasks, t('noOpenTasks'), taskCategories)}
        </div>

        <div id="student-week" class="card student-panel student-panel-wide">
          <div class="student-panel-head">
            <h2>${escapeHtml(t('thisWeek'))}</h2>
            <button class="btn btn-sm" type="button" data-page="tasks" data-task-owner-preset="${escapeHtml(selectedOwner)}" data-task-health-preset="this-week">${escapeHtml(t('open'))}</button>
          </div>
          ${renderStudentTaskList(thisWeekTasks, t('noWeekFocus'), taskCategories)}
        </div>
        <div id="student-evidence-needed" class="card student-panel student-panel-wide">
          <div class="student-panel-head">
            <h2>${escapeHtml(t('needsEvidence'))}</h2>
            <button class="btn btn-sm" type="button" data-page="tasks" data-task-owner-preset="${escapeHtml(selectedOwner)}" data-task-evidence-preset="without">${escapeHtml(t('open'))}</button>
          </div>
          ${renderNeedsEvidenceList(ownerTasks)}
        </div>
        <div id="student-report-panel" class="student-panel-wide">
          ${renderStudentReportForm(openTasks)}
        </div>
        <div class="student-panel-wide">
          ${renderStudentEvidenceForm(openTasks)}
        </div>
        <div class="student-panel-wide">
          ${renderStudentAddTaskForm(selectedOwner, taskCategories)}
        </div>
      </div>
      ${renderMentorOverview(members, tasks)}
      ${renderStudentDailySummary(selectedOwner, openTasks, overdueTasks, blockedTasks, evidenceTasks, nextTasks)}
    </section>`;
}

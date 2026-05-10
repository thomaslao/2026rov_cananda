import { escapeHtml } from '../utils/index.js';
import { labelFor, t } from '../utils/i18n.js';
import { buildV15AuditHighlights, buildV15DbCoverage, summarizeV15DbCoverage } from '../data/diagnostics.js';
import { DB_TABLES } from '../data/supabase.js';
import { DEFAULT_TASK_CATEGORIES } from '../data/defaults.js';
import { getDataHealthIssues } from './health.js';

export const SETTINGS_PACK_TYPE = 'rov_v16_settings_pack';

export const MASTER_DATA_TYPES = {
  roles: 'Roles',
  groups: 'Groups',
  taskTypes: 'Task Categories',
  gearCats: 'Gear Categories',
};

const TASK_CATEGORY_DETAILS = {
  'E1 Electronics': { group: 'Engineering Design', zh: 'Electronics', en: 'Electronics', folder: '02Electronic' },
  'E2 Mechanical': { group: 'Engineering Design', zh: 'Mechanical', en: 'Mechanical', folder: '03Mechanic' },
  'E3 Software': { group: 'Engineering Design', zh: 'Software', en: 'Software', folder: '04Software' },
  'E4 Buoyancy & Float': { group: 'Engineering Design', zh: 'Buoyancy & Float', en: 'Buoyancy & Float', folder: '05Float' },
  'E5 Sensor & Payload': { group: 'Engineering Design', zh: 'Sensor & Payload', en: 'Sensor & Payload', folder: '?啣?' },
  'E6 Power System': { group: 'Engineering Design', zh: 'Power System', en: 'Power System', folder: '?啣?' },
  'E7 Testing Log': { group: 'Engineering Design', zh: 'Testing Log', en: 'Testing Log', folder: '?啣?' },
  'C1 Task Mission': { group: 'Competition Management', zh: 'Task Mission', en: 'Task Mission', folder: '?啣?' },
  'C1 Technical Report': { group: 'Competition Management', zh: 'Technical Report', en: 'Technical Report', folder: '?啣?' },
  'C1 Presentation': { group: 'Competition Management', zh: 'Presentation', en: 'Presentation', folder: '08Pilot / ?啣?' },
  'C1 Score Analysis': { group: 'Competition Management', zh: 'Score Analysis', en: 'Score Analysis', folder: '10_2026HK_Score' },
  'L1 Documentation': { group: 'Logistics & Administration', zh: 'Documentation', en: 'Documentation', folder: '01Document' },
  'L1 Finance': { group: 'Logistics & Administration', zh: 'Finance', en: 'Finance', folder: '06Finance' },
  'L1 Travel': { group: 'Logistics & Administration', zh: 'Travel', en: 'Travel', folder: 'Travelling' },
  'L1 Safety': { group: 'Logistics & Administration', zh: 'Safety', en: 'Safety', folder: '?啣?' },
  'P1 Public Relation': { group: 'Public Affairs', zh: 'Public Relation', en: 'Public Relation', folder: '07Public Relation' },
  'P1 Marketing Display': { group: 'Public Affairs', zh: 'Marketing Display', en: 'Marketing Display', folder: '09 Marketing Display' },
  'P1 Sponsorship': { group: 'Public Affairs', zh: 'Sponsorship', en: 'Sponsorship', folder: '?啣?' },
  'P1 Media Coverage': { group: 'Public Affairs', zh: 'Media Coverage', en: 'Media Coverage', folder: '?啣?' },
  'T1 Training Plan': { group: 'Team Development', zh: 'Training Plan', en: 'Training Plan', folder: '?啣?' },
  'T1 Meeting Notes': { group: 'Team Development', zh: 'Meeting Notes', en: 'Meeting Notes', folder: '?啣?' },
  'T1 Mentor Guidance': { group: 'Team Development', zh: 'Mentor Guidance', en: 'Mentor Guidance', folder: '?啣?' },
};

export const V15_DB_TABLE_LABELS = {
  tasks: 'Tasks',
  members: 'Members',
  checklist_items: 'Checklist',
  predive_checklist_items: 'Pre-dive',
  intel: 'Intel',
  notes: 'Notes',
  quotes: 'Quotes',
  task_attachments: 'Evidence',
  audit_log: 'V15 Audit',
  strategy_items: 'Strategy',
  practice_runs: 'Practice',
  mission_runs: 'Mission Run',
};

function taskHealthPresetForIssue(issue) {
  if (issue?.title === 'Task has no owner') return 'unassigned';
  if (issue?.title === 'Task owner not in members') return 'missing-owner';
  if (issue?.title === 'High priority task has no due date') return 'high-no-due';
  return '';
}

function taskEvidencePresetForIssue(issue) {
  return issue?.title === 'Task missing evidence' ? 'without' : '';
}

export function cleanMasterValue(value) {
  return String(value || '').trim();
}

export function uniqueSorted(values) {
  return [...new Set(values.map(cleanMasterValue).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'en'));
}

function uniqueTaskCategories(values) {
  const cleaned = [...new Set(values.map(cleanMasterValue).filter(Boolean))];
  const defaults = DEFAULT_TASK_CATEGORIES.filter(category => cleaned.includes(category));
  const custom = cleaned
    .filter(category => !DEFAULT_TASK_CATEGORIES.includes(category))
    .sort((a, b) => a.localeCompare(b, 'en'));
  return [...defaults, ...custom];
}

export function getMasterData(state) {
  const data = state?.data?.masterData || {};
  return Object.fromEntries(
    Object.keys(MASTER_DATA_TYPES).map(type => [
      type,
      type === 'taskTypes' ? uniqueTaskCategories(data[type] || []) : uniqueSorted(data[type] || []),
    ]),
  );
}

export function ensureDefaultTaskCategories(state) {
  const current = getMasterData(state);
  const nextTaskTypes = uniqueSorted([...(current.taskTypes || []), ...DEFAULT_TASK_CATEGORIES]);
  if (nextTaskTypes.length === (current.taskTypes || []).length) return false;
  state.data.masterData = {
    ...current,
    taskTypes: nextTaskTypes,
  };
  state.dirtyFlags.masterData = true;
  return true;
}

export function loadMasterData(state) {
  return getMasterData(state);
}

export function saveMasterData(state) {
  const data = getMasterData(state);
  state.dirtyFlags.masterData = false;
  return data;
}

export function addMasterDataValue(state, type, value) {
  if (!MASTER_DATA_TYPES[type]) return false;
  const clean = cleanMasterValue(value);
  if (!clean) return false;
  const current = getMasterData(state);
  state.data.masterData = {
    ...current,
    [type]: uniqueSorted([...(current[type] || []), clean]),
  };
  state.dirtyFlags.masterData = true;
  return true;
}

export function deleteMasterDataValue(state, type, value) {
  if (!MASTER_DATA_TYPES[type]) return false;
  const clean = cleanMasterValue(value);
  const current = getMasterData(state);
  state.data.masterData = {
    ...current,
    [type]: uniqueSorted((current[type] || []).filter(item => item !== clean)),
  };
  state.dirtyFlags.masterData = true;
  return true;
}

export function buildSettingsPack(state, smokeHistory = []) {
  return {
    type: SETTINGS_PACK_TYPE,
    version: 1,
    appVersion: 'v16',
    season: state?.currentSeason || 'default',
    exportedAt: new Date().toISOString(),
    masterData: getMasterData(state),
    smokeHistory: smokeHistory.slice(0, 10),
  };
}

export function importSettingsPackPayload(state, payload) {
  if (!payload || ![SETTINGS_PACK_TYPE, 'rov_settings_pack'].includes(payload.type)) {
    throw new Error('Not a ROV settings pack');
  }
  if (payload.masterData) {
    state.data.masterData = {
      ...getMasterData(state),
      ...Object.fromEntries(
        Object.keys(MASTER_DATA_TYPES).map(type => [type, uniqueSorted(payload.masterData[type] || [])]),
      ),
    };
    state.dirtyFlags.masterData = true;
  }
  return getMasterData(state);
}

export function exportSettingsPack(state, smokeHistory = [], documentRef = document) {
  const payload = buildSettingsPack(state, smokeHistory);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = documentRef.createElement('a');
  link.href = url;
  link.download = `rov-v16-settings-pack-${payload.season || 'default'}-${new Date().toISOString().slice(0, 10)}.json`;
  documentRef.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return payload;
}

function buildOperationalSummary(state) {
  const data = state?.data || {};
  const tasks = data.tasks || [];
  const members = data.members || [];
  const activeTasks = tasks.filter(task => task.status !== 'Done');
  const today = new Date().toISOString().slice(0, 10);
  const weekEndDate = new Date();
  weekEndDate.setDate(weekEndDate.getDate() + 7);
  const weekEnd = weekEndDate.toISOString().slice(0, 10);
  const memberNames = new Set(members.map(member => String(member.name || '').trim()).filter(Boolean));
  const taskEvidence = task => (Array.isArray(task.evidence) ? task.evidence : [])
    .filter(item => String(item?.label || item?.url || item?.note || '').trim());
  const summarizeTask = task => ({
    id: task.id,
    name: task.name || '',
    owner: task.owner || '',
    due: task.due || '',
    priority: task.priority || '',
    status: task.status || '',
    blocked: Boolean(task.blocked),
    category: task.category || '',
    evidenceCount: taskEvidence(task).length,
  });
  const tasksWithEvidence = tasks.filter(task => taskEvidence(task).length);
  const missingEvidenceTasks = tasks
    .filter(task => (task.priority === 'High' || task.status === 'Done') && !taskEvidence(task).length)
    .sort((a, b) => {
      const priorityRank = { High: 0, Medium: 1, Low: 2 };
      const priority = (priorityRank[a.priority] ?? 9) - (priorityRank[b.priority] ?? 9);
      const due = String(a.due || '9999-12-31').localeCompare(String(b.due || '9999-12-31'));
      return priority || due || String(a.name || '').localeCompare(String(b.name || ''), 'en');
    })
    .slice(0, 20)
    .map(summarizeTask);
  const focusTasks = activeTasks
    .filter(task => task.blocked || task.priority === 'High' || (task.due && task.due <= weekEnd))
    .sort((a, b) => {
      const blocked = Number(Boolean(b.blocked)) - Number(Boolean(a.blocked));
      const overdue = Number(Boolean(b.due && b.due < today)) - Number(Boolean(a.due && a.due < today));
      const priorityRank = { High: 0, Medium: 1, Low: 2 };
      const priority = (priorityRank[a.priority] ?? 9) - (priorityRank[b.priority] ?? 9);
      const due = String(a.due || '9999-12-31').localeCompare(String(b.due || '9999-12-31'));
      return blocked || overdue || priority || due || String(a.name || '').localeCompare(String(b.name || ''), 'en');
    })
    .slice(0, 10)
    .map(summarizeTask);
  const unassignedTasks = activeTasks
    .filter((task) => {
      const owner = String(task.owner || '').trim();
      return !owner || owner === 'Unassigned' || !memberNames.has(owner);
    })
    .sort((a, b) => String(a.due || '9999-12-31').localeCompare(String(b.due || '9999-12-31')) || String(a.name || '').localeCompare(String(b.name || ''), 'en'))
    .slice(0, 10)
    .map(summarizeTask);
  const memberWorkload = members.map((member) => {
    const memberName = String(member.name || '').trim();
    const memberTasks = activeTasks.filter(task => String(task.owner || '').trim() === memberName);
    return {
      id: member.id,
      name: member.name || '',
      role: member.role || '',
      group: member.group || '',
      open: memberTasks.length,
      blocked: memberTasks.filter(task => task.blocked).length,
      high: memberTasks.filter(task => task.priority === 'High').length,
    };
  }).filter(row => row.open || row.blocked || row.high)
    .sort((a, b) => b.blocked - a.blocked || b.high - a.high || b.open - a.open || String(a.name || '').localeCompare(String(b.name || ''), 'en'))
    .slice(0, 10);
  const runScores = (data.missionRuns || []).map(run => Number(run.score || 0));
  return {
    window: { today, weekEnd },
    focusTasks,
    unassignedTasks,
    memberWorkload,
    evidenceSummary: {
      totalTasks: tasks.length,
      withEvidence: tasksWithEvidence.length,
      withoutEvidence: tasks.length - tasksWithEvidence.length,
      needsEvidence: missingEvidenceTasks.length,
    },
    missingEvidenceTasks,
    prepGaps: [
      ...(data.checklist || []).filter(item => !item.done).map(item => ({ type: 'checklist', id: item.id, title: item.label || '' })),
      ...(data.prediveChecklist || []).filter(item => !item.done).map(item => ({ type: 'preDive', id: item.id, title: item.label || '' })),
      ...(data.gearItems || []).filter(item => !item.packed).map(item => ({ type: 'gear', id: item.id, title: item.name || '', qty: item.qty || 1, category: item.category || '' })),
    ].slice(0, 20),
    intelGaps: [
      ...(data.intel || []).filter(item => item.status !== 'Ready').map(item => ({ type: 'intel', id: item.id, title: item.title || '', status: item.status || 'Draft' })),
      ...(data.strategy || []).filter(item => item.status !== 'Ready').map(item => ({ type: 'strategy', id: item.id, title: item.title || '', status: item.status || 'Draft' })),
    ].slice(0, 20),
    runSummary: runScores.length ? {
      latest: data.missionRuns?.[0] || null,
      best: Math.max(...runScores),
      average: Math.round(runScores.reduce((sum, score) => sum + score, 0) / runScores.length),
      count: runScores.length,
    } : null,
  };
}

export function buildHandoffReport(options = {}) {
  const {
    state,
    smokeHistory = [],
    dbStatus = null,
    schemaStatus = null,
    syncPreview = null,
    postWritePreview = null,
    writeAuditLog = [],
    migrationSummary = null,
    rollbackSummary = null,
  } = options;
  const stats = getSettingsCenterStats(state, smokeHistory, migrationSummary, dbStatus, syncPreview, null, postWritePreview, schemaStatus, writeAuditLog, rollbackSummary, null);
  const readiness = buildReleaseReadiness(stats);
  const readinessActionPlan = readiness.checks
    .filter(check => !check.ok)
    .map(check => ({
      label: check.label,
      detail: check.detail,
      nextStep: check.action?.label || 'Review',
      page: check.action?.page || '',
      settingsSection: check.action?.settingsScroll || '',
      taskEvidencePreset: check.action?.taskEvidencePreset || '',
      dashboardHealthFocus: Boolean(check.action?.dashboardHealthFocus),
      readinessAction: check.action?.readinessAction || '',
    }));
  const operationalSummary = buildOperationalSummary(state);
  const healthIssues = getDataHealthIssues(state);
  const validationSummary = {
    packageFile: 'ROV_Task_Manager_v16.html',
    directOpenLauncher: '../OPEN_V16.html',
    latestSmokeOk: Boolean(stats.latestSmoke?.ok && stats.failedSmoke === 0),
    latestSmokeChecks: stats.latestSmoke?.checks?.length || 0,
    readinessPassed: readiness.passed,
    readinessTotal: readiness.total,
    unresolvedBlockers: readinessActionPlan.length,
  };
  const v15DbCoverage = buildV15DbCoverage(dbStatus).map(row => ({
    ...row,
    label: V15_DB_TABLE_LABELS[row.table] || row.table,
  }));
  const v15DbReadiness = summarizeV15DbCoverage(v15DbCoverage);
  const v15DbCoverageValue = v15DbReadiness.label;
  const v15AuditHighlights = buildV15AuditHighlights(state?.data?.v15AuditLog || [], 8);
  const dashboardSafetySummary = [
    { label: 'Package', value: validationSummary.packageFile },
    {
      label: 'Smoke',
      value: validationSummary.latestSmokeOk ? `${validationSummary.latestSmokeChecks} checks` : 'Not passed',
      action: 'run-v16-smoke',
    },
    {
      label: 'Readiness',
      value: `${validationSummary.readinessPassed}/${validationSummary.readinessTotal}`,
      page: 'settings',
      settingsSection: 'settings-release-readiness',
    },
    {
      label: 'Blockers',
      value: String(validationSummary.unresolvedBlockers),
      page: 'settings',
      settingsSection: 'settings-release-readiness',
    },
    {
      label: 'V15 DB',
      value: v15DbCoverageValue,
      page: 'settings',
      settingsSection: 'settings-db-section',
    },
  ];
  return {
    type: 'rov_v16_handoff_report',
    version: 1,
    appVersion: 'v16',
    exportedAt: new Date().toISOString(),
    season: state?.currentSeason || 'default',
    validationSummary,
    dashboardSafetySummary,
    readiness,
    readinessActionPlan,
    counts: {
      tasks: stats.tasks,
      members: stats.members,
      checklist: stats.checklist,
      quotes: stats.quotes,
      practiceRuns: stats.practiceRuns,
      missionRuns: stats.missionRuns,
      gearItems: stats.gearItems,
      attachments: stats.attachments,
      v15AuditLog: stats.v15AuditLog,
      v15AuditHighlights: v15AuditHighlights.length,
      masterData: stats.masterTotal,
      smokeRuns: stats.smokeRuns,
      writeAuditEntries: writeAuditLog.length,
      healthIssues: healthIssues.length,
    },
    latestSmoke: stats.latestSmoke ? {
      ts: stats.latestSmoke.ts,
      ok: stats.latestSmoke.ok,
      checks: stats.latestSmoke.checks?.length || 0,
      failed: stats.failedSmoke,
    } : null,
    v15AuditLog: (state?.data?.v15AuditLog || []).slice(0, 8),
    v15AuditHighlights,
    v15DbCoverage,
    v15DbReadiness,
    supabase: {
      dbLoadedAt: dbStatus?.loadedAt || '',
      dbError: dbStatus?.error || '',
      importDelta: dbStatus?.importDelta || null,
      schemaProbedAt: schemaStatus?.ts || '',
      schemaTables: Object.keys(schemaStatus?.tables || {}),
      syncPreview: syncPreview ? {
        ts: syncPreview.ts,
        totalCreate: syncPreview.totalCreate,
        totalUpdate: syncPreview.totalUpdate,
        totalRemove: syncPreview.totalRemove,
      } : null,
      postWritePreview: postWritePreview ? {
        ts: postWritePreview.ts,
        totalCreate: postWritePreview.totalCreate,
        totalUpdate: postWritePreview.totalUpdate,
        totalRemove: postWritePreview.totalRemove,
      } : null,
    },
    healthIssues,
    operationalSummary,
    migrationSummary,
    rollbackSummary,
  };
}

export function exportHandoffReport(options = {}, documentRef = document) {
  const payload = buildHandoffReport(options);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = documentRef.createElement('a');
  link.href = url;
  link.download = `rov-v16-handoff-report-${payload.season || 'default'}-${new Date().toISOString().slice(0, 10)}.json`;
  documentRef.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return payload;
}

export function getSettingsCenterStats(state, smokeHistory = [], migrationSummary = null, dbStatus = null, syncPreview = null, writeResult = null, postWritePreview = null, schemaStatus = null, writeAuditLog = [], rollbackSummary = null, diagnosticsSummary = null) {
  const data = state?.data || {};
  const masterData = getMasterData(state);
  const latestSmoke = smokeHistory[0] || null;
  const failedSmoke = latestSmoke?.checks?.filter(check => !check.ok).length || 0;
  const healthIssues = getDataHealthIssues(state);
  const missingEvidenceTasks = healthIssues.filter(issue => issue.title === 'Task missing evidence').length;
  return {
    tasks: data.tasks?.length || 0,
    members: data.members?.length || 0,
    checklist: data.checklist?.length || 0,
    quotes: data.quotes?.length || 0,
    practiceRuns: data.practiceRuns?.length || 0,
    missionRuns: data.missionRuns?.length || 0,
    gearItems: data.gearItems?.length || 0,
    attachments: data.attachments?.length || 0,
    v15AuditLog: data.v15AuditLog?.length || 0,
    masterData,
    masterTotal: Object.values(masterData).reduce((sum, values) => sum + values.length, 0),
    smokeRuns: smokeHistory.length,
    healthIssues,
    missingEvidenceTasks,
    latestSmoke,
    failedSmoke,
    migrationSummary,
    dbStatus,
    syncPreview,
    writeResult,
    postWritePreview,
    schemaStatus,
    writeAuditLog,
    rollbackSummary,
    diagnosticsSummary,
  };
}

export function scrollSettingsSection(id, root = document) {
  const target = root.getElementById(id);
  if (!target) return false;
  if (target.tagName === 'DETAILS') target.open = true;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
  return true;
}

export function renderSettingsHub(container, options = {}) {
  if (!container) return;
  const { state, smokeHistory = [], migrationSummary = null, dbStatus = null, syncPreview = null, writeResult = null, postWritePreview = null, schemaStatus = null, writeAuditLog = [], rollbackSummary = null, diagnosticsSummary = null, appSavedAt = '', undoAvailable = false, actionLog = [] } = options;
  const pageFeatures = options.pageFeatures || {};
  const pageFeaturePages = pageFeatures.pages || [];
  const visiblePageIds = new Set(pageFeatures.visiblePageIds || []);
  const stats = getSettingsCenterStats(state, smokeHistory, migrationSummary, dbStatus, syncPreview, writeResult, postWritePreview, schemaStatus, writeAuditLog, rollbackSummary, diagnosticsSummary);
  const systemOk = stats.latestSmoke ? stats.failedSmoke === 0 : false;
  const readiness = buildReleaseReadiness(stats);
  const readinessActionPlan = readiness.checks.filter(check => !check.ok && check.action);
  const v15DbCoverage = buildV15DbCoverage(stats.dbStatus);
  const v15DbReadiness = summarizeV15DbCoverage(v15DbCoverage);
  const v15AuditHighlights = buildV15AuditHighlights(state?.data?.v15AuditLog || [], 5);
  const validationSummary = {
    packageFile: 'ROV_Task_Manager_v16.html',
    latestSmokeOk: Boolean(stats.latestSmoke?.ok && stats.failedSmoke === 0),
    latestSmokeChecks: stats.latestSmoke?.checks?.length || 0,
    readinessPassed: readiness.passed,
    readinessTotal: readiness.total,
    unresolvedBlockers: readinessActionPlan.length,
  };
  const savedAtLabel = appSavedAt ? new Date(appSavedAt).toLocaleString() : t('notSavedYet');
  const recentActions = actionLog.slice(0, 5);
  const safetyRows = [
    [t('undoSnapshot'), undoAvailable ? t('available') : t('notAvailable')],
    [t('recentActions'), String(actionLog.length)],
    [t('lastSaved'), savedAtLabel],
  ];
  const cards = [
    {
      title: 'Data',
      value: String(stats.tasks + stats.members + stats.missionRuns),
      detail: `Tasks ${stats.tasks} | Members ${stats.members} | Runs ${stats.missionRuns}`,
      section: 'settings-data-section',
      color: 'var(--blue)',
    },
    {
      title: 'Settings Pack',
      value: String(stats.masterTotal),
      detail: `Roles ${stats.masterData.roles.length} | Groups ${stats.masterData.groups.length} | Types ${stats.masterData.taskTypes.length}`,
      section: 'settings-pack-section',
      color: stats.masterTotal ? 'var(--green)' : 'var(--orange)',
    },
    {
      title: 'System / QA',
      value: stats.latestSmoke ? (systemOk ? 'OK' : 'FAIL') : 'Not run',
      detail: `Smoke ${stats.smokeRuns} | Failed ${stats.failedSmoke}`,
      section: 'settings-health-section',
      color: systemOk ? 'var(--green)' : 'var(--red)',
    },
  ];

  container.innerHTML = `
    <section id="page-settings" class="page active" style="display:grid;gap:12px">
      <div class="page-topbar">
        <div>
          <h1 style="margin:0;color:var(--navy)">${escapeHtml(t('settingsCenter'))}</h1>
          <div class="page-top-summary">${escapeHtml(t('settingsSummary'))}</div>
        </div>
        <div class="page-top-summary">${escapeHtml(t('productionFallback'))}</div>
        <div class="page-top-actions">
          <button class="btn btn-sm btn-primary" type="button" data-action="run-v16-smoke">${escapeHtml(t('smokeTest'))}</button>
          <button class="btn btn-sm" type="button" data-settings-scroll="settings-db-section">${escapeHtml(t('dbRead'))}</button>
          <button class="btn btn-sm" type="button" data-settings-scroll="settings-schema-section">${escapeHtml(t('schema'))}</button>
          <button class="btn btn-sm" type="button" data-settings-scroll="settings-audit-section">${escapeHtml(t('audit'))}</button>
          <button class="btn btn-sm" type="button" data-settings-scroll="settings-pack-section">${escapeHtml(t('settingsPack'))}</button>
          <button class="btn btn-sm" type="button" data-settings-scroll="settings-page-features">${escapeHtml(t('pageFeatures'))}</button>
          <button class="btn btn-sm" type="button" data-settings-scroll="settings-data-safety">${escapeHtml(t('dataSafety'))}</button>
          <button class="btn btn-sm" type="button" data-settings-scroll="settings-health-section">System / QA</button>
        </div>
      </div>

      <div id="settings-page-features" class="card">
        <div class="card-header">
          <div>
            <h2 class="card-header-title">${escapeHtml(t('pageFeatures'))}</h2>
            <div style="font-size:.82rem;color:var(--muted);font-weight:800">${escapeHtml(t('pageFeaturesHint'))}</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px">
          ${pageFeaturePages.map((page) => {
            const locked = page.id === 'dashboard' || page.id === 'student' || page.id === 'settings';
            const checked = locked || visiblePageIds.has(page.id);
            return `
              <label style="display:flex;align-items:center;gap:8px;border:1px solid var(--border);border-radius:8px;background:var(--input-bg);padding:9px;font-weight:900;color:var(--navy)">
                <input type="checkbox" data-page-feature="${escapeHtml(page.id)}" ${checked ? 'checked' : ''} ${locked ? 'disabled' : ''}>
                <span>${escapeHtml(t(page.labelKey))}</span>
                ${locked ? `<span class="badge done">${escapeHtml(t('alwaysOn'))}</span>` : ''}
              </label>
            `;
          }).join('')}
        </div>
      </div>

      <div id="settings-center-overview" class="card">
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:10px">
          <div>
            <h2 style="margin-bottom:4px">${escapeHtml(t('overview'))}</h2>
            <div style="font-size:.82rem;color:var(--muted);font-weight:800">${escapeHtml(t('overviewHint'))}</div>
          </div>
          <div style="font-size:1.25rem;font-weight:900;color:${systemOk ? 'var(--green)' : 'var(--red)'}">${escapeHtml(systemOk ? t('healthy') : t('check'))}</div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(185px,1fr));gap:10px">
          ${cards.map(card => `
            <button type="button" data-settings-scroll="${escapeHtml(card.section)}" style="text-align:left;border:1px solid var(--border);border-left:5px solid ${card.color};border-radius:8px;background:var(--input-bg);color:var(--text);padding:10px;cursor:pointer">
              <div style="font-size:.78rem;color:var(--muted);font-weight:900">${escapeHtml(card.title)}</div>
              <div style="font-size:1.35rem;font-weight:900;color:${card.color};margin:3px 0">${escapeHtml(card.value)}</div>
              <div style="font-size:.78rem;color:var(--muted);font-weight:800;line-height:1.4">${escapeHtml(card.detail)}</div>
            </button>
          `).join('')}
        </div>
        <div id="settings-data-safety" class="dashboard-safety-card" data-settings-data-safety style="border:1px solid var(--border);border-left:5px solid var(--blue);border-radius:8px;background:var(--input-bg);padding:10px;margin-top:10px">
          <div class="dashboard-safety-header">
            <div class="dashboard-safety-copy">
              <h2 style="margin:0">${escapeHtml(t('dataSafety'))}</h2>
              <div class="dashboard-safety-hint">${escapeHtml(t('dataSafetyHint'))}</div>
              <div class="dashboard-safety-save" data-settings-save-state>${escapeHtml(t('lastSaved'))}: ${escapeHtml(savedAtLabel)}</div>
            </div>
            <div class="dashboard-safety-actions">
              <div class="dashboard-action-group" data-settings-safety-report-actions>
                <button class="btn btn-sm" type="button" data-action="export-handoff-report">${escapeHtml(t('exportHandoffReport'))}</button>
                <button class="btn btn-sm" type="button" data-action="export-safety-report">${escapeHtml(t('exportSafetyReport'))}</button>
              </div>
              <div class="dashboard-action-group dashboard-action-group-maintenance" data-settings-safety-maintenance-actions>
                <button class="btn btn-sm" type="button" data-action="clear-safety-metadata">${escapeHtml(t('clearSafetyMetadata'))}</button>
              </div>
            </div>
          </div>
          <div class="dashboard-safety-status-grid" data-settings-safety-status>
            ${safetyRows.map(([label, value]) => `
              <div class="dashboard-safety-status">
                <div class="dashboard-safety-status-label">${escapeHtml(label)}</div>
                <div class="dashboard-safety-status-value">${escapeHtml(value)}</div>
              </div>
            `).join('')}
          </div>
          <div data-settings-action-log style="margin-top:10px;border-top:1px solid var(--border);padding-top:8px">
            <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:5px">
              <div style="font-size:.78rem;color:var(--navy);font-weight:900">${escapeHtml(t('recentActions'))}</div>
              <div style="display:flex;gap:6px;flex-wrap:wrap">
                <button class="btn btn-sm" type="button" data-action="export-action-log">${escapeHtml(t('exportActionLog'))}</button>
                <button class="btn btn-sm" type="button" data-action="clear-action-log">${escapeHtml(t('clearActionLog'))}</button>
              </div>
            </div>
            ${recentActions.length ? `<div style="display:grid;gap:4px">
              ${recentActions.map(action => `
                <div style="display:grid;grid-template-columns:150px 1fr;gap:8px;font-size:.76rem;color:var(--muted);font-weight:850">
                  <span>${escapeHtml(new Date(action.ts).toLocaleString())}</span>
                  <span>${escapeHtml(action.message)}</span>
                </div>
              `).join('')}
            </div>` : `<div style="font-size:.76rem;color:var(--muted);font-weight:850">${escapeHtml(t('noRecentActions'))}</div>`}
          </div>
        </div>
        <div id="settings-release-readiness" style="border:1px solid var(--border);border-left:5px solid ${readiness.ready ? 'var(--green)' : 'var(--orange)'};border-radius:8px;background:var(--input-bg);padding:10px;margin-top:10px">
          <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px">
            <div>
              <div style="font-size:.86rem;font-weight:900;color:var(--navy)">${escapeHtml(t('releaseReadiness'))}</div>
              <div style="font-size:.78rem;color:var(--muted);font-weight:800">${escapeHtml(t('releaseReadinessHint'))}</div>
            </div>
            <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
              <button class="btn btn-sm" type="button" data-action="export-handoff-report">${escapeHtml(t('exportHandoffReport'))}</button>
              <span class="badge ${readiness.ready ? 'done' : 'mid'}">${escapeHtml(readiness.passed)}/${escapeHtml(readiness.total)}</span>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(185px,1fr));gap:7px">
            ${readiness.checks.map(check => `
              <div style="display:grid;grid-template-columns:auto 1fr auto;gap:7px;align-items:start;border:1px solid var(--border);border-radius:8px;background:var(--white);padding:7px">
                <span class="badge ${check.ok ? 'done' : 'mid'}">${escapeHtml(check.ok ? 'OK' : 'TODO')}</span>
                <div>
                  <div style="font-size:.78rem;font-weight:900;color:var(--navy)">${escapeHtml(check.label)}</div>
                  <div style="font-size:.74rem;color:var(--muted);font-weight:800;line-height:1.35">${escapeHtml(check.detail)}</div>
                </div>
                ${!check.ok && check.action ? renderReadinessActionButton(check.action) : ''}
              </div>
            `).join('')}
          </div>
          <div data-readiness-validation-summary style="display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:7px;margin-top:10px">
            ${[
              ['Package', validationSummary.packageFile],
              ['Smoke', validationSummary.latestSmokeOk ? `${validationSummary.latestSmokeChecks} checks` : 'Not passed'],
              ['Readiness', `${validationSummary.readinessPassed}/${validationSummary.readinessTotal}`],
              ['Blockers', validationSummary.unresolvedBlockers],
            ].map(([label, value]) => `
              <div style="border:1px solid var(--border);border-radius:8px;background:var(--white);padding:7px">
                <div style="font-size:.72rem;color:var(--muted);font-weight:900">${escapeHtml(label)}</div>
                <div style="font-size:.86rem;color:var(--navy);font-weight:900;word-break:break-word">${escapeHtml(value)}</div>
              </div>
            `).join('')}
          </div>
          ${readinessActionPlan.length ? `
            <div data-readiness-action-plan style="border-top:1px solid var(--border);margin-top:10px;padding-top:9px;display:grid;gap:7px">
              <div style="font-size:.78rem;font-weight:900;color:var(--navy)">Action plan</div>
              ${readinessActionPlan.map(check => `
                <div style="display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;border:1px solid var(--border);border-radius:8px;background:var(--white);padding:7px">
                  <div>
                    <strong style="font-size:.78rem;color:var(--navy)">${escapeHtml(check.label)}</strong>
                    <div style="font-size:.73rem;color:var(--muted);font-weight:800;line-height:1.35">${escapeHtml(check.detail)}</div>
                  </div>
                  ${renderReadinessActionButton(check.action, check.action.label || t('open'))}
                </div>
              `).join('')}
            </div>
          ` : `
            <div data-readiness-ready-note style="border:1px solid var(--border);border-left:4px solid var(--green);border-radius:8px;background:var(--white);padding:8px;margin-top:10px">
              <div style="font-size:.78rem;font-weight:900;color:var(--green)">Ready for handoff</div>
              <div style="font-size:.73rem;color:var(--muted);font-weight:800;line-height:1.35">All release readiness gates are passing. Export the handoff report when the team is ready.</div>
            </div>
          `}
        </div>
      </div>

      <details id="settings-data-section" class="card" open>
        <summary>${escapeHtml(t('dataStatus'))}</summary>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(115px,1fr));gap:8px;margin-top:10px">
          ${[
            ['Tasks', stats.tasks],
            ['Members', stats.members],
            ['Mission Run', stats.missionRuns],
            ['Checklist', stats.checklist],
            ['Gear', stats.gearItems],
          ].map(([label, value]) => `
            <div style="border:1px solid var(--border);border-radius:8px;background:var(--input-bg);padding:8px">
              <div style="font-size:.73rem;color:var(--muted);font-weight:900">${escapeHtml(label)}</div>
              <div style="font-size:1.15rem;font-weight:900;color:var(--navy)">${escapeHtml(value)}</div>
            </div>
          `).join('')}
        </div>
      </details>

      <div id="settings-db-section" class="card">
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:10px">
          <div>
            <h2 style="margin-bottom:4px">${escapeHtml(t('supabaseReadOnly'))}</h2>
            <div style="font-size:.82rem;color:var(--muted);font-weight:800">${escapeHtml(t('supabaseReadOnlyHint'))}</div>
          </div>
          <button class="btn btn-sm btn-primary" type="button" data-action="load-supabase-readonly">${escapeHtml(t('loadFromSupabase'))}</button>
        </div>
        ${stats.dbStatus ? `
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin-bottom:8px">
            ${[
              ['Source', 'Supabase live database'],
              ['Mode', 'Read/write online'],
              ['Loaded', stats.dbStatus.loadedAt ? new Date(stats.dbStatus.loadedAt).toLocaleTimeString() : '-'],
              ['Load ms', stats.dbStatus.loadMs ?? '-'],
              ['Status', stats.dbStatus.error ? 'Error' : (v15DbReadiness.ok ? 'Live data complete' : 'Live data partial')],
            ].map(([label, value]) => `
              <div style="border:1px solid var(--border);border-radius:8px;background:var(--input-bg);padding:8px">
                <div style="font-size:.73rem;color:var(--muted);font-weight:900">${escapeHtml(label)}</div>
                <div style="font-size:1.05rem;font-weight:900;color:${stats.dbStatus.error ? 'var(--red)' : 'var(--navy)'}">${escapeHtml(value)}</div>
              </div>
            `).join('')}
          </div>
          ${stats.dbStatus.error ? `<div style="font-size:.82rem;color:var(--red);font-weight:900">${escapeHtml(stats.dbStatus.error)}</div>` : `
            <div data-v15-db-coverage style="border:1px solid var(--border);border-radius:8px;background:var(--white);padding:8px;margin-bottom:8px">
              <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:7px">
                <div style="font-size:.8rem;font-weight:900;color:var(--navy)">Supabase table coverage</div>
                <span class="badge ${v15DbReadiness.ok ? 'done' : 'urgent'}">${escapeHtml(v15DbReadiness.label)}</span>
              </div>
              ${v15DbReadiness.warning ? `<div data-v15-db-readiness-warning style="font-size:.78rem;color:var(--orange);font-weight:900;margin-bottom:7px">${escapeHtml(v15DbReadiness.warning.replace('V15 DB', 'Supabase'))}</div>` : `<div data-v15-db-readiness-warning style="font-size:.78rem;color:var(--green);font-weight:900;margin-bottom:7px">Supabase table coverage complete.</div>`}
              <div style="display:flex;gap:5px;flex-wrap:wrap">
                ${DB_TABLES.map((table) => {
                  const row = stats.dbStatus.tables?.[table];
                  const ok = Boolean(row?.ok);
                  const loaded = Boolean(row);
                  const label = V15_DB_TABLE_LABELS[table] || table;
                  const title = row?.error ? `${table}: ${row.error}` : table;
                  return `<span title="${escapeHtml(title)}" class="badge ${ok ? 'done' : 'urgent'}">${escapeHtml(label)} ${loaded ? escapeHtml(row.count) : '-'}</span>`;
                }).join('')}
              </div>
              ${Object.entries(stats.dbStatus.tables || {}).some(([, row]) => row?.error) ? `
                <div data-v15-db-table-errors style="border-top:1px solid var(--border);margin-top:8px;padding-top:8px;display:grid;gap:5px">
                  <div style="font-size:.76rem;color:var(--muted);font-weight:900">Supabase table errors</div>
                  ${Object.entries(stats.dbStatus.tables || {})
                    .filter(([, row]) => row?.error)
                    .map(([table, row]) => `
                      <div style="border:1px solid var(--border);border-left:4px solid var(--red);border-radius:8px;background:var(--input-bg);padding:7px">
                        <strong style="font-size:.78rem;color:var(--navy)">${escapeHtml(V15_DB_TABLE_LABELS[table] || table)}</strong>
                        <div style="font-size:.72rem;color:var(--red);font-weight:800">${escapeHtml(row.error)}</div>
                      </div>
                    `).join('')}
                </div>
              ` : ''}
            </div>
            ${stats.dbStatus.dedupeSummary ? `
              <div data-v15-import-dedupe-summary style="border:1px solid var(--border);border-radius:8px;background:var(--white);padding:8px;margin-bottom:8px">
                <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:7px">
                  <div style="font-size:.8rem;font-weight:900;color:var(--navy)">Live data dedupe</div>
                  <span class="badge ${Object.values(stats.dbStatus.dedupeSummary).some(Boolean) ? 'mid' : 'done'}">${escapeHtml(Object.values(stats.dbStatus.dedupeSummary).reduce((sum, value) => sum + Number(value || 0), 0))}</span>
                </div>
                <div style="display:flex;gap:5px;flex-wrap:wrap">
                  ${Object.entries(stats.dbStatus.dedupeSummary).map(([key, value]) => `<span class="badge ${value ? 'mid' : 'done'}">${escapeHtml(key)} ${escapeHtml(value)}</span>`).join('')}
                </div>
              </div>
            ` : ''}
            <div data-v15-audit-preview style="border:1px solid var(--border);border-radius:8px;background:var(--white);padding:8px;margin-bottom:8px">
              <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:7px">
                <div style="font-size:.8rem;font-weight:900;color:var(--navy)">Supabase audit preview</div>
                <span class="badge ${stats.v15AuditLog ? 'done' : 'mid'}">${escapeHtml(stats.v15AuditLog)}</span>
              </div>
              <div data-v15-audit-risk-preview style="border:1px solid var(--border);border-radius:8px;background:var(--input-bg);padding:7px;margin-bottom:7px">
                <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:5px">
                  <div style="font-size:.76rem;color:var(--muted);font-weight:900">Audit risk preview</div>
                  <span class="badge ${v15AuditHighlights.length ? 'urgent' : 'done'}">${escapeHtml(v15AuditHighlights.length)}</span>
                </div>
                ${v15AuditHighlights.length ? `
                  <div style="display:grid;gap:5px">
                    ${v15AuditHighlights.slice(0, 3).map(entry => `
                      <div style="display:grid;grid-template-columns:auto 1fr auto;gap:7px;align-items:center">
                        <span class="badge urgent">${escapeHtml(entry.action || '-')}</span>
                        <strong style="font-size:.76rem;color:var(--navy)">${escapeHtml(entry.entityType || '-')} ${escapeHtml(entry.entityId || '')}</strong>
                        <span style="font-size:.7rem;color:var(--muted);font-weight:900">${escapeHtml(formatDateTimeSafe(entry.createdAt))}</span>
                      </div>
                    `).join('')}
                  </div>
                ` : `<div style="font-size:.76rem;color:var(--muted);font-weight:800">No failed/error/delete/rollback actions found.</div>`}
              </div>
              ${(state?.data?.v15AuditLog || []).length ? `
                <div style="display:grid;gap:5px">
                  ${(state.data.v15AuditLog || []).slice(0, 5).map(entry => `
                    <div style="display:grid;grid-template-columns:auto 1fr auto;gap:7px;align-items:center;border:1px solid var(--border);border-radius:8px;background:var(--input-bg);padding:7px">
                      <span class="badge mid">${escapeHtml(entry.action || '-')}</span>
                      <div>
                        <strong style="font-size:.78rem;color:var(--navy)">${escapeHtml(entry.entityType || '-')} ${escapeHtml(entry.entityId || '')}</strong>
                        <div style="font-size:.72rem;color:var(--muted);font-weight:800">${escapeHtml(entry.actor || '-')}</div>
                      </div>
                      <span style="font-size:.72rem;color:var(--muted);font-weight:900">${escapeHtml(formatDateTimeSafe(entry.createdAt))}</span>
                    </div>
                  `).join('')}
                </div>
              ` : `<div style="font-size:.78rem;color:var(--muted);font-weight:800">No v15 audit rows loaded.</div>`}
            </div>
            ${renderSupabaseImportDelta(stats.dbStatus.importDelta)}
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:8px">
              ${Object.entries(stats.dbStatus.tables || {}).map(([table, row]) => `
                <div style="border:1px solid var(--border);border-left:4px solid ${row.ok ? 'var(--green)' : 'var(--red)'};border-radius:8px;background:var(--input-bg);padding:8px">
                  <div style="font-size:.73rem;color:var(--muted);font-weight:900">${escapeHtml(table)}</div>
                  <div style="font-size:1.05rem;font-weight:900;color:var(--navy)">${escapeHtml(row.count)} rows</div>
                  ${row.error ? `<div style="font-size:.72rem;color:var(--red)">${escapeHtml(row.error)}</div>` : ''}
                </div>
              `).join('')}
            </div>
          `}
        ` : `<div style="font-size:.82rem;color:var(--muted);font-weight:800">${escapeHtml(t('notLoadedYet'))}</div>`}
      </div>

      <div id="settings-schema-section" class="card">
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:10px">
          <div>
            <h2 style="margin-bottom:4px">${escapeHtml(t('supabaseSchemaProbe'))}</h2>
            <div style="font-size:.82rem;color:var(--muted);font-weight:800">${escapeHtml(t('schemaProbeHint'))}</div>
          </div>
          <button class="btn btn-sm btn-primary" type="button" data-action="probe-supabase-schema">${escapeHtml(t('probeSchema'))}</button>
        </div>
        ${stats.schemaStatus ? `
          <div style="font-size:.78rem;color:var(--muted);font-weight:800;margin-bottom:8px">Probed ${escapeHtml(new Date(stats.schemaStatus.ts).toLocaleString())} | ${escapeHtml(stats.schemaStatus.probeMs)} ms</div>
          <div style="display:grid;gap:6px">
            ${Object.entries(stats.schemaStatus.tables || {}).map(([table, row]) => `
              <details style="border:1px solid var(--border);border-left:4px solid ${row.coverage >= 80 ? 'var(--green)' : row.coverage >= 50 ? 'var(--orange)' : 'var(--red)'};border-radius:8px;background:var(--input-bg);padding:8px">
                <summary style="display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:center;cursor:pointer">
                  <strong>${escapeHtml(table)}</strong>
                  <span class="badge done">${escapeHtml(row.existing.length)} found</span>
                  <span class="badge ${row.missing.length ? 'mid' : 'done'}">${escapeHtml(row.coverage)}%</span>
                </summary>
                <div style="display:grid;gap:6px;margin-top:8px">
                  <div>
                    <div style="font-size:.76rem;color:var(--muted);font-weight:900;margin-bottom:4px">${escapeHtml(t('existing'))}</div>
                    <div style="display:flex;gap:5px;flex-wrap:wrap">${row.existing.map(column => `<span class="badge done">${escapeHtml(column)}</span>`).join('') || '<span style="font-size:.76rem;color:var(--muted);font-weight:800">none</span>'}</div>
                  </div>
                  <div>
                    <div style="font-size:.76rem;color:var(--muted);font-weight:900;margin-bottom:4px">${escapeHtml(t('missingBlocked'))}</div>
                    <div style="display:flex;gap:5px;flex-wrap:wrap">${row.missing.map(item => `<span class="badge urgent">${escapeHtml(item.column)}</span>`).join('') || '<span style="font-size:.76rem;color:var(--muted);font-weight:800">none</span>'}</div>
                  </div>
                </div>
              </details>
            `).join('')}
          </div>
        ` : `<div style="font-size:.82rem;color:var(--muted);font-weight:800">${escapeHtml(t('noSchemaProbe'))}</div>`}
      </div>

      <div id="settings-audit-section" class="card">
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:10px">
          <div>
            <h2 style="margin-bottom:4px">${escapeHtml(t('writeAuditLog'))}</h2>
            <div style="font-size:.82rem;color:var(--muted);font-weight:800">${escapeHtml(t('writeAuditHint'))}</div>
          </div>
          <span class="badge done">${escapeHtml(stats.writeAuditLog.length)}</span>
        </div>
        ${stats.writeAuditLog.length ? `
          <div style="display:grid;gap:6px">
            ${stats.writeAuditLog.slice(0, 8).map(entry => `
              <details style="border:1px solid var(--border);border-left:4px solid ${entry.write?.ok ? 'var(--green)' : 'var(--red)'};border-radius:8px;background:var(--input-bg);padding:8px">
                <summary style="display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:center;cursor:pointer">
                  <strong>${escapeHtml(new Date(entry.ts).toLocaleString())}</strong>
                  <span class="badge done">wrote ${escapeHtml(entry.write?.written || 0)}</span>
                  <span class="badge mid">dropped ${escapeHtml(entry.droppedFields?.length || 0)}</span>
                </summary>
                <div style="display:grid;gap:6px;margin-top:8px;font-size:.78rem;color:var(--muted);font-weight:800">
                  <div>Tables: ${escapeHtml((entry.tables || []).join(', ') || '-')}</div>
                  <div>Preview: +${escapeHtml(entry.preview?.totalCreate ?? '-')} ~${escapeHtml(entry.preview?.totalUpdate ?? '-')} -${escapeHtml(entry.preview?.totalRemove ?? '-')}</div>
                  <div>Post-write: +${escapeHtml(entry.postWrite?.totalCreate ?? '-')} ~${escapeHtml(entry.postWrite?.totalUpdate ?? '-')} -${escapeHtml(entry.postWrite?.totalRemove ?? '-')}</div>
                  ${entry.write?.errors?.length ? `<div style="color:var(--red)">Errors: ${escapeHtml(entry.write.errors.map(error => `${error.table}: ${error.error}`).join(' | '))}</div>` : ''}
                  ${entry.droppedFields?.length ? `<div>Dropped: ${escapeHtml(entry.droppedFields.map(item => `${item.table}.${item.field}`).join(', '))}</div>` : ''}
                </div>
              </details>
            `).join('')}
          </div>
        ` : `<div style="font-size:.82rem;color:var(--muted);font-weight:800">${escapeHtml(t('noAuditEntries'))}</div>`}
      </div>

      <div id="settings-pack-section" class="card">
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:10px">
          <div>
            <h2 style="margin-bottom:4px">${escapeHtml(t('settingsPack'))}</h2>
            <div style="font-size:.82rem;color:var(--muted);font-weight:800">Export or import v16 master data and Smoke Test history. v15 settings packs are accepted for master data.</div>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <input type="file" id="settings-pack-import-file" accept="application/json,.json" style="display:none" data-settings-pack-file>
            <button class="btn btn-sm btn-primary" type="button" data-action="export-settings-pack">${escapeHtml(t('exportPack'))}</button>
            <button class="btn btn-sm" type="button" data-action="choose-settings-pack">${escapeHtml(t('importPack'))}</button>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px">
          ${[
            ['Roles', stats.masterData.roles.length],
            ['Groups', stats.masterData.groups.length],
            ['Task Types', stats.masterData.taskTypes.length],
            ['Gear Cats', stats.masterData.gearCats.length],
            ['Smoke', stats.smokeRuns],
          ].map(([label, value]) => `
            <div style="border:1px solid var(--border);border-radius:8px;background:var(--input-bg);padding:8px">
              <div style="font-size:.73rem;color:var(--muted);font-weight:900">${escapeHtml(label)}</div>
              <div style="font-size:1.15rem;font-weight:900;color:var(--navy)">${escapeHtml(value)}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <details id="settings-master-section" class="card" open>
        <summary>Master Data</summary>
        <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap;margin:10px 0 9px">
          <div style="font-size:.82rem;color:var(--muted);font-weight:800">Shared options for roles, groups, task categories, and gear categories.</div>
          <span class="badge done">${stats.masterTotal}</span>
        </div>
        ${renderTaskCategoryManager(stats.masterData.taskTypes || [])}
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:9px">
          ${Object.entries(MASTER_DATA_TYPES).map(([type, label]) => renderMasterDataList(type, label, stats.masterData[type] || [])).join('')}
        </div>
      </details>

      <details id="settings-health-section" class="card" open>
        <summary>System / QA</summary>
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;margin-top:10px;margin-bottom:10px">
          <div style="font-size:.82rem;color:var(--muted);font-weight:800">${escapeHtml(t('diagnosticsHint'))}</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <input type="file" id="diagnostics-import-file" accept="application/json,.json" style="display:none" data-diagnostics-file>
            <button class="btn btn-sm" type="button" data-action="export-diagnostics">${escapeHtml(t('exportDiagnostics'))}</button>
            <button class="btn btn-sm" type="button" data-action="choose-diagnostics">${escapeHtml(t('importDiagnostics'))}</button>
          </div>
        </div>
        <div data-settings-current-health style="border:1px solid var(--border);border-left:5px solid ${(stats.healthIssues || []).length ? 'var(--orange)' : 'var(--green)'};border-radius:8px;background:var(--input-bg);padding:8px;margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:6px">
            <div style="font-size:.82rem;font-weight:900;color:var(--navy)">${escapeHtml(t('dataHealth'))}</div>
            <span class="badge ${(stats.healthIssues || []).length ? 'mid' : 'done'}">${escapeHtml((stats.healthIssues || []).length)}</span>
          </div>
          <div style="display:grid;gap:6px">
            ${(stats.healthIssues || []).length ? stats.healthIssues.slice(0, 8).map(issue => `
              <div style="display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:start;border:1px solid var(--border);border-radius:8px;background:var(--white);padding:7px">
                <span class="badge ${issue.level === 'urgent' ? 'urgent' : 'mid'}">${escapeHtml(issue.level || 'warn')}</span>
                <div>
                  <div style="font-size:.78rem;font-weight:900;color:var(--navy)">${escapeHtml(issue.title || t('healthIssues'))}</div>
                  <div style="font-size:.74rem;color:var(--muted);font-weight:800">${escapeHtml(issue.detail || '-')}</div>
                </div>
                ${taskHealthPresetForIssue(issue) || taskEvidencePresetForIssue(issue) ? `<button class="btn btn-sm" type="button" data-page="tasks" data-settings-health-task-action data-task-health-preset="${escapeHtml(taskHealthPresetForIssue(issue))}" data-task-evidence-preset="${escapeHtml(taskEvidencePresetForIssue(issue))}">${escapeHtml(t('open'))}</button>` : ''}
              </div>
            `).join('') : `<div style="color:var(--green);font-weight:900">${escapeHtml(t('noHealthIssues'))}</div>`}
          </div>
        </div>
        <div style="border:1px solid var(--border);border-radius:8px;background:var(--input-bg);padding:8px;margin-bottom:10px">
          <div style="font-size:.82rem;font-weight:900;color:var(--navy);margin-bottom:6px">${escapeHtml(t('diagnosticsViewer'))}</div>
          ${stats.diagnosticsSummary ? `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(125px,1fr));gap:8px">
              ${[
                ['Type', stats.diagnosticsSummary.sourceLabel || 'Diagnostics'],
                ['Season', stats.diagnosticsSummary.season || '-'],
                ['Tasks', stats.diagnosticsSummary.counts.tasks || 0],
                ['Evidence', stats.diagnosticsSummary.counts.attachments || 0],
                ['Quotes', stats.diagnosticsSummary.counts.quotes || 0],
                ['Practice', stats.diagnosticsSummary.counts.practiceRuns || 0],
                ['V15 Audit', stats.diagnosticsSummary.counts.v15AuditLog || 0],
                ['V15 DB', stats.diagnosticsSummary.v15DbReadiness?.label || (stats.diagnosticsSummary.v15DbCoverage?.length ? `${stats.diagnosticsSummary.v15DbCoverage.filter(row => row.ok).length}/${stats.diagnosticsSummary.v15DbCoverage.length}` : '-')],
                ['Smoke', stats.diagnosticsSummary.latestSmokeOk === null ? '-' : (stats.diagnosticsSummary.latestSmokeOk ? 'OK' : 'FAIL')],
                ['Readiness', stats.diagnosticsSummary.validationSummary ? `${stats.diagnosticsSummary.validationSummary.readinessPassed}/${stats.diagnosticsSummary.validationSummary.readinessTotal}` : '-'],
                ['Blockers', stats.diagnosticsSummary.readinessActionPlan?.length || 0],
                ['Health', stats.diagnosticsSummary.healthIssues],
                ['Audit', stats.diagnosticsSummary.writeAuditEntries],
              ].map(([label, value]) => {
                const isSmoke = label === 'Smoke' && ['OK', 'FAIL'].includes(String(value));
                const isBlockers = label === 'Blockers';
                const isHealth = label === 'Health';
                const isAudit = label === 'Audit';
                const isReadiness = label === 'Readiness' && String(value).includes('/');
                const isV15Db = label === 'V15 DB' && String(value).includes('/');
                const blockerCount = Number(value) || 0;
                const healthCount = Number(value) || 0;
                const auditCount = Number(value) || 0;
                const [readinessPassed, readinessTotal] = String(value).split('/').map(Number);
                const [v15DbPassed, v15DbTotal] = String(value).split('/').map(Number);
                const readinessOk = isReadiness && readinessTotal > 0 && readinessPassed === readinessTotal;
                const v15DbOk = isV15Db && v15DbTotal > 0 && v15DbPassed === v15DbTotal;
                const statusBorder = isSmoke
                  ? `border-left:4px solid ${value === 'OK' ? 'var(--green)' : 'var(--red)'};`
                  : isBlockers
                  ? `border-left:4px solid ${blockerCount ? 'var(--orange)' : 'var(--green)'};`
                  : isHealth
                    ? `border-left:4px solid ${healthCount ? 'var(--orange)' : 'var(--green)'};`
                  : isAudit
                    ? `border-left:4px solid ${auditCount ? 'var(--green)' : 'var(--border)'};`
                  : isReadiness
                    ? `border-left:4px solid ${readinessOk ? 'var(--green)' : 'var(--orange)'};`
                  : isV15Db
                    ? `border-left:4px solid ${v15DbOk ? 'var(--green)' : 'var(--orange)'};`
                    : '';
                const valueColor = isSmoke
                  ? (value === 'OK' ? 'var(--green)' : 'var(--red)')
                  : isBlockers
                  ? (blockerCount ? 'var(--orange)' : 'var(--green)')
                  : isHealth
                    ? (healthCount ? 'var(--orange)' : 'var(--green)')
                  : isAudit
                    ? (auditCount ? 'var(--green)' : 'var(--navy)')
                  : isReadiness
                    ? (readinessOk ? 'var(--green)' : 'var(--orange)')
                  : isV15Db
                    ? (v15DbOk ? 'var(--green)' : 'var(--orange)')
                    : 'var(--navy)';
                return `
                <div style="border:1px solid var(--border);${statusBorder}border-radius:8px;background:var(--white);padding:8px">
                  <div style="font-size:.72rem;color:var(--muted);font-weight:900">${escapeHtml(label)}</div>
                  <div style="font-size:1rem;font-weight:900;color:${valueColor}">${escapeHtml(value)}</div>
                </div>`;
              }).join('')}
            </div>
            <div style="font-size:.76rem;color:var(--muted);font-weight:800;margin-top:8px">Exported ${escapeHtml(formatDateTimeSafe(stats.diagnosticsSummary.exportedAt))} | Imported ${escapeHtml(formatDateTimeSafe(stats.diagnosticsSummary.importedAt))}</div>
            <div style="display:grid;gap:6px;margin-top:10px">
              ${renderDiagnosticsDashboardSafety(stats.diagnosticsSummary.dashboardSafetySummary)}
              ${renderDiagnosticsActionPlan(stats.diagnosticsSummary.readinessActionPlan)}
              ${renderDiagnosticsSmoke(stats.diagnosticsSummary)}
              ${renderDiagnosticsHealth(stats.diagnosticsSummary.healthRows)}
              ${renderDiagnosticsDb(stats.diagnosticsSummary.dbTables, stats.diagnosticsSummary.schemaTables, stats.diagnosticsSummary.v15DbCoverage)}
              ${renderDiagnosticsImportDelta(stats.diagnosticsSummary.dbImportDelta)}
              ${renderDiagnosticsSync(stats.diagnosticsSummary.syncPreview, stats.diagnosticsSummary.postWritePreview)}
              ${renderDiagnosticsV15Audit(stats.diagnosticsSummary.v15AuditLog, stats.diagnosticsSummary.v15AuditHighlights)}
              ${renderDiagnosticsAudit(stats.diagnosticsSummary.writeAuditLog)}
            </div>
          ` : `<div style="font-size:.8rem;color:var(--muted);font-weight:800">${escapeHtml(t('noDiagnosticsImported'))}</div>`}
        </div>
        <div id="v16-smoke-report" style="margin-top:10px"></div>
      </details>
    </section>`;
}

export function renderMasterDataList(type, label, values) {
  return `
    <div style="border:1px solid var(--border);border-radius:8px;background:var(--input-bg);padding:9px">
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:7px">
        <strong style="color:var(--navy);font-size:.86rem">${escapeHtml(label)}</strong>
        <span class="badge done">${values.length}</span>
      </div>
      <div style="display:flex;gap:5px;margin-bottom:7px">
        <input id="master-${escapeHtml(type)}-input" type="text" placeholder="Add ${escapeHtml(label)}" data-master-input="${escapeHtml(type)}">
        <button class="btn btn-sm btn-primary" type="button" data-master-add="${escapeHtml(type)}">Add</button>
      </div>
      <div style="display:flex;gap:5px;flex-wrap:wrap">
        ${values.map(value => `
          <span style="display:inline-flex;align-items:center;gap:4px;border:1px solid var(--border);border-radius:999px;background:var(--white);padding:3px 7px;font-size:.76rem;font-weight:800">
            ${escapeHtml(value)}
            <button class="btn btn-sm btn-danger" type="button" style="padding:1px 5px" data-master-delete="${escapeHtml(type)}" data-master-value="${escapeHtml(value)}">x</button>
          </span>
        `).join('') || '<span style="font-size:.78rem;color:var(--muted)">Empty</span>'}
      </div>
    </div>`;
}

function renderTaskCategoryManager(values = []) {
  const grouped = values.reduce((groups, value) => {
    const detail = TASK_CATEGORY_DETAILS[value] || {
      group: 'Custom',
      zh: labelFor(value),
      en: value,
      folder: '-',
    };
    groups[detail.group] ||= [];
    groups[detail.group].push({ value, ...detail });
    return groups;
  }, {});
  const groupOrder = ['Engineering Design', 'Competition Management', 'Logistics & Administration', 'Public Affairs', 'Team Development', 'Custom'];
  return `
    <div class="task-category-manager" data-task-category-manager>
      <div class="task-category-manager-head">
        <div>
          <h3>${escapeHtml(t('taskCategoryManager'))}</h3>
          <div>${escapeHtml(t('taskCategoryManagerHint'))}</div>
        </div>
        <span class="badge done">${values.length}</span>
      </div>
      <div class="task-category-add-row">
        <input id="master-taskTypes-focused-input" type="text" placeholder="${escapeHtml(t('addTaskCategoryPlaceholder'))}" data-master-input="taskTypes">
        <button class="btn btn-sm btn-primary" type="button" data-master-add="taskTypes">${escapeHtml(t('addItem'))}</button>
      </div>
      <div class="task-category-groups">
        ${groupOrder.filter(group => grouped[group]?.length).map(group => `
          <section class="task-category-group">
            <div class="task-category-group-title">${escapeHtml(t(`taskCategoryGroup${group.replace(/[^A-Za-z]/g, '')}`) || group)}</div>
            <div class="task-category-table">
              <div class="task-category-row task-category-row-head">
                <span>#</span>
                <span>${escapeHtml(t('zhCategory'))}</span>
                <span>${escapeHtml(t('enCategory'))}</span>
                <span>${escapeHtml(t('folder'))}</span>
                <span></span>
              </div>
              ${grouped[group].map(item => `
                <div class="task-category-row">
                  <span>${escapeHtml(item.value.split(' ')[0] || '-')}</span>
                  <span>${escapeHtml(item.zh || labelFor(item.value))}</span>
                  <span>${escapeHtml(item.en || item.value)}</span>
                  <span>${escapeHtml(item.folder || '-')}</span>
                  <span>
                    <button class="btn btn-sm btn-danger" type="button" data-master-delete="taskTypes" data-master-value="${escapeHtml(item.value)}">${escapeHtml(t('delete'))}</button>
                  </span>
                </div>
              `).join('')}
            </div>
          </section>
        `).join('')}
      </div>
    </div>`;
}

function renderReadinessActionButton(action, label = null) {
  if (!action) return '';
  return `<button class="btn btn-sm" type="button" data-page="${escapeHtml(action.page || '')}" ${action.taskEvidencePreset ? `data-task-evidence-preset="${escapeHtml(action.taskEvidencePreset)}"` : ''} ${action.dashboardHealthFocus ? `data-dashboard-health-focus="${escapeHtml(action.dashboardHealthFocus)}"` : ''} ${action.settingsScroll ? `data-settings-scroll="${escapeHtml(action.settingsScroll)}"` : ''} ${action.readinessAction ? `data-readiness-action="${escapeHtml(action.readinessAction)}"` : ''}>${escapeHtml(label || action.label || t('open'))}</button>`;
}

function buildReleaseReadiness(stats) {
  const hasData = (stats.tasks + stats.members + stats.checklist + stats.missionRuns + stats.gearItems) > 0;
  const smokeOk = Boolean(stats.latestSmoke && stats.failedSmoke === 0);
  const healthOk = (stats.healthIssues || []).length === 0;
  const evidenceOk = !stats.missingEvidenceTasks;
  const schemaOk = Boolean(stats.schemaStatus && Object.keys(stats.schemaStatus.tables || {}).length);
  const syncPrepared = Boolean(stats.dbStatus && !stats.dbStatus.error);
  const backupReady = true;
  const diagnosticsReady = true;
  const writeGuardReady = true;
  const checks = [
    {
      label: 'Workflow smoke',
      ok: smokeOk,
      detail: smokeOk ? 'Latest in-app smoke passed.' : 'Run Smoke Test before handoff.',
      action: smokeOk ? null : { label: 'Run', page: 'settings', settingsScroll: 'settings-health-section', readinessAction: 'run-smoke' },
    },
    {
      label: 'Supabase data',
      ok: hasData,
      detail: hasData ? 'Live Supabase data is loaded.' : 'Reload Supabase or add data through the app.',
      action: hasData ? null : { label: 'Reload', page: 'settings', settingsScroll: 'settings-db-section' },
    },
    {
      label: 'Data health',
      ok: healthOk,
      detail: healthOk ? 'No Supabase data health issues found.' : `${stats.healthIssues.length} data health issue(s) need review.`,
      action: healthOk ? null : { label: 'Open', page: 'settings', settingsScroll: 'settings-health-section' },
    },
    {
      label: 'Task evidence',
      ok: evidenceOk,
      detail: evidenceOk ? 'High-priority and completed tasks have evidence.' : `${stats.missingEvidenceTasks} task(s) need evidence before handoff.`,
      action: evidenceOk ? null : { label: 'Open', page: 'tasks', taskEvidencePreset: 'without' },
    },
    {
      label: 'Schema probe',
      ok: schemaOk,
      detail: schemaOk ? 'Supabase fields were probed.' : 'Run schema probe if writes fail.',
      action: schemaOk ? null : { label: 'Open', page: 'settings', settingsScroll: 'settings-schema-section' },
    },
    {
      label: 'Supabase connection',
      ok: syncPrepared,
      detail: syncPrepared ? 'Live database has been loaded.' : 'Reload Supabase DB.',
      action: syncPrepared ? null : { label: 'Reload', page: 'settings', settingsScroll: 'settings-db-section' },
    },
    {
      label: 'Reports',
      ok: backupReady,
      detail: 'Handoff, diagnostics, action log, and safety reports are available.',
    },
    {
      label: 'Safety guard',
      ok: writeGuardReady,
      detail: 'CRUD writes go directly to Supabase; deprecated local backup/sync tools are hidden.',
    },
    {
      label: 'Diagnostics',
      ok: diagnosticsReady,
      detail: 'Export/import diagnostics viewer is available.',
    },
  ];
  const passed = checks.filter(check => check.ok).length;
  return {
    checks,
    passed,
    total: checks.length,
    ready: passed === checks.length,
  };
}

function renderSyncDetailGroup(title, rows = []) {
  if (!rows.length) return `<div style="font-size:.76rem;color:var(--muted);font-weight:800">${escapeHtml(title)}: none</div>`;
  return `
    <div>
      <div style="font-size:.76rem;color:var(--muted);font-weight:900;margin-bottom:4px">${escapeHtml(title)} (${rows.length})</div>
      <div style="display:flex;gap:5px;flex-wrap:wrap">
        ${rows.slice(0, 12).map(row => `<span class="badge done">#${escapeHtml(row.id)} ${escapeHtml(row.label)}</span>`).join('')}
        ${rows.length > 12 ? `<span class="badge mid">+${rows.length - 12} more</span>` : ''}
      </div>
    </div>`;
}

function renderSyncUpdateDetailGroup(rows = []) {
  if (!rows.length) return '<div style="font-size:.76rem;color:var(--muted);font-weight:800">Update: none</div>';
  return `
    <div>
      <div style="font-size:.76rem;color:var(--muted);font-weight:900;margin-bottom:4px">Update (${rows.length})</div>
      <div style="display:grid;gap:5px">
        ${rows.slice(0, 8).map(row => `
          <div style="border:1px solid var(--border);border-radius:7px;background:var(--white);padding:6px">
            <strong style="font-size:.8rem;color:var(--navy)">#${escapeHtml(row.id)} ${escapeHtml(row.label)}</strong>
            <div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:4px">
              ${row.fields.slice(0, 8).map(field => `<span class="badge mid">${escapeHtml(field.field)}</span>`).join('')}
              ${row.fields.length > 8 ? `<span class="badge mid">+${row.fields.length - 8} fields</span>` : ''}
            </div>
          </div>
        `).join('')}
        ${rows.length > 8 ? `<div style="font-size:.76rem;color:var(--muted);font-weight:800">+${rows.length - 8} more updated rows</div>` : ''}
      </div>
    </div>`;
}

function renderSupabaseImportDelta(delta = null) {
  if (!delta?.rows?.length) return '';
  return `
    <div data-v15-import-delta style="border:1px solid var(--border);border-radius:8px;background:var(--white);padding:8px;margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:7px">
        <div style="font-size:.8rem;font-weight:900;color:var(--navy)">V15 Import delta</div>
        <span class="badge ${delta.increased || delta.decreased ? 'mid' : 'done'}">+${escapeHtml(delta.increased || 0)} / -${escapeHtml(delta.decreased || 0)}</span>
      </div>
      <div style="display:flex;gap:5px;flex-wrap:wrap">
        ${delta.rows.map(row => `<span title="${escapeHtml(row.key)}" class="badge ${row.delta > 0 ? 'done' : row.delta < 0 ? 'urgent' : 'mid'}">${escapeHtml(row.label)} ${row.delta > 0 ? '+' : ''}${escapeHtml(row.delta)} (${escapeHtml(row.before)} -> ${escapeHtml(row.after)})</span>`).join('')}
      </div>
    </div>`;
}

function formatDateTimeSafe(value) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString();
}

function renderDiagnosticsImportDelta(delta = null) {
  if (!delta?.rows?.length) return '';
  return `
    <details data-diagnostics-v15-import-delta style="border:1px solid var(--border);border-radius:8px;background:var(--white);padding:8px">
      <summary style="cursor:pointer;font-weight:900;color:var(--navy)">Diagnostics V15 Import Delta (+${escapeHtml(delta.increased || 0)} / -${escapeHtml(delta.decreased || 0)})</summary>
      <div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:8px">
        ${delta.rows.map(row => `<span title="${escapeHtml(row.key)}" class="badge ${row.delta > 0 ? 'done' : row.delta < 0 ? 'urgent' : 'mid'}">${escapeHtml(row.label)} ${row.delta > 0 ? '+' : ''}${escapeHtml(row.delta)} (${escapeHtml(row.before)} -> ${escapeHtml(row.after)})</span>`).join('')}
      </div>
    </details>`;
}

function renderDiagnosticsSmoke(summary) {
  const latest = summary.latestSmoke;
  const checks = latest?.checks || [];
  return `
    <details style="border:1px solid var(--border);border-radius:8px;background:var(--white);padding:8px">
      <summary style="cursor:pointer;font-weight:900;color:var(--navy)">Diagnostics Smoke (${escapeHtml(summary.smokeRuns || 0)})</summary>
      ${latest ? `
        <div style="display:grid;gap:5px;margin-top:8px">
          <div style="font-size:.78rem;color:${latest.ok ? 'var(--green)' : 'var(--red)'};font-weight:900">Latest ${escapeHtml(latest.ok ? 'OK' : 'FAIL')} | ${escapeHtml(formatDateTimeSafe(latest.ts))}</div>
          ${checks.slice(0, 12).map(check => `
            <div style="display:grid;grid-template-columns:auto 1fr;gap:7px;align-items:center;font-size:.78rem">
              <span class="badge ${check.ok ? 'done' : 'urgent'}">${check.ok ? 'OK' : 'FAIL'}</span>
              <span>${escapeHtml(check.label || check.id || '-')}</span>
            </div>
          `).join('')}
          ${checks.length > 12 ? `<div style="font-size:.76rem;color:var(--muted);font-weight:800">+${checks.length - 12} more checks</div>` : ''}
        </div>
      ` : '<div style="font-size:.78rem;color:var(--muted);font-weight:800;margin-top:8px">No smoke result in package.</div>'}
    </details>`;
}

function renderDiagnosticsDashboardSafety(rows = []) {
  return `
    <details open style="border:1px solid var(--border);border-radius:8px;background:var(--white);padding:8px">
      <summary style="cursor:pointer;font-weight:900;color:var(--navy)">Dashboard Safety (${escapeHtml(rows.length)})</summary>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(125px,1fr));gap:8px;margin-top:8px">
        ${rows.length ? rows.map(row => `
          <div style="border:1px solid var(--border);border-radius:8px;background:var(--input-bg);padding:8px">
            <div style="font-size:.72rem;color:var(--muted);font-weight:900">${escapeHtml(row.label || '-')}</div>
            <div style="font-size:.95rem;font-weight:900;color:var(--navy);overflow-wrap:anywhere">${escapeHtml(row.value ?? '-')}</div>
          </div>
        `).join('') : `
          <div style="border:1px solid var(--border);border-left:4px solid var(--border);border-radius:8px;background:var(--input-bg);padding:8px">
            <div style="font-size:.8rem;font-weight:900;color:var(--navy)">No dashboard safety summary.</div>
            <div style="font-size:.75rem;color:var(--muted);font-weight:800;line-height:1.35;margin-top:4px">The imported package did not include dashboard safety cards.</div>
          </div>
        `}
      </div>
    </details>`;
}

function renderDiagnosticsActionPlan(rows = []) {
  return `
    <details open style="border:1px solid var(--border);border-radius:8px;background:var(--white);padding:8px">
      <summary style="cursor:pointer;font-weight:900;color:var(--navy)">Diagnostics Action Plan (${escapeHtml(rows.length)})</summary>
      <div style="display:grid;gap:7px;margin-top:8px">
        ${rows.length ? rows.map(row => `
          <div style="border:1px solid var(--border);border-left:4px solid var(--orange);border-radius:8px;background:var(--input-bg);padding:8px">
            <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap">
              <strong style="font-size:.8rem;color:var(--navy)">${escapeHtml(row.label || '-')}</strong>
              <span class="badge mid">${escapeHtml(row.nextStep || 'Review')}</span>
            </div>
            <div style="font-size:.75rem;color:var(--muted);font-weight:800;line-height:1.35;margin-top:4px">${escapeHtml(row.detail || '-')}</div>
            <div style="font-size:.72rem;color:var(--muted);font-weight:900;margin-top:5px">Target: ${escapeHtml(row.page || '-')} ${row.settingsSection ? `/ ${escapeHtml(row.settingsSection)}` : ''}</div>
          </div>
        `).join('') : `
          <div style="border:1px solid var(--border);border-left:4px solid var(--green);border-radius:8px;background:var(--input-bg);padding:8px">
            <div style="font-size:.8rem;font-weight:900;color:var(--green)">No imported readiness blockers.</div>
            <div style="font-size:.75rem;color:var(--muted);font-weight:800;line-height:1.35;margin-top:4px">The imported handoff report has no action items.</div>
          </div>
        `}
      </div>
    </details>`;
}

function renderDiagnosticsHealth(rows = []) {
  return `
    <details style="border:1px solid var(--border);border-radius:8px;background:var(--white);padding:8px">
      <summary style="cursor:pointer;font-weight:900;color:var(--navy)">Diagnostics Health (${escapeHtml(rows.length)})</summary>
      <div style="display:grid;gap:5px;margin-top:8px">
        ${rows.map(issue => `
          <div style="border-left:4px solid ${issue.level === 'urgent' ? 'var(--red)' : 'var(--orange)'};background:var(--input-bg);border-radius:8px;padding:7px">
            <strong style="font-size:.8rem;color:var(--navy)">${escapeHtml(issue.title || '-')}</strong>
            <div style="font-size:.76rem;color:var(--muted);font-weight:800">${escapeHtml(issue.detail || '')}</div>
          </div>
        `).join('') || '<div style="font-size:.78rem;color:var(--green);font-weight:900">No health issues in package.</div>'}
      </div>
    </details>`;
}

function renderDiagnosticsSync(syncPreview, postWritePreview) {
  const rows = [
    ['Preview', syncPreview],
    ['Post-write', postWritePreview],
  ].filter(([, preview]) => preview);
  return `
    <details style="border:1px solid var(--border);border-radius:8px;background:var(--white);padding:8px">
      <summary style="cursor:pointer;font-weight:900;color:var(--navy)">Diagnostics Sync (${escapeHtml(rows.length)})</summary>
      <div style="display:grid;gap:6px;margin-top:8px">
        ${rows.map(([label, preview]) => `
          <div style="border:1px solid var(--border);border-radius:8px;background:var(--input-bg);padding:8px">
            <div style="font-size:.8rem;font-weight:900;color:var(--navy)">${escapeHtml(label)}: +${escapeHtml(preview.totalCreate)} ~${escapeHtml(preview.totalUpdate)} -${escapeHtml(preview.totalRemove)}</div>
            <div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:5px">
              ${(preview.tables || []).map(table => `<span class="badge mid">${escapeHtml(table.label)} L${escapeHtml(table.local)} R${escapeHtml(table.remote)} +${escapeHtml(table.create)} ~${escapeHtml(table.update)} -${escapeHtml(table.remove)}</span>`).join('')}
            </div>
          </div>
        `).join('') || '<div style="font-size:.78rem;color:var(--muted);font-weight:800">No sync preview in package.</div>'}
      </div>
    </details>`;
}

function renderDiagnosticsDb(dbTables = {}, schemaTables = {}, v15DbCoverage = []) {
  const dbRows = Object.entries(dbTables);
  const schemaRows = Object.entries(schemaTables);
  const readiness = summarizeV15DbCoverage(v15DbCoverage);
  const sortedV15DbCoverage = [...v15DbCoverage].sort((a, b) => Number(Boolean(a.ok)) - Number(Boolean(b.ok)));
  return `
    <details style="border:1px solid var(--border);border-radius:8px;background:var(--white);padding:8px">
      <summary style="cursor:pointer;font-weight:900;color:var(--navy)">Diagnostics DB / Schema</summary>
      <div style="display:grid;gap:8px;margin-top:8px">
        <div style="display:flex;gap:5px;flex-wrap:wrap">
          ${dbRows.map(([table, row]) => `<span class="badge ${row.ok ? 'done' : 'urgent'}">${escapeHtml(table)} ${escapeHtml(row.count ?? '-')} rows</span>`).join('') || '<span style="font-size:.78rem;color:var(--muted);font-weight:800">No DB status.</span>'}
        </div>
        <div style="display:flex;gap:5px;flex-wrap:wrap">
          ${schemaRows.map(([table, row]) => `<span class="badge ${(row.missing || []).length ? 'mid' : 'done'}">${escapeHtml(table)} ${escapeHtml(row.coverage ?? 0)}%</span>`).join('') || '<span style="font-size:.78rem;color:var(--muted);font-weight:800">No schema status.</span>'}
        </div>
        <div data-diagnostics-v15-db-coverage style="border-top:1px solid var(--border);padding-top:8px">
          <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:5px">
            <div style="font-size:.76rem;color:var(--muted);font-weight:900">Diagnostics V15 DB Coverage (${escapeHtml(readiness.label)})</div>
            ${readiness.status !== 'not-loaded' ? `<span class="badge ${readiness.ok ? 'done' : 'urgent'}">${escapeHtml(readiness.status)}</span>` : ''}
          </div>
          ${readiness.warning ? `<div data-diagnostics-v15-db-readiness-warning style="font-size:.76rem;color:var(--orange);font-weight:900;margin-bottom:5px">${escapeHtml(readiness.warning)}</div>` : ''}
          <div style="display:flex;gap:5px;flex-wrap:wrap">
            ${sortedV15DbCoverage.map(row => `<span title="${escapeHtml(row.error ? `${row.table}: ${row.error}` : row.table)}" class="badge ${row.ok ? 'done' : 'urgent'}">${escapeHtml(row.label || V15_DB_TABLE_LABELS[row.table] || row.table)} ${row.count === null ? '-' : escapeHtml(row.count)}</span>`).join('') || '<span style="font-size:.78rem;color:var(--muted);font-weight:800">No V15 coverage in package.</span>'}
          </div>
          ${sortedV15DbCoverage.some(row => row.error) ? `
            <div data-diagnostics-v15-db-table-errors style="display:grid;gap:5px;margin-top:8px">
              <div style="font-size:.76rem;color:var(--muted);font-weight:900">Diagnostics V15 DB Table Errors</div>
              ${sortedV15DbCoverage.filter(row => row.error).map(row => `
                <div style="border:1px solid var(--border);border-left:4px solid var(--red);border-radius:8px;background:var(--input-bg);padding:7px">
                  <strong style="font-size:.78rem;color:var(--navy)">${escapeHtml(row.label || V15_DB_TABLE_LABELS[row.table] || row.table)}</strong>
                  <div style="font-size:.72rem;color:var(--red);font-weight:800">${escapeHtml(row.error)}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    </details>`;
}

function renderDiagnosticsV15Audit(rows = [], highlights = []) {
  return `
    <details style="border:1px solid var(--border);border-radius:8px;background:var(--white);padding:8px">
      <summary style="cursor:pointer;font-weight:900;color:var(--navy)">Diagnostics V15 Audit (${escapeHtml(rows.length)} / risk ${escapeHtml(highlights.length)})</summary>
      <div style="display:grid;gap:5px;margin-top:8px">
        <div data-diagnostics-v15-audit-risk-preview style="border:1px solid var(--border);border-radius:8px;background:var(--input-bg);padding:7px">
          <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:5px">
            <div style="font-size:.76rem;color:var(--muted);font-weight:900">Diagnostics V15 Audit Risk Preview</div>
            <span class="badge ${highlights.length ? 'urgent' : 'done'}">${escapeHtml(highlights.length)}</span>
          </div>
          ${highlights.length ? highlights.map(entry => `
            <div style="display:grid;grid-template-columns:auto 1fr auto;gap:7px;align-items:center;margin-top:5px">
              <span class="badge urgent">${escapeHtml(entry.action || '-')}</span>
              <strong style="font-size:.76rem;color:var(--navy)">${escapeHtml(entry.entityType || '-')} ${escapeHtml(entry.entityId || '')}</strong>
              <span style="font-size:.7rem;color:var(--muted);font-weight:900">${escapeHtml(formatDateTimeSafe(entry.createdAt))}</span>
            </div>
          `).join('') : '<div style="font-size:.76rem;color:var(--muted);font-weight:800">No failed/error/delete/rollback actions in package.</div>'}
        </div>
        ${rows.map(entry => `
          <div style="display:grid;grid-template-columns:auto 1fr auto;gap:7px;align-items:center;border:1px solid var(--border);border-radius:8px;background:var(--input-bg);padding:7px">
            <span class="badge mid">${escapeHtml(entry.action || '-')}</span>
            <div>
              <strong style="font-size:.78rem;color:var(--navy)">${escapeHtml(entry.entityType || '-')} ${escapeHtml(entry.entityId || '')}</strong>
              <div style="font-size:.72rem;color:var(--muted);font-weight:800">${escapeHtml(entry.actor || '-')}</div>
            </div>
            <span style="font-size:.72rem;color:var(--muted);font-weight:900">${escapeHtml(formatDateTimeSafe(entry.createdAt))}</span>
          </div>
        `).join('') || '<div style="font-size:.78rem;color:var(--muted);font-weight:800">No V15 audit rows in package.</div>'}
      </div>
    </details>`;
}

function renderDiagnosticsAudit(rows = []) {
  return `
    <details style="border:1px solid var(--border);border-radius:8px;background:var(--white);padding:8px">
      <summary style="cursor:pointer;font-weight:900;color:var(--navy)">Diagnostics Audit (${escapeHtml(rows.length)})</summary>
      <div style="display:grid;gap:5px;margin-top:8px">
        ${rows.map(entry => `
          <div style="border:1px solid var(--border);border-left:4px solid ${entry.write?.ok ? 'var(--green)' : 'var(--red)'};border-radius:8px;background:var(--input-bg);padding:7px">
            <div style="font-size:.8rem;font-weight:900;color:var(--navy)">${escapeHtml(formatDateTimeSafe(entry.ts))}</div>
            <div style="font-size:.76rem;color:var(--muted);font-weight:800">Tables ${(entry.tables || []).join(', ') || '-'} | wrote ${escapeHtml(entry.write?.written || 0)} | errors ${escapeHtml(entry.write?.errors?.length || 0)}</div>
          </div>
        `).join('') || '<div style="font-size:.78rem;color:var(--muted);font-weight:800">No audit entries in package.</div>'}
      </div>
    </details>`;
}

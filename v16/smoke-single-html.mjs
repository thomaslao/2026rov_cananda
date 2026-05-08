import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const htmlPath = resolve(root, 'ROV_Task_Manager_v16.html');
const checks = [];

function check(label, ok, detail = '') {
  checks.push({ label, ok: Boolean(ok), detail });
}

function makeElement() {
  return {
    innerHTML: '',
    value: '',
    dataset: {},
    style: {},
    addEventListener() {},
    append() {},
    click() {},
    remove() {},
    closest() { return null; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    set href(value) { this._href = value; },
    set download(value) { this._download = value; },
  };
}

function createStorage() {
  const storage = new Map();
  return {
    getItem: key => (storage.has(key) ? storage.get(key) : null),
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: key => storage.delete(key),
    key: index => [...storage.keys()][index] || null,
    get length() { return storage.size; },
  };
}

if (!existsSync(htmlPath)) {
  check('single html exists', false, htmlPath);
} else {
  check('single html exists', true, htmlPath);
  const html = readFileSync(htmlPath, 'utf8');
  const script = html.match(/<script>([\s\S]*)<\/script>/)?.[1] || '';
  check('single html has inline script', script.length > 1000, `${script.length} chars`);
  check('single html has inline css', html.includes('<style>') && html.includes(':root'), '');
  check('single html style starts cleanly', html.includes('<style>\n:root') && !html.includes('嚜?root') && !html.includes('\uFEFF:root'), '');
  check('single html has readable fallback text', html.includes('ROV Task Manager v16 loading...') && html.includes('failed to load / 載入失敗') && !html.includes('甇?') && !html.includes('頛'), '');

  const app = makeElement();
  app.addEventListener = () => {};
  globalThis.localStorage = createStorage();
  globalThis.document = {
    head: makeElement(),
    body: makeElement(),
    createElement: makeElement,
    getElementById: id => (id === 'app' ? app : null),
    querySelector: () => null,
    querySelectorAll: () => [],
  };
  globalThis.window = {
    addEventListener() {},
    confirm: () => true,
    prompt: () => null,
    location: { reload() {} },
  };
  globalThis.alert = () => {};
  globalThis.FileReader = class {};
  globalThis.URL = { createObjectURL: () => '', revokeObjectURL() {} };
  globalThis.Blob = class {
    constructor(parts = [], options = {}) {
      this.parts = parts;
      this.options = options;
    }
  };
  globalThis.structuredClone ||= value => JSON.parse(JSON.stringify(value));

  try {
    Function(script)();
    check('single html renders app root', app.innerHTML.length > 1000, `${app.innerHTML.length} chars`);
    check('single html renders dashboard', app.innerHTML.includes('page-dashboard'), '');
    check('single html includes language toggle', script.includes('data-locale-toggle') && script.includes('data-next-locale') && script.includes('繁中 / EN') && script.includes('function labelFor') && script.includes('valueInProgress'), '');
    check('single html includes data safety', script.includes('data-settings-data-safety') && script.includes('data-settings-action-log'), '');
    check('single html includes task shortcut support', script.includes('data-task-next-status') && script.includes('getNextTaskStatus') && script.includes('data-task-open-modal') && script.includes('data-task-modal') && script.includes("a.task.status === 'Done' ? 1 : 0"), '');
    check('single html includes submitted task search', script.includes('data-task-search-submit') && script.includes('applyTaskSearchFromDom') && script.includes("event.target.closest('[data-task-search]')"), '');
    check('single html includes task header sorting', script.includes('data-task-header-sort') && script.includes('task-sort-button') && script.includes("sort === 'name-desc'") && script.includes("sort === 'priority-desc'"), '');
    check('single html includes dashboard stat shortcuts', script.includes('data-dashboard-stat') && script.includes('applyDashboardStatTarget') && script.includes("status: 'active'") && script.includes("health === 'overdue'"), '');
    check('single html includes dashboard task charts', script.includes('data-dashboard-task-charts') && script.includes('buildTaskStatusChartData') && script.includes('buildTaskBurndownData') && html.includes('.dashboard-chart-grid'), '');
    check('single html includes toast feedback support', script.includes('data-app-toast') && script.includes('showToast') && html.includes('.toast.success'), '');
    check('single html includes undo support', script.includes('data-action="undo-last-change"') && script.includes('restoreUndo') && html.includes('.toast-undo'), '');
    check('single html includes persistent undo bar', script.includes('data-undo-bar') && script.includes('renderUndoBar') && html.includes('.undo-bar'), '');
    check('single html includes keyboard undo', script.includes('event.key.toLowerCase()') && script.includes('ctrlKey') && script.includes('metaKey'), '');
    check('single html persists undo state', script.includes('rov_v16_last_undo') && script.includes('loadUndoState') && script.includes('saveUndoState') && script.includes('UNDO_BAR_AUTO_CLEAR_MS') && script.includes('scheduleUndoAutoClear'), '');
    check('single html includes undo clear control', script.includes('data-action="clear-undo"') && script.includes('undoCleared') && script.includes('toLocaleString()'), '');
    check('single html includes action log', script.includes('rov_v16_action_log') && script.includes('recordAction') && script.includes('data-settings-action-log'), '');
    check('single html includes action log management', script.includes('data-action="export-action-log"') && script.includes('clearActionLog') && script.includes('exportActionLog'), '');
    check('single html auto syncs saved edits', script.includes('scheduleAutoSupabaseSync') && script.includes('executeAutoSupabaseWriteSync') && script.includes('lastDbStatus = await loadSupabaseReadOnly()') && script.includes('Synced to Supabase') && script.includes('Auto Supabase sync failed'), '');
    check('single html auto loads supabase on startup', script.includes('scheduleInitialSupabaseLoad') && script.includes('loadSupabaseIntoApp') && script.includes('scheduleInitialSupabaseLoad();'), '');
    check('single html auto sync has schema fallback', script.includes('upsertRowsWithSchemaFallback') && script.includes('getMissingColumnFromError') && script.includes("Could not find the '"), '');
    check('single html includes safety status summary', script.includes('data-settings-safety-status') && script.includes('undoSnapshot') && script.includes('notAvailable'), '');
    check('single html includes safety report export', script.includes('data-action="export-safety-report"') && script.includes('exportSafetyReport') && script.includes('rov_v16_safety_report'), '');
    check('single html includes safety report context', script.includes('context: {') && script.includes('currentPage: appState.currentPage') && script.includes('locale: getLocale()') && script.includes('APP_STATE_STORAGE_KEY') && script.includes('supabaseTouched: false'), '');
    check('single html includes safety metadata clearing', script.includes('data-action="clear-safety-metadata"') && script.includes('clearSafetyMetadata') && script.includes('confirmClearSafetyMetadata'), '');
    check('single html includes settings validation summary actions', script.includes('data-readiness-validation-summary') && script.includes('settings-release-readiness') && script.includes('data-settings-scroll="settings-data-safety"'), '');
    check('single html labels v15 supabase read-only import', script.includes('v15 production Supabase DB') && script.includes('readOnly: true') && script.includes('Load v15 Supabase DB'), '');
    check('single html dedupes v15 supabase import', script.includes('dedupeRows') && script.includes('dedupeSummary') && script.includes('data-v15-import-dedupe-summary'), '');
    check('single html shows v15 db coverage summary', script.includes('data-v15-db-coverage') && script.includes('V15 Supabase coverage') && script.includes('V15_DB_TABLE_LABELS'), '');
    check('single html shows v15 db table errors', script.includes('data-v15-db-table-errors') && script.includes('V15 Supabase table errors') && script.includes('data-diagnostics-v15-db-table-errors'), '');
    check('single html warns on partial v15 db coverage', script.includes('data-v15-db-readiness-warning') && script.includes('Read-only partial') && script.includes('V15 DB incomplete'), '');
    check('single html exports v15 db coverage diagnostics', script.includes('buildV15DbCoverage') && script.includes('summarizeV15DbCoverage') && script.includes('v15DbReadiness') && script.includes('payload.supabase?.v15DbCoverage'), '');
    check('single html adds v15 db coverage to handoff dashboard safety', script.includes("label: 'V15 DB'") && script.includes('v15DbCoverageValue') && script.includes("settingsSection: 'settings-db-section'"), '');
    check('single html previews imported v15 db coverage diagnostics', script.includes('data-diagnostics-v15-db-coverage') && script.includes('data-diagnostics-v15-db-readiness-warning') && script.includes('Diagnostics V15 DB Coverage') && script.includes('No V15 coverage in package.'), '');
    check('single html summarizes imported v15 db coverage', script.includes("stats.diagnosticsSummary.v15DbReadiness?.label") && script.includes('v15DbOk') && script.includes("const isV15Db = label === 'V15 DB'"), '');
    check('single html previews v15 audit rows', script.includes('data-v15-audit-preview') && script.includes('V15 Audit preview') && script.includes('No v15 audit rows loaded.'), '');
    check('single html highlights risky v15 audit rows', script.includes('buildV15AuditHighlights') && script.includes('data-v15-audit-risk-preview') && script.includes('data-diagnostics-v15-audit-risk-preview') && script.includes('failed/error/delete/rollback'), '');
    check('single html imports v15 task attachments as evidence', script.includes('task_attachments') && script.includes('normalizeTaskAttachment') && script.includes('attachEvidenceToTasks') && script.includes('v15-attachment'), '');
    check('single html counts v15 attachments in diagnostics', script.includes('attachments: data.attachments?.length || 0') && script.includes("['Evidence', stats.diagnosticsSummary.counts.attachments || 0]"), '');
    check('single html imports v15 quotes read-only', script.includes('quotes') && script.includes('normalizeQuote') && script.includes('dedupedQuotes.rows'));
    check('single html counts v15 quotes in diagnostics', script.includes('quotes: data.quotes?.length || 0') && script.includes("['Quotes', stats.diagnosticsSummary.counts.quotes || 0]"), '');
    check('single html imports v15 audit log read-only', script.includes('audit_log') && script.includes('normalizeAuditLogEntry') && script.includes("v15AuditLog: get('audit_log').map(normalizeAuditLogEntry)"), '');
    check('single html orders v15 audit newest first', script.includes("selectTable(client, 'audit_log', 'created_at', false)") && script.includes('query.order(orderColumn, { ascending })'), '');
    check('single html exports v15 audit in diagnostics', script.includes('v15AuditLog: v15AuditLog.slice(0, 10)') && script.includes('v15AuditHighlights: buildV15AuditHighlights') && script.includes('const v15AuditLog = payload.v15AuditLog || []'), '');
    check('single html previews imported v15 audit diagnostics', script.includes('renderDiagnosticsV15Audit') && script.includes('Diagnostics V15 Audit') && script.includes('Diagnostics V15 Audit Risk Preview') && script.includes('No V15 audit rows in package.'), '');
    check('single html counts v15 audit log in diagnostics', script.includes('v15AuditLog: data.v15AuditLog?.length || 0') && script.includes("['V15 Audit', stats.diagnosticsSummary.counts.v15AuditLog || 0]"), '');
    check('single html imports v15 practice runs read-only', script.includes('practice_runs') && script.includes('normalizePracticeRun') && script.includes("practiceRuns: get('practice_runs').map(normalizePracticeRun)"), '');
    check('single html counts v15 practice runs in diagnostics', script.includes('practiceRuns: data.practiceRuns?.length || 0') && script.includes("['Practice', stats.diagnosticsSummary.counts.practiceRuns || 0]"), '');
    check('single html imports handoff reports in diagnostics viewer', script.includes('rov_v16_handoff_report') && script.includes('Not a v16 diagnostics or handoff payload') && script.includes('sourceLabel'), '');
    check('single html previews diagnostics dashboard safety', script.includes('renderDiagnosticsDashboardSafety') && script.includes('Dashboard Safety') && script.includes('dashboardSafetySummary'), '');
    check('single html shows empty diagnostics dashboard safety', script.includes('No dashboard safety summary.') && script.includes('did not include dashboard safety cards'), '');
    check('single html formats diagnostics dates safely', script.includes('function formatDateTimeSafe') && script.includes('Number.isNaN(date.getTime())') && script.includes('formatDateTimeSafe(stats.diagnosticsSummary.exportedAt)') && script.includes('formatDateTimeSafe(stats.diagnosticsSummary.importedAt)'), '');
    check('single html previews diagnostics action plan', script.includes('renderDiagnosticsActionPlan') && script.includes('Diagnostics Action Plan') && script.includes('readinessActionPlan'), '');
    check('single html shows empty diagnostics action plan', script.includes('No imported readiness blockers.') && script.includes('no action items'), '');
    check('single html summarizes imported blockers', script.includes("['Blockers', stats.diagnosticsSummary.readinessActionPlan?.length || 0]"), '');
    check('single html highlights imported blockers', script.includes("const isBlockers = label === 'Blockers'") && script.includes('border-left:4px solid') && script.includes("blockerCount ? 'var(--orange)' : 'var(--green)'"), '');
    check('single html summarizes imported readiness', script.includes("['Readiness', stats.diagnosticsSummary.validationSummary ? `${stats.diagnosticsSummary.validationSummary.readinessPassed}/${stats.diagnosticsSummary.validationSummary.readinessTotal}` : '-']"), '');
    check('single html highlights imported readiness', script.includes("const isReadiness = label === 'Readiness'") && script.includes('readinessOk') && script.includes('readinessPassed === readinessTotal'), '');
    check('single html highlights imported smoke', script.includes("const isSmoke = label === 'Smoke'") && script.includes("value === 'OK' ? 'var(--green)' : 'var(--red)'"), '');
    check('single html highlights imported health', script.includes("const isHealth = label === 'Health'") && script.includes('healthCount') && script.includes("healthCount ? 'var(--orange)' : 'var(--green)'"), '');
    check('single html highlights imported audit', script.includes("const isAudit = label === 'Audit'") && script.includes('auditCount') && script.includes("auditCount ? 'var(--green)' : 'var(--navy)'"), '');
  } catch (error) {
    check('single html executes without error', false, error?.stack || String(error));
  }
}

console.table(checks.map(row => ({
  ok: row.ok ? 'OK' : 'FAIL',
  check: row.label,
  detail: row.detail,
})));

const failed = checks.filter(row => !row.ok);
if (failed.length) {
  console.error(`v16 single-html smoke failed: ${failed.length}/${checks.length}`);
  process.exit(1);
}

console.log(`v16 single-html smoke passed: ${checks.length} checks`);

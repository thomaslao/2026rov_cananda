import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const checks = [];

function check(label, ok, detail = '') {
  checks.push({ label, ok: Boolean(ok), detail });
}

function read(relativePath) {
  const path = resolve(root, relativePath);
  check(`exists ${relativePath}`, existsSync(path), path);
  return existsSync(path) ? readFileSync(path, 'utf8') : '';
}

function readFromWorkspace(relativePath) {
  const path = resolve(root, '..', relativePath);
  check(`exists ../${relativePath}`, existsSync(path), path);
  return existsSync(path) ? readFileSync(path, 'utf8') : '';
}

const html = read('index.html');
const rootLauncher = readFromWorkspace('OPEN_V16.html');
const app = read('src/app.js');
const css = read('styles/app.css');
const settings = read('src/features/settings.js');
const health = read('src/features/health.js');
const intel = read('src/features/intel.js');
const members = read('src/features/members.js');
const navigation = read('src/features/navigation.js');
const tasks = read('src/features/tasks.js');
const prep = read('src/features/prep.js');
const competition = read('src/features/competition.js');
const legacy = read('src/features/legacy.js');
const i18n = read('src/utils/i18n.js');
const sync = read('src/data/sync.js');
const supabase = read('src/data/supabase.js');
const diagnostics = read('src/data/diagnostics.js');
const migration = read('src/data/migration.js');
const packageJson = read('package.json');
const releaseNotes = read('RELEASE_NOTES.md');
const readme = read('README.md');
const serveScript = read('serve.mjs');
const statusScript = read('status-v16.mjs');
const startLocal = read('start-local.ps1');
const stopLocal = read('stop-local.ps1');
const validateLocal = read('validate-local.ps1');
const singleHtmlBuilder = read('build-single-html.mjs');
const singleHtmlSmoke = read('smoke-single-html.mjs');
const gitignore = read('.gitignore');
const e2eReadiness = read('e2e-readiness.mjs');

check('html has app root', html.includes('<main id="app"></main>'));
check('html loads app module', html.includes('src="./src/app.js"'));
check('html defers supabase cdn', !html.includes('@supabase/supabase-js') && supabase.includes('@supabase/supabase-js'));
check('browser-safe assignment syntax', !`${app}\n${supabase}`.match(/\|\|=|&&=|\?\?=/));
check('package has check:js script', packageJson.includes('"check:js"') && packageJson.includes('node --check src/app.js'));
check('package has serve script', packageJson.includes('"serve"') && packageJson.includes('node serve.mjs'));
check('package has background start script', packageJson.includes('"start:local"') && packageJson.includes('start-local.ps1'));
check('package has background stop script', packageJson.includes('"stop:local"') && packageJson.includes('stop-local.ps1'));
check('package has status script', packageJson.includes('"status"') && packageJson.includes('node status-v16.mjs'));
check('package has single html build script', packageJson.includes('"build:single"') && packageJson.includes('build-single-html.mjs'));
check('package has single html smoke script', packageJson.includes('"smoke:single"') && packageJson.includes('smoke-single-html.mjs'));
check('package has local server smoke script', packageJson.includes('"smoke:server:local"') && packageJson.includes('validate-local.ps1'));
check('package validate runs single and local server smoke', packageJson.includes('npm run build:single') && packageJson.includes('npm run smoke:single') && packageJson.includes('npm run smoke:server:local'));
check('root launcher opens packaged v16 app', rootLauncher.includes('v16/ROV_Task_Manager_v16.html') && rootLauncher.includes('Open v16') && rootLauncher.includes('http-equiv="refresh"'));
check('delete actions require confirmation', app.includes('function confirmDelete') && app.includes('window.confirm') && app.includes("t('confirmDelete')"));
check('gitignore excludes local artifacts', gitignore.includes('node_modules/') && gitignore.includes('*.log') && gitignore.includes('test-results/'));
check('validate-local uses temporary server', validateLocal.includes('8017') && validateLocal.includes('Start-Process') && validateLocal.includes('Stop-Process'));
check('validate-local chooses an available port', validateLocal.includes('Test-PortAvailable') && validateLocal.includes('V16_VALIDATE_PORT_ATTEMPTS') && validateLocal.includes('No available validation port'));
check('e2e readiness scans fallback ports', e2eReadiness.includes('V16_BASE_URLS') && e2eReadiness.includes('/healthz') && e2eReadiness.includes('8016 + index'));
check('e2e readiness requires v16 health before app check', e2eReadiness.includes('findV16BaseUrl') && e2eReadiness.includes('local v16 app reachable') && e2eReadiness.includes('No v16 health endpoint found.'));
check('e2e readiness treats Playwright spawn as warning', e2eReadiness.includes('const warnings = []') && e2eReadiness.includes('Browser E2E may be limited') && e2eReadiness.includes("warning: 'WARN'"));
check('serve script defaults to 8016', serveScript.includes('V16_PORT') && serveScript.includes('8016'));
check('serve script falls back when port is busy', serveScript.includes('EADDRINUSE') && serveScript.includes('V16_PORT_ATTEMPTS') && serveScript.includes('trying'));
check('serve script blocks path traversal', serveScript.includes('startsWith') && serveScript.includes('Not found'));
check('serve script exposes healthz', serveScript.includes('/healthz') && serveScript.includes("status: 'ok'"));
check('start-local launches background server', startLocal.includes('Start-Process') && startLocal.includes('status-v16.mjs') && startLocal.includes('v16-server.log'));
check('stop-local only stops v16 server process', stopLocal.includes('Get-CimInstance Win32_Process') && stopLocal.includes('serve\\.mjs') && stopLocal.includes('Stop-Process'));
check('status script finds active v16 url', statusScript.includes('V16_STATUS_PORTS') && statusScript.includes('/healthz') && statusScript.includes('ROV Task Manager v16 is usable at'));
check('single html builder outputs root standalone html', singleHtmlBuilder.includes('ROV_Task_Manager_v16.html') && singleHtmlBuilder.includes('<style>') && singleHtmlBuilder.includes('<script>'));
check('single html builder strips css bom', singleHtmlBuilder.includes('function stripBom') && singleHtmlBuilder.includes('^\\uFEFF'));
check('single html builder has readable fallback text', singleHtmlBuilder.includes('ROV Task Manager v16 loading...') && singleHtmlBuilder.includes('failed to load / 載入失敗') && !singleHtmlBuilder.includes('甇?') && !singleHtmlBuilder.includes('頛'));
check('single html smoke executes inline app', singleHtmlSmoke.includes('Function(script)') && singleHtmlSmoke.includes('page-dashboard') && singleHtmlSmoke.includes('data-settings-data-safety'));
check('single html smoke verifies clean style start', singleHtmlSmoke.includes('<style>\\n:root') && singleHtmlSmoke.includes('single html style starts cleanly'));
check('single html smoke verifies toast feedback', singleHtmlSmoke.includes('data-app-toast') && singleHtmlSmoke.includes('.toast.success'));
check('single html smoke verifies undo support', singleHtmlSmoke.includes('undo-last-change') && singleHtmlSmoke.includes('restoreUndo'));
check('single html smoke verifies persistent undo bar', singleHtmlSmoke.includes('data-undo-bar') && singleHtmlSmoke.includes('renderUndoBar'));
check('single html smoke verifies keyboard undo', singleHtmlSmoke.includes('event.key.toLowerCase()') && singleHtmlSmoke.includes('ctrlKey') && singleHtmlSmoke.includes('metaKey'));
check('single html smoke verifies persistent undo storage', singleHtmlSmoke.includes('rov_v16_last_undo') && singleHtmlSmoke.includes('loadUndoState') && singleHtmlSmoke.includes('saveUndoState'));
check('single html smoke verifies undo clear control', singleHtmlSmoke.includes('data-action="clear-undo"') && singleHtmlSmoke.includes('undoCleared') && singleHtmlSmoke.includes('toLocaleString()'));
check('single html smoke verifies action log', singleHtmlSmoke.includes('rov_v16_action_log') && singleHtmlSmoke.includes('recordAction') && singleHtmlSmoke.includes('data-settings-action-log'));
check('single html smoke verifies action log management', singleHtmlSmoke.includes('data-action="export-action-log"') && singleHtmlSmoke.includes('clearActionLog') && singleHtmlSmoke.includes('exportActionLog'));
check('single html smoke verifies safety status summary', singleHtmlSmoke.includes('data-settings-safety-status') && singleHtmlSmoke.includes('undoSnapshot') && singleHtmlSmoke.includes('notAvailable'));
check('single html smoke verifies safety report export', singleHtmlSmoke.includes('data-action="export-safety-report"') && singleHtmlSmoke.includes('exportSafetyReport') && singleHtmlSmoke.includes('rov_v16_safety_report'));
check('single html smoke verifies safety report context', singleHtmlSmoke.includes('context: {') && singleHtmlSmoke.includes('currentPage: appState.currentPage') && singleHtmlSmoke.includes('locale: getLocale()') && singleHtmlSmoke.includes('APP_STATE_STORAGE_KEY') && singleHtmlSmoke.includes('supabaseTouched: false'));
check('single html smoke verifies safety metadata clearing', singleHtmlSmoke.includes('data-action="clear-safety-metadata"') && singleHtmlSmoke.includes('clearSafetyMetadata') && singleHtmlSmoke.includes('confirmClearSafetyMetadata'));
check('single html smoke verifies v15 supabase read-only import label', singleHtmlSmoke.includes('single html labels v15 supabase read-only import') && singleHtmlSmoke.includes('v15 production Supabase DB'));
check('single html smoke verifies v15 supabase dedupe', singleHtmlSmoke.includes('single html dedupes v15 supabase import') && singleHtmlSmoke.includes('dedupeSummary'));
check('single html smoke verifies v15 db coverage summary', singleHtmlSmoke.includes('single html shows v15 db coverage summary') && singleHtmlSmoke.includes('data-v15-db-coverage'));
check('single html smoke verifies v15 db table errors', singleHtmlSmoke.includes('single html shows v15 db table errors') && singleHtmlSmoke.includes('data-v15-db-table-errors'));
check('single html smoke verifies v15 db coverage diagnostics export', singleHtmlSmoke.includes('single html exports v15 db coverage diagnostics') && singleHtmlSmoke.includes('buildV15DbCoverage'));
check('single html smoke verifies v15 db handoff dashboard safety', singleHtmlSmoke.includes('single html adds v15 db coverage to handoff dashboard safety') && singleHtmlSmoke.includes('v15DbCoverageValue'));
check('single html smoke verifies imported v15 db coverage diagnostics preview', singleHtmlSmoke.includes('single html previews imported v15 db coverage diagnostics') && singleHtmlSmoke.includes('data-diagnostics-v15-db-coverage'));
check('single html smoke verifies imported v15 db coverage summary', singleHtmlSmoke.includes('single html summarizes imported v15 db coverage') && singleHtmlSmoke.includes("const isV15Db = label === 'V15 DB'"));
check('single html smoke verifies v15 audit preview', singleHtmlSmoke.includes('single html previews v15 audit rows') && singleHtmlSmoke.includes('data-v15-audit-preview'));
check('single html smoke verifies v15 task attachment evidence import', singleHtmlSmoke.includes('single html imports v15 task attachments as evidence') && singleHtmlSmoke.includes('v15-attachment'));
check('single html smoke verifies diagnostics attachment counts', singleHtmlSmoke.includes('single html counts v15 attachments in diagnostics') && singleHtmlSmoke.includes("['Evidence', stats.diagnosticsSummary.counts.attachments || 0]"));
check('single html smoke verifies v15 quotes import', singleHtmlSmoke.includes('single html imports v15 quotes read-only') && singleHtmlSmoke.includes('normalizeQuote'));
check('single html smoke verifies diagnostics quote counts', singleHtmlSmoke.includes('single html counts v15 quotes in diagnostics') && singleHtmlSmoke.includes("['Quotes', stats.diagnosticsSummary.counts.quotes || 0]"));
check('single html smoke verifies v15 audit log import', singleHtmlSmoke.includes('single html imports v15 audit log read-only') && singleHtmlSmoke.includes('normalizeAuditLogEntry'));
check('single html smoke verifies newest-first v15 audit import', singleHtmlSmoke.includes('single html orders v15 audit newest first') && singleHtmlSmoke.includes("'audit_log', 'created_at', false"));
check('single html smoke verifies v15 audit diagnostics export', singleHtmlSmoke.includes('single html exports v15 audit in diagnostics') && singleHtmlSmoke.includes('payload.v15AuditLog'));
check('single html smoke verifies risky v15 audit highlights', singleHtmlSmoke.includes('single html highlights risky v15 audit rows') && singleHtmlSmoke.includes('buildV15AuditHighlights'));
check('single html smoke verifies imported v15 audit diagnostics preview', singleHtmlSmoke.includes('single html previews imported v15 audit diagnostics') && singleHtmlSmoke.includes('renderDiagnosticsV15Audit'));
check('single html smoke verifies diagnostics v15 audit counts', singleHtmlSmoke.includes('single html counts v15 audit log in diagnostics') && singleHtmlSmoke.includes("['V15 Audit', stats.diagnosticsSummary.counts.v15AuditLog || 0]"));
check('single html smoke verifies v15 practice runs import', singleHtmlSmoke.includes('single html imports v15 practice runs read-only') && singleHtmlSmoke.includes('normalizePracticeRun'));
check('single html smoke verifies diagnostics practice run counts', singleHtmlSmoke.includes('single html counts v15 practice runs in diagnostics') && singleHtmlSmoke.includes("['Practice', stats.diagnosticsSummary.counts.practiceRuns || 0]"));
check('single html smoke verifies handoff diagnostics import', singleHtmlSmoke.includes('rov_v16_handoff_report') && singleHtmlSmoke.includes('renderDiagnosticsDashboardSafety') && singleHtmlSmoke.includes('dashboardSafetySummary'));
check('single html smoke verifies empty dashboard safety preview', singleHtmlSmoke.includes('single html shows empty diagnostics dashboard safety') && singleHtmlSmoke.includes('No dashboard safety summary.'));
check('single html smoke verifies safe diagnostics dates', singleHtmlSmoke.includes('single html formats diagnostics dates safely') && singleHtmlSmoke.includes('formatDateTimeSafe'));
check('single html smoke verifies empty diagnostics action plan', singleHtmlSmoke.includes('single html shows empty diagnostics action plan') && singleHtmlSmoke.includes('No imported readiness blockers.'));
check('single html smoke verifies imported blocker summary', singleHtmlSmoke.includes("['Blockers', stats.diagnosticsSummary.readinessActionPlan?.length || 0]"));
check('single html smoke verifies imported blocker highlight', singleHtmlSmoke.includes('single html highlights imported blockers') && singleHtmlSmoke.includes("const isBlockers = label === 'Blockers'"));
check('single html smoke verifies imported readiness summary', singleHtmlSmoke.includes('single html summarizes imported readiness') && singleHtmlSmoke.includes('readinessPassed'));
check('single html smoke verifies imported readiness highlight', singleHtmlSmoke.includes('single html highlights imported readiness') && singleHtmlSmoke.includes('readinessOk'));
check('single html smoke verifies imported smoke highlight', singleHtmlSmoke.includes('single html highlights imported smoke') && singleHtmlSmoke.includes("const isSmoke = label === 'Smoke'"));
check('single html smoke verifies imported health highlight', singleHtmlSmoke.includes('single html highlights imported health') && singleHtmlSmoke.includes("const isHealth = label === 'Health'"));
check('single html smoke verifies imported audit highlight', singleHtmlSmoke.includes('single html highlights imported audit') && singleHtmlSmoke.includes("const isAudit = label === 'Audit'"));
check('app builds detailed action messages', app.includes('function actionMessage') && app.includes('stripSentenceEnd') && app.includes('->'));
check('app clears only safety metadata', app.includes('function clearSafetyMetadata') && app.includes('data-action="clear-safety-metadata"') && app.includes('confirmClearSafetyMetadata'));
check('safety report includes context metadata', app.includes('context: {') && app.includes('currentPage: appState.currentPage') && app.includes('locale: getLocale()') && app.includes('APP_STATE_STORAGE_KEY') && app.includes('supabaseTouched: false'));
check('release notes mention guarded sync', releaseNotes.includes('SYNC V16') && releaseNotes.includes('Deletes are disabled'));
check('release notes mention validation', releaseNotes.includes('Static smoke passed: 795 checks') && releaseNotes.includes('Single HTML smoke passed: 58 checks') && releaseNotes.includes('temporary local server'));
check('css styles dashboard blockers button', css.includes('[data-dashboard-blockers-link]') && css.includes('appearance:none') && css.includes(':focus-visible') && css.includes('transform:translateY(-1px)'));
check('css styles dashboard readiness button', css.includes('[data-dashboard-readiness-link]') && css.includes('box-shadow:0 6px 14px') && css.includes('outline-offset:2px'));
check('css styles dashboard smoke button', css.includes('[data-dashboard-smoke-link]') && css.includes('box-shadow:0 6px 14px') && css.includes('outline-offset:2px'));
check('readme mentions direct-open single html', readme.includes('ROV_Task_Manager_v16.html') && readme.includes('opened directly in a browser') && readme.includes('../OPEN_V16.html'));
check('readme mentions single html validation', readme.includes('npm run build:single') && readme.includes('npm run smoke:single'));
check('readme mentions undo and action log', readme.includes('persistent undo bar') && readme.includes('Export Log') && readme.includes('Clear Log') && readme.includes('Export Safety') && readme.includes('Clear Safety Meta'));

[
  "from './data/state.js'",
  "from './data/supabase.js'",
  "from './data/sync.js'",
  "from './features/settings.js'",
  "from './features/intel.js'",
  "from './features/legacy.js'",
  "from './features/members.js'",
  "from './features/tasks.js'",
  "from './features/prep.js'",
  "from './features/competition.js'",
  "from './utils/i18n.js'",
].forEach(fragment => check(`app import ${fragment}`, app.includes(fragment)));

[
  'data-page="tasks"',
  'data-action="run-v16-smoke"',
  'data-action="load-supabase-readonly"',
  'v15 production Supabase DB',
  'data-v15-import-dedupe-summary',
  'data-v15-db-coverage',
  'data-v15-db-table-errors',
  'data-v15-db-readiness-warning',
  'V15 Supabase coverage',
  'V15 Supabase table errors',
  'Read-only partial',
  'V15_DB_TABLE_LABELS',
  'data-v15-audit-preview',
  'V15 Audit preview',
  'V15 Audit risk preview',
  'data-v15-audit-risk-preview',
  'No v15 audit rows loaded.',
  "'Mode'",
  'stats.dbStatus.readOnly',
  'data-action="probe-supabase-schema"',
  'data-action="build-sync-preview"',
  'data-action="execute-guarded-write-sync"',
  'data-action="export-v16-backup"',
  'data-action="choose-v16-backup"',
  'data-action="reset-v16-local-data"',
  'data-action="export-diagnostics"',
  'data-action="export-handoff-report"',
  'data-action="choose-diagnostics"',
  'renderDiagnosticsSmoke',
  'renderDiagnosticsDashboardSafety',
  'renderDiagnosticsActionPlan',
  'renderDiagnosticsAudit',
  'renderDiagnosticsV15Audit',
  'data-diagnostics-v15-audit-risk-preview',
  'data-diagnostics-v15-db-table-errors',
  'buildReleaseReadiness',
  'renderReadinessActionButton',
  'data-readiness-action-plan',
  'Action plan',
  'data-readiness-ready-note',
  'Ready for handoff',
  'data-readiness-validation-summary',
  'Package',
  'Smoke',
  'Blockers',
  'Data health',
  'settingsScroll',
  'readinessAction',
  'data-readiness-action',
  'focus({ preventScroll: true })',
  'No local data health issues found',
  'buildHandoffReport',
  'validationSummary',
  'readinessPassed',
  'dashboardSafetySummary',
  'sourceLabel',
  'packageFile',
  'latestSmokeOk',
  'readinessTotal',
  'attachments',
  'v15AuditLog',
  'quotes',
  'practiceRuns',
  'unresolvedBlockers',
  'readinessActionPlan',
  'nextStep',
  'settingsSection',
  'buildOperationalSummary',
  'operationalSummary',
  'evidenceSummary',
  'missingEvidenceTasks',
  'taskEvidence',
  'needsEvidence',
  'Task evidence',
  'evidenceOk',
  "issue.title === 'Task missing evidence'",
  'check.action',
  'taskEvidencePreset',
  'data-task-evidence-preset',
  'getDataHealthIssues',
  'healthIssues',
  'data-settings-current-health',
  'data-settings-health-task-action',
  'settings-health-section',
  'exportHandoffReport',
  'settings-release-readiness',
  '#settings-rollback-section',
].forEach(fragment => check(`settings/action ${fragment}`, (app + settings).includes(fragment)));

check('handoff report mirrors dashboard safety summary', settings.includes('dashboardSafetySummary') && settings.includes("label: 'Package'") && settings.includes("action: 'run-v16-smoke'") && settings.includes("settingsSection: 'settings-release-readiness'") && settings.includes("label: 'V15 DB'") && settings.includes('v15DbCoverageValue'));
check('diagnostics viewer renders dashboard safety summary', settings.includes('renderDiagnosticsDashboardSafety') && settings.includes('Dashboard Safety') && settings.includes("['Type', stats.diagnosticsSummary.sourceLabel"));
check('diagnostics viewer summarizes imported evidence count', settings.includes("['Evidence', stats.diagnosticsSummary.counts.attachments || 0]") && settings.includes('attachments: stats.attachments') && settings.includes('attachments: data.attachments?.length || 0'));
check('diagnostics viewer summarizes imported quotes', settings.includes("['Quotes', stats.diagnosticsSummary.counts.quotes || 0]") && settings.includes('quotes: stats.quotes') && settings.includes('quotes: data.quotes?.length || 0'));
check('diagnostics viewer summarizes imported v15 audit log', settings.includes("['V15 Audit', stats.diagnosticsSummary.counts.v15AuditLog || 0]") && settings.includes('v15AuditLog: stats.v15AuditLog') && settings.includes('v15AuditLog: data.v15AuditLog?.length || 0'));
check('diagnostics viewer summarizes imported v15 db coverage', settings.includes("stats.diagnosticsSummary.v15DbReadiness?.label") && settings.includes("const isV15Db = label === 'V15 DB'") && settings.includes('v15DbOk'));
check('diagnostics viewer summarizes imported practice runs', settings.includes("['Practice', stats.diagnosticsSummary.counts.practiceRuns || 0]") && settings.includes('practiceRuns: stats.practiceRuns') && settings.includes('practiceRuns: data.practiceRuns?.length || 0'));
check('diagnostics viewer renders empty dashboard safety summary', settings.includes('No dashboard safety summary.') && settings.includes('did not include dashboard safety cards'));
check('diagnostics viewer formats dates safely', settings.includes('function formatDateTimeSafe') && settings.includes('Number.isNaN(date.getTime())') && settings.includes('formatDateTimeSafe(stats.diagnosticsSummary.exportedAt)') && settings.includes('formatDateTimeSafe(stats.diagnosticsSummary.importedAt)') && settings.includes('formatDateTimeSafe(latest.ts)') && settings.includes('formatDateTimeSafe(entry.ts)'));
check('diagnostics viewer renders action plan', settings.includes('renderDiagnosticsActionPlan') && settings.includes('Diagnostics Action Plan') && settings.includes('stats.diagnosticsSummary.readinessActionPlan'));
check('diagnostics viewer renders empty action plan', settings.includes('No imported readiness blockers.') && settings.includes('no action items'));
check('diagnostics viewer summarizes imported blockers', settings.includes("['Blockers', stats.diagnosticsSummary.readinessActionPlan?.length || 0]"));
check('diagnostics viewer highlights imported blockers', settings.includes("const isBlockers = label === 'Blockers'") && settings.includes('statusBorder') && settings.includes('valueColor'));
check('diagnostics viewer summarizes imported readiness', settings.includes("['Readiness', stats.diagnosticsSummary.validationSummary ?") && settings.includes('readinessPassed') && settings.includes('readinessTotal'));
check('diagnostics viewer highlights imported readiness', settings.includes("const isReadiness = label === 'Readiness'") && settings.includes('readinessOk') && settings.includes('readinessPassed === readinessTotal'));
check('diagnostics viewer highlights imported smoke', settings.includes("const isSmoke = label === 'Smoke'") && settings.includes("value === 'OK' ? 'var(--green)' : 'var(--red)'"));
check('diagnostics viewer highlights imported health', settings.includes("const isHealth = label === 'Health'") && settings.includes('healthCount') && settings.includes("healthCount ? 'var(--orange)' : 'var(--green)'"));
check('diagnostics viewer highlights imported audit', settings.includes("const isAudit = label === 'Audit'") && settings.includes('auditCount') && settings.includes("auditCount ? 'var(--green)' : 'var(--navy)'"));

[
  'data-page="${page.id}"',
  "id: 'members'",
  "id: 'intel'",
  "id: 'presentation'",
  "id: 'gantt'",
  "id: 'float'",
  'data-locale-toggle',
  'data-next-locale',
  '繁中 / EN',
].forEach(fragment => check(`navigation ${fragment}`, navigation.includes(fragment)));

[
  'renderPresentationPage',
  'data-presentation-form',
  'data-presentation-trend',
  'createPresentationRunFromForm',
  'addPresentationRun',
  'renderGanttPage',
  'data-gantt-board',
  'gantt-table',
  'renderFloatPage',
  'data-float-packet-tool',
  'data-action="analyze-float-packets"',
  'saveFloatPacketAnalysis',
  'analyzeFloatPackets',
  'clearFloatPackets',
].forEach(fragment => check(`legacy migration ${fragment}`, legacy.includes(fragment)));

[
  'rov_v16_diagnostics',
  'rov_v16_handoff_report',
  'downloadDiagnosticsPayload',
  'parseDiagnosticsPayload',
  'Not a v16 diagnostics or handoff payload',
  'dashboardSafetySummary',
  'readinessActionPlan',
  'writeAuditLog',
  'buildV15DbCoverage',
  'summarizeV15DbCoverage',
  'buildV15AuditHighlights',
  'const v15DbCoverage = buildV15DbCoverage(dbStatus)',
  'v15DbReadiness: summarizeV15DbCoverage(v15DbCoverage)',
  'v15AuditLog: v15AuditLog.slice(0, 10)',
  'v15AuditHighlights: buildV15AuditHighlights(v15AuditLog, 8)',
  'schemaStatus',
  'healthRows',
  'postWritePreview',
  'v15DbCoverage',
  'v15DbReadiness',
  'v15AuditLog: v15AuditLog.slice(0, 8)',
  'v15AuditHighlights: v15AuditHighlights.slice(0, 8)',
  'quotes: data.quotes?.length || 0',
  'attachments: data.attachments?.length || 0',
  'v15AuditLog: data.v15AuditLog?.length || 0',
  'practiceRuns: data.practiceRuns?.length || 0',
].forEach(fragment => check(`diagnostics ${fragment}`, diagnostics.includes(fragment)));

[
  'v16-workflow-smoke',
  'saveSmokeTestResult',
  'task form',
  'timer control',
  'task edit control',
  'task search',
  'task owner filter',
  'task evidence filter',
  'task sort',
  'member form',
  'member search',
  'member edit control',
  'member sort',
  'intel notes',
  'intel form',
  'strategy form',
  'intel search',
  'strategy status filter',
  'intel sort',
  'rollback panel',
].forEach(fragment => check(`workflow smoke ${fragment}`, app.includes(fragment)));

[
  'Passed',
  'Failed',
  'Total',
  'latest.type',
  'Task has no owner',
  'Task owner not in members',
  'High priority task has no due date',
  'Task missing evidence',
  'hasTaskEvidence',
].forEach(fragment => check(`smoke report ${fragment}`, health.includes(fragment)));

[
  'renderTasksPage',
  'renderTaskForm',
  'taskModalOpen',
  'data-task-open-modal',
  'data-task-modal-bg',
  'data-task-modal',
  'data-task-close-modal',
  'data-task-form',
  'normalizeEvidence',
  'getEvidenceFromForm',
  'renderTaskEvidence',
  'buildTasksCsv',
  'exportTasksCsv',
  'getVisibleTasks',
  'exportTasksCsv(getVisibleTasks',
  'getTaskIssueLabels',
  'data-task-evidence',
  'data-task-evidence-label',
  'data-task-evidence-url',
  'data-task-evidence-count',
  'data-task-evidence-summary',
  'data-task-evidence-shortcut',
  'data-task-evidence-active',
  'stats.withEvidence',
  'stats.withoutEvidence',
  'stats.needsEvidence',
  'existingEvidence',
  'data-task-owner-list',
  'task-owner-list',
  'ownerSuggestions',
  'data-task-status',
  'data-task-next-status',
  'data-task-edit',
  'data-task-cancel-edit',
  'data-task-search',
  'data-task-search-submit',
  'data-task-filter-bar',
  'data-task-toolbar-actions',
  'task-toolbar-clear',
  'data-task-owner-filter',
  'data-task-status-filter',
  'data-task-priority-filter',
  'labelFor(status)',
  'labelFor(priority)',
  'data-task-category-filter',
  'data-task-evidence-filter',
  'data-task-health-filter',
  'data-task-sort',
  'data-task-header-sort',
  'task-sort-button',
  "sort === 'name-desc'",
  "sort === 'priority-desc'",
  "sort === 'status-desc'",
  'filterTasks',
  "filters.evidence === 'with'",
  "filters.evidence === 'without'",
  'evidenceText',
  'noMatchingTasks',
  'visibleTasks.length}/${tasks.length}',
  'taskMatchesHealthFilter',
  'getTaskHealthBadges',
  'getTaskHealthSummary',
  'getActiveFilterChips',
  'data-task-health-badges',
  'data-task-health-summary',
  'data-task-health-shortcut',
  'data-task-health-active',
  'filters.health === health',
  'data-task-clear-filters',
  'data-action="export-tasks-csv"',
  'data-task-active-filters',
  'data-task-remove-filter',
  'taskFilters',
  'clearTaskFilters',
  'clearTaskFilter',
  'updateTaskFiltersFromControl',
  'applyTaskFilterPreset',
  'applyDashboardStatTarget',
  "filters.status === 'active'",
  "health === 'blocked'",
  "health === 'overdue'",
  'applyTaskHealthShortcut',
  'applyTaskEvidenceShortcut',
  'const nextHealth = taskFilters.health === shortcut ?',
  'const nextEvidence = taskFilters.evidence === shortcut ?',
  'taskHealthPresetForIssue',
  'clearPrepFocus',
  'clearIntelFocus',
  'clearPrepFocusIfComplete',
  'clearIntelFocusIfReady',
  'clearPrepFocus();',
  'clearIntelFocus();',
  'clearEditingOutsidePage',
  "if (page !== 'competition') editingRunId = null",
  'applyRunEditPreset',
  'filters: taskFilters',
  'sortTasks',
  "a.task.status === 'Done' ? 1 : 0",
  'data-task-delete',
  'updateTask',
  'getNextTaskStatus',
].forEach(fragment => check(`tasks ${fragment}`, (tasks + app).includes(fragment)));

[
  'normalizeTaskEvidence',
  'task.evidence',
  'task.attachments',
  'attachment_url',
  'evidence: normalizeTaskEvidence(task)',
].forEach(fragment => check(`migration evidence ${fragment}`, migration.includes(fragment)));

[
  'renderMembersPage',
  'data-member-form',
  'data-member-search',
  'data-member-role-filter',
  'data-member-sort',
  'data-member-clear-filters',
  'data-member-active-filters',
  'data-member-remove-filter',
  'normalizeMemberFilters',
  'getActiveMemberFilterChips',
  'sortMembers',
  'visible.length}/${members.length}',
  'visible.filter(member => member.role === role)',
  'data-member-edit',
  'data-member-cancel-edit',
  'data-member-delete',
  'noMatchingMembers',
  'updateMember',
  'renderHandoffCards(visible, tasks',
  'handoffCards',
].forEach(fragment => check(`members ${fragment}`, members.includes(fragment)));

[
  'renderIntelPage',
  'renderKnowledgeSectionHeading',
  'isIntelFocusMatch',
  'if (!focus) return false',
  'data-intel-focus-summary',
  'data-intel-focus-row',
  'data-intel-clear-focus',
  'data-notes-input',
  'data-notes-save',
  'data-knowledge-form="intel"',
  'data-knowledge-form="strategy"',
  'data-knowledge-search',
  'data-knowledge-status-filter',
  'labelFor(item.status)',
  'data-knowledge-sort',
  'data-knowledge-clear-filters',
  'data-knowledge-active-filters',
  'data-knowledge-remove-filter',
  'data-knowledge-filter-list',
  'data-knowledge-visible-count',
  'data-knowledge-next-status',
  'noMatchingItems',
  'normalizeKnowledgeFilters',
  'getActiveKnowledgeFilterChips',
  'filterKnowledgeItems',
  'sortKnowledgeItems',
  'data-knowledge-edit',
  'data-knowledge-delete',
  'addKnowledgeItem',
  'updateKnowledgeItem',
  'updateKnowledgeStatus',
  'getNextKnowledgeStatus',
  'deleteKnowledgeItem',
  'updateNotes',
].forEach(fragment => check(`intel ${fragment}`, intel.includes(fragment)));

[
  'renderPrepCenter',
  'renderPrepSectionHeading',
  'normalizePrepFilters',
  'filterChecklistItems',
  'filterGearItems',
  'getActivePrepFilterChips',
  'data-prep-search',
  'data-prep-status-filter',
  'data-prep-clear-filters',
  'data-prep-active-filters',
  'data-prep-remove-filter',
  'data-prep-visible-count',
  'noMatchingItems',
  'isPrepFocusMatch',
  'data-prep-focus-summary',
  'data-prep-focus-row',
  'data-prep-clear-focus',
  'data-checklist',
  'data-checklist-toggle',
  'data-checklist-add',
  'data-checklist-edit',
  'data-checklist-update',
  'data-checklist-cancel-edit',
  'data-checklist-delete',
  'data-gear-packed',
  'data-gear-toggle',
  'data-gear-add',
  'data-gear-edit',
  'data-gear-update',
  'data-gear-cancel-edit',
  'data-gear-delete',
  'addChecklistItem',
  'updateChecklistItem',
  'deleteChecklistItem',
  'addGearItem',
  'updateGearItem',
  'toggleGearItem',
  'deleteGearItem',
  'prediveChecklist',
].forEach(fragment => check(`prep ${fragment}`, prep.includes(fragment)));

[
  'renderCompetitionCenter',
  'data-timer-action',
  'data-action="save-run"',
  'data-action="update-run"',
  'data-run-search',
  'data-run-sort',
  'data-run-clear-filters',
  'data-run-active-filters',
  'data-run-remove-filter',
  'data-mission-scoreboard',
  'data-run-stats',
  'data-action="export-mission-runs-csv"',
  'getMissionRunStats',
  'buildMissionRunsCsv',
  'exportMissionRunsCsv',
  'data-score-item',
  'data-score-item-value',
  'data-score-item-status',
  'labelFor(item.status)',
  'data-run-penalty',
  'data-run-gross-score',
  'getScoreItemsFromDom',
  'calculateMissionScore',
  'grossScore',
  'successRate',
  'data-competition-flow',
  'data-flow-step',
  'data-mission-events',
  'data-mission-event',
  'data-action="add-custom-mission-event"',
  'data-action="clear-mission-events"',
  'addMissionEvent',
  'clearMissionEvents',
  'setCompetitionFlowStep',
  'buildMissionEventSummary',
  'missionEventSummary',
  'normalizeRunFilters',
  'filterMissionRuns',
  'sortMissionRuns',
  'getActiveRunFilterChips',
  'data-run-edit',
  'data-run-duplicate',
  'data-run-delete',
  'noMatchingRuns',
  'updateMissionRun',
  'getRunDraftFromRun',
  'deleteMissionRun',
].forEach(fragment => check(`competition ${fragment}`, competition.includes(fragment)));

[
  'WRITE_CONFIRM_TEXT',
  'SYNC V16',
  'upsert',
  'Delete sync is disabled',
  'WRITE_SCHEMA',
  'WRITE_AUDIT_LOG_KEY',
  'buildLocalBackupPayload',
  'executeAutoSupabaseWriteSync',
  'upsertRowsWithSchemaFallback',
  'getMissingColumnFromError',
].forEach(fragment => check(`sync safety ${fragment}`, sync.includes(fragment)));

[
  'loadSupabaseReadOnly',
  'probeSupabaseSchema',
  '.select',
  '.limit(1)',
  'ensureSupabaseClient',
  'data-supabase-sdk',
  'quotes',
  'normalizeQuote',
  'dedupedQuotes.rows',
  'task_attachments',
  'audit_log',
  'practice_runs',
  'dedupeRows',
  'dedupeSummary',
  'normalizeTaskAttachment',
  'attachEvidenceToTasks',
  'v15-attachment',
  'normalizeAuditLogEntry',
  "selectTable(client, 'audit_log', 'created_at', false)",
  "v15AuditLog: get('audit_log').map(normalizeAuditLogEntry)",
  'normalizePracticeRun',
  "practiceRuns: get('practice_runs').map(normalizePracticeRun)",
].forEach(fragment => check(`supabase read/probe ${fragment}`, supabase.includes(fragment)));

[
  'dashboard',
  'actionSummary',
  'taskStatusDistribution',
  'taskBurndown',
  'idealRemaining',
  'currentRemaining',
  'total',
  'prepReadiness',
  'intelReady',
  'bestScore',
  'intelSummary',
  'searchIntel',
  'searchRuns',
  'searchPrep',
  'saveNotes',
  'strategy',
  'intelFocus',
  'updateTask',
  'evidenceLabel',
  'evidenceUrl',
  'evidenceNote',
  'allEvidence',
  'withEvidence',
  'withoutEvidence',
  'needsEvidence',
  'exportTasksCsv',
  'existingEvidence',
  'nextStatus',
  'searchTasks',
  'allHealth',
  'allPrepStatuses',
  'prepIncomplete',
  'toggleComplete',
  'togglePacked',
  'clearFilters',
  'activeFilters',
  'noActiveFilters',
  'noMatchingItems',
  'noMatchingRuns',
  'noMatchingMembers',
  'noMatchingTasks',
  'removeFilter',
  'ownerNotInMembers',
  'allOwners',
  'sortDueAsc',
  'sortOldest',
  'membersSummary',
  'sortOpenTasks',
  'sortScoreHigh',
  'sortDurationShort',
  'updateMember',
  'cancelEdit',
  'handoffCards',
  'memberWorkload',
  'unassignedTasks',
  'weekFocus',
  'prepFocus',
  'clearFocus',
  'prepReady',
  'settingsCenter',
  'supabaseReadOnly',
  'guardedWriteSync',
  'rollbackFromBackup',
  'exportV16Backup',
  'releaseReadiness',
  'exportHandoffReport',
  'updateRun',
  'duplicateRun',
  'runDraftReady',
  'newChecklistItem',
  'updateChecklistItem',
  'gearName',
  'updateGear',
  'resetLocalData',
  'confirmDelete',
  'confirmRestoreV16Backup',
  'dataSafety',
  'dataSafetyHint',
  'lastSaved',
  'notSavedYet',
  'recentActions',
  'noRecentActions',
  'undoSnapshot',
  'available',
  'notAvailable',
  'exportActionLog',
  'clearActionLog',
  'actionLogExported',
  'actionLogCleared',
  'exportSafetyReport',
  'safetyReportExported',
  'clearSafetyMetadata',
  'confirmClearSafetyMetadata',
  'safetyMetadataCleared',
  'saved',
  'exported',
  'backupExported',
  'restored',
  'imported',
  'deleted',
  'statusUpdated',
  'runDuplicated',
  'smokeComplete',
  'undo',
  'undone',
  'undoChange',
  'clearUndo',
  'undoCleared',
  'zh:',
  'en:',
].forEach(fragment => check(`i18n ${fragment}`, i18n.includes(fragment)));

[
  'data-dashboard-action-summary',
  'data-dashboard-action-task-action',
  'data-dashboard-stat-grid',
  'data-dashboard-stat',
  'dashboard-stat-card',
  'data-dashboard-task-charts',
  'data-task-status-chart',
  'data-task-burndown-chart',
  'buildTaskStatusChartData',
  'buildTaskBurndownData',
  'renderTaskCharts',
  'task-pie',
  'task-burndown-svg',
  "status: 'active'",
  "health: 'blocked'",
  "health: 'overdue'",
  'data-action="run-v16-smoke"',
  'hasDashboardTaskEvidence',
  'dashboardValidationSummary',
  'scheduleAutoSupabaseSync',
  'scheduleInitialSupabaseLoad',
  'loadSupabaseIntoApp',
  'runAutoSupabaseSync',
  'lastDbStatus = await loadSupabaseReadOnly()',
  'Auto Supabase sync failed',
  'Synced to Supabase',
  'latestSmokeFailed',
  'data-action="export-action-log"',
  'data-action="export-safety-report"',
  'data-action="clear-action-log"',
  'data-action="clear-safety-metadata"',
  'data-dashboard-prep-gaps',
  'data-dashboard-prep-gap-action',
  'data-prep-focus-section',
  'data-dashboard-intel-gaps',
  'data-dashboard-intel-gap-action',
  'data-intel-focus-list',
  'data-dashboard-run-summary',
  'data-dashboard-latest-run-action',
  'data-run-edit-preset',
  'data-dashboard-week-focus',
  'data-dashboard-focus-task-action',
  'data-dashboard-member-workload',
  'data-dashboard-member-task-action',
  'data-dashboard-unassigned-tasks',
  "settingsScroll: 'settings-health-section'",
  'stat.dataset.settingsScroll',
  'data-task-owner-preset',
  'data-task-search-preset',
  'data-task-health-preset',
  'data-task-evidence-preset',
  'applyTaskEvidenceShortcut',
  'data-task-evidence-shortcut',
  'taskEvidencePresetForIssue',
  "issue?.title === 'Task missing evidence'",
  "preset.dataset.taskEvidencePreset || ''",
  'data-action="export-handoff-report"',
  'data-action="export-v16-backup"',
  'data-action="choose-v16-backup"',
  'actionItems',
  'focusTasks',
  'prepGaps',
  'prepFocus',
  'intelGaps',
  'intelFocus',
  'intelFilters',
  'clearIntelFilters',
  'clearIntelFilter',
  'updateIntelFiltersFromControl',
  'intelFilters[listName].search = query',
  "intelFilters[listName].search = ''",
  'filters: intelFilters',
  'memberFilters',
  'clearMemberFilters',
  'clearMemberFilter',
  'updateMemberFiltersFromControl',
  'filters: memberFilters',
  'runFilters',
  "runFilters.search = ''",
  'clearRunFilters',
  'clearRunFilter',
  'updateRunFiltersFromControl',
  'filters: runFilters',
  'prepFilters',
  'clearPrepFilters',
  'clearPrepFilter',
  'updatePrepFiltersFromControl',
  'prepFilters.search = query',
  "prepFilters.search = ''",
  'filters: prepFilters',
  'runSummary',
  'memberWorkload',
  'data.members.map(member',
  'unassignedTasks',
  'prepReadiness',
  'intelReadiness',
  'latestRun',
  'showToast',
  'renderToast',
  'data-app-toast',
  'undoState',
  'captureUndo',
  'restoreUndo',
  'renderUndoBar',
  'data-undo-bar',
  'UNDO_STORAGE_KEY',
  'rov_v16_last_undo',
  'UNDO_BAR_AUTO_CLEAR_MS',
  'scheduleUndoAutoClear',
  'getUndoAgeMs',
  'ACTION_LOG_STORAGE_KEY',
  'rov_v16_action_log',
  'ACTION_LOG_LIMIT',
  'loadActionLog',
  'saveActionLog',
  'recordAction',
  'clearActionLog',
  'clearSafetyMetadata',
  'exportActionLog',
  'exportSafetyReport',
  'APP_STATE_STORAGE_KEY',
  'LOCALE_STORAGE_KEY',
  'getLocale',
  'supabaseTouched',
  'rov_v16_safety_report_',
  'rov_v16_action_log_',
  'loadUndoState',
  'saveUndoState',
  'capturedAt',
  'data-action="clear-undo"',
  'undoCleared',
  'event.key.toLowerCase()',
  'ctrlKey',
  'metaKey',
  'undo-last-change',
  'persistAndRender(message',
].forEach(fragment => check(`dashboard ${fragment}`, app.includes(fragment)));

[
  'data-settings-data-safety',
  'dashboard-safety-card',
  'settings-data-safety',
  'data-settings-scroll="settings-data-safety"',
  'data-settings-safety-primary-actions',
  'data-settings-safety-report-actions',
  'data-settings-safety-maintenance-actions',
  'data-settings-save-state',
  'data-settings-safety-status',
  'data-settings-action-log',
].forEach(fragment => check(`settings data safety ${fragment}`, settings.includes(fragment)));

check('settings release readiness summary exists', settings.includes('id="settings-release-readiness"') && settings.includes('data-readiness-validation-summary'));
check('settings data safety keeps backup controls', settings.includes('data-action="export-v16-backup"') && settings.includes('data-action="choose-v16-backup"') && settings.includes('data-v16-backup-file'));
check('settings data safety keeps safety reports', settings.includes('data-action="export-safety-report"') && settings.includes('data-action="clear-safety-metadata"') && settings.includes('data-action="export-action-log"'));

const failed = checks.filter(row => !row.ok);
console.table(checks.map(row => ({
  ok: row.ok ? 'OK' : 'FAIL',
  check: row.label,
})));

if (failed.length) {
  console.error(`v16 smoke failed: ${failed.length} checks`);
  failed.forEach(row => console.error(`- ${row.label}: ${row.detail}`));
  process.exit(1);
}

console.log(`v16 smoke passed: ${checks.length} checks`);

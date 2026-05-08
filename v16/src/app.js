import { APP_STATE_STORAGE_KEY, loadAppState, saveAppState } from './data/state.js';
import { importV15BackupPayload } from './data/migration.js';
import { buildDiagnosticsPayload, downloadDiagnosticsPayload, parseDiagnosticsPayload } from './data/diagnostics.js';
import { applySupabaseReadOnlyData, buildSupabaseReadOnlyImportDelta, ensureSupabaseClient, loadSupabaseReadOnly, probeSupabaseSchema } from './data/supabase.js';
import {
  buildSupabaseSyncPreview,
  buildWriteAuditEntry,
  downloadLocalBackup,
  executeGuardedSupabaseWriteSync,
  executeAutoSupabaseWriteSync,
  getWriteAuditLog,
  restoreLocalBackupPayload,
  saveWriteAuditEntry,
  summarizeWriteResult,
} from './data/sync.js';
import { addMissionEvent, clearMissionEvents, createMissionRun, deleteMissionRun, exportMissionRunsCsv, getRunDraftFromRun, getRunPayloadFromDom, normalizeRunFilters, renderCompetitionCenter, setCompetitionFlowStep, updateMissionRun } from './features/competition.js';
import {
  getDataHealthIssues,
  getSmokeTestLog,
  renderSmokeTestPanel,
  saveSmokeTestResult,
} from './features/health.js';
import {
  addKnowledgeItem,
  createKnowledgeItemFromForm,
  deleteKnowledgeItem,
  getNextKnowledgeStatus,
  normalizeKnowledgeFilters,
  renderIntelPage,
  updateKnowledgeStatus,
  updateKnowledgeItem,
  updateNotes,
} from './features/intel.js';
import { renderNavigation, showPage } from './features/navigation.js';
import { addMember, createMemberFromForm, deleteMember, normalizeMemberFilters, renderMembersPage, updateMember } from './features/members.js';
import {
  addChecklistItem,
  addGearItem,
  deleteChecklistItem,
  deleteGearItem,
  getGearPayloadFromDom,
  normalizePrepFilters,
  renderPrepCenter,
  toggleChecklistItem,
  toggleGearItem,
  updateChecklistItem,
  updateGearItem,
} from './features/prep.js';
import {
  addMasterDataValue,
  deleteMasterDataValue,
  exportHandoffReport,
  exportSettingsPack,
  importSettingsPackPayload,
  loadMasterData,
  renderSettingsHub,
  saveMasterData,
  scrollSettingsSection,
} from './features/settings.js';
import { addTask, createTaskFromForm, deleteTask, exportTasksCsv, getNextTaskStatus, getVisibleTasks, renderTasksPage, updateTask, updateTaskStatus } from './features/tasks.js';
import {
  addPresentationRun,
  clearFloatPackets,
  createPresentationRunFromForm,
  renderFloatPage,
  renderGanttPage,
  renderPresentationPage,
  saveFloatPacketAnalysis,
} from './features/legacy.js';
import { escapeHtml } from './utils/index.js';
import { getLocale, labelFor, LOCALE_STORAGE_KEY, setLocale, t } from './utils/i18n.js';

const UNDO_STORAGE_KEY = 'rov_v16_last_undo';
const ACTION_LOG_STORAGE_KEY = 'rov_v16_action_log';
const PENDING_LOCAL_SYNC_KEY = 'rov_v16_pending_local_sync';
const ACTION_LOG_LIMIT = 8;
const UNDO_BAR_AUTO_CLEAR_MS = 5000;
const appState = loadAppState();
loadMasterData(appState);
let lastMigrationSummary = null;
let lastDbStatus = null;
let lastSyncPreview = null;
let lastWriteResult = null;
let lastPostWritePreview = null;
let lastSchemaStatus = null;
let lastRollbackSummary = null;
let lastDiagnosticsSummary = null;
let autoSyncTimer = null;
let autoSyncInFlight = false;
let autoSyncQueued = false;
let initialSupabaseLoadStarted = false;
let editingTaskId = null;
let editingMemberId = null;
let editingRunId = null;
let runDraft = null;
let editingGearId = null;
let editingChecklist = null;
let editingIntelId = null;
let editingStrategyId = null;
let prepFocus = null;
let intelFocus = null;
let toastState = null;
let toastTimer = null;
let undoState = loadUndoState();
let undoClearTimer = null;
let actionLog = loadActionLog();
let taskModalOpen = false;
const taskFilters = {
  search: '',
  owner: '',
  status: '',
  priority: '',
  category: '',
  health: '',
  evidence: '',
  sort: 'due-asc',
};
const intelFilters = {
  intel: {
    search: '',
    status: '',
    sort: 'newest',
  },
  strategy: {
    search: '',
    status: '',
    sort: 'newest',
  },
};
const memberFilters = {
  search: '',
  role: '',
  group: '',
  sort: 'name',
};
const runFilters = {
  search: '',
  sort: 'newest',
};
const prepFilters = {
  search: '',
  status: '',
};

function clearEditingOutsidePage(page) {
  if (page !== 'tasks') taskModalOpen = false;
  if (page !== 'tasks') editingTaskId = null;
  if (page !== 'members') editingMemberId = null;
  if (page !== 'competition') editingRunId = null;
  if (page !== 'prep') {
    editingGearId = null;
    editingChecklist = null;
  }
  if (page !== 'intel') {
    editingIntelId = null;
    editingStrategyId = null;
  }
}

function clearTaskFilters() {
  Object.assign(taskFilters, {
    search: '',
    owner: '',
    status: '',
    priority: '',
    category: '',
    health: '',
    evidence: '',
    sort: taskFilters.sort || 'due-asc',
  });
}

function clearTaskFilter(key) {
  if (!Object.prototype.hasOwnProperty.call(taskFilters, key) || key === 'sort') return false;
  taskFilters[key] = '';
  return true;
}

function clearMemberFilters() {
  Object.assign(memberFilters, {
    search: '',
    role: '',
    group: '',
    sort: memberFilters.sort || 'name',
  });
}

function clearMemberFilter(key) {
  if (!Object.prototype.hasOwnProperty.call(memberFilters, key) || key === 'sort') return false;
  memberFilters[key] = '';
  Object.assign(memberFilters, normalizeMemberFilters(memberFilters));
  return true;
}

function clearIntelFilters(listName) {
  if (!intelFilters[listName]) return false;
  Object.assign(intelFilters[listName], {
    search: '',
    status: '',
    sort: intelFilters[listName].sort || 'newest',
  });
  return true;
}

function clearIntelFilter(listName, key) {
  if (!intelFilters[listName] || !Object.prototype.hasOwnProperty.call(intelFilters[listName], key) || key === 'sort') return false;
  intelFilters[listName][key] = '';
  intelFilters[listName] = normalizeKnowledgeFilters(intelFilters[listName]);
  return true;
}

function clearRunFilters() {
  Object.assign(runFilters, {
    search: '',
    sort: runFilters.sort || 'newest',
  });
}

function clearRunFilter(key) {
  if (!Object.prototype.hasOwnProperty.call(runFilters, key) || key === 'sort') return false;
  runFilters[key] = '';
  Object.assign(runFilters, normalizeRunFilters(runFilters));
  return true;
}

function clearPrepFilters() {
  Object.assign(prepFilters, {
    search: '',
    status: '',
  });
}

function clearPrepFilter(key) {
  if (!Object.prototype.hasOwnProperty.call(prepFilters, key)) return false;
  prepFilters[key] = '';
  Object.assign(prepFilters, normalizePrepFilters(prepFilters));
  return true;
}

const appRoot = document.getElementById('app');
const timer = {
  running: false,
  startedAt: 0,
  baseSeconds: 0,
  interval: null,
};

function getSmokePanel() {
  return document.getElementById('v16-smoke-report');
}

function showToast(message, type = 'success') {
  if (!message) return;
  toastState = {
    message,
    type,
    undo: Boolean(undoState),
    ts: Date.now(),
  };
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastState = null;
    renderAppShell();
  }, 3200);
}

function loadActionLog(storage = localStorage) {
  try {
    const parsed = JSON.parse(storage.getItem(ACTION_LOG_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter(row => row?.message && row?.ts).slice(0, ACTION_LOG_LIMIT) : [];
  } catch {
    return [];
  }
}

function saveActionLog(storage = localStorage) {
  storage.setItem(ACTION_LOG_STORAGE_KEY, JSON.stringify(actionLog.slice(0, ACTION_LOG_LIMIT)));
}

function clearActionLog() {
  actionLog = [];
  saveActionLog();
}

function clearSafetyMetadata() {
  clearUndo();
  clearActionLog();
}

function exportActionLog(documentRef = document) {
  const payload = {
    type: 'rov_v16_action_log',
    exportedAt: new Date().toISOString(),
    season: appState.currentSeason,
    actions: actionLog,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = documentRef.createElement('a');
  anchor.href = url;
  anchor.download = `rov_v16_action_log_${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function exportSafetyReport(documentRef = document) {
  const data = appState.data;
  const payload = {
    type: 'rov_v16_safety_report',
    exportedAt: new Date().toISOString(),
    season: appState.currentSeason,
    savedAt: appState.savedAt || '',
    context: {
      app: 'ROV Task Manager v16',
      currentPage: appState.currentPage,
      currentMode: appState.currentMode,
      locale: getLocale(),
      storageKeys: {
        appState: APP_STATE_STORAGE_KEY,
        locale: LOCALE_STORAGE_KEY,
        undo: UNDO_STORAGE_KEY,
        actionLog: ACTION_LOG_STORAGE_KEY,
      },
      source: 'browser-localStorage',
      supabaseTouched: false,
    },
    undo: undoState ? {
      available: true,
      message: undoState.message || t('undoChange'),
      capturedAt: undoState.capturedAt || '',
      savedAt: undoState.savedAt || '',
    } : {
      available: false,
    },
    actionLog,
    counts: {
      tasks: data.tasks.length,
      members: data.members.length,
      checklist: data.checklist.length,
      prediveChecklist: data.prediveChecklist.length,
      gearItems: data.gearItems.length,
      intel: data.intel.length,
      strategy: data.strategy.length,
      missionRuns: data.missionRuns.length,
    },
    healthIssues: getDataHealthIssues(appState),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = documentRef.createElement('a');
  anchor.href = url;
  anchor.download = `rov_v16_safety_report_${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function recordAction(message, type = 'success') {
  if (!message || type === 'error') return;
  actionLog = [
    { message, ts: new Date().toISOString() },
    ...actionLog,
  ].slice(0, ACTION_LOG_LIMIT);
  saveActionLog();
}

function renderToast() {
  if (!toastState?.message) return '';
  const typeClass = toastState.type === 'error' ? 'error' : 'success';
  return `<div class="toast ${typeClass}" role="status" aria-live="polite" data-app-toast>
    <span>${escapeHtml(toastState.message)}</span>
    ${toastState.undo ? `<button class="toast-undo" type="button" data-action="undo-last-change">${escapeHtml(t('undo'))}</button>` : ''}
  </div>`;
}

function renderUndoBar() {
  if (!undoState) return '';
  const capturedAtLabel = undoState.capturedAt ? new Date(undoState.capturedAt).toLocaleString() : '';
  return `<div class="undo-bar" data-undo-bar>
    <span>${escapeHtml(undoState.message || t('undoChange'))}${capturedAtLabel ? ` | ${escapeHtml(capturedAtLabel)}` : ''}</span>
    <button class="btn btn-sm btn-primary" type="button" data-action="undo-last-change">${escapeHtml(t('undo'))}</button>
    <button class="btn btn-sm" type="button" data-action="clear-undo">${escapeHtml(t('clearUndo'))}</button>
  </div>`;
}

function getUndoAgeMs(state = undoState) {
  const capturedAt = Date.parse(state?.capturedAt || '');
  return Number.isFinite(capturedAt) ? Date.now() - capturedAt : 0;
}

function scheduleUndoAutoClear() {
  if (undoClearTimer) clearTimeout(undoClearTimer);
  undoClearTimer = null;
  if (!undoState) return;
  const remainingMs = Math.max(0, UNDO_BAR_AUTO_CLEAR_MS - getUndoAgeMs());
  undoClearTimer = setTimeout(() => {
    clearUndo();
    renderAppShell();
  }, remainingMs);
}

function cloneData(value) {
  return JSON.parse(JSON.stringify(value || {}));
}

function loadUndoState(storage = localStorage) {
  try {
    const raw = storage.getItem(UNDO_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.data || typeof parsed.data !== 'object') return null;
    if (getUndoAgeMs(parsed) > UNDO_BAR_AUTO_CLEAR_MS) {
      storage.removeItem(UNDO_STORAGE_KEY);
      return null;
    }
    return {
      message: parsed.message || t('undoChange'),
      data: parsed.data,
      savedAt: parsed.savedAt || '',
      capturedAt: parsed.capturedAt || '',
    };
  } catch {
    return null;
  }
}

function saveUndoState(storage = localStorage) {
  if (!undoState) {
    storage.removeItem(UNDO_STORAGE_KEY);
    return;
  }
  storage.setItem(UNDO_STORAGE_KEY, JSON.stringify(undoState));
}

function captureUndo(message = t('undoChange')) {
  undoState = {
    message,
    data: cloneData(appState.data),
    savedAt: appState.savedAt || '',
    capturedAt: new Date().toISOString(),
  };
  saveUndoState();
}

function clearUndo() {
  undoState = null;
  if (undoClearTimer) clearTimeout(undoClearTimer);
  undoClearTimer = null;
  saveUndoState();
}

function restoreUndo() {
  if (!undoState) return false;
  appState.data = cloneData(undoState.data);
  appState.savedAt = undoState.savedAt || '';
  clearUndo();
  saveAppState(appState);
  saveMasterData(appState);
  showToast(t('undone'));
  recordAction(t('undone'));
  renderAppShell();
  return true;
}

function hasPendingLocalSync() {
  return localStorage.getItem(PENDING_LOCAL_SYNC_KEY) === '1';
}

function setPendingLocalSync(pending) {
  if (pending) localStorage.setItem(PENDING_LOCAL_SYNC_KEY, '1');
  else localStorage.removeItem(PENDING_LOCAL_SYNC_KEY);
}

function persistAndRender(message = t('saved'), options = {}) {
  if (!options.skipAutoSync) setPendingLocalSync(true);
  saveAppState(appState);
  saveMasterData(appState);
  if (!options.keepUndo) clearUndo();
  showToast(message);
  recordAction(message);
  renderAppShell();
  if (!options.skipAutoSync) scheduleAutoSupabaseSync();
}

function scheduleAutoSupabaseSync(delayMs = 1200) {
  autoSyncQueued = true;
  if (autoSyncTimer) clearTimeout(autoSyncTimer);
  autoSyncTimer = setTimeout(runAutoSupabaseSync, delayMs);
}

async function runAutoSupabaseSync() {
  autoSyncTimer = null;
  if (!autoSyncQueued || autoSyncInFlight) return;
  autoSyncQueued = false;
  autoSyncInFlight = true;
  try {
    if (!lastDbStatus?.data || lastDbStatus.error) {
      lastDbStatus = await loadSupabaseReadOnly();
    }
    const preview = buildSupabaseSyncPreview(appState, lastDbStatus);
    const hasWrites = preview.totalCreate + preview.totalUpdate > 0;
    if (!hasWrites) {
      setPendingLocalSync(false);
      return;
    }
    const client = await ensureSupabaseClient();
    const result = await executeAutoSupabaseWriteSync(client, appState, lastDbStatus, { schemaStatus: lastSchemaStatus });
    lastWriteResult = result;
    const summary = summarizeWriteResult(result);
    saveWriteAuditEntry(buildWriteAuditEntry({ preview, writeResult: result, postWritePreview: null, tables: undefined }));
    if (!summary.ok) {
      showToast(`Auto Supabase sync failed: ${summary.errors[0]?.error || 'Unknown error'}`, 'error');
      recordAction('Auto Supabase sync failed', 'error');
      renderAppShell();
      return;
    }
    setPendingLocalSync(false);
    lastDbStatus = await loadSupabaseReadOnly();
    lastPostWritePreview = buildSupabaseSyncPreview(appState, lastDbStatus);
    showToast(`Synced to Supabase: ${summary.written}`);
    recordAction(`Synced to Supabase: ${summary.written}`);
    renderAppShell();
  } catch (error) {
    showToast(`Auto Supabase sync failed: ${error.message || error}`, 'error');
    recordAction('Auto Supabase sync failed', 'error');
    renderAppShell();
  } finally {
    autoSyncInFlight = false;
    if (autoSyncQueued) scheduleAutoSupabaseSync(300);
  }
}

function stripSentenceEnd(value = '') {
  return String(value || '').replace(/[.。]+$/, '');
}

function actionMessage(baseMessage, label = '') {
  const cleanLabel = String(label || '').trim();
  return cleanLabel ? `${stripSentenceEnd(baseMessage)}: ${cleanLabel}` : baseMessage;
}

function confirmDelete(label = t('item')) {
  return window.confirm(`${t('confirmDelete')} ${label}`);
}

function updateTaskFiltersFromControl(target) {
  const updates = [
    ['search', '[data-task-search]'],
    ['owner', '[data-task-owner-filter]'],
    ['status', '[data-task-status-filter]'],
    ['priority', '[data-task-priority-filter]'],
    ['category', '[data-task-category-filter]'],
    ['health', '[data-task-health-filter]'],
    ['evidence', '[data-task-evidence-filter]'],
    ['sort', '[data-task-sort]'],
  ];
  const row = updates.find(([, selector]) => target.closest(selector));
  if (!row) return false;
  taskFilters[row[0]] = target.value || '';
  return true;
}

function applyTaskSearchFromDom() {
  const input = document.querySelector('[data-task-search]');
  taskFilters.search = input?.value || '';
  return true;
}

function loadSupabaseIntoApp({ silent = false, preserveLocal = false } = {}) {
  lastDbStatus = { loadedAt: new Date().toISOString(), error: 'Loading...' };
  if (!silent) renderAppShell();
  return loadSupabaseReadOnly()
    .then((payload) => {
      const importDelta = buildSupabaseReadOnlyImportDelta(appState.data, payload.data);
      payload.importDelta = importDelta;
      if (!preserveLocal) {
        applySupabaseReadOnlyData(appState, payload);
        setPendingLocalSync(false);
      }
      lastDbStatus = payload;
      lastSyncPreview = null;
      lastPostWritePreview = null;
      const changed = importDelta.rows.filter(row => row.delta !== 0).length;
      if (!preserveLocal) {
        saveAppState(appState);
        showToast(`${t('imported')} | ${changed} changed groups`);
      }
      renderAppShell();
      return payload;
    })
    .catch((error) => {
      lastDbStatus = { loadedAt: new Date().toISOString(), error: error.message || String(error), tables: {} };
      if (!silent) showToast(`Supabase load failed: ${error.message || error}`, 'error');
      renderAppShell();
      return null;
    });
}

function scheduleInitialSupabaseLoad() {
  if (initialSupabaseLoadStarted) return;
  initialSupabaseLoadStarted = true;
  const defer = typeof window?.setTimeout === 'function' ? window.setTimeout.bind(window) : setTimeout;
  defer(() => loadSupabaseIntoApp({ silent: true, preserveLocal: hasPendingLocalSync() }), 250);
}

function updateIntelFiltersFromControl(target) {
  const search = target.closest('[data-knowledge-search]');
  const status = target.closest('[data-knowledge-status-filter]');
  const sort = target.closest('[data-knowledge-sort]');
  const listName = search?.dataset.knowledgeSearch || status?.dataset.knowledgeStatusFilter || sort?.dataset.knowledgeSort;
  if (!listName || !intelFilters[listName]) return false;
  const key = search ? 'search' : status ? 'status' : 'sort';
  intelFilters[listName][key] = target.value || '';
  intelFilters[listName] = normalizeKnowledgeFilters(intelFilters[listName]);
  return true;
}

function updateMemberFiltersFromControl(target) {
  const updates = [
    ['search', '[data-member-search]'],
    ['role', '[data-member-role-filter]'],
    ['group', '[data-member-group-filter]'],
    ['sort', '[data-member-sort]'],
  ];
  const row = updates.find(([, selector]) => target.closest(selector));
  if (!row) return false;
  memberFilters[row[0]] = target.value || '';
  Object.assign(memberFilters, normalizeMemberFilters(memberFilters));
  return true;
}

function updateRunFiltersFromControl(target) {
  const updates = [
    ['search', '[data-run-search]'],
    ['sort', '[data-run-sort]'],
  ];
  const row = updates.find(([, selector]) => target.closest(selector));
  if (!row) return false;
  runFilters[row[0]] = target.value || '';
  Object.assign(runFilters, normalizeRunFilters(runFilters));
  return true;
}

function updatePrepFiltersFromControl(target) {
  const updates = [
    ['search', '[data-prep-search]'],
    ['status', '[data-prep-status-filter]'],
  ];
  const row = updates.find(([, selector]) => target.closest(selector));
  if (!row) return false;
  prepFilters[row[0]] = target.value || '';
  Object.assign(prepFilters, normalizePrepFilters(prepFilters));
  return true;
}

function applyTaskFilterPreset(target) {
  const preset = target.closest('[data-task-search-preset], [data-task-health-preset], [data-task-evidence-preset], [data-task-priority-preset], [data-task-status-preset], [data-task-owner-preset], [data-task-category-preset]');
  if (!preset) return false;
  Object.assign(taskFilters, {
    search: preset.dataset.taskSearchPreset || '',
    owner: preset.dataset.taskOwnerPreset || '',
    status: preset.dataset.taskStatusPreset || '',
    priority: preset.dataset.taskPriorityPreset || '',
    category: preset.dataset.taskCategoryPreset || '',
    health: preset.dataset.taskHealthPreset || '',
    evidence: preset.dataset.taskEvidencePreset || '',
    sort: taskFilters.sort || 'due-asc',
  });
  return true;
}

function applyDashboardStatTarget(target) {
  const stat = target.closest('[data-dashboard-stat]');
  if (!stat) return false;
  const page = stat.dataset.page || '';
  const settingsScroll = stat.dataset.settingsScroll || '';
  if (page === 'tasks') {
    Object.assign(taskFilters, {
      search: stat.dataset.taskSearchPreset || '',
      owner: stat.dataset.taskOwnerPreset || '',
      status: stat.dataset.taskStatusPreset || '',
      priority: stat.dataset.taskPriorityPreset || '',
      category: stat.dataset.taskCategoryPreset || '',
      health: stat.dataset.taskHealthPreset || '',
      evidence: stat.dataset.taskEvidencePreset || '',
      sort: taskFilters.sort || 'due-asc',
    });
  }
  showPage(appState, page || appState.currentPage);
  clearEditingOutsidePage(appState.currentPage);
  saveAppState(appState);
  renderAppShell();
  if (page === 'settings' && settingsScroll) scrollSettingsSection(settingsScroll);
  return true;
}

function applyTaskHealthShortcut(shortcut = '') {
  const nextHealth = taskFilters.health === shortcut ? '' : shortcut;
  Object.assign(taskFilters, {
    search: '',
    owner: '',
    status: '',
    priority: '',
    category: '',
    health: nextHealth,
    evidence: '',
    sort: taskFilters.sort || 'due-asc',
  });
}

function applyTaskEvidenceShortcut(shortcut = '') {
  const nextEvidence = taskFilters.evidence === shortcut ? '' : shortcut;
  Object.assign(taskFilters, {
    search: '',
    owner: '',
    status: '',
    priority: '',
    category: '',
    health: '',
    evidence: nextEvidence,
    sort: taskFilters.sort || 'due-asc',
  });
}

function taskHealthPresetForIssue(issue) {
  if (issue?.title === 'Task has no owner') return 'unassigned';
  if (issue?.title === 'Task owner not in members') return 'missing-owner';
  if (issue?.title === 'High priority task has no due date') return 'high-no-due';
  return '';
}

function taskEvidencePresetForIssue(issue) {
  return issue?.title === 'Task missing evidence' ? 'without' : '';
}

function applyPrepFocusPreset(target) {
  const preset = target.closest('[data-prep-focus-section]');
  if (!preset) return false;
  const query = preset.dataset.prepFocusQuery || '';
  prepFocus = {
    section: preset.dataset.prepFocusSection || '',
    query,
  };
  prepFilters.search = query;
  prepFilters.status = '';
  Object.assign(prepFilters, normalizePrepFilters(prepFilters));
  return true;
}

function clearPrepFocus() {
  if (prepFocus?.query && cleanFocusText(prepFilters.search) === cleanFocusText(prepFocus.query)) {
    prepFilters.search = '';
    Object.assign(prepFilters, normalizePrepFilters(prepFilters));
  }
  prepFocus = null;
}

function applyIntelFocusPreset(target) {
  const preset = target.closest('[data-intel-focus-list]');
  if (!preset) return false;
  const listName = preset.dataset.intelFocusList || '';
  const query = preset.dataset.intelFocusQuery || '';
  intelFocus = {
    listName,
    query,
  };
  if (intelFilters[listName]) {
    intelFilters[listName].search = query;
    intelFilters[listName].status = '';
    intelFilters[listName] = normalizeKnowledgeFilters(intelFilters[listName]);
  }
  return true;
}

function clearIntelFocus() {
  const listName = intelFocus?.listName || '';
  if (
    listName
    && intelFilters[listName]
    && intelFocus?.query
    && cleanFocusText(intelFilters[listName].search) === cleanFocusText(intelFocus.query)
  ) {
    intelFilters[listName].search = '';
    intelFilters[listName] = normalizeKnowledgeFilters(intelFilters[listName]);
  }
  intelFocus = null;
}

function cleanFocusText(value) {
  return String(value || '').trim().toLowerCase();
}

function clearPrepFocusIfComplete(section, query, complete) {
  if (!complete || prepFocus?.section !== section) return false;
  if (cleanFocusText(prepFocus.query) !== cleanFocusText(query)) return false;
  clearPrepFocus();
  return true;
}

function clearIntelFocusIfReady(listName, query, status) {
  if (status !== 'Ready' || intelFocus?.listName !== listName) return false;
  if (cleanFocusText(intelFocus.query) !== cleanFocusText(query)) return false;
  clearIntelFocus();
  return true;
}

function applyRunEditPreset(target) {
  const preset = target.closest('[data-run-edit-preset]');
  if (!preset) return false;
  editingRunId = preset.dataset.runEditPreset || null;
  runFilters.search = '';
  Object.assign(runFilters, normalizeRunFilters(runFilters));
  return true;
}

function hasDashboardTaskEvidence(task) {
  return Array.isArray(task.evidence) && task.evidence.some(item => String(item?.label || item?.url || item?.note || '').trim());
}

function getTaskChartDate(task, keys = []) {
  const raw = keys.map(key => task?.[key]).find(Boolean);
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatShortChartDate(date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function buildTaskStatusChartData(tasks = []) {
  const rows = [
    { status: 'Open', label: labelFor('Open'), color: '#C00000', value: 0 },
    { status: 'In Progress', label: labelFor('In Progress'), color: '#2F75B5', value: 0 },
    { status: 'Done', label: labelFor('Done'), color: '#548235', value: 0 },
  ];
  rows.forEach((row) => {
    row.value = tasks.filter(task => (task.status || 'Open') === row.status).length;
  });
  return { rows, total: tasks.length };
}

function buildPieGradient(rows = [], total = 0) {
  if (!total) return 'conic-gradient(#E5E7EB 0deg 360deg)';
  let start = 0;
  return `conic-gradient(${rows.map((row, index) => {
    const end = index === rows.length - 1 ? 360 : start + ((row.value / total) * 360);
    const segment = `${row.color} ${start.toFixed(2)}deg ${end.toFixed(2)}deg`;
    start = end;
    return segment;
  }).join(', ')})`;
}

function buildTaskBurndownData(tasks = []) {
  const dated = tasks.filter(task => getTaskChartDate(task, ['start_date', 'startDate', 'createdAt', 'created_at']) || getTaskChartDate(task, ['due']));
  if (!dated.length) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const remaining = tasks.filter(task => task.status !== 'Done').length;
    return { labels: [formatShortChartDate(today)], ideal: [tasks.length], remaining: [remaining] };
  }
  const rawDates = dated
    .flatMap(task => [
      getTaskChartDate(task, ['start_date', 'startDate', 'createdAt', 'created_at']),
      getTaskChartDate(task, ['due']),
    ])
    .filter(Boolean);
  const start = new Date(Math.min(...rawDates.map(date => date.getTime())));
  const end = new Date(Math.max(...rawDates.map(date => date.getTime())));
  const span = Math.max(1, Math.min(45, Math.round((end - start) / 86400000)));
  const labels = [];
  const ideal = [];
  const remaining = [];
  const total = tasks.length;
  for (let index = 0; index <= span; index += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const ratio = index / span;
    labels.push(formatShortChartDate(date));
    ideal.push(Math.max(0, Math.round(total * (1 - ratio))));
    remaining.push(tasks.filter((task) => {
      const due = getTaskChartDate(task, ['due']);
      return task.status !== 'Done' && (!due || due >= date);
    }).length);
  }
  return { labels, ideal, remaining };
}

function renderBurndownSvg(data) {
  const width = 640;
  const height = 250;
  const margin = { top: 18, right: 16, bottom: 32, left: 42 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const values = [...data.ideal, ...data.remaining];
  const maxY = Math.max(1, ...values);
  const xFor = index => margin.left + (data.labels.length === 1 ? plotW / 2 : (index / (data.labels.length - 1)) * plotW);
  const yFor = value => margin.top + plotH - ((Number(value) || 0) / maxY) * plotH;
  const linePoints = rows => rows.map((value, index) => `${xFor(index).toFixed(1)},${yFor(value).toFixed(1)}`).join(' ');
  const areaPoints = `${margin.left},${margin.top + plotH} ${linePoints(data.remaining)} ${margin.left + plotW},${margin.top + plotH}`;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(ratio => Math.round(maxY * ratio));
  const labelIndexes = [...new Set([0, Math.floor((data.labels.length - 1) / 2), data.labels.length - 1])];
  return `
    <svg class="task-burndown-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(t('taskBurndown'))}">
      <rect x="0" y="0" width="${width}" height="${height}" fill="transparent"></rect>
      ${yTicks.map((tick) => {
        const y = yFor(tick);
        return `<g><line x1="${margin.left}" y1="${y.toFixed(1)}" x2="${margin.left + plotW}" y2="${y.toFixed(1)}" stroke="#D8DEE9" stroke-width="1"></line><text x="${margin.left - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="#6B7280">${escapeHtml(tick)}</text></g>`;
      }).join('')}
      ${labelIndexes.map((index) => {
        const x = xFor(index);
        return `<g><line x1="${x.toFixed(1)}" y1="${margin.top}" x2="${x.toFixed(1)}" y2="${margin.top + plotH}" stroke="#E5E7EB" stroke-width="1"></line><text x="${x.toFixed(1)}" y="${height - 10}" text-anchor="middle" font-size="11" fill="#6B7280">${escapeHtml(data.labels[index])}</text></g>`;
      }).join('')}
      <polygon points="${areaPoints}" fill="rgba(192,0,0,.10)"></polygon>
      <polyline points="${linePoints(data.ideal)}" fill="none" stroke="#999999" stroke-width="2.4" stroke-dasharray="6 5"></polyline>
      <polyline points="${linePoints(data.remaining)}" fill="none" stroke="#C00000" stroke-width="3.2"></polyline>
      ${data.remaining.map((value, index) => `<circle cx="${xFor(index).toFixed(1)}" cy="${yFor(value).toFixed(1)}" r="2.4" fill="#C00000"></circle>`).join('')}
    </svg>`;
}

function renderTaskCharts(tasks = []) {
  const statusData = buildTaskStatusChartData(tasks);
  const burn = buildTaskBurndownData(tasks);
  const gradient = buildPieGradient(statusData.rows, statusData.total);
  return `
    <div class="dashboard-chart-grid" data-dashboard-task-charts>
      <div class="card dashboard-chart-card" data-task-status-chart>
        <h2 style="margin-top:0">${escapeHtml(t('taskStatusDistribution'))}</h2>
        <div class="task-status-counts">
          ${[
            ...statusData.rows.map(row => ({ ...row, accent: row.color })),
            { label: t('total'), value: statusData.total, accent: 'var(--blue)' },
          ].map(row => `
            <div class="task-status-count" style="border-left-color:${escapeHtml(row.accent)}">
              <div>${escapeHtml(row.label)}</div>
              <strong style="color:${escapeHtml(row.accent)}">${escapeHtml(row.value)}</strong>
            </div>
          `).join('')}
        </div>
        <div class="task-pie-wrap">
          <div class="task-pie" style="background:${escapeHtml(gradient)}" aria-hidden="true"></div>
        </div>
        <div class="task-chart-legend">
          ${statusData.rows.map(row => `<span><i style="background:${escapeHtml(row.color)}"></i>${escapeHtml(row.label)}</span>`).join('')}
        </div>
      </div>
      <div class="card dashboard-chart-card" data-task-burndown-chart>
        <h2 style="margin-top:0">${escapeHtml(t('taskBurndown'))}</h2>
        <div class="task-burndown-wrap">${renderBurndownSvg(burn)}</div>
        <div class="task-chart-legend">
          <span><i style="background:#999"></i>${escapeHtml(t('idealRemaining'))}</span>
          <span><i style="background:#C00000"></i>${escapeHtml(t('currentRemaining'))}</span>
        </div>
      </div>
    </div>`;
}

function renderDashboard() {
  const data = appState.data;
  const health = getDataHealthIssues(appState);
  const latestSmoke = getSmokeTestLog()[0] || null;
  const latestSmokeFailed = latestSmoke?.checks?.filter(check => !check.ok).length || 0;
  const today = new Date().toISOString().slice(0, 10);
  const weekEndDate = new Date();
  weekEndDate.setDate(weekEndDate.getDate() + 7);
  const weekEnd = weekEndDate.toISOString().slice(0, 10);
  const openTasks = data.tasks.filter(task => task.status !== 'Done').length;
  const activeTasks = data.tasks.filter(task => task.status !== 'Done');
  const blockedTasks = activeTasks.filter(task => task.blocked);
  const highTasks = activeTasks.filter(task => task.priority === 'High');
  const overdueTasks = activeTasks.filter(task => task.due && task.due < today);
  const focusTasks = activeTasks
    .filter(task => task.blocked || task.priority === 'High' || (task.due && task.due <= weekEnd))
    .sort((a, b) => {
      const urgent = Number(Boolean(b.blocked)) - Number(Boolean(a.blocked));
      const overdue = Number(Boolean(b.due && b.due < today)) - Number(Boolean(a.due && a.due < today));
      const priorityRank = { High: 0, Medium: 1, Low: 2 };
      const priority = (priorityRank[a.priority] ?? 9) - (priorityRank[b.priority] ?? 9);
      const due = String(a.due || '9999-12-31').localeCompare(String(b.due || '9999-12-31'));
      return urgent || overdue || priority || due || String(a.name || '').localeCompare(String(b.name || ''), 'en');
    })
    .slice(0, 6);
  const checklistDone = data.checklist.filter(item => item.done).length;
  const prediveDone = data.prediveChecklist.filter(item => item.done).length;
  const gearPacked = data.gearItems.filter(item => item.packed).length;
  const prepGaps = [
    ...data.checklist.filter(item => !item.done).map(item => ({ label: t('checklist'), title: item.label, section: 'checklist', query: item.label })),
    ...data.prediveChecklist.filter(item => !item.done).map(item => ({ label: t('preDive'), title: item.label, section: 'prediveChecklist', query: item.label })),
    ...data.gearItems.filter(item => !item.packed).map(item => ({ label: t('gearItems'), title: `${item.name} x${item.qty || 1}`, section: 'gearItems', query: item.name })),
  ].slice(0, 6);
  const readyIntel = data.intel.filter(item => item.status === 'Ready').length;
  const readyStrategy = data.strategy.filter(item => item.status === 'Ready').length;
  const intelGaps = [
    ...data.intel.filter(item => item.status !== 'Ready').map(item => ({ label: t('intel'), title: item.title || t('untitledItem'), status: item.status || 'Draft', listName: 'intel', query: item.title || '' })),
    ...data.strategy.filter(item => item.status !== 'Ready').map(item => ({ label: t('strategy'), title: item.title || t('untitledItem'), status: item.status || 'Draft', listName: 'strategy', query: item.title || '' })),
  ].slice(0, 6);
  const latestRun = data.missionRuns[0];
  const runScores = data.missionRuns.map(run => Number(run.score || 0));
  const readinessChecks = [
    Boolean(latestSmoke && latestSmokeFailed === 0),
    Boolean(data.tasks.length + data.members.length + data.checklist.length + data.missionRuns.length + data.gearItems.length),
    health.length === 0,
    !data.tasks.some(task => (task.priority === 'High' || task.status === 'Done') && !hasDashboardTaskEvidence(task)),
    Boolean(lastSchemaStatus && Object.keys(lastSchemaStatus.tables || {}).length),
    Boolean(lastSyncPreview || lastPostWritePreview),
  ];
  const dashboardValidationSummary = {
    packageFile: 'ROV_Task_Manager_v16.html',
    latestSmokeOk: readinessChecks[0],
    latestSmokeChecks: latestSmoke?.checks?.length || 0,
    readinessPassed: readinessChecks.filter(Boolean).length,
    readinessTotal: readinessChecks.length,
    unresolvedBlockers: readinessChecks.filter(ok => !ok).length,
  };
  const runSummary = runScores.length ? {
    best: Math.max(...runScores),
    average: Math.round(runScores.reduce((sum, score) => sum + score, 0) / runScores.length),
    count: runScores.length,
  } : null;
  const actionItems = [
    ...blockedTasks.map(task => ({ level: 'urgent', label: t('blocked'), task })),
    ...overdueTasks.map(task => ({ level: 'urgent', label: t('overdue'), task })),
    ...highTasks.map(task => ({ level: 'mid', label: labelFor('High'), task })),
  ].slice(0, 6);
  const memberWorkload = data.members.map(member => {
    const memberName = String(member.name || '').trim();
    const memberTasks = activeTasks.filter(task => String(task.owner || '').trim() === memberName);
    return {
      member,
      open: memberTasks.length,
      blocked: memberTasks.filter(task => task.blocked).length,
      high: memberTasks.filter(task => task.priority === 'High').length,
    };
  }).sort((a, b) => b.blocked - a.blocked || b.high - a.high || b.open - a.open || String(a.member.name || '').localeCompare(String(b.member.name || ''), 'en'));
  const memberNames = new Set(data.members.map(member => String(member.name || '').trim()).filter(Boolean));
  const unassignedTasks = activeTasks
    .filter((task) => {
      const owner = String(task.owner || '').trim();
      return !owner || owner === 'Unassigned' || !memberNames.has(owner);
    })
    .sort((a, b) => String(a.due || '9999-12-31').localeCompare(String(b.due || '9999-12-31')) || String(a.name || '').localeCompare(String(b.name || ''), 'en'))
    .slice(0, 6);
  return `
    <section id="page-dashboard" class="page active" style="display:grid;gap:12px">
      <div class="page-topbar">
        <div>
          <h1 style="margin:0;color:var(--navy)">Dashboard</h1>
          <div class="page-top-summary">${escapeHtml(t('dashboardSummary'))}</div>
        </div>
        <div class="page-top-summary">${escapeHtml(t('season'))} ${escapeHtml(appState.currentSeason)} | ${escapeHtml(t('page'))} ${escapeHtml(appState.currentPage)}</div>
        <div class="page-top-actions">
          <button class="btn btn-sm btn-primary" type="button" data-page="tasks">${escapeHtml(t('addTasks'))}</button>
          <button class="btn btn-sm" type="button" data-page="competition">${escapeHtml(t('missionRun'))}</button>
          <button class="btn btn-sm" type="button" data-action="export-handoff-report">${escapeHtml(t('exportHandoffReport'))}</button>
        </div>
      </div>
      <div class="card-grid" data-dashboard-stat-grid>
        ${[
          [t('openTasks'), openTasks, 'tasks', { status: 'active' }],
          [t('blocked'), blockedTasks.length, 'tasks', { health: 'blocked' }],
          [t('overdue'), overdueTasks.length, 'tasks', { health: 'overdue' }],
          [t('members'), data.members.length, 'members', {}],
          [t('missionRuns'), data.missionRuns.length, 'competition', {}],
          [t('healthIssues'), health.length, 'settings', { settingsScroll: 'settings-health-section' }],
        ].map(([label, value, page, preset]) => `
          <button class="card dashboard-stat-card" type="button" data-dashboard-stat data-page="${escapeHtml(page)}" ${preset.status ? `data-task-status-preset="${escapeHtml(preset.status)}"` : ''} ${preset.health ? `data-task-health-preset="${escapeHtml(preset.health)}"` : ''} ${preset.settingsScroll ? `data-settings-scroll="${escapeHtml(preset.settingsScroll)}"` : ''} aria-label="${escapeHtml(`${label} ${value}`)}">
            <div style="font-size:.78rem;color:var(--muted);font-weight:900">${escapeHtml(label)}</div>
            <div style="font-size:1.6rem;font-weight:900;color:var(--navy)">${escapeHtml(value)}</div>
          </button>
        `).join('')}
      </div>
      ${renderTaskCharts(data.tasks || [])}
      <div class="card" data-dashboard-action-summary>
        <h2>${escapeHtml(t('actionSummary'))}</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px">
          <div style="border:1px solid var(--border);border-radius:8px;background:var(--input-bg);padding:9px">
            <strong style="color:var(--navy)">${escapeHtml(t('prepReadiness'))}</strong>
            <div style="font-size:.82rem;color:var(--muted);font-weight:800;margin-top:5px">${escapeHtml(t('checklist'))}: ${checklistDone}/${data.checklist.length}</div>
            <div style="font-size:.82rem;color:var(--muted);font-weight:800">${escapeHtml(t('preDive'))}: ${prediveDone}/${data.prediveChecklist.length}</div>
            <div style="font-size:.82rem;color:var(--muted);font-weight:800">${escapeHtml(t('gearItems'))}: ${gearPacked}/${data.gearItems.length}</div>
            <div data-dashboard-prep-gaps style="display:grid;gap:5px;margin-top:8px">
              ${prepGaps.length ? prepGaps.map(gap => `
                <div style="display:grid;grid-template-columns:auto 1fr auto;gap:6px;align-items:center;font-size:.76rem;font-weight:850;color:var(--text)">
                  <span class="badge mid">${escapeHtml(gap.label)}</span>
                  <span>${escapeHtml(gap.title || '-')}</span>
                  <button class="btn btn-sm" type="button" data-page="prep" data-dashboard-prep-gap-action data-prep-focus-section="${escapeHtml(gap.section)}" data-prep-focus-query="${escapeHtml(gap.query || '')}">${escapeHtml(t('open'))}</button>
                </div>
              `).join('') : `<div style="color:var(--green);font-weight:900;font-size:.8rem">${escapeHtml(t('prepReady'))}</div>`}
            </div>
            <button class="btn btn-sm" type="button" data-page="prep" style="margin-top:8px">${escapeHtml(t('prep'))}</button>
          </div>
          <div style="border:1px solid var(--border);border-radius:8px;background:var(--input-bg);padding:9px">
            <strong style="color:var(--navy)">${escapeHtml(t('intelReadiness'))}</strong>
            <div style="font-size:.82rem;color:var(--muted);font-weight:800;margin-top:5px">${escapeHtml(t('intel'))}: ${readyIntel}/${data.intel.length}</div>
            <div style="font-size:.82rem;color:var(--muted);font-weight:800">${escapeHtml(t('strategy'))}: ${readyStrategy}/${data.strategy.length}</div>
            <div data-dashboard-intel-gaps style="display:grid;gap:5px;margin-top:8px">
              ${intelGaps.length ? intelGaps.map(gap => `
                <div style="display:grid;grid-template-columns:auto 1fr auto auto;gap:6px;align-items:center;font-size:.76rem;font-weight:850;color:var(--text)">
                  <span class="badge mid">${escapeHtml(gap.label)}</span>
                  <span>${escapeHtml(gap.title || '-')}</span>
                  <span style="color:var(--muted)">${escapeHtml(gap.status)}</span>
                  <button class="btn btn-sm" type="button" data-page="intel" data-dashboard-intel-gap-action data-intel-focus-list="${escapeHtml(gap.listName)}" data-intel-focus-query="${escapeHtml(gap.query || '')}">${escapeHtml(t('open'))}</button>
                </div>
              `).join('') : `<div style="color:var(--green);font-weight:900;font-size:.8rem">${escapeHtml(t('intelReady'))}</div>`}
            </div>
            <button class="btn btn-sm" type="button" data-page="intel" style="margin-top:8px">${escapeHtml(t('openIntel'))}</button>
          </div>
          <div style="border:1px solid var(--border);border-radius:8px;background:var(--input-bg);padding:9px">
            <strong style="color:var(--navy)">${escapeHtml(t('latestRun'))}</strong>
            <div style="font-size:.82rem;color:var(--muted);font-weight:800;margin-top:5px">${latestRun ? `${escapeHtml(t('score'))}: ${escapeHtml(latestRun.score)} | ${escapeHtml(t('note'))}: ${escapeHtml(latestRun.note || '-')}` : escapeHtml(t('noMissionRunsYet'))}</div>
            <div data-dashboard-run-summary style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:8px">
              ${runSummary ? [
                [t('bestScore'), runSummary.best],
                [t('avgScore'), runSummary.average],
                [t('missionRuns'), runSummary.count],
              ].map(([label, value]) => `
                <div style="border:1px solid var(--border);border-radius:8px;background:var(--white);padding:6px">
                  <div style="font-size:.68rem;color:var(--muted);font-weight:900">${escapeHtml(label)}</div>
                  <div style="font-size:1rem;color:var(--navy);font-weight:900">${escapeHtml(value)}</div>
                </div>
              `).join('') : ''}
            </div>
            <button class="btn btn-sm" type="button" data-page="competition" ${latestRun ? `data-dashboard-latest-run-action data-run-edit-preset="${escapeHtml(latestRun.id)}"` : ''} style="margin-top:8px">${escapeHtml(t('missionRun'))}</button>
          </div>
        </div>
        <div style="display:grid;gap:6px;margin-top:10px">
          ${actionItems.length ? actionItems.map(item => {
            const task = item.task || {};
            const isLate = task.due && task.due < today;
            const accent = task.blocked || isLate || item.level === 'urgent' ? 'var(--red)' : task.priority === 'High' ? 'var(--orange)' : 'var(--blue)';
            return `
              <div style="display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;border:1px solid var(--border);border-left:4px solid ${accent};border-radius:8px;background:var(--input-bg);padding:8px">
                <div>
                  <strong style="color:var(--navy)">${escapeHtml(task.name || t('task'))}</strong>
                  <div style="font-size:.78rem;color:var(--muted);font-weight:800">${escapeHtml(task.owner || labelFor('Unassigned'))} | ${escapeHtml(task.due || '-')} | ${escapeHtml(labelFor(task.category || 'General'))}</div>
                </div>
                <div style="display:flex;gap:5px;justify-content:flex-end;flex-wrap:wrap">
                  <span class="badge ${item.level === 'urgent' ? 'urgent' : 'mid'}">${escapeHtml(item.label)}</span>
                  ${task.blocked && item.label !== t('blocked') ? `<span class="badge urgent">${escapeHtml(t('blocked'))}</span>` : ''}
                  ${isLate && item.label !== t('overdue') ? `<span class="badge urgent">${escapeHtml(t('overdue'))}</span>` : ''}
                  <span class="badge ${task.priority === 'High' ? 'mid' : task.priority === 'Low' ? 'done' : ''}">${escapeHtml(labelFor(task.priority || 'Medium'))}</span>
                  <button class="btn btn-sm" type="button" data-page="tasks" data-dashboard-action-task-action data-task-search-preset="${escapeHtml(task.name || '')}">${escapeHtml(t('open'))}</button>
                </div>
              </div>`;
          }).join('') : `<div style="color:var(--green);font-weight:900">${escapeHtml(t('noActionItems'))}</div>`}
        </div>
      </div>
      <div class="card" data-dashboard-week-focus>
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap">
          <div>
            <h2 style="margin:0">${escapeHtml(t('weekFocus'))}</h2>
            <div style="font-size:.78rem;color:var(--muted);font-weight:800;margin-top:3px">${escapeHtml(today)} - ${escapeHtml(weekEnd)}</div>
          </div>
          <button class="btn btn-sm" type="button" data-page="tasks">${escapeHtml(t('tasks'))}</button>
        </div>
        <div style="display:grid;gap:6px;margin-top:10px">
          ${focusTasks.length ? focusTasks.map(task => {
            const isLate = task.due && task.due < today;
            const accent = task.blocked || isLate ? 'var(--red)' : task.priority === 'High' ? 'var(--orange)' : 'var(--blue)';
            return `
              <div style="display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;border:1px solid var(--border);border-left:4px solid ${accent};border-radius:8px;background:var(--input-bg);padding:8px">
                <div>
                  <strong style="color:var(--navy)">${escapeHtml(task.name || t('task'))}</strong>
                  <div style="font-size:.78rem;color:var(--muted);font-weight:800">${escapeHtml(task.owner || labelFor('Unassigned'))} | ${escapeHtml(task.due || '-')} | ${escapeHtml(labelFor(task.category || 'General'))}</div>
                </div>
                <div style="display:flex;gap:5px;justify-content:flex-end;flex-wrap:wrap">
                  ${task.blocked ? `<span class="badge urgent">${escapeHtml(t('blocked'))}</span>` : ''}
                  ${isLate ? `<span class="badge urgent">${escapeHtml(t('overdue'))}</span>` : ''}
                  <span class="badge ${task.priority === 'High' ? 'mid' : task.priority === 'Low' ? 'done' : ''}">${escapeHtml(labelFor(task.priority || 'Medium'))}</span>
                  <button class="btn btn-sm" type="button" data-page="tasks" data-dashboard-focus-task-action data-task-search-preset="${escapeHtml(task.name || '')}">${escapeHtml(t('open'))}</button>
                </div>
              </div>`;
          }).join('') : `<div style="color:var(--green);font-weight:900">${escapeHtml(t('noWeekFocus'))}</div>`}
        </div>
      </div>
      <div class="card" data-dashboard-member-workload>
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap">
          <h2 style="margin:0">${escapeHtml(t('memberWorkload'))}</h2>
          <button class="btn btn-sm" type="button" data-page="members">${escapeHtml(t('members'))}</button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px;margin-top:10px">
          ${memberWorkload.length ? memberWorkload.map(row => `
            <div style="border:1px solid var(--border);border-radius:8px;background:var(--input-bg);padding:9px">
              <strong style="color:var(--navy)">${escapeHtml(row.member.name || t('memberName'))}</strong>
              <div style="font-size:.8rem;color:var(--muted);font-weight:800;margin-top:3px">${escapeHtml(row.member.role || '-')} | ${escapeHtml(row.member.group || '-')}</div>
              <div style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center;margin-top:10px">
                <div style="display:flex;gap:5px;flex-wrap:nowrap;align-items:center;min-width:0;overflow:hidden">
                  <span class="badge ${row.open ? 'mid' : 'done'}" style="font-size:.72rem;white-space:nowrap">${escapeHtml(t('openTasks'))}: ${row.open}</span>
                  <span class="badge ${row.blocked ? 'urgent' : 'done'}" style="font-size:.72rem;white-space:nowrap">${escapeHtml(t('blocked'))}: ${row.blocked}</span>
                  <span class="badge ${row.high ? 'mid' : 'done'}" style="font-size:.72rem;white-space:nowrap">${escapeHtml(labelFor('High'))}: ${row.high}</span>
                </div>
                <button class="btn btn-sm" type="button" data-page="tasks" data-dashboard-member-task-action data-task-owner-preset="${escapeHtml(row.member.name || '')}">${escapeHtml(t('open'))}</button>
              </div>
            </div>
          `).join('') : `<div style="color:var(--green);font-weight:900">${escapeHtml(t('noMemberWorkload'))}</div>`}
        </div>
        <div data-dashboard-unassigned-tasks style="border-top:1px solid var(--border);margin-top:10px;padding-top:10px">
          <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:7px">
            <strong style="color:var(--navy)">${escapeHtml(t('unassignedTasks'))}</strong>
            <span class="badge ${unassignedTasks.length ? 'mid' : 'done'}">${escapeHtml(unassignedTasks.length)}</span>
          </div>
          <div style="display:grid;gap:6px">
            ${unassignedTasks.length ? unassignedTasks.map(task => `
              <div style="display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;border:1px solid var(--border);border-radius:8px;background:var(--input-bg);padding:8px">
                <div>
                  <strong>${escapeHtml(task.name || t('task'))}</strong>
                  <div style="font-size:.76rem;color:var(--muted);font-weight:800">${escapeHtml(task.owner || labelFor('Unassigned'))} | ${escapeHtml(task.due || '-')} | ${escapeHtml(labelFor(task.priority || 'Medium'))}</div>
                </div>
                <button class="btn btn-sm" type="button" data-page="tasks" data-task-health-preset="${escapeHtml((task.owner && task.owner !== 'Unassigned') ? 'missing-owner' : 'unassigned')}">${escapeHtml(t('assign'))}</button>
              </div>
            `).join('') : `<div style="color:var(--green);font-weight:900">${escapeHtml(t('noUnassignedTasks'))}</div>`}
          </div>
        </div>
      </div>
    </section>`;
}

function renderCurrentPage() {
  if (appState.currentPage === 'prep') return renderPrepCenter(appState, { editingGearId, editingChecklist, prepFocus, filters: prepFilters });
  if (appState.currentPage === 'tasks') return renderTasksPage(appState, { editingTaskId, taskModalOpen, filters: taskFilters });
  if (appState.currentPage === 'members') return renderMembersPage(appState, { editingMemberId, filters: memberFilters });
  if (appState.currentPage === 'intel') return renderIntelPage(appState, { editingIntelId, editingStrategyId, intelFocus, filters: intelFilters });
  if (appState.currentPage === 'presentation') return renderPresentationPage(appState);
  if (appState.currentPage === 'gantt') return renderGanttPage(appState);
  if (appState.currentPage === 'float') return renderFloatPage(appState);
  if (appState.currentPage === 'competition') return renderCompetitionCenter(appState, timer, { editingRunId, runDraft, filters: runFilters });
  if (appState.currentPage === 'settings') {
    return '<main id="settings-host"></main>';
  }
  return renderDashboard();
}

function renderAppShell() {
  appRoot.innerHTML = `${renderNavigation(appState.currentPage)}${renderToast()}${renderUndoBar()}${renderCurrentPage()}`;
  scheduleUndoAutoClear();
  if (appState.currentPage === 'settings') {
    renderSettingsHub(document.getElementById('settings-host'), {
      state: appState,
      smokeHistory: getSmokeTestLog(),
      migrationSummary: lastMigrationSummary,
      dbStatus: lastDbStatus,
      syncPreview: lastSyncPreview,
      writeResult: lastWriteResult,
      postWritePreview: lastPostWritePreview,
      schemaStatus: lastSchemaStatus,
      writeAuditLog: getWriteAuditLog(),
      rollbackSummary: lastRollbackSummary,
      diagnosticsSummary: lastDiagnosticsSummary,
      appSavedAt: appState.savedAt,
      undoAvailable: Boolean(undoState),
      actionLog,
    });
    renderSmokeTestPanel(getSmokePanel(), getSmokeTestLog()[0], getSmokeTestLog());
  }
}

function runAndRenderSmokeTest() {
  const currentPage = appState.currentPage;
  const checks = [];
  const addCheck = (label, selector) => {
    checks.push({ label, id: selector, ok: Boolean(document.querySelector(selector)) });
  };

  [
    ['dashboard', '#page-dashboard'],
    ['prep', '#page-prep'],
    ['tasks', '#page-tasks'],
    ['members', '#page-members'],
    ['intel', '#page-intel'],
    ['competition', '#page-competition'],
    ['settings', '#page-settings'],
  ].forEach(([page, selector]) => {
    appState.currentPage = page;
    renderAppShell();
    addCheck(`${page} page`, selector);
  });

  appState.currentPage = 'tasks';
  renderAppShell();
  addCheck('task form', '[data-task-form]');
  addCheck('task status control', '[data-task-status]');
  addCheck('task edit control', '[data-task-edit]');
  addCheck('task search', '[data-task-search]');
  addCheck('task owner filter', '[data-task-owner-filter]');
  addCheck('task evidence filter', '[data-task-evidence-filter]');
  addCheck('task sort', '[data-task-sort]');

  appState.currentPage = 'members';
  renderAppShell();
  addCheck('member form', '[data-member-form]');
  addCheck('member search', '[data-member-search]');
  addCheck('member role filter', '[data-member-role-filter]');
  addCheck('member edit control', '[data-member-edit]');
  addCheck('member sort', '[data-member-sort]');

  appState.currentPage = 'intel';
  renderAppShell();
  addCheck('intel notes', '[data-notes-input]');
  addCheck('intel form', '[data-knowledge-form="intel"]');
  addCheck('strategy form', '[data-knowledge-form="strategy"]');
  addCheck('intel search', '[data-knowledge-search="intel"]');
  addCheck('strategy status filter', '[data-knowledge-status-filter="strategy"]');
  addCheck('intel sort', '[data-knowledge-sort="intel"]');

  appState.currentPage = 'prep';
  renderAppShell();
  addCheck('checklist controls', '[data-checklist]');
  addCheck('checklist add control', '[data-checklist-add]');
  addCheck('checklist edit control', '[data-checklist-edit]');
  addCheck('checklist delete control', '[data-checklist-delete]');
  addCheck('gear packed control', '[data-gear-packed]');
  addCheck('gear add control', '[data-gear-add]');
  addCheck('gear edit control', '[data-gear-edit]');

  appState.currentPage = 'competition';
  renderAppShell();
  addCheck('timer control', '[data-timer-action]');
  addCheck('save run control', '[data-action="save-run"]');
  addCheck('run edit control', '[data-run-edit]');

  appState.currentPage = 'settings';
  renderAppShell();
  [
    ['smoke panel', '#v16-smoke-report'],
    ['supabase read panel', '#settings-db-section'],
    ['schema panel', '#settings-schema-section'],
    ['sync preview panel', '#settings-sync-section'],
    ['write sync panel', '#settings-write-section'],
    ['audit panel', '#settings-audit-section'],
    ['rollback panel', '#settings-rollback-section'],
  ].forEach(([label, selector]) => addCheck(label, selector));

  const failed = checks.filter(check => !check.ok);
  const result = {
    ts: new Date().toISOString(),
    ok: failed.length === 0,
    type: 'v16-workflow-smoke',
    checks,
  };
  saveSmokeTestResult(result);

  appState.currentPage = currentPage;
  renderAppShell();
  if (appState.currentPage === 'settings') renderSmokeTestPanel(getSmokePanel(), result, getSmokeTestLog());
  return result;
}

function setPage(page) {
  showPage(appState, page);
  clearEditingOutsidePage(appState.currentPage);
  saveAppState(appState);
  renderAppShell();
}

function startTimer() {
  if (timer.running) return;
  timer.running = true;
  timer.startedAt = Date.now();
  timer.interval = setInterval(renderAppShell, 1000);
  renderAppShell();
}

function pauseTimer() {
  if (!timer.running) return;
  timer.baseSeconds += Math.floor((Date.now() - timer.startedAt) / 1000);
  timer.running = false;
  clearInterval(timer.interval);
  timer.interval = null;
  renderAppShell();
}

function resetTimer() {
  timer.running = false;
  timer.startedAt = 0;
  timer.baseSeconds = 0;
  clearInterval(timer.interval);
  timer.interval = null;
  renderAppShell();
}

function currentElapsedSeconds() {
  return timer.running
    ? Math.floor((Date.now() - timer.startedAt) / 1000) + timer.baseSeconds
    : timer.baseSeconds;
}

function resetV16LocalDataWithBackup() {
  const confirmText = window.prompt(`${t('resetLocalDataPrompt')} RESET V16`);
  if (confirmText !== 'RESET V16') return;
  downloadLocalBackup(appState);
  const locale = localStorage.getItem('rov_v16_locale');
  Object.keys(localStorage)
    .filter(key => key.startsWith('rov_v16_'))
    .forEach(key => localStorage.removeItem(key));
  if (locale) localStorage.setItem('rov_v16_locale', locale);
  window.location.reload();
}

window.ROV_V16 = {
  state: appState,
  smoke: runAndRenderSmokeTest,
  render: renderAppShell,
  save: () => saveAppState(appState),
};

renderAppShell();
scheduleInitialSupabaseLoad();

appRoot?.addEventListener('click', (event) => {
  if (event.target.closest('[data-action="undo-last-change"]')) {
    restoreUndo();
    return;
  }
  if (event.target.closest('[data-action="clear-undo"]')) {
    clearUndo();
    showToast(t('undoCleared'));
    recordAction(t('undoCleared'));
    renderAppShell();
    return;
  }
  if (event.target.closest('[data-action="export-action-log"]')) {
    exportActionLog();
    showToast(t('actionLogExported'));
    recordAction(t('actionLogExported'));
    renderAppShell();
    return;
  }
  if (event.target.closest('[data-action="export-safety-report"]')) {
    exportSafetyReport();
    showToast(t('safetyReportExported'));
    recordAction(t('safetyReportExported'));
    renderAppShell();
    return;
  }
  if (event.target.closest('[data-action="clear-action-log"]')) {
    clearActionLog();
    showToast(t('actionLogCleared'));
    renderAppShell();
    return;
  }
  if (event.target.closest('[data-action="clear-safety-metadata"]')) {
    if (!window.confirm(t('confirmClearSafetyMetadata'))) return;
    clearSafetyMetadata();
    showToast(t('safetyMetadataCleared'));
    renderAppShell();
    return;
  }
  const healthShortcut = event.target.closest('[data-task-health-shortcut]');
  if (healthShortcut) {
    applyTaskHealthShortcut(healthShortcut.dataset.taskHealthShortcut || '');
    renderAppShell();
    return;
  }
  const evidenceShortcut = event.target.closest('[data-task-evidence-shortcut]');
  if (evidenceShortcut) {
    applyTaskEvidenceShortcut(evidenceShortcut.dataset.taskEvidenceShortcut || '');
    renderAppShell();
    return;
  }
  if (event.target.closest('[data-task-search-submit]')) {
    applyTaskSearchFromDom();
    renderAppShell();
    return;
  }
  const taskHeaderSort = event.target.closest('[data-task-header-sort]');
  if (taskHeaderSort) {
    taskFilters.sort = taskHeaderSort.dataset.taskHeaderSort || 'due-asc';
    renderAppShell();
    return;
  }
  if (event.target.closest('[data-task-clear-filters]')) {
    clearTaskFilters();
    renderAppShell();
    return;
  }
  if (event.target.closest('[data-member-clear-filters]')) {
    clearMemberFilters();
    renderAppShell();
    return;
  }
  const clearKnowledgeFilters = event.target.closest('[data-knowledge-clear-filters]');
  if (clearKnowledgeFilters) {
    if (clearIntelFilters(clearKnowledgeFilters.dataset.knowledgeClearFilters)) renderAppShell();
    return;
  }
  if (event.target.closest('[data-run-clear-filters]')) {
    clearRunFilters();
    renderAppShell();
    return;
  }
  if (event.target.closest('[data-prep-clear-filters]')) {
    clearPrepFilters();
    renderAppShell();
    return;
  }
  if (event.target.closest('[data-prep-clear-focus]')) {
    clearPrepFocus();
    renderAppShell();
    return;
  }
  if (event.target.closest('[data-intel-clear-focus]')) {
    clearIntelFocus();
    renderAppShell();
    return;
  }
  const removeTaskFilter = event.target.closest('[data-task-remove-filter]');
  if (removeTaskFilter) {
    if (clearTaskFilter(removeTaskFilter.dataset.taskRemoveFilter)) renderAppShell();
    return;
  }
  const removeMemberFilter = event.target.closest('[data-member-remove-filter]');
  if (removeMemberFilter) {
    if (clearMemberFilter(removeMemberFilter.dataset.memberRemoveFilter)) renderAppShell();
    return;
  }
  const removeKnowledgeFilter = event.target.closest('[data-knowledge-remove-filter]');
  if (removeKnowledgeFilter) {
    if (clearIntelFilter(removeKnowledgeFilter.dataset.knowledgeFilterList, removeKnowledgeFilter.dataset.knowledgeRemoveFilter)) renderAppShell();
    return;
  }
  const removeRunFilter = event.target.closest('[data-run-remove-filter]');
  if (removeRunFilter) {
    if (clearRunFilter(removeRunFilter.dataset.runRemoveFilter)) renderAppShell();
    return;
  }
  const removePrepFilter = event.target.closest('[data-prep-remove-filter]');
  if (removePrepFilter) {
    if (clearPrepFilter(removePrepFilter.dataset.prepRemoveFilter)) renderAppShell();
    return;
  }
  const localeToggleTarget = event.target.closest('[data-locale-toggle]');
  if (localeToggleTarget) {
    setLocale(localeToggleTarget.dataset.nextLocale || (getLocale() === 'zh' ? 'en' : 'zh'));
    renderAppShell();
    return;
  }
  const localeTarget = event.target.closest('[data-locale]');
  if (localeTarget) {
    setLocale(localeTarget.dataset.locale);
    renderAppShell();
    return;
  }
  const pageTarget = event.target.closest('[data-page]');
  if (pageTarget) {
    if (applyDashboardStatTarget(pageTarget)) return;
    const settingsScroll = pageTarget.dataset.settingsScroll;
    const readinessAction = pageTarget.dataset.readinessAction;
    applyTaskFilterPreset(pageTarget);
    applyPrepFocusPreset(pageTarget);
    applyIntelFocusPreset(pageTarget);
    applyRunEditPreset(pageTarget);
    setPage(pageTarget.dataset.page);
    if (pageTarget.dataset.page === 'settings' && settingsScroll) scrollSettingsSection(settingsScroll);
    if (readinessAction === 'run-smoke') {
      runAndRenderSmokeTest();
      showToast(t('smokeComplete'));
    }
    return;
  }
  if (event.target.closest('[data-action="probe-supabase-schema"]')) {
    lastSchemaStatus = { ts: new Date().toISOString(), probeMs: 0, tables: {} };
    renderAppShell();
    probeSupabaseSchema()
      .then((payload) => {
        lastSchemaStatus = payload;
        renderAppShell();
      })
      .catch((error) => {
        alert(`Schema probe failed: ${error.message || error}`);
      });
    return;
  }
  if (event.target.closest('[data-action="run-v16-smoke"]')) {
    runAndRenderSmokeTest();
    showToast(t('smokeComplete'));
    renderAppShell();
    return;
  }
  if (event.target.closest('[data-action="export-diagnostics"]')) {
    downloadDiagnosticsPayload(buildDiagnosticsPayload({
      appState,
      smokeLog: getSmokeTestLog(),
      writeAuditLog: getWriteAuditLog(),
      dbStatus: lastDbStatus,
      schemaStatus: lastSchemaStatus,
      syncPreview: lastSyncPreview,
      postWritePreview: lastPostWritePreview,
      migrationSummary: lastMigrationSummary,
      rollbackSummary: lastRollbackSummary,
      healthIssues: getDataHealthIssues(appState),
    }));
    showToast(t('exported'));
    recordAction(t('exported'));
    return;
  }
  if (event.target.closest('[data-action="export-handoff-report"]')) {
    exportHandoffReport({
      state: appState,
      smokeHistory: getSmokeTestLog(),
      writeAuditLog: getWriteAuditLog(),
      dbStatus: lastDbStatus,
      schemaStatus: lastSchemaStatus,
      syncPreview: lastSyncPreview,
      postWritePreview: lastPostWritePreview,
      migrationSummary: lastMigrationSummary,
      rollbackSummary: lastRollbackSummary,
    });
    showToast(t('exported'));
    recordAction(t('exported'));
    return;
  }
  if (event.target.closest('[data-action="choose-diagnostics"]')) {
    document.querySelector('[data-diagnostics-file]')?.click();
    return;
  }
  if (event.target.closest('[data-action="export-settings-pack"]')) {
    exportSettingsPack(appState, getSmokeTestLog());
    showToast(t('exported'));
    recordAction(t('exported'));
    return;
  }
  if (event.target.closest('[data-action="choose-settings-pack"]')) {
    document.querySelector('[data-settings-pack-file]')?.click();
    return;
  }
  if (event.target.closest('[data-action="load-supabase-readonly"]')) {
    loadSupabaseIntoApp();
    return;
  }
  if (event.target.closest('[data-action="build-sync-preview"]')) {
    try {
      lastSyncPreview = buildSupabaseSyncPreview(appState, lastDbStatus);
    } catch (error) {
      lastSyncPreview = {
        ts: new Date().toISOString(),
        mode: 'dry-run',
        writable: false,
        tables: [],
        totalCreate: 0,
        totalUpdate: 0,
        totalRemove: 0,
        error: error.message || String(error),
      };
      alert(`Sync preview failed: ${lastSyncPreview.error}`);
    }
    renderAppShell();
    return;
  }
  if (event.target.closest('[data-action="execute-guarded-write-sync"]')) {
    const confirmText = document.querySelector('[data-sync-confirm]')?.value || '';
    const tables = [...document.querySelectorAll('[data-sync-table]:checked')].map(input => input.dataset.syncTable);
    const previewBeforeWrite = lastSyncPreview;
    try {
      downloadLocalBackup(appState);
      ensureSupabaseClient().then(client => executeGuardedSupabaseWriteSync(client, appState, lastDbStatus, { confirmText, tables, schemaStatus: lastSchemaStatus }))
        .then((result) => {
          lastWriteResult = result;
          lastSyncPreview = null;
          const summary = summarizeWriteResult(result);
          if (!summary.ok) {
            saveWriteAuditEntry(buildWriteAuditEntry({ preview: previewBeforeWrite, writeResult: result, postWritePreview: null, tables }));
            renderAppShell();
            return null;
          }
          return loadSupabaseReadOnly();
        })
        .then((payload) => {
          if (!payload) return;
          lastDbStatus = payload;
          lastPostWritePreview = buildSupabaseSyncPreview(appState, payload);
          saveWriteAuditEntry(buildWriteAuditEntry({
            preview: previewBeforeWrite,
            writeResult: lastWriteResult,
            postWritePreview: lastPostWritePreview,
            tables,
          }));
          renderAppShell();
        })
        .catch((error) => {
          alert(`Guarded write sync failed: ${error.message || error}`);
        });
    } catch (error) {
      alert(`Guarded write sync failed: ${error.message || error}`);
    }
    return;
  }
  if (event.target.closest('[data-action="choose-v15-backup"]')) {
    document.querySelector('[data-v15-backup-file]')?.click();
    return;
  }
  if (event.target.closest('[data-action="choose-v16-backup"]')) {
    document.querySelector('[data-v16-backup-file]')?.click();
    return;
  }
  if (event.target.closest('[data-action="export-v16-backup"]')) {
    downloadLocalBackup(appState);
    showToast(t('backupExported'));
    recordAction(t('backupExported'));
    return;
  }
  if (event.target.closest('[data-action="reset-v16-local-data"]')) {
    resetV16LocalDataWithBackup();
    return;
  }
  if (event.target.closest('[data-action="analyze-float-packets"]')) {
    const raw = document.querySelector('[data-float-packets]')?.value || '';
    const analysis = saveFloatPacketAnalysis(appState, raw);
    persistAndRender(actionMessage(t('saved'), `${t('float')} ${analysis.lines}`));
    return;
  }
  if (event.target.closest('[data-action="clear-float-packets"]')) {
    captureUndo(actionMessage(t('deleted'), t('float')));
    clearFloatPackets(appState);
    persistAndRender(actionMessage(t('deleted'), t('float')), { keepUndo: true });
    return;
  }
  const scrollTarget = event.target.closest('[data-settings-scroll]');
  if (scrollTarget) {
    scrollSettingsSection(scrollTarget.dataset.settingsScroll);
    return;
  }
  const addTarget = event.target.closest('[data-master-add]');
  if (addTarget) {
    const type = addTarget.dataset.masterAdd;
    const input = document.querySelector(`[data-master-input="${type}"]`);
    const message = actionMessage(t('saved'), input?.value || t('item'));
    captureUndo(message);
    if (addMasterDataValue(appState, type, input?.value)) persistAndRender(message, { keepUndo: true });
    return;
  }
  const deleteMasterTarget = event.target.closest('[data-master-delete]');
  if (deleteMasterTarget) {
    if (!confirmDelete(deleteMasterTarget.dataset.masterValue || t('item'))) return;
    const message = actionMessage(t('deleted'), deleteMasterTarget.dataset.masterValue || t('item'));
    captureUndo(message);
    if (deleteMasterDataValue(appState, deleteMasterTarget.dataset.masterDelete, deleteMasterTarget.dataset.masterValue)) {
      persistAndRender(message, { keepUndo: true });
    }
    return;
  }
  const deleteTaskTarget = event.target.closest('[data-task-delete]');
  if (deleteTaskTarget) {
    const task = appState.data.tasks.find(row => Number(row.id) === Number(deleteTaskTarget.dataset.taskDelete));
    if (!confirmDelete(task?.title || t('task'))) return;
    const label = task?.name || task?.title || t('task');
    captureUndo(actionMessage(t('deleted'), label));
    if (Number(editingTaskId) === Number(deleteTaskTarget.dataset.taskDelete)) editingTaskId = null;
    if (deleteTask(appState, deleteTaskTarget.dataset.taskDelete)) persistAndRender(actionMessage(t('deleted'), label), { keepUndo: true });
    return;
  }
  const nextTaskStatusTarget = event.target.closest('[data-task-next-status]');
  if (nextTaskStatusTarget) {
    const task = appState.data.tasks.find(row => Number(row.id) === Number(nextTaskStatusTarget.dataset.taskNextStatus));
    const nextStatus = getNextTaskStatus(task?.status);
    const label = task ? `${task.name || t('task')} -> ${nextStatus}` : '';
    if (task) captureUndo(actionMessage(t('statusUpdated'), label));
    if (task && updateTaskStatus(appState, task.id, nextStatus)) persistAndRender(actionMessage(t('statusUpdated'), label), { keepUndo: true });
    return;
  }
  const editTaskTarget = event.target.closest('[data-task-edit]');
  if (editTaskTarget) {
    editingTaskId = editTaskTarget.dataset.taskEdit;
    taskModalOpen = true;
    renderAppShell();
    return;
  }
  if (event.target.closest('[data-task-cancel-edit]')) {
    editingTaskId = null;
    taskModalOpen = false;
    renderAppShell();
    return;
  }
  if (event.target.closest('[data-task-open-modal]')) {
    editingTaskId = null;
    taskModalOpen = true;
    renderAppShell();
    return;
  }
  const taskModalBg = event.target.closest('[data-task-modal-bg]');
  if (event.target.closest('[data-task-close-modal]') || (taskModalBg && !event.target.closest('[data-task-modal]'))) {
    taskModalOpen = false;
    editingTaskId = null;
    renderAppShell();
    return;
  }
  const deleteMemberTarget = event.target.closest('[data-member-delete]');
  if (deleteMemberTarget) {
    const member = appState.data.members.find(row => Number(row.id) === Number(deleteMemberTarget.dataset.memberDelete));
    if (!confirmDelete(member?.name || t('members'))) return;
    const label = member?.name || t('members');
    captureUndo(actionMessage(t('deleted'), label));
    if (Number(editingMemberId) === Number(deleteMemberTarget.dataset.memberDelete)) editingMemberId = null;
    if (deleteMember(appState, deleteMemberTarget.dataset.memberDelete)) persistAndRender(actionMessage(t('deleted'), label), { keepUndo: true });
    return;
  }
  const editMemberTarget = event.target.closest('[data-member-edit]');
  if (editMemberTarget) {
    editingMemberId = editMemberTarget.dataset.memberEdit;
    renderAppShell();
    return;
  }
  if (event.target.closest('[data-member-cancel-edit]')) {
    editingMemberId = null;
    renderAppShell();
    return;
  }
  const memberModalBg = event.target.closest('[data-member-modal-bg]');
  if (memberModalBg && !event.target.closest('[data-member-modal]')) {
    editingMemberId = null;
    renderAppShell();
    return;
  }
  const timerTarget = event.target.closest('[data-timer-action]');
  if (timerTarget) {
    if (timerTarget.dataset.timerAction === 'start') startTimer();
    if (timerTarget.dataset.timerAction === 'pause') pauseTimer();
    if (timerTarget.dataset.timerAction === 'reset') resetTimer();
    return;
  }
  const flowTarget = event.target.closest('[data-flow-step]');
  if (flowTarget) {
    const label = flowTarget.textContent || t('competitionFlow');
    const message = actionMessage(t('statusUpdated'), label);
    captureUndo(message);
    setCompetitionFlowStep(appState, flowTarget.dataset.flowStep);
    addMissionEvent(appState, 'flow_step', label, currentElapsedSeconds());
    persistAndRender(message, { keepUndo: true });
    return;
  }
  const missionEventTarget = event.target.closest('[data-mission-event]');
  if (missionEventTarget) {
    const label = missionEventTarget.textContent || t('missionEvents');
    const message = actionMessage(t('saved'), label);
    captureUndo(message);
    addMissionEvent(appState, missionEventTarget.dataset.missionEvent, label, currentElapsedSeconds());
    persistAndRender(message, { keepUndo: true });
    return;
  }
  if (event.target.closest('[data-action="add-custom-mission-event"]')) {
    const input = document.querySelector('[data-custom-mission-event]');
    const label = input?.value || t('customEvent');
    const message = actionMessage(t('saved'), label);
    captureUndo(message);
    addMissionEvent(appState, 'custom', label, currentElapsedSeconds());
    persistAndRender(message, { keepUndo: true });
    return;
  }
  if (event.target.closest('[data-action="clear-mission-events"]')) {
    const message = actionMessage(t('deleted'), t('missionEvents'));
    captureUndo(message);
    clearMissionEvents(appState);
    persistAndRender(message, { keepUndo: true });
    return;
  }
  if (event.target.closest('[data-action="export-tasks-csv"]')) {
    exportTasksCsv(getVisibleTasks(appState.data.tasks || [], appState.data.members || [], taskFilters));
    showToast(t('exported'));
    recordAction(actionMessage(t('exported'), t('tasks')));
    return;
  }
  if (event.target.closest('[data-action="export-mission-runs-csv"]')) {
    exportMissionRunsCsv(appState.data.missionRuns || []);
    showToast(t('exported'));
    recordAction(actionMessage(t('exported'), t('missionRuns')));
    return;
  }
  if (event.target.closest('[data-action="save-run"]')) {
    const payload = getRunPayloadFromDom();
    const message = actionMessage(t('saved'), `${t('missionRun')} ${payload.score}`);
    captureUndo(message);
    createMissionRun(appState, currentElapsedSeconds());
    runDraft = null;
    saveAppState(appState);
    showToast(message);
    recordAction(message);
    resetTimer();
    return;
  }
  const duplicateRunTarget = event.target.closest('[data-run-duplicate]');
  if (duplicateRunTarget) {
    const run = appState.data.missionRuns.find(row => Number(row.id) === Number(duplicateRunTarget.dataset.runDuplicate));
    runDraft = getRunDraftFromRun(run);
    editingRunId = null;
    showToast(t('runDuplicated'));
    recordAction(t('runDuplicated'));
    setPage('competition');
    return;
  }
  const editRunTarget = event.target.closest('[data-run-edit]');
  if (editRunTarget) {
    editingRunId = editRunTarget.dataset.runEdit;
    runDraft = null;
    renderAppShell();
    return;
  }
  if (event.target.closest('[data-run-cancel-edit]')) {
    editingRunId = null;
    runDraft = null;
    renderAppShell();
    return;
  }
  if (event.target.closest('[data-action="update-run"]')) {
    const root = event.target.closest('[data-run-modal]') || document;
    const payload = getRunPayloadFromDom(root);
    captureUndo(actionMessage(t('saved'), `${t('missionRun')} ${payload.score}`));
    if (updateMissionRun(appState, editingRunId, payload)) {
      editingRunId = null;
      persistAndRender(actionMessage(t('saved'), `${t('missionRun')} ${payload.score}`), { keepUndo: true });
    }
    return;
  }
  const deleteRunTarget = event.target.closest('[data-run-delete]');
  if (deleteRunTarget) {
    const run = appState.data.missionRuns.find(row => Number(row.id) === Number(deleteRunTarget.dataset.runDelete));
    if (!confirmDelete(run?.name || t('missionRun'))) return;
    const label = `${t('missionRun')} ${run?.score ?? ''}`.trim();
    captureUndo(actionMessage(t('deleted'), label));
    if (Number(editingRunId) === Number(deleteRunTarget.dataset.runDelete)) editingRunId = null;
    if (deleteMissionRun(appState, deleteRunTarget.dataset.runDelete)) persistAndRender(actionMessage(t('deleted'), label), { keepUndo: true });
    return;
  }
  const addChecklistTarget = event.target.closest('[data-checklist-add]');
  if (addChecklistTarget) {
    const listName = addChecklistTarget.dataset.checklistAdd;
    const input = document.querySelector(`[data-checklist-input="${listName}"]`);
    const label = input?.value || t('checklist');
    const message = actionMessage(t('saved'), label);
    captureUndo(message);
    if (addChecklistItem(appState, listName, input?.value)) persistAndRender(message, { keepUndo: true });
    return;
  }
  const editChecklistTarget = event.target.closest('[data-checklist-edit]');
  if (editChecklistTarget) {
    editingChecklist = {
      listName: editChecklistTarget.dataset.checklistEdit,
      id: editChecklistTarget.dataset.checkId,
    };
    renderAppShell();
    return;
  }
  if (event.target.closest('[data-checklist-cancel-edit]')) {
    editingChecklist = null;
    renderAppShell();
    return;
  }
  const updateChecklistTarget = event.target.closest('[data-checklist-update]');
  if (updateChecklistTarget) {
    const listName = updateChecklistTarget.dataset.checklistUpdate;
    const root = updateChecklistTarget.closest('[data-prep-modal]') || document;
    const input = root.querySelector(`[data-checklist-input="${listName}"]`);
    const message = actionMessage(t('saved'), input?.value || t('checklist'));
    captureUndo(message);
    if (updateChecklistItem(appState, listName, editingChecklist?.id, input?.value)) {
      editingChecklist = null;
      persistAndRender(message, { keepUndo: true });
    }
    return;
  }
  const deleteChecklistTarget = event.target.closest('[data-checklist-delete]');
  if (deleteChecklistTarget) {
    const list = appState.data[deleteChecklistTarget.dataset.checklistDelete] || [];
    const item = list.find(row => Number(row.id) === Number(deleteChecklistTarget.dataset.checkId));
    if (!confirmDelete(item?.label || t('checklist'))) return;
    const message = actionMessage(t('deleted'), item?.label || t('checklist'));
    captureUndo(message);
    if (
      editingChecklist?.listName === deleteChecklistTarget.dataset.checklistDelete
      && Number(editingChecklist.id) === Number(deleteChecklistTarget.dataset.checkId)
    ) {
      editingChecklist = null;
    }
    if (deleteChecklistItem(appState, deleteChecklistTarget.dataset.checklistDelete, deleteChecklistTarget.dataset.checkId)) {
      persistAndRender(message, { keepUndo: true });
    }
    return;
  }
  const toggleChecklistTarget = event.target.closest('[data-checklist-toggle]');
  if (toggleChecklistTarget) {
    const listName = toggleChecklistTarget.dataset.checklistToggle;
    const beforeItem = appState.data[listName]?.find(row => Number(row.id) === Number(toggleChecklistTarget.dataset.checkId));
    const message = actionMessage(t('statusUpdated'), beforeItem?.label || t('checklist'));
    captureUndo(message);
    if (toggleChecklistItem(appState, listName, toggleChecklistTarget.dataset.checkId)) {
      const item = appState.data[listName]?.find(row => Number(row.id) === Number(toggleChecklistTarget.dataset.checkId));
      clearPrepFocusIfComplete(listName, item?.label, item?.done);
      persistAndRender(message, { keepUndo: true });
    }
    return;
  }
  if (event.target.closest('[data-gear-add]')) {
    const payload = getGearPayloadFromDom();
    const message = actionMessage(t('saved'), payload.name || t('gearItems'));
    captureUndo(message);
    if (addGearItem(appState, payload)) persistAndRender(message, { keepUndo: true });
    return;
  }
  const editGearTarget = event.target.closest('[data-gear-edit]');
  if (editGearTarget) {
    editingGearId = editGearTarget.dataset.gearEdit;
    renderAppShell();
    return;
  }
  if (event.target.closest('[data-gear-cancel-edit]')) {
    editingGearId = null;
    renderAppShell();
    return;
  }
  if (event.target.closest('[data-gear-update]')) {
    const root = event.target.closest('[data-prep-modal]') || document;
    const payload = getGearPayloadFromDom(root);
    const message = actionMessage(t('saved'), payload.name || t('gearItems'));
    captureUndo(message);
    if (updateGearItem(appState, editingGearId, payload)) {
      editingGearId = null;
      persistAndRender(message, { keepUndo: true });
    }
    return;
  }
  const deleteGearTarget = event.target.closest('[data-gear-delete]');
  if (deleteGearTarget) {
    const item = appState.data.gearItems.find(row => Number(row.id) === Number(deleteGearTarget.dataset.gearDelete));
    if (!confirmDelete(item?.name || t('gearItems'))) return;
    const message = actionMessage(t('deleted'), item?.name || t('gearItems'));
    captureUndo(message);
    if (Number(editingGearId) === Number(deleteGearTarget.dataset.gearDelete)) editingGearId = null;
    if (deleteGearItem(appState, deleteGearTarget.dataset.gearDelete)) persistAndRender(message, { keepUndo: true });
    return;
  }
  const toggleGearTarget = event.target.closest('[data-gear-toggle]');
  if (toggleGearTarget) {
    const beforeItem = appState.data.gearItems.find(row => Number(row.id) === Number(toggleGearTarget.dataset.gearToggle));
    const message = actionMessage(t('statusUpdated'), beforeItem?.name || t('gearItems'));
    captureUndo(message);
    if (toggleGearItem(appState, toggleGearTarget.dataset.gearToggle)) {
      const item = appState.data.gearItems.find(row => Number(row.id) === Number(toggleGearTarget.dataset.gearToggle));
      clearPrepFocusIfComplete('gearItems', item?.name, item?.packed);
      persistAndRender(message, { keepUndo: true });
    }
    return;
  }
  if (event.target.closest('[data-notes-save]')) {
    captureUndo();
    updateNotes(appState, document.querySelector('[data-notes-input]')?.value || '');
    persistAndRender(t('saved'), { keepUndo: true });
    return;
  }
  const nextKnowledgeStatusTarget = event.target.closest('[data-knowledge-next-status]');
  if (nextKnowledgeStatusTarget) {
    const listName = nextKnowledgeStatusTarget.dataset.knowledgeNextStatus;
    const item = appState.data[listName]?.find(row => Number(row.id) === Number(nextKnowledgeStatusTarget.dataset.knowledgeId));
    const nextStatus = getNextKnowledgeStatus(item?.status);
    const message = actionMessage(t('statusUpdated'), item ? `${item.title || t('item')} -> ${nextStatus}` : '');
    if (item) captureUndo(message);
    if (item && updateKnowledgeStatus(appState, listName, item.id, nextStatus)) {
      clearIntelFocusIfReady(listName, item.title, nextStatus);
      persistAndRender(message, { keepUndo: true });
    }
    return;
  }
  const editKnowledgeTarget = event.target.closest('[data-knowledge-edit]');
  if (editKnowledgeTarget) {
    if (editKnowledgeTarget.dataset.knowledgeEdit === 'intel') {
      editingIntelId = editKnowledgeTarget.dataset.knowledgeId;
      editingStrategyId = null;
    }
    if (editKnowledgeTarget.dataset.knowledgeEdit === 'strategy') {
      editingStrategyId = editKnowledgeTarget.dataset.knowledgeId;
      editingIntelId = null;
    }
    renderAppShell();
    return;
  }
  if (event.target.closest('[data-knowledge-cancel-edit]')) {
    editingIntelId = null;
    editingStrategyId = null;
    renderAppShell();
    return;
  }
  const deleteKnowledgeTarget = event.target.closest('[data-knowledge-delete]');
  if (deleteKnowledgeTarget) {
    const list = appState.data[deleteKnowledgeTarget.dataset.knowledgeDelete] || [];
    const item = list.find(row => Number(row.id) === Number(deleteKnowledgeTarget.dataset.knowledgeId));
    if (!confirmDelete(item?.title || t('item'))) return;
    const message = actionMessage(t('deleted'), item?.title || t('item'));
    captureUndo(message);
    if (deleteKnowledgeTarget.dataset.knowledgeDelete === 'intel' && Number(editingIntelId) === Number(deleteKnowledgeTarget.dataset.knowledgeId)) editingIntelId = null;
    if (deleteKnowledgeTarget.dataset.knowledgeDelete === 'strategy' && Number(editingStrategyId) === Number(deleteKnowledgeTarget.dataset.knowledgeId)) editingStrategyId = null;
    if (deleteKnowledgeItem(appState, deleteKnowledgeTarget.dataset.knowledgeDelete, deleteKnowledgeTarget.dataset.knowledgeId)) persistAndRender(message, { keepUndo: true });
    return;
  }
  const prepModalBg = event.target.closest('[data-prep-modal-bg]');
  if (prepModalBg && !event.target.closest('[data-prep-modal]')) {
    editingChecklist = null;
    editingGearId = null;
    renderAppShell();
    return;
  }
  const knowledgeModalBg = event.target.closest('[data-knowledge-modal-bg]');
  if (knowledgeModalBg && !event.target.closest('[data-knowledge-modal]')) {
    editingIntelId = null;
    editingStrategyId = null;
    renderAppShell();
    return;
  }
  const runModalBg = event.target.closest('[data-run-modal-bg]');
  if (runModalBg && !event.target.closest('[data-run-modal]')) {
    editingRunId = null;
    runDraft = null;
    renderAppShell();
    return;
  }
});

appRoot?.addEventListener('submit', (event) => {
  const presentationForm = event.target.closest('[data-presentation-form]');
  if (!presentationForm) return;
  event.preventDefault();
  const run = createPresentationRunFromForm(new FormData(presentationForm));
  const message = actionMessage(t('saved'), `${t('presentation')} ${run.total}`);
  captureUndo(message);
  addPresentationRun(appState, run);
  persistAndRender(message, { keepUndo: true });
});

appRoot?.addEventListener('submit', (event) => {
  const form = event.target.closest('[data-task-form]');
  if (!form) return;
  event.preventDefault();
  const task = createTaskFromForm(new FormData(form));
  const message = actionMessage(t('saved'), task.name || t('task'));
  captureUndo(message);
  if (editingTaskId) {
    if (updateTask(appState, editingTaskId, task)) {
      editingTaskId = null;
      taskModalOpen = false;
    }
  } else {
    addTask(appState, task);
    taskModalOpen = false;
  }
  persistAndRender(message, { keepUndo: true });
});

appRoot?.addEventListener('submit', (event) => {
  const form = event.target.closest('[data-member-form]');
  if (!form) return;
  event.preventDefault();
  const member = createMemberFromForm(new FormData(form));
  const message = actionMessage(t('saved'), member.name || t('members'));
  captureUndo(message);
  if (editingMemberId) {
    if (updateMember(appState, editingMemberId, member)) editingMemberId = null;
  } else {
    addMember(appState, member);
  }
  persistAndRender(message, { keepUndo: true });
});

appRoot?.addEventListener('submit', (event) => {
  const form = event.target.closest('[data-knowledge-form]');
  if (!form) return;
  event.preventDefault();
  const listName = form.dataset.knowledgeForm;
  const item = createKnowledgeItemFromForm(new FormData(form));
  const editingId = listName === 'intel' ? editingIntelId : editingStrategyId;
  const message = actionMessage(t('saved'), item.title || t('item'));
  captureUndo(message);
  if (editingId) {
    if (updateKnowledgeItem(appState, listName, editingId, item)) {
      if (listName === 'intel') editingIntelId = null;
      if (listName === 'strategy') editingStrategyId = null;
      clearIntelFocusIfReady(listName, item.title, item.status);
    }
  } else {
    addKnowledgeItem(appState, listName, item);
  }
  persistAndRender(message, { keepUndo: true });
});

appRoot?.addEventListener('change', (event) => {
  if (
    event.target.closest('[data-score-item-value]')
    || event.target.closest('[data-score-item-status]')
    || event.target.closest('[data-run-penalty]')
  ) {
    const items = [...document.querySelectorAll('[data-score-item]')];
    const gross = items.reduce((sum, row) => sum + Number(row.querySelector('[data-score-item-value]')?.value || 0), 0);
    const penalty = Number(document.querySelector('[data-run-penalty]')?.value || 0);
    const done = items.filter(row => row.querySelector('[data-score-item-status]')?.value === 'done').length;
    const total = gross - penalty;
    const grossInput = document.querySelector('[data-run-gross-score]');
    const scoreInput = document.querySelector('[data-run-score]');
    if (grossInput) grossInput.value = String(gross);
    if (scoreInput) scoreInput.value = String(total);
    const rate = items.length ? Math.round((done / items.length) * 100) : 0;
    const rateBadge = document.querySelector('[data-mission-scoreboard] .badge');
    if (rateBadge) rateBadge.textContent = `${t('successRate')}: ${rate}%`;
    return;
  }
  const status = event.target.closest('[data-task-status]');
  if (status) {
    const task = appState.data.tasks.find(row => Number(row.id) === Number(status.dataset.taskStatus));
    const message = actionMessage(t('statusUpdated'), task ? `${task.name || t('task')} -> ${status.value}` : '');
    captureUndo(message);
    if (updateTaskStatus(appState, status.dataset.taskStatus, status.value)) persistAndRender(message, { keepUndo: true });
    return;
  }
  const check = event.target.closest('[data-checklist]');
  if (check) {
    const item = appState.data[check.dataset.checklist]?.find(row => Number(row.id) === Number(check.dataset.checkId));
    const message = actionMessage(t('statusUpdated'), item?.label || t('checklist'));
    captureUndo(message);
    if (toggleChecklistItem(appState, check.dataset.checklist, check.dataset.checkId)) {
      const updatedItem = appState.data[check.dataset.checklist]?.find(row => Number(row.id) === Number(check.dataset.checkId));
      clearPrepFocusIfComplete(check.dataset.checklist, updatedItem?.label, updatedItem?.done);
      persistAndRender(message, { keepUndo: true });
    }
    return;
  }
  const gear = event.target.closest('[data-gear-packed]');
  if (gear) {
    const item = appState.data.gearItems.find(row => Number(row.id) === Number(gear.dataset.gearPacked));
    const message = actionMessage(t('statusUpdated'), item?.name || t('gearItems'));
    captureUndo(message);
    if (toggleGearItem(appState, gear.dataset.gearPacked)) {
      const updatedItem = appState.data.gearItems.find(row => Number(row.id) === Number(gear.dataset.gearPacked));
      clearPrepFocusIfComplete('gearItems', updatedItem?.name, updatedItem?.packed);
      persistAndRender(message, { keepUndo: true });
    }
    return;
  }
  if (
    event.target.closest('[data-task-owner-filter]')
    || event.target.closest('[data-task-status-filter]')
    || event.target.closest('[data-task-priority-filter]')
    || event.target.closest('[data-task-category-filter]')
    || event.target.closest('[data-task-health-filter]')
    || event.target.closest('[data-task-evidence-filter]')
    || event.target.closest('[data-task-sort]')
  ) {
    updateTaskFiltersFromControl(event.target);
    renderAppShell();
    return;
  }
  if (
    event.target.closest('[data-member-role-filter]')
    || event.target.closest('[data-member-group-filter]')
    || event.target.closest('[data-member-sort]')
  ) {
    updateMemberFiltersFromControl(event.target);
    renderAppShell();
    return;
  }
  if (
    event.target.closest('[data-knowledge-status-filter]')
    || event.target.closest('[data-knowledge-sort]')
  ) {
    updateIntelFiltersFromControl(event.target);
    renderAppShell();
    return;
  }
  if (event.target.closest('[data-run-sort]')) {
    updateRunFiltersFromControl(event.target);
    renderAppShell();
    return;
  }
  if (event.target.closest('[data-prep-status-filter]')) {
    updatePrepFiltersFromControl(event.target);
    renderAppShell();
    return;
  }
  const input = event.target.closest('[data-settings-pack-file]');
  const backupInput = event.target.closest('[data-v15-backup-file]');
  const v16BackupInput = event.target.closest('[data-v16-backup-file]');
  const diagnosticsInput = event.target.closest('[data-diagnostics-file]');
  const file = input?.files?.[0] || backupInput?.files?.[0] || v16BackupInput?.files?.[0] || diagnosticsInput?.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const payload = JSON.parse(String(reader.result || '{}'));
      if (backupInput) {
        captureUndo();
        lastMigrationSummary = importV15BackupPayload(appState, payload);
      } else if (v16BackupInput) {
        if (!window.confirm(t('confirmRestoreV16Backup'))) return;
        captureUndo();
        downloadLocalBackup(appState);
        lastRollbackSummary = restoreLocalBackupPayload(appState, payload);
        lastSyncPreview = null;
        lastPostWritePreview = null;
      } else if (diagnosticsInput) {
        lastDiagnosticsSummary = parseDiagnosticsPayload(payload);
      } else {
        captureUndo();
        importSettingsPackPayload(appState, payload);
      }
      persistAndRender(v16BackupInput ? t('restored') : t('imported'), { keepUndo: Boolean(backupInput || v16BackupInput || input) });
    } catch (error) {
      alert(`Import failed: ${error.message || error}`);
    } finally {
      if (input) input.value = '';
      if (backupInput) backupInput.value = '';
      if (v16BackupInput) v16BackupInput.value = '';
      if (diagnosticsInput) diagnosticsInput.value = '';
    }
  };
  reader.readAsText(file);
});

appRoot?.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && (taskModalOpen || editingTaskId || editingMemberId || editingRunId || editingGearId || editingChecklist || editingIntelId || editingStrategyId)) {
    taskModalOpen = false;
    editingTaskId = null;
    editingMemberId = null;
    editingRunId = null;
    editingGearId = null;
    editingChecklist = null;
    editingIntelId = null;
    editingStrategyId = null;
    renderAppShell();
    return;
  }
  const isUndoShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !event.shiftKey;
  if (isUndoShortcut) {
    const isTextField = event.target.closest('input, textarea, select, [contenteditable="true"]');
    if (!isTextField && undoState) {
      event.preventDefault();
      restoreUndo();
    }
    return;
  }
  if (event.key !== 'Enter') return;
  if (event.target.closest('[data-task-search]')) {
    event.preventDefault();
    applyTaskSearchFromDom();
    renderAppShell();
    return;
  }
  const input = event.target.closest('[data-master-input]');
  const checklistInput = event.target.closest('[data-checklist-input]');
  const gearInput = event.target.closest('[data-gear-name], [data-gear-category], [data-gear-qty]');
  if (!input && !checklistInput && !gearInput) return;
  event.preventDefault();
  if (gearInput) {
    const root = gearInput.closest('[data-prep-modal]') || document;
    const payload = getGearPayloadFromDom(root);
    const message = actionMessage(t('saved'), payload.name || t('gearItems'));
    if (editingGearId) {
      captureUndo(message);
      if (updateGearItem(appState, editingGearId, payload)) {
        editingGearId = null;
        persistAndRender(message, { keepUndo: true });
      }
    } else {
      captureUndo(message);
      if (addGearItem(appState, payload)) persistAndRender(message, { keepUndo: true });
    }
    return;
  }
  if (checklistInput) {
    const message = actionMessage(t('saved'), checklistInput.value || t('checklist'));
    if (editingChecklist?.listName === checklistInput.dataset.checklistInput) {
      captureUndo(message);
      if (updateChecklistItem(appState, editingChecklist.listName, editingChecklist.id, checklistInput.value)) {
        editingChecklist = null;
        persistAndRender(message, { keepUndo: true });
      }
    } else {
      captureUndo(message);
      if (addChecklistItem(appState, checklistInput.dataset.checklistInput, checklistInput.value)) persistAndRender(message, { keepUndo: true });
    }
    return;
  }
  const message = actionMessage(t('saved'), input.value || t('item'));
  captureUndo(message);
  if (addMasterDataValue(appState, input.dataset.masterInput, input.value)) persistAndRender(message, { keepUndo: true });
});

appRoot?.addEventListener('input', (event) => {
  if (event.target.closest('[data-member-search]')) {
    updateMemberFiltersFromControl(event.target);
    renderAppShell();
    return;
  }
  if (event.target.closest('[data-knowledge-search]')) {
    updateIntelFiltersFromControl(event.target);
    renderAppShell();
    return;
  }
  if (event.target.closest('[data-run-search]')) {
    updateRunFiltersFromControl(event.target);
    renderAppShell();
    return;
  }
  if (event.target.closest('[data-prep-search]')) {
    updatePrepFiltersFromControl(event.target);
    renderAppShell();
  }
});

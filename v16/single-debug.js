
const __src_data_defaults_js = (() => {

const DEFAULT_STATE = {
  tasks: [
    {
      id: 1,
      name: 'Finalize mission checklist',
      owner: 'Captain',
      due: '',
      priority: 'High',
      status: 'Open',
      category: 'Mission Run',
      blocked: false,
      notes: 'Seed task for v16 smoke testing.',
    },
  ],
  members: [
    { id: 1, name: 'Captain', role: 'Lead', group: 'Operations' },
    { id: 2, name: 'Pilot', role: 'Pilot', group: 'Drive Team' },
  ],
  checklist: [
    { id: 1, label: 'Battery charged', done: false },
    { id: 2, label: 'Tether inspected', done: false },
    { id: 3, label: 'Camera feed checked', done: false },
  ],
  prediveChecklist: [
    { id: 1, label: 'Frame and thrusters secure', done: false },
    { id: 2, label: 'Control station ready', done: false },
  ],
  intel: [],
  notes: '',
  attachments: [],
  strategy: [],
  practiceRuns: [],
  missionRuns: [],
  gearItems: [
    { id: 1, name: 'Battery set', category: 'Electrical', qty: 2, packed: false },
    { id: 2, name: 'Tool kit', category: 'Tools', qty: 1, packed: false },
  ],
  presentationRuns: [],
  masterData: {
    roles: ['Lead', 'Coach', 'Pilot', 'Mechanical', 'Electrical', 'Software', 'Presentation', 'Pit Crew'],
    groups: ['Operations', 'Drive Team', 'Engineering', 'Presentation', 'Travel', 'Competition Day'],
    taskTypes: ['Urgent', 'High', 'Medium', 'Low', 'Mission Run', 'Presentation', 'Travel Docs', 'Gear', 'Pre-Dive'],
    gearCats: ['Required', 'Spare', 'Consumable', 'Tools', 'Docs', 'Electrical', 'Mechanical', 'Safety', 'Competition Day'],
  },
};

return { DEFAULT_STATE };
})();

const __src_utils_date_js = (() => {

function todayDateString(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function toDateInputValue(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getWeekStart(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  return d;
}

function getTaskDueInfo(task, today = new Date()) {
  if (!task?.due) return { days: null };
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  const due = new Date(task.due);
  due.setHours(0, 0, 0, 0);
  return { days: Math.ceil((due - start) / 86400000) };
}

function isOverdue(due, now = new Date()) {
  if (!due) return false;
  const d = new Date(due);
  d.setHours(23, 59, 59);
  return d < now;
}

function getOverdueDays(due, today = new Date()) {
  if (!due) return 0;
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  const d = new Date(due);
  d.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((start - d) / 86400000));
}

function formatMissionTime(seconds) {
  const safe = Math.max(0, Number(seconds) || 0);
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  return h > 0
    ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

return { todayDateString, toDateInputValue, getWeekStart, getTaskDueInfo, isOverdue, getOverdueDays, formatMissionTime };
})();

const __src_utils_dom_js = (() => {

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(value) {
  return String(value ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function safeJsonParse(raw, fallback = null) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

return { escapeHtml, escapeAttr, safeJsonParse };
})();

const __src_utils_i18n_js = (() => {

const LOCALE_STORAGE_KEY = 'rov_v16_locale';

const STRINGS = {
  en: {
    appTitle: 'ROV Task Manager v16',
    dashboard: 'Dashboard',
    prep: 'Prep',
    tasks: 'Tasks',
    competition: 'Competition',
    settings: 'Settings',
    dashboardSummary: 'v16 is now a standalone local-first build. v15 remains untouched.',
    actionSummary: 'Action Summary',
    prepReadiness: 'Prep readiness',
    intelReadiness: 'Intel readiness',
    intelReady: 'Intel is ready.',
    latestRun: 'Latest run',
    bestScore: 'Best score',
    avgScore: 'Avg score',
    openIntel: 'Open intel',
    open: 'Open',
    noActionItems: 'No action items.',
    memberWorkload: 'Member workload',
    noMemberWorkload: 'No active member workload.',
    unassignedTasks: 'Unassigned tasks',
    noUnassignedTasks: 'No unassigned tasks.',
    assign: 'Assign',
    weekFocus: 'This week focus',
    noWeekFocus: 'No urgent or due-this-week tasks.',
    prepReady: 'Prep is ready.',
    season: 'Season',
    page: 'Page',
    addTasks: 'Add tasks',
    missionRun: 'Mission run',
    openTasks: 'Open tasks',
    members: 'Members',
    intel: 'Intel',
    intelSummary: 'Team notes, scouting intel, and strategy items.',
    intelFocus: 'Intel focus',
    teamNotes: 'Team Notes',
    notes: 'Notes',
    saveNotes: 'Save notes',
    strategy: 'Strategy',
    title: 'Title',
    content: 'Content',
    updateItem: 'Update item',
    editingItem: 'Editing item',
    untitledItem: 'Untitled item',
    item: 'Item',
    noItemsYet: 'No items yet.',
    noMatchingItems: 'No items match the current filters.',
    membersSummary: 'Search, group, and maintain team member ownership.',
    memberName: 'Member name',
    addMember: 'Add member',
    updateMember: 'Update member',
    editingMember: 'Editing member',
    cancelEdit: 'Cancel edit',
    edit: 'Edit',
    role: 'Role',
    group: 'Group',
    visible: 'Visible',
    search: 'Search',
    searchMembers: 'Search members',
    searchTasks: 'Search tasks',
    searchIntel: 'Search intel',
    searchRuns: 'Search runs',
    searchPrep: 'Search prep',
    allOwners: 'All owners',
    allStatuses: 'All statuses',
    allPriorities: 'All priorities',
    allCategories: 'All categories',
    allHealth: 'All health',
    allPrepStatuses: 'All prep statuses',
    prepIncomplete: 'Incomplete',
    prepComplete: 'Complete',
    clearFilters: 'Clear filters',
    activeFilters: 'Active filters',
    noActiveFilters: 'No active filters',
    removeFilter: 'Remove filter',
    ownerNotInMembers: 'Owner not in members',
    highNoDue: 'High with no due date',
    sort: 'Sort',
    sortDueAsc: 'Due soonest',
    sortDueDesc: 'Due latest',
    sortPriority: 'Priority',
    sortStatus: 'Status',
    sortOwner: 'Owner',
    sortNewest: 'Newest',
    sortOldest: 'Oldest',
    sortTitle: 'Title',
    sortName: 'Name',
    sortRole: 'Role',
    sortGroup: 'Group',
    sortOpenTasks: 'Open tasks',
    sortScoreHigh: 'Score high',
    sortScoreLow: 'Score low',
    sortDurationShort: 'Duration short',
    sortDurationLong: 'Duration long',
    allRoles: 'All roles',
    allGroups: 'All groups',
    roleView: 'Role View',
    noMembersYet: 'No members yet.',
    noMatchingMembers: 'No members match the current filters.',
    handoffCards: 'Handoff Cards',
    noOpenTasks: 'No open tasks.',
    moreTasks: 'more tasks',
    missionRuns: 'Mission runs',
    healthIssues: 'Health issues',
    dataHealth: 'Data Health',
    noHealthIssues: 'No health issues found.',
    settingsCenter: 'Settings Center',
    settingsSummary: 'Local-first controls for master data, QA, and migration packs.',
    productionFallback: 'Production remains in ../ROV_Task_Manager_v15.html.',
    smokeTest: 'Smoke Test',
    dbRead: 'DB Read',
    schema: 'Schema',
    syncPreview: 'Sync Preview',
    writeSync: 'Write Sync',
    audit: 'Audit',
    rollback: 'Rollback',
    v15Import: 'v15 Import',
    settingsPack: 'Settings Pack',
    taskSummary: 'Plan, assign, and close ROV work items.',
    task: 'Task',
    owner: 'Owner',
    due: 'Due',
    priority: 'Priority',
    status: 'Status',
    category: 'Category',
    blocked: 'Blocked',
    addTask: 'Add task',
    updateTask: 'Update task',
    editingTask: 'Editing task',
    delete: 'Delete',
    confirmDelete: 'Delete this item?',
    noTasksYet: 'No tasks yet.',
    noMatchingTasks: 'No tasks match the current filters.',
    overdue: 'Overdue',
    prepCenter: 'Prep Center',
    prepSummary: 'Daily readiness, checklist, and pre-dive control.',
    prepFocus: 'Prep focus',
    clearFocus: 'Clear focus',
    tasksOpen: 'Tasks open',
    checklist: 'Checklist',
    addItem: 'Add item',
    newChecklistItem: 'New checklist item',
    updateChecklistItem: 'Update item',
    editingChecklistItem: 'Editing checklist item',
    preDive: 'Pre-dive',
    gearItems: 'Gear items',
    gearName: 'Gear name',
    updateGear: 'Update gear',
    editingGear: 'Editing gear',
    qty: 'Qty',
    noGearYet: 'No gear items yet.',
    buildChecklist: 'Build Checklist',
    preDiveChecklist: 'Pre-Dive Checklist',
    competitionSummary: 'Mission timer, quick score, and run history.',
    start: 'Start',
    pause: 'Pause',
    reset: 'Reset',
    saveRun: 'Save run',
    updateRun: 'Update run',
    editingRun: 'Editing run',
    score: 'Score',
    note: 'Note',
    runHistory: 'Run History',
    noMissionRunsYet: 'No mission runs yet.',
    noMatchingRuns: 'No mission runs match the current filters.',
    exportDiagnostics: 'Export Diagnostics',
    importDiagnostics: 'Import Diagnostics',
    diagnosticsHint: 'Download a JSON bundle with smoke, DB, schema, sync, audit, and data health status.',
    diagnosticsViewer: 'Diagnostics Viewer',
    noDiagnosticsImported: 'No diagnostics imported in this session.',
    overview: 'Overview',
    overviewHint: 'Start with red cards, then export a pack when the setup is ready.',
    releaseReadiness: 'v16 Release Readiness',
    releaseReadinessHint: 'Quick handoff checklist based on the current local session.',
    exportHandoffReport: 'Export Handoff Report',
    healthy: 'Healthy',
    check: 'Check',
    dataStatus: 'Data Status',
    supabaseReadOnly: 'Supabase Read-Only',
    supabaseReadOnlyHint: 'Loads production DB data into v16 local state without writing to Supabase.',
    loadFromSupabase: 'Load from Supabase',
    notLoadedYet: 'Not loaded yet. This action is read-only.',
    supabaseSchemaProbe: 'Supabase Schema Probe',
    schemaProbeHint: 'Read-only column probe using select(column).limit(1). No data writes.',
    probeSchema: 'Probe Schema',
    noSchemaProbe: 'No schema probe yet.',
    existing: 'Existing',
    missingBlocked: 'Missing / blocked',
    supabaseSyncPreview: 'Supabase Sync Preview',
    syncPreviewHint: 'Dry-run only. It compares v16 local state with the last read-only DB load and performs no writes.',
    buildPreview: 'Build Preview',
    noPreviewYet: 'No preview yet. Load Supabase read-only first, then build preview.',
    guardedWriteSync: 'Guarded Write Sync',
    guardedWriteHint: 'Manual create/update only. Deletes are disabled. Payloads are filtered through a schema whitelist before writing.',
    confirmation: 'Confirmation',
    executeGuardedWriteSync: 'Execute Guarded Write Sync',
    noWriteSyncYet: 'No write sync executed yet.',
    postWriteVerification: 'Post-write verification',
    writeAuditLog: 'Write Audit Log',
    writeAuditHint: 'Recent guarded write attempts saved locally. Latest 20 entries are kept.',
    noAuditEntries: 'No guarded write audit entries yet.',
    rollbackFromBackup: 'Rollback From v16 Backup',
    rollbackHint: 'Restore v16 local state from a rov_v16_local_backup JSON. This does not write to Supabase.',
    exportV16Backup: 'Export v16 Backup',
    restoreV16Backup: 'Restore v16 Backup',
    noRollbackYet: 'No rollback performed in this session.',
    resetLocalData: 'Reset v16 Local Data',
    resetLocalDataHint: 'Downloads a v16 backup, clears v16 localStorage data, then reloads with demo defaults. Supabase is not touched.',
    resetLocalDataPrompt: 'This will download a backup, clear v16 local data, and reload. Type',
    v15BackupImport: 'v15 Backup Import',
    v15BackupImportHint: 'Import a JSON backup exported from v15 system health. This replaces v16 local data with normalized v15 data.',
    importV15Backup: 'Import v15 Backup',
    noV15ImportYet: 'No v15 backup imported in this session.',
    exportPack: 'Export Pack',
    importPack: 'Import Pack',
  },
  zh: {
    appTitle: 'ROV \u4efb\u52d9\u7ba1\u7406 v16',
    dashboard: '\u7e3d\u89bd',
    prep: '\u5099\u6230',
    tasks: '\u4efb\u52d9',
    competition: '\u6bd4\u8cfd',
    settings: '\u8a2d\u7f6e',
    dashboardSummary: 'v16 \u5df2\u662f\u53ef\u7368\u7acb\u904b\u4f5c\u7684\u672c\u6a5f\u512a\u5148\u7248\u672c\uff0cv15 \u4ecd\u4fdd\u6301\u4e0d\u52d5\u3002',
    actionSummary: '\u884c\u52d5\u6458\u8981',
    prepReadiness: '\u5099\u6230\u6e96\u5099\u5ea6',
    intelReadiness: '\u60c5\u5831\u6e96\u5099\u5ea6',
    intelReady: '\u60c5\u5831\u5df2\u6e96\u5099\u5b8c\u6210\u3002',
    latestRun: '\u6700\u65b0 Run',
    bestScore: '\u6700\u4f73\u5206\u6578',
    avgScore: '\u5e73\u5747\u5206\u6578',
    openIntel: '\u958b\u555f\u60c5\u5831',
    open: '\u958b\u555f',
    noActionItems: '\u6c92\u6709\u5f85\u8655\u7406\u9805\u76ee\u3002',
    memberWorkload: '\u968a\u54e1\u5de5\u4f5c\u8ca0\u8f09',
    noMemberWorkload: '\u6c92\u6709\u9032\u884c\u4e2d\u7684\u968a\u54e1\u5de5\u4f5c\u8ca0\u8f09\u3002',
    unassignedTasks: '\u672a\u6307\u6d3e\u4efb\u52d9',
    noUnassignedTasks: '\u6c92\u6709\u672a\u6307\u6d3e\u4efb\u52d9\u3002',
    assign: '\u6307\u6d3e',
    weekFocus: '\u672c\u9031\u7126\u9ede',
    noWeekFocus: '\u6c92\u6709\u7dca\u6025\u6216\u672c\u9031\u5230\u671f\u4efb\u52d9\u3002',
    prepReady: '\u5099\u6230\u5df2\u6e96\u5099\u5b8c\u6210\u3002',
    season: '\u8cfd\u5b63',
    page: '\u9801\u9762',
    addTasks: '\u65b0\u589e\u4efb\u52d9',
    missionRun: 'Mission Run',
    openTasks: '\u672a\u5b8c\u6210\u4efb\u52d9',
    members: '\u968a\u54e1',
    intel: '\u60c5\u5831',
    intelSummary: '\u5718\u968a\u7b46\u8a18\u3001\u60c5\u5831\u8207\u7b56\u7565\u9805\u76ee\u3002',
    intelFocus: '\u60c5\u5831\u7126\u9ede',
    teamNotes: '\u5718\u968a\u7b46\u8a18',
    notes: '\u7b46\u8a18',
    saveNotes: '\u5132\u5b58\u7b46\u8a18',
    strategy: '\u7b56\u7565',
    title: '\u6a19\u984c',
    content: '\u5167\u5bb9',
    updateItem: '\u66f4\u65b0\u9805\u76ee',
    editingItem: '\u6b63\u5728\u7de8\u8f2f\u9805\u76ee',
    untitledItem: '\u672a\u547d\u540d\u9805\u76ee',
    item: '\u9805\u76ee',
    noItemsYet: '\u5c1a\u672a\u6709\u9805\u76ee\u3002',
    noMatchingItems: '\u76ee\u524d\u6c92\u6709\u7b26\u5408\u7be9\u9078\u7684\u9805\u76ee\u3002',
    membersSummary: '\u641c\u5c0b\u3001\u5206\u7d44\u8207\u7dad\u8b77\u968a\u54e1\u8cac\u4efb\u5206\u914d\u3002',
    memberName: '\u968a\u54e1\u59d3\u540d',
    addMember: '\u65b0\u589e\u968a\u54e1',
    updateMember: '\u66f4\u65b0\u968a\u54e1',
    editingMember: '\u6b63\u5728\u7de8\u8f2f\u968a\u54e1',
    cancelEdit: '\u53d6\u6d88\u7de8\u8f2f',
    edit: '\u7de8\u8f2f',
    role: '\u89d2\u8272',
    group: '\u7d44\u5225',
    visible: '\u986f\u793a',
    search: '\u641c\u5c0b',
    searchMembers: '\u641c\u5c0b\u968a\u54e1',
    searchTasks: '\u641c\u5c0b\u4efb\u52d9',
    searchIntel: '\u641c\u5c0b\u60c5\u5831',
    searchRuns: '\u641c\u5c0b\u8a18\u9304',
    searchPrep: '\u641c\u5c0b\u5099\u6230',
    allOwners: '\u5168\u90e8\u8ca0\u8cac\u4eba',
    allStatuses: '\u5168\u90e8\u72c0\u614b',
    allPriorities: '\u5168\u90e8\u512a\u5148\u7d1a',
    allCategories: '\u5168\u90e8\u5206\u985e',
    allHealth: '\u5168\u90e8\u5065\u5eb7\u72c0\u614b',
    allPrepStatuses: '\u5168\u90e8\u5099\u6230\u72c0\u614b',
    prepIncomplete: '\u672a\u5b8c\u6210',
    prepComplete: '\u5df2\u5b8c\u6210',
    clearFilters: '\u6e05\u9664\u7be9\u9078',
    activeFilters: '\u76ee\u524d\u7be9\u9078',
    noActiveFilters: '\u672a\u5957\u7528\u7be9\u9078',
    removeFilter: '\u79fb\u9664\u7be9\u9078',
    ownerNotInMembers: '\u8ca0\u8cac\u4eba\u4e0d\u5728\u968a\u54e1\u540d\u55ae',
    highNoDue: 'High \u4e14\u672a\u8a2d\u622a\u6b62\u65e5',
    sort: '\u6392\u5e8f',
    sortDueAsc: '\u6700\u8fd1\u622a\u6b62',
    sortDueDesc: '\u6700\u665a\u622a\u6b62',
    sortPriority: '\u512a\u5148\u7d1a',
    sortStatus: '\u72c0\u614b',
    sortOwner: '\u8ca0\u8cac\u4eba',
    sortNewest: '\u6700\u65b0',
    sortOldest: '\u6700\u65e7',
    sortTitle: '\u6a19\u984c',
    sortName: '\u59d3\u540d',
    sortRole: '\u89d2\u8272',
    sortGroup: '\u7d44\u5225',
    sortOpenTasks: '\u672a\u5b8c\u6210\u4efb\u52d9',
    sortScoreHigh: '\u5206\u6578\u9ad8',
    sortScoreLow: '\u5206\u6578\u4f4e',
    sortDurationShort: '\u6642\u9593\u77ed',
    sortDurationLong: '\u6642\u9593\u9577',
    allRoles: '\u5168\u90e8\u89d2\u8272',
    allGroups: '\u5168\u90e8\u7d44\u5225',
    roleView: '\u89d2\u8272\u8996\u5716',
    noMembersYet: '\u5c1a\u672a\u6709\u968a\u54e1\u3002',
    noMatchingMembers: '\u76ee\u524d\u6c92\u6709\u7b26\u5408\u7be9\u9078\u7684\u968a\u54e1\u3002',
    handoffCards: '\u4ea4\u63a5\u5361',
    noOpenTasks: '\u6c92\u6709\u672a\u5b8c\u6210\u4efb\u52d9\u3002',
    moreTasks: '\u66f4\u591a\u4efb\u52d9',
    missionRuns: 'Mission Run',
    healthIssues: '\u5065\u5eb7\u554f\u984c',
    dataHealth: '\u8cc7\u6599\u5065\u5eb7',
    noHealthIssues: '\u672a\u767c\u73fe\u8cc7\u6599\u5065\u5eb7\u554f\u984c\u3002',
    settingsCenter: '\u8a2d\u7f6e\u4e2d\u5fc3',
    settingsSummary: '\u672c\u6a5f\u512a\u5148\u7684\u4e3b\u8cc7\u6599\u3001QA \u8207\u9077\u79fb\u8a2d\u5b9a\u4e2d\u5fc3\u3002',
    productionFallback: '\u751f\u7522\u7248\u4ecd\u4fdd\u7559\u5728 ../ROV_Task_Manager_v15.html\u3002',
    smokeTest: 'Smoke Test',
    dbRead: 'DB \u53ea\u8b80',
    schema: '\u6b04\u4f4d\u63a2\u6e2c',
    syncPreview: '\u540c\u6b65\u9810\u89bd',
    writeSync: '\u5beb\u5165\u540c\u6b65',
    audit: '\u5be9\u8a08',
    rollback: '\u56de\u5fa9',
    v15Import: 'v15 \u532f\u5165',
    settingsPack: '\u8a2d\u5b9a\u5305',
    taskSummary: '\u898f\u5283\u3001\u5206\u914d\u8207\u5b8c\u6210 ROV \u4efb\u52d9\u3002',
    task: '\u4efb\u52d9',
    owner: '\u8ca0\u8cac\u4eba',
    due: '\u622a\u6b62\u65e5',
    priority: '\u512a\u5148\u7d1a',
    status: '\u72c0\u614b',
    category: '\u5206\u985e',
    blocked: '\u963b\u585e',
    addTask: '\u65b0\u589e\u4efb\u52d9',
    updateTask: '\u66f4\u65b0\u4efb\u52d9',
    editingTask: '\u6b63\u5728\u7de8\u8f2f\u4efb\u52d9',
    delete: '\u522a\u9664',
    confirmDelete: '\u78ba\u5b9a\u8981\u522a\u9664\u9019\u500b\u9805\u76ee\uff1f',
    noTasksYet: '\u5c1a\u672a\u6709\u4efb\u52d9\u3002',
    noMatchingTasks: '\u76ee\u524d\u6c92\u6709\u7b26\u5408\u7be9\u9078\u7684\u4efb\u52d9\u3002',
    overdue: '\u903e\u671f',
    prepCenter: '\u5099\u6230\u4e2d\u5fc3',
    prepSummary: '\u6bcf\u65e5\u6e96\u5099\u5ea6\u3001checklist \u8207 pre-dive \u63a7\u5236\u3002',
    prepFocus: '\u5099\u6230\u7126\u9ede',
    clearFocus: '\u6e05\u9664\u7126\u9ede',
    tasksOpen: '\u672a\u5b8c\u6210\u4efb\u52d9',
    checklist: 'Checklist',
    addItem: '\u65b0\u589e\u9805\u76ee',
    newChecklistItem: '\u65b0 Checklist \u9805\u76ee',
    updateChecklistItem: '\u66f4\u65b0\u9805\u76ee',
    editingChecklistItem: '\u6b63\u5728\u7de8\u8f2f Checklist \u9805\u76ee',
    preDive: 'Pre-Dive',
    gearItems: '\u7269\u8cc7\u9805\u76ee',
    gearName: '\u7269\u8cc7\u540d\u7a31',
    updateGear: '\u66f4\u65b0\u7269\u8cc7',
    editingGear: '\u6b63\u5728\u7de8\u8f2f\u7269\u8cc7',
    qty: '\u6578\u91cf',
    noGearYet: '\u5c1a\u672a\u6709\u7269\u8cc7\u9805\u76ee\u3002',
    buildChecklist: '\u7d44\u88dd Checklist',
    preDiveChecklist: 'Pre-Dive Checklist',
    competitionSummary: 'Mission \u8a08\u6642\u3001\u5feb\u901f\u5206\u6578\u8207 run \u7d00\u9304\u3002',
    start: '\u958b\u59cb',
    pause: '\u66ab\u505c',
    reset: '\u91cd\u7f6e',
    saveRun: '\u5132\u5b58 Run',
    updateRun: '\u66f4\u65b0 Run',
    editingRun: '\u6b63\u5728\u7de8\u8f2f Run',
    score: '\u5206\u6578',
    note: '\u5099\u8a3b',
    runHistory: 'Run \u7d00\u9304',
    noMissionRunsYet: '\u5c1a\u672a\u6709 Mission Run \u7d00\u9304\u3002',
    noMatchingRuns: '\u76ee\u524d\u6c92\u6709\u7b26\u5408\u7be9\u9078\u7684 Run \u7d00\u9304\u3002',
    exportDiagnostics: '\u532f\u51fa\u8a3a\u65b7\u5305',
    importDiagnostics: '\u532f\u5165\u8a3a\u65b7\u5305',
    diagnosticsHint: '\u4e0b\u8f09\u5305\u542b smoke\u3001DB\u3001schema\u3001sync\u3001audit \u8207\u8cc7\u6599\u5065\u5eb7\u72c0\u614b\u7684 JSON\u3002',
    diagnosticsViewer: '\u8a3a\u65b7\u5305\u6aa2\u8996',
    noDiagnosticsImported: '\u672c\u6b21\u5c1a\u672a\u532f\u5165\u8a3a\u65b7\u5305\u3002',
    overview: '\u7e3d\u89bd',
    overviewHint: '\u5148\u8655\u7406\u7d05\u8272\u5361\u7247\uff0c\u8a2d\u5b9a\u6e96\u5099\u597d\u5f8c\u518d\u532f\u51fa\u8a2d\u5b9a\u5305\u3002',
    releaseReadiness: 'v16 \u4ea4\u4ed8\u6e96\u5099\u5ea6',
    releaseReadinessHint: '\u6839\u64da\u76ee\u524d\u672c\u6a5f session \u7522\u751f\u7684\u5feb\u901f\u4ea4\u4ed8 checklist\u3002',
    exportHandoffReport: '\u532f\u51fa\u4ea4\u4ed8\u5831\u544a',
    healthy: '\u6b63\u5e38',
    check: '\u9700\u6aa2\u67e5',
    dataStatus: '\u8cc7\u6599\u72c0\u614b',
    supabaseReadOnly: 'Supabase \u53ea\u8b80',
    supabaseReadOnlyHint: '\u5c07\u751f\u7522 DB \u8cc7\u6599\u8b80\u5165 v16 \u672c\u6a5f\u72c0\u614b\uff0c\u4e0d\u5beb\u5165 Supabase\u3002',
    loadFromSupabase: '\u5f9e Supabase \u8b80\u53d6',
    notLoadedYet: '\u5c1a\u672a\u8b80\u53d6\u3002\u6b64\u64cd\u4f5c\u70ba\u53ea\u8b80\u3002',
    supabaseSchemaProbe: 'Supabase \u6b04\u4f4d\u63a2\u6e2c',
    schemaProbeHint: '\u4f7f\u7528 select(column).limit(1) \u9032\u884c\u53ea\u8b80\u6b04\u4f4d\u63a2\u6e2c\uff0c\u4e0d\u5beb\u5165\u8cc7\u6599\u3002',
    probeSchema: '\u63a2\u6e2c\u6b04\u4f4d',
    noSchemaProbe: '\u5c1a\u672a\u9032\u884c\u6b04\u4f4d\u63a2\u6e2c\u3002',
    existing: '\u5b58\u5728',
    missingBlocked: '\u7f3a\u5c11 / \u88ab\u963b\u64cb',
    supabaseSyncPreview: 'Supabase \u540c\u6b65\u9810\u89bd',
    syncPreviewHint: '\u50c5 dry-run\u3002\u6bd4\u8f03 v16 \u672c\u6a5f\u72c0\u614b\u8207\u6700\u5f8c\u4e00\u6b21\u53ea\u8b80 DB \u8cc7\u6599\uff0c\u4e0d\u5beb\u5165\u3002',
    buildPreview: '\u5efa\u7acb\u9810\u89bd',
    noPreviewYet: '\u5c1a\u672a\u6709\u9810\u89bd\u3002\u8acb\u5148\u53ea\u8b80\u8f09\u5165 Supabase\uff0c\u518d\u5efa\u7acb\u9810\u89bd\u3002',
    guardedWriteSync: '\u53d7\u4fdd\u8b77\u5beb\u5165\u540c\u6b65',
    guardedWriteHint: '\u50c5\u624b\u52d5 create/update\u3002\u522a\u9664\u5df2\u7981\u7528\uff0cpayload \u6703\u5148\u7d93\u904e schema \u767d\u540d\u55ae\u904e\u6ffe\u3002',
    confirmation: '\u78ba\u8a8d\u5b57\u4e32',
    executeGuardedWriteSync: '\u57f7\u884c\u53d7\u4fdd\u8b77\u5beb\u5165\u540c\u6b65',
    noWriteSyncYet: '\u5c1a\u672a\u57f7\u884c\u5beb\u5165\u540c\u6b65\u3002',
    postWriteVerification: '\u5beb\u5165\u5f8c\u9a57\u8b49',
    writeAuditLog: '\u5beb\u5165\u5be9\u8a08\u8a18\u9304',
    writeAuditHint: '\u672c\u6a5f\u4fdd\u5b58\u6700\u8fd1\u7684\u53d7\u4fdd\u8b77\u5beb\u5165\u64cd\u4f5c\uff0c\u6700\u591a\u4fdd\u7559 20 \u7b46\u3002',
    noAuditEntries: '\u5c1a\u672a\u6709\u5beb\u5165\u5be9\u8a08\u8a18\u9304\u3002',
    rollbackFromBackup: '\u5f9e v16 \u5099\u4efd\u56de\u5fa9',
    rollbackHint: '\u5f9e rov_v16_local_backup JSON \u56de\u5fa9 v16 \u672c\u6a5f\u72c0\u614b\u3002\u6b64\u64cd\u4f5c\u4e0d\u5beb\u5165 Supabase\u3002',
    exportV16Backup: '\u532f\u51fa v16 \u5099\u4efd',
    restoreV16Backup: '\u56de\u5fa9 v16 \u5099\u4efd',
    noRollbackYet: '\u672c\u6b21\u5c1a\u672a\u9032\u884c\u56de\u5fa9\u3002',
    resetLocalData: '\u91cd\u7f6e v16 \u672c\u6a5f\u8cc7\u6599',
    resetLocalDataHint: '\u5148\u4e0b\u8f09 v16 \u5099\u4efd\uff0c\u518d\u6e05\u9664 v16 localStorage \u8cc7\u6599\u4e26\u91cd\u8f09\u9810\u8a2d\u793a\u7bc4\u72c0\u614b\u3002\u4e0d\u6703\u5f71\u97ff Supabase\u3002',
    resetLocalDataPrompt: '\u6b64\u64cd\u4f5c\u6703\u5148\u4e0b\u8f09\u5099\u4efd\uff0c\u518d\u6e05\u9664 v16 \u672c\u6a5f\u8cc7\u6599\u4e26\u91cd\u8f09\u3002\u8acb\u8f38\u5165',
    v15BackupImport: 'v15 \u5099\u4efd\u532f\u5165',
    v15BackupImportHint: '\u532f\u5165 v15 \u7cfb\u7d71\u5065\u5eb7\u532f\u51fa\u7684 JSON \u5099\u4efd\uff0c\u4e26\u7528\u6a19\u6e96\u5316\u5f8c\u7684 v15 \u8cc7\u6599\u53d6\u4ee3 v16 \u672c\u6a5f\u8cc7\u6599\u3002',
    importV15Backup: '\u532f\u5165 v15 \u5099\u4efd',
    noV15ImportYet: '\u672c\u6b21\u5c1a\u672a\u532f\u5165 v15 \u5099\u4efd\u3002',
    exportPack: '\u532f\u51fa\u8a2d\u5b9a\u5305',
    importPack: '\u532f\u5165\u8a2d\u5b9a\u5305',
  },
};

let currentLocale = localStorage.getItem(LOCALE_STORAGE_KEY) || 'zh';

function getLocale() {
  return currentLocale;
}

function setLocale(locale) {
  currentLocale = locale === 'en' ? 'en' : 'zh';
  localStorage.setItem(LOCALE_STORAGE_KEY, currentLocale);
  return currentLocale;
}

function t(key) {
  return STRINGS[currentLocale]?.[key] || STRINGS.en[key] || key;
}

return { getLocale, setLocale, t, LOCALE_STORAGE_KEY };
})();

const __src_utils_index_js = { ...__src_utils_date_js, ...__src_utils_dom_js };

const __src_data_state_js = (() => {
const { DEFAULT_STATE } = __src_data_defaults_js;
const { safeJsonParse } = __src_utils_index_js;
const APP_STATE_STORAGE_KEY = 'rov_v16_app_state';

function createInitialState() {
  return {
    data: structuredClone(DEFAULT_STATE),
    currentPage: 'dashboard',
    currentMode: 'review',
    currentSeason: '2025-2026',
    dirtyFlags: {},
  };
}

function loadAppState(storage = localStorage) {
  const state = createInitialState();
  const saved = safeJsonParse(storage.getItem(APP_STATE_STORAGE_KEY), null);
  if (!saved?.data) return state;
  return {
    ...state,
    ...saved,
    data: {
      ...state.data,
      ...saved.data,
      masterData: {
        ...state.data.masterData,
        ...(saved.data.masterData || {}),
      },
    },
    dirtyFlags: {},
  };
}

function saveAppState(state, storage = localStorage) {
  storage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify({
    data: state.data,
    currentPage: state.currentPage,
    currentMode: state.currentMode,
    currentSeason: state.currentSeason,
    savedAt: new Date().toISOString(),
  }));
  state.dirtyFlags = {};
}

return { createInitialState, loadAppState, saveAppState, APP_STATE_STORAGE_KEY };
})();

const __src_data_migration_js = (() => {
const { DEFAULT_STATE } = __src_data_defaults_js;
const V15_BACKUP_TYPE = 'rov_task_manager_backup';

function normalizeArray(value, fallback = []) {
  return Array.isArray(value) ? value : fallback;
}

function normalizeTask(task, index) {
  return {
    id: Number(task.id || index + 1),
    name: String(task.name || task.title || `Task ${index + 1}`),
    owner: String(task.owner || task.assignee || 'Unassigned'),
    due: String(task.due || task.deadline || ''),
    priority: String(task.priority || task.prio || 'Medium'),
    status: String(task.status || (task.done ? 'Done' : 'Open')),
    category: String(task.category || task.cat || 'General'),
    blocked: Boolean(task.blocked || task.isBlocked),
    notes: String(task.notes || task.note || ''),
  };
}

function normalizeMember(member, index) {
  return {
    id: Number(member.id || index + 1),
    name: String(member.name || member.member || `Member ${index + 1}`),
    role: String(member.role || ''),
    group: String(member.group || member.team || ''),
  };
}

function normalizeChecklistItem(item, index) {
  return {
    id: Number(item.id || index + 1),
    label: String(item.label || item.name || item.text || `Item ${index + 1}`),
    done: Boolean(item.done || item.checked),
  };
}

function normalizeGearItem(item, index) {
  return {
    id: Number(item.id || index + 1),
    name: String(item.name || item.item || `Gear ${index + 1}`),
    category: String(item.category || item.cat || 'Gear'),
    qty: Number(item.qty || item.quantity || 1),
    packed: Boolean(item.packed || item.done),
  };
}

function normalizeMissionRun(run, index) {
  return {
    id: Number(run.id || index + 1),
    ts: String(run.ts || run.createdAt || run.date || new Date().toISOString()),
    elapsedSeconds: Number(run.elapsedSeconds || run.seconds || run.duration || 0),
    score: Number(run.score || run.total || 0),
    note: String(run.note || run.notes || run.summary || ''),
  };
}

function summarizeV15Backup(payload) {
  const state = payload?.state || {};
  return {
    tasks: normalizeArray(state.tasks).length,
    members: normalizeArray(state.members).length,
    checklist: normalizeArray(state.checklist).length,
    prediveChecklist: normalizeArray(state.prediveChecklist).length,
    missionRuns: normalizeArray(state.missionRuns).length,
    gearItems: normalizeArray(state.gearItems).length,
    presentationRuns: normalizeArray(state.presentationRuns).length,
    season: payload?.season || '',
    exportedAt: payload?.exportedAt || '',
  };
}

function importV15BackupPayload(appState, payload) {
  if (!payload || payload.type !== V15_BACKUP_TYPE || !payload.state) {
    throw new Error('Not a v15 ROV backup');
  }

  const source = payload.state;
  appState.currentSeason = payload.season || appState.currentSeason;
  appState.data = {
    ...DEFAULT_STATE,
    ...appState.data,
    tasks: normalizeArray(source.tasks).map(normalizeTask),
    members: normalizeArray(source.members).map(normalizeMember),
    checklist: normalizeArray(source.checklist, DEFAULT_STATE.checklist).map(normalizeChecklistItem),
    prediveChecklist: normalizeArray(source.prediveChecklist, DEFAULT_STATE.prediveChecklist).map(normalizeChecklistItem),
    intel: normalizeArray(source.intel),
    notes: String(source.notes || ''),
    strategy: normalizeArray(source.strategy),
    missionRuns: normalizeArray(source.missionRuns).map(normalizeMissionRun),
    gearItems: normalizeArray(source.gearItems).map(normalizeGearItem),
    presentationRuns: normalizeArray(source.presentationRuns),
    masterData: appState.data.masterData || DEFAULT_STATE.masterData,
  };
  appState.dirtyFlags.v15Import = true;
  return summarizeV15Backup(payload);
}

return { summarizeV15Backup, importV15BackupPayload, V15_BACKUP_TYPE };
})();

const __src_data_diagnostics_js = (() => {

function buildDiagnosticsPayload({
  appState,
  smokeLog = [],
  writeAuditLog = [],
  dbStatus = null,
  schemaStatus = null,
  syncPreview = null,
  postWritePreview = null,
  migrationSummary = null,
  rollbackSummary = null,
  healthIssues = [],
} = {}) {
  const data = appState?.data || {};
  return {
    type: 'rov_v16_diagnostics',
    version: 1,
    exportedAt: new Date().toISOString(),
    season: appState?.currentSeason || 'default',
    currentPage: appState?.currentPage || 'dashboard',
    counts: {
      tasks: data.tasks?.length || 0,
      members: data.members?.length || 0,
      checklist: data.checklist?.length || 0,
      prediveChecklist: data.prediveChecklist?.length || 0,
      missionRuns: data.missionRuns?.length || 0,
      gearItems: data.gearItems?.length || 0,
      healthIssues: healthIssues.length,
      smokeRuns: smokeLog.length,
      writeAuditEntries: writeAuditLog.length,
    },
    latestSmoke: smokeLog[0] || null,
    smokeLog: smokeLog.slice(0, 10),
    healthIssues,
    dbStatus,
    schemaStatus,
    syncPreview,
    postWritePreview,
    migrationSummary,
    rollbackSummary,
    writeAuditLog: writeAuditLog.slice(0, 20),
  };
}

function downloadDiagnosticsPayload(payload, documentRef = document) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = documentRef.createElement('a');
  link.href = url;
  link.download = `rov-v16-diagnostics-${payload.season || 'default'}-${new Date().toISOString().slice(0, 10)}.json`;
  documentRef.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function parseDiagnosticsPayload(payload) {
  if (!payload || payload.type !== 'rov_v16_diagnostics') {
    throw new Error('Not a v16 diagnostics payload');
  }
  const summarizeSync = (preview) => preview ? {
    totalCreate: preview.totalCreate || 0,
    totalUpdate: preview.totalUpdate || 0,
    totalRemove: preview.totalRemove || 0,
    tables: (preview.tables || []).map(table => ({
      label: table.label,
      local: table.local || 0,
      remote: table.remote || 0,
      create: table.create || 0,
      update: table.update || 0,
      remove: table.remove || 0,
    })),
  } : null;
  return {
    importedAt: new Date().toISOString(),
    exportedAt: payload.exportedAt || '',
    season: payload.season || '',
    currentPage: payload.currentPage || '',
    counts: payload.counts || {},
    latestSmokeOk: payload.latestSmoke?.ok ?? null,
    smokeRuns: payload.smokeLog?.length || 0,
    healthIssues: payload.healthIssues?.length || 0,
    writeAuditEntries: payload.writeAuditLog?.length || 0,
    dbLoadedAt: payload.dbStatus?.loadedAt || '',
    schemaProbedAt: payload.schemaStatus?.ts || '',
    latestSmoke: payload.latestSmoke || null,
    smokeLog: (payload.smokeLog || []).slice(0, 5),
    healthRows: (payload.healthIssues || []).slice(0, 10),
    dbTables: payload.dbStatus?.tables || {},
    schemaTables: payload.schemaStatus?.tables || {},
    syncPreview: summarizeSync(payload.syncPreview),
    postWritePreview: summarizeSync(payload.postWritePreview),
    writeAuditLog: (payload.writeAuditLog || []).slice(0, 8),
  };
}

return { buildDiagnosticsPayload, downloadDiagnosticsPayload, parseDiagnosticsPayload };
})();

const __src_data_supabase_js = (() => {

const SUPABASE_URL = 'https://funahmlcriyrpqelefah.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6ImZ1bmFobWxjcml5cnBxZWxlZmFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MTQ5MjQsImV4cCI6MjA5MzA5MDkyNH0.G6de9ZXI4s-AkyzW5poQwwZEVaoUJvw17cXFj90FP88';
const SUPABASE_CDN_URL = 'https://unpkg.com/@supabase/supabase-js@2';
let supabaseLoadPromise = null;

const DB_TABLES = [
  'tasks',
  'members',
  'checklist_items',
  'predive_checklist_items',
  'intel',
  'notes',
  'strategy_items',
  'mission_runs',
];

const SCHEMA_PROBE_COLUMNS = {
  tasks: ['id', 'name', 'owner', 'due', 'priority', 'status', 'cat', 'category', 'depends_on', 'sort_order'],
  members: ['id', 'name', 'role', 'group', 'team'],
  checklist_items: ['id', 'item_id', 'label', 'name', 'done', 'order_index'],
  predive_checklist_items: ['id', 'item_id', 'label', 'name', 'done', 'order_index'],
  intel: ['id', 'title', 'content', 'status', 'created_at'],
  notes: ['id', 'content'],
  strategy_items: ['id', 'title', 'content', 'status', 'order_index'],
  mission_runs: ['id', 'score', 'total_score', 'elapsed_seconds', 'seconds', 'note', 'notes', 'created_at', 'run_date'],
};

function createSupabaseClient({ supabaseLib = window.supabase, url = SUPABASE_URL, key = SUPABASE_KEY } = {}) {
  if (!supabaseLib || !url || !key) return null;
  return supabaseLib.createClient(url, key);
}

async function ensureSupabaseClient({ url = SUPABASE_URL, key = SUPABASE_KEY } = {}) {
  if (typeof window === 'undefined') return null;
  if (!window.supabase) {
    if (!supabaseLoadPromise) supabaseLoadPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector('script[data-supabase-sdk]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(window.supabase), { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Supabase SDK failed to load')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = SUPABASE_CDN_URL;
      script.async = true;
      script.dataset.supabaseSdk = 'true';
      script.onload = () => resolve(window.supabase);
      script.onerror = () => reject(new Error('Supabase SDK failed to load'));
      document.head.append(script);
    });
    await supabaseLoadPromise;
  }
  return createSupabaseClient({ supabaseLib: window.supabase, url, key });
}

function normalizeTask(row, index) {
  return {
    id: Number(row.id || index + 1),
    name: String(row.name || row.title || `Task ${index + 1}`),
    owner: String(row.owner || 'Unassigned'),
    due: String(row.due || ''),
    priority: String(row.priority || 'Medium'),
    status: String(row.status || 'Open'),
    category: String(row.category || row.cat || 'General'),
    blocked: Boolean(row.blocked || row.depends_on),
    notes: String(row.notes || row.note || ''),
  };
}

function normalizeMember(row, index) {
  return {
    id: Number(row.id || index + 1),
    name: String(row.name || `Member ${index + 1}`),
    role: String(row.role || ''),
    group: String(row.group || row.team || ''),
  };
}

function normalizeChecklistItem(row, index) {
  return {
    id: Number(row.item_id || row.id || index + 1),
    label: String(row.label || row.name || row.text || `Item ${index + 1}`),
    done: Boolean(row.done),
  };
}

function normalizeMissionRun(row, index) {
  return {
    id: Number(row.id || index + 1),
    ts: String(row.ts || row.created_at || row.run_date || new Date().toISOString()),
    elapsedSeconds: Number(row.elapsed_seconds || row.elapsedSeconds || row.seconds || 0),
    score: Number(row.score || row.total_score || row.total || 0),
    note: String(row.note || row.notes || row.summary || ''),
  };
}

async function selectTable(client, table, orderColumn = null) {
  let query = client.from(table).select('*');
  if (orderColumn) query = query.order(orderColumn, { ascending: true });
  const { data, error } = await query;
  return { table, data: data || [], error };
}

async function loadSupabaseReadOnly(client = null) {
  if (!client) client = await ensureSupabaseClient();
  if (!client) throw new Error('Supabase client is unavailable');

  const startedAt = performance.now();
  const results = await Promise.allSettled([
    selectTable(client, 'tasks'),
    selectTable(client, 'members'),
    selectTable(client, 'checklist_items', 'order_index'),
    selectTable(client, 'predive_checklist_items', 'order_index'),
    selectTable(client, 'intel'),
    selectTable(client, 'notes'),
    selectTable(client, 'strategy_items'),
    selectTable(client, 'mission_runs'),
  ]);

  const tables = {};
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      tables[result.value.table] = {
        ok: !result.value.error,
        count: result.value.data.length,
        error: result.value.error?.message || '',
      };
    }
  });

  const get = table => (results.find(result => result.status === 'fulfilled' && result.value.table === table)?.value.data || []);
  return {
    loadedAt: new Date().toISOString(),
    loadMs: Math.round(performance.now() - startedAt),
    tables,
    data: {
      tasks: get('tasks').map(normalizeTask),
      members: get('members').map(normalizeMember),
      checklist: get('checklist_items').map(normalizeChecklistItem),
      prediveChecklist: get('predive_checklist_items').map(normalizeChecklistItem),
      intel: get('intel'),
      notes: String(get('notes')[0]?.content || ''),
      strategy: get('strategy_items'),
      missionRuns: get('mission_runs').map(normalizeMissionRun),
    },
  };
}

function applySupabaseReadOnlyData(appState, payload) {
  appState.data = {
    ...appState.data,
    ...payload.data,
  };
  appState.dirtyFlags.supabaseReadOnly = true;
}

async function probeSupabaseSchema(client = null, candidates = SCHEMA_PROBE_COLUMNS) {
  if (!client) client = await ensureSupabaseClient();
  if (!client) throw new Error('Supabase client is unavailable');
  const startedAt = performance.now();
  const tables = {};

  for (const [table, columns] of Object.entries(candidates)) {
    const existing = [];
    const missing = [];
    for (const column of columns) {
      const { error } = await client.from(table).select(column).limit(1);
      if (error) missing.push({ column, error: error.message || String(error) });
      else existing.push(column);
    }
    tables[table] = {
      existing,
      missing,
      coverage: columns.length ? Math.round((existing.length / columns.length) * 100) : 0,
    };
  }

  return {
    ts: new Date().toISOString(),
    probeMs: Math.round(performance.now() - startedAt),
    tables,
  };
}

return { createSupabaseClient, ensureSupabaseClient, loadSupabaseReadOnly, applySupabaseReadOnlyData, probeSupabaseSchema, SUPABASE_URL, SUPABASE_KEY, DB_TABLES, SCHEMA_PROBE_COLUMNS };
})();

const __src_data_sync_js = (() => {

const SYNC_TABLE_MAP = [
  { key: 'tasks', label: 'tasks' },
  { key: 'members', label: 'members' },
  { key: 'checklist', label: 'checklist_items' },
  { key: 'prediveChecklist', label: 'predive_checklist_items' },
  { key: 'missionRuns', label: 'mission_runs' },
];

const WRITE_CONFIRM_TEXT = 'SYNC V16';
const WRITE_TABLE_WHITELIST = ['tasks', 'members', 'checklist_items', 'predive_checklist_items'];
const WRITE_AUDIT_LOG_KEY = 'rov_v16_write_audit_log';
const WRITE_SCHEMA = {
  tasks: ['id', 'name', 'owner', 'due', 'priority', 'status', 'cat'],
  members: ['id', 'name', 'role'],
  checklist_items: ['item_id', 'label', 'done', 'order_index'],
  predive_checklist_items: ['item_id', 'label', 'done', 'order_index'],
};

function getId(row) {
  return String(row?.id ?? row?.item_id ?? '');
}

function comparable(row) {
  const copy = { ...(row || {}) };
  delete copy.created_at;
  delete copy.updated_at;
  return JSON.stringify(copy, Object.keys(copy).sort());
}

function diffFields(local = {}, remote = {}) {
  const ignored = new Set(['created_at', 'updated_at']);
  const keys = new Set([...Object.keys(local || {}), ...Object.keys(remote || {})]);
  return [...keys]
    .filter(key => !ignored.has(key))
    .filter(key => JSON.stringify(local?.[key] ?? null) !== JSON.stringify(remote?.[key] ?? null))
    .map(key => ({
      field: key,
      local: local?.[key] ?? null,
      remote: remote?.[key] ?? null,
    }));
}

function diffRows(localRows = [], remoteRows = []) {
  const remoteById = new Map(remoteRows.map(row => [getId(row), row]).filter(([id]) => id));
  const localById = new Map(localRows.map(row => [getId(row), row]).filter(([id]) => id));
  const create = [];
  const update = [];
  const remove = [];

  localById.forEach((local, id) => {
    const remote = remoteById.get(id);
    if (!remote) {
      create.push(local);
      return;
    }
    if (comparable(local) !== comparable(remote)) update.push(local);
  });

  remoteById.forEach((remote, id) => {
    if (!localById.has(id)) remove.push(remote);
  });

  return { create, update, remove };
}

function diffRowDetails(localRows = [], remoteRows = []) {
  const remoteById = new Map(remoteRows.map(row => [getId(row), row]).filter(([id]) => id));
  const localById = new Map(localRows.map(row => [getId(row), row]).filter(([id]) => id));
  const create = [];
  const update = [];
  const remove = [];

  localById.forEach((local, id) => {
    const remote = remoteById.get(id);
    if (!remote) {
      create.push({ id, label: local.name || local.label || local.note || id, row: local });
      return;
    }
    const fields = diffFields(local, remote);
    if (fields.length) update.push({ id, label: local.name || local.label || local.note || id, fields });
  });

  remoteById.forEach((remote, id) => {
    if (!localById.has(id)) remove.push({ id, label: remote.name || remote.label || remote.note || id, row: remote });
  });

  return { create, update, remove };
}

function toDbRows(table, rows = []) {
  if (table === 'tasks') {
    return rows.map((task, index) => ({
      id: Number(task.id || index + 1),
      name: task.name || 'Untitled task',
      owner: task.owner || 'Unassigned',
      due: task.due || null,
      priority: task.priority || 'Medium',
      status: task.status || 'Open',
      cat: task.category || task.cat || 'General',
    }));
  }
  if (table === 'members') {
    return rows.map((member, index) => ({
      id: Number(member.id || index + 1),
      name: member.name || `Member ${index + 1}`,
      role: member.role || '',
    }));
  }
  if (table === 'checklist_items' || table === 'predive_checklist_items') {
    return rows.map((item, index) => ({
      item_id: Number(item.id || item.item_id || index + 1),
      label: item.label || item.name || `Item ${index + 1}`,
      done: Boolean(item.done),
      order_index: index,
    }));
  }
  return [];
}

function getAllowedFields(table, schemaStatus = null) {
  const staticAllowed = WRITE_SCHEMA[table] || [];
  const probed = schemaStatus?.tables?.[table]?.existing;
  if (!Array.isArray(probed) || !probed.length) return staticAllowed;
  return staticAllowed.filter(field => probed.includes(field));
}

function filterRowForSchema(table, row, schemaStatus = null) {
  const allowed = getAllowedFields(table, schemaStatus);
  return Object.fromEntries(
    Object.entries(row || {}).filter(([key, value]) => allowed.includes(key) && value !== undefined),
  );
}

function validateRowsForSchema(table, rows = [], schemaStatus = null) {
  const allowed = getAllowedFields(table, schemaStatus);
  if (!allowed.length) {
    return [{ table, row: 0, field: '*', message: 'Table is not in write schema whitelist' }];
  }
  const violations = [];
  rows.forEach((row, rowIndex) => {
    Object.keys(row || {}).forEach((field) => {
      if (!allowed.includes(field)) {
        violations.push({ table, row: rowIndex, field, message: 'Field is not writable' });
      }
    });
  });
  return violations;
}

function buildSupabaseSyncPreview(appState, dbPayload) {
  if (!dbPayload?.data) {
    throw new Error('Load Supabase read-only data before building a sync preview');
  }

  const tables = SYNC_TABLE_MAP.map(({ key, label }) => {
    const diff = diffRows(appState.data[key] || [], dbPayload.data[key] || []);
    return {
      key,
      label,
      local: (appState.data[key] || []).length,
      remote: (dbPayload.data[key] || []).length,
      create: diff.create.length,
      update: diff.update.length,
      remove: diff.remove.length,
      details: diffRowDetails(appState.data[key] || [], dbPayload.data[key] || []),
    };
  });

  return {
    ts: new Date().toISOString(),
    mode: 'dry-run',
    writable: false,
    tables,
    totalCreate: tables.reduce((sum, table) => sum + table.create, 0),
    totalUpdate: tables.reduce((sum, table) => sum + table.update, 0),
    totalRemove: tables.reduce((sum, table) => sum + table.remove, 0),
  };
}

function buildLocalBackupPayload(appState) {
  return {
    type: 'rov_v16_local_backup',
    version: 1,
    exportedAt: new Date().toISOString(),
    season: appState?.currentSeason || 'default',
    data: appState?.data || {},
  };
}

function restoreLocalBackupPayload(appState, payload) {
  if (!payload || payload.type !== 'rov_v16_local_backup' || !payload.data) {
    throw new Error('Not a v16 local backup');
  }
  appState.currentSeason = payload.season || appState.currentSeason;
  appState.data = payload.data;
  appState.dirtyFlags.rollback = true;
  return {
    restoredAt: new Date().toISOString(),
    exportedAt: payload.exportedAt || '',
    season: payload.season || '',
    tasks: payload.data.tasks?.length || 0,
    members: payload.data.members?.length || 0,
    missionRuns: payload.data.missionRuns?.length || 0,
  };
}

function downloadLocalBackup(appState, documentRef = document) {
  const payload = buildLocalBackupPayload(appState);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = documentRef.createElement('a');
  link.href = url;
  link.download = `rov-v16-before-sync-${payload.season}-${new Date().toISOString().slice(0, 10)}.json`;
  documentRef.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return payload;
}

async function executeGuardedSupabaseWriteSync(client, appState, dbPayload, options = {}) {
  const {
    confirmText = '',
    tables = WRITE_TABLE_WHITELIST,
    allowDelete = false,
    schemaStatus = null,
  } = options;
  if (confirmText !== WRITE_CONFIRM_TEXT) {
    throw new Error(`Type ${WRITE_CONFIRM_TEXT} to enable guarded write sync`);
  }
  if (allowDelete) {
    throw new Error('Delete sync is disabled in v16 guarded write sync');
  }
  if (!client) throw new Error('Supabase client is unavailable');

  const preview = buildSupabaseSyncPreview(appState, dbPayload);
  const results = [];
  for (const table of preview.tables) {
    if (!tables.includes(table.label)) continue;
    const localRows = appState.data[table.key] || [];
    const remoteRows = dbPayload.data[table.key] || [];
    const diff = diffRows(localRows, remoteRows);
    const mappedRows = toDbRows(table.label, [...diff.create, ...diff.update]);
    const schemaViolations = validateRowsForSchema(table.label, mappedRows);
    if (schemaViolations.length) {
      results.push({
        table: table.label,
        ok: false,
        written: 0,
        skippedDelete: diff.remove.length,
        error: `Schema validation failed: ${schemaViolations.map(v => v.field).join(', ')}`,
      });
      continue;
    }
    const rows = mappedRows.map(row => filterRowForSchema(table.label, row, schemaStatus));
    const droppedFields = [...new Set(mappedRows.flatMap((row, index) => {
      const filtered = rows[index] || {};
      return Object.keys(row).filter(field => !(field in filtered));
    }))];
    if (!rows.length) {
      results.push({ table: table.label, ok: true, written: 0, skippedDelete: diff.remove.length, droppedFields });
      continue;
    }
    const conflict = table.label === 'checklist_items' || table.label === 'predive_checklist_items'
      ? 'item_id'
      : 'id';
    const { error } = await client.from(table.label).upsert(rows, { onConflict: conflict });
    results.push({
      table: table.label,
      ok: !error,
      written: error ? 0 : rows.length,
      skippedDelete: diff.remove.length,
      droppedFields,
      error: error?.message || '',
    });
  }

  return {
    ts: new Date().toISOString(),
    mode: 'guarded-write',
    allowDelete: false,
    results,
  };
}

function summarizeWriteResult(writeResult) {
  const results = writeResult?.results || [];
  return {
    ok: results.length > 0 && results.every(result => result.ok),
    tables: results.length,
    written: results.reduce((sum, result) => sum + Number(result.written || 0), 0),
    skippedDelete: results.reduce((sum, result) => sum + Number(result.skippedDelete || 0), 0),
    errors: results.filter(result => !result.ok || result.error).map(result => ({
      table: result.table,
      error: result.error || 'Unknown error',
    })),
  };
}

function getWriteAuditLog(storage = localStorage) {
  try {
    return JSON.parse(storage.getItem(WRITE_AUDIT_LOG_KEY) || '[]');
  } catch (error) {
    return [];
  }
}

function saveWriteAuditEntry(entry, storage = localStorage) {
  const rows = getWriteAuditLog(storage);
  rows.unshift({
    id: entry.id || Date.now(),
    ts: entry.ts || new Date().toISOString(),
    ...entry,
  });
  storage.setItem(WRITE_AUDIT_LOG_KEY, JSON.stringify(rows.slice(0, 20)));
  return rows[0];
}

function buildWriteAuditEntry({ preview, writeResult, postWritePreview, tables }) {
  const summary = summarizeWriteResult(writeResult);
  return {
    ts: new Date().toISOString(),
    mode: 'guarded-write',
    tables: tables || [],
    preview: preview ? {
      totalCreate: preview.totalCreate,
      totalUpdate: preview.totalUpdate,
      totalRemove: preview.totalRemove,
    } : null,
    write: summary,
    droppedFields: (writeResult?.results || []).flatMap(result =>
      (result.droppedFields || []).map(field => ({ table: result.table, field })),
    ),
    postWrite: postWritePreview ? {
      totalCreate: postWritePreview.totalCreate,
      totalUpdate: postWritePreview.totalUpdate,
      totalRemove: postWritePreview.totalRemove,
    } : null,
  };
}

return { filterRowForSchema, validateRowsForSchema, buildSupabaseSyncPreview, buildLocalBackupPayload, restoreLocalBackupPayload, downloadLocalBackup, executeGuardedSupabaseWriteSync, summarizeWriteResult, getWriteAuditLog, saveWriteAuditEntry, buildWriteAuditEntry, SYNC_TABLE_MAP, WRITE_CONFIRM_TEXT, WRITE_TABLE_WHITELIST, WRITE_AUDIT_LOG_KEY, WRITE_SCHEMA };
})();

const __src_features_tasks_js = (() => {
const { escapeHtml } = __src_utils_index_js;
const { getTaskDueInfo, isOverdue, todayDateString } = __src_utils_date_js;
const { t } = __src_utils_i18n_js;
function clean(value) {
  return String(value || '').trim();
}

function createTaskFromForm(form) {
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
  };
}

function addTask(state, task) {
  state.data.tasks.unshift(task);
  state.dirtyFlags.tasks = true;
}

function updateTask(state, id, task) {
  const index = state.data.tasks.findIndex(item => item.id === Number(id));
  if (index < 0) return false;
  state.data.tasks[index] = {
    ...state.data.tasks[index],
    ...task,
    id: state.data.tasks[index].id,
  };
  state.dirtyFlags.tasks = true;
  return true;
}

function updateTaskStatus(state, id, status) {
  const task = state.data.tasks.find(item => item.id === Number(id));
  if (!task) return false;
  task.status = status;
  state.dirtyFlags.tasks = true;
  return true;
}

function deleteTask(state, id) {
  const before = state.data.tasks.length;
  state.data.tasks = state.data.tasks.filter(task => task.id !== Number(id));
  state.dirtyFlags.tasks = before !== state.data.tasks.length;
  return state.dirtyFlags.tasks;
}

function getTaskStats(tasks = []) {
  const open = tasks.filter(task => task.status !== 'Done');
  return {
    total: tasks.length,
    open: open.length,
    done: tasks.length - open.length,
    overdue: open.filter(task => isOverdue(task.due)).length,
    blocked: open.filter(task => task.blocked).length,
  };
}

const DEFAULT_TASK_FILTERS = {
  search: '',
  owner: '',
  status: '',
  priority: '',
  category: '',
  health: '',
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
    sort: clean(filters.sort) || DEFAULT_TASK_FILTERS.sort,
  };
}

function taskMatchesHealthFilter(task, health = '', memberNames = new Set()) {
  if (!health) return true;
  const owner = clean(task.owner);
  if (health === 'unassigned') return task.status !== 'Done' && (!owner || owner === 'Unassigned');
  if (health === 'missing-owner') return task.status !== 'Done' && owner && owner !== 'Unassigned' && !memberNames.has(owner);
  if (health === 'high-no-due') return task.status !== 'Done' && task.priority === 'High' && !task.due;
  return true;
}

function filterTasks(tasks = [], filters = {}, members = []) {
  const memberNames = new Set(members.map(member => clean(member.name)).filter(Boolean));
  return tasks.filter((task) => {
    const haystack = `${task.name || ''} ${task.owner || ''} ${task.category || ''} ${task.priority || ''} ${task.status || ''} ${task.notes || ''}`.toLowerCase();
    if (filters.search && !haystack.includes(filters.search)) return false;
    if (filters.owner && task.owner !== filters.owner) return false;
    if (filters.status && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.category && task.category !== filters.category) return false;
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
  const sorted = withIndex.sort((a, b) => {
    let result = 0;
    if (sort === 'due-desc') result = compareDue(b, a);
    else if (sort === 'priority') result = comparePriority(a, b) || compareDue(a, b);
    else if (sort === 'status') result = compareStatus(a, b) || compareDue(a, b);
    else if (sort === 'owner') result = compareText(a, b, 'owner') || compareDue(a, b);
    else if (sort === 'created-desc') result = Number(b.task.id || 0) - Number(a.task.id || 0);
    else result = compareDue(a, b);
    return result || a.index - b.index;
  });
  return sorted.map(row => row.task);
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

function getActiveFilterChips(filters = {}) {
  const healthLabels = {
    unassigned: t('unassignedTasks'),
    'missing-owner': t('ownerNotInMembers'),
    'high-no-due': t('highNoDue'),
  };
  return [
    filters.search ? { key: 'search', label: t('search'), value: filters.search } : null,
    filters.owner ? { key: 'owner', label: t('owner'), value: filters.owner } : null,
    filters.status ? { key: 'status', label: t('status'), value: filters.status } : null,
    filters.priority ? { key: 'priority', label: t('priority'), value: filters.priority } : null,
    filters.category ? { key: 'category', label: t('category'), value: filters.category } : null,
    filters.health ? { key: 'health', label: t('dataHealth'), value: healthLabels[filters.health] || filters.health } : null,
  ].filter(Boolean);
}

function renderTaskTable(tasks = [], members = [], options = {}) {
  if (!tasks.length) {
    return `<div style="padding:18px;text-align:center;color:var(--muted);font-weight:900">${escapeHtml(options.totalCount ? t('noMatchingTasks') : t('noTasksYet'))}</div>`;
  }
  const memberNames = new Set(members.map(member => clean(member.name)).filter(Boolean));
  return `
    <div style="overflow:auto;border:1px solid var(--border);border-radius:8px">
      <table>
        <thead><tr><th>${escapeHtml(t('task'))}</th><th>${escapeHtml(t('owner'))}</th><th>${escapeHtml(t('due'))}</th><th>${escapeHtml(t('priority'))}</th><th>${escapeHtml(t('status'))}</th><th></th></tr></thead>
        <tbody>
          ${tasks.map((task) => {
            const due = getTaskDueInfo(task);
            const late = isOverdue(task.due) && task.status !== 'Done';
            const healthBadges = getTaskHealthBadges(task, memberNames);
            return `
              <tr>
                <td>
                  <strong>${escapeHtml(task.name)}</strong>
                  <div style="font-size:.76rem;color:var(--muted)">${escapeHtml(task.category || 'General')}${task.blocked ? ` | ${escapeHtml(t('blocked'))}` : ''}</div>
                  ${healthBadges.length ? `<div data-task-health-badges style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">${healthBadges.map(label => `<span class="badge mid">${escapeHtml(label)}</span>`).join('')}</div>` : ''}
                </td>
                <td>${escapeHtml(task.owner || 'Unassigned')}</td>
                <td style="color:${late ? 'var(--red)' : 'var(--text)'}">${escapeHtml(task.due || '-')} ${due.days !== null ? `(${due.days}d)` : ''}</td>
                <td><span class="badge ${task.priority === 'High' ? 'urgent' : task.priority === 'Low' ? 'done' : 'mid'}">${escapeHtml(task.priority)}</span></td>
                <td>
                  <select data-task-status="${task.id}">
                    ${['Open', 'In Progress', 'Done'].map(status => `<option value="${status}" ${task.status === status ? 'selected' : ''}>${status}</option>`).join('')}
                  </select>
                </td>
                <td>
                  <div style="display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end">
                    <button class="btn btn-sm" type="button" data-task-edit="${task.id}">${escapeHtml(t('edit'))}</button>
                    <button class="btn btn-sm btn-danger" type="button" data-task-delete="${task.id}">${escapeHtml(t('delete'))}</button>
                  </div>
                </td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

function renderTasksPage(state, options = {}) {
  const tasks = state.data.tasks || [];
  const editingTask = tasks.find(task => task.id === Number(options.editingTaskId));
  const stats = getTaskStats(tasks);
  const master = state.data.masterData || {};
  const selectedCategory = editingTask?.category || master.taskTypes?.[0] || 'General';
  const filters = normalizeTaskFilters(options.filters);
  const owners = unique(tasks.map(task => task.owner));
  const ownerSuggestions = unique([...(state.data.members || []).map(member => member.name), ...tasks.map(task => task.owner)]);
  const categories = unique([...(master.taskTypes || []), ...tasks.map(task => task.category)]);
  const healthSummary = getTaskHealthSummary(tasks, state.data.members || []);
  const visibleTasks = sortTasks(filterTasks(tasks, filters, state.data.members || []), filters.sort);
  const activeFilterChips = getActiveFilterChips(filters);
  return `
    <section id="page-tasks" class="page active" style="display:grid;gap:12px">
      <div class="page-topbar">
        <div>
          <h1 style="margin:0;color:var(--navy)">${escapeHtml(t('tasks'))}</h1>
          <div class="page-top-summary">${escapeHtml(t('taskSummary'))}</div>
        </div>
        <div class="page-top-summary">${escapeHtml(t('openTasks'))} ${stats.open} | ${escapeHtml(t('overdue'))} ${stats.overdue} | ${escapeHtml(t('blocked'))} ${stats.blocked} | ${escapeHtml(t('visible'))} ${visibleTasks.length}/${tasks.length}</div>
      </div>
      <div class="card">
        <form data-task-form style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px;align-items:end">
          <label>${escapeHtml(t('task'))}<input name="name" required value="${escapeHtml(editingTask?.name || '')}" placeholder="${escapeHtml(t('task'))}"></label>
          <label>${escapeHtml(t('owner'))}<input name="owner" list="task-owner-list" value="${escapeHtml(editingTask?.owner || '')}" placeholder="${escapeHtml(t('owner'))}"></label>
          <label>${escapeHtml(t('due'))}<input name="due" type="date" value="${escapeHtml(editingTask?.due || todayDateString())}"></label>
          <label>${escapeHtml(t('priority'))}<select name="priority">${['High', 'Medium', 'Low'].map(priority => `<option ${editingTask?.priority === priority || (!editingTask && priority === 'Medium') ? 'selected' : ''}>${priority}</option>`).join('')}</select></label>
          <label>${escapeHtml(t('category'))}<select name="category">${(master.taskTypes || ['General']).map(type => `<option ${selectedCategory === type ? 'selected' : ''}>${escapeHtml(type)}</option>`).join('')}</select></label>
          <label>${escapeHtml(t('status'))}<select name="status">${['Open', 'In Progress', 'Done'].map(status => `<option ${editingTask?.status === status ? 'selected' : ''}>${status}</option>`).join('')}</select></label>
          <label style="display:flex;gap:7px;align-items:center;font-weight:900"><input name="blocked" type="checkbox" ${editingTask?.blocked ? 'checked' : ''}> ${escapeHtml(t('blocked'))}</label>
          <label style="grid-column:1/-1">${escapeHtml(t('note'))}<textarea name="notes" rows="2" placeholder="${escapeHtml(t('note'))}">${escapeHtml(editingTask?.notes || '')}</textarea></label>
          <button class="btn btn-primary" type="submit">${escapeHtml(editingTask ? t('updateTask') : t('addTask'))}</button>
          ${editingTask ? `<button class="btn" type="button" data-task-cancel-edit>${escapeHtml(t('cancelEdit'))}</button>` : ''}
        </form>
        <datalist id="task-owner-list" data-task-owner-list>${ownerSuggestions.map(owner => `<option value="${escapeHtml(owner)}"></option>`).join('')}</datalist>
        ${editingTask ? `<div style="font-size:.78rem;color:var(--muted);font-weight:800;margin-top:8px">${escapeHtml(t('editingTask'))}: ${escapeHtml(editingTask.name)}</div>` : ''}
      </div>
      <div class="card">
        <div data-task-health-summary style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin-bottom:10px">
          ${[
            [t('unassignedTasks'), healthSummary.unassigned, 'unassigned'],
            [t('ownerNotInMembers'), healthSummary.missingOwner, 'missing-owner'],
            [t('highNoDue'), healthSummary.highNoDue, 'high-no-due'],
          ].map(([label, value, health]) => {
            const active = filters.health === health;
            return `
            <button type="button" data-task-health-shortcut="${escapeHtml(health)}" ${active ? 'data-task-health-active="true"' : ''} style="text-align:left;border:1px solid ${active ? 'var(--orange)' : 'var(--border)'};border-left:4px solid ${value ? 'var(--orange)' : 'var(--green)'};border-radius:8px;background:${active ? 'rgba(245, 158, 11, .12)' : 'var(--input-bg)'};padding:8px;cursor:pointer;color:var(--text)">
              <div style="font-size:.73rem;color:var(--muted);font-weight:900">${escapeHtml(label)}</div>
              <div style="font-size:1.15rem;font-weight:900;color:${value ? 'var(--orange)' : 'var(--green)'}">${escapeHtml(value)}</div>
            </button>
          `; }).join('')}
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px;align-items:end;margin-bottom:10px">
          <label>${escapeHtml(t('search'))}<input data-task-search value="${escapeHtml(filters.search)}" placeholder="${escapeHtml(t('searchTasks'))}"></label>
          <label>${escapeHtml(t('owner'))}<select data-task-owner-filter><option value="">${escapeHtml(t('allOwners'))}</option>${owners.map(owner => `<option value="${escapeHtml(owner)}" ${filters.owner === owner ? 'selected' : ''}>${escapeHtml(owner)}</option>`).join('')}</select></label>
          <label>${escapeHtml(t('status'))}<select data-task-status-filter><option value="">${escapeHtml(t('allStatuses'))}</option>${['Open', 'In Progress', 'Done'].map(status => `<option value="${status}" ${filters.status === status ? 'selected' : ''}>${status}</option>`).join('')}</select></label>
          <label>${escapeHtml(t('priority'))}<select data-task-priority-filter><option value="">${escapeHtml(t('allPriorities'))}</option>${['High', 'Medium', 'Low'].map(priority => `<option value="${priority}" ${filters.priority === priority ? 'selected' : ''}>${priority}</option>`).join('')}</select></label>
          <label>${escapeHtml(t('category'))}<select data-task-category-filter><option value="">${escapeHtml(t('allCategories'))}</option>${categories.map(category => `<option value="${escapeHtml(category)}" ${filters.category === category ? 'selected' : ''}>${escapeHtml(category)}</option>`).join('')}</select></label>
          <label>${escapeHtml(t('dataHealth'))}<select data-task-health-filter>${[
            ['', t('allHealth')],
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
            ['created-desc', t('sortNewest')],
          ].map(([value, label]) => `<option value="${value}" ${filters.sort === value ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('')}</select></label>
          <button class="btn btn-sm" type="button" data-task-clear-filters>${escapeHtml(t('clearFilters'))}</button>
        </div>
        <div data-task-active-filters style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:10px;min-height:24px">
          ${activeFilterChips.length ? `<strong style="font-size:.76rem;color:var(--muted)">${escapeHtml(t('activeFilters'))}</strong>${activeFilterChips.map(chip => `<button class="badge mid" type="button" data-task-remove-filter="${escapeHtml(chip.key)}" title="${escapeHtml(t('removeFilter'))}" style="cursor:pointer">${escapeHtml(chip.label)}: ${escapeHtml(chip.value)} x</button>`).join('')}` : `<span style="font-size:.76rem;color:var(--muted);font-weight:800">${escapeHtml(t('noActiveFilters'))}</span>`}
        </div>
        ${renderTaskTable(visibleTasks, state.data.members || [], { totalCount: tasks.length })}
      </div>
    </section>`;
}

return { createTaskFromForm, addTask, updateTask, updateTaskStatus, deleteTask, getTaskStats, renderTaskTable, renderTasksPage };
})();

const __src_features_health_js = (() => {
const { escapeHtml, safeJsonParse } = __src_utils_index_js;
const SMOKE_TEST_LOG_KEY = 'rov_v16_smoke_test_log';
const DEFAULT_SMOKE_CHECKS = [
  { label: 'App root', id: 'app' },
  { label: 'Navigation', selector: 'nav' },
];

function evaluateSmokeChecks(checks = DEFAULT_SMOKE_CHECKS, documentRef = document) {
  return checks.map((check) => {
    const target = check.id
      ? documentRef.getElementById(check.id)
      : documentRef.querySelector(check.selector);
    return {
      label: check.label,
      id: check.id || check.selector,
      ok: Boolean(target),
    };
  });
}

function getSmokeTestLog(storage = localStorage) {
  return safeJsonParse(storage.getItem(SMOKE_TEST_LOG_KEY), []);
}

function saveSmokeTestResult(result, storage = localStorage) {
  const rows = getSmokeTestLog(storage);
  rows.unshift(result);
  storage.setItem(SMOKE_TEST_LOG_KEY, JSON.stringify(rows.slice(0, 10)));
}

function runSmokeTest(options = {}) {
  const {
    checks = DEFAULT_SMOKE_CHECKS,
    documentRef = document,
    storage = localStorage,
    persist = true,
  } = options;
  const evaluated = evaluateSmokeChecks(checks, documentRef);
  const failed = evaluated.filter(check => !check.ok);
  const result = {
    ts: new Date().toISOString(),
    ok: failed.length === 0,
    checks: evaluated,
  };
  if (persist) saveSmokeTestResult(result, storage);
  console.info('v16 smoke test', result);
  return result;
}

function getDataHealthIssues(state) {
  const data = state?.data || {};
  const master = data.masterData || {};
  const roles = new Set(master.roles || []);
  const taskTypes = new Set(master.taskTypes || []);
  const gearCats = new Set(master.gearCats || []);
  const memberNames = new Set((data.members || []).map(member => String(member.name || '').trim()).filter(Boolean));
  const issues = [];

  if (!(master.roles || []).length) issues.push({ level: 'urgent', title: 'No roles configured', detail: 'Add at least one role.' });
  if (!(master.taskTypes || []).length) issues.push({ level: 'urgent', title: 'No task types configured', detail: 'Add task categories for filtering.' });
  if (!(data.tasks || []).length) issues.push({ level: 'warn', title: 'No tasks', detail: 'Add tasks before using competition workflow.' });

  (data.members || []).forEach((member) => {
    if (member.role && !roles.has(member.role)) {
      issues.push({ level: 'warn', title: 'Member role not in master data', detail: `${member.name}: ${member.role}` });
    }
  });
  (data.tasks || []).forEach((task) => {
    const taskName = task.name || 'Untitled task';
    const owner = String(task.owner || '').trim();
    if (task.status !== 'Done' && (!owner || owner === 'Unassigned')) {
      issues.push({ level: 'warn', title: 'Task has no owner', detail: taskName });
    } else if (task.status !== 'Done' && owner && !memberNames.has(owner)) {
      issues.push({ level: 'warn', title: 'Task owner not in members', detail: `${taskName}: ${owner}` });
    }
    if (task.status !== 'Done' && task.priority === 'High' && !task.due) {
      issues.push({ level: 'warn', title: 'High priority task has no due date', detail: taskName });
    }
    if (task.category && !taskTypes.has(task.category)) {
      issues.push({ level: 'warn', title: 'Task category not in master data', detail: `${task.name}: ${task.category}` });
    }
  });
  (data.gearItems || []).forEach((item) => {
    if (item.category && !gearCats.has(item.category)) {
      issues.push({ level: 'warn', title: 'Gear category not in master data', detail: `${item.name}: ${item.category}` });
    }
  });
  return issues;
}

function renderSmokeTestSummaryHtml(result) {
  if (!result) {
    return '<div style="font-size:.86rem;color:var(--muted);font-weight:900">Smoke Test: not run yet.</div>';
  }
  const failed = result.checks.filter(check => !check.ok);
  const status = result.ok ? 'pass' : `failed ${failed.length}`;
  const color = result.ok ? 'var(--green)' : 'var(--red)';
  return `<div style="font-size:.86rem;color:${color};font-weight:900">Smoke Test: ${escapeHtml(status)} | ${escapeHtml(new Date(result.ts).toLocaleString())}</div>`;
}

function renderSmokeTestPanel(container, result, history = []) {
  if (!container) return;
  const latest = result || history[0] || null;
  const passed = latest?.checks?.filter(check => check.ok).length || 0;
  const failed = latest?.checks?.filter(check => !check.ok).length || 0;
  const groups = latest?.checks?.reduce((acc, check) => {
    const key = String(check.label || '').split(' ')[0] || 'other';
    acc[key] = acc[key] || { total: 0, failed: 0 };
    acc[key].total += 1;
    if (!check.ok) acc[key].failed += 1;
    return acc;
  }, {}) || {};
  container.innerHTML = `
    <div style="border:1px solid var(--border);border-radius:8px;background:var(--white);padding:12px;display:grid;gap:10px">
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap">
        <strong style="color:var(--navy)">v16 Smoke Test</strong>
        <button class="btn btn-sm btn-primary" type="button" data-action="run-v16-smoke">Run again</button>
      </div>
      ${renderSmokeTestSummaryHtml(latest)}
      ${latest ? `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px">
          ${[
            ['Type', latest.type || 'basic'],
            ['Passed', passed],
            ['Failed', failed],
            ['Total', latest.checks.length],
          ].map(([label, value]) => `
            <div style="border:1px solid var(--border);border-radius:8px;background:var(--input-bg);padding:8px">
              <div style="font-size:.73rem;color:var(--muted);font-weight:900">${escapeHtml(label)}</div>
              <div style="font-size:1.05rem;font-weight:900;color:${label === 'Failed' && value ? 'var(--red)' : 'var(--navy)'}">${escapeHtml(value)}</div>
            </div>
          `).join('')}
        </div>
        <div style="display:flex;gap:5px;flex-wrap:wrap">
          ${Object.entries(groups).map(([group, row]) => `
            <span class="badge ${row.failed ? 'urgent' : 'done'}">${escapeHtml(group)} ${row.total - row.failed}/${row.total}</span>
          `).join('')}
        </div>
      ` : ''}
      ${latest ? `
        <div style="display:grid;gap:6px">
          ${latest.checks.map(check => `
            <div style="display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:center;border:1px solid var(--border);border-radius:8px;background:var(--input-bg);padding:8px">
              <span class="badge ${check.ok ? 'done' : 'urgent'}">${check.ok ? 'OK' : 'FAIL'}</span>
              <div>
                <div style="font-size:.84rem;font-weight:900;color:var(--navy)">${escapeHtml(check.label)}</div>
                <div style="font-size:.74rem;color:var(--muted)">${escapeHtml(check.id)}</div>
              </div>
              <span style="font-size:.78rem;color:${check.ok ? 'var(--green)' : 'var(--red)'};font-weight:900">${check.ok ? 'found' : 'missing'}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${history.length > 1 ? `<div style="font-size:.76rem;color:var(--muted);font-weight:800">History: ${history.length} runs, latest 10 kept.</div>` : ''}
    </div>`;
}

function runV16ScaffoldSmokeTest(options = {}) {
  return runSmokeTest(options);
}

return { evaluateSmokeChecks, getSmokeTestLog, saveSmokeTestResult, runSmokeTest, getDataHealthIssues, renderSmokeTestSummaryHtml, renderSmokeTestPanel, runV16ScaffoldSmokeTest, SMOKE_TEST_LOG_KEY, DEFAULT_SMOKE_CHECKS };
})();

const __src_features_navigation_js = (() => {
const { getLocale, t } = __src_utils_i18n_js;
function showPage(state, pageId) {
  state.currentPage = pageId;
  return state;
}

function showMode(state, modeId) {
  state.currentMode = modeId;
  return state;
}

const V16_PAGES = [
  { id: 'dashboard', labelKey: 'dashboard' },
  { id: 'prep', labelKey: 'prep' },
  { id: 'tasks', labelKey: 'tasks' },
  { id: 'members', labelKey: 'members' },
  { id: 'intel', labelKey: 'intel' },
  { id: 'competition', labelKey: 'competition' },
  { id: 'settings', labelKey: 'settings' },
];

function renderNavigation(currentPage) {
  const locale = getLocale();
  return `
    <nav style="position:sticky;top:0;z-index:50;background:var(--navy);color:#fff;padding:10px 16px;box-shadow:var(--shadow)">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
        <strong>${t('appTitle')}</strong>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${V16_PAGES.map(page => `
            <button class="btn btn-sm ${page.id === currentPage ? 'btn-primary' : ''}" type="button" data-page="${page.id}">${t(page.labelKey)}</button>
          `).join('')}
          <button class="btn btn-sm ${locale === 'zh' ? 'btn-primary' : ''}" type="button" data-locale="zh">繁中</button>
          <button class="btn btn-sm ${locale === 'en' ? 'btn-primary' : ''}" type="button" data-locale="en">EN</button>
        </div>
      </div>
    </nav>`;
}

return { showPage, showMode, renderNavigation, V16_PAGES };
})();

const __src_features_members_js = (() => {
const { escapeHtml } = __src_utils_index_js;
const { t } = __src_utils_i18n_js;
function clean(value) {
  return String(value || '').trim();
}

function createMemberFromForm(form) {
  return {
    id: Date.now(),
    name: clean(form.get('name')) || 'New member',
    role: clean(form.get('role')),
    group: clean(form.get('group')),
    status: clean(form.get('status')) || 'Active',
  };
}

function addMember(state, member) {
  state.data.members.unshift(member);
  state.dirtyFlags.members = true;
}

function updateMember(state, id, member) {
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

function deleteMember(state, id) {
  const before = state.data.members.length;
  state.data.members = state.data.members.filter(member => Number(member.id) !== Number(id));
  state.dirtyFlags.members = before !== state.data.members.length;
  return state.dirtyFlags.members;
}

function normalizeMemberFilters(filters = {}) {
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

function renderMembersPage(state, options = {}) {
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
          <label>${escapeHtml(t('status'))}<select name="status">${['Active', 'Standby', 'Away'].map(status => `<option ${clean(editingMember?.status) === status ? 'selected' : ''}>${status}</option>`).join('')}</select></label>
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
            <span class="badge done">${escapeHtml(member.status || 'Active')}</span>
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
          <div style="font-size:.72rem;color:var(--muted);font-weight:800">${escapeHtml(task.status || 'Open')} | ${escapeHtml(task.priority || 'Medium')} | ${escapeHtml(task.due || '-')}</div>
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
          <span class="badge ${high ? 'mid' : 'done'}">High: ${high}</span>
        </div>
        ${renderMemberTaskList(openTasks)}
      </div>`;
  }).join('');
}

return { createMemberFromForm, addMember, updateMember, deleteMember, normalizeMemberFilters, renderMembersPage };
})();

const __src_features_intel_js = (() => {
const { escapeHtml } = __src_utils_index_js;
const { t } = __src_utils_i18n_js;
function clean(value) {
  return String(value || '').trim();
}

function nextId() {
  return Date.now();
}

function normalizeItem(item = {}, fallbackTitle = '') {
  return {
    id: item.id || nextId(),
    title: clean(item.title || item.name || fallbackTitle),
    content: clean(item.content || item.note || item.notes || item.detail),
    status: clean(item.status) || 'Draft',
  };
}

function normalizeKnowledgeFilters(filters = {}) {
  return {
    search: clean(filters.search).toLowerCase(),
    status: clean(filters.status),
    sort: clean(filters.sort) || 'newest',
  };
}

function filterKnowledgeItems(items = [], filters = {}) {
  return items.filter((raw) => {
    const item = normalizeItem(raw);
    const haystack = `${item.title} ${item.content} ${item.status}`.toLowerCase();
    if (filters.search && !haystack.includes(filters.search)) return false;
    if (filters.status && item.status !== filters.status) return false;
    return true;
  });
}

function sortKnowledgeItems(items = [], sort = 'newest') {
  const statusRank = { Draft: 0, Review: 1, Ready: 2 };
  const withIndex = items.map((item, index) => ({ item, index }));
  return withIndex.sort((a, b) => {
    const aItem = normalizeItem(a.item);
    const bItem = normalizeItem(b.item);
    let result = 0;
    if (sort === 'title') result = aItem.title.localeCompare(bItem.title, 'en');
    else if (sort === 'status') result = (statusRank[aItem.status] ?? 9) - (statusRank[bItem.status] ?? 9) || aItem.title.localeCompare(bItem.title, 'en');
    else if (sort === 'oldest') result = Number(aItem.id || 0) - Number(bItem.id || 0);
    else result = Number(bItem.id || 0) - Number(aItem.id || 0);
    return result || a.index - b.index;
  }).map(row => row.item);
}

function isIntelFocusMatch(focus = {}, listName = '', title = '') {
  return focus.listName === listName && clean(focus.query).toLowerCase() === clean(title).toLowerCase();
}

function updateNotes(state, notes) {
  state.data.notes = String(notes || '');
  state.dirtyFlags.notes = true;
  return true;
}

function createKnowledgeItemFromForm(form, fallbackTitle = '') {
  return normalizeItem({
    id: nextId(),
    title: form.get('title'),
    content: form.get('content'),
    status: form.get('status'),
  }, fallbackTitle);
}

function addKnowledgeItem(state, listName, item) {
  if (!Array.isArray(state.data[listName])) return false;
  const normalized = normalizeItem(item, t('untitledItem'));
  if (!normalized.title && !normalized.content) return false;
  state.data[listName].unshift(normalized);
  state.dirtyFlags[listName] = true;
  return true;
}

function updateKnowledgeItem(state, listName, id, item) {
  const list = state.data[listName];
  if (!Array.isArray(list)) return false;
  const index = list.findIndex(row => Number(row.id) === Number(id));
  if (index < 0) return false;
  const normalized = normalizeItem(item, t('untitledItem'));
  if (!normalized.title && !normalized.content) return false;
  list[index] = {
    ...list[index],
    ...normalized,
    id: list[index].id,
  };
  state.dirtyFlags[listName] = true;
  return true;
}

function deleteKnowledgeItem(state, listName, id) {
  const list = state.data[listName];
  if (!Array.isArray(list)) return false;
  const before = list.length;
  state.data[listName] = list.filter(row => Number(row.id) !== Number(id));
  state.dirtyFlags[listName] = before !== state.data[listName].length;
  return state.dirtyFlags[listName];
}

function renderKnowledgeForm(listName, editingItem = null) {
  const action = editingItem ? 'update' : 'add';
  const formAttr = listName === 'intel'
    ? 'data-knowledge-form="intel"'
    : 'data-knowledge-form="strategy"';
  return `
    <form ${formAttr} data-knowledge-action="${action}" style="display:grid;grid-template-columns:1fr 140px auto auto;gap:8px;align-items:end">
      <label>${escapeHtml(t('title'))}<input name="title" value="${escapeHtml(editingItem?.title || '')}" placeholder="${escapeHtml(t('title'))}"></label>
      <label>${escapeHtml(t('status'))}<select name="status">${['Draft', 'Review', 'Ready'].map(status => `<option ${editingItem?.status === status ? 'selected' : ''}>${status}</option>`).join('')}</select></label>
      <button class="btn btn-primary" type="submit">${escapeHtml(editingItem ? t('updateItem') : t('addItem'))}</button>
      ${editingItem ? `<button class="btn" type="button" data-knowledge-cancel-edit>${escapeHtml(t('cancelEdit'))}</button>` : ''}
      <label style="grid-column:1/-1">${escapeHtml(t('content'))}<textarea name="content" rows="3" placeholder="${escapeHtml(t('content'))}">${escapeHtml(editingItem?.content || '')}</textarea></label>
    </form>
    ${editingItem ? `<div style="font-size:.78rem;color:var(--muted);font-weight:800">${escapeHtml(t('editingItem'))}: ${escapeHtml(editingItem.title || t('untitledItem'))}</div>` : ''}`;
}

function renderKnowledgeList(listName, items = [], options = {}) {
  if (!items.length) {
    return `<div style="color:var(--muted);font-weight:900">${escapeHtml(options.totalCount ? t('noMatchingItems') : t('noItemsYet'))}</div>`;
  }
  return `
    <div style="display:grid;gap:8px">
      ${items.map((raw, index) => {
        const item = normalizeItem(raw, `${t('item')} ${index + 1}`);
        return `
          <div data-intel-focus-row="${escapeHtml(listName)}" style="border:1px solid ${isIntelFocusMatch(options.intelFocus, listName, item.title) ? 'var(--orange)' : 'var(--border)'};border-left:4px solid ${isIntelFocusMatch(options.intelFocus, listName, item.title) ? 'var(--orange)' : 'var(--border)'};border-radius:8px;background:var(--input-bg);padding:9px;display:grid;gap:6px">
            <div style="display:flex;justify-content:space-between;gap:8px;align-items:start">
              <div>
                <strong style="color:var(--navy)">${escapeHtml(item.title || t('untitledItem'))}</strong>
                <div style="font-size:.76rem;color:var(--muted);font-weight:800">${escapeHtml(item.status)}</div>
              </div>
              <div style="display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end">
                <button class="btn btn-sm" type="button" data-knowledge-edit="${listName}" data-knowledge-id="${escapeHtml(raw.id)}">${escapeHtml(t('edit'))}</button>
                <button class="btn btn-sm btn-danger" type="button" data-knowledge-delete="${listName}" data-knowledge-id="${escapeHtml(raw.id)}">${escapeHtml(t('delete'))}</button>
              </div>
            </div>
            <div style="font-size:.82rem;white-space:pre-wrap">${escapeHtml(item.content || '-')}</div>
          </div>`;
      }).join('')}
    </div>`;
}

function renderKnowledgeSectionHeading(label, visibleCount, totalCount) {
  return `
    <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap">
      <h2 style="margin:0">${escapeHtml(label)}</h2>
      <span class="badge mid" data-knowledge-visible-count>${escapeHtml(visibleCount)}/${escapeHtml(totalCount)}</span>
    </div>`;
}

function getActiveKnowledgeFilterChips(filters = {}) {
  return [
    filters.search ? { key: 'search', label: t('search'), value: filters.search } : null,
    filters.status ? { key: 'status', label: t('status'), value: filters.status } : null,
  ].filter(Boolean);
}

function renderKnowledgeFilters(listName, filters = {}) {
  const activeFilterChips = getActiveKnowledgeFilterChips(filters);
  return `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px;margin:10px 0">
      <label>${escapeHtml(t('search'))}<input data-knowledge-search="${listName}" value="${escapeHtml(filters.search || '')}" placeholder="${escapeHtml(t('searchIntel'))}"></label>
      <label>${escapeHtml(t('status'))}<select data-knowledge-status-filter="${listName}">
        <option value="">${escapeHtml(t('allStatuses'))}</option>
        ${['Draft', 'Review', 'Ready'].map(status => `<option value="${status}" ${filters.status === status ? 'selected' : ''}>${status}</option>`).join('')}
      </select></label>
      <label>${escapeHtml(t('sort'))}<select data-knowledge-sort="${listName}">
        ${[
          ['newest', t('sortNewest')],
          ['oldest', t('sortOldest')],
          ['title', t('sortTitle')],
          ['status', t('sortStatus')],
        ].map(([value, label]) => `<option value="${value}" ${filters.sort === value ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('')}
      </select></label>
      <button class="btn btn-sm" type="button" data-knowledge-clear-filters="${escapeHtml(listName)}">${escapeHtml(t('clearFilters'))}</button>
    </div>
    <div data-knowledge-active-filters="${escapeHtml(listName)}" style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:10px;min-height:24px">
      ${activeFilterChips.length ? `<strong style="font-size:.76rem;color:var(--muted)">${escapeHtml(t('activeFilters'))}</strong>${activeFilterChips.map(chip => `<button class="badge mid" type="button" data-knowledge-remove-filter="${escapeHtml(chip.key)}" data-knowledge-filter-list="${escapeHtml(listName)}" title="${escapeHtml(t('removeFilter'))}" style="cursor:pointer">${escapeHtml(chip.label)}: ${escapeHtml(chip.value)} x</button>`).join('')}` : `<span style="font-size:.76rem;color:var(--muted);font-weight:800">${escapeHtml(t('noActiveFilters'))}</span>`}
    </div>`;
}

function renderIntelPage(state, options = {}) {
  const intel = state.data.intel || [];
  const strategy = state.data.strategy || [];
  const intelFilters = normalizeKnowledgeFilters(options.filters?.intel);
  const strategyFilters = normalizeKnowledgeFilters(options.filters?.strategy);
  const visibleIntel = sortKnowledgeItems(filterKnowledgeItems(intel, intelFilters), intelFilters.sort);
  const visibleStrategy = sortKnowledgeItems(filterKnowledgeItems(strategy, strategyFilters), strategyFilters.sort);
  const editingIntel = intel.find(item => Number(item.id) === Number(options.editingIntelId));
  const editingStrategy = strategy.find(item => Number(item.id) === Number(options.editingStrategyId));
  const intelFocus = options.intelFocus || null;
  return `
    <section id="page-intel" class="page active" style="display:grid;gap:12px">
      <div class="page-topbar">
        <div>
          <h1 style="margin:0;color:var(--navy)">${escapeHtml(t('intel'))}</h1>
          <div class="page-top-summary">${escapeHtml(t('intelSummary'))}</div>
        </div>
        <div class="page-top-summary">${escapeHtml(t('intel'))} ${visibleIntel.length}/${intel.length} | ${escapeHtml(t('strategy'))} ${visibleStrategy.length}/${strategy.length}</div>
      </div>

      <div class="card">
        <h2>${escapeHtml(t('teamNotes'))}</h2>
        <label>${escapeHtml(t('notes'))}<textarea data-notes-input rows="5" placeholder="${escapeHtml(t('notes'))}">${escapeHtml(state.data.notes || '')}</textarea></label>
        <div style="display:flex;justify-content:flex-end;margin-top:8px">
          <button class="btn btn-primary" type="button" data-notes-save>${escapeHtml(t('saveNotes'))}</button>
        </div>
      </div>

      ${intelFocus?.listName ? `<div class="card" data-intel-focus-summary>
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap">
          <div>
            <h2 style="margin:0">${escapeHtml(t('intelFocus'))}</h2>
            <div style="font-size:.82rem;color:var(--muted);font-weight:800;margin-top:4px">${escapeHtml(intelFocus.query || '-')}</div>
          </div>
          <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
            <span class="badge mid">${escapeHtml(intelFocus.listName)}</span>
            <button class="btn btn-sm" type="button" data-intel-clear-focus>${escapeHtml(t('clearFocus'))}</button>
          </div>
        </div>
      </div>` : ''}

      <div class="card">
        ${renderKnowledgeSectionHeading(t('intel'), visibleIntel.length, intel.length)}
        ${renderKnowledgeForm('intel', editingIntel)}
        ${renderKnowledgeFilters('intel', intelFilters)}
        <div style="margin-top:10px">${renderKnowledgeList('intel', visibleIntel, { intelFocus, totalCount: intel.length })}</div>
      </div>

      <div class="card">
        ${renderKnowledgeSectionHeading(t('strategy'), visibleStrategy.length, strategy.length)}
        ${renderKnowledgeForm('strategy', editingStrategy)}
        ${renderKnowledgeFilters('strategy', strategyFilters)}
        <div style="margin-top:10px">${renderKnowledgeList('strategy', visibleStrategy, { intelFocus, totalCount: strategy.length })}</div>
      </div>
    </section>`;
}

return { normalizeKnowledgeFilters, updateNotes, createKnowledgeItemFromForm, addKnowledgeItem, updateKnowledgeItem, deleteKnowledgeItem, renderIntelPage };
})();

const __src_features_competition_js = (() => {
const { escapeHtml } = __src_utils_index_js;
const { formatMissionTime } = __src_utils_date_js;
const { t } = __src_utils_i18n_js;
const { getTaskStats } = __src_features_tasks_js;
function clean(value) {
  return String(value || '').trim();
}

function createMissionRun(state, elapsedSeconds = 0) {
  const score = Number(document.querySelector('[data-run-score]')?.value || 0);
  const note = document.querySelector('[data-run-note]')?.value?.trim() || '';
  const run = {
    id: Date.now(),
    ts: new Date().toISOString(),
    elapsedSeconds,
    score,
    note,
  };
  state.data.missionRuns.unshift(run);
  state.dirtyFlags.missionRuns = true;
  return run;
}

function updateMissionRun(state, id, payload = {}) {
  const index = state.data.missionRuns.findIndex(run => Number(run.id) === Number(id));
  if (index < 0) return false;
  state.data.missionRuns[index] = {
    ...state.data.missionRuns[index],
    score: Number(payload.score || 0),
    note: String(payload.note || '').trim(),
  };
  state.dirtyFlags.missionRuns = true;
  return true;
}

function deleteMissionRun(state, id) {
  const before = state.data.missionRuns.length;
  state.data.missionRuns = state.data.missionRuns.filter(run => Number(run.id) !== Number(id));
  state.dirtyFlags.missionRuns = before !== state.data.missionRuns.length;
  return state.dirtyFlags.missionRuns;
}

function getRunPayloadFromDom(root = document) {
  return {
    score: root.querySelector('[data-run-score]')?.value || 0,
    note: root.querySelector('[data-run-note]')?.value || '',
  };
}

function normalizeRunFilters(filters = {}) {
  return {
    search: clean(filters.search).toLowerCase(),
    sort: clean(filters.sort) || 'newest',
  };
}

function filterMissionRuns(runs = [], filters = {}) {
  return runs.filter((run) => {
    const haystack = [
      run.score,
      run.note,
      formatMissionTime(run.elapsedSeconds),
      run.ts ? new Date(run.ts).toLocaleString() : '',
    ].join(' ').toLowerCase();
    return !filters.search || haystack.includes(filters.search);
  });
}

function sortMissionRuns(runs = [], sort = 'newest') {
  const withIndex = runs.map((run, index) => ({ run, index }));
  return withIndex.sort((a, b) => {
    let result = 0;
    if (sort === 'oldest') result = Number(a.run.id || 0) - Number(b.run.id || 0);
    else if (sort === 'score-desc') result = Number(b.run.score || 0) - Number(a.run.score || 0);
    else if (sort === 'score-asc') result = Number(a.run.score || 0) - Number(b.run.score || 0);
    else if (sort === 'duration-desc') result = Number(b.run.elapsedSeconds || 0) - Number(a.run.elapsedSeconds || 0);
    else if (sort === 'duration-asc') result = Number(a.run.elapsedSeconds || 0) - Number(b.run.elapsedSeconds || 0);
    else result = Number(b.run.id || 0) - Number(a.run.id || 0);
    return result || a.index - b.index;
  }).map(row => row.run);
}

function getActiveRunFilterChips(filters = {}) {
  return [
    filters.search ? { key: 'search', label: t('search'), value: filters.search } : null,
  ].filter(Boolean);
}

function renderRunHistory(runs = [], options = {}) {
  if (!runs.length) return `<div style="color:var(--muted);font-weight:900">${escapeHtml(options.totalCount ? t('noMatchingRuns') : t('noMissionRunsYet'))}</div>`;
  return `
    <div style="display:grid;gap:6px">
      ${runs.map(run => `
        <div style="display:grid;grid-template-columns:auto 1fr auto auto;gap:8px;align-items:center;border:1px solid var(--border);border-radius:8px;background:var(--input-bg);padding:8px">
          <span class="badge done">${escapeHtml(formatMissionTime(run.elapsedSeconds))}</span>
          <div>
            <strong>${escapeHtml(new Date(run.ts).toLocaleString())}</strong>
            <div style="font-size:.76rem;color:var(--muted)">${escapeHtml(run.note || '-')}</div>
          </div>
          <strong style="color:var(--green)">${escapeHtml(run.score)}</strong>
          <div style="display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end">
            <button class="btn btn-sm" type="button" data-run-edit="${escapeHtml(run.id)}">${escapeHtml(t('edit'))}</button>
            <button class="btn btn-sm btn-danger" type="button" data-run-delete="${escapeHtml(run.id)}">${escapeHtml(t('delete'))}</button>
          </div>
        </div>
      `).join('')}
    </div>`;
}

function renderCompetitionCenter(state, timer, options = {}) {
  const stats = getTaskStats(state.data.tasks);
  const filters = normalizeRunFilters(options.filters);
  const visibleRuns = sortMissionRuns(filterMissionRuns(state.data.missionRuns, filters), filters.sort);
  const activeFilterChips = getActiveRunFilterChips(filters);
  const editingRun = state.data.missionRuns.find(run => Number(run.id) === Number(options.editingRunId));
  const elapsed = timer?.running ? Math.floor((Date.now() - timer.startedAt) / 1000) + timer.baseSeconds : timer?.baseSeconds || 0;
  return `
    <section id="page-competition" class="page active" style="display:grid;gap:12px">
      <div class="page-topbar">
        <div>
          <h1 style="margin:0;color:var(--navy)">${escapeHtml(t('competition'))}</h1>
          <div class="page-top-summary">${escapeHtml(t('competitionSummary'))}</div>
        </div>
        <div class="page-top-summary">${escapeHtml(t('openTasks'))} ${stats.open} | ${escapeHtml(t('blocked'))} ${stats.blocked}</div>
      </div>
      <div class="card" style="display:grid;gap:12px">
        <div style="font-size:3rem;font-weight:900;color:var(--navy);line-height:1">${formatMissionTime(elapsed)}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-primary" type="button" data-timer-action="${timer?.running ? 'pause' : 'start'}">${escapeHtml(timer?.running ? t('pause') : t('start'))}</button>
          <button class="btn" type="button" data-timer-action="reset">${escapeHtml(t('reset'))}</button>
          ${editingRun
            ? `<button class="btn btn-success" type="button" data-action="update-run">${escapeHtml(t('updateRun'))}</button>`
            : `<button class="btn btn-success" type="button" data-action="save-run">${escapeHtml(t('saveRun'))}</button>`}
          ${editingRun ? `<button class="btn" type="button" data-run-cancel-edit>${escapeHtml(t('cancelEdit'))}</button>` : ''}
        </div>
        <div style="display:grid;grid-template-columns:120px 1fr;gap:8px">
          <label>${escapeHtml(t('score'))}<input data-run-score type="number" value="${escapeHtml(editingRun?.score ?? 0)}"></label>
          <label>${escapeHtml(t('note'))}<input data-run-note value="${escapeHtml(editingRun?.note || '')}" placeholder="${escapeHtml(t('note'))}"></label>
        </div>
        ${editingRun ? `<div style="font-size:.78rem;color:var(--muted);font-weight:800">${escapeHtml(t('editingRun'))}: ${escapeHtml(new Date(editingRun.ts).toLocaleString())}</div>` : ''}
      </div>
      <div class="card">
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap">
          <h2 style="margin:0">${escapeHtml(t('runHistory'))}</h2>
          <div style="font-size:.78rem;color:var(--muted);font-weight:900">${escapeHtml(t('visible'))} ${visibleRuns.length}/${state.data.missionRuns.length}</div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px;align-items:end;margin:10px 0">
          <label>${escapeHtml(t('search'))}<input data-run-search value="${escapeHtml(filters.search)}" placeholder="${escapeHtml(t('searchRuns'))}"></label>
          <label>${escapeHtml(t('sort'))}<select data-run-sort>${[
            ['newest', t('sortNewest')],
            ['oldest', t('sortOldest')],
            ['score-desc', t('sortScoreHigh')],
            ['score-asc', t('sortScoreLow')],
            ['duration-asc', t('sortDurationShort')],
            ['duration-desc', t('sortDurationLong')],
          ].map(([value, label]) => `<option value="${escapeHtml(value)}" ${filters.sort === value ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('')}</select></label>
          <button class="btn btn-sm" type="button" data-run-clear-filters>${escapeHtml(t('clearFilters'))}</button>
        </div>
        <div data-run-active-filters style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:10px;min-height:24px">
          ${activeFilterChips.length ? `<strong style="font-size:.76rem;color:var(--muted)">${escapeHtml(t('activeFilters'))}</strong>${activeFilterChips.map(chip => `<button class="badge mid" type="button" data-run-remove-filter="${escapeHtml(chip.key)}" title="${escapeHtml(t('removeFilter'))}" style="cursor:pointer">${escapeHtml(chip.label)}: ${escapeHtml(chip.value)} x</button>`).join('')}` : `<span style="font-size:.76rem;color:var(--muted);font-weight:800">${escapeHtml(t('noActiveFilters'))}</span>`}
        </div>
        ${renderRunHistory(visibleRuns, { totalCount: state.data.missionRuns.length })}
      </div>
    </section>`;
}

return { createMissionRun, updateMissionRun, deleteMissionRun, getRunPayloadFromDom, normalizeRunFilters, renderRunHistory, renderCompetitionCenter };
})();

const __src_features_prep_js = (() => {
const { escapeHtml } = __src_utils_index_js;
const { t } = __src_utils_i18n_js;
const { getTaskStats } = __src_features_tasks_js;
function clean(value) {
  return String(value || '').trim();
}

function normalizePrepFilters(filters = {}) {
  return {
    search: clean(filters.search).toLowerCase(),
    status: clean(filters.status),
  };
}

function toggleChecklistItem(state, listName, id) {
  const item = state.data[listName]?.find(row => row.id === Number(id));
  if (!item) return false;
  item.done = !item.done;
  state.dirtyFlags[listName] = true;
  return true;
}

function addChecklistItem(state, listName, label) {
  const list = state.data[listName];
  const text = clean(label);
  if (!Array.isArray(list) || !text) return false;
  list.push({
    id: Date.now(),
    label: text,
    done: false,
  });
  state.dirtyFlags[listName] = true;
  return true;
}

function updateChecklistItem(state, listName, id, label) {
  const item = state.data[listName]?.find(row => Number(row.id) === Number(id));
  const text = clean(label);
  if (!item || !text) return false;
  item.label = text;
  state.dirtyFlags[listName] = true;
  return true;
}

function deleteChecklistItem(state, listName, id) {
  const list = state.data[listName];
  if (!Array.isArray(list)) return false;
  const before = list.length;
  state.data[listName] = list.filter(item => Number(item.id) !== Number(id));
  state.dirtyFlags[listName] = before !== state.data[listName].length;
  return state.dirtyFlags[listName];
}

function addGearItem(state, payload = {}) {
  const name = clean(payload.name);
  if (!name) return false;
  state.data.gearItems.push({
    id: Date.now(),
    name,
    category: clean(payload.category) || 'Required',
    qty: Math.max(1, Number(payload.qty || 1)),
    packed: false,
  });
  state.dirtyFlags.gearItems = true;
  return true;
}

function updateGearItem(state, id, payload = {}) {
  const item = state.data.gearItems.find(row => Number(row.id) === Number(id));
  const name = clean(payload.name);
  if (!item || !name) return false;
  item.name = name;
  item.category = clean(payload.category) || 'Required';
  item.qty = Math.max(1, Number(payload.qty || 1));
  state.dirtyFlags.gearItems = true;
  return true;
}

function toggleGearItem(state, id) {
  const item = state.data.gearItems.find(row => Number(row.id) === Number(id));
  if (!item) return false;
  item.packed = !item.packed;
  state.dirtyFlags.gearItems = true;
  return true;
}

function deleteGearItem(state, id) {
  const before = state.data.gearItems.length;
  state.data.gearItems = state.data.gearItems.filter(item => Number(item.id) !== Number(id));
  state.dirtyFlags.gearItems = before !== state.data.gearItems.length;
  return state.dirtyFlags.gearItems;
}

function getGearPayloadFromDom(root = document) {
  return {
    name: root.querySelector('[data-gear-name]')?.value,
    category: root.querySelector('[data-gear-category]')?.value,
    qty: root.querySelector('[data-gear-qty]')?.value,
  };
}

function isPrepFocusMatch(focus = {}, section = '', label = '') {
  return focus.section === section && clean(focus.query).toLowerCase() === clean(label).toLowerCase();
}

function filterChecklistItems(items = [], filters = {}) {
  return items.filter((item) => {
    const haystack = clean(item.label).toLowerCase();
    if (filters.search && !haystack.includes(filters.search)) return false;
    if (filters.status === 'open' && item.done) return false;
    if (filters.status === 'done' && !item.done) return false;
    return true;
  });
}

function filterGearItems(items = [], filters = {}) {
  return items.filter((item) => {
    const haystack = `${item.name || ''} ${item.category || ''} ${item.qty || ''}`.toLowerCase();
    if (filters.search && !haystack.includes(filters.search)) return false;
    if (filters.status === 'open' && item.packed) return false;
    if (filters.status === 'done' && !item.packed) return false;
    return true;
  });
}

function getActivePrepFilterChips(filters = {}) {
  const statusLabels = {
    open: t('prepIncomplete'),
    done: t('prepComplete'),
  };
  return [
    filters.search ? { key: 'search', label: t('search'), value: filters.search } : null,
    filters.status ? { key: 'status', label: t('status'), value: statusLabels[filters.status] || filters.status } : null,
  ].filter(Boolean);
}

function renderPrepSectionHeading(label, visibleCount, totalCount) {
  return `
    <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap">
      <h2 style="margin:0">${escapeHtml(label)}</h2>
      <span class="badge mid" data-prep-visible-count>${escapeHtml(visibleCount)}/${escapeHtml(totalCount)}</span>
    </div>`;
}

function renderChecklist(listName, items = [], options = {}) {
  const totalCount = (options.allItems || items).length;
  const editingItem = options.editingChecklist?.listName === listName
    ? (options.allItems || items).find(item => Number(item.id) === Number(options.editingChecklist.id))
    : null;
  return `
    <div style="display:grid;gap:6px">
      ${items.map(item => `
        <div data-prep-focus-row="${escapeHtml(listName)}" style="display:flex;gap:8px;align-items:center;border:1px solid ${isPrepFocusMatch(options.prepFocus, listName, item.label) ? 'var(--orange)' : 'var(--border)'};border-left:4px solid ${isPrepFocusMatch(options.prepFocus, listName, item.label) ? 'var(--orange)' : 'var(--border)'};border-radius:8px;background:var(--input-bg);padding:8px;font-weight:800">
          <label style="display:flex;gap:8px;align-items:center;flex:1">
            <input type="checkbox" data-checklist="${listName}" data-check-id="${item.id}" ${item.done ? 'checked' : ''}>
            <span>${escapeHtml(item.label)}</span>
          </label>
          <button class="btn btn-sm" type="button" data-checklist-edit="${listName}" data-check-id="${item.id}">${escapeHtml(t('edit'))}</button>
          <button class="btn btn-sm btn-danger" type="button" data-checklist-delete="${listName}" data-check-id="${item.id}">${escapeHtml(t('delete'))}</button>
        </div>
      `).join('') || `<div style="color:var(--muted);font-weight:900">${escapeHtml(totalCount ? t('noMatchingItems') : t('noItemsYet'))}</div>`}
      <div style="display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:end">
        <label>${escapeHtml(t('newChecklistItem'))}<input data-checklist-input="${listName}" value="${escapeHtml(editingItem?.label || '')}" placeholder="${escapeHtml(t('newChecklistItem'))}"></label>
        ${editingItem
          ? `<button class="btn btn-primary" type="button" data-checklist-update="${listName}">${escapeHtml(t('updateChecklistItem'))}</button>`
          : `<button class="btn btn-primary" type="button" data-checklist-add="${listName}">${escapeHtml(t('addItem'))}</button>`}
        ${editingItem ? `<button class="btn" type="button" data-checklist-cancel-edit>${escapeHtml(t('cancelEdit'))}</button>` : ''}
      </div>
      ${editingItem ? `<div style="font-size:.78rem;color:var(--muted);font-weight:800">${escapeHtml(t('editingChecklistItem'))}: ${escapeHtml(editingItem.label)}</div>` : ''}
    </div>`;
}

function renderGearItems(items = [], categories = [], options = {}) {
  const totalCount = (options.allItems || items).length;
  const editingGear = (options.allItems || items).find(item => Number(item.id) === Number(options.editingGearId));
  return `
    <div style="display:grid;gap:8px">
      ${items.map(item => `
        <div data-prep-focus-row="gearItems" style="display:grid;grid-template-columns:1fr auto auto auto;gap:8px;align-items:center;border:1px solid ${isPrepFocusMatch(options.prepFocus, 'gearItems', item.name) ? 'var(--orange)' : 'var(--border)'};border-left:4px solid ${isPrepFocusMatch(options.prepFocus, 'gearItems', item.name) ? 'var(--orange)' : 'var(--border)'};border-radius:8px;background:var(--input-bg);padding:8px">
          <label style="display:flex;gap:8px;align-items:center;font-weight:900">
            <input type="checkbox" data-gear-packed="${escapeHtml(item.id)}" ${item.packed ? 'checked' : ''}>
            <span>${escapeHtml(item.name)}</span>
          </label>
          <span class="badge ${item.packed ? 'done' : 'mid'}">${escapeHtml(item.category || 'Required')} x${escapeHtml(item.qty || 1)}</span>
          <button class="btn btn-sm" type="button" data-gear-edit="${escapeHtml(item.id)}">${escapeHtml(t('edit'))}</button>
          <button class="btn btn-sm btn-danger" type="button" data-gear-delete="${escapeHtml(item.id)}">${escapeHtml(t('delete'))}</button>
        </div>
      `).join('') || `<div style="color:var(--muted);font-weight:900">${escapeHtml(totalCount ? t('noMatchingItems') : t('noGearYet'))}</div>`}
      <div style="display:grid;grid-template-columns:2fr 1fr 90px auto auto;gap:8px;align-items:end">
        <label>${escapeHtml(t('gearName'))}<input data-gear-name value="${escapeHtml(editingGear?.name || '')}" placeholder="${escapeHtml(t('gearName'))}"></label>
        <label>${escapeHtml(t('category'))}<input data-gear-category list="gear-category-list" value="${escapeHtml(editingGear?.category || '')}" placeholder="${escapeHtml(t('category'))}"></label>
        <label>${escapeHtml(t('qty'))}<input data-gear-qty type="number" min="1" value="${escapeHtml(editingGear?.qty || 1)}"></label>
        ${editingGear
          ? `<button class="btn btn-primary" type="button" data-gear-update>${escapeHtml(t('updateGear'))}</button>`
          : `<button class="btn btn-primary" type="button" data-gear-add>${escapeHtml(t('addItem'))}</button>`}
        ${editingGear ? `<button class="btn" type="button" data-gear-cancel-edit>${escapeHtml(t('cancelEdit'))}</button>` : ''}
      </div>
      ${editingGear ? `<div style="font-size:.78rem;color:var(--muted);font-weight:800">${escapeHtml(t('editingGear'))}: ${escapeHtml(editingGear.name)}</div>` : ''}
      <datalist id="gear-category-list">${categories.map(category => `<option value="${escapeHtml(category)}"></option>`).join('')}</datalist>
    </div>`;
}

function renderPrepCenter(state, options = {}) {
  const taskStats = getTaskStats(state.data.tasks);
  const checklistDone = state.data.checklist.filter(item => item.done).length;
  const prediveDone = state.data.prediveChecklist.filter(item => item.done).length;
  const gearPacked = state.data.gearItems.filter(item => item.packed).length;
  const gearCategories = state.data.masterData?.gearCats || [];
  const prepFocus = options.prepFocus || null;
  const filters = normalizePrepFilters(options.filters);
  const visibleChecklist = filterChecklistItems(state.data.checklist, filters);
  const visiblePredive = filterChecklistItems(state.data.prediveChecklist, filters);
  const visibleGear = filterGearItems(state.data.gearItems, filters);
  const activeFilterChips = getActivePrepFilterChips(filters);
  return `
    <section id="page-prep" class="page active" style="display:grid;gap:12px">
      <div class="page-topbar">
        <div>
          <h1 style="margin:0;color:var(--navy)">${escapeHtml(t('prepCenter'))}</h1>
          <div class="page-top-summary">${escapeHtml(t('prepSummary'))}</div>
        </div>
        <div class="page-top-summary">${escapeHtml(t('openTasks'))} ${taskStats.open} | ${escapeHtml(t('blocked'))} ${taskStats.blocked}</div>
      </div>
      <div class="card-grid">
        ${[
          [t('tasksOpen'), taskStats.open],
          [t('checklist'), `${checklistDone}/${state.data.checklist.length}`],
          [t('preDive'), `${prediveDone}/${state.data.prediveChecklist.length}`],
          [t('gearItems'), `${gearPacked}/${state.data.gearItems.length}`],
        ].map(([label, value]) => `
          <div class="card"><div style="font-size:.78rem;color:var(--muted);font-weight:900">${label}</div><div style="font-size:1.6rem;font-weight:900;color:var(--navy)">${value}</div></div>
        `).join('')}
      </div>
      ${prepFocus?.section ? `<div class="card" data-prep-focus-summary>
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap">
          <div>
            <h2 style="margin:0">${escapeHtml(t('prepFocus'))}</h2>
            <div style="font-size:.82rem;color:var(--muted);font-weight:800;margin-top:4px">${escapeHtml(prepFocus.query || '-')}</div>
          </div>
          <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
            <span class="badge mid">${escapeHtml(prepFocus.section)}</span>
            <button class="btn btn-sm" type="button" data-prep-clear-focus>${escapeHtml(t('clearFocus'))}</button>
          </div>
        </div>
      </div>` : ''}
      <div class="card">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px;align-items:end;margin-bottom:10px">
          <label>${escapeHtml(t('search'))}<input data-prep-search value="${escapeHtml(filters.search)}" placeholder="${escapeHtml(t('searchPrep'))}"></label>
          <label>${escapeHtml(t('status'))}<select data-prep-status-filter>
            ${[
              ['', t('allPrepStatuses')],
              ['open', t('prepIncomplete')],
              ['done', t('prepComplete')],
            ].map(([value, label]) => `<option value="${escapeHtml(value)}" ${filters.status === value ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('')}
          </select></label>
          <button class="btn btn-sm" type="button" data-prep-clear-filters>${escapeHtml(t('clearFilters'))}</button>
        </div>
        <div data-prep-active-filters style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;min-height:24px">
          ${activeFilterChips.length ? `<strong style="font-size:.76rem;color:var(--muted)">${escapeHtml(t('activeFilters'))}</strong>${activeFilterChips.map(chip => `<button class="badge mid" type="button" data-prep-remove-filter="${escapeHtml(chip.key)}" title="${escapeHtml(t('removeFilter'))}" style="cursor:pointer">${escapeHtml(chip.label)}: ${escapeHtml(chip.value)} x</button>`).join('')}` : `<span style="font-size:.76rem;color:var(--muted);font-weight:800">${escapeHtml(t('noActiveFilters'))}</span>`}
        </div>
      </div>
      <div class="card">
        ${renderPrepSectionHeading(t('buildChecklist'), visibleChecklist.length, state.data.checklist.length)}
        ${renderChecklist('checklist', visibleChecklist, { editingChecklist: options.editingChecklist, prepFocus, allItems: state.data.checklist })}
      </div>
      <div class="card">
        ${renderPrepSectionHeading(t('preDiveChecklist'), visiblePredive.length, state.data.prediveChecklist.length)}
        ${renderChecklist('prediveChecklist', visiblePredive, { editingChecklist: options.editingChecklist, prepFocus, allItems: state.data.prediveChecklist })}
      </div>
      <div class="card">
        ${renderPrepSectionHeading(t('gearItems'), visibleGear.length, state.data.gearItems.length)}
        ${renderGearItems(visibleGear, gearCategories, { editingGearId: options.editingGearId, prepFocus, allItems: state.data.gearItems })}
      </div>
    </section>`;
}

return { normalizePrepFilters, toggleChecklistItem, addChecklistItem, updateChecklistItem, deleteChecklistItem, addGearItem, updateGearItem, toggleGearItem, deleteGearItem, getGearPayloadFromDom, renderChecklist, renderGearItems, renderPrepCenter };
})();

const __src_features_settings_js = (() => {
const { escapeHtml, safeJsonParse } = __src_utils_index_js;
const { t } = __src_utils_i18n_js;
const { getDataHealthIssues } = __src_features_health_js;
const MASTER_DATA_STORAGE_PREFIX = 'rov_v16_master_data_';
const SETTINGS_PACK_TYPE = 'rov_v16_settings_pack';

const MASTER_DATA_TYPES = {
  roles: 'Roles',
  groups: 'Groups',
  taskTypes: 'Task Types',
  gearCats: 'Gear Categories',
};

function cleanMasterValue(value) {
  return String(value || '').trim();
}

function uniqueSorted(values) {
  return [...new Set(values.map(cleanMasterValue).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'en'));
}

function getMasterData(state) {
  const data = state?.data?.masterData || {};
  return Object.fromEntries(
    Object.keys(MASTER_DATA_TYPES).map(type => [type, uniqueSorted(data[type] || [])]),
  );
}

function getMasterDataStorageKey(season = 'default') {
  return `${MASTER_DATA_STORAGE_PREFIX}${season || 'default'}`;
}

function loadMasterData(state, storage = localStorage) {
  const key = getMasterDataStorageKey(state?.currentSeason);
  const saved = safeJsonParse(storage.getItem(key), null);
  if (!saved) return getMasterData(state);
  state.data.masterData = {
    ...getMasterData(state),
    ...Object.fromEntries(
      Object.keys(MASTER_DATA_TYPES).map(type => [type, uniqueSorted(saved[type] || [])]),
    ),
  };
  return getMasterData(state);
}

function saveMasterData(state, storage = localStorage) {
  const data = getMasterData(state);
  storage.setItem(getMasterDataStorageKey(state?.currentSeason), JSON.stringify(data));
  state.dirtyFlags.masterData = false;
  return data;
}

function addMasterDataValue(state, type, value) {
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

function deleteMasterDataValue(state, type, value) {
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

function buildSettingsPack(state, smokeHistory = []) {
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

function importSettingsPackPayload(state, payload) {
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

function exportSettingsPack(state, smokeHistory = [], documentRef = document) {
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
  const summarizeTask = task => ({
    id: task.id,
    name: task.name || '',
    owner: task.owner || '',
    due: task.due || '',
    priority: task.priority || '',
    status: task.status || '',
    blocked: Boolean(task.blocked),
    category: task.category || '',
  });
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

function buildHandoffReport(options = {}) {
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
  const operationalSummary = buildOperationalSummary(state);
  const healthIssues = getDataHealthIssues(state);
  return {
    type: 'rov_v16_handoff_report',
    version: 1,
    appVersion: 'v16',
    exportedAt: new Date().toISOString(),
    season: state?.currentSeason || 'default',
    readiness,
    counts: {
      tasks: stats.tasks,
      members: stats.members,
      checklist: stats.checklist,
      missionRuns: stats.missionRuns,
      gearItems: stats.gearItems,
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
    supabase: {
      dbLoadedAt: dbStatus?.loadedAt || '',
      dbError: dbStatus?.error || '',
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

function exportHandoffReport(options = {}, documentRef = document) {
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

function getSettingsCenterStats(state, smokeHistory = [], migrationSummary = null, dbStatus = null, syncPreview = null, writeResult = null, postWritePreview = null, schemaStatus = null, writeAuditLog = [], rollbackSummary = null, diagnosticsSummary = null) {
  const data = state?.data || {};
  const masterData = getMasterData(state);
  const latestSmoke = smokeHistory[0] || null;
  const failedSmoke = latestSmoke?.checks?.filter(check => !check.ok).length || 0;
  const healthIssues = getDataHealthIssues(state);
  return {
    tasks: data.tasks?.length || 0,
    members: data.members?.length || 0,
    checklist: data.checklist?.length || 0,
    missionRuns: data.missionRuns?.length || 0,
    gearItems: data.gearItems?.length || 0,
    masterData,
    masterTotal: Object.values(masterData).reduce((sum, values) => sum + values.length, 0),
    smokeRuns: smokeHistory.length,
    healthIssues,
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

function scrollSettingsSection(id, root = document) {
  const target = root.getElementById(id);
  if (!target) return false;
  if (target.tagName === 'DETAILS') target.open = true;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return true;
}

function renderSettingsHub(container, options = {}) {
  if (!container) return;
  const { state, smokeHistory = [], migrationSummary = null, dbStatus = null, syncPreview = null, writeResult = null, postWritePreview = null, schemaStatus = null, writeAuditLog = [], rollbackSummary = null, diagnosticsSummary = null } = options;
  const stats = getSettingsCenterStats(state, smokeHistory, migrationSummary, dbStatus, syncPreview, writeResult, postWritePreview, schemaStatus, writeAuditLog, rollbackSummary, diagnosticsSummary);
  const systemOk = stats.latestSmoke ? stats.failedSmoke === 0 : false;
  const readiness = buildReleaseReadiness(stats);
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
          <button class="btn btn-sm" type="button" data-settings-scroll="settings-sync-section">${escapeHtml(t('syncPreview'))}</button>
          <button class="btn btn-sm" type="button" data-settings-scroll="settings-write-section">${escapeHtml(t('writeSync'))}</button>
          <button class="btn btn-sm" type="button" data-settings-scroll="settings-audit-section">${escapeHtml(t('audit'))}</button>
          <button class="btn btn-sm" type="button" data-settings-scroll="settings-rollback-section">${escapeHtml(t('rollback'))}</button>
          <button class="btn btn-sm" type="button" data-settings-scroll="settings-migration-section">${escapeHtml(t('v15Import'))}</button>
          <button class="btn btn-sm" type="button" data-settings-scroll="settings-pack-section">${escapeHtml(t('settingsPack'))}</button>
          <button class="btn btn-sm" type="button" data-settings-scroll="settings-health-section">System / QA</button>
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
              <div style="display:grid;grid-template-columns:auto 1fr;gap:7px;align-items:start;border:1px solid var(--border);border-radius:8px;background:var(--white);padding:7px">
                <span class="badge ${check.ok ? 'done' : 'mid'}">${escapeHtml(check.ok ? 'OK' : 'TODO')}</span>
                <div>
                  <div style="font-size:.78rem;font-weight:900;color:var(--navy)">${escapeHtml(check.label)}</div>
                  <div style="font-size:.74rem;color:var(--muted);font-weight:800;line-height:1.35">${escapeHtml(check.detail)}</div>
                </div>
              </div>
            `).join('')}
          </div>
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
              ['Loaded', stats.dbStatus.loadedAt ? new Date(stats.dbStatus.loadedAt).toLocaleTimeString() : '-'],
              ['Load ms', stats.dbStatus.loadMs ?? '-'],
              ['Status', stats.dbStatus.error ? 'Error' : 'Read-only'],
            ].map(([label, value]) => `
              <div style="border:1px solid var(--border);border-radius:8px;background:var(--input-bg);padding:8px">
                <div style="font-size:.73rem;color:var(--muted);font-weight:900">${escapeHtml(label)}</div>
                <div style="font-size:1.05rem;font-weight:900;color:${stats.dbStatus.error ? 'var(--red)' : 'var(--navy)'}">${escapeHtml(value)}</div>
              </div>
            `).join('')}
          </div>
          ${stats.dbStatus.error ? `<div style="font-size:.82rem;color:var(--red);font-weight:900">${escapeHtml(stats.dbStatus.error)}</div>` : `
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

      <div id="settings-sync-section" class="card">
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:10px">
          <div>
            <h2 style="margin-bottom:4px">${escapeHtml(t('supabaseSyncPreview'))}</h2>
            <div style="font-size:.82rem;color:var(--muted);font-weight:800">${escapeHtml(t('syncPreviewHint'))}</div>
          </div>
          <button class="btn btn-sm btn-primary" type="button" data-action="build-sync-preview">${escapeHtml(t('buildPreview'))}</button>
        </div>
        ${stats.syncPreview ? `
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin-bottom:8px">
            ${[
              ['Create', stats.syncPreview.totalCreate],
              ['Update', stats.syncPreview.totalUpdate],
              ['Remove', stats.syncPreview.totalRemove],
              ['Mode', stats.syncPreview.mode],
            ].map(([label, value]) => `
              <div style="border:1px solid var(--border);border-radius:8px;background:var(--input-bg);padding:8px">
                <div style="font-size:.73rem;color:var(--muted);font-weight:900">${escapeHtml(label)}</div>
                <div style="font-size:1.15rem;font-weight:900;color:var(--navy)">${escapeHtml(value)}</div>
              </div>
            `).join('')}
          </div>
          <div style="display:grid;gap:6px">
            ${stats.syncPreview.tables.map(table => `
              <details style="border:1px solid var(--border);border-radius:8px;background:var(--input-bg);padding:8px">
                <summary style="display:grid;grid-template-columns:1fr repeat(5,auto);gap:8px;align-items:center;cursor:pointer">
                  <strong>${escapeHtml(table.label)}</strong>
                  <span style="font-size:.76rem;color:var(--muted);font-weight:900">L ${escapeHtml(table.local)}</span>
                  <span style="font-size:.76rem;color:var(--muted);font-weight:900">R ${escapeHtml(table.remote)}</span>
                  <span class="badge done">+${escapeHtml(table.create)}</span>
                  <span class="badge mid">~${escapeHtml(table.update)}</span>
                  <span class="badge urgent">-${escapeHtml(table.remove)}</span>
                </summary>
                <div style="display:grid;gap:6px;margin-top:8px">
                  ${renderSyncDetailGroup('Create', table.details.create)}
                  ${renderSyncUpdateDetailGroup(table.details.update)}
                  ${renderSyncDetailGroup('Remove skipped', table.details.remove)}
                </div>
              </details>
            `).join('')}
          </div>
          <div style="font-size:.78rem;color:var(--muted);font-weight:800;margin-top:8px">Generated ${escapeHtml(new Date(stats.syncPreview.ts).toLocaleString())}. Writes remain disabled.</div>
        ` : `<div style="font-size:.82rem;color:var(--muted);font-weight:800">${escapeHtml(t('noPreviewYet'))}</div>`}
      </div>

      <div id="settings-write-section" class="card">
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:10px">
          <div>
            <h2 style="margin-bottom:4px">${escapeHtml(t('guardedWriteSync'))}</h2>
            <div style="font-size:.82rem;color:var(--muted);font-weight:800">${escapeHtml(t('guardedWriteHint'))}</div>
          </div>
        </div>
        <div style="display:grid;gap:8px">
          <label>${escapeHtml(t('confirmation'))}
            <input data-sync-confirm placeholder="Type SYNC V16">
          </label>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${['tasks', 'members', 'checklist_items', 'predive_checklist_items'].map(table => `
              <label style="display:flex;gap:6px;align-items:center;border:1px solid var(--border);border-radius:999px;background:var(--input-bg);padding:5px 9px;font-weight:900;font-size:.8rem">
                <input type="checkbox" data-sync-table="${escapeHtml(table)}" checked> ${escapeHtml(table)}
              </label>
            `).join('')}
          </div>
          <button class="btn btn-sm btn-danger" type="button" data-action="execute-guarded-write-sync">${escapeHtml(t('executeGuardedWriteSync'))}</button>
        </div>
        ${stats.writeResult ? `
          <div style="display:grid;gap:6px;margin-top:10px">
            ${stats.writeResult.results.map(result => `
              <div style="display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:center;border:1px solid var(--border);border-left:4px solid ${result.ok ? 'var(--green)' : 'var(--red)'};border-radius:8px;background:var(--input-bg);padding:8px">
                <strong>${escapeHtml(result.table)}</strong>
                <span class="badge done">wrote ${escapeHtml(result.written)}</span>
                <span class="badge mid">skipped delete ${escapeHtml(result.skippedDelete)}</span>
                ${result.droppedFields?.length ? `<span class="badge mid">dropped ${escapeHtml(result.droppedFields.length)}</span>` : ''}
                ${result.error ? `<div style="grid-column:1/-1;font-size:.76rem;color:var(--red);font-weight:800">${escapeHtml(result.error)}</div>` : ''}
                ${result.droppedFields?.length ? `<div style="grid-column:1/-1;font-size:.76rem;color:var(--muted);font-weight:800">Dropped fields: ${escapeHtml(result.droppedFields.join(', '))}</div>` : ''}
              </div>
            `).join('')}
            <div style="font-size:.78rem;color:var(--muted);font-weight:800">Executed ${escapeHtml(new Date(stats.writeResult.ts).toLocaleString())}. Delete sync remained disabled.</div>
          </div>
        ` : `<div style="font-size:.82rem;color:var(--muted);font-weight:800;margin-top:8px">${escapeHtml(t('noWriteSyncYet'))} Writable fields: tasks(id,name,owner,due,priority,status,cat), members(id,name,role), checklist item_id/label/done/order_index.</div>`}
        ${stats.postWritePreview ? `
          <div style="border:1px solid var(--border);border-left:4px solid ${(stats.postWritePreview.totalCreate + stats.postWritePreview.totalUpdate + stats.postWritePreview.totalRemove) === 0 ? 'var(--green)' : 'var(--orange)'};border-radius:8px;background:var(--input-bg);padding:8px;margin-top:10px">
            <div style="font-size:.82rem;font-weight:900;color:var(--navy)">${escapeHtml(t('postWriteVerification'))}</div>
            <div style="font-size:.78rem;color:var(--muted);font-weight:800">
              Remaining diff: create ${escapeHtml(stats.postWritePreview.totalCreate)}, update ${escapeHtml(stats.postWritePreview.totalUpdate)}, remove ${escapeHtml(stats.postWritePreview.totalRemove)}
            </div>
          </div>
        ` : ''}
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

      <div id="settings-rollback-section" class="card">
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:10px">
          <div>
            <h2 style="margin-bottom:4px">${escapeHtml(t('rollbackFromBackup'))}</h2>
            <div style="font-size:.82rem;color:var(--muted);font-weight:800">${escapeHtml(t('rollbackHint'))}</div>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <input type="file" id="v16-backup-restore-file" accept="application/json,.json" style="display:none" data-v16-backup-file>
            <button class="btn btn-sm" type="button" data-action="export-v16-backup">${escapeHtml(t('exportV16Backup'))}</button>
            <button class="btn btn-sm btn-primary" type="button" data-action="choose-v16-backup">${escapeHtml(t('restoreV16Backup'))}</button>
          </div>
        </div>
        ${stats.rollbackSummary ? `
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px">
            ${[
              ['Tasks', stats.rollbackSummary.tasks],
              ['Members', stats.rollbackSummary.members],
              ['Runs', stats.rollbackSummary.missionRuns],
              ['Season', stats.rollbackSummary.season || '-'],
            ].map(([label, value]) => `
              <div style="border:1px solid var(--border);border-radius:8px;background:var(--input-bg);padding:8px">
                <div style="font-size:.73rem;color:var(--muted);font-weight:900">${escapeHtml(label)}</div>
                <div style="font-size:1.05rem;font-weight:900;color:var(--navy)">${escapeHtml(value)}</div>
              </div>
            `).join('')}
          </div>
          <div style="font-size:.78rem;color:var(--muted);font-weight:800;margin-top:8px">Restored ${escapeHtml(new Date(stats.rollbackSummary.restoredAt).toLocaleString())} from backup ${escapeHtml(stats.rollbackSummary.exportedAt || '-')}</div>
        ` : `<div style="font-size:.82rem;color:var(--muted);font-weight:800">${escapeHtml(t('noRollbackYet'))}</div>`}
        <div style="border:1px solid var(--border);border-left:4px solid var(--red);border-radius:8px;background:var(--input-bg);padding:9px;margin-top:10px;display:grid;gap:7px">
          <div>
            <div style="font-size:.84rem;font-weight:900;color:var(--navy)">${escapeHtml(t('resetLocalData'))}</div>
            <div style="font-size:.78rem;color:var(--muted);font-weight:800">${escapeHtml(t('resetLocalDataHint'))}</div>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <button class="btn btn-sm btn-danger" type="button" data-action="reset-v16-local-data">${escapeHtml(t('resetLocalData'))}</button>
            <span style="font-size:.76rem;color:var(--muted);font-weight:900">RESET V16</span>
          </div>
        </div>
      </div>

      <div id="settings-migration-section" class="card">
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:10px">
          <div>
            <h2 style="margin-bottom:4px">${escapeHtml(t('v15BackupImport'))}</h2>
            <div style="font-size:.82rem;color:var(--muted);font-weight:800">${escapeHtml(t('v15BackupImportHint'))}</div>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <input type="file" id="v15-backup-import-file" accept="application/json,.json" style="display:none" data-v15-backup-file>
            <button class="btn btn-sm btn-primary" type="button" data-action="choose-v15-backup">${escapeHtml(t('importV15Backup'))}</button>
          </div>
        </div>
        ${stats.migrationSummary ? `
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px">
            ${[
              ['Tasks', stats.migrationSummary.tasks],
              ['Members', stats.migrationSummary.members],
              ['Checklist', stats.migrationSummary.checklist],
              ['Pre-Dive', stats.migrationSummary.prediveChecklist],
              ['Runs', stats.migrationSummary.missionRuns],
              ['Gear', stats.migrationSummary.gearItems],
            ].map(([label, value]) => `
              <div style="border:1px solid var(--border);border-radius:8px;background:var(--input-bg);padding:8px">
                <div style="font-size:.73rem;color:var(--muted);font-weight:900">${escapeHtml(label)}</div>
                <div style="font-size:1.15rem;font-weight:900;color:var(--navy)">${escapeHtml(value)}</div>
              </div>
            `).join('')}
          </div>
          <div style="font-size:.78rem;color:var(--muted);font-weight:800;margin-top:8px">Last import: season ${escapeHtml(stats.migrationSummary.season || '-')} | ${escapeHtml(stats.migrationSummary.exportedAt || 'unknown export time')}</div>
        ` : `<div style="font-size:.82rem;color:var(--muted);font-weight:800">${escapeHtml(t('noV15ImportYet'))}</div>`}
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
          <div style="font-size:.82rem;color:var(--muted);font-weight:800">Shared options for roles, groups, task types, and gear categories.</div>
          <span class="badge done">${stats.masterTotal}</span>
        </div>
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
              <div style="display:grid;grid-template-columns:auto 1fr;gap:8px;align-items:start;border:1px solid var(--border);border-radius:8px;background:var(--white);padding:7px">
                <span class="badge ${issue.level === 'urgent' ? 'urgent' : 'mid'}">${escapeHtml(issue.level || 'warn')}</span>
                <div>
                  <div style="font-size:.78rem;font-weight:900;color:var(--navy)">${escapeHtml(issue.title || t('healthIssues'))}</div>
                  <div style="font-size:.74rem;color:var(--muted);font-weight:800">${escapeHtml(issue.detail || '-')}</div>
                </div>
              </div>
            `).join('') : `<div style="color:var(--green);font-weight:900">${escapeHtml(t('noHealthIssues'))}</div>`}
          </div>
        </div>
        <div style="border:1px solid var(--border);border-radius:8px;background:var(--input-bg);padding:8px;margin-bottom:10px">
          <div style="font-size:.82rem;font-weight:900;color:var(--navy);margin-bottom:6px">${escapeHtml(t('diagnosticsViewer'))}</div>
          ${stats.diagnosticsSummary ? `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(125px,1fr));gap:8px">
              ${[
                ['Season', stats.diagnosticsSummary.season || '-'],
                ['Tasks', stats.diagnosticsSummary.counts.tasks || 0],
                ['Smoke', stats.diagnosticsSummary.latestSmokeOk === null ? '-' : (stats.diagnosticsSummary.latestSmokeOk ? 'OK' : 'FAIL')],
                ['Health', stats.diagnosticsSummary.healthIssues],
                ['Audit', stats.diagnosticsSummary.writeAuditEntries],
              ].map(([label, value]) => `
                <div style="border:1px solid var(--border);border-radius:8px;background:var(--white);padding:8px">
                  <div style="font-size:.72rem;color:var(--muted);font-weight:900">${escapeHtml(label)}</div>
                  <div style="font-size:1rem;font-weight:900;color:var(--navy)">${escapeHtml(value)}</div>
                </div>
              `).join('')}
            </div>
            <div style="font-size:.76rem;color:var(--muted);font-weight:800;margin-top:8px">Exported ${escapeHtml(stats.diagnosticsSummary.exportedAt || '-')} | Imported ${escapeHtml(new Date(stats.diagnosticsSummary.importedAt).toLocaleString())}</div>
            <div style="display:grid;gap:6px;margin-top:10px">
              ${renderDiagnosticsSmoke(stats.diagnosticsSummary)}
              ${renderDiagnosticsHealth(stats.diagnosticsSummary.healthRows)}
              ${renderDiagnosticsSync(stats.diagnosticsSummary.syncPreview, stats.diagnosticsSummary.postWritePreview)}
              ${renderDiagnosticsDb(stats.diagnosticsSummary.dbTables, stats.diagnosticsSummary.schemaTables)}
              ${renderDiagnosticsAudit(stats.diagnosticsSummary.writeAuditLog)}
            </div>
          ` : `<div style="font-size:.8rem;color:var(--muted);font-weight:800">${escapeHtml(t('noDiagnosticsImported'))}</div>`}
        </div>
        <div id="v16-smoke-report" style="margin-top:10px"></div>
      </details>
    </section>`;
}

function renderMasterDataList(type, label, values) {
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

function buildReleaseReadiness(stats) {
  const hasData = (stats.tasks + stats.members + stats.checklist + stats.missionRuns + stats.gearItems) > 0;
  const smokeOk = Boolean(stats.latestSmoke && stats.failedSmoke === 0);
  const healthOk = (stats.healthIssues || []).length === 0;
  const schemaOk = Boolean(stats.schemaStatus && Object.keys(stats.schemaStatus.tables || {}).length);
  const syncPrepared = Boolean(stats.syncPreview || stats.postWritePreview);
  const backupReady = true;
  const diagnosticsReady = true;
  const writeGuardReady = true;
  const checks = [
    {
      label: 'Workflow smoke',
      ok: smokeOk,
      detail: smokeOk ? 'Latest in-app smoke passed.' : 'Run Smoke Test before handoff.',
    },
    {
      label: 'Local data',
      ok: hasData,
      detail: hasData ? 'Local working data is present.' : 'Import v15 backup or add demo data.',
    },
    {
      label: 'Data health',
      ok: healthOk,
      detail: healthOk ? 'No local data health issues found.' : `${stats.healthIssues.length} data health issue(s) need review.`,
    },
    {
      label: 'Schema probe',
      ok: schemaOk,
      detail: schemaOk ? 'Supabase writable fields were probed.' : 'Run schema probe before write sync.',
    },
    {
      label: 'Sync review',
      ok: syncPrepared,
      detail: syncPrepared ? 'Dry-run or post-write diff is available.' : 'Build sync preview after DB read.',
    },
    {
      label: 'Backup path',
      ok: backupReady,
      detail: 'Manual export, auto backup, and restore are available.',
    },
    {
      label: 'Safety guard',
      ok: writeGuardReady,
      detail: 'Writes require confirmation, schema whitelist, and no deletes.',
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

function renderDiagnosticsSmoke(summary) {
  const latest = summary.latestSmoke;
  const checks = latest?.checks || [];
  return `
    <details style="border:1px solid var(--border);border-radius:8px;background:var(--white);padding:8px">
      <summary style="cursor:pointer;font-weight:900;color:var(--navy)">Diagnostics Smoke (${escapeHtml(summary.smokeRuns || 0)})</summary>
      ${latest ? `
        <div style="display:grid;gap:5px;margin-top:8px">
          <div style="font-size:.78rem;color:${latest.ok ? 'var(--green)' : 'var(--red)'};font-weight:900">Latest ${escapeHtml(latest.ok ? 'OK' : 'FAIL')} | ${escapeHtml(new Date(latest.ts).toLocaleString())}</div>
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

function renderDiagnosticsDb(dbTables = {}, schemaTables = {}) {
  const dbRows = Object.entries(dbTables);
  const schemaRows = Object.entries(schemaTables);
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
            <div style="font-size:.8rem;font-weight:900;color:var(--navy)">${escapeHtml(entry.ts ? new Date(entry.ts).toLocaleString() : '-')}</div>
            <div style="font-size:.76rem;color:var(--muted);font-weight:800">Tables ${(entry.tables || []).join(', ') || '-'} | wrote ${escapeHtml(entry.write?.written || 0)} | errors ${escapeHtml(entry.write?.errors?.length || 0)}</div>
          </div>
        `).join('') || '<div style="font-size:.78rem;color:var(--muted);font-weight:800">No audit entries in package.</div>'}
      </div>
    </details>`;
}

return { cleanMasterValue, uniqueSorted, getMasterData, getMasterDataStorageKey, loadMasterData, saveMasterData, addMasterDataValue, deleteMasterDataValue, buildSettingsPack, importSettingsPackPayload, exportSettingsPack, buildHandoffReport, exportHandoffReport, getSettingsCenterStats, scrollSettingsSection, renderSettingsHub, renderMasterDataList, MASTER_DATA_STORAGE_PREFIX, SETTINGS_PACK_TYPE, MASTER_DATA_TYPES };
})();

const __src_app_js = (() => {
const { loadAppState, saveAppState } = __src_data_state_js;
const { importV15BackupPayload } = __src_data_migration_js;
const { buildDiagnosticsPayload, downloadDiagnosticsPayload, parseDiagnosticsPayload } = __src_data_diagnostics_js;
const { applySupabaseReadOnlyData, ensureSupabaseClient, loadSupabaseReadOnly, probeSupabaseSchema } = __src_data_supabase_js;
const { buildSupabaseSyncPreview, buildWriteAuditEntry, downloadLocalBackup, executeGuardedSupabaseWriteSync, getWriteAuditLog, restoreLocalBackupPayload, saveWriteAuditEntry, summarizeWriteResult } = __src_data_sync_js;
const { createMissionRun, deleteMissionRun, getRunPayloadFromDom, normalizeRunFilters, renderCompetitionCenter, updateMissionRun } = __src_features_competition_js;
const { getDataHealthIssues, getSmokeTestLog, renderSmokeTestPanel, saveSmokeTestResult } = __src_features_health_js;
const { addKnowledgeItem, createKnowledgeItemFromForm, deleteKnowledgeItem, normalizeKnowledgeFilters, renderIntelPage, updateKnowledgeItem, updateNotes } = __src_features_intel_js;
const { renderNavigation, showPage } = __src_features_navigation_js;
const { addMember, createMemberFromForm, deleteMember, normalizeMemberFilters, renderMembersPage, updateMember } = __src_features_members_js;
const { addChecklistItem, addGearItem, deleteChecklistItem, deleteGearItem, getGearPayloadFromDom, normalizePrepFilters, renderPrepCenter, toggleChecklistItem, toggleGearItem, updateChecklistItem, updateGearItem } = __src_features_prep_js;
const { addMasterDataValue, deleteMasterDataValue, exportHandoffReport, exportSettingsPack, importSettingsPackPayload, loadMasterData, renderSettingsHub, saveMasterData, scrollSettingsSection } = __src_features_settings_js;
const { addTask, createTaskFromForm, deleteTask, renderTasksPage, updateTask, updateTaskStatus } = __src_features_tasks_js;
const { escapeHtml } = __src_utils_index_js;
const { setLocale, t } = __src_utils_i18n_js;
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
let editingTaskId = null;
let editingMemberId = null;
let editingRunId = null;
let editingGearId = null;
let editingChecklist = null;
let editingIntelId = null;
let editingStrategyId = null;
let prepFocus = null;
let intelFocus = null;
const taskFilters = {
  search: '',
  owner: '',
  status: '',
  priority: '',
  category: '',
  health: '',
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

function persistAndRender() {
  saveAppState(appState);
  saveMasterData(appState);
  renderAppShell();
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
    ['sort', '[data-task-sort]'],
  ];
  const row = updates.find(([, selector]) => target.closest(selector));
  if (!row) return false;
  taskFilters[row[0]] = target.value || '';
  return true;
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
  const preset = target.closest('[data-task-search-preset], [data-task-health-preset], [data-task-priority-preset], [data-task-status-preset], [data-task-owner-preset], [data-task-category-preset]');
  if (!preset) return false;
  Object.assign(taskFilters, {
    search: preset.dataset.taskSearchPreset || '',
    owner: preset.dataset.taskOwnerPreset || '',
    status: preset.dataset.taskStatusPreset || '',
    priority: preset.dataset.taskPriorityPreset || '',
    category: preset.dataset.taskCategoryPreset || '',
    health: preset.dataset.taskHealthPreset || '',
    sort: taskFilters.sort || 'due-asc',
  });
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
    sort: taskFilters.sort || 'due-asc',
  });
}

function taskHealthPresetForIssue(issue) {
  if (issue?.title === 'Task has no owner') return 'unassigned';
  if (issue?.title === 'Task owner not in members') return 'missing-owner';
  if (issue?.title === 'High priority task has no due date') return 'high-no-due';
  return '';
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

function renderDashboard() {
  const data = appState.data;
  const health = getDataHealthIssues(appState);
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
  const runSummary = runScores.length ? {
    best: Math.max(...runScores),
    average: Math.round(runScores.reduce((sum, score) => sum + score, 0) / runScores.length),
    count: runScores.length,
  } : null;
  const actionItems = [
    ...blockedTasks.map(task => ({ level: 'urgent', label: t('blocked'), title: task.name, page: 'tasks', search: task.name })),
    ...overdueTasks.map(task => ({ level: 'urgent', label: t('overdue'), title: task.name, page: 'tasks', search: task.name })),
    ...highTasks.map(task => ({ level: 'mid', label: 'High', title: task.name, page: 'tasks', search: task.name })),
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
  }).filter(row => row.open || row.blocked || row.high)
    .sort((a, b) => b.blocked - a.blocked || b.high - a.high || b.open - a.open || String(a.member.name || '').localeCompare(String(b.member.name || ''), 'en'))
    .slice(0, 6);
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
      <div class="card-grid">
        ${[
          [t('openTasks'), openTasks],
          [t('blocked'), blockedTasks.length],
          [t('overdue'), overdueTasks.length],
          [t('members'), data.members.length],
          [t('missionRuns'), data.missionRuns.length],
          [t('healthIssues'), health.length],
        ].map(([label, value]) => `
          <div class="card"><div style="font-size:.78rem;color:var(--muted);font-weight:900">${label}</div><div style="font-size:1.6rem;font-weight:900;color:var(--navy)">${value}</div></div>
        `).join('')}
      </div>
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
          ${actionItems.length ? actionItems.map(item => `
            <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;border-left:4px solid ${item.level === 'urgent' ? 'var(--red)' : 'var(--orange)'};background:var(--input-bg);padding:8px;border-radius:8px">
              <div><strong>${escapeHtml(item.label)}</strong><div style="font-size:.8rem;color:var(--muted)">${escapeHtml(item.title)}</div></div>
              <button class="btn btn-sm" type="button" data-page="${escapeHtml(item.page)}" data-task-search-preset="${escapeHtml(item.search || '')}">${escapeHtml(t('open'))}</button>
            </div>
          `).join('') : `<div style="color:var(--green);font-weight:900">${escapeHtml(t('noActionItems'))}</div>`}
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
                  <div style="font-size:.78rem;color:var(--muted);font-weight:800">${escapeHtml(task.owner || 'Unassigned')} | ${escapeHtml(task.due || '-')} | ${escapeHtml(task.category || 'General')}</div>
                </div>
                <div style="display:flex;gap:5px;justify-content:flex-end;flex-wrap:wrap">
                  ${task.blocked ? `<span class="badge urgent">${escapeHtml(t('blocked'))}</span>` : ''}
                  ${isLate ? `<span class="badge urgent">${escapeHtml(t('overdue'))}</span>` : ''}
                  <span class="badge ${task.priority === 'High' ? 'mid' : task.priority === 'Low' ? 'done' : ''}">${escapeHtml(task.priority || 'Medium')}</span>
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
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
                <span class="badge">${escapeHtml(t('openTasks'))}: ${row.open}</span>
                <span class="badge" style="${row.blocked ? 'border-color:var(--red);color:var(--red)' : ''}">${escapeHtml(t('blocked'))}: ${row.blocked}</span>
                <span class="badge" style="${row.high ? 'border-color:var(--orange);color:var(--orange)' : ''}">High: ${row.high}</span>
              </div>
              <button class="btn btn-sm" type="button" data-page="tasks" data-dashboard-member-task-action data-task-owner-preset="${escapeHtml(row.member.name || '')}" style="margin-top:8px">${escapeHtml(t('open'))}</button>
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
                  <div style="font-size:.76rem;color:var(--muted);font-weight:800">${escapeHtml(task.owner || 'Unassigned')} | ${escapeHtml(task.due || '-')} | ${escapeHtml(task.priority || 'Medium')}</div>
                </div>
                <button class="btn btn-sm" type="button" data-page="tasks" data-task-health-preset="${escapeHtml((task.owner && task.owner !== 'Unassigned') ? 'missing-owner' : 'unassigned')}">${escapeHtml(t('assign'))}</button>
              </div>
            `).join('') : `<div style="color:var(--green);font-weight:900">${escapeHtml(t('noUnassignedTasks'))}</div>`}
          </div>
        </div>
      </div>
      <div class="card">
        <h2>${escapeHtml(t('dataHealth'))}</h2>
        ${health.length ? `<div style="display:grid;gap:6px">${health.map(issue => `
          <div style="display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;border-left:4px solid ${issue.level === 'urgent' ? 'var(--red)' : 'var(--orange)'};background:var(--input-bg);padding:8px;border-radius:8px">
            <div>
              <strong>${escapeHtml(issue.title)}</strong>
              <div style="font-size:.8rem;color:var(--muted)">${escapeHtml(issue.detail)}</div>
            </div>
            ${taskHealthPresetForIssue(issue) ? `<button class="btn btn-sm" type="button" data-page="tasks" data-dashboard-health-task-action data-task-health-preset="${escapeHtml(taskHealthPresetForIssue(issue))}">${escapeHtml(t('open'))}</button>` : ''}
          </div>`).join('')}</div>` : `<div style="color:var(--green);font-weight:900">${escapeHtml(t('noHealthIssues'))}</div>`}
      </div>
    </section>`;
}

function renderCurrentPage() {
  if (appState.currentPage === 'prep') return renderPrepCenter(appState, { editingGearId, editingChecklist, prepFocus, filters: prepFilters });
  if (appState.currentPage === 'tasks') return renderTasksPage(appState, { editingTaskId, filters: taskFilters });
  if (appState.currentPage === 'members') return renderMembersPage(appState, { editingMemberId, filters: memberFilters });
  if (appState.currentPage === 'intel') return renderIntelPage(appState, { editingIntelId, editingStrategyId, intelFocus, filters: intelFilters });
  if (appState.currentPage === 'competition') return renderCompetitionCenter(appState, timer, { editingRunId, filters: runFilters });
  if (appState.currentPage === 'settings') {
    return '<main id="settings-host"></main>';
  }
  return renderDashboard();
}

function renderAppShell() {
  appRoot.innerHTML = `${renderNavigation(appState.currentPage)}${renderCurrentPage()}`;
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
setTimeout(runAndRenderSmokeTest, 0);

appRoot?.addEventListener('click', (event) => {
  const healthShortcut = event.target.closest('[data-task-health-shortcut]');
  if (healthShortcut) {
    applyTaskHealthShortcut(healthShortcut.dataset.taskHealthShortcut || '');
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
  const localeTarget = event.target.closest('[data-locale]');
  if (localeTarget) {
    setLocale(localeTarget.dataset.locale);
    renderAppShell();
    return;
  }
  const pageTarget = event.target.closest('[data-page]');
  if (pageTarget) {
    applyTaskFilterPreset(pageTarget);
    applyPrepFocusPreset(pageTarget);
    applyIntelFocusPreset(pageTarget);
    applyRunEditPreset(pageTarget);
    setPage(pageTarget.dataset.page);
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
    return;
  }
  if (event.target.closest('[data-action="choose-diagnostics"]')) {
    document.querySelector('[data-diagnostics-file]')?.click();
    return;
  }
  if (event.target.closest('[data-action="export-settings-pack"]')) {
    exportSettingsPack(appState, getSmokeTestLog());
    return;
  }
  if (event.target.closest('[data-action="choose-settings-pack"]')) {
    document.querySelector('[data-settings-pack-file]')?.click();
    return;
  }
  if (event.target.closest('[data-action="load-supabase-readonly"]')) {
    lastDbStatus = { loadedAt: new Date().toISOString(), error: 'Loading...' };
    renderAppShell();
    loadSupabaseReadOnly()
      .then((payload) => {
        applySupabaseReadOnlyData(appState, payload);
        lastDbStatus = payload;
        lastSyncPreview = null;
        lastPostWritePreview = null;
        persistAndRender();
      })
      .catch((error) => {
        lastDbStatus = { loadedAt: new Date().toISOString(), error: error.message || String(error), tables: {} };
        renderAppShell();
      });
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
    return;
  }
  if (event.target.closest('[data-action="reset-v16-local-data"]')) {
    resetV16LocalDataWithBackup();
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
    if (addMasterDataValue(appState, type, input?.value)) persistAndRender();
    return;
  }
  const deleteMasterTarget = event.target.closest('[data-master-delete]');
  if (deleteMasterTarget) {
    if (!confirmDelete(deleteMasterTarget.dataset.masterValue || t('item'))) return;
    if (deleteMasterDataValue(appState, deleteMasterTarget.dataset.masterDelete, deleteMasterTarget.dataset.masterValue)) {
      persistAndRender();
    }
    return;
  }
  const deleteTaskTarget = event.target.closest('[data-task-delete]');
  if (deleteTaskTarget) {
    const task = appState.data.tasks.find(row => Number(row.id) === Number(deleteTaskTarget.dataset.taskDelete));
    if (!confirmDelete(task?.title || t('task'))) return;
    if (Number(editingTaskId) === Number(deleteTaskTarget.dataset.taskDelete)) editingTaskId = null;
    if (deleteTask(appState, deleteTaskTarget.dataset.taskDelete)) persistAndRender();
    return;
  }
  const editTaskTarget = event.target.closest('[data-task-edit]');
  if (editTaskTarget) {
    editingTaskId = editTaskTarget.dataset.taskEdit;
    renderAppShell();
    return;
  }
  if (event.target.closest('[data-task-cancel-edit]')) {
    editingTaskId = null;
    renderAppShell();
    return;
  }
  const deleteMemberTarget = event.target.closest('[data-member-delete]');
  if (deleteMemberTarget) {
    const member = appState.data.members.find(row => Number(row.id) === Number(deleteMemberTarget.dataset.memberDelete));
    if (!confirmDelete(member?.name || t('members'))) return;
    if (Number(editingMemberId) === Number(deleteMemberTarget.dataset.memberDelete)) editingMemberId = null;
    if (deleteMember(appState, deleteMemberTarget.dataset.memberDelete)) persistAndRender();
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
  const timerTarget = event.target.closest('[data-timer-action]');
  if (timerTarget) {
    if (timerTarget.dataset.timerAction === 'start') startTimer();
    if (timerTarget.dataset.timerAction === 'pause') pauseTimer();
    if (timerTarget.dataset.timerAction === 'reset') resetTimer();
    return;
  }
  if (event.target.closest('[data-action="save-run"]')) {
    createMissionRun(appState, currentElapsedSeconds());
    saveAppState(appState);
    resetTimer();
    return;
  }
  const editRunTarget = event.target.closest('[data-run-edit]');
  if (editRunTarget) {
    editingRunId = editRunTarget.dataset.runEdit;
    renderAppShell();
    return;
  }
  if (event.target.closest('[data-run-cancel-edit]')) {
    editingRunId = null;
    renderAppShell();
    return;
  }
  if (event.target.closest('[data-action="update-run"]')) {
    if (updateMissionRun(appState, editingRunId, getRunPayloadFromDom())) {
      editingRunId = null;
      persistAndRender();
    }
    return;
  }
  const deleteRunTarget = event.target.closest('[data-run-delete]');
  if (deleteRunTarget) {
    const run = appState.data.missionRuns.find(row => Number(row.id) === Number(deleteRunTarget.dataset.runDelete));
    if (!confirmDelete(run?.name || t('missionRun'))) return;
    if (Number(editingRunId) === Number(deleteRunTarget.dataset.runDelete)) editingRunId = null;
    if (deleteMissionRun(appState, deleteRunTarget.dataset.runDelete)) persistAndRender();
    return;
  }
  const addChecklistTarget = event.target.closest('[data-checklist-add]');
  if (addChecklistTarget) {
    const listName = addChecklistTarget.dataset.checklistAdd;
    const input = document.querySelector(`[data-checklist-input="${listName}"]`);
    if (addChecklistItem(appState, listName, input?.value)) persistAndRender();
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
    const input = document.querySelector(`[data-checklist-input="${listName}"]`);
    if (updateChecklistItem(appState, listName, editingChecklist?.id, input?.value)) {
      editingChecklist = null;
      persistAndRender();
    }
    return;
  }
  const deleteChecklistTarget = event.target.closest('[data-checklist-delete]');
  if (deleteChecklistTarget) {
    const list = appState.data[deleteChecklistTarget.dataset.checklistDelete] || [];
    const item = list.find(row => Number(row.id) === Number(deleteChecklistTarget.dataset.checkId));
    if (!confirmDelete(item?.label || t('checklist'))) return;
    if (
      editingChecklist?.listName === deleteChecklistTarget.dataset.checklistDelete
      && Number(editingChecklist.id) === Number(deleteChecklistTarget.dataset.checkId)
    ) {
      editingChecklist = null;
    }
    if (deleteChecklistItem(appState, deleteChecklistTarget.dataset.checklistDelete, deleteChecklistTarget.dataset.checkId)) {
      persistAndRender();
    }
    return;
  }
  if (event.target.closest('[data-gear-add]')) {
    if (addGearItem(appState, getGearPayloadFromDom())) persistAndRender();
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
    if (updateGearItem(appState, editingGearId, getGearPayloadFromDom())) {
      editingGearId = null;
      persistAndRender();
    }
    return;
  }
  const deleteGearTarget = event.target.closest('[data-gear-delete]');
  if (deleteGearTarget) {
    const item = appState.data.gearItems.find(row => Number(row.id) === Number(deleteGearTarget.dataset.gearDelete));
    if (!confirmDelete(item?.name || t('gearItems'))) return;
    if (Number(editingGearId) === Number(deleteGearTarget.dataset.gearDelete)) editingGearId = null;
    if (deleteGearItem(appState, deleteGearTarget.dataset.gearDelete)) persistAndRender();
    return;
  }
  if (event.target.closest('[data-notes-save]')) {
    updateNotes(appState, document.querySelector('[data-notes-input]')?.value || '');
    persistAndRender();
    return;
  }
  const editKnowledgeTarget = event.target.closest('[data-knowledge-edit]');
  if (editKnowledgeTarget) {
    if (editKnowledgeTarget.dataset.knowledgeEdit === 'intel') editingIntelId = editKnowledgeTarget.dataset.knowledgeId;
    if (editKnowledgeTarget.dataset.knowledgeEdit === 'strategy') editingStrategyId = editKnowledgeTarget.dataset.knowledgeId;
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
    if (deleteKnowledgeTarget.dataset.knowledgeDelete === 'intel' && Number(editingIntelId) === Number(deleteKnowledgeTarget.dataset.knowledgeId)) editingIntelId = null;
    if (deleteKnowledgeTarget.dataset.knowledgeDelete === 'strategy' && Number(editingStrategyId) === Number(deleteKnowledgeTarget.dataset.knowledgeId)) editingStrategyId = null;
    if (deleteKnowledgeItem(appState, deleteKnowledgeTarget.dataset.knowledgeDelete, deleteKnowledgeTarget.dataset.knowledgeId)) persistAndRender();
    return;
  }
});

appRoot?.addEventListener('submit', (event) => {
  const form = event.target.closest('[data-task-form]');
  if (!form) return;
  event.preventDefault();
  const task = createTaskFromForm(new FormData(form));
  if (editingTaskId) {
    if (updateTask(appState, editingTaskId, task)) editingTaskId = null;
  } else {
    addTask(appState, task);
  }
  persistAndRender();
});

appRoot?.addEventListener('submit', (event) => {
  const form = event.target.closest('[data-member-form]');
  if (!form) return;
  event.preventDefault();
  const member = createMemberFromForm(new FormData(form));
  if (editingMemberId) {
    if (updateMember(appState, editingMemberId, member)) editingMemberId = null;
  } else {
    addMember(appState, member);
  }
  persistAndRender();
});

appRoot?.addEventListener('submit', (event) => {
  const form = event.target.closest('[data-knowledge-form]');
  if (!form) return;
  event.preventDefault();
  const listName = form.dataset.knowledgeForm;
  const item = createKnowledgeItemFromForm(new FormData(form));
  const editingId = listName === 'intel' ? editingIntelId : editingStrategyId;
  if (editingId) {
    if (updateKnowledgeItem(appState, listName, editingId, item)) {
      if (listName === 'intel') editingIntelId = null;
      if (listName === 'strategy') editingStrategyId = null;
      clearIntelFocusIfReady(listName, item.title, item.status);
    }
  } else {
    addKnowledgeItem(appState, listName, item);
  }
  persistAndRender();
});

appRoot?.addEventListener('change', (event) => {
  const status = event.target.closest('[data-task-status]');
  if (status) {
    if (updateTaskStatus(appState, status.dataset.taskStatus, status.value)) persistAndRender();
    return;
  }
  const check = event.target.closest('[data-checklist]');
  if (check) {
    if (toggleChecklistItem(appState, check.dataset.checklist, check.dataset.checkId)) {
      const item = appState.data[check.dataset.checklist]?.find(row => Number(row.id) === Number(check.dataset.checkId));
      clearPrepFocusIfComplete(check.dataset.checklist, item?.label, item?.done);
      persistAndRender();
    }
    return;
  }
  const gear = event.target.closest('[data-gear-packed]');
  if (gear) {
    if (toggleGearItem(appState, gear.dataset.gearPacked)) {
      const item = appState.data.gearItems.find(row => Number(row.id) === Number(gear.dataset.gearPacked));
      clearPrepFocusIfComplete('gearItems', item?.name, item?.packed);
      persistAndRender();
    }
    return;
  }
  if (
    event.target.closest('[data-task-owner-filter]')
    || event.target.closest('[data-task-status-filter]')
    || event.target.closest('[data-task-priority-filter]')
    || event.target.closest('[data-task-category-filter]')
    || event.target.closest('[data-task-health-filter]')
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
        lastMigrationSummary = importV15BackupPayload(appState, payload);
      } else if (v16BackupInput) {
        lastRollbackSummary = restoreLocalBackupPayload(appState, payload);
        lastSyncPreview = null;
        lastPostWritePreview = null;
      } else if (diagnosticsInput) {
        lastDiagnosticsSummary = parseDiagnosticsPayload(payload);
      } else {
        importSettingsPackPayload(appState, payload);
      }
      persistAndRender();
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
  if (event.key !== 'Enter') return;
  const input = event.target.closest('[data-master-input]');
  const checklistInput = event.target.closest('[data-checklist-input]');
  const gearInput = event.target.closest('[data-gear-name], [data-gear-category], [data-gear-qty]');
  if (!input && !checklistInput && !gearInput) return;
  event.preventDefault();
  if (gearInput) {
    if (editingGearId) {
      if (updateGearItem(appState, editingGearId, getGearPayloadFromDom())) {
        editingGearId = null;
        persistAndRender();
      }
    } else if (addGearItem(appState, getGearPayloadFromDom())) {
      persistAndRender();
    }
    return;
  }
  if (checklistInput) {
    if (editingChecklist?.listName === checklistInput.dataset.checklistInput) {
      if (updateChecklistItem(appState, editingChecklist.listName, editingChecklist.id, checklistInput.value)) {
        editingChecklist = null;
        persistAndRender();
      }
    } else if (addChecklistItem(appState, checklistInput.dataset.checklistInput, checklistInput.value)) {
      persistAndRender();
    }
    return;
  }
  if (addMasterDataValue(appState, input.dataset.masterInput, input.value)) persistAndRender();
});

appRoot?.addEventListener('input', (event) => {
  if (event.target.closest('[data-task-search]')) {
    updateTaskFiltersFromControl(event.target);
    renderAppShell();
    return;
  }
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

return {  };
})();
  
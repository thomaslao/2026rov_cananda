export function buildV15DbCoverage(dbStatus = null) {
  const dbTables = [
    'tasks',
    'members',
    'checklist_items',
    'predive_checklist_items',
    'intel',
    'notes',
    'quotes',
    'task_attachments',
    'audit_log',
    'strategy_items',
    'practice_runs',
    'mission_runs',
  ];
  const tables = dbStatus?.tables || {};
  return dbTables.map((table) => {
    const row = tables[table] || null;
    return {
      table,
      ok: Boolean(row?.ok),
      count: row?.count ?? null,
      error: row?.error || '',
    };
  });
}

export function summarizeV15DbCoverage(coverage = []) {
  const rows = Array.isArray(coverage) ? coverage : [];
  const total = rows.length;
  const loaded = rows.filter(row => row.ok).length;
  const missing = rows
    .filter(row => !row.ok)
    .map(row => row.table)
    .filter(Boolean);
  return {
    loaded,
    total,
    ok: total > 0 && loaded === total,
    status: total === 0 ? 'not-loaded' : (loaded === total ? 'complete' : 'partial'),
    label: total ? `${loaded}/${total}` : '-',
    warning: total && loaded !== total
      ? `V15 DB incomplete: ${loaded}/${total} tables loaded. Missing: ${missing.join(', ')}`
      : '',
    missing,
  };
}

export function buildV15AuditHighlights(rows = [], limit = 8) {
  const riskPattern = /(fail|failed|error|exception|delete|deleted|remove|removed|rollback|restore|reset|reject|denied|unauthori[sz]ed)/i;
  return (Array.isArray(rows) ? rows : [])
    .filter((entry) => {
      const text = [
        entry?.action,
        entry?.entityType,
        entry?.entityId,
        entry?.actor,
      ].map(value => String(value || '')).join(' ');
      return riskPattern.test(text);
    })
    .slice(0, limit);
}

export function buildDiagnosticsPayload({
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
  const v15DbCoverage = buildV15DbCoverage(dbStatus);
  const v15AuditLog = data.v15AuditLog || [];
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
      quotes: data.quotes?.length || 0,
      practiceRuns: data.practiceRuns?.length || 0,
      missionRuns: data.missionRuns?.length || 0,
      gearItems: data.gearItems?.length || 0,
      attachments: data.attachments?.length || 0,
      v15AuditLog: data.v15AuditLog?.length || 0,
      healthIssues: healthIssues.length,
      smokeRuns: smokeLog.length,
    writeAuditEntries: writeAuditLog.length,
  },
    latestSmoke: smokeLog[0] || null,
    smokeLog: smokeLog.slice(0, 10),
    healthIssues,
    dbStatus,
    dbImportDelta: dbStatus?.importDelta || null,
    schemaStatus,
    syncPreview,
    postWritePreview,
    v15DbCoverage,
    v15DbReadiness: summarizeV15DbCoverage(v15DbCoverage),
    migrationSummary,
    rollbackSummary,
    v15AuditLog: v15AuditLog.slice(0, 10),
    v15AuditHighlights: buildV15AuditHighlights(v15AuditLog, 8),
    writeAuditLog: writeAuditLog.slice(0, 20),
  };
}

export function downloadDiagnosticsPayload(payload, documentRef = document) {
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

export function parseDiagnosticsPayload(payload) {
  if (!payload || !['rov_v16_diagnostics', 'rov_v16_handoff_report'].includes(payload.type)) {
    throw new Error('Not a v16 diagnostics or handoff payload');
  }
  const isHandoffReport = payload.type === 'rov_v16_handoff_report';
  const latestSmoke = payload.latestSmoke || null;
  const writeAuditLog = payload.writeAuditLog || [];
  const v15AuditLog = payload.v15AuditLog || [];
  const v15AuditHighlights = payload.v15AuditHighlights || buildV15AuditHighlights(v15AuditLog, 8);
  const v15DbCoverage = payload.v15DbCoverage || payload.supabase?.v15DbCoverage || [];
  const v15DbReadiness = payload.v15DbReadiness || payload.supabase?.v15DbReadiness || summarizeV15DbCoverage(v15DbCoverage);
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
    type: payload.type,
    sourceLabel: isHandoffReport ? 'Handoff Report' : 'Diagnostics',
    importedAt: new Date().toISOString(),
    exportedAt: payload.exportedAt || '',
    season: payload.season || '',
    currentPage: payload.currentPage || '',
    counts: payload.counts || {},
    validationSummary: payload.validationSummary || null,
    dashboardSafetySummary: payload.dashboardSafetySummary || [],
    readinessActionPlan: payload.readinessActionPlan || [],
    latestSmokeOk: latestSmoke?.ok ?? payload.validationSummary?.latestSmokeOk ?? null,
    smokeRuns: payload.smokeLog?.length || payload.counts?.smokeRuns || 0,
    healthIssues: payload.healthIssues?.length || payload.counts?.healthIssues || 0,
    writeAuditEntries: writeAuditLog.length || payload.counts?.writeAuditEntries || 0,
    dbLoadedAt: payload.dbStatus?.loadedAt || '',
    dbImportDelta: payload.dbImportDelta || payload.dbStatus?.importDelta || payload.supabase?.importDelta || null,
    schemaProbedAt: payload.schemaStatus?.ts || '',
    latestSmoke,
    smokeLog: (payload.smokeLog || []).slice(0, 5),
    healthRows: (payload.healthIssues || []).slice(0, 10),
    dbTables: payload.dbStatus?.tables || {},
    schemaTables: payload.schemaStatus?.tables || {},
    v15DbCoverage,
    v15DbReadiness,
    syncPreview: summarizeSync(payload.syncPreview || payload.supabase?.syncPreview),
    postWritePreview: summarizeSync(payload.postWritePreview || payload.supabase?.postWritePreview),
    v15AuditLog: v15AuditLog.slice(0, 8),
    v15AuditHighlights: v15AuditHighlights.slice(0, 8),
    writeAuditLog: writeAuditLog.slice(0, 8),
  };
}

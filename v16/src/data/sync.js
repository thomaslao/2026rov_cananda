export const SYNC_TABLE_MAP = [
  { key: 'tasks', label: 'tasks' },
  { key: 'members', label: 'members' },
  { key: 'checklist', label: 'checklist_items' },
  { key: 'prediveChecklist', label: 'predive_checklist_items' },
  { key: 'missionRuns', label: 'mission_runs' },
];

export const WRITE_CONFIRM_TEXT = 'SYNC V16';
export const WRITE_TABLE_WHITELIST = ['tasks', 'members', 'checklist_items', 'predive_checklist_items'];
export const WRITE_AUDIT_LOG_KEY = 'rov_v16_write_audit_log';
export const WRITE_SCHEMA = {
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

function getMissingColumnFromError(error) {
  const message = String(error?.message || '');
  const match = message.match(/Could not find the '([^']+)' column/i)
    || message.match(/column "([^"]+)" .*does not exist/i);
  return match?.[1] || '';
}

function dropFieldFromRows(rows = [], field = '') {
  if (!field) return rows;
  return rows.map((row) => {
    const next = { ...row };
    delete next[field];
    return next;
  });
}

async function upsertRowsWithSchemaFallback(client, table, rows, conflict) {
  let nextRows = rows;
  const droppedFields = [];
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const { error } = await client.from(table).upsert(nextRows, { onConflict: conflict });
    if (!error) return { error: null, rows: nextRows, droppedFields };
    const missingField = getMissingColumnFromError(error);
    if (!missingField || droppedFields.includes(missingField)) return { error, rows: nextRows, droppedFields };
    droppedFields.push(missingField);
    nextRows = dropFieldFromRows(nextRows, missingField);
  }
  return { error: new Error('Schema fallback exceeded retry limit'), rows: nextRows, droppedFields };
}

function getAllowedFields(table, schemaStatus = null) {
  const staticAllowed = WRITE_SCHEMA[table] || [];
  const probed = schemaStatus?.tables?.[table]?.existing;
  if (!Array.isArray(probed) || !probed.length) return staticAllowed;
  return staticAllowed.filter(field => probed.includes(field));
}

export function filterRowForSchema(table, row, schemaStatus = null) {
  const allowed = getAllowedFields(table, schemaStatus);
  return Object.fromEntries(
    Object.entries(row || {}).filter(([key, value]) => allowed.includes(key) && value !== undefined),
  );
}

export function validateRowsForSchema(table, rows = [], schemaStatus = null) {
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

export function buildSupabaseSyncPreview(appState, dbPayload) {
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

export function buildLocalBackupPayload(appState) {
  return {
    type: 'rov_v16_local_backup',
    version: 1,
    exportedAt: new Date().toISOString(),
    season: appState?.currentSeason || 'default',
    data: appState?.data || {},
  };
}

export function restoreLocalBackupPayload(appState, payload) {
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

export function downloadLocalBackup(appState, documentRef = document) {
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

export async function executeGuardedSupabaseWriteSync(client, appState, dbPayload, options = {}) {
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
    const fallback = await upsertRowsWithSchemaFallback(client, table.label, rows, conflict);
    const droppedDuringWrite = fallback.droppedFields || [];
    const writtenRows = fallback.rows || rows;
    const error = fallback.error;
    results.push({
      table: table.label,
      ok: !error,
      written: error ? 0 : writtenRows.length,
      skippedDelete: diff.remove.length,
      droppedFields: [...new Set([...droppedFields, ...droppedDuringWrite])],
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

export async function executeAutoSupabaseWriteSync(client, appState, dbPayload, options = {}) {
  return executeGuardedSupabaseWriteSync(client, appState, dbPayload, {
    ...options,
    confirmText: WRITE_CONFIRM_TEXT,
    tables: options.tables || WRITE_TABLE_WHITELIST,
    allowDelete: false,
  });
}

export function summarizeWriteResult(writeResult) {
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

export function getWriteAuditLog(storage = localStorage) {
  try {
    return JSON.parse(storage.getItem(WRITE_AUDIT_LOG_KEY) || '[]');
  } catch (error) {
    return [];
  }
}

export function saveWriteAuditEntry(entry, storage = localStorage) {
  const rows = getWriteAuditLog(storage);
  rows.unshift({
    id: entry.id || Date.now(),
    ts: entry.ts || new Date().toISOString(),
    ...entry,
  });
  storage.setItem(WRITE_AUDIT_LOG_KEY, JSON.stringify(rows.slice(0, 20)));
  return rows[0];
}

export function buildWriteAuditEntry({ preview, writeResult, postWritePreview, tables }) {
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

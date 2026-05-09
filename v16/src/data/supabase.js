export const SUPABASE_URL = 'https://funahmlcriyrpqelefah.supabase.co';
export const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1bmFobWxjcml5cnBxZWxlZmFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MTQ5MjQsImV4cCI6MjA5MzA5MDkyNH0.G6de9ZXI4s-AkyzW5poQwwZEVaoUJvw17cXFj90FP88';
const SUPABASE_CDN_URL = 'https://unpkg.com/@supabase/supabase-js@2';
let supabaseLoadPromise = null;

export const DB_TABLES = [
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

export const SUPABASE_SOURCE_LABEL = 'Supabase live database';

export const SCHEMA_PROBE_COLUMNS = {
  tasks: ['id', 'name', 'owner', 'due', 'priority', 'status', 'cat', 'category', 'depends_on', 'sort_order'],
  members: ['id', 'name', 'role', 'group', 'team'],
  checklist_items: ['id', 'item_id', 'label', 'name', 'done', 'order_index'],
  predive_checklist_items: ['id', 'item_id', 'label', 'name', 'done', 'order_index'],
  intel: ['id', 'title', 'content', 'status', 'created_at'],
  notes: ['id', 'content'],
  quotes: ['id', 'text', 'order_index'],
  task_attachments: ['id', 'task_id', 'file_name', 'file_path', 'public_url', 'file_size', 'mime_type', 'created_at'],
  audit_log: ['id', 'actor', 'action', 'entity_type', 'entity_id', 'created_at'],
  strategy_items: ['id', 'title', 'content', 'status', 'order_index'],
  practice_runs: ['id', 'run_date', 'pilot', 'score', 'seconds', 'faults', 'note', 'season', 'created_at'],
  mission_runs: ['id', 'score', 'total_score', 'elapsed_seconds', 'seconds', 'note', 'notes', 'created_at', 'run_date'],
};

export function createSupabaseClient({ supabaseLib = window.supabase, url = SUPABASE_URL, key = SUPABASE_KEY } = {}) {
  if (!supabaseLib || !url || !key) return null;
  return supabaseLib.createClient(url, key);
}

export async function ensureSupabaseClient({ url = SUPABASE_URL, key = SUPABASE_KEY } = {}) {
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

function normalizeDedupeText(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function dedupeRows(rows = [], keyFn = row => row?.id, preferFn = (current) => current) {
  const byKey = new Map();
  const duplicates = [];
  rows.forEach((row) => {
    const key = keyFn(row);
    if (!key) return;
    if (!byKey.has(key)) {
      byKey.set(key, row);
      return;
    }
    duplicates.push(row);
    byKey.set(key, preferFn(byKey.get(key), row));
  });
  return {
    rows: [...byKey.values()],
    duplicates,
  };
}

function preferRicherMember(current, next) {
  const currentScore = [current.role, current.group].filter(Boolean).join('|').length;
  const nextScore = [next.role, next.group].filter(Boolean).join('|').length;
  return nextScore >= currentScore ? next : current;
}

function taskDedupeKey(task) {
  return [
    normalizeDedupeText(task.name),
    normalizeDedupeText(task.due),
    normalizeDedupeText(task.category),
  ].join('|');
}

function preferRicherTask(current, next) {
  const statusRank = { Done: 3, Completed: 3, 'In Progress': 2, Open: 1 };
  const score = task => [
    task.notes,
    task.category,
    task.owner,
    task.due,
    ...(Array.isArray(task.evidence) ? task.evidence.map(item => item.label || item.url || item.note) : []),
  ].filter(Boolean).join('|').length;
  const currentStatus = statusRank[current.status] || 0;
  const nextStatus = statusRank[next.status] || 0;
  if (nextStatus !== currentStatus) return nextStatus > currentStatus ? next : current;
  return score(next) >= score(current) ? next : current;
}

function normalizeTaskAttachment(row, index) {
  return {
    id: Number(row.id || index + 1),
    taskId: Number(row.task_id || row.taskId || 0),
    label: String(row.file_name || row.filename || row.name || row.public_url || `Attachment ${index + 1}`),
    url: String(row.public_url || row.url || ''),
    note: String(row.mime_type || row.file_path || ''),
    type: 'v15-attachment',
  };
}

function attachEvidenceToTasks(tasks = [], attachments = []) {
  const byTask = new Map();
  attachments.forEach((attachment) => {
    if (!attachment.taskId) return;
    const evidence = byTask.get(attachment.taskId) || [];
    evidence.push({
      id: attachment.id,
      label: attachment.label,
      url: attachment.url,
      note: attachment.note,
      type: attachment.type,
    });
    byTask.set(attachment.taskId, evidence);
  });
  return tasks.map(task => ({
    ...task,
    evidence: [...(Array.isArray(task.evidence) ? task.evidence : []), ...(byTask.get(Number(task.id)) || [])],
  }));
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

function normalizePracticeRun(row, index) {
  return {
    id: Number(row.id || index + 1),
    ts: String(row.ts || row.created_at || row.run_date || new Date().toISOString()),
    runDate: String(row.run_date || ''),
    pilot: String(row.pilot || ''),
    score: Number(row.score || 0),
    elapsedSeconds: Number(row.seconds || row.elapsed_seconds || row.elapsedSeconds || 0),
    faults: Number(row.faults || 0),
    note: String(row.note || row.notes || ''),
  };
}

function normalizeQuote(row, index) {
  return {
    id: Number(row.id || index + 1),
    text: String(row.text || row.content || row.quote || ''),
  };
}

function normalizeAuditLogEntry(row, index) {
  return {
    id: Number(row.id || index + 1),
    actor: String(row.actor || ''),
    action: String(row.action || ''),
    entityType: String(row.entity_type || row.entityType || ''),
    entityId: row.entity_id || row.entityId || null,
    createdAt: String(row.created_at || row.createdAt || ''),
    source: 'v15-audit-log',
  };
}

async function selectTable(client, table, orderColumn = null, ascending = true) {
  let query = client.from(table).select('*');
  if (orderColumn) query = query.order(orderColumn, { ascending });
  const { data, error } = await query;
  return { table, data: data || [], error };
}

export async function loadSupabaseReadOnly(client = null) {
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
    selectTable(client, 'quotes', 'order_index'),
    selectTable(client, 'task_attachments', 'created_at'),
    selectTable(client, 'audit_log', 'created_at', false),
    selectTable(client, 'strategy_items'),
    selectTable(client, 'practice_runs'),
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
  const attachments = get('task_attachments').map(normalizeTaskAttachment);
  const dedupedTasks = dedupeRows(get('tasks').map(normalizeTask), taskDedupeKey, preferRicherTask);
  const dedupedMembers = dedupeRows(get('members').map(normalizeMember), member => normalizeDedupeText(member.name), preferRicherMember);
  const dedupedChecklist = dedupeRows(get('checklist_items').map(normalizeChecklistItem), item => `${item.id}|${normalizeDedupeText(item.label)}`);
  const dedupedPrediveChecklist = dedupeRows(get('predive_checklist_items').map(normalizeChecklistItem), item => `${item.id}|${normalizeDedupeText(item.label)}`);
  const dedupedQuotes = dedupeRows(get('quotes').map(normalizeQuote).filter(quote => quote.text), quote => normalizeDedupeText(quote.text));
  const tasks = attachEvidenceToTasks(dedupedTasks.rows, attachments);
  return {
    loadedAt: new Date().toISOString(),
    loadMs: Math.round(performance.now() - startedAt),
    source: SUPABASE_SOURCE_LABEL,
    readOnly: true,
    tables,
    dedupeSummary: {
      tasks: dedupedTasks.duplicates.length,
      members: dedupedMembers.duplicates.length,
      checklist: dedupedChecklist.duplicates.length,
      prediveChecklist: dedupedPrediveChecklist.duplicates.length,
      quotes: dedupedQuotes.duplicates.length,
    },
    data: {
      tasks,
      members: dedupedMembers.rows,
      checklist: dedupedChecklist.rows,
      prediveChecklist: dedupedPrediveChecklist.rows,
      intel: get('intel'),
      notes: String(get('notes')[0]?.content || ''),
      quotes: dedupedQuotes.rows,
      attachments,
      v15AuditLog: get('audit_log').map(normalizeAuditLogEntry),
      strategy: get('strategy_items'),
      practiceRuns: get('practice_runs').map(normalizePracticeRun),
      missionRuns: get('mission_runs').map(normalizeMissionRun),
    },
  };
}

export function buildSupabaseReadOnlyImportDelta(beforeData = {}, importedData = {}) {
  const rows = [
    ['tasks', 'Tasks'],
    ['members', 'Members'],
    ['checklist', 'Checklist'],
    ['prediveChecklist', 'Pre-dive'],
    ['intel', 'Intel'],
    ['quotes', 'Quotes'],
    ['attachments', 'Evidence'],
    ['v15AuditLog', 'V15 Audit'],
    ['practiceRuns', 'Practice'],
    ['missionRuns', 'Mission Run'],
  ].map(([key, label]) => {
    const before = Array.isArray(beforeData?.[key]) ? beforeData[key].length : 0;
    const after = Array.isArray(importedData?.[key]) ? importedData[key].length : 0;
    return { key, label, before, after, delta: after - before };
  });
  return {
    ts: new Date().toISOString(),
    source: SUPABASE_SOURCE_LABEL,
    rows,
    increased: rows.filter(row => row.delta > 0).length,
    decreased: rows.filter(row => row.delta < 0).length,
    unchanged: rows.filter(row => row.delta === 0).length,
  };
}

export function applySupabaseReadOnlyData(appState, payload) {
  appState.data = {
    ...appState.data,
    ...payload.data,
  };
  appState.dirtyFlags.supabaseReadOnly = true;
}

export async function probeSupabaseSchema(client = null, candidates = SCHEMA_PROBE_COLUMNS) {
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

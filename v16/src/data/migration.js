import { DEFAULT_STATE } from './defaults.js';

export const V15_BACKUP_TYPE = 'rov_task_manager_backup';

function normalizeArray(value, fallback = []) {
  return Array.isArray(value) ? value : fallback;
}

function clean(value) {
  return String(value || '').trim();
}

function normalizeEvidence(items = []) {
  return normalizeArray(items)
    .map((item, index) => ({
      id: Number(item?.id || index + 1),
      label: clean(item?.label || item?.name || item?.title || item?.filename || item?.file || item?.url || item?.href),
      url: clean(item?.url || item?.href || item?.link || item?.file || item?.path),
      note: clean(item?.note || item?.notes || item?.description),
      type: clean(item?.type || item?.kind || 'reference'),
    }))
    .filter(item => item.label || item.url || item.note);
}

function normalizeTaskEvidence(task = {}) {
  const listEvidence = [
    ...normalizeArray(task.evidence),
    ...normalizeArray(task.attachments),
    ...normalizeArray(task.links),
  ];
  const singleEvidence = [
    task.attachment_url || task.attachmentUrl || task.evidenceUrl || task.link
      ? {
          label: task.attachment_label || task.attachmentLabel || task.evidenceLabel || task.filename || task.link || task.attachment_url,
          url: task.attachment_url || task.attachmentUrl || task.evidenceUrl || task.link,
          note: task.attachment_note || task.attachmentNote || task.evidenceNote,
          type: 'link',
        }
      : null,
  ].filter(Boolean);
  return normalizeEvidence([...listEvidence, ...singleEvidence]);
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
    evidence: normalizeTaskEvidence(task),
    updatedAt: String(task.updatedAt || task.updated_at || task.modifiedAt || task.modified_at || task.createdAt || task.created_at || ''),
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

function normalizeFloatPackets(source = {}) {
  const raw = source.floatPackets?.raw || source.floatPackets || source.floatPacketRaw || '';
  return {
    raw: String(raw || ''),
    analysis: source.floatPackets?.analysis || source.floatPacketAnalysis || null,
  };
}

export function summarizeV15Backup(payload) {
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

export function importV15BackupPayload(appState, payload) {
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
    floatPackets: normalizeFloatPackets(source),
    masterData: appState.data.masterData || DEFAULT_STATE.masterData,
  };
  appState.dirtyFlags.v15Import = true;
  return summarizeV15Backup(payload);
}

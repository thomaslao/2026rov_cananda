import { escapeHtml } from '../utils/index.js';
import { formatMissionTime } from '../utils/date.js';
import { labelFor, t } from '../utils/i18n.js';
import { getTaskStats } from './tasks.js';

function clean(value) {
  return String(value || '').trim();
}

export const COMPETITION_FLOW_STEPS = [
  'Team ready',
  'Pre-dive checklist',
  'Judge briefing',
  'Mission run',
  'Post-run review',
];

export function addMissionEvent(state, type, label, elapsedSeconds = 0) {
  const event = {
    id: Date.now(),
    ts: new Date().toISOString(),
    elapsedSeconds: Number(elapsedSeconds || 0),
    type: clean(type) || 'note',
    label: clean(label) || 'Event',
  };
  state.data.missionEvents.unshift(event);
  state.data.missionEvents = state.data.missionEvents.slice(0, 200);
  state.dirtyFlags.missionEvents = true;
  return event;
}

export function clearMissionEvents(state) {
  state.data.missionEvents = [];
  state.dirtyFlags.missionEvents = true;
}

export function setCompetitionFlowStep(state, stepIndex) {
  const index = Math.max(0, Math.min(COMPETITION_FLOW_STEPS.length - 1, Number(stepIndex || 0)));
  state.data.competitionFlowStep = index;
  state.dirtyFlags.competitionFlowStep = true;
  return index;
}

export function buildMissionEventSummary(events = []) {
  return events
    .slice(0, 12)
    .reverse()
    .map(event => `[${formatMissionTime(event.elapsedSeconds || 0)}] ${event.label}`)
    .join('\n');
}

function getScoreTemplateItems(state) {
  return Array.isArray(state.data.missionScoreItems) && state.data.missionScoreItems.length
    ? state.data.missionScoreItems
    : [];
}

export function getScoreItemsFromDom(root = document) {
  return [...root.querySelectorAll('[data-score-item]')].map(row => ({
    id: row.dataset.scoreItem,
    label: row.dataset.scoreLabel || row.dataset.scoreItem,
    max: Number(row.dataset.scoreMax || 0),
    score: Number(row.querySelector('[data-score-item-value]')?.value || 0),
    status: row.querySelector('[data-score-item-status]')?.value || 'pending',
  }));
}

export function calculateMissionScore(scoreItems = [], penalty = 0) {
  const gross = scoreItems.reduce((sum, item) => sum + Number(item.score || 0), 0);
  const completed = scoreItems.filter(item => item.status === 'done').length;
  const successRate = scoreItems.length ? Math.round((completed / scoreItems.length) * 100) : 0;
  return {
    gross,
    penalty: Number(penalty || 0),
    total: gross - Number(penalty || 0),
    successRate,
  };
}

export function createMissionRun(state, elapsedSeconds = 0, payload = null) {
  const scoreItems = payload?.scoreItems || getScoreItemsFromDom();
  const penalty = payload ? Number(payload.penalty || 0) : Number(document.querySelector('[data-run-penalty]')?.value || 0);
  const scoreSummary = calculateMissionScore(scoreItems, penalty);
  const manualScore = document.querySelector('[data-run-score]')?.value;
  const score = payload ? Number(payload.score || scoreSummary.total) : manualScore === '' ? scoreSummary.total : Number(manualScore || scoreSummary.total);
  const note = payload ? String(payload.note || '').trim() : document.querySelector('[data-run-note]')?.value?.trim() || '';
  const eventSummary = buildMissionEventSummary(state.data.missionEvents || []);
  const run = {
    id: Date.now(),
    ts: new Date().toISOString(),
    elapsedSeconds,
    score,
    grossScore: scoreSummary.gross,
    penalty: scoreSummary.penalty,
    successRate: scoreSummary.successRate,
    scoreItems,
    note: [note, eventSummary ? `${t('missionEventSummary')}:\n${eventSummary}` : ''].filter(Boolean).join('\n\n'),
  };
  state.data.missionRuns.unshift(run);
  state.dirtyFlags.missionRuns = true;
  return run;
}

export function updateMissionRun(state, id, payload = {}) {
  const index = state.data.missionRuns.findIndex(run => Number(run.id) === Number(id));
  if (index < 0) return false;
  state.data.missionRuns[index] = {
    ...state.data.missionRuns[index],
    score: Number(payload.score || 0),
    grossScore: Number(payload.grossScore || payload.score || 0),
    penalty: Number(payload.penalty || 0),
    successRate: Number(payload.successRate || 0),
    scoreItems: Array.isArray(payload.scoreItems) ? payload.scoreItems : [],
    note: String(payload.note || '').trim(),
  };
  state.dirtyFlags.missionRuns = true;
  return true;
}

export function deleteMissionRun(state, id) {
  const before = state.data.missionRuns.length;
  state.data.missionRuns = state.data.missionRuns.filter(run => Number(run.id) !== Number(id));
  state.dirtyFlags.missionRuns = before !== state.data.missionRuns.length;
  return state.dirtyFlags.missionRuns;
}

export function getRunPayloadFromDom(root = document) {
  const scoreItems = getScoreItemsFromDom(root);
  const penalty = Number(root.querySelector('[data-run-penalty]')?.value || 0);
  const scoreSummary = calculateMissionScore(scoreItems, penalty);
  const manualScore = root.querySelector('[data-run-score]')?.value;
  return {
    score: manualScore === '' ? scoreSummary.total : Number(manualScore || scoreSummary.total),
    grossScore: scoreSummary.gross,
    penalty: scoreSummary.penalty,
    successRate: scoreSummary.successRate,
    scoreItems,
    note: root.querySelector('[data-run-note]')?.value || '',
  };
}

export function getRunDraftFromRun(run = null) {
  return run ? {
    score: Number(run.score || 0),
    penalty: Number(run.penalty || 0),
    scoreItems: Array.isArray(run.scoreItems) ? run.scoreItems : [],
    note: String(run.note || ''),
  } : null;
}

function renderRunEditor({ editingRun = null, runDraft = null, scoreItems = [], scoreSummary = {} } = {}) {
  return `
    <div style="display:grid;gap:12px">
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${editingRun
          ? `<button class="btn btn-success" type="button" data-action="update-run">${escapeHtml(t('updateRun'))}</button>`
          : `<button class="btn btn-success" type="button" data-action="save-run">${escapeHtml(t('saveRun'))}</button>`}
        ${editingRun ? `<button class="btn" type="button" data-run-cancel-edit>${escapeHtml(t('cancelEdit'))}</button>` : ''}
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px">
        <label>${escapeHtml(t('grossScore'))}<input data-run-gross-score type="number" value="${escapeHtml(scoreSummary.gross || 0)}" readonly></label>
        <label>${escapeHtml(t('penalty'))}<input data-run-penalty type="number" min="0" value="${escapeHtml(editingRun?.penalty ?? runDraft?.penalty ?? 0)}"></label>
        <label>${escapeHtml(t('score'))}<input data-run-score type="number" value="${escapeHtml(editingRun?.score ?? runDraft?.score ?? 0)}"></label>
        <label>${escapeHtml(t('note'))}<input data-run-note value="${escapeHtml(editingRun?.note ?? runDraft?.note ?? '')}" placeholder="${escapeHtml(t('note'))}"></label>
      </div>
      <div data-mission-scoreboard style="display:grid;gap:8px">
        <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap">
          <strong style="color:var(--navy)">${escapeHtml(t('missionScoreboard'))}</strong>
          <span class="badge done">${escapeHtml(t('successRate'))}: ${escapeHtml(scoreSummary.successRate || 0)}%</span>
        </div>
        ${scoreItems.map(item => `
          <div data-score-item="${escapeHtml(item.id)}" data-score-label="${escapeHtml(item.label)}" data-score-max="${escapeHtml(item.max || 0)}" style="display:grid;grid-template-columns:minmax(140px,1fr) 96px 130px;gap:8px;align-items:center;border:1px solid var(--border);border-radius:8px;background:var(--input-bg);padding:8px">
            <div>
              <strong>${escapeHtml(item.label)}</strong>
              <div style="font-size:.72rem;color:var(--muted);font-weight:900">${escapeHtml(t('maxScore'))}: ${escapeHtml(item.max || '-')}</div>
            </div>
            <input data-score-item-value type="number" min="0" max="${escapeHtml(item.max || '')}" value="${escapeHtml(item.score || 0)}">
            <select data-score-item-status>
              ${[
                ['pending', t('pending')],
                ['done', t('done')],
                ['failed', t('failed')],
                ['skipped', t('skipped')],
              ].map(([value, label]) => `<option value="${value}" ${item.status === value ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('')}
            </select>
          </div>
        `).join('')}
      </div>
      ${!editingRun && runDraft ? `<div style="font-size:.78rem;color:var(--muted);font-weight:800">${escapeHtml(t('runDraftReady'))}</div>` : ''}
      ${editingRun ? `<div style="font-size:.78rem;color:var(--muted);font-weight:800">${escapeHtml(t('editingRun'))}: ${escapeHtml(new Date(editingRun.ts).toLocaleString())}</div>` : ''}
    </div>`;
}

export function normalizeRunFilters(filters = {}) {
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

export function getMissionRunStats(runs = []) {
  const scores = runs.map(run => Number(run.score || 0)).filter(Number.isFinite);
  const latest = runs[0] || null;
  const previous = runs[1] || null;
  const itemTotals = new Map();
  runs.forEach(run => {
    (run.scoreItems || []).forEach(item => {
      const key = item.label || item.id;
      const row = itemTotals.get(key) || { label: key, score: 0, max: 0, count: 0 };
      row.score += Number(item.score || 0);
      row.max += Number(item.max || 0);
      row.count += 1;
      itemTotals.set(key, row);
    });
  });
  const weakestItem = [...itemTotals.values()]
    .filter(row => row.max > 0)
    .map(row => ({ ...row, rate: Math.round((row.score / row.max) * 100) }))
    .sort((a, b) => a.rate - b.rate)[0] || null;
  return {
    count: runs.length,
    best: scores.length ? Math.max(...scores) : 0,
    average: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0,
    latestScore: latest ? Number(latest.score || 0) : null,
    delta: latest && previous ? Number(latest.score || 0) - Number(previous.score || 0) : null,
    weakestItem,
  };
}

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function buildMissionRunsCsv(runs = []) {
  const headers = ['ts', 'elapsedSeconds', 'score', 'grossScore', 'penalty', 'successRate', 'scoreItems', 'note'];
  const rows = runs.map(run => [
    run.ts || '',
    run.elapsedSeconds || 0,
    run.score || 0,
    run.grossScore || run.score || 0,
    run.penalty || 0,
    run.successRate || 0,
    (run.scoreItems || []).map(item => `${item.label}:${item.score}/${item.max}:${item.status}`).join('; '),
    run.note || '',
  ]);
  return [headers, ...rows].map(row => row.map(csvCell).join(',')).join('\n');
}

export function exportMissionRunsCsv(runs = [], documentRef = document) {
  const blob = new Blob([buildMissionRunsCsv(runs)], { type: 'text/csv;charset=utf-8' });
  const anchor = documentRef.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.download = `rov_v16_mission_runs_${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}

export function renderRunHistory(runs = [], options = {}) {
  if (!runs.length) return `<div style="color:var(--muted);font-weight:900">${escapeHtml(options.totalCount ? t('noMatchingRuns') : t('noMissionRunsYet'))}</div>`;
  return `
    <div style="display:grid;gap:6px">
      ${runs.map(run => `
        <div style="display:grid;grid-template-columns:auto 1fr auto auto;gap:8px;align-items:center;border:1px solid var(--border);border-radius:8px;background:var(--input-bg);padding:8px">
          <span class="badge done">${escapeHtml(formatMissionTime(run.elapsedSeconds))}</span>
          <div>
            <strong>${escapeHtml(new Date(run.ts).toLocaleString())}</strong>
            <div style="font-size:.76rem;color:var(--muted)">${escapeHtml(run.note || '-')}</div>
            ${Array.isArray(run.scoreItems) && run.scoreItems.length ? `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">${run.scoreItems.map(item => `<span class="badge mid">${escapeHtml(item.label)} ${escapeHtml(item.score)}/${escapeHtml(item.max || '-')} ${escapeHtml(labelFor(item.status))}</span>`).join('')}</div>` : ''}
          </div>
          <strong style="color:var(--green)">${escapeHtml(run.score)}${Number.isFinite(Number(run.successRate)) ? `<div style="font-size:.7rem;color:var(--muted)">${escapeHtml(run.successRate)}%</div>` : ''}</strong>
          <div style="display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end">
            <button class="btn btn-sm" type="button" data-run-duplicate="${escapeHtml(run.id)}">${escapeHtml(t('duplicateRun'))}</button>
            <button class="btn btn-sm" type="button" data-run-edit="${escapeHtml(run.id)}">${escapeHtml(t('edit'))}</button>
            <button class="btn btn-sm btn-danger" type="button" data-run-delete="${escapeHtml(run.id)}">${escapeHtml(t('delete'))}</button>
          </div>
        </div>
      `).join('')}
    </div>`;
}

export function renderCompetitionCenter(state, timer, options = {}) {
  const stats = getTaskStats(state.data.tasks);
  const missionEvents = state.data.missionEvents || [];
  const flowStep = Number(state.data.competitionFlowStep || 0);
  const filters = normalizeRunFilters(options.filters);
  const visibleRuns = sortMissionRuns(filterMissionRuns(state.data.missionRuns, filters), filters.sort);
  const activeFilterChips = getActiveRunFilterChips(filters);
  const editingRun = state.data.missionRuns.find(run => Number(run.id) === Number(options.editingRunId));
  const runStats = getMissionRunStats(state.data.missionRuns);
  const runDraft = options.runDraft || null;
  const elapsed = timer?.running ? Math.floor((Date.now() - timer.startedAt) / 1000) + timer.baseSeconds : timer?.baseSeconds || 0;
  const scoreItems = editingRun?.scoreItems?.length ? editingRun.scoreItems : runDraft?.scoreItems?.length ? runDraft.scoreItems : getScoreTemplateItems(state);
  const scoreSummary = calculateMissionScore(scoreItems, editingRun?.penalty ?? runDraft?.penalty ?? 0);
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
        </div>
        ${!editingRun ? renderRunEditor({ runDraft, scoreItems, scoreSummary }) : ''}
      </div>
      <div class="card" data-run-stats>
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap">
          <h2 style="margin:0">${escapeHtml(t('postRunStats'))}</h2>
          <button class="btn btn-sm btn-primary" type="button" data-action="export-mission-runs-csv">${escapeHtml(t('exportMissionRunsCsv'))}</button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin-top:10px">
          ${[
            [t('missionRuns'), runStats.count],
            [t('bestScore'), runStats.best],
            [t('avgScore'), runStats.average],
            [t('scoreDelta'), runStats.delta === null ? '-' : (runStats.delta > 0 ? `+${runStats.delta}` : runStats.delta)],
            [t('weakestArea'), runStats.weakestItem ? `${runStats.weakestItem.label} ${runStats.weakestItem.rate}%` : '-'],
          ].map(([label, value]) => `
            <div style="border:1px solid var(--border);border-radius:8px;background:var(--input-bg);padding:8px">
              <div style="font-size:.74rem;color:var(--muted);font-weight:900">${escapeHtml(label)}</div>
              <div style="font-size:1.15rem;color:var(--navy);font-weight:900;margin-top:3px">${escapeHtml(value)}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="card" data-competition-flow>
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap">
          <h2 style="margin:0">${escapeHtml(t('competitionFlow'))}</h2>
          <div style="font-size:.78rem;color:var(--muted);font-weight:900">${escapeHtml(t('currentStep'))}: ${escapeHtml(COMPETITION_FLOW_STEPS[flowStep])}</div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:7px;margin-top:10px">
          ${COMPETITION_FLOW_STEPS.map((step, index) => `
            <button class="btn btn-sm ${index === flowStep ? 'btn-primary' : ''}" type="button" data-flow-step="${index}">${escapeHtml(index + 1)}. ${escapeHtml(step)}</button>
          `).join('')}
        </div>
      </div>
      <div class="card" data-mission-events>
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap">
          <h2 style="margin:0">${escapeHtml(t('missionEvents'))}</h2>
          <button class="btn btn-sm" type="button" data-action="clear-mission-events">${escapeHtml(t('clear'))}</button>
        </div>
        <div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:10px">
          ${[
            ['judge_confirm', t('judgeConfirm')],
            ['retry', 'Retry'],
            ['stuck', t('stuck')],
            ['comms_issue', t('commsIssue')],
            ['mission_done', t('missionDone')],
          ].map(([type, label]) => `<button class="btn btn-sm" type="button" data-mission-event="${escapeHtml(type)}">${escapeHtml(label)}</button>`).join('')}
        </div>
        <label style="display:grid;grid-template-columns:minmax(180px,1fr) auto;gap:8px;align-items:end;margin-top:10px">
          <span>${escapeHtml(t('customEvent'))}<input data-custom-mission-event placeholder="${escapeHtml(t('customEvent'))}"></span>
          <button class="btn btn-sm btn-primary" type="button" data-action="add-custom-mission-event">${escapeHtml(t('addItem'))}</button>
        </label>
        <div data-mission-event-log style="display:grid;gap:6px;margin-top:10px">
          ${missionEvents.length ? missionEvents.slice(0, 8).map(event => `
            <div style="display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:center;border:1px solid var(--border);border-radius:8px;background:var(--input-bg);padding:8px">
              <span class="badge mid">${escapeHtml(formatMissionTime(event.elapsedSeconds || 0))}</span>
              <strong>${escapeHtml(event.label)}</strong>
              <span style="font-size:.72rem;color:var(--muted);font-weight:900">${escapeHtml(new Date(event.ts).toLocaleTimeString())}</span>
            </div>
          `).join('') : `<div style="color:var(--muted);font-weight:900">${escapeHtml(t('noMissionEvents'))}</div>`}
        </div>
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
      <div class="modal-bg ${editingRun ? 'open' : ''}" data-run-modal-bg>
        <div class="modal wide" role="dialog" aria-modal="true" aria-labelledby="run-modal-title" data-run-modal>
          <h3 id="run-modal-title">${escapeHtml(t('editingRun'))}</h3>
          ${editingRun ? renderRunEditor({ editingRun, scoreItems, scoreSummary }) : ''}
        </div>
      </div>
    </section>`;
}

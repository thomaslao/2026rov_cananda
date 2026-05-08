import { escapeHtml } from '../utils/index.js';
import { labelFor, t } from '../utils/i18n.js';

function clean(value) {
  return String(value || '').trim();
}

function numberFromForm(form, name) {
  return Number(form.get(name) || 0);
}

export function createPresentationRunFromForm(form) {
  const structure = numberFromForm(form, 'structure');
  const technical = numberFromForm(form, 'technical');
  const delivery = numberFromForm(form, 'delivery');
  const qa = numberFromForm(form, 'qa');
  return {
    id: Date.now(),
    ts: new Date().toISOString(),
    speaker: clean(form.get('speaker')) || 'Presentation',
    structure,
    technical,
    delivery,
    qa,
    total: structure + technical + delivery + qa,
    note: clean(form.get('note')),
  };
}

export function addPresentationRun(state, run) {
  state.data.presentationRuns.unshift(run);
  state.dirtyFlags.presentationRuns = true;
}

function getPresentationTrend(runs = []) {
  const latest = runs[0];
  const previous = runs[1];
  return {
    latest,
    previous,
    delta: latest && previous ? Number(latest.total || 0) - Number(previous.total || 0) : null,
    weak: latest ? [
      ['Structure', latest.structure],
      ['Technical', latest.technical],
      ['Delivery', latest.delivery],
      ['Q&A', latest.qa],
    ].sort((a, b) => Number(a[1] || 0) - Number(b[1] || 0))[0] : null,
  };
}

export function renderPresentationPage(state) {
  const runs = state.data.presentationRuns || [];
  const trend = getPresentationTrend(runs);
  return `
    <section id="page-presentation" class="page active" style="display:grid;gap:12px">
      <div class="page-topbar">
        <div>
          <h1 style="margin:0;color:var(--navy)">${escapeHtml(t('presentation'))}</h1>
          <div class="page-top-summary">${escapeHtml(t('presentationSummary'))}</div>
        </div>
        <div class="page-top-summary">${escapeHtml(t('visible'))} ${runs.length}</div>
      </div>
      <div class="card" data-presentation-trend>
        <h2 style="margin-top:0">${escapeHtml(t('presentationTrend'))}</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px">
          ${[
            [t('latestScore'), trend.latest ? trend.latest.total : '-'],
            [t('scoreDelta'), trend.delta === null ? '-' : (trend.delta > 0 ? `+${trend.delta}` : trend.delta)],
            [t('weakestArea'), trend.weak ? trend.weak[0] : '-'],
            [t('presentationRuns'), runs.length],
          ].map(([label, value]) => `
            <div style="border:1px solid var(--border);border-radius:8px;background:var(--input-bg);padding:9px">
              <div style="font-size:.74rem;color:var(--muted);font-weight:900">${escapeHtml(label)}</div>
              <div style="font-size:1.2rem;color:var(--navy);font-weight:900;margin-top:3px">${escapeHtml(value)}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <form class="card" data-presentation-form>
        <h2 style="margin-top:0">${escapeHtml(t('addPresentationRun'))}</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px">
          <label>${escapeHtml(t('speaker'))}<input name="speaker" placeholder="Presentation A"></label>
          <label>${escapeHtml(t('structure'))}<input name="structure" type="number" min="0" max="10" value="0"></label>
          <label>${escapeHtml(t('technical'))}<input name="technical" type="number" min="0" max="10" value="0"></label>
          <label>${escapeHtml(t('delivery'))}<input name="delivery" type="number" min="0" max="10" value="0"></label>
          <label>${escapeHtml(t('qa'))}<input name="qa" type="number" min="0" max="10" value="0"></label>
        </div>
        <label style="display:block;margin-top:8px">${escapeHtml(t('note'))}<input name="note" placeholder="${escapeHtml(t('note'))}"></label>
        <button class="btn btn-primary" type="submit" style="margin-top:10px">${escapeHtml(t('saveRun'))}</button>
      </form>
      <div class="card" data-presentation-history>
        <h2 style="margin-top:0">${escapeHtml(t('presentationHistory'))}</h2>
        ${runs.length ? `<div style="display:grid;gap:6px">${runs.map(run => `
          <div style="display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:center;border:1px solid var(--border);border-radius:8px;background:var(--input-bg);padding:8px">
            <span class="badge done">${escapeHtml(run.total)}</span>
            <div>
              <strong>${escapeHtml(run.speaker)}</strong>
              <div style="font-size:.76rem;color:var(--muted)">${escapeHtml(new Date(run.ts).toLocaleString())} | ${escapeHtml(run.note || '-')}</div>
            </div>
            <span style="font-size:.78rem;color:var(--muted);font-weight:900">S${escapeHtml(run.structure)} T${escapeHtml(run.technical)} D${escapeHtml(run.delivery)} Q${escapeHtml(run.qa)}</span>
          </div>
        `).join('')}</div>` : `<div style="color:var(--muted);font-weight:900">${escapeHtml(t('noPresentationRuns'))}</div>`}
      </div>
    </section>`;
}

export function renderGanttPage(state) {
  const tasks = [...(state.data.tasks || [])].sort((a, b) => String(a.due || '9999-12-31').localeCompare(String(b.due || '9999-12-31')));
  const today = new Date();
  const days = Array.from({ length: 35 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    return date.toISOString().slice(5, 10);
  });
  return `
    <section id="page-gantt" class="page active" style="display:grid;gap:12px">
      <div class="page-topbar">
        <div>
          <h1 style="margin:0;color:var(--navy)">${escapeHtml(t('gantt'))}</h1>
          <div class="page-top-summary">${escapeHtml(t('ganttSummary'))}</div>
        </div>
        <div class="page-top-actions"><button class="btn btn-sm btn-primary" type="button" data-page="tasks">${escapeHtml(t('tasks'))}</button></div>
      </div>
      <div class="card" data-gantt-board>
        <div class="gantt-wrap">
          <table class="gantt-table">
            <thead><tr><th>${escapeHtml(t('task'))}</th>${days.map(day => `<th>${escapeHtml(day)}</th>`).join('')}</tr></thead>
            <tbody>
              ${tasks.map(task => {
                const due = String(task.due || '').slice(5, 10);
                return `<tr><td style="min-width:220px"><strong>${escapeHtml(task.name)}</strong><div style="font-size:.74rem;color:var(--muted)">${escapeHtml(task.owner || labelFor('Unassigned'))} | ${escapeHtml(labelFor(task.status || 'Open'))}</div></td>${days.map(day => `<td class="gantt-cell">${day === due ? '<div class="g-bar" style="height:14px"></div>' : ''}</td>`).join('')}</tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </section>`;
}

export function analyzeFloatPackets(raw) {
  const lines = String(raw || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const numbers = lines.flatMap(line => (line.match(/-?\d+(?:\.\d+)?/g) || []).map(Number));
  const min = numbers.length ? Math.min(...numbers) : null;
  const max = numbers.length ? Math.max(...numbers) : null;
  const avg = numbers.length ? Math.round(numbers.reduce((sum, value) => sum + value, 0) / numbers.length * 100) / 100 : null;
  return {
    checkedAt: new Date().toISOString(),
    lines: lines.length,
    values: numbers.length,
    min,
    max,
    avg,
    warnings: [
      lines.length === 0 ? 'No packet lines found.' : '',
      numbers.length === 0 ? 'No numeric depth/data values found.' : '',
    ].filter(Boolean),
  };
}

export function saveFloatPacketAnalysis(state, raw) {
  const analysis = analyzeFloatPackets(raw);
  state.data.floatPackets = { raw: String(raw || ''), analysis };
  state.dirtyFlags.floatPackets = true;
  return analysis;
}

export function clearFloatPackets(state) {
  state.data.floatPackets = { raw: '', analysis: null };
  state.dirtyFlags.floatPackets = true;
}

export function renderFloatPage(state) {
  const packet = state.data.floatPackets || { raw: '', analysis: null };
  const analysis = packet.analysis;
  return `
    <section id="page-float" class="page active" style="display:grid;gap:12px">
      <div class="page-topbar">
        <div>
          <h1 style="margin:0;color:var(--navy)">${escapeHtml(t('float'))}</h1>
          <div class="page-top-summary">${escapeHtml(t('floatSummary'))}</div>
        </div>
      </div>
      <div class="card" data-float-packet-tool>
        <h2 style="margin-top:0">${escapeHtml(t('floatPacketChecker'))}</h2>
        <textarea data-float-packets style="width:100%;min-height:180px" placeholder="${escapeHtml(t('floatPacketPlaceholder'))}">${escapeHtml(packet.raw || '')}</textarea>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
          <button class="btn btn-primary" type="button" data-action="analyze-float-packets">${escapeHtml(t('analyze'))}</button>
          <button class="btn" type="button" data-action="clear-float-packets">${escapeHtml(t('clear'))}</button>
        </div>
        <div data-float-analysis style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin-top:10px">
          ${analysis ? [
            [t('packetLines'), analysis.lines],
            [t('numericValues'), analysis.values],
            ['Min', analysis.min ?? '-'],
            ['Max', analysis.max ?? '-'],
            ['Avg', analysis.avg ?? '-'],
          ].map(([label, value]) => `<div style="border:1px solid var(--border);border-radius:8px;background:var(--input-bg);padding:8px"><div style="font-size:.74rem;color:var(--muted);font-weight:900">${escapeHtml(label)}</div><div style="font-size:1.1rem;color:var(--navy);font-weight:900">${escapeHtml(value)}</div></div>`).join('') : `<div style="color:var(--muted);font-weight:900">${escapeHtml(t('noFloatAnalysis'))}</div>`}
        </div>
      </div>
    </section>`;
}

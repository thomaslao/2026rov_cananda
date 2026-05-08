import { escapeHtml, safeJsonParse } from '../utils/index.js';

export const SMOKE_TEST_LOG_KEY = 'rov_v16_smoke_test_log';
export const DEFAULT_SMOKE_CHECKS = [
  { label: 'App root', id: 'app' },
  { label: 'Navigation', selector: 'nav' },
];

export function evaluateSmokeChecks(checks = DEFAULT_SMOKE_CHECKS, documentRef = document) {
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

export function getSmokeTestLog(storage = localStorage) {
  return safeJsonParse(storage.getItem(SMOKE_TEST_LOG_KEY), []);
}

export function saveSmokeTestResult(result, storage = localStorage) {
  const rows = getSmokeTestLog(storage);
  rows.unshift(result);
  storage.setItem(SMOKE_TEST_LOG_KEY, JSON.stringify(rows.slice(0, 10)));
}

export function runSmokeTest(options = {}) {
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

function hasTaskEvidence(task = {}) {
  return Array.isArray(task.evidence) && task.evidence.some(item => (
    String(item?.label || item?.name || item?.title || '').trim()
    || String(item?.url || item?.href || item?.link || '').trim()
    || String(item?.note || item?.notes || '').trim()
  ));
}

export function getDataHealthIssues(state) {
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
    if ((task.priority === 'High' || task.status === 'Done') && !hasTaskEvidence(task)) {
      issues.push({ level: 'warn', title: 'Task missing evidence', detail: taskName });
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

export function renderSmokeTestSummaryHtml(result) {
  if (!result) {
    return '<div style="font-size:.86rem;color:var(--muted);font-weight:900">Smoke Test: not run yet.</div>';
  }
  const failed = result.checks.filter(check => !check.ok);
  const status = result.ok ? 'pass' : `failed ${failed.length}`;
  const color = result.ok ? 'var(--green)' : 'var(--red)';
  return `<div style="font-size:.86rem;color:${color};font-weight:900">Smoke Test: ${escapeHtml(status)} | ${escapeHtml(new Date(result.ts).toLocaleString())}</div>`;
}

export function renderSmokeTestPanel(container, result, history = []) {
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

export function runV16ScaffoldSmokeTest(options = {}) {
  return runSmokeTest(options);
}

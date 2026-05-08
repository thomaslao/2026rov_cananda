const BASE_URL = process.env.V16_BASE_URL || 'http://127.0.0.1:8016';

const checks = [];

function check(label, ok, detail = '') {
  checks.push({ label, ok: Boolean(ok), detail });
}

async function fetchText(path) {
  const url = new URL(path, BASE_URL).toString();
  try {
    const response = await fetch(url);
    const text = await response.text();
    check(`GET ${path}`, response.ok, `${response.status} ${url}`);
    return { response, text, url };
  } catch (error) {
    check(`GET ${path}`, false, error.message || String(error));
    return { response: null, text: '', url };
  }
}

function extractModuleImports(source) {
  return [...source.matchAll(/from\s+['"]([^'"]+)['"]/g)].map(match => match[1]);
}

function resolveModulePath(parentPath, importPath) {
  if (!importPath.startsWith('.')) return null;
  const parent = new URL(parentPath, BASE_URL);
  return new URL(importPath, parent).pathname.replace(/^\/+/, '');
}

const html = await fetchText('/');
check('HTML has app root', html.text.includes('<main id="app"></main>'));
check('HTML loads module app', html.text.includes('type="module"'));

const healthz = await fetchText('/healthz');
let healthPayload = null;
try {
  healthPayload = JSON.parse(healthz.text || '{}');
} catch (error) {
  healthPayload = null;
}
check('healthz status ok', healthPayload?.status === 'ok' && healthPayload?.version === 'v16');

const app = await fetchText('/src/app.js');
check('app.js imports state', app.text.includes('./data/state.js'));
check('app.js imports settings', app.text.includes('./features/settings.js'));

const queue = ['/src/app.js'];
const seen = new Set();
while (queue.length) {
  const path = queue.shift();
  if (seen.has(path)) continue;
  seen.add(path);
  const { text } = path === '/src/app.js' ? app : await fetchText(path);
  for (const importPath of extractModuleImports(text)) {
    const resolved = resolveModulePath(path, importPath);
    if (resolved && !seen.has(`/${resolved}`)) queue.push(`/${resolved}`);
  }
}

check('module graph size', seen.size >= 10, `${seen.size} modules`);
check('settings module fetched', seen.has('/src/features/settings.js'));
check('sync module fetched', seen.has('/src/data/sync.js'));
check('i18n module fetched', seen.has('/src/utils/i18n.js'));

const failed = checks.filter(row => !row.ok);
console.table(checks.map(row => ({
  ok: row.ok ? 'OK' : 'FAIL',
  check: row.label,
  detail: row.detail,
})));

if (failed.length) {
  console.error(`v16 server smoke failed: ${failed.length} checks`);
  failed.forEach(row => console.error(`- ${row.label}: ${row.detail}`));
  process.exit(1);
}

console.log(`v16 server smoke passed: ${checks.length} checks against ${BASE_URL}`);

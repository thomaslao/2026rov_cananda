const BASE_URLS = process.env.V16_BASE_URL
  ? [process.env.V16_BASE_URL]
  : (process.env.V16_BASE_URLS
      ? process.env.V16_BASE_URLS.split(',').map(value => value.trim()).filter(Boolean)
      : Array.from({ length: Number(process.env.V16_STATUS_PORTS || 10) }, (_, index) => `http://127.0.0.1:${8016 + index}`));

const attempts = [];
let active = null;

for (const baseUrl of BASE_URLS) {
  try {
    const healthResponse = await fetch(new URL('/healthz', baseUrl));
    if (!healthResponse.ok) {
      attempts.push({ baseUrl, ok: false, detail: `health ${healthResponse.status}` });
      continue;
    }

    const payload = await healthResponse.json();
    if (payload?.status !== 'ok' || payload?.version !== 'v16') {
      attempts.push({ baseUrl, ok: false, detail: 'not v16' });
      continue;
    }

    const appResponse = await fetch(baseUrl);
    active = {
      baseUrl,
      health: payload,
      appStatus: appResponse.status,
      ok: appResponse.ok,
    };
    break;
  } catch (error) {
    attempts.push({ baseUrl, ok: false, detail: error.message || String(error) });
  }
}

if (!active?.ok) {
  console.table(attempts.map(row => ({
    ok: row.ok ? 'OK' : 'MISS',
    url: row.baseUrl,
    detail: row.detail,
  })));
  console.error('ROV Task Manager v16 is not reachable on the checked URLs.');
  process.exit(1);
}

console.table([
  ['URL', active.baseUrl],
  ['Health', `${active.health.status} ${active.health.version}`],
  ['App', `${active.appStatus} OK`],
  ['Checked At', new Date().toISOString()],
].map(([label, value]) => ({ label, value })));
console.log(`ROV Task Manager v16 is usable at ${active.baseUrl}`);

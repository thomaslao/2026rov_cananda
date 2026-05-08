import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const BASE_URLS = process.env.V16_BASE_URL
  ? [process.env.V16_BASE_URL]
  : (process.env.V16_BASE_URLS
      ? process.env.V16_BASE_URLS.split(',').map(value => value.trim()).filter(Boolean)
      : Array.from({ length: 10 }, (_, index) => `http://127.0.0.1:${8016 + index}`));
const checks = [];
const warnings = [];
let v16BaseUrl = '';

function check(label, ok, detail = '') {
  checks.push({ label, ok: Boolean(ok), detail });
}

function warn(label, detail = '') {
  warnings.push({ label, detail });
}

async function findV16BaseUrl() {
  const errors = [];
  for (const baseUrl of BASE_URLS) {
    try {
      const response = await fetch(new URL('/healthz', baseUrl));
      if (!response.ok) {
        errors.push(`${response.status} ${baseUrl}/healthz`);
        continue;
      }
      const payload = await response.json();
      if (payload?.status === 'ok' && payload?.version === 'v16') {
        v16BaseUrl = baseUrl;
        check('v16 health endpoint reachable', true, `${response.status} ${baseUrl}/healthz`);
        return;
      }
      errors.push(`non-v16 healthz ${baseUrl}`);
    } catch (error) {
      errors.push(`${baseUrl}/healthz: ${error.message || String(error)}`);
    }
  }
  check('v16 health endpoint reachable', false, errors.join(' | '));
}

async function checkServer() {
  if (!v16BaseUrl) {
    check('local v16 app reachable', false, 'No v16 health endpoint found.');
    return;
  }
  try {
    const response = await fetch(v16BaseUrl);
    check('local v16 app reachable', response.ok, `${response.status} ${v16BaseUrl}`);
  } catch (error) {
    check('local v16 app reachable', false, error.message || String(error));
  }
}

async function checkSpawn() {
  await new Promise((resolveCheck) => {
    let child;
    try {
      child = spawn(process.execPath, ['-e', 'process.exit(0)'], {
        stdio: 'ignore',
      });
    } catch (error) {
      check('node child process spawn', false, error.message || String(error));
      resolveCheck();
      return;
    }
    child.on('error', (error) => {
      check('node child process spawn', false, error.message || String(error));
      resolveCheck();
    });
    child.on('exit', (code) => {
      check('node child process spawn', code === 0, `exit ${code}`);
      resolveCheck();
    });
  });
}

async function checkPlaywrightPackage() {
  const packagePath = resolve('node_modules', '@playwright', 'test', 'package.json');
  check('Playwright package installed', existsSync(packagePath), packagePath);
}

async function checkPlaywrightCli() {
  await new Promise((resolveCheck) => {
    let child;
    try {
      child = spawn(process.execPath, ['node_modules/playwright/cli.js', '--version'], {
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: false,
      });
    } catch (error) {
      warn('Playwright CLI spawn', error.message || String(error));
      resolveCheck();
      return;
    }
    let out = '';
    let err = '';
    child.stdout?.on('data', chunk => { out += chunk; });
    child.stderr?.on('data', chunk => { err += chunk; });
    child.on('error', (error) => {
      warn('Playwright CLI spawn', error.message || String(error));
      resolveCheck();
    });
    child.on('exit', (code) => {
      const detail = (out || err || `exit ${code}`).trim();
      if (code === 0) check('Playwright CLI spawn', true, detail);
      else warn('Playwright CLI spawn', detail);
      resolveCheck();
    });
  });
}

await findV16BaseUrl();
await checkServer();
await checkPlaywrightPackage();
await checkSpawn();
await checkPlaywrightCli();

const failed = checks.filter(row => !row.ok);
console.table(checks.map(row => ({
  ok: row.ok ? 'OK' : 'FAIL',
  check: row.label,
  detail: row.detail,
})));

if (warnings.length) {
  console.table(warnings.map(row => ({
    warning: 'WARN',
    check: row.label,
    detail: row.detail,
  })));
}

if (failed.length) {
  console.error('E2E readiness failed. V16 app readiness did not pass.');
  process.exit(1);
}

console.log(warnings.length
  ? 'E2E readiness passed for the v16 app. Browser E2E may be limited in this environment.'
  : 'E2E readiness passed.');

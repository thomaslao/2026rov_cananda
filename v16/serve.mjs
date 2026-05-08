import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, normalize, resolve, sep } from 'node:path';

const root = process.cwd();
const host = process.env.V16_HOST || '127.0.0.1';
const preferredPort = Number(process.env.V16_PORT || 8016);
const maxPortAttempts = Number(process.env.V16_PORT_ATTEMPTS || 10);

const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml',
};

function resolveSafePath(urlPath) {
  const cleanPath = decodeURIComponent(new URL(urlPath, `http://${host}:${preferredPort}`).pathname);
  const relativePath = cleanPath === '/' ? 'index.html' : cleanPath.replace(/^\/+/, '');
  const fullPath = resolve(root, normalize(relativePath));
  if (fullPath !== root && !fullPath.startsWith(`${root}${sep}`)) return null;
  return fullPath;
}

const server = createServer((request, response) => {
  const pathname = new URL(request.url || '/', `http://${host}:${preferredPort}`).pathname;
  if (pathname === '/healthz') {
    response.writeHead(200, {
      'cache-control': 'no-store',
      'content-type': 'application/json; charset=utf-8',
    });
    response.end(JSON.stringify({
      app: 'rov-task-manager',
      version: 'v16',
      status: 'ok',
      ts: new Date().toISOString(),
    }));
    return;
  }

  const fullPath = resolveSafePath(request.url || '/');
  if (!fullPath || !existsSync(fullPath) || !statSync(fullPath).isFile()) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  response.writeHead(200, {
    'cache-control': 'no-store',
    'content-type': types[extname(fullPath)] || 'application/octet-stream',
  });
  createReadStream(fullPath).pipe(response);
});

let activePort = preferredPort;
let attempts = 0;

function listen(port) {
  activePort = port;
  server.listen(activePort, host, () => {
    console.log(`ROV Task Manager v16 running at http://${host}:${activePort}`);
  });
}

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE' && attempts < maxPortAttempts - 1) {
    attempts += 1;
    const nextPort = preferredPort + attempts;
    console.warn(`v16 server port ${activePort} is busy; trying ${nextPort}`);
    listen(nextPort);
    return;
  }
  console.error(`v16 server failed on http://${host}:${activePort}: ${error.message}`);
  process.exit(1);
});

listen(activePort);

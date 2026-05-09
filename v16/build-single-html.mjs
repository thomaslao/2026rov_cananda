import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(root, 'ROV_Task_Manager_v16.html');

const modules = [
  'src/data/defaults.js',
  'src/utils/date.js',
  'src/utils/dom.js',
  'src/utils/i18n.js',
  'src/utils/index.js',
  'src/data/state.js',
  'src/data/migration.js',
  'src/data/diagnostics.js',
  'src/data/supabase.js',
  'src/data/sync.js',
  'src/features/tasks.js',
  'src/features/health.js',
  'src/features/navigation.js',
  'src/features/members.js',
  'src/features/intel.js',
  'src/features/legacy.js',
  'src/features/competition.js',
  'src/features/prep.js',
  'src/features/settings.js',
  'src/app.js',
];

const moduleVars = new Map(modules.map(modulePath => [normalize(modulePath), toModuleVar(modulePath)]));

function normalize(path) {
  return path.replaceAll('\\', '/').replace(/^\.\//, '');
}

function toModuleVar(modulePath) {
  return `__${normalize(modulePath).replace(/[^a-zA-Z0-9]/g, '_')}`;
}

function resolveImport(fromModule, importPath) {
  const resolved = normalize(relative(root, resolve(root, dirname(fromModule), importPath)));
  return resolved.endsWith('.js') ? resolved : `${resolved}.js`;
}

function stripImports(source) {
  return source.replace(/^import\s+{[\s\S]*?}\s+from\s+['"][^'"]+['"];\s*/gm, '')
    .replace(/^import\s+[^;]+;\s*/gm, '');
}

function parseNamedImports(source, modulePath) {
  const imports = [];
  const pattern = /import\s+{([\s\S]*?)}\s+from\s+['"]([^'"]+)['"];\s*/g;
  for (const match of source.matchAll(pattern)) {
    const fromVar = moduleVars.get(resolveImport(modulePath, match[2]));
    if (!fromVar) throw new Error(`Unknown import ${match[2]} from ${modulePath}`);
    const names = match[1]
      .split(',')
      .map(part => part.trim())
      .filter(Boolean)
      .map((part) => {
        const aliasMatch = part.match(/^(\w+)\s+as\s+(\w+)$/);
        return aliasMatch ? `${aliasMatch[1]}: ${aliasMatch[2]}` : part;
      });
    if (names.length) imports.push(`const { ${names.join(', ')} } = ${fromVar};`);
  }
  return imports.join('\n');
}

function parseExports(source) {
  const names = [];
  for (const match of source.matchAll(/export\s+(?:async\s+)?function\s+(\w+)/g)) names.push(match[1]);
  for (const match of source.matchAll(/export\s+const\s+(\w+)/g)) names.push(match[1]);
  return [...new Set(names)];
}

function transformExports(source) {
  return source
    .replace(/^export\s+async\s+function\s+/gm, 'async function ')
    .replace(/^export\s+function\s+/gm, 'function ')
    .replace(/^export\s+const\s+/gm, 'const ')
    .replace(/^export\s+\*\s+from\s+['"][^'"]+['"];\s*/gm, '');
}

function buildModule(modulePath) {
  const source = stripBom(readFileSync(resolve(root, modulePath), 'utf8'));
  const moduleVar = moduleVars.get(normalize(modulePath));
  if (modulePath === 'src/utils/index.js') {
    return `const ${moduleVar} = { ...${moduleVars.get('src/utils/date.js')}, ...${moduleVars.get('src/utils/dom.js')} };`;
  }

  const imports = parseNamedImports(source, modulePath);
  const exports = parseExports(source);
  const body = transformExports(stripImports(source));
  return `const ${moduleVar} = (() => {\n${imports}\n${body}\nreturn { ${exports.join(', ')} };\n})();`;
}

function escapeScript(value) {
  return value.replace(/<\/script/gi, '<\\/script');
}

function stripBom(value) {
  return value.replace(/^\uFEFF/, '');
}

const css = stripBom(readFileSync(resolve(root, 'styles/app.css'), 'utf8'));
const script = modules.map(buildModule).join('\n\n');
const html = `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ROV Task Manager v16</title>
  <style>
${css}
  </style>
</head>
<body>
  <main id="app">
    <div style="padding:24px;font-family:Arial,sans-serif;color:#17324d">
      ROV Task Manager v16 loading...
    </div>
  </main>
  <script>
window.__ROV_V16_RENDERED = false;
window.setTimeout(() => {
  const app = document.getElementById('app');
  if (!app || window.__ROV_V16_RENDERED) return;
  const stillLoading = String(app.textContent || '').includes('ROV Task Manager v16 loading');
  if (!stillLoading) return;
  app.innerHTML = '<div style="padding:24px;font-family:Arial,sans-serif;color:#8a1f11;background:#fff3f0;border:1px solid #f0b8aa;margin:16px;border-radius:8px"><strong>ROV Task Manager v16 did not finish loading.</strong><div style="margin-top:8px;line-height:1.5">Open <code>F:\\\\Dropbox\\\\ROV_Task_Manager\\\\v16\\\\ROV_Task_Manager_v16.html</code> directly, or press Ctrl+F5 to refresh. If this message remains, open DevTools Console and copy the red error.</div></div>';
}, 1500);
window.addEventListener('error', (event) => {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = '<div style="padding:24px;font-family:Arial,sans-serif;color:#8a1f11;background:#fff3f0;border:1px solid #f0b8aa;margin:16px;border-radius:8px"><strong>ROV Task Manager v16 failed to load / 頛憭望?</strong><div style="margin-top:8px;white-space:pre-wrap">' + String(event.message || event.error || 'Unknown error') + '</div></div>';
});
${escapeScript(script)}
window.__ROV_V16_RENDERED = true;
  </script>
</body>
</html>
`;

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, html, 'utf8');
console.log(`Built ${outputPath}`);


#!/usr/bin/env node
// The separate-project proof (Q99, docs/handoff-readiness.md "The proof"): a fresh Vite + React project in an empty
// folder outside this repository, set up by the shipped guide's step 1 alone (packages/core/guide/1-install.md), that
// renders the library's components and one shipped template, then type-checks, builds and serves. The folder is
// deleted afterwards unless --keep.
//
//   node ./tools/separate-project-proof.mjs                      install the tarballs `npm run pack` wrote (.packages/)
//   node ./tools/separate-project-proof.mjs --release 0.2.0-beta.1   install from the GitHub release URLs, as the guide does
//   node ./tools/separate-project-proof.mjs --keep               leave the folder for a look in a browser
//
// Public packages come from the npm registry this machine is configured for (never switched here). Needs npm 10+.
import { execSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const keep = args.includes('--keep');
const releaseAt = args.indexOf('--release');
const version = releaseAt >= 0 ? args[releaseAt + 1] : JSON.parse(readFileSync(join(root, 'packages/core/package.json'), 'utf8')).version;
const results = [];
const step = (name, fn) => {
  const t = Date.now();
  try {
    const out = fn();
    results.push({ step: name, result: `ok (${((Date.now() - t) / 1000).toFixed(1)} s)${out ? `: ${out}` : ''}` });
  } catch (e) {
    results.push({ step: name, result: `FAILED: ${String(e.stderr || e.message).trim().split('\n').slice(-6).join(' | ')}` });
    report();
    process.exit(1);
  }
};
const report = () => {
  console.log(`\nSeparate-project proof, ${version}${releaseAt >= 0 ? ' from the GitHub release' : ' from .packages/'}, in ${dir}${keep ? ' (kept)' : ' (deleted)'}`);
  for (const r of results) console.log(`| ${r.step} | ${r.result} |`);
};
const sh = (cmd, cwd = dir) => execSync(cmd, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], shell: true });

// Guide step 1 needs npm 10+; on an older default, run npm 11 through npx (from the configured registry).
const npm = Number(sh('npm -v', root).trim().split('.')[0]) >= 10 ? 'npm' : 'npx -y npm@11';
const dir = mkdtempSync(join(tmpdir(), 'design-library-proof-'));

const sources = releaseAt >= 0
  ? ['core', 'templates'].map((p) => `https://github.com/prabinpebam/design-library/releases/download/v${version}/design-library-${p}-${version}.tgz`)
  : ['core', 'templates'].map((p) => join(root, '.packages', `design-library-${p}-${version}.tgz`));
if (releaseAt < 0) for (const s of sources) if (!existsSync(s)) throw new Error(`${s} is missing: run npm run pack first.`);

// Guide step 1, items 1, 3, 4, 6 and 7, word for word; item 8's screen, plus one shipped template (guide step 6, item 2).
const files = {
  'package.json': JSON.stringify({ name: 'proof', private: true, type: 'module', scripts: { dev: 'vite', build: 'vite build' } }, null, 2),
  'vite.config.ts': "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({ plugins: [react()] });\n",
  'tsconfig.json': JSON.stringify({ compilerOptions: { target: 'ES2022', module: 'ESNext', moduleResolution: 'Bundler', jsx: 'react-jsx', lib: ['ES2022', 'DOM', 'DOM.Iterable'], types: ['vite/client'], resolveJsonModule: true, allowJs: true, isolatedModules: true, skipLibCheck: true, strict: true, noEmit: true }, include: ['src'] }, null, 2),
  'index.html': '<!doctype html>\n<html lang="en">\n  <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Proof</title></head>\n  <body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body>\n</html>\n',
  'src/main.tsx': "import { StrictMode } from 'react';\nimport { createRoot } from 'react-dom/client';\nimport '@design-library/core/css/index.css';\nimport { applyFonts } from '@design-library/core/theme';\nimport { App } from './App';\n\nvoid applyFonts();\ncreateRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);\n",
  'src/App.tsx': `import { Heading, Notifications, Section, SiteHeader, SiteLayout, Stack, Text } from '@design-library/core/react';
import { TemplateView } from '@design-library/core/render';
import corporate from '@design-library/templates/corporate';

export function App() {
  if (location.hash === '#/template') return <TemplateView template={corporate} layout="home" hrefFor={(_t, layout) => \`#/\${layout}\`} />;
  return (
    <>
      <SiteLayout header={<SiteHeader name="Harbour Books" href="/" links={[{ label: 'Shop', href: '/shop', current: true }]} />}>
        <Stack gap="section">
          <Heading level={1}>Books for slow evenings</Heading>
          <Section heading="New this week" intro="Six books our staff couldn’t put down.">
            <Text>Open a book to read its first chapter.</Text>
          </Section>
        </Stack>
      </SiteLayout>
      <Notifications />
    </>
  );
}
`,
};

try {
  step('Write the guide step 1 files (package.json, vite.config.ts, tsconfig.json, index.html, src/main.tsx, src/App.tsx)', () => {
    mkdirSync(join(dir, 'src'), { recursive: true });
    for (const [f, text] of Object.entries(files)) writeFileSync(join(dir, f), text);
    return `npm ${sh(`${npm} -v`).trim()}, registry ${sh('npm config get registry').trim()}`;
  });
  step(`npm install the two ${version} tarballs, react@^19, react-dom@^19`, () => { sh(`${npm} install ${sources.map((s) => JSON.stringify(s)).join(' ')} react@^19 react-dom@^19 --no-audit --no-fund`); });
  step('npm install -D vite@^8 @vitejs/plugin-react@^6 typescript@~6.0 @types/react@^19 @types/react-dom@^19', () => { sh(`${npm} install -D vite@^8 @vitejs/plugin-react@^6 typescript@~6.0 @types/react@^19 @types/react-dom@^19 --no-audit --no-fund`); });
  step('npx tsc --noEmit', () => { sh('npx tsc --noEmit'); });
  step('npx vite build', () => sh('npx vite build').split('\n').filter((l) => /built in/.test(l)).join('').trim());
  step('npx vite preview: the page and its script answer', () => {
    const port = 4199;
    const server = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], { cwd: dir, shell: true, stdio: 'ignore' });
    try {
      const deadline = Date.now() + 20000;
      let html = '';
      while (Date.now() < deadline && !html) {
        try { html = execSync(`curl -s http://127.0.0.1:${port}/`, { encoding: 'utf8' }); } catch { execSync(process.platform === 'win32' ? 'ping -n 2 127.0.0.1 >NUL' : 'sleep 1', { shell: true }); }
      }
      if (!html.includes('id="root"')) throw new Error('the preview server did not serve index.html');
      const script = html.match(/src="(\/assets\/[^"]+\.js)"/)?.[1];
      const size = script ? execSync(`curl -s -o NUL -w "%{http_code} %{size_download}" http://127.0.0.1:${port}${script}`, { encoding: 'utf8', shell: true }) : 'no script';
      return `index.html 200, ${script} ${size} bytes`;
    } finally {
      if (process.platform === 'win32') execSync(`taskkill /PID ${server.pid} /T /F`, { stdio: 'ignore' });
      else server.kill();
    }
  });
} finally {
  report();
  if (!keep) rmSync(dir, { recursive: true, force: true });
}

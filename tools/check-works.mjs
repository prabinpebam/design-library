#!/usr/bin/env node
// The works gate (owner Q156, scorecard F32/F37): a replica must work, not just look right. Builds the library app,
// serves the build on a short-lived local server (Q153: nothing is left running), runs tools/click-probe.mjs on every
// layout of every template and fails when
//   - any enabled control is dead (no DOM, address, focus or window change), or
//   - a template's note-only clicks (the only effect is the "isn't part of the replica yet" note) exceed the budget in
//     its template.json `works.notes`. The budget only goes down: lower it when a stub becomes a working control.
// Not part of `npm run check`, which stays static and fast; run it before calling a template packet done.
//
//   npm run check:works                       every template
//   npm run check:works -- --template ikea,slack [--origin http://127.0.0.1:8770] [--jobs 3] [--no-build]
// Logs and JSON per template go to .shots/works/.
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { createWriteStream, existsSync, mkdirSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const root = process.cwd();
const argv = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : fallback;
};
const list = (v) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : []);
const out = join(root, '.shots', 'works');
mkdirSync(out, { recursive: true });

const tdir = join(root, 'packages/templates');
const all = readdirSync(tdir).filter((d) => existsSync(join(tdir, d, 'template.json'))).sort();
const only = list(opt('template'));
const templates = only.length ? only : all;
for (const t of templates) {
  if (!all.includes(t)) {
    console.error(`check:works: no template "${t}".`);
    process.exit(2);
  }
}

let server;
let origin = opt('origin');
if (!origin) {
  const dist = join(out, 'dist');
  if (!argv.includes('--no-build') || !existsSync(join(dist, 'site.html'))) {
    console.log('check:works: building the library app…');
    const r = spawnSync(process.execPath, [join(root, 'node_modules/vite/bin/vite.js'), 'build', '--outDir', dist, '--emptyOutDir', '--logLevel', 'error'], { cwd: join(root, 'apps/library'), stdio: 'inherit' });
    if (r.status !== 0) {
      console.error('check:works: the library build failed.');
      process.exit(1);
    }
  }
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.ico': 'image/x-icon' };
  server = createServer((req, res) => {
    let file = resolve(dist, '.' + decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!file.startsWith(resolve(dist))) return res.writeHead(403).end();
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
    if (!existsSync(file)) return res.writeHead(404).end();
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(readFileSync(file));
  });
  await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
  origin = `http://127.0.0.1:${server.address().port}`;
}

const probe = (t) =>
  new Promise((ok) => {
    const log = createWriteStream(join(out, `${t}.log`));
    const json = join(out, `${t}.json`);
    const child = spawn(process.execPath, [join(root, 'tools/click-probe.mjs'), '--template', t, '--origin', origin, '--json', json], { cwd: root });
    child.stdout.pipe(log);
    child.stderr.pipe(log);
    child.on('close', () => {
      log.end();
      const report = existsSync(json) ? JSON.parse(readFileSync(json, 'utf8')) : undefined;
      ok({ t, report });
    });
  });

const queue = [...templates];
const results = [];
const jobs = Math.max(1, +opt('jobs', 3));
await Promise.all(
  Array.from({ length: Math.min(jobs, queue.length) }, async () => {
    for (let t = queue.shift(); t; t = queue.shift()) {
      const r = await probe(t);
      const s = r.report?.summary;
      console.log(s ? `  ${t}: ${s.layouts} layouts, ${s.clicked} clicked, ${s.dead} dead, ${s.notes} note only` : `  ${t}: the probe failed (see .shots/works/${t}.log)`);
      results.push(r);
    }
  }),
);
server?.close();

let failed = 0;
for (const { t, report } of results.sort((a, b) => a.t.localeCompare(b.t))) {
  const budget = JSON.parse(readFileSync(join(tdir, t, 'template.json'), 'utf8')).works?.notes;
  if (!report) {
    console.error(`✗ ${t}: no report.`);
    failed++;
    continue;
  }
  const { dead, notes } = report.summary;
  const problems = [];
  if (dead) problems.push(`${dead} dead: ${report.layouts.flatMap((l) => l.dead.map((n) => `${l.id} "${n}"`)).join(', ')}`);
  if (budget === undefined) problems.push(`no works.notes budget in template.json (today ${notes})`);
  else if (notes > budget) problems.push(`${notes} note-only clicks, over the budget of ${budget}`);
  if (problems.length) {
    failed++;
    console.error(`✗ ${t}: ${problems.join('; ')}`);
  } else console.log(`✓ ${t}: 0 dead, ${notes} note only (budget ${budget}${notes < budget ? `; lower it to ${notes}` : ''})`);
}
console.log(`check:works: ${results.length} templates, ${failed} failing.`);
process.exit(failed ? 1 : 0);

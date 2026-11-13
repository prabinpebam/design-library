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
//   npm run check:works -- --template ikea,slack [--layouts home,products] [--origin http://127.0.0.1:8770] [--jobs 12] [--no-build]
// Every layout of every template runs in parallel pages of one browser (--jobs, default 12). Logs and JSON per template
// go to .shots/works/.
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { launch, layoutTargets, probeLayouts, summarize } from './click-probe.mjs';
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
    const b0 = Date.now();
    const r = spawnSync(process.execPath, [join(root, 'node_modules/vite/bin/vite.js'), 'build', '--outDir', dist, '--emptyOutDir', '--logLevel', 'error'], { cwd: join(root, 'apps/library'), stdio: 'inherit' });
    if (r.status !== 0) {
      console.error('check:works: the library build failed.');
      process.exit(1);
    }
    console.log(`check:works: built in ${Math.round((Date.now() - b0) / 1000)} s.`);
  }
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.ico': 'image/x-icon' };
  server = createServer((req, res) => {
    let file = resolve(dist, '.' + decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!file.startsWith(resolve(dist))) return res.writeHead(403).end();
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
    if (!existsSync(file)) return res.writeHead(404).end();
    // The build is fixed for the run: let each page cache it, so the probe's reloads don't fetch and compile 5 MB again.
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream', 'cache-control': 'max-age=3600' });
    res.end(readFileSync(file));
  });
  await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
  origin = `http://127.0.0.1:${server.address().port}`;
}

const started = Date.now();
// The longest layouts of the last run start first, so the slowest one doesn't start last.
const last = {};
for (const t of templates) {
  const f = join(out, `${t}.json`);
  if (existsSync(f)) for (const l of JSON.parse(readFileSync(f, 'utf8')).layouts ?? []) last[l.id] = l.clicked;
}
const targets = templates.flatMap((t) => layoutTargets(root, t, origin, list(opt('layouts')))).sort((a, b) => (last[b.id] ?? 0) - (last[a.id] ?? 0));
const browser = await launch(root);
const logs = Object.fromEntries(templates.map((t) => [t, []]));
const rows = await probeLayouts(browser, targets, { jobs: Math.max(1, +opt('jobs', 12)), onRow: (r, t, text) => {
  logs[t.template].push(text);
  console.log(`    ${t.id}: ${r.clicked} clicked, ${r.dead.length} dead, ${r.notes.length} note only (${Math.round((Date.now() - started) / 1000)} s)`);
} });
await browser.close();
server?.close();
const results = templates.map((t) => {
  const layouts = rows.filter((_r, i) => targets[i].template === t);
  const report = { origin, width: 1280, height: 900, layouts, summary: summarize(layouts) };
  writeFileSync(join(out, `${t}.json`), JSON.stringify(report, null, 1));
  writeFileSync(join(out, `${t}.log`), logs[t].join('\n') + '\n');
  const s = report.summary;
  console.log(`  ${t}: ${s.layouts} layouts, ${s.clicked} clicked, ${s.dead} dead, ${s.notes} note only${s.failed ? `, ${s.failed} layouts failed to probe` : ''}`);
  return { t, report };
});
console.log(`check:works: probed ${targets.length} layouts in ${Math.round((Date.now() - started) / 1000)} s.`);

let failed = 0;
for (const { t, report } of results.sort((a, b) => a.t.localeCompare(b.t))) {
  const budget = JSON.parse(readFileSync(join(tdir, t, 'template.json'), 'utf8')).works?.notes;
  if (!report) {
    console.error(`✗ ${t}: no report.`);
    failed++;
    continue;
  }
  const { dead, notes, failed: broken } = report.summary;
  const problems = [];
  if (broken) problems.push(`${broken} layouts failed to probe: ${report.layouts.filter((l) => l.failed).map((l) => `${l.id} (${l.failed})`).join(', ')}`);
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

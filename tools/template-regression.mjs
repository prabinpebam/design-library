#!/usr/bin/env node
// Q143.2: the regression sweep. A replica packet may improve core and the customization layer, but nothing else may
// change: every other template's layouts and every core library page are screenshotted from a frozen base build and
// from the working copy, light and dark, at 1280 px, and compared pixel by pixel. Any difference fails unless it is
// declared in tools/regression-noise.json with its reason. Rules: docs/replica-rules.md.
//
//   node tools/template-regression.mjs freeze [--force]      build the current library app into .shots/base-dist
//   node tools/template-regression.mjs [check] [options]     build the working copy and compare it with the base
//       --exclude slack,ikea   templates under work (their layouts and pages are not compared)
//       --scheme light|dark|both (default both)   --only blog,chat   --pages-only   --templates-only
//       --self                 compare the base with itself (finds noisy pages to declare)
//       --no-build             reuse .shots/wt-dist as it is      --jobs 6   parallel pages
//       --match REGEX          only the screens whose id matches (ids: template--layout, lib--route)
//   node tools/template-regression.mjs serve [--port 8769]   serve the frozen base for side-by-side viewing
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync, copyFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { createRequire } from 'node:module';

const root = process.cwd();
const require = createRequire(join(root, 'package.json'));
const shots = join(root, '.shots');
const baseDist = join(shots, 'base-dist');
const wtDist = join(shots, 'wt-dist');
const outRoot = join(shots, 'regression');
const noiseFile = join(root, 'tools/regression-noise.json');

const argv = process.argv.slice(2);
const cmd = argv[0] && !argv[0].startsWith('--') ? argv.shift() : 'check';
const flag = (name) => argv.includes(`--${name}`);
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : fallback;
};
const list = (v) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : []);

function build(outDir) {
  const vite = join(root, 'node_modules/vite/bin/vite.js');
  const r = spawnSync(process.execPath, [vite, 'build', '--outDir', outDir, '--emptyOutDir', '--logLevel', 'error'], {
    cwd: join(root, 'apps/library'),
    stdio: 'inherit',
  });
  if (r.status !== 0) {
    console.error(`template-regression: the library build failed (${outDir}).`);
    process.exit(1);
  }
}

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.ico': 'image/x-icon' };
function serve(dir, port = 0) {
  const server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = resolve(dir, '.' + path);
    if (!file.startsWith(resolve(dir))) return res.writeHead(403).end();
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
    if (!existsSync(file)) return res.writeHead(404).end();
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(readFileSync(file));
  });
  return new Promise((ok) => server.listen(port, '127.0.0.1', () => ok(server)));
}
const origin = (server) => `http://127.0.0.1:${server.address().port}`;

function chromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const dir = join(process.env.LOCALAPPDATA ?? join(process.env.HOME ?? '', '.cache'), 'ms-playwright');
  const found = existsSync(dir) ? readdirSync(dir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => +b.split('-')[1] - +a.split('-')[1]) : [];
  for (const d of found) {
    for (const exe of ['chrome-win64/chrome.exe', 'chrome-win/chrome.exe', 'chrome-linux/chrome', 'chrome-mac/Chromium.app/Contents/MacOS/Chromium']) {
      if (existsSync(join(dir, d, exe))) return join(dir, d, exe);
    }
  }
  console.error('template-regression: no Chromium found; set CHROME_PATH.');
  process.exit(1);
}

if (cmd === 'freeze') {
  if (existsSync(baseDist) && !flag('force')) {
    console.error('template-regression: a frozen base already exists (.shots/base-dist). Re-freeze only between packets, with --force.');
    process.exit(1);
  }
  build(baseDist);
  const git = (...a) => spawnSync('git', a, { cwd: root, encoding: 'utf8' }).stdout.trim();
  writeFileSync(join(baseDist, 'BASE.json'), JSON.stringify({ frozenAt: new Date().toISOString(), head: git('rev-parse', 'HEAD'), dirtyFiles: git('status', '--short').split('\n').filter(Boolean).length }, null, 2));
  console.log('template-regression: base frozen in .shots/base-dist.');
  process.exit(0);
}

if (cmd === 'serve') {
  const port = +opt('port', 8769);
  const s = await serve(baseDist, port);
  console.log(`template-regression: the frozen base is at ${origin(s)}/ (site: ${origin(s)}/site.html). Ctrl+C stops it.`);
  await new Promise(() => {});
}

if (cmd !== 'check') {
  console.error(`template-regression: unknown command "${cmd}".`);
  process.exit(1);
}

if (!existsSync(join(baseDist, 'index.html'))) {
  console.error('template-regression: no frozen base. Run `node tools/template-regression.mjs freeze` before the first source change.');
  process.exit(1);
}
const self = flag('self');
if (!self && !flag('no-build')) build(wtDist);
const exclude = new Set(list(opt('exclude', process.env.REGRESSION_EXCLUDE)));
const only = new Set(list(opt('only')));
const schemes = opt('scheme', 'both') === 'both' ? ['light', 'dark'] : [opt('scheme')];
const declarations = existsSync(noiseFile) ? JSON.parse(readFileSync(noiseFile, 'utf8')) : {};
const noise = declarations.pages ?? {};
const catalogueInventory = declarations.catalogueInventory ?? {};
for (const [id, declaration] of Object.entries(catalogueInventory)) {
  if (!id.startsWith('lib--') || !declaration.reason?.startsWith('catalogue inventory:') || !declaration.regions?.length) {
    throw new Error(`Invalid catalogue inventory declaration: ${id}`);
  }
  for (const region of declaration.regions) {
    if (![region.x, region.y, region.width, region.height].every(Number.isInteger) ||
        region.x < 0 || region.y < 0 || region.width <= 0 || region.height <= 0) {
      throw new Error(`Invalid catalogue inventory rectangle: ${id}`);
    }
  }
}

const { chromium } = require('playwright-core');
const sharp = require('sharp');
const servers = [await serve(baseDist), await serve(self ? baseDist : wtDist)];
const [BASE, WT] = servers.map(origin);
const browser = await chromium.launch({ executablePath: chromePath(), headless: true });

// Targets: template layouts from the working copy's template.json files (layouts new since the base are skipped, as
// the comparison finds them missing in the base), and every page the base library's navigation links to.
const targets = [];
if (!flag('pages-only')) {
  const dir = join(root, 'packages/templates');
  for (const t of readdirSync(dir).sort()) {
    const manifest = join(dir, t, 'template.json');
    if (!existsSync(manifest) || exclude.has(t) || (only.size && !only.has(t))) continue;
    for (const l of JSON.parse(readFileSync(manifest, 'utf8')).layouts ?? []) {
      if (!l.planned) targets.push({ id: `${t}--${l.id}`, path: `site.html?chrome=none#/app/${t}/${l.id}` });
    }
  }
}
if (!flag('templates-only') && !only.size) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/#/overview`, { waitUntil: 'networkidle' });
  // Open every navigation family so every page's link is in the document.
  for (let round = 0; round < 6; round += 1) {
    const opened = await page.evaluate(() => {
      const closed = [...document.querySelectorAll('nav [aria-expanded="false"], aside [aria-expanded="false"]')];
      closed.forEach((b) => b.click());
      return closed.length;
    });
    if (!opened) break;
    await page.waitForTimeout(150);
  }
  const routes = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href^="#/"]')].map((a) => a.getAttribute('href').replace(/^#\//, '').split('#')[0]))]);
  await ctx.close();
  for (const r of routes.sort()) {
    if (!r || r.startsWith('app/')) continue;
    if ([...exclude].some((t) => r === `templates/${t}` || r.endsWith(`/${t}`) || r === t || r.startsWith(`${t}-`) || r.startsWith(`${t}.`))) continue;
    targets.push({ id: `lib--${r.replace(/[^\w-]+/g, '_')}`, path: `#/${r}` });
  }
}
const match = opt('match') ? new RegExp(opt('match')) : null;
if (match) targets.splice(0, targets.length, ...targets.filter((t) => match.test(t.id)));
if (!targets.length) {
  console.error('template-regression: no screens to compare; check --only (template ids) and --match (a pattern on screen ids).');
  await browser.close();
  servers.forEach((s) => s.close());
  process.exit(1);
}
const partial = Boolean(only.size || match || flag('pages-only') || flag('templates-only'));

async function grab(originUrl, t, scheme, file) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce', colorScheme: scheme, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(`${originUrl}/${t.path}`, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.evaluate(() => document.fonts.ready).catch(() => {});
  // Lazy pictures load now, so a picture still arriving is never read as a change.
  await page.evaluate(() => document.querySelectorAll('img[loading="lazy"]').forEach((i) => (i.loading = 'eager'))).catch(() => {});
  const h = await page.evaluate(() => document.documentElement.scrollHeight).catch(() => 900);
  for (let y = 0; y < h; y += 800) {
    await page.evaluate((v) => scrollTo(0, v), y).catch(() => {});
    await page.waitForTimeout(80);
  }
  await page.evaluate(() => scrollTo(0, 0)).catch(() => {});
  await page.evaluate(() => Promise.all([...document.images].map((i) => (i.complete ? i.decode().catch(() => {}) : new Promise((ok) => { i.onload = i.onerror = ok; setTimeout(ok, 5000); }))))).catch(() => {});
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(700);
  await page.screenshot({ path: file, fullPage: true, animations: 'disabled', caret: 'hide' });
  await ctx.close();
}

async function compare(a, b, diffFile, inventory) {
  const [ma, mb] = [await sharp(a).metadata(), await sharp(b).metadata()];
  const w = Math.min(ma.width, mb.width);
  const h = Math.min(ma.height, mb.height);
  const ra = await sharp(a).extract({ left: 0, top: 0, width: w, height: h }).ensureAlpha().raw().toBuffer();
  const rb = await sharp(b).extract({ left: 0, top: 0, width: w, height: h }).ensureAlpha().raw().toBuffer();
  const out = Buffer.alloc(w * h * 4);
  let diff = 0;
  let inventoryPixels = 0;
  let outsideInventoryExactPixels = 0;
  let box = null;
  if (inventory?.regions.some((r) => r.x + r.width > w || r.y + r.height > h)) {
    throw new Error('Catalogue inventory rectangle extends outside the screenshot');
  }
  for (let i = 0; i < ra.length; i += 4) {
    const p = i / 4; const x = p % w; const y = (p - x) / w;
    const inInventory = inventory?.regions.some((r) => x >= r.x && x < r.x + r.width && y >= r.y && y < r.y + r.height);
    const d = Math.abs(ra[i] - rb[i]) + Math.abs(ra[i + 1] - rb[i + 1]) + Math.abs(ra[i + 2] - rb[i + 2]);
    if (!inInventory && (d || ra[i + 3] !== rb[i + 3])) outsideInventoryExactPixels += 1;
    const g = (ra[i] + ra[i + 1] + ra[i + 2]) / 3;
    if (d > 30) {
      diff += 1;
      if (inInventory) inventoryPixels += 1;
      out[i] = 255; out[i + 1] = 0; out[i + 2] = 64; out[i + 3] = 255;
      box = box ? { x0: Math.min(box.x0, x), y0: Math.min(box.y0, y), x1: Math.max(box.x1, x), y1: Math.max(box.y1, y) } : { x0: x, y0: y, x1: x, y1: y };
    } else {
      out[i] = out[i + 1] = out[i + 2] = Math.round(200 + g / 5); out[i + 3] = 255;
    }
  }
  if (diff) await sharp(out, { raw: { width: w, height: h, channels: 4 } }).png().toFile(diffFile);
  if (inventory && diff) {
    for (const r of inventory.regions) {
      for (let y = r.y; y < r.y + r.height; y += 1) {
        for (let x = r.x; x < r.x + r.width; x += 1) {
          const i = (y * w + x) * 4;
          ra.fill(255, i, i + 4);
          rb.fill(255, i, i + 4);
        }
      }
    }
    for (const [buffer, source] of [[ra, a], [rb, b]]) {
      await sharp(buffer, { raw: { width: w, height: h, channels: 4 } }).png().toFile(source.replace(/\.png$/, '-outside-inventory.png'));
    }
  }
  return { sizeBase: `${ma.width}x${ma.height}`, sizeWt: `${mb.width}x${mb.height}`, sameSize: ma.width === mb.width && ma.height === mb.height, pixels: diff, pct: +(100 * diff / (w * h)).toFixed(4), box,
    ...(inventory ? { inventoryPixels, outsideInventoryExactPixels, inventoryRegions: inventory.regions } : {}) };
}

const results = [];
for (const scheme of schemes) {
  const out = join(outRoot, scheme);
  // A filtered run keeps the other screens' evidence; it clears only the files of the screens it takes again.
  if (!partial) rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  for (const t of targets) for (const k of ['base', 'wt', 'diff', 'base-outside-inventory', 'wt-outside-inventory']) rmSync(join(out, `${t.id}-${k}.png`), { force: true });
  const check = async (t) => {
    const a = join(out, `${t.id}-base.png`);
    const b = join(out, `${t.id}-wt.png`);
    await Promise.all([grab(BASE, t, scheme, a), grab(WT, t, scheme, b)]);
    const inventory = catalogueInventory[`${t.id}@${scheme}`] ?? catalogueInventory[t.id];
    let r = await compare(a, b, join(out, `${t.id}-diff.png`), inventory);
    // Up to two retakes of both before a difference counts: late pictures and timers settle under load, real changes stay.
    for (let retake = 0; retake < 2 && (!r.sameSize || (r.pixels && !(inventory && r.outsideInventoryExactPixels === 0))); retake += 1) {
      await Promise.all([grab(BASE, t, scheme, a), grab(WT, t, scheme, b)]);
      r = await compare(a, b, join(out, `${t.id}-diff.png`), inventory);
    }
    const declared = noise[t.id] ?? noise[`${t.id}@${scheme}`];
    const inventoryPass = inventory && r.pixels > 0 && r.outsideInventoryExactPixels === 0;
    const inside = (box) => !declared?.regions || (box && declared.regions.some((g) => box.x0 >= g.x && box.y0 >= g.y && box.x1 < g.x + g.width && box.y1 < g.y + g.height));
    const pass = r.sameSize && (r.pixels === 0 || inventoryPass || (declared && r.pct <= declared.maxPct && inside(r.box)));
    if (pass && !r.pixels) for (const file of [a, b, join(out, `${t.id}-diff.png`), a.replace(/\.png$/, '-outside-inventory.png'), b.replace(/\.png$/, '-outside-inventory.png')]) rmSync(file, { force: true });
    return { scheme, id: t.id, path: t.path, ...r, declared: inventoryPass ? inventory.reason : declared?.reason, catalogueInventory: Boolean(inventoryPass), pass };
  };
  const queue = [...targets];
  const pending = [];
  const worker = async () => {
    while (queue.length) {
      const t = queue.shift();
      try {
        const result = await check(t);
        if (result.pass) results.push(result); else pending.push([t, result]);
      } catch (e) {
        results.push({ scheme, id: t.id, path: t.path, error: String(e).slice(0, 300), pass: false });
        console.log(`  FAIL ${scheme.padEnd(5)} ${t.id}: ${String(e).slice(0, 160)}`);
      }
    }
  };
  await Promise.all(Array.from({ length: +opt('jobs', 6) }, worker));
  // A difference seen under parallel load is taken again alone, nothing else capturing: a real change differs there too,
  // a load flake doesn't. The parallel evidence is kept as <id>-parallel-*.png and recorded in the result.
  for (const [t, parallel] of pending) {
    for (const k of ['base', 'wt', 'diff']) { const file = join(out, `${t.id}-${k}.png`); if (existsSync(file)) copyFileSync(file, join(out, `${t.id}-parallel-${k}.png`)); }
    let result;
    try { result = await check(t); } catch (e) { result = { scheme, id: t.id, path: t.path, error: String(e).slice(0, 300), pass: false }; }
    result.parallel = { pct: parallel.pct, box: parallel.box, sameSize: parallel.sameSize };
    if (result.pass) console.log(`  load-only ${scheme.padEnd(5)} ${t.id}: differed under parallel load (${parallel.pct}%), identical taken alone; evidence ${t.id}-parallel-*.png`);
    else if (!result.error) console.log(`  DIFF ${scheme.padEnd(5)} ${t.id.padEnd(44)} ${result.sizeBase} → ${result.sizeWt} ${result.pct}%${result.box ? ` at ${result.box.x0},${result.box.y0}–${result.box.x1},${result.box.y1}` : ''}${result.outsideInventoryExactPixels !== undefined ? `; ${result.outsideInventoryExactPixels} exact differing pixels outside inventory` : ''}`);
    results.push(result);
  }
}
await browser.close();
servers.forEach((s) => s.close());

results.sort((x, y) => (x.scheme + x.id).localeCompare(y.scheme + y.id));
mkdirSync(outRoot, { recursive: true });
const failed = results.filter((r) => !r.pass);
const inventoryChanges = results.filter((r) => r.pass && r.catalogueInventory);
const noisy = results.filter((r) => r.pass && r.pixels && !r.catalogueInventory);
const loadOnly = results.filter((r) => r.pass && r.parallel);
writeFileSync(join(outRoot, partial ? 'result-partial.json' : 'result.json'), JSON.stringify({ at: new Date().toISOString(), self, exclude: [...exclude], schemes, compared: results.length, failed: failed.length, declaredNoise: noisy.length, catalogueInventory: inventoryChanges.length, loadOnly: loadOnly.length, results }, null, 2));
const base = JSON.parse(readFileSync(join(baseDist, 'BASE.json'), 'utf8'));
console.log(`template-regression: ${results.length} screens (${targets.length} pages × ${schemes.join(' + ')}), base frozen ${base.frozenAt}${exclude.size ? `, excluding ${[...exclude].join(', ')}` : ''}.`);
console.log(`  ${results.length - failed.length - noisy.length - inventoryChanges.length} identical, ${noisy.length} within declared noise, ${inventoryChanges.length} catalogue inventory (remaining pixels exactly identical), ${failed.length} different${loadOnly.length ? `; ${loadOnly.length} differed only under parallel load and were identical taken alone` : ''}.`);
if (failed.length) {
  console.error(`template-regression: ${failed.length} unexplained screen change(s). Fix at source; only proven same-build noise or explicitly authorized catalogue inventory may be declared. Diffs: .shots/regression/<scheme>/<id>-diff.png`);
  process.exit(1);
}
console.log('template-regression: no unexplained change; every template and rendered component example is unchanged.');

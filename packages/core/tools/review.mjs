#!/usr/bin/env node
/**
 * The light review (IP18), one command over the probes this package ships:
 *   npx design-library-review <url> [<url>…] [--widths 1000,320] [--schemes light,dark] [--probes static|all|a,b]
 *                             [--wait 600] [--browser <path to chrome or edge>] [--json] [--strict]
 * Opens each address at each width and scheme in a headless browser, loads each probe from this package (so it
 * matches the version installed), runs it and prints one line per failing row with its first finding. `static` (the
 * default) is the set that matters for a page of words and pictures: spacing, layout, visual noise, clipping, scrolling
 * and visual representation. `all` adds materials, UI states, chrome context and motion.
 *
 * Needs `playwright-core` in your project (`npm i -D playwright-core`) and an installed Chrome or Edge (found by
 * channel), or `--browser <path>`. Nothing fails the run unless `--strict`, which fails on any failing row.
 */
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const probesDir = fileURLToPath(new URL('../probes/', import.meta.url));
const argv = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};
const valued = new Set(['widths', 'schemes', 'probes', 'wait', 'browser']);
const urls = argv.filter((a, i) => !a.startsWith('--') && !(argv[i - 1]?.startsWith('--') && valued.has(argv[i - 1].slice(2))));
if (!urls.length) {
  console.error('usage: npx design-library-review <url> [<url>…] [--widths 1000,320] [--schemes light,dark] [--probes static|all|spacing,layout,…] [--browser <path>] [--json] [--strict]');
  process.exit(1);
}

const PROBES = {
  spacing: ['spacing-probe.js', () => window.spacingProbe()],
  layout: ['layout-probe.js', () => window.layoutProbe()],
  noise: ['noise-probe.js', () => window.noiseProbe()],
  clipping: ['clipping-probe.js', () => window.clippingProbe()],
  scroll: ['scroll-probe.js', () => window.scrollProbe()],
  visual: ['visual-probe.js', () => window.visualProbe()],
  material: ['material-probe.js', () => window.materialProbe()],
  'ui-states': ['ui-states-probe.js', () => window.uiStatesProbe()],
  context: ['context-probe.js', () => window.contextProbe()],
  motion: ['motion-probe.js', () => window.motionProbe()],
};
const sets = { static: ['spacing', 'layout', 'noise', 'clipping', 'scroll', 'visual'], all: Object.keys(PROBES) };
const chosen = (sets[opt('probes', 'static')] ?? opt('probes', '').split(',')).filter(Boolean);
const unknown = chosen.filter((p) => !PROBES[p]);
if (unknown.length) {
  console.error(`review: unknown probe ${unknown.join(', ')}; use static, all, or any of ${Object.keys(PROBES).join(', ')}`);
  process.exit(1);
}
const widths = opt('widths', '1000,320').split(',').map(Number).filter(Boolean);
const schemes = opt('schemes', 'light,dark').split(',').filter((s) => s === 'light' || s === 'dark');
const wait = Number(opt('wait', '600'));

let chromium;
try {
  ({ chromium } = createRequire(join(process.cwd(), 'package.json'))('playwright-core'));
} catch {
  console.error('review: needs playwright-core in this project: npm i -D playwright-core (it drives your installed Chrome or Edge; no browser download).');
  process.exit(1);
}
const launch = async () => {
  if (opt('browser')) return chromium.launch({ executablePath: opt('browser') });
  for (const channel of ['chrome', 'msedge']) {
    try {
      return await chromium.launch({ channel });
    } catch {}
  }
  return chromium.launch();
};

const browser = await launch();
const results = [];
for (const url of urls)
  for (const width of widths)
    for (const scheme of schemes) {
      const page = await browser.newPage({ viewport: { width, height: width < 600 ? 667 : 800 }, colorScheme: scheme });
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(wait);
      for (const name of chosen) {
        const [file, run] = PROBES[name];
        try {
          await page.addScriptTag({ path: join(probesDir, file) });
          const out = await page.evaluate(run);
          for (const [row, r] of Object.entries(out?.rows ?? {}))
            results.push({ url, width, scheme, probe: name, row, pass: !!r.pass, count: r.count ?? r.findings?.length ?? 0, first: r.findings?.[0] });
        } catch (e) {
          results.push({ url, width, scheme, probe: name, row: '—', pass: false, count: 1, first: { error: String(e.message ?? e).split('\n')[0] } });
        }
      }
      if (errors.length) results.push({ url, width, scheme, probe: 'page', row: 'errors', pass: false, count: errors.length, first: errors[0] });
      await page.close();
    }
await browser.close();

const fails = results.filter((r) => !r.pass);
if (argv.includes('--json')) console.log(JSON.stringify({ rows: results.length, fails }, null, 2));
else {
  const views = urls.length * widths.length * schemes.length;
  console.log(`review: ${views} view${views === 1 ? '' : 's'} (${widths.join(' and ')} px; ${schemes.join(' and ')}), ${chosen.length} probes, ${results.length} rows: ${results.length - fails.length} pass, ${fails.length} fail.`);
  for (const f of fails) console.log(`  ${f.url} · ${f.width} px · ${f.scheme} · ${f.row} (${f.probe}) · ${f.count} · ${JSON.stringify(f.first ?? {}).slice(0, 220)}`);
  if (fails.length) console.log('Read each row on its framework\'s part 2 (guide step 8) and fix it at its owner: theme, layout, props, your part, then content.');
}
if (argv.includes('--strict') && fails.length) process.exit(1);

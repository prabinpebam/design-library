#!/usr/bin/env node
// Template theme contrast (Q118 G26, Q120): every text role a template theme re-decides must meet WCAG 2.2 AA
// (4.5:1) on every surface role it re-decides, in light and dark. Reads packages/templates/*/tokens/theme.json
// directly (raw values, { light, dark }, {aliases} to other theme tokens; rgb() with alpha is composited over the
// surface). A pair is checked only when the theme re-decides both roles; core's own pairs are checked by
// `npm run tokens:check`. A failing pair the owner has accepted carries, on the text token,
//   "$extensions": { "org.design-library": { "contrast-exception": { "on": ["color.accent"], "why": "Owner Q…" } } }
// and is reported as accepted, not failed.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const dir = join(root, 'packages', 'templates');
const TEXT = ['color.text', 'color.text-muted', 'color.text-on-accent'];
const SURFACES = {
  'color.text': ['color.bg', 'color.bg-raised', 'color.bg-sunken', 'color.bg-tint', 'color.bg-control', 'color.accent-subtle', 'c.tree-view.current-fill', 'c.tabs.selected-fill'],
  'color.text-muted': ['color.bg', 'color.bg-raised', 'color.bg-sunken', 'color.bg-tint', 'color.bg-control', 'color.accent-subtle', 'c.tree-view.current-fill', 'c.tabs.selected-fill'],
  'color.text-on-accent': ['color.accent', 'color.accent-hover', 'color.accent-pressed'],
};

const parse = (v) => {
  const s = String(v).trim().toLowerCase();
  let m = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (m) {
    const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1];
    return { rgb: [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)), a: 1 };
  }
  m = s.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*(?:[/,]\s*([\d.]+%?))?\s*\)$/);
  if (m) {
    const a = m[4] === undefined ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    return { rgb: [m[1], m[2], m[3]].map(Number), a };
  }
  return null;
};
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const over = (fg, bg) => fg.rgb.map((c, i) => c * fg.a + bg.rgb[i] * (1 - fg.a));
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

let failed = 0, checked = 0, accepted = 0;
const templates = existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name) : [];
for (const t of templates) {
  const file = join(dir, t, 'tokens', 'theme.json');
  if (!existsSync(file)) continue;
  const theme = JSON.parse(readFileSync(file, 'utf8'));
  const resolve = (name, scheme, depth = 0) => {
    const tok = theme[name];
    if (!tok || depth > 8) return null;
    let v = tok.$value;
    if (v && typeof v === 'object') v = v[scheme];
    const ref = typeof v === 'string' && v.match(/^\{([a-z0-9.-]+)\}$/);
    return ref ? resolve(ref[1], scheme, depth + 1) : parse(v);
  };
  for (const scheme of ['light', 'dark']) {
    for (const text of TEXT) {
      const exc = theme[text]?.$extensions?.['org.design-library']?.['contrast-exception'];
      for (const surface of SURFACES[text]) {
        const fg = resolve(text, scheme), bg = resolve(surface, scheme);
        if (!fg || !bg || bg.a < 1) continue;
        checked++;
        const r = ratio(over(fg, bg), bg.rgb);
        if (r >= 4.5) continue;
        if (exc && (exc.on ?? []).includes(surface)) {
          accepted++;
          console.log(`  accepted  ${t} ${scheme}: ${text} on ${surface} ${r.toFixed(2)}:1 (${exc.why})`);
          continue;
        }
        failed++;
        console.error(`✗ packages/templates/${t}/tokens/theme.json · ${scheme} · ${text} on ${surface} is ${r.toFixed(2)}:1, below 4.5:1 · darken or lighten the text (or the surface) to the closest value that passes, or record the owner's acceptance as a contrast-exception on ${text}`);
      }
    }
  }
}
console.log(`check:template-contrast: ${checked} pairs checked, ${failed} below AA, ${accepted} accepted by the owner.`);
process.exitCode = failed ? 1 : 0;

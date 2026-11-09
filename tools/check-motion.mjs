#!/usr/bin/env node
// @ts-check
/**
 * Motion check (owner Q65, M12; docs/motion.md "Enforcement"). Static and dependency-free, like check:layers.
 *
 *   node tools/check-motion.mjs            fail (exit 1) on a broken rule
 *   node tools/check-motion.mjs --report   also list every transition and animation by file
 *
 * Rules, over core and library-app CSS (generated tokens.css excepted) and core TSX (stories excepted):
 *   R-literal   a transition or animation names its timing and curve through tokens, never a literal (0s delays allowed)
 *   R-all       no `transition: all` or `transition-property: all`
 *   R-scale     nothing reads the private duration scale (--duration-instant/fast/medium/slow/xslow); components read a
 *               role (quick, change, move, move-far, shared) or a state timing (T1)
 *   R-zero      nothing transitions or animates a zero-latency value (packages/core/motion/zero-latency.json, Z1-Z22)
 *   R-layout    a layout property (size, inset, margin, padding, grid tracks) transitions only where
 *               tools/motion-allow.json names it with a reason (R3)
 *   R-will      no `will-change` outside the allow-list
 *   R-timer     no literal delay of 10 ms or more in a core component's setTimeout / setInterval / animate() (a token,
 *               read with cssMs or durationOf)
 * The browser probe (MV2-MV5, MV7) is written in docs/motion.md and waits for production-ready.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CSS_ROOTS = ['packages/core/css', 'apps/library/src'];
const TSX_ROOTS = ['packages/core/react'];
const SKIP = new Set(['packages/core/css/tokens.css']);
const report = process.argv.includes('--report');

const walk = (/** @type {string} */ dir, /** @type {RegExp} */ ext) =>
  readdirSync(join(ROOT, dir)).flatMap((/** @type {string} */ name) => {
    const rel = `${dir}/${name}`;
    return statSync(join(ROOT, rel)).isDirectory() ? walk(rel, ext) : ext.test(name) ? [rel] : [];
  });

const zero = JSON.parse(readFileSync(join(ROOT, 'packages/core/motion/zero-latency.json'), 'utf8'));
/** @type {{ file: string; selector: string; properties: string[]; why: string }[]} */
const allow = JSON.parse(readFileSync(join(ROOT, 'tools/motion-allow.json'), 'utf8')).allow;
const zeroRules = zero.places.flatMap((/** @type {any} */ p) => p.rules.map((/** @type {any} */ r) => ({ id: p.id, re: new RegExp(r.selector), properties: new Set(r.properties) })));

const LAYOUT = /^(width|height|inline-size|block-size|min-(width|height|inline-size|block-size)|max-(width|height|inline-size|block-size)|top|left|right|bottom|inset(-.+)?|margin(-.+)?|padding(-.+)?|grid-template-(rows|columns)|flex-basis|font-size)$/;
const SCALE = /--duration-(instant|fast|medium|slow|xslow)\b/;

/** Splits on commas outside parentheses. */
const split = (/** @type {string} */ v) => {
  const out = [];
  let depth = 0;
  let cur = '';
  for (const ch of v) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      out.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
};
/** Removes every var(...) so literals can be seen. */
const bare = (/** @type {string} */ v) => {
  let s = v;
  for (let i = 0; i < 6 && /var\(/.test(s); i++) s = s.replace(/var\([^()]*(\([^()]*\))*[^()]*\)/g, ' ');
  return s;
};
const allowed = (/** @type {string} */ file, /** @type {string} */ selector, /** @type {string} */ prop) =>
  allow.some((a) => a.file === file && selector.includes(a.selector) && (a.properties.includes(prop) || a.properties.includes('*')));

const problems = [];
const listing = [];
let transitions = 0;
let animations = 0;

for (const file of CSS_ROOTS.flatMap((d) => walk(d, /\.css$/)).filter((f) => !SKIP.has(f))) {
  const text = readFileSync(join(ROOT, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  if (SCALE.test(text)) problems.push(`${file}: reads the private duration scale (${text.match(SCALE)?.[0]}); read a role (R-scale)`);
  for (const m of text.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
    const selector = m[1].trim().replace(/\s+/g, ' ');
    for (const d of m[2].split(';')) {
      const at = d.indexOf(':');
      if (at < 0) continue;
      const prop = d.slice(0, at).trim();
      const value = d.slice(at + 1).replace(/!important/, '').trim();
      if (prop === 'will-change' && !allowed(file, selector, 'will-change')) problems.push(`${file} ${selector}: will-change at rest (R-will)`);
      if (!/^(transition|transition-property|transition-duration|transition-timing-function|animation|animation-duration|animation-timing-function)$/.test(prop)) continue;
      if (/^(none|initial|unset|inherit)$/.test(value)) continue;
      const isAnimation = prop.startsWith('animation');
      if (isAnimation) animations++;
      else transitions++;
      const plain = bare(value);
      // R-literal: durations and curves.
      const literal = plain.match(/(^|[\s,])(\d*\.?\d+m?s)\b/g)?.map((x) => x.trim().replace(/^,/, '')).filter((x) => !/^0m?s$/.test(x));
      if (literal?.length) problems.push(`${file} ${selector}: literal duration ${literal.join(', ')} in ${prop} (R-literal)`);
      const curve = plain.match(/\b(ease-in-out|ease-in|ease-out|ease|linear|step-start|step-end|cubic-bezier|steps)\b/);
      if (curve && prop !== 'transition-property') problems.push(`${file} ${selector}: literal curve "${curve[1]}" in ${prop} (R-literal)`);
      if (isAnimation) {
        listing.push(`${file}  ${selector}  animation: ${value}`);
        for (const z of zeroRules) if (z.re.test(selector) && !/\bnone\b/.test(value)) problems.push(`${file} ${selector}: animates a zero-latency place ${z.id} (R-zero)`);
        continue;
      }
      // Properties this declaration transitions.
      const props = prop === 'transition-property' ? split(value) : prop === 'transition' ? split(value).map((t) => t.split(/\s+/)[0]) : [];
      for (const p of props) {
        if (p === 'all') problems.push(`${file} ${selector}: transition: all (R-all)`);
        if (LAYOUT.test(p) && !allowed(file, selector, p)) problems.push(`${file} ${selector}: transitions the layout property ${p}; add it to tools/motion-allow.json with a reason or move it by transform (R-layout)`);
        for (const z of zeroRules) if (z.re.test(selector) && z.properties.has(p)) problems.push(`${file} ${selector}: transitions ${p}, a zero-latency value (${z.id}) (R-zero)`);
      }
      if (props.length) listing.push(`${file}  ${selector}  ${props.join(', ')}`);
    }
  }
}

for (const file of TSX_ROOTS.flatMap((d) => walk(d, /\.tsx?$/)).filter((f) => !/\/stories\//.test(f))) {
  const text = readFileSync(join(ROOT, file), 'utf8');
  if (SCALE.test(text)) problems.push(`${file}: reads the private duration scale (${text.match(SCALE)?.[0]}) (R-scale)`);
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    const t = /\b(setTimeout|setInterval)\([\s\S]*,\s*(\d{2,})\s*\)\s*;?\s*$/.exec(line) ?? /\bduration:\s*(\d{2,})\b/.exec(line);
    if (t) problems.push(`${file}:${i + 1}: literal timing ${t[2] ?? t[1]} ms; read a token (R-timer)`);
  });
}

if (report) for (const l of listing) console.log(l);
console.log(`check-motion: ${transitions} transitions and ${animations} animations read; ${zero.places.length} zero-latency places (${zeroRules.length} static rules); ${allow.length} allowed layout or will-change uses.`);
if (problems.length) {
  for (const p of problems) console.log(`  ${p}`);
  console.log(`check-motion: ${problems.length} problem(s). See docs/motion.md "Enforcement".`);
  process.exit(1);
}
console.log('check-motion: every rule holds.');

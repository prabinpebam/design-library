// @ts-check
/**
 * The colour generator's pure core (owner direction F7, F7d; docs/foundation.md#colour-model). Dependency-free and
 * free of Node APIs, so the build (tools/colour.mjs) and the library's live brand editor run the same code.
 *
 * config (contract colour-config/2) → primitive ramps p.* (OKLCH tone mapping, gamut-mapped to sRGB) and the
 * config-shaped public tokens (color.brand.*, spectrum.*, set.*). Semantic roles in tokens.light/dark.json alias the
 * primitives, so a theme change is a config change.
 */
import { contrast, hexToOklch, hexToRgb, oklchToHex } from './colour-math.mjs';

export const CONTRACT = 'colour-config/2';
/** Target OKLCH lightness of each step: one tone curve for every ramp, so a step is about as light in every hue. */
export const TONE = /** @type {Record<string, number>} */ ({ 0: 1, 25: 0.985, 50: 0.968, 100: 0.935, 200: 0.878, 300: 0.773, 400: 0.651, 500: 0.535, 600: 0.453, 700: 0.371, 800: 0.288, 850: 0.25, 900: 0.211, 950: 0.179 });
/** Functional ramps are read as text at step 400 in dark and 600-800 in light, so their middle steps sit lighter (as v0's hand-tuned status inks did). */
const STATUS_TONE = /** @type {Record<string, number>} */ ({ 50: 0.975, 100: 0.955, 200: 0.91, 300: 0.85, 400: 0.78, 500: 0.66, 600: 0.52, 700: 0.47, 800: 0.42, 900: 0.27, 950: 0.21 });
export const BASE_STEPS = ['0', '25', '50', '100', '200', '300', '400', '500', '600', '700', '800', '850', '900', '950'];
export const HUE_STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
const SPECTRUM_STEPS = ['100', '200', '300', '400', '500', '600', '700', '800', '900'];
/** The four brand colour slots. They're numbered, not ranked (owner, F7d): any defined slot can be the accent. */
export const BRAND_SLOTS = /** @type {const} */ (['1', '2', '3', '4']);
const STATUSES = ['info', 'success', 'warning', 'danger'];
const BASE_TEMPERATURES = /** @type {Record<string, { h: number, c: number }>} */ ({ neutral: { h: 0, c: 0 }, warm: { h: 70, c: 0.012 }, cool: { h: 286, c: 0.012 } });
const HUE_NAMES = /** @type {[number, string][]} */ ([[25, 'red'], [55, 'orange'], [85, 'amber'], [115, 'yellow'], [145, 'green'], [175, 'teal'], [205, 'cyan'], [235, 'sky'], [265, 'blue'], [295, 'violet'], [325, 'magenta'], [355, 'pink']]);
export const HEX = /^#[0-9a-f]{6}$/i;
/** Vendor key for the machine-readable purpose of non-functional colours (DTCG $extensions). */
const EXT = 'org.design-library';
const NAME = /^[a-z][a-z0-9-]*$/;

/** Chroma taper: full in the middle tones, falling to zero at white and black. */
const taper = (/** @type {number} */ L) => Math.max(0, Math.min(1, (1 - L) / 0.3, L / 0.3));
const hueDistance = (/** @type {number} */ a, /** @type {number} */ b) => Math.abs(((a - b + 540) % 360) - 180);
/** The nearest named hue, however far: for naming a colour a person picked by hand. */
export const nearestHueName = (/** @type {number} */ h) => HUE_NAMES.reduce((best, x) => (hueDistance(x[0], h) < hueDistance(best[0], h) ? x : best))[1];
export const hueName = (/** @type {number} */ h) => {
  const [deg, name] = HUE_NAMES.reduce((best, x) => (hueDistance(x[0], h) < hueDistance(best[0], h) ? x : best));
  return hueDistance(deg, h) <= 10 ? name : `h${Math.round(h)}`;
};
const title = (/** @type {string} */ s) => s.charAt(0).toUpperCase() + s.slice(1);

/** Linear interpolation of y over x along points sorted by x descending; the ends hold their nearest value. */
function along(/** @type {[number, number][]} */ pts, /** @type {number} */ x) {
  if (x >= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    if (x >= x1) return x0 === x1 ? y1 : y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
  }
  return pts[pts.length - 1][1];
}

/**
 * One tonal ramp. Pinned steps keep their hand-set value; the seed becomes its nearest step; every other step takes the
 * tone curve bent through those control points (lightness), with chroma and hue interpolated between them.
 * @param {{ steps: string[], seed?: string, pins?: Record<string, string>, base?: { h: number, c: number }, tone?: Record<string, number>, label: string }} spec
 * @param {string[]} errors
 */
export function ramp({ steps, seed, pins = {}, base, tone = TONE, label }, errors) {
  const fixed = /** @type {Record<string, string>} */ ({});
  for (const [step, hex] of Object.entries(pins)) {
    if (!steps.includes(step)) errors.push(`${label}: pin ${step} isn't a step of this ramp (${steps.join(', ')})`);
    else if (!HEX.test(hex)) errors.push(`${label}: pin ${step} must be a #rrggbb colour`);
    else fixed[step] = hex.toLowerCase();
  }
  if (seed) {
    const [L] = hexToOklch(seed);
    const nearest = steps.reduce((a, b) => (Math.abs(tone[b] - L) < Math.abs(tone[a] - L) ? b : a));
    if (!Object.values(fixed).includes(seed.toLowerCase())) {
      if (fixed[nearest]) errors.push(`${label}: the seed ${seed} would be step ${nearest}, which is pinned to ${fixed[nearest]}; pin the seed or remove that pin`);
      else fixed[nearest] = seed.toLowerCase();
    }
  }
  const controls = Object.entries(fixed).map(([step, hex]) => ({ T: tone[step], lch: hexToOklch(hex) })).sort((a, b) => b.T - a.T);
  const fade = base ? (/** @type {number} */ L) => Math.min(1, 2 * taper(L)) : taper;
  const lightness = /** @type {[number, number][]} */ ([[1, 1], ...controls.map((c) => [c.T, c.lch[0]]), [0, 0]]);
  const strength = /** @type {[number, number][]} */ (controls.length ? controls.map((c) => [c.T, Math.min(0.4, c.lch[1] / Math.max(0.05, fade(c.lch[0])))]) : [[1, base?.c ?? 0]]);
  const chromatic = controls.filter((c) => c.lch[1] > 0.02);
  const fallbackHue = base?.h ?? (seed ? hexToOklch(seed)[2] : 0);
  const out = /** @type {Record<string, string>} */ ({});
  for (const step of steps) {
    if (fixed[step]) {
      out[step] = fixed[step];
      continue;
    }
    const T = tone[step];
    const L = along(lightness, T);
    const C = along(strength, T) * fade(L);
    let h = fallbackHue;
    if (chromatic.length) {
      const hues = /** @type {[number, number][]} */ (chromatic.map((c) => [c.T, c.lch[2]]));
      // unwrap hues so interpolation takes the short way round
      for (let i = 1; i < hues.length; i++) while (hues[i][1] - hues[i - 1][1] > 180) hues[i][1] -= 360;
      for (let i = 1; i < hues.length; i++) while (hues[i - 1][1] - hues[i][1] > 180) hues[i][1] += 360;
      h = (along(hues, T) + 360) % 360;
    }
    out[step] = oklchToHex([L, C, h]);
  }
  for (let i = 1; i < steps.length; i++) {
    const [a, b] = [hexToOklch(out[steps[i - 1]])[0], hexToOklch(out[steps[i]])[0]];
    if (b >= a) errors.push(`${label}: step ${steps[i]} (${out[steps[i]]}) isn't darker than step ${steps[i - 1]} (${out[steps[i - 1]]}); check the pins`);
  }
  return out;
}

const round = (/** @type {number} */ n) => Math.round(n * 10000) / 10000;
const colour = (/** @type {string} */ hex, /** @type {string} */ description, /** @type {number | undefined} */ alpha = undefined) => ({
  $type: 'color',
  $value: { colorSpace: 'srgb', components: hexToRgb(hex).map(round), hex: alpha === undefined ? hex : `${hex}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`, ...(alpha === undefined ? {} : { alpha }) },
  $description: description,
});
const alias = (/** @type {string} */ path, /** @type {string} */ description) => ({ $type: 'color', $value: `{${path}}`, $description: description });

/**
 * The defined brand slots of a config, in order: `[slot, { name?, seed, pins? }]`.
 * @returns {[string, { name?: string, seed: string, pins?: Record<string, string> }][]}
 */
export const brandSlots = (/** @type {any} */ config) => BRAND_SLOTS.flatMap((s) => (config?.brand?.colours?.[s] ? [[s, config.brand.colours[s]]] : []));
/** A slot's display name: its own name, or "Brand colour N". */
export const slotName = (/** @type {string} */ slot, /** @type {{ name?: string } | undefined} */ c) => c?.name || `Brand colour ${slot}`;

/** Validates a config and generates its token tree. Returns { tree, pairs, errors }. */
export function generate(/** @type {any} */ config) {
  /** @type {string[]} */
  const errors = [];
  if (config?.contract !== CONTRACT) errors.push(`contract must be "${CONTRACT}" (got ${JSON.stringify(config?.contract)})`);
  const given = config?.brand?.colours ?? {};
  for (const key of Object.keys(given)) if (!BRAND_SLOTS.includes(/** @type {any} */ (key))) errors.push(`brand.colours: slots are numbered 1 to 4 (got ${key})`);
  const slots = new Map(brandSlots(config));
  if (!slots.size) errors.push('brand.colours: define at least one brand colour');
  for (const [s, c] of slots) if (!HEX.test(c.seed ?? '')) errors.push(`brand colour ${s}: seed must be a #rrggbb colour`);
  const accent = String(config?.brand?.accent ?? 1);
  if (!slots.has(accent)) errors.push(`brand.accent is ${accent}, but brand colour ${accent} isn't defined; mark a defined colour as the accent`);
  const b = config?.base ?? {};
  const temperature = b.temperature ?? 'neutral';
  let baseHue = BASE_TEMPERATURES[temperature];
  if (!baseHue) errors.push('base.temperature must be neutral, warm or cool');
  if (b.tint) {
    const strength = b.tint.strength ?? 0.02;
    const from = b.tint.from === 'accent' ? accent : b.tint.from === undefined ? undefined : String(b.tint.from);
    if (strength < 0 || strength > 0.04) errors.push('base.tint.strength must be between 0 and 0.04, so the base stays black, white and greys rather than a colour');
    if (!!b.tint.colour === !!from) errors.push('base.tint: give a colour or from (a brand colour 1-4 or accent), one of them');
    else if (b.tint.colour && !HEX.test(b.tint.colour)) errors.push('base.tint.colour must be a #rrggbb colour');
    else if (from && !slots.has(from)) errors.push(`base.tint.from is ${b.tint.from}, but brand colour ${from} isn't defined`);
    else if (!errors.length) baseHue = { h: hexToOklch(b.tint.colour ?? /** @type {any} */ (slots.get(/** @type {string} */ (from))).seed)[2], c: strength };
  }
  for (const s of STATUSES) if (!HEX.test(config?.functional?.[s]?.seed ?? '')) errors.push(`functional.${s}.seed must be a #rrggbb colour`);
  const sp = config?.spectrum ?? {};
  if (!Number.isInteger(sp.hues) || sp.hues < 6 || sp.hues > 24) errors.push('spectrum.hues must be a whole number from 6 to 24');
  for (const set of config?.sets ?? []) {
    if (!NAME.test(set.name ?? '')) errors.push(`set ${set.name}: name must be lower-case letters, digits and hyphens`);
    if (typeof set.purpose !== 'string' || set.purpose.trim().length < 12)
      errors.push(`set ${set.name}: declare its purpose (what it's for and what it must never be used for), so people and agents use it correctly and nothing breaks when tokens change`);
    if (!set.colours === !set.generate) errors.push(`set ${set.name}: give colours or generate, one of them`);
    if (set.roles !== undefined && set.roles !== 'category' && set.roles !== 'ai') errors.push(`set ${set.name}: roles may only be "category" or "ai"`);
  }
  if ((config?.sets ?? []).filter((/** @type {any} */ s) => s.roles === 'category').length > 1) errors.push('only one set may provide the category roles');
  if ((config?.sets ?? []).filter((/** @type {any} */ s) => s.roles === 'ai').length > 1) errors.push('only one set may provide the AI roles');
  if (errors.length) return { tree: null, pairs: [], errors };

  /** @type {any} */
  const p = { $description: 'Primitives: the raw palette, generated from colour.config.json. Private; no component reads them.' };
  const nRamp = ramp({ steps: BASE_STEPS, pins: b.pins, base: baseHue, label: 'base' }, errors);
  const tintNote = b.tint ? `, tinted ${b.tint.from ? `from brand colour ${b.tint.from}` : b.tint.colour}` : '';
  p.base = { $description: `Private. Base colours (${temperature}${tintNote}): black, white and the greys between, for text, surfaces and outlines` };
  for (const s of BASE_STEPS) p.base[s] = colour(nRamp[s], `Base ${s}`);
  const ramps = /** @type {Record<string, Record<string, string>>} */ ({});
  for (const [s, c] of slots) {
    ramps[s] = ramp({ steps: HUE_STEPS, seed: c.seed, pins: c.pins, label: `brand colour ${s}` }, errors);
    const name = slotName(s, c);
    p[`brand-${s}`] = { $description: `Private. ${name}, brand colour ${s}${s === accent ? ' (the accent)' : ''}` };
    for (const step of HUE_STEPS) p[`brand-${s}`][step] = colour(ramps[s][step], `${name} ${step}`);
  }
  p.accent = { $description: `Private. The accent ramp, reusing brand colour ${accent}: actions, links, focus and selection` };
  for (const step of HUE_STEPS) p.accent[step] = alias(`p.brand-${accent}.${step}`, `Accent ${step} (brand colour ${accent})`);
  for (const s of STATUSES) {
    const f = config.functional[s];
    const r = ramp({ steps: HUE_STEPS, seed: f.seed, pins: f.pins, tone: STATUS_TONE, label: `functional ${s}` }, errors);
    p[s] = { $description: `Private. ${title(s)} status ramp, read only by color.status.${s}.*` };
    for (const step of HUE_STEPS) p[s][step] = colour(r[step], `${title(s)} ${step}`);
  }
  const ink = nRamp['950'];
  p.alpha = {
    $description: 'Private. Translucent layers: hover, press, selection and shadows',
    'base-6': colour(ink, 'Base at 6%: hover layer on light surfaces', 0.059),
    'base-12': colour(ink, 'Base at 12%: pressed layer on light surfaces', 0.122),
    'base-50': colour(ink, 'Base at 50%: scrim on light', 0.502),
    'base-shadow': colour(ink, 'Base at 15%: shadow on light', 0.149),
    'white-8': colour('#ffffff', 'White at 8%: hover layer on dark surfaces', 0.078),
    'white-14': colour('#ffffff', 'White at 14%: pressed layer on dark surfaces', 0.141),
    'black-70': colour('#000000', 'Black at 70%: scrim on dark', 0.702),
    'black-shadow': colour('#000000', 'Black at 50%: shadow on dark', 0.502),
    'accent-14': colour(ramps[accent]['500'], 'Accent at 14%: selected layer', 0.141),
  };

  /** @type {{ fg: string, bg: string, min: number }[]} */
  const pairs = [];
  const brand = /** @type {any} */ ({ $description: 'Identity marks only (logos, illustration, a brand band); never actions or status (those read the accent roles). The same in every context.' });
  for (const [s, c] of slots) {
    const [L] = hexToOklch(c.seed);
    const step = HUE_STEPS.reduce((a, b) => (Math.abs(TONE[b] - L) < Math.abs(TONE[a] - L) ? b : a));
    const on = contrast(c.seed, nRamp['0']) >= contrast(c.seed, nRamp['950']) ? '0' : '950';
    brand[s] = alias(`p.brand-${s}.${step}`, `${slotName(s, c)}, brand colour ${s}`);
    brand[`on-${s}`] = alias(`p.base.${on}`, `Text and marks on brand colour ${s}`);
    pairs.push({ fg: `color.brand.on-${s}`, bg: `color.brand.${s}`, min: 4.5 });
  }

  const SPECTRUM_PURPOSE = 'Data visualisation (series, categories), decoration and illustration, where many distinct hues are needed. Never status (use color.status.*), never a component’s own colours.';
  const meta = (/** @type {string} */ purpose) => ({ [EXT]: { purpose, functional: false } });
  const spectrum = /** @type {any} */ ({ $description: `The full hue range: a defined colour for every perceptible hue, the same in every context. Purpose: ${SPECTRUM_PURPOSE}`, $extensions: meta(SPECTRUM_PURPOSE) });
  for (let i = 0; i < sp.hues; i++) {
    const h = ((sp.start ?? 25) + (360 / sp.hues) * i) % 360;
    const name = hueName(h);
    spectrum[name] = { $description: `${title(name)}, hue ${Math.round(h)}°` };
    for (const step of SPECTRUM_STEPS) {
      const L = TONE[step];
      spectrum[name][step] = { ...colour(oklchToHex([L, (sp.chroma ?? 0.17) * Math.min(1, 1.6 * taper(L)), h]), `${title(name)} ${step}. Non-functional: charts, categories, decoration`), $extensions: meta(SPECTRUM_PURPOSE) };
    }
  }

  const set = /** @type {any} */ ({ $description: 'Custom colour sets, each only for the purpose it declares (in its $extensions). Non-functional; optional.' });
  /** @type {any} */
  let category = null;
  /** @type {any} */
  let ai = null;
  for (const s of config.sets ?? []) {
    const purpose = s.purpose.trim();
    set[s.name] = { $description: `${s.demo ? 'Demo set. ' : ''}Purpose: ${purpose}`, $extensions: meta(purpose) };
    const members = s.colours
      ? Object.entries(s.colours)
      : s.generate.hues.map((/** @type {number} */ h) => [hueName(h), oklchToHex([s.generate.lightness, s.generate.chroma, h])]);
    for (const [name, hex] of members) {
      if (!NAME.test(name) || !HEX.test(hex)) errors.push(`set ${s.name}: member ${name} needs a lower-case name and a #rrggbb colour`);
      else set[s.name][name] = { ...colour(hex.toLowerCase(), `${title(s.name)} ${name}. Purpose: ${purpose}`), $extensions: meta(purpose) };
    }
    // Q44: the one set that declares roles "category" becomes numbered public roles that components may read.
    if (s.roles === 'category') {
      category = { $description: `Category identity, numbered 1-${members.length} in order, the same in every context; each holds 3:1 on every surface. Purpose: ${purpose}`, $extensions: meta(purpose) };
      members.forEach((/** @type {[string, string]} */ [name, hex], /** @type {number} */ i) => {
        const n = String(i + 1);
        const on = contrast(hex, nRamp['0']) >= contrast(hex, nRamp['950']) ? '0' : '950';
        category[n] = { ...alias(`set.${s.name}.${name}`, `Category ${n} (${name}). Purpose: ${purpose}`), $extensions: meta(purpose) };
        category[`on-${n}`] = alias(`p.base.${on}`, `Text and marks on category ${n}`);
        pairs.push({ fg: `color.category.on-${n}`, bg: `color.category.${n}`, min: 4.5 });
        for (const bg of ['color.bg', 'color.bg-raised', 'color.bg-sunken']) pairs.push({ fg: `color.category.${n}`, bg, min: 3 });
      });
    }
    // Q56: the one set that declares roles "ai" becomes numbered gradient stops (color.ai.1-n) for the AI processing
    // state; each holds 3:1 on every surface so the ring stays visible wherever the gradient turns.
    if (s.roles === 'ai') {
      ai = { $description: `AI processing gradient stops, numbered 1-${members.length} in order, the same in every context; each holds 3:1 on every surface. Purpose: ${purpose}`, $extensions: meta(purpose) };
      members.forEach((/** @type {[string, string]} */ [name], /** @type {number} */ i) => {
        const n = String(i + 1);
        ai[n] = { ...alias(`set.${s.name}.${name}`, `AI stop ${n} (${name}). Purpose: ${purpose}`), $extensions: meta(purpose) };
        for (const bg of ['color.bg', 'color.bg-raised', 'color.bg-sunken']) pairs.push({ fg: `color.ai.${n}`, bg, min: 3 });
      });
    }
  }
  const tree = { $comment: 'Generated by tools/colour.mjs from colour.config.json. Never edit by hand.', p, color: { brand, ...(category ? { category } : {}), ...(ai ? { ai } : {}) }, spectrum, set };
  return { tree, pairs, errors };
}

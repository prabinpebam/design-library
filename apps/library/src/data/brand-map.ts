/**
 * The brand map (Q132, docs/brand-colour.md): which brand colour each colour-bearing part of the UI reads, as seven
 * groups of parts assigned to columns (a brand colour or Neutral), and how each part gets a passing colour from its
 * column's ramp. Pure: the brand draft (data/brand.ts) calls `resolveMap` with the generated ramps and sets the vars.
 *
 * Trial (Q133, Q134): resolved in four contexts. Standard contrast is brand first: every part starts at the brand's own
 * seed, derived steps carry hover and pressed, and contrast is relaxed (text on fills stays legible, marks need only be
 * visible). More contrast is the accessible one: the tone steps and the full thresholds.
 */
import { BRAND_SLOTS, contrast, hexToOklch } from '@design-library/core/colour';
import { primitiveIn, resolveLiteral } from './tokens';

export type Slot = (typeof BRAND_SLOTS)[number];
export type Column = Slot | 'neutral';
export type Scheme = 'light' | 'dark';
export type GroupId = 'primary-elements' | 'primary-surfaces' | 'primary-accents' | 'secondary-elements' | 'secondary-surfaces' | 'secondary-accents' | 'highlights';
export type PresetId = 'one' | 'signature' | 'bold' | 'quiet' | 'neutral-actions';

export const groups: { id: GroupId; name: string }[] = [
  { id: 'primary-elements', name: 'Primary elements' },
  { id: 'primary-surfaces', name: 'Primary surfaces' },
  { id: 'primary-accents', name: 'Primary accents' },
  { id: 'secondary-elements', name: 'Secondary elements' },
  { id: 'secondary-surfaces', name: 'Secondary surfaces' },
  { id: 'secondary-accents', name: 'Secondary accents' },
  { id: 'highlights', name: 'Highlights' },
];

export const mapPresets: { id: PresetId; name: string; description: string }[] = [
  { id: 'one', name: 'One colour', description: 'Every part in the lead colour' },
  { id: 'signature', name: 'Signature', description: 'The second colour on surfaces, the switch handle and highlights; the button keeps one colour' },
  { id: 'bold', name: 'Bold', description: 'Signature, plus a ring in the second colour on the button: playful and uncommon' },
  { id: 'quiet', name: 'Quiet', description: 'The lead colour everywhere; the second only for highlights' },
  { id: 'neutral-actions', name: 'Neutral actions', description: 'Actions in black or white; brand colours on surfaces and marks' },
];

type Tone = 'action' | 'text' | 'focus' | 'tint' | 'brand';
type Kind = 'fill' | 'line' | 'text' | 'selected' | 'tint' | 'mark' | 'ring' | 'chip' | 'badge' | 'highlight' | 'surface';
type Ground = 'page' | 'on-fills' | 'action-fill';

export interface PartDef {
  id: string;
  name: string;
  group: GroupId;
  tone: Tone;
  kind: Kind;
  ground: Ground;
  /** Contrast it needs against its ground (0: none, its indicator or text carries the state). */
  need: number;
  /** The custom properties it sets: one per role it replaces. */
  vars: string[];
  /** No component reads it yet: shown on the board, not resolved. */
  deferred?: true;
}

const P = (id: string, name: string, group: GroupId, tone: Tone, kind: Kind, ground: Ground, need: number, vars: string[], deferred?: true): PartDef => ({ id, name, group, tone, kind, ground, need, vars, deferred });

/** Every colour-bearing part, in group order, as docs/brand-colour.md "The parts" lists them. */
export const parts: PartDef[] = [
  P('action-fill', 'Action fill', 'primary-elements', 'action', 'fill', 'page', 3, ['--color-map-action-fill', '--color-map-action-fill-hover', '--color-map-action-fill-pressed', '--color-map-action-fill-on']),
  P('on-fills', 'On fills', 'primary-elements', 'action', 'fill', 'page', 3, ['--color-map-on-fill', '--color-map-on-fill-hover', '--color-map-on-fill-pressed']),
  P('links', 'Links', 'primary-elements', 'text', 'text', 'page', 4.5, ['--color-text-link']),
  P('focus', 'Focus ring', 'primary-elements', 'focus', 'line', 'page', 3, ['--color-focus']),
  P('selected-tint', 'Selected tint', 'primary-surfaces', 'action', 'selected', 'page', 0, ['--state-selected']),
  P('brand-tint', 'Brand tint', 'primary-surfaces', 'tint', 'tint', 'page', 0, ['--color-map-brand-tint']),
  P('brand-band', 'Brand band', 'primary-surfaces', 'brand', 'surface', 'page', 0, ['--color-map-band', '--color-map-band-on']),
  P('selection-indicators', 'Selection indicators', 'primary-accents', 'action', 'line', 'page', 3, ['--color-map-selection-indicator']),
  P('marks-on-fills', 'Marks on fills', 'primary-accents', 'brand', 'mark', 'on-fills', 3, ['--color-map-mark-on-fill']),
  P('progress', 'Progress and activity', 'primary-accents', 'action', 'line', 'page', 3, ['--color-map-progress']),
  P('brand-text', 'Brand text and icons', 'primary-accents', 'text', 'text', 'page', 4.5, ['--color-text-accent']),
  P('drop-targets', 'Drop targets', 'primary-accents', 'action', 'line', 'page', 3, ['--color-map-drop-target']),
  P('chosen-segment', 'Chosen segment', 'secondary-elements', 'action', 'fill', 'page', 3, ['--color-map-chosen-segment', '--color-map-chosen-segment-on']),
  P('chips', 'Selected chips', 'secondary-elements', 'action', 'chip', 'page', 3, ['--color-map-chip', '--color-map-chip-tint']),
  P('badges', 'Brand badges', 'secondary-elements', 'action', 'badge', 'page', 4.5, ['--color-map-badge', '--color-map-badge-on', '--color-map-badge-tint']),
  P('rating', 'Rating', 'secondary-elements', 'action', 'line', 'page', 3, ['--color-map-rating', '--color-map-rating-hover']),
  P('feature-panel', 'Feature panel', 'secondary-surfaces', 'brand', 'surface', 'page', 0, ['--color-map-feature', '--color-map-feature-on']),
  P('feature-tint', 'Feature tint', 'secondary-surfaces', 'tint', 'surface', 'page', 0, ['--color-map-feature-tint']),
  P('button-ring', 'Button ring', 'secondary-accents', 'brand', 'ring', 'action-fill', 3, ['--color-map-button-ring']),
  P('switch-handle', 'Switch handle', 'secondary-accents', 'brand', 'mark', 'on-fills', 3, ['--color-map-switch-handle']),
  P('band-indicator', 'Band indicator', 'secondary-accents', 'brand', 'line', 'page', 0, [], true),
  P('highlight-badge', 'Highlight badge', 'highlights', 'brand', 'highlight', 'page', 4.5, ['--color-map-highlight-badge', '--color-map-highlight-badge-on']),
  P('illustration', 'Illustration accents', 'highlights', 'action', 'line', 'page', 0, ['--color-map-illustration']),
];
const partById = new Map(parts.map((p) => [p.id, p]));

/** The map as the draft stores it: a preset that follows the colours, or every part placed by hand ("custom"). */
export interface BrandMap {
  preset?: PresetId;
  parts?: Record<string, Column>;
}

export type Status = 'fine' | 'shifted' | 'same' | 'fallback' | 'plain' | 'deferred';
interface Look {
  /** CSS per var, this scheme. */
  css: Record<string, string>;
  /** The literal of its main colour (a ground for the parts on it). */
  hex: string;
  /** Its on-colour, for a fill. */
  on?: string;
  status: Status;
  /** Steps moved from the tone's step: + darker, − lighter. */
  shift: number;
}

export interface PartResult {
  part: PartDef;
  column: Column;
  /** A colour that shows the part in its column (light scheme), for the board's row mark. */
  swatch?: string;
  note?: string;
  noteTone?: 'info' | 'warning';
  status: Record<Scheme, Status>;
}

export interface MapState {
  preset: PresetId | 'custom';
  /** The preset a reset returns to: One colour for one colour, else Signature. */
  start: PresetId;
  assignment: Record<string, Column>;
  results: PartResult[];
  /** The colour that holds Action fill: the action colour (null when actions are Neutral). */
  actionColumn: Column;
  /** Notes on the whole map (docs/brand-colour.md "Hard rules and notes"). */
  notes: string[];
  /** The colours that can carry controls (seed at step 300 or darker, action tone passing in light and dark). */
  carriers: Slot[];
  /** Standard contrast: brand first, or the accessible steps when `accessible`. */
  vars: Record<string, string>;
  /** More contrast: always the accessible steps. */
  varsMore: Record<string, string>;
  accessible: boolean;
}

const p2hex = (css: string) => resolveLiteral(css.replace(/^--p-([a-z]+(?:-\d)?)-(\d+)$/, 'p.$1.$2')).slice(0, 7);
const roleHex = (path: string, scheme: Scheme) => p2hex(primitiveIn(path, scheme));
const base0 = resolveLiteral('p.base.0').slice(0, 7);
const base950 = resolveLiteral('p.base.950').slice(0, 7);
const page = { light: roleHex('color.bg', 'light'), dark: roleHex('color.bg', 'dark') };
const ink = { light: roleHex('color.text', 'light'), dark: roleHex('color.text', 'dark') };
const onOf = (hex: string) => (contrast(base0, hex) >= contrast(base950, hex) ? base0 : base950);
const onCss = (hex: string) => (hex === base0 ? 'var(--p-base-0)' : 'var(--p-base-950)');

const TONE: Record<Exclude<Tone, 'brand'>, Record<Scheme, string>> = {
  action: { light: '500', dark: '400' },
  text: { light: '600', dark: '300' },
  focus: { light: '500', dark: '300' },
  tint: { light: '100', dark: '900' },
};

interface Env {
  ramps: Partial<Record<Slot, Record<string, string>>>;
  seeds: Partial<Record<Slot, string>>;
}

const stepsOf = (ramp: Record<string, string>) => Object.keys(ramp).sort((a, b) => Number(a) - Number(b));

/**
 * The first step at or near the tone's that passes `ok`: the tone's own, then one darker or lighter, then two. In light,
 * fills start at the brand's own step when it is 500-700, so a button shows the brand's blue rather than a lighter one.
 */
function pick(env: Env, slot: Slot, tone: Tone, scheme: Scheme, ok: (hex: string) => boolean, strict = true) {
  const ramp = env.ramps[slot];
  if (!ramp) return null;
  const steps = stepsOf(ramp);
  const seed = env.seeds[slot] ?? '500';
  if (!strict && tone !== 'tint') {
    // Brand first (Q134): the seed as is, else the nearest step that passes, up to four away.
    const at = steps.indexOf(seed);
    const d = scheme === 'light' ? 1 : -1;
    for (const o of [0, d, -d, 2 * d, -2 * d, 3 * d, -3 * d, 4 * d, -4 * d]) {
      const step = steps[at + o];
      if (step && ok(ramp[step].slice(0, 7))) return { steps, ramp, index: at + o, shift: o };
    }
    return null;
  }
  const own = tone === 'action' && scheme === 'light' && Number(seed) >= 500 && Number(seed) <= 700;
  const at = steps.indexOf(tone === 'brand' || own ? seed : TONE[tone][scheme]);
  if (at < 0) return null;
  const d = scheme === 'light' ? 1 : -1;
  for (const o of [0, d, -d, 2 * d, -2 * d]) {
    const step = steps[at + o];
    if (step && ok(ramp[step].slice(0, 7))) return { steps, ramp, index: at + o, shift: o };
  }
  return null;
}

const mix = (a: string, pct: number, b: string) => `color-mix(in srgb, ${a} ${pct}%, ${b})`;

/** A part's plain look (Neutral, same colour as its ground, or no passing step): always passes. */
function plain(part: PartDef, scheme: Scheme, ground: Look | undefined, status: Status): Look {
  const [v0, v1, v2, v3] = part.vars;
  const text = 'var(--color-text)';
  const bg = 'var(--color-bg)';
  const sunken = 'var(--color-bg-sunken)';
  const css: Record<string, string> = {};
  let hex = ink[scheme];
  let on: string | undefined;
  switch (part.kind) {
    case 'fill':
      css[v0] = text;
      if (part.id === 'chosen-segment') css[v1] = bg;
      else {
        if (v1) css[v1] = mix(text, 85, bg);
        if (v2) css[v2] = mix(text, 70, bg);
        if (v3) css[v3] = bg;
      }
      on = page[scheme];
      break;
    case 'selected':
      css[v0] = mix(text, 10, 'transparent');
      break;
    case 'tint':
      css[v0] = sunken;
      hex = page[scheme];
      break;
    case 'mark':
      // The ground fill's on-colour: base 0 or 950 on a colour fill, the page colour on a plain (text-coloured) fill.
      css[v0] = ground?.on === base0 || ground?.on === base950 ? onCss(ground.on) : bg;
      hex = ground?.on ?? page[scheme];
      break;
    case 'ring':
      css[v0] = 'var(--color-map-action-fill)';
      hex = ground?.hex ?? ink[scheme];
      break;
    case 'chip':
      css[v0] = text;
      css[v1] = sunken;
      break;
    case 'badge':
      css[v0] = text;
      css[v1] = bg;
      css[v2] = sunken;
      on = page[scheme];
      break;
    case 'highlight':
      css[v0] = text;
      css[v1] = bg;
      on = page[scheme];
      break;
    case 'surface':
      // A neutral surface: the band in the text colour (a dark strip), a panel or tint on the sunken fill.
      if (part.id === 'brand-band') {
        css[v0] = text;
        css[v1] = bg;
        on = page[scheme];
      } else {
        css[v0] = sunken;
        if (v1) css[v1] = text;
        hex = page[scheme];
      }
      break;
    default:
      css[v0] = text;
      if (v1) css[v1] = text;
  }
  return { css, hex, on, status, shift: 0 };
}

/**
 * Brand-first thresholds (Q134): a fill's label carries its legibility (its on-colour, black or white, always reaches
 * 4.5:1), so the fill needs no contrast with the page; text and chips 3:1; the focus ring 3:1; other marks 2:1, visible.
 */
const relaxedNeed = (p: PartDef) =>
  p.kind === 'fill' ? 0 : p.kind === 'badge' || p.kind === 'highlight' ? p.need : p.tone === 'text' || p.kind === 'chip' || p.id === 'focus' ? Math.min(p.need, 3) : Math.min(p.need, 2);

/** One part in one column and scheme, by the rules in docs/brand-colour.md "How a part gets its colour". */
function resolvePart(env: Env, part: PartDef, column: Column, scheme: Scheme, ground: Look | undefined, groundColumn: Column | undefined, strict = true): Look {
  if (part.deferred) return { css: {}, hex: '', status: 'deferred', shift: 0 };
  if (column === 'neutral') return plain(part, scheme, ground, 'plain');
  if (part.ground !== 'page' && groundColumn === column) return plain(part, scheme, ground, 'same');
  const groundHex = part.ground === 'page' ? page[scheme] : (ground?.hex ?? page[scheme]);
  const need = strict ? part.need : relaxedNeed(part);
  const ok = (hex: string) => {
    if (part.kind === 'badge' || part.kind === 'highlight') return contrast(onOf(hex), hex) >= need;
    return !need || contrast(hex, groundHex) >= need;
  };
  const got = pick(env, column, part.tone, scheme, ok, strict);
  if (!got) return plain(part, scheme, ground, 'fallback');
  const { steps, ramp, index, shift } = got;
  const d = scheme === 'light' ? 1 : -1;
  const at = (i: number) => ramp[steps[Math.max(0, Math.min(steps.length - 1, i))]].slice(0, 7);
  const hex = at(index);
  const status: Status = shift ? 'shifted' : 'fine';
  const [v0, v1, v2, v3] = part.vars;
  const css: Record<string, string> = { [v0]: hex };
  let on: string | undefined;
  switch (part.kind) {
    case 'fill':
      on = onOf(hex);
      if (part.id === 'chosen-segment') css[v1] = on;
      else {
        // Hover and pressed are derived steps: darker in light, lighter in dark, unless that steals the label's contrast.
        let dir = d;
        if (!strict) {
          dir = scheme === 'light' ? 1 : -1;
          const keeps = (k: number) => Boolean(steps[index + k * dir]) && contrast(on!, at(index + k * dir)) >= 4.5;
          if (!(keeps(1) && keeps(2))) dir = -dir;
        }
        if (v1) css[v1] = at(index + dir);
        if (v2) css[v2] = at(index + 2 * dir);
        if (v3) css[v3] = on;
      }
      break;
    case 'selected':
      css[v0] = mix(hex, 14, 'transparent');
      break;
    case 'chip': {
      const tint = env.ramps[column]?.[TONE.tint[scheme]];
      css[v1] = tint ? tint.slice(0, 7) : 'var(--color-bg-sunken)';
      break;
    }
    case 'badge': {
      on = onOf(hex);
      css[v1] = on;
      const tint = env.ramps[column]?.[TONE.tint[scheme]];
      css[v2] = tint ? tint.slice(0, 7) : 'var(--color-bg-sunken)';
      break;
    }
    case 'highlight':
      on = onOf(hex);
      css[v1] = on;
      break;
    case 'surface':
      on = onOf(hex);
      if (v1) css[v1] = on;
      break;
    default:
      if (v1) css[v1] = at(index + d);
  }
  return { css, hex, on, status, shift };
}

const pair = (l: string, d: string) => (l === d ? l : `light-dark(${l}, ${d})`);

/** The colours that can carry controls: seed at 300 or darker, Action fill passing in light and dark. */
function carriersOf(env: Env, defined: Slot[]) {
  return defined.filter((s) => {
    if (Number(env.seeds[s] ?? 0) < 300) return false;
    const fill = partById.get('action-fill')!;
    return (['light', 'dark'] as Scheme[]).every((sc) => resolvePart(env, fill, s, sc, undefined, undefined).status !== 'fallback');
  });
}

/** A preset's recipe, run on the colours (docs/brand-colour.md "Presets"). */
export function recipe(preset: PresetId, defined: Slot[], carriers: Slot[]): Record<GroupId, Column> {
  const L = carriers[0];
  const S = defined.find((s) => s !== L);
  const T = defined.find((s) => s !== L && s !== S);
  const control: Column = L ?? 'neutral';
  const lead: Column = L ?? defined[0];
  const second: Column = S ?? lead;
  const third: Column = T ?? second;
  const sCarries = S && carriers.includes(S) ? S : control;
  switch (preset) {
    case 'one':
      return { 'primary-elements': control, 'primary-surfaces': lead, 'primary-accents': control, 'secondary-elements': control, 'secondary-surfaces': lead, 'secondary-accents': lead, highlights: lead };
    case 'quiet':
      return { 'primary-elements': control, 'primary-surfaces': lead, 'primary-accents': control, 'secondary-elements': control, 'secondary-surfaces': lead, 'secondary-accents': lead, highlights: second };
    case 'neutral-actions':
      return { 'primary-elements': 'neutral', 'primary-surfaces': lead, 'primary-accents': 'neutral', 'secondary-elements': 'neutral', 'secondary-surfaces': second, 'secondary-accents': second, highlights: third };
    default:
      return { 'primary-elements': control, 'primary-surfaces': lead, 'primary-accents': control, 'secondary-elements': sCarries, 'secondary-surfaces': second, 'secondary-accents': second, highlights: third };
  }
}

const startOf = (defined: Slot[]): PresetId => (defined.length > 1 ? 'signature' : 'one');

/** Every part's column: the stored parts when edited (any in a missing colour go to the action colour), else the recipe. */
export function assignmentOf(map: BrandMap | undefined, defined: Slot[], carriers: Slot[]): { preset: PresetId | 'custom'; start: PresetId; assignment: Record<string, Column> } {
  const start = startOf(defined);
  const preset = map?.preset ?? start;
  const byGroup = recipe(preset, defined, carriers);
  // Q136: the button's ring matches its fill in every arrangement but Bold; a two-colour button is the playful choice.
  const fromRecipe = Object.fromEntries(parts.map((p) => [p.id, p.id === 'button-ring' && preset !== 'bold' ? byGroup['primary-elements'] : byGroup[p.group]])) as Record<string, Column>;
  if (!map?.parts) return { preset, start, assignment: fromRecipe };
  const action = map.parts['action-fill'];
  const fallback: Column = action && (action === 'neutral' || defined.includes(action)) ? action : (carriers[0] ?? defined[0]);
  const assignment = Object.fromEntries(parts.map((p) => {
    const c = map.parts![p.id] ?? fromRecipe[p.id];
    return [p.id, c === 'neutral' || defined.includes(c) ? c : fallback];
  })) as Record<string, Column>;
  return { preset: 'custom', start, assignment };
}

const hueGap = (a: number, b: number) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));
const statusHue = (path: string) => {
  const hex = roleHex(path, 'light');
  return hex.startsWith('#') ? hexToOklch(hex)[2] : null;
};
const dangerHue = statusHue('color.status.danger-fill');
const warningHue = statusHue('color.status.warning-fill');

/** Resolves the map: every part's look in light and dark, the custom properties to set, and the notes. */
export function resolveMap(map: BrandMap | undefined, env: Env, defined: Slot[], names: Record<string, string>, accessible = false): MapState {
  const carriers = carriersOf(env, defined);
  const { preset, start, assignment } = assignmentOf(map, defined, carriers);
  const order = ['action-fill', 'on-fills', ...parts.map((p) => p.id).filter((id) => id !== 'action-fill' && id !== 'on-fills')];
  const resolveAll = (strict: boolean) => {
    const out: Record<string, Record<Scheme, Look>> = {};
    for (const id of order) {
      const part = partById.get(id)!;
      const groundId = part.ground === 'page' ? undefined : part.ground;
      out[id] = {} as Record<Scheme, Look>;
      for (const scheme of ['light', 'dark'] as Scheme[])
        out[id][scheme] = resolvePart(env, part, assignment[id], scheme, groundId ? out[groundId][scheme] : undefined, groundId ? assignment[groundId] : undefined, strict);
    }
    return out;
  };
  const varsOf = (ls: Record<string, Record<Scheme, Look>>) => {
    const out: Record<string, string> = {};
    for (const part of parts) for (const v of part.vars) out[v] = pair(ls[part.id].light.css[v], ls[part.id].dark.css[v]);
    return out;
  };
  const looks = resolveAll(accessible);
  const strictLooks = accessible ? looks : resolveAll(true);
  const vars = varsOf(looks);
  const varsMore = varsOf(strictLooks);

  const results: PartResult[] = parts.map((part) => {
    const l = looks[part.id];
    const status = { light: l.light.status, dark: l.dark.status };
    const falls = (['light', 'dark'] as Scheme[]).filter((s) => status[s] === 'fallback');
    const shifted = (['light', 'dark'] as Scheme[]).filter((s) => status[s] === 'shifted');
    let note: string | undefined;
    let noteTone: PartResult['noteTone'];
    if (part.deferred) note = 'No component reads this yet';
    else if (falls.length) {
      note = `Too little contrast in ${falls.join(' and ')}: shows the plain look`;
      noteTone = 'warning';
    } else if (shifted.length) note = `Shifted in ${shifted.map((s) => `${s} (${l[s].shift > 0 ? 'darker' : 'lighter'} step)`).join(' and ')}`;
    else if (status.light === 'same') note = `Same colour as the ${part.ground === 'action-fill' ? 'action fill' : 'switch track and checked fills'}: shows its on-colour`;
    const swatch = part.deferred ? (assignment[part.id] === 'neutral' ? undefined : env.ramps[assignment[part.id] as Slot]?.[env.seeds[assignment[part.id] as Slot] ?? '500']) : l.light.hex || undefined;
    return { part, column: assignment[part.id], status, note, noteTone, swatch };
  });

  const actionColumn = assignment['action-fill'];
  const notes: string[] = [];
  if (assignment['on-fills'] !== actionColumn) notes.push('Actions split: Action fill and On fills are in different columns, so "act here" and "this is on" read as different colours.');
  const apart = ['focus', 'links'].filter((id) => assignment[id] !== actionColumn && assignment[id] !== 'neutral');
  if (apart.length) notes.push(`${apart.map((id) => partById.get(id)!.name).join(' and ')} ${apart.length > 1 ? 'are' : 'is'} outside the action colour: a third colour for focus or links reads as a different kind of thing.`);
  const accents = parts.filter((p) => (p.group === 'primary-accents' || p.group === 'secondary-accents') && !p.deferred);
  const marks = accents.filter((p) => {
    const c = assignment[p.id];
    const ground = p.ground === 'page' ? undefined : assignment[p.ground];
    return c !== 'neutral' && c !== actionColumn && c !== ground && looks[p.id].light.status !== 'fallback';
  });
  if (marks.length > 3) notes.push(`Too many signature marks: ${marks.length} accents show a second colour (${marks.map((p) => p.name).join(', ')}). Three at most keeps the signature rare enough to read.`);
  if (actionColumn !== 'neutral' && env.ramps[actionColumn]) {
    const [, c, h] = hexToOklch(env.ramps[actionColumn]![env.seeds[actionColumn] ?? '500'].slice(0, 7));
    const near = c > 0.04 && [dangerHue, warningHue].some((s) => s !== null && hueGap(h, s) <= 30);
    if (near) notes.push(`Near a status hue: ${names[actionColumn]} is close to the danger or warning hue, so a primary button can read as destructive. Neutral actions avoids it.`);
  }
  const differ = parts.filter((p) => !p.deferred && p.vars.some((v) => vars[v] !== varsMore[v]));
  if (differ.length) notes.push(`More contrast: ${differ.length} part${differ.length > 1 ? 's' : ''} switch to accessible steps there. Compare the two rows of examples below.`);
  for (const s of defined) {
    if (!accessible) continue;
    if (Number(env.seeds[s] ?? 500) > 200) continue;
    const holds = parts.filter((p) => !p.deferred && assignment[p.id] === s && (p.tone === 'action' || p.tone === 'text' || p.tone === 'focus'));
    if (holds.length) notes.push(`Light colour: ${names[s]} is light, so ${holds.map((p) => p.name).join(', ')} show${holds.length > 1 ? '' : 's'} a much darker step of it to stay readable.`);
  }
  return { preset, start, assignment, results, actionColumn, notes, carriers, vars, varsMore, accessible };
}

/** The group cards a column shows: each group with any part in it, its parts here, and "2 of 4" when it's split. */
export function cardsIn(state: MapState, column: Column) {
  return groups.flatMap((g) => {
    const all = state.results.filter((r) => r.part.group === g.id);
    const here = all.filter((r) => r.column === column);
    return here.length ? [{ group: g, here, total: all.length }] : [];
  });
}

/** The map after moving parts, as a hand-edited (custom) map. */
export function moved(state: MapState, ids: string[], to: Column): BrandMap {
  const parts2 = { ...state.assignment };
  for (const id of ids) parts2[id] = to;
  return { parts: parts2 };
}

export const groupParts = (id: GroupId) => parts.filter((p) => p.group === id).map((p) => p.id);
export const partName = (id: string) => partById.get(id)?.name ?? id;

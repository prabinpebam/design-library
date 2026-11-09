/**
 * Visual noise probe (owner Q85.2, 2026-11-09; docs/visual-noise.md#part-2-the-checklist). Run in the browser on any
 * template layout or library page at rest (no pointer over it, nothing focused, motion settled): load it with
 * Playwright's page.addScriptTag({ path }) or paste it into the console, then call `window.noiseProbe(rootSelector?)`.
 * The root is the page's layout by default. It scores the rows that can be read from the DOM, after the agentic-craft
 * `visual-noise` skill's checks (references/checks.md):
 *
 *   VN1 members   members of an enclosed group (a control inside a bordered, filled or raised group) carry no border,
 *                 fill or shadow of their own at rest; fields, the selected or current member and one emphasised
 *                 action (the accent fill) are allowed
 *   VN2 stripe    no border on one side only, wider than a hairline, on a card, button, callout or item (owner
 *                 constraint: no one-sided accent borders)
 *   VN3 depth     at most two visible enclosures (a border, a fill that differs from its parent's, a shadow) from the
 *                 surface to anything in flow; a floating surface (popup, dialog, sheet, floating bar) starts again
 *   VN4 strokes   at most three distinct border values in the view, status and accent excepted
 *   VN5 fills     at most four distinct fills in the view, status, accent and selection excepted
 *   VN6 shadows   at most two distinct shadows in the view (raised and overlay)
 *
 * Content is skipped: pictures, icons, a canvas's document, avatars and colour swatches (their colour is data).
 * Returns { rows: { VN1: { pass, findings, count }, … }, values: { strokes, fills, shadows } }.
 */
(function () {
  const px = (v) => parseFloat(v) || 0;
  const LAYOUTS = '[data-dl="site-layout"],[data-dl="app-layout"],[data-dl="chat-layout"],[data-dl="editor-layout"],[data-dl="library-layout"]';
  const CONTENT = 'img,picture,video,svg,canvas,[data-dl="canvas"] [data-dl-part="document"],[data-dl="canvas"] [data-dl-part="stage"],[data-dl="avatar"],[data-dl="swatch"],[data-dl-part="swatch"],[data-dl="colour-field"] [data-dl-part="swatch"],[data-dl="stacked-bar"],[data-dl="chart"],[data-dl="sparkline"],[data-dl="progress"],[data-dl="meter"],[data-dl="slider"] [data-dl-part="track"],[data-dl="switch"] [data-dl-part="track"],[data-dl="skeleton"],[aria-hidden="true"]';
  const FIELD = 'input:not([type=hidden]),select,textarea,[role=combobox],[role=textbox],[role=searchbox],[contenteditable="true"],[data-dl-part="box"],[data-dl="checkbox"] [data-dl-part="mark"],[data-dl="radio"] [data-dl-part="mark"],[data-dl="switch"] *';
  const FLOATING = '[data-material="floating"],[data-material="modal"],dialog,[popover],[role=dialog],[role=menu],[role=listbox],[role=tooltip]';
  // Transparent: the keyword, or an alpha of 0 (never an opaque colour whose blue happens to be 0).
  const clear = (c) => !c || c === 'transparent' || /^rgba\([^,]+,[^,]+,[^,]+,\s*0(\.0+)?\)$/.test(c);
  const name = (el) => {
    const dl = el.getAttribute('data-dl');
    const part = el.getAttribute('data-dl-part');
    const label = el.getAttribute('aria-label');
    const base = dl ? dl : part ? `${el.parentElement?.closest('[data-dl]')?.getAttribute('data-dl') ?? ''}.${part}` : el.tagName.toLowerCase();
    return label ? `${base} “${label.slice(0, 30)}”` : base;
  };
  // The colours a role gives meaning to (status, accent, focus, selection), resolved in this document and context.
  const roleColours = (root) => {
    const set = new Set();
    const roles = ['accent', 'accent-hover', 'accent-pressed', 'accent-subtle', 'focus'];
    for (const s of ['info', 'success', 'warning', 'danger', 'neutral']) for (const k of ['bg', 'border', 'fill', 'fg']) roles.push(`status-${s}-${k}`);
    const probe = document.createElement('div');
    root.append(probe);
    for (const r of roles) {
      probe.style.backgroundColor = `var(--color-${r})`;
      set.add(getComputedStyle(probe).backgroundColor);
    }
    probe.remove();
    return set;
  };

  window.noiseProbe = function noiseProbe(rootSelector) {
    const root = (rootSelector ? document.querySelector(rootSelector) : document.querySelector(LAYOUTS)) ?? document.body;
    const rows = {};
    for (const id of ['VN1', 'VN2', 'VN3', 'VN4', 'VN5', 'VN6']) rows[id] = { pass: true, findings: [], count: 0 };
    const fail = (id, f) => {
      rows[id].pass = false;
      rows[id].count++;
      if (rows[id].findings.length < 8) rows[id].findings.push(f);
    };
    const meaning = roleColours(root);
    const strokes = new Map();
    const fills = new Map();
    const shadows = new Map();
    const note = (map, value, el) => {
      if (!map.has(value)) map.set(value, name(el));
    };
    const surface = (el) => {
      let bg = 'rgba(0, 0, 0, 0)';
      for (let a = el; a; a = a.parentElement) {
        const c = getComputedStyle(a).backgroundColor;
        if (!clear(c)) return c;
      }
      return getComputedStyle(document.documentElement).backgroundColor || bg;
    };

    const walk = (el, depth, parentBg, enclosedParent) => {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      if (el.matches(CONTENT)) return;
      const floating = el.matches(FLOATING) || cs.position === 'fixed';
      const sides = ['Top', 'Right', 'Bottom', 'Left'].filter((s) => px(cs[`border${s}Width`]) > 0 && cs[`border${s}Style`] !== 'none' && !clear(cs[`border${s}Color`]));
      const bg = clear(cs.backgroundColor) ? parentBg : cs.backgroundColor;
      const filled = !clear(cs.backgroundColor) && cs.backgroundColor !== parentBg;
      const shadow = cs.boxShadow && cs.boxShadow !== 'none';
      const selected = el.matches('[aria-pressed="true"],[aria-selected="true"],[aria-checked="true"],[aria-current]:not([aria-current="false"]),:checked,[data-selected],[data-current]');
      // An unavailable control's look is a fact about it (like selection), not a resting decoration.
      const unavailable = el.matches('[aria-disabled="true"],:disabled');
      const field = el.matches(FIELD);
      for (const s of sides) {
        const c = cs[`border${s}Color`];
        if (!meaning.has(c) && !field) note(strokes, `${cs[`border${s}Width`]} ${cs[`border${s}Style`]} ${c}`, el);
      }
      if (filled && !meaning.has(cs.backgroundColor) && !selected) note(fills, cs.backgroundColor, el);
      if (shadow) note(shadows, cs.boxShadow, el);

      // VN2: a one-sided stripe, wider than a hairline, on the inline edge of a box.
      if (sides.length === 1 && /Left|Right/.test(sides[0]) && px(cs[`border${sides[0]}Width`]) >= 2) fail('VN2', { where: name(el), side: sides[0].toLowerCase(), width: px(cs[`border${sides[0]}Width`]) });

      // A status or accent fill is a cue (a badge, the main action), not a container: it doesn't deepen the nesting.
      const cue = filled && meaning.has(cs.backgroundColor) && sides.length === 0;
      const enclosed = !cue && (sides.length > 1 || filled || shadow || (sides.length === 1 && !/Top|Bottom/.test(sides[0])));
      const d = floating ? (enclosed ? 1 : 0) : depth + (enclosed ? 1 : 0);
      if (enclosed && !floating && !field && d > 2) fail('VN3', { where: name(el), depth: d });

      const interactive = el.matches('button,a[href],[role=button],[role=tab],[role=menuitem],[role=option],[role=radio],[data-dl="chip"],[data-dl="tag"]');
      const emphasised = meaning.has(cs.backgroundColor);
      if (enclosed && interactive && !selected && !unavailable && !field && !emphasised && enclosedParent) fail('VN1', { where: name(el), in: enclosedParent, border: sides.length, fill: filled, shadow: !!shadow });

      const groupName = enclosed && !floating && !interactive ? name(el) : floating ? null : enclosedParent;
      for (const c of el.children) walk(c, d, bg, groupName);
    };
    walk(root, 0, surface(root.parentElement ?? root), null);

    if (strokes.size > 3) fail('VN4', { count: strokes.size, values: [...strokes].map(([v, w]) => `${v} (${w})`) });
    if (fills.size > 4) fail('VN5', { count: fills.size, values: [...fills].map(([v, w]) => `${v} (${w})`) });
    if (shadows.size > 2) fail('VN6', { count: shadows.size, values: [...shadows].map(([v, w]) => `${v.slice(0, 60)} (${w})`) });

    return { rows, values: { strokes: strokes.size, fills: fills.size, shadows: shadows.size } };
  };
})();

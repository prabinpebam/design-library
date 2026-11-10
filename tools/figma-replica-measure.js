/**
 * Figma replica measure (Q118, docs/figma-replica.md). Template-specific evaluator tool: it lives in tools/ under a
 * name that is not `*-probe.js`, so it is never copied into the generic core probes (Q118.4). Load it on the Design
 * template's editor (site.html#/app/design/editor) with Playwright's page.addScriptTag({ path }) or the console, then
 * call `window.replicaMeasure()` at rest (nothing hovered or focused). It reads computed styles of each region the
 * tracker's FR rows name and compares them with the reference values in section 1 for the current scheme
 * (light: R11/R5/R4 pixel samples; dark: R10 samples, others pending). Returns
 * { scheme, viewport, rows: { FRn: { pass, got, want } }, fails: [ids] }. A missing region reports pass: false with
 * got: 'missing'. Tolerances: ±1 px for sizes, exact hex for colours (sampled colours are opaque).
 */
(function () {
  const hex = (c) => {
    const ok = String(c).match(/oklab\(([-\d.e]+)\s+([-\d.e]+)\s+([-\d.e]+)(?:\s*\/\s*([\d.]+))?\)/);
    if (ok) {
      const [L, a, b] = ok.slice(1, 4).map(Number);
      const al = ok[4] === undefined ? 1 : Number(ok[4]);
      const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
      const lin = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
      const srgb = lin.map((v) => Math.round(255 * Math.min(1, Math.max(0, v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055))));
      if (al === 0) return 'transparent';
      return '#' + srgb.map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase() + (al < 1 ? `@${al}` : '');
    }
    const m = String(c).match(/rgba?\(([^)]+)\)/);
    if (!m) return c;
    const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    if (a === 0) return 'transparent';
    return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase() + (a < 1 ? `@${a}` : '');
  };
  const box = (el) => el && el.getBoundingClientRect();
  const cs = (el) => el && getComputedStyle(el);
  const near = (a, b, t = 1) => Math.abs(a - b) <= t;
  const opaqueBg = (el) => {
    for (let e = el; e; e = e.parentElement) {
      const c = hex(cs(e).backgroundColor);
      if (c !== 'transparent' && !c.includes('@')) return c;
    }
    return '#FFFFFF';
  };

  window.replicaMeasure = function replicaMeasure() {
    const root = document.querySelector('[data-dl="editor-layout"]');
    const scheme = document.documentElement.getAttribute('data-scheme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const L = scheme === 'dark'
      ? { panel: '#2C2C2C', divider: '#444444', fill: '#383838', canvas: '#1E1E1E', accent: '#0D99FF' }
      : { panel: '#FFFFFF', divider: '#E6E6E6', fill: '#F5F5F5', canvas: '#F5F5F5', accent: '#0D99FF' };
    const rows = {};
    const row = (id, pass, got, want) => { rows[id] = { pass: !!pass, got, want }; };
    if (!root) return { scheme, rows: { FR0: { pass: false, got: 'missing', want: 'editor-layout' } }, fails: ['FR0'] };

    const panels = [...root.querySelectorAll('[data-dl-part="panel"]')].filter((p) => box(p).width > 0 && p.parentElement.closest('[data-dl]') === root);
    const widths = panels.map((p) => Math.round(box(p).width));
    const panelBgs = panels.map((p) => opaqueBg(p));
    row('FR4', panels.length === 2 && widths.every((w) => near(w, 240)) && panelBgs.every((b) => b === L.panel), { widths, bg: panelBgs }, { widths: [240, 240], bg: L.panel });

    const work = root.querySelector('[data-dl="canvas"]') || root.querySelector('[data-dl-part="work"]');
    row('FR17', work && opaqueBg(work) === L.canvas, work ? opaqueBg(work) : 'missing', L.canvas);

    const items = [...root.querySelectorAll('[role="treeitem"]')].filter((e) => box(e).height > 0);
    const rowEl = items[0];
    const rowBox = rowEl && (rowEl.querySelector('[data-dl-part="row"]') || rowEl);
    row('FR6/FR8', rowBox && near(box(rowBox).height, 24) && near(parseFloat(cs(rowBox).borderTopLeftRadius), 5),
      rowBox ? { height: Math.round(box(rowBox).height), radius: cs(rowBox).borderTopLeftRadius, font: cs(rowBox).fontSize } : 'missing',
      { height: 24, radius: '5px', font: '11px (OD1)' });
    // The selected layer (a page row's current state is FR6's #F5F5F5): the last selected tree item.
    const selAll = [...root.querySelectorAll('[role="treeitem"][aria-selected="true"]')];
    const sel = selAll[selAll.length - 1];
    const selRow = sel && (sel.querySelector('[data-dl-part="row"]') || sel);
    row('FR10', selRow && opaqueBg(selRow) === (scheme === 'dark' ? '#2D3953' : '#E5F4FF'), selRow ? opaqueBg(selRow) : 'missing', scheme === 'dark' ? '#2D3953' : '#E5F4FF');

    const bar = root.querySelector('[data-dl="floating-bar"]');
    const tool = bar && (bar.querySelector('[aria-checked="true"], [aria-pressed="true"], input:checked')?.closest('label,button') || null);
    row('FR12', bar && near(box(bar).height, 48) && near(parseFloat(cs(bar).borderTopLeftRadius), 13, 1.5) && hex(cs(bar).backgroundColor) === L.panel,
      bar ? { height: Math.round(box(bar).height), width: Math.round(box(bar).width), radius: cs(bar).borderTopLeftRadius, bg: hex(cs(bar).backgroundColor), shadow: cs(bar).boxShadow !== 'none' } : 'missing',
      { height: 48, radius: '13px', bg: L.panel, shadow: true });
    // A selected segment may draw its fill on ::before (a sliding indicator); read that when the element itself is clear.
    const fillOf = (e) => { const own = hex(cs(e).backgroundColor); return own === 'transparent' ? hex(getComputedStyle(e, '::before').backgroundColor) : own; };
    const track = tool && tool.closest('[data-dl="segmented-control"]');
    row('FR14', tool && near(box(tool).height, 32) && near(box(tool).width, 32) && fillOf(tool) === L.accent && (!track || hex(cs(track).backgroundColor) === 'transparent'),
      tool ? { size: `${Math.round(box(tool).width)}×${Math.round(box(tool).height)}`, bg: fillOf(tool), radius: cs(tool).borderTopLeftRadius, track: track ? hex(cs(track).backgroundColor) : 'none' } : 'missing',
      { size: '32×32', bg: L.accent, radius: '5px', track: 'transparent (tools sit on the bar; only the mode switcher has a track)' });

    const tabs = [...root.querySelectorAll('[role="tab"]')].filter((t) => box(t).height > 0);
    const active = tabs.find((t) => t.getAttribute('aria-selected') === 'true');
    row('FR23', active && near(box(active).height, 24) && opaqueBg(active) === L.fill,
      active ? { height: Math.round(box(active).height), bg: opaqueBg(active), radius: cs(active).borderTopLeftRadius, font: cs(active).fontSize } : 'missing',
      { height: 24, bg: L.fill, radius: '5px', font: '11px (OD1)' });

    const fieldBox = root.querySelector('[data-dl="number-field"] [data-dl-part="box"]');
    const borderless = (e) => parseFloat(cs(e).borderTopWidth) === 0 || hex(cs(e).borderTopColor) === opaqueBg(e) || hex(cs(e).borderTopColor) === 'transparent';
    row('FR30', fieldBox && near(box(fieldBox).height, 24) && opaqueBg(fieldBox) === L.fill && borderless(fieldBox),
      fieldBox ? { height: Math.round(box(fieldBox).height), bg: opaqueBg(fieldBox), border: `${cs(fieldBox).borderTopWidth} ${hex(cs(fieldBox).borderTopColor)}`, radius: cs(fieldBox).borderTopLeftRadius } : 'missing',
      { height: 24, bg: L.fill, border: '0px', radius: '5px' });

    const share = [...root.querySelectorAll('button')].find((b) => /^\s*Share\s*$/.test(b.textContent || ''));
    row('FR3', share && near(box(share).height, 32, 2) && opaqueBg(share) === L.accent,
      share ? { height: Math.round(box(share).height), bg: opaqueBg(share), radius: cs(share).borderTopLeftRadius, font: `${cs(share).fontSize} ${cs(share).fontWeight}` } : 'missing',
      { height: 32, bg: L.accent, radius: '5px', font: '11px 500 (OD1)' });

    const sections = [...root.querySelectorAll('[data-dl="property-section"]')].filter((s) => box(s).height > 0);
    const head = sections[0] && sections[0].querySelector(':scope > [data-dl-part="head"]');
    row('FR28', head && near(box(head).height, 40), head ? { height: Math.round(box(head).height) } : 'missing', { height: 40 });

    // FR9 (OD2, Q119): eye and lock are icon toggles with aria-pressed and a name, taking no row width at rest.
    const toggles = [...root.querySelectorAll('[role="treeitem"] button[aria-pressed]')];
    const named = toggles.filter((b) => (b.getAttribute('aria-label') || b.textContent || '').trim());
    const restWidth = toggles.filter((b) => b.getAttribute('aria-pressed') === 'false' && box(b).width > 0 && cs(b).visibility !== 'hidden' && cs(b).opacity !== '0').length;
    row('FR9', toggles.length > 0 && named.length === toggles.length,
      { toggles: toggles.length, named: named.length, visibleAtRestOff: restWidth },
      { toggles: '> 0 (eye and lock per row)', named: 'all', visibleAtRestOff: '0 unless hovered or focused' });

    // FR31: a 1 px divider between inspector sections.
    const secs = [...root.querySelectorAll('[data-dl="property-section"]')].filter((s) => box(s).height > 0);
    const divided = secs.slice(1).filter((s) => {
      const st = cs(s);
      return (parseFloat(st.borderTopWidth) >= 0.5 && hex(st.borderTopColor) === L.divider) || hex(getComputedStyle(s, '::before').backgroundColor) === L.divider;
    }).length;
    row('FR31', secs.length > 1 && divided === secs.length - 1, { sections: secs.length, divided }, { divided: 'every section after the first', colour: L.divider });

    // FR24: the selection head sits below the Design / Prototype tabs.
    const tablist = [...root.querySelectorAll('[role="tablist"]')].find((t) => /Design/.test(t.textContent || ''));
    const selHead = [...root.querySelectorAll('[data-dl-part="panel"] h2, [data-dl-part="panel"] h3')].find((h) => /button|frame|rectangle|text|ellipse/i.test(h.textContent || '') && box(h).height > 0);
    row('FR24', tablist && selHead && box(selHead).top > box(tablist).bottom,
      tablist && selHead ? { tabsBottom: Math.round(box(tablist).bottom), selectionHeadTop: Math.round(box(selHead).top), text: selHead.textContent.trim().slice(0, 30) } : 'missing',
      'selection head below the tabs');

    const fonts = {};
    root.querySelectorAll('[data-dl-part="panel"] *').forEach((e) => {
      if (![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return;
      const k = cs(e).fontSize;
      fonts[k] = (fonts[k] || 0) + 1;
    });
    row('FR43', Object.keys(fonts).every((k) => k === '11px'), fonts, { '11px': 'all (OD1: owner keeps 14 px meanwhile)' });

    const fails = Object.entries(rows).filter(([, r]) => !r.pass).map(([k]) => k);
    return { scheme, viewport: `${innerWidth}×${innerHeight}`, rows, fails };
  };
})();

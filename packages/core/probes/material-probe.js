/**
 * Materials and elevation probe (owner Q85.2, 2026-11-09; docs/materials.md#part-2-the-checklist). Run in the browser
 * on any template layout or library page at rest: load it with Playwright's page.addScriptTag({ path }) or paste it into
 * the console, then call `window.materialProbe(rootSelector?)` (the page's layout by default). It scores the rows that
 * can be read from the DOM:
 *
 *   ME1 frosted   a backdrop filter only on a chrome or floating surface (data-material), never in the content layer
 *   ME2 nesting   no frosted surface inside another frosted surface (glass on glass, A5)
 *   ME3 shadows   every shadow is a ladder value (shadow.raised or shadow.overlay), and only on a surface that floats
 *                 (data-material floating or modal, or elevation 3 and above); content and chrome have none at rest
 *   ME4 floats    every floating or modal surface carries data-elevation and a shadow
 *   ME5 layers    every stacking z-index is a layer token's value
 *   ME6 fills     a floating surface paints the floating material (frosted or its solid finish), a chrome surface the
 *                 chrome material
 *
 * Returns { rows: { ME1: { pass, findings, count }, … } }.
 */
(function () {
  const LAYOUTS = '[data-dl="site-layout"],[data-dl="app-layout"],[data-dl="chat-layout"],[data-dl="editor-layout"],[data-dl="library-layout"]';
  const name = (el) => {
    const dl = el.getAttribute('data-dl');
    const part = el.getAttribute('data-dl-part');
    const label = el.getAttribute('aria-label');
    const base = dl ? dl : part ? `${el.parentElement?.closest('[data-dl]')?.getAttribute('data-dl') ?? ''}.${part}` : el.tagName.toLowerCase();
    return label ? `${base} “${label.slice(0, 30)}”` : base;
  };
  const resolve = (root, prop, value) => {
    const probe = document.createElement('div');
    probe.style.setProperty(prop, value);
    root.append(probe);
    const v = getComputedStyle(probe).getPropertyValue(prop);
    probe.remove();
    return v;
  };
  const frosted = (cs) => cs.backdropFilter && cs.backdropFilter !== 'none';

  window.materialProbe = function materialProbe(rootSelector) {
    const root = (rootSelector ? document.querySelector(rootSelector) : document.querySelector(LAYOUTS)) ?? document.body;
    const rows = {};
    for (const id of ['ME1', 'ME2', 'ME3', 'ME4', 'ME5', 'ME6']) rows[id] = { pass: true, findings: [], count: 0 };
    const fail = (id, f) => {
      rows[id].pass = false;
      rows[id].count++;
      if (rows[id].findings.length < 8) rows[id].findings.push(f);
    };
    const ladder = new Set(['none', resolve(root, 'box-shadow', 'var(--shadow-raised)'), resolve(root, 'box-shadow', 'var(--shadow-overlay)')]);
    const layers = new Set(['auto', '0', ...['base', 'behind', 'raised', 'sticky', 'popover', 'devtools', 'overlay', 'dialog', 'toast', 'tooltip'].map((l) => resolve(root, 'z-index', `var(--layer-${l})`))]);
    // A component may name its own layer token (c.*.layer) aliasing one of these; the resolved value is what's compared.
    const fills = {
      floating: new Set([resolve(root, 'background-color', 'var(--material-floating-bg, var(--color-bg-raised))'), resolve(root, 'background-color', 'var(--color-bg-raised)')]),
      chrome: new Set([resolve(root, 'background-color', 'var(--material-chrome-bg, var(--color-bg))'), resolve(root, 'background-color', 'var(--color-bg)')]),
    };

    for (const el of [root, ...root.querySelectorAll('*')]) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || !el.getClientRects().length) continue;
      // A canvas's document (a design's frames and shapes) is the person's content, drawn as they made it.
      if (el.closest('[data-dl="canvas"]')) continue;
      const material = el.getAttribute('data-material');
      const elevation = Number(el.getAttribute('data-elevation') ?? 0);
      const floats = material === 'floating' || material === 'modal' || elevation >= 3;

      if (frosted(cs) && material !== 'chrome' && material !== 'floating') fail('ME1', { where: name(el), material });
      if (frosted(cs)) for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
        if (frosted(getComputedStyle(a))) { fail('ME2', { where: name(el), inside: name(a) }); break; }
      }
      const shadow = cs.boxShadow;
      // Focus rings, control insets and outline rings (a thumb's ring that holds it visible on any colour) drawn with
      // box-shadow are marks of the control, not elevation; at rest nothing is focused.
      const inset = /inset/.test(shadow) || /0px 0px 0px \d/.test(shadow);
      if (shadow !== 'none' && !inset) {
        if (!ladder.has(shadow)) fail('ME3', { where: name(el), shadow: shadow.slice(0, 60), note: 'not a ladder value' });
        else if (!floats && !el.closest('[data-material="floating"],[data-material="modal"],[data-elevation="3"],[data-elevation="4"]')) fail('ME3', { where: name(el), shadow: shadow.slice(0, 40), note: 'shadow on a surface that does not float' });
      }
      if ((material === 'floating' || material === 'modal') && (!el.hasAttribute('data-elevation') || shadow === 'none')) fail('ME4', { where: name(el), material, elevation: el.getAttribute('data-elevation'), shadow: shadow === 'none' ? 'none' : 'yes' });
      if (cs.position !== 'static' && !layers.has(cs.zIndex)) fail('ME5', { where: name(el), zIndex: cs.zIndex });
      if (material === 'floating' && !fills.floating.has(cs.backgroundColor)) fail('ME6', { where: name(el), material, fill: cs.backgroundColor });
      if (material === 'chrome' && !fills.chrome.has(cs.backgroundColor)) fail('ME6', { where: name(el), material, fill: cs.backgroundColor });
    }
    return { rows };
  };
})();

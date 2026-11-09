/**
 * Context probe (owner Q97, 2026-11-09; docs/foundation.md#density-content-and-chrome). Run in the browser on any
 * template layout or library page: load with Playwright's page.addScriptTag({ path }) or paste it into the console,
 * then call `window.contextProbe()`. It scores the density rows that can be read from the DOM:
 *
 *   CX1 chrome    every chrome region (a layout's sidebar, panels and details column, an editor's bar) is inside a
 *                 compact density context
 *   CX2 text      inside a compact region, running text and control text are no larger than the small body size
 *                 (headings and a canvas's document excepted)
 *   CX3 corners   inside a compact region, controls' corners are no rounder than the shape's small radius
 *   CX4 content   content regions (a layout's main view, a site page's column) are not compact
 *
 * Returns { rows: { CX1: { pass, findings, count }, … } }.
 */
(function () {
  const px = (v) => parseFloat(v) || 0;
  const name = (el) => {
    const dl = el.getAttribute('data-dl');
    const part = el.getAttribute('data-dl-part');
    const label = el.getAttribute('aria-label');
    const base = dl ? dl : part ? `${el.parentElement?.closest('[data-dl]')?.getAttribute('data-dl') ?? ''}.${part}` : el.tagName.toLowerCase();
    return label ? `${base} “${label.slice(0, 30)}”` : base;
  };
  const shown = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
  };
  const CHROME = [
    "[data-dl='app-layout'] > [data-dl-part='sidebar']",
    "[data-dl='chat-layout'] > [data-dl-part='sidebar']",
    "[data-dl='app-layout'] [data-dl-part='aside']",
    "[data-dl='editor-layout'] > [data-dl-part='bar']",
    "[data-dl='editor-layout'] [data-dl-part='panel']",
  ].join(',');
  const CONTENT = "[data-dl='app-layout'] [data-dl-part='view'], [data-dl='chat-layout'] [data-dl-part='conversation'], [data-dl='site-layout'] > [data-dl-part='main']";

  window.contextProbe = function contextProbe() {
    const rows = {};
    for (const id of ['CX1', 'CX2', 'CX3', 'CX4']) rows[id] = { pass: true, findings: [], count: 0 };
    const fail = (id, f) => {
      rows[id].pass = false;
      rows[id].count++;
      if (rows[id].findings.length < 6) rows[id].findings.push(f);
    };
    const probe = document.createElement('div');
    document.body.append(probe);
    const resolve = (prop, host) => {
      host.append(probe);
      probe.style.cssText = `position:absolute;visibility:hidden;inline-size:var(${prop})`;
      const w = probe.getBoundingClientRect().width;
      return w;
    };
    for (const region of document.querySelectorAll(CHROME)) {
      if (!shown(region)) continue;
      if (region.closest("[data-density='compact']") === null) fail('CX1', { where: name(region) });
    }
    for (const region of document.querySelectorAll(CONTENT)) {
      if (!shown(region)) continue;
      if (region.closest("[data-density='compact']")) fail('CX4', { where: name(region) });
    }
    for (const region of document.querySelectorAll("[data-density='compact']")) {
      if (!shown(region)) continue;
      const small = resolve('--type-body-sm-size', region);
      const radius = resolve('--radius-sm', region);
      for (const el of region.querySelectorAll('p, li, dd, dt, label, input, textarea, button, [role="option"], [role="tab"]')) {
        if (!shown(el) || el.closest('h1,h2,h3,h4,h5,h6,[data-dl="canvas"]')) continue;
        const cs = getComputedStyle(el);
        if (px(cs.fontSize) > small + 0.5 && el.textContent.trim()) fail('CX2', { where: name(el), fontSize: cs.fontSize, small: `${Math.round(small)}px`, text: el.textContent.trim().slice(0, 30) });
      }
      for (const box of region.querySelectorAll("[data-dl='field'] [data-dl-part='box'], [data-dl='button'], [data-dl='select'] [data-dl-part='control'], [data-dl='segmented-control']")) {
        if (!shown(box)) continue;
        const r = px(getComputedStyle(box).borderTopLeftRadius);
        const h = box.getBoundingClientRect().height;
        if (r > radius + 0.5 && r < h / 2 - 0.5) fail('CX3', { where: name(box), radius: `${r}px`, small: `${radius}px` });
      }
    }
    probe.remove();
    return { rows };
  };
})();

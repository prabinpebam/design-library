/**
 * Scroll probe (owner Q96, 2026-11-09; docs/scrolling.md#part-2-the-checklist). Run in the browser on any template
 * layout or library page: paste into the console, or load with Playwright's page.addScriptTag({ path }), then call
 * `window.scrollProbe(rootSelector?)` (the whole document by default). It scores the scroll rows that can be read
 * from the DOM:
 *
 *   SB1 seam     every element that scrolls is a ScrollArea's viewport, or a region whose own controls replace the bar
 *                (`data-scrollbar="none"`); the document itself is the only other scroller
 *   SB2 native   no element but the document draws the browser's bar (a bar that takes width or height from the content)
 *   SB3 bleed    a ScrollArea without its own surface reaches its parent's edges: no padding, border or margin of the
 *                parent's holds the bar off the surface's edge on the end side or the content off the start side
 *   SB4 padding  a scroll box carries no padding of its own (the padding is on the content inside, so it scrolls with it)
 *   SB5 text     a control that scrolls its own text (a TextArea's textarea) takes the library's thin bar in the
 *                library's colours (scroll-area.css), never the browser's default bar
 *
 * Focus rings inside scroll regions are judged by tools/clipping-probe.js (CL rows).
 * Returns { rows: { SB1: { pass, findings, count }, … }, regions } with distances in CSS px.
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
  const scrollable = (cs) => /auto|scroll/.test(cs.overflowX) || /auto|scroll/.test(cs.overflowY);
  const isViewport = (el) => el.getAttribute('data-dl-part') === 'viewport' && el.parentElement?.getAttribute('data-dl') === 'scroll-area';

  window.scrollProbe = function scrollProbe(rootSelector) {
    const root = rootSelector ? document.querySelector(rootSelector) : document.body;
    const rows = {};
    for (const id of ['SB1', 'SB2', 'SB3', 'SB4', 'SB5']) rows[id] = { pass: true, findings: [], count: 0 };
    const fail = (id, f) => {
      rows[id].pass = false;
      rows[id].count++;
      if (rows[id].findings.length < 6) rows[id].findings.push(f);
    };
    const regions = [];
    for (const el of root.querySelectorAll('*')) {
      if (!shown(el)) continue;
      const cs = getComputedStyle(el);
      if (!scrollable(cs)) continue;
      const seam = isViewport(el);
      const barless = el.hasAttribute('data-scrollbar') && el.getAttribute('data-scrollbar') === 'none';
      const overflows = el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1;
      if (el.tagName === 'TEXTAREA') {
        regions.push(`textarea${overflows ? ' overflowing' : ''}`);
        if (cs.scrollbarWidth !== 'thin' || !cs.scrollbarColor || cs.scrollbarColor === 'auto') fail('SB5', { where: name(el.closest('[data-dl]') ?? el), scrollbarWidth: cs.scrollbarWidth, scrollbarColor: cs.scrollbarColor });
        continue;
      }
      regions.push(`${name(seam ? el.parentElement : el)}${seam ? '' : barless ? ' (barless)' : ' (raw)'}${overflows ? ' overflowing' : ''}`);
      // SB1: a raw scroller fails whether or not it overflows today; it draws the browser's bar the moment it does.
      if (!seam && !barless) fail('SB1', { where: name(el), overflowX: cs.overflowX, overflowY: cs.overflowY, overflows });
      // SB2: a native bar takes room from the content (classic scrollbars); overlay bars take none and SB1 still holds.
      const barX = el.offsetHeight - el.clientHeight - px(cs.borderTopWidth) - px(cs.borderBottomWidth);
      const barY = el.offsetWidth - el.clientWidth - px(cs.borderLeftWidth) - px(cs.borderRightWidth);
      if (barX > 1 || barY > 1) fail('SB2', { where: name(el), barWidth: Math.round(Math.max(barX, barY)) });
      // SB4: padding on the scroll box itself.
      if (seam && ['Top', 'Right', 'Bottom', 'Left'].some((s) => px(cs[`padding${s}`]) > 0)) fail('SB4', { where: name(el.parentElement), padding: cs.padding });
      if (!seam && !barless && ['Top', 'Right', 'Bottom', 'Left'].some((s) => px(cs[`padding${s}`]) > 0)) fail('SB4', { where: name(el), padding: cs.padding });
    }
    // SB3: a ScrollArea that fills a region (no surface of its own) reaches the region's edges.
    for (const area of root.querySelectorAll('[data-dl="scroll-area"]')) {
      if (!shown(area) || area.getAttribute('data-surface') === 'sunken') continue;
      const parent = area.parentElement;
      const ps = getComputedStyle(parent);
      if (ps.display === 'contents') continue;
      const a = area.getBoundingClientRect();
      const p = parent.getBoundingClientRect();
      const inner = {
        left: p.left + px(ps.borderLeftWidth) + px(ps.paddingLeft),
        right: p.right - px(ps.borderRightWidth) - px(ps.paddingRight),
        top: p.top + px(ps.borderTopWidth) + px(ps.paddingTop),
        bottom: p.bottom - px(ps.borderBottomWidth) - px(ps.paddingBottom),
      };
      const edge = { left: p.left + px(ps.borderLeftWidth), right: p.right - px(ps.borderRightWidth), bottom: p.bottom - px(ps.borderBottomWidth) };
      // Only a region that fills its parent's width is judged (a ScrollArea placed in flow beside others is content).
      if (a.width < (inner.right - inner.left) - 1) continue;
      // The edge the bar sits on: the inline end for a region that scrolls down, the block end for one that scrolls across.
      const axis = area.getAttribute('data-axis') ?? 'block';
      const rtl = getComputedStyle(area).direction === 'rtl';
      const heldEnd = rtl ? a.left - edge.left : edge.right - a.right;
      const heldBottom = edge.bottom - a.bottom;
      if (axis !== 'inline' && heldEnd > 1) fail('SB3', { where: name(area.getAttribute('data-dl-part') ? area : parent), bar: 'inline end', held: Math.round(heldEnd), parent: name(parent) });
      if (axis !== 'block' && heldBottom > 1 && a.height >= inner.bottom - inner.top - 1) fail('SB3', { where: name(area.getAttribute('data-dl-part') ? area : parent), bar: 'block end', held: Math.round(heldBottom), parent: name(parent) });
    }
    return { rows, regions };
  };
})();

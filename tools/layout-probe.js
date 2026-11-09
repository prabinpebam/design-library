/**
 * Layout probe (owner Q85.2, 2026-11-09; docs/layout.md#part-2-the-checklist). Run in the browser on any template
 * layout or library page: paste into the console, or load with Playwright's page.addScriptTag({ path }), then call
 * `window.layoutProbe(rootSelector?)`. The root is the page's layout (SiteLayout, AppLayout, ChatLayout,
 * EditorLayout, LibraryLayout) by default, so the library's own preview bar isn't judged. It scores the checklist rows
 * that can be read from the DOM at the current window:
 *
 *   LY1 reflow    nothing scrolls the page sideways; nothing reaches past the window unless a scroller of its own holds it
 *   LY2 measure   running text (two lines or more) is no wider than the reading measure (size.measure)
 *   LY3 order     what's drawn follows the source order: no `order`, no reversed flex direction
 *   LY4 sticky    a sticky or fixed bar at the top of a scroller is matched by that scroller's scroll padding, so
 *                 nothing focused or jumped to hides under it (WCAG 2.4.11)
 *   LY5 scrollers no scroller inside another that scrolls the same way (a scroll trap)
 *   LY6 columns   every column of a multi-column Grid is at least size.column-min wide
 *   LY7 regions   one main region; at most one banner and one content-info region at the top level
 *   LY8 priority  the main region is the widest region; under breakpoint.sm it spans the window and starts in the
 *                 first half of it
 *
 * Returns { rows: { LY1: { pass, findings, count }, … }, regions } with distances in CSS px.
 */
(function () {
  const px = (v) => parseFloat(v) || 0;
  const LAYOUTS = '[data-dl="site-layout"],[data-dl="app-layout"],[data-dl="chat-layout"],[data-dl="editor-layout"],[data-dl="library-layout"]';
  const name = (el) => {
    const dl = el.getAttribute('data-dl');
    const part = el.getAttribute('data-dl-part');
    const label = el.getAttribute('aria-label');
    const base = dl ? dl : part ? `${el.parentElement?.closest('[data-dl]')?.getAttribute('data-dl') ?? ''}.${part}` : el.tagName.toLowerCase();
    return label ? `${base} “${label.slice(0, 30)}”` : base;
  };
  const shown = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none';
  };
  // A length token resolved to px in this document (rem follows the root's text size, so it holds at 200 % text).
  const tokenPx = (prop, fallbackRem) => {
    const probe = document.createElement('div');
    probe.style.cssText = `position:absolute;visibility:hidden;inline-size:var(${prop}, ${fallbackRem}rem)`;
    document.body.append(probe);
    const w = probe.getBoundingClientRect().width;
    probe.remove();
    return w;
  };
  const scrolls = (el, axis) => {
    const cs = getComputedStyle(el);
    const o = axis === 'x' ? cs.overflowX : cs.overflowY;
    if (!/auto|scroll/.test(o)) return false;
    return axis === 'x' ? el.scrollWidth > el.clientWidth + 1 : el.scrollHeight > el.clientHeight + 1;
  };
  const clipsX = (el) => /auto|scroll|hidden|clip/.test(getComputedStyle(el).overflowX);

  window.layoutProbe = function layoutProbe(rootSelector) {
    const root = (rootSelector ? document.querySelector(rootSelector) : document.querySelector(LAYOUTS)) ?? document.body;
    const rows = {};
    for (const id of ['LY1', 'LY2', 'LY3', 'LY4', 'LY5', 'LY6', 'LY7', 'LY8']) rows[id] = { pass: true, findings: [], count: 0 };
    const fail = (id, f) => {
      rows[id].pass = false;
      rows[id].count++;
      if (rows[id].findings.length < 6) rows[id].findings.push(f);
    };
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const all = [...root.querySelectorAll('*')].filter(shown);

    // LY1 reflow. The whole page only when the root is the page; otherwise what's inside the root (a preview's own
    // tooling outside it is judged on its own page).
    const page = document.scrollingElement;
    if (root === document.body && page.scrollWidth > page.clientWidth + 1) fail('LY1', { where: 'page', scrollWidth: page.scrollWidth, window: page.clientWidth });
    for (const el of all) {
      const r = el.getBoundingClientRect();
      if (r.right <= vw + 1 && r.left >= -1) continue;
      let held = false;
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) if (clipsX(a)) { held = true; break; }
      if (!held) fail('LY1', { where: name(el), left: Math.round(r.left), right: Math.round(r.right), window: vw });
    }

    // LY2 measure: running text of two lines or more.
    const measure = tokenPx('--size-measure', 42);
    for (const el of all) {
      if (!el.matches('p, li, dd, blockquote, figcaption')) continue;
      if (el.closest('table, [role="grid"], pre, code')) continue;
      // Running text only: an item that lays out blocks of its own (a schedule's slot, a card in a list) is a group.
      if ([...el.children].some((k) => !/inline/.test(getComputedStyle(k).display))) continue;
      const cs = getComputedStyle(el);
      const lh = px(cs.lineHeight) || px(cs.fontSize) * 1.5;
      const r = el.getBoundingClientRect();
      const width = r.width - px(cs.paddingLeft) - px(cs.paddingRight);
      if (r.height >= lh * 1.9 && width > measure + 1) fail('LY2', { where: name(el), width: Math.round(width), measure: Math.round(measure), text: el.textContent.trim().slice(0, 40) });
    }

    // LY3 order.
    for (const el of all) {
      const cs = getComputedStyle(el);
      if (cs.order !== '0') fail('LY3', { where: name(el), order: cs.order });
      if (/flex/.test(cs.display) && /reverse/.test(cs.flexDirection) && el.children.length > 1) fail('LY3', { where: name(el), flexDirection: cs.flexDirection });
      if (/flex/.test(cs.display) && cs.flexWrap === 'wrap-reverse') fail('LY3', { where: name(el), flexWrap: cs.flexWrap });
    }

    // LY4 sticky and fixed bars at the top of a scroller.
    for (const el of all) {
      const cs = getComputedStyle(el);
      if (cs.position !== 'sticky' && cs.position !== 'fixed') continue;
      if (cs.top === 'auto') continue;
      const r = el.getBoundingClientRect();
      if (r.height < 8 || r.width < vw * 0.5) continue;
      let scroller = document.scrollingElement;
      if (cs.position === 'sticky') for (let a = el.parentElement; a; a = a.parentElement) if (/auto|scroll/.test(getComputedStyle(a).overflowY)) { scroller = a; break; }
      const sp = px(getComputedStyle(scroller).scrollPaddingTop);
      const need = r.height + px(cs.top);
      if (sp + 1 < need) fail('LY4', { where: name(el), height: Math.round(need), scrollPadding: Math.round(sp), scroller: scroller === document.scrollingElement ? 'page' : name(scroller) });
    }

    // LY5 scroll traps. A text field scrolling its own words is the field, not a region (it scrolls only while focused).
    for (const el of all) {
      if (el.matches('textarea, input, select')) continue;
      for (const axis of ['x', 'y']) {
        if (!scrolls(el, axis)) continue;
        for (let a = el.parentElement; a && root.contains(a); a = a.parentElement) {
          if (scrolls(a, axis)) { fail('LY5', { where: name(el), inside: name(a), axis }); break; }
        }
      }
    }

    // LY6 grid columns.
    const colMin = tokenPx('--size-column-min', 16);
    for (const el of root.querySelectorAll('[data-dl="grid"]')) {
      if (!shown(el)) continue;
      const tracks = getComputedStyle(el).gridTemplateColumns.split(' ').map(px).filter((w) => w > 0);
      if (tracks.length > 1 && tracks.some((w) => w + 1 < colMin)) fail('LY6', { where: name(el), tracks: tracks.map(Math.round), min: Math.round(colMin) });
    }

    // LY7 regions.
    const mains = [...root.querySelectorAll('main, [role="main"]')].filter(shown);
    if (mains.length !== 1) fail('LY7', { mains: mains.length });
    const top = (sel) => [...root.querySelectorAll(sel)].filter((el) => shown(el) && !el.parentElement.closest('main, article, aside, nav, section, [role="main"]'));
    if (top('header, [role="banner"]').filter((el) => el.matches('[role="banner"]') || !el.closest('[role="main"], main')).length > 1) fail('LY7', { banners: top('header, [role="banner"]').length });
    if (top('footer, [role="contentinfo"]').length > 1) fail('LY7', { footers: top('footer, [role="contentinfo"]').length });

    // LY8 priority.
    const regions = [...root.querySelectorAll('main, aside, nav, [role="complementary"], [role="navigation"]')].filter((el) => shown(el) && getComputedStyle(el).position !== 'fixed' && getComputedStyle(el).position !== 'absolute' && !el.parentElement.closest('main'));
    const main = mains[0];
    if (main) {
      const mw = main.getBoundingClientRect().width;
      for (const r of regions) if (r !== main && r.getBoundingClientRect().width > mw + 1 && !r.contains(main)) fail('LY8', { where: name(r), width: Math.round(r.getBoundingClientRect().width), main: Math.round(mw) });
      const sm = tokenPx('--breakpoint-sm', 40);
      if (vw < sm) {
        const mr = main.getBoundingClientRect();
        if (mw < vw * 0.85) fail('LY8', { where: 'main', width: Math.round(mw), window: vw });
        if (mr.top + window.scrollY > vh / 2) fail('LY8', { where: 'main', top: Math.round(mr.top + window.scrollY), window: vh });
      }
    }

    return { rows, regions: regions.map((r) => `${name(r)} ${Math.round(r.getBoundingClientRect().width)}`) };
  };
})();

/**
 * Clipping probe (owner F13b, 2026-11-07; Q85.2, 2026-11-09; docs/clipping.md#part-2-the-checklist). Run in the
 * browser on any template layout or library page: load it with Playwright's page.addScriptTag({ path }) or paste it
 * into the console, then call `window.clippingProbe(root?)` (the whole document by default). It scores the rows that
 * can be read from the DOM:
 *
 *   CL1 rings      no focus ring is cut by a clipping box the focusable element sits inside (rings are measured as
 *                  --size-focus-width + --size-focus-offset, unless the element draws its ring inside itself)
 *   CL2 shadows    no shadow is cut by a clipping box its element sits inside
 *   CL3 text       no text is cut by a clipping box without an ellipsis (a hidden or clipped axis, not a scroll axis)
 *   CL4 one step   every truncated text (an ellipsis or a line clamp that is cutting now) has its full text one step
 *                  away: it's inside something that opens, links or focuses, or has a title or a description
 *
 * Content scrolled out of a box's view isn't a finding; an element is judged only against the clipping box it sits
 * inside. Crops that are the point (StackedBar's outer rounding) and a canvas's document (the person's content) are
 * skipped. Returns { rows: { CL1: { pass, findings, count }, … } }.
 */
(function () {
  const ALLOWED = new Set(['stacked-bar']);
  const FOCUSABLE = 'a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"]), [role="switch"], [role="option"]';
  const STEP = 'a[href], button, summary, select, [role="option"], [role="treeitem"], [role="tab"], [role="menuitem"], [role="row"], [tabindex]:not([tabindex="-1"]), [title], [aria-describedby], [data-dl="tooltip"]';
  const px = (v) => parseFloat(v) || 0;
  const r1 = (n) => Math.round(n * 10) / 10;

  function describe(el) {
    const dl = el.closest('[data-dl]');
    const self = el.dataset.dl ? `[data-dl=${el.dataset.dl}]` : el.dataset.dlPart ? `[data-dl-part=${el.dataset.dlPart}]` : '';
    return `${el.tagName.toLowerCase()}${self}${dl && dl !== el ? ` in ${dl.dataset.dl}` : ''}`;
  }

  function shadowExtent(shadow) {
    if (!shadow || shadow === 'none') return null;
    const e = { top: 0, right: 0, bottom: 0, left: 0 };
    for (const part of shadow.split(/,(?![^(]*\))/)) {
      if (/\binset\b/.test(part)) continue;
      const n = (part.replace(/(rgba?|color|oklch|lab|lch|hsla?)\([^)]*\)/g, '').match(/-?[\d.]+px/g) || []).map(px);
      const [x = 0, y = 0, blur = 0, spread = 0] = n;
      e.top = Math.max(e.top, blur + spread - y);
      e.bottom = Math.max(e.bottom, blur + spread + y);
      e.left = Math.max(e.left, blur + spread - x);
      e.right = Math.max(e.right, blur + spread + x);
    }
    return e;
  }

  /** How a box clips on each axis: 'clip' (hidden, clip, clip-path, paint containment), 'scroll' or null. */
  function clipAxes(el) {
    const s = getComputedStyle(el);
    const all = s.clipPath !== 'none' || /paint|content|strict/.test(s.contain);
    const axis = (o) => (all || o === 'hidden' || o === 'clip' ? 'clip' : o === 'auto' || o === 'scroll' ? 'scroll' : null);
    const x = axis(s.overflowX), y = axis(s.overflowY);
    return x || y ? { x, y } : null;
  }

  function innerBox(a) {
    const b = a.getBoundingClientRect();
    const s = getComputedStyle(a);
    const top = b.top + px(s.borderTopWidth), left = b.left + px(s.borderLeftWidth);
    return { top, left, bottom: top + a.clientHeight, right: left + a.clientWidth };
  }

  const tiny = (r) => r.width <= 1.5 || r.height <= 1.5;
  /** Visually hidden on purpose: a 1 px box, or a crop to nothing (clip-path: inset(50%), clip: rect(0 0 0 0)). */
  const hiddenText = (a) => {
    if (tiny(a.getBoundingClientRect())) return true;
    const s = getComputedStyle(a);
    return /inset\(50%/.test(s.clipPath) || /rect\(0px,? 0px,? 0px,? 0px\)/.test(s.clip);
  };
  const inside = (r, box) => r.top >= box.top - 0.5 && r.left >= box.left - 0.5 && r.bottom <= box.bottom + 0.5 && r.right <= box.right + 0.5;
  const nearestClip = (el, self) => {
    for (let a = self ? el : el.parentElement; a && a !== document.body && a !== document.documentElement; a = a.parentElement) {
      const axes = clipAxes(a);
      if (axes) return { a, axes };
    }
    return null;
  };

  /** Focus-visible rules: an element draws its ring inside itself when a matching rule sets a negative outline offset or an inset ring. */
  let focusRules = null;
  function ringInside(el) {
    if (!focusRules) {
      focusRules = [];
      const walk = (rules) => {
        for (const rule of rules) {
          if (rule.cssRules && !rule.selectorText) { walk(rule.cssRules); continue; }
          if (!rule.selectorText || !rule.selectorText.includes(':focus-visible')) continue;
          const off = rule.style.getPropertyValue('outline-offset');
          const inner = /^\s*-|-1\s*\*/.test(off) || /\binset\b/.test(rule.style.getPropertyValue('box-shadow'));
          for (const sel of rule.selectorText.split(/,(?![^(]*\))/)) {
            if (!sel.includes(':focus-visible')) continue;
            const base = sel.replace(/:focus-visible/g, '').trim() || '*';
            focusRules.push({ base, inner, sets: !!off || inner });
          }
        }
      };
      for (const sheet of document.styleSheets) { try { walk(sheet.cssRules); } catch { /* cross-origin */ } }
    }
    let inner = false;
    for (const f of focusRules) { try { if (f.sets && el.matches(f.base)) inner = f.inner; } catch { /* selector the engine can't match */ } }
    return inner;
  }

  window.clippingProbe = function (root = document.body) {
    const rows = {};
    for (const id of ['CL1', 'CL2', 'CL3', 'CL4']) rows[id] = { pass: true, findings: [], count: 0 };
    const fail = (id, f) => { rows[id].pass = false; if (rows[id].findings.length < 20) rows[id].findings.push(f); rows[id].count++; };
    const rootStyle = getComputedStyle(document.documentElement);
    const ring = px(rootStyle.getPropertyValue('--size-focus-width')) + px(rootStyle.getPropertyValue('--size-focus-offset'));

    for (const el of root.querySelectorAll('*')) {
      if (el.closest('[data-dl="canvas"] [data-dl-part="inside"]')) continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden') continue;

      // CL1, CL2: rings and shadows against the box the element sits inside.
      const focus = el.matches(FOCUSABLE) && px(cs.outlineOffset) >= 0 && !hiddenText(el) && cs.opacity !== '0' && !ringInside(el) ? ring : 0;
      const shadow = shadowExtent(cs.boxShadow);
      const reach = { top: Math.max(focus, shadow?.top || 0), right: Math.max(focus, shadow?.right || 0), bottom: Math.max(focus, shadow?.bottom || 0), left: Math.max(focus, shadow?.left || 0) };
      if (reach.top || reach.right || reach.bottom || reach.left) {
        const c = nearestClip(el, false);
        if (c && !ALLOWED.has(c.a.dataset.dl) && !hiddenText(c.a)) {
          const box = innerBox(c.a);
          if (inside(r, box)) {
            const cut = { top: box.top - (r.top - reach.top), left: box.left - (r.left - reach.left), bottom: r.bottom + reach.bottom - box.bottom, right: r.right + reach.right - box.right };
            // A box edge on the window's edge cuts nothing the window wouldn't: not a clipping decision.
            const W = document.documentElement.clientWidth, H = window.innerHeight;
            const atWindow = { top: box.top <= 0.5, left: box.left <= 0.5, bottom: box.bottom >= H - 0.5, right: box.right >= W - 0.5 };
            for (const [side, by] of Object.entries(cut)) {
              if (by <= 0.5 || atWindow[side]) continue;
              const ringCut = focus && (!shadow || reach[side] === ring);
              fail(ringCut ? 'CL1' : 'CL2', { element: describe(el), ancestor: describe(c.a), side, cutBy: r1(by) });
            }
          }
        }
      }

      // CL3, CL4: the element's own text against the box that clips it.
      const texts = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
      if (!texts.length) continue;
      const c = nearestClip(el, true);
      if (!c || hiddenText(c.a) || c.a.closest('[aria-hidden="true"]')) continue;
      const as = getComputedStyle(c.a);
      const truncates = as.textOverflow === 'ellipsis' || (as.webkitLineClamp && as.webkitLineClamp !== 'none');
      if (truncates) {
        const cutting = c.a.scrollWidth > c.a.clientWidth + 1 || c.a.scrollHeight > c.a.clientHeight + 1;
        if (cutting && !c.a.closest(STEP) && !c.a.querySelector(STEP)) fail('CL4', { text: c.a.textContent.trim().slice(0, 40), element: describe(c.a) });
        continue;
      }
      const range = document.createRange();
      const box = innerBox(c.a);
      const slack = 0.2 * px(cs.fontSize);
      for (const t of texts) {
        range.selectNodeContents(t);
        const tr = range.getBoundingClientRect();
        if (!tr.width) continue;
        const across = c.axes.x === 'clip' ? Math.max(box.left - tr.left, tr.right - box.right) : 0;
        const down = c.axes.y === 'clip' ? Math.max(box.top - tr.top, tr.bottom - box.bottom) - slack : 0;
        // Only text that is partly inside: text wholly outside is scrolled or slid away, not cut.
        const partly = tr.right > box.left && tr.left < box.right && tr.bottom > box.top && tr.top < box.bottom;
        if (partly && (across > 1 || down > 1)) {
          fail('CL3', { text: t.textContent.trim().slice(0, 40), element: describe(el), ancestor: describe(c.a), cutBy: r1(Math.max(across, down)) });
          break;
        }
      }
    }
    return { rows };
  };
})();

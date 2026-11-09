/**
 * Clipping probe (owner F13b, 2026-11-07; docs/foundation.md#clipping). Run in the browser on a library page:
 * paste into the console, or load with Playwright's page.addScriptTag({ path }), then call
 * `window.clippingProbe()`. It lists every shadow, outline or focus ring that a clipping ancestor cuts while the
 * element itself is inside that ancestor's visible box (so content scrolled out of view isn't a finding).
 *
 * Focusable elements are measured with the focus ring they would draw (--size-focus-width + --size-focus-offset);
 * elements with a box-shadow with its full extent. Ancestors on the allow-list (data-dl values below) are skipped,
 * because their crop is the point. Returns [{ element, ancestor, side, cutBy }] with distances in CSS px.
 */
(function () {
  const ALLOWED = new Set(['stacked-bar']);
  const FOCUSABLE = 'a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"]), [role="switch"], [role="option"]';
  const px = (v) => parseFloat(v) || 0;

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

  function clipsOf(el) {
    const s = getComputedStyle(el);
    return s.overflowX !== 'visible' || s.overflowY !== 'visible' || s.clipPath !== 'none' || /paint|content|strict/.test(s.contain);
  }

  window.clippingProbe = function (root = document.querySelector('main') || document.body) {
    const root_ = getComputedStyle(document.documentElement);
    const ring = px(root_.getPropertyValue('--size-focus-width')) + px(root_.getPropertyValue('--size-focus-offset'));
    const findings = [];
    for (const el of root.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const focus = el.matches(FOCUSABLE) && getComputedStyle(el).outlineOffset !== `-${ring / 2}px` ? { top: ring, right: ring, bottom: ring, left: ring } : null;
      const shadow = shadowExtent(getComputedStyle(el).boxShadow);
      const reach = { top: Math.max(focus?.top || 0, shadow?.top || 0), right: Math.max(focus?.right || 0, shadow?.right || 0), bottom: Math.max(focus?.bottom || 0, shadow?.bottom || 0), left: Math.max(focus?.left || 0, shadow?.left || 0) };
      if (!reach.top && !reach.right && !reach.bottom && !reach.left) continue;
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        if (!clipsOf(a)) continue;
        if (ALLOWED.has(a.dataset.dl)) break;
        const b = a.getBoundingClientRect();
        const s = getComputedStyle(a);
        const box = { top: b.top + px(s.borderTopWidth), left: b.left + px(s.borderLeftWidth), bottom: b.top + px(s.borderTopWidth) + a.clientHeight, right: b.left + px(s.borderLeftWidth) + a.clientWidth };
        const inside = r.top >= box.top - 0.5 && r.left >= box.left - 0.5 && r.bottom <= box.bottom + 0.5 && r.right <= box.right + 0.5;
        if (inside) {
          const cut = { top: box.top - (r.top - reach.top), left: box.left - (r.left - reach.left), bottom: r.bottom + reach.bottom - box.bottom, right: r.right + reach.right - box.right };
          for (const [side, by] of Object.entries(cut)) if (by > 0.5) findings.push({ element: describe(el), ancestor: describe(a), side, cutBy: Math.round(by * 10) / 10, what: focus && (!shadow || reach[side] === ring) ? 'focus ring' : 'shadow' });
        }
        break;
      }
    }
    return findings;
  };

  function describe(el) {
    const dl = el.closest('[data-dl]');
    return `${el.tagName.toLowerCase()}${el.dataset.dl ? `[data-dl=${el.dataset.dl}]` : el.dataset.dlPart ? `[data-dl-part=${el.dataset.dlPart}]` : ''}${dl && dl !== el ? ` in ${dl.dataset.dl}` : ''}`;
  }
})();

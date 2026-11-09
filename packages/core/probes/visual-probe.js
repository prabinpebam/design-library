/**
 * Visual representation probe (owner Q85.2, 2026-11-09; docs/visual-representation.md#part-2-the-checklist). Run in
 * the browser on any template layout or library page: load it with Playwright's page.addScriptTag({ path }) or paste
 * it into the console, then call `window.visualProbe(root?)` (the whole document by default). It scores the rows that
 * can be read from the DOM:
 *
 *   VR1 alternatives  every picture and every drawn graphic has a text alternative or is hidden as decoration
 *   VR2 meaning       an alternative says what the picture shows or means, not the medium or a file name
 *   VR3 icon words    every control that shows only an icon has a name (its word, said and shown as a tooltip)
 *   VR4 not colour    every part-to-whole bar has its parts named in words beside their colours
 *   VR5 segments      inner segments of a stacked bar are square; only the whole bar's ends round
 *   VR6 room          every picture reserves its box before it loads (a ratio or its width and height)
 *   VR7 media         nothing plays with sound by itself; a moving picture that starts by itself can be paused
 *
 * Returns { rows: { VR1: { pass, findings, count }, … } }.
 */
(function () {
  const name = (el) => {
    const dl = el.getAttribute('data-dl');
    const part = el.getAttribute('data-dl-part');
    const base = dl ? dl : part ? `${el.parentElement?.closest('[data-dl]')?.getAttribute('data-dl') ?? ''}.${part}` : el.tagName.toLowerCase();
    const where = el.closest('[data-dl]')?.getAttribute('data-dl');
    return where && where !== dl ? `${base} in ${where}` : base;
  };
  const shown = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
  };
  const hidden = (el) => !!el.closest('[aria-hidden="true"], [hidden]');
  const labelled = (el) => {
    if ((el.getAttribute('aria-label') || '').trim()) return true;
    const by = el.getAttribute('aria-labelledby');
    return !!by && by.split(/\s+/).some((id) => (document.getElementById(id)?.textContent || '').trim());
  };
  const MEDIUM = /^(an? )?(image|picture|photo|photograph|graphic|icon|screenshot|illustration|img)( of\b|$)/i;
  const FILE = /\.(png|jpe?g|webp|gif|svg|avif)$/i;

  /** Whether a style rule gives the element its height or ratio, so it holds its box before the picture arrives. */
  let sizeRules = null;
  function sizedByCss(el) {
    if (!sizeRules) {
      sizeRules = [];
      const walk = (rules) => {
        for (const rule of rules) {
          if (rule.cssRules && !rule.selectorText) { walk(rule.cssRules); continue; }
          if (!rule.selectorText) continue;
          const s = rule.style;
          const v = ['block-size', 'height', 'aspect-ratio'].map((p) => s.getPropertyValue(p)).find((x) => x && x !== 'auto');
          if (v) sizeRules.push(rule.selectorText);
        }
      };
      for (const sheet of document.styleSheets) { try { walk(sheet.cssRules); } catch { /* cross-origin */ } }
    }
    return sizeRules.some((sel) => { try { return el.matches(sel); } catch { return false; } });
  }

  window.visualProbe = function (root = document.body) {
    const rows = {};
    for (const id of ['VR1', 'VR2', 'VR3', 'VR4', 'VR5', 'VR6', 'VR7']) rows[id] = { pass: true, findings: [], count: 0 };
    const fail = (id, f) => { rows[id].pass = false; if (rows[id].findings.length < 20) rows[id].findings.push(f); rows[id].count++; };
    const all = (sel) => [...root.querySelectorAll(sel)].filter((el) => !el.closest('[data-dl="canvas"] [data-dl-part="inside"]'));

    // VR1, VR2, VR6: pictures.
    for (const img of all('img')) {
      if (hidden(img)) continue;
      if (!img.hasAttribute('alt')) fail('VR1', { where: name(img), src: (img.getAttribute('src') || '').split('/').pop() });
      const alt = (img.getAttribute('alt') || '').trim();
      if (alt && (MEDIUM.test(alt) || FILE.test(alt))) fail('VR2', { where: name(img), alt: alt.slice(0, 60) });
      if (shown(img)) {
        const cs = getComputedStyle(img);
        const sized = (img.hasAttribute('width') && img.hasAttribute('height')) || cs.aspectRatio !== 'auto' || cs.position === 'absolute' || cs.position === 'fixed' || sizedByCss(img) || img.closest('[style*="aspect-ratio"], [data-ratio]');
        const boxed = img.parentElement && getComputedStyle(img.parentElement).aspectRatio !== 'auto';
        if (!sized && !boxed) fail('VR6', { where: name(img), src: (img.getAttribute('src') || '').split('/').pop() });
      }
    }
    for (const el of all('[role="img"]')) {
      if (hidden(el) || !shown(el)) continue;
      if (!labelled(el)) fail('VR1', { where: name(el), note: 'role="img" with no name' });
      const label = (el.getAttribute('aria-label') || '').trim();
      if (label && MEDIUM.test(label)) fail('VR2', { where: name(el), alt: label.slice(0, 60) });
    }
    for (const svg of all('svg')) {
      if (hidden(svg) || !shown(svg) || svg.getAttribute('role') === 'img' || svg.closest('[role="img"]')) continue;
      fail('VR1', { where: name(svg), note: 'a drawn graphic neither named nor hidden' });
    }

    // VR3: icon-only controls have a name.
    for (const c of all('button, a[href], [role="button"], [role="tab"], [role="menuitem"], [role="radio"], [role="switch"]')) {
      if (hidden(c) || !shown(c)) continue;
      if ((c.textContent || '').trim()) continue;
      if (!c.querySelector('svg, img, [data-dl="icon"]')) continue;
      const imgName = [...c.querySelectorAll('img[alt]')].some((i) => i.alt.trim());
      if (!labelled(c) && !c.getAttribute('title') && !imgName) fail('VR3', { where: name(c) });
    }

    // VR4, VR5: part-to-whole bars.
    for (const bar of all('[data-dl="stacked-bar"]')) {
      if (!shown(bar)) continue;
      const legend = bar.querySelector('[data-dl-part="legend"]');
      const nearby = /\d\s*%/.test(bar.parentElement?.textContent || '');
      if (!(legend && shown(legend)) && !nearby) fail('VR4', { where: name(bar), note: 'parts told apart by colour alone' });
      const segs = [...bar.querySelectorAll('[data-dl-part="bar"] > *, :scope > [data-status]')];
      for (const s of segs) {
        const cs = getComputedStyle(s);
        if ([cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomLeftRadius, cs.borderBottomRightRadius].some((r) => parseFloat(r) > 0)) { fail('VR5', { where: name(bar), note: 'a rounded inner segment' }); break; }
      }
    }

    // VR7: media.
    for (const m of all('video, audio')) {
      if (!m.autoplay && !m.hasAttribute('autoplay')) continue;
      if (!m.muted) fail('VR7', { where: name(m), note: 'plays with sound by itself' });
      const scope = m.closest('[data-dl]') || m.parentElement;
      if (!m.controls && !scope?.querySelector('button')) fail('VR7', { where: name(m), note: 'moves by itself with no pause' });
    }
    return { rows };
  };
})();

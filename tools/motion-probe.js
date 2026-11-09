/**
 * Motion probe (Q65 MV2, MV5, MV7; docs/motion.md "Verification"). An in-page check, not a test suite: run it on a
 * library or template page while something moves (paste into the console, or load with Playwright's
 * page.addScriptTag({ path })), then call `window.motionProbe({ places })` with `places` from
 * packages/core/motion/zero-latency.json (the same file `npm run check:motion` reads). It reads what is running now
 * and returns `{ running, findings }`, each finding `{ rule, element, detail }`:
 *
 * - MV2 `zero-latency`: an animation or transition running on a property a zero-latency place forbids, on an element
 *   matched by one of that place's selectors (found in the page's own style sheets). Without `places`, skipped.
 * - MV5 `reduced-motion`: under reduced motion (the media query or `data-motion="reduce"`), anything moving: a
 *   transform, translate, scale or size changing between keyframes, or a running view transition. Fades are fine.
 * - MV7 `leaving-layer`: a leaving layer (`[data-leaving]`) that isn't both `inert` and `aria-hidden`; and focus on the
 *   page body while a morph (`dl-morph`) runs.
 *
 * Not covered here: MV3 (reversal mid-way) and MV4 (long frames, layout shift) need timed sampling; MV1 and MV8 are
 * reviews. Call it during a change (a key press, a click) as well as at rest: at rest nothing should be running.
 */
(function () {
  const MOVES = /^(transform|translate|scale|rotate|inset.*|left|right|top|bottom|width|height|inline-size|block-size|min-.*|max-.*)$/;
  const META = new Set(['offset', 'computedOffset', 'easing', 'composite']);
  const kebab = (p) => p.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());

  function propertiesOf(animation) {
    if (typeof CSSTransition !== 'undefined' && animation instanceof CSSTransition) return [animation.transitionProperty];
    const frames = animation.effect?.getKeyframes?.() ?? [];
    const props = new Set();
    for (const f of frames) for (const k of Object.keys(f)) if (!META.has(k)) props.add(kebab(k));
    return [...props];
  }

  function changes(animation, property) {
    if (typeof CSSTransition !== 'undefined' && animation instanceof CSSTransition) return true;
    const key = property.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const values = (animation.effect?.getKeyframes?.() ?? []).map((f) => f[key]).filter((v) => v !== undefined);
    return new Set(values).size > 1;
  }

  function styleRules(list = document.styleSheets, out = []) {
    for (const sheet of list) {
      let rules;
      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }
      for (const rule of rules) {
        if (rule.selectorText) out.push(rule.selectorText);
        if (rule.cssRules) styleRules([rule], out);
      }
    }
    return out;
  }

  const describe = (el) => (el ? `${el.tagName.toLowerCase()}${el.dataset?.dl ? `[data-dl=${el.dataset.dl}]` : ''}${el.dataset?.dlPart ? `[data-dl-part=${el.dataset.dlPart}]` : ''}` : '(none)');

  window.motionProbe = function ({ places = [] } = {}) {
    const running = document.getAnimations().filter((a) => a.playState === 'running' || a.playState === 'paused');
    const findings = [];

    // MV2: the selectors each zero-latency rule names, as written in this page's style sheets.
    const selectors = styleRules();
    const zero = [];
    for (const place of places) for (const rule of place.rules ?? []) {
      const re = new RegExp(rule.selector);
      for (const s of selectors) for (const part of s.split(/,(?![^(]*\))/)) if (re.test(part)) zero.push({ id: place.id, selector: part.trim(), properties: rule.properties });
    }
    for (const a of running) {
      const el = a.effect?.target;
      if (!el) continue;
      for (const p of propertiesOf(a)) for (const z of zero) {
        let hit = false;
        try {
          hit = z.properties.includes(p) && el.matches(z.selector);
        } catch {
          continue;
        }
        if (hit) findings.push({ rule: 'MV2 zero-latency', element: describe(el), detail: `${z.id}: "${p}" animates on ${z.selector}` });
      }
    }

    // MV5: nothing moves under reduced motion.
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'reduce';
    if (reduce) {
      for (const a of running) for (const p of propertiesOf(a)) if (MOVES.test(p) && changes(a, p)) findings.push({ rule: 'MV5 reduced-motion', element: describe(a.effect?.target), detail: `"${p}" moves` });
      if (document.activeViewTransition) findings.push({ rule: 'MV5 reduced-motion', element: 'document', detail: 'a view transition is running' });
    }

    // MV7: leaving layers can't be reached; focus is never dropped mid-morph.
    for (const el of document.querySelectorAll('[data-leaving]')) {
      if (!el.inert || el.getAttribute('aria-hidden') !== 'true') findings.push({ rule: 'MV7 leaving-layer', element: describe(el), detail: `inert ${el.inert}, aria-hidden ${el.getAttribute('aria-hidden')}` });
    }
    if (running.some((a) => a.id === 'dl-morph') && document.activeElement === document.body) findings.push({ rule: 'MV7 leaving-layer', element: 'body', detail: 'focus is on the page body while a morph runs' });

    return { running: running.length, findings };
  };
})();

/**
 * UI states probe (owner Q85.2, 2026-11-09; docs/ui-states.md#part-2-the-checklist). Run in the browser on any
 * template layout or library page: load it with Playwright's page.addScriptTag({ path }) or paste it into the console,
 * then call `window.uiStatesProbe(root?)` (the whole document by default). It scores the rows that can be read from
 * the DOM, at rest or with a state shown:
 *
 *   US1 locked     a control that is busy (aria-busy) keeps focus: locked with aria-disabled, never `disabled`
 *   US2 loading    every skeleton is aria-hidden and sits in a busy region (aria-busy) or is a still silhouette in an
 *                  empty state; no skeleton shimmers forever
 *   US3 empty      every empty state has a title and a reason or an action, fills its wrapper's width and isn't shorter
 *                  than the wrapper's minimum height, and nothing in it moves
 *   US4 recover    every error (an error Alert, an ErrorSummary, a role="alert" with words) offers a way on: a link or
 *                  button inside it or in the section or form it belongs to; every invalid field names its error
 *   US5 pills      notification pills: at most three visible, errors and warnings stay until closed (manual), each
 *                  message at most three lines
 *   US6 progress   every progress bar visible on its own has a name; a known one has a value inside its range
 *
 * Returns { rows: { US1: { pass, findings, count }, … } }.
 */
(function () {
  const CONTROL = 'button, input, select, textarea, [role="switch"], [role="checkbox"], [role="radio"], [role="slider"], [role="combobox"], [role="option"], [role="menuitem"], [role="tab"]';
  const name = (el) => {
    const dl = el.getAttribute('data-dl');
    const part = el.getAttribute('data-dl-part');
    const label = el.getAttribute('aria-label') || (el.textContent || '').trim();
    const base = dl ? dl : part ? `${el.parentElement?.closest('[data-dl]')?.getAttribute('data-dl') ?? ''}.${part}` : el.tagName.toLowerCase();
    return label ? `${base} “${label.slice(0, 40)}”` : base;
  };
  const shown = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
  };
  const words = (el) => (el?.textContent || '').trim().length > 0;
  const accessibleName = (el) => {
    if (el.getAttribute('aria-label')) return true;
    const by = el.getAttribute('aria-labelledby');
    return !!by && by.split(/\s+/).some((id) => words(document.getElementById(id)));
  };
  const lines = (el) => {
    const lh = parseFloat(getComputedStyle(el).lineHeight) || parseFloat(getComputedStyle(el).fontSize) * 1.4;
    return Math.round(el.getBoundingClientRect().height / lh);
  };

  window.uiStatesProbe = function (root = document.body) {
    const rows = {};
    for (const id of ['US1', 'US2', 'US3', 'US4', 'US5', 'US6']) rows[id] = { pass: true, findings: [], count: 0 };
    const fail = (id, f) => { rows[id].pass = false; if (rows[id].findings.length < 20) rows[id].findings.push(f); rows[id].count++; };
    const all = (sel) => [...root.querySelectorAll(sel)];

    // US1: a busy control is the same focusable element, locked with aria-disabled. A combobox's busy can mean its list
    // is loading, which locks nothing.
    for (const el of all('[aria-busy="true"]')) {
      if (!el.matches(CONTROL)) continue;
      if (el.disabled || el.hasAttribute('disabled')) fail('US1', { where: name(el), note: 'disabled while busy: focus is lost' });
      else if (el.getAttribute('aria-disabled') !== 'true' && !el.matches('[role="combobox"]')) fail('US1', { where: name(el), note: 'busy but not locked (aria-disabled)' });
    }

    // US2: skeletons are hidden from assistive technology, live in a busy region, and stop.
    for (const el of all('[data-dl="skeleton"]')) {
      if (!shown(el)) continue;
      const still = el.hasAttribute('data-still');
      if (el.getAttribute('aria-hidden') !== 'true' && !el.closest('[aria-hidden="true"]')) fail('US2', { where: name(el), note: 'not aria-hidden' });
      if (still) {
        // A still silhouette is decoration: no further rule.
      } else {
        if (!el.closest('[aria-busy="true"]')) fail('US2', { where: name(el), note: 'shimmering outside a busy region' });
        if (el.closest('[data-dl="empty-state"]')) fail('US2', { where: name(el), note: 'a silhouette in an empty state shimmers' });
      }
      for (const n of [el, ...el.querySelectorAll('*')]) {
        if (getComputedStyle(n).animationIterationCount.split(',').some((c) => c.trim() === 'infinite')) { fail('US2', { where: name(el), note: 'shimmers forever' }); break; }
      }
    }

    // US3: empty states say why and what to do, in the content's own wrapper, and hold still.
    for (const el of all('[data-dl="empty-state"]')) {
      if (!shown(el)) continue;
      const title = el.querySelector('h1, h2, h3, h4, h5, h6') || el.querySelector('[data-dl-part="words"] > :first-child');
      if (!words(title)) fail('US3', { where: name(el), note: 'no title' });
      const rest = [...el.querySelectorAll('p, [data-dl-part="reason"], [data-dl-part="body"], a[href], button')].filter((n) => !title?.contains(n) && (words(n) || n.matches('a, button')));
      if (!rest.length) fail('US3', { where: name(el), note: 'says neither why nor what to do' });
      const parent = el.parentElement;
      if (parent) {
        const ps = getComputedStyle(parent);
        const inner = parent.clientWidth - parseFloat(ps.paddingLeft) - parseFloat(ps.paddingRight);
        const flowRow = ps.display.includes('flex') && !ps.flexDirection.startsWith('column');
        const er = el.getBoundingClientRect();
        if (!flowRow && er.width < inner - 1) fail('US3', { where: name(el), note: `narrower than its wrapper (${Math.round(er.width)} of ${Math.round(inner)} px)` });
        const min = parseFloat(ps.minHeight) || 0;
        if (min && er.height + parseFloat(ps.paddingTop) + parseFloat(ps.paddingBottom) < min - 1) fail('US3', { where: name(el), note: `shorter than its wrapper's minimum (${Math.round(er.height)} of ${Math.round(min)} px)` });
      }
      for (const n of el.querySelectorAll('*')) {
        if (getComputedStyle(n).animationName !== 'none' && getComputedStyle(n).animationPlayState === 'running' && !n.closest('button')) { fail('US3', { where: name(el), note: `moves (${name(n)})` }); break; }
      }
    }

    // US4: every error offers a way on; every invalid field names its error.
    const errors = [...all('[data-dl="alert"][data-tone="error"], [data-dl="error-summary"]'), ...all('[role="alert"]').filter((n) => words(n) && !n.closest('[data-dl="notifications"], [data-dl="announcer"]'))];
    for (const el of new Set(errors)) {
      if (!shown(el)) continue;
      // A form's error names the fields at fault on the fields themselves (aria-invalid), not only above them; an error
      // about the whole submission (a declined card, a wrong password) says so with data-error-scope="form".
      const form = el.closest('form, [data-dl="section"], section');
      if (form && el.matches('[data-dl="alert"]:not([data-error-scope="form"])') && form.querySelector('input:not([type="hidden"]), textarea, [role="combobox"]') && !form.querySelector('[aria-invalid="true"]')) fail('US4', { where: name(el), note: 'a form error with no field marked invalid' });
      if (el.querySelector('a[href], button:not([aria-disabled="true"])')) continue;
      const home = el.closest('form, [data-dl="section"], section, [role="dialog"], [data-dl="card"]');
      if (home && home.querySelector('a[href], button:not([aria-disabled="true"]), input[type="submit"]')) continue;
      fail('US4', { where: name(el), note: 'an error with no recovery action' });
    }
    for (const el of all('[aria-invalid="true"]')) {
      if (!shown(el) && !el.closest('[data-dl]')) continue;
      // A choice in a group is described by its group (the fieldset or radiogroup names the error once).
      const holders = [el, el.closest('fieldset, [role="radiogroup"], [role="group"]')].filter(Boolean);
      const by = holders.flatMap((h) => (h.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean)).map((id) => document.getElementById(id));
      if (!by.some(words)) fail('US4', { where: name(el), note: 'invalid with no error message linked (aria-describedby)' });
      if (el.disabled || el.readOnly) fail('US4', { where: name(el), note: 'invalid but locked: the person can’t fix it' });
    }

    // US5: notification pills.
    const pills = [...document.querySelectorAll('[data-dl="notifications"] [data-dl-part="pill"]:not([data-leaving])')].filter(shown);
    if (pills.length > 3) fail('US5', { where: 'notifications', note: `${pills.length} pills visible (at most three)` });
    for (const p of pills) {
      const tone = p.getAttribute('data-tone');
      if ((tone === 'error' || tone === 'warning') && p.getAttribute('data-dismiss') !== 'manual') fail('US5', { where: name(p), note: `${tone} auto-dismisses` });
      const msg = p.querySelector('[data-dl-part="message"]');
      if (msg && lines(msg) > 3) fail('US5', { where: name(p), note: `${lines(msg)} lines` });
    }

    // US6: progress bars.
    for (const el of all('[role="progressbar"]')) {
      if (!shown(el) || el.closest('[aria-busy="true"]') && el.closest(CONTROL)) continue;
      if (!accessibleName(el)) fail('US6', { where: name(el), note: 'no name' });
      const now = el.getAttribute('aria-valuenow');
      if (now !== null) {
        const v = +now, lo = +(el.getAttribute('aria-valuemin') ?? 0), hi = +(el.getAttribute('aria-valuemax') ?? 100);
        if (!(v >= lo && v <= hi)) fail('US6', { where: name(el), note: `value ${now} outside ${lo}–${hi}` });
      }
    }
    return { rows };
  };
})();

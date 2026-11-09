/**
 * Spacing probe (owner Q85, 2026-11-09; docs/spacing.md#part-2-the-checklist). Run in the browser on any page:
 * paste into the console, or load with Playwright's page.addScriptTag({ path }), then call
 * `window.spacingProbe(rootSelector?)`. It measures the vertical rhythm of the page's content (the main region by
 * default) and scores the checklist rows that can be read from the DOM:
 *
 *   SC1 scale     every gap and padding inside the root is a step of the space scale
 *   SC2 heading   the space above a heading (its head: eyebrow, heading, intro) is at least twice the space below it
 *   SC3 nesting   a group's own gaps are smaller than the gap around it: at least 1.5 times (pass), 2 times (ideal)
 *   SC4 enclosure inside an enclosure (border or fill, with padding), no gap between children exceeds the inset
 *   SC5 monotone  no stack of three or more parts of different kinds (heading, text, block) sits at one equal gap
 *   SC6 levels    the page's stacking gaps form at least three distinct levels
 *   SC7 edges     nothing scrolls sideways; content keeps the page margin from the window's edges
 *   SC8 margins   no component (data-dl) carries an outer block margin
 *   SC14 page     the same invariant at the page's top level: page content apart from header and footer ≥ its own gaps
 *   SC16 columns  no short text wraps while the row it sits in has the room to hold it on one line (owner Q98: the
 *                 columns come from this group's content); judged on the whole layout, chrome included
 *
 * Frames (owner Q94): outside, a `data-frame` element is one unit measured from its outer edge; inside, its content is
 * the root of a tree of its own, judged only against itself. The frame's room between the two is judged by FR rows.
 *
 * Returns { rows: { SC1: { pass, findings }, … }, levels, stacks } with distances in CSS px.
 */
(function () {
  const SCALE = [0, 2, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128];
  const ATOM = 'h1,h2,h3,h4,h5,h6,p,img,picture,video,button,input,select,textarea,label,legend,dl,table,ul,ol,blockquote,figure,svg,[aria-hidden="true"],[data-frame],[data-dl="card"],[data-dl="statistic"],[data-dl="button"],[data-dl="avatar"],[data-dl="persona"]';
  const HEAD_PART = new Set(['heading', 'head']);
  const px = (v) => parseFloat(v) || 0;
  const name = (el) => {
    const dl = el.getAttribute('data-dl');
    const part = el.getAttribute('data-dl-part');
    return dl ? dl : part ? `${el.parentElement?.closest('[data-dl]')?.getAttribute('data-dl') ?? ''}.${part}` : el.tagName.toLowerCase();
  };
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.height > 0 && r.width > 0 && cs.visibility !== 'hidden' && cs.position !== 'absolute' && cs.position !== 'fixed';
  };
  // A visible boundary (border or fill). Its padding may sit on itself or one level down (spacing rule 14), so the
  // boundary alone separates what's inside from what's outside.
  const bounded = (el) => {
    const cs = getComputedStyle(el);
    const border = ['Top', 'Right', 'Bottom', 'Left'].some((s) => px(cs[`border${s}Width`]) > 0 && cs[`border${s}Style`] !== 'none' && !/rgba\(0, 0, 0, 0\)|transparent/.test(cs[`border${s}Color`]));
    const fill = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent';
    return border || fill;
  };
  // Where one tree ends and another starts (owner Q94): a visible boundary, or a frame. Outside, a frame is one unit
  // measured from its outer edge; inside, its content is the root of a tree of its own.
  const boundary = (el) => bounded(el) || el.hasAttribute('data-frame');
  const enclosed = (el) => {
    const cs = getComputedStyle(el);
    return bounded(el) && px(cs.paddingTop) + px(cs.paddingLeft) > 0;
  };
  const kind = (el) => {
    if (/^H[1-6]$/.test(el.tagName) || HEAD_PART.has(el.getAttribute('data-dl-part') ?? '')) return 'heading';
    if (el.tagName === 'P') return 'text';
    return 'block';
  };

  /** A stacking container: its visible in-flow children sit in rows, one under another. */
  function rowsOf(el) {
    const kids = [...el.children].filter(visible);
    if (kids.length < 2) return null;
    const rows = [];
    for (const k of kids) {
      const r = k.getBoundingClientRect();
      const last = rows[rows.length - 1];
      if (last && r.top < last.bottom - 1) {
        last.bottom = Math.max(last.bottom, r.bottom);
        last.els.push(k);
      } else rows.push({ top: r.top, bottom: r.bottom, els: [k] });
    }
    if (rows.length < 2) return null;
    const gaps = rows.slice(1).map((r, i) => Math.round(r.top - rows[i].bottom));
    return { el, rows, gaps };
  }

  window.spacingProbe = function (rootSelector) {
    const root = document.querySelector(rootSelector ?? 'main, [data-dl-part="main"]') ?? document.body;
    const rows = Object.fromEntries(['SC1', 'SC2', 'SC3', 'SC4', 'SC5', 'SC6', 'SC7', 'SC8', 'SC14', 'FR1', 'FR2', 'FR3', 'FR4', 'FR5', 'FR6', 'FR7', 'FR8', 'FR9', 'FR11', 'FR12', 'FR14', 'FR15', 'FR16', 'FR17', 'SC16'].map((id) => [id, { pass: true, findings: [] }]));
    const fail = (id, finding, severity = 'S2') => {
      rows[id].findings.push({ severity, ...finding });
      if (severity !== 'S4') rows[id].pass = false;
    };
    const all = [root, ...root.querySelectorAll('*')].filter(visible);

    // SC1 and SC8: values on the scale, no outer margins on components.
    for (const el of all) {
      const cs = getComputedStyle(el);
      for (const prop of ['rowGap', 'columnGap', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight']) {
        const v = px(cs[prop]);
        if (cs[prop] === 'normal' || v === 0) continue;
        // A control's padding may give back its border's width so its outer size stays on the scale.
        const side = prop.replace('padding', '');
        const border = prop.startsWith('padding') ? px(cs[`border${side}Width`]) : 0;
        const onScale = (n) => SCALE.includes(Math.round(n));
        // A control's own metrics (a switch's track, a field's box) and an indent set from data (a tree's depth) are the
        // component's geometry, not the layout's rhythm.
        const own = el.closest('button,input,select,textarea,[role="button"],[role="switch"],[data-dl="switch"],[data-dl="checkbox"],[data-dl="radio"],[data-dl="slider"],[data-dl="segmented-control"],[data-dl="avatar-group"],[data-dl="code-block"]');
        const indent = prop.startsWith('padding') && /Left|Right/.test(prop) && /--(depth|level|indent)/.test((el.getAttribute('style') ?? '') + (el.parentElement?.getAttribute('style') ?? ''));
        // A frame's space is fluid by design (Q88); the framing rows FR1–FR11 judge it.
        if (el.getAttribute('data-dl') === 'frame' && prop.startsWith('padding')) continue;
        // An optical lift (spacing rule 7: measure to what the eye sees) lines a first line of text up with a control's
        // centre; it's alignment, not a gap. Components mark it with `--dl-optical: lift`.
        if (prop === 'paddingTop' && cs.getPropertyValue('--dl-optical').trim() === 'lift') continue;
        if (!onScale(v) && !onScale(v + border) && !own && !indent) fail('SC1', { where: name(el), prop, value: Math.round(v * 10) / 10 }, 'S3');
      }
      if (el.hasAttribute('data-dl') && el !== root && (px(cs.marginTop) !== 0 || px(cs.marginBottom) !== 0)) fail('SC8', { where: name(el), marginBlock: [px(cs.marginTop), px(cs.marginBottom)] }, 'S3');
    }

    // Stacks: every container whose children sit in two or more rows.
    const stacks = all.map(rowsOf).filter(Boolean);
    const stackOf = new Map(stacks.map((s) => [s.el, s]));
    const levels = new Set();
    for (const s of stacks) for (const g of s.gaps) if (g > 0) levels.add(g);

    // SC3 nesting and SC4 enclosure.
    for (const s of stacks) {
      // A tree shows depth by indent and keeps one row rhythm at every depth (spacing rule 4: nesting never escalates
      // space), so its nested rows aren't groups to space apart.
      if (s.el.closest('[role="tree"]')) continue;
      const box = enclosed(s.el) ? getComputedStyle(s.el) : null;
      if (box) {
        const inset = Math.min(px(box.paddingTop), px(box.paddingLeft));
        for (const g of s.gaps) if (g > inset + 0.5) fail('SC4', { where: name(s.el), gap: g, inset });
      }
      let up = s.el.parentElement;
      while (up && up !== root.parentElement && !stackOf.has(up)) {
        if (boundary(up)) break;
        up = up.parentElement;
      }
      // A group's head belongs to it: a stack that is only [head, content] isn't the group's neighbours, so the gap
      // around the group is measured one stack further out (SC2 judges the head's own space). A tab bar is its panel's
      // head: it names what the panel shows.
      const headOnly = (st) => st && st.rows.length === 2 && st.rows[0].els.some((e) => HEAD_PART.has(e.getAttribute('data-dl-part') ?? '') || /^H[1-6]$/.test(e.tagName) || e.matches('[role="tablist"]') || !!e.querySelector('[role="tablist"]'));
      while (up && stackOf.has(up) && headOnly(stackOf.get(up)) && !boundary(up)) {
        let next = up.parentElement;
        while (next && next !== root.parentElement && !stackOf.has(next)) {
          if (boundary(next)) break;
          next = next.parentElement;
        }
        if (!next || !stackOf.has(next)) break;
        up = next;
      }
      const outer = up && stackOf.get(up);
      if (!outer || boundary(s.el) || (up && boundary(up))) continue;
      const inner = Math.max(...s.gaps);
      const around = Math.min(...outer.gaps);
      const membersEnclosed = s.rows.every((r) => r.els.every(bounded));
      if (inner <= 0 || around <= 0) continue;
      if (membersEnclosed ? inner >= around : around < 1.5 * inner) fail('SC3', { where: name(s.el), inside: inner, around: around, in: name(outer.el) });
      else if (!membersEnclosed && around < 2 * inner) fail('SC3', { where: name(s.el), inside: inner, around, in: name(outer.el), note: 'between 1.5× and 2×' }, 'S4');
    }

    // SC5 monotone: only a compound's own parts (data-dl or data-dl-part, not a generic Stack), and only where a heading,
    // and a block (actions, media, a list) share one gap: two levels of the anatomy at one distance.
    for (const s of stacks) {
      if (s.rows.length < 3 || s.el.getAttribute('data-dl') === 'stack' || !(s.el.hasAttribute('data-dl') || s.el.hasAttribute('data-dl-part'))) continue;
      const kinds = new Set(s.rows.map((r) => kind(r.els[0])));
      const equal = s.gaps.every((g) => Math.abs(g - s.gaps[0]) <= 1);
      if (equal && kinds.has('heading') && kinds.has('block')) fail('SC5', { where: name(s.el), gaps: s.gaps, kinds: s.rows.map((r) => kind(r.els[0])) });
    }

    // SC2 headings: the head's space above vs below, measured between the nearest atoms that overlap it sideways. What the
    // eye sees counts (spacing rule 7): words, media, controls, a legend, a drawn shape and a visible enclosure's edge.
    const atoms = [...new Set([...root.querySelectorAll(ATOM), ...all.filter((el) => el !== root && bounded(el))])].filter((el) => visible(el) && !el.parentElement.closest('[data-dl="card"],[data-dl="statistic"],[data-dl="button"],button,a,label,dl,table,ul,ol,blockquote,figure,svg,picture'));
    const boxes = atoms.map((el) => ({ el, r: el.getBoundingClientRect() }));
    const overlap = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1;
    const seen = new Set();
    for (const h of root.querySelectorAll('h1,h2,h3,h4,h5,h6')) {
      // An accordion's headings are its rows' triggers, separated by the accordion's own rules, not heads of flow.
      if (!visible(h) || h.closest('[data-dl="card"],[data-dl="statistic"],[data-dl="accordion"]')) continue;
      // A heading's head is the outermost head part within two levels (eyebrow, heading and intro; a key and a title).
      let head = h;
      for (let a = h.parentElement, i = 0; a && i < 2; a = a.parentElement, i++) if (HEAD_PART.has(a.getAttribute('data-dl-part') ?? '')) head = a;
      if (seen.has(head)) continue;
      seen.add(head);
      const r = head.getBoundingClientRect();
      // Proximity is judged inside the heading's own surface: a scroll region or an enclosure is a separate surface from
      // the bar above it, which its boundary (not space) separates.
      let surface = head.parentElement;
      while (surface && surface !== root && !boundary(surface) && !/auto|scroll/.test(getComputedStyle(surface).overflowY)) surface = surface.parentElement;
      surface = surface ?? root;
      const before = boxes.filter((b) => surface.contains(b.el) && !head.contains(b.el) && !b.el.contains(head) && b.r.bottom <= r.top + 1 && overlap(b.r, r));
      const after = boxes.filter((b) => surface.contains(b.el) && !head.contains(b.el) && !b.el.contains(head) && b.r.top >= r.bottom - 1 && overlap(b.r, r));
      if (!before.length || !after.length) continue;
      const above = Math.round(r.top - Math.max(...before.map((b) => b.r.bottom)));
      const below = Math.round(Math.min(...after.map((b) => b.r.top)) - r.bottom);
      // A hairline (a table's or an accordion's border) may sit in the measured space: 2 px of slack.
      if (above < 2 * below - 2) fail('SC2', { where: `${name(head)} “${h.textContent.trim().slice(0, 40)}”`, above, below });
    }

    // SC6 levels: judged on a page with two or more headings that head flow content (a card's or a statistic's title names
    // an item, not a level of the page; a page of one list has no hierarchy to show).
    const headings = [...root.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter((h) => visible(h) && !h.closest('[data-dl="card"],[data-dl="statistic"]')).length;
    if (headings >= 2 && levels.size < 3) fail('SC6', { levels: [...levels].sort((a, b) => a - b), headings });

    // SC7 edges.
    const doc = document.documentElement;
    if (doc.scrollWidth > doc.clientWidth + 1) fail('SC7', { sideways: doc.scrollWidth - doc.clientWidth }, 'S1');
    const margin = px(getComputedStyle(doc).getPropertyValue('--space-margin-page')) * px(getComputedStyle(doc).fontSize || '16');
    const edge = Math.min(margin || 16, 8);
    const scrolledSideways = (el) => {
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) if (/auto|scroll/.test(getComputedStyle(a).overflowX)) return true;
      return false;
    };
    for (const b of boxes) {
      if (b.el.closest('[data-bleed]') || scrolledSideways(b.el) || (!b.el.matches(ATOM) && boundary(b.el))) continue;
      if (b.r.left < edge - 0.5 || doc.clientWidth - b.r.right < edge - 0.5) {
        if (b.r.width < doc.clientWidth - 1) fail('SC7', { where: name(b.el), left: Math.round(b.r.left), right: Math.round(doc.clientWidth - b.r.right) }, 'S1');
      }
    }

    // SC14 (Q92, Q93): the proximity invariant at the page's top level. The page's groups are header · page content ·
    // footer, so the page content sits from the header and the footer at least as far as the largest gap between its
    // own units (a frame is one unit; space inside it is ignored).
    const main = document.querySelector('main');
    const col = main?.querySelector(':scope > [data-dl-part="column"]') ?? main;
    if (col) {
      const units = [...col.children].filter(visible).map((el) => el.getBoundingClientRect());
      const between = units.slice(1).map((r, n) => Math.round(r.top - units[n].bottom));
      const largest = Math.max(0, ...between);
      const bar = document.querySelector('[data-dl="site-layout"] > [data-dl-part="header"]')?.getBoundingClientRect();
      const foot = document.querySelector('[data-dl="site-layout"] > [data-dl="footer"]')?.getBoundingClientRect();
      if (units.length && bar) {
        const top = Math.round(units[0].top - bar.bottom);
        if (top < largest - 1) fail('SC14', { edge: 'title bar', space: top, largestInside: largest });
      }
      if (units.length && foot && foot.top >= units[units.length - 1].bottom - 1) {
        const bottom = Math.round(foot.top - units[units.length - 1].bottom);
        if (bottom < largest - 1) fail('SC14', { edge: 'footer', space: bottom, largestInside: largest });
      }
    }

    const frames = framing(fail);
    columns(fail);

    return {
      rows: Object.fromEntries(Object.entries(rows).map(([id, r]) => [id, { pass: r.pass, findings: r.findings.slice(0, 12), count: r.findings.length }])),
      levels: [...levels].sort((a, b) => a - b),
      stacks: stacks.slice(0, 60).map((s) => `${name(s.el)} ${s.gaps.join(',')}`),
      frames,
    };
  };

  // SC16 (owner Q98): no text wraps while the row it sits in has the room to hold it on one line. A row is a grid or
  // flex container laying cells side by side; its room is its content width less every cell's content and the gaps
  // between cells. Room left over while a cell's short text breaks means the columns came from somewhere other than
  // this group's content (a shared or fixed track). Judged on the whole layout, chrome included: inspectors and panels
  // are where it shows. Running text held to the reading measure is skipped (it wraps on purpose).
  function columns(fail) {
    const scope = document.querySelector('[data-dl="site-layout"],[data-dl="app-layout"],[data-dl="chat-layout"],[data-dl="editor-layout"],[data-dl="library-layout"]') ?? document.body;
    const contentWidth = (el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      const rs = [...range.getClientRects()].filter((r) => r.width > 0);
      if (!rs.length) return 0;
      return Math.max(...rs.map((r) => r.right)) - Math.min(...rs.map((r) => r.left));
    };
    const seen = new Set();
    for (const el of scope.querySelectorAll('*')) {
      const text = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).map((n) => n.textContent.trim()).join(' ');
      if (!text || text.length > 60 || !visible(el)) continue;
      const lines = new Map();
      for (const node of el.childNodes) {
        if (node.nodeType !== 3 || !node.textContent.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const r of range.getClientRects()) if (r.width > 0) lines.set(Math.round(r.top / 4), (lines.get(Math.round(r.top / 4)) ?? 0) + r.width);
      }
      if (lines.size < 2) continue;
      // The cell: the ancestor (at most four up) whose parent lays its children side by side.
      let cell = el;
      let row = null;
      let measured = false;
      for (let i = 0; i < 5 && cell && cell !== scope; i++) {
        if (getComputedStyle(cell).maxInlineSize !== 'none') { measured = true; break; }
        const p = cell.parentElement;
        if (!p) break;
        const pcs = getComputedStyle(p);
        const sideBySide = [...p.children].filter(visible).length > 1 && ((pcs.display.includes('flex') && !pcs.flexDirection.startsWith('column')) || (pcs.display.includes('grid') && pcs.gridTemplateColumns.trim().split(/\s+/).length > 1));
        if (sideBySide) { row = p; break; }
        cell = p;
      }
      if (!row || measured || seen.has(row)) continue;
      // A set of like units (cards, tiles, fields in equal columns) shares its tracks on purpose: that's alignment
      // within its own context, not a column imposed from elsewhere.
      const tracks = getComputedStyle(row).gridTemplateColumns.split(/\s+/).map(px).filter((v) => v > 0);
      if (tracks.length > 1 && Math.max(...tracks) - Math.min(...tracks) <= 1) continue;
      const rr = row.getBoundingClientRect();
      const rcs = getComputedStyle(row);
      const cr = cell.getBoundingClientRect();
      const kids = [...row.children].filter(visible).filter((k) => {
        const r = k.getBoundingClientRect();
        return r.top < cr.bottom && r.bottom > cr.top;
      });
      const inner = rr.width - px(rcs.paddingLeft) - px(rcs.paddingRight) - px(rcs.borderLeftWidth) - px(rcs.borderRightWidth);
      // A subgrid row's `normal` gap is its parent grid's gap (what lays its cells out), not zero.
      const columnGap = rcs.columnGap === 'normal' && rcs.gridTemplateColumns.startsWith('subgrid') ? getComputedStyle(row.parentElement).columnGap : rcs.columnGap;
      const gap = px(columnGap) * (kids.length - 1);
      // In a subgrid row the tracks are shared with the rows around it (alignment within this context, Q98): a
      // sibling's column needs the widest content of that column across the rows, no more.
      const shared = rcs.gridTemplateColumns.startsWith('subgrid');
      const columnNeeds = (k) => {
        const i = [...row.children].indexOf(k);
        return Math.max(...[...row.parentElement.children].map((r) => (r.children[i] ? contentWidth(r.children[i]) : 0)));
      };
      const used = kids.reduce((sum, k) => sum + (k === cell ? contentWidth(cell) : shared ? columnNeeds(k) : Math.max(contentWidth(k), /^(INPUT|SELECT|TEXTAREA|IMG|SVG|CANVAS|VIDEO)$/.test(k.tagName) ? k.getBoundingClientRect().width : 0)), 0);
      const room = inner - gap - used;
      const widest = Math.max(...lines.values());
      const needed = [...lines.values()].reduce((a, b) => a + b, 0) - widest + 8;
      if (room >= needed) {
        seen.add(row);
        fail('SC16', { where: `${name(row)} › “${text.slice(0, 30)}”`, lines: lines.size, needed: Math.round(needed), room: Math.round(room) });
      }
    }
  }

  // A token's value in CSS px, resolved by the browser (rem, calc and aliases included).
  function measure(prop, value) {
    const probe = document.createElement('div');
    probe.style.cssText = `position:absolute;visibility:hidden;${prop}:${value}`;
    document.body.append(probe);
    const v = px(getComputedStyle(probe)[prop === 'font-size' ? 'fontSize' : 'height']);
    probe.remove();
    return v;
  }

  // Framing rows (docs/spacing.md#framing-rows), measured on the page as first loaded (scroll 0) at the
  // current window size; a sweep runs them at the five FR12 sizes. FR10 and FR13 are judged by eye: `frames` lists each
  // frame's parts for them.
  function framing(fail) {
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const y = window.scrollY;
    const page = measure('height', 'var(--space-stack-page)');
    const peek = measure('height', 'var(--c-frame-peek, 3rem)');
    const measureMax = measure('height', 'var(--size-measure, 42rem)');
    const h3 = measure('font-size', 'var(--type-heading-3-size)');
    const header = document.querySelector('[data-dl="site-layout"] > [data-dl-part="header"]');
    const headH = header ? header.getBoundingClientRect().height : 0;
    const footer = document.querySelector('[data-dl="site-layout"] > [data-dl="footer"]');
    const doc = (r) => ({ top: r.top + y, bottom: r.bottom + y, left: r.left, right: r.right, height: r.height, width: r.width });
    const contentOf = (f) => f.querySelector(':scope > [data-dl-part="content"]') ?? f;
    const rectOf = (el) => doc((el.hasAttribute('data-frame') ? contentOf(el) : el).getBoundingClientRect());
    const frames = [...document.querySelectorAll('[data-frame]')].filter(visible);
    const where = (f) => `${f.getAttribute('data-frame')}/${f.getAttribute('data-frame-mode') ?? 'peek'} “${(f.querySelector('h1,h2,h3,blockquote,p')?.textContent ?? '').trim().slice(0, 32)}”`;

    const stages = frames.filter((f) => f.getAttribute('data-frame') === 'stage');
    if (stages.length > 1) fail('FR9', { stages: stages.length });

    // FR16 context: a peek stage holds more than a title and an intro (a picture or an action); a task or reference
    // page's heading is never framed away from its content (Q91).
    for (const f of stages) {
      if (f.getAttribute('data-frame-mode') === 'distraction-free') continue;
      if (!contentOf(f).querySelector('img,picture,video,[data-dl="button"],button,a[href]')) fail('FR16', { where: where(f), holds: 'only a title and an intro' });
    }
    // FR17 the task first: with frames at the top of the page, the first band of the page's own content still shows.
    const column = document.querySelector('[data-dl="site-layout"] > [data-dl-part="main"] > [data-dl-part="column"]');
    if (column && vh >= 700) {
      const bands = [...column.children].filter(visible);
      const lead = [];
      for (const b of bands) {
        if (b.hasAttribute('data-frame') || b.getAttribute('data-dl') === 'breadcrumbs') lead.push(b);
        else break;
      }
      const task = bands[lead.length];
      const framedLead = lead.filter((b) => b.hasAttribute('data-frame') && b.getAttribute('data-frame-mode') !== 'distraction-free');
      // Judged on what the frames add: their own space, not content taller than the window (a frame can't shrink it).
      const added = framedLead.reduce((sum, b) => sum + b.getBoundingClientRect().height - contentOf(b).getBoundingClientRect().height, 0);
      const at = task ? task.getBoundingClientRect().top + y : 0;
      if (framedLead.length && task && at > vh - peek + 1 && at - added <= vh - peek + 1) fail('FR17', { where: where(framedLead[0]), taskStartsAt: Math.round(at), frameSpace: Math.round(added), window: vh });
    }

    for (const f of frames) {
      const kind = f.getAttribute('data-frame');
      const mode = f.getAttribute('data-frame-mode') ?? 'peek';
      const cs = getComputedStyle(f);
      const fr = doc(f.getBoundingClientRect());
      const cr = rectOf(f);
      // The neighbouring bands: the nearest siblings that draw something (a hidden anchor marker is no band).
      const sibling = (el, step) => {
        let s = el[step];
        while (s && !visible(s) && getComputedStyle(s).display === 'none') s = s[step];
        return s && visible(s) ? s : null;
      };
      const prev = sibling(f, 'previousElementSibling');
      const next = sibling(f, 'nextElementSibling');
      const space = px(cs.paddingTop) + px(cs.paddingBottom);
      // FR1 isolation: content to the nearest content above and below.
      if (prev && cr.top - rectOf(prev).bottom < 1.5 * page - 1) fail('FR1', { where: where(f), above: Math.round(cr.top - rectOf(prev).bottom), needs: 1.5 * page });
      if (next && rectOf(next).top - cr.bottom < 1.5 * page - 1) fail('FR1', { where: where(f), below: Math.round(rectOf(next).top - cr.bottom), needs: 1.5 * page });
      // FR2 a peek stage on a wide, tall window: at least half the window, and the next band shows.
      const asStage = kind === 'stage' && mode === 'peek' && vw > 640;
      if (asStage && vh >= 700 && fr.top < vh) {
        if (fr.height < 0.5 * vh - 1) fail('FR2', { where: where(f), height: Math.round(fr.height), window: vh });
        const after = next ? rectOf(next).top : footer ? doc(footer.getBoundingClientRect()).top : Infinity;
        if (after > vh - peek + 1) fail('FR2', { where: where(f), nextShows: Math.round(vh - after), needs: peek });
      }
      // FR3 measure: framed words within the reading measure (size.measure) and inside the column.
      const column = f.closest('[data-dl-part="column"]')?.getBoundingClientRect();
      for (const t of contentOf(f).querySelectorAll('h1,h2,h3,p,blockquote')) {
        if (!visible(t) || t.closest('[data-dl="button"],a,figcaption')) continue;
        const r = t.getBoundingClientRect();
        if (r.width > measureMax + 1) fail('FR3', { where: where(f), text: t.tagName.toLowerCase(), width: Math.round(r.width), measure: measureMax });
        if (column && (r.left < column.left - 1 || r.right > column.right + 1)) fail('FR3', { where: where(f), text: t.tagName.toLowerCase(), outside: true });
      }
      // FR4 no box: no border or shadow; a ground is painted edge to edge.
      if (['Top', 'Right', 'Bottom', 'Left'].some((s) => px(cs[`border${s}Width`]) > 0) || cs.boxShadow !== 'none') fail('FR4', { where: where(f) });
      if (f.hasAttribute('data-ground') && (cs.borderImageSource === 'none' || !/\d/.test(cs.borderImageOutset))) fail('FR4', { where: where(f), ground: 'not edge to edge' });
      // FR5 centred content is centred in the column.
      const content = contentOf(f);
      const centred = [...content.querySelectorAll('*')].some((el) => getComputedStyle(el).textAlign === 'center');
      if (centred && column) {
        const block = content.firstElementChild?.getBoundingClientRect() ?? content.getBoundingClientRect();
        const l = block.left - column.left - px(getComputedStyle(f.closest('[data-dl-part="column"]')).paddingLeft);
        const r = column.right - block.right - px(getComputedStyle(f.closest('[data-dl-part="column"]')).paddingRight);
        if (Math.abs(l - r) > 2) fail('FR5', { where: where(f), left: Math.round(l), right: Math.round(r) }, 'S4');
      }
      // FR6 chrome: the page level from the header (first band) and the footer (last band).
      if (!prev && header && cr.top - headH < page - 1) fail('FR6', { where: where(f), fromHeader: Math.round(cr.top - headH), needs: page });
      if (!next && footer && doc(footer.getBoundingClientRect()).top - cr.bottom < page - 1) fail('FR6', { where: where(f), toFooter: Math.round(doc(footer.getBoundingClientRect()).top - cr.bottom), needs: page });
      // FR7 a phone-sized window: a feature keeps at least the page level of space (unless the window is too short for it).
      if (vw <= 400 && kind === 'feature' && mode === 'peek' && vh > 24 * 16 && px(cs.paddingTop) < page - 1) fail('FR7', { where: where(f), space: px(cs.paddingTop) }, 'S1');
      // FR8 type steps up.
      const biggest = Math.max(0, ...[...content.querySelectorAll('h1,h2,h3,p,blockquote,[data-dl="statistic"]')].filter(visible).map((el) => px(getComputedStyle(el).fontSize)));
      if (biggest < h3 - 0.5) fail('FR8', { where: where(f), largest: biggest, needs: h3 }, 'S3');
      // FR9 no two frames adjacent.
      if (next && next.hasAttribute('data-frame')) fail('FR9', { where: where(f), adjacent: where(next) });
      // FR12 viewport-aware sizes.
      if (asStage && vh >= 700 && (fr.height < 0.5 * vh - 1 || fr.height > 0.8 * vh + 1)) fail('FR12', { where: where(f), share: Math.round((100 * fr.height) / vh) });
      if (kind === 'stage' && mode === 'peek' && vh < 500 && fr.height > cr.height + space + 1) fail('FR12', { where: where(f), taller: Math.round(fr.height - cr.height), window: vh });
      if (mode === 'peek' && space > vh / 3 + 1) fail('FR12', { where: where(f), space, third: Math.round(vh / 3) });
      if (cr.height < 1) fail('FR12', { where: where(f), empty: true });
      // FR14 distraction-free: the window below the header holds this content and nothing else.
      if (mode === 'distraction-free') {
        const avail = vh - headH;
        if (kind === 'stage' && fr.top < vh) {
          // Centred in the window below the header: the content's middle within 2 px of the space's middle.
          const mid = (cr.top + cr.bottom) / 2;
          const start = px(getComputedStyle(f.closest('[data-dl="site-layout"]') ?? document.documentElement).getPropertyValue('--dl-frame-start')) * (/rem/.test(getComputedStyle(f.closest('[data-dl="site-layout"]') ?? document.documentElement).getPropertyValue('--dl-frame-start')) ? 16 : 1);
          if (cr.height + 2 * start + space <= avail && Math.abs(mid - (headH + vh) / 2) > 2) fail('FR14', { where: where(f), middle: Math.round(mid), windowMiddle: Math.round((headH + vh) / 2) });
          const other = next ? rectOf(next).top : footer ? doc(footer.getBoundingClientRect()).top : Infinity;
          if (other < vh - 1) fail('FR14', { where: where(f), otherShowsAt: Math.round(other), window: vh });
          if (prev) fail('FR14', { where: where(f), before: name(prev) });
        }
        if (kind === 'feature' && fr.height < avail - 2) fail('FR14', { where: where(f), height: Math.round(fr.height), needs: Math.round(avail) });
      }
      // FR15 peek: a feature leaves at least c.frame.peek of its neighbours in view (judged where its content and the
      // least space the other rules leave it would: FR7's page level above on a phone, and below whatever tops the
      // space outside it up to FR1's one and a half page levels to the next band, or FR6's page level to the footer).
      // A frame can't shrink content taller than the window, only its own space.
      const limit = vh - headH - peek;
      const outside = next ? rectOf(next).top - fr.bottom : footer ? doc(footer.getBoundingClientRect()).top - fr.bottom : Infinity;
      const least = cr.height + (vw <= 400 ? page : 0) + Math.max(0, (next ? 1.5 * page : footer ? page : 0) - outside);
      if (mode === 'peek' && kind === 'feature' && fr.height > limit + 1 && least <= limit) fail('FR15', { where: where(f), height: Math.round(fr.height), window: vh });
    }

    // FR11 edges: header, column and footer content share one start and end edge.
    const edges = ['[data-dl="site-layout"] > [data-dl-part="header"] > [data-dl-part="column"]', '[data-dl="site-layout"] > [data-dl-part="main"] > [data-dl-part="column"]', '[data-dl="site-layout"] > [data-dl="footer"] > [data-dl-part="content"]']
      .map((s) => document.querySelector(s))
      .filter(Boolean)
      .map((el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return { el, left: Math.round(r.left + px(cs.paddingLeft)), right: Math.round(r.right - px(cs.paddingRight)) };
      });
    const wide = document.querySelector('[data-dl="site-layout"][data-width="wide"]');
    if (wide && edges.length > 1 && edges.some((e) => Math.abs(e.left - edges[0].left) > 1 || Math.abs(e.right - edges[0].right) > 1)) fail('FR11', { edges: edges.map((e) => `${name(e.el)} ${e.left}–${e.right}`) });

    return frames.map((f) => ({
      frame: where(f),
      parts: [...contentOf(f).querySelectorAll('h1,h2,h3,p,blockquote,figcaption,cite,[data-dl-part="author"],[data-dl="button"],a,img')].filter(visible).map((el) => `${el.getAttribute('data-dl') ?? el.getAttribute('data-dl-part') ?? el.tagName.toLowerCase()}`).join(' '),
    }));
  }
})();

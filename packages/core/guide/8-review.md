# Step 8: review every screen with the adversarial loop

Goal: no screen is called done until someone who didn't build it has scored it against every framework's checklist, with evidence, and every fail is fixed at its owner.
> **Paths:** `AGENTS.md`, `guide/…`, `agent/…` and `probes/…` are inside the installed package (`node_modules/@design-library/core/`); the package exports each probe as `@design-library/core/probes/{name}.js`, matching this version. The frameworks are in the hosted docs; links below.

## The light review: a site of words and pictures

A small team shipping a mostly static site (pages of words, pictures and links, few states) can start with the light review and keep the full loop below for screens with forms, panels and working states.

1. **Check:** `npx design-library-check`, `npx design-library-check-content --templates src/templates --src src`, `npx tsc --noEmit`, `npx vite build`.
2. **Probe every page in one command** on your running site (`npm i -D playwright-core` once; it drives your installed Chrome or Edge):

   ```sh
   npx design-library-review http://localhost:5173/ http://localhost:5173/#/about
   ```

   It opens each address at 1000 and 320 px, light and dark, runs the static probes (spacing, layout, visual noise, clipping, scrolling, visual representation) and prints one line per failing row: address, width, scheme, row, count and the first finding. `--probes all` adds materials, UI states, chrome context and motion; `--widths`, `--schemes` and `--json` change what it runs and prints; `--strict` fails the run on any failing row.
3. **Read the look rows** the probes can't measure (the hierarchy, the copy, the pictures) on each framework's part 2, ideally by someone who didn't build the page.
4. **Fix at the owner** (step 5 of the loop below) and run the command again until it prints no fail.

Move up to the full loop when a page gains a form, a panel or a state, or when the light review keeps finding the same row.

## Two roles, never the same session

| Role | Does | Never |
| --- | --- | --- |
| **Builder** (you, while building) | Reads part 1 of each framework the screen touches, maps the hierarchy first (header · page content · footer, then units, groups, items), builds from layouts, Stack, Cluster, Grid, props, slots, the theme and content JSON; runs the checks in `AGENTS.md` "Checks"; hands over the routes, windows, schemes and states to open | Scores its own screen; edits a rule to pass it; fixes a fail with a `style`, `className`, margin or forked component |
| **Evaluator** (a fresh agent session, a review agent or a person) | Gets only the routes, windows, schemes and states. Writes the hierarchy tree from what it sees, runs every probe, reads every look row, and returns one table per framework: row, pass or fail, evidence, likely owner | Fixes anything; passes a row without evidence |

If your agent can start another session or a review agent, the evaluator is that session. If it can't, ask the person you work for to run the evaluator prompt below in a fresh chat; don't evaluate your own screen.

## The loop

1. **Create** with part 1 of each touched framework (table below) and the [Never rules](../AGENTS.md#never).
2. **Check:** `npx design-library-check-content --templates src/templates`, `npx tsc --noEmit`, `npx vite build`. Fix any failure first.
3. **Hand over** to the evaluator: the routes; windows 1000 and 320 CSS px; light, dark and more contrast; every state to open (panels, popups, loading, error, empty).
4. **Evaluate** with part 2: load each probe, run it, read the look rows.
5. **Fix at the owner**, in this order: your theme (`@design-library/core/theme`, presets, a context attribute) → the layout you chose → the props and slots of the component → your template's custom part and its `t.{template}.*` tokens → the content. Never the rendered page. A fail you can trace to a core component is reported upstream (the library's GitHub issues), not patched.
6. **Repeat** 2–5; the evaluator re-scores every row each round.
7. **Done when** every framework's pass rule holds: no S1–S3 row fails for spacing, layout, scrolling, clipping and UI states; no N1–N3 for visual noise; no row at all for materials, motion, chrome context and visual representation. A row the screen can't exercise is **n/a** with one line saying why.

## The frameworks, their checklists and probes

| Framework | Part 1: create with | Part 2: evaluate with | Probe |
| --- | --- | --- | --- |
| Spacing and framing | [Part 1](https://prabinpebam.github.io/design-library/docs/#spacing.md) | SC and FR rows, same page | `probes/spacing-probe.js` `spacingProbe()` |
| Layout: regions, columns, reflow | [Part 1](https://prabinpebam.github.io/design-library/docs/#layout.md) | LY rows | `probes/layout-probe.js` `layoutProbe()` |
| Visual noise | [Part 1](https://prabinpebam.github.io/design-library/docs/#visual-noise.md) | VN rows | `probes/noise-probe.js` `noiseProbe()`, light and dark |
| Materials and elevation | [Part 1](https://prabinpebam.github.io/design-library/docs/#materials.md) | ME rows | `probes/material-probe.js` `materialProbe()` |
| Motion | [Part 1](https://prabinpebam.github.io/design-library/docs/#motion.md) | MV rows | `probes/motion-probe.js` `motionProbe({ places })`, `places` from `motion/zero-latency.json` in this package |
| Clipping | [Part 1](https://prabinpebam.github.io/design-library/docs/#clipping.md) | CL rows | `probes/clipping-probe.js` `clippingProbe()` |
| UI states | [Part 1](https://prabinpebam.github.io/design-library/docs/#ui-states.md) | US rows | `probes/ui-states-probe.js` `uiStatesProbe()`, each state shown |
| Scrolling and scrollbars | [Part 1](https://prabinpebam.github.io/design-library/docs/#scrolling.md) | SB rows | `probes/scroll-probe.js` `scrollProbe()` |
| Chrome context (density) | [The guideline](https://prabinpebam.github.io/design-library/docs/#foundation.md#density-content-and-chrome) | CX rows | `probes/context-probe.js` `contextProbe()` |
| Visual representation | [Part 1](https://prabinpebam.github.io/design-library/docs/#visual-representation.md) | VR rows | `probes/visual-probe.js` `visualProbe()` |

Each probe is one script shipped with this package, so it matches the version you installed: load it with Playwright's `page.addScriptTag({ path: 'node_modules/@design-library/core/probes/{name}-probe.js' })`, or paste the file into the browser console on the running screen. Then call its function, e.g. `window.spacingProbe()`. Each returns `{ rows: { ID: { pass, findings, count } } }`; a finding names the element (`data-dl` component and part) and the measurement.

## The evaluator prompt

Give a fresh session exactly this, filled in:

```markdown
You are the evaluator in the Design Library adversarial loop. You did not build this screen; don't fix anything.
Routes: <urls>. Windows: 1000 and 320 CSS px. Schemes: light, dark, more contrast. States to open: <list>.
1. Write the page's hierarchy tree from what you see (header · page content · footer, then units, groups, items).
2. Run every probe in node_modules/@design-library/core/guide/8-review.md on every route, window and state.
3. Read every look row of each framework's part 2.
Return one table per framework: row ID, pass/fail/n-a, evidence (probe finding, measurement or your reading), likely owner.
```

## Check it

- Every framework table from the last round shows its pass rule holding, with evidence in every row.
- The fixes changed owners (theme, layout choice, props, custom parts, content), never the rendered page; `git diff` shows no `style`, `className` or CSS in views.

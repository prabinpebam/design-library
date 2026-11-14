# The adversarial loop

> **TL;DR:** Every screen is made in a loop between two roles that never share a head. The **builder** creates the screen with each framework's **part 1** (the method and guideline). An **evaluator who did not build it** scores every **part 2** row of every framework the screen touches, each with evidence (a probe result, a command's output, a measurement or a named look). The builder fixes each failing row **at the source that owns it** (token, layout, compound, part, then content; never the rendered page or a one-off override), and the evaluator scores again. The loop ends only when every framework's pass rule holds. This is how the project works (owner Q85.3) and how a project that uses the library should work.

Owner's words, 2026-11-09 09:47 +05:30 ([DoD Q85](definition-of-done.md#owner-instructions)): *"Each of there framework for spacing, layout, visual clutter, materials, motion, elevation, clipping, UI states etc should come in 2 parts. 1. The framework and guideline that an AI agent or human can use to apply and practice in the execution of the design of the site/app. 2. An objective checklist that can be used to see if the final outcome is a good execution of the frramework. We use an adversarial approach to create with 1 and evaluate with 2 until we get the UX right for the app/site. Set this up properly."*

## Why adversarial

- **The builder can't see its own misses.** The person (or agent) who wrote a screen reads it as intended, not as drawn. Every miss the frameworks were written to catch (one equal gap between every row, a border on every member, a cut focus ring) looked fine to whoever made it.
- **Part 1 and part 2 are written apart on purpose.** Part 1 says how to decide; part 2 says what the result must measure. A screen can follow every step and still fail a row; a row failing is evidence the decision went wrong, not that the checklist is strict.
- **Evidence, not opinion.** Every row passes or fails on something the evaluator can show: a probe's `rows` object, a command's exit and message, a measurement in CSS px, or, for a **look** row, the evaluator's own written reading (the hierarchy tree, the named bands) that the builder can check.

## The roles

| Role | Does | Never |
| --- | --- | --- |
| **Builder** | Reads part 1 of every framework the change touches, maps the hierarchy first ([the method](spacing.md#the-method-hierarchy-first-then-space-and-frames-owner-q93)), builds the screen from the library's seams, runs the static checks, then hands the screen over with its routes and the states to open. Fixes every failing row at its owner | Scores its own screen, edits a checklist row to make it pass, fixes a row with a one-off override on the rendered page |
| **Evaluator** | Did not build the screen. Writes the page's hierarchy tree from what it sees (not from the builder's notes), then scores **every** part 2 row of every touched framework, at the stated windows, schemes and states, with evidence per row. Names each fail's likely owner | Fixes anything; passes a row without evidence; skips a row as "not relevant" without one line saying why |

For agents: the evaluator is a **separate session** (a fresh chat or a review agent) given only the routes, the states to open and this page, never the builder's reasoning. A person may play either role. In this project, the review agents (`design-system-auditor`, `rubber-duck` or a fresh worker) take the evaluator role; the builder never does.

## The loop

1. **Create with part 1.** Read part 1 of each framework the change touches ([the index](#the-frameworks-index)). Start from the hierarchy tree: header · page content · footer, then units, groups, items. Build only from layouts, Stack, Cluster, Grid, the components' props and slots, tokens and content JSON.
2. **Run the static checks.** In the library repository, `npm run check` (every static check at once), `npm run typecheck` and the library build. In a consuming project, `npx design-library-check-content`, `npx tsc --noEmit` and `npx vite build` ([the package guide's Checks](https://github.com/prabinpebam/design-library/blob/main/packages/core/AGENTS.md#checks)). A failing static check is fixed before the evaluator is called.
3. **Hand over.** The builder gives the evaluator the routes, the windows (1000 and 320 CSS px), the schemes (light, dark, more contrast) and every screen state to open (panels, popups, loading, error, empty), and nothing else.
4. **Evaluate with part 2.** The evaluator writes the hierarchy tree, loads each probe into the page and runs it ([How to run the probes](#how-to-run-the-probes)), then reads every **look** row. The result is one table per framework: row, pass or fail, evidence, likely owner.
5. **Fix at the owner.** For each fail, the builder changes the source that owns the cause, in this order: a token or preset → a layout → a compound or fundamental (through its own CSS and tokens) → a template's custom part → the content. Never the rendered page, a `style`, a `className`, a margin to nudge one case, an allowlist entry or the checklist itself. When one cause fails many rows (or many screens), fix the cause once.
6. **Repeat** steps 2–5 until the [exit rule](#when-the-loop-ends) holds. Each round, the evaluator re-scores **every** row, not just the ones that failed: a fix can break a passing row.
7. **Record.** The final table (rows, evidence, rounds) goes where the change is documented; in this project, the framework's Results section in Slate.

## When the loop ends

The screen passes when every framework's own pass rule holds, at every window, scheme and state named in step 3:

| Framework | Passes when |
| --- | --- |
| Spacing and framing, layout, scrolling, clipping, UI states | No S1–S3 row fails (S1 broken, S2 misgrouped or inconsistent, S3 fragile; S4 polish is noted) |
| Visual noise | No N1–N3 row fails (N1 misleading, N2 cluttered, N3 heavy; N4 polish is noted) |
| Materials and elevation, motion | No row fails |
| Density (content and chrome), visual representation | No row fails |

A row the screen genuinely can't exercise (no popup, no chart) is marked **n/a** with one line saying why; it never counts as a pass of a different screen. Only the owner may accept a known fail, and that acceptance is recorded with its date beside the row.

## The frameworks index

Each framework has the same two parts. Probes run in the browser on the screen; commands run from the library repository's root.

| Framework | Part 1: create with | Part 2: evaluate with | Probe (`window.…()`) or check |
| --- | --- | --- | --- |
| Spacing and framing | [The framework](spacing.md#part-1-the-framework) | [SC and FR rows](spacing.md#part-2-the-checklist) | `tools/spacing-probe.js` (`spacingProbe()`); `npm run tokens:check`, `check:views`, `check:content` |
| Layout: regions, columns, reflow | [The framework](layout.md#part-1-the-framework) | [LY rows](layout.md#part-2-the-checklist) | `tools/layout-probe.js` (`layoutProbe()`) |
| Visual noise | [The framework](visual-noise.md#part-1-the-framework) | [VN rows](visual-noise.md#part-2-the-checklist) | `tools/noise-probe.js` (`noiseProbe()`), in light and dark |
| Materials and elevation | [The framework](materials.md#part-1-the-framework) | [ME rows](materials.md#part-2-the-checklist) | `tools/material-probe.js` (`materialProbe()`); `npm run check:materials`, `check:layers` |
| Motion | [The framework](motion.md#part-1-the-framework) | [MV rows](motion.md#part-2-the-checklist) | `tools/motion-probe.js` (`motionProbe({ places })`); `npm run check:motion` |
| Clipping | [The framework](clipping.md#part-1-the-framework) | [CL rows](clipping.md#part-2-the-checklist) | `tools/clipping-probe.js` (`clippingProbe()`); `npm run check:clipping` |
| UI states: commit, load, error, empty, notification | [The framework](ui-states.md#part-1-the-framework) | [US rows](ui-states.md#part-2-the-checklist) | `tools/ui-states-probe.js` (`uiStatesProbe()`), with each screen state shown |
| Scrolling and scrollbars | [The framework](scrolling.md#part-1-the-framework) | [SB rows](scrolling.md#part-2-the-checklist) | `tools/scroll-probe.js` (`scrollProbe()`); `npm run check:clipping` |
| Chrome context (density: content and chrome) | [The guideline](foundation.md#density-content-and-chrome) | CX rows (same section) | `tools/context-probe.js` (`contextProbe()`) |
| Visual representation | [The framework](visual-representation.md#part-1-the-framework) | [VR rows](visual-representation.md#part-2-the-checklist) | `tools/visual-probe.js` (`visualProbe()`) |

Colour and words (UI copy) are governed by their rules in [the package guide's principles](https://github.com/prabinpebam/design-library/blob/main/packages/core/guide/7-principles.md) and the static checks (`npm run tokens:check` for contrast); they don't yet have a two-part page.

## How to run the probes

Every probe is one self-contained script that adds a function to `window` and returns `{ rows: { ID: { pass, findings, count } } }`.

```js
// Playwright (the evaluator's own browser; never the owner's screen)
for (const p of ['spacing', 'layout', 'noise', 'material', 'clipping', 'ui-states', 'scroll', 'context', 'visual']) {
  await page.addScriptTag({ path: `tools/${p}-probe.js` });
}
const results = await page.evaluate(() => ({
  spacing: spacingProbe().rows, layout: layoutProbe().rows, noise: noiseProbe().rows,
  material: materialProbe().rows, clipping: clippingProbe().rows, states: uiStatesProbe().rows,
  scroll: scrollProbe().rows, context: contextProbe().rows, visual: visualProbe().rows,
}));
```

- **Windows:** 1000 and 320 CSS px. The VS Code agent browser renders at 1.5 device pixels per CSS pixel: set the viewport to 1500 × 1200 for 1000 and 480 × 1200 for 320.
- **States:** open every panel first (`document.querySelectorAll('button[aria-label^="Show "][aria-expanded="false"]').forEach(b => b.click())`), then each popup, loading, error and empty state the builder named.
- **Schemes:** visual noise and materials in light and dark; contrast-sensitive rows in more contrast too.
- **Motion:** `motionProbe({ places })` reads `places` from `packages/core/motion/zero-latency.json`.
- **In another project:** the package ships the same probes, matching the installed version, as `@design-library/core/probes/{name}-probe.js` (`node_modules/@design-library/core/probes/`); load each with `page.addScriptTag({ path })` or paste it into the browser console on the running screen ([guide step 8](https://github.com/prabinpebam/design-library/blob/main/packages/core/guide/8-review.md)).

## Wired in

- **This repository:** the root `AGENTS.md` project rule "The adversarial loop" makes it the way every UI packet is built and reviewed.
- **Projects using the library:** the package's `AGENTS.md` ("The adversarial loop") and [guide step 8](https://github.com/prabinpebam/design-library/blob/main/packages/core/guide/8-review.md) tell the agent in that project to run it, with the same index, probe commands and exit rule.
- **Templates that pressure-test the library (DesignUp):** DesignUp is a library template, not an outside consumer. Its gaps are fixed in core on the branch `designup` (new behaviour opt-in, defaults kept), seen live in DesignUp's dev server, pinned there at checkpoints, adopted with the workaround deleted, and logged in [DesignUp template](designup-template.md) and DesignUp's own request log. `designup` joins `main` only serially, with the full check and regression sweep on the combined result.

## Sources

- Owner instruction Q85.3 ([Definitions of Done](definition-of-done.md#owner-instructions)); the method from owner Q93 and Q94 ([Spacing](spacing.md#the-method-hierarchy-first-then-space-and-frames-owner-q93)).
- agentic-craft `spacing`, `visual-noise` and `ui-states` skills (severity scales and audit procedures); the `design-system-auditor` agent.
- This library's probes in `tools/*-probe.js` and the static checks behind `npm run check`.

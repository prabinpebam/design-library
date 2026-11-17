# Template pressure-test loop

**Status:** rulebook for review ([DoD Q149, Q150](definition-of-done.md#owner-instructions)), 2026-11-12. Closes the seven process gaps between [Foundation](foundation.md#templates-content-and-customization), [Templates and the library](templates-and-library.md), [Replica method and rules](replica-rules.md), [Hardening method](hardening-method.md) and the consumer guide (`packages/core/AGENTS.md`), plus the no-breakage, frozen-base and parallel-worktree integration rules (Q150).

> **TL;DR for agents:**
>
> - **Follow [the protocol](#0-the-protocol-what-agents-do-in-order) (§0, Q152.2):** the roles (builder, an evaluator who didn't build it, main), steps P0–P11, each step's gate citing [contract](how-it-works.md) invariants, the evidence each needs, when to stop, and what you may never do.
> - **One loop:** **find** a limitation on the seam ladder → **log** it → **triage** it → **fix** at the lowest owning layer → **check, sweep & integrate** (frozen-base `check:regression` before commit; serial merge + full combined sweep across parallel worktrees; repeated misses turned into checks) → **remove** the override or custom part → **mark it shipped** with its version.
> - **No other template moves:** every packet touching `packages/core`, a shared token, `apps/library` or shared template parts runs `npm run check:regression` against the frozen base before commit, excluding **only** the single template under construction; parallel template branches integrate one at a time with a full combined sweep before the next merge or refreeze.
> - **One rule on core changes:** building the library's **own templates and replicas** fixes generic gaps in core right away (defaults unchanged, regression sweep clean). An **outside consumer** (such as DesignUp) can't edit core directly, so it uses a small, scoped, commented temporary override plus a Library request until core ships. **Promoting a custom part** from a template into core needs two products.
> - **Never "done" while the workaround remains:** a fix counts as shipped only when core ships with stories and checks, parallel branches pass serial integration, the override or custom part is deleted, and the log row records the shipped version.

<figure class="slate-figure">
  <svg viewBox="0 0 960 336" role="img" aria-labelledby="ptl-title ptl-desc" data-slate-svg-motion="viewport" data-slate-safe-margin="24">
    <title id="ptl-title">The seven-step template pressure-test loop</title>
    <desc id="ptl-desc">Seven steps in a closed cycle. 1 Find: hit step 5 or 6 on the seam ladder while building a template or consumer site. 2 Log: record ID, need, exact limitation, proposed API and removal step. 3 Triage: choose existing seam, generic core seam now, template part, or outside-consumer temporary override. 4 Fix: build at the lowest owning layer with core defaults unchanged. 5 Check, sweep and integrate: run static checks, frozen-base regression sweep before commit, evaluator, serial integration with a full combined sweep across parallel worktrees, and turn repeated misses into checks. 6 Remove: delete the temporary override or superseded custom part. 7 Mark shipped: record the version in both logs.</desc>
    <g id="ptl-s1" data-slate-svg-step="0" data-slate-svg-effect="fade-rise">
      <rect x="24" y="32" width="212" height="108" rx="12" fill="var(--color-neutral-bg-2)" stroke="var(--color-neutral-stroke-2)" stroke-width="1.5"/>
      <text x="42" y="64" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="15" font-weight="700">1 · Find</text>
      <text x="42" y="88" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="13">Walk seam ladder 1–4;</text>
      <text x="42" y="108" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="13">step 5 or 6 is a finding</text>
    </g>
    <g id="ptl-s2" data-slate-svg-step="1" data-slate-svg-effect="fade-rise">
      <rect x="260" y="32" width="212" height="108" rx="12" fill="var(--color-neutral-bg-2)" stroke="var(--color-neutral-stroke-2)" stroke-width="1.5"/>
      <text x="278" y="64" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="15" font-weight="700">2 · Log</text>
      <text x="278" y="88" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="13">ID, evidence, step,</text>
      <text x="278" y="108" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="13">proposed API, removal</text>
    </g>
    <g id="ptl-s3" data-slate-svg-step="2" data-slate-svg-effect="fade-rise">
      <rect x="496" y="32" width="212" height="108" rx="12" fill="var(--color-neutral-bg-2)" stroke="var(--color-brand-stroke)" stroke-width="2"/>
      <text x="514" y="64" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="15" font-weight="700">3 · Triage</text>
      <text x="514" y="88" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="13">In-repo: core now or part.</text>
      <text x="514" y="108" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="13">Consumer: request + hook</text>
    </g>
    <g id="ptl-s4" data-slate-svg-step="3" data-slate-svg-effect="fade-rise">
      <rect x="732" y="32" width="204" height="108" rx="12" fill="var(--color-neutral-bg-2)" stroke="var(--color-neutral-stroke-2)" stroke-width="1.5"/>
      <text x="750" y="64" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="15" font-weight="700">4 · Fix</text>
      <text x="750" y="88" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="13">Generic core seam with</text>
      <text x="750" y="108" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="13">unchanged defaults</text>
    </g>
    <g id="ptl-s5" data-slate-svg-step="4" data-slate-svg-effect="fade-rise">
      <rect x="640" y="196" width="296" height="112" rx="12" fill="var(--color-neutral-bg-2)" stroke="var(--color-neutral-stroke-2)" stroke-width="1.5"/>
      <text x="658" y="224" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="15" font-weight="700">5 · Check, sweep &amp; integrate</text>
      <text x="658" y="246" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="13">Frozen-base sweep before commit;</text>
      <text x="658" y="265" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="13">serial merge + full combined sweep;</text>
      <text x="658" y="284" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="13">repeated miss → new check / rule</text>
    </g>
    <g id="ptl-s6" data-slate-svg-step="5" data-slate-svg-effect="fade-rise">
      <rect x="332" y="196" width="280" height="112" rx="12" fill="var(--color-neutral-bg-2)" stroke="var(--color-neutral-stroke-2)" stroke-width="1.5"/>
      <text x="350" y="228" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="15" font-weight="700">6 · Remove workaround</text>
      <text x="350" y="252" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="13">Delete temporary override or</text>
      <text x="350" y="272" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="13">superseded custom part</text>
    </g>
    <g id="ptl-s7" data-slate-svg-step="6" data-slate-svg-effect="fade-rise">
      <rect x="24" y="196" width="280" height="112" rx="12" fill="var(--color-neutral-bg-2)" stroke="var(--color-brand-stroke)" stroke-width="2"/>
      <text x="42" y="228" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="15" font-weight="700">7 · Mark shipped</text>
      <text x="42" y="252" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="13">Record version in library</text>
      <text x="42" y="272" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="13">and consumer logs + adopt brief</text>
    </g>
    <g id="ptl-arrows" data-slate-svg-step="7" data-slate-svg-effect="fade" fill="none" stroke="var(--color-neutral-fg-2)" stroke-width="2">
      <path d="M236 86 H256"/>
      <path d="M472 86 H492"/>
      <path d="M708 86 H728"/>
      <path d="M834 140 V192"/>
      <path d="M640 252 H616"/>
      <path d="M332 252 H308"/>
      <path d="M250 80 L258 86 L250 92 Z M486 80 L494 86 L486 92 Z M722 80 L730 86 L722 92 Z M828 186 L834 194 L840 186 Z M622 246 L614 252 L622 258 Z M314 246 L306 252 L314 258 Z" fill="var(--color-neutral-fg-2)" stroke="none"/>
    </g>
  </svg>
  <figcaption>Every template or consumer limitation travels the same seven steps until the temporary override or superseded part is gone.</figcaption>
</figure>
<details class="slate-figure-data">
  <summary>Data</summary>
  <table>
    <thead><tr><th>Step</th><th>Action</th><th>Output</th></tr></thead>
    <tbody>
      <tr><td>1 Find</td><td>Walk steps 1–4 of the seam ladder; stop at step 5 or 6</td><td>A concrete limitation</td></tr>
      <tr><td>2 Log</td><td>Record ID, need, exact limitation, ladder step, proposed API and removal step</td><td>Log entry (<code>open</code>)</td></tr>
      <tr><td>3 Triage</td><td>Choose existing seam, core fix now, template part, or consumer override + request</td><td>Decision (<code>accepted</code> or <code>declined</code>)</td></tr>
      <tr><td>4 Fix</td><td>Build generic seam at the lowest owning layer; keep core defaults unchanged</td><td>Core PR/packet or template part</td></tr>
      <tr><td>5 Check, sweep &amp; integrate</td><td>Run <code>npm run check</code>, frozen-base <code>check:regression</code> before commit, evaluator; integrate parallel worktrees one branch at a time with a full combined sweep; turn repeated misses into checks</td><td>Zero regressions across all templates + stronger gate</td></tr>
      <tr><td>6 Remove workaround</td><td>Switch caller to the new seam and delete the override or custom part</td><td>Clean consumer or template</td></tr>
      <tr><td>7 Mark shipped</td><td>Record version/commit in both logs and in the release's adoption paste-in</td><td>Log entry (<code>shipped</code>)</td></tr>
    </tbody>
  </table>
</details>

## 0. The protocol: what agents do, in order

**Status:** the strict agent framework ([DoD Q152.2](definition-of-done.md#owner-instructions)), 2026-11-12. Every template, replica or core packet in this repository follows it. The gates cite the invariants in [How the library works: the contract](how-it-works.md) (IDs such as K9, S4, G2). For replicas, [Replica method and rules](replica-rules.md) adds the reference capture, region spec, side by side and commands (RR1–RR12). It is a supplement: where the two differ, this protocol's order, gates and stop conditions win.

### The lean loop (owner Q159, 2026-11-13)

*"Taking time because of ineffective coordination, premature testing etc are absolutely not fine. So optimization is the key."* These rules win over any slower step below. The YouTube replica shows why. It spent about 12 hours on pixel rows and per-commit sweeps while every link led to an error page and there wasn't a single picture (Q156; [where the time went](youtube-replica.md#where-the-youtube-time-went-q159)).

1. **Function before polish.** First links, then pictures, then menus and controls. The evaluator clicks through every link and control in a live browser before scoring any visual row, and a broken link, missing picture or dead control is a fail. Visual scoring starts only after the click-through passes, and it means no visible difference at normal viewing. ±1 px rows don't block unless the owner asks for them.
2. **Checks scale with risk.**
   - A template-only change, scoped to `[data-template]` in the template's own folder, skips the cross-template `check:regression` sweep.
   - Core changes are batched: the sweep runs once per batch, not once per commit.
   - `npm run check` and the build run once per commit.
   - Nobody runs the full suite in strict design.
3. **Score per batch.** The evaluator rebuilds the review build on each relayed commit, which takes minutes, so the owner always sees the latest. The full score is given once per batch, for example after links and pictures, then after menus and controls, never per commit. A fail list holds the whole batch's fails at once, so the builder fixes them together.
4. **Short, self-contained briefs.** A brief names the goal, the views, the rows to close, the files, the commands and the stop rule in under 15 lines. It links to the rules rather than asking the worker to re-read every page. A successor's handoff is one paragraph: the latest commit, what's open and the next action.
5. **Main challenges each packet before it starts.** Is it needed now? Can it be batched with the next one? Is a pixel row worth a round? Main also records where the time went.
6. **One time log per batch.** One line in the tracker: build, checks, sweep, scoring and waiting, in minutes. Any step over 20 minutes gets one sentence saying why.
7. **No idle relays.** Worker messages that hang count as waiting time, so make every relay a single line. Never let a fix wait on a relay longer than the fix itself took.

### Roles

| Role | Who | Does | Never |
| --- | --- | --- | --- |
| **Owner** | The product owner | Gives instructions; approves designs and releases | Is asked to approve as a condition of continuing (Q41) |
| **Main** | The original main chat (triage only) | Records owner instructions in the DoD; routes packets, findings and fixes; integrates branches one at a time; reports to the owner | Builds or runs commands itself |
| **Builder** | One worker per template branch or core packet, in its own worktree | Steps P0–P6 and P8; fixes each fail at its owning source | Evaluates its own work; edits another worker's worktree |
| **Evaluator** | A fresh session that built none of the loop | P7 (scores the packet) and P10 (scores the library) from routes, windows, schemes, states and the reference only | Fixes what it scores; reads the builder's notes as evidence |

### Inputs a builder must have before P1

1. The DoD row (owner's words, contract, status) and every newer owner row ([Owner instructions](definition-of-done.md#owner-instructions)).
2. The contract ([How the library works](how-it-works.md)) and the consumer guide's "Rules agents miss" table (`packages/core/AGENTS.md`).
3. A frozen base, `.shots/base-dist/BASE.json`: its `head` is a clean, signed-off commit and its `dirtyFiles` is empty.
4. For a replica: the reference screenshots and the region spec (RR1).
5. The last [scorecard](library-scorecard.md) run and its open routed findings for this template or for core.

### Steps, gates and evidence

A step's gate must pass before the next step starts. The evidence is written down, not remembered: in the tracker, the DoD status cell, or `.shots/<packet>/`.

| Step | Action | Gate (contract IDs) | Mandatory evidence |
| --- | --- | --- | --- |
| **P0 Start** | Mark the session role and mode on the clock; read the newest owner rows; freeze the base if the branch has none (`npm run regression:freeze`) | `BASE.json` clean (G2) | `BASE.json` head and time in the DoD status cell |
| **P1 Reference** (replicas) | Capture the reference and write the region spec (RR1) | Every region to be built has spec rows (RR1) | `.design-library/<template>-ref/README.md` |
| **P2 Build on the seam ladder** | Try a prop, slot, context and theme first. Before writing a step-5 part or a step-6 core change, log the finding (§5) | Each step-5 or step-6 change has a log row before its code (S5, T3) | Rows in the [Library request log](#library-request-log) or the tracker |
| **P3 Core change** (only if step 6) | Generic name, default unchanged, look as `c.*` tokens, stories in every context, `npm run agent:index`; a row in [Templates and the library](templates-and-library.md), checked by `npm run check:core-log -- --doc <path to it>` | Passes the three questions (T3); no product name (G1); recorded (G4, `check:core-log` exit 0); index fresh (V4) | The Templates and the library row; `check:generic` output |
| **P4 Static checks** | Run `npm run check`; then `node ./packages/core/tools/check-project.mjs --src packages/templates/<t> --templates packages/templates --all` | Exit 0 (all gated K, S, V, P, R invariants; since core hardening C1–C3, `core-token`, raw type, `inline-svg`, `widget-role` and `icon-cast` are errors in template parts, and `check:copy` and `check:states` are in `npm run check`). **Warnings count as fails** for `raw-markup`, `icon-name` and `important` in the template under work (S4, R8) | Both summaries, in `.shots/<packet>/check.log` |
| **P5 Boundary greps** | Over the template's `parts/`: count hand-built widget roles (`role="dialog\|menu\|table\|listbox\|tab"` on `div`s), inline `<svg>` in TSX, literal `--c-*` settings, raw `font-size` and `letter-spacing`, and part CSS that keeps a region transparent while a picture paints it | 0 each, or each one listed with its reason and a log row (S4, R7, K9, L2, L4) | Counts in the tracker's boundary-audit row |
| **P6 Probes and sweep** | Run every browser probe on each touched screen at full width and 320 px, light and dark; run `npm run check:regression -- --exclude <template under work> --axe` before any commit that touches core, shared tokens, `apps/library` or shared parts (`--axe` adds the accessibility probe, A2, A5) | Probes 0 findings (L1–L5, R1–R4, C1); sweep `failed: 0`, with differences only in declared catalogue inventory and 0 pixels outside it (G2) | `all-probes-summary.json`; the sweep's `result.json` summary line |
| **P7 Evaluate** | The evaluator scores the packet: side by side (RR2), regions, probes, sweep and the boundary audit (core changes judged generic, template-layer counts from P5) | Every row passes. The boundary audit has 0 unrecorded core changes (G4), 0 rebuilt widgets (S4) and 0 probe workarounds (L4) | The evaluator's verdict in the tracker, with its evidence folder |
| **P8 Fix** | The builder fixes each fail at its owning source (token → layout → compound → fundamental → part → content), then repeats P4–P7 | No fix edits a check, probe, allow-list, mask or checklist to pass | The fail log row, closed with its commit |
| **P9 Integrate** (parallel branches) | Main merges one branch at a time; runs the full sweep on the combined result, comparing every template, including those in progress against their last scored state; refreezes only after a clean sweep | Combined sweep `failed: 0` (G2, G3) | Sweep summary; new `BASE.json` head in the DoD |
| **P10 Score** | An evaluator who built none of the loop runs the [scorecard](library-scorecard.md), adds a history row, compares it with the last run, and routes every finding (framework, core, template), checking last run's routed findings | Each dimension's score has linked evidence; each earlier finding is verified closed or carried forward | The scorecard's history row and Findings routing table |
| **P11 Report** | Send main two FYI lines: the link and what changed, then what to try | A packet without the evaluator's pass is "in progress", never done (RR12) | The message, and the clock's `mark reviewable` |

### Stop conditions

Stop, write what you know into the DoD status cell, and report to main when:

1. **The same gate fails twice on the same cause.** The two-strike rule (§7) applies: the fix includes a new check or a "Rules agents miss" row, and main routes it.
2. **A step-6 change can't keep its default:** the sweep shows a change on another template that can't be fixed at its source, or the change fails the three questions (T3) or `check:generic` (G1).
3. **The base is stale or dirty:** `BASE.json` doesn't match the signed-off head, or the copy has another worker's uncommitted core changes.
4. **A seam is missing in core** and you're not the builder routed to core: log it and keep the template's workaround scoped.
5. **An owner instruction conflicts** with this protocol or with a gate, or a reference raises a licence question (P5 of the contract).
6. **Limits:** 90 active minutes, 300 tool calls or 2 compactions. Write a SUCCESSOR block in the DoD row and stop.

### Never

1. Edit a check, probe, allow-list, regression mask, `regression-noise.json` or checklist to make a packet pass. **The one exception (main's ruling, 2026-11-12):** catalogue-inventory differences caused by a new generic core seam (counts, metadata rows and the scrollbar length that follows) may be declared in `regression-noise.json` under `catalogueInventory`, only as region masks on the affected library catalogue pages, each entry naming the commit, the seam and the reason, with evidence that every pixel outside the mask is identical by hash. No blanket entries, no masks on template screens, and no mask that hides a real change. The rules are [Allowed differences: catalogue inventory](replica-rules.md#allowed-differences-catalogue-inventory) and [Keeping other templates unbroken](#keeping-other-templates-unbroken).
2. Paint a region with a picture, or keep it transparent, so that a probe doesn't see it (L2, L4).
3. Edit generated tokens (`tokens.css`, `tokens.resolved.json`, `tokens.colour.json`) (K1, K2).
4. Select a core component's `data-dl`, reach a part by a descendant selector, or use `!important` (S2, S3).
5. Copy, wrap or rebuild a core component, or hand-build a widget role core already has (S4).
6. Set a core component token to a literal in part CSS, or write type outside tokens (K9).
7. Set `color.status.*` in a template theme (K4), or put a product name or brand value in core (G1).
8. Write `overflow: auto | scroll` outside ScrollArea (R1).
9. Commit a core change without a clean sweep (G2), or leave it unrecorded (G4).
10. Edit, build or sweep in another worker's worktree.
11. Evaluate your own work, or call anything done without the evaluator's pass (RR12).
12. Ask the owner to approve as a condition of continuing (Q41), or ask again for anything already recorded in the DoD.

## 1. The seam ladder

When a screen doesn't look or behave as needed, take the first step that works. Reaching step 5 or step 6 is a **finding**: proof of where the library stops and customization or a core improvement begins.

| Step | Seam | Example |
| --- | --- | --- |
| 1 | Existing **prop or variant** | `<Button emphasis="danger" size="l" />` (`agent/components/Button.json`) |
| 2 | **Slot** (`children` or a `ReactNode` prop) | `<Badge>` inside `Card` `meta`; actions inside `Dialog` |
| 3 | **Context attribute** on an ancestor | `data-density="compact"`, `data-scheme="dark"`, `data-material="solid"` |
| 4 | **Theme or theme settings** | `tokens/theme.json` in a template, `applyBrand`, `applyFonts`, `applySettings` (`tokens/settings.json`) |
| 5 | **Custom part inside the template** (`parts/`, `t.<template>.*` tokens) | `conference.SponsorWall`, `ikea.ProductTile` |
| 6 | **Core change** (generic token, prop, slot, fundamental, compound or layout) | Built right away for generic gaps found in the library's own templates; logged as a Library request by outside consumers; **two products** required to promote a custom part into core |

## 2. One ruling: who changes core, and when

Earlier docs disagreed: [Foundation](foundation.md) and [Hardening method](hardening-method.md) fixed gaps generically in core right away, while the consumer `AGENTS.md` (Never rule 6 and seam ladder step 6) said core changes happen *"only when two or more products need it"*. Both rules had a real job, applied to different situations. One rule governs all three cases:

| Situation | What happens | Why |
| --- | --- | --- |
| **Building the library's own templates and replicas** (`packages/templates/*`: IKEA, Slack, Word, YouTube) | When a gap passes the [three-question test](templates-and-library.md#the-rule-library-or-template) (another unrelated product would use it, it carries behaviour/accessibility/formatting or sits inside a sealed part, and its look is tokenizable), fix it **generically in core right away**. Defaults stay unchanged and `npm run check:regression` proves every other template and library page is pixel-identical ([RR3, RR11](replica-rules.md#the-rules)). Temporary CSS overrides on core parts are forbidden in-repo | Replicas exist to find core flaws and close them at the source without carrying architecture debt ([Hardening method](hardening-method.md#architecture-over-everything)) |
| **Building an outside site or app** (consumes `@design-library/core` from tarballs/npm, e.g. DesignUp) | The project cannot edit core directly. If steps 1–4 fail and a custom part (step 5) cannot solve it because a sealed core component owns the markup, add the smallest **scoped, commented temporary override** in the site **and** log a **Library request** with the proposed generic API and removal step. Delete the override as soon as a core release ships the seam | Keeps the consumer moving without forking core TSX, while turning every pain point into a queued core improvement |
| **Promoting a template's custom part (`parts/`) into core** | Keep a brand or domain composition (`conference.Countdown`, `ikea.ProductTile`) inside its template's `parts/`. Promote it into core **only when two or more unrelated templates or products need the same part** (the rule of two), through a reviewed core change with `c.*` tokens | Stops one product's arrangement from bloating core before a second product proves the shape is universal |

## 3. End-to-end procedure

This is the life of **one finding**, from discovery to closure. The order of work in a packet is the [protocol](#0-the-protocol-what-agents-do-in-order): in this repository, steps 1–5 below happen inside P2–P8, and steps 6–7 close the log row.

Every limitation follows these seven steps from discovery to closure:

<ol class="slate-steps">
  <li class="slate-step"><p class="slate-step__title">1. Find</p><p>Check <code>agent/index.json</code>, <code>npx design-library-blocks "&lt;need&gt;"</code>, and steps 1–4 of the seam ladder first. If none fits, you have a step-5 or step-6 finding.</p></li>
  <li class="slate-step"><p class="slate-step__title">2. Log</p><p>Record the finding in the shared log format below <em>before</em> writing a workaround: on the consumer's Library requests page (outside projects) or in the library's request log / replica boundary audit (in-repo).</p></li>
  <li class="slate-step"><p class="slate-step__title">3. Triage</p><p>Apply the triage table below to pick one path: existing seam, generic core seam now, template custom part, or (outside consumer only) temporary scoped override plus an accepted request.</p></li>
  <li class="slate-step"><p class="slate-step__title">4. Fix</p><p>Implement at the lowest owning layer (<code>token → layout → compound → fundamental → template part → content</code>), never on the rendered page. Core seams take neutral names (<code>check:generic</code>) and defaults that preserve every existing look.</p></li>
  <li class="slate-step"><p class="slate-step__title">5. Check, sweep and integrate</p><p><strong>5a. Packet sweep before commit:</strong> run <code>npm run check</code> (or <code>npx design-library-check</code> in a consumer), update stories and <code>npm run agent:index</code>, run <code>npm run check:regression</code> against the frozen base before committing any packet that touches core, a shared token, the library app or a template's shared parts (<a href="replica-rules.md#the-rules">RR3</a>), and pass the independent evaluator (<a href="adversarial-loop.md">adversarial loop</a>). <strong>5b. Parallel worktrees integrate serially:</strong> when templates run in separate worktrees (such as Slack in <code>dl-brand-map</code> and Word in <code>dl-word</code>), integrate one branch at a time and rerun the full sweep on the combined result — every template, including the ones being built compared with their own last scored state — before the next merge or refreeze. If the miss has happened before, add a check or a <em>Rules agents miss</em> row in the same packet.</p></li>
  <li class="slate-step"><p class="slate-step__title">6. Remove the override or custom part</p><p>Switch the template or consumer onto the shipped core seam, delete the temporary CSS/hook override or superseded custom part, and re-verify at wide and 320 px in light and dark.</p></li>
  <li class="slate-step"><p class="slate-step__title">7. Mark it shipped</p><p>Update the log row to <code>shipped</code> with the core version (or commit for pre-release in-repo work), and include the removal step in the release's <code>adopt-&lt;version&gt;.md</code> paste-in brief.</p></li>
</ol>

### Keeping other templates unbroken

The loop guarantees other templates stay intact while a new template is built only when all four rules below hold together (full mechanics in [Replica method and rules](replica-rules.md)):

- **No-breakage guarantee in every packet:** every packet that touches `packages/core`, a shared token, `apps/library` or a template's shared parts runs `npm run check:regression` against the frozen base **before it is committed** ([RR3](replica-rules.md#the-rules)).
- **The frozen base (`npm run regression:freeze`):** before the first source change on a branch, `node ./tools/template-regression.mjs freeze` builds the clean signed-off `HEAD` commit of `apps/library` into `.shots/base-dist` and writes `head`, `frozenAt` and `dirtyFiles` to `.shots/base-dist/BASE.json` (refusing to overwrite an existing base unless `-- --force` is passed; [Commands](replica-rules.md#commands)). Refreeze **only after a clean integration sweep**, recording the new commit in `BASE.json` and the DoD status — never mid-packet or mid-branch. **Only the single template under construction is excluded** (`--exclude <template>`); every other template, including previously signed-off replicas, stays in the sweep.
  - **Refreeze log.** `feat/brand-map` (`dl-brand-map`): **2026-11-12 17:06 +05:30 (`frozenAt` 11:36:44Z), at Slack's signed-off commit `5fc801a`**, on main's instruction after evaluator finding F10 (the earlier base, `38236f8`, predated the Slack sign-off, and the sweep left Slack out). It was built from a clean temporary worktree of that commit (`git worktree add --detach`; `dirtyFiles: 0`; dependencies and the ignored `slate` checkout linked in, never copied from the working copy), and the worktree was removed afterwards. The old base is kept as `.shots/base-dist-38236f8`. `check:regression` now runs `--exclude youtube` only, so Slack and Word are swept. Screen count: see the YouTube Y.2b sweep in the DoD Q145.Y status.
  - **Refreeze log, `dl-integrate` (worker 137), 2026-11-14 16:00 +05:30 (`frozenAt` 10:30:24Z) at `12aafdf`**, after the Q163–Q165 core batch (`0eb95f0`, `7809221`, `e8a84df`, `12aafdf`) and the template-only word-figma merge (`781fe5d`). One sweep vs `855eba6` (`.shots/w137/sweep-137.log`): 1004 screens, 786 identical, 6 noise, 2 catalogue inventory, 210 different, 2 failed with Windows file-permission errors (both re-run clean). It found two regressions, fixed at source and re-checked on the differing screens only (`sweep-137-recheck.log`, `sweep-137-final.log`): Slack's sidebar menus took the new 24 px compact row instead of their 30 px benchmark row (fixed: compact rows only for default-size items; Slack restates its row as `c.list-item.size-compact`), and field icons left their square cell, so search words moved 6–12 px on IKEA, Word, YouTube and Slack (fixed: the cell stays square and the icon sits in it by ink). The 73 pages still different (146 screens), by cause: (1) Select chevrons placed by ink, 10.7 → 8 px from the edge (blog, chat settings, conference, corporate, portfolio, projects, Word backstage, IKEA filter, the library's story pages); (2) dropdown triggers hug their words and chevron, with the edge icon placed by ink (chat model picker, Word Editing and Share and the ribbon dropdowns, the Word status bar zoom, YouTube Filters and Sort, the chat composer); (3) TextField Clear in a square cell (YouTube search, the TextField page); (4) the Button, MenuButton, Select, Toolbar, ScreenPreview, PropertyRow, Type, Icon and brand-icon story pages showing (1) to (3); (5) the All templates page counting word-figma (the merge, not core). No change outside these. Time (min): build 25, sweep 30, re-checks 40, explanation 10.
  - **G10 sweep audit (Worker 135, 2026-11-13 22:20).** `b99c8fb` (core G10 with blog and corporate) differed on 282 of 1046 screens from the `3bb9219` base. By cause:

    | Cause | Screens | Verdict |
    | --- | ---: | --- |
    | Blog and corporate content: new footer destinations, the new About and Policies pages, paging to the archive, Read next | 104 (blog 46, corporate 58) | Intended: the dead controls now work |
    | Library pages of blog and corporate (`lib--blog-*`, `lib--corporate-*`): only the scrollbar thumb at x 1271, as the embedded pages grew | 80 | Intended: follows the content above |
    | `lib--templates`: blog's layout count | 2 | Intended: the new About layout |
    | Footer link to the page shown drops its underline (`aria-current`): portfolio 32, harbour home 2, and the conference "Event", "Schedule", "Tickets" and "Sponsors" pages' own links | part of 96 | Intended: the G10 current mark |
    | **Regression:** footer links marked current because they end in `settings.current` (the header's section), not the page shown. On conference FAQ, Venue, Travel, CFP, Sign in and others, seven footer links to `/home` lost their underline; on portfolio, "About" and "Get in touch" (both `/about`) on every About-section page | rest of 96 (conference 62, portfolio 32 share it) | Fixed at source: the `site-footer` block now marks only links to the layout shown (`blocks.tsx`); conference and portfolio footer links now lead to real pages |

    The next sweep (Worker 135's core batch: G10 correction, G11, G12) is expected to restore those underlines and show the conference and portfolio footer destinations.
  - **2026-11-12 19:53 +05:30 (`frozenAt` 14:23:06Z), at `eed781d`**, the first serial integration (Word `fc089d4` merged into the Slack/YouTube line `8185344`, branch `integrate/word-into-brand-map`, worktree `dl-integrate`). Frozen only after both sweeps were clean: 978 non-Word screens against `5fc801a` with 0 different, and Word's 66 screens against the signed-off Word head `fc089d4` (built in a temporary worktree, removed afterwards) with 66 identical. `dirtyFiles: 0`; 1020 screens (510 pages × light + dark), youtube excluded, so the base now covers Slack, Word and every other template. The old base is kept as `dl-integrate/.shots/base-dist-5fc801a`. Details in the DoD Q150 status.
  - **2026-11-12 22:58 +05:30 (`frozenAt` 17:28:31Z), at `c9e9f4a`** (Worker 115, approved by main at 21:50 on condition that F43 was settled first). Reason: the 9 screens that had differed since the merge were all caused by the `454ebad` build fix (`light-dark()` kept native, so nested `data-scheme` regions take their own scheme): `lib--contextmatrix`, `elevation`, `illustration` and `materials` in both schemes, and `word--dark` light. F43 was settled first. With only the Lightning CSS `light-dark()` polyfill put back in `apps/library/vite.config.ts`, HEAD `c9e9f4a` matches the old base exactly on `word--dark` (2 identical). So neither `974cee5` nor `effa247` caused it. The 632 px are the unavailable (disabled) ribbon commands, Sensitivity and the clipboard pair, in Word's dark region, whose ink now resolves to its dark value. It's an accepted fix, absorbed by this freeze. Built in a clean temporary worktree (`dl-w115-freeze`, `git -c core.autocrlf=false worktree add`, removed afterwards) because the working copy holds 2 files that aren't the builder's (the IKEA `offer-ticket.css` edit and an untracked `zz-plant.css`); `dirtyFiles: 0`. Validated by a full sweep of the working copy against it: 1044 screens (522 pages × light + dark), youtube excluded: 1035 identical, 9 declared noise, 0 different, 5 differing only under parallel load and identical when taken alone. The old base is kept as `dl-brand-map/.shots/base-dist-eed781d`.
    - **2026-11-13 10:51 +05:30 (`frozenAt` 05:21:08Z), at `9f8749a`** (Worker 126, `dl-integrate`), the second serial integration, as one lean batch (Q159): the scorecard L1b/L1c edits committed as `f2ca211`, then `feat/brand-map` (YouTube signed off at `4201072`, which carries `454ebad`) merged as `9f8749a`. One sweep for the whole batch against a base frozen from the clean pre-batch head `cde91e6` (10:32, `dirtyFiles: 0`, the L1 edits stashed): 1044 screens (522 pages × light + dark), youtube excluded (new, so not in the base): 995 identical, 10 declared noise, 22 catalogue inventory, 1 load-only, 17 different, all explained: Word `navigation` and `comments` in both schemes (L1b/L1c heading spacing and avatar ink, as declared), `word--dark` light, `lib--contextmatrix`, `elevation`, `illustration` and `materials` in both schemes (the `454ebad` nested-scheme fix already accepted at `c9e9f4a` above), and `lib--link` and `lib--buttongroup` in both schemes (scrollbar thumb only, x1271–1275: stories added below the fold by the Link plain seam `c9e9f4a` and the ButtonGroup G2/G3 seam `4201072`). The IKEA `offer-ticket.css` edit and `zz-plant.css` stay uncommitted in `dl-brand-map` and are not in the merge. Crops: `dl-integrate/.shots/w126-crops/`. The `cde91e6` and `eed781d` bases in `dl-integrate` were overwritten.
       - **2026-11-13 15:25 +05:30 (`frozenAt` 09:55:08Z), at `a80c7c0`** (Worker 130, `dl-integrate`), the third batch: Slack Q156 (`fe4f343`, merged as `c26d341`), Word Q156 with core G4/G5 (`d4a1fdc`, `7e23976`), then template-only Q156 fixes (YouTube `3651caf`, `bffb471`; Slack `a80c7c0`, no sweep needed under Q159). One sweep against `9f8749a` of the build at `c26d341`: 1044 screens, youtube excluded: 951 identical, 10 declared noise, 6 catalogue inventory, 3 load-only, 77 different, all explained: Slack 28 and Word 30 (both templates' own Q156 work since the base: Slack's click-through, Word's editable page and ribbon commands), `lib--slack-*` 7 pages and `lib--word-parts` (the library pages that show those templates; `word-parts` is the scrollbar thumb only, x1271–1275), `lib--ribbon` both schemes (G4's new "Collapsed to its tabs" story below the fold plus the scrollbar; the existing examples are identical), and `lib--progress` both schemes (the live upload demo counts on a 200 ms timer, so the shot caught "16 of 40" instead of "12 of 40"; its source is unchanged since the base, identical text otherwise). 0 differences on any other template. `dirtyFiles: 0`. Log: `dl-integrate/.shots/w130/sweep.log`.- **The one allowed difference:** new generic core tokens or props appear in the library's own source-derived catalogue, so inventory counts, metadata rows and the scrollbar length that follows on declared `lib--*` pages (`catalogueInventory` in `tools/regression-noise.json`) are allowed **only when every pixel outside those rectangles is identical** (`outsideInventoryExactPixels === 0`; [Allowed differences: catalogue inventory](replica-rules.md#allowed-differences-catalogue-inventory)). Anything else — and any pixel change on a template or rendered component example — is a regression, fixed at its owning source.
- **Parallel templates in separate worktrees:** when two or more templates are built in parallel branches (for example Slack in `dl-brand-map` and Word in `dl-word`), each branch's own clean sweep isn't enough because two clean branches can still collide in shared tokens, core parts or catalogue pages. Integrate **serially, one branch at a time**, and rerun the full sweep on the combined result — comparing **every** template, including each template being built against its own last scored state — before the next merge or refreeze.

## 4. Triage rules

Run these four checks in order; the first match decides where the fix lives:

| If… | Triage outcome | Status set | Rules |
| --- | --- | --- | --- |
| Steps 1–4 of the seam ladder already do it (a missed prop, slot, `data-density`, or allow-listed setting) | **Use the existing seam** in the caller | `declined` (note the existing seam) | Delete any workaround. If agents missed this seam twice, add an example in the guide or *Rules agents miss* |
| A second unrelated product would need it **and** it involves behaviour, keyboard, semantics, formatting or a sealed core part's markup **and** every brand's look reduces to tokens ([three-question rule](templates-and-library.md#the-rule-library-or-template)) | **Fix generically in core** | `accepted` | In-repo templates build it now in core with `check:regression` clean. Outside consumers schedule a core packet for the next beta release |
| Only one product/brand needs this arrangement, and it can be composed from public core exports + `t.<template>.*` tokens without touching sealed core markup | **Custom part in the template** (`parts/`) | `declined` for core (stays step 5) | Must carry a doc comment (`Not for …`), typed props, stories, WCAG 2.2 AA across schemes, 44 px targets and child-path CSS (`check:parts`). Re-open for core only when a second product needs it |
| An outside consumer hits an `accepted` core gap mid-delivery and cannot wait for the next core tarball | **Temporary scoped override + Library request** | `open` / `accepted` | Outside consumers only. Scope to a `data-<project>-*` attribute or template CSS block, add a comment naming `LR#`, never fork core TSX, and write the exact removal step |

## 5. Shared log format and where the logs live

Every logged limitation — whether written by an outside consumer or recorded in this repository — carries the same eleven fields:

| Field | What to write |
| --- | --- |
| **ID** | `LR1`, `LR2`, … for consumer requests; `LG1`, `LG2`, … for deferred in-repo core gaps |
| **Date** | `YYYY-MM-DD` when observed |
| **Need** | What the user or screen requires, quoting the owner or citing the reference screenshot |
| **Exact limitation (with evidence)** | Core version, file and component/token inspected, and why steps 1–4 fail |
| **Ladder step reached** | `Step 5 (custom part)`, `Step 5+ (temporary override)`, or `Step 6 (core seam / promotion)` |
| **Proposed API** | Generic prop, slot, token or component name, its default (preserving today's output), and 320 px / scheme / state behaviour |
| **Override or custom part** | Exact file path and line numbers of the temporary override or template part (`none` when built directly in core) |
| **Owner** | Who owns the next action (`Library core`, `Main triage`, or consumer project name) |
| **Status** | `open` · `accepted` · `shipped` · `declined` |
| **Shipped in** | Package version (`0.5.0-beta.2`) or commit hash (`a0b5dae`); `—` until shipped |
| **Removal step** | Exact edits to adopt the shipped seam and delete the override or custom part |

**Where the two logs live:**

- **Consumer-side log:** each outside project keeps one `Library requests` page using the eleven fields above. DesignUp's canonical log is [DesignUp Library requests](https://github.com/prabinpebam/designup-private/blob/main/docs/site/library-requests/index.md) (`E:\Projects\designup-project\designup\docs\site\library-requests\index.md` on the owner's machine, read-only from this repository).
- **Library-side log:** cross-project consumer requests and deferred core gaps live in the [Library request log](#library-request-log) table at the bottom of this page. Generic core additions built inline during a replica packet are recorded per packet in [Templates and the library](templates-and-library.md) and in that replica's [DoD status cell](definition-of-done.md#owner-instructions) ([RR11](replica-rules.md#the-rules)).

## 6. Definition of Done for a fix

A core fix is **in progress** — never shipped — until all four parts hold:

1. **Core ships with proof:** generic prop/slot/token with unchanged defaults, JSDoc + typed props, stories covering variants, states, light/dark/contrast and 320 px, regenerated `packages/core/agent/` index (`npm run agent:index`), `npm run check` passing, and `npm run check:regression` run against the frozen base before commit (excluding only the template under construction) with 0 unexplained differences outside exact-pixel-verified [catalogue inventory](replica-rules.md#allowed-differences-catalogue-inventory) ([RR3](replica-rules.md#the-rules)).
2. **Parallel branches pass serial integration:** when templates are developed in separate worktrees, branches integrate one at a time and the full sweep passes again on the combined result — comparing every template, including the ones being built against their own last scored state — before the next merge or recorded `regression:freeze -- --force` refreeze.
3. **Workaround is deleted:** the consumer's temporary CSS/attribute/helper override or the templates' superseded custom part is deleted from source, and the screen passes visual and probe checks using only the public seam.
4. **Logs record the version:** the request row is marked `shipped` with its version (and commit) in both this page's log and the consumer's `Library requests` page, and any outside release includes the removal step in its self-contained `adopt-<version>.md` paste-in.

## 7. Feedback into checks and agent guidance

Finding and fixing one component is half the loop; stopping the same class of mistake from happening again is the other half.

- **Two-strike rule:** whenever the same kind of miss occurs **twice** (across replicas, templates, evaluator passes or consumer audits), the packet closing the second occurrence must add an automated gate or agent-index guardrail before it can be marked `shipped`:
  - **Boundary or styling leak** (selecting core `data-dl`, raw scrollbars, brand values in core, child-path violations) → add or tighten a rule in `npm run check` and `npx design-library-check`.
  - **Layout, spacing, state or contrast miss on rendered screens** → add an assertion to the matching browser probe (`tools/*-probe.js` and `@design-library/core/probes/*`).
  - **Existing seam missed by an agent** → add or sharpen a row in `packages/core/AGENTS.md` **"Rules agents miss"** (`Rule | Use | Not | Caught by`) and enrich keywords in `npx design-library-blocks` / `agent/index.json`.

## 8. Ownership and review rhythm

- **Owner:** the **Main triage coordinator** of `design-library` owns the library-side request log and triage status (`accepted` / `declined`), escalating only breaking contract or architecture changes to the product owner. Each consumer project's lead agent owns logging temporary overrides and executing their removal steps on upgrade.
- **Review rhythm:**
  1. **Every replica packet (inline):** the builder lists any new core seam in the boundary audit ([RR11](replica-rules.md#the-rules)), and the independent evaluator verifies both the generic boundary and the regression sweep before passing the packet ([RR12](replica-rules.md#the-rules)).
  2. **Every 30-minute orchestration progress review:** when template or consumer work is active, check that zero temporary overrides or custom parts landed without a matching log entry or manifest registration.
  3. **Before every `@design-library/core` beta or release:** review all `open` and `accepted` rows below and in [DesignUp Library requests](https://github.com/prabinpebam/designup-private/blob/main/docs/site/library-requests/index.md), ship the scheduled `accepted` seams, put their self-contained upgrade + override-removal commands into `docs/adopt-<version>.md`, and verify on a clean copy of the consumer project (DoD Q105.5).

## Library request log

Active cross-project consumer requests (mirrored from DesignUp) and deferred multi-template core findings:

| ID | Date | Need | Exact limitation (evidence) | Step | Proposed API | Override / part | Owner | Status | Shipped in | Removal step |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LR1 | 2026-11-11 | Footer "Editions" list (11 years) in 2 columns under one heading | `FooterSection` (`0.4.0-beta.2`) renders `[data-dl-part='links']` as 1 flex column; `--c-footer-*` private | Step 5+ (override) / Step 6 | `FooterSection.columns?: 1 \| 2` (default `1`, collapses at narrow widths) | DesignUp `web/src/App.tsx` (`data-designup-footer`) + `designup.css:121-133` | Library core | `accepted` | — | Set `"columns": 2` in `shell.json`; delete `designup.css:121-133` and `data-designup-footer` |
| LR2 | 2026-11-11 | Menu and search-list items that navigate support middle-click / open in new tab (`a[href]`) | `MenuButtonItem` and `ListItem` (`0.4.0-beta.2`) render `div` + `onSelect` only, no `href` | Step 5+ (override) / Step 6 | `MenuButtonItem.href?: string` and `ListItem.href?: string` (router-aware `a[href]`) | DesignUp `web/src/lib/overlay-link.ts`, `overlay-link.css`, `LinkMenuButton.tsx`, `SiteSearch.tsx` | Library core | `accepted` | — | Pass `href` to `MenuButton` / `ListItem`; delete `overlay-link.*` and `LinkMenuButton.tsx` |
| LR3 | 2026-11-11 | Focused "Skip to content" pill follows theme corner radius | `css/layouts/library.css:16` `[data-dl-skip]` sets raised fill and padding without `border-radius` | Step 5+ (override) / Step 6 | `[data-dl-skip]` reads `border-radius: var(--radius-md)` (or `--c-skip-link-radius`) | DesignUp `designup.css` ("Skip link: corners follow Controls") | Library core | `accepted` | — | Delete skip-link radius block from `designup.css`; Tab-check under Super soft |
| LG1 | 2026-11-12 | Popup lists snap to `size.width-*` steps (`xs`–`lg`) as documented in [Widths](widths.md) | `fitPopup` and `[data-width]` read `--size-width-xs…lg`, which no token file currently emits ([Templates and the library](templates-and-library.md)) | Step 6 | Emit `size.width-xs…lg` tokens in dedicated sweep packet | Slack `Create` menu copy kept short meanwhile | Library core | `open` | — | Define width tokens, run full `check:regression` sweep, remove copy-length workaround |
| LG2 | 2026-11-12 | `TextField` `xs` height matches `Button` `xs` height exactly | `TextField` box inherits body leading + border (~1.6 px taller than size token) ([Templates and the library](templates-and-library.md)) | Step 6 | Align field box height calculation to size token in dedicated sweep packet | Slack search pill sets explicit 13 px text in part CSS | Library core | `open` | — | Land `TextField` height fix with full `check:regression` sweep; delete Slack search-pill font workaround |
| LG3–LG10 | 2026-11-12 | Scorecard L0 boundary findings: template component-token overrides in token data (LG3); Word onto Popover and DataTable (LG4, LG5); Word regions filled by layout, not an SVG backdrop (LG6); inline SVG checked (LG7); typed custom icon names (LG8); Ribbon `end` change made opt-in or swept (LG9); core-change rows recorded (LG10) | Full fields, evidence and removal steps: [Library scorecard fix list](library-scorecard.md#fix-list-request-log-format); routing and status: [Findings routing](library-scorecard.md#findings-routing-q1524) | Step 1, 6 | See the scorecard | Word `parts/layouts/Window.tsx`, `window.css`; Slack `workspace.css` | Routed by main (Word: Word builder; core: one packet after Word merges) | `open` | — | See the scorecard |

# Hardening method

**Status:** method for review ([DoD Q145](definition-of-done.md#owner-instructions)), written on 2026-11-12 while the owner was away overnight. It governs the Slack replica ([Q143](slack-replica.md)) and the Word and YouTube replicas after it. Strict design: screens, static checks, the build and the regression sweep; no unit or end-to-end tests.

> **TL;DR for agents:**
>
> - **The goal:** prove the Design library can build any interface, on a generic core plus a template customization layer. Universality is a claim to prove, not a fact.
> - **The exercise:** recreate a well-known product until a user can't tell it from the real one at the same window size. Every place where that's hard is a flaw in the library, and that's what we're looking for.
> - **Architecture comes first.** When a template shows that the architecture is wrong, change the architecture and move every existing template onto it in the same piece of work. Never carry technical or architecture debt forward.
> - **Proof of "nothing else moved":** the frozen-base regression sweep. A refactor that moves a template onto the new architecture must come out pixel-identical, unless it fixes a defect that is declared.
> - **Judged by someone else:** the [adversarial loop](adversarial-loop.md). The builder never signs off its own work.

Owner's words, 2026-11-12 02:42 +05:30 ([DoD Q145](definition-of-done.md#owner-instructions)): *"The goal is to prove that the Design library is versatile and you can create anything with it. … The key thing to get right is, what should be defined as part of the core library vs what stays in the customization layer. Do we need to even change this architecture to meet our vision? … Getting the right fundamental architecture overrules everything. Without this we can't scale. … Tech and architecture debt will kill this project as the whole point of the Design library is for anyone to be able to make any UI with this library at the core."*

## The goal

The library is only worth having if anyone can make any interface with it at the core. That needs two layers that each do one job:

| Layer | What it holds | What it must never hold |
| --- | --- | --- |
| **Core** (`packages/core`) | Tokens, fundamentals, compounds and layouts at the right level of abstraction. Generic mechanics, every look driven by a token, and every knob with a default that keeps every existing look | Product names, brand values, one template's composition, or a style restated on every template root |
| **Template layer** (`packages/templates/<template>/`) | The template's theme values (`tokens/theme.json`), pure-JSON content, pictures, and parts in its own namespace that reach their children by child paths | Copies of core mechanics, overrides of sealed fundamentals, or selectors that reach into another component |

"Versatile" is proved one product at a time. A replica passes when, from a design-system point of view, a user can't tell it from the real product at the same window size, region by region. It has to be built on core plus a template layer, every other template has to stay unchanged, and an evaluator who didn't build it has to sign it off.

## The loop that hardens the library

<figure class="slate-figure">
  <svg viewBox="0 0 960 300" role="img" aria-labelledby="hm-title hm-desc" data-slate-svg-motion="viewport" data-slate-safe-margin="24"><title id="hm-title">The hardening loop</title><desc id="hm-desc">Six steps in a loop. 1, pick a well-known product and capture its reference. 2, build the replica on core plus a template layer. 3, every gap is a flaw: decide where it belongs, core or template. 4, if the architecture is wrong, change it and move every template onto it. 5, the regression sweep proves every other template is pixel-identical. 6, an evaluator who didn't build it scores every region; any fail goes back to step 3. When every row passes, take the next product.</desc><g id="hm-s1" data-slate-svg-step="0" data-slate-svg-effect="fade-rise"><rect x="24" y="40" width="280" height="96" rx="12" fill="var(--color-neutral-bg-2)" stroke="var(--color-neutral-stroke-2)" stroke-width="1.5"/><text x="44" y="74" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="16" font-weight="700">1 · Reference</text><text x="44" y="98" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="14">Capture the real product and</text><text x="44" y="118" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="14">measure it into a region spec</text></g><g id="hm-s2" data-slate-svg-step="1" data-slate-svg-effect="fade-rise"><rect x="340" y="40" width="280" height="96" rx="12" fill="var(--color-neutral-bg-2)" stroke="var(--color-neutral-stroke-2)" stroke-width="1.5"/><text x="360" y="74" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="16" font-weight="700">2 · Build</text><text x="360" y="98" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="14">Core plus the template layer,</text><text x="360" y="118" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="14">region by region</text></g><g id="hm-s3" data-slate-svg-step="2" data-slate-svg-effect="fade-rise"><rect x="656" y="40" width="280" height="96" rx="12" fill="var(--color-neutral-bg-2)" stroke="var(--color-neutral-stroke-2)" stroke-width="1.5"/><text x="676" y="74" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="16" font-weight="700">3 · Flaw found</text><text x="676" y="98" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="14">Decide its layer: core seam</text><text x="676" y="118" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="14">or template value or part</text></g><g id="hm-s4" data-slate-svg-step="3" data-slate-svg-effect="fade-rise"><rect x="656" y="180" width="280" height="96" rx="12" fill="var(--color-neutral-bg-2)" stroke="var(--color-brand-stroke)" stroke-width="2"/><text x="676" y="214" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="16" font-weight="700">4 · Architecture first</text><text x="676" y="238" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="14">Wrong? Change it and move</text><text x="676" y="258" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="14">every template onto it</text></g><g id="hm-s5" data-slate-svg-step="4" data-slate-svg-effect="fade-rise"><rect x="340" y="180" width="280" height="96" rx="12" fill="var(--color-neutral-bg-2)" stroke="var(--color-neutral-stroke-2)" stroke-width="1.5"/><text x="360" y="214" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="16" font-weight="700">5 · Sweep</text><text x="360" y="238" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="14">Every other template and page</text><text x="360" y="258" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="14">pixel-identical, light and dark</text></g><g id="hm-s6" data-slate-svg-step="5" data-slate-svg-effect="fade-rise"><rect x="24" y="180" width="280" height="96" rx="12" fill="var(--color-neutral-bg-2)" stroke="var(--color-neutral-stroke-2)" stroke-width="1.5"/><text x="44" y="214" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="16" font-weight="700">6 · Evaluator</text><text x="44" y="238" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="14">Scores every region; a fail</text><text x="44" y="258" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="14">goes back to step 3</text></g><g id="hm-arrows" data-slate-svg-step="6" data-slate-svg-effect="fade" fill="none" stroke="var(--color-neutral-fg-2)" stroke-width="2"><path d="M304 88 H336"/><path d="M620 88 H652"/><path d="M796 136 V176"/><path d="M656 228 H624"/><path d="M340 228 H308"/><path d="M164 180 V160 H700 V140" stroke-dasharray="6 6"/><path d="M330 82 L338 88 L330 94 Z M646 82 L654 88 L646 94 Z M790 170 L796 178 L802 170 Z M630 222 L622 228 L630 234 Z M314 222 L306 228 L314 234 Z M694 146 L700 138 L706 146 Z" fill="var(--color-neutral-fg-2)" stroke="none"/></g></svg>
  <figcaption>Each replica runs this loop until every region passes. A flaw is fixed at its owning layer, and a wrong architecture is changed for every template at once.</figcaption>
</figure>
<details class="slate-figure-data">
  <summary>Data</summary>
  <table>
    <thead><tr><th>Step</th><th>What happens</th><th>Evidence</th></tr></thead>
    <tbody>
      <tr><td>1 Reference</td><td>Capture the real product at the target window and measure it into a region spec</td><td><code>.design-library/&lt;template&gt;-ref/README.md</code> (RR1)</td></tr>
      <tr><td>2 Build</td><td>Core plus the template layer, in seam order</td><td>Routes and side-by-side pairs (RR2)</td></tr>
      <tr><td>3 Flaw found</td><td>Decide the layer with the three-question rule</td><td>Boundary audit in the DoD status (RR11)</td></tr>
      <tr><td>4 Architecture first</td><td>Change the architecture; rework every template onto it</td><td>The rework list in the DoD status</td></tr>
      <tr><td>5 Sweep</td><td>Frozen base against the working copy, every other template and library page</td><td><code>.shots/regression/result.json</code> (RR3)</td></tr>
      <tr><td>6 Evaluator</td><td>Scores every region and probe; fails go back to the builder</td><td>The template's replica tracker</td></tr>
    </tbody>
  </table>
</details>

## Replicas find the flaws

We don't harden the library by guessing what it might need. We pick a product everyone knows, recreate it exactly, and let the real product be the judge. The products are deliberately different, so each one pushes on a different part of the architecture. They are done **one at a time, in this order** (Q145.4):

| Order | Product | What it stresses | DoD |
| --- | --- | --- | --- |
| 0 (done as a trial) | IKEA-style storefront | Brand colour on commerce surfaces, price and promotion patterns, image-led grids | Q137–Q142, [Templates and the library](templates-and-library.md#what-building-the-ikea-template-taught) |
| 1 | Slack desktop and web app | Dense app chrome: rail, sidebar, message list, composer, thread panel, light and dark | [Q143](definition-of-done.md#owner-instructions), [Slack replica](slack-replica.md) |
| 2 | Microsoft Word app | A document canvas inside productivity chrome: the ribbon, command groups, the page surface, panes and the status bar | Its own row, written before any build |
| 3 | YouTube site | A fluid media grid, a video watch page, player chrome and responsive layouts across wide windows | Its own row, written before any build |

Each replica gets its own DoD row **before anything is built**. Its done-when is the Q143 contract: indistinguishable region by region at the same window size, built on core plus a template layer, nothing else breaks, and signed off by an evaluator who didn't build it. The evaluator scores that row first: is every line testable, and is the region list complete?

The rules for a replica are on [Replica method and rules](replica-rules.md) (RR1–RR12): reference first, never from memory; side by side before done; nothing else moves. Pictures, copy, logos and trademarks are never copied. References come only from public material: live public pages for YouTube, and Microsoft's public documentation and support screenshots for Word. We never sign in to real accounts, and every source is recorded.

## Architecture over everything

Getting the fundamental architecture right overrules everything else, including finishing the current replica sooner. Debt is what would stop the library from scaling: a workaround in one template becomes a second pattern, then a fork, and soon "anyone can build anything" is no longer true.

1. **Fix it at the owning layer.** A flaw a replica finds is closed where it belongs, in this order: token, layout, compound, part, content. Never fix it in the rendered page, with an override, with an allowlist entry or by weakening a check.
2. **When the architecture is wrong, change it.** If the right fix needs a different structure (a new kind of layer, a new seam, a different split between core and template), make that change rather than working around it in the template.
3. **Move every template onto it, in the same piece of work** (Q145.3). Every existing template that used the old way (IKEA, design, chat, blog, the rest and the replicas built so far) is reworked onto the new architecture. Leaving one behind is debt.
4. **Prove the move changed nothing you didn't mean to change**, with the sweep (below).
5. **Record it.** The DoD status lists each architecture change, why it was needed, which templates were moved and the sweep's result. If the change alters a contract, update [Foundation](foundation.md#templates-content-and-customization) in the same packet.

Because the working copy is a Git branch, any packet can be rolled back. That's why it's safe to make a structural change overnight, but it's never a reason to skip the proof.

## Core or template: the test

Where a value or pattern belongs is decided by the three-question rule on [Templates and the library](templates-and-library.md#the-rule-library-or-template), with the checks listed in [Checks that keep the boundary](templates-and-library.md#checks-that-keep-the-boundary). The replica-specific rules (no product names or brand values in core, no restating styles on every template root, parts reach only their own children, a gap closed at the right layer once) are RR4, RR7, RR8 and RR11 on [Replica method and rules](replica-rules.md#the-rules). They are not repeated here, so there is only one source to keep current.

## Pixel-identical refactors, proved by the sweep

Moving a template onto a better architecture must not change how it looks. The sweep proves that:

1. **Freeze the base before the first source change** (`npm run regression:freeze`). Never refreeze in the middle of a replica.
2. **Make the change** in core and move every affected template onto it.
3. **Sweep** (`npm run check:regression`): the frozen base and the working copy are captured for every template's layouts and every library page at 1280 px in light and dark, then compared pixel by pixel. Any difference that isn't explained makes it exit 1.
4. **Only two kinds of difference are allowed:** animation noise that has been proved to occur within the same build (`--self`), and the [catalogue inventory exception](replica-rules.md#allowed-differences-catalogue-inventory), where every pixel outside the declared rectangles must be identical. A difference on a rendered component or template is never masked.
5. **A defect fixed on purpose is declared, not hidden.** If the rework fixes a real defect in another template, the DoD status names the screen, the defect, its before-and-after crop, and the evaluator's acceptance. Otherwise, the refactor has to be pixel-identical.

Only one writer runs a sweep at a time: the builder owns `.shots/regression/`, and an evaluator who needs its own sweep agrees a serial slot first.

## Judged by someone else

Every packet goes around the [adversarial loop](adversarial-loop.md). The builder delivers its routes, windows, schemes and states. An evaluator who didn't build it writes the hierarchy tree, runs each framework's probe, scores every region against the measured reference with cropped side-by-sides, verifies the sweep's `result.json`, and sends the fails back. The builder fixes each fail at its owning source, and the loop repeats until every row passes. Only the evaluator's verdict makes a replica done (RR12). Until then, it's "in progress".

## The open question: does the architecture itself have to change?

Today's architecture is tokens, fundamentals, compounds and layouts in core. A template adds theme values, pure-JSON content and namespaced parts on top ([Foundation](foundation.md#templates-content-and-customization)). Slack is testing it now; nothing yet proves it's enough for anything. We treat it as a working answer and watch for these triggers. Any one of them opens an architecture review instead of a workaround:

| Trigger | What it would mean |
| --- | --- |
| A region can't be reached without a selector into a sealed fundamental, or a descendant reach into another component | Core lacks a seam (a slot, a part or a token) at the right level |
| The same template part is built a second time in another template (rule of two) | The pattern belongs in core as a generic compound or layout |
| A template has to restyle a core default that every other template would also need different | The core default is at the wrong level of abstraction |
| `theme.json` can't express what a template needs (structure, density, layout behaviour, not just values) | The template layer needs a new kind of contract, such as layout or density data |
| A whole product class has no layout primitive (Word's page canvas and ribbon, YouTube's fluid grid and player) | Core needs a new layout family, not a template-only build |
| A core fix can't keep every other template pixel-identical without a per-template exception | The seam is mis-split between core and template |

When a trigger fires, the builder writes the proposed change (what moves, why it's generic, which templates are reworked) into the DoD status. It then makes the change in one packet with the sweep, and the evaluator judges the result. The decision is recorded in the [brief](brief.md) decisions.

## Unattended rules

When the owner is away (Q145.2), work keeps going without stopping for clarification:

- **Decide from the reference, and record the source.** When something is unclear, the real product answers it. Write down which screenshot or page decided it. Ask the owner only about a genuine policy blocker: a push, a publication, a remote write, or deleting the owner's data or licences.
- **The mode stays strict design.** Screens, static checks (`npm run check`), the build and the regression sweep. No unit or end-to-end tests.
- **Checkpoint commits are local.** They're allowed on `feat/brand-map` in `dl-brand-map`, so any packet can be rolled back. Never push, and never discard or rewrite the owner's work.
- **Progress is checked, not assumed.** A scheduled check has main look every 30 minutes for new actions, evidence and deliveries. It restarts any stale worker from its handoff and keeps the queue moving (Q145.5).
- **Keep context lean.** Send logs to files, read summaries and failing lines, and look only at cropped regions. Update the handoff and the tracker before a roll-over.
- **One replica at a time,** in the order above. The next one's DoD row is written and scored before its build starts.

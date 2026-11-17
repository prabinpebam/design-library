# Design Library work plan

> **TL;DR:** The owner started foundation execution on 2026-11-06 20:28 +05:30 in show me the UX sooner, work with me. Slices S1-S4 in [Foundation](foundation.md#slice-plan) deliver reviewable results every 15-20 active minutes; Part A/B judgements remain pending. Keep Slate running.

## Goal and limits

Preserve the verified latest-source Craft/Orchestration/Slate setup, translate the owner's universal, AI-first ambition into an inspectable project brief with proposed evidence, and retain the Slate reader.

- **Done when:** Part A and Part B are independently openable, checked as documentation, marked reviewable and reported to original main; stable IDs and prior setup are preserved. Neither architecture nor workflow documentation approval is fabricated.
- **Mode / attention:** **strict design, work with me (rapid design iterations to form the initial structure; owner 20:13)**, 2026-11-07: *"We are in rapid iterations mode where I need to review designs rapidly to form the initial structure."* Screens and variants the owner can open every 15–20 minutes, from the real design system; no tests or hardening. Worker marked `design` through the guard hook. Earlier slices ran in show me the UX sooner (owner, 2026-11-06 20:28).
- **Ownership:** original main is triage-only; this setup is assigned to one implementation worker. No additional chats/subagents.
- **Limits:** workspace-only files, no component implementation, no root Git initialization unless required, no commits/push/publication/remote writes, no deletion of existing work or licenses.
- **Review cadence:** Part A within about 20 active minutes, report before Part B; Part B within about 20 further active minutes. Target 15-20 minutes per reviewable slice; hard ceiling 60 remains enforced. Docs count; invisible scaffolding and status chatter do not.

## Owner's queue

| Item | Mode | State | Reviewable result | Prerequisite | Docs |
| --- | --- | --- | --- | --- | --- |
| Archived (W0–S3c, F2, R1–R3: 18 completed slices) | design / ux-sooner / production-ready | Delivered or verified | [Work plan history](archive/work-plan-history.md#completed-queue-items-w0r3) | Stage 0–1 setup, tokens, shell, core fundamentals and revisions | brief, DoD, foundation, setup |
| F15.BC2: brand map control (owner Q131, Q132, 2026-11-11) | strict design, work with me | Spec delivered for review 2026-11-11; control not built | [Brand colour](brand-colour.md#the-brand-map): columns per colour plus Neutral, 23 parts in seven groups, resolution, presets, [the control](brand-colour.md#the-control). Then, one packet each, screens to review: **A** the board on the [Colour page](http://127.0.0.1:8766/#/colour) and the resolver for the 17 existing parts, live recolour; **B** the new hooks (button ring, brand band and band indicator, feature panel and tint, highlight badge); **C** `colour-config/3` with migration, checks and `tools/colour-probe.js` | Spec first (Q132.3). A needs Board card groups; B needs A; C needs A and B. No tests on unapproved designs | brand-colour, DoD Q131-Q132, foundation colour model |

W0d extends stable IDs/content, not a rewrite of the accepted W0c draft.

## Operating rhythm

**Part B: the project's working agreement, effective for this increment.** Small slices, shown fast, judged by the owner before more is built on them. The agent develops; the owner reviews continuously. A rejection should cost minutes rather than hours. This is an execution rule, not approval of any product design or of Part A's architecture.

<ol class="slate-steps">
  <li class="slate-step"><p class="slate-step__title">Choose one small review question</p><p>One component, one coherent state set, one token decision or one view. Define what the owner will judge before starting; split larger scope. When direction is genuinely open, offer two or three bounded variants, not a giant single bet.</p></li>
  <li class="slate-step"><p class="slate-step__title">Build only to the current mode</p><p>Aim for something new to review in 15-20 active minutes. Design produces a visible proposal, not implementation/tests. Preserve approved components unchanged except for an explicitly reopened design change.</p></li>
  <li class="slate-step"><p class="slate-step__title">Open, mark and send two FYI lines</p><p>Refresh the review surface, reach the slice through normal UI, mark reviewable with the worker clock, and send original main two lines: the link and what changed, then what to try. No approve/change/reject question: reports are FYI, approval is not a prerequisite for continuing, and the owner approves the library as a whole when ready (owner, 2026-11-07 23:21, DoD Q41).</p></li>
  <li class="slate-step"><p class="slate-step__title">Record judgement, then iterate</p><p>Capture the owner's exact dated decision and scope. Change becomes the next small round; Reject restores the affected preview to its last approved state; Approve permits only the explicitly agreed next step/mode.</p></li>
</ol>

### Cadence and work in progress

| Rule | Operational meaning |
| --- | --- |
| Target | New reviewable result ideally every 15-20 **active** minutes. Delivery is not just another status message or the same unchanged link. Docs/variants/decision packets count when the owner can judge them. |
| Hard ceiling | Never exceed 60 active minutes without a new reviewable result; clock warning at 40, required delivery at 60. At risk of missing the target, cut the slice to a usable decision/variant rather than add checks or breadth. Hard ceiling is a fail-safe, not the planning target. |
| Work with me | One builder; packets run back to back through the queue. Approval is not a prerequisite for continuing (owner, 2026-11-07 23:21: "Do not force premature approval. I'll approave all in good time. It's not a prerequisite for execution."): never wait for or ask for a verdict; act on feedback when it arrives. |
| Owner away | Only explicitly authorized unattended work switches attention: time-box work to at most 45 active minutes, still target 15-20-minute reviewable slices and queue each packet for return. No silent mode escalation or promotion while the owner is absent. |
| Unattended parallelism | At most two builders on isolated, nonoverlapping items, staggered deliveries, each independently reviewable; no additional builders or chats in the current one-worker increment. No long chain built on unapproved design. |
| Chat lifecycle | Main is triage-only and stays available. Reuse this worker for same-feature follow-ups; keep chats few, no keeper chats or polling. Review progress every 30 active minutes and honour 90-minute/300-call/two-compaction rollover rules; main never rolls over. |
| Time-box end | Finish with a link, inspectable scope, decision and as-built limits; if unfinished, show the bounded slice and queue remaining scope. Never call delegated/running/unverified work complete. |

### Always-running review surfaces and refresh

| Surface | Address / lifecycle | What the owner can review |
| --- | --- | --- |
| Slate, current | `http://127.0.0.1:8765/`; retain detached handle `design-library-retained-slate`, Node PID 36408 while it remains the correct responsive process. Never restart merely to refresh Markdown. | Intent/specs, Part A, this agreement, decisions, approval/review ledger and evidence. |
| Self-presenting library app, planned | Recommend a second always-running loopback service at `http://127.0.0.1:8766/` once an approved app exists. No service is started or promised there now; inspect port ownership before binding. Framework/start command waits for the approved implementation. | Approved frame plus isolated working specimens. A separate specimen origin may use another safely selected port, not a presumed existing service. |

**Refresh is part of every delivery, not something the owner must request.** For Slate now, the worker reloads the task-owned shared review page and navigates to the changed section before sending the packet. Its reader caches previously loaded content: writing Markdown or sending an unchanged URL alone is not proof of live refresh. This is agent-driven refresh, **not an implemented auto-reload watcher**; do not claim to update the owner's unshared tabs. Never take OS focus or input, copy private browser storage or bypass tab-sharing consent.

The future library app should refresh candidate documents automatically after a successful validated build, preserving frame/navigation/selection and keeping the old specimen until the replacement is ready; build failure shows an honest candidate error. The approved frame never hot-reloads from the working tree or promotes on save. Watcher/disconnected status must be visible with a manual Refresh recovery. Its automatic refresh and second service are planned, not installed by this agreement.

### Three-line review packet

Each delivery to original main uses at most three plain lines, not a code/log dump:

1. Link and what changed.
2. What to inspect and the specific **approve / change / reject** decision requested.
3. Current limits/evidence if material, including anything not implemented; mark the reviewable clock before sending.

Use the official clock with this worker's explicit session identity; preserve roles/starts and never loosen guard limits. Each Part A/Part B delivery receives a separate actual timestamp. A notification of a handoff, a green check or owner silence is not approval.

### Feedback queue and rejection recovery

| Event | Capture and next action |
| --- | --- |
| Chat feedback | Original main queues it for this worker with exact words, affected slice/version and priority. Finish or safely pause the bounded current slice; never quietly widen it with newly arriving ideas. Safety/data-loss issues interrupt immediately. |
| Slate revision/block comment | Treat it as a proposed change, not automatic product approval. Record page/block/revision or comment reference in the feedback queue; reconcile against canonical source before applying, retaining the owner's original wording. |
| Change | Record the requested delta and acceptance question; schedule one small next round. Do not patch unrelated approved items or accumulate speculative fixes. |
| Reject | Restore only the affected preview/artifact/configuration to its last explicitly approved state; preserve rejected proposal and rationale as a nonactive comparison if useful. Do not destructively reset the working tree or discard unrelated owner edits. If no approved product artifact exists yet, withdraw the candidate and return to the approved Slate/spec reference, not a fictional known-good app. |
| Approve | Record exact owner words, date/time, reviewed link and immutable revision/digest, context/scope and allowed next mode. Ambiguous "looks interesting" or a proxy review without owner approval remains pending. |
| Conflicting/stale feedback | Compare it with the currently reviewed version; keep the prior working state and ask main for the scope decision rather than silently overwrite newer direction. |

Queued feedback is recorded in this plan with source/reference, scope, requested decision, status and next slice; the canonical product consequence is recorded in the brief's decision/assumption rows. No separate private planning document becomes an alternative authority.

### Approval ledger

**Approved means explicit owner words with a date and reviewed version/scope.** Delivery, a worker's recommendation, documentation checks and historical acceptance of toolchain setup do not approve a new architecture or product UI. A delegated relay must preserve the owner's words/reference, not invent approval from its own confidence.

| Slice | Review version / link | Owner words and date | Decision / mode consequence | Known-good consequence |
| --- | --- | --- | --- | --- |
| Owner direction F4: devtools-style element picker as the revision anchor | Main's plan (react-grab primitives + @medv/finder; P1 proof, P2 picker, P3 anchor and prompt format); [Library revisions](foundation.md#library-revisions) | 2026-11-07 10:35 +05:30, owner (verbatim via main): "For the revision feature in the Design library: we want a selection mechanism similar to how selection is done in the browser's developer tools. We are free to select any HTML element depending on the position of my mouse. See if there are already established libraries that do this well and we want to just use it. We want to use that selection information as the grounding/anchor where the revision comment is attached so that when I pass this information to the AI agent prompt it has all the content necessary to understand what I'm talking about." Plan approved 10:40: "go ahead and implement this". | **Authorization to implement the plan, not design approval.** ux-sooner, work with me, packets P1-P3; static checks plus the targeted `npm run test:revisions`. The picker replaces R2b's corner boxes. | No promotion. |
| Archived (198 unapproved FYI delivery rows, Nov 6–10) | [Work plan history](archive/work-plan-history.md#fyi-delivery-ledger-unapproved-rapid-iteration-slices) | 2026-11-06 to 2026-11-10 | **Design for review; FYI per Q41.** Moved to archive under Q149. | No promotion. |
For future product slices add a row **before** promotion: stable slice ID, immutable artifact/source digest, link, quoted owner response/reference, timestamp, accepted/excluded contexts, decision and authorized next mode. Approved items are frozen against side-effect restyles under visual-noise; reopening one is a separate scoped decision. For documentation review snapshots, record a content digest/revision reference with approval rather than pretending a mutable live URL is an immutable build.

| Mode transition | Required approval | What may happen next |
| --- | --- | --- |
| design to ux-sooner | Explicit approval of the specified design/context scope and permission for that next mode, recorded with date/version. | Wire that approved slice into the review build; no full suite or unnecessary hardening. |
| ux-sooner to production-ready | Explicit owner sign-off on how that slice looks and works and the next mode. | Targeted checks/DoD hardening, then full suite only when all stage-validation trigger conditions hold. |
| Any mode back to design | Owner reopens appearance/behavior, or a required change needs a new design. | Present the next bounded design round before new implementation. |

**No product tests on unapproved designs.** In this documentation-only increment the owner explicitly requested attribution/link/H1/rendering checks; those are not product test approval. Full suites are never a rapid-review prerequisite and run only in production-ready on their actual risk/release trigger.

Known-good promotion follows Part A only if that architecture is adopted: explicit scope/digest approval, eligible mode checks, coherent artifact, atomic pointer update and prior artifact retained. Approval of one component/context does not promote a mixed working tree or freeze the whole library forever; the approved scope remains the baseline until a separately requested change is approved.

### Archived feedback, stage notes and worker handoffs

Completed feedback items (Part A/B, S1, F1–F8), W0d setup evidence, early W1–W6 stage notes and 44 superseded worker rollover handoffs (Nov 6–10, 2026) live in [Work plan history](archive/work-plan-history.md). Active replica handoffs live in each replica's DoD status cell in [Definitions of Done](definition-of-done.md#owner-instructions).

## Reporting and review

Progress, reviewable results, genuine blockers and final evidence go only to the original main chat via `functions.send_message`, session `agent-host-session://ahp-session/64a60beb-18ae-40a8-9a8f-84ebf716b75c`.

The owner requires the Slate site to stay running at all times. The docs reader is intentionally retained at `http://127.0.0.1:8765/` using the official `node .\slate\scripts\serve-revisions.mjs --repo . --host docs --port 8765` command. Detached handle `design-library-retained-slate`, PowerShell PID 47476, Node PID 36408. Do not stop it after checks or chat completion; preserve an already-responsive correct server. The [setup guide](setup.md) records readiness, recovery and revision storage. This deliberate persistent service is not unfinished bounded work.

Stage 0 was verified on 2026-11-06: latest remote HEADs, installed metadata/copies, root guidance preservation, runtime parity, upstream setup tests, and all five reader routes in normal navigation. Light and dark backgrounds were observed through the reader theme control. Future W1-W4 remain unexecuted.

## Owner decisions pending

- **Revision comment list (C6, 2026-11-07):** keep its look as a small app list (working default), merge it into RowList plus a Disclosure fundamental for the archive (a visible change: a hairline above the first comment, 12 px rows), or give RowList a between-rows hairline option. Details in [Craft skills applied](foundation.md#craft-skills-applied) (C6).
- **Library base temperature:** cool (current, matches v0's measured greys) or the model's default neutral (F7 handoff).

None blocks this documentation increment. O11-O17 recommend self-hosted Inter, Fluent regular and optional versioned integrations, but are working recommendations, not adopted/installed design. Future stages need the core proof, representative inventory, reviewed designs and licence/compatibility evidence; restricted assets stay excluded rather than silently accepted. Unavoidable destructive/remote-write requirements or an approved-feed failure are genuine escalation conditions.

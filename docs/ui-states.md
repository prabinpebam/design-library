# UI states

**In the library:** [Loading](http://127.0.0.1:8766/#/loading), [Notifications](http://127.0.0.1:8766/#/notifications), [EmptyState](http://127.0.0.1:8766/#/emptystate), [Alert](http://127.0.0.1:8766/#/alert), [ErrorSummary](http://127.0.0.1:8766/#/errorsummary), and each control's own page (pending, saved and failed live).

How every change, wait, failure and empty place shows itself, in two parts like every UX framework here ([the two-part frameworks](spacing.md#the-two-part-frameworks)): [the framework](#part-1-the-framework) to build with and [the checklist](#part-2-the-checklist) to judge with. From the agentic-craft `ui-states` skill (the contract and its references, installed in `.github/skills/ui-states/`), owner Q25 (loading at every level) and Q34 (notifications auto-dismiss unless reading must be enforced); written in two parts for Q85.2 (2026-11-09).

## Grounding: what states promise

A person who changes something sees that it took; a person who waits sees what's happening and roughly how long; a person whose action failed is told what happened, what was kept and what to do; a person who finds nothing is told why and what to do. Each of these is shown where it happened, at the smallest scope it affects, and never by colour alone.

## Part 1: the framework

### The method: from the tree, name the event, then its scope

States are decided per node of the same hierarchy tree as spacing and framing ([the method](spacing.md#the-method-hierarchy-first-then-space-and-frames-owner-q93)), never page by page:

1. **For every node whose content can change, load, fail or be empty, name the event:** a *commit* (the person changed a value), a *load* (data arriving), an *operation* (long or multi-step work), an *outcome* away from where the person is, or *empty*.
2. **Choose the scope: the smallest node the event affects** and a concurrent edit could corrupt. Field, component, section, view, app (the last only with a written reason). Lock only that node, only while pending.
3. **Choose the pattern for that scope** (the table below) and apply the timing track through the tokens.
4. **Design failure, empty and recovery at the same node,** in the same wrapper the content uses.
5. **Write the words and the announcement** (the `ui-copy` skill): present tense while pending, past when confirmed, what happened and what to do when failed.

### Scopes and patterns

| Scope | Event | Pattern in this library | Locked while pending |
| --- | --- | --- | --- |
| Field | Commit of one value | TextField, Select, NumberField: commit-colour border, trailing spinner, then a tick; failed: error border, the value kept, Retry and Revert below | That field (`aria-disabled`, focus kept) |
| Component | Commit of one control | Switch, Checkbox, SegmentedControl, Slider, a Button's action, a ListItem's action (`busy`): spinner in the control's own box, or its own border as the arc when there's no room | That control |
| Section | Values saved together; a form sent | The section's action (Button `pending`), an Alert at the section's top on failure, each field at fault marked on the field (`aria-invalid` + its message) | The section's inputs and action |
| View | The view's data replaced | Skeleton in the real layout inside an `aria-busy` region; header and navigation stay live; a refresh keeps the old content with "Updating…" | Nothing the person is using |
| App | The ground under everything changes | A full state with steps, a real percentage and Cancel, only with a written reason | Everything |
| Away | An outcome not visible where the person is | One notification pill at the bottom (`notify`) | Nothing |

### Timing (tokens, never literals)

- **Commit:** pending in the next frame, held at least `duration.confirm-min` (200 ms); confirmed held at least 200 ms; words ("Saved") about `duration.confirm-read`. Behaviour: `useCommit` inside the controls.
- **Load:** nothing for `duration.indicator-delay` (300 ms), then held at least `duration.indicator-min` (500 ms); `count.shimmer-passes` × `duration.shimmer`, then still; past 10 s, say so. Behaviour: `useLoadIndicator`.
- **Outcome:** auto-dismiss pills `duration.notice` (one line) or `duration.notice-long` (two or three), paused on hover, focus and a hidden window; errors and warnings stay until closed (`notify` defaults them to `manual`).

### Principles

1. **Every committed change is confirmed where it happened,** on the component, for at least the 200 ms beat, even when the save is instant.
2. **Locked, never disabled:** a busy control is the same focusable element with `aria-disabled` and `aria-busy`, so focus never jumps.
3. **One indicator per scope:** Skeleton for views and sections of known shape, Progress (inline arc or bar) for components and long work; no second spinner (Q34).
4. **Never shimmer forever:** a few passes, then still; reduced motion never moves.
5. **Errors are scoped, transparent and recoverable:** each says what happened, what was kept and what to do, and offers at least one action (Retry, Refresh, Revert, a link on). A form's error names the fields at fault on the fields themselves; an error about the whole submission (a declined card, a wrong password) says so above the form and marks no field.
6. **Input is never lost:** a failed form shows the person's answers back in their fields ("Your other answers are kept" is shown, not only said).
7. **Empty is never left empty:** an EmptyState fills the content's own wrapper, says why and what to do, and holds still (a silhouette never shimmers).
8. **One pill, at the bottom, at most three:** auto-dismiss for what the person can do without; manual for errors, warnings and any action that exists nowhere else; one line, at most three.
9. **Announce outcomes, not steps:** the one polite and one assertive announcer (`announce`); step text is not live; a progress bar shown on its own has a name.

### Content: the failed state of a form (pure JSON)

A template's form block shows its failed screen state from its content: each field's optional `answer` is the kept answer shown back in the field, and the required fields without one are marked at fault with the block's `enter`/`pick` words. A kept answer that is itself the fault adds `invalid` (the words under the field). A failure about the whole submission gives every field an answer, so no field is marked and the Alert says it's the form's (`data-error-scope="form"`).

```json
{ "id": "email", "label": "Email address", "kind": "email", "answer": "ama.example.com", "invalid": "Check for a missing @ or a typo." }
```

### Never

- `disabled` on a control while it saves; a lock wider than the change.
- A spinner where a skeleton of known shape belongs, or two loading patterns for one wait.
- A shimmer without an `aria-busy` region around it, or one that never stops.
- An error with no way on, or a form error that leaves the fields at fault unmarked.
- A pill for a field's save or a validation error; an error pill that dismisses itself.
- An empty container left blank, or an EmptyState narrower than the content it replaces.

## Part 2: the checklist

Each row passes or fails on a measurement. **DOM** rows are measured by [`tools/ui-states-probe.js`](https://github.com/prabinpebam/design-library/blob/main/tools/ui-states-probe.js) (`window.uiStatesProbe().rows`) at rest and with each screen state shown; **look** rows by an evaluator who didn't build the screen, with the beats watched on the component's own page. Severity follows the `spacing` skill: S1 broken, S2 misgrouped or inconsistent, S3 fragile. A screen passes when no S1–S3 row fails.

| ID | Passes when | How | Severity |
| --- | --- | --- | --- |
| US1 | Every busy control (`aria-busy`) stays focusable and is locked with `aria-disabled`, never `disabled` (a combobox whose list is loading locks nothing) | DOM | S1 |
| US2 | Every shimmering Skeleton is `aria-hidden`, inside an `aria-busy` region, not in an EmptyState, and no animation in it repeats forever | DOM | S2 |
| US3 | Every EmptyState has a title and a reason or an action, spans its wrapper's width, isn't shorter than the wrapper's minimum height, and nothing in it moves | DOM | S2 |
| US4 | Every error (an error Alert, an ErrorSummary, a `role="alert"` with words) has a recovery action inside it or in its section or form; a form's error marks at least one field `aria-invalid` unless it is the whole submission's (`data-error-scope="form"`); every invalid field (or its group) links its message and stays editable | DOM | S1 |
| US5 | At most three pills are visible; error and warning pills are `manual`; every pill's message is at most three lines | DOM, with the pills raised | S2 |
| US6 | Every progress bar shown on its own has a name, and a known one's value is inside its range | DOM | S2 |
| US7 | Every value that can change has pending, confirmed and failed states on its component, and an instant save still shows each for 200 ms | look, on the component's page | S1 |
| US8 | Each state sits at the smallest scope the evaluator can name from the tree (field, component, section, view); nothing app-wide without a written reason | look | S2 |
| US9 | Every error says what happened, what was kept and what to do; every empty state says why and what to do (playful only for first use, cleared and done) | look, with `ui-copy` | S2 |

```js
// Playwright: await page.addScriptTag({ path: 'tools/ui-states-probe.js' })
window.uiStatesProbe().rows; // { US1: { pass, findings, count }, … }
```

### How to run it

Open each screen and each of its screen states (the preview's Screen state control: failed, empty, done), load the probe and read the rows; on the Notifications page raise every pill first. Fix a finding at its owner: the component for a lock or an indicator, the content for a failed form's answers, the story for a library demo.

## Results

**F15.US1 (2026-11-09 about 15:35, Q85.2):** a control case (a disabled busy button, a bare shimmer, a narrow empty state without words, an error without an action, an invalid field without a message, a nameless progress bar) fails US1–US4 and US6 as it should.

- **Templates (168 layouts, 1000 CSS px, panels open):** the form's failed state showed an Alert saying which answers were missing while no field was marked and every field was empty ("Your other answers are kept" was said, not shown). Fixed at the owner: the form block (`packages/core/render/blocks.tsx`) shows the kept `answer`s back in their fields in the failed state and marks the required fields without one, with the block's own words; the content of the ten forms with an error gained their answers (pure JSON, `answer` and `invalid` in the block schema). Subscribe marks the address it couldn't read; Submit a talk, Apply and Create issue mark the missing answers; Payment and Sign in, whose failures are the whole submission's, mark no field and say so. After: no row fails.
- **Library pages (265 routes) and the Notifications page with every pill raised:** ListItem's `busy` action locked clicks but didn't say so: it now sets `aria-disabled` as Button, Switch and Select do (US1). The Skeleton page shimmered outside any busy region: its live examples sit in an `aria-busy` region, as in use (US2). The Alert page's error had no way on: it gained Refresh (US4). Pills: success and info auto, error manual (US5; the pill now carries `data-dismiss`). After: no row fails.

## Sources

- agentic-craft `ui-states` (rules, components, errors, notification pill, shimmer, empty states, accessibility, enforcement), `perceived-performance` (waits and the status line) and `ui-copy` (the words), installed in `.github/skills/`.
- WCAG 2.2 4.1.3 Status messages, 3.3.1 Error identification, 3.3.3 Error suggestion, 2.2.2 Pause, stop, hide.
- This library: [Loading](foundation.md#loading), `useCommit`, `useLoadIndicator`, `notify`, `announce`, `tools/ui-states-probe.js`.

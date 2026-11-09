# Motion and transitions

**In the library:** [Motion and timing](http://127.0.0.1:8766/#/motion), live, with every role, easing and timing.

> **TL;DR:** Motion here does one job: it shows how context and content move from one state to the next. Whatever is present in both states, the same or evolved, **morphs** and never blinks out and back. Most morphs are cheap: the wrapper animates and the content inside cross-fades. Every visual value (colour, border, shadow, radius, size) is **interpolated, never jumped**, at **200 ms** by default; longer durations are named and justified. Where a person is driving a value directly (typing, arrow keys on a number, dragging, selecting), the value changes in the **next frame, with zero latency**, and only decoration may ease. This page is the framework (F15.82), its critique (F15.83) and the [audit of the library](#audit-report) against it with a phased implementation plan (F15.84). Nothing here is approved or built yet.

**Owner, 2026-11-08 20:34 (verbatim, [DoD Q65](definition-of-done.md#owner-instructions)):** *"Develop and entire framework and philosophy around transitions and animations. What I want is a functional transition that conveys how context and content move from one state to the next. I want to rely heavily on morphing of content and content seamlessly and continuously wherever it makes sense. The idea is that if a context/content is present in both state, whether the same or an evolved one, the content should ideally morph seamlessly instead of disappearing and reappearing again. This can become a complex and expensive operation when done and applied everywhere. So, we ca be smart and optimal about it. Many state transition can only transition the wrapper and fake the content within. Various transition of a dialog into a success/error msg etc can all morph into smotth seamless transition by using the same wrapper so that nothing is flickering and breaks seamlessness. Any addition of shadoes, transition of border color, bg color etc should all be animated in value rather than a sudden jump and change in value. We don't want this at the cost of making the experience feel laggy. So we do most of these at 200ms time unless specifically extended where needed and in special places, we might want to completely not have this transition, like while changing the numeric value of an number input using arrow key, any lag in reflecting the value will give a laggy fill. We have to clearly identify wherre 0 latency is expected and not have any transition in such places."*

**Status:** framework **revised after critique** (F15.83) for review (strict design, docs only). The draft (F15.82) was critiqued with the grounding-critic and design-system-auditor checklists; the 15 findings and what each changed are in [Critique and revisions](#critique-and-revisions), and the sections below already carry the changes (marked *revised F15.83*). Shaped by `ground`, `assumptions`, `design-system`, `perceived-performance`, `ui-states`, `performance`, `visual-noise` and `spacing`. Stable IDs: promises **MP**, jobs **MJ**, user-can **MU**, principles **M**, strategies **S**, catalogue **C**, zero-latency **Z**, performance rules **R**, tokens **T**, primitives **P**, done rows **MV**, assumptions **MA**, decisions **MD**, critique findings **K**.

## Grounding: what motion promises

| # | Promise | What breaks it |
| --- | --- | --- |
| **MP1 Continuity** | Anything present before and after a change stays visibly present throughout it; a person can follow where it went. | An element disappears and reappears in a new place; a dialog flashes empty between its form and its result; a wrapper snaps to a new size; a frame where neither state is drawn. |
| **MP2 No lag** | When a person drives a value directly, the screen shows the new value in the next frame. | A number tweening after an arrow key; a slider thumb trailing the pointer; a list animating while the person types into its filter; a highlight that fades in behind the pointer. Measured (*revised F15.83*): the new value is in the DOM before the next frame is presented and no transition runs on it (MV2). |
| **MP3 Every move means something** | Motion only carries a change of state or place, and calms down to nothing at rest. | A bounce, a wobble or a loop with no state behind it; motion still playing with reduced motion on; a shimmer that never stops. |
| **MP4 Cheap** | Transitions hold the frame rate on a mid-range laptop and a throttled phone, and never delay the next input. | Dropped frames during a morph; an interaction's next paint delayed by animation work; a transition blocking a click. Measured (*revised F15.83*): no long animation frame over 50 ms and no layout shift during any catalogue row at 4× CPU throttle (MV4). |
| **MP5 Easy for agents** | One token set and a handful of primitives; an agent picks the strategy from a catalogue, never invents a timing. | A literal `ms` or curve in component CSS; a hand-rolled animation per component; two primitives for one job. |

**Not promised (non-goals):** brand or expressive choreography, illustrations and Lottie files, parallax and scroll-driven storytelling (add-on territory, above the core), physics springs with overshoot (deferred, MD4).

| # | Job (when I…, I want to…, so I can…) | Promise |
| --- | --- | --- |
| **MJ1** | When I change something, I want to see what changed and where it went, so I can trust it took and keep my place. | MP1, MP3 |
| **MJ2** | When I type, drag or step a value, I want the value to be there the instant I act, so I can steer it precisely. | MP2 |
| **MJ3** | When I open, close or move between things, I want to see where they came from and went, so I don't lose context. | MP1 |
| **MJ4** | When motion makes me unwell or distracts me, I want only what carries meaning to remain, so I can use the product comfortably. | MP3 |
| **MJ5** (theme author) | When I tune a product's feel, I want to change timing in one place, so every component follows. | MP5 |
| **MJ6** (agent) | When I build or change a component, I want the right transition chosen by its state pair, so I don't invent one. | MP5, MP4 |

| # | A person can… | Job |
| --- | --- | --- |
| **MU1** | follow any element present in two consecutive states without it vanishing in between | MJ1, MJ3 |
| **MU2** | see a value they drive directly reflect their input in the next frame | MJ2 |
| **MU3** | reverse a change half-way and see it return from where it is, never restart | MJ1 |
| **MU4** | turn motion down (reduced motion) and keep every state change readable, with nothing travelling | MJ4 |
| **MU5** | (theme author) retime the product through tokens alone | MJ5 |
| **MU6** | (agent) find the transition for a state pair in the catalogue and apply it with a primitive and tokens, nothing else | MJ6 |
| **MU7** | **can't** be made to wait for an animation before acting again (negative capability) | MJ2 |
| **MU8** | (*revised F15.83*) act on one, several or all items (remove 40 selected rows, select all, clear a list) and see one coherent change, not 40 animations | MJ1 |
| **MU9** | (*revised F15.83*) with a screen reader or the keyboard, never land on content that is leaving, and hear the new state once | MJ1, MJ4 |

## Part 1: the framework

Like every UX framework here, motion comes in two parts ([the two-part frameworks](spacing.md#the-two-part-frameworks), owner Q85): the sections from Principles through [Performance rules](#performance-rules) are the framework to design with (principles M1–M14, the strategy ladder, the morph catalogue, value interpolation, the zero-latency places, timing, interruption, enter and exit, reduced motion); [Part 2](#part-2-the-checklist) is the checklist to judge with. The method starts from the same [hierarchy tree](spacing.md#the-method-hierarchy-first-then-space-and-frames-owner-q93) as space: for each change of state, find which node of the tree persists (the wrapper that stays), morph that node and fade only what's inside it; a node the person drives directly (a value they type, step or drag) changes with zero latency.

## Principles

| # | Principle | In practice |
| --- | --- | --- |
| **M1** | **Functional, not decorative.** Motion explains a change of state or place. | Every transition answers "what changed, and where did it go?" If it answers nothing, it's removed (visual-noise rule 1 applied to time). |
| **M2** | **Morph-first.** Content present in both states morphs; nothing disappears and reappears. | Identify the persistent element first, then animate only the difference. |
| **M3** | **Same wrapper.** A state change inside a container keeps the container. | A dialog's form becomes its result inside the same box; a button becomes its own progress. Never unmount a wrapper and mount a look-alike. |
| **M4** | **Cheapest strategy that keeps continuity.** | Choose from the [ladder](#the-strategy-ladder) in order; fake the content inside a moving wrapper before reaching for true shared-element morphs. |
| **M5** | **Interpolate every visual value.** | Colour, background, border colour, shadow, radius, opacity and size changes transition; nothing jumps. Geometry stability (spacing rule 9) still holds: a control's size never changes on hover or focus, so there is nothing to interpolate there. |
| **M6** | **Zero latency where the person drives.** | The [zero-latency list](#zero-latency-places) is absolute: the value is drawn in the next frame; only decoration around it may ease. |
| **M7** | **Short.** 200 ms default; nothing a person triggers takes longer than 400 ms. | Longer durations are named tokens with a written reason ([timing](#timing)). |
| **M8** | **Interruptible.** A new state retargets from where things are. | Never queue, never restart, never block input ([interruption](#interruption-and-reversal)). |
| **M9** | **Arrive softly, leave quickly.** | Enter decelerates; exit accelerates and is one step shorter ([enter and exit](#enter-and-exit)). |
| **M10** | **Respect the person's settings.** | Reduced motion removes travel and keeps fades and colour; forced colours keep state legible without colour animation ([contexts](#reduced-motion-forced-colours-and-other-contexts)). |
| **M11** | **Motion never carries meaning alone.** | The end state is fully legible on its own; the animation only explains the path. A missed frame changes nothing a person needs. |
| **M12** | **Morph into a ready state** (*revised F15.83*). | A morph starts when state B is complete. While B is being fetched, A stays and shows its own pending sign (ui-states); never morph into an empty or half-built B and then again into the content (two motions for one change, and a blank moment: perceived-performance principle 3). A skeleton is B only when the wait passes `duration.indicator-delay`. |
| **M13** | **Leaving content is gone for assistive technology at once** (*revised F15.83*). | The outgoing layer becomes `inert` and `aria-hidden` in the first frame; focus inside it moves to the new state's target before that; the new state is announced once through the existing status region, never by the fade. |
| **M14** | **The input decides, not the component** (*revised F15.83*). | The same change can be zero-latency from repeatable input (arrow keys, wheel, drag) and a morph from a single deliberate press: a segmented control's indicator jumps under arrow keys and slides under a click. |

## The strategy ladder

For any change from state A to state B, decide in this order and stop at the first answer that settles it.

1. **Is it a [zero-latency place](#zero-latency-places)?** Then the value changes in the next frame (S0). Only decoration may ease.
2. **What is present in both states?** Name the persistent element: the wrapper, a picture, a title, a value. If nothing is, it's an enter or exit (S4).
3. **Take the cheapest strategy that keeps it continuous:**

| # | Strategy | Use when | How | Cost |
| --- | --- | --- | --- | --- |
| **S0** | Instant | Zero-latency places; theme or density switch; window resize | No transition; `[data-motion="suspend"]` for global switches | None |
| **S1** | Value interpolation | The same element changes property values (colour, border, shadow, radius, opacity) | CSS `transition` on the listed properties, token duration and easing | Paint per frame on the element; cheap for control-sized boxes |
| **S2** | Same-wrapper morph | A container stays and its content changes (form → success, label → "Saving…", trigger → value) | The wrapper animates its size (or holds it); old and new content are stacked in one grid cell and cross-fade | One small layout animation, or none if the size is held |
| **S3** | Reveal and collapse | Content grows or shrinks in place (a disclosure, a field's message, a tree branch) | Grid rows `0fr` ↔ `1fr` (one mechanism in every engine; *revised F15.83*, MD7); content fades | One contained layout animation |
| **S4** | Presence (enter and exit) | Something with no counterpart arrives or leaves (popover, tooltip, toast, dialog) | Opacity plus a small transform from its origin (the anchor, an edge); `@starting-style` and `transition-behavior: allow-discrete` for native popovers and dialogs | Compositor only |
| **S5** | FLIP | An element changes position in layout (insert, remove, reorder, an indicator sliding) | Measure first and last, invert with `transform`, play to zero | One layout read; compositor during play |
| **S6** | Shared element | An element moves across containers or views (card → detail, composer text → sent message) | The View Transitions API with named elements; fallback S7 | Snapshot capture; compositor during play; input lands on the overlay while it plays |
| **S7** | Cross-fade in place | Content is replaced in the same box (skeleton → content, image placeholder → picture, a value refreshed from data) | New content under, old above fading out (no opacity dip) | Compositor only |

**Faking the content (S2, the workhorse; *revised F15.83*).** The owner's "transition the wrapper and fake the content within". The draft stacked old and new content in one grid cell, which holds the wrapper at the larger of the two sizes and then **snaps** to the new size when the old layer is removed: exactly the jump S2 exists to prevent. The revised mechanics:

1. **Measure A** (the wrapper's box), render B with A's content kept as a leaving layer positioned `absolute` over the wrapper's padding box, so only B sets the layout. **Measure B.**
2. **Morph the surface, not the layout,** wherever nothing flows around the wrapper (a dialog, a popover, a pill, a card in a grid cell with a fixed track): the wrapper's visible surface (fill, border, radius, shadow) is drawn by one layer (a `::before` behind the content) that animates `clip-path: inset(… round <radius>)` from A's box to B's; the layout is at B immediately and costs nothing per frame. `clip-path` keeps the radius true (a `scale` would distort it and the border). Its shadow fades in at the end (a shadow can't follow a clip).
3. **Animate the real size** only where neighbours flow around the wrapper (a field's message, an in-flow card), as the one layout animation the [budget](#performance-rules) allows; otherwise **hold the size** (a button's fixed width), which makes the morph free.
4. **Cross-fade the content:** the leaving layer fades out over `duration.quick` (100 ms) with `easing.exit`; B fades in over `duration.change` (200 ms). Text never scales (it distorts); a picture may. A piece shared by A and B (a kept title, a kept Close button) sits outside both layers and moves with S5, so it never blinks.

**A quick chooser for agents** (*revised F15.83*; the full table is above, the catalogue below):

| If the change is… | Use |
| --- | --- |
| A value the person is driving | S0 (check the [zero-latency list](#zero-latency-places) first) |
| A colour, border, shadow or radius changing with a state | S1 |
| A container whose content changes (result, status, label) | S2 through `Morph` |
| Something opening or closing in place | S3 through `Reveal` |
| Something appearing from nowhere or leaving | S4 (native popover and dialog, or `usePresence`) |
| Items moving within a list or a row | S5 through `flip()` |
| One element moving to a different container or view | S6 through `viewTransition()`, else S7 |
| Content replaced in a box of the same size | S7 |

**Avoiding the cross-fade dip.** Two layers at opacity *t* and 1 − *t* let the background show through mid-way (a visible dim). Keep the incoming layer at full opacity under the outgoing one and fade only the outgoing, or blend with `mix-blend-mode: plus-lighter` (what View Transitions do).

## Cost model

Per-frame cost depends on which properties change, not on how fancy the effect looks.

| Class | Properties | Per frame | Allowed |
| --- | --- | --- | --- |
| **Composite** | `transform`, `opacity` (and `filter` on small elements) | No layout, no paint when promoted | Anything that moves, scales or fades, at any size |
| **Paint** | `color`, `background-color`, `border-color`, `outline-color`, `box-shadow`, `border-radius`, gradients through registered `@property` values | Repaints the element's area | Control- and card-sized elements; large surfaces only for a one-shot change, never on hover; shadows on large or many elements fade a pseudo-element's opacity instead |
| **Layout** | `width`, `height`, `block-size`, `inline-size`, `padding`, `margin`, `inset`, grid tracks, `font-size` | Reflows the element, its subtree and what follows it | Within the [layout budget](#performance-rules) only: one small, contained wrapper per interaction |
| **Snapshot** | View Transitions | Capture once, then composite | View-level changes and true shared elements; at most one at a time |

**What each strategy pays for.** S1 and S7 are always affordable. S2 pays one layout animation only when the wrapper's size changes; holding the size (a button's fixed width) makes it free. S3 pays one contained layout animation. S5 pays one forced layout read at the start, so measurements are batched (all reads, then all writes). S6 pays a capture and pauses rendering of the live page while the update runs, so it is reserved for view-level moves where continuity is worth that.

## Same-wrapper morph catalogue

Each row names the persistent element and how the change plays. Durations and easings are the [tokens](#tokens); "reduce" is what remains with reduced motion.

| # | Change | Persistent element | What morphs | Content | Timing | Zero-latency part | Reduce |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **C1** | Dialog: form → success or error | The dialog box | Its surface morphs to the result's size by `clip-path` (S2 step 2: nothing flows around a dialog, so no layout animation); *revised F15.83* (M12): it starts when the result is known; until then the submit button shows its pending state (C2) | Form fades out, result fades in; a kept title or Close moves with S5; focus moves to the result's heading first (M13) | `move` 200 (`move-far` 300 if the size change is large), `standard` | — | Size snaps; content cross-fades |
| **C2** | Button: rest → in progress → done or failed | The button, at a fixed width | Its label cross-fades to "Saving…" and the spinner fades in; done draws a tick, then the confirmed beat holds (`confirm-min`); the `fill` variant grows by `transform: scaleX` | Label cross-fade in one cell | `change` 200; tick 200; fill `move` 200 `linear` | The press acknowledgement (`quick` 100) | Cross-fades only; no sweep, the ring holds still |
| **C3** | Field: rest → focus → invalid → valid | The field box | Border colour (S1); focus ring per Z12; the message below reveals (S3) and grows downward only; the trailing tick or error icon fades and settles | Message text fades with its reveal | `change` 200; reveal `move` 200 | Typing, caret (Z1) | Reveal snaps; colours and text fade |
| **C4** | Switch: off → saving → on | Track and knob | Knob slides (S5-like transform); track colour (S1); the arc runs round the knob while saving | — | `move` 200, `change` 200 | Press acknowledgement | Knob snaps; colour fades |
| **C5** | Checkbox and radio: off → on | The box | Fill colour (S1); the mark is legible in the first frame and settles from 60 % scale | — | `change` 200, mark `quick` 100 | The checked state itself | Mark appears; colour fades |
| **C6** | Segmented control, tabs, nav: selection moves | The selected indicator | Indicator slides from old to new (S5) under a pointer press; *revised F15.83* (M14): under arrow keys it moves at once (Z8) | Text colours change (S1) | `move` 200 | Which option is selected (`aria-selected`, text colour); the indicator itself under keys | Indicator snaps |
| **C7** | MenuButton, Select, popover: closed → open | Trigger stays; the panel enters (S4) | Panel scales 0.96 → 1 from the anchor side with a fade | — | Enter `change` 200 `enter`; exit `quick` 100 `exit` | Keyboard focus into the list | Fade only |
| **C8** | Tooltip: hidden → shown | — | Fade in after `hint-delay` (S4) | — | `quick` 100 both ways | Focus shows it at once (no delay) | Same |
| **C9** | Accordion, disclosure, tree: collapsed → expanded | Header row | Body reveals (S3); chevron rotates | Body fades | `move` 200 | — | Body snaps open; no rotation |
| **C10** | Card → detail view | The card's picture and title | They travel to their place in the detail (S6); the rest cross-fades | Named shared elements only | `shared` 400 `standard` | Back navigation acknowledgement | Cross-fade only |
| **C11** | List: item added, removed, reordered | The list and its other items | Added: reveal and fade in; removed: fade out, then collapse; others slide (S5). *Revised F15.83* (MU8): several at once animate as **one** change (all fade together, one collapse, one slide); past `count.flip-max` changed or visible items, or "select all" / "clear all", the list cross-fades in place (S7) and one status line says how many | — | Fade `quick` 100, collapse and slide `move` 200 | Typing into a filter (Z11) | Snap; fade only |
| **C12** | List → empty | The list's wrapper, at its minimum size (ui-states rule 8) | Last item exits; the empty state fades in, in the same wrapper | Cross-fade in place (S7) | `change` 200 | — | Fade only |
| **C13** | Skeleton → content | The region box | Nothing moves (no layout shift) | Content fades in over the skeleton, then the skeleton is removed (S7) | `change` 200 | — | Fade |
| **C14** | Picture placeholder → picture | The picture box | — | Picture fades in (S7) | `change` 200 | — | Fade |
| **C15** | Notification pills: arrive, stack, update, leave | The stack and every other pill | A new pill rises from the bottom (S4); the others shift (S5); an update cross-fades its text in place and morphs its width (S2) | — | Enter `change` 200 `enter`; shift `move` 200; exit `quick` 100 | — | Fade; others snap |
| **C16** | Page change in the library | The layout (header, navigation) | Only the content region changes; navigation's active fill moves (C6) | Old page fades out completely, then the new page, already at the top, fades in, total ≤ 200 ms (existing `page-out`, `page-in`). **The owner's rule** ([DoD Q20](definition-of-done.md#owner-instructions): *"No cross fade of the content. Complete fadeout first and than fade in the new content."*) wins over the framework's default; F15.83's cross-fade revision was withdrawn in F15.84 (K6) | `quick` 100 out + `quick` 100 in | — | Instant swap |
| **C17** | Dialog, sheet: open and close | — | Dialog fades and scales 0.98 → 1 (S4); a sheet slides from its edge; the scrim fades | — | Dialog `change` 200 `enter`; sheet `move-far` 300 `enter`; exits one step shorter, `exit` | Escape closes at once (exit never blocks focus return). *Revised F15.83:* a native `dialog` or `popover` exit needs `transition-behavior: allow-discrete` on `display` and `overlay`; where an engine lacks `overlay`, the exit is instant (accepted, MA8) | Fade only |
| **C18** | Chat: composer text → sent message; thinking → answer | The text; the reply row | Sent text travels into its bubble (S6, else S7); the thinking row becomes the message in the same wrapper (S2) | Streaming text appends with no per-word fade | `move` 200 | Typing in the composer; streamed text (Z13) | Fade only |
| **C19** | TagInput: typed text → tag | The text | The tag's fill and remove button fade in around the text, which doesn't move | — | `change` 200 | Typing | Same |
| **C20** | FileUpload row: queued → uploading → done | The row | Progress fill (`scaleX`, `linear`); tick on done | Status words cross-fade | `move` 200 per update, `change` 200 | — | Fill snaps per update |
| **C21** | Calendar zoom: days ↔ months ↔ years (Q50) | The chosen cell | The grid scales from or to the chosen cell and cross-fades (S2 + S4) | Grids stacked in one cell | `move` 200 | Arrow keys between cells (Z8) | Cross-fade only |
| **C22** | Sidebar → rail and back | The navigation | Labels fade out first, then the width animates (S2 inside the layout budget), icons stay put | — | `quick` 100 then `move` 200 | — | Snap, labels fade |
| **C23** | Carousel, board card, splitter: drag and release | The dragged item | While dragging it follows the pointer (Z5); on release it settles into place (S5); displaced neighbours slide | — | Settle `move` 200 | The drag itself | Settle snaps |
| **C24** | Count badge: 0 → 1, n → m | The badge | It enters with scale and fade at 0 → 1 and leaves at → 0 | The number changes at once (Z10) | `change` 200 | The number | Fade only |
| **C25** | Theme, contrast, shape or space option switched | The whole page | One root cross-fade (S6 on the root), else instant | — | `change` 200 | — | Instant |
| **C26** | Determinate progress from data | The bar | Fill glides to the new value (S1 on `transform`), retargeting on each update | — | `move` 200 `linear` | — | Snaps per update |
| **C27** | Inline edit: text → field → text | The text | The field's border and fill fade in around the text, which doesn't move or reflow | — | `change` 200 | Typing | Same |
| **C28** | Stepper or wizard: step n → n + 1 | The step frame | Body cross-fades with an 8 px shift in the direction of travel; the step indicator moves (C6) | — | `change` 200 | — | Fade only |

## Value interpolation: nothing jumps

Every visual property that changes with a state transitions with `duration.change` and `easing.standard` unless a row below overrides it:

| Property | Transition | Note |
| --- | --- | --- |
| Background and fill, text colour, icon colour | `change` 200 | Includes hover, pressed and selected tints (state layers). |
| Border colour, outline colour | `change` 200 | Width stays fixed (spacing rule 9). |
| Shadow (elevation) | `change` 200 | Large or many: a pseudo-element holds the shadow and fades its opacity. |
| Radius | `change` 200 | Shape option changes are global switches (C25), not per-element transitions. |
| Opacity | `change` 200 in, `quick` 100 out | |
| Size and position of a persistent wrapper | `move` 200 | Only through S2, S3 or S5. |
| Press (scale, tint) | `quick` 100 in, `change` 200 out | The first 100 ms must show the press (perceived-performance's acknowledgement). |
| Focus ring | In: 0 (Z12); out: `quick` 100 | Where focus is must be known in the next frame. |
| Gradients and angles | Through registered `@property` custom properties | e.g. the AI processing ring (Q56). |

**Never:** `transition: all` (it animates layout and theme switches by accident); a transition on a property that doesn't change with a state; a transition fired by first paint (styles applying on load) unless deliberate through `@starting-style`.

## Zero-latency places

Here the value a person drives is drawn **in the next frame**, with no transition, no tween and no delay. Decoration around it (a hover ring on a slider thumb, a field's focus ring leaving) may still ease. Each row says why.

*Revised F15.83:* **decoration** means anything that is not the value, its position, or the mark of where focus, the active option or the selection is (K7: the draft left it undefined, so it couldn't be checked). **Showing is not saving:** a continuous-value control (Z2–Z4) draws every step at once and is **never locked between steps**; ui-states' commit (pending, then confirmed) runs once, after `duration.commit-pause` without input or when focus leaves, and its pending lock covers only that commit (K5).

| # | Place | Instant | Why | May ease |
| --- | --- | --- | --- | --- |
| **Z1** | Typing in any text entry (TextField, TextArea, composer, TagInput text, Mentions, OTP, InlineEdit) | Characters, caret, deletion, paste, IME composition, autocomplete's inline text | Typing is echoed locally, never delayed (perceived-performance principle 1); any lag reads as a slow machine | The field's border and focus ring |
| **Z2** | NumberField: arrow keys, hold-to-repeat, wheel, drag-to-scrub, stepper buttons | The number shown and the value applied | The owner's example: lag here makes stepping feel laggy and overshoot | Stepper button press tint |
| **Z3** | Slider, range, AllocationSlider: drag, keys, track press | Thumb position, fill and the value text | Direct manipulation: the thumb is the pointer | Thumb's hover and focus ring |
| **Z4** | Colour picker: 2-D area, hue and opacity sliders, hex entry, swatch preview | Handle position and the previewed colour | Direct manipulation; the preview is the value | Handle ring |
| **Z5** | Dragging anything: board cards, list reorder, carousel, splitters, scrubbers, a playhead | The dragged item's or handle's position | It must stay under the pointer or finger; a lag detaches it | Neighbours making room (C23), the settle on release |
| **Z6** | Pane and column resizing; window resize | Sizes and reflow | Layout follows the hand or the window; a size transition here lags and wastes frames | Nothing |
| **Z7** | Scrolling | Scroll position from wheel, touch, keys and the scrollbar thumb | Native scrolling only; no smooth-scroll hijack | Scrollbar thumb's fade (existing) |
| **Z8** | Keyboard movement inside a widget: listbox, menu, grid, calendar, tree, tabs with arrows | Which option is active (focus or `aria-activedescendant`) and its highlight; scrolling it into view | Arrow keys repeat fast; a highlight that glides trails behind the key | Nothing: under keys a segmented control's or tabs' indicator moves at once too (M14; it slides only under a pointer press, C6) |
| **Z9** | Pointer hover across a collection: menu items, list rows, table rows, calendar cells, chart points | The highlight under the pointer, in and out | A sweep across rows leaves a trail of fading fills (noise) and the highlight lags the pointer | Nothing. *Revised F15.83* (K12): a **collection** is a set of same-kind items a pointer sweeps across (roles `menu`, `listbox`, `grid`, `tree`, table rows, calendar cells, chart marks). Buttons in a toolbar, button group or segmented control are standalone and keep the 200 ms tint |
| **Z10** | Live counts and readouts tied to input: character and word counts, "3 selected", a slider's value label, a timer, a level meter | The number | A number mid-tween is a false value (ui-states "be true"); counts must match what was typed | A badge's arrival at 0 → 1 (C24) |
| **Z11** | Filtering and search-as-you-type | The results list's contents | Items animating in and out while the person types shuffle under their eyes and lag the keys | A region "Updating…" sign past 300 ms (perceived-performance) |
| **Z12** | Keyboard focus arriving | The focus ring on the newly focused element | "Where am I" must be answered in the next frame (WCAG 2.4.7) | The ring leaving the previous element (`quick` 100) |
| **Z13** | Streaming text (AI replies, logs) | Appended text | Reading position must not wait; per-word fades shimmer across a growing block | The caret or cursor mark |
| **Z14** | Selection by pointer or keyboard: text selection, row and cell selection, a checkbox's checked state, a chosen option | The selected state | It's the person's own act; the state must be true at once | The selection fill's colour (C5, C6 decoration) |
| **Z15** | Undo and redo | The restored content | The person is comparing before and after | Nothing |
| **Z16** | Zoom and pan on a canvas or picture (pinch, wheel, keys) | The transform | Direct manipulation | Momentum after release |
| **Z17** | Press acknowledgement on any control | The pressed look must start in the first frame | perceived-performance: acknowledge within 100 ms | Its release (`change` 200) |
| **Z18** | Global switches: theme, contrast, space, shape, density, language and direction | Every token value | Hundreds of per-element transitions firing at once lag and finish out of step; done as one root cross-fade (C25) or instantly | The single root cross-fade |
| **Z19** | First render of a page or region | Initial values | Styles applying on load must not animate from defaults | Deliberate entrances through `@starting-style` |
| **Z20** | Keyboard shortcuts and commands (bold, toggle a panel, duplicate, delete) | Their effect on the content | The person issued it and may repeat it at key-repeat speed | A panel's own reveal (C9, C22) when it opens from a shortcut, retargeting on repeat |
| **Z21** | Marquee and lasso selection; a drawn rectangle or path | The marquee's edges and what it selects | It is the pointer | Nothing |
| **Z22** | Overlays that follow the pointer: a chart's crosshair and readout, a drag preview, a cursor-tied hint | Their position and value | Following the pointer is their job; easing detaches them | Their arrival and departure (`quick` 100) |

## Timing

**Default: 200 ms** (`duration.change`, `duration.move`), the owner's number. It is fast enough to stay under the Doherty threshold (~400 ms) with room, and long enough for the eye to track a move. With a decelerating curve (`easing.standard`), most of the change happens in the first 100 ms, so a 200 ms transition still acknowledges within perceived-performance's 100 ms.

| Token | Value | Use | Why it differs from 200 ms |
| --- | --- | --- | --- |
| `duration.instant` | 0 | Zero-latency places (Z) and global switches without a cross-fade | The person is driving the value |
| `duration.quick` | 100 ms | Press in; a checkbox mark settling; content leaving inside a morph; popovers, tooltips and a focus ring leaving (*revised F15.83*: one role, was `press` and `fade-out`) | A press must complete inside the 100 ms acknowledgement; leaving is one step shorter because the person already decided, and old content must clear before new content reads |
| `duration.change` | 200 ms | Every value interpolation (S1), fades in (S4, S7) | Default |
| `duration.move` | 200 ms | Transforms and size within a component or a nearby wrapper (S2, S3, S5) | Default |
| `duration.move-far` | 300 ms | A wrapper or surface travelling far: a sheet from the window's edge, a dialog changing size by more than about a third of the viewport | Distance: the same speed over a longer path needs longer, or it reads as a jump |
| `duration.shared` | 400 ms | Shared-element morphs between views (C10) | Two things move at once across the screen; the eye needs time to link them. The ceiling for anything a person triggers |

**Rules.** Exits use the next shorter step (`move-far` → `move`, `change` → `quick`). Durations never scale with a list's length. Nothing a person triggers lasts longer than `duration.shared` (400 ms). Loops (spinners, shimmer, the AI ring) are not transitions: they keep their own state-timing tokens (`duration.shimmer`, `duration.ai-turn`).

**With ui-states' beats** (*revised F15.83*, K4). The draft added each morph before each beat (200 + 200 + 200 + 200 ms for an instant save), double the ~400 ms ui-states intends. Now **a beat starts when its state is legible**, which for a front-loaded fade is half-way through it: pending morphs in over `duration.quick` (it must acknowledge at once) and is legible from about 50 ms; confirmed morphs in over `duration.change` and is legible from about 100 ms. An instant save therefore reads in about 50 + 200 (pending) + 100 + 200 (confirmed) ≈ 550 ms. Timing tokens (`confirm-*`, `indicator-*`, `notice*`) keep their values with reduced motion; the morphs between them fade instead of travelling.

**Easing.**

| Token | Curve | Use |
| --- | --- | --- |
| `easing.standard` | `cubic-bezier(0.2, 0, 0, 1)` | Anything changing or moving within the screen; front-loaded so the change reads at once |
| `easing.enter` | `cubic-bezier(0, 0, 0, 1)` | Arriving (S4 enter, sheets, toasts): fast in, gentle landing |
| `easing.exit` | `cubic-bezier(0.3, 0, 1, 1)` | Leaving: gentle start, fast out of the way |
| `easing.linear` | `linear` (new) | Determinate progress fills, loops, the outgoing layer of a cross-fade |

## Interruption and reversal

- **Retarget from the current value, never restart.** A new state starts from where the old transition is. CSS transitions do this natively (and shorten a reversal in proportion to how far it got), so **state changes use transitions, not keyframe animations**, which restart.
- **Script-driven animations (FLIP, Web Animations) read the current visual state** (`getBoundingClientRect` includes transforms; `getComputedStyle` gives current values), cancel the running animation, then start from there.
- **The latest state wins.** No queue of animations; a burst of changes plays only toward the last state.
- **Never gate input on an animation.** Controls are usable during and after a transition; no logic waits for `transitionend` (it may never fire: interrupted, hidden or reduced).
- **View Transitions:** starting a new one skips the running one to its end state; acceptable only for view-level changes, which is why S6 is never used inside a control.
- **Focus during a morph:** focus moves to the new state's target at the start of the morph, not after it (C1's success heading; C17's dialog first control), and before the leaving layer becomes `inert` (M13), so it never falls to the page.
- **Failure branches** (*revised F15.83*, K8): a morph interrupted by a failure retargets to the failed state from where it is (a button half-way to "Saved" turns to its failed state, never plays "Saved" first); a View Transition whose update throws still applies whatever the update did and skips the animation; a component unmounted mid-morph cancels its animations and leaves no `will-change`, listener or leaving layer behind; a morph whose target never arrives is not a morph: A keeps its pending sign until ui-states' slow and timeout rules apply.

## Enter and exit

- **Asymmetry.** Enter: `easing.enter`, the full duration, from the origin the element relates to (a popover from its anchor, a toast from the bottom, a sheet from its edge). Exit: `easing.exit`, one step shorter, opacity first; it never delays what comes next: the next thing may enter while the old leaves.
- **Origins are logical:** they mirror in right-to-left.
- **Small travel:** entering surfaces move at most `space.4` (16 px) or scale from 0.96 (popover) or 0.98 (dialog); nothing flies across the screen except S6.
- **No stagger in the core** (*revised F15.83*, K9). A cascade of items arriving one after another says nothing about state or place, delays the last item and is choreography (a non-goal). Items that arrive together appear together; an add-on may stagger above the core.

## Reduced motion, forced colours and other contexts

| Context | What remains | What goes |
| --- | --- | --- |
| **Reduced motion** (`prefers-reduced-motion: reduce` or `[data-motion="reduce"]`) | Opacity and colour transitions (`change` and `quick` keep their values), cross-fades replacing every travel, all ui-states beats | Travel, scaling, sliding, rotating, size morphs (they snap), parallax, View Transition movement (cross-fade only), loops (spinners hold or become dashed, shimmer stops) |
| **Forced colours** | State is legible from system colours and outlines; transitions may run but carry nothing | Shadow-based rings and colour fades as cues (Q55's ring falls back to an outline) |
| **Global switches** (theme, contrast, space, shape, density, direction) | One root cross-fade, or none | Per-element transitions (`[data-motion="suspend"]` during the switch) |
| **Hidden or background tab** | — | Loops pause; nothing animates while invisible |
| **First paint** | Deliberate entrances only | Transitions from default values on load |

**Why reduced motion keeps fades:** vestibular discomfort comes from movement, scaling and parallax, not from opacity or colour changing in place (WCAG 2.3.3, and the platform guides replace slides with dissolves). Today's tokens collapse every duration to 0 under reduced motion, which also removes colour fades; the token proposal below fixes that.

## Performance rules

| # | Rule |
| --- | --- |
| **R1** | Anything that moves, scales or fades animates `transform` and `opacity` only. |
| **R2** | Paint properties (colour, border, shadow, radius) animate only on elements up to about a quarter of the viewport's area (*revised F15.83*, K10: "control- and card-sized" was untestable); larger surfaces only in a one-shot change, never on hover; shadows on large or many elements fade a pseudo-element. |
| **R3** | **Layout budget:** at most one layout-animating wrapper per interaction, at most `move-far`, with at most about 150 elements in its subtree and nothing but its following siblings reflowing (*revised F15.83*, K10), containing its reflow (`contain: layout`, never `contain: paint`, which clips: [Clipping](foundation.md#clipping)); never inside lists, tables or virtualised regions. Otherwise use S2's surface morph, S5 or S3. |
| **R4** | No `transition: all`; every transition lists its properties. |
| **R5** | `will-change` only while animating, set and removed by the primitive; never in resting CSS except for continuous loops. It creates a stacking context ([Layers](foundation.md#layers-z-index)). |
| **R6** | Loops stop when invisible or finished (shimmer's three passes; spinners on hidden elements). |
| **R7** | Concurrency: one layout animation and one View Transition at a time; compositor animations only for the elements the change touched (no stagger in the core). |
| **R8** | No per-frame JavaScript tweening for what CSS or Web Animations can do; FLIP batches all reads before writes. |
| **R9** | Animations never gate logic or input (see interruption). |
| **R10** | Lists animate only items the person changed, capped (proposed 30 visible items); first render and refresh never animate items in. |

**How to verify (proposed, nothing measured yet):** a static check `check:motion` (below); in the browser, DevTools' Performance panel during scripted transitions (no layout or paint per frame where R1 applies; no long animation frames over 50 ms; layout shifts 0), Rendering's paint flashing and layer borders, and the Animations panel at 10 % speed to review continuity frame by frame; the same on a 4× CPU-throttled profile. Budgets are proposals for the `performance` skill's benchmark, not results.

## Tokens

Proposed DTCG additions and changes (to be built in Q65.4 through `tokens.json` and `npm run tokens`; nothing changed yet).

| # | Token | `$type` | Value | Reduced motion | Change |
| --- | --- | --- | --- | --- | --- |
| **T1** | `duration.instant`, `fast`, `medium`, `slow` | duration | 0, 100, 200, 300 ms | Unchanged (scale only) | Existing; becomes the private scale, no longer read by components |
| **T2** | `duration.xslow` | duration | 400 ms | Unchanged | New scale step |
| **T3** | `duration.quick` | duration | `{duration.fast}` | Kept | New role (*revised F15.83*: merges the draft's `press` and `fade-out`: same value, same reduced-motion behaviour, one job, the short side of a change) |
| **T4** | — | — | — | — | Withdrawn in F15.83 (merged into T3) |
| **T5** | `duration.change` | duration | `{duration.medium}` | Kept | New role (colour, shadow, border, radius, opacity) |
| **T6** | `duration.move` | duration | `{duration.medium}` | 0 | New role (transform, size) |
| **T7** | `duration.move-far` | duration | `{duration.slow}` | 0 | New role |
| **T8** | `duration.shared` | duration | `{duration.xslow}` | 0 (cross-fade at `change`) | New role |
| **T9** | `easing.linear` | cubicBezier | `[0, 0, 1, 1]` | — | New |
| **T10** | `transition.change`, `transition.move`, `transition.enter`, `transition.exit` | transition (DTCG composite) | duration + delay 0 + easing | Follows its duration | New recipes so components read one token per kind. *Revised F15.83* (K11): a recipe aliases a role the reduced-motion context overrides, so `tools/token-contexts.mjs` must echo it into each motion context (as it already does for `c.button.fill-move`), or it would keep the 200 ms value under reduce |
| **T11** | `motion.enter-scale` 0.96, `motion.dialog-scale` 0.98, `motion.enter-rise` `{space.4}` | number, dimension | as named | 1, 1, 0 | New |
| **T12** | — | — | — | — | Withdrawn in F15.83: no stagger in the core (K9) |
| **T13** | `count.flip-max` 30 | number | as named | — | New |

**Reduced motion context** (`tokens.motion-reduce.json`) overrides only the movement roles (T6–T8, T11) instead of the scale, so colour and opacity changes keep their 200 ms fade.

**Migration** (*revised F15.83*, K11): components that read the scale today (`duration.fast`, `medium`, `slow`, directly or through `c.*` and `page-*` aliases) move to the role that names their job; the [audit](#audit-report) lists each read. Until then the scale stays reduced to 0 under reduce, so nothing changes by surprise.

## Primitives to come

The implementation (Q65.4) builds these; the tiers follow [Tiers](foundation.md#tiers-what-belongs-where).

| # | Primitive | Tier | Job | Sketch |
| --- | --- | --- | --- | --- |
| **P1** | Transition recipes | 0 (tokens, CSS) | S1 everywhere | Components write `transition: background-color var(--transition-change), border-color var(--transition-change)`; generated from T10 |
| **P2** | `[data-motion]` root attribute | 0 | Contexts | `reduce` (existing), `suspend` (new: zero every duration during a global switch). *Revised F15.83:* set **before** the switch's attribute change in the same task, removed after two animation frames, so the style change that applies the new tokens is computed with 0 durations |
| **P3** | `Morph` | 1 (fundamental, sealed) | S2 same-wrapper morph | `<Morph state={key} size="surface" \| "layout" \| "hold">children</Morph>` (*revised F15.83*): keeps the leaving content as an `absolute`, `inert`, `aria-hidden` layer, cross-fades it with the incoming content; `surface` (default) morphs its surface layer by `clip-path` (S2 step 2), `layout` animates its real size within R3, `hold` keeps its size; retargets on a new key; the element and its key stay the same across states (MA7) |
| **P4** | `Reveal` | 1 | S3 | `<Reveal open={bool}>`: one mechanism everywhere, grid rows `0fr` ↔ `1fr` (*revised F15.83*, MD7: `interpolate-size` is not in every engine and a second path would be a redundant variant); closed content `inert` |
| **P5** | `usePresence` | 0 (behaviour) | S4 for elements React mounts and unmounts | Keeps an element mounted through its exit; `data-presence="enter" \| "exit"`; native popovers and dialogs use `@starting-style` and `allow-discrete` instead, no script |
| **P6** | `flip()` and `useFlip` | 0 | S5 | Pure module: record rects, apply inverse transforms with Web Animations, cancel and restart from the current rect, capped by T13 |
| **P7** | `viewTransition(update, { types })` and `shareName(el, name)` | 0 | S6 | Feature-detects the View Transitions API; falls back to running the update with S7; reduced motion: swaps in the same frame (ID1; `reducedMotion: 'fade'` keeps a cross-fade only); skips if one is running; names assigned only for the transition's life (no collisions) |
| **P8** | `check:motion` | Tooling | Enforcement | See below |

Components never import P5–P7 to invent new effects: each catalogue row (C1–C28) names the primitive it uses.

## Enforcement

`npm run check:motion` (static, like `check:layers` and `check:clipping`) would fail on: a literal duration or curve in core or app CSS or TSX; `transition: all`; a transition or animation on a selector named in the zero-latency allow-list (Z rows map to components and their selectors); a layout property in a transition list outside a named allow-list (the R3 budget, with reasons, like `clipping-allow.json`); `will-change` in resting CSS outside loops; a keyframe animation used for a state change instead of a transition; a component reading the private duration scale (T1) instead of a role. A browser probe would script each catalogue row and report long animation frames and layout shifts. *Revised F15.83* (K2): the probe also drives each Z row (a key, a wheel step, a pointer move) and fails if the new value is not in the DOM within the same task or if any running transition or animation targets the value's element and property (`element.getAnimations()`), which makes MP2 checkable.

## Assumptions and risks

| # | Assumption or risk | Kind | Impact if wrong | Evidence today | Criterion | Cheapest check | Changes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **MA1** | 200 ms with a front-loaded curve reads as instant enough for hover and press | Usability | High (MP2) | Anecdote (common system defaults) | The owner, on the demo, doesn't call any control laggy | Owner review of the morph demos | Shorten `change` or exempt hover |
| **MA2** | Same-wrapper morphs (P3) stay within the layout budget on a throttled phone | Feasibility | High (MP4) | None | No long animation frame over 50 ms during C1 at 4× CPU throttle | One probe on the Dialog story | Hold size (no size animation) or use scale |
| **MA3** | The View Transitions API is available in the target browsers (same-document) | Feasibility | Medium (C10, C25) | Cited, not checked here | Chromium, Safari and Firefox current releases run `document.startViewTransition` | Read the compatibility tables | S7 fallback everywhere |
| **MA4** | Keeping fades under reduced motion is comfortable for people who set it | Usability | Medium (MP3) | Platform guides | No reviewer with the setting reports discomfort | Ask; compare with platform behaviour | Shorten or remove fades under reduce |
| **MA5** | Agents choose the right catalogue row without help | Usability (agent) | Medium (MP5) | None | An agent given three new state pairs picks the documented strategy each time | One trial prompt | Add a decision table per component family |
| **MA6** | Input is not blocked while a View Transition plays | Feasibility | High (MU7) | Unknown | A click during C10 reaches its target | Try it in each engine | Restrict S6 further or shorten it |
| **MA7** | (*Added F15.83*, K3) Components can keep the **same DOM element** for the wrapper across states; today several return a different root per state (a conditional early return), which unmounts the wrapper and makes any morph impossible | Feasibility | High (MP1, every S2 row) | None; the audit will count | Each catalogue component renders one root whose element and key don't change with state | Read each component in the audit (F15.84) | Restructure those components before any motion work; P3 depends on it |
| **MA8** | (*Added F15.83*) Exit animations of native `dialog` and `popover` (needing the `overlay` property) are missing in some engines; an instant exit there is acceptable | Viability | Low (C7, C17) | Cited | The owner accepts an instant exit where unsupported | Owner review | Script-driven exits through P5 instead |
| **MA9** | (*Added F15.83*) Front-loaded 200 ms fades plus instant collection hovers don't read as two inconsistent hover patterns (H4) | Usability | Medium (MP3) | None | The owner doesn't notice a difference in kind between a toolbar button's hover and a menu item's | Owner review on the demo | One rule for both (all instant or all 200) |

## Open decisions (working defaults)

| # | Question | Options | Recommendation and default |
| --- | --- | --- | --- |
| **MD1** | Hover tint on standalone controls: 200 ms or faster? | 200 (owner default) / 100 / 0 | **200 ms**, front-loaded; collections are instant (Z9) |
| **MD2** | Focus ring arriving: instant or 100 ms? | 0 / 100 / 200 | **0 in, 100 out** (Z12). Departs from main's brief, which listed the focus ring among interpolated values; flagged for the owner |
| **MD3** | Page change: sequential out-then-in (today) or cross-fade? | Sequential / cross-fade / shared nav | **Sequential, as built** (owner Q20: complete fade-out, then fade-in, within 200 ms, no cross-fade). F15.83 recommended a cross-fade; withdrawn in F15.84 because it contradicts Q20. The framework records this as the one sanctioned exception to "never blank a region": a page change is a change of context, not of state, and the owner chose a clean break |
| **MD4** | Springs with overshoot? | None / for release after drag | **None** now; revisit for drag release |
| **MD5** | Count-up animations for dashboard figures from data? | Never / data-only | **Never**: a number mid-tween is false (Z10) |
| **MD6** | (*Added F15.83*) Build own primitives or adopt an animation library (Motion / Framer Motion, GSAP, React Spring)? | Own on CSS transitions + Web Animations / a library | **Own.** The core is CSS and a markup contract, not React ([Architecture](foundation.md#why-the-core-is-css-markup-contract-not-a-framework)); state changes are CSS transitions (native retargeting), so script is needed only for FLIP and View Transitions, both small. A library would be React-bound, add weight and become the de facto contract. Revisit if P3 or P6 grows past a few hundred lines |
| **MD7** | (*Added F15.83*) Reveal through `interpolate-size` (not in every engine) with a fallback, or one mechanism? | Two paths / grid rows only | **Grid rows `0fr` ↔ `1fr` only**: one mechanism in every engine; a second path is a redundant variant (Q34) |

## Part 2: the checklist

The rows are the [Definition of Done for motion](#definition-of-done-for-motion) (MV1–MV8), with how each is checked and its severity, plus MV9 (owner Q85.2). **DOM** rows are read by `tools/motion-probe.js` (`window.motionProbe({ places })`, with `places` from `packages/core/motion/zero-latency.json`); **static** rows by `npm run check:motion`; **look** rows by an evaluator. A view passes when no row fails.

| ID | Passes when | How | Severity |
| --- | --- | --- | --- |
| MV1 | Anything present in two consecutive states is drawn in every frame between them (at 10 % speed) | look, the Animations panel | S2 |
| MV2 | A value the person drives (a key, a wheel step, a drag) is in the DOM in the same task, with nothing animating on it | DOM (with `places`) | S1 |
| MV3 | Reversing a change half-way returns from where it is | look, or a timed probe | S2 |
| MV4 | No long animation frame over 50 ms and no layout shift during a change, at 4× CPU throttle | Performance panel | S2 |
| MV5 | With reduced motion nothing travels or resizes; fades remain | DOM, with reduced motion emulated | S1 |
| MV6 | No literal duration or curve, no `transition: all`, nothing on a zero-latency selector, layout transitions only on the allow-list | static `check:motion` | S3 |
| MV7 | A leaving layer is `inert` and `aria-hidden`; focus never falls to the page body during a morph | DOM | S1 |
| MV8 | An agent given new state pairs picks the documented strategy | trial prompt | S3 |
| MV9 | At rest nothing loops unseen: a repeating animation runs only on something drawn (a visible loading indicator) | DOM, after the page settles | S3 |

```js
// Playwright: await page.addScriptTag({ path: 'tools/motion-probe.js' })
window.motionProbe({ places }).findings; // [{ rule, element, detail }]
```

**F15.MO1 sweep (2026-11-09 about 14:25, owner Q85.2):** at rest, on a 16-page sample across the templates, 5 pages had spinners turning forever inside hidden layers: every Button and MenuButton trigger keeps its pending layer (a Progress) in the same box for the in-place morph (C2), hidden while idle, and its animation ran regardless. A hidden spinner in a hidden layer now pauses (`controls.css`), and resumes when its layer is shown. MV9 and MV7 then pass on all 168 rendered template layouts; with reduced motion emulated, nothing runs on the sample (MV5).

## Definition of Done for motion

*Added F15.83* (K2: the draft's promises had no rows a check could pass or fail). Each row is observable; Q65.4 fills the evidence. None is met yet.

| # | Done when (observable) | Evidence / Try it |
| --- | --- | --- |
| **MV1** | Every built catalogue row (C1–C28) has a demo on its component page, and at 10 % speed the persistent element is drawn in every frame, with no frame where neither state is drawn | Component pages; the Animations panel |
| **MV2** | For every Z row, a scripted key, wheel step or pointer move puts the new value in the DOM within the same task, and `getAnimations()` shows nothing running on the value's property | Motion probe |
| **MV3** | Reversing C2, C4, C6 and C9 half-way returns from the current value (one transition, a continuous computed value), never restarts | Motion probe |
| **MV4** | No long animation frame over 50 ms and no layout shift during any built catalogue row at 4× CPU throttle | Motion probe, Performance panel |
| **MV5** | With reduced motion, no transform, size or View Transition movement runs; fades still take `change`; ui-states beats still hold | Motion probe in the reduce context |
| **MV6** | `check:motion` passes: no literal duration or curve, no `transition: all`, no transition on a zero-latency selector, layout transitions only on the allow-list | `npm run check:motion` |
| **MV7** | During every S2 morph the leaving layer is `inert` and `aria-hidden` from its first frame, focus is never on the page body, and the new state is announced once | Probe plus a screen reader pass |
| **MV8** | An agent given three new state pairs picks the documented strategy and tokens each time (MA5) | One trial prompt, recorded |

## Critique and revisions

*F15.83, 2026-11-08.* The F15.82 draft was critiqued inline with the **grounding-critic** checklist (orphans, gaps, leaks, untestable lines, unbounded decisions, unexamined beliefs, usability) and the **design-system-auditor** checklist (tokens, spacing, visual noise, tiers, documentation, states, accessibility), applied to a framework rather than a diff. Findings are ranked by how badly they would break a promise; each names what it changed above.

| # | Finding | Checklist | Breaks | Revision |
| --- | --- | --- | --- | --- |
| **K1** | S2's "both layers in one grid cell" holds the wrapper at the larger size and **snaps** when the old layer goes: the very jump S2 exists to prevent | Gap (mechanics) | MP1 | S2 rewritten in four steps: leaving layer `absolute`; the **surface** morphs by `clip-path` where nothing flows around; real size only where neighbours flow (R3); hold otherwise. P3 gains `size="surface" \| "layout" \| "hold"` |
| **K2** | MP2 ("next frame") and MP4 ("holds the frame rate") had no measurement; no Definition of Done rows existed for any MU | Untestable lines; Gap | MP2, MP4 | Numbers in MP2 and MP4; MV1–MV8; the probe drives every Z row |
| **K3** | The whole framework assumes a component keeps one wrapper element across states; React components that return a different root per state make every S2 row impossible, and this wasn't in the register | Unexamined belief | MP1 | MA7 (high), checked by the audit before any motion work |
| **K4** | The draft put each morph *before* each ui-states beat, doubling an instant save's feedback to ~800 ms against ui-states' ~400 ms | Leak between skills (ui-states) | MP2 (feels slow) | A beat starts when its state is legible; pending morphs in over `quick`; ≈ 550 ms total |
| **K5** | Z2–Z3 said values change at once, but ui-states locks a control while its commit is pending: read literally, a NumberField would lock between arrow presses | Leak between skills | MP2 | "Showing is not saving": continuous controls never lock between steps; the commit runs once after `commit-pause` |
| **K6** | C16 and MD3 kept today's page change (old out, then new in), which leaves the content region blank between them | Gap (perceived-performance principle 3) | MP1 | ~~C16 and MD3: the new page under, the old one fading out over it~~ **Withdrawn in F15.84:** the owner asked for exactly this sequence ([DoD Q20](definition-of-done.md#owner-instructions), "No cross fade of the content"); the owner's rule stands and is recorded as a sanctioned exception in MD3. Lesson: check the owner rows before revising behaviour that already exists |
| **K7** | "Only decoration may ease" had no definition, so no check could decide what may animate in a zero-latency place | Untestable line | MP2 | Decoration defined: not the value, its position, or the mark of focus, active option or selection |
| **K8** | No failure branches: a morph interrupted by a failure, a View Transition whose update throws, an unmount mid-morph, a target that never arrives | Gap (flows without failure branches) | MP1, MU7 | Failure branches under [Interruption and reversal](#interruption-and-reversal) |
| **K9** | Stagger served no promise (it shows neither state nor place) and delays the last item | Orphan | MP3, M1 | Removed from the core (non-goal; add-ons may); T12 withdrawn |
| **K10** | R2 ("control- and card-sized") and R3 ("a small subtree") couldn't be checked | Untestable lines | MP4 | A quarter of the viewport's area; about 150 elements and only following siblings reflowing |
| **K11** | Tokens: `press` and `fade-out` had the same value, the same reduced-motion behaviour and one job (Q34, redundant variant); T10 recipes alias overridden roles but would not follow the reduce context unless echoed; no migration for today's reads of the scale | Design-system auditor (tokens) | MP5 | One `duration.quick`; T10 echo through `tools/token-contexts.mjs`; a migration note pointing to the audit |
| **K12** | Z8 let a segmented control's indicator glide under arrow keys, contradicting Z8's own reason; Z9's "collection" was undefined, so a toolbar's buttons could fall either side (two hover patterns, H4) | Usability (H4); untestable | MP2, MP3 | M14 (the input decides); C6 and Z8 aligned; "collection" defined by role; MA9 |
| **K13** | Every list row assumed one item; removing 40 selected rows or "clear all" would play 40 animations | Gap (one, several, all) | MP3, MP4 | MU8; C11 animates several as one change, and cross-fades past `count.flip-max` |
| **K14** | Nothing said what assistive technology meets during a cross-fade: the leaving content stayed focusable and readable, and announcements were unspecified | Design-system auditor (accessibility) | MU9 | M13; MV7; focus moves before the leaving layer goes inert |
| **K15** | A morph could start before its target existed (a dialog morphing into an empty result, then again into the content) | Gap (waits) | MP1, MP3 | M12: morph into a ready state; C1 waits on the button's pending state |

**The three changes made first:** K1 (the S2 mechanics are the owner's "fake the content" idea, and the draft's version would have produced the jump), K3 (if wrappers aren't stable, nothing else can be built: it gates Q65.4), and K4 with K5 (the framework must not fight ui-states, or "no lag" and "every change confirmed" can't both hold).

**Design-system auditor, the rest of the checklist:** *spacing:* a `layout` morph moves neighbours, which spacing rule 9 forbids for hover, focus, press and pending; it is allowed only for content that changes (a message, a result), as spacing already allows a message to grow its container in one direction, and is stated so in R3. *Visual noise:* the surface morph fades its shadow in at the end rather than clipping it (one cue); no new resting marks. *Tiers:* `Morph` and `Reveal` are sealed fundamentals, P5–P7 tier-0 behaviour; compounds use them and never animate a fundamental's inside. *Documentation:* each primitive needs its doc comment, props and stories in Q65.4. *States:* every C row names what remains with reduced motion. *Copy:* no new words; announcements reuse the status region.

**Noted, not changed:** loops that run while work runs (the AI ring, indeterminate progress) and WCAG 2.2.2 (they end with the work, pause when hidden and stop under reduced motion; whether that meets 2.2.2's essential exception is to be checked); MA3's browser support was not re-read; the grid-rows reveal is a layout animation, accepted inside the R3 budget.

## Audit report

*F15.84, 2026-11-08, about 20:57.* Every CSS file in `packages/core/css` (fundamentals, compounds, layouts, tokens), the React components in `packages/core/react`, the library app (`apps/library/src`) and the templates (`packages/templates`, as they stood at audit time while worker 24 extends them for Q66) were read against the revised framework. Method: every `transition`, `animation`, `@keyframes`, `@starting-style` and `will-change` (53 transition declarations, 15 keyframe animations), every state selector per file (hover, `aria-*`, `data-*` states, `[open]`) against the transitions it has, each component's root across its states (MA7), scripted timers in TSX, and the reduced-motion handling. Static reading only: nothing was run or measured, so performance findings are by property class, not by frame times.

**Overall:** the library already has the right instincts in places (Button holds its width with stacked label layers; NumberField shows every step at once and saves after the pause; Slider and colour handles have no transitions on position; collection rows hover instantly; Skeleton's shimmer stops after three passes; the indicator delay is pure CSS; every loop has a reduced-motion stop). The gaps are systematic, not local: **about half of the CSS files with state selectors (19 of 37) have no transition at all**, and most of the rest cover only some of their states, so most value changes jump; **every timing reads the private scale** (28 reads of `fast`, 18 of `medium`, 2 of `slow`) mostly at 100 ms where the owner's default is 200; **reduced motion zeroes every duration**, removing colour fades too; and **no same-wrapper morph exists anywhere** (no `Morph`, `Reveal`, presence or FLIP primitive), so every content swap blinks.

**Severity:** **A1 Broken**: a promise fails (content blinks out and back, a zero-latency value eases, a morph is impossible as built). **A2 Jump**: a visual value jumps or something enters or leaves with no transition. **A3 Off-system**: timing off the roles, a missing easing, a wrong duration, keyframes where a transition retargets. **A4 Polish**.

### Global and tokens

| # | Where | Current behaviour | Violation | Sev. | Recommended fix | Needs |
| --- | --- | --- | --- | --- | --- | --- |
| **G1** | `tokens.motion-reduce.json` → `tokens.css` reduce block | Reduced motion sets `duration.fast`, `medium`, `slow` to 0 | Kills colour and opacity fades too (M10, reduced-motion table) | A1 | Override only the movement roles (T6–T8, T11); keep `quick` and `change` | T3–T8, T11; `tools/token-contexts.mjs` echo |
| **G2** | 16 core CSS files | 28 transitions read `duration.fast` (100 ms) for hover, border and fill changes | Owner default is 200 ms (Q65); components read the private scale (T1) | A3 | Value changes read `duration.change`; presses `duration.quick` | T3, T5, P1 |
| **G3** | `dialog.css`, `sheet.css`, `notifications.css`, `lightbox.css`, `file-upload.css`, `feedback.css:58` | 9 transitions with no easing (the browser's `ease`) | Easing is a token (M7, Tokens) | A3 | `easing.enter` in, `easing.exit` out | Existing easings |
| **G4** | Theme, contrast, space and shape switches (title bar) | Elements with colour transitions animate at 100 ms while the rest snap | Z18: global switches are instant or one root cross-fade | A2 | `[data-motion="suspend"]` around every switch; optional root cross-fade | P2, P7 |
| **G5** | No `check:motion` | Nothing stops a literal, `transition: all` or a transition on a zero-latency selector (none exist today: 0 `transition: all`) | Enforcement | A3 | Add the static check with a zero-latency selector list and an R3 allow-list | P8 |
| **G6** | No motion primitives | Each component hand-rolls `@starting-style` or keyframes | MP5, MD6 | A1 | Build P3–P7 in tier 0/1 | P3–P7 |

### Fundamentals

| # | Component | Current behaviour | Violation | Sev. | Recommended fix | Needs |
| --- | --- | --- | --- | --- | --- | --- |
| **F1** | Button (`controls.css:52`, `:126`) | Label layers (rest, on, done) stacked in one cell, width held (good); the shown layer switches by `visibility`, instantly; `background-color` and `scale` at 100 ms; border and text colour jump between emphases and states | C2: label and spinner cross-fade; M5 border and colour interpolate; beats start when legible | A2 | Cross-fade layers (`opacity` + `visibility` with `allow-discrete`): leaving `quick`, arriving `change`; add `border-color`, `color` at `change`; press `scale` at `quick` in, `change` out | T3, T5 |
| **F2** | Button `fill` (`:267`) and ring (`:202`) | Fill grows by `clip-path` over `c.button.fill-move` (`medium`); ring loops | Fine in kind; easing should be `linear` for a determinate fill (C26) | A4 | `easing.linear`; alias `fill-move` to `duration.move` | T6, T9 |
| **F3** | Switch (`:517`, `:525`) | Knob `translate` and track fill at 100 ms; pending arc round the knob | C4: knob `move` 200, track `change` 200; under reduce the knob snaps but the fill fades | A3 | Retime to roles | T5, T6 |
| **F4** | SegmentedControl (`:1748`) | Each segment's own fill fades in and out at 100 ms; text colour jumps; no sliding indicator | C6: the selected fill slides from old to new under a pointer press and moves at once under keys (M14) | A2 | One indicator element positioned by FLIP (or anchor positioning) over the checked segment; text colour at `change` | P6, T6 |
| **F5** | Checkbox (`:1495`–`:1636`), RadioGroup (`radio-group.css`), CheckboxGroup | No transitions: fill and mark appear in one frame | C5: fill at `change`; mark legible at once, settles from 60 % over `quick` | A2 | Add S1 transitions; mark scale on `transform` | T3, T5, T11 |
| **F6** | TextField, NumberField, TextArea, Select trigger, TimeField, DatePicker field, TagInput box (`controls.css:684`, `:1024`, `:1254`, `time-field.css`, `date-picker.css`, `tag-input.css`) | Border colour at 100 ms; value and caret instant (good, Z1, Z2); confirmed tick enters by a 200 ms keyframe | Retime only; keyframe entrance is acceptable for a one-shot tick (it has no reversal) | A3 | Border at `change`; tick on `quick` scale + `change` fade | T3, T5 |
| **F7** | Field messages (`field.css`, Field.tsx) | Error, warning and success lines are added and removed in one frame, pushing what follows | C3: the message reveals (S3), grows downward only, text fades | A2 | Wrap the message line in `Reveal` | P4 |
| **F8** | Field focus ring (`field.css:115`, Q55) | Ring `opacity` at 100 ms in and out | Z12: arrives at once, leaves over `quick` | A3 | In: no transition (`:focus-visible` sets it), out: `quick` | T3 |
| **F9** | NumberField (NumberField.tsx `set(n, 'pause')`) | Shows each step at once, saves after `commit-pause` | Compliant with Z2 and K5 ("showing is not saving") | — | Keep; verify the pending lock never blocks the next arrow press (MV2) | — |
| **F10** | NumberField hold-to-repeat (NumberField.tsx:338) | Literal 400 ms first delay and 60 ms repeat | Timing literals in a component (state timing, not motion) | A4 | Tokens `duration.repeat-delay`, `duration.repeat` | New timing tokens |
| **F11** | Slider, AllocationSlider (`slider.css:164`, `:205`, `allocation-slider.css:99`) | Thumb and fill positions have no transition (good, Z3); hover tint and value label fade at 100 ms | Compliant on the value; retime decoration | A4 | Decoration at `change` / `quick` | T3, T5 |
| **F12** | ColourPicker, pickers (`pickers.css:30`, `:525`) | Handles move at once (Z4, good); row `background-color` fades at 100 ms in a list | Z9: hover across a collection is instant | A3 | Remove the row fade | — |
| **F13** | Calendar (`calendar.css:87`, `:172`–`:197`) | Cell hover fades at 100 ms; the zoom (Q50) and month page play `@keyframes` at `medium`/`fast` with `easing.enter` | Z9 (cell hover instant); keyframes restart when interrupted (M8): a fast second zoom replays from the start | A3 | Cells: no hover transition; zoom as transitions on a stacked pair of grids (C21, S2 + S4), retargeting | P3 or P5, T6 |
| **F14** | Popover, Select and MenuButton lists (`popover.css:30`, Select.tsx:409) | Opacity in at 100 ms via `@starting-style`; leave in one frame (`hidden`, manual popover); no scale from the anchor | C7: enter scale 0.96 → 1 from the anchor + fade at `change` `enter`; exit fade `quick` `exit` | A2 | `@starting-style` + `allow-discrete` on `display` and `overlay`, `transform-origin` from the anchor side | T11, T3, T5 |
| **F15** | Tooltip (`tooltip.css:41`) | Opacity in at 100 ms; leaves in one frame | C8: `quick` both ways | A4 | Add the exit | T3 |
| **F16** | Chip (`chip.css`), Badge (`badge.css`) | 6 and 7 state selectors, no transitions: selected fill and removable states jump; a badge appears and leaves in one frame; counts change at once (good, Z10) | M5; C24 | A2 | S1 on fills; badge presence 0 ↔ 1 by `transform` + `opacity` | P5, T5 |
| **F17** | Image (`image.css:32`, `:47`) | Picture fades in at `medium` (good, C14); the placeholder shimmer is `infinite` | ui-states: three passes then still; C14 uses `change` | A3 | `animation-iteration-count: var(--count-shimmer-passes)`; `duration.change` | Existing count |
| **F18** | Skeleton, Progress (`feedback.css`) | Three shimmer passes, delayed visibility through a transition delay, indeterminate sweep loops while working, all stopped under reduce | Compliant; the skeleton → content swap is the owner of each component (see C2 rows) | — | Keep | — |
| **F19** | Avatar, Rating, List and ListItem, DateField | List rows hover instantly (good, Z9); others have no animated states | Compliant | — | Keep | — |

### Compounds

| # | Component | Current behaviour | Violation | Sev. | Recommended fix | Needs |
| --- | --- | --- | --- | --- | --- | --- |
| **K-1** | Dialog (`dialog.css:21`) | Enters with `opacity` + `translate` (rise) at `medium`, no easing; leaves with the same duration; no result state: a confirmation is a different dialog or a notification | C17 (scale 0.98, `enter` / one step shorter `exit`); C1 (form → success or error in the same box) missing | A1 | Easing and exit; a `Morph` body for result states with a story "Form → Done" and "Form → Failed" | P3, T3, T5, T11 |
| **K-2** | Sheet (`sheet.css:25`) | Slides from its edge at `medium`, no easing; exit the same | C17: `move-far` 300 `enter`, exit `move` `exit` | A3 | Retime | T6, T7 |
| **K-3** | Notifications (`notifications.css:47`, Notifications.tsx) | A new pill rises at `medium` (no easing); dismissal unmounts in one frame; the other pills jump into place; an update replaces text at once | C15: exit fade `quick`; neighbours slide (FLIP); in-place update cross-fades and morphs width | A2 | `usePresence` for exit, `flip()` for the stack, `Morph` for in-place updates | P3, P5, P6 |
| **K-4** | Lightbox (`lightbox.css:18`) | Fades in, no easing | C10 would carry the thumbnail into the lightbox (shared element) | A3 | Easing now; shared element later (phase 4) | P7 |
| **K-5** | Accordion (Accordion.tsx:97, `accordion.css:71`) | Chevron rotates at 100 ms; the panel shows and hides with `hidden` in one frame | C9: the panel reveals (S3) | A2 | `Reveal` around the panel; chevron at `move` | P4, T6 |
| **K-6** | TreeView (TreeView.tsx:139) | Twisty rotates at 100 ms; children are mounted only when open, so nothing can animate | C9; MA7 (the branch doesn't exist in the closed state) | A1 | Keep children mounted inside `Reveal` (`inert` when closed) or `usePresence` | P4 |
| **K-7** | Tabs (`tabs.css`, 12 state selectors) | Selected underline (`::after`) and fill jump between tabs; hover jumps | C6: indicator slides under a press, moves at once under arrows (M14); tab hover at `change` (tabs are standalone, not a collection) | A2 | One indicator with FLIP; S1 on hover | P6, T5, T6 |
| **K-8** | Navigation (`navigation.css`) | Hover and the current page's fill change at once | Hover compliant (Z9, a collection); the current fill could move with the page (C6) | A4 | Optional indicator slide | P6 |
| **K-9** | Pagination, PageHeader, SiteHeader, ImageGrid, AvatarGroup (state selectors, no transitions) | Hover and current states jump; SiteHeader's small-window menu opens in one frame | M5; C7 / C9 for the menu | A2 | S1 on standalone controls; `Reveal` or presence for the menu | P4 or P5, T5 |
| **K-10** | Card (Card.tsx:65, `card.css`) | Hover darkens the hairline at once; `loading` returns a **different root** from the loaded card | M5; C13 and MA7: the skeleton can't cross-fade into content because the wrapper is replaced | A1 | One root for both states; the shimmer layer inside, cross-faded out (S7); hairline at `change` | P3 (or S7 in CSS), T5 |
| **K-11** | Quote (Quote.tsx:62) | Same as Card: `loading` returns a different root | MA7, C13 | A1 | One root | — |
| **K-12** | ChatThinking (ChatThinking.tsx:44, `chat-thinking.css`) | With no reasoning, returns a different root; chevron at 100 ms; the working shimmer loops while working; the working → done label swaps at once | MA7; C18 (thinking → answer in the same wrapper) | A1 | One root; label cross-fade (`Morph`); chevron at `move` | P3 |
| **K-13** | ChatMessage (`chat-message.css:105`, `:129`) | Actions fade at 100 ms; streaming caret pulses while streaming; appended text instant (good, Z13) | Retime decoration | A4 | `quick` / `change` | T3, T5 |
| **K-14** | Composer, InlineEdit, TagInput | No transitions on their own states (processing ring comes from Field) | C27 (inline edit: border and fill fade in around unmoved text); C19 (typed text → tag) | A2 | S1 on InlineEdit's field look; TagInput's new tag fades its fill in around the text | T5 |
| **K-15** | ImageGeneration (`image-generation.css`) | One `figure` across generating, done and failed (good, MA7); finished picture fades in at `slow` (300 ms); loops while generating, stop under reduce | C14 uses `change`; the veil's `filter` transition is a paint cost on a large surface (R2) | A3 | `c.image-generation.fade` → `duration.change`; veil fades by `opacity` | T5 |
| **K-16** | Carousel (`carousel.css:57`, `:163`, `:185`) | Peek slides scale and fade at `slow`; reveal by `clip-path` at `medium`; autoplay fill keyframe `linear` | C23: settle at `move`; the drag itself follows the pointer (Z5); the fill reads `easing.linear` | A3 | Retime; token easing | T6, T9 |
| **K-17** | Board (`board.css`, 5 states) | Dragging states with no transitions: neighbours jump to make room; the card drops in one frame | C23: neighbours slide, the card settles | A2 | `flip()` on the columns; settle at `move` | P6 |
| **K-18** | FileUpload (`file-upload.css:28`) | Drop zone tint and outline at 100 ms, no easing, only while dragging (good, transient); file rows have no progress transition | C20: fill by `scaleX` at `move` `linear`; row status cross-fade | A3 | Easing; row progress through Progress `bar` | T6, T9 |
| **K-19** | TokenSpecimen (`token-specimen.css:180`, `:192`) | The easing and duration demos animate `inset-inline-start` and `inline-size` (layout properties) | R1: move by `transform` | A3 | `translate` and `scale` | — |
| **K-20** | Agenda, Canvas, ConversationList, DataTable, the rest | ConversationList rows hover instantly (Z9, compliant); others have no animated states | — | — | Keep | — |

### Layouts and the library app

| # | Where | Current behaviour | Violation | Sev. | Recommended fix | Needs |
| --- | --- | --- | --- | --- | --- | --- |
| **L1** | LibraryLayout page change (`library.css:85`–`:99`, LibraryLayout.tsx:98–105) | Old page fades out (`page-out`, 100 ms), a blank swap of at least two frames, new page fades in (`page-in`, 100 ms) | **Compliant with owner Q20** (complete fade-out, then fade-in, no cross-fade); C16 and MD3 now say so | — | Keep; replace the literal `setTimeout(fadeIn, 100)` with the token read already used above it | — |
| **L2** | LibraryLayout navigation and revision pane | The narrow-window sheet uses Sheet (K-2) | Inherits K-2 | A3 | — | — |
| **L3** | ChatLayout (ChatLayout.tsx:121) | "Jump to latest" scrolls smoothly unless reduced motion | Z7 allows an explicit long jump to be smooth; compliant | — | Keep | — |
| **L4** | Library app (App.tsx:307, `MessageActions.tsx:62`) | Revision jump scrolls smoothly unless reduced; "Copied" holds for a literal 1500 ms | Literal timing (it is `duration.confirm-read`) | A4 | Read the token | — |
| **L5** | Library Motion page (`pages.ts` `motion`) | Shows the scale and the state timings | Will need the roles (T3–T8), the zero-latency list and live catalogue demos | A3 | Extend the page with roles and demos per phase | — |

### Templates

| # | Where | Current behaviour | Violation | Sev. | Recommended fix | Needs |
| --- | --- | --- | --- | --- | --- | --- |
| **TP1** | All seven templates (`packages/templates/*`) | No template CSS animates; motion comes only from the core components they use | Inherit every finding above | — | Fixed by fixing the core | — |
| **TP2** | Form → result flows: Blog subscribe → confirm / error, Corporate apply → sent / error and sign-in → error, Conference payment → confirmed / declined and submit talk → submitted / error, Projects create issue → error, Chat checkout → upgraded, Portfolio contact / booking → sent | Each outcome is a **separate layout** (a route), so the form disappears and a new screen appears | MP1, C1: the form and its outcome share a wrapper; a route change can't morph | A1 | Model each outcome as a **state of one layout** (content record `state`, a `Morph` around the form region), keeping separate routes only for deep links; agree with the templates worker (Q66) before changing content | P3; content schema `state` |
| **TP3** | Empty variants (`search-empty`, `saved-empty`, `drafts-empty`, `my-work-empty`, `my-schedule-empty`, …) | Separate layouts from their filled versions | C12: list → empty in the same wrapper | A2 | Same as TP2: an empty state of one layout | P3 |
| **TP4** | Design and Projects app screens (`editor` panels, `board`, `issue` → `issue-edit`) | Inspector sections, board drags and view ↔ edit swap with no motion | C9 (inspector sections reveal), C23 (board), C27 (view → edit in place) | A2 | Through K-5, K-17 and an InlineEdit-style morph | P4, P6 |

### Zero-latency compliance

None of the Z places animates its value today: typing (Z1), NumberField steps and scrubbing (Z2), Slider and AllocationSlider (Z3), colour handles (Z4), scrolling (Z7), keyboard movement in lists and the calendar (Z8, focus moves at once), counts (Z10), streaming text (Z13). Two decorations break Z9 (F12 picker rows, F13 calendar cells fade on hover) and one breaks Z12 (F8, the focus ring fades in). The risk is in the future work: every new transition must check the Z list first, which is why `check:motion` (G5) comes before the broad sweep is finished.

### Same-wrapper readiness (MA7)

Components whose wrapper is replaced between states, so nothing can morph until they render one root: **Card** and **Quote** (`loading`), **ChatThinking** (with and without reasoning), **TreeView** (children unmounted when closed), and every **template form → result flow** (separate routes, TP2). Already one root across states: Button, Switch, NumberField, Field, ImageGeneration, Dialog (one `dialog` element), Select (the popup is kept and hidden).

### Implementation plan for Q65.4

Packets of about 15–20 minutes, each ending in a page the owner can open; most visible wins first. Phase 0 is the gate: tokens before any component reads them. The templates worker (Q66) owns `packages/templates` and the template routes; TP2–TP4 are proposed to them, not changed by the motion worker.

| Packet | Scope | Findings closed | Reviewable result |
| --- | --- | --- | --- |
| **M1 Tokens** | T2–T11 in `tokens.json`; the reduce context overrides only movement roles; echo the recipes; extend the Motion page with the roles and a "reduced motion keeps fades" toggle demo | G1, G2 (tokens only), L5 (part) | [Motion and timing](http://127.0.0.1:8766/#/motion) |
| **M2 Button and Switch** | Button layer cross-fade, border and colour transitions, press `quick`; Switch on roles; Button `fill` linear | F1, F2, F3 | [Button](http://127.0.0.1:8766/#/button) "In progress", [Switch](http://127.0.0.1:8766/#/switch) |
| **M3 Sliding selection** | `flip()` (P6) and the moving indicator in SegmentedControl and Tabs (pointer slides, keys jump) | F4, K-7, K-8 (optional) | [SegmentedControl](http://127.0.0.1:8766/#/segmentedcontrol), [Tabs](http://127.0.0.1:8766/#/tabs) |
| **M4 Value sweep** | S1 transitions on roles for Checkbox, RadioGroup, Chip, Badge, Card hover, Pagination, PageHeader, SiteHeader, fields' borders; remove collection hover fades (pickers, calendar cells); focus ring arrives at once; missing easings | F5, F6, F8, F12, F13 (hover), F16 (fills), G3, K-9 (hover), K-13, K-14 (InlineEdit) | Checkbox, Chip, Card and Field pages, each in light and dark |
| **M5 Reveal** | `Reveal` (P4, grid rows); Accordion panels, TreeView branches (kept mounted), Field messages, SiteHeader menu | F7, K-5, K-6, K-9 (menu) | [Accordion](http://127.0.0.1:8766/#/accordion), [Field](http://127.0.0.1:8766/#/field) "Messages" |
| **M6 Enter and exit** | Popovers, Select and MenuButton lists, Tooltip, Dialog, Sheet, Notifications enter from their origin and leave one step shorter (`@starting-style`, `allow-discrete`, `usePresence` for unmounting pills) | F14, F15, K-1 (enter/exit), K-2, K-3 (exit), K-4 (easing), F16 (badge) | Select, Dialog and Notifications pages |
| **M7 Morph** | `Morph` (P3: surface `clip-path`, leaving layer `inert`, focus first); Dialog "Form → Done / Failed" story; one root for Card, Quote and ChatThinking with skeleton → content cross-fade; ChatThinking working → done | K-1 (C1), K-10, K-11, K-12, MA7 | [Dialog](http://127.0.0.1:8766/#/dialog) new story, [Card](http://127.0.0.1:8766/#/card) "Loading" |
| **M8 Lists that move** | Notifications stack with `flip()` and in-place updates through `Morph`; a list add / remove / several-at-once story; Board neighbours and drop settle | K-3, K-17, C11, MU8 | [Notifications](http://127.0.0.1:8766/#/notifications), [Board](http://127.0.0.1:8766/#/board) |
| **M9 Retargeting** | Calendar zoom as retargeting transitions (C21); Carousel and FileUpload on roles; Image shimmer passes; ImageGeneration fade and veil; TokenSpecimen on transforms | F13 (zoom), F17, K-15, K-16, K-18, K-19 | [Calendar](http://127.0.0.1:8766/#/calendar), [Carousel](http://127.0.0.1:8766/#/carousel) |
| **M10 Global switches and timers** | `[data-motion="suspend"]` on the title-bar switches (optional root cross-fade through P7); literal timers to tokens | G4, L1 (timer), L4, F10 | Any page: switch light and dark |
| **M11 Shared element** | `viewTransition()` (P7) with fallback; card → lightbox or card → detail demo on the Motion page | K-4, C10, MA3, MA6 | Motion page demo |
| **M12 Enforcement** | `check:motion` (static, like `check:layers`) and the Motion page's zero-latency list from the same JSON; probe written but not run until production-ready | G5, MV6 | `npm run check:motion`; Motion page |
| **TP (templates worker)** | Outcomes and empty variants as states of one layout with `Morph` (after M7) | TP2, TP3, TP4 | Template flows |

**Mode note:** the project is in strict design. Each packet ships screens and static checks the mode allows (build, type check, token generation, and the existing static checks); the motion probe (MV2–MV5, MV7) and timing measurements wait for the owner to move a slice to production-ready.

**Implementation status** (Q65.4, worker 25; nothing approved, nothing measured):

| Packet | Status | Notes |
| --- | --- | --- |
| **M1 Tokens** | Built for review (F15.85, about 21:07) at [Motion and timing](http://127.0.0.1:8766/#/motion) | T2, T3, T5–T9, T11, T13 in `tokens.json`; the reduce context zeroes only the travel roles and scales and keeps `quick` and `change` (G1 closed for every component that reads a role; the legacy scale stays 0 under reduce until M2–M10 migrate its reads). **T10 deferred:** the upstream token builder has no DTCG `transition` composite, so components write `transition: <property> var(--duration-change) var(--easing-standard)` (one property list, role and easing tokens) instead of a recipe token. The Roles block plays each role with a Reduced motion switch (TokenSpecimen `travel` moves by transform, R1; `fade` interpolates a fill) |
| **M2 Button and Switch** | Built for review (F15.86, about 21:10) at [Button](http://127.0.0.1:8766/#/button) and [Switch](http://127.0.0.1:8766/#/switch), "Motion" stories | F1, F2, F3 closed: Button layers cross-fade in the held width (C2), colour, fill and border on `change`, press `quick` in and `change` out (Z17), fill linear on `move` (C26); Switch knob on `move`, track on `change` (C4). Each story has a reduced-motion copy |
| **M3 Sliding selection** | Built for review (F15.87, about 21:17) at [SegmentedControl](http://127.0.0.1:8766/#/segmentedcontrol) "Motion" and [Tabs](http://127.0.0.1:8766/#/tabs) "Panels" | F4 and K-7 closed (K-8 optional, left). P6 built: `packages/core/react/behaviour/flip.ts` (`boxOf`, `flip`, `cancelFlip`, `durationOf`, `useSlidingIndicator`), Web Animations on the indicator pseudo-element, retargeting from the drawn box. Pointer slides over `move`; arrow keys move at once (Z8, M14); reduced motion never slides. Known limit: the indicator scales on `x` while it travels between tabs of different widths, so its rounded ends stretch slightly for 200 ms |
| **M4 Value sweep** | Built for review (F15.88, about 21:21) on the Checkbox, RadioGroup, Chip, Card, TextField and Calendar pages | F5, F6, F8, F11, F13 (hover), F16 (fills), K-9 (hover), K-10 (hairline), K-13, K-14 closed; G3 for FileUpload (dialog, sheet, lightbox and notifications easings move to M6, which reworks them). New token `motion.mark-scale` (0.6; 1 under reduced motion) for C5's settling mark. **Correction:** F12 misread `pickers.css:30`, which is the MenuButton trigger (standalone, now on `change`); no picker row had a hover fade. Remaining reads of the private scale: M6 and M9 files only |
| **M5 Reveal** | Built for review (F15.89, about 21:29) at [Reveal](http://127.0.0.1:8766/#/reveal), [Accordion](http://127.0.0.1:8766/#/accordion), [TreeView](http://127.0.0.1:8766/#/treeview), [Field](http://127.0.0.1:8766/#/field) | F7, K-5, K-6 closed (SiteHeader's small-window menu moves to M6 as a presence). P4 `Reveal` and P5 `usePresence` built. Clipping kept true: the clip hides overflow only while closed or moving. A Field message present at first render is drawn at once (Z19); one that arrives later reveals |
| **M6 Enter and exit** | Built for review (F15.90, about 21:34) at Select, Popover, Tooltip, Dialog, Sheet and Notifications | F14, F15, K-1 (enter/exit), K-2, K-3 (exit), K-4 (easing), K-9 (menu), G3 closed. Shared tier-0 opt-in `data-presence="popup" \| "hint"` (`packages/core/css/motion.css`), as `data-dl-ring` is for focus rings: components keep their look and their closed rule. Exits keep `display`/`overlay` for the fade (`allow-discrete`). P5 grows `useExiting` for list members (notification pills). Open: list popups aren't inert during their 100 ms exit; C24 badge presence |
| **M7 Morph** | Built for review (F15.91, about 21:43) at [Morph](http://127.0.0.1:8766/#/morph), [Dialog](http://127.0.0.1:8766/#/dialog) "Form becomes its result", [Card](http://127.0.0.1:8766/#/card) "Loading, then loaded" | **P3 `Morph` has landed** (TP2–TP3 unblocked for the templates worker). K-1 (C1) and K-10 closed; Card is one box from skeleton to content (S7 placeholder layer). Deviation: `size="layout" \| "hold"` only; the `surface` clip-path mode (S2 step 2) is deferred, so a morph whose neighbours mustn't move uses `hold`. Left for M7b: Quote (K-11) and ChatThinking (K-12, one root and the working → done label) |
| **M7b Quote and ChatThinking** | Built for review (F15.92, about 21:46) at [ChatThinking](http://127.0.0.1:8766/#/chatthinking), [Quote](http://127.0.0.1:8766/#/quote) | K-11 and K-12 closed: ChatThinking is one `div` (disclosure button + Reveal instead of `details`), its mark and label fade in when the state changes; Quote keeps one box from skeleton to words. Same-wrapper readiness (MA7) now holds for every component the audit listed except template flows (TP2, templates worker 26) |
| **M8 Lists that move** | Built for review (F15.93, about 21:58, worker 27) at [List](http://127.0.0.1:8766/#/list) "Items that come and go", [Notifications](http://127.0.0.1:8766/#/notifications), [Board](http://127.0.0.1:8766/#/board) | K-3, K-17, C11, C15, C23, MU8 closed. P6 grows `useFlipList` (`behaviour/flip.ts`): boxes read in the render that changes the list's signature, items travel by `translate` only (`travel: 'position'`, or `'block'` for the centred notification stack), several changes as one, past `count.flip-max` the list fades its new arrangement in (S7); a moved item that's a new element (a card in another column) skips its arrival fade. Tier-0 opt-in `data-presence="item"` (motion.css): arrives fading in after the list's first render (`data-flip-settled`), leaves by fading where it is (`useExiting`), then the rest slide up. Static List and reorder-by-menu slide (a drag reorders at once, Z5); notification pills shift, and an update cross-fades its words and status (`Morph`) while the pill's width eases; Board opens a slot of the dragged card's height where it would land (drop index from laid-out boxes, so sliding cards never move the drop point), the column it left closes up, a menu move travels across the board. Known: the list's own height still snaps when its last items leave; a numbered list counts a leaving item for its 200 ms exit |
| **M9 Retargeting** | Built for review (F15.94, about 22:05, worker 27) at [Calendar](http://127.0.0.1:8766/#/calendar), [Progress](http://127.0.0.1:8766/#/progress) "Bar with a known total", [Carousel](http://127.0.0.1:8766/#/carousel), [Image](http://127.0.0.1:8766/#/image), [Motion and timing](http://127.0.0.1:8766/#/motion) | F13 (zoom), F17, K-15, K-16, K-18, K-19 closed. **Morph grows an optional `motion` prop** (`fade` default, `zoom-out`, `zoom-in`, `none`; existing uses unchanged) and the new token `motion.zoom-scale` (0.85; 1 under reduced motion). Calendar's views sit in a Morph: the levels scale and cross-fade as transitions, so a second zoom mid-way carries on from where each layer is drawn (the arriving layer becomes the leaving one); paging fades; a page turned by keys swaps at once (Z8); its keyframes are gone. Progress bar: a known share grows by `scale` on the move role at `easing.linear` (C20), stepping under reduced motion; FileUpload rows inherit it. Carousel peek on `change`/`move`, dots on `move`, autoplay fill on `easing.linear`. Image: fade on `change`, shimmer three passes then still. ImageGeneration fade aliases `duration.change`; its reveal blur stays a `filter` transition (it is the progress itself; R2 exception, noted). TokenSpecimen easing dot and duration fill move by `translate` and `scale` (R1) |
| **M10 Global switches and timers** | Built for review (F15.95, about 22:09, worker 27): any library page, switch Light/Dark or contrast in the title bar, or space and shape on [Space and shape](http://127.0.0.1:8766/#/space) | G4, L1 (timer), L4, F10 closed. P2 built: `suspendMotion(change)` (`behaviour/motion.ts`, exported) marks the root `data-motion="suspend"`, applies the change, resolves styles once and releases after two frames (or the change role, in a tab that isn't painting); motion.css turns transitions off below it while marked (loops keep running). The library app's theme, contrast, space and shape switches use it: checked, a dark → light switch started 0 transitions and the mark was gone after. The optional root cross-fade waits for M11's `viewTransition()`. Timers: LibraryLayout's fade-in fallback reads `duration.page-in`; MessageActions' "Copied" holds `duration.confirm-read`; NumberField's held stepper reads the new timing tokens `duration.repeat-delay` (400 ms) and `duration.repeat` (60 ms), kept under reduced motion. Left for the templates track: the standalone template site's scheme and contrast switches (`apps/library/src/site.tsx`) can call `suspendMotion` the same way |
| **M11 Shared element** | Built for review (F15.96, about 22:13, worker 27) at [Motion and timing](http://127.0.0.1:8766/#/motion) "Shared element" | K-4 (shared part), C10 closed in the primitive and a demo; MA3 and MA6 still unchecked in other engines. P7 built: `viewTransition(update, { from, to })` (`behaviour/motion.ts`, exported with `SharedName`): names the given elements only for the change, runs `update` synchronously inside `document.startViewTransition` (React: `flushSync`), skips a running one first, falls back to running `update` where the API is missing or the tab is hidden; reduced motion sets no names, so it only cross-fades. motion.css times the pseudo-elements from the tokens (groups on `duration.shared` and `easing.standard`, the image pairs on `duration.change`) and lets the pointer through (`::view-transition { pointer-events: none }`, MA6). Demo: a new foundation story file (`Motion.stories.tsx`, on the Motion page only): three walk cards, Open sends the picture and title to their place in the detail, Back reverses; focus follows to the matching button. The Lightbox thumbnail → full picture (K-4) can use the same call later; not wired |
| **M12 Enforcement** | Built for review (F15.97, about 22:18, worker 27): `npm run check:motion`; the list at [Motion and timing](http://127.0.0.1:8766/#/motion) "Zero latency" | G5, MV6 closed (static part). `tools/check-motion.mjs` reads every transition and animation in core and app CSS and core TSX: no literal duration or curve (R-literal), no `transition: all`, no read of the private scale (R-scale), nothing transitions or animates a zero-latency value (R-zero, from `packages/core/motion/zero-latency.json`, the same file the Motion page's table reads: 22 places, 8 with static selector rules, each rule checked to match real selectors), layout properties only where `tools/motion-allow.json` gives a reason (Reveal's `grid-template-rows` only), no `will-change`, no literal timer in a core component (R-timer). First run found 9: five `linear` literals in loops and delays (now `easing.linear`), Reveal's rows (allowed with its reason), Tooltip's close delay reading the private scale (now `quick`). Now: 86 transitions and 16 animations, every rule holds. The browser probe (MV2–MV5, MV7) stays written, not built, until production-ready. Added to AGENTS.md's static checks. The core package now exports `./motion/*`; the app reads the JSON by relative path until the next library server restart picks the export up |
| **M12b ChatLayout new chat → conversation** | Built for review (F15.98, about 22:22, worker 27) at [ChatLayout](http://127.0.0.1:8766/#/chatlayout) "A new chat" (now sends) | Routed by the templates worker: the composer was rendered in two different places (inside the welcome section, then under the conversation), so the first message remounted it (focus and identity lost) and nothing could morph (MA7). Now one tree in both states: the conversation region holds the greeting (empty) or the messages, and the one composer stays under it; empty centres the pair by sharing the free space between the conversation and the composer. On the first message `useFlipList` carries the composer from the middle to the bottom and the greeting down with it while it fades (`quick`, out of flow); the conversation fades in (`change`); New chat reverses (the composer travels up, the greeting fades in). Checked: same composer element, focus kept in its text box, `dl-flip` on composer and greeting, greeting gone after; back: composer 419 → 280 px from the layout's top. Reduced motion: no travel, fades stay. **TP4:** its core parts are built (Board K-17 in M8, Reveal K-5 in M5, InlineEdit K-14 in M4, Morph for a view ↔ edit swap in M7); applying a `Morph` around the Projects issue view ↔ edit swap and any inspector-section reveal is in `packages/templates` (templates worker 26) |
| **M11b Lightbox shared element** | Built for review (F15.100, about 23:05, worker 28) at [Lightbox](http://127.0.0.1:8766/#/lightbox) "Opened from a grid" | K-4 closed. Lightbox runs the travel itself, so no caller wiring: the focused opener's Image is the thumbnail; the large picture is moved and scaled by FLIP (`transform`) and cropped by `clip-path` from the thumbnail's frame and corners (as cover draws it) to its whole self (as contain draws it), on `duration.shared` and `easing.standard`, never stretched; the thumbnail hides while it flies; the surface and controls fade in around it (`change`, `enter`). Closing travels back when the picture is still the one opened (else it fades), then closes and returns focus. New tier-0 `behaviour/shared.ts` (`pictureTravel`, pure keyframes, and `travelPicture`), exported. **Why not `viewTransition()`:** the parent owns the index, so every caller would have to wrap its state change in `flushSync`; FLIP keeps the compound sealed and crops without distortion. Limits: travels only into a picture that's already decoded (a first open of an uncached picture fades); a Safari click doesn't focus the opener, so there it fades; nothing travels in a tab that isn't painting. Checked with animations finished by hand: open keyframes start at the thumbnail (scale 0.44, inset with 12 px corners), land with no transform and the surface opaque, focus on Close; close travels back, then the dialog closes with focus on the thumbnail |
| **M11c Shared corners (Q75)** | Built for review (F15.B1, 2026-11-09 about 06:30, worker 33) at [Motion and timing](http://127.0.0.1:8766/#/motion) "Shared element" | **Bug:** the travelling picture was square while it moved and rounded only when the live page returned (the card's clip, not the image, owns its corners), a snap at both ends. **Fix in `viewTransition()`**, so every use gets it: each named element's seen corners (its own radius, or the inner radius of a clipping ancestor whose corner it sits in) are read before and after the change; a rounded one gets `view-transition-class: dl-rounded`, whose group clips (`overflow: clip`) with both views filling it (`object-fit: cover`, motion.css), and its group's `border-radius` eases from the old corners to the new on the group's own duration and keyframe easing. Reduced motion unchanged (no names, fade only). **Measured** (headless Chromium, animations paused and sampled): before, the group radius was 0 px throughout against 11 px at rest on both sides; after, 11 px at every sample; with a square detail forced, 11 → 4.3 → 1.3 → 0.3 → 0 px forward and the reverse back, at the same progress as the width (60.7 % at t = 0.25) |
| **M13 Small gaps and the probe** | Built for review (F15.101, about 22:52, worker 28) at [Badge](http://127.0.0.1:8766/#/badge) "A count that comes and goes", [List](http://127.0.0.1:8766/#/list) "Items that come and go" (Remove three), [Select](http://127.0.0.1:8766/#/select) | **C24 closed:** a count badge that arrives after the page is drawn grows from `motion.mark-scale` and fades in (`change`, `enter`); one that drops to nothing keeps its last number and shrinks and fades out (`quick`, `exit`, via `usePresence`), `inert` and hidden while leaving; the number itself still changes at once (Z10); first render never animates (Z19). **List height:** `useFlipList` takes `size`, and List uses it: a shorter list eases its height down on the move role (one layout animation, R3), so what follows no longer jumps when the last items leave (checked: 152 → 56 px over 200 ms); growth stays instant. **Popups:** Select and MenuButton lists are `inert` while closed, so the 100 ms exit can't be clicked (checked: 37 closed popups inert, the open one not). **Template site switches** already call `suspendMotion` (site.tsx, templates track): closed. **Probe:** `tools/motion-probe.js`, an in-page check like `clipping-probe.js` (no suite): `window.motionProbe({ places })` reads what's running and reports MV2 (an animation on a zero-latency property, from the same zero-latency.json), MV5 (movement under reduced motion) and MV7 (a `[data-leaving]` element not `inert` and hidden; focus on the body during a morph). Run on the Badge page at rest and mid-change: no findings. MV3 and MV4 need timed sampling and wait for production-ready |
| **TP2–TP3 (templates)** | Built for review (F15.T4, about 22:00, templates worker 26) on the standalone template sites, e.g. [Blog: Subscribe](http://127.0.0.1:8766/site.html#/app/blog/subscribe), [Project management: My work](http://127.0.0.1:8766/site.html#/app/projects/my-work) | TP2 and TP3 closed: 21 outcome, error and empty screens in seven templates (10 of them former screens) are now states of their form's or list's screen, drawn in its own box through `Morph` (form → outcome, list ↔ empty) and `Reveal` (a refused send's error above the kept fields); a sent form moves focus to its outcome (M13). Deep links stay: a state file holds only `settings.state` and inherits its screen, so a change of state re-renders the same tree and morphs. The site's "Screen state" switch shows each change in place; search's no-results state morphs when the words change. Open: TP4 (inspector sections, board, issue → edit) is core motion (K-5, K-17) |
| **TP4 (templates)** | Built for review (F15.99, about 22:50, worker 28) at [Project management: Issue](http://127.0.0.1:8766/site.html#/app/projects/issue) (press Edit) and its deep link [Editing](http://127.0.0.1:8766/site.html#/app/projects/issue-edit) | Issue → edit (C27) closed: `issue-edit` is a state file (`settings.state: "edit"`, `stateOf: "issue"`) of the Issue screen; the title-and-description box is one `Morph` (`view` ↔ `edit`), focus to Title and back to Edit (M13), "KW-142 saved." announced; words in shared.json. `check:content` now accepts a state of a record-bound app screen when the template's binding names it. Board (K-17) already moves through the core Board. Open: inspector-section reveal in the Design tool; TextField's own blur-commit "Saved" inside an explicit-save form (core FormBlock too) |

## Sources

Cited from prior knowledge, not re-read for this packet; each is to be checked when the implementation relies on it: Nielsen's response-time limits (0.1 s, 1 s, 10 s); the Doherty threshold (~400 ms); W3C CSS Transitions Level 1 (interruption and the reversing shortening factor) and Level 2 (`@starting-style`, `transition-behavior`); CSS Values 5 / `interpolate-size` and `calc-size()`; W3C CSS View Transitions Level 1 and 2; WCAG 2.2 success criteria 2.2.2 (Pause, Stop, Hide), 2.3.3 (Animation from Interactions), 2.4.7 (Focus Visible); Material Design 3 motion (duration and easing tokens; easing by enter, exit and on-screen movement); Apple Human Interface Guidelines, Motion (reduce motion replaces movement with dissolves); Paul Lewis, "FLIP your animations"; the W3C DTCG 2025.10 format (`duration`, `cubicBezier`, `transition` types). This project's skills: `perceived-performance` (100 ms acknowledgement, never block input), `ui-states` (beats, be true), `spacing` (geometry stability), `visual-noise` (transient cues), `performance` (measure before claiming).

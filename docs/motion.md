# Motion and transitions

**In the library:** [Motion and timing](http://127.0.0.1:8766/#/motion), live, with every role, easing and timing.

> **TL;DR:** Motion here does one job: it shows how context and content move from one state to the next. Whatever is present in both states, the same or evolved, **morphs** and never blinks out and back. Most morphs are cheap: the wrapper animates and the content inside cross-fades. Every visual value (colour, border, shadow, radius, size) is **interpolated, never jumped**, at **200 ms** by default; longer durations are named and justified. Where a person is driving a value directly (typing, arrow keys on a number, dragging, selecting), the value changes in the **next frame, with zero latency**, and only decoration may ease. This page is the two-part framework and checklist; the initial critique (F15.83) and pre-build [audit of the library](archive/motion-audit.md#audit-report) live in the archive.

**Owner, 2026-11-08 20:34 (verbatim, [DoD Q65](definition-of-done.md#owner-instructions)):** *"Develop and entire framework and philosophy around transitions and animations. What I want is a functional transition that conveys how context and content move from one state to the next. I want to rely heavily on morphing of content and content seamlessly and continuously wherever it makes sense. The idea is that if a context/content is present in both state, whether the same or an evolved one, the content should ideally morph seamlessly instead of disappearing and reappearing again. This can become a complex and expensive operation when done and applied everywhere. So, we ca be smart and optimal about it. Many state transition can only transition the wrapper and fake the content within. Various transition of a dialog into a success/error msg etc can all morph into smotth seamless transition by using the same wrapper so that nothing is flickering and breaks seamlessness. Any addition of shadoes, transition of border color, bg color etc should all be animated in value rather than a sudden jump and change in value. We don't want this at the cost of making the experience feel laggy. So we do most of these at 200ms time unless specifically extended where needed and in special places, we might want to completely not have this transition, like while changing the numeric value of an number input using arrow key, any lag in reflecting the value will give a laggy fill. We have to clearly identify wherre 0 latency is expected and not have any transition in such places."*

**Status:** framework **revised after critique** (F15.83) for review (strict design, docs only). The draft (F15.82) was critiqued with the grounding-critic and design-system-auditor checklists; the 15 findings and what each changed are in [Critique and revisions](archive/motion-audit.md#critique-and-revisions), and the sections below already carry the changes (marked *revised F15.83*). Shaped by `ground`, `assumptions`, `design-system`, `perceived-performance`, `ui-states`, `performance`, `visual-noise` and `spacing`. Stable IDs: promises **MP**, jobs **MJ**, user-can **MU**, principles **M**, strategies **S**, catalogue **C**, zero-latency **Z**, performance rules **R**, tokens **T**, primitives **P**, done rows **MV**, assumptions **MA**, decisions **MD**, critique findings **K**.

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

**Migration** (*revised F15.83*, K11): components that read the scale today (`duration.fast`, `medium`, `slow`, directly or through `c.*` and `page-*` aliases) move to the role that names their job; the [audit](archive/motion-audit.md#audit-report) lists each read. Until then the scale stays reduced to 0 under reduce, so nothing changes by surprise.

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

## Critique and audit archive

The initial F15.83 inline critique (K1–K15) and the F15.84–F15.101 audit and implementation packet log live in [Motion framework: initial critique and pre-build audit](archive/motion-audit.md).

## Sources

Cited from prior knowledge, not re-read for this packet; each is to be checked when the implementation relies on it: Nielsen's response-time limits (0.1 s, 1 s, 10 s); the Doherty threshold (~400 ms); W3C CSS Transitions Level 1 (interruption and the reversing shortening factor) and Level 2 (`@starting-style`, `transition-behavior`); CSS Values 5 / `interpolate-size` and `calc-size()`; W3C CSS View Transitions Level 1 and 2; WCAG 2.2 success criteria 2.2.2 (Pause, Stop, Hide), 2.3.3 (Animation from Interactions), 2.4.7 (Focus Visible); Material Design 3 motion (duration and easing tokens; easing by enter, exit and on-screen movement); Apple Human Interface Guidelines, Motion (reduce motion replaces movement with dissolves); Paul Lewis, "FLIP your animations"; the W3C DTCG 2025.10 format (`duration`, `cubicBezier`, `transition` types). This project's skills: `perceived-performance` (100 ms acknowledgement, never block input), `ui-states` (beats, be true), `spacing` (geometry stability), `visual-noise` (transient cues), `performance` (measure before claiming).

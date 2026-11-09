# Clipping

**In the library:** [Clipping](http://127.0.0.1:8766/#/clipping) under Tokens, reading the same list the check reads.

What gets cut off and what never does, in two parts like every UX framework here ([the two-part frameworks](spacing.md#the-two-part-frameworks)): [the framework](#part-1-the-framework) to build with and [the checklist](#part-2-the-checklist) to judge with. Owner Q24 (2026-11-07): *"We should have framework for what gets clipped what doesn't. We should avoid unintended clipping of shadows and borders which happens sometimes."* Written in two parts for Q85.2 (2026-11-09).

## Grounding: what clipping promises

A person sees every mark a component draws to tell them something: where focus is, which surface floats, the whole of a word. A clip that cuts one of those marks hides information, so a clip exists only when cutting is the point (a rounded picture, a hidden label for screen readers, a long name that ends in an ellipsis because its full text is one step away). Everything else is a side effect, and side effects are bugs.

## Part 1: the framework

### Terms

- **Clipping box:** an element that cuts what its descendants paint outside it: `overflow: hidden | clip` on either axis, `clip-path`, `contain: paint | content | strict`. A scroll region (`overflow: auto | scroll`) clips too, by nature ([Scrolling](scrolling.md)).
- **Reach:** how far a mark paints outside its element's box: a focus ring reaches `--size-focus-width` + `--size-focus-offset` (4 px), unless the element draws its ring inside itself; a shadow reaches its blur plus spread, shifted by its offset (`shadow.overlay` reaches 32 px below, 24 px to the sides, 16 px above).
- **Truncation:** text cut on purpose with an ellipsis (`text-overflow`) or a line clamp.

### The method

Clipping is decided per group, from the same hierarchy tree as spacing and framing ([the method](spacing.md#the-method-hierarchy-first-then-space-and-frames-owner-q93)):

1. **Ask whether the group needs to cut at all.** Most don't: a layout region scrolls (a ScrollArea), a card's rounded corners are its border, not a crop. Cut only for one of the five reasons below.
2. **Name the reason** and put the rule on the list (`tools/clipping-allow.json`) with its kind: **shape crop** (a picture, a fill or a bar cropped to a rounded shape), **media crop** (a picture or video fitted to its frame), **visually hidden** (a name for screen readers), **text truncation** and **axis lock** (a layout that holds its height while its regions scroll), plus **transient** (a panel that clips only while it opens or closes).
3. **Give the box's content room for every mark that reaches out.** Padding of at least the reach sits one level inside the clipping box (on its content, never on a wrapper around it, [padding at the right layer](spacing.md#who-owns-each-space)), so an edge control's ring and an edge surface's shadow paint inside the box. A box whose edge is the window's edge needs no room on that side: the window cuts there anyway.
4. **Truncate only where the full text is one step away:** the truncated text is a link or a button that opens it, an option or tree item whose full text shows when chosen, or has its full text in a tooltip or a description. Where nothing opens it, the text wraps (`overflow-wrap: anywhere` for a long file name), never truncates.

### Principles

1. **Clipping is a decision, never a side effect.** Every clip is on the list with its kind and reason; an unlisted clip fails the static check.
2. **A shape crop holds nothing focusable or shadowed** at its edge. A rounded picture, a fill or a bar can be cropped; a control inside a crop keeps a ring's reach from the edge.
3. **Focus rings are never cut.** A control at a clipping edge either has the room (step 3) or draws its ring inside itself (a negative outline offset, like ScrollArea's own viewport or a ConversationList link).
4. **Shadows are never cut** except at the window's edge. A floating surface shown inside a preview keeps the overlay shadow's reach below it.
5. **Hidden text is hidden on purpose and for one audience.** A visually hidden name (`clip-path: inset(50%)` or the 1 px pattern) exists only where its meaning is shown another way (an icon, a position, a style).
6. **One place draws scrollbars:** ScrollArea ([Scrolling](scrolling.md)). A clip is never used to hide a browser bar.

### Choosing

| You need | Use | Not |
| --- | --- | --- |
| A picture with rounded corners | `Image rounded` (its own listed crop) | `overflow: hidden` on the card around it |
| A label only screen readers read | The component's `iconOnly` or `label` prop (its listed visually hidden part) | Your own `clip` rules |
| A long name on one line | A component that truncates and names a step (Select's value, a Chip, a TreeView row, a ConversationList link) | An ellipsis on plain text nothing opens: let it wrap |
| A region that holds its height while its parts scroll | A layout (EditorLayout, AppLayout, ChatLayout): their axis lock is listed, and their bars and heads keep a ring's reach | A clipping wrapper around a page |
| Controls in a bar that scrolls across | `FloatingBar` holding a `ScrollArea`: its content keeps a ring's reach on every side | Bar padding smaller than the ring |

### Never

- `overflow: hidden` on a wrapper to "tidy" a layout; fix the size instead.
- Controls flush against a clipping edge (padding smaller than 4 px between a control and the edge of a box that clips).
- An ellipsis on text that nothing links, opens or names in full.
- A crop that cuts a floating surface's shadow inside the page.

## Part 2: the checklist

Each row passes or fails on a measurement. **DOM** rows are measured by [`tools/clipping-probe.js`](https://github.com/prabinpebam/design-library/blob/main/tools/clipping-probe.js) (`window.clippingProbe().rows`), **static** rows by the named command, **look** rows by an evaluator who didn't build the screen. Severity follows the `spacing` skill: S1 broken, S2 misgrouped or inconsistent, S3 fragile. A screen passes when no S1–S3 row fails.

| ID | Passes when | How | Severity |
| --- | --- | --- | --- |
| CL1 | No focusable element inside a clipping box has its focus ring cut (measured at its outside reach unless a `:focus-visible` rule draws it inside) on a side that isn't the window's edge | DOM | S1 |
| CL2 | No shadow inside a clipping box is cut on a side that isn't the window's edge (StackedBar's outer rounding is the one crop whose cut is the point) | DOM | S2 |
| CL3 | No text is cut by a clipping box without an ellipsis: visible text partly inside a box that clips it on that axis (hidden or clip, not scroll) passes its edge by no more than 1 px across, or 20 % of its font size down | DOM | S1 |
| CL4 | Every text truncated now (an ellipsis or a line clamp that is cutting) sits in something that opens, links, focuses or names it in full (a link, a button, an option, a tree item, a tab, a row, a `title` or a description) | DOM | S2 |
| CL5 | Every clip in core, library, template and example CSS is on the list with its kind and reason, no listed rule has stopped clipping, and no scroll region or scrollbar styling lives outside ScrollArea | static: `npm run check:clipping` | S2 |
| CL6 | The evaluator can name, for each clipping box on the screen, which of the six kinds it is and what it would hide without the clip | look | S3 |

```js
// Playwright: await page.addScriptTag({ path: 'tools/clipping-probe.js' })
window.clippingProbe().rows; // { CL1: { pass, findings, count }, … }
```

### How to run it

Open each screen at 1000 and 320 CSS px, open its panels, load the probe and read the rows; then run `npm run check:clipping`. Read every finding against the method: a missing room is fixed with padding at the clipping box's content (step 3), a truncation without a step by wrapping or by adding the step, an unlisted clip by removing it or listing it with its reason. Content scrolled out of a box's view and a canvas's document (the person's own design) aren't judged.

## Results

**F15.CL1 (2026-11-09 about 14:55, Q85.2):** probe rewritten to score rows (it listed rings and shadows only and had never been run in a packet, foundation.md); a control case (a ring, cut text and a truncation without a step in a clipping box) fails CL1, CL3 and CL4 as it should.

- **Templates:** the 168 rendered template layouts at 1000 CSS px with every panel open and at 320 CSS px: one fail, fixed at the owner. FloatingBar holding a ScrollArea (the Design tool's tools and zoom pill) padded its scrolling content by the bar's padding, 2 px in compact density, so the zoom menu's ring was cut 2 px top and bottom (CL1); the content now keeps at least a ring's reach. After: no row fails at either width.
- **Library pages (265 routes, 1000 CSS px):** three fails, fixed at the owner. EditorLayout's bar and its panel heads had no block padding, so their toggles' rings were cut 2 px by the layout's axis lock wherever the layout isn't at the window's top (its library page): both now keep a ring's reach (CL1). The FloatingBar story's overlay shadow was cut 8 px by the Example preview (24 px inset, 32 px reach): a preview holding a floating surface (`data-elevation` 3 or 4) keeps 32 px below it (CL2). ChatMessage truncated a sent file's name with nothing to open it in full: the name now wraps, and its truncation left the list (CL4). After: no row fails.
- **Static:** `npm run check:clipping` passes (63 allowed clips, 1 barless scroll region).

## Sources

- agentic-craft `visual-noise` (marks earn their place), `spacing` (padding at the right layer, severities) and `ui-copy` (truncation keeps meaning) skills, installed in `.github/skills/`.
- WCAG 2.2 2.4.7 Focus visible, 2.4.11 Focus not obscured, 1.4.10 Reflow.
- This library: `tools/check-clipping.mjs`, `tools/clipping-allow.json`, `tools/clipping-probe.js`; [Clipping in the foundation](foundation.md#clipping).

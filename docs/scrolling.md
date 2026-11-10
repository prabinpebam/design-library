# Scrolling and scrollbars

How every scroll region in the Design library scrolls, why the AI chat template missed it, and how to check it can't happen again (owner Q96, 2026-11-09). Like every UX framework here it has two parts: [the framework](#part-1-the-framework) to build with and [the checklist](#part-2-the-checklist) to judge with ([the two-part frameworks](spacing.md#the-two-part-frameworks)).

> **TL;DR:** Every scroll region is a ScrollArea: the library's thin bar drawn over the content at the surface's edge, padding on the content inside, focus never cut, the wheel never trapped in the page. The static check finds raw scroll regions; the probe finds any element that scrolls outside a ScrollArea (SB1–SB7).

## What went wrong (Q96.1)

**What the owner saw:** the AI chat template's sidebar and conversation drew the browser's own scrollbar (a grey bar that takes a column beside the content), not the library's thin overlay bar.

**Which regions:** every region that scrolled with a raw `overflow: auto` instead of the library's `ScrollArea`:

| Where | Regions | Template pages affected |
| --- | --- | --- |
| ChatLayout | the sidebar, its list above the account footer, the conversation | every AI chat page |
| AppLayout | the sidebar, the view | every Projects page, Design files |
| Dialog, Sheet | the body | every dialog and side sheet |
| Canvas, Board | the working area (both ways), the columns (across) | Design editor, Projects board |
| Carousel | a long row of thumbnails | carousels with a thumbnail picker |
| AvatarGroup | the "+n" list of everyone else | avatar groups with more people than shown |
| TextArea | the text box itself, once its text runs past its height | every form with a multi-line field (issue-edit showed a 10 px native bar) |

**Which seam was bypassed:** `ScrollArea` (`packages/core/react/fundamentals/ScrollArea.tsx`), the one fundamental that draws the library's bar over the content, keeps the content's width the same whether it overflows or not, and keeps focus rings inside. EditorLayout, the library's own pages, popups and code blocks used it; the layouts and compounds above were built later and scrolled their regions directly.

**Why no check caught it:**

1. **The check accepted a raw region once it was listed.** `check:clipping` flagged an unlisted `overflow: auto`, but its fix message said "list it and keep edge rings inside its padding", never "use ScrollArea". Listing a region silenced it; nothing asked whether the region drew the library's bar.
2. **The check wasn't run.** `check:clipping` wasn't in the project's list of static checks (`AGENTS.md`), so each packet ran the others and skipped it. By the time of Q96 it failed on 36 items, mostly truncation and visually-hidden text added since it last passed, and the chat regions were lost in that noise.
3. **It didn't look everywhere.** It read core and library CSS only, not template or example CSS or inline styles in TSX.
4. **The rule didn't name the seam.** The guide said "scroll regions bleed to the surface edge with the scrollbar at the edge" (where the bar goes), not "every scroll region is a ScrollArea" (what to use). An agent writing a layout had nothing at the point of writing it to point it to ScrollArea.
5. **Nothing looked at the finished screen.** No browser check asked "which elements scroll, and do they draw the library's bar?"

**Fixed (Q96.1):** each region is now a `ScrollArea` placed where it meets its surface's edge, with its padding moved to its content: ChatLayout (sidebar list, conversation), AppLayout (sidebar, view), Dialog and Sheet bodies, Canvas (both axes, its viewport is the named region), Board (across), Carousel's thumbnail row, AvatarGroup's list (also losing its padding inside padding), and FloatingBar, which now moves its padding onto a scrolling child so the editor's tools bar reaches the pill's edge. TextArea, which can't be wrapped because its text is the scroller, takes the library's thin bar in the library's colours from `scroll-area.css`, the only stylesheet allowed to style a bar. Behaviour kept: the chat stays pinned to the newest message, "Jump to newest" appears when scrolled away, and the sidebar footer's hairline shows only while the list runs under it.

## What went wrong (Q109)

**What the owner saw (2026-11-10):** the Typography page's two screen demos ("A brand's own faces": Harbour's home with a site-supplied display face, Corporate's home with label and numeral roles) scrolled with the browser's own 10 px bar, not the library's.

**Which region:** the document inside each `ScreenPreview` frame. A ScreenPreview shows a whole screen (`site.html#/app/…`) in an `iframe`; the screen's page is taller than the frame, so the framed document scrolls, and a document scrolls with the browser's bar. The same held for every ScreenPreview in the library: every template layout's page (the screen, the narrow window, each state), the Colour, Layout, Routing and Site pages, and the parts demos.

**Why the checklist, the check and the probe all missed it:**

1. **The rule exempted it by wording.** SB1 and the probe said "the document itself is the only other scroller". That's right for the page a person opens, but a framed document is a region of the page around it, and nothing said so; the exemption covered it.
2. **The probe never looked inside a frame.** `scroll-probe.js` walked the elements of one document; an `iframe` is one element with no overflow of its own, so the scrolling inside it was invisible. On the Typography page it reported 6 regions and no failures.
3. **The static check can't see a document's scroll.** Nothing in the source says `overflow: auto`: a document scrolls by default. `check:clipping` looked for written scroll styles only, so a frame passed.
4. **The sweep ran on screens one at a time.** Q96's sweep probed all 168 template layouts on their own (where the document's own bar is right) and the 265 library pages without their frames' insides, so a screen shown inside a page was never judged as a region of it.

**Fixed (Q109.1):** at the seam that shows a screen in a frame. `ScreenPreview` marks the framed document's root `data-dl-framed` when it loads (same origin only; ScreenPreview isn't for third-party content), and `scroll-area.css`, the one stylesheet allowed to style a bar, gives a framed document the library's thin bar in the library's colours, as a TextArea's text has. The same screen opened on its own keeps the document's own bar. Before: a 10 px browser bar in both Typography demos; after: the 6 px library bar.

**The gap closed (Q109.2):**

- **Probe:** `scroll-probe.js` now descends into every same-origin frame, judges SB1–SB5 inside it (findings are prefixed with the frame's title), and adds **SB9**: a framed document takes the library's bar. A frame not loaded yet (lazy, far from view) is listed in `unloaded`, never passed silently. Before the fix it failed SB9 on both Typography frames; after, it passes.
- **Static:** `check:clipping` fails any `<iframe>` in core, library, template or example TSX outside `ScreenPreview` ("show the screen with ScreenPreview, which gives the framed document the library's bar"). One frame is listed with its reason: MediaPlayer's video-host player, sized to the video, which never scrolls. A planted `<iframe>` in `apps/library/src` failed the check; it was removed and the check passes.

## Part 1: the framework

The short, wrapping Tooltip Hint is not a scroll region. Its popover explicitly
uses visible overflow rather than the browser's default `overflow: auto`, while
retaining its content padding and viewport-width constraint. Popup lists that
can exceed the viewport instead delegate scrolling to an inner ScrollArea.

### The rules

1. **Every scroll region is a ScrollArea.** No `overflow: auto` or `scroll` on any other element, in CSS or inline. The one exception is a region whose own controls replace the bar (a Carousel's slide track, marked `data-scrollbar="none"` and listed with its reason).
2. **The bar is drawn over the content, never beside it.** The content's width and alignment are the same whether it overflows or not; nothing moves when it starts to overflow.
3. **The region meets its surface's edge.** Place the ScrollArea where the region meets the edge of the surface it scrolls (a sidebar, a dialog, a pane, a pill), so the bar sits on that edge and the content scrolls to it. The surface keeps no padding around it.
4. **Padding goes on the content inside.** Through ScrollArea's `inset` or a padded child, so the padding scrolls with the content and the end of a long list is never hidden under the edge.
5. **Focus is never cut off.** A focused item at the region's edge shows its whole ring: the region's content keeps the ring's width inside it, and the region's own ring (when it takes focus) is drawn inside its box.
6. **Pick the axis.** `block` (down; the default), `inline` (across: a board, a tools row, a code block) or `both` (a canvas, a view that may hold something wide). `maxSize` (`sm`, `md`, `lg`) for a region in flow that grows until it scrolls; `fill` takes the height its parent gives it.
7. **The wheel isn't trapped.** A region in the page passes the wheel on to the page at its end; only a popup or a modal stops it there (`contain`).
8. **Name a region nothing inside can focus.** Give it `label`, so it becomes a named, focusable region that scrolls with the keys.
9. **A control that scrolls its own text** (a TextArea) keeps the browser's scrolling and takes the library's thin bar in the library's colours; a TextArea that grows with its text (`grow`) scrolls only past its largest size.
10. **Forced colours and touch screens** get the system's own bar back; that's ScrollArea's job, never a region's.
11. **A screen shown in a frame is a region of the page** (Q109). Show it with `ScreenPreview`, never a raw `iframe`: its document then scrolls with the library's thin bar. Only the top document, the page a person opened, keeps its own bar.

### Choosing

| You need | Use |
| --- | --- |
| A layout's region (sidebar, view, conversation, panel) | Already a ScrollArea inside every core layout; nothing to add |
| A list or panel inside a page that grows, then scrolls | `<ScrollArea maxSize="md" surface="sunken">` |
| Something wide that scrolls across | `<ScrollArea axis="inline">` |
| A popup list or a dialog body | Already a ScrollArea in Select, MenuButton, Dialog and Sheet; for your own popup, `<ScrollArea contain>` |
| A multi-line field | `TextArea` (`grow` for one that grows with its text) |

## Part 2: the checklist

Each row passes or fails on a measurement. **DOM** rows are measured by [`tools/scroll-probe.js`](https://github.com/prabinpebam/design-library/blob/main/tools/scroll-probe.js) (`window.scrollProbe()`), **static** rows by the named command. Severity follows the `spacing` skill: S1 broken, S2 misgrouped or inconsistent, S3 fragile. A screen passes when no S1–S3 row fails.

| ID | Passes when | How | Severity |
| --- | --- | --- | --- |
| SB1 | Every element that can scroll, in the page and inside every frame in it, is a ScrollArea's viewport, or a listed region whose own controls replace the bar (`data-scrollbar="none"`); the top document is the only other scroller | DOM | S2 |
| SB2 | No element but the top document draws the browser's bar (one that takes width or height from the content) | DOM | S2 |
| SB3 | A ScrollArea that fills its region (no surface of its own) reaches the region's edge on the side its bar sits: the inline end for a region that scrolls down, the block end for one that scrolls across | DOM | S2 |
| SB4 | No scroll box carries padding of its own; its padding is on the content inside | DOM | S3 |
| SB5 | A control that scrolls its own text (TextArea) uses the library's thin bar in the library's colours | DOM | S2 |
| SB6 | No `overflow: auto` or `scroll` outside `scroll-area.css` and the listed barless regions, in core, library, template or example CSS or inline TSX styles; no scrollbar styling outside `scroll-area.css`; no `<iframe>` outside ScreenPreview and the listed non-scrolling players | static: `npm run check:clipping` | S2 |
| SB7 | A focused item at a region's edge shows its whole ring | DOM: [`tools/clipping-probe.js`](https://github.com/prabinpebam/design-library/blob/main/tools/clipping-probe.js) | S1 |
| SB8 | The wheel scrolls the page at a region's end, except in a popup or modal | look: scroll to a region's end with the wheel | S2 |
| SB9 | A document shown in a frame (ScreenPreview) takes the library's thin bar in the library's colours; no frame is left unprobed (`unloaded` is empty once every frame has been scrolled near) | DOM | S2 |

### How to run it

```js
// Playwright: await page.addScriptTag({ path: 'tools/scroll-probe.js' })
const result = window.scrollProbe(); // the whole document, or a selector
result.rows;    // { SB1: { pass, findings, count }, … }
result.regions; // every scroller: 'chat-layout.scroll overflowing', 'textarea', …
```

`npm run check` runs SB6 with every other static check.

## Results

### F15.SB2 (2026-11-10 about 08:20, owner Q109)

- **Typography:** both screen demos drew the browser's 10 px bar before; after, the library's 6 px thin bar. The probe failed SB9 on both frames before the fix and passes after.
- **Static:** a planted `<iframe>` in `apps/library/src` failed `npm run check:clipping`; removed, the check passes. `npm run check`, the type check and the library build pass.
- **Sweep:** all 269 library pages at 1000 and 320 px, light and dark, with every framed screen loaded and probed inside (1,076 page probes, 1,388 framed screens, 10,372 scroll regions): no SB1–SB5 or SB9 row fails, no frame left unprobed. Template layouts are covered through their library pages' frames.

### F15.SB1 (2026-11-09 about 12:35, owner Q96)

- **Static:** `npm run check:clipping` passes: 64 clips on the list, each with its reason, and one barless scroll region (Carousel's track). Before: over 30 problems. The 17 legitimate clips added since the check last passed (truncated names, visually-hidden announcements, crops, the app layouts' holding clip, a view transition's corners) are now listed with their reasons. `npm run check` passes for the first time, with `check:views` and `check:parts` fixed along the way (a raw focus wrapper in the form block, now the Hero itself; descendant selectors in Hero, EmptyState and Canvas, now child paths).
- **Browser:** the scroll probe on all 168 built template layouts at 1000 × 800 (69 scroll regions) and on all 265 library pages: no SB1–SB5 row fails. After the layouts were fixed, 29 layouts still failed (every multi-line field, the editor's tools bar, a code block) until TextArea and FloatingBar were fixed and SB3 judged only the bar's own edge. The spacing probe on the same 168 layouts: no regression.
- **Open, for the owner:** CodeBlock keeps room for its copy button at the well's end, so a code block that scrolls across ends its bar 52 px before the well's edge (SB3 is judged only for a region that fills its parent, which this one doesn't). The alternative is code that scrolls under the copy button. Kept as it is until the owner chooses.

## Rules agents miss (Q96.3)

Scrollbars weren't the only rule written in prose and missed in code. The consumer guide now has one before-done checklist, [Rules agents miss](https://github.com/prabinpebam/design-library/blob/main/packages/core/AGENTS.md#rules-agents-miss), with each rule's seam and the check that catches it: scroll regions, space from the hierarchy, colour through semantic roles, layers, motion, materials, clipping, child-path parts, switches and selects, and plain JSON content. They were missed for the same reasons:

- **The rule names an outcome, not a seam.** "The bar sits at the edge" doesn't say "use ScrollArea". Each row now names the component or token to use.
- **The check isn't run, or is too lenient.** One command, `npm run check`, now runs every static check, so none is skipped. A check's message says how to fix the problem, not how to silence it.
- **The finished screen isn't measured.** Each row has a probe or a look row in its framework's part 2, run on every template.

## Sources

- The `spacing` skill, rule 14 (pad the right level; scroll regions bleed to the surface; never clip a focus ring), installed in `.github/skills/spacing/`.
- This library: `ScrollArea` (owner F14), `tools/check-clipping.mjs`, `tools/clipping-allow.json`, `tools/scroll-probe.js`, `tools/clipping-probe.js`.
- WCAG 2.2 2.4.11 Focus Not Obscured, 2.1.1 Keyboard (a region nothing inside can focus takes focus itself).

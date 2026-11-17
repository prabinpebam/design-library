# Widths of floating and overlaid surfaces

**In the library:** [Widths](http://127.0.0.1:8766/#/widths), live, with the scale and every surface at its width.

> **TL;DR:** Every menu, list, tooltip, popover, picker, dialog, sheet and notification takes its width from **one scale of seven steps** (`size.width-xs` to `size.width-3xl`: 12, 16, 20, 24, 32, 40, 48 rem). Lists **fit their content and snap up** to the next step (xs, sm or md), measured once as they open; everything else has **one width per kind and purpose**, chosen from the [decision table](#the-decision-table). Nothing has an in-between width, nothing is wider than its content needs, and long words wrap rather than widen. Written for agents first: the [procedure](#the-procedure) and the [checklist](#part-2-the-checklist) are what to run.

**Owner, 2026-11-11 08:23 (verbatim, [DoD Q130](definition-of-done.md#owner-instructions)):** *"We need to have a framework and strategy for how to decide the appropriate width of something like dialog, menu, dropdown list. We want it to accomodate the content, not be unnecessarily wide, stick to a uniform/consistent width that is followed for the site, pick for a few preset widths... etc. Articulate this framework and update the Design library with these predefined widths that works for vasrious contents so that we use the right width for all these elements. This is meant for consumption by agents primarily."*

Like every UX framework here it has two parts: [the framework](#part-1-the-framework) to build with and [the checklist](#part-2-the-checklist) to judge with ([the two-part frameworks](spacing.md#the-two-part-frameworks)). Status: strict design, not approved.

## Part 1: the framework

### The three forces

A surface's width answers three things at once, in this order:

1. **The content.** It must hold its content without a needless gap: a menu of "Copy, Paste, Delete" in a 20 rem box reads as empty space with words floating at its start.
2. **Consistency.** The same kind of surface has the same width across the site, so a person learns where its edges are; two widths that differ by a few pixels look like a mistake.
3. **The window.** It never runs past the window, and on a phone it becomes the window.

A few preset widths satisfy all three: content picks the step, the step makes it consistent, and the window caps the step.

### The scale

Seven steps, in `rem` so they grow with the text size setting. Steps of 4 rem up to `lg`, then 8 rem: small surfaces need fine steps to fit their content; big ones only need to be clearly different.

| Step | Token | Width | At 16 px | Fits |
| --- | --- | --- | --- | --- |
| xs | `size.width-xs` | 12 rem | 192 px | A list of one- or two-word items: sort orders, units, "Copy, Paste, Delete" |
| sm | `size.width-sm` | 16 rem | 256 px | A list of short phrases, or items with an icon or avatar: people, actions with shortcuts |
| md | `size.width-md` | 20 rem | 320 px | The widest any list or tooltip gets on its own; the default popover; a narrow sheet |
| lg | `size.width-lg` | 24 rem | 384 px | List items with a description line; a popover of filters; the colour picker; a confirmation dialog; a medium sheet |
| xl | `size.width-xl` | 32 rem | 512 px | A dialog holding a form; the notification pill's cap |
| 2xl | `size.width-2xl` | 40 rem | 640 px | A wide sheet: an editor panel, a detail view beside a list |
| 3xl | `size.width-3xl` | 48 rem | 768 px | A dialog holding a table, a comparison or a multi-step task |

Each surface's own component token aliases a step, so a theme that changes a step changes every surface that uses it, and nothing keeps a width number of its own:

| Component token | Step |
| --- | --- |
| `c.popup.width` (cap of every list) | md |
| `c.tooltip.width` (cap) | md |
| `c.popover.width` (default) | md |
| `c.colour-picker.width` | lg |
| `c.dialog.width-s`, `-m`, `-l` | lg, xl, 3xl |
| `c.sheet.width-s`, `-m`, `-l` | md, lg, 2xl |
| `c.notifications.max-width` (cap) | xl |

### The decision table

Find the surface, then the content; the width is the step in the last column. "Fits" means the surface measures its content and takes the narrowest step that holds it.

| Surface | Content | Width | How to get it |
| --- | --- | --- | --- |
| MenuButton menu | Any items | Fits: xs, sm or md | Default; nothing to set |
| MenuButton menu | Items with descriptions or previews | lg | `listWidth="lg"` |
| MenuButton menus in one toolbar | Menus opened side by side | The widest one's step, on all of them | `listWidth` with the same step |
| Select list | Any options | Fits: xs, sm or md, never narrower than the box | Default; nothing to set |
| Select list | Options that load or change while it's open (`onSearch`) | The step the longest expected option needs | `listWidth` |
| Mentions list | People | Fits: sm or md | Default |
| AvatarGroup "+n" list | People | Fits: sm or md | Default |
| Tooltip | A name or a hint | Fits, up to md, then wraps | Default; keep hints to two lines |
| Popover | A line of help, a confirmation by its button | sm | `width="sm"` |
| Popover | Help with a link, a short form | md | Default |
| Popover | A set of filters, paired fields | lg | `width="lg"` |
| ColourPicker | Its plane, sliders and fields | lg | Fixed |
| DatePicker, Calendar | The month grid | The grid's own width | Fixed by its content; never pin |
| Dialog | A question and two buttons (confirm, delete) | lg | `size="s"` |
| Dialog | A form, settings, a short task | xl | `size="m"` (default) |
| Dialog | A table, a comparison, several steps | 3xl | `size="l"` |
| Sheet | A narrow list or a few settings | md | `size="s"` |
| Sheet | Details or a form beside the page | lg | `size="m"` (default) |
| Sheet | An editor or a rich detail view | 2xl | `size="l"` |
| Notification | One line of status | Fits, up to xl | Default |

Content wider than the top of its row belongs one surface up: a popover that needs more than lg is a dialog; a dialog that needs more than 3xl is a sheet or its own page.

### The rules

| ID | Rule |
| --- | --- |
| **W1** | **Only steps.** Every overlay's width is a `size.width-*` step, through its component token or a prop. Never a raw `rem` or `px` width, never `max-content` on its own, never a new component width token that doesn't alias a step. |
| **W2** | **Fit, then snap up.** A list measures its content as it opens and takes the narrowest of xs, sm and md that holds it (`usePopup`, `snapWidth` in `behaviour/popup.ts`). Never an in-between width, never a fixed width it doesn't need. |
| **W3** | **Cap, then wrap.** A list or tooltip is never wider than md on its own; an item longer than that wraps inside it. If items wrap often at md, shorten the copy (ui-copy) or, for items with descriptions, pin lg. Long words never widen a surface. |
| **W4** | **A floor from the anchor.** A Select's list is never narrower than its box, so the list reads as the box opened. A menu may be wider than its button. |
| **W5** | **Stable while open.** The width is measured once, when the surface opens; typing to narrow a list, scrolling or a choice saving never changes it. Pin a step when the items load or change while it's open. |
| **W6** | **One width per kind and purpose.** Dialogs and sheets take their size from their purpose in the table, the same on every page. Menus that open side by side (one toolbar, one header) pin the same step. |
| **W7** | **The window wins.** Every surface is capped at the window less the page margin on both sides; a dialog fills the window at 30 rem and narrower; a sheet goes solid when it covers more than about half the window. |
| **W8** | **Fixed content keeps its own width.** A calendar's grid and the colour picker's plane set their width; never pin or stretch them. |
| **W9** | **A missing width is a wrong surface.** When no step suits the content, move the content one surface up (popover → dialog → sheet → page) or change the content. Adding a step is the owner's decision, recorded in the DoD. |

### The procedure

For an agent placing or reviewing any floating or overlaid surface:

1. **Name the surface** (menu, select list, mentions, tooltip, popover, picker, dialog, sheet, notification).
2. **Name the content** in a few words: "three short actions", "people with avatars", "a form of four fields", "a table of plans".
3. **Look up the row** in [the decision table](#the-decision-table). Lists: leave `listWidth` out unless the row says to pin. Popover: `width` only for sm or lg. Dialog and sheet: `size` from the purpose, not from what looks right on one page.
4. **Check the neighbours.** Menus that open side by side get the same `listWidth`. Dialogs of the same purpose across the site use the same `size`.
5. **Look at it** at the window you designed for and at 320 px: nothing past the window, nothing floating in empty space, nothing wrapping more than two lines.
6. **Run `npm run check`.**

### What changed with Q130

| Surface | Before | Now |
| --- | --- | --- |
| MenuButton menu | Always 20 rem | Fits: 12, 16 or 20 rem; `listWidth` pins |
| Select list | Its content's exact width, any number | Fits, snapped to 12, 16 or 20 rem, never narrower than the box; `listWidth` pins |
| Mentions list | Always 20 rem | Fits: 12, 16 or 20 rem |
| AvatarGroup list | Its content's exact width | Fits, snapped to a step |
| Popover | 20 rem only | sm, md (default) or lg |
| ColourPicker | 22 rem | 24 rem (lg) |
| Sheet m | 26 rem | 24 rem (lg); it goes solid at 48 rem windows (was 52) |
| Notifications cap | 35 rem | 32 rem (xl) |
| Dialog s, m, l; Sheet s, l; Tooltip | 24, 32, 48; 20, 40; 20 rem | The same, now read from the steps |

## Part 2: the checklist

An evaluator who didn't build the surface scores each row pass or fail with evidence ([the adversarial loop](adversarial-loop.md)).

| Row | Check | How |
| --- | --- | --- |
| **WC1** | Every overlay width is a step (W1) | `grep` the CSS of the change for `inline-size` and `width` on popups, surfaces, dialogs and sheets: each reads a `--size-width-*` or an aliasing `--c-*` token |
| **WC2** | Lists fit (W2) | Open each menu and select list: its width is 192, 256 or 320 px at 16 px text (or the box's width, for a Select wider than that), and no item has more than about a step's worth of empty space after it |
| **WC3** | Nothing in between (W2, W6) | In the browser console, list each open overlay's `offsetWidth`: every one equals a step, the anchor's width, the window less margins, or a fixed-content picker |
| **WC4** | Long content wraps (W3) | Give a list one very long item: the list stays at md and the item wraps; nothing runs past the edge |
| **WC5** | Stable while open (W5) | Type to narrow a searchable Select: the list's width doesn't change |
| **WC6** | Consistent (W6) | Dialogs and sheets of the same purpose have the same `size` everywhere; side-by-side menus have the same width |
| **WC7** | The window wins (W7) | At 320 px: every surface fits inside the window with the page margin either side; dialogs fill the window |
| **WC8** | Right surface (W9) | No popover holds a form wider than lg; no dialog scrolls sideways |

Pass rule: every row passes on every surface the change touched.

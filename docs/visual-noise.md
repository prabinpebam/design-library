# Visual noise: every mark earns its place

How the Design library keeps a screen calm: every line, border, fill, shadow, icon, colour and word carries information nothing else on the screen carries (owner Q85.2, 2026-11-09). Like every UX framework here it has two parts: [the framework](#part-1-the-framework) to design with and [the checklist](#part-2-the-checklist) to judge with ([the two-part frameworks](spacing.md#the-two-part-frameworks)). It's inferred from the agentic-craft `visual-noise` skill, installed in `.github/skills/visual-noise/`, and sits beside [Spacing](spacing.md) (space groups first) and [Materials](materials.md) (what floats and how).

> **TL;DR:** Every mark carries something nothing else carries: one boundary per group, members of an enclosed group bare, at most two enclosures deep, the cheapest cue that works (space, alignment, type, tone, border, shadow), state cues only while the state is active, no one-sided stripes. The probe counts enclosures, borders, strokes, fills and resting cues (VN1–VN6).

## Part 1: the framework

### Terms

- **Mark:** anything drawn: a border, divider, fill, shadow, icon, colour, word.
- **Noise:** a mark that tells the person nothing new: a box around something space already groups, a second cue for a meaning already shown, a sentence describing what the screen shows.
- **Enclosure:** a visible boundary at rest: a border, a fill that differs from its parent's, or a shadow. A field's boundary is one that's allowed to be (it has to be found, WCAG 1.4.11).
- **Cue:** a mark that shows one meaning: grouped, selected, failed, pressable, a drop target.

### The method: from the tree, the cheapest cue

Noise is decided on the same [hierarchy tree](spacing.md#the-method-hierarchy-first-then-space-and-frames-owner-q93) as space, after space has done its work:

1. **Space groups first.** Every boundary of the tree is shown by its gap. Only where space can't show it does a group take an enclosure.
2. **Name each mark's meaning.** For each mark about to be added: what does it say? Nothing, or what something else already says: don't add it.
3. **Take the cheapest cue that works**, in order: space → alignment → type (size, weight) → tone or fill → border → shadow. Stop at the first that does the job.
4. **One enclosure per boundary.** A group that draws a boundary is the only one at it: its members (a toolbar's buttons, a card's actions, a menu's items) are bare (Button `emphasis="quiet"`, the group's own parts). At most two enclosures deep in flow; a surface that floats (Dialog, Sheet, a popup, FloatingBar) starts again at one.
5. **State cues live in the state.** Hover, press, focus, a drag's drop target, a customise mode's slots appear only while the state is active. At rest only two state cues stay: selected or on (a fact about the control) and the focus ring while focus is visible. An unavailable control keeps the look that says so.
6. **Colour means something.** Neutrals for structure, the accent for the main action and selection, `color.status.*` only where a status is shown (with an icon or a word). `spectrum.*` and `set.*` only for their declared purpose ([colour model](foundation.md#colour-model)).

### Principles

1. **Ink budget.** Every mark carries information nothing else carries.
2. **One cue per meaning; two at most, one not colour** (WCAG 1.4.1).
3. **No decoration.** No gradients, textures, inner shadows, ornamental rules, and never a stripe on one edge of a card, button, callout or item (owner constraint).
4. **Icons and words earn their place.** An icon where it's recognised faster than the word, or a compact target with its name; no sentence restating the screen.
5. **Approved components keep their look.** A component is never restyled as a side effect of another change; a new look for a new mode is scoped to that mode.
6. **Small families.** In one view: at most three stroke values, four fills and two shadows (raised and overlay), status and accent apart.

### Never

- A border, outline, resting fill or shadow on members of an enclosed group.
- A card inside a card; more than two enclosures deep in flow.
- A hover, drag or customise cue left on at rest.
- A divider, a large gap and a border on the same boundary; a fill, a border, bold and a check for one selection.
- A one-sided accent stripe; colour as the only cue, or as decoration.
- An icon beside every label; a sentence that describes what the screen shows.
- An approved component restyled in a view.

## Part 2: the checklist

**DOM** rows are measured by `tools/noise-probe.js` at rest (nothing hovered or focused, motion settled); **look** rows by an evaluator who walks the view at rest and in each state. Severity follows the skill: N1 misleading, N2 cluttered, N3 heavy, N4 polish. A view passes when no N1–N3 row fails.

| ID | Passes when | How | Severity |
| --- | --- | --- | --- |
| VN1 | Members of an enclosed group carry no border, fill or shadow of their own at rest (fields, the selected or current member, an unavailable control and one accent action excepted) | DOM | N1 |
| VN2 | No border on one inline side only, wider than a hairline (a stripe) | DOM | N1 |
| VN3 | At most two visible enclosures from the surface to anything in flow; floating surfaces start again; a status or accent fill (a badge) is a cue, not a level | DOM | N2 |
| VN4 | At most three distinct stroke values in the view, status and accent excepted | DOM | N3 |
| VN5 | At most four distinct fills in the view, status, accent and selection excepted | DOM | N3 |
| VN6 | At most two distinct shadows in the view | DOM | N3 |
| VN7 | Leave each state (move the pointer away, finish the drag, close the mode): nothing it drew is still there | look | N1 |
| VN8 | Each state's meaning uses at most two channels (fill, border, weight, colour, icon, word), one not colour | look | N2 |
| VN9 | Cover each border, divider, fill, shadow and icon: something becomes ambiguous (otherwise it's decoration or a heavier cue than needed) | look | N3 |
| VN10 | No sentence restates what the screen shows; no helper text repeats its label | look | N4 |
| VN11 | Every component looks as it does in the library; any new look is scoped to a new state or mode | look, side by side with the library page | N1 |

### How to run it

```js
// Playwright: await page.addScriptTag({ path: 'tools/noise-probe.js' })
const result = window.noiseProbe(); // the page's layout by default, or a selector
result.rows;   // { VN1: { pass, findings, count }, … }
result.values; // { strokes, fills, shadows } counted in the view
```

Run it in light and dark, with every panel open, at rest.

## Results

### F15.VN1: the noise framework and its sweep (2026-11-09 about 14:05, owner Q85.2)

- **Sweep.** The 168 rendered template layouts in dark at 1000 CSS px with every panel open, and 21 of them (every template) in light: no VN row fails. The busiest views use one stroke value, three fills and one shadow (AI chat, Conference tickets, the Design tool editor).
- **The probe was checked against planted noise** (a bordered button inside a bordered group, a 4 px stripe): both are caught.
- **A fault in the skill's snippet, found while building the probe:** its "transparent" test (`/rgba?\([^)]*,\s*0(\.0+)?\)$/`) also matches any opaque colour whose blue channel is 0 (`rgb(255, 0, 0)`), so a red, orange, yellow or green border or fill would be skipped. `tools/noise-probe.js` reads alpha only; the upstream `agentic-craft` snippet should take the same fix (not changed here: upstream checkouts stay unmodified).
- **Judged, not counted:** the AI chat composer's Send button draws an outline inside the composer's box while it's unavailable (nothing typed). That's the unavailable look of a primary button, a fact about the control, so VN1 allows it; a reviewer may still prefer the quiet look there.

## Sources

- agentic-craft `visual-noise` skill (rules, checks, thresholds and the measuring snippet), installed in `.github/skills/visual-noise/`.
- NN/g heuristic 8 (aesthetic and minimalist design); Tufte's data-ink ratio (via the skill's sources).
- WCAG 2.2: 1.4.1 Use of colour, 1.4.11 Non-text contrast.
- This library: `tools/noise-probe.js`; the colour model and materials pages.

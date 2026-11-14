# Word in Figma's clothes (Q161)

An experiment (owner Q161, 2026-11-13 23:02): does the library make a new product UI fast? The template `word-figma` gives a word processor's functions Figma's chrome, mental model, layout and controls. It is a copy of the Figma replica template (`packages/templates/design`) that edits a real document on the canvas through core `useRichText` (G6), the way the Word replica (`packages/templates/word`) does.

Mode: strict design, made fast. No pixel scoring or evaluator loop; the build, `npm run check` and `check:works` (0 dead) only.

## The mental model

Figma: **a file holds pages; a page is a canvas of layers; select a layer and the right panel shows its properties, grouped in sections; tools in a bar create things; the main menu holds file and edit commands; comments are pins in their own mode.**

Word mapped onto it: **the file is the document; the canvas shows the document's pages; its headings are the layers; the selection in the text is "the selected layer", so the right panel shows its Text, Paragraph and Style properties; inserting is a tool; File and Edit live in the main menu; comments are Figma's comment mode.**

## Feature map

| Word feature group | Figma home | Why |
| --- | --- | --- |
| **File / Backstage** (New, Open, Save, Print, Export PDF, Share, Info, Version history) | Main menu (top-left menu button) → File submenu; **Share** button in the right panel's head; file name and project in the left panel's head | Figma has no backstage: file commands live in the main menu, sharing is the blue Share button, and the file's name heads the left panel. |
| **Clipboard** (Cut, Copy, Paste, Format Painter) | Main menu → Edit submenu (with shortcuts); keyboard | Figma keeps clipboard commands in the Edit menu and the right-click menu; there's no on-screen clipboard group. |
| **Font** (family, size, bold, italic, underline, strikethrough, sub/superscript, case, colour, highlight, clear) | Right panel → **Text** section: family Select, size NumberField with presets, Bold, Italic, Underline, Strikethrough, Subscript and Superscript as pressed icon toggles, a Case menu, Clear formatting in the section head; text colour and highlight as the **Fill** section | Figma's Typography section owns family, weight, size and decoration; a text layer's colour is its Fill. |
| **Paragraph** (alignment, line spacing, bullets, numbering, indent, show marks) | Right panel → **Paragraph** section: alignment SegmentedControl, line height NumberField with presets, indent buttons, list SegmentedControl, Show paragraph marks Switch | Figma's text section has alignment and line height in the same panel; lists and indent are its "list" options. |
| **Styles** (Normal, Title, Heading 1/2, Quote) | Right panel → **Style** Select (Figma's text styles), plus left panel **Assets** tab listing the document's styles | Figma applies a text style from a style picker in the Typography section and lists local styles in Assets. |
| **Insert** (table, page break, date, symbol, line) | Toolbar → **Insert** tool with a flyout (Figma's shape-tool flyout): Table, Page break, Horizontal line, Date, Symbol; also the main menu's Insert submenu | Creating things is a tool in Figma's bar; the less common ones share one tool's flyout. |
| **Layout** (margins, orientation, columns, page colour) | Right panel when nothing is selected → **Page** section | Figma shows the page's own properties (background) when nothing is selected; the page is the frame. |
| **References** (table of contents, citations, footnotes) | Left panel **Layers** = the headings (a live outline, a TOC you can click) | The headings already are the document's structure, which is what Layers shows. |
| **Review / comments** | Toolbar → **Comment** tool; the right panel becomes the comment threads (Figma's comment mode) | Figma's comments are a tool and a mode that swaps the properties panel for threads. |
| **View / zoom** (zoom, read mode, ruler, navigation pane) | Zoom menu at the end of the right panel's tab row (and View submenu, Ctrl+= / Ctrl+- / Ctrl+0); the panel toggles; the toolbar's mode switch = Edit / Read, and the Present (play) button opens Read mode | Figma's zoom is a menu in the panel head; panels toggle; the bar's mode switch is Design / Dev, here Edit / Read. |
| **Find** | Left panel → **search layers** button opens a find field; matches list as results under it and highlight on the page | Figma's find lives in the layers panel's search. |
| **Status bar** (page n of m, word count, language) | Right panel when nothing is selected → **Document** section (pages, words) | Figma has no status bar; facts about the file sit in the panel when nothing is selected. |
| **Undo / Redo** | Main menu → Edit → Undo / Redo (with Ctrl+Z / Ctrl+Shift+Z) | Figma has no undo buttons on screen; it's the Edit menu and the keyboard. |

### No natural Figma home

- **Mailings** (mail merge, envelopes, labels): nothing in Figma resembles a data merge on screen; left out.
- **Draw** (ink, pens): Figma's pen and pencil draw vector paths, not ink over text; left out.
- **Track changes / Accept / Reject**: Figma has version history but no inline revision marks; Version history is a main-menu item that says it isn't in this example.
- **Citations, bibliography, footnotes, captions, cross-references**: no Figma counterpart; left out.
- **Spelling and grammar, Thesaurus, Read aloud, Dictate, Editor/Copilot**: no counterpart in a design tool's chrome.
- **Ruler and tab stops, page numbers, headers and footers, section breaks**: Figma has no ruler on text frames; left out.
- **Right-click (context) menu**: Figma relies on it for Cut, Copy, Paste and Bring forward; core has no context menu component, so the browser's own menu shows (core gap G-WF1).

## Time log

| Mark | Time (+05:30) |
| --- | --- |
| Brief received | 2026-11-13 23:03 |
| Mapping page openable | 2026-11-13 23:06 (3 min) |
| First openable screen | 2026-11-13 23:15 (12 min): the editor at `/site.html#/app/word-figma/editor`, editing the document through the right panel |
| `npm run check` green, `check:works` 0 dead (97 controls clicked on 5 screens) | 2026-11-13 23:27 (24 min) |
| Done (committed) | 2026-11-13 23:28 (25 min) |

### Size and reuse

- **Written for this template:** 16 files, 1,038 lines: the app `WordFigmaApp.tsx` (490), the canvas part `Page.tsx` + `page.css` + stories (167), types (80), content JSON (237: the document, comments, menus, options and every word), manifest, registry and index (60).
- **Generated:** `tokens/theme.css` (745, from `npm run tokens`) and `content.schema.json` (589, from `npm run content:schemas`).
- **Reused unchanged:** the Figma template's theme (`tokens/theme.json`, 55 lines, copied), so Figma's look came free; core's EditorLayout, SegmentedControl tool bar with flyouts, MenuButton with submenus, Tabs, TreeView, PropertySection/PropertyRow, Select, NumberField with presets and units, Switch, Persona, TextArea, AvatarGroup, ScrollArea, notify and `useRichText` (G6).
- **Reused by copying the pattern:** the Design tool's editor arrangement (tool bar, main menu, pages and layers, panel head, zoom menu) and its comment threads; the Word replica's rich-text command wiring, find highlighting and page CSS (about 40 lines adapted). For scale: the Word replica's window alone is 2,487 lines (`Window.tsx` 1,202 + `window.css` 1,285); the Design tool's editor files are 729 (`DesignApp.tsx`, `Inspector.tsx`, `Comments.tsx`, `Present.tsx`).
- **Time spent on gates rather than the UI:** about 6 of the 25 minutes: the content-path rule moved twice as flows changed (CP section size), raw markup had to move from the app into the part, toggle reasons (Q160), curly apostrophes, and the agent index.

## Screens

`http://127.0.0.1:8771/site.html#/app/word-figma/{screen}`: `editor` (nothing selected: Page, Document, Export), `text` (a heading selected: Style, Text, Fill, Paragraph), `find`, `comments`, `read`.

## Core gaps

| Gap | What happened | Workaround in the template |
| --- | --- | --- |
| G-WF1 | No context-menu component in core (Figma's right-click menu is a main surface). | Clipboard and undo live in the main menu's Edit submenu. |
| G-WF2 | `useRichText`'s `insert-html` uses the browser's insertHTML, which nests a block (a table, a page break) inside the heading the selection is in. | The part inserts the block after the current block through the DOM; that step isn't in the surface's undo history. Core could offer an `insert-block` command that lands between blocks and stays undoable. |
| G-WF3 | EditorLayout's work area is a flex row whose child shrinks to its content; core `Canvas` fills it itself, but any other canvas child doesn't. | The part's root takes `flex: 1` and holds the ScrollArea. EditorLayout could make its one content child fill. |
| G-WF4 | No colour-swatch menu (Figma's fill row is a swatch plus hex; core's swatch lives inside TextField). | Text colour and Highlight are MenuButtons of named colours. |
| G-WF5 | `useRichText` exposes no paragraph line-height read-back, so the Line height field shows the last value set, not the selection's. | The field keeps its own value. |

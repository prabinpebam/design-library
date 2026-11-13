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
| **Font** (family, size, bold, italic, underline, strikethrough, sub/superscript, case, colour, highlight, clear) | Right panel → **Text** section: family Select, size NumberField with presets, style toggles as an icon SegmentedControl-style row, Case Select, colour as the **Fill** section | Figma's Typography section owns family, weight, size and decoration; a text layer's colour is its Fill. |
| **Paragraph** (alignment, line spacing, bullets, numbering, indent, show marks) | Right panel → **Paragraph** section: alignment SegmentedControl, line height NumberField, list SegmentedControl, indent buttons | Figma's text section has alignment and line height in the same panel; lists and indent are its "list" options. |
| **Styles** (Normal, Title, Heading 1/2, Quote) | Right panel → **Style** Select (Figma's text styles), plus left panel **Assets** tab listing the document's styles | Figma applies a text style from a style picker in the Typography section and lists local styles in Assets. |
| **Insert** (table, page break, date, symbol, line) | Toolbar → **Insert** tool with a flyout (Figma's shape-tool flyout) | Creating things is a tool in Figma's bar; the less common ones share one tool's flyout. |
| **Layout** (margins, orientation, columns, page colour) | Right panel when nothing is selected → **Page** section | Figma shows the page's own properties (background) when nothing is selected; the page is the frame. |
| **References** (table of contents, citations, footnotes) | Left panel **Layers** = the headings (a live outline, a TOC you can click) | The headings already are the document's structure, which is what Layers shows. |
| **Review / comments** | Toolbar → **Comment** tool; the right panel becomes the comment threads (Figma's comment mode) | Figma's comments are a tool and a mode that swaps the properties panel for threads. |
| **View / zoom** (zoom, read mode, ruler, navigation pane) | Zoom menu at the end of the right panel's tab row; left panel open/closed toggle = navigation pane; mode switch in the toolbar = Edit / Read | Figma's zoom is a menu in the panel head; panels toggle; the bar's mode switch is Design / Dev, here Edit / Read. |
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
| Done | pending |

## Core gaps

| Gap | What happened | Workaround in the template |
| --- | --- | --- |
| G-WF1 | No context-menu component in core (Figma's right-click menu is a main surface). | Clipboard and undo live in the main menu's Edit submenu. |

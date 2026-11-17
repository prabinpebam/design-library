# Foundation: architecture, fundamentals and the library app

> **TL;DR:** A framework-agnostic core (DTCG tokens → generated CSS keyed on native elements and `data-*` attributes, pure TypeScript behaviour, JSON view-data schemas, a generated catalogue) with React + TypeScript as the first renderer adapter. The library app is an ordinary consumer that presents the library with its own components, rendering specimens in isolated iframes per context. Everything here is a **working default for review**, not approved design. Execution started on the owner's instruction of 2026-11-06 20:28 +05:30 in **show me the UX sooner** mode.

Owner's words, 2026-11-06 20:28 +05:30: *"Start execution. We want to have a robust foundation. Let's get a solid foundation laid down. I want to review as soon as possible. The goal is to have everything at the fundamental level defined and figure out the structure and UX that we will use to present the framework. Remember, we are going to use a WIP Frontend framework to present the WIP frontend framework. Think critically about the architecture and process we will use for this."*

This page answers four questions for review: **how is it built** (architecture), **how do we work** (process), **what exists at tiers 0 and 1** (tokens and fundamentals), and **how is it presented** (library app structure and page anatomy). Decisions are recorded as O25-O32 in the [brief's working decisions](brief.md#working-decisions); this page argues them.

## Architecture

<ol class="slate-steps">
  <li class="slate-step"><p class="slate-step__title">Tokens (data)</p><p>W3C DTCG 2025.10 JSON: primitives (private), semantic roles, component tokens. One base set plus light, dark and more-contrast contexts.</p></li>
  <li class="slate-step"><p class="slate-step__title">Generated CSS (the shared artifact)</p><p>A build writes CSS custom properties in cascade layers. Component CSS reads only semantic and owned component tokens and targets native elements plus <code>data-dl</code> attributes.</p></li>
  <li class="slate-step"><p class="slate-step__title">Anatomy and behaviour contracts</p><p>Each fundamental declares its DOM anatomy (element, attributes, ARIA) and pure TypeScript behaviour (keyboard models, state). Any renderer must emit that anatomy.</p></li>
  <li class="slate-step"><p class="slate-step__title">Renderer adapters</p><p>React + TypeScript first; light-DOM custom elements second, to prove the core is not React-shaped. Adapters add wiring, never styles.</p></li>
  <li class="slate-step"><p class="slate-step__title">Catalogue and views</p><p>A generator reads source (doc comments, typed props, tokens read, imports, stories) into a versioned <code>catalogue.json</code>. Views are JSON validated against schemas and mapped through a registry.</p></li>
</ol>

### Why the core is CSS + markup contract, not a framework

The owner wants one foundation for many products and agents. The only artifacts every web renderer shares are **HTML and CSS**. So the core's styling contract is CSS that styles a documented markup anatomy, and the framework layer is a thin, replaceable adapter. A brand or context change is a token change; it never touches component code in any adapter.

| Concern | Working default | Alternatives rejected and why |
| --- | --- | --- |
| Styling mechanism | Plain CSS with `@layer` and custom properties, generated from tokens; selectors on native elements and `[data-dl="button"]`-style attributes. | **CSS-in-JS:** runtime cost, ties styles to one framework. **Utility classes (Tailwind-style):** puts styling decisions in views, which breaks "views have no styles" and sealed fundamentals. **CSS Modules:** hashed class names are a build artifact, not a contract another renderer or an agent can target. |
| Contexts | `light-dark()` pairs and `color-scheme` per subtree; `[data-scheme]`, `[data-contrast="more"]` and `[data-motion="reduce"]` attributes plus `prefers-color-scheme` / `prefers-contrast` media; `forced-colors` uses system colours. | **Separate CSS bundle per theme:** cannot mix contexts on one page (the library needs that). **Class toggles in JS per component:** components would branch on theme. |
| Behaviour | Pure TypeScript modules in tier 0 (roving focus, key maps, value clamping, state machines) with no DOM framework import. | **Behaviour inside React hooks only:** the second adapter would re-implement it and drift. **Headless library (Radix/React Aria):** strong, but React-bound and would become the de facto contract; revisit for complex compounds (combobox, date picker) with an adapter-neutral wrapper. |
| First renderer | React + TypeScript. | **Shadow-DOM web components as the core:** cross-root ARIA references (`aria-labelledby` across shadow boundaries) and form association need workarounds; styling through `::part` fights the token contract. **Vue / Svelte / Solid:** viable, but smaller agent training corpus and weaker typed-prop extraction tooling. **No framework:** no typed props for the catalogue and poor views-from-data ergonomics. |
| Second renderer (planned) | Light-DOM custom elements emitting the same anatomy. | It is the cheapest proof that A4 universality is real rather than React-shaped; scheduled after the first fundamentals are approved, not now. |
| Types and catalogue | TypeScript compiler API extracts props, defaults and JSDoc tags (`@tier`, `@a11y`, `@key`, `@whenNot`); a CSS scan lists token reads; stories are typed data. | **Hand-written docs or Storybook argTypes:** a second source that drifts (brief rejects third-party docs chrome). |
| View data | JSON view specs `{ layout, regions }` validated against JSON Schema 2020-12 before render; registry maps `type` to component. | **JSX-only views:** agents must write code to make screens, the opposite of AI-first data contracts. |
| Toolchain | npm workspaces with an **explicit** list, TypeScript, Vite for dev/HMR and builds, Craft's dependency-free `build-tokens.mjs` reused. | **Monorepo tools (Nx/Turborepo) now:** overhead before there are enough packages. **Workspace globs:** would sweep in `agentic-craft`, `agent-orchestration`, `slate`. |

**Critical tension, stated plainly:** keying CSS on attributes makes the *markup* a public contract. That is the price of universality: renaming an attribute is a breaking change for every adapter. Mitigation: the anatomy is declared once per fundamental, generated into the catalogue, and checked against each adapter's rendered output later (a production-ready check, not now).

### Packages and dependency direction

| Path | Holds | May import |
| --- | --- | --- |
| `packages/core/tokens/` | DTCG source JSON (base, light, dark, more-contrast) and resolver. | Nothing. |
| `packages/core/css/` | Generated `tokens.css`; hand-written `base.css` (reset, element defaults) and one CSS file per fundamental. | Tokens only. |
| `packages/core/behaviour/` | Pure TypeScript behaviour modules. | Nothing outside core. |
| `packages/core/react/` | The React adapter: one file per fundamental, sealed (no `className`/`style` props). | Core CSS and behaviour. |
| `packages/core/schemas/` | View-spec and catalogue JSON Schemas. | Nothing. |
| `packages/catalogue/` | Generator: source → versioned `catalogue.json` with digest; fails with path/reason on drift. | Reads core source; core never imports it. |
| `apps/library/` | The library app: frame, pages as view data, specimen host, diagnostic page. | Public core exports and the generated catalogue only. |

The React adapter lives inside `packages/core` for v0 to avoid a package split before the second adapter exists; it moves to `packages/react` when the custom-element adapter arrives (revisit trigger in O27).

### CSS cascade layers

`@layer reset, tokens, base, fundamentals, compounds, layouts, templates, app, addons;` (the `templates` layer holds template-scoped custom parts, Q64; planned with F15.78+). Later layers win, so an add-on can only set its owned tokens on registered surfaces, and the library app layer can position regions but has no reason to restyle a fundamental (a lint rule will forbid `[data-dl]` selectors outside core).

## Process: a WIP framework presenting itself

The library app is built from the library it presents. Both are work in progress, so the risk is that one broken change takes down both the thing under review and the tool used to review it. The process below keeps that blast radius small at every stage.

| Phase | Frame (navigation, pages) | Specimens (what is judged) | Fallback when it breaks |
| --- | --- | --- | --- |
| **α: until the first owner approval** (now) | Runs from the working copy on the dev server. | Same working copy, but each specimen renders in its own iframe document per context from S4. | Zero-dependency `diagnostic.html` (native HTML, no CSS/JS/library) served as a static file and openable from disk; per-slice snapshots restore only the rejected slice. |
| **β: after the first approved frame** | Frozen known-good build (exact approved digest) served by a static server on its own port. | Candidate specimens from the dev server, a different origin, in iframes. | Known-good frame keeps working while candidates fail; diagnostic page still independent. |
| **γ: steady state** | Promoted only by explicit scoped approval; prior build retained for rollback. | Candidate vs approved side by side across the context matrix. | Same, plus the catalogue's structured `path / reason / recovery` errors. |

**Why α is acceptable:** before any approval there is no known-good artifact to protect, so a frozen frame would freeze unapproved design. α's risk (a broken token build blanks the app) is covered by the diagnostic page, fast slices and snapshots. **Why iframes from S4, not later:** the specimen protocol and context isolation are the riskiest part of self-presentation (A15/A16); exercising them on the first real components finds problems while they are cheap.

**Frame context ≠ specimen context.** The frame follows the reader's own appearance; the context toolbar (theme, more contrast, direction) changes only the specimen documents. Mixing the two is the classic way docs make a component look right only inside the docs.

### Slice loop and checks in this mode

<ol class="slate-steps">
  <li class="slate-step"><p class="slate-step__title">Snapshot</p><p>Copy touched files to <code>.design-library/snapshots/&lt;slice&gt;/</code> so a rejection restores only that slice.</p></li>
  <li class="slate-step"><p class="slate-step__title">Build the smallest visible slice</p><p>Target 15-20 active minutes; one question for the owner.</p></li>
  <li class="slate-step"><p class="slate-step__title">Static checks only</p><p>Token build and token checks, <code>tsc --noEmit</code>, Vite build, Craft style/spacing lint where applicable. No product tests on unapproved designs, never the full suite.</p></li>
  <li class="slate-step"><p class="slate-step__title">Open, mark, send three lines</p><p>Refresh the review page, reach the change through normal UI, mark reviewable, send link / inspect / approve-change-reject to the main chat.</p></li>
</ol>

At most two unjudged slices; with two waiting, building stops.

## Tiers: what belongs where

**Owner definitions (2026-11-07 17:38 +05:30, verbatim via main):** *"Colorfiled is not a fundmental component. It's a specian need compound component. You need to understand what each of these categories mean. Fundamnetal components are the building blocks and are universal and will be required. - All types of buttons, which you have not implemented yet from my earlier instruction - Because we are trying to be exhaustive, some potential compound components like btns groups will be put under fundamental as they are so common that they may as well be universal. People can still define their own compound components for btn groups separately in compound components section. --- Compound components are special custom arrangements that may or may not be needed by every app. - Cards, tiles, dialogs, panels, side panel, toolbar, notifications, carousals, gallery etc... --- Layout are a view or a section that is reusable and we can provide some standard but people can create their own. - Article layout - List of articles - List of sponsors - Image gallery with hero image - bento layout - Documnetation layout - E commerce layout - Checkout page - FRE onboarding layout etc...."*

The test for each tier, applied to every component before it is filed:

| Tier | Belongs here when… | Examples | Built from |
| --- | --- | --- | --- |
| **1. Fundamental** | It's a universal building block: almost every app needs it, whatever the product. Includes every kind of button and, because they're that common, button groups (a product can still define its own button-group compound). Also the arrangement primitives that space other things (Stack, Cluster, Grid): every app needs them and they hold no content of their own. | Text, Heading, Link, Icon, Button and all its types, button group, the form controls, Badge, Progress, List, Stack, Cluster, Grid | Tokens only (an arrangement takes any children as slot content) |
| **2. Compound** | It's a particular arrangement of fundamentals for a need some apps have and others don't. Products add their own beside the library's. | Card, tile, dialog, panel, side panel, toolbar, notification, carousel, gallery, navigation, ColourField | Fundamentals and tokens; never another compound (one may be passed in as slot content) |
| **3. Layout** | It's a reusable view or section with named regions. The library offers a standard set; products make their own. | Article, documentation, checkout, onboarding; this app's LibraryLayout and PageLayout; SiteLayout, ChatLayout | Compounds, fundamentals and tokens; never another layout |
| **4. Template** | It's a named collection of layouts for one kind of product, sharing their header, navigation and footer: each layout in it is a full screen. Owner, 2026-11-08 18:29 (DoD Q62): *"Templates are just going to be a collection of layouts. We can introduce the concept of templates."* | Corporate site (home, about, careers, contact), AI chat (chat), and to come: Portfolio, Blog, Conference, Design tool, Project management | Layouts, compounds and content JSON; custom parts only inside its own scope. Since Q64: a folder with a manifest, a content schema, content files and any custom parts, rendered by one renderer; see [Templates, content and customization](#templates-content-and-customization). Each opens as a standalone site at `site.html#/app/{template}/{layout}` |

**Audit against these definitions (packet R, 2026-11-07).** Every built component was checked; three kinds of change followed, the rest stay where they are:

| Component | Was | Now | Why |
| --- | --- | --- | --- |
| **ColourField** | Fundamental | **Compound** | A special need (choosing a theme colour), not universal; it arranges Text, Button and Badge over the native colour input. Source `react/compounds/ColourField.tsx`, CSS `css/compounds/colour-field.css` (`@layer compounds`), story tier `compound`. |
| **Stack, Cluster, Grid** | Layout | **Fundamental** (arrangement) | Not a view or a section: universal spacing primitives every app needs, with no content of their own. Source `react/fundamentals/`, CSS `css/fundamentals/` (`@layer fundamentals`). Compounds may now use them without an upward import. |
| Button, MenuButton, SegmentedControl | Fundamental | Fundamental | Button types: MenuButton is the dropdown button, SegmentedControl the segmented button (to be reconciled in F15.1, no redundant variant). |
| Text, Heading, Link, Icon, Switch, TextField, TextArea, Select, Checkbox, ListItem, Badge, Code, List, Progress | Fundamental | Fundamental | Universal building blocks. |
| Navigation, TitleBar, PageHeader, Section, CodeBlock, DataTable, DescriptionList, IndexList, RowList, StackedBar, Pane, Toolbar | Compound | Compound | Arrangements for a need some apps have. |
| Example, ContextMatrix, TokenSpecimen | Compound | Compound | Arrangements a design library or documentation site needs; kept in core so the library presents itself, marked library-specific here. |
| LibraryLayout, PageLayout | Layout | Layout | Reusable views: the documentation shell and its reading page. |

Imports are unchanged for consumers: everything is still exported from `@design-library/core/react` (and, without the library's stories, from `@design-library/core/components`, which new code imports; 0.4.0-beta.2). The library's navigation groups pages by these three tiers, after Tokens; the generated catalogue reads each tier from the source folder.

**Planned fundamentals (F15.1, not built):** the button types the owner asked for (sizes xs to xxl, icon button, dropdown button, segmented button, in-progress variants) and **ButtonGroup**.

**Layout inventory: proposed, none built until the owner picks.** Shown in the library as [Proposed layouts](http://127.0.0.1:8766/#/proposed-layouts).

| Candidate | Regions (proposed) | Source |
| --- | --- | --- |
| Article | title block, reading column, aside (contents or related) | Owner |
| List of articles | heading, filters, summaries as list or grid, paging | Owner |
| List of sponsors | heading, logo tiles grouped by level | Owner |
| Image gallery with hero image | hero, grid of the rest, viewer | Owner |
| Bento | tiles of different sizes on one grid | Owner |
| Documentation | navigation, reading column, on-this-page aside (LibraryLayout is a first instance) | Owner |
| E-commerce | product list with filters; product page with gallery, details, purchase | Owner |
| Checkout | steps, current step's form, order summary held in view | Owner |
| First-run onboarding | one step at a time, progress, skip and back | Owner |
| Dashboard, Settings, Sign-in, Search results, Error and empty page | as on the library page | Worker proposal for the owner to keep or drop |

## Templates, content and customization

> **TL;DR:** A **template** is a folder with a manifest: its layouts, the regions of each, a versioned JSON Schema for its content, its pictures, and any **custom parts** (fundamentals, compounds, layouts, block types) it needs. **Content is pure JSON**, one file per layout, validated before anything renders. **One renderer** reads a content file, finds its layout in the manifest, places each region's blocks through the block registry, and the components draw them from tokens. Customizing always starts by defining a template; everything custom lives inside it, under its namespace, and never touches the core. Working default for review (F15.77, DoD Q64), not approved.

Owner's words, 2026-11-08 19:52 +05:30 (DoD Q64): *"We want the template to be used in a manner where the content is always strictly maintained as pure json and mapped to the template to render the final UI. We want to support Custom fundamental and compound components, layouts and templates. For customization, you need to first define a template and create everything within the scope of that template. Detail out this architecture to be complete and coherent. Update the implementation to adopt this architecture."*

This architecture is what the replicas are testing. Whether it's enough, and what would make it change, is on [Hardening method](hardening-method.md#the-open-question-does-the-architecture-itself-have-to-change) (DoD Q145). The end-to-end procedure from finding a limitation to shipping a core fix and removing any temporary workaround is on [Template pressure-test loop](pressure-test-loop.md) (DoD Q149).

### Promise, jobs and what a person can do

| # | Promise | What breaks it |
| --- | --- | --- |
| PT1 | A whole product UI comes from **content JSON mapped to a template**: changing what a screen says or shows never means writing code, markup or styles. | A screen whose words live in a component or view; content that needs HTML, a class name, a colour or a function to say what it means. |
| PT2 | **Customizing never forks the core.** Anything the library lacks is added inside one template's scope and works with every theme, context and core update. | A custom part that edits, copies or overrides a core component; one that only looks right in light mode; a core update that breaks a template silently. |
| PT3 | **Wrong content fails before it renders**, naming the file, the place and the fix. | A typo that renders half a page; an unknown block type discovered by a person looking at a blank region. |

Non-goals: a visual page builder (an editor is a later set of views over the same contract), a CMS or database, server rendering, and themes defined per content file.

| # | Job | Promise |
| --- | --- | --- |
| JT1 | When I start a product, I want to pick a template and write its content, so I get real screens without writing UI code. | PT1 |
| JT2 | When the template lacks a part my product needs, I want to add it inside my template, so I get it without forking or waiting for the core. | PT2 |
| JT3 | When an agent writes or edits content for me, I want the mistake caught by a check it can run, so I never see a broken screen. | PT3 |
| JT4 | When a template's content shape changes, I want my content moved to the new shape by a known step, so nothing I wrote is lost. | PT1, PT3 |

| # | A person (or an agent working for them) can… | Job |
| --- | --- | --- |
| UT1 | …render any layout of a template from its content file alone, in the library and as a standalone site. | JT1 |
| UT2 | …read a layout's content JSON beside the screen it renders, and see which region and block each part fills. | JT1, JT3 |
| UT3 | …add a custom fundamental, compound, layout or block type inside a template, registered in its manifest, documented like a core part. | JT2 |
| UT4 | …run one check that validates every manifest and content file and fails with the file, the JSON pointer and the fix. | JT3 |
| UT5 | …migrate a template's content from one content version to the next with one command. | JT4 |
| UT6 | …**not** reach the core from content or a custom part except through public exports, tokens and slots (a check refuses it). | JT2 |

### Tiers, extended to templates and content

| Tier | Holds | Made from | Where it lives | Who adds one |
| --- | --- | --- | --- | --- |
| 0. Tokens | Decisions as data; core semantic roles; a template's own component tokens alias them | Nothing | Core `packages/core/tokens/`; a template's `tokens/` | Core; a template for its own parts only |
| 1. Fundamentals | Universal building blocks | Tokens | Core `react/fundamentals/`; a template's `parts/fundamentals/` | Core; a template (namespaced) |
| 2. Compounds | Arrangements for a need | Fundamentals, tokens | Core `react/compounds/`; a template's `parts/compounds/` | Core; a template (namespaced) |
| 3. Layouts | A screen or section with named regions | Compounds, fundamentals, tokens | Core `react/layouts/`; a template's `parts/layouts/` | Core; a template (namespaced) |
| 4. Templates | A collection of layouts for one kind of product: its manifest, content schema, pictures, registry and custom parts | Layouts, the block registry, its own parts | `packages/templates/{template}/` | Anyone; each template is self-contained |
| Content | What one layout of one template says and shows | Pure JSON, valid against the template's schema | `packages/templates/{template}/content/{section}/{flow}/{layout}.json` | Anyone, by writing data only |

A custom part obeys the same tier rule as a core part (made only from what's below; never a sibling of its own tier), and may use the core's parts plus the parts of **its own** template, never another template's.

### Files

```text
packages/core/render/                 the renderer, registry types and the core block set (standard block types → core components)
packages/core/schemas/
  template.schema.json                what a manifest may say
  content.schema.json                 the envelope every content file shares
  blocks.schema.json                  one $def per core block type
packages/templates/                   workspace @design-library/templates (explicit, no glob)
  index.ts                            the installed templates, in order
  {template}/
    template.json                     the manifest
    content.schema.json               this template's content schema ($id carries its version; $refs core blocks)
    content/shared.json               regions every layout shares (a site's header and footer)
    content/{section}/{flow}/{layout}.json   one content file per layout (and per state), in its flow's folder (Q66)
    assets.json                       pictures and other media by id, with alt text
    registry.tsx                      binds the manifest's layouts and custom block types to components
    parts/fundamentals|compounds|layouts/{Name}.tsx, {name}.css, {Name}.stories.tsx
    tokens/                           DTCG component tokens for its own parts (aliases of semantic roles only)
    migrations/{n}-to-{n+1}.mjs       pure functions that move content up one version
```

### Content is pure JSON

Every content file is data a person or agent can write by hand and a machine can check:

- **Allowed:** strings of plain text, numbers, booleans, values from an enum, arrays and objects with known keys, and **references by id**: an asset (`"picture": "harbour"`), an icon name (`"mark": "organisation"`), a layout of the same template (`"href": "/about"`, made into the right address by the renderer), or an outside address (`https://…`). Inline code between backticks is the only mark inside text.
- **Never:** HTML or Markdown markup, CSS, class names, colours, sizes, pixel values, functions, expressions, component names, or `style`-like keys. Look and arrangement belong to the template's layouts and the tokens; words and facts belong to content.
- **Shape:** one envelope for every file, then either **regions of blocks** (documents: sites, articles) or **one record** (applications: a chat's threads, a board's issues), as the layout declares.

```json
{
  "$schema": "../content.schema.json",
  "template": "conference",
  "layout": "home",
  "contentVersion": 1,
  "regions": {
    "main": [
      { "type": "hero", "eyebrow": "12–13 March 2027 · Lisbon", "title": "Kitewing Conf", "picture": "dusk",
        "actions": [{ "label": "Get tickets", "href": "/tickets", "primary": true }] },
      { "type": "conference.countdown", "label": "Doors open in", "until": "2027-03-12T09:00:00+00:00" },
      { "type": "people", "heading": "Speakers", "items": [{ "name": "Ama Mensah", "role": "Design lead, Kitewing", "href": "/speaker" }] }
    ]
  }
}
```

An application layout's file has `"record": { … }` in place of `"regions"`: the layout's schema defines the record (threads and turns, issues and statuses), and the template's registry binds its fields to the layout's regions. Behaviour (sending a message, moving a card) is code in the registry; every word and fact it shows still comes from the record.

### The manifest

```json
{
  "$schema": "../../core/schemas/template.schema.json",
  "id": "conference",
  "version": "1.1.0",
  "title": "Conference",
  "summary": "An event's site: programme, speakers, tickets and sponsors.",
  "contentSchema": "content.schema.json",
  "contentVersion": 1,
  "shared": "content/shared.json",
  "assets": "assets.json",
  "theme": { "space": "normal", "shape": "rounded" },
  "layouts": [
    { "id": "home", "title": "Home", "component": "SiteLayout", "content": "content/home.json",
      "regions": [
        { "id": "header", "shared": true, "accepts": ["site-header"] },
        { "id": "main", "accepts": ["hero", "people", "cards", "cta", "conference.countdown"] },
        { "id": "footer", "shared": true, "accepts": ["site-footer"] }
      ] },
    { "id": "sponsors", "title": "Sponsors", "component": "conference.SponsorsLayout", "content": "content/sponsors.json",
      "regions": [{ "id": "header", "shared": true }, { "id": "intro" }, { "id": "levels", "accepts": ["conference.sponsor-wall"] }, { "id": "footer", "shared": true }] }
  ],
  "parts": {
    "fundamentals": [{ "name": "conference.Countdown", "source": "parts/fundamentals/Countdown.tsx" }],
    "compounds": [{ "name": "conference.SponsorWall", "source": "parts/compounds/SponsorWall.tsx" }],
    "layouts": [{ "name": "conference.SponsorsLayout", "source": "parts/layouts/SponsorsLayout.tsx" }],
    "blocks": [
      { "type": "conference.countdown", "schema": "#/$defs/countdown", "renders": "conference.Countdown" },
      { "type": "conference.sponsor-wall", "schema": "#/$defs/sponsorWall", "renders": "conference.SponsorWall" }
    ]
  },
  "docs": { "regions": "…", "narrow": "…", "try": ["…"], "notBuilt": ["…"] }
}
```

| Key | Says | Rule |
| --- | --- | --- |
| `id` | The template's namespace | Lowercase, unique; every custom name starts with it |
| `version` | The template's version (semver) | Major for a removed layout, region or block type, or a content version step; minor for additions |
| `contentSchema`, `contentVersion` | The schema every content file is checked against, and the version it expects | A content file at an older version is refused until migrated |
| `layouts[]` | Each screen: its id, title, layout component (core name, or the template's namespaced one), content file and regions | Regions say which block types they accept (`*` for any registered); `shared` regions come from `content/shared.json` |
| `parts` | Every custom fundamental, compound, layout and block type, with its source | A part not listed here doesn't exist to the renderer, the library or the checks |
| `theme` | The theme options the template asks for (space, shape, fonts, brand colours by name) | Theme seams only; never a raw value |
| `docs` | What the library shows about each layout (regions explained, narrow windows, Try, Not built) | Words only |

### Hierarchy: sections, flows, screens and states (Q66)

Owner, 2026-11-08 20:43 (DoD Q66): *"Structure the content of the template in proper grouping and hierarchy and not a flat list."* Working default (F15.T1), not approved.

| Level | What it is | Where it's declared | Example (Corporate site) |
| --- | --- | --- | --- |
| Template | One kind of product | The folder and its `template.json` | Corporate site |
| Section | Flows that belong together | `sections[]` | Client account |
| Flow | What a person gets done, start to finish | `sections[].flows[]`, with a one-sentence `summary` | Sign in |
| Screen | One layout, in the order the person meets it | `flows[].screens[]` (layout ids) | Sign in → Forgot password → Reset link sent |
| State | The same screen in another state, from its own content file | A layout with `stateOf` (its title names the state) | Wrong password |

- **Home at the top, 3–5 items in every group** (owner, 2026-11-08 21:55, DoD Q67; F15.T5, working default): each template's `home` screen is listed first at its top level, beside its sections (one click on the template shows it), and is stored at `content/{home}.json`; it keeps its place in its flow's steps. Every group holds 3–5 items: the top level (Home, the sections, Own parts), each section, and each flow that is a group. A flow of three or more screens is a group of its own (folder `content/{section}/{flow}/`); a shorter flow's screens are items of its section (folder `content/{section}/`), so no group of one or two exists. `check:content` fails on a group outside 3–5. Exception: a screen's states sit beside it (in its folder and on its page), not as items. The regrouping merged five short flows into three (Conference "Plan the visit" and "Speakers and talks", Design "Design in the editor"): 91 → 87 planned flows, a trade of Q66.1's flow count for Q67's grouping. Counts before and after are on [All templates](http://127.0.0.1:8766/#/templates), "Grouping".

- **One home per screen:** every layout that isn't a state sits in exactly one flow; other flows link to it. A state hangs off its screen and shares its folder.
- **Folders follow the hierarchy:** `content/{home}.json`, `content/{section}/` and `content/{section}/{flow}/` for a flow that is a group (Q67); `content/shared.json` stays at the top.
- **The plan lives in the manifest:** screens and states not built yet are layouts with `planned: true`, so the hierarchy is the plan and the library counts built against planned.
- **The library's navigation is the hierarchy:** Templates → template → Home and the sections → screens, with a flow of three or more screens as a group inside its section (Q67), showing only what's built (Navigation's families nest up to three levels). Each screen's page says where it sits (section, flow, step n of m, built or to come) and shows its states below the screen.
- **Checked:** `npm run check:content` fails when a screen is in no flow or two, a flow names an unknown layout or a state, a state's `stateOf` isn't a screen, or a content file isn't in its flow's folder.
- **Error and status screens** use the core `status` block (eyebrow, title, why, the ways on); messages inside a screen use `alert`; a list or place with nothing in it uses `empty`; search results use `search` (a working field that narrows its results, with its own no-results state); forms take `password` and `search` fields, an `error` shown after a failed attempt, and `links` to the other ways through the flow.
- **Outcomes and empty lists are states of one screen** (Q65 TP2–TP3, F15.T4; working default, not approved): a form's refused send and its outcome, and a list's empty state, are not separate screens but states of the screen that holds the form or list, drawn in the same box through `Morph` so nothing blinks out and back (motion M2, C1, C12). A form block carries its `error` (revealed above the fields, values kept) and its `outcome` (eyebrow, title, why, the ways on: what the form becomes when it's sent, with focus moved to it); a `posts`, `cards` or `agenda` block carries its `empty`. A state layout's file holds only settings with `state` (`failed`, `done` or `empty`) and inherits its screen's regions, so the screen and its state render the same tree: the deep link stays (`#/app/blog/subscribe-confirm`), and changing between them morphs in place. The standalone site gives each screen with states a "Screen state" switch beside Light and Dark. `check:content` fails when a state file names a state its screen has no block to draw. Search's no-results state morphs in its own box when the words change.

### The renderer

<ol class="slate-steps">
  <li class="slate-step"><p class="slate-step__title">1. Validate</p><p>The manifest against <code>template.schema.json</code>; the content file against the template's <code>content.schema.json</code> at its <code>contentVersion</code>, by <code>npm run check:content</code> before anything ships. Invalid content fails there with the file, the JSON pointer and the fix; in the page, an unknown block type or layout shows what's wrong in its place, never half a part.</p></li>
  <li class="slate-step"><p class="slate-step__title">2. Resolve</p><p>Shared regions merged in; asset ids become pictures with their alt text; <code>/layout</code> links become the host's addresses (the library or the standalone site); icon names checked against the icon set.</p></li>
  <li class="slate-step"><p class="slate-step__title">3. Pick the layout</p><p>The manifest's layout component for this content (core <code>SiteLayout</code>, or the template's <code>conference.SponsorsLayout</code>), with its named regions.</p></li>
  <li class="slate-step"><p class="slate-step__title">4. Map each block</p><p>For each region, each block's <code>type</code> goes through the registry (core block set, then the template's own) to a component and a pure function from data to props. A record goes to the template's binding instead.</p></li>
  <li class="slate-step"><p class="slate-step__title">5. Draw</p><p>Compounds arrange fundamentals; fundamentals read tokens; the theme and the person's light, dark and contrast choice decide every value. The renderer adds no styles.</p></li>
</ol>

The registry is one map per scope: the **core block set** (standard types such as `hero`, `cards`, `stats`, `quote`, `form`, `prose`, `posts`, `people`, `schedule`, `tickets`, `questions`, each mapped to core components), then the **template's registry** (its namespaced types). A type in both is impossible: template types carry the namespace. Unknown types fail validation, never rendering. A check holds the registry equal to the schemas: every type in a schema has an entry, and every entry a schema.

### Customization: always inside a template

To customize, first define a template (or take an existing one as yours), then create everything inside its folder:

| A custom part may | A custom part may not |
| --- | --- |
| Import core public exports (`@design-library/core/components`, `/render`) and its own template's parts below its tier | Import core internals, another template's parts, or a part of its own tier (compounds never import compounds) |
| Read core semantic tokens and its own `t.{template}.{part}.*` tokens, which alias semantic roles | Read primitives, another component's tokens, or a raw value (colour, size, duration) |
| Style only its own markup, in `@layer templates`, under `[data-dl="{template}-{part}"]` | Select or restyle a core component's `data-dl` markup, use `!important`, or set global styles |
| Take content through typed props and core parts through slots | Hard-code words a person reads (they come from content or props) |
| Be passed to core layouts and compounds as slot content | Patch, wrap-and-replace or copy a core component to change its look (ask the core for a variant instead) |

**Naming:** the manifest's `id` is the namespace: components `conference.SponsorWall`, block types `conference.sponsor-wall`, markup `data-dl="conference-sponsor-wall"`, tokens `t.conference.sponsor-wall.*`, stories titled under the template. **Every custom part is documented like a core part:** a doc comment (what it's for, when not to use it, `@tier`, `@a11y`, `@key` lines), every prop typed and commented, a stories file with one story per variant and state in real copy, WCAG 2.2 AA in light, dark and more contrast, 44 px targets, a visible focus ring, the keyboard pattern it follows, reduced motion honoured. The library lists a template's parts on its pages with their props and stories. **Core fixes and promotion ([Template pressure-test loop](pressure-test-loop.md#2-one-ruling-who-changes-core-and-when)):** a generic gap in mechanics, pattern, slots or tokens found while building the library's own templates is fixed generically in core right away (defaults unchanged, regression sweep clean); an outside consumer uses a small, scoped, commented temporary override plus a Library request until core ships; and promoting a template's custom part (`parts/`) into core requires two or more unrelated products, after which both templates delete their custom copies.

### Versions and migration

Content carries `contentVersion` (an integer); the schema's `$id` ends with that version; the manifest names the version it expects. A change that would make old content invalid (a renamed key, a split block) raises the content version, adds `migrations/{n}-to-{n+1}.mjs` (a pure function from old JSON to new, no I/O), and is a major template version. Additions that old content still satisfies (a new optional key, a new block type) keep the version. The check refuses content older than the manifest's version and names the migration command, `npm run content:migrate -- --template {template}`, which moves every content file of that template up one version at a time and rewrites them only when all of them pass the new schema (one file, several or all: always the whole template, so its files never disagree). Planned with the first content version step; none exists yet.

### Validation

`npm run check:content` (static; Q64): every manifest valid against `template.schema.json`; every content file valid against its template's schema at its version; layout ids unique and each content file's `layout` in its manifest; each block allowed in its region; every block type registered and every registered type in a schema; every asset, icon and `/layout` link resolves; no string that looks like markup, CSS or code. It exits non-zero with `file · /json/pointer · what's wrong · how to fix`, so an agent can act on it unaided.

### Adding a template, step by step (for an agent)

1. **Ground it:** the product's promise and the layouts a person needs (one per screen); check the existing templates and layout components first.
2. **Create the folder** `packages/templates/{template}/` with `template.json`: id, version `0.1.0`, title, summary, `contentVersion: 1`, and one entry per layout naming a **core** layout component and its regions.
3. **Write `content.schema.json`:** `$ref` the core block types it uses; define a record schema for any application layout.
4. **Write the content:** `content/shared.json` and one `content/{section}/{flow}/{layout}.json` per layout, after placing it in a flow of `sections`; pictures in `assets.json` with alt text.
5. **Register** the template in `packages/templates/index.ts`; run `npm run check:content` and fix what it names; open `site.html#/app/{template}/{layout}`.
6. **Only if no core part fits:** add the smallest custom part in the lowest tier that can hold it under `parts/`, with its tokens, doc comment, props and stories; list it in the manifest's `parts`; add its block type to the schema and the registry; check again.
7. **Change content, not code,** for every later change of words or facts; raise `contentVersion` with a migration when the shape changes.

### Worked example: Conference's sponsors

The conference organiser needs to thank sponsors by level and show the time until doors open; neither exists in the core. Inside `packages/templates/conference/`: a custom fundamental **`conference.Countdown`** (days and hours to a moment, as text with a live update that announces nothing), a custom compound **`conference.SponsorWall`** (sponsors grouped by level as tiles, built from core Heading, Grid and Image), and a custom layout **`conference.SponsorsLayout`** (header, intro, levels, footer, built on core Section and the site's shared header and footer). Their content is `content/sponsors.json`, blocks `conference.sponsor-wall` and `conference.countdown` defined in the template's schema; tokens under `t.conference.*`; each with stories. The core is unchanged.

### Open decisions and assumptions (grounding check)

**As built (F15.78, 2026-11-08):** `packages/core/schemas/` (content envelope, manifest, assets, the core block set with 21 types and `settings.SiteLayout`); `packages/core/render/` (`TemplateView`, `BLOCKS`, `LAYOUTS`, types; exported as `@design-library/core/render`); the workspace `packages/templates` with **Corporate site, Portfolio, Blog and Conference** as JSON (18 content files, pictures as SVG files in each template's `assets/`); `npm run check:content` (ajv, JSON Schema 2020-12) including registry/schema parity, references, the markup lint and the stories rule for custom parts. The library's layout pages show the content file beside the phone-sized screen. DT1 and DT2 taken as their working defaults.

**As built (F15.79, 2026-11-08):** **AI chat, Design tool and Project management** are JSON too: application layouts with a `record` (chat: `content/chat.json`; design tool: `content/editor.json`; project management: the project in `content/shared.json`, read by all three layouts, and the issue in `content/issue.json`). Each template's `types.ts` holds its record types, and `npm run content:schemas` (`tools/content-schemas.mjs`, ts-json-schema-generator through npx) writes its `content.schema.json` from them as `$defs/record.{layout}`, so the schema and the types can't drift. The behaviour moved with them as template-scoped bindings (`ChatApp.tsx`, `DesignApp.tsx`, `ProjectsApp.tsx`) registered in each `registry.tsx` against a core layout name; a binding gets its content, the shared file, other layouts' content of the same template (`contentOf`), and `ctx.href` and `ctx.picture`. All seven templates (24 content files) render through `TemplateView`; the library reads every template from its manifest; each layout page shows its content file and the shared file beside the screen. `check:views` now also covers `packages/core/render` and every template outside `parts/`. **F15.80 worked custom template (2026-11-08):** Conference 1.1.0 carries the worked example: `parts/fundamentals/Countdown.tsx`, `parts/compounds/SponsorWall.tsx`, `parts/layouts/SponsorsLayout.tsx`, each with its CSS in `@layer templates` (added to core's layer order), a doc comment, typed props and a `.stories.tsx`; tokens `t.conference.*` in `tokens/tokens.json`, built by `tools/template-tokens.mjs` (aliases of core semantic roles only; raw values, primitives and core component tokens fail); block types `conference.countdown` and `conference.sponsor-wall` in its schema and registry; the new layout **Sponsors** (`content/sponsors.json`) bound in `registry.tsx` as SiteLayout around `conference.SponsorsLayout` (a section layout: a layout never wraps another, so the binding, a view, composes them). The library reads template parts into its catalogue and shows them on [Conference: Own parts](http://127.0.0.1:8766/#/conference-parts) with stories, props and accessibility. The core is unchanged except the layer name. Decided while building: the intro column isn't held in view (it's often taller than the window and would hide its own action).

**F15.81 interface words as content (2026-11-08):** the gap F15.79 named is closed. Every word the templates show is in their JSON: the application records carry a `strings` object (chat: 39 words in `chat.json`; design tool: 24 in `editor.json`; project management: 36 in `shared.json`), typed in each `types.ts` and so checked by the generated schemas; phrases that hold a value use `{name}` places filled by `fill()` from `@design-library/core/render` ("Thought for {seconds} seconds", "{count} points"), so each keeps its own word order. The core block set's own words moved into its blocks too: every action has `says` (what the page says when it's pressed in an example), forms `choose`, `enter` and `pick`, tickets `labels`, posts `pagingLabel` with more than one page, schedules `daysLabel`; the core block schema requires them. **The boundary, stated:** core components keep their own built-in accessible defaults (for example SiteHeader's Menu, a skip link, ConversationList's "More for …"), which a component prop can override; those are the design system's words, not a template's content. The renderer's diagnostics for a broken template (an unknown block or layout) are for whoever builds it and stay in code.

| # | Question | Options | Working default |
| --- | --- | --- | --- |
| DT1 | Where templates live | In the library app; **a workspace `packages/templates`**; one package per template | A workspace: templates are products of the system, not the library's views, and keep the library an ordinary consumer. One package per template when one is published on its own |
| DT2 | How schemas are checked | **A standard JSON Schema 2020-12 validator** as a dev dependency through the approved proxy; a hand-written subset | The standard validator; a hand-written one would drift from the standard |
| DT3 | Shapes of content | Blocks only; **regions of blocks for documents, one record for applications** | Both, declared per layout: an application's threads or issues aren't a list of blocks |
| DT4 | Rich text | Markdown strings; **structured items (`prose`) with backtick code only** | Structured items: no markup to sanitise, and every mark is a known type |

| # | Assumption | Kind | Impact if wrong | Evidence today | Criterion | Cheapest check |
| --- | --- | --- | --- | --- | --- | --- |
| AT1 | Every built template screen can be expressed as pure JSON with no loss | Feasibility | High (PT1) | Data is already typed; pictures are drawn by code | All seven templates render from JSON with the screens unchanged | Move them (F15.78+) and compare |
| AT2 | Schemas and the TypeScript types the renderer uses won't drift | Feasibility | Medium (PT3) | None | The parity check finds every type in both | The check in `check:content` |
| AT3 | An agent can add a template from the steps above unaided | Usability | High (PT1, PT2) | None | A new template layout passes `check:content` on the first or second run | A worker follows the steps for the worked example |

## Tier 0: token categories

Every value is a token; `rem` for sizes so text-size settings scale everything, `px` only for hairlines, outlines and blurs. Primitives (`p.*`) are private: components read semantic roles or their own `c.<component>.*` group.

| Category | Semantic roles (v0) | Contexts and rules |
| --- | --- | --- |
| **Colour: text** | `color.text`, `text-muted`, `text-on-accent`, `text-disabled`, `text-link` | 4.5:1 on every surface in every context; more-contrast raises `text-muted`. Disabled text is a colour, not opacity, so contrast stays computable. |
| **Colour: surfaces** | `color.bg` (canvas), `bg-raised`, `bg-sunken`, `bg-overlay` (scrim) | `light-dark()` pairs. Surfaces separate by tone before border or shadow (visual-noise cue order). |
| **Colour: lines** | `color.border` (only where an enclosure earns it), `border-strong` (inputs: 3:1 non-text), `focus` | Focus 3:1 against adjacent colours in all contexts. |
| **Colour: accent and state** | `accent`, `accent-hover`, `accent-pressed`, `accent-subtle`; status `color.status.{info,success,warning,danger,neutral}.{fg,bg,border,fill,on-fill}` ([Colour model](#colour-model)) | State is never colour alone: pair with icon or text. Hover rules only inside `@media (hover: hover)`. |
| **Colour: interaction layers** | `state.hover`, `state.pressed`, `state.selected` (tints over any surface) | One mechanism for hover/pressed on all surfaces instead of per-component shades. |
| **Colour: spectrum, brand and sets** | `spectrum.<hue>.<step>` (12 hues × 100-900), `color.brand.<role>`, `set.<name>.<member>` ([Colour model](#colour-model)) | Non-functional: data visualisation, identity and declared purposes only; lint keeps them out of components and status roles. |
| **Typography** | `font.sans`, `font.mono`; sizes `text.sm/md/lg/xl/2xl/3xl`; weights `regular/medium/semibold/bold`; leading `tight/normal/relaxed`; tracking; composite styles `body`, `body-sm`, `label`, `caption`, `code`, `heading-1`…`heading-4` | One provider loader (O11/O12); system stack until a font is approved. Components read composite styles, not raw sizes. |
| **Space** | Base unit 0.25 rem; scale `space.1/2/3/4/6/8/12/16`; roles `stack-pair/item/group/section`, `inline-pair/item/group`, `inset-sm/md/lg`, `gutter`, `margin-page` | Space inside a group never exceeds space around it; layouts own `gap`/padding, components never set outer margins. |
| **Size** | `size.target` (2.75 rem = 44 px), `size.control-sm/md`, `size.icon-sm/md/lg`, `size.measure` (readable line length), `size.focus-width`, `size.focus-offset` | 44 px hit targets even when the visible control is smaller. |
| **Radius** | `radius.none/sm/md/lg/full` | Stacked-bar inner segments are always `none`; rounding only on the outer ends of the whole bar. |
| **Border width** | `border.hairline` (1 px), `border.thick` (2 px) | Full outlines only; **no one-sided accent borders** anywhere. |
| **Elevation** | `shadow.raised`, `shadow.overlay` (two levels, by meaning) | Only floating layers get shadows; none in more-contrast/forced colours (outline instead). |
| **Opacity** | None in v0: scrims are alpha colours (`color.bg-overlay`), so contrast stays computable. | Never used for disabled text. |
| **Motion** | `duration.instant/fast/medium/slow`; `easing.standard/enter/exit`; `motion.press-scale` | `prefers-reduced-motion` (or `[data-motion="reduce"]`) collapses these to zero; state feedback stays. |
| **State timing** | `duration.confirm-min` 200 ms, `confirm-read` 1.5 s, `indicator-delay` 300 ms, `indicator-min` 500 ms, `commit-pause` 500 ms, `notice` 6 s, `notice-long` 8 s, `shimmer` 1.5 s × `count.shimmer-passes` 3 | ui-states and perceived-performance timings. Reduced motion changes motion, never these. |
| **Layer** | `layer.base/sticky/popover/overlay/dialog/toast/tooltip` | The layout places page-wide hosts; components only mark elements. |
| **Breakpoints** | `breakpoint.sm/md/lg` (40/64/80 rem) | Generated into CSS and a typed helper for `matchMedia`; no ad hoc widths. No sideways scroll at 320 px. |
| **Icons (data)** | Semantic names (`close`, `check`, `chevron-start`, …) → SVG path data per provider set | One Icon fundamental; directional icons flip in RTL by metadata (O13). |

**Contexts in v0:** light, dark, more contrast (modifier), forced colours (system colours, verified by emulation later), reduced motion, LTR/RTL via logical properties. **Deferred with a reason:** density (one density until a data-dense family needs another), brands (a second brand arrives with the cross-family check A4).

### Controls are told apart by fill, not outline (Q71)

Owner Q71 (2026-11-08 23:18): in normal contrast the borders were too prominent; distinction should come mainly from a subtle fill difference. Two semantic roles carry it, set in `tokens.light.json` and `tokens.dark.json` through private `p.standard.*` steps and switched by the contrast contexts, so no component holds a colour of its own:

| Role | Standard contrast (light / dark) | More contrast | Read by |
| --- | --- | --- | --- |
| `color.bg-control` | base 100 / base 800: a step from page, raised and sunken surfaces | `color.bg-raised` | text and number fields, text areas, select triggers, date and time fields, tag input, code cells, default buttons, MenuButton, chips, tile radios |
| `color.border-control` | base 200 / base 700 | `color.text` | the same controls' outlines |
| `color.border` | base 100 / base 800 (was 200 / 700) | the standard `border-strong` (3:1) | cards, dividers, tables, popups |
| `color.border-strong` | unchanged, 3:1 | text strength | marks whose outline is the control: checkbox and radio boxes, switch tracks, swatch edges, card hover |

Hover and press on a filled control lay `state.hover` and `state.pressed` over the fill instead of replacing it. **WCAG 1.4.11 trade-off (non-text contrast, 3:1):** in standard contrast, field and button boundaries measure about 1.4:1 (outline) and 1.2:1 (fill) in light, 1.7:1 and 1.2:1 in dark, below 3:1. This leans on WCAG's allowance that a control identified by its label, text or position needs no high-contrast boundary; it is a judgement, not a pass. Anything whose outline is the only cue (checkboxes, radios, switches) keeps 3:1, focus keeps the Q55 ring, text on the fill keeps 4.5:1 (checked: `text`, `text-muted`, `focus` on `bg-control` in all four contexts), and **More contrast** restores text-strength outlines on the raised surface.

## Colour model

**Owner direction F7 (2026-11-07 12:12, verbatim in the [ledger](work-plan.md#approval-ledger)):** a theme chooses one to four brand colours (F7d, 13:41: numbered 1-4, not ranked; one of them marked as the accent, 1 by default); base colours (neutral by default; warm, cool, or tinted by hand or from a brand colour; F7c renamed "neutral base" to "base colours", 13:12); the full hue spectrum always present but never used for function; a separate functional (status) set; and optional named custom sets. Direction, not approval; decisions [O43-O48](brief.md#working-decisions).

### Why the colour model is shaped this way

The owner's rationale (F7c, 2026-11-07 13:12): **least effort to define, robust and scalable when a product needs more.**

| Kind of colour | Why it is there | What the person does |
| --- | --- | --- |
| **Brand colours** | Minimal effort: a person defines a brand colour and is done; everything else is already defined around it. | Pick one seed (or a preset); optionally up to three more, numbered 1-4, and mark which one is the accent. |
| **Functional colours** | Every product needs status colours for sure (info, success, warning, danger), so they are already defined and contrast-checked. | Nothing, or adjust them as a palette: a seed and optional pinned steps per status. |
| **Spectrum** | Robustness: products need more colours, from the whole hue range (charts, distinctions). A colour is already defined for every perceptible hue, ready when needed, never functional. | Nothing; use it for charts, categories and decoration. |
| **Base colours** | The non-colours: black, white and the greys between are always needed, so they are defined. Creative freedom to match the brand and mood. | Nothing (neutral by default), or choose warm, cool or a tint (a colour, or a brand colour) at a capped strength. |
| **Custom sets** | Scalability: people will want their own sets (pastel, earthy). The one challenge: each set must **declare its purpose**, so AI agents use its colours correctly and the colour system doesn't break when tokens are updated. | Add a named set with a required purpose; the purpose is written into every token's `$description` and `$extensions`. |

**The flow:** `colour.config.json` (versioned theme contract) → `tools/colour.mjs` (dependency-free generator, OKLCH) → generated primitive ramps `p.*` and public spectrum/set tokens → semantic roles (`color.*`, `state.*`) aliasing those primitives per context → component tokens `c.<name>.*` aliasing roles → generated CSS. A theme change is a config change: no role, component or view is edited.

| Layer | What the theme declares (contract `colour-config/2`) | Generated | Tier, and who may read it |
| --- | --- | --- | --- |
| **1. Brand colours** | `brand.colours`: numbered slots `"1"`-`"4"`, each `{ seed, name?, pins? }`; at least one is defined, any other may be left undefined. Numbered, not ranked (owner F7d: "we won't refer to them as Primary, secondary and tertiary"). | A ramp per defined slot, `p.brand-<n>.*` (steps 50-950); `color.brand.<n>` and `color.brand.on-<n>` (text on it, 4.5:1) per slot. | Ramps: private. `color.brand.*`: tier 0, identity marks only (logos, illustration, a brand band); never state, never actions. |
| **2. Accent** | `brand.accent`: the slot number the accent reuses, `1` by default; it must name a defined slot. | `p.accent.*`, an alias ramp of that slot; roles `color.accent`, `-hover`, `-pressed`, `-subtle`, `color.focus`, `color.text-link`, `color.text-on-accent`, `state.selected`. | Ramp private; roles read by components for actions, selection, focus and links. |
| **3. Base colours** | `base: { temperature: "neutral" \| "warm" \| "cool", tint?: { colour \| from, strength } }`; temperature defaults to `neutral`; a tint takes a hand-set `colour` or `from: "<brand role>"`, its `strength` (OKLCH chroma) capped at 0.04 (default 0.02) so the base stays greys. This library's own theme is `cool` because v0's greys measure cool (hue 286, chroma up to 0.019), pinned so nothing restyled. | `p.base.*` (0-950, 14 steps) and the alpha layers `p.alpha.*` (hover, pressed, scrim, shadow, selected tint). | Private. Read through text, surface, line and interaction roles. |
| **4. Functional (status)** | Already defined; adjustable as a palette: `functional.<status>: { seed, pins? }` for `info`, `success`, `warning`, `danger`; the `neutral` status (no judgement) reuses the base colours. | `p.info.*` … ramps; per status five roles: `color.status.<s>.fg` (text and icons on any surface, 4.5:1), `.bg` (tint behind a message), `.border` (3:1 on the canvas), `.fill` (solid emphasis) and `.on-fill` (text on the fill, 4.5:1). | Ramps private. Roles: any component that shows a status, and only for that meaning. |
| **5. Spectrum** | `spectrum: { hues, start, chroma, steps }`; the default theme has 12 hues 30° apart in OKLCH × steps 100-900. | Public `spectrum.<hue>.<step>`, the same in every context. | Tier 0, **non-functional**: data visualisation (series, categories), decoration, illustration. Never read by a fundamental, a compound's chrome or a status role (lint). |
| **6. Custom sets** | `sets: [{ name, purpose, demo?, colours \| generate }]`: a named palette, hand-set colours or generated at one lightness and chroma across hues. **`purpose` is required** (what it's for and what it must never be used for; the check fails without it). | Public `set.<name>.<member>`, the same in every context; the purpose in each token's `$description` and in `$extensions["org.design-library"] = { purpose, functional: false }` (the spectrum carries the same). | Tier 0, non-functional, only for the purpose it declares. Optional: the core works with none. |

**Category colours: the one purpose-scoped exception (Q44, 2026-11-08).** Category badges, AllocationSlider and future charts need colours that tell categories apart, and a component may never read a set. So a set may declare `"roles": "category"` (at most one set): the generator then emits public roles `color.category.1`–`8` (aliases of its members, in order, the same in every context) and `color.category.on-1`–`8` (black or white ink, whichever is stronger), and the check holds each member at 3:1 on `color.bg`, `-raised` and `-sunken` and each ink at 4.5:1, in light and dark at standard and more contrast. Components read only `color.category.*`; `tools/colour.mjs --check` lets that path through and nothing else (a status role reading it still fails). The default theme's set `category` is eight hand-tuned colours at OKLCH lightness 0.58-0.64 (blue, orange, teal, magenta, green, violet, olive, red), chosen because that narrow band is the only one that holds 3:1 on both the lightest and darkest surfaces; its purpose: category identity in data and labels, never status, never an action, focus or selection colour, never the only cue. Forced colours draw categories as alternating Highlight and CanvasText; words or a legend always name them. Readers: Badge `category` (subtle: neutral fill + coloured dot; strong: the colour as fill), AllocationSlider segments and legend swatches (`category` per part, else position).

**AI processing colours: the second purpose-scoped role set (Q56, 2026-11-08).** A set may declare `"roles": "ai"` (at most one): the generator emits `color.ai.1`–`n` (gradient stops, aliases of its members in order, the same in every context) and holds each at 3:1 on `color.bg`, `-raised` and `-sunken`; `tools/colour.mjs --check` lets only that path through (a status role reading it fails). The default set `ai` is blue, violet, magenta and orange in the same 0.58-0.64 lightness band; its purpose: the AI processing state only (a prompt box's ring while a model works), never status, focus, selection or an action colour, never the only cue. Reader: the Field ring layer's `data-ring="ai"` state (a conic gradient turning once per `duration.ai-turn`, still under reduced motion, Highlight in forced colours).

**The accent is one of the brand colours, colour 1 unless marked otherwise.** With one brand colour there is nothing else to act with, and acting in the brand's colour is what most brands want. Mark another colour as the accent when colour 1 can't carry an action (a yellow or lime too light for 3:1 at its seed) or is reserved for identity; the accent roles read tone-mapped steps of its ramp (500 in light, 400 in dark), not the seed, so even a light seed yields readable accent roles. Accent is the one brand colour components read: it has its own contrast pairs, while the other brand colours only promise their on-colour. How every brand colour could reach component parts is a documented proposal in [Brand colour](brand-colour.md) (Q131, Q132, not implemented). It is a **brand map**: each colour is a column, plus Neutral; 23 coloured parts in seven preset groups are placed in columns by presets or by dragging in the library; parts that fail contrast in a context fall back to their plain look; area budgets apply per surface. Under that proposal the accent becomes the colour holding the Action fill part, and `brand.accent` migrates to a map with every group in that colour.

**One token per meaning, no synonyms.** Success is also good, positive, done; danger is also bad, negative, error, destructive; warning is also alert, caution; info is also note, tip. The token descriptions and the Colour page name these synonyms (a copy glossary takes them over when it lands); the tokens use only `info`, `success`, `warning`, `danger`, `neutral`, and the Text `tone` prop only `info`, `success`, `warning`, `danger` (its `muted` tone is the neutral status's text, which aliases `color.text-muted`). A status hue may equal a spectrum hue in value, but they're separate tokens, so a chart's red never becomes an error and an error colour change never repaints a chart.

**Tone mapping and contexts.** Each ramp step has a target OKLCH lightness (base 0 = 1.00 down to 950 ≈ 0.18), so the same step is about as light in every hue and the contrast of a role is close to hue-independent. Functional ramps use their own curve with lighter middle steps (400 ≈ 0.78), because dark-mode status text reads step 400 and must hold 4.5:1 on raised surfaces; with the base curve the unpinned fixtures failed exactly there (danger 4.17:1, warning 4.29:1), which is how the check earned its place. Chroma follows the seed, tapers at the light and dark ends and is reduced until the colour fits sRGB (gamut mapping by chroma, hue and lightness kept). The seed itself is always a step of its ramp (its nearest step is set to it). A theme may **pin** steps to hand-set values (the default theme pins v0's inks so nothing restyled); unpinned steps then follow the pinned curve, keeping the ramp monotonic. Semantic roles pick steps per context: light text and fills sit at 600-800, dark at 300-400, tints at 100 (light) and 900 (dark); more contrast raises muted text and outlines. Roles stay in sRGB hex so contrast is computable.

**Guarantees and checks (`npm run tokens:check`, static):** the generated files are current; every contrast pair in `checks.json` plus each status, accent and brand on-colour pair holds in **all four contexts** (light and dark, each at standard and more contrast); every ramp is monotonic in lightness; every generated colour is inside sRGB; the fixtures in `packages/core/tokens/colour-fixtures/` (two brand colours in slots 1 and 3 with warm base colours; four brand colours with colour 4 as the accent and base colours tinted from colour 1) and every **brand preset** in `colour-presets.json`, applied over the theme, generate and pass the same pairs; and a lint fails when component CSS or a component token reads `--spectrum-*` or `--set-*`, or when a status role aliases a spectrum or set token. An invalid theme fails with the pair, the context and the ratio, and nothing is written.

**Brand presets and the live editor (F7d).** `packages/core/tokens/colour-presets.json` (`colour-presets/1`) holds nine presets as data, spread across hue and mood: Ocean, Forest, Sunset (amber leads, rose is the accent), Berry, Citrus (lemon and lime as identity, teal as the accent), Graphite (one colour), Electric (all four), Royal and Terracotta. Each is a `brand` block in the config's shape with a name and a one-line mood; `npm run tokens:check` holds each one's pairs in the four contexts. The generator's pure core moved to `packages/core/colour/` (`generate.mjs`, `colour-math.mjs`; export `@design-library/core/colour`), so the build and the browser run the same code. On the Colour page, the four numbered swatches (the ColourField fundamental over the native colour input), the accent choice (SegmentedControl), Clear with Undo, and the Presets menu (the MenuButton fundamental) edit a **draft**: the draft is generated in the browser and its primitives (`--p-brand-<n>-*`, `--p-accent-*`, `--p-alpha-accent-14`) and brand roles are set on the root, so every role reading them, every preview and the title bar recolour at once, and the role matrices measure again. Every pair the brand affects is measured in the four contexts on each change, and a failure is listed with pair, context and ratio rather than hidden. **Persistence decision:** the draft is kept in this browser only (`localStorage` key `design-library.brand-draft`) and the page shows the `brand` block to paste into `colour.config.json` (with Copy) and run `npm run tokens`; nothing in the app writes the source, so the config is never silently overwritten. A dev-only save to the config through the Vite API (like revisions) is possible later if the owner wants it.

**Context echoes (packet 3, 2026-11-07).** A `var()` alias resolves on the element that declares it, so component aliases declared on `:root` (`--c-data-table-outline: var(--color-border)` and the like) ignored a subtree that switches contrast, such as a ContextMatrix cell at more contrast. `tools/token-contexts.mjs` (run by `npm run tokens`; `--check` in `tokens:check`) finds every token that aliases, directly or through other aliases, a token a modifier context overrides and writes it again into `tokens.<modifier>-echo.json`, which the resolver adds to each of that modifier's contexts; the build then re-declares it in the context's selector. Today 12 contrast aliases are echoed (Code, ColourField, MenuButton, RowList, Example, ContextMatrix, DataTable and `color.status.neutral.fg`) and none for motion; an alias that differs between light and dark can't be echoed and fails the check. Measured in a more-contrast cell on a standard-contrast page: each echoed alias now equals its role there (before: the page's standard value); page-level values unchanged (1,072/1,072). **F8 (2026-11-07, main's decision, revisable by the owner):** inside more contrast, `color.border` and `color.border-group` had resolved to text strength, because they aliased `color.border-strong`, which rises to text strength in the same context. They now read `p.standard.border-strong` (the theme's control strength), as their descriptions say: light #18181c 16.97:1 → #6c6c78 4.97:1, dark #f4f4f6 16.12:1 → #8e8e9b 5.47:1 on the canvas; `color.border-strong` and `color.text` keep text strength; standard contrast unchanged. Snapshot `.design-library/snapshots/F8-more-contrast-border-before/`.

**Renamed in F7d (old → new; 1,072 of 1,072 resolved values in light and dark unchanged):** contract `colour-config/1` → `colour-config/2`; `brand.colours[]` with `role` → `brand.colours` keyed `"1"`-`"4"`; `brand.accentFrom` and the `accent` role → `brand.accent` (a slot number); `base.tint.from` takes a slot number or `accent`; `p.primary.*` → `p.brand-1.*` (likewise secondary → `brand-2`, tertiary → `brand-3`); `color.brand.primary` / `on-primary` → `color.brand.1` / `on-1`. No component read the old names.
**Renamed in F7b (old → new; values unchanged):** `color.positive` → `color.status.success.fg`, `color.positive-subtle` → `color.status.success.bg`, `color.negative` → `color.status.danger.fg`, `color.negative-subtle` → `color.status.danger.bg`, `color.warning` → `color.status.warning.fg`, `color.warning-subtle` → `color.status.warning.bg`, `color.info` → `color.status.info.fg`, `color.info-subtle` → `color.status.info.bg`; Text `tone` `positive` → `success`, `negative` → `danger`; private ramps `p.ink` → `p.base` (F7c; briefly `p.neutral`), `p.alpha.ink-*` → `p.alpha.base-*`, `p.indigo` → `p.primary` (read through `p.accent`), `p.green` → `p.success`, `p.red` → `p.danger`, `p.amber` → `p.warning`, `p.blue` → `p.info`. The reserved `data.*` names are replaced by the spectrum; a categorical order for charts is chosen with the first chart.

## Space and shape options

Owner F12 (2026-11-07 15:20): "Things like spacing and shapes should have variations - Space: compact, normal, loose, extra loose - Shape, sharp, rounded, soft, super soft". Read as **theme-level options, not component variants** ([O53-O55](brief.md#working-decisions)): a product chooses one space and one shape for everything, components never branch on them, and any subtree can switch to show or test another.

| Part | Where | What it holds |
| --- | --- | --- |
| Options (system data) | `packages/core/tokens/space-shape-options.json` | Each role's description, and per option its label, who it's for and the scale step (space) or radius (shape) each role takes |
| Theme config | `space-shape.config.json` (schema `space-shape-config/1`) | The theme's choice: `space` (default `normal`) and `shape` (default `rounded`) |
| Generator and check | `tools/space-shape.mjs`, first in `npm run tokens` and `npm run tokens:check` | Writes `tokens.space-shape.json` (the theme's roles, in the base set) and one file per option; fails on an invalid config, stale output or a broken invariant |
| Contexts | `resolver.json` modifiers `space` and `shape`, default `theme` | `[data-space='compact' \| 'normal' \| 'loose' \| 'extra-loose']` and `[data-shape='sharp' \| 'rounded' \| 'soft' \| 'super-soft']` on any element, including back to the theme's own; aliases follow by echo (O50: 62 space, 19 shape) |

**What an option re-maps, and what it never touches.** Space re-maps the 14 space roles (inset, stack, inline, gutter, page margin) to other steps of the same 4 px scale; the scale, sizes, 44 px targets (and the documented 36 and 24 px dense sizes), type and focus never change. Shape re-maps the radius roles `sm`, `md`, `lg` and the new `pill` (a pill by choice: badges and the outer ends of a whole bar); `radius.none` and `radius.full` (round by nature: switch tracks and knobs, dots, spinners, avatars) never change, and only an allow-list may read `radius.full`.

| Space role (px) | Compact | Normal | Loose | Extra loose |
| --- | --- | --- | --- | --- |
| stack pair / row / item / group / section | 4 / 2 / 8 / 12 / 24 | 4 / 4 / 8 / 16 / 32 | 4 / 4 / 12 / 24 / 48 | 8 / 4 / 16 / 32 / 64 |
| inline pair / item / group | 4 / 8 / 12 | 8 / 8 / 16 | 8 / 12 / 24 | 12 / 16 / 32 |
| inset xs / sm / md / lg | 2 / 8 / 12 / 16 | 2 / 8 / 16 / 24 | 2 / 12 / 24 / 32 | 2 / 16 / 32 / 48 |
| gutter / page margin | 16 / 12 | 24 / 16 | 32 / 24 | 48 / 24 |

| Radius role | Sharp | Mild | Rounded | Soft | Super soft |
| --- | --- | --- | --- | --- | --- |
| sm / md / lg | 0 / 0 / 0 | 2 / 4 / 6 px | 4 / 8 / 12 px | 6 / 12 / 16 px | 8 / 18 / 24 px |
| pill | 0 | pill | pill | pill | pill |

**Mild (owner Q97.2, 2026-11-09):** the step between Sharp and Rounded the owner asked for ("mildly rounded but not as rounded as Rounded"): half of Rounded at every role, for calm, dense or professional tools. In the gear's shape presets after Sharp.

**Invariants the check holds in every option:** every space role reads a scale step; a pair is never wider than an item; groups sit at least 1.5 times the item space apart and sections at least twice the group space; no gap inside an enclosure exceeds its inset; insets grow xs ≤ sm ≤ md ≤ lg; sharp is 0 everywhere; radii grow sm ≤ md ≤ lg. **Held by construction:** stacked-bar inner segments are square (they never read a radius role); focus rings are outlines, so they follow each corner; the SegmentedControl's inner radius is its outer radius minus its inset (concentric), clamped to 0 when sharp. **Checked in the browser:** button height 44 px in all four space options; no sideways scroll at about 320 px in extra loose + super soft on Space and size, Shape, Button, Colour and Overview.

**Finding, not changed (the defaults must reproduce exactly):** the popup's list items (`c.list-item.radius`, md) sit 2 px inside a popup of the same radius, so they aren't concentric; the gap shows most in super soft. Proposed fix for the owner: `c.list-item.radius` = popup radius − popup inset (8 → 6 px at rounded).

**In the library:** the Space and size and Shape pages show the four options side by side (the same small form, or the same controls and marks, each in its own `data-space` or `data-shape` subtree, two columns via the new Grid layout's `max`), a plain-words note on who each is for, a roles-by-option table, and a "Preview the whole library in" Select that sets the option on the body for every page, kept in this browser only. The title bar says what's being previewed ("previewing compact space"), so no extra control crowds it.

## Token presets (Q70)

Owner Q70 (2026-11-08 23:13): global token settings hold in the templates too; one global preset applies at once to every template tab and the library; presets can be created and saved per token category and as a whole. **A preset is data: a named value for one category, applied only through the seam that category already owns.** The existing switches and editors (Brand editor, Typography chooser, Icon chooser, Space and Shape previews) are the categories' editors; presets are named values of the same stores, so there is one model, not a second one beside it (Q54, no redundant variants).

| Category | Value | Built-in presets (read-only) | Seam it's applied through | Stored at |
| --- | --- | --- | --- | --- |
| Colour | the brand (slots and accent) | Theme colours + `tokens/colour-presets.json` | generated primitives and brand roles as custom properties on the root | `design-library.brand-draft` |
| Type | faces per role and their axes | `fonts/registry.json` presets (Studio is the theme's) | `--font-*` and `--axes-*` custom properties; the one font loader | `design-library.type` |
| Icons | library and style | Library outline + `icons/sets/index.json` sets | the Icon fundamental's set (`setIconSet`) | `design-library.icons` |
| Space | option id | `tokens/space-shape-options.json` | `data-space` on body | `design-library.space` |
| Shape | option id | `tokens/space-shape-options.json` | `data-shape` on body | `design-library.shape` |
| Material (Q73 MB2) | `frosted` or `solid` | Frosted (theme), Solid | `data-material` on the root, read by `css/materials.css` | `design-library.material` |

**Global presets** (`packages/core/presets/presets.json`, `presets/1`) name one preset per category; `"theme"` means the category's own theme preset. Built in: Theme default, Editorial, Dense tool, Friendly, Bookish (Dense tool and Bookish solid, the rest frosted). A category whose value matches no preset is shown as a custom value; saving a global preset first saves such a value as a category preset of the same name, so a global preset always names presets.

**Store and sync** (`@design-library/core/presets`): the consumer registers each category (built-ins, get, set, subscribe); the store finds the current preset per category and the current global preset by value, applies presets (with transitions suspended, M10), and saves, renames and deletes a person's own presets (`design-library.presets`, this browser). Every category value is persisted, and `watchStored` re-applies one another tab, window or preview frame changed, in one frame; writing the same value raises no event, so tabs never ping-pong. The library app registers the five categories in `apps/library/src/data/presets.ts`; both the library and the standalone template site import it, so inline template previews (same-origin frames) and template tabs inherit and follow the library's choices. Light/dark and contrast stay per template tab (Q63) and are not presets. **Deferred (owner):** different presets side by side in two windows. Motion has no presets yet (only reduced motion, a person's setting); add it as a category when it has named options.

**Presets dialog (Q70.2, F15.P2).** A settings button (gear icon, its tooltip "Presets") sits beside Light/Dark and contrast in every template tab's floating toolbar and in the library's title bar; both open the same Dialog (`apps/library/src/inspectors/presets.tsx`): one radio list of global presets (each with who it suits; "Custom" appears, selected, only when the current choices match none) and one Select per category under "Each part". A choice applies at once, in this tab and every other open tab, so the dialog has one answer, Done. Built from Dialog, RadioGroup, Select, Heading and Stack only; no styles of its own.

**Saving your own (Q70.4, F15.P3).** When the current choices match no preset, the dialog offers "Save as a preset" under the global list and "Save as a … preset" under any part whose value matches none; a name (new in its scope, 40 characters at most) saves it in this browser and it becomes the chosen one. Your own presets are marked "Yours" (globals) or grouped under "Yours" (parts) and offer Rename and Delete; Delete takes effect at once with Undo in an auto-dismissing notification (owner rule: no confirm dialog for deletes), and `deletePreset` returns the undo that puts the preset back with the same id. Built-in presets offer no actions. Saving a global preset first saves any part that matches nothing as a part preset of the same name (store rule above).## Layers (z-index)

Owner F13 (2026-11-07 15:25): "We should have framework for Z-index and how it operates." Decision [O56](brief.md#working-decisions); page [Layers and breakpoints](http://127.0.0.1:8766/#/layers).

| Layer token | Order | What sits there |
| --- | --- | --- |
| `layer.tooltip` | 500 | Tooltips: on top, short-lived, never interactive |
| `layer.toast` | 400 | Notification pills, above dialogs so a result is never hidden by what caused it |
| `layer.dialog` | 300 | Modal dialogs and sheets (top layer as `dialog`; the token is the fallback) |
| `layer.overlay` | 200 | Scrims and non-modal sheets (the revision pane below the breakpoint) |
| `layer.devtools` | 150 | Review tooling over the page (the element picker), below the pane's sheet |
| `layer.popover` | 100 | Menus, listboxes, popovers (top layer through `popover`; the token is the fallback) |
| `layer.sticky` | 10 | Sticky headers, held table columns, the skip link |
| `layer.raised` | 1 | Over its neighbours, only inside a component that isolates |
| `layer.base` | 0 | Page content in normal flow and source order |
| `layer.behind` | -1 | Behind its siblings, only inside a component that isolates (SegmentedControl's fill) |

**Rules.** Every `z-index` reads a layer token, directly or through a component token `c.<name>.*layer` that aliases one; never a number, never inline. A component that orders its own parts (`behind`, `raised`) declares `isolation: isolate` on the element holding them, so its internal order never leaks. A stacking context starts at position + z-index, opacity below 1, transform, filter, backdrop-filter, `isolation: isolate`, `contain: paint`/`layout`, `will-change` on those, and container queries; inside one, nothing rises above the outside, so the fix for something trapped is the top layer or the layout's overlay, never a bigger number. Popups use `popover` (top layer, F10) and dialogs `dialog`.

**Check:** `npm run check:layers` (`tools/check-layers.mjs`; `--report` lists who sits on each layer) fails on a numeric or unknown z-index in core or app CSS, a component stacking token that doesn't alias a layer, `behind`/`raised` without `isolation: isolate`, or an inline `zIndex`. **Fixed in F13a:** SegmentedControl's fill read a raw `z-index: -1` (now `c.segmented-control.fill-layer` → `layer.behind`); the element picker sat on `layer.sticky` (now `layer.devtools`, same place in the order: above content, below the pane's sheet). The page lists the layers top first with the components on each, read from their CSS.
## Materials and add-on seams (Q73)

Framework, roles, audit and build log: [Materials and backgrounds](materials.md). In code: `packages/core/css/materials.css` defines `--material-chrome-bg`, `--material-floating-bg`, `--material-backdrop` and `--material-veil`; components write `background-color: var(--material-floating-bg, …)` (or chrome) with `backdrop-filter: var(--material-backdrop)` and nothing else; the global `material` setting (`data-material="frosted" | "solid"` on the root) is a Q70 preset category.

**Seams for optional add-ons** (UI Lighting, Liquid glass; brief "Optional add-ons"), all public and stable:

| Seam | What core provides | An add-on may |
| --- | --- | --- |
| AS1 surface attributes | `data-material="chrome" \| "floating" \| "modal"` and `data-elevation="2" \| "3" \| "4"` on the site header, TitleBar, every popup, tooltip, FloatingBar, notification pill, ImageGeneration status, chat jump button, standard and modal Sheet, Dialog, Lightbox | find host surfaces by these attributes only, never by component internals |
| AS2 tokens | `--material-*`, `--color-bg-*`, `--shadow-*` | read them; set only its own namespace (`--glass-*`, `--lighting-*`) |
| AS3 context | `data-material` on the root; a third value `effect` is reserved: core paints the solid finish under it | set `effect` on scopes it owns, remove it to restore |
| AS4 layer | the `addons` cascade layer, last in `css/index.css` (`@layer reset, tokens, base, fundamentals, compounds, layouts, templates, app, addons`), so an add-on's rules win over core without `!important`; `::before` on material surfaces is reserved for its decoration, under content | paint in that layer and slot; never restyle text or controls |
| AS5 preferences | reduced transparency, more contrast, forced colours, print and no backdrop-filter support force solid first | stand down whenever solid is forced |

**Enforcement** (`npm run check:materials`, `tools/check-materials.mjs`): backdrop filters only through `--material-backdrop`, one blur of at most 24 px (AR10); no translucent literal backgrounds outside `materials.css`; every frosted fill paired with the backdrop; frosted only in the listed FR places (a new one is added to the tool on purpose); `backdrop-filter` never animated (AR12); the AR7 nesting rule and the forced-solid fallbacks present; and the tint floor (AR9): `text`/`text-muted` 4.5:1 and `focus`/`border-strong` 3:1 on each frosted fill over uniform black and white, light and dark, with no help from the blur. Not covered: AS3's `effect` value is reserved, not built; no add-on is installed.

## Density: content and chrome

Owner Q97 (2026-11-09): components used as app chrome must be sized as chrome, not as content: the Design tool's inspector at a narrow width showed content-size body text (16 px), so "256 px" and "100 %" wrapped, and fields far too rounded. Chrome and content are different contexts, so the library has one context seam for it, `data-density`, set on the region, never a per-component override.

### Part 1: the framework

1. **Know which one a region is.** *Content* is what the page or app is for: an article, a conversation, an issue, a form a person fills in, the canvas's document. *Chrome* is the tool around it: a sidebar of places, an inspector or property panel, a layers panel, a details column, an editor's bar. Ask: would this region change if the content changed? If it's the same frame around any content, it's chrome.
2. **Put chrome in the compact context.** `data-density="compact"` on the region's root (or the layout's region part). Inside it, body and label text take the small size (`text.s`, 14 px at the default scale), and controls' and surfaces' corners take the shape's small radius (4 px when Rounded, 2 px when Mild). Space is unchanged: it's its own context (`data-space`). Field labels take the compact label role (one line, muted).
3. **Content stays in the default context.** Never set compact on a main view, a conversation, a page column or a canvas's document; a person reads content at the body size.
4. **The layouts already decide it.** AppLayout's sidebar and details column, ChatLayout's sidebar are compact by default; EditorLayout takes `data-density="compact"` on its root (an editor is chrome around a canvas, and the canvas's document keeps its own type, `c.canvas.text-size`). A custom layout says it the same way on its chrome regions.
5. **One seam, never overrides.** Don't pass `size="s"` to every field in a panel or restyle a component's radius: the context changes the roles every component reads. Keep content out of chrome regions rather than undoing the context inside them (the context has no way back to the content size within a compact region yet).
6. **Shape still comes from the brand.** Compact takes the *shape's* small radius, so a Sharp brand stays square and a Super soft one stays soft, only one step tighter.

### Part 2: the checklist

Each row passes or fails on a measurement. **DOM** rows are measured by `tools/context-probe.js` (`window.contextProbe()`).

| ID | Passes when | How | Severity |
| --- | --- | --- | --- |
| CX1 | Every chrome region (a layout's sidebar, details column, an editor's bar and panels) is inside a compact context | DOM | S2 |
| CX2 | Inside a compact region, running text and control text are no larger than the small body size (headings and a canvas's document excepted) | DOM | S2 |
| CX3 | Inside a compact region, controls' corners are no rounder than the shape's small radius (round-by-nature shapes excepted) | DOM | S2 |
| CX4 | Content regions (a layout's main view, a conversation, a site page's column) aren't compact | DOM | S2 |
| CX5 | Values in a chrome panel fit on one line at the panel's narrowest width ("256 px", "100 %") | look, at the panel's least width | S2 |

**Results, F15.CX1 (2026-11-09 about 13:05):** the context probe on 51 template layouts across all eight templates: no CX row fails. The Design tool's inspector at a 320 px window and in its 256 px panel: Dev mode values at 14 px on one line each (21 px rows); the Design tab's fields at 14 px with 4 px corners (were 8 px at Rounded), every value fitting its field. The spacing and scroll probes on the 52 Chat, Design and Projects layouts: no regression.

## Clipping

**Owner, 2026-11-07 15:25 (verbatim, DoD Q24):** *"We should have framework for what gets clipped what doesn't. We should avoid unintended clipping of shadows and borders which happens sometimes."* Built in F13b (delivered 2026-11-07 20:35; design for review, not approval).

- **Rule:** clipping is a decision, never a side effect. `overflow: hidden | clip`, `clip-path`, `contain: paint | content | strict` and `text-overflow` may appear only in a rule named in `tools/clipping-allow.json` with its kind (visually hidden, text truncation, shape crop) and reason. Scroll regions (`overflow: auto | scroll`) clip by nature, so they're listed too.
- **Room for rings and shadows:** padding sits one or two levels below a clipping box, so an edge item's focus ring, border and shadow fit inside; scroll regions bleed to their surface's edge and pad their content, never themselves. A shape crop holds nothing focusable or shadowed. Text is truncated only where the full text is one step away.
- **Checks:** `npm run check:clipping` (`tools/check-clipping.mjs`, static; `--report` lists the allow-list) fails on an unlisted clip, an unlisted scroll region or a listed rule that no longer clips. `tools/clipping-probe.js` is a browser probe (`window.clippingProbe().rows`, CL1–CL4: cut rings, cut shadows, cut text, truncation without a step); first run in F15.CL1 (2026-11-09), see [Clipping](clipping.md), the two-part framework.
- **Library page:** [Clipping](http://127.0.0.1:8766/#/clipping) under Tokens, reading the same JSON the check reads. Today: 11 allowed clips (F14 added ScrollArea's axis lock), 6 scroll regions (F14 replaced the three layout regions with ScrollArea's one viewport).
- **Open:** before/after fixes from a probe run (owner: "avoid unintended clipping … which happens sometimes"); the probe's own allow-list (`stacked-bar`) should read the JSON.

## Scrolling

**Owner, 2026-11-07 15:28 (verbatim, DoD Q26):** *"Have proper definition of scrollbars. We use custom and minimal scrollbar. - Always visible variant - Visible only when scroll is activated or on mouse hover. - Scroll doesn't break layout, it's scpae is already accounted for in a manner where the content alignment is not affected. Scroll is treated like an overlay, not an extra column that gets added disturbing layout and alignment."* Built in F14 (delivered 2026-11-07; design for review, not approval).

- **One primitive:** the [ScrollArea](http://127.0.0.1:8766/#/scrollarea) fundamental (`packages/core/react/fundamentals/ScrollArea.tsx`, `css/fundamentals/scroll-area.css`). It hides the browser's bar (`scrollbar-width: none`) and keeps native scrolling (wheel, touch, keys, find in page, anchors); a thin thumb is drawn on an absolutely positioned track over the region's end edge. Nothing is reserved for it (no `scrollbar-gutter`), so the content's width and alignment are identical with or without overflow; the story measures it live (260.6 px both ways at 1400 px wide).
- **Two modes:** `auto` (default): hidden at rest, shown while scrolling (for `c.scroll-area.idle`, 1 s, after the last scroll), on hover of the region and while dragged, fading over `duration.medium`; `always`: shown whenever the content overflows. Both axes (`axis="block" | "inline" | "both"`; with both, each bar stops short of the other's corner).
- **Look:** 8 px thumb drawn at 0.5 scale (4 px) at rest, full on hover of its 12 px strip or while dragged, so hover changes only transform and colour, never geometry; `color.border-strong` at rest (≥ 3:1 on canvas, raised and sunken in all four contexts, already in `checks.json`), `color.text-muted` when active; ends `radius.pill` (square under the sharp shape option); at least 24 px long.
- **Room:** the content's end edges keep at least the 12 px strip (`inset="sm"` pads its end edges by `max(inset, strip)` always, not only on overflow), and regions with `inset="none"` pad their own content by more than that (the library's regions use the page margin), so the thumb never covers content or a focus ring at either end. Mid-scroll, content passes under the overlay bar by design.
- **Behaviour:** the thumb drags (pointer capture); pressing the track pages 90 % towards the pointer; right-to-left is mirrored with logical properties. The drawn bar is `aria-hidden`; a region with nothing focusable takes `label`, becoming a named, focusable region so keys scroll it. Hover rules sit in `@media (hover: hover)` with a dragged twin. Reduced motion: no fade. Forced colours and touch screens (`hover: none` and `pointer: coarse`) get the system bar back; under forced colours the system bar may take a column (the one exception).
- **Where:** LibraryLayout's main region (`always`: a long reading region whose length and position matter), navigation and revision pane (`auto`); since **F14b** (2026-11-07 about 20:57) also CodeBlock (in a cropped well whose end keeps room for the copy action), DataTable and ContextMatrix (inside their outline, which crops the corners; sticky row labels still hold) and Example previews (the ScrollArea takes the preview's colour context, so the thumb contrasts with the preview's surface), all sideways and `auto`. Inline-scrolling content wraps to the region first (`fit-content`) and only scrolls when it can't. **Popup lists (F14c, 2026-11-07 about 21:18):** ScrollArea's behaviour is now the tier-0 module `useOverlayScroll` (`packages/core/react/behaviour/scroll.ts`); ScrollArea, and the Select and MenuButton lists, use it, so every list draws the same overlay bar (`auto`) with the list's inset unchanged on both sides; the thumb overlays the items' fill edge, never their words. The document itself on small screens keeps the browser's bar (the page, not a region, scrolls there).
- **Page scroll is never blocked (F14d, owner bug 21:44, DoD Q39):** an in-page region uses `overscroll-behavior: auto`, so the wheel scrolls the region on the axes it can scroll and passes on to the page at its end; a horizontal-only region passes the vertical wheel straight through. No wheel listener, no `preventDefault`, scroll listeners passive. Containment (`contain` prop, `data-contain`) only in popups and modals: today the Select and MenuButton lists. Verified live with wheel events in headless Edge (page moved 400 px over a code block, matrix, table and preview; 0 with the old rule).
- **Check:** `npm run check:clipping` now fails on `::-webkit-scrollbar`, `scrollbar-width`, `scrollbar-color` or `scrollbar-gutter` anywhere but `scroll-area.css`.
- **Library page:** [Scrolling](http://127.0.0.1:8766/#/scrolling) under Tokens: the rules, both modes live, the no-shift measurement, both axes, and where each mode is used.
- **Tokens:** `size.scrollbar-thumb-hover`, `size.scrollbar-track`, `size.scroll-sm|md|lg` (12, 20, 32 rem caps), `duration.scrollbar-idle`, and the owned `c.scroll-area.*` group.
- **Assumptions:** `scrollbar-width: none` is supported in the target browsers (Chromium 121+, Firefox, Safari 18.2+); older engines would show their own bar beside the content. A 4 px thumb is findable at rest in `always` mode; the owner judges.

## Loading

**Owner, 2026-11-07 15:25 (verbatim, DoD Q25):** *"We should have framework for Loading state for various levels, app, view/page, section, component etc. While these should be covered separately in each component preview, there should be a consolidated place where the framework and the examples are all shown together."* Built in F13c (delivered 2026-11-07 about 21:09; design for review, not approval), from the `ui-states` and `perceived-performance` skills.

- **Five scopes, smallest first:** app (the ground under everything changes: a full state with steps, a bar with a real percentage and Cancel, only with a written reason), view (header and navigation live; the content area shows a skeleton of its real layout), section (each swaps in complete on its own; a refresh keeps the old content and shows a small arc with "Updating…" past 300 ms), component (the control's own box: Button spinner inside or arc on the border, Switch knob edge; long work adds a bar and a step line under it), inline (a field's trailing spinner and tick; a small arc and words beside a short check).
- **Three indicators, no more:** the new **Skeleton** fundamental (text lines, block, circle; three shimmer passes then still; `still` for an empty state's silhouette), and **Progress** in two forms of one component: the existing `inline` arc and the new `bar` (determinate from a real total, or a travelling segment). No separate Spinner or second skeleton (Q34, no redundant variants).
- **One timing model:** the new `useLoadIndicator(loading)` (`packages/core/react/behaviour/load.ts`) shows nothing for `duration.indicator-delay` (300 ms), holds at least `duration.indicator-min` (500 ms) once shown and flags `slow` past 10 s; the commit track (`useCommit`, 200 ms beats) stays inside the controls.
- **Accessibility:** the waiting region is `aria-busy`; one `role="status"` line says start and end once; step text is not live; skeletons are `aria-hidden`; reduced motion stops the shimmer, the arc and the bar's segment.
- **Tokens:** `c.skeleton.fill` (`color.border`), `c.skeleton.highlight` (`color.bg-raised`), `c.skeleton.line`, `c.skeleton.radius`; `c.progress.bar-thickness|bar-track|bar-fill|bar-sweep`; existing `duration.shimmer`, `count.shimmer-passes`.
- **Library pages:** [Loading](http://127.0.0.1:8766/#/loading) under Tokens (rules, scopes, six live examples with a load-outcome chooser: instant, 1 s, 12 s, empty, fails; the timing tokens), [Skeleton](http://127.0.0.1:8766/#/skeleton) and [Progress](http://127.0.0.1:8766/#/progress) under Fundamentals → Feedback.
- **Open for the owner:** in dark contexts the shimmer's band is darker than the shapes (it moves towards the raised surface) rather than lighter; say if it should always be lighter. Per-component loading stays on each component page; a notification pill for background work isn't built yet.

## Motion and transitions

**Owner, 2026-11-08 20:34 (verbatim in [DoD Q65](definition-of-done.md#owner-instructions)).** The framework has its own page: [Motion and transitions](motion.md) (F15.82 draft, docs only; not approved, nothing built). In short: functional transitions that show how context and content move between states; morph-first continuity through the same wrapper (S0–S7 strategy ladder, C1–C28 catalogue); every visual value interpolated at a 200 ms default with named longer durations; an explicit zero-latency list (Z1–Z19) where the value a person drives is drawn in the next frame; reduced motion keeps fades and colour and drops travel; performance rules R1–R10; proposed tokens T1–T13 and primitives P1–P8 for Q65.4. The current Motion tokens in [Tier 0](#tier-0-token-categories) stay as built until then.

## Typography

**Owner, 2026-11-07 20:39 (verbatim in [DoD Q35](definition-of-done.md#owner-instructions)).** Built in F16 (delivered 2026-11-07 about 20:52; design for review, not approval); reference [atiya/design typography](https://prabinpebam.github.io/atiya/design/tokens/typography/), its anatomy adapted, nothing copied.

- **Roles:** four font role tokens, `font.display` (headings, `Heading`, `h1`–`h4`), `font.text` (reading text, `Text` body and body-sm), `font.ui` (the root: controls, labels, navigation, captions) and `font.code` (code), with `axes.<role>` tokens read as `font-variation-settings`. A role left unset collapses onto the one above (ui → text → display); code without a face stays on the system monospace. `font.sans` and `font.mono` are gone (renamed, 0 other values changed).
- **Registry:** `packages/core/fonts/registry.json` holds the four roles and their jobs, 12 curated faces (Bricolage Grotesque, Fraunces, Space Grotesk, Inter, Source Serif 4, Literata, Figtree, IBM Plex Sans, Nunito Sans, Roboto Flex, JetBrains Mono, Recursive), each with sample, description, designer, licence (all SIL OFL 1.1, read from each package), axes with ranges and defaults, and italic; and six presets (Studio, the default, plus Editorial, One face, Technical, Bookish, Flexible).
- **The one provider loader:** `packages/core/fonts/loader.ts` (`@design-library/core/fonts`): each face self-hosted from its `@fontsource-variable` package (installed through the approved npm proxy), loaded only when a role uses it, `font-display: swap` over the role's system stack, so core works with no font loaded.
- **Library page:** [Typography](http://127.0.0.1:8766/#/type): a preset Select and one face Select per role (preview the whole library, kept in this browser, never written to source, as F12); a face list per role ("Aa", name, job, sample, description, designer and licence, axes, CSS variable); "Play with a face": per role, a Slider per range axis and a Switch per on-or-off axis, read from the registry; the ramp, top step first.
- **Ramp:** open-ended names `text.xs` 12, `s` 14, `m` 16, `l` 20, `xl` 24, `xxl` 32, `xxxl` 40, `xxxxl` 56, `jumbo` 80 px (renamed from sm/md/lg/2xl/3xl; values unchanged); new composites `type.display` and `type.jumbo` with line height `leading.display` (1.05) and tracking `tracking.display` (-0.025em); `Heading size="display" | "jumbo"`.
- **New fundamental:** [Slider](http://127.0.0.1:8766/#/slider) (native range input, label and value, `accent-color`), filed under inputs.
- **Assumptions / open:** fixed (not fluid) sizes; `xs` has no text style yet; button size tokens don't yet read the ramp names (B rows); the theme's fonts are set in tokens by hand until a `type.config` generator exists.

## Tier 1: fundamental inventory

Native element first; sealed (no `class`/`style` props); every state listed is designed and shown, not only "rest". **S3 set** are built first; the rest are defined now and built when a view needs them.

| Fundamental | Purpose | When not to use | Native base | States | Accessibility and keys |
| --- | --- | --- | --- | --- | --- |
| **Text** (S3) | Body and supporting text in a composite style. | Headings (use Heading); text inside controls (the control owns it). | `p`, `span` | rest; `tone` muted/negative/positive only with meaning | Inherits language/direction; no keys. |
| **Heading** (S3) | Section titles with a semantic level independent of visual size. | Emphasis inside a paragraph. | `h1`-`h6` | rest | Level set by outline, never skipped for looks. |
| **Link** (S3) | Navigate to a URL or route. | Performing an action (use Button). | `a[href]` | rest, hover, active, focus, visited (where meaningful), current (`aria-current`) | Enter activates; external links say so in text. |
| **Icon** (S3) | Show a semantic icon from the active set. | Decoration with no meaning; as the only label of a control without an accessible name. | inline `svg` | rest | Decorative `aria-hidden`; meaningful icons get a label; RTL flip by metadata. |
| **Button** (S3) | Trigger an action; one component for text, icon+text and icon-only (label required). | Navigation (Link); on/off settings (Switch). | `button` | rest, hover (inside `@media (hover: hover)` with an `:active` twin), active, focus, disabled; commit: pending (spinner replaces its icon, label in present tense "Saving…", width fixed, locked with `aria-disabled`, never `disabled`), confirmed (tick and past tense "Saved", held `duration.confirm-min`), failed (back to rest, error at the section's scope); emphasis `primary`/`default`/`quiet` | Enter/Space; pending sets `aria-busy` and keeps focus; icon-only needs `aria-label`; 44 px target; label is a verb, 3 words or fewer. |
| **Switch** (S3) | A binary setting that takes effect immediately. | Choices needing a Save (use Checkbox); actions. | `button[role=switch]` or `input[type=checkbox][role=switch]` | off, on, hover, focus, disabled; commit: pending (spinner replaces the switch in its own box, at least `duration.confirm-min`, same focusable element locked), confirmed (new value), failed (stored value restored, error icon and Retry) | Space toggles; `aria-checked`; label names the setting, not the state; one commit in flight. |
| **TextField** (S3) | Single-line text entry with label, hint and error. | Long text (TextArea); choosing from a known set (Select). | `label` + `input` | rest, hover, focus, filled, disabled, read-only, required, invalid with message (grows downward only); blur-commit: pending (commit-colour border, trailing spinner), confirmed (tick inside the field), failed (error border and icon, value kept, Retry and Revert below) | Label always visible, no colon; placeholder only as an example; error via `aria-describedby` says what happened and how to fix it; input never lost. |
| **TextArea** | Multi-line text entry. | Single-line values. | `textarea` | as TextField | Enter inserts a line; label/hint/error as TextField. |
| **Checkbox** | Independent options, or a setting applied on Save. | Immediate binary settings (Switch). | `input[type=checkbox]` | off, on, indeterminate, hover, focus, disabled, invalid | Space toggles. |
| **SegmentedControl** (F5) | Choose one of 2-5 exclusive options, side by side, that apply at once without saving: how a view or the app shows its content. Text or icon-only segments; `size` `md` (36 px, default, dense surfaces such as the title bar) or `sm` (24 px, inside content). Grounded in the owner's F5/F5b direction (the library's colour scheme and contrast, U12). | One on/off setting in a form (Switch); more than five options (Select); a choice that saves (no commit states yet). | `div[role=radiogroup]` + native `input[type=radio]` in each segment's `label` | unchosen, chosen (accent fill, inset evenly), hover, press, focus, disabled; forced colours | One tab stop; arrow keys move the choice and wrap; icon-only segments named by their label, also the tooltip. Dense by written exceptions (O40, O41): square targets of 36 px (`size.target-dense`) or 24 px (WCAG 2.5.8 minimum). A subtle group fill, no outline except with more contrast. |
| **MenuButton** (F7d, F10) | A button that opens a short menu of actions or starting points (presets). | A value that stays chosen (Select, SegmentedControl); navigation; one action (Button). | `button[aria-haspopup=menu]` + `role=menu` of ListItem `menuitem`s in the shared popup | closed, open, item hover/focus, unavailable | APG menu button: Enter/Space/Arrow down open at the first item, Arrow up at the last; arrows wrap, Home/End, letter type-ahead, Escape returns focus; 44 px targets. |
| **ListItem** (F10) | The one item of every popup list (Select options, MenuButton items): icon or palette slot, words, a line that tells items apart, the selected check. | Navigation (Navigation), data rows (RowList), anything outside a popup list. | `div[role=option|menuitem]` | rest, hover, pressed, focus (real or `active` for `aria-activedescendant`), selected (tint + check) | Never a Tab stop; selected shown by check and `aria-selected`, not colour alone; 44 px tall; the list's 4 px gap keeps fills apart. |
| **ColourField** (F7d) → **Compound** (packet R, 2026-11-07) | Moved to tier 2 by the owner's [tier definitions](#tiers-what-belongs-where): a special need, not universal. Choose, change or clear one colour: a labelled swatch over the native colour picker. | Choosing among fixed colours (SegmentedControl, Select); showing a token's colour (TokenSpecimen). | `input type=color` covering the swatch | defined, not defined (dashed swatch with words), can't be cleared (no Clear) | Named by `label`; Enter/Space opens the picker; Clear is an icon-only Button named "Clear" plus the label; 64 px swatch target. |
| **Stack, Cluster, Grid** (moved from tier 3, packet R) | Arrangement primitives: a column, a wrapping row, equal columns, each with one gap from a space role, so views need no styled wrapper. | A page's regions (a layout). | `div` | rest | No semantics of their own; reading order is source order. |
| **ButtonGroup** (planned, F15.1) | Related buttons side by side as one group. Fundamental by the owner's definition, being that common; products may still define their own. | One exclusive choice that applies at once (SegmentedControl); a toolbar of mixed controls (Toolbar compound). | `div[role=group]` | as Button | Named group; each button keeps its own name and target. |
| **RadioGroup** | Choose exactly one of 2-6 visible options. | Long lists (Select); binary on/off (Switch). | `fieldset` + `input[type=radio]` | per option: unselected, selected, hover, focus, disabled; group invalid | Arrow keys move and select; Tab enters/leaves the group. |
| **Select** | Choose one from a longer known list. | 2-6 options worth showing (RadioGroup); free text (TextField). | `select` | rest, hover, focus, disabled, invalid | Native keyboard. |
| **Slider** | Choose a value on a continuous range where approximate is fine. | Exact values (TextField with number). | `input[type=range]` | rest, hover, focus, dragging, disabled | Arrows step, Home/End; value text announced. |
| **Badge** | Non-interactive status or count. | Interactive filters or removable items (a future Chip compound). | `span` | tones by meaning | Text, not colour alone. |
| **Progress** | The one indicator for operations: determinate bar, indeterminate bar, and the compact inline form used inside a busy Button. | Content loading (Skeleton). | `progress` | determinate (percentage only from a real total), indeterminate | `aria-label`; announced by the owning region, not repeatedly. A spinner at component or field scope is this component's compact form, not a second indicator. |
| **Skeleton** | Shimmer placeholder for loading views and sections. | Operations in progress (Progress); anything under 300 ms. | `div[aria-hidden]` | loading | The region sets `aria-busy`; reduced motion stops the shimmer. |
| **Image** | Content image with required alt decision. | Icons (Icon); decoration (CSS by the owning component). | `img` | loading, loaded, failed (fallback) | `alt` required, empty only when decorative. |
| **Separator** | A divider only where space alone can't separate. | Between items space already separates (visual-noise). | `hr` | rest | `role=separator` implicit. |
| **VisuallyHidden** | Text for assistive technology only. | Hiding content from everyone. | `span` | rest | Becomes visible on focus when it wraps a skip link. |
| **Code** | Inline code and keys (`kbd`). | Blocks of code (a CodeBlock compound). | `code`, `kbd` | rest | — |

**Deduplicated on purpose:** one Button (no separate IconButton), one Progress (no separate Spinner), one Badge (no Tag/Label/Pill trio), Switch vs Checkbox split by *when the change applies*, not by look. One SegmentedControl serves both title-bar groups, with two sizes from component tokens (no icon-only or compact variant component); Button gains a medium size and disclosure props rather than a header-only button; RadioGroup stays unbuilt until a stacked, labelled choice is needed, and would share the same native radio model.

**Tier 2 and 3 needed by the library app first** are now listed, grounded and scheduled in [Self-presentation: compounds](#self-presentation-compounds); Navigation is the first one built (F6a).

## Self-presentation: compounds

**Owner direction F6 (2026-11-07 11:59) and F6a (12:02, verbatim in the [ledger](work-plan.md#approval-ledger)):** the library presents itself with its own tiers. The library app is an ordinary consumer: its views have **no styles of their own** and are assembled only from tokens, fundamentals, compounds and layouts. Compounds start now and are listed and defined in the library under their own tier ([O42](brief.md#working-decisions)). Direction, not approval; ux-sooner; no visual redesign as a side effect.

**Measured (`npm run check:views`, `tools/check-views.mjs`):** before F6a, 180 raw HTML elements styled by the app (213 raw in all) and 140 app CSS rules in `inspectors.css` (126) and `revisions.css` (25, 11 of them tooling). After F6a: **173 and 130**. After C2: **156 and 111**. After F7b: **160 and 111** (+4: the functional-colour specimen cell on the Colour page; TokenSpecimen in C5 absorbs it). After C3: **116 and 91**. After C4: **95 and 73**. After C5a (StackedBar): **91 and 71**. After C5b (RowList): **73 and 55**. After C5c (TokenSpecimen, Cluster): **28 and 14**, all of them in the revision pane (C6); `inspectors.css` is deleted. After C6 (Pane, Toolbar): **0 and 0** outside app tooling, so `npm run check:views` passes; 8 elements and 5 rules are named as **pending an owner decision** (below), on an exact list with a budget that fails if exceeded. The check fails until both reach zero outside the app-tooling list below.

**Compound rules** (design-system): made only from fundamentals and tokens, never another compound (a compound may take another compound as slot content from the view); owned `c.<name>.*` tokens aliasing semantic roles; doc comment with summary, when-not, `@tier compound`, `@a11y`, `@key`; typed props; a story file, so its page, props, keys and "Built from" are generated; CSS in `packages/core/css/compounds/` under `@layer compounds`; `data-dl` anatomy.

| # | Compound (tier) | Status | Job it serves (grounding) | Replaces in the app | App CSS rules |
| --- | --- | --- | --- | --- | --- |
| 1 | **Navigation** (2) | **Built, F6a** ([page](http://127.0.0.1:8766/#/navigation)) | Move between an app's pages, the current one marked (U12, U13; the owner's F6a). | Sidebar list and narrow disclosure in `App.tsx` | 10, deleted |
| 2 | **TitleBar** (2) | **Built, C2** ([page](http://127.0.0.1:8766/#/titlebar)) | Say what product and version this is, and hold app-wide actions at the top end (O41). | `masthead`, `brand-group`, `appearance`, `brand`, `status` | 5, deleted |
| 3 | **PageHeader** (2) | **Built, C2** ([page](http://127.0.0.1:8766/#/pageheader)), with the **Badge** fundamental ([page](http://127.0.0.1:8766/#/badge)) | Say where a page sits (tier eyebrow linking back), what it is (title, lead) and where it comes from (source). Needs the Badge fundamental for the eyebrow pill. | `intro`, `tier`, `lead` | 7, deleted |
| 4 | **Section** (2) | **Built, C2** ([page](http://127.0.0.1:8766/#/section)); the page column became the tier-3 **PageLayout** ([page](http://127.0.0.1:8766/#/page-layout)) | A titled part of a page with a short intro; an optional index numeral (the overview's tiers). | `page`, `block`, `block-intro`, `tier-section`, `numeral`, `tier-body`, `stack`, `overview-section` | 7, deleted |
| 5 | **CodeBlock** (2) | **Built, C3** ([page](http://127.0.0.1:8766/#/codeblock)) | Read and copy source; the copy confirms on itself and says when it can't (ui-states). | `code-block`, `code-copy` | 3 |
| 6 | **DataTable** (2) | **Built, C3** ([page](http://127.0.0.1:8766/#/datatable)), with the **Code** fundamental ([page](http://127.0.0.1:8766/#/code)) | Compare structured facts in rows (props, keys); scrolls sideways in its own region, row headers held. Uses the Code fundamental for `kbd`. | `table-scroll`, `props`, `keys` | 9 |
| 7 | **DescriptionList** (2) | **Built, C3** ([page](http://127.0.0.1:8766/#/descriptionlist)), with the **List** fundamental ([page](http://127.0.0.1:8766/#/list)) | Term and details pairs that stack on narrow screens ("Built from", facts). | `built-from`, `facts` | 6 |
| 8 | **Example** (2) | **Built, C4** ([page](http://127.0.0.1:8766/#/example)); the source is CodeBlock passed as slot content | Show a working specimen: title, one line, a preview in the library's context, its source behind "Show the code" (CodeBlock as slot content). | `example`, `example-head`, `canvas`, `pane`, `pane-content`, `source`, `examples` | 8 |
| 9 | **IndexList** (2) | **Built, C4** ([page](http://127.0.0.1:8766/#/indexlist)) | Link to each page of a set with its one-line summary (overview). | `index`, `index-item`, `overview` | 4 (shared) |
| 10 | **ContextMatrix** (2) | **Built, C4** ([page](http://127.0.0.1:8766/#/contextmatrix)); the app maps its four contexts and anchors onto it | Compare values across contexts with invariants once (F1, O40). | `matrix`, `matrix-label`, `matrix-cell` | 9 |
| 11 | **RowList** (2) | **Built, C5b** ([page](http://127.0.0.1:8766/#/rowlist)); decision (a) kept: two compounds | Rows of named facts on one hairline each, columns proportional, stacking below `breakpoint.sm` (token rows, ramps, faces, bars). Columns are data (`name`, `value`, `facts`, `specimen` or a share); `specimen="large"` gives live type more room; a cell given as a list stacks its facts. | `rows`, `ramp`, `faces`, `bars`, `sizes`, `tiles`, `eases`, `durations` | 16, deleted |
| 12 | **TokenSpecimen** (2) | **Built, C5c** ([page](http://127.0.0.1:8766/#/tokenspecimen)); `kind` names what the token is (12 kinds), one component | Draw one token so its value can be seen: swatch and chip, type sample, length bar, size square, radius, stroke, shadow tile, easing curve and track, duration fill; one component, `kind` from token type, no variant per kind. | `swatch*`, `chip*`, `strip`, `sample`, `type-sample`, `face-*`, `bar`, `square`, `width`, `radius`, `stroke`, `elevated`, `curve*`, `track`, `dot`, `fill`, `motion*`, `ratio`, `hue*`, `palette` | 40 |
| 13 | **StackedBar** (2) | **Built, C5a** ([page](http://127.0.0.1:8766/#/stackedbar)); status segments only, categorical series from the spectrum arrive with the first chart | Show parts of a whole; inner segments square, only the outer ends rounded (owner constraint). A product data-viz job, not only a token specimen. | `stacked-bar` | 2 |
| 14 | **Pane** (2) | **Built, C6** ([page](http://127.0.0.1:8766/#/pane)) | A working side pane: title, close action, sections, a status line at its foot; never a modal (LibraryLayout's aside). | `rev-pane`, `rev-head`, `rev-group`, `rev-status` | 7, deleted |
| 15 | **Toolbar** (2) | **Built, C6** ([page](http://127.0.0.1:8766/#/toolbar)) | A row of related actions, or a control or status with its actions (`start` grows, actions wrap without overlap). | `rev-row`, `rev-actions` | 4, deleted |
| 16 | **CommentList** → RowList | **Pending owner (C6)** | Comments with their target links. Merging into RowList would restyle them (a hairline above the first comment too, 12 px instead of 8 px rows), so they keep their look until the owner chooses; the archive `details` is the third native disclosure (decision (c)), so a Disclosure fundamental is proposed with the same choice. | `rev-comments`, `rev-targets`, `rev-archived` | 5, pending |
| — | **Fundamentals still needed:** Badge (eyebrow pill), Code (`code`/`kbd`), List (bulleted and inline lists: a11y notes, "Built from" names) | With their compound | Already in the tier-1 inventory except List, which needs grounding (the contract sections' lists). | `notes`, `inline-list` | 2 |
| — | **Layout primitives Stack and Cluster** (3) | **Stack built, C4** ([page](http://127.0.0.1:8766/#/stack)); **Cluster built, C5c** ([page](http://127.0.0.1:8766/#/cluster)) for the colour cells, ramp headings and play rows; `wrap={false}` keeps one line and lets text inside shrink | Arrange children in a column or a wrapping row with a gap from a space role; the "layout owns space" rule as components. | `stack`, `groups`, `group`, plain `div` wrappers | counted above |
| — | **Notification** (2: one bottom pill region; auto-dismiss by default, hard-dismiss only when the person must read it or act; one line, three at most), **Tabs** (2), **Dialog** (2), **SpecimenLayout** (3: one region, inside S4 iframes) | Not needed by the app yet | From the inventory; built when a view needs them. | — | 0 |

**Pending an owner decision (C6, named in `tools/check-views.mjs`):** the comment list, its target lists and the archive disclosure in `RevisionPane.tsx` (8 elements, 5 rules); see the C6 question under "Craft skills applied".

**App tooling (allowed under `@layer app`, named in `tools/check-views.mjs`):** the F4 element picker overlay (`Picker.tsx`, `pick-*`: a fixed layer drawn from viewport geometry over any page), revision anchor capture (`capture.ts`, renders nothing), the comment-jump outline (`data-rev-jumped`) and print hiding. 11 rules. They serve the review loop (U14), not a product job, and never style a `[data-dl]` element.

**Decisions this needs (proposed defaults, revisable):** (a) **RowList vs DataTable:** today the token rows are bare hairline rows and the contract tables are outlined scroll regions; default: two compounds, because they differ in job (reading a reference list vs comparing columns), not only in look; merging would restyle one of them. (b) **Stack and Cluster** as tier-3 arrangement primitives, so a view never needs a `div` with a gap; default: yes, before C4. (c) The **"Show the code" disclosure** uses native `details` inside Example and Navigation rather than a Disclosure fundamental, until a third use appears.

**Packets:** F6a Navigation (delivered) → C2 TitleBar, PageHeader, Section → C3 CodeBlock, DataTable, DescriptionList → C4 Example, IndexList, ContextMatrix (+ Stack/Cluster) → C5 RowList, TokenSpecimen, StackedBar → C6 Pane, Toolbar, revision lists → gate: `npm run check:views` passes. Each packet reports before/after counts, keeps revision anchors (`data-rev*`) stable and runs `npm run test:revisions` if they're touched. Pages as data already flow page spec → blocks → registry; moving blocks onto named layout regions is the next step after the gate.

## Library app: structure and page anatomy

**Information architecture (all navigation is data generated from the catalogue):**

| Section | Pages | Source |
| --- | --- | --- |
| Overview | Version, build digest, approval status counts, what changed | Catalogue metadata, approval ledger links |
| Foundations | Colour, Typography, Space, Size, Radius and border, Elevation, Motion, Layers, Breakpoints, Icons | Token JSON, rendered as specimens in each context |
| Components | Fundamentals, Compounds, Layouts (by tier) | Catalogue entries |
| Views | Views-from-data examples per UI family | View specs |
| Contracts | `catalogue.json`, schemas, changelog | Generated files |
| Diagnostics | Build status, link to the plain diagnostic page | Build output |

**Title bar (F5b, O41):** identity, version and status at the start; at the top end, vertically centred with one gap between groups, two icon-only SegmentedControls at the medium size (Light / Dark, Standard / More contrast; app-wide, following the system until set) and an icon-only Revisions disclosure Button.

**Page change (F11, O52):** every page starts at its top. LibraryLayout fades main's content out completely in 100 ms, puts main and the window at the top instantly while nothing shows, swaps the page, then fades it in over 100 ms once it has painted; the title bar, navigation and revision pane never fade. Focus moves to the new page's title; reduced motion swaps at once.

**Every component page, top to bottom:** name, tier, status (approved / candidate / proposed) and version → purpose and when not to use → **specimens** (each story in one pane, in the context chosen in the title bar; F5b, O41) → states inventory → props (generated) → keyboard → tokens read and owned → anatomy (the markup contract) → uses / used by → source path and links to the Slate requirements. Token pages are different: they compare values across contexts, so they keep the four-context matrix.

Two layouts were open; the owner's reference direction of 2026-11-06 21:00 settles it in favour of a reading layout modelled on [atiya/design](#reference-atiyadesign) (closest to A):

**Variant A — Reading page (recommended for v0).** One scrolling column; specimens first, contract sections below. Needs only Navigation list, Table and CodeBlock; works at 320 px without new structure.

```text
+---------------------------------------------------------------+
| Design Library   v0.1 · candidate        [Theme][Contrast][Dir]|
+--------------+------------------------------------------------+
| Overview     | Button                       fundamental · cand. |
| Foundations  | Trigger an action. Not for navigation or on/off.|
|  Colour      | +-------------+-------------+-------------+     |
|  Type        | | light       | dark        | more contr. |     |
|  Space ...   | | [specimen]  | [specimen]  | [specimen]  |     |
| Components   | +-------------+-------------+-------------+     |
|  Button  <   | States · Props · Keyboard · Tokens · Anatomy    |
|  Switch      | (sections, scrolled in order)                  |
+--------------+------------------------------------------------+
```

**Variant B — Workbench.** Three panes: navigation, a canvas with the specimen matrix and context toolbar, and an inspector with tabs (Props, Tokens, Keys, Anatomy, Source). Faster for comparing and, later, a prop playground; needs Tabs and a split layout first and collapses awkwardly on small screens.

```text
+-------------+-------------------------------+-----------------+
| Navigation  | [Theme][Contrast][Dir] canvas | Props|Tokens|Keys|
|  Button <   | +-----------+ +-----------+   | label  string   |
|  Switch     | | light     | | dark      |   | emphasis enum   |
|  ...        | +-----------+ +-----------+   | busy   boolean  |
+-------------+-------------------------------+-----------------+
```

The context toolbar uses the library's own controls: RadioGroup for theme, **Switch** for more contrast (a binary setting), RadioGroup for direction.

### Reference: atiya/design

**Owner direction, 2026-11-06 21:00:** *"I like how the library is presented here. Go for something like this and adapt it for our Design library."* The reference is [atiya/design](https://prabinpebam.github.io/atiya/design/), studied read-only on 2026-11-06: the overview, the Button page and the Colour token page. It is built on the same Craft principles (four tiers, tokens only, pages read from component source), so we adopt its patterns and principles, never its files, assets or copy. **This supersedes the Variant A/B choice.** The result is closest to **Variant A** (one reading column with specimens first). It borrows B's ideas only where the reference does: a per-example preview choice, with the inspector deferred.

| Reference pattern | Decision | How it lands here |
| --- | --- | --- |
| Overview as a "specimen book": a short intro, a "How it's built" section, then one section per tier listing each item as a link and one-line summary, with no cards | **Adopt** | Overview built from page data: intro, how it's built, Foundations / Fundamentals / Layouts indexes. Space groups items (visual-noise: no enclosure where proximity works). |
| Sidebar navigation grouped by tier (Start, Tokens, Fundamentals, Compounds, Layouts), collapsing to a disclosure that names the current page on narrow screens | **Adopt** | Same grouping from data; native `details` disclosure below the medium breakpoint, side region from it (this also closes S2's small-screen gap). |
| Page head: tier eyebrow linking back to its section, H1, one-line summary, source link | **Adopt** (F2a) | Tier pill linking to its section, H1, lead, and a source link to the foundation plan. |
| Example = heading + one line, a rounded outlined canvas with generous inset, "Show the code" with the real source | **Adopt** | One `Example` treatment for every component and foundation page (no second specimen pattern). |
| Canvas previews one mode at a time with a per-example "Preview in Light / Dark" choice | **Adapt (F5, F5b)** | Each example shows one context. The owner first asked for per-preview controls (F5), then moved them to one place (F5b, 2026-11-07 11:41): the title bar's two SegmentedControls set every preview. Token pages keep the four-context matrix because they compare values. Panes move into isolated iframes in S4 (O19/O28). |
| Props table, Accessibility notes with a keyboard table, "Built from" (uses, used by, tokens it reads, linked to token pages) | **Adopt in S4** | Generated by the catalogue from typed props, doc comments and CSS token reads; shown under "Contract" until then, so nothing is hand-written. |
| Token pages: palette shown as the private primitives, then roles in both modes with measured contrast | **Adapt** | Roles first with live-measured contrast in four contexts; primitives stay private and are shown only on a later palette section, if at all. |
| Header: breadcrumb identity, a colour-theme select ("Match system"), a pill call-to-action to the site | **Adapt / don't take** | Identity plus version and status, then appearance controls that follow the system until set: Dark and More contrast Switches (F2a), replaced by the owner's decision (F5b, O41) with two icon-only SegmentedControls and a Revisions icon button. No pill call-to-action: there is no host site, and it would be a second accent. |
| Display serif and body sans faces, Font Awesome Duotone icons | **Don't take** | Licences and provider choice are gated (O11-O13, A10). We use the system stack and one Icon fundamental with semantic names, plus a project-drawn placeholder set until a provider is approved. Duotone accent icons would also add colour noise. |
| Separate Button and IconButton fundamentals | **Don't take** | Owner rule: no redundant variants. One Button covers icon-only with a required label. |

Checked against owner constraints. There are no one-sided accent borders: the canvas has one full hairline outline and panes have none. Binary settings will use Switch (more contrast), and choices a RadioGroup. Padding sits on the panes and on region content, so scroll regions bleed to their edges and focus rings keep their room inside the clipped canvas. There is one specimen treatment, one eyebrow cue and one icon per index link.

## Craft skills applied

The owner's standing rule (2026-11-06 20:44): every Craft skill shapes this library, loaded **before** each slice. What each skill drives here:

| Skill | Drives in this library | Checks: now (ux-sooner, static) / after approval |
| --- | --- | --- |
| `craft`, `ground` | Every slice traces to user-can statements: Foundations pages serve U1/U3/U12; fundamentals U1/U2/U5; the library app U12/U13; the review loop U14. Nothing is added without a trace. | Grounding-critic pass on each slice plan / same, plus heuristics walk H1-H10 on approved views. |
| `assumptions` | A18 (markup-as-contract stays affordable across adapters) and A19 (phase α frame survives working-copy breakage via the diagnostic page) join A14-A16 in the brief. | Cheapest check named per assumption; run in assumption mode only when chosen. |
| `definition-of-done` | Per-slice rows S2.1-S3.x in the [Definitions of Done](definition-of-done.md) with the evidence each needs. | Rows judged by owner review now; evidence rows filled after approval. |
| `design-system` | DTCG tokens with descriptions, private primitives, owned component groups (`c.inspector` owned by the library app), contexts via resolver, generated CSS, sealed fundamentals, tiers, views from data (pages and blocks through a registry); one `size.width-*` scale that every overlay reads, with lists snapping to it ([Widths](widths.md), F15.W). | **Now:** `npm run tokens:check` (stale output, descriptions, aliases, owners, 42 contrast pairs in light and dark), `npm run typecheck`, Vite build, `lint-styles` (no literals, no primitives, hover only under `@media (hover: hover)`). **After approval:** tier-import, sealed-prop, doc-comment/story, unread-token and catalogue-parity checks. |
| `spacing` | 4 px base, roles named by relationship, the layout owns space (gap and padding on parents, no outer margins), padding on region content so scroll regions bleed to their edges, 44 px targets, logical properties. | **Now:** `lint-spacing` (outer margins, sibling-position spacing, state geometry, physical properties, bare scale steps). **After approval:** `spacing-probe` audit at 320 px and each breakpoint, all contexts. |
| `visual-noise` | Cue order space → tone → border → shadow: navigation and content separate by space alone, one neutral hairline divides the header from the page (F2a, as in the reference), and list rows separate by one neutral hairline instead of enclosures; each context cell has one hairline enclosure; only floating layers get shadows; one hover/pressed/selected layer mechanism; no one-sided accents. | **Now:** self-audit before delivery. **After approval:** enclosure-depth, nested-enclosure, distinct strokes ≤ 3 / fills ≤ 4 / shadows ≤ 2 per view. |
| `ui-states` | Timing tokens; commit states (pending, confirmed, failed) on Button, Switch, TextField; shimmer Skeleton for views/sections; one Progress; one bottom notification pill, auto-dismiss by default; focus kept with `aria-disabled` while pending. | **After approval:** beat timing, focus-kept, pill queue and empty/loading fixture checks. |
| `ui-copy` | Sentence case, verb-first buttons of 3 words or fewer, errors with what happened and how to fix it, waits that name the work, a glossary when the first component copy lands (S3). | **Now:** self-review. **After approval:** `lint-copy` on component strings and stories. |
| `perceived-performance` | Wait classes for every load: a page change fades the old page out completely, returns to the top unseen and fades the new page in (F11, O52), specimens acknowledge within 100 ms, named waits past 300 ms (S4 iframes). | **After approval:** each wait measured with `performance.measure`. |
| `performance` | Proposed workloads and budgets, **not measured**: library app cold load, page switch, specimen-matrix mount; bundle budget per entry. Current build output is recorded as a size observation only. | **Production-ready only:** benchmark command, committed baseline, budget check on every build. |

Self-audit before each delivery uses the `design-system-auditor` checklist inline (tokens, spacing, visual noise, tiers, documentation, states, accessibility, data-driven views, copy, heuristics).

Chronological per-packet Craft-skill notes (`F4`–`F15.T6`) live in [Foundation packet log](archive/foundation-packet-log.md#per-packet-craft-skills-log).

## As built

Chronological slice delivery logs (`S2`–`F5b`) live in [Foundation packet log](archive/foundation-packet-log.md#as-built). Current component, token and template inventories are generated directly from source in the library app and `packages/core/agent/index.json`.

## Library revisions

**Owner direction F3, 2026-11-06 23:35:** *"We want the same system for our Design library. Implement the same capability but for the Design library."* The same capability as [Slate's revisions](https://github.com/prabinpebam/slate/blob/main/docs/revisions.md): named revisions of comments on library blocks, saved to disk automatically, acted on by agents through a CLI and archived with a summary. App-layer tooling (O21); core never imports it. Decisions O33-O36 in the [brief](brief.md#working-decisions).

| Part | Reused from Slate, unchanged, by import | Extended for the library |
| --- | --- | --- |
| Lifecycle | `revise`, `archiveRevision`, `reopenRevision` (archive needs a summary and marks comments addressed; reopen keeps them) | None |
| Ids, fingerprints, bounds | `newId`, `sha256`, `normalizeText`, `REVISION_ID`, `MAX_REVISION_BYTES`; the same limits (8 MiB file, 128 sources, 1,000 comments, 100 targets, 20,000 characters, 200-character names) | None |
| File safety | `safeFile` (no traversal, backslashes, colons, control characters, symlinks or junctions) and `RevisionError` | None |
| Document | Root fields, comment shape and every rule of `validateRevision` | `kind: design-library-revision`, no `host`. **Sources** are owning files under `packages/core/` or `apps/library/src/` (component, story, token JSON, CSS, page data), each with its SHA-256 and full content. **Targets** replace Slate's DOM selector with the page `route`, a block `kind`, a stable `anchor` and a catalogue `identity` (component, story, context, token, pair, prop, key, note…), plus Slate's evidence fields (text, sanitized HTML and its hash, occurrence, headings, neighbours) |
| Store | Slate's write algorithm: exclusive lock, optimistic version check, identical retry as a no-op, temporary file, fsync, atomic rename | Root `.design-library/revisions/<id>.json`, apart from `.slate`; `readSource` for snapshots, limited to the source roots |
| API | Slate's rules: loopback only, fixed routes, same-origin writes with `If-Match`, bounded bodies, no CORS, never runs agents | Mounted as a Vite plugin in the library dev server (`/__library/revisions`, `/__library/sources`), never in a build or preview, so a static build reads but can't pretend to save |
| CLI | Slate's verbs and output: `list`, `show`, `check` (non-zero exit when a source used by an open comment is stale or missing), `archive` and `reopen` with the read `--version` | `node .\tools\library-revisions.mjs`; no `import` (browser storage is recovery only, as in Slate) |

Files: `apps/library/revisions/contract.js` (shared by browser, store and CLI), `store.mjs`, `api.mjs`, `library-revision.schema.json`, `revisions.test.mjs`; `tools/library-revisions.mjs`. **Targets point at owning source, not the DOM:** patterns (ContextMatrix rows and cells, token rows, Example panes, props, keys and Built from rows, code blocks, sections) emit `data-rev` identities once each, never per page, and `check` reports a changed source by hash rather than retargeting. Revision chrome stays out of specimens and context cells.

**As built, R1 (contract, store, API, CLI):** `npm run test:revisions` runs 5 targeted cases (contract mutations, foreign and traversal source paths, fingerprint tampering, version conflict, identical retry, lock, bounds, no leftover temporary files, junctioned store refused, CLI staleness and archive/reopen with the read version, API origin, Host, `If-Match`, content type, 8 MiB body, no CORS header, fixed routes): all pass. A CLI round-trip on this repository created the archived revision **"Demo (R1): CLI round-trip, safe to ignore"** in `.design-library/revisions/`: `check` reported `Button.tsx` current and pending, archiving with an old version was refused as a conflict, archiving with the read version marked the comment addressed. **Not built yet:** the API is not mounted in the running server, and there is no selection or Revision panel (R2); jump to target, conflict and failed-save states in the browser, and the agent procedure in `AGENTS.md` follow in R3.

**As built, R2a (what the panel is made of):** three new sealed fundamentals with doc comments, typed props and stories, so they appear in the library like every other: **TextArea** (several lines sent by a separate action, for comments and summaries; TextField stays the one-line blur-commit field), **Select** (native, for the current-revision choice) and **Checkbox** (selection applied by another action, with a box-only form for a block's own corner; Switch stays for settings that apply at once). TextArea and Select share TextField's box through `c.field`, now owned by `shared`; Checkbox owns `c.checkbox`. **LibraryLayout** gains an optional `aside` pane (complementary landmark): beside main on a sunken tone at `size.pane-width` from the medium breakpoint, a bounded sheet below it covering at most `size.sheet-share` of the screen with room kept in main to scroll past it, never modal, hidden in print. No menu or dialog was added: rename uses TextField's blur-commit and archive uses an inline TextArea, so neither needs a modal yet.

**As built, R2b (comment on real pages):** a **Revisions** Switch in the header opens the pane (a pane being shown is a setting, so it's a Switch, not a toggle button; the pane's own close is an action). The pane uses only fundamentals: a Select for the current revision with an icon-only New revision Button, a TextField that renames on blur, a **Select blocks** Switch, the selection listed by page and target, a TextArea for the comment and one primary **Add comment** Button on the commit track, the comments with links to their pages, and Remove. One quiet status line at the foot says *Saves automatically to `.design-library/revisions`*; failures and conflicts stay there with Retry or Load saved version until resolved, and the composer keeps the draft and selection, so nothing typed is lost. **Selection:** with Select blocks on, a layer beside the page's content draws one box-only Checkbox per block, centred on the block's corner (start corner for leaves, end corner for sections and examples, so nested boxes never coincide), quiet until the block is hovered, focused or selected (always shown without hover). Selected blocks get a full outline and a tint, never a stripe. Clicking a block's content selects the innermost block; links, buttons and fields keep working; Shift-click adds the run of same-kind blocks; 100 is the most per comment. Selection and draft persist in browser storage, so they survive navigation and reload. Escape leaves selection first, then closes the pane. **Targets** come from `data-rev` attributes emitted once in each pattern (`rev()` in `apps/library/src/revisions/target.ts`): page title and summary, sections, their headings and intros, ContextMatrix rows and single context cells, token rows, ramps, faces and palette hues, Example blocks, each context pane and its code block, props rows, accessibility notes, key rows, Built from rows and overview index entries. Each carries its owning files (page data, the component and its stories, the token JSON files defining that token, the inspector that draws it). Specimens and context cells carry only data attributes; the boxes and outlines live in the layer, and the captured HTML excludes them. **Checked in the browser:** a revision started from the pane, then five blocks selected across Button (two context panes and the `label` prop row) and Colour (one dark, more-contrast cell and one row) and commented on. The JSON appeared on disk at version 2 with six owning sources; `check` reported all six current and exit 0, and the heading context read *Button › Examples › Emphasis* and *Colour › Roles in every context*.

**As built, R3 (jump, archive, conflicts, agent procedure):** each comment lists one link per block. A link goes to the block's page, opens enclosing disclosures, scrolls the block to the centre of the page region (smooth; instant with reduced motion or in a tab that isn't painting), focuses it and marks it with a full outline outside the block until the next press. The block is found by its anchor (catalogue identity), never by position. A missing page or block is an explicit message with nothing guessed, and a source changed since the comment is named so the reader compares snapshots. **Archive** opens an inline required Completion summary (TextArea) with Archive and Cancel; archived revisions sit in one collapsed **Archived** disclosure with their summary, comments and links, and **Reopen**. Reopening the pane reloads from disk, so agents' archives show up. **Conflicts and failures:** the store's 409 shows *Someone else changed this revision*, keeps the unsaved change in browser recovery, and keeps the draft and selection in the composer. *Load saved version* drops only the unsaved write. A failed save offers Retry. Nothing reports saved without the server's answer. **Agent procedure** in `AGENTS.md` (project-owned section), mirroring Slate's. **End-to-end demo, checked in the browser and by the CLI:** the revision from R2b was renamed in the pane to "Demo (worker R2b-R3)…". With a comment drafted on the Button `Enter` key row, the CLI archived the revision at version 3, playing a concurrent agent. The pane's Add comment got the conflict, with the draft, selection and recovery kept. Load saved version showed it archived. Reopen from the pane kept the earlier comment Addressed, and the kept draft was then added (version 6). The agent procedure followed: `show`, `check` (all six sources current, exit 0), verification on the real pages (muted text 16.1:1 in dark with more contrast; `label` already names icon-only buttons; `--color-border` is the decorative hairline), then `archive --version 6` with that summary (version 7). Closing and reopening the pane showed it archived. Jumps reached a Colour context cell and a Button props row from another page, each focused and in view. At 375 px the pane is a sheet covering half the screen with no sideways scroll, and print hides it. Only the two labelled, archived demo revisions are in the store. **Not built, against Slate:** editing a comment's text (remove and re-add instead), rename and archive in modal dialogs (inline instead, so no dialog component yet), a measured 200 ms scroll, JSON import or export, and keyboard Shift-range (Shift-click only). The read-only state of a static build is written but was not exercised.


### F4: devtools-style element picker (owner direction 2026-11-07 10:35)

The owner asked for selection like the browser's developer tools (any element under the pointer) and for that selection to be the comment's anchor, carrying everything an agent prompt needs. Plan approved 10:40: use established libraries rather than build them.

| Library | Use | Why |
| --- | --- | --- |
| [react-grab](https://github.com/aidenybai/react-grab) 0.2.0, MIT | Only `react-grab/primitives`: hit testing (`getElementAtPoint` with a container and filter), `isElementGrabbable`, page freezing, and `getElementContext` for the React component stack with file, line and column. Its own overlay, toolbar and clipboard flow are never used; `npx grab init` is not run. | Purpose-built for exactly this (pointer → element → source for an agent); works on React 19 through React's DevTools hook (via bippy), with source maps for exact lines. |
| [@medv/finder](https://github.com/antonmedv/finder) 4.0.2, MIT | A short unique CSS selector per element. | Small, maintained, widely used. |
| Rejected | click-to-component, react-dev-inspector | Both rely on `_debugSource`, removed in React 19. Fallback, if react-grab had failed: code-inspector-plugin, scoped to the library app's own pages. |

Installed pinned (`--save-exact`) into `apps/library` with Node's bundled npm 11 through `https://packagefeedproxy.microsoft.io/npm/`; neither has install scripts, and the lockfile has no `registry.npmjs.org` URL. `apps/library/src/revisions/instrument.ts` re-exports the primitives and is imported first in `main.tsx`, so the DevTools hook is installed before `react-dom`.

**P1 proof (2026-11-07, dev server 8766, React 19.3, Vite 8):** `getElementContext` on five real elements of the Button page returned symbolicated component stacks whose lines match the source exactly: the page title (`Heading.tsx:25` ← `App.tsx:253`), a specimen button (`Button.tsx:74` ← `Button.stories.tsx:33` ← `specimens.tsx:164`), the header Dark Switch (`Switch.tsx:56` ← `App.tsx:225`), a navigation link (`App.tsx:198`) and a props row (`contract.tsx:34` ← `PropsTable` ← `Props`). Two limits found: file names come back as base names only, and columns are 0-based. The library maps base names to repository paths through a build-time list of its own source files (no base name repeats across `apps/library/src` and `packages/core/react` today; an ambiguous one would be recorded as ambiguous, never guessed) and stores 1-based columns. Source locations exist only on the dev server; a static build falls back to the selector and catalogue identity.

**As built, P2 (the picker; replaces R2b's corner boxes):** the pane's **Select elements** Switch (a mode that's on or off, so a Switch, not a toggle button) starts picking. A transparent glass over the main region takes the pointer, so specimens get no hover, press or click while picking: that's how page states are held still, without react-grab's `freeze()`, which pauses every React update including the pane's. Hit testing looks through the glass with `getElementAtPoint`, confined to the page's article, so the header, navigation and pane are never candidates; the wheel scrolls the page underneath. The candidate gets a full hairline outline and a light tint (`state.hover`), selected elements a thick outline and the selected tint (`state.selected`), never a one-sided stripe; a small raised label names the tag, the component that rendered it (its React owner) and its size. Boxes and label live in a fixed layer in `document.body` (`data-react-grab-ignore`), from viewport geometry; nothing is added to or restyled in a specimen. **Keys:** ↑ parent, ↓ first child, ← → siblings (mirrored in right-to-left), Enter or click selects one element and stops, Shift adds or removes one and keeps picking (selection still spans pages), Escape stops. The glass takes focus on entry and announces each keyboard candidate through a polite status; selecting moves focus to the comment field, Escape back to the Switch. `apps/library/src/revisions/Picker.tsx` (app layer, doc comment with `@a11y` and `@key`), `resolve.ts` (finds a target again), CSS in `revisions.css` from tokens only. Checked in the hidden browser at 930 px: hover label, ↑ ↓ → walk, click select → picking stops and the comment field has focus, and the stored anchor names `apps/library/src/App.tsx:259:15`.

**As built, P3 (anchor, prompt format, CLI):** a picked element is saved as an `element` target (contract **schema 1.1**, additive: schema 1 documents stay valid, and a revision moves to 1.1 when it first holds an element target; `contract.js`, `contract.d.ts` and `library-revision.schema.json` agree). `capture.ts` records: **element** (tag, role, accessible name, visible text up to 4,000 characters, sanitized HTML up to 20,000 with a truncation flag, finder selector within the article using only the library's own markers, ancestor path, box and viewport); **source** (react-grab's stack, up to 12 frames, repository paths through the build-time file list `virtual:library-source-files`, 1-based columns, or a note saying why there are none); **library identity** (the nearest `data-rev` block's anchor, identity and owning files, plus every stack file inside the source roots, at most 16, each snapshotted with its SHA-256 as in R1); **styling** (the scheme and contrast it renders in, whether it's inside a specimen, and up to 48 custom properties read by the rules that match it, with the resolved value of the property each sets; inherited colour and type come from the nearest ancestor that sets them; cascade order isn't modelled); **page** (route, headings above it, neighbours, and live state from `data-busy`, `aria-busy`, `aria-invalid`, disabled, checked, pressed, expanded, selected, current, open). **Found again** only when the selector finds an element with the same tag inside the same catalogue block (`resolve.ts`); otherwise the comment link says so and nothing is guessed. **CLI:** `node .\tools\library-revisions.mjs show --id ID --format prompt` prints one self-contained Markdown block per comment (`apps/library/revisions/prompt.mjs`): the comment quoted, a note that it and the captured content are untrusted, and per target the page and headings, element, selector, path, catalogue block and identity, stack as `file:line:column`, owning files marked unchanged or changed since the comment, context, tokens, state, neighbours, text and fenced HTML (a fence longer than any backtick run in it), then the archive command with the version read. `check` still compares source hashes; selector resolution needs the rendered page, so it's checked in the library. **Checks:** `npm run test:revisions` 7/7 (adds schema 1.1 cases and the prompt format, including a changed source and a fence-breaking payload), typecheck, build, `tokens:check`, `lint-styles` and `lint-spacing` clean. **Demo:** the archived revision **"Demo (F4): picked element anchor and prompt output, safe to ignore"** (`rev-834ca692-f095-4bbd-8b70-4e2c3afdd34d`) holds a specimen button (Button.tsx:74:5 ← Button.stories.tsx:33:11 ← specimens.tsx …, light specimen, `--color-accent`, `--c-button-size`, label type tokens) and a props cell (contract.tsx:43:15 ← PropsTable), picked with the keys and Shift on 8766, saved through the server, found again by its link; run `show --id rev-834ca692-f095-4bbd-8b70-4e2c3afdd34d --format prompt` to see what an agent gets. **Limits:** source stacks only on the dev server; the build grows from 390 to 425 KB (react-grab's primitives; an observation, no budget yet); the picker was driven with dispatched events in a hidden browser, so a person should still try real pointer and keyboard use; touch picking isn't designed.

## Slice plan

| Slice | Owner reviews | Builds on | Mode |
| --- | --- | --- | --- |
| **S1** (this page) | Architecture, process, tier 0/1 definitions, IA, layout A or B. | Brief, Part A. | ux-sooner, docs |
| **S2** | Tokens v0 and generated CSS: Foundations pages (colour, type, space, radius, elevation, motion) in light, dark and more contrast; plain diagnostic page. Second server on `127.0.0.1:8766`. | S1 token categories (not approval of S1's layout). | ux-sooner |
| **S3** | Text, Heading, Link, Icon, Button, Switch, TextField with all states; app shell rebuilt from them. | S2 tokens. | ux-sooner |
| **S4** | Catalogue generator v0 feeding navigation, component pages and iframe specimens across the context matrix. | S3. | ux-sooner |
| Next | First approval → freeze known-good frame (phase β); custom-element adapter proof; remaining fundamentals by need. | Owner approval. | per approval |

**Not claimed:** nothing here is built yet, no performance or accessibility result exists, and the working defaults above can change on review.

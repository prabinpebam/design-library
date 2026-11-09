# Consumer guide: audit and structure (Q76)

> **TL;DR:** The library already has most of what a consuming agent needs (a JSON content contract with schemas and a check that names the fix, versioned token sources with generators and checks, a preset model, material and motion frameworks), but it is written for the people building the library, not for someone using it. It lives in the Slate docs and the root `AGENTS.md`, which a consuming agent never reads; the component catalogue is built inside the library app, so there is no machine-readable index; and several seams (presets, the type, space, shape and material stores) live in the library app instead of the core. This page lists 18 gaps and proposes where the agent guide, the generated index and the human docs go. Working default for review (F15.G1), not approved.

Owner's words, 2026-11-09 06:31 +05:30 (DoD Q76): *"This Design library is supposed to be consumed by AI agents. Do we have an extensive framework, guideline on how the Agent is supposed to be using this to integrate with their website or app. We need that. There should be clear instructions as to how to create a schema, how to customize tokens, fundamental and compound components, lauouts and how to use a template propely. Let's get that set up properly, primarily for AI agents and then in the documentation for Human consumptions also. Humans will use it mostly to understand how this Design library works."*

## Who reads what

| Reader | Arrives with | Needs, in order | Reads today |
| --- | --- | --- | --- |
| **Consuming agent** (primary) | A product to build, a repository open, this library as a dependency | 1. Where the instructions are. 2. The rules it must never break. 3. One task's steps with the commands that prove each step. 4. Exact names: components, props, block types, tokens, layouts, presets. | Nothing aimed at it: the root `AGENTS.md` governs building the library; Foundation mixes architecture, decisions and history. |
| **Person learning the library** | Curiosity or a decision to adopt it | How it's put together (tiers, data-driven views, tokens and presets, materials, motion, templates), with links to try each idea in the library app | Foundation, Materials, Motion and the library app: accurate but long and decision-oriented |
| **Library maintainer** | A change to make | The architecture and its decisions | Foundation, the brief, the work plan (unchanged by Q76) |

## What exists

| Area | What's there | Where | Fit for a consumer |
| --- | --- | --- | --- |
| Tiers | Tokens, about 47 fundamentals, 55 compounds, 8 layouts and 7 templates, each with a test for what belongs | [Foundation › Tiers](foundation.md#tiers-what-belongs-where) | Good rules; buried among decision history |
| Content and templates (Q64) | Pure-JSON content, manifests, one renderer (`TemplateView`), 26 core block types, template-scoped custom parts, an "Adding a template" list for agents | [Foundation › Templates](foundation.md#templates-content-and-customization), `packages/core/render`, `packages/core/schemas`, `packages/templates` | The strongest part; written for adding a template **inside this repository** |
| Schemas | `template.schema.json`, `content.schema.json`, `blocks.schema.json`, `assets.schema.json`; application records generated from `types.ts` by `npm run content:schemas` | `packages/core/schemas`, each template's `content.schema.json` | Exported (`./schemas/*`); no guide says which one to start from |
| Validation | `check:content` (file · JSON pointer · what's wrong · how to fix), `tokens:check`, `check:views`, `check:parts`, `check:materials`, `check:motion`, `typecheck`, library build | root `package.json` | Good messages; all hard-wired to this repository's folders |
| Tokens | DTCG source, colour config and generator, space and shape options, contexts, template tokens aliasing semantic roles | `packages/core/tokens`, `tools/*.mjs`, `npm run tokens` | Changing the theme means editing the library's own source; no consumer theme file |
| Presets (Q70) | Store and API in core; six categories; five built-in globals | `@design-library/core/presets`, `presets.json`; categories registered in `apps/library/src/data/presets.ts` | Core holds the model, but the categories and their stores are app code a consumer would have to copy |
| Materials (Q73) | Ten roles, the frosted setting, add-on seams | [Materials](materials.md), `css/materials.css` | Framework is complete; the switch's store is app code |
| Motion (Q65) | Principles M1–M13, tokens, `Morph`, `Reveal`, `suspendMotion` | [Motion](motion.md), `@design-library/core/motion/*` | Reads as a framework; no "when building a screen, use…" summary |
| Catalogue | Props, defaults, doc tags, tokens read, uses and used-by, for core and template parts | `apps/library/src/data/catalogue.ts` (built inside the library app at run time) | **Not available outside the app**: no file an agent can read or grep |
| Library pages | A page per token category, component, layout and template screen, with stories and contexts | `http://127.0.0.1:8766/` | Great for people; an agent can't query it |
| Package exports | `./react`, `./render`, `./presets`, `./fonts`, `./icons`, `./colour`, `./css/*`, `./tokens/*`, `./schemas/*`, `./motion/*` | `packages/core/package.json` | TypeScript source, not built output; private packages, not published |

## Gaps

| # | Gap | Severity | Fix (packet) |
| --- | --- | --- | --- |
| G1 | No agent guide where a consuming agent looks: nothing inside `packages/core` explains how to use it | High | Ship `packages/core/AGENTS.md` (G2) |
| G2 | No machine-readable index of components, props, block types, tokens, layouts, templates, presets and schemas; the catalogue exists only inside the library app | High | Generate `packages/core/agent/index.json` from source with a `--check` drift guard (G2) |
| G3 | No install and integration steps: which packages, which CSS entry, which imports, which bundler settings, what's required versus optional (fonts, icons, presets) | High | Guide step 1 (G3) |
| G4 | The packages are private TypeScript source: a consumer needs a bundler that compiles TSX from a workspace or a linked folder; nothing says so | High | State the supported integration (an app inside this workspace, or a linked folder with Vite and React) and its limits in step 1 (G3) |
| G5 | Theme customization edits the library's own token source; no guide says which files a consumer changes, which are generated, and which command proves it | High | Guide step 3, by category (G4) |
| G6 | Presets need six category registrations that live in the library app | Medium | Document the registration; propose moving the stores into core as a later build item, not in this scope |
| G7 | "Customize a component" has no consumer procedure: sealed components, `data-*` pass-through, variants, slots and component tokens are scattered | High | Guide step 4: the seam ladder, from a prop to a template part (G4) |
| G8 | No rule for which layout to pick, or how to make a page layout outside a template | Medium | Guide step 5 with the layout table from the index (G5) |
| G9 | "Use a template" and "adapt a template" aren't separated: copying a template, renaming its namespace and replacing its content has no steps | High | Guide step 6 (G5) |
| G10 | Content schemas: how to choose regions versus a record, how to write a record type and generate its schema, how to read `check:content` failures | Medium | Guide step 2 (G3) |
| G11 | The checks assume `packages/templates/*`; a template elsewhere isn't checked | Medium | Say so in the guide; keep templates in `packages/templates` for now |
| G12 | Rules (no styles in views, no forks, semantic tokens only, accessibility) are spread over the root `AGENTS.md`, Foundation and skills | High | One "Never" list at the top of the guide (G2) |
| G13 | No vocabulary map: block, region, record, part, seam, preset, context, material | Medium | A glossary in the guide and the human page (G2, G6) |
| G14 | No human page explaining how the library works end to end; Foundation is decision-oriented | Medium | A Slate page "How the library works" (G6) |
| G15 | Nothing proves a cold agent can follow it | High | Cold walkthrough, gaps fixed (G7) |
| G16 | Library app URLs are the only way to see a component in context; the guide must name them without depending on a running server | Low | Index lists each part's library page path; the guide treats the server as optional |
| G17 | Motion and material guidance for screen builders isn't summarized | Low | One table each in guide step 4 and the human page |
| G18 | Index and guide could drift from source | High | Generated index plus `--check`; the guide names only exports the index lists |

## Proposed structure

```text
packages/core/
  AGENTS.md                 the agent guide: what this is, the Never list, the six tasks, each with steps, do/don't and checks
  guide/
    1-install.md            install and integrate into a website or app
    2-content.md            write a content or view schema (JSON) and its content
    3-tokens.md             customize tokens: presets, categories, colour config, space and shape, materials, motion
    4-components.md         customize fundamentals and compounds through public seams (never forks)
    5-layouts.md            use a layout, or add one inside a template
    6-templates.md          use a template, then adapt one as your own
  agent/index.json          generated: components (tier, props, defaults, tokens, a11y, keys), block types, layouts,
                            templates and their layouts, token roles, presets, schemas, exports, commands
tools/agent-index.mjs       writes the index from source; --check fails when it's stale (npm run agent:index, agent:index:check)
docs/how-it-works.md        the human page (Slate): the same model explained for people, linking into the library app
```

| Decision | Choice | Why |
| --- | --- | --- |
| Where the guide lives | `packages/core/AGENTS.md`, beside the code, shipped with the package | Agents read the nearest `AGENTS.md`; it travels with `node_modules/@design-library/core` or a linked folder. A consumer's own `AGENTS.md` gets one line pointing to it (step 1). |
| One file or several | A short `AGENTS.md` (rules and the task map) plus one file per task in `guide/` | An agent loads only the task it's doing; each file stays readable in one pass. |
| The index | Generated JSON, not hand-written; one file | Can't drift (G18); greppable; the same reader as the library's catalogue, moved to a Node tool. |
| Skill form | Not now: `AGENTS.md` is read by every agent host; a skill adapter can point to it later | Avoids a second copy (no redundant variants). |
| Human docs | One new Slate page, `how-it-works.md`, explaining the model; Foundation stays the architecture record | People need understanding, not a second set of steps; the page links to the guide for steps. |
| Mode | Strict design: the guide, the index generator and the human page are built; checked with the build, typecheck and static checks only | Owner mode 2026-11-07 20:13 |

## Build plan

| Packet | Delivers | Reviewable as |
| --- | --- | --- |
| **G2** | `packages/core/AGENTS.md` (Never list, glossary, task map) and the generated `agent/index.json` with `npm run agent:index` and its `--check` | The guide file and the index |
| **G3** | Guide steps 1 (install and integrate) and 2 (content and schemas) | The two step files |
| **G4** | Guide steps 3 (tokens) and 4 (components through seams) | The two step files |
| **G5** | Guide steps 5 (layouts) and 6 (templates: use, then adapt) | The two step files |
| **G6** | Slate page "How the library works" | The page in the docs reader |
| **G7** | Cold walkthrough: following only the guide, a new page from a schema with a custom preset; gaps recorded and fixed | The example, the walkthrough log and the fixes |

## As built

**F15.G2 (2026-11-09, about 07:05):** the guide's entry and the generated index.

- **`packages/core/AGENTS.md`**: what the library is (tiers), where to find exact names, the eight "Never" rules, the seam ladder (prop → slot → context attribute → theme → template part → core change), the task map to the six step files (written in G3–G5), the checks by what changed, and the glossary. Exported as `@design-library/core/AGENTS.md`.
- **`packages/core/agent/index.json`** (generated, about 330 KB): package exports, commands, rules, the React adapter's exported values and types, 113 components (47 fundamentals, 55 compounds, 8 layouts, 3 template parts) as name, tier, family, summary, import, required props and library page; 26 block types with their fields; the layouts content may name; 7 templates with their layouts, regions, accepted blocks and standalone addresses; 252 semantic token roles with CSS variable, light and dark values and description; component tokens by component; the presets of all six categories and the five global presets; 84 icon names; the schemas.
- **`packages/core/agent/components/{Name}.json`** (generated, one per component and template part): every prop with type, default and comment, the component's own type aliases (so `ButtonSize` reads as its seven sizes), accessibility notes, keys, markup selector, tokens read, uses and used by.
- **`npm run agent:index`** writes both; **`npm run agent:index:check`** fails, naming each stale file, when the source has moved on. The parser is the library catalogue's (`apps/library/src/data/catalogue.ts`), run in Node, so the app and the index read source the same way. The index is split (one summary, one file per component) because a single file was about 790 KB, too large for an agent to load.

Gaps closed: G1, G2, G12, G13, G18 (in part: the guide names only what the index lists once the step files are written).

**F15.G3 (2026-11-09, about 07:20):** guide steps 1 and 2 in `packages/core/guide/`.

- **`1-install.md`**: what you get (TypeScript source, private workspaces), what you need, the two ways an app can live (inside this repository, supported; a separate repository linking the packages, possible but not yet proven), ten steps from `package.json` to contexts (workspace entry without globs, Vite `fs.allow`, tsconfig, one CSS import, a first screen from layouts and components, app-wide hosts, optional fonts through the one loader, scheme and contrast attributes), do and don't, and the checks.
- **`2-content.md`**: regions of blocks or a record, writing a layout's content from the index, shared regions, a template's `content.schema.json`, a custom block type (schema, manifest and registry kept equal), application records through `types.ts` and `npm run content:schemas`, the content rules, rendering with `TemplateView` in your own app, versions, and the checks.

Found while writing (fixed in the guide, open in the tools): `npm run content:schemas` keeps its template-to-record map in the tool itself, so a new application template means editing `tools/content-schemas.mjs` (G19); `check:content` needs `sections` with 3–5 items per group (Q67), so the smallest valid template is a home and two sections of at least three screens each, planned ones counting (G20; Step 6 will say it); the migration command is described in Foundation but not built (G21).

**F15.G4 (2026-11-09, about 07:35):** guide steps 3 and 4.

- **`3-tokens.md`**: two levels, theme (config files and `npm run tokens`, library-wide) and run-time choice (attributes and the core loaders, per app); per category the file to edit, its rules and the command that proves it (colour with its contrast gate, space, shape, type, motion, a template's own tokens); run-time choices for space, shape, material, density, icons, type and colour; the presets API (register, apply, save, the dialog's parts); do and don't; checks.
- **`4-components.md`**: why no forks, then the seam ladder in seven steps (prop or variant, slot, context attribute, theme, composing without styles in the app, a custom part inside a template with its six steps, a core change), do and don't, checks. Examples use only props, icons and tones the index lists.

Found while writing: run-time colour and type choices need the stores in `apps/library/src/data/` (G6, confirmed: the guide points to them to copy); the theme's fonts are set in `tokens.json` by hand (no type config generator yet, as Foundation says).

**F15.G5 (2026-11-09, about 07:50):** guide steps 5 and 6; the six steps are all written.

- **`5-layouts.md`**: the eight layouts with what each is for, its regions and what it's not for; arranging inside a region (Stack, Cluster, Grid, Section, ScrollArea); a layout in JSX; a layout from content (SiteLayout bound by core, others bound in a template's registry, what a binding receives); making a layout of your own; do and don't; checks.
- **`6-templates.md`**: the seven templates and what to start from; using one as it is (content and tokens only); adapting one as your own (copy, rename the namespace in every place, register, reshape with the 3–5 grouping rule and the content folders it implies, states, custom parts); starting from nothing with the `index.ts` loader; do and don't; checks.
- **Index fix:** a component's main props are now its `{Name}Props`, `{Name}Base` or `DataAttributes` interface (Hero listed its picture props first), and only one-line type aliases are copied (a multi-line union came out cut).

**F15.G6 (2026-11-09, about 08:05):** the human page, [How the library works](how-it-works.md), listed just before Foundation in the docs navigation. It leads with a diagram (content JSON → renderer → templates, layouts, compounds, fundamentals on tokens; host colours, checked in light and dark, structure validated with Slate's SVG validator), then the tiers with their tests, sealed components and the order of seams, screens from data (regions or a record, checked before render), tokens, contexts and presets, materials and motion in a paragraph each with links to their framework pages, templates and customization, the checks that keep it true, and where agents start. Known limit: the diagram scales down on a phone without a narrow composition; the tiers table under it carries the same facts.

## Cold walkthrough (F15.G7)

**F15.G7 (2026-11-09, about 07:05).** Following only `packages/core/AGENTS.md` and its guide, a small product was built from nothing: the app **`apps/example/`** (Harbour Books, its own workspace) renders the home of a new template **`packages/templates/harbour/`** (one screen built from content JSON with core blocks, six planned) and applies a custom **Harbour** preset (loose space, soft shape, solid material) through the core preset store. Open it in the library's standalone site at [site.html#/app/harbour/home](http://127.0.0.1:8766/site.html#/app/harbour/home), or run `npm run dev -w apps/example` (port 8767) to see it in its own app with the preset. Checks: `npx tsc -p apps/example --noEmit`, `npm run build -w apps/example`, `npm run check:content` (8 templates, 174 files, valid), `npm run typecheck`, `npm run agent:index:check`; `check:views` reports only the existing styled element in `packages/core/render/blocks.tsx`.

| # | Step | Where the guide fell short | Fixed |
| --- | --- | --- | --- |
| W1 | 6 Templates | No complete manifest to start from nothing; required keys had to be pieced together | A full smallest valid `template.json` (Harbour's) in Step 6 |
| W2 | 6 Templates | The grouping rule was wrong ("two sections of three screens each" fails: a flow of three screens counts as one item of its section) | Rule restated precisely, with a valid smallest shape |
| W3 | 2 Content | `SiteLayout` content needs `settings.current`; neither the guide nor the index said a layout has required settings | Index lists `layouts.settings` (from the core schema); Step 2 has a step for it and the example sets it |
| W4 | 2 Content | Block fields that are lists of objects showed only "object[]", so `site-footer` sections' required `id` was a guess | Index now spells nested fields out (`{ id: string; heading: text; links: link[] }[]`) |
| W5 | 2 Content | `@design-library/templates` bundles every template (800 kB of script for one page) | The templates package exports each template (`@design-library/templates/{id}`); the guide imports just one (380 kB) |
| W6 | 3 Tokens | The presets steps sent you to copy the library app's stores; no small example | The smallest working custom-preset example (identical to `apps/example/src/look.ts`, so it's compiled) |
| W7 | 2 Content | Straight apostrophes passed `check:content`; the copy rule wants curly ones | The guide says so; a check is left open (it would touch every template) |
| W8 | 5 Layouts | At 320 px, `SiteHeader` with an action scrolls sideways (Harbour 90 px, Corporate 69 px): a core component bug, not the guide | **Open**, outside Q76: a core packet for SiteHeader's narrow width |

What worked first time: Step 1 as written (workspace entry, `npm install` through the proxy, Vite `fs.allow`, tsconfig, one CSS import), `TemplateView` rendering, the content check's messages (each named the file, the pointer and the fix), and the preset store.

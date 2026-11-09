# Step 6: use a template, then adapt one as your own

Goal: a whole product's screens from a template: first by using one as it is, with your words; then by making your own, starting from the nearest one, without touching the core or another template.

## The templates

`agent/index.json` → `templates[]` lists each with its layouts, regions, accepted blocks and standalone address. Open any at `https://prabinpebam.github.io/design-library/site.html#/app/{template}/{layout}`. Their files are in `node_modules/@design-library/templates/{template}/`.

> **Your templates live in your project**, one folder each under `src/templates/{id}/`, with `src/templates/index.ts` listing them. Never edit a template inside `node_modules`: copy it into your project first.

| Template | Kind | Shape | Start from it for |
| --- | --- | --- | --- |
| `corporate` | Company site: home, about, services, careers, contact, account, help | Regions of core blocks | A marketing or company site |
| `portfolio` | One person's work | Regions | A personal or studio site |
| `blog` | Articles, lists, an author, subscribing | Regions | Publishing, news, documentation-like reading |
| `conference` | An event: programme, speakers, tickets, sponsors; has custom parts | Regions + its own blocks and layout | Anything that needs a custom part (the worked example) |
| `chat` | An AI assistant | A record in `ChatLayout` | A conversational product |
| `design` | A design tool editor | A record in `EditorLayout` | A canvas or builder |
| `projects` | Project management: board, backlog, issue | A record in `AppLayout` | A working tool with lists and details |
| `harbour` | A bookshop's home, the guide's worked example (one screen built, six planned) | Regions of core blocks | The smallest valid template, to copy |

## Use a template as it is

1. **Pick the template** by the table above and open its screens in the hosted library (Templates section) or as standalone sites.
2. **Render it unchanged** to see it in your app: `import corporate from '@design-library/templates/corporate'` and `<TemplateView template={corporate} layout="home" />` (Step 2, "Render it").
3. **To change its words, copy it** into `src/templates/{template}/` (the whole folder) and change only content there: the JSON in `content/` (Step 2). Words, links, pictures (add files to `assets/` and ids to `assets.json`, with alt text), which blocks each page shows.
4. **Theme it** (Step 3): templates take the library's colour, type, icons, space, shape and material, and follow presets live.
5. **Render your copy** with `TemplateView` (import it from `./templates/{template}`), fixing its `index.ts` as in "Start a template from nothing" below (`loadTemplate` from `@design-library/core/render`).
6. **Check:** `npx design-library-check-content --templates src/templates`, then open each screen you changed in light, dark and more contrast.

A copy that keeps the library's id stays a copy of that template; to make it yours, adapt it as below.

## Adapt a template as your own

Copy the nearest template into a new namespace and change it there. Never edit core, and never import another template's parts.

1. **Choose an id:** lower case, one word or kebab case, unique (`harbour`). It is the namespace of everything in the template.
2. **Copy the folder** `node_modules/@design-library/templates/{nearest}/` to `src/templates/{id}/`.
3. **Rename the namespace everywhere** in the new folder:

   | Where | Change |
   | --- | --- |
   | `template.json` | `id`, `title`, `summary`, `version` to `0.1.0` |
   | `content.schema.json` | `$id` to `https://design-library.local/templates/{id}/content/1`, `title`, `description`; custom block `const` types to `{id}.…` |
   | Every content file | `"template": "{id}"` |
   | Custom parts (if any) | Manifest `parts` names `{id}.{Name}`, block types `{id}.{name}`; `data-dl="{id}-{part}"` in TSX and CSS; tokens `t.{id}.*` in `tokens/tokens.json` and `--t-{id}-*` in CSS; story `component: '{id}.{Name}'` |
   | `registry.tsx` | Block type keys and layout names to the new namespace |
   | `types.ts` (application templates) | Rename the record types if you like; keep `$defs/record.{layout}` in `content.schema.json` in step with them (Step 2) |
   | `index.ts` | `import { loadTemplate } from '@design-library/core/render';` in place of `'../load'` |

   Then search the folder for the old id; nothing should remain.
4. **Register it** in `src/templates/index.ts`: `import harbour from './harbour';` and add it to an exported `templates` list. Your app renders it with `import harbour from './templates/harbour'`.
5. **Reshape the screens:** in `template.json`, keep, remove or add `layouts` (one per screen: `id`, `title`, `component`, `content`, `regions`), and group them:
   - `home`: the first screen, its content at `content/{home}.json`. It is also listed in one flow (usually the first section's), where it isn't counted.
   - `sections[]`: `{ id, title, summary, flows: [{ id, title, summary, screens: [layout ids] }] }`. Every screen sits in exactly one flow.
   - **Grouping rule (checked):** every group holds **3 to 5 items**. The top level's items are the home, each section, and "Own parts" if you have custom parts. A section's items are its flows of three or more screens (each counts as **one** item, a group of its own) plus every screen of its shorter flows (each counts one); the home doesn't count. Each flow of three or more screens also holds 3–5 screens. Screens you haven't built yet count: list them as layouts with `"planned": true` and no content file. The smallest valid shape is a home plus two sections of three items each, for example section A with flows `[home, a, b]` (2 items) and `[c]` (1 item), and section B with flows `[d]` and `[e, f]`. A full example is below.
   - Content files live by group: `content/{home}.json`; `content/{section}/{layout}.json` for a flow of one or two screens; `content/{section}/{flow}/{layout}.json` for a flow of three or more. The check names the right path when one is wrong.
   - A state of a screen (a form's error, a list's empty state) is a layout with `stateOf` and a content file holding only `settings.state`.
6. **Write the content** for each built layout and `content/shared.json` (Step 2).
7. **Add custom parts** only where no core part fits (Step 4, step 6), each with tokens and stories.
8. **Check and open:** run the checks below, then open the screen in your app.

### Start a template from nothing

Same as adapting, starting from an empty folder. The worked example is `node_modules/@design-library/templates/harbour/` (one built screen, six planned), shown by [`apps/example`](https://github.com/prabinpebam/design-library/tree/main/apps/example) in the library repository.

**`template.json`**, the smallest valid manifest (required: `id`, `version`, `title`, `summary`, `contentSchema`, `contentVersion`, `layouts`, `sections`):

```json
{
  "$schema": "../../../node_modules/@design-library/core/schemas/template.schema.json",
  "id": "harbour",
  "version": "0.1.0",
  "title": "Harbour Books",
  "summary": "A small bookshop’s site: what’s new, the shop and how to visit.",
  "contentSchema": "content.schema.json",
  "contentVersion": 1,
  "shared": "content/shared.json",
  "assets": "assets.json",
  "home": "home",
  "sections": [
    { "id": "shop", "title": "Shop", "summary": "Find a book and reserve it.", "flows": [
      { "id": "browse", "title": "Browse", "summary": "See what’s new and open a book.", "screens": ["home", "new-books", "book"] },
      { "id": "reserve", "title": "Reserve", "summary": "Hold a book to collect in the shop.", "screens": ["reserve"] } ] },
    { "id": "visit", "title": "Visit", "summary": "Find the shop and its events.", "flows": [
      { "id": "find", "title": "Find the shop", "summary": "Opening hours and the way there.", "screens": ["visit"] },
      { "id": "events", "title": "Events", "summary": "Readings and the book club.", "screens": ["events", "event"] } ] }
  ],
  "layouts": [
    { "id": "home", "title": "Home", "component": "SiteLayout", "content": "content/home.json",
      "regions": [
        { "id": "header", "shared": true, "accepts": ["site-header"] },
        { "id": "main", "accepts": ["*"] },
        { "id": "footer", "shared": true, "accepts": ["site-footer"] } ] },
    { "id": "new-books", "title": "New books", "component": "SiteLayout", "planned": true },
    { "id": "book", "title": "Book", "component": "SiteLayout", "planned": true },
    { "id": "reserve", "title": "Reserve a book", "component": "SiteLayout", "planned": true },
    { "id": "visit", "title": "Visit", "component": "SiteLayout", "planned": true },
    { "id": "events", "title": "Events", "component": "SiteLayout", "planned": true },
    { "id": "event", "title": "Event", "component": "SiteLayout", "planned": true }
  ]
}
```

Then `content.schema.json` (Step 2), `content/home.json` and `content/shared.json` (Step 2), `assets.json` (`{ "$schema": "../../../node_modules/@design-library/core/schemas/assets.schema.json", "assets": {} }`, pictures in `assets/`) and `index.ts`:

```ts
import type { StoryFile } from '@design-library/core/react';
import manifest from './template.json';
import assets from './assets.json';
import { loadTemplate } from '@design-library/core/render';
// import { registry } from './registry';   only with custom blocks, a bound layout or custom parts

export default loadTemplate(
  manifest,
  import.meta.glob('./content/**/*.json', { eager: true, import: 'default' }),
  assets,
  import.meta.glob('./assets/*', { eager: true, query: '?url', import: 'default' }),
  undefined, // registry
  Object.values(import.meta.glob<StoryFile>('./parts/*/*.stories.tsx', { eager: true, import: 'default' })),
);
```

## Do and don't

| Do | Don't |
| --- | --- |
| Change words and facts in content JSON | Change words in a template's TSX or a core component |
| Keep every custom name in the template's namespace | Reuse another template's id, parts or tokens |
| Start from the nearest template and remove what you don't need | Fork core layouts or blocks into the template |
| Plan screens you'll build later as `planned` layouts | Leave a screen in no flow, or in two |
| Raise `contentVersion` with a migration when the content's shape changes (Step 2) | Rename a block key and leave old content unchanged |

## Check it

| Check | Proves |
| --- | --- |
| `npx design-library-check-content --templates src/templates --index src/templates/index.ts` | Manifest, grouping (3–5 per group), file locations, schema, content, pictures, links and parts are all valid; the template is registered |
| `npx tsc --noEmit` | The registry, bindings and parts compile |
| `npx vite build`, then open each built screen | Every built screen renders, in light, dark and more contrast, at 320 px and wide |
| Read custom parts and their `tokens/tokens.css` against Step 4's rules | Tokens read semantic roles only; no styles in bindings; parts by child paths |

In the library repository, its templates live in `packages/templates/`, are listed in `packages/templates/index.ts`, and use `npm run check:content`, `npm run tokens`, `npm run tokens:check`, `npm run typecheck`, `npm run check:views`, `npm run check:parts`, `npm run agent:index` and `npm run build -w apps/library` (then open `site.html#/app/{id}/{layout}`).

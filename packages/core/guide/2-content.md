# Step 2: write a content schema and its content (JSON)

Goal: screens drawn from pure JSON. Content is checked against a schema before anything renders, and a mistake fails with the file, the JSON pointer and the fix.
> **Paths:** `agent/…`, `schemas/…` and `guide/…` are inside the installed package (`node_modules/@design-library/core/`); your templates live in your project, here `src/templates/{id}/`. Commands marked *library repository* run only there.


## How it fits together

```text
template.json        the manifest: layouts, their regions, which block types each region accepts, sections and flows
content.schema.json  this template's schema: the core envelope, plus its own block types or application records
content/*.json       one file per layout: { template, layout, contentVersion, regions | record, settings }
assets.json          pictures by id, each with alt text
        │
        ▼  TemplateView (@design-library/core/render)
layout component → each region's blocks → registry → components → tokens
```

Pick the shape for each layout:

| Shape | Use when | Content holds | Schema comes from |
| --- | --- | --- | --- |
| **Regions of blocks** | A document: a site page, an article, a form, a status page | `"regions": { "main": [ { "type": "hero", … } ] }` | The core block set (`blocks.schema.json`), plus the template's own block types |
| **A record** | An application: a chat's threads, a board's issues, an editor's document | `"record": { … }` typed for that layout | `$defs/record.{layout}` in the template's `content.schema.json` (in the library repository generated from `types.ts` by `npm run content:schemas`) |

## Write content for a layout (regions of blocks)

1. **Find the layout** in `agent/index.json` → `templates[].layouts[]`: its `content` path and its `regions` with the block types each `accepts` (`*` means any registered type).
2. **Find each block's fields** in `index.json` → `blocks[]` (`type`, `fields`, which are required, and each field's shape; a list of objects shows its keys, `?` marking the optional ones). `text` is plain words, `asset` an id from `assets.json`, `href` a link, `icon` an icon name from `index.json` → `icons`, `actions` a list of `{ label, primary?, href }`: `href` is where it goes (`"/layout"` for a layout of this template, checked; `"#id"` for a heading on the page; or an address), drawn as a link that looks like a button. An example that leads nowhere yet uses `says` instead (what the page says when it's pressed).
3. **Find the layout's settings** in `index.json` → `layouts.settings[]`: some layouts need them. `SiteLayout` requires `"settings": { "current": "{layout id}" }` (the header place shown as current); `width` and `state` are optional.
4. **Write the file** at the layout's `content` path:

   ```json
   {
     "$schema": "../content.schema.json",
     "template": "harbour",
     "layout": "home",
     "contentVersion": 1,
     "settings": { "current": "home" },
     "regions": {
       "main": [
         { "type": "hero", "eyebrow": "Open every day", "title": "Books for slow evenings", "lead": "A small shop by the water.",
           "actions": [{ "label": "See new books", "primary": true, "says": "New books open here once that page is built." }], "picture": "shopfront" },
         { "type": "cards", "heading": "New this week", "items": [{ "title": "The Long Shore", "description": "A quiet novel about a lighthouse keeper." }] }
       ]
     }
   }
   ```

   Set `$schema` to the relative path of the template's `content.schema.json` so editors check as you type. Write curly apostrophes and quotes (’ “ ”) in words people read; the check doesn't catch straight ones.
5. **Shared regions** (a site's header and footer) go once in `content/shared.json` with `"shared": true` in place of `"layout"`, never in each page.
6. **Run `npx design-library-check-content --templates src/templates`** (library repository: `npm run check:content`) and fix every line it prints (`file · /json/pointer · what's wrong · how to fix`).
7. **Content outside a template** (a site's own pages, talks or settings in JSON): give each file a `$schema` (a path relative to the file, or a core schema `$id`) and add `--content src/content` (repeat it for each folder). Every file under it that names a `$schema` is checked against it, with the same no-markup rule; files without one are skipped. Add `--src src` to also warn when a template's screens are never rendered (no file imports the template, or none uses `TemplateView`). Warnings don't fail the run during the Beta; `--strict` makes them fail.

## Write a template's content schema

Every template has `content.schema.json` beside its manifest. Its `$id` must end in `/{template}/content/{contentVersion}`, and it `$ref`s the core envelope:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://design-library.local/templates/harbour/content/1",
  "title": "Harbour Books content, version 1",
  "description": "Every content file of this template: the core envelope and core blocks.",
  "$ref": "https://design-library.local/core/content/1",
  "$defs": {}
}
```

**Using only core blocks?** Stop here: `$defs` stays empty.

**A block type of your own** (only when no core block fits; see [Step 4](4-components.md)): add a `$defs` entry with `"type": { "const": "{template}.{name}" }`, `required`, `"additionalProperties": false` and plain-data properties; list it in the manifest's `parts.blocks` as `{ "type": "harbour.opening-hours", "schema": "#/$defs/openingHours", "renders": "harbour.OpeningHours" }`; map it in the template's `registry.tsx` `BLOCKS`. The check fails if the schema, the manifest and the registry disagree. Worked example: `node_modules/@design-library/templates/conference/` (`conference.countdown`, `conference.sponsor-wall`).

**An application record:** write the record's TypeScript type in the template's `types.ts`, and its JSON Schema as `$defs/record.{layout}` (or `record.shared`) in `content.schema.json`, keeping the two in step: same properties, `required` and `"additionalProperties": false`. (In the library repository the schema is generated: add `{template}: { {layout}: 'YourType' }` to `records` in `tools/content-schemas.mjs` and run `npm run content:schemas`; never hand-edit a generated one there.) Worked examples: `chat`, `design`, `projects`.

## Rules for content

| Allowed | Never |
| --- | --- |
| Plain text, numbers, booleans, values from an enum | HTML, Markdown, CSS, class names, `style` keys |
| Ids: an asset (`"picture": "shopfront"`), an icon (`"mark": "organisation"`), a layout of the same template (`"href": "/about"`), an outside address (`https://…`) | Colours, sizes, pixel values, durations, component names |
| Inline code between backticks, the only mark inside text | Functions, expressions, template strings (`${…}`, `{{…}}`) |
| Every word a person reads, including button labels and messages | Words left inside a component for content to override |

Copy rules (sentence case, buttons a verb first in 3 words or fewer, errors that say how to fix): the `ui-copy` skill, or the words in the existing templates.

## Render it

- **In the library and as a standalone site:** register the template (Step 6); every layout of the library's own templates opens at `https://prabinpebam.github.io/design-library/site.html#/app/{template}/{layout}`.
- **In your own app:**

  ```tsx
  import { TemplateView } from '@design-library/core/render';
  import harbour from '@design-library/templates/harbour';

  export const Home = () => <TemplateView template={harbour} layout="home" hrefFor={(_t, layout) => `#/${layout}`} />;
  ```

  Import the one template you render (`@design-library/templates/{id}`), not the package's list of all of them, which bundles every template. `hrefFor` turns a `/layout` link in content into your app's address. Working app: [`apps/example`](https://github.com/prabinpebam/design-library/tree/main/apps/example) in the library repository.

## Change the shape later

A change old content no longer satisfies (a renamed key, a split block) raises `contentVersion` in the manifest and the schema's `$id`, and needs `migrations/{n}-to-{n+1}.mjs`: a pure function from old JSON to new. Additions old content still satisfies (a new optional key, a new block type) keep the version. The migration command is planned, not built yet; until it exists, update every content file of the template in the same change.

## Check it

| Check | Proves |
| --- | --- |
| `npm run content:schemas` (*library repository*) | Application record schemas match `types.ts` (only when you changed a record type) |
| `npx design-library-check-content --templates src/templates` (library repository: `npm run check:content`) | Every manifest, schema, content file, picture and link is valid; registry and schema agree; no markup in words; warns about part files the manifest doesn't list |
| `npx design-library-check-content --templates src/templates --content src/content --src src` | Also: every JSON file under `src/content` that names a `$schema` is valid against it; warns about templates whose screens nothing renders |
| `npx tsc --noEmit` | The registry and any record bindings compile |
| Open `site.html#/app/{template}/{layout}` | The screen draws, in light, dark and more contrast |

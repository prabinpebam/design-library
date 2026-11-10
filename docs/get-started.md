# Get started (technical)

> **TL;DR:** The library is two packages, `@design-library/core` and `@design-library/templates`, released as tarballs on [GitHub releases](https://github.com/prabinpebam/design-library/releases) under the MIT licence; there is no registry package. A React 19 + Vite 8 app installs both by URL with npm 10 or later, imports `css/index.css` once, builds screens from layouts and components (or renders a template from JSON with `TemplateView`), and sets its look with `@design-library/core/theme`. Checks: `npx design-library-check-content`, `npx tsc --noEmit`, `npx vite build`. This page is every step, command and fix; the short version is the library's [Get started](http://127.0.0.1:8766/#/get-started), and an agent's version ships inside the package (`AGENTS.md` and `guide/`). Proven by a fresh project outside this repository ([Handoff readiness](handoff-readiness.md#the-proof-f15r6)).

Owner, 2026-11-09 07:59 ([DoD Q83](definition-of-done.md#owner-instructions)): *"When everything is done, add the get started section in the Design library and a much more detailed and technical version of the same in Slate."*

## What you get, and what it supports

| | |
| --- | --- |
| **Packages** | `@design-library/core`: tokens and their CSS, 113 components (fundamentals, compounds, layouts), the content renderer, presets, fonts, icons, the colour generator, the theme API, the content schemas, the agent guide and index. `@design-library/templates` (optional): eight templates as JSON content with their parts |
| **Form** | TypeScript and TSX source plus CSS, not a built bundle: your Vite build compiles it. No build step of your own |
| **Supported** | React 19 in the browser, bundled by Vite 8 with `@vitejs/plugin-react`, TypeScript with `moduleResolution: "Bundler"` |
| **Not supported in 0.1** | Other bundlers, including Next.js (templates load content with `import.meta.glob` and the React entry exports stories with Vite `?url` media); server rendering (not proven); Vue, Svelte, Angular or plain HTML (the CSS and tokens work anywhere, the components are React); React 18 |
| **Licence** | MIT, copyright Prabin Pebam: `LICENSE` in each package. Fonts are OFL-1.1 packages installed beside it; icon subsets MIT or Apache-2.0 |
| **Requirements** | Node 20.19 or later, **npm 10 or later** (`npm -v`) |

## Distribution and versions

- **Where:** each version is a release `v{version}` in [prabinpebam/design-library](https://github.com/prabinpebam/design-library/releases) with two assets, `design-library-core-{version}.tgz` and `design-library-templates-{version}.tgz`. They are built by `npm run pack` ([tools/pack.mjs](https://github.com/prabinpebam/design-library/blob/main/tools/pack.mjs)) from the commit the release points at; packing refuses a stale agent index or stale colour declarations.
- **Not on a registry:** the packages are marked `private`, so `npm publish` refuses them. Install them by URL (or by file path); never by name alone, which asks your registry for a package that isn't there.
- **Together:** templates depends on the core of the same version (`"@design-library/core": "{version}"`). Install both in one command from the same release.
- **Versioning:** `MAJOR.MINOR.PATCH`. While the major is `0`, a minor release may break a public contract and says how to upgrade; a patch never breaks one. Contracts with their own version: the content schemas (`$id …/1`), the colour config (`colour-config/2`) and each template's `contentVersion`. Every change is in `node_modules/@design-library/core/CHANGELOG.md`.
- **Without access to GitHub releases:** clone the repository and run `npm run pack` at its root (Node only, no install needed); the tarballs land in `.packages/`. Install those files by path.
- **Current version:** 0.5.0-beta.1 (Beta, for early trials).

## Step by step

### 1. A Vite + React + TypeScript app

Any folder. `package.json` needs `"type": "module"` and scripts `"dev": "vite"`, `"build": "vite build"`.

### 2. Install

```sh
npm install https://github.com/prabinpebam/design-library/releases/download/v0.5.0-beta.1/design-library-core-0.5.0-beta.1.tgz https://github.com/prabinpebam/design-library/releases/download/v0.5.0-beta.1/design-library-templates-0.5.0-beta.1.tgz react@^19 react-dom@^19
npm install -D vite@^8 @vitejs/plugin-react@^6 typescript@~6.0 @types/react@^19 @types/react-dom@^19
```

Your lockfile records the two release URLs; every other package (React, the twelve `@fontsource-variable` font packages, `ajv` for the content check) comes from the registry your npm is configured for, including an organisation's proxy.

### 3. Configure

`vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({ plugins: [react()] });
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022", "module": "ESNext", "moduleResolution": "Bundler", "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"], "types": ["vite/client"],
    "resolveJsonModule": true, "allowJs": true, "isolatedModules": true, "skipLibCheck": true,
    "strict": true, "noEmit": true
  },
  "include": ["src"]
}
```

The packages are source, so your type check reads them with these settings. `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature` and `verbatimModuleSyntax` aren't supported.

`index.html` with `lang`, a title and `<div id="root"></div>`, loading `/src/main.tsx`.

### 4. The entry

```tsx
// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@design-library/core/css/index.css';
import './look';
import { App } from './App';

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
```

`css/index.css` holds every token, the cascade layers (`reset, tokens, base, fundamentals, compounds, layouts, templates, app, addons`) and every component's styles. Import it once, first.

### 5. Screens from components

```tsx
// src/App.tsx
import { Heading, Notifications, Section, SiteHeader, SiteLayout, Stack, Text } from '@design-library/core/components';

export function App() {
  return (
    <>
      <SiteLayout header={<SiteHeader name="Harbour Books" href="/" links={[{ label: 'Shop', href: '/shop', current: true }]} />}>
        <Stack gap="section">
          <Heading level={1}>Books for slow evenings</Heading>
          <Section heading="New this week" intro="Six books our staff couldn’t put down.">
            <Text>Open a book to read its first chapter.</Text>
          </Section>
        </Stack>
      </SiteLayout>
      <Notifications />
    </>
  );
}
```

- **One layout per page:** `SiteLayout`, `AppLayout`, `ChatLayout` or `EditorLayout`; never one inside another.
- **Arrange with** `Stack`, `Cluster` and `Grid`. **No styles in views:** components have no `className` or `style` props; their look comes from tokens.
- **Props:** every component's contract is `node_modules/@design-library/core/agent/components/{Name}.json` (props with types, defaults and comments, accessibility, keys, tokens).
- **Hosts:** `<Notifications />` once at the root if anything calls `notify()`. Popovers, tooltips and dialogs use the top layer.

### 6. Contexts

The CSS follows the person's system: light or dark, more contrast, reduced motion. To offer a choice, set `data-scheme="light|dark"`, `data-contrast="standard|more"` or `data-motion="reduce"` on `<html>` or any subtree; wrap a scheme change in `suspendMotion(() => …)` from `/react` so colours change in one frame.

## Customization

Three levels; a separate project uses the first two.

| Level | How |
| --- | --- |
| **Your product's theme** | `@design-library/core/theme` and attributes, once at start-up |
| **A person's choice** | The same seams at run time, saved as presets with `@design-library/core/presets` |
| **The library's own theme** | Token configs and `npm run tokens`, in the library repository only (a library change) |

```ts
// src/look.ts
import { applyBrand, applyFonts } from '@design-library/core/theme';

applyBrand({ colours: { 1: { name: 'Tide teal', seed: '#0f766e' }, 2: { name: 'Sand', seed: '#c2410c' } }, accent: 1 });
void applyFonts({ preset: 'editorial' });
document.body.dataset.space = 'loose';
document.body.dataset.shape = 'soft';
```

| Category | API | Values |
| --- | --- | --- |
| **Brand colour** | `applyBrand(brand, el?)` sets `--p-brand-*`, `--p-accent-*` and `--color-brand-*` on `<html>`; `brandCss(brand, selector?)` returns the same as CSS text; `brandVars(brand)` returns the values and the generator's errors; `applyBrand(null)` resets | 1–4 slots, each `{ seed: '#rrggbb', name?, pins? }`; `accent` names the slot actions, links, focus and selection read. Status colours, greys and categories stay the library's |
| **Fonts** | `applyFonts({ preset?, roles?, axes? }, el?)` loads the faces from the installed font packages and sets `--font-*` and `--axes-*`; `fontVars` returns them | Presets `studio` (default), `editorial`, `one-face`, `technical`, `bookish`, `flexible`; faces and roles in the index (`presets.categories.type`) |
| **Space** | `data-space` on `body` | `compact`, `normal`, `loose`, `extra-loose` |
| **Shape** | `data-shape` on `body` | `sharp`, `rounded`, `soft`, `super-soft` |
| **Material** | `data-material` on `<html>` | `frosted` (default), `solid` |
| **Icons** | `await setIconSet(id, style)` from `/icons` | The library's outline set by default; others in `presets.categories.icons` |
| **Density** | `data-density="compact"` passed to a layout or compound | — |
| **Presets** | `registerPresetCategory`, `applyCategoryPreset`, `applyGlobalPreset`, `saveCategoryPreset`… from `/presets` | A category's `set` is one of the seams above |

**Contrast:** the run-time brand isn't measured. Try seeds first on the library's [Colour](http://127.0.0.1:8766/#/colour) page, whose brand editor measures every text, focus and control pair in light, dark and more contrast; keep seeds with no failures, or pin a darker step.

**Beyond the seams:** a prop or variant, a slot, a context attribute, the theme, then a custom part inside your own template (`{template}.{Name}`, tokens `--t-{template}-*` reading semantic roles). Never fork, wrap-and-replace or restyle a core component, and never select `[data-dl=…]` in your CSS. A need two products share becomes a core change in the library.

## Content and templates

- **Render a template unchanged:** `import corporate from '@design-library/templates/corporate'`, then ``<TemplateView template={corporate} layout="home" hrefFor={(_t, layout) => `#/${layout}`} />`` from `/render`. Import the one template you render, not the package's list, which bundles all eight.
- **Make one your own:** copy `node_modules/@design-library/templates/{nearest}/` to `src/templates/{id}/`; rename the namespace (`template.json` `id`, `title`, `summary`, `version`; `content.schema.json` `$id` to `https://design-library.local/templates/{id}/content/1`; `"template": "{id}"` in every content file; custom parts `{id}.{Name}`); in `index.ts`, import `loadTemplate` from `@design-library/core/render`; list it in `src/templates/index.ts`; write the content.
- **Content is pure JSON:** plain words, numbers, enums, ids and links; no HTML, Markdown, CSS, class names, colours or pixel values. Schemas: `node_modules/@design-library/core/schemas/` (`template`, `content`, `blocks`, `assets`).
- **Grouping rule:** every group in a manifest holds 3 to 5 items (home, sections, flows); screens not built yet are listed with `"planned": true`.
- **The check:**

  ```sh
  npx design-library-check-content --templates src/templates --index src/templates/index.ts
  ```

  It validates manifests, assets, content and records against their schemas, every picture id and `/layout` link, the 3–5 grouping and file locations, namespaces, and that no word looks like markup. Each problem prints as `file · /json/pointer · what's wrong · how to fix`.

The package guide's steps 2, 5 and 6 hold the full content model (regions, blocks, records, states, custom block types).

## For AI agents

- **Entry:** `node_modules/@design-library/core/AGENTS.md`: the Never rules, the seam ladder, the task map and the checks. Add this to your project's own `AGENTS.md` so every session finds it:

  ```markdown
  ## UI: Design Library
  This project's UI uses @design-library/core. Before any UI work, read node_modules/@design-library/core/AGENTS.md
  and follow it: its Never rules, the seam ladder, and the task steps in its guide/ folder. No screen is done until it
  passes the adversarial loop in guide/8-review.md, scored by an evaluator who did not build it.
  ```

- **Steps:** `guide/1-install.md` to `guide/8-review.md`.
- **Review every screen:** [the adversarial loop](adversarial-loop.md) (`guide/8-review.md` in the package). The builder creates with part 1 of each framework; an evaluator who didn't build the screen (a fresh agent session or a person) runs every probe the package ships (`@design-library/core/probes/{name}.js`, loaded with `page.addScriptTag({ path })` or pasted into the browser console) and scores every part 2 row with evidence; fix each fail at its owner (theme, layout choice, props and slots, your custom part, content) and repeat until every framework's pass rule holds.
- **Exact names:** `agent/index.json` (components with required props, block types, layouts, templates, semantic tokens, presets, icons, schemas, commands) and `agent/components/{Name}.json`. Paths written `@design-library/core/…` are inside the installed package.

## Checks

| Run | Proves |
| --- | --- |
| `npx design-library-check-content --templates src/templates` | Content, manifests and schemas valid |
| `npx tsc --noEmit` | Imports, props, brand and preset shapes right |
| `npx vite build` | It bundles |
| `npx vite`, then open it in light, dark and more contrast, at 320 px and wide | It renders, follows every context and never scrolls sideways |
| The adversarial loop (`guide/8-review.md`): every probe in `@design-library/core/probes/`, scored by an evaluator who didn't build the screen | Every framework's checklist passes |

## Deploy

`npx vite build` writes a static site to `dist/`; host it anywhere. The fonts are bundled from the installed packages (nothing loads from another site). With hash routes (`#/page`), no server rewrites are needed.

## Upgrade

1. Read `CHANGELOG.md` in the new release from your installed version up.
2. Install both new tarballs together (step 2 with the new version).
3. Run the checks; for a content schema version change, follow the changelog's migration.

## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| `npm ERR! Cannot read properties of null (reading 'edgesOut')` | npm 9 | Use npm 10 or later (`npm -v`; Node 20.19+ ships it) |
| `404` or `E404` for `@design-library/core` | Installed by name; it isn't on a registry | Install by the release URL (step 2) |
| npm resolves `@design-library/core` from the registry after installing templates alone | Templates depends on core of the same version | Install both tarballs in one command, same version |
| `TS7016: Could not find a declaration file for module '../colour/index.mjs'` | Version 0.1.0 | Upgrade to 0.1.1 or later |
| Type errors inside `node_modules/@design-library/…` | Stricter compiler flags than the library is written for | Use the `tsconfig.json` in step 3 |
| `"./x" is not exported under the conditions …` | Importing a path that isn't a public entry | Import only `/react`, `/render`, `/theme`, `/presets`, `/fonts`, `/icons`, `/colour`, `/css/index.css`, `/schemas/*`, `/motion/*`; after an upgrade, restart the dev server |
| `import.meta.glob is not a function` or `?url` errors | A bundler other than Vite | Use Vite 8 (step 1) |
| Unstyled page | `css/index.css` not imported, or imported after your own CSS | Import it first in `src/main.tsx` |
| System fonts instead of the theme's | Fonts not loaded | Call `applyFonts()` at start-up |
| A colour pair fails contrast | A light brand seed | Check seeds on the Colour page; pin a darker step |
| `doesn't list template "{id}"` from the content check | The template isn't imported in your index | Add it to `src/templates/index.ts`, or leave out `--index` |
| `looks like markup, CSS or script` | HTML or CSS in content | Write plain words; structure goes in blocks |

## Links

- [Get started](http://127.0.0.1:8766/#/get-started) in the library (the short version)
- [How the library works](how-it-works.md), [Handoff readiness](handoff-readiness.md), [Hosting](hosting.md)
- [The package guide](https://github.com/prabinpebam/design-library/tree/main/packages/core/guide) and [AGENTS.md](https://github.com/prabinpebam/design-library/blob/main/packages/core/AGENTS.md)
- [Releases](https://github.com/prabinpebam/design-library/releases)

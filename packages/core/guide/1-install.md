# Step 1: install and integrate

Goal: a website or app that draws its UI with this library, follows the person's light, dark, contrast and motion settings, and passes the checks.

## Before you start

- **What you get:** two packages, `@design-library/core` and `@design-library/templates` (optional), as TypeScript and TSX source plus CSS, not a built bundle: your Vite build compiles them. They aren't on a package registry; each version is two tarballs attached to a [GitHub release](https://github.com/prabinpebam/design-library/releases). MIT licence.
- **What you need:** Node 20.19 or later (Vite 8's floor) with npm 10 or later (Node 20.19+ ships npm 10; `npm -v` tells you), React 19, Vite 8 with `@vitejs/plugin-react`, TypeScript. Each release is installed in empty folders on npm 9.6.7, 10.8.2 and 11 before it ships, in the order below and again from the lockfile (`node tools/install-matrix.mjs` in the library repository).
- **If the install stops with `Cannot read properties of null (reading 'edgesOut')`:** npm's tree is stale, often after a release's files were replaced or an install was interrupted. Delete `node_modules` and `package-lock.json`, run `npm cache verify`, then install again; if it still stops, run the same command with npm 11 (`npx -y npm@11 install …`). Never add `--force` or `--legacy-peer-deps` to get past it.
- **Package sources:** install public packages from the registry your project is configured for. If your organisation requires a proxy or private feed, use it; never switch registries to get past a failure.

## Supported

| Stack | Status |
| --- | --- |
| React 19 in the browser, bundled by **Vite 8** (`@vitejs/plugin-react`), TypeScript with `moduleResolution: "Bundler"` | Supported and proven (this repository's apps, and a separate project in [Handoff readiness](https://prabinpebam.github.io/design-library/docs/#handoff-readiness.md)) |
| Other bundlers (webpack, Next.js with `transpilePackages`, Parcel, Rspack) | Not supported in 0.2: `@design-library/templates` loads content with `import.meta.glob`, and `@design-library/core/react` also exports the component stories, whose media use Vite's `?url` imports (`@design-library/core/components` leaves the stories out) |
| Server rendering (Next.js, Remix, Vite SSR) | Not proven: modules guard browser globals, but nothing has been rendered on a server |
| Other frameworks (Vue, Svelte, Angular, plain HTML) | Not supported: the components are React. The CSS (`css/index.css`) and tokens work anywhere, but the markup contract is the React components' |
| React 18 or earlier | Not supported (`peerDependencies` `react` `^19.0.0`) |

## Steps (a separate project)

1. **Start a Vite + React + TypeScript app** if you don't have one (any folder; nothing from the library repository is needed). Your `package.json` needs `"type": "module"` and these scripts: `"dev": "vite"`, `"build": "vite build"`.

2. **Install the packages**, both tarballs in one command, from the release for the version you want (here 0.4.0-beta.2, the fifth Beta), with React and the build tools:

   ```sh
   npm install https://github.com/prabinpebam/design-library/releases/download/v0.4.0-beta.2/design-library-core-0.4.0-beta.2.tgz https://github.com/prabinpebam/design-library/releases/download/v0.4.0-beta.2/design-library-templates-0.4.0-beta.2.tgz react@^19 react-dom@^19
   npm install -D vite@^8 @vitejs/plugin-react@^6 typescript@~6.0 @types/react@^19 @types/react-dom@^19
   ```

   Leave out the templates tarball if you won't render templates. Always install the two together, from the same release: templates depends on the core of the same version. Without access to GitHub releases, build the same tarballs from a clone of [the library repository](https://github.com/prabinpebam/design-library): `npm run pack` there writes them to `.packages/` (no install needed), then install those files by path.

3. **Add `vite.config.ts`:**

   ```ts
   import { defineConfig } from 'vite';
   import react from '@vitejs/plugin-react';

   export default defineConfig({ plugins: [react()] });
   ```

4. **Add `tsconfig.json`:**

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

   The packages are source, so your type check reads them with these settings. Don't add stricter flags the library isn't written for (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature`, `verbatimModuleSyntax`).

5. **Point your agents here:** add the block from the package's `AGENTS.md` ("First, once per project") to your project's own `AGENTS.md`.

6. **Add `index.html`** with `lang`, a title and one root element:

   ```html
   <!doctype html>
   <html lang="en">
     <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Your app</title></head>
     <body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body>
   </html>
   ```

7. **Import the CSS once, at the entry, before anything else renders.** It holds every token, the cascade layers and every component's styles:

   ```tsx
   // src/main.tsx
   import { StrictMode } from 'react';
   import { createRoot } from 'react-dom/client';
   import '@design-library/core/css/index.css';
   import { App } from './App';

   createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
   ```

8. **Build the screen from layouts and components**, with no styles of your own:

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

   Find each component's props in `node_modules/@design-library/core/agent/components/{Name}.json` before you use it.

9. **Place app-wide hosts once at the root:** `<Notifications />` if anything calls `notify()`. Popovers, tooltips and dialogs use the browser's top layer and need no host.

10. **Optional: load the theme's fonts.** Without this, the system fonts are used. The faces load from the installed `@fontsource-variable` packages; nothing comes from another site:

   ```ts
   import { applyFonts } from '@design-library/core/theme';
   void applyFonts(); // the theme's font preset; pass { preset: 'bookish' } for another (Step 3)
   ```

11. **Let contexts follow the person.** By default the CSS follows the system's light or dark, more contrast and reduced motion. To offer a choice, set attributes on `<html>` (or any subtree): `data-scheme="light|dark"`, `data-contrast="standard|more"`, `data-motion="reduce"`. Wrap a scheme change in `suspendMotion(() => …)` from `@design-library/core/components` so colours change in one frame.


## Inside the library repository

To try the library or change it, an app can also live in [the library repository](https://github.com/prabinpebam/design-library) as `apps/{your-app}`, the way `apps/example` does: list it by name in the root `workspaces` (never a glob), depend on `"@design-library/core": "0.4.0-beta.2"`, and allow the repository root in Vite (`server: { fs: { allow: [root] } }`). Every check in the root `package.json` then runs on it.

## Do and don't

| Do | Don't |
| --- | --- |
| Import from the public entry points only: `@design-library/core/components` (every component; 0.4.0-beta.2), `/react` (the same plus the library's own stories, which put about 8 MB of story pictures and fonts in a build), `/stories`, `/render`, `/presets`, `/fonts`, `/icons`, `/colour`, `/effects` (drawing helpers with no React: the stipple `ImageGeneration` draws, for a site's own `Image` `reveal`; its contract is the comment at the top of `effects/index.ts`; 0.5.0-beta.1), `/css/index.css`, `/schemas/*`, `/motion/*` | Import a component's file directly (`…/react/fundamentals/Button`) or anything not in `exports` |
| Arrange with layouts and `Stack`, `Cluster`, `Grid` | Write CSS, a `style` prop, a `className` or a wrapper `div` to space things |
| Put words in props or content JSON | Hide meaning in colour, or use a button as an on/off toggle (use `Switch`) |
| Use one of `SiteLayout`, `AppLayout`, `ChatLayout` or `EditorLayout` for the whole page | Nest one layout inside another |

## Check it

From your project's root:

| Check | Proves |
| --- | --- |
| `npx tsc --noEmit` | Every import and prop is right |
| `npx vite build` | It bundles |
| `npx vite`, then open the address it prints | The screen renders; switch your system to dark and more contrast and look again, and narrow the window to 320 px |
| Read your views against the package `AGENTS.md` "Never" rules | `npx design-library-check`: no styles in views and the other Never rules, each finding with file, line and fix (nothing fails the run during the Beta unless you pass `--strict`) |

Next: [Step 2, content](2-content.md), to draw screens from JSON instead of JSX.

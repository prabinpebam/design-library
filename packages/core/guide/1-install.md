# Step 1: install and integrate

Goal: a website or app that draws its UI with this library, follows the person's light, dark, contrast and motion settings, and passes the checks.

## Before you start

- **What you get:** TypeScript and TSX source plus CSS, not a built bundle. The packages are private workspaces (`@design-library/core`, `@design-library/templates`), not published to a registry.
- **What you need:** Node 20.19 or later (Vite 8's floor; the library is developed on Node 26), React 19, and a bundler that compiles TSX from a workspace package and imports JSON and CSS. Vite 8 with `@vitejs/plugin-react` is what the library itself uses and what this guide assumes.
- **Package sources:** install public packages only from the registry in the repository's `.npmrc` (the approved npm proxy). Never switch registries to get past a failure.

## Choose how your app lives

| Way | When | Status |
| --- | --- | --- |
| **A. An app inside this repository** (`apps/{your-app}`) | You can work in this repository. Every check runs on your app as-is. | Supported; what the library app does |
| **B. A separate repository linking the packages** (`"@design-library/core": "file:../design-library/packages/core"`) | Your product has its own repository. | Possible, not yet proven: the content and token checks only look inside this repository, so you run them here |

The rest of this step shows **A**. For **B**, do the same in your repository and add the linked folder to your bundler's allowed files (Vite: `server.fs.allow`).

## Steps

1. **Create the app folder** `apps/{your-app}/` with `package.json`:

   ```json
   {
     "name": "@your-org/your-app",
     "private": true,
     "version": "0.1.0",
     "type": "module",
     "scripts": { "dev": "vite --host 127.0.0.1", "build": "vite build" },
     "dependencies": {
       "@design-library/core": "0.1.0",
       "@design-library/templates": "0.1.0",
       "react": "^19.3.1",
       "react-dom": "^19.3.1"
     },
     "devDependencies": {
       "@types/react": "^19.3.0",
       "@types/react-dom": "^19.3.0",
       "@vitejs/plugin-react": "^6.1.2",
       "typescript": "~6.0.3",
       "vite": "^8.3.5"
     }
   }
   ```

   Leave out `@design-library/templates` if you won't render templates.

2. **Register the workspace** by adding `"apps/{your-app}"` to `workspaces` in the root `package.json`. Name it exactly: never a glob such as `apps/*` (it would sweep in folders that aren't packages). Then run `npm install` from the root.

3. **Add `vite.config.ts`**, allowing the repository root so Vite can read the packages:

   ```ts
   import { defineConfig } from 'vite';
   import react from '@vitejs/plugin-react';
   import { fileURLToPath } from 'node:url';

   const root = fileURLToPath(new URL('../..', import.meta.url));
   export default defineConfig({ plugins: [react()], server: { fs: { allow: [root] } } });
   ```

4. **Add `tsconfig.json`** (the same settings as `apps/library/tsconfig.json`): `"jsx": "react-jsx"`, `"moduleResolution": "Bundler"`, `"module": "ESNext"`, `"target": "ES2022"`, `"lib": ["ES2022", "DOM", "DOM.Iterable"]`, `"resolveJsonModule": true`, `"allowJs": true`, `"isolatedModules": true`, `"skipLibCheck": true`, `"strict": true`, `"noEmit": true`, `"types": ["vite/client"]`, `"include": ["src"]`.

5. **Add `index.html`** with `lang`, a title and one root element:

   ```html
   <!doctype html>
   <html lang="en">
     <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Your app</title></head>
     <body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body>
   </html>
   ```

6. **Import the CSS once, at the entry, before anything else renders.** It holds every token, the cascade layers and every component's styles:

   ```tsx
   // src/main.tsx
   import { StrictMode } from 'react';
   import { createRoot } from 'react-dom/client';
   import '@design-library/core/css/index.css';
   import { App } from './App';

   createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
   ```

7. **Build the screen from layouts and components**, with no styles of your own:

   ```tsx
   // src/App.tsx
   import { Heading, Notifications, Section, SiteHeader, SiteLayout, Stack, Text } from '@design-library/core/react';

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

   Find each component's props in `packages/core/agent/components/{Name}.json` before you use it.

8. **Place app-wide hosts once at the root:** `<Notifications />` if anything calls `notify()`. Popovers, tooltips and dialogs use the browser's top layer and need no host.

9. **Optional: load the theme's fonts.** Without this, the system fonts are used. The faces load from the installed `@fontsource-variable` packages; nothing comes from another site:

   ```ts
   import { fontPresets, loadFace } from '@design-library/core/fonts';
   const theme = fontPresets.find((p) => p.default)!;
   for (const face of Object.values(theme.roles)) if (face) void loadFace(face);
   ```

10. **Let contexts follow the person.** By default the CSS follows the system's light or dark, more contrast and reduced motion. To offer a choice, set attributes on `<html>` (or any subtree): `data-scheme="light|dark"`, `data-contrast="standard|more"`, `data-motion="reduce"`. Wrap a scheme change in `suspendMotion(() => …)` from `@design-library/core/react` so colours change in one frame.

## Do and don't

| Do | Don't |
| --- | --- |
| Import from the public entry points only: `@design-library/core/react`, `/render`, `/presets`, `/fonts`, `/icons`, `/colour`, `/css/index.css`, `/schemas/*`, `/motion/*` | Import a component's file directly (`…/react/fundamentals/Button`) or anything not in `exports` |
| Arrange with layouts and `Stack`, `Cluster`, `Grid` | Write CSS, a `style` prop, a `className` or a wrapper `div` to space things |
| Put words in props or content JSON | Hide meaning in colour, or use a button as an on/off toggle (use `Switch`) |
| Use one of `SiteLayout`, `AppLayout`, `ChatLayout` or `EditorLayout` for the whole page | Nest one layout inside another |

## Check it

From the repository root:

| Check | Proves |
| --- | --- |
| `npx tsc -p apps/{your-app} --noEmit` | Every import and prop is right |
| `npm run build -w apps/{your-app}` | It bundles |
| `npm run check:views` | The library's own views have no styles (it reads `apps/library`, `packages/core/render` and the templates; apply the same rules to yours) |
| `npm run dev -w apps/{your-app}`, then open the address it prints | The screen renders; switch your system to dark and more contrast and look again |

Next: [Step 2, content](2-content.md), to draw screens from JSON instead of JSX.

import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { libraryRevisions } from './revisions/api.mjs';

const root = fileURLToPath(new URL('../..', import.meta.url));

/**
 * `virtual:library-source-files`: the repository paths of the library's own sources, so the element picker can turn
 * react-grab's base file names into repository paths. Read when the module loads; a new file needs a page reload.
 */
function librarySourceFiles(): Plugin {
  const id = 'virtual:library-source-files';
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.name === 'node_modules' || e.name.startsWith('.') ? [] : e.isDirectory() ? walk(join(dir, e.name)) : /\.(tsx?|jsx?)$/.test(e.name) ? [join(dir, e.name)] : [],
    );
  return {
    name: 'library-source-files',
    resolveId: (source) => (source === id ? `\0${id}` : undefined),
    load(loaded) {
      if (loaded !== `\0${id}`) return;
      const files = ['apps/library/src', 'packages/core/react'].flatMap((d) => walk(join(root, d))).map((f) => relative(root, f).split('\\').join('/'));
      return `export default ${JSON.stringify(files.sort())};`;
    },
  };
}

export default defineConfig({
  // Relative base: the build works under any sub-path, such as GitHub Pages' /design-library/ (docs/hosting.md).
  base: './',
  // libraryRevisions: the loopback revision API (dev server only); cors off, so no other origin may read it.
  plugins: [react(), libraryRevisions({ repoRoot: root }), librarySourceFiles()],
  server: { host: '127.0.0.1', port: 8766, strictPort: true, cors: false, fs: { allow: [root] } },
  build: { outDir: 'dist', emptyOutDir: true, rollupOptions: { input: { main: join(root, 'apps/library/index.html'), site: join(root, 'apps/library/site.html') } } },
});

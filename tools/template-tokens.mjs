#!/usr/bin/env node
// `npm run tokens` / `tokens:check`: this repository's template tokens, built by the command that ships in core
// (packages/core/tools/template-tokens.mjs, `npx design-library-template-tokens` in a separate project).
if (!process.argv.includes('--templates')) process.argv.push('--templates', new URL('../packages/templates', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
await import('../packages/core/tools/template-tokens.mjs');

#!/usr/bin/env node
// `npm run tokens` / `tokens:check`: this repository's template tokens, built by the command that ships in core
// (packages/core/tools/template-tokens.mjs, `npx design-library-template-tokens` in a separate project).
import { fileURLToPath } from 'node:url';

// fileURLToPath, not URL.pathname: a checkout path with a space stays a path (found proving F23 in a temp folder).
if (!process.argv.includes('--templates')) process.argv.push('--templates', fileURLToPath(new URL('../packages/templates', import.meta.url)));
await import('../packages/core/tools/template-tokens.mjs');

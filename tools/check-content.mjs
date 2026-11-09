#!/usr/bin/env node
// `npm run check:content`: this repository's templates, checked by the content check that ships in core
// (packages/core/tools/check-content.mjs, `npx design-library-check-content` in a separate project).
if (!process.argv.includes('--templates')) process.argv.push('--templates', new URL('../packages/templates', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
await import('../packages/core/tools/check-content.mjs');

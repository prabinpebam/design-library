#!/usr/bin/env node
// Builds the installable tarballs a separate project uses (docs/handoff-readiness.md, D1/D2):
//   node ./tools/pack.mjs            → .packages/design-library-core-<v>.tgz and design-library-templates-<v>.tgz
// The packages stay "private" so they can't be published by accident; npm pack doesn't need them public.
// Refuses to pack when the shipped agent index is stale, so the docs inside the tarball match the code.
import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, '.packages');
const run = (cmd, args, cwd) => execSync([cmd, ...args.map((a) => JSON.stringify(a))].join(' '), { cwd, encoding: 'utf8' });

run('node', ['./tools/agent-index.mjs', '--check'], root);
mkdirSync(out, { recursive: true });
const core = JSON.parse(readFileSync(join(root, 'packages/core/package.json'), 'utf8')).version;
const templates = JSON.parse(readFileSync(join(root, 'packages/templates/package.json'), 'utf8'));
if (templates.dependencies['@design-library/core'] !== core)
  throw new Error(`@design-library/templates depends on core ${templates.dependencies['@design-library/core']}, but core is ${core}: make them match.`);
for (const pkg of ['packages/core', 'packages/templates']) {
  const [info] = JSON.parse(run('npm', ['pack', '--json', '--pack-destination', out], join(root, pkg)));
  console.log(`${join('.packages', info.filename)}  ${info.entryCount} files, ${(info.size / 1024 / 1024).toFixed(2)} MB`);
}

#!/usr/bin/env node
// The browser probes ship in core (Q99, E4/E5): packages/core/probes/{name}-probe.js, exported as
// `@design-library/core/probes/*`, so a separate project runs the same probes its guide step 8 names. tools/*-probe.js
// stay where the library's own docs and sweeps load them; this keeps the two identical.
//
//   node ./tools/probes.mjs           fail (exit 1) when a probe in tools/ and its copy in the package differ
//   node ./tools/probes.mjs --write   copy every tools/*-probe.js into packages/core/probes/ (and drop stale copies)
import { copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const from = join(root, 'tools');
const to = join(root, 'packages/core/probes');
const probes = readdirSync(from).filter((f) => f.endsWith('-probe.js')).sort();
mkdirSync(to, { recursive: true });
const shipped = readdirSync(to).filter((f) => f.endsWith('.js'));

if (process.argv.includes('--write')) {
  for (const f of probes) copyFileSync(join(from, f), join(to, f));
  for (const f of shipped) if (!probes.includes(f)) rmSync(join(to, f));
  console.log(`probes: ${probes.length} copied to packages/core/probes/`);
} else {
  const problems = [
    ...probes.filter((f) => !shipped.includes(f) || readFileSync(join(from, f), 'utf8') !== readFileSync(join(to, f), 'utf8')).map((f) => `packages/core/probes/${f} is missing or differs from tools/${f}`),
    ...shipped.filter((f) => !probes.includes(f)).map((f) => `packages/core/probes/${f} has no tools/${f}`),
  ];
  for (const p of problems) console.error(`✗ ${p}`);
  if (problems.length) console.error('Run: npm run probes:sync');
  else console.log(`probes: the ${probes.length} probes in packages/core/probes/ match tools/`);
  process.exitCode = problems.length ? 1 : 0;
}

#!/usr/bin/env node
// Install check for a release (improvement plan IP1, IV2): installs the packed tarballs in empty folders outside the
// repository with each npm the guide names, in the guide's order (the library and React, then the dev tools), and
// once more from the lockfile. Run after `npm run pack`:
//   node ./tools/install-matrix.mjs                 → npm 10 and 11, tarballs from .packages/
//   node ./tools/install-matrix.mjs --npm 9.6.7,10.8.2,11 --from https://github.com/…/releases/download/vX
// Packages come from the npm registry this machine is configured for (the proxy); the tarballs from disk or --from.
import { execSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i > 0 ? process.argv[i + 1] : undefined;
};
const versions = (arg('--npm') ?? '10,11').split(',');
const version = JSON.parse(readFileSync(join(root, 'packages/core/package.json'), 'utf8')).version;
const from = arg('--from');
const tarball = (name) => (from ? `${from}/${name}-${version}.tgz` : pathToFileURL(join(root, '.packages', `${name}-${version}.tgz`)).href);
const libs = [tarball('design-library-core'), tarball('design-library-templates'), 'react@^19', 'react-dom@^19'];
const dev = ['vite@^8', '@vitejs/plugin-react@^6', 'typescript', '@types/react', '@types/react-dom'];

let failed = 0;
for (const npm of versions) {
  const dir = mkdtempSync(join(tmpdir(), `dl-install-npm${npm.replace(/\W/g, '_')}-`));
  const run = (args) => execSync(['npx', ...['-y', `npm@${npm}`, ...args].map((a) => JSON.stringify(a))].join(' '), { cwd: dir, encoding: 'utf8', stdio: 'pipe' });
  const steps = [];
  try {
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'install-check', private: true, type: 'module' }));
    const real = run(['-v']).trim();
    run(['install', ...libs]);
    steps.push('libraries');
    run(['install', '-D', ...dev]);
    steps.push('dev tools');
    rmSync(join(dir, 'node_modules'), { recursive: true, force: true });
    run(['install']);
    steps.push('from lockfile');
    console.log(`npm ${real}: pass (${steps.join(', ')})`);
  } catch (error) {
    failed++;
    const text = `${error.stdout ?? ''}${error.stderr ?? ''}`.split('\n').filter((l) => /ERR|edgesOut/.test(l)).slice(0, 4).join('\n');
    console.log(`npm ${npm}: FAIL after ${steps.join(', ') || 'nothing'}\n${text || error.message}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
process.exit(failed ? 1 : 0);

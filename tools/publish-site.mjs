#!/usr/bin/env node
/**
 * Builds the GitHub Pages site (docs/hosting.md, DoD Q80): the library at the root, the Slate docs host under /docs/,
 * both from tools/site-links.json. Local addresses become hosted ones in the published copy only.
 *
 *   node ./tools/publish-site.mjs            check the pairs, build, assemble .publish/
 *   node ./tools/publish-site.mjs --check    check the pairs only
 *   node ./tools/publish-site.mjs --push     also commit .publish/ and force-push it to the gh-pages branch of origin
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const links = JSON.parse(readFileSync(join(root, 'tools/site-links.json'), 'utf8'));
const out = join(root, '.publish');
const args = new Set(process.argv.slice(2));
const run = (cmd, argv, opts = {}) => execFileSync(cmd, argv, { cwd: root, stdio: 'inherit', ...opts });
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

// Every pair links both ways: the library side comes from withDocs() in pages.ts; the doc must link back to the page.
const missing = Object.entries(links.pairs).filter(([page, doc]) => {
  const text = readFileSync(join(root, 'docs', doc.split('#')[0]), 'utf8');
  return !text.includes(`${links.local.library}#/${page})`);
});
if (missing.length) {
  console.error(`These docs don't link back to their library page:\n${missing.map(([p, d]) => `  ${d} -> ${links.local.library}#/${p}`).join('\n')}`);
  process.exit(1);
}
console.log(`Pairs link both ways: ${Object.keys(links.pairs).length}.`);
if (args.has('--check')) process.exit(0);

const hosted = (text) =>
  text.split(links.local.docs).join(links.hosted.docs).split(links.local.library).join(links.hosted.library);
const walk = (dir) => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));

run(npm, ['run', 'build', '-w', 'apps/library'], { shell: process.platform === 'win32' });

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const excluded = new Set(['zz-sync-probe.html']);
cpSync(join(root, 'apps/library/dist'), out, { recursive: true, filter: (src) => !excluded.has(src.split(/[\\/]/).pop()) });
cpSync(join(root, 'docs'), join(out, 'docs'), { recursive: true });

let rewritten = 0;
for (const file of walk(out)) {
  const rel = relative(out, file).split('\\').join('/');
  if (rel.startsWith('docs/shell/') || !/\.(md|html|js|json)$/.test(rel)) continue;
  const text = readFileSync(file, 'utf8');
  const next = hosted(text);
  if (next !== text) {
    writeFileSync(file, next);
    rewritten++;
  }
}
writeFileSync(join(out, '.nojekyll'), '');
console.log(`Assembled ${relative(root, out)}: ${walk(out).length} files, local links rewritten in ${rewritten}.`);

if (args.has('--push')) {
  const remote = execFileSync('git', ['remote', 'get-url', 'origin'], { cwd: root, encoding: 'utf8' }).trim();
  const source = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  const git = (...argv) => run('git', argv, { cwd: out });
  if (!existsSync(join(out, '.git'))) git('init', '-q', '-b', 'gh-pages');
  git('add', '-A');
  git('commit', '-q', '-m', `Publish the library and docs from ${source}`);
  git('push', '-f', remote, 'gh-pages');
  console.log(`Pushed gh-pages from ${source}.`);
}

#!/usr/bin/env node
// Keeps package-lock.json installable outside Microsoft (docs/handoff-readiness.md B3, owner 2026-11-09 07:57):
// tarball URLs are recorded on registry.npmjs.org, which npm swaps for whatever registry is configured
// (`replace-registry-host`, default "npmjs"), so this machine still installs through the approved proxy.
//   node ./tools/lockfile-hosts.mjs          rewrite feed hosts to registry.npmjs.org
//   node ./tools/lockfile-hosts.mjs --check  fail if any feed host is recorded
import { readFileSync, writeFileSync } from 'node:fs';

const file = new URL('../package-lock.json', import.meta.url);
const feed = /https:\/\/[a-z0-9-]+\.pkgs\.visualstudio\.com\/[^"]*?\/npm\/registry\/|https:\/\/packagefeedproxy\.microsoft\.io\/npm\//g;
const text = readFileSync(file, 'utf8');
const hits = text.match(feed)?.length ?? 0;
if (process.argv.includes('--check')) {
  if (hits) {
    console.error(`lockfile-hosts: ${hits} tarball URLs name a private feed. Run: node ./tools/lockfile-hosts.mjs`);
    process.exit(1);
  }
  console.log('lockfile-hosts: every tarball URL is on registry.npmjs.org.');
} else {
  writeFileSync(file, text.replace(feed, 'https://registry.npmjs.org/'));
  console.log(`lockfile-hosts: rewrote ${hits} tarball URLs to registry.npmjs.org.`);
}

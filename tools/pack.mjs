#!/usr/bin/env node
// Builds the installable tarballs a separate project uses (docs/handoff-readiness.md, D1/D2):
//   node ./tools/pack.mjs            → .packages/design-library-core-<v>.tgz and design-library-templates-<v>.tgz
//   node ./tools/pack.mjs --dry-run  → the same checks, writing nothing (safe while .packages holds a released version)
// The packages stay "private" so they can't be published by accident; npm pack doesn't need them public.
// Refuses to pack when the shipped agent index is stale, so the docs inside the tarball match the code.
import { execSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, '.packages');
const run = (cmd, args, cwd) => execSync([cmd, ...args.map((a) => JSON.stringify(a))].join(' '), { cwd, encoding: 'utf8' });

run('node', ['./tools/agent-index.mjs', '--check'], root);
// The colour module is JavaScript; its declarations (`colour/*.d.mts`) let a consumer's type check read it from
// node_modules (handoff readiness, proof hiccup H2). Refuse to pack when they're stale.
{
  const tmp = mkdtempSync(join(tmpdir(), 'dl-colour-types-'));
  try {
    run('npx', ['tsc', 'packages/core/colour/index.mjs', '--allowJs', '--declaration', '--emitDeclarationOnly', '--skipLibCheck', '--target', 'ES2022', '--module', 'ESNext', '--moduleResolution', 'Bundler', '--outDir', tmp], root);
    for (const f of readdirSync(tmp))
      if (readFileSync(join(tmp, f), 'utf8') !== readFileSync(join(root, 'packages/core/colour', f), 'utf8'))
        throw new Error(`packages/core/colour/${f} is stale. Run: npm run colour:types`);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}
mkdirSync(out, { recursive: true });
const core = JSON.parse(readFileSync(join(root, 'packages/core/package.json'), 'utf8')).version;
const templates = JSON.parse(readFileSync(join(root, 'packages/templates/package.json'), 'utf8'));
if (templates.dependencies['@design-library/core'] !== core)
  throw new Error(`@design-library/templates depends on core ${templates.dependencies['@design-library/core']}, but core is ${core}: make them match.`);
const walk = (dir, base = '') =>
  readdirSync(join(dir, base), { withFileTypes: true }).flatMap((e) =>
    e.name === 'node_modules' || e.name.startsWith('.') ? [] : e.isDirectory() ? walk(dir, `${base}${e.name}/`) : [`${base}${e.name}`],
  );
// Every export and bin target that exists in the source must ship (MP4: `./*/registry` → each template's registry.tsx).
const shipsEverything = (pkgDir, info) => {
  const pkg = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'));
  const packed = new Set(info.files.map((f) => f.path.replace(/\\/g, '/')));
  const source = walk(pkgDir);
  const targets = [...Object.values(pkg.exports ?? {}), ...Object.values(pkg.bin ?? {})].filter((t) => typeof t === 'string');
  const missing = [];
  for (const t of targets) {
    const target = t.replace(/^\.\//, '');
    const re = new RegExp(`^${target.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*$/, '.+').replace(/\*/g, '[^/]+')}$`);
    const want = source.filter((f) => re.test(f));
    if (!want.length) missing.push(`${t} (matches no file in the source)`);
    for (const f of want) if (!packed.has(f)) missing.push(f);
  }
  if (missing.length) throw new Error(`${pkg.name}: the tarball lacks export or bin targets:\n  ${missing.join('\n  ')}\nAdd them to "files" (or remove them from .npmignore).`);
};
for (const pkg of ['packages/core', 'packages/templates']) {
  const dry = process.argv.includes('--dry-run');
  const [info] = JSON.parse(run('npm', ['pack', '--json', ...(dry ? ['--dry-run'] : ['--pack-destination', out])], join(root, pkg)));
  shipsEverything(join(root, pkg), info);
  console.log(`${dry ? '(dry run) ' : ''}${join('.packages', info.filename)}  ${info.entryCount} files, ${(info.size / 1024 / 1024).toFixed(2)} MB; every export and bin target ships`);
}

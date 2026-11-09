import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { plan as craftPlan, withSection as craftSection, factsCheck } from '../agentic-craft/tools/install.mjs';
import { plan as orchestrationPlan, withSection as orchestrationSection, clockHooks, guardHooks } from '../agent-orchestration/tools/install.mjs';
import { checkRuntimeHost } from '../slate/scripts/runtime-host.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const host = path.join(root, 'docs');
const text = (file) => readFileSync(file, 'utf8');
const json = (file) => JSON.parse(text(file));

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? files(file) : [file];
  });
}

function sameTree(source, destination) {
  if (!source.endsWith('.mjs') && !source.endsWith('.md')) {
    const relativeFiles = (directory) => files(directory).map((file) => path.relative(directory, file)).sort();
    assert.deepEqual(relativeFiles(destination), relativeFiles(source), `Tree mismatch: ${destination}`);
    for (const file of relativeFiles(source)) {
      assert.deepEqual(readFileSync(path.join(destination, file)), readFileSync(path.join(source, file)), `Copy drift: ${file}`);
    }
  } else {
    assert.deepEqual(readFileSync(destination), readFileSync(source), `Copy drift: ${destination}`);
  }
}

for (const copy of [...craftPlan(root, ['copilot'], false), ...orchestrationPlan(root, ['copilot'], false)]) {
  sameTree(copy.from, copy.to);
}
for (const expected of [clockHooks(root, false), guardHooks(root, false)]) {
  assert.deepEqual(json(expected.file), JSON.parse(expected.text), `Hook configuration drift: ${expected.file}`);
}

const skillNames = readdirSync(path.join(root, '.github', 'skills')).sort();
const expectedSkills = [
  ...readdirSync(path.join(root, 'agentic-craft', 'skills')),
  ...readdirSync(path.join(root, 'agent-orchestration', 'skills')),
  'slate',
].sort();
assert.equal(new Set(expectedSkills).size, 17, 'Skill names must not collide');
assert.deepEqual(skillNames, expectedSkills);
const agentFiles = files(path.join(root, '.github', 'agents'));
assert.equal(agentFiles.length, 3);
for (const file of [
  ...skillNames.map((name) => path.join(root, '.github', 'skills', name, 'SKILL.md')),
  ...agentFiles,
]) {
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text(file));
  assert.ok(frontmatter, `Missing frontmatter: ${file}`);
  const name = /^name:\s*([a-z0-9-]+)\s*$/m.exec(frontmatter[1])?.[1];
  assert.ok(name && name.length <= 64, `Invalid discovery name: ${file}`);
  assert.equal(name, file.endsWith('SKILL.md') ? path.basename(path.dirname(file)) : path.basename(file, '.agent.md'));
  assert.match(frontmatter[1], /^description:\s*\S.+$/m, `Missing discovery description: ${file}`);
}
const adapter = path.join(root, '.github', 'skills', 'slate', 'SKILL.md');
assert.match(text(adapter), /\.\.\/\.\.\/\.\.\/slate\/SKILL\.md/);
assert.ok(existsSync(path.join(root, 'slate', 'SKILL.md')));

const guidance = text(path.join(root, 'AGENTS.md'));
for (const kit of ['agentic-craft', 'agent-orchestration']) {
  for (const edge of ['start', 'end']) {
    assert.equal(guidance.split(`<!-- ${kit}:${edge} -->`).length - 1, 1, `Duplicate/missing ${kit} ${edge}`);
  }
}
assert.equal(craftSection(guidance), guidance, 'Craft updates must preserve project facts');
assert.equal(orchestrationSection(guidance), guidance, 'Orchestration updates must preserve both sections');
assert.deepEqual(factsCheck(guidance), { missing: [], extra: [] });
assert.doesNotMatch(guidance, /<path|<source folder>|<…>/);
assert.ok(!existsSync(path.join(root, '.github', 'copilot-instructions.md')), 'Avoid duplicate always-on root guidance');
// Since 2026-11-09 (owner, DoD Q80) the root is a Git repository; the upstream checkouts and review data are never
// tracked, and nothing is a gitlink (submodule or nested repository).
if (existsSync(path.join(root, '.git'))) {
  const tracked = execFileSync('git', ['ls-files', '-s'], { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean);
  assert.ok(!tracked.some((l) => l.startsWith('160000 ')), 'No gitlinks in the root repository');
  assert.ok(!tracked.some((l) => /\t(agentic-craft|agent-orchestration|slate|\.design-library|\.slate)\//.test(l)), 'Upstream checkouts and review data are never tracked');
}
// Foundation execution (owner, 2026-11-06 20:28) adds product workspaces; they must stay an explicit list that never
// sweeps in the upstream checkouts. `packages/templates` joined on 2026-11-08 (owner Q64, approved by main 19:58).
const rootPackage = JSON.parse(text(path.join(root, 'package.json')));
assert.deepEqual(rootPackage.workspaces, ['packages/core', 'packages/catalogue', 'packages/templates', 'apps/library'], 'Workspaces must be the explicit product list');
assert.ok(rootPackage.workspaces.every((w) => !/[*?]/.test(w) && !/^(agentic-craft|agent-orchestration|slate|loushing)\b/.test(w)), 'No workspace globs or upstream checkouts');
assert.match(text(path.join(root, '.npmrc')), /^registry=https:\/\/packagefeedproxy\.microsoft\.io\/npm\/$/m, 'npm must use the approved proxy');
for (const workspaceFile of ['pnpm-workspace.yaml', 'lerna.json']) {
  assert.ok(!existsSync(path.join(root, workspaceFile)), `Unexpected product package workspace: ${workspaceFile}`);
}
const ignoreProbe = mkdtempSync(path.join(tmpdir(), 'design-library-ignore-'));
try {
  execFileSync('git', ['init', '--quiet', ignoreProbe]);
  writeFileSync(path.join(ignoreProbe, '.gitignore'), text(path.join(root, '.gitignore')));
  const ignored = execFileSync('git', ['-C', ignoreProbe, 'check-ignore', '--no-index', '--stdin'], {
    input: 'agentic-craft/README.md\nagent-orchestration/.git/config\nslate/package.json\nAGENTS.md\ndocs/brief.md\n',
    encoding: 'utf8',
  }).trim().split(/\r?\n/);
  assert.deepEqual(ignored, ['agentic-craft/README.md', 'agent-orchestration/.git/config', 'slate/package.json']);
} finally {
  rmSync(ignoreProbe, { recursive: true, force: true });
}

assert.deepEqual(json(path.join(host, 'slate.config.json')), {
  projectName: 'Design Library',
  defaultTheme: 'auto',
  density: 'comfortable',
  landing: 'landing.html',
  themeStylesheet: 'project.theme.css',
});
assert.match(text(path.join(host, 'index.html')), /<title>Design Library<\/title>/);
assert.deepEqual(checkRuntimeHost(host, path.join(root, 'slate'), root), []);
assert.equal(json(path.join(host, '.slate-runtime.json')).files.length, 25);
const manifest = json(path.join(host, 'docs-manifest.json'));
assert.equal(manifest.version, 2);
assert.deepEqual(manifest.entries.map((entry) => entry.path), [
  'landing.html', 'brief.md', 'definition-of-done.md', 'foundation.md', 'work-plan.md',   'setup.md', 'component-coverage.md', 'component-catalogue.md',
]);
for (const entry of manifest.entries) {
  assert.equal(entry.type, 'page');
  assert.ok(!entry.path.startsWith('../') && !path.isAbsolute(entry.path), 'Docs pages must stay inside the host');
  assert.ok(entry.icon && entry.title && Number.isFinite(entry.order));
  const page = path.join(host, entry.path);
  const content = text(page);
  const authored = content.replace(/^```[^\n]*\n[\s\S]*?^```[ \t]*\r?$/gm, '');
  const headings = entry.path.endsWith('.md') ? authored.match(/^# .+$/gm) : authored.match(/<h1\b/g);
  assert.equal(headings?.length, 1, `Expected one H1: ${entry.path}`);
  assert.match(content, /TL;DR/);
  assert.doesNotMatch(authored, /<(?:script|style|iframe)\b|\bstyle\s*=/i, `Executable/style escape: ${entry.path}`);
  const links = [...authored.matchAll(/href="([^"]+)"/g), ...authored.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)];
  for (const [, href] of links) {
    if (/^https?:\/\//.test(href) || href.startsWith('#')) continue;
    const target = path.resolve(path.dirname(page), href.split('#')[0]);
    assert.ok(target.startsWith(`${host}${path.sep}`), `Link escapes HTTP host: ${href}`);
    assert.ok(existsSync(target), `Broken local link: ${href}`);
  }
}

const provenance = text(path.join(host, 'setup.md'));
for (const folder of ['agentic-craft', 'agent-orchestration', 'slate']) {
  const git = (...args) => execFileSync('git', ['--no-pager', '-C', path.join(root, folder), ...args], { encoding: 'utf8' }).trim();
  assert.equal(git('remote', 'get-url', 'origin'), `https://github.com/prabinpebam/${folder}.git`);
  assert.equal(git('branch', '--show-current'), 'main');
  assert.equal(git('status', '--porcelain'), '', `Upstream checkout must remain clean: ${folder}`);
  assert.ok(provenance.includes(git('rev-parse', 'HEAD')), `Missing exact checkout provenance: ${folder}`);
  assert.ok(provenance.includes(json(path.join(root, folder, 'package.json')).version));
}

console.log('Design Library setup passed: 17 skills, 3 agents, canonical hooks, preserved guidance, 7 pages, 25 runtime files, clean ignored source clones, explicit product workspaces on the approved npm proxy.');

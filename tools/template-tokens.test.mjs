import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const tool = new URL('../packages/core/tools/template-tokens.mjs', import.meta.url);
function fixture(run) {
  const root = mkdtempSync(join(tmpdir(), 'dl-template-tokens-'));
  const dir = join(root, 'sample', 'tokens');
  mkdirSync(dir, { recursive: true });
  const token = { $type: 'dimension', $value: '{radius.md}', $description: 'Control corners.' };
  const data = { t: { sample: { radius: token } } };
  const save = () => writeFileSync(join(dir, 'tokens.json'), JSON.stringify(data));
  const command = (...args) => spawnSync(process.execPath, [tool.pathname.replace(/^\/([A-Z]:)/i, '$1'), '--templates', root, ...args], { encoding: 'utf8' });
  try { run({ data, token, dir, save, command }); }
  finally { rmSync(root, { recursive: true, force: true }); }
}
test('semantic aliases remain live, generated output checks exact parity', () => fixture(({ save, command, dir }) => {
  save();
  assert.equal(command().status, 0);
  assert.match(readFileSync(join(dir, 'tokens.css'), 'utf8'), /--t-sample-radius: var\(--radius-md\)/);
  assert.equal(command('--check').status, 0);
  writeFileSync(join(dir, 'tokens.css'), 'stale');
  assert.notEqual(command('--check').status, 0);
}));
test('brand decisions are explicit, context overrides are selective and ordered', () => fixture(({ data, token, save, command, dir }) => {
  token.$value = 'clamp(1rem, 3vw, 4rem)';
  token.$extensions = { 'org.design-library': { brand: 'Measured brand heading composition.' } };
  data.$extensions = { 'org.design-library': { contexts: [
    { selector: "[data-template='sample'] [data-shape]", description: 'Resolve a shape context.', values: { 't.sample.radius': '{radius.lg}' } },
    { selector: ':root', media: '(prefers-reduced-motion: reduce)', description: 'System reduction.', values: { 't.sample.radius': '0px' } },
  ] } };
  save();
  const result = command();
  assert.equal(result.status, 0, result.stderr);
  assert.match(readFileSync(join(dir, 'tokens.css'), 'utf8'), /@media \(prefers-reduced-motion: reduce\)/);
  assert.equal(command('--check').status, 0);
}));
test('raw values, private references, unknown contexts, cycles and CSS injection fail without writing', () => {
  const cases = [
    ({ token }) => { token.$value = '10px'; },
    ({ token }) => { token.$value = '{p.space.4}'; },
    ({ token }) => { token.$value = '{t.sample.radius}'; },
    ({ token }) => { token.$value = '0; color:red'; token.$extensions = { 'org.design-library': { brand: 'Invalid.' } }; },
    ({ token }) => { token.$value = 'var(--c-button-padding)'; token.$extensions = { 'org.design-library': { brand: 'Invalid.' } }; },
    ({ data }) => { data.$extensions = { 'org.design-library': { contexts: [{ selector: ':root', description: 'Unknown.', values: { 't.sample.missing': '0' } }] } }; },
    ({ data }) => { data.$extensions = { 'org.design-library': { contexts: [{ selector: "[data-dl='Button']", description: 'Private component.', values: {} }] } }; },
  ];
  for (const [index, change] of cases.entries()) fixture((context) => {
    context.save();
    assert.equal(context.command().status, 0);
    const before = readFileSync(join(context.dir, 'tokens.css'), 'utf8');
    change(context);
    context.save();
    const result = context.command();
    assert.notEqual(result.status, 0, `invalid case ${index}: ${result.stdout}`);
    assert.equal(readFileSync(join(context.dir, 'tokens.css'), 'utf8'), before);
  });
});

import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const tokens = JSON.parse(read('packages/core/tokens/tokens.json'));
const css = read('packages/core/css/fundamentals/controls.css');
const button = read('packages/core/react/fundamentals/Button.tsx');
const dialog = read('packages/core/react/compounds/Dialog.tsx');

test('accessible floor survives a reduced root font and grows with larger text', () => {
  const floor = tokens.size['target-floor'].$value;
  assert.deepEqual(floor, { value: 44, unit: 'px' });
  assert.equal(tokens.c.button['target-floor'].$value, '{size.target-floor}');
  for (const root of [10, 12.5, 16, 20, 32]) {
    assert.ok(Math.max(tokens.size.target.$value.value * root, floor.value) >= 44);
  }
  assert.match(css, /--_dl-button-target: max\(var\(--size-target\), var\(--c-button-target-floor\)\)/);
});

test('every Button size preserves its own size while applying the optional floor', () => {
  for (const suffix of ['', '-xs', '-s', '-m', '-l', '-xl', '-xxl']) {
    for (const axis of ['block', 'inline']) {
      assert.ok(css.includes(`min-${axis}-size: max(var(--c-button-size${suffix}), var(--_dl-button-target, 0px))`));
    }
  }
  assert.match(css, /\[data-dl='button'\] \{\s*--_dl-button-target: 0px;/);
  assert.match(button, /minimumTarget = false/);
  assert.equal(button.match(/data-minimum-target=\{minimumTarget \? '' : undefined\}/g)?.length, 2);
});

test('Dialog opts in by default without changing alert or close behaviour', () => {
  assert.match(dialog, /!alert && <Button label="Close" icon="close" iconOnly emphasis="quiet" size="s" minimumTarget onClick=\{\(\) => close.current\(\)\}/);
  assert.match(dialog, /if \(!alert\) close.current\(\)/);
  assert.match(dialog, /opener.current\?\.focus\(\)/);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('floating surfaces give controls an identifying semantic boundary without changing ordinary controls', () => {
  const css = readFileSync(new URL('../packages/core/css/materials.css', import.meta.url), 'utf8');
  assert.match(css, /\[data-material='floating'\]\s*\{\s*--color-border-control:\s*var\(--color-text-muted\);/);
  assert.doesNotMatch(css, /:root\s*\{\s*--color-border-control/);
});

test('popup shells delegate all scrolling to their inner ScrollArea', () => {
  const css = readFileSync(new URL('../packages/core/css/fundamentals/pickers.css', import.meta.url), 'utf8');
  const popup = css.match(/\[data-dl='select'\] \[data-dl-part='control'\] > \[data-dl-part='popup'\]\s*\{([^}]+)\}/)?.[1];
  assert.ok(popup);
  assert.match(popup, /overflow:\s*visible/);
  assert.match(popup, /grid-template:\s*minmax\(0, 1fr\)/);
});

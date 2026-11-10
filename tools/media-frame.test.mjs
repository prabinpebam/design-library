import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const read = path => readFileSync(new URL(`../packages/core/${path}`, import.meta.url), 'utf8');

test('ListItem thumbnails are lazy, retain their media slot, and recover to the supplied kind icon', () => {
  const source = read('react/fundamentals/ListItem.tsx');
  assert.match(source, /<Thumbnail key=\{thumbnail\} src=\{thumbnail\} icon=\{icon\}/);
  assert.match(source, /failed \? <Icon name=\{icon \?\? 'image'\}/);
  assert.match(source, /loading="lazy" decoding="async" onError=\{\(\) => setFailed\(true\)\}/);
  assert.match(source, /data-dl-part="item-thumbnail" aria-hidden="true"/);
});

test('Image constrains its intrinsic image to the ratio grid cell for both cover and contain', () => {
  const css = read('css/fundamentals/image.css');
  assert.match(css, /\[data-dl='image'\]\s*\{[^}]*grid-template:\s*minmax\(0, 1fr\) \/ minmax\(0, 1fr\)/);
  assert.match(css, /\[data-dl='image'\] > img\s*\{[^}]*min-inline-size:\s*0;[^}]*min-block-size:\s*0;/);
  assert.match(css, /\[data-fit='contain'\] > img\s*\{\s*object-fit:\s*contain/);
});

test('Image label failure is a public short-slot seam, not a clamp or hidden accessible-only name', () => {
  const source = read('react/fundamentals/Image.tsx');
  const css = read('css/fundamentals/image.css');
  assert.match(source, /fallbackLayout\?: 'stack' \| 'label'/);
  assert.match(source, /fallbackLayout = 'stack'/);
  assert.match(source, /\(fallbackLayout !== 'label' \|\| !alt\) && <Icon/);
  assert.match(source, /data-dl-part="fallback-text" aria-hidden="true">\{alt\}/);
  assert.match(css, /\[data-fallback-layout='label'\] > \[data-dl-part='fallback'\]\s*\{\s*padding:\s*var\(--space-inset-sm\)/);
});

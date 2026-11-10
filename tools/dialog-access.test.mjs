import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tabBoundary, scrollTabIndex } from '../packages/core/react/behaviour/focus.ts';

const read = (path) => readFileSync(new URL(`../packages/core/${path}`, import.meta.url), 'utf8');

test('Tab wraps the last stop and Shift+Tab wraps the first', () => {
  const stops = ['close', 'field', 'action'];
  assert.equal(tabBoundary(stops, 'action', false), 'close');
  assert.equal(tabBoundary(stops, 'close', true), 'action');
  assert.equal(tabBoundary(stops, 'field', false), null);
  assert.equal(tabBoundary(stops, 'field', true), null);
});

test('missing focus, one stop and no stops have safe boundary results', () => {
  assert.equal(tabBoundary(['close', 'field'], null, false), 'close');
  assert.equal(tabBoundary(['close', 'field'], null, true), 'field');
  assert.equal(tabBoundary(['only'], 'only', false), 'only');
  assert.equal(tabBoundary(['only'], 'only', true), 'only');
  assert.equal(tabBoundary([], null, false), null);
  assert.equal(tabBoundary([], null, true), null);
  assert.equal(tabBoundary(['replacement'], 'removed', false), 'replacement');
});

test('only overflow on an enabled scroll axis creates an automatic tab stop', () => {
  for (const axis of ['block', 'inline', 'both']) {
    assert.equal(scrollTabIndex(axis, { inline: false, block: false }), undefined);
    assert.equal(scrollTabIndex(axis, { inline: true, block: true }), 0);
    assert.equal(scrollTabIndex(axis, { inline: true, block: true }, -1), -1);
    assert.equal(scrollTabIndex(axis, { inline: false, block: false }, 0), 0);
  }
  assert.equal(scrollTabIndex('block', { inline: true, block: false }), undefined);
  assert.equal(scrollTabIndex('inline', { inline: false, block: true }), undefined);
  assert.equal(scrollTabIndex('both', { inline: true, block: false }), 0);
});

test('Dialog wires containment, non-landmark anatomy, scroll naming and unmount restoration', () => {
  const dialog = read('react/compounds/Dialog.tsx');
  assert.doesNotMatch(dialog, /<(?:header|footer)\b/);
  assert.match(dialog, /onKeyDown=\{\(e\) => containTab\(e.nativeEvent, e.currentTarget\)\}/);
  assert.match(dialog, /aria-modal="true"/);
  assert.match(dialog, /labelledBy=\{`\$\{id\}-title`\}/);
  assert.match(dialog, /if \(d\?\.open\) d.close\(\)/);
  assert.match(dialog, /if \(opener.current\?\.isConnected\) opener.current.focus\(\)/);
});

test('ScrollArea naming and overflow remain reactive, with an inset token focus ring', () => {
  assert.match(read('react/fundamentals/ScrollArea.tsx'), /aria-labelledby=\{labelledBy\}/);
  assert.match(read('react/behaviour/scroll.ts'), /characterData: true/);
  assert.match(read('css/fundamentals/scroll-area.css'), /outline: var\(--size-focus-width\) solid var\(--color-focus\)/);
  assert.match(read('css/fundamentals/scroll-area.css'), /outline-offset: calc\(-1 \* var\(--size-focus-width\)\)/);
});

test('no-divider is a public theme seam without disabling outlines or focus', () => {
  const settings = JSON.parse(read('tokens/settings.json'));
  assert.ok(settings.Shared['--border-divider']);
  assert.ok(settings.PropertySection['--c-property-section-divider-width']);
  const tokens = JSON.parse(read('tokens/tokens.json'));
  assert.equal(tokens.border.divider.$value, '{border.hairline}');
  assert.equal(tokens.c['row-list']['divider-width'].$value, '{border.divider}');
  for (const path of ['base.css', 'fundamentals/list.css', 'compounds/accordion.css', 'compounds/data-table.css', 'compounds/context-matrix.css', 'layouts/site-layout.css', 'layouts/chat-layout.css', 'layouts/editor-layout.css', 'layouts/library.css']) {
    assert.match(read(`css/${path}`), /var\(--border-divider\)/);
  }
  assert.match(read('css/base.css'), /:focus-visible \{[\s\S]*var\(--size-focus-width\)/);
});

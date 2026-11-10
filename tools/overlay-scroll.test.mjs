import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const source = readFileSync(new URL('../packages/core/react/behaviour/scroll.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;

test('overlay scroll measures initially through ResizeObserver, reads both axes before writes, and cleans up', () => {
  const effects = [], observers = [], log = [], listeners = new Map();
  const react = {
    createElement: () => ({}), useCallback: fn => fn,
    useRef: current => ({ current }),
    useState: initial => [initial, update => { initial = typeof update === 'function' ? update(initial) : update; }],
    useEffect: setup => effects.push(setup),
  };
  class Observer {
    constructor(callback) { this.callback = callback; this.nodes = []; observers.push(this); }
    observe(node) { this.nodes.push(node); }
    disconnect() { this.disconnected = true; }
  }
  const exports = {};
  runInNewContext(compiled, {
    exports, require: id => { assert.equal(id, 'react'); return react; },
    ResizeObserver: Observer, MutationObserver: Observer, window: { clearTimeout },
  });
  const child = {};
  const viewport = {
    children: [child],
    get clientWidth() { log.push('read:x-view'); return 100; },
    get scrollWidth() { log.push('read:x-full'); return 100; },
    get clientHeight() { log.push('read:y-view'); return 100; },
    get scrollHeight() { log.push('read:y-full'); return 200; },
    addEventListener: (name, fn) => listeners.set(name, fn),
    removeEventListener: name => listeners.delete(name),
  };
  const hook = exports.useOverlayScroll();
  hook.root.current = { toggleAttribute: name => log.push(`write:${name}`), querySelector: () => null };
  hook.setViewport(viewport);
  const cleanup = effects[0]();
  assert.deepEqual(log, [], 'initial setup must not force synchronous geometry');
  assert.deepEqual(observers[0].nodes, [viewport, child]);
  observers[0].callback();
  assert.deepEqual(log, ['read:x-view', 'read:x-full', 'read:y-view', 'read:y-full', 'write:data-overflow-x', 'write:data-overflow-y']);
  cleanup();
  assert.equal(listeners.size, 0);
  assert.ok(observers.every(observer => observer.disconnected));
});

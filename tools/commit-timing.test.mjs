import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';

const source = readFileSync(new URL('../packages/core/react/behaviour/commit.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source.replace(/^import .* from 'react';$/m, ''), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { waitMinimum } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);

test('minimum beat retries early timers until its monotonic deadline', async (t) => {
  let now = 0;
  const delays = [];
  t.mock.method(performance, 'now', () => now);
  t.mock.method(globalThis, 'setTimeout', (callback, delay) => {
    delays.push(delay);
    now += delays.length === 1 ? delay - 0.6 : delay;
    callback();
    return 0;
  });
  await waitMinimum(0, 200);
  assert.ok(now >= 200);
  assert.deepEqual(delays, [200, 1]);
});

test('both visibility beats start after the rendered phase commits and reaches a frame', () => {
  assert.match(source, /useLayoutEffect\([\s\S]*requestAnimationFrame\([\s\S]*resolve\(performance.now\(\)\)/);
  assert.match(source, /const start = await pendingPaint;[\s\S]*waitMinimum\(start, min\)/);
  assert.match(source, /const confirmedStart = await confirmedPaint;[\s\S]*waitMinimum\(confirmedStart,/);
  assert.match(source, /cancelAnimationFrame\(frame\)/);
  assert.match(source, /resolve\(null\)/);
});

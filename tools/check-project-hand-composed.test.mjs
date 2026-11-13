import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const CHECK = fileURLToPath(new URL('../packages/core/tools/check-project.mjs', import.meta.url));

const handComposed = (source) => {
  const dir = mkdtempSync(join(tmpdir(), 'dl-hand-composed-'));
  try {
    mkdirSync(join(dir, 'src'));
    writeFileSync(join(dir, 'src', 'View.tsx'), `import { Section, Card, Dialog, Heading, Button, Image, Stack, Text } from '@design-library/core/components';\nexport const V = () => <>\n${source}\n</>;\n`);
    const out = JSON.parse(execFileSync(process.execPath, [CHECK, '--src', 'src', '--json'], { cwd: dir, encoding: 'utf8' }));
    return out.findings.filter((f) => f.rule === 'hand-composed').map((f) => f.message.split(' ').slice(0, 4).join(' '));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

test('a compound given, as a direct child, the part one of its left-out props defines is hand-composed', () => {
  assert.deepEqual(handComposed('<Section><Heading level={2}>A</Heading></Section>'), ['Section is given a']);
  assert.deepEqual(handComposed('<Card title="t"><Image src="a" alt="" /></Card>'), ['Card is given an']);
  assert.deepEqual(handComposed('<Dialog open title="d" onClose={f}><Text>x</Text>{ok && <Button label="Go" />}</Dialog>'), ['Dialog is given a']);
});

test('body content is not: the prop is used, the part sits deeper, or a nested compound holds it', () => {
  assert.deepEqual(handComposed('<Section heading="h"><Heading level={3}>sub</Heading></Section>'), []);
  assert.deepEqual(handComposed('<Dialog open title="d" onClose={f} actions={<Button label="ok" />}><Button label="copy" /></Dialog>'), []);
  assert.deepEqual(handComposed('<Dialog open title="d" onClose={f}><Stack><Button label="clear" /></Stack></Dialog>'), []);
  assert.deepEqual(handComposed('<Section heading="h"><Card title="c"><Heading level={4}>x</Heading></Card></Section>'), []);
});

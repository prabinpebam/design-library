import { useMemo, useState } from 'react';
import { brandContrast, brandVars, type Brand } from '../../theme';
import { Stack } from '../fundamentals/Stack';
import { Text } from '../fundamentals/Text';
import { Cluster } from '../fundamentals/Cluster';
import { List } from '../fundamentals/List';
import { SegmentedControl } from '../fundamentals/SegmentedControl';
import { Switch } from '../fundamentals/Switch';
import { ContextMatrix } from '../compounds/ContextMatrix';
import { ScreenPreview } from '../compounds/ScreenPreview';

/** The four bright seeds the guard is measured on (IP21, IV3). */
const SEEDS = [
  { value: '#fd6f02', label: 'Orange' },
  { value: '#ffd400', label: 'Yellow' },
  { value: '#7ed957', label: 'Green' },
  { value: '#00b3ff', label: 'Blue' },
];

const columns = [
  { id: 'light', label: 'Light', scheme: 'light', contrast: 'standard' },
  { id: 'dark', label: 'Dark', scheme: 'dark', contrast: 'standard' },
  { id: 'more', label: 'Light, more contrast', scheme: 'light', contrast: 'more' },
] as const;

const PAIRS = [
  { id: 'link', label: 'Link on the page' },
  { id: 'link on raised', label: 'Link on a raised surface' },
  { id: 'accent text', label: 'Accent words on the page' },
  { id: 'accent display', label: 'Accent display words on the page' },
  { id: 'on accent', label: 'Label on the accent fill' },
  { id: 'on accent hover', label: 'Label on the hover fill' },
  { id: 'on accent pressed', label: 'Label on the pressed fill' },
  { id: 'focus', label: 'Focus ring on the page' },
];

/**
 * The contrast guard on the Colour page (IP21): pick a bright seed, pin it at step 500 the way a site pins its exact
 * brand colour, switch the guard on and read each pair in light, dark and more contrast, with a template screen drawn
 * under the same brand through `applyBrand` on its root.
 */
export function BrandGuard() {
  const [seed, setSeed] = useState('#ffd400');
  const [pinned, setPinned] = useState(true);
  const [guard, setGuard] = useState(false);
  const brand: Brand = useMemo(
    () => ({ colours: { 1: { seed, ...(pinned ? { pins: { 500: seed } } : {}) } }, contrast: guard ? 'guard' : 'keep' }),
    [seed, pinned, guard],
  );
  const pairs = useMemo(() => brandContrast(brand), [brand]);
  const { warnings } = useMemo(() => brandVars(brand), [brand]);
  const measure = (scheme: string, id: string) => {
    const p = pairs.find((x) => x.scheme === scheme && x.pair === id);
    return p ? `${p.fg} on ${p.bg}: ${p.ratio.toFixed(1)}:1, ${p.pass ? 'passes' : 'fails'} ${p.needs}:1` : '';
  };
  const query = `seed=${encodeURIComponent(seed)}${pinned ? '&pin=1' : ''}${guard ? '&guard=1' : ''}`;
  return (
    <Stack gap="group">
      <Cluster gap="group">
        <SegmentedControl label="Seed" options={SEEDS.map((s) => ({ value: s.value, label: `${s.label} ${s.value}` }))} value={seed} onChange={setSeed} />
        <Switch label="Pin the seed at step 500" checked={pinned} onChange={setPinned} />
        <Switch label="Contrast guard" checked={guard} onChange={setGuard} />
      </Cluster>
      <ContextMatrix
        label="Accent pairs by context"
        rowHeader="Pair"
        columns={[...columns]}
        rows={PAIRS.map((p) => ({
          id: p.id,
          label: p.label,
          cells: Object.fromEntries(columns.map((c) => [c.id, <Text variant="body-sm">{measure(c.scheme, p.id)}</Text>])),
        }))}
      />
      {warnings.length ? (
        <List items={warnings.map((w, i) => ({ id: String(i), content: w }))} />
      ) : (
        <Text variant="body-sm" tone="muted">
          Every pair passes at the theme’s steps.
        </Text>
      )}
      <ScreenPreview src={`site.html?${query}#/app/harbour/home`} title={`Harbour home with the accent ${seed}`} caption="Harbour’s home under the same brand, applied on the screen’s root." />
    </Stack>
  );
}

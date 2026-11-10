/**
 * Icon libraries (F17, owner Q36): pick which curated MIT or Apache-2.0 library draws the library's semantic icon names,
 * and its style; every name drawn live with where it came from; a card per library; and the name-by-name mapping with
 * its gaps. Reads core's generated index (packages/core/icons/sets/index.json); choices are kept in this browser only.
 */
import { useEffect } from 'react';
import { Button, Cluster, Code, DataTable, Grid, Heading, Icon, Link, RowList, SegmentedControl, Select, Stack, Text } from '@design-library/core/components';
import { excludedIconSets, glyphFor, iconSetNames, isIconSetLoaded, iconSetOf, iconSets, loadIconSet, useIconSetVersion, type IconSetInfo } from '@design-library/core/icons';
import type { IconName } from '@design-library/core/components';
import { chooseIcons, useIcons } from '../data/icons';

const names = iconSetNames as IconName[];
const OWN = '';
const sample: IconName[] = ['search', 'copy', 'comment', 'warning', 'success', 'scheme-dark'];
const kb = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`;
const coverage = (s: IconSetInfo) => s.styles.map((st) => `${st.label} ${st.covered} of ${iconSetNames.length}`).join(' · ');

/** The library and its style, then every semantic name drawn in them. */
export function IconChooser() {
  const choice = useIcons();
  const info = iconSetOf(choice.set);
  return (
    <Stack gap="group">
      <Cluster gap="group" align="start">
        <Select
          label="Icon library"
          hint={info ? `${info.licence}, by ${info.author}. Kept in this browser only.` : 'The library’s own outline set, drawn for this project. Kept in this browser only.'}
          options={[{ value: OWN, label: 'The library’s own (the theme’s)' }, ...iconSets.map((s) => ({ value: s.id, label: `${s.name} · ${s.licence}` }))]}
          value={choice.set ?? OWN}
          onChange={(v) => chooseIcons(v || null)}
        />
        {info && (
          <Stack gap="pair">
            <Text as="span" variant="body-sm" tone="muted">
              Style
            </Text>
            <SegmentedControl label="Style" size="normal" options={info.styles.map((st) => ({ value: st.id, label: st.label }))} value={choice.style ?? info.styles[0].id} onChange={(v) => chooseIcons(info.id, v)} />
          </Stack>
        )}
      </Cluster>
      <Grid max={4}>
        {names.map((name) => {
          const hit = glyphFor(name);
          const from = !info ? 'Own outline' : !isIconSetLoaded(info.id) ? 'Loading…' : !hit ? 'Library’s own (gap)' : hit.fallback ? `${hit.glyph.from}, from ${info.styles[0].label}` : hit.glyph.from;
          return (
            <Cluster key={name} gap="item" align="center" wrap={false}>
              <Icon name={name} size="lg" />
              <Stack gap="pair">
                <Code>{name}</Code>
                <Text as="span" variant="body-sm" tone="muted">
                  {from}
                </Text>
              </Stack>
            </Cluster>
          );
        })}
      </Grid>
      {info && (
        <Cluster gap="item">
          <Button label="Back to the theme’s own" onClick={() => chooseIcons(null)} />
        </Cluster>
      )}
    </Stack>
  );
}

/** One card per library, like the font list: its icons, name, what it is, who made it and the licence, styles and coverage. */
export function IconSetList() {
  useIconSetVersion();
  const choice = useIcons();
  useEffect(() => {
    iconSets.forEach((s) => void loadIconSet(s.id));
  }, []);
  return (
    <Stack gap="group">
      <RowList
        specimen="large"
        align="stretch"
        columns={['facts', 1]}
        rows={iconSets.map((s) => ({
          id: s.id,
          cells: [
            <Cluster gap="item" align="center">
              {sample.map((n) => (
                <Icon key={n} name={n} size="lg" from={{ set: s.id, style: s.styles[0].id }} />
              ))}
            </Cluster>,
            [
              <Heading level={3} size={3}>
                {s.name}
              </Heading>,
              <Text>{s.description}</Text>,
              <Text variant="body-sm" tone="muted">
                {`${s.author}. `}
                <Link href={s.licenceUrl} external>
                  {s.licence}
                </Link>
              </Text>,
              <Text variant="body-sm" tone="muted">
                {coverage(s)}
              </Text>,
              <Text variant="body-sm" tone="muted">
                {`${s.package} ${s.version}; subset to ${iconSetNames.length} names, ${kb(s.bytes)}, loaded only when chosen`}
              </Text>,
              <Cluster gap="item">
                <Button label={choice.set === s.id ? 'In use' : 'Use this library'} disabled={choice.set === s.id} onClick={() => chooseIcons(s.id)} />
              </Cluster>,
            ],
          ],
        }))}
      />
      <Text variant="body-sm" tone="muted">
        {`Not offered: ${excludedIconSets.map((x) => `${x.name} (${x.reason})`).join(' ')}`}
      </Text>
    </Stack>
  );
}

/** Each semantic name and the icon each library draws it with; a gap names its fallback. */
export function IconCoverage() {
  return (
    <DataTable
      label="Semantic names by library"
      columns={[{ key: 'name', header: 'Name' }, ...iconSets.map((s) => ({ key: s.id, header: s.name }))]}
      rows={names.map((name) => ({
        id: name,
        cells: {
          name: <Code>{name}</Code>,
          ...Object.fromEntries(
            iconSets.map((s) => {
              const gaps = s.styles.filter((st) => st.gaps.includes(name));
              const text = gaps.length === s.styles.length ? 'Gap: the library’s own' : gaps.length ? `Missing in ${gaps.map((g) => g.label).join(', ')}: ${s.styles[0].label} instead` : '✓';
              return [s.id, <Text as="span" variant="body-sm" tone={gaps.length ? 'muted' : 'default'}>{text}</Text>];
            }),
          ),
        },
      }))}
    />
  );
}
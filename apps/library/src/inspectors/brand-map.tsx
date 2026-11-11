/**
 * The brand map (Q132, trial Q133): which brand colour each part of the UI reads, edited as a board with one column
 * per brand colour and Neutral. Group cards hold their parts; drag a card or a part, or use its Move menu. A specimen
 * row of real components shows the result live. Made only of core components; the map lives in data/brand.ts and its
 * rules in data/brand-map.ts.
 */
import { useState } from 'react';
import { Badge, Board, Button, Checkbox, Cluster, Heading, Icon, Link, MenuButton, Progress, Rating, SegmentedControl, Stack, Switch, Text, Chip, Tabs, type BoardColumn } from '@design-library/core/components';
import { cardsIn, groups, mapPresets, type Column, type GroupId } from '../data/brand-map';
import { gatherGroup, moveGroup, movePart, nameOf, resetMap, setAccessibleStandard, setMapPreset, slots, undoBrand, useBrand, useForActions, type Slot } from '../data/brand';
import { INSPECTORS, rev } from '../revisions/target';

const MAP = 'apps/library/src/data/brand-map.ts';

function Specimens() {
  const [on, setOn] = useState(true);
  const [checked, setChecked] = useState(true);
  const [segment, setSegment] = useState('week');
  const [chip, setChip] = useState(true);
  const [stars, setStars] = useState<number | null>(4);
  return (
    <Stack gap="group">
      <Cluster gap="group" align="center">
        <Button label="Add to bag" emphasis="primary" />
        <Switch label="Delivery updates" checked={on} onChange={setOn} />
        <Checkbox label="Assembly service" checked={checked} onChange={setChecked} />
        <SegmentedControl label="View" emphasis="accent" options={[{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]} value={segment} onChange={setSegment} />
      </Cluster>
      <Cluster gap="group" align="center">
        <Chip label="In stock" kind="filter" selected={chip} onChange={setChip} />
        <Badge tone="accent" emphasis="strong">
          Member price
        </Badge>
        <Badge tone="highlight">New</Badge>
        <Link href="#/colour">Delivery and returns</Link>
        <Rating label="Rating" hideLabel value={stars} onChange={setStars} size="s" />
      </Cluster>
      <Cluster gap="group" align="center">
        <Progress label="Saving your list" form="bar" value={60} />
      </Cluster>
      <Tabs
        label="Product details"
        items={[
          { id: 'details', label: 'Details', panel: <Text variant="body-sm">Sturdy birch veneer, 80 × 40 cm.</Text> },
          { id: 'measurements', label: 'Measurements', panel: <Text variant="body-sm">Width 80 cm, depth 40 cm, height 74 cm.</Text> },
          { id: 'reviews', label: 'Reviews', panel: <Text variant="body-sm">4.6 out of 5 from 212 reviews.</Text> },
        ]}
      />
    </Stack>
  );
}

export function BrandMapEditor() {
  const { brand, map, undo } = useBrand();
  if (!map) return null;
  const defined = slots.filter((s) => brand.colours[s]);
  const titleOf = (c: Column) => (c === 'neutral' ? 'Neutral' : `${c} ${nameOf(brand, c)}`);
  const preset = map.preset === 'custom' ? 'Custom' : (mapPresets.find((p) => p.id === map.preset)?.name ?? map.preset);
  const columns: BoardColumn[] = [...defined, 'neutral' as const].map((c) => ({
    id: c,
    title: titleOf(c),
    swatch: c === 'neutral' ? undefined : brand.colours[c as Slot]!.seed,
    tag: map.actionColumn === c ? 'Actions' : undefined,
    note: c === 'neutral' ? 'Shows the plain look' : undefined,
    emptyText: c === 'neutral' ? 'Empty: every part takes a brand colour.' : undefined,
    actions: c !== 'neutral' && map.actionColumn !== c ? [{ value: 'actions', label: 'Use for actions' }] : undefined,
    cards: cardsIn(map, c).map(({ group, here, total }) => ({
      id: `${group.id}@${c}`,
      title: group.name,
      meta: here.length < total ? `${here.length} of ${total}` : String(total),
      actions: here.length < total ? [{ value: 'gather', label: `Gather all ${total} here` }] : undefined,
      items: here.map((r) => ({ id: r.part.id, title: r.part.name, swatch: r.swatch, note: r.note, noteTone: r.noteTone })),
    })),
  }));
  const groupName = (id: string) => groups.find((g) => g.id === id)?.name ?? id;
  return (
    <Stack gap="group" {...rev({ kind: 'section', identity: { section: 'brand-map' }, sources: [MAP, INSPECTORS] })}>
      <Stack gap="pair">
        <Heading level={3} size={4}>
          Brand map
        </Heading>
        <Text variant="body-sm" tone="muted">
          Which colour each part of the UI reads. Drag a group or a part to another colour, or use its menu. Status, text and surfaces never take a brand colour.
        </Text>
      </Stack>
      <Cluster gap="group" align="center">
        <MenuButton
          label={`Arrangement: ${preset}`}
          menuLabel="Brand map arrangements"
          items={mapPresets.map((p) => ({ value: p.id, label: p.name, description: p.description }))}
          onSelect={(id) => setMapPreset(id as (typeof mapPresets)[number]['id'])}
        />
        <Button label="Reset" emphasis="quiet" onClick={resetMap} />
        {undo?.scope === 'map' && (
          <Cluster gap="pair" align="center">
            <Text as="span" variant="body-sm">
              {undo.message}
            </Text>
            <Button label="Undo" emphasis="quiet" size="s" onClick={undoBrand} />
          </Cluster>
        )}
      </Cluster>
      <Switch
        label="Accessible steps in standard contrast"
        description="Off: buttons and marks show the brand colours as they are, with darker or lighter steps for hover and pressed. More contrast always uses the accessible steps."
        checked={map.accessible}
        onChange={setAccessibleStandard}
      />
      {map.notes.map((n) => (
        <Cluster key={n} gap="pair" wrap={false} align="start">
          <Icon name="warning" size="sm" label="Note" />
          <Text variant="body-sm">{n}</Text>
        </Cluster>
      ))}
      <Stack gap="pair">
        <Text variant="caption" tone="muted">Standard contrast</Text>
        <Specimens />
      </Stack>
      <Stack gap="pair" data-contrast="more">
        <Text variant="caption" tone="muted">More contrast</Text>
        <Specimens />
      </Stack>
      <Board
        label="Brand map"
        headingLevel={4}
        ordered={false}
        columns={columns}
        emptyText="Identity only. Drag parts here to use this colour in the UI."
        onMove={(cardId, to) => {
          const [group, from] = cardId.split('@');
          moveGroup(group as GroupId, from as Column, to as Column, groupName(group));
        }}
        onMoveItem={(id, to) => movePart(id, to as Column)}
        onCardAction={(cardId, value) => {
          const [group, at] = cardId.split('@');
          if (value === 'gather') gatherGroup(group as GroupId, at as Column, groupName(group));
        }}
        onColumnAction={(c) => useForActions(c as Slot)}
      />
    </Stack>
  );
}

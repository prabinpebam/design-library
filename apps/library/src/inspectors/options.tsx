/**
 * Space and shape options (F12, O53-O55): the four options of each side by side, each preview switched with
 * data-space or data-shape, their values in one table, and the control that previews the whole library in one.
 */
import { Badge, Button, Checkbox, Cluster, Code, DataTable, Grid, Heading, SegmentedControl, Select, Stack, Switch, Text, TextField } from '@design-library/core/components';
import { useSpaceShape } from '../data/contexts';
import { shapeOptions, spaceOptions, themeSpaceShape, type ShapeOption, type SpaceOption, type ThemeOption } from '../data/tokens';
import { rev } from '../revisions/target';
import { Example } from './specimens';

const OPTIONS = 'packages/core/tokens/space-shape-options.json';
const CONFIG = 'packages/core/tokens/space-shape.config.json';
const SOURCE = 'apps/library/src/inspectors/options.tsx';
const noop = () => undefined;

const px = (value: string) => {
  const m = /^([\d.]+)(rem|px)$/.exec(value);
  if (!m) return value;
  const n = Number(m[1]) * (m[2] === 'rem' ? 16 : 1);
  return n >= 999 ? 'Pill' : `${n} px`;
};
/** A scale step's size in pixels, e.g. space.4 → 16 px; space.0-5 → 2 px. */
const stepPx = (step: string) => {
  const n = step.replace('space.', '').replace('-', '.');
  return `${Number(n) * 4} px`;
};

/** Who an option is for, said once under its name; "the theme's own" marks the default. */
const title = <Id extends string>(o: ThemeOption<Id>, theme: Id) => (o.id === theme ? `${o.label} (the theme’s own)` : o.label);

function Values<Id extends string>({ label, options, show }: { label: string; options: ThemeOption<Id>[]; show: (v: string) => string }) {
  const roles = Object.keys(options[0].values);
  return (
    <DataTable
      label={label}
      columns={[{ key: 'role', header: 'Role' }, ...options.map((o) => ({ key: o.id, header: o.label }))]}
      rows={roles.map((role) => ({ id: role, cells: { role: <Code>{role}</Code>, ...Object.fromEntries(options.map((o) => [o.id, show(o.values[role])])) } }))}
      {...rev({ kind: 'section', identity: { group: label }, sources: [OPTIONS, SOURCE] })}
    />
  );
}

function PreviewChoice<Id extends string>({ what, options, value, theme, onChange }: { what: 'space' | 'shape'; options: ThemeOption<Id>[]; value: Id; theme: Id; onChange: (next: Id) => void }) {
  return (
    <Select
      label={`Preview the whole library in this ${what}`}
      hint={`Every page, the title bar and the navigation follow it until you choose again. Kept in this browser only; a product sets its ${what} in space-shape.config.json.`}
      options={options.map((o) => ({ value: o.id, label: title(o, theme) }))}
      value={value}
      onChange={(next) => onChange(next as Id)}
    />
  );
}

/** The four space options side by side: the same small form in each, then the values. */
export function SpaceOptions() {
  const { space, setSpace } = useSpaceShape();
  return (
    <Stack gap="section">
      <PreviewChoice what="space" options={spaceOptions} value={space} theme={themeSpaceShape.space} onChange={(v: SpaceOption) => setSpace(v)} />
      <Grid max={2}>
        {spaceOptions.map((o) => (
          <Example
            key={o.id}
            title={title(o, themeSpaceShape.space)}
            description={o.for}
            code={`<Stack data-space="${o.id}">…</Stack>`}
            preview={{ 'data-space': o.id }}
            target={{ identity: { group: 'space', item: o.id }, sources: [OPTIONS, CONFIG, SOURCE] }}
          >
            {() => (
              <Stack gap="group">
                <Stack gap="pair">
                  <Heading level={4} size={4}>
                    Delivery address
                  </Heading>
                  <Text variant="body-sm" tone="muted">
                    Where should we send your order?
                  </Text>
                </Stack>
                <TextField label="Street" value="12 Lake Road" onCommit={noop} />
                <TextField label="City" value="Imphal" onCommit={noop} />
                <Cluster gap="item">
                  <Button label="Save address" emphasis="primary" />
                  <Button label="Cancel" />
                </Cluster>
              </Stack>
            )}
          </Example>
        ))}
      </Grid>
      <Values label="Space roles by option" options={spaceOptions} show={stepPx} />
    </Stack>
  );
}

const sizes = [
  { value: 's', label: 'Small' },
  { value: 'm', label: 'Medium' },
];

/** The four shape options side by side: the same controls and marks in each, then the values. */
export function ShapeOptions() {
  const { shape, setShape } = useSpaceShape();
  return (
    <Stack gap="section">
      <PreviewChoice what="shape" options={shapeOptions} value={shape} theme={themeSpaceShape.shape} onChange={(v: ShapeOption) => setShape(v)} />
      <Grid max={2}>
        {shapeOptions.map((o) => (
          <Example
            key={o.id}
            title={title(o, themeSpaceShape.shape)}
            description={o.for}
            code={`<Stack data-shape="${o.id}">…</Stack>`}
            preview={{ 'data-shape': o.id }}
            target={{ identity: { group: 'shape', item: o.id }, sources: [OPTIONS, CONFIG, SOURCE] }}
          >
            {() => (
              <Stack gap="group">
                <Cluster gap="item">
                  <Button label="Save" emphasis="primary" />
                  <Button label="Cancel" />
                  <Badge>New</Badge>
                </Cluster>
                <TextField label="Name" value="Lake view" onCommit={noop} />
                <Cluster>
                  <SegmentedControl label="Size" options={sizes} value="m" onChange={noop} size="xs" />
                </Cluster>
                <Checkbox label="Send a receipt" checked onChange={noop} />
                <Switch label="Notifications" checked onChange={noop} />
              </Stack>
            )}
          </Example>
        ))}
      </Grid>
      <Values label="Radius roles by option" options={shapeOptions} show={px} />
    </Stack>
  );
}

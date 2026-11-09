/**
 * Typography (F16, owner Q35): font roles with their faces, presets, a picker per role, live axis controls for the
 * chosen face, and the ramp. Everything reads the font registry (packages/core/fonts/registry.json); choices preview
 * the whole library in this browser and are never written to source.
 */
import { useState } from 'react';
import { Button, Cluster, Code, Grid, Heading, RowList, SegmentedControl, Select, Slider, Stack, Switch, Text, TokenSpecimen } from '@design-library/core/react';
import { fontFaces, fontPresets, fontRoles, isBinaryAxis, type FontFace, type FontRoleId } from '@design-library/core/fonts';
import { sourceRole, themePreset, useType } from '../data/type';
import { resolveLiteral } from '../data/tokens';

const roleLabel = (id: FontRoleId) => fontRoles.find((r) => r.id === id)?.label ?? id;

/** "Weight 100 to 900, optical size 14 to 32; italic": what a face can do, in a line. */
const axesLine = (f: FontFace) =>
  `${f.axes.map((a, i) => `${i ? a.label.toLowerCase() : a.label} ${isBinaryAxis(a) ? 'on or off' : `${a.min} to ${a.max}`}`).join(', ')}${f.italic ? '; italic' : ''}`;

/** Presets, then the face for each role. */
export function TypeChooser() {
  const t = useType();
  const custom = 'custom';
  return (
    <Stack gap="group">
      <Cluster gap="item">
        <Select
          label="Preset"
          hint={t.preset ? t.preset.for : 'Your own mix: change any face below, or pick a preset to start again.'}
          options={[...fontPresets.map((p) => ({ value: p.id, label: p.default ? `${p.name} (the theme’s own)` : p.name })), ...(t.preset ? [] : [{ value: custom, label: 'Custom' }])]}
          value={t.preset?.id ?? custom}
          onChange={(v) => v !== custom && t.usePreset(v)}
        />
      </Cluster>
      <Grid max={2}>
        {fontRoles.map((role) => {
          const own = t.choice.roles[role.id];
          const above = role.collapsesTo;
          const options = [
            ...(role.id === 'code' ? [{ value: '', label: 'System monospace' }] : above ? [{ value: '', label: `Same as ${roleLabel(above).toLowerCase()}` }] : []),
            ...fontFaces.filter((f) => (role.id === 'code' ? f.classification === 'mono' : true)).map((f) => ({ value: f.id, label: f.name })),
          ];
          return (
            <Select
              key={role.id}
              label={`${role.label} face`}
              hint={role.function}
              options={options}
              value={own ?? ''}
              onChange={(v) => t.setFace(role.id, v || null)}
            />
          );
        })}
      </Grid>
      <Text variant="body-sm" tone="muted">
        {t.isTheme
          ? `The library shows the theme’s own fonts (${themePreset.name}). Every page follows a change here, kept in this browser only.`
          : 'Every page now shows this choice, kept in this browser only; a product sets its fonts in its theme tokens.'}
      </Text>
      {!t.isTheme && (
        <Cluster gap="item">
          <Button label="Back to the theme’s own" onClick={t.reset} />
        </Cluster>
      )}
    </Stack>
  );
}

/** One row per role: its face's shapes, name, job, a line in it, who made it and the licence, what it can do, its CSS variable. */
export function TypeFaceList() {
  const t = useType();
  return (
    <RowList
      specimen="large"
      align="stretch"
      columns={['facts', 1]}
      rows={fontRoles.map((role) => {
        const face = t.faces[role.id];
        const from = sourceRole(t.choice.roles, role.id);
        const shared = from !== role.id;
        return {
          id: role.id,
          cells: [
            <TokenSpecimen kind="font" token={role.variable} />,
            [
              <Heading level={3} size={3}>
                {face ? face.name : 'System monospace'}
              </Heading>,
              <Text>
                {`${role.label}: ${role.function.charAt(0).toLowerCase()}${role.function.slice(1)}`}
                {shared ? `. Same face as ${roleLabel(from).toLowerCase()}.` : ''}
              </Text>,
              <TokenSpecimen kind="font" token={role.variable}>
                {face?.sample ?? 'gap: var(--space-stack-group);'}
              </TokenSpecimen>,
              <Text variant="body-sm" tone="muted">
                {face ? face.description : 'The operating system’s own monospace: nothing to load; a proportional face never sets code.'}
              </Text>,
              <Text variant="body-sm" tone="muted">
                {face ? `${face.designer}, ${face.licence}` : 'Ships with the system'}
              </Text>,
              <Text variant="body-sm" tone="muted">
                {face ? axesLine(face) : 'Its own fixed weights'}
              </Text>,
              <Code>{role.variable}</Code>,
            ],
          ],
        };
      })}
    />
  );
}

/** The chosen face of one role, live: a slider per range axis and a Switch per on-off axis, from the registry. */
export function TypePlay() {
  const t = useType();
  const [role, setRole] = useState<FontRoleId>('display');
  const from = sourceRole(t.choice.roles, role);
  const face = t.faces[role];
  const axes = t.choice.axes[from] ?? {};
  return (
    <Stack gap="group">
      <Cluster gap="item">
        <SegmentedControl label="Role" options={fontRoles.map((r) => ({ value: r.id, label: r.label }))} value={role} onChange={(v) => setRole(v as FontRoleId)} />
      </Cluster>
      <Grid max={2}>
        <Stack gap="item">
          <TokenSpecimen kind="type" token={role === 'display' ? '--type-display' : role === 'code' ? '--type-code' : '--type-body'} family={`--font-${role}`}>
            {face?.sample ?? 'gap: var(--space-stack-group);'}
          </TokenSpecimen>
          <Text variant="body-sm" tone="muted">
            {face ? `${face.name}${from !== role ? `, from ${roleLabel(from).toLowerCase()}` : ''}. Changes apply to every page at once.` : 'The system monospace has no axes to play with.'}
          </Text>
        </Stack>
        <Stack gap="group">
          {face?.axes.map((a) =>
            isBinaryAxis(a) ? (
              <Switch key={a.tag} label={`${a.label} (${a.tag})`} checked={(axes[a.tag] ?? a.default) === 1} onChange={(on) => t.setAxis(from, a.tag, on ? 1 : 0)} />
            ) : (
              <Slider key={a.tag} label={`${a.label} (${a.tag})`} min={a.min} max={a.max} step={a.step} value={axes[a.tag] ?? a.default} onChange={(v) => t.setAxis(from, a.tag, v)} />
            ),
          )}
          {face && face.axes.length === 0 && <Text tone="muted">This face has fixed weights only.</Text>}
          {face && Object.keys(axes).length > 0 && (
            <Cluster gap="item">
              <Button label="Reset the axes" onClick={() => face.axes.forEach((a) => t.setAxis(from, a.tag, null))} />
            </Cluster>
          )}
        </Stack>
      </Grid>
    </Stack>
  );
}

const ramp: { step: string; style: string; family: FontRoleId; sample: string }[] = [
  { step: 'jumbo', style: 'jumbo', family: 'display', sample: '42' },
  { step: 'xxxxl', style: 'display', family: 'display', sample: 'A landing title' },
  { step: 'xxxl', style: 'heading-1', family: 'display', sample: 'A page title' },
  { step: 'xxl', style: 'heading-2', family: 'display', sample: 'A section heading' },
  { step: 'xl', style: 'heading-3', family: 'display', sample: 'A group heading' },
  { step: 'l', style: 'heading-4', family: 'display', sample: 'A small heading' },
  { step: 'm', style: 'body', family: 'text', sample: 'Every value comes from a token, so one theme change reaches every screen.' },
  { step: 'm', style: 'label', family: 'ui', sample: 'Notification settings' },
  { step: 's', style: 'body-sm', family: 'text', sample: 'Secondary text beside the main point.' },
  { step: 's', style: 'caption', family: 'ui', sample: 'Updated 2 minutes ago' },
  { step: 's', style: 'code', family: 'code', sample: 'var(--color-text)' },
  { step: 'xs', style: '', family: 'ui', sample: '' },
];

const px = (v: string) => {
  const m = /^([\d.]+)rem$/.exec(v);
  return m ? `${Number(m[1]) * 16} px` : v;
};

/** The ramp, top step first: each style at its real size in its role's face, with its step, size, line height, weight and tracking. */
export function TypeRamp() {
  return (
    <RowList
      ordered
      specimen="large"
      columns={['facts', 1]}
      rows={ramp
        .filter((r) => r.style)
        .map(({ step, style, family, sample }) => {
          const part = (p: string) => resolveLiteral(`type.${style}.${p}`);
          const tracking = part('tracking');
          return {
            id: style,
            cells: [
              [
                <Code>{`text.${step}`}</Code>,
                <Text as="span" variant="body-sm">
                  {`${px(resolveLiteral(`text.${step}`))}, ${style.replace('-', ' ')}`}
                </Text>,
                <Text as="span" variant="body-sm" tone="muted">
                  {`Line height ${part('leading')}, weight ${part('weight')}${tracking ? `, tracking ${tracking}` : ''}; ${roleLabel(family).toLowerCase()} face`}
                </Text>,
              ],
              <TokenSpecimen kind="type" token={`--type-${style}`} family={`--font-${family}`}>
                {sample}
              </TokenSpecimen>,
            ],
          };
        })}
    />
  );
}

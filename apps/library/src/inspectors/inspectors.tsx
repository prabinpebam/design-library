/**
 * Library-app inspectors: above-core tooling that presents token data (O21). They read only semantic tokens and set
 * only data custom properties; core never imports them.
 */
import { useLayoutEffect, useRef, useState } from 'react';
import { Button, Cluster, Code, Heading, Icon, Link, RowList, Stack, StackedBar as CoreStackedBar, Switch, Text, TokenSpecimen } from '@design-library/core/react';
import { colourRoles, contrastPairs, palette, primitiveIn, readable, reducedLiteral, resolveLiteral, statuses, tokenFiles, tokensIn, valueOf, type TokenEntry } from '../data/tokens';
import type { SpecimenContext } from '../data/contexts';
import { ContextMatrix } from './specimens';
import { INSPECTORS, rev, tokenRev } from '../revisions/target';
import { useBrand } from '../data/brand';
import { setMaterial, useMaterial } from '../data/material';
import { catalogue } from '../data/catalogue';
import { pages } from '../data/pages';
import elevation from '../../../../packages/core/principles/elevation.json';
import { changePoints } from '../../../../packages/core/tools/change-points.mjs';

const coreCss = import.meta.glob('../../../../packages/core/css/{fundamentals,compounds,layouts}/*.css', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

const tokenTarget = (t: TokenEntry) => ({ identity: { token: t.css }, sources: [...tokenFiles(t.path), INSPECTORS] });

/**
 * Reads a computed colour from the rendered element, so each context cell reports what it actually shows. Measured again
 * whenever the brand draft changes (F7d), since the draft recolours every role that reads the accent.
 */
function useComputed<T extends HTMLElement>(read: (cs: CSSStyleDeclaration) => string) {
  const ref = useRef<T>(null);
  const [value, setValue] = useState('');
  const { brand } = useBrand();
  useLayoutEffect(() => {
    if (ref.current) setValue(read(getComputedStyle(ref.current)));
  }, [brand]);
  return [ref, value] as const;
}

/** Invariant row label: the token's name and what it is for. */
function TokenLabel({ token }: { token: TokenEntry }) {
  return (
    <Stack gap="pair">
      <Code>{token.css}</Code>
      {token.description && (
        <Text as="span" variant="caption" tone="muted">
          {token.description}
        </Text>
      )}
    </Stack>
  );
}

/**
 * Literal colour ramps that are the same in every context, so shown once: primitives (private), the spectrum or the
 * custom sets (public, non-functional). Each ramp is one revision target owned by the colour config.
 */
export function Palette({ group, only, mark }: { group: 'p' | 'spectrum' | 'set'; only?: string[]; mark?: (name: string) => string | undefined }) {
  return (
    <Stack gap="section">
      {palette(group, only).map(({ id, name, description, tokens }) => (
        <Stack key={id} gap="group" {...rev({ kind: 'token', identity: { group: `--${id.replace(/\./g, '-')}` }, sources: [...tokenFiles(tokens[0].path), INSPECTORS] })}>
          <Cluster gap="group" align="baseline">
            <Heading level={3} size={4}>
              {mark?.(name) ?? name.charAt(0).toUpperCase() + name.slice(1)}
            </Heading>
            <Text as="span" variant="body-sm" tone="muted">
              {description}
            </Text>
          </Cluster>
          <TokenSpecimen kind="ramp" steps={tokens.map((t) => ({ name: t.path.split('.').pop() ?? t.path, token: t.css, value: t.literal ?? '' }))} />
        </Stack>
      ))}
    </Stack>
  );
}

/** The custom sets, each under its name with its declared purpose. */
export function ColourSets() {
  return <Palette group="set" />;
}

/** The minimum each role needs on the page canvas, from the token check. */
const onCanvas = new Map(contrastPairs.filter((p) => p.bg === 'color.bg').map((p) => [p.fg, p.min]));

/** A measured ratio against its minimum: the icon and the number carry it, colour only repeats it. */
function Ratio({ measured, min }: { measured: string; min: number }) {
  const r = measured ? Number(measured) : null;
  if (r == null)
    return (
      <Text as="span" variant="body-sm" tone="muted">
        Not measurable
      </Text>
    );
  const meets = r >= min;
  return (
    <Cluster gap="pair" wrap={false}>
      <Icon name={meets ? 'success' : 'error'} size="sm" label={meets ? `Meets ${min}:1` : `Below ${min}:1`} />
      <Text as="span" variant="body-sm" tone={meets ? 'success' : 'danger'}>
        {r.toFixed(1)}:1
      </Text>
    </Cluster>
  );
}

/** One role in one context: its colour, the ink it reads there, and its contrast on the page canvas when it needs one. */
function RoleCell({ path, context, ink }: { path: string; context: SpecimenContext; ink?: string }) {
  // The swatch's own text colour is the canvas, so both colours come from the same rendered context.
  const [ref, measured] = useComputed<HTMLSpanElement>((cs) => String(ratio(cs.backgroundColor, cs.color) ?? ''));
  const min = onCanvas.get(path);
  return (
    <Cluster gap="pair" wrap={false}>
      <TokenSpecimen ref={ref} kind="colour" token={cssName(path)} />
      <Stack gap="pair">
        <Code>{ink ?? primitiveIn(path, context.scheme, context.contrast)}</Code>
        {min != null && <Ratio measured={measured} min={min} />}
      </Stack>
    </Cluster>
  );
}

export function ColourRoles({ family }: { family: 'brand' | 'base' }) {
  const { roles: draftRoles, brand } = useBrand();
  // Brand roles come from the live draft (F7d): one pair per defined slot, reading the draft's ramps.
  const brandRows: TokenEntry[] = Object.keys(draftRoles).map((path) => ({ path, css: cssName(path), description: path.includes('.on-') ? `Text and marks on brand colour ${path.split('-').pop()}` : `Brand colour ${path.split('.').pop()}${Number(path.split('.').pop()) === brand.accent ? ', the accent' : ''}`, alias: draftRoles[path] }));
  const roles = family === 'brand' ? [...colourRoles(family).filter((t) => !t.path.startsWith('color.brand.')), ...brandRows] : colourRoles(family);
  return (
    <ContextMatrix
      label={family === 'brand' ? 'Brand and accent roles by context' : 'Base colour roles by context'}
      rowHeader="Role"
      rows={roles.map((t) => ({ id: t.path, label: <TokenLabel token={t} />, cell: (c) => <RoleCell path={t.path} context={c} ink={draftRoles[t.path] && cssName(draftRoles[t.path])} />, target: tokenTarget(t) }))}
    />
  );
}

/** One status in one context: a message on its tint with its ratio, and its solid fill with the text on it. */
function StatusCell({ status }: { status: string }) {
  const role = (r: string) => `--color-status-${status}-${r}`;
  const [ref, measured] = useComputed<HTMLSpanElement>((cs) => String(ratio(cs.color, cs.backgroundColor) ?? ''));
  return (
    <Cluster gap="pair" wrap={false}>
      <TokenSpecimen ref={ref} kind="contrast" token={role('fg')} on={role('bg')} />
      <TokenSpecimen kind="contrast" token={role('on-fill')} on={role('fill')} />
      <Ratio measured={measured} min={4.5} />
    </Cluster>
  );
}

const statusNames: Record<string, string> = {
  info: 'Information, notes and tips',
  success: 'Success: also good, positive, done',
  warning: 'Warning: also alert, caution',
  danger: 'Danger: also bad, negative, error, destructive',
  neutral: 'Neutral: no judgement (draft, inactive)',
};

/** The functional set: each status as one row, its five roles drawn together in each context. */
export function StatusRoles() {
  return (
    <ContextMatrix
      label="Functional colours by context"
      rowHeader="Status"
      rows={statuses.map((s) => ({
        id: s,
        target: { identity: { token: `--color-status-${s}` }, sources: ['packages/core/tokens/tokens.light.json', 'packages/core/tokens/tokens.dark.json', INSPECTORS] },
        label: (
          <Stack gap="pair">
            <Code>--color-status-{s}-*</Code>
            <Text as="span" variant="caption" tone="muted">
              {statusNames[s]}
            </Text>
          </Stack>
        ),
        cell: () => <StatusCell status={s} />,
      }))}
    />
  );
}

function parseRgb(value: string): [number, number, number, number] | null {
  const n = value.match(/[\d.]+/g)?.map(Number);
  if (!n || n.length < 3) return null;
  return [n[0], n[1], n[2], n[3] ?? 1];
}

function luminance([r, g, b]: number[]) {
  const [R, G, B] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function ratio(fg: string, bg: string): number | null {
  const a = parseRgb(fg);
  const b = parseRgb(bg);
  if (!a || !b || a[3] < 1 || b[3] < 1) return null;
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** One pair in one context: the sample, and the ratio measured from its computed colours. */
function ContrastCell({ fg, bg, min }: { fg: string; bg: string; min: number }) {
  const [ref, measured] = useComputed<HTMLSpanElement>((cs) => String(ratio(cs.color, cs.backgroundColor) ?? ''));
  return (
    <Cluster gap="pair" wrap={false}>
      <TokenSpecimen ref={ref} kind="contrast" token={cssName(fg)} on={cssName(bg)} />
      <Ratio measured={measured} min={min} />
    </Cluster>
  );
}

const cssName = (path: string) => `--${path.replace(/\./g, '-')}`;

/** The pairs the token check holds on surfaces other than the page canvas (the canvas is measured with each role). */
export function ContrastPairs() {
  return (
    <ContextMatrix
      label="Contrast on other surfaces by context"
      rowHeader="Pair"
      rows={contrastPairs
        .filter((p) => p.bg !== 'color.bg' && !p.fg.startsWith('color.status.'))
        .map((p) => ({
          id: `${p.fg}-${p.bg}`,
          target: { identity: { pair: `${cssName(p.fg)} on ${cssName(p.bg)}` }, sources: ['packages/core/tokens/checks.json', INSPECTORS] },
          label: (
            <Stack gap="pair">
              <Code>{cssName(p.fg)}</Code>
              <Text as="span" variant="caption" tone="muted">
                on <Code>{cssName(p.bg)}</Code>, needs {p.min}:1
              </Text>
            </Stack>
          ),
          cell: () => <ContrastCell fg={p.fg} bg={p.bg} min={p.min} />,
        }))}
    />
  );
}

/** A token group as rows: the name, the value it holds or the token it reads, and its use. */
export function TokenRows({ group, match }: { group: string; match?: string }) {
  const pattern = match ? new RegExp(match) : null;
  return (
    <RowList
      columns={['name', 'value', 1]}
      rows={tokensIn(group)
        .filter((t) => !pattern || pattern.test(t.path))
        .map((t) => ({
          id: t.path,
          data: tokenRev(t.path, t.css),
          cells: [
            <Code>{t.css}</Code>,
            <Code>{valueOf(t)}</Code>,
            <Text as="span" variant="body-sm" tone="muted">
              {t.description}
            </Text>,
          ],
        }))}
    />
  );
}

/** A literal in pixels at the default 16 px root, as people read sizes. */
function px(literal: string): string {
  const rem = literal.match(/^(-?[\d.]+)rem$/);
  if (rem) return `${Math.round(Number(rem[1]) * 16 * 100) / 100} px`;
  const p = literal.match(/^(-?[\d.]+)px$/);
  return p ? `${p[1]} px` : literal;
}

/** Spacing tokens as bars of their own length: the name, the bar, what it holds; a role also says what it's for. */
function Bars({ tokens }: { tokens: TokenEntry[] }) {
  return (
    <RowList
      ordered
      align="center"
      columns={[3, 2, 2, 4]}
      rows={tokens.map((t) => ({
        id: t.path,
        data: tokenRev(t.path, t.css),
        cells: [
          <Code>{t.css}</Code>,
          <TokenSpecimen kind="length" token={t.css} />,
          <Text as="span" variant="body-sm">
            {t.alias ? `${cssName(t.alias)} · ${px(resolveLiteral(t.path))}` : px(t.literal ?? '')}
          </Text>,
          t.alias && (
            <Text as="span" variant="body-sm" tone="muted">
              {t.description}
            </Text>
          ),
        ],
      }))}
    />
  );
}

export const SpaceScale = () => <Bars tokens={tokensIn('space').filter((t) => /^space\.\d+$/.test(t.path))} />;

const relationships: [string, RegExp][] = [
  ['Stack', /^space\.stack-/],
  ['Inline', /^space\.inline-/],
  ['Inset', /^space\.inset-/],
  ['Gutter and page margin', /^space\.(gutter|margin-page)$/],
];

/** The roles by relationship, each a group of bars under its own heading. */
export function SpaceRoles() {
  const roles = tokensIn('space');
  return (
    <Stack gap="section">
      {relationships.map(([name, re]) => (
        <Stack key={name} gap="group">
          <Heading level={3} size={4}>
            {name}
          </Heading>
          <Bars tokens={roles.filter((t) => re.test(t.path))} />
        </Stack>
      ))}
    </Stack>
  );
}

const remOf = (literal: string) => {
  const m = literal.match(/^([\d.]+)(rem|px)$/);
  return m ? Number(m[1]) / (m[2] === 'px' ? 16 : 1) : 0;
};

/** Sizes drawn: small ones as a square of their size, widths as a bar to scale against the widest. */
export function Sizes() {
  const sizes = tokensIn('size');
  const widest = Math.max(...sizes.map((t) => remOf(resolveLiteral(t.path))));
  return (
    <RowList
      align="center"
      columns={[3, 2, 3, 4]}
      rows={sizes.map((t) => {
        const r = remOf(resolveLiteral(t.path));
        return {
          id: t.path,
          data: tokenRev(t.path, t.css),
          cells: [
            <Code>{t.css}</Code>,
            <Text as="span" variant="body-sm">
              {px(resolveLiteral(t.path))}
            </Text>,
            // A size with no length (a share of the screen) draws nothing, but keeps its column.
            r === 0 ? <TokenSpecimen kind="length" share={0} /> : r <= 3 ? <TokenSpecimen kind="size" token={t.css} /> : <TokenSpecimen kind="length" share={(r / widest) * 100} />,
            <Text as="span" variant="body-sm" tone="muted">
              {t.description}
            </Text>,
          ],
        };
      })}
    />
  );
}

/** Specimen beside its name, value and use: one row shape for radii and strokes. */
function Specimens({ group, kind }: { group: string; kind: 'radius' | 'stroke' }) {
  return (
    <RowList
      align="center"
      columns={['specimen', 3, 2, 4]}
      rows={tokensIn(group).map((t) => ({
        id: t.path,
        data: tokenRev(t.path, t.css),
        cells: [
          <TokenSpecimen kind={kind} token={t.css} />,
          <Code>{t.css}</Code>,
          <Text as="span" variant="body-sm">
            {px(t.literal ?? resolveLiteral(t.path))}
          </Text>,
          <Text as="span" variant="body-sm" tone="muted">
            {t.description}
          </Text>,
        ],
      }))}
    />
  );
}

export const Radii = () => <Specimens group="radius" kind="radius" />;
export const Borders = () => <Specimens group="border" kind="stroke" />;

export function StackedBar() {
  return (
    <CoreStackedBar
      label="Stacked bar"
      segments={[
        { id: 'success', label: 'Success', share: 50, status: 'success' },
        { id: 'warning', label: 'Warning', share: 30, status: 'warning' },
        { id: 'danger', label: 'Danger', share: 20, status: 'danger' },
      ]}
    />
  );
}

/** Shadows change with the surface under them, so they're shown in every context. */
/** Q73: the material roles (docs/materials.md MT1-MT10), each drawn over the hardest backdrop in every context. */
const materials = [
  { id: 'canvas', name: 'Canvas', token: '--color-bg', use: 'The page itself' },
  { id: 'sunken', name: 'Sunken', token: '--color-bg-sunken', use: 'Rails, wells, code' },
  { id: 'raised', name: 'Raised', token: '--color-bg-raised', use: 'Cards, panels' },
  { id: 'tint', name: 'Tint', token: '--color-bg-tint', use: 'The current item' },
  { id: 'control', name: 'Control fill', token: '--color-bg-control', use: 'Fields, buttons, chips' },
  { id: 'chrome', name: 'Chrome', token: '--material-chrome-bg', filter: '--material-backdrop', use: 'Bars content scrolls under; frosted when on' },
  { id: 'floating', name: 'Floating', token: '--material-floating-bg', filter: '--material-backdrop', use: 'Popovers, menus, toolbars, notifications; frosted when on' },
  { id: 'modal', name: 'Modal', token: '--color-bg-raised', use: 'Dialogs, over the scrim; always solid' },
  { id: 'scrim', name: 'Scrim', token: '--color-bg-overlay', use: 'Dims what a modal blocks' },
  { id: 'veil', name: 'Media veil', token: '--material-veil', use: 'Dims pictures under controls' },
];

export function Materials() {
  const material = useMaterial();
  return (
    <Stack gap="group">
    <Switch label="Frosted" description="Bars and floating surfaces show a blur of what’s behind them, in every tab and template. Off: every surface is solid." checked={material === 'frosted'} onChange={(on) => setMaterial(on ? 'frosted' : 'solid')} />
    <ContextMatrix
      label="Materials by context"
      rowHeader="Material"
      rows={materials.map((m) => ({
        id: m.id,
        label: (
          <Stack gap="pair">
            <Text>{m.name}</Text>
            <Code>{m.token}</Code>
            <Text variant="caption" tone="muted">{m.use}</Text>
          </Stack>
        ),
        cell: () => <TokenSpecimen kind="material" token={m.token} value={m.filter} />,
        target: { identity: { token: m.token, item: m.id }, sources: ['packages/core/css/materials.css', INSPECTORS] },
      }))}
    />
    </Stack>
  );
}

export function Elevation() {
  return (
    <ContextMatrix
      label="Shadows by context"
      rowHeader="Shadow"
      rows={tokensIn('shadow').map((t) => ({
        id: t.path,
        label: <TokenLabel token={t} />,
        cell: () => <TokenSpecimen kind="shadow" token={t.css} />,
        target: tokenTarget(t),
      }))}
    />
  );
}

const ELEVATION = 'packages/core/principles/elevation.json';

/** Q78: each level of the ladder, its material, layers and cues, drawn in every context from elevation.json. */
export function ElevationLadder() {
  return (
    <ContextMatrix
      label="Elevation ladder by context"
      rowHeader="Level"
      rows={[...elevation.ladder].reverse().map((l) => ({
        id: `level-${l.level}`,
        label: (
          <Stack gap="pair">
            <Text>
              {l.level} {l.name}
            </Text>
            <Text variant="caption" tone="muted">
              {l.use} {l.examples}.
            </Text>
          </Stack>
        ),
        cell: () => <TokenSpecimen kind="elevation" token={l.fill} on={l.on} value={l.shadow ?? undefined} edge={l.edge ?? undefined} />,
        target: { identity: { item: `level-${l.level}` }, sources: [ELEVATION, INSPECTORS] },
      }))}
    />
  );
}

/** Q78: tone, hairline, the two shadows and tint side by side, each with what it says, in every context. */
export function SeparationCues() {
  return (
    <ContextMatrix
      label="Separation cues by context"
      rowHeader="Cue"
      rows={elevation.cues.map((c) => ({
        id: c.id,
        label: (
          <Stack gap="pair">
            <Text>{c.name}</Text>
            <Text variant="caption" tone="muted">
              {c.says}. {c.use}
            </Text>
          </Stack>
        ),
        cell: () => <TokenSpecimen kind="elevation" token={c.fill} on={c.on} value={c.shadow ?? undefined} edge={c.edge ?? undefined} />,
        target: { identity: { item: c.id }, sources: [ELEVATION, INSPECTORS] },
      }))}
    />
  );
}

/** Plays on request only, and plays back on the next press. */
function usePlay() {
  const [played, setPlayed] = useState(false);
  return [played, () => setPlayed((p) => !p)] as const;
}

export function Easings() {
  const [played, toggle] = usePlay();
  return (
    <Stack gap="group">
      <Cluster>
        <Button label="Play the easings" onClick={toggle} />
      </Cluster>
      <RowList
        align="center"
        columns={['specimen', 3, 3, 3, 4]}
        rows={tokensIn('easing').map((t) => ({
          id: t.path,
          data: tokenRev(t.path, t.css),
          cells: [
            <TokenSpecimen kind="easing" token={t.css} value={t.literal} played={played} />,
            <Code>{t.css}</Code>,
            <Text as="span" variant="body-sm">
              cubic-bezier({t.literal})
            </Text>,
            <Text as="span" variant="body-sm" tone="muted">
              {t.description}
            </Text>,
          ],
        }))}
      />
    </Stack>
  );
}

export function Durations() {
  const [played, toggle] = usePlay();
  return (
    <Stack gap="group">
      <Cluster>
        <Button label="Play the durations" onClick={toggle} />
      </Cluster>
      <RowList
        align="center"
        columns={[3, 3, 2, 4]}
        rows={tokensIn('duration')
          .filter((t) => /^duration\.(instant|fast|medium|slow|xslow)$/.test(t.path))
          .map((t) => ({
            id: t.path,
            data: tokenRev(t.path, t.css),
            cells: [
              <Code>{t.css}</Code>,
              <TokenSpecimen kind="duration" token={t.css} played={played} />,
              <Text as="span" variant="body-sm">
                {readable(t.literal ?? '')}
              </Text>,
              <Text as="span" variant="body-sm" tone="muted">
                {t.description}
              </Text>,
            ],
          }))}
      />
    </Stack>
  );
}

/** Q65: the roles components read, each drawn as what it does (travel or fade), beside what it becomes with reduced motion. */
const MOTION_ROLES: { path: string; kind: 'travel' | 'fade' }[] = [
  { path: 'duration.quick', kind: 'fade' },
  { path: 'duration.change', kind: 'fade' },
  { path: 'duration.move', kind: 'travel' },
  { path: 'duration.move-far', kind: 'travel' },
  { path: 'duration.shared', kind: 'travel' },
];

/**
 * The motion roles, played together. The Reduced motion switch puts the rows in the reduce context, so travel snaps
 * and fades still fade (G1): the same check the person's own setting makes. Plays only on request.
 */
export function MotionRoles() {
  const [played, toggle] = usePlay();
  const [reduce, setReduce] = useState(false);
  return (
    <Stack gap="group" data-motion={reduce ? 'reduce' : undefined}>
      <Cluster>
        <Button label="Play the roles" onClick={toggle} />
        <Switch label="Reduced motion" checked={reduce} onChange={setReduce} />
      </Cluster>
      <RowList
        align="center"
        columns={[3, 3, 2, 2, 4]}
        rows={MOTION_ROLES.map(({ path, kind }) => {
          const t = tokensIn('duration').find((x) => x.path === path)!;
          const reduced = reducedLiteral(path);
          return {
            id: t.path,
            data: tokenRev(t.path, t.css),
            cells: [
              <Code>{t.css}</Code>,
              <TokenSpecimen kind={kind} token={t.css} played={played} />,
              <Text as="span" variant="body-sm">
                {readable(resolveLiteral(path))}
              </Text>,
              <Text as="span" variant="body-sm" tone="muted">
                {reduced === '0ms' ? 'Reduced: snaps' : 'Reduced: kept'}
              </Text>,
              <Text as="span" variant="body-sm" tone="muted">
                {t.description}
              </Text>,
            ],
          };
        })}
      />
    </Stack>
  );
}

/** Component tokens by the component that owns them, A to Z, each under its component's name (linked to its page). */
export function ComponentTokens() {
  const groups = [...new Set(tokensIn('c').map((t) => t.path.split('.')[1]))]
    .map((g) => ({ g, name: componentOf(g)?.name }))
    .map(({ g, name }) => ({ g, name, label: name ?? g.charAt(0).toUpperCase() + g.slice(1).replace(/-/g, ' ') }))
    .sort((a, b) => a.label.localeCompare(b.label));
  return (
    <Stack gap="section">
      {groups.map(({ g, name, label }) => (
        <Stack key={g} gap="group">
          <Heading level={3} size={4}>
            {name && pages.some((p) => p.title === name) ? <ComponentLink name={name} /> : label}
          </Heading>
          <TokenRows group={`c.${g}`} />
        </Stack>
      ))}
    </Stack>
  );
}

/**
 * Each layer with the components that sit on it, worked out once (Q74): those whose own CSS reads it, directly or
 * through a component token, and the owner of a `c.<component>.*layer` token that aliases it (a tooltip's z-index sits
 * on its hint part, so a scan of the tooltip's own rules alone misses it). An alias is followed at most eight hops.
 * Built once per load, not per row, entry and token: rebuilding the token map inside every lookup made this page take
 * 7 to 9 seconds to render.
 */
let layerUsers: Map<string, string[]> | undefined;
function usersOfLayers(): Map<string, string[]> {
  if (layerUsers) return layerUsers;
  const componentTokens = tokensIn('c');
  const byCss = new Map([...tokensIn('layer'), ...componentTokens].map((t) => [t.css, t]));
  const layerOf = (css: string): string | undefined => {
    let t = byCss.get(css);
    for (let hops = 0; t && hops < 8; hops++) {
      if (t.path.startsWith('layer.')) return t.path;
      t = t.alias ? byCss.get(`--${t.alias.replace(/\./g, '-')}`) : undefined;
    }
    return undefined;
  };
  const sets = new Map<string, Set<string>>();
  const add = (path: string | undefined, name: string | undefined) => {
    if (!path || !name) return;
    sets.set(path, (sets.get(path) ?? new Set()).add(name));
  };
  for (const e of catalogue) for (const css of e.tokens) add(layerOf(css), e.name);
  for (const t of componentTokens) if (/layer$/.test(t.path)) add(layerOf(t.css), componentOf(t.path.split('.')[1])?.name);
  layerUsers = new Map([...sets].map(([path, names]) => [path, [...names].sort()]));
  return layerUsers;
}

/** The core component a token group (`c.<group>`) belongs to, by its kebab-case name. */
function componentOf(group: string) {
  return catalogue.find((e) => !e.name.includes('.') && e.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() === group);
}

/** A component's name, linked to its page when it has one. */
function ComponentLink({ name }: { name: string }) {
  const page = pages.find((p) => p.title === name);
  return page ? <Link href={`#/${page.id}`}>{name}</Link> : <Code>{name}</Code>;
}

/** Every layer from the top of the stack down, with the components whose CSS sits on it, read from their source. */
export function Layers() {
  const layers = [...tokensIn('layer')].sort((a, b) => Number(b.literal) - Number(a.literal));
  const users = usersOfLayers();
  return (
    <RowList
      columns={['name', 'value', 1, 1]}
      rows={layers.map((t) => {
        const names = users.get(t.path) ?? [];
        return {
          id: t.path,
          data: tokenRev(t.path, t.css),
          cells: [
            <Code>{t.css}</Code>,
            <Code>{valueOf(t)}</Code>,
            <Text as="span" variant="body-sm" tone="muted">
              {t.description}
            </Text>,
            names.length ? (
              <Cluster gap="pair">
                {names.map((name) => (
                  <ComponentLink key={name} name={name} />
                ))}
              </Cluster>
            ) : (
              <Text as="span" variant="body-sm" tone="muted">
                No component yet
              </Text>
            ),
          ],
        };
      })}
    />
  );
}

/**
 * Every place core CSS changes at a window or container size (IP26), read from the CSS by the same scanner as
 * `npm run check:breakpoints`: window widths use a breakpoint or say what they are tied to; containers follow the
 * space a component is given.
 */
export function ChangePoints() {
  const set = Object.fromEntries(tokensIn('breakpoint').map((t) => [t.path, Number.parseFloat(t.literal ?? '')]));
  const files = Object.entries(coreCss).map(([path, text]) => ({ path: path.split('/packages/core/css/')[1], text: text.replace(/\r\n/g, '\n') }));
  const points = changePoints(files, set).sort((a, b) => Number(a.scope === 'container') - Number(b.scope === 'container') || a.rem - b.rem);
  return (
    <RowList
      columns={[1, 2, 2]}
      rows={points.map((p) => ({
        id: `${p.file}:${p.line}`,
        cells: [
          <Code>{p.file.replace(/^\w+\//, '').replace(/\.css$/, '')}</Code>,
          <Code>{`${p.scope === 'window' ? '@media' : '@container'} (${p.edge}-${p.axis}: ${p.rem}rem)`}</Code>,
          p.token ? (
            <Code>{p.token}</Code>
          ) : (
            <Text as="span" variant="body-sm" tone="muted">
              {p.reason ? p.reason.replace(/^tied to/i, 'Tied to') : p.scope === 'container' ? 'The space the component is given' : 'The window’s height'}
            </Text>
          ),
        ],
      }))}
    />
  );
}

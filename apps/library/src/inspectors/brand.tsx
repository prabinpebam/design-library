/**
 * The Colour page's brand editor (owner, F7d): four numbered swatches, the accent choice, presets and the draft's
 * state. Above-core tooling made only of core components; the draft itself lives in data/brand.ts.
 */
import { Button, Cluster, Code, CodeBlock, ColourField, Heading, Icon, MenuButton, SegmentedControl, Stack, Text, TokenSpecimen } from '@design-library/core/components';
import { applyPreset, clearColour, configText, discardDraft, nameOf, pickColour, presets, setAccent, slots, undoBrand, useBrand, type Slot } from '../data/brand';
import { INSPECTORS, rev } from '../revisions/target';

const CONFIG = 'packages/core/tokens/colour.config.json';
const PRESETS = 'packages/core/tokens/colour-presets.json';
/** Suggested starting colours for an empty slot, spread round the hue circle. */
const suggestions: Record<Slot, string> = { '1': '#4f5bd5', '2': '#0e7490', '3': '#f97316', '4': '#be185d' };

export function BrandEditor() {
  const { brand, draft, undo, errors, checked, failures, ramps } = useBrand();
  const defined = slots.filter((s) => brand.colours[s]);
  const only = defined.length === 1;
  return (
    <Stack gap="section">
      <Stack gap="group" {...rev({ kind: 'section', identity: { section: 'brand-editor' }, sources: [CONFIG, PRESETS, INSPECTORS] })}>
        <Cluster gap="group" align="center">
          <MenuButton
            label="Presets"
            menuLabel="Brand colour presets"
            items={presets.map((p) => ({ value: p.id, label: p.name, description: p.mood, preview: slots.flatMap((s) => (p.brand.colours[s] ? [p.brand.colours[s]!.seed] : [])) }))}
            onSelect={applyPreset}
          />
          {undo && (
            <Cluster gap="pair" align="center">
              <Text as="span" variant="body-sm">
                {undo.message}
              </Text>
              <Button label="Undo" emphasis="quiet" size="s" onClick={undoBrand} />
            </Cluster>
          )}
        </Cluster>
        <Cluster gap="group" align="start">
          {slots.map((s) => (
            <ColourField
              key={s}
              mark={s}
              label={`Brand colour ${s}`}
              value={brand.colours[s]?.seed}
              name={brand.colours[s] ? nameOf(brand, s) : undefined}
              tag={brand.accent === Number(s) ? 'Accent' : undefined}
              suggestion={suggestions[s]}
              onChange={(hex) => pickColour(s, hex)}
              onClear={only ? undefined : () => clearColour(s)}
            />
          ))}
        </Cluster>
        {only ? (
          <Text variant="body-sm" tone="muted">
            Colour {defined[0]} is the accent and can’t be cleared: a theme needs at least one brand colour. Add another to choose which one is the accent.
          </Text>
        ) : (
          <Cluster gap="group" align="center">
            <Text as="span" variant="body-sm">
              Accent
            </Text>
            <SegmentedControl label="Accent colour" options={defined.map((s) => ({ value: s, label: s }))} value={String(brand.accent)} onChange={(v) => setAccent(v as Slot)} />
            <Text as="span" variant="body-sm" tone="muted">
              Actions, links, focus and selection read it.
            </Text>
          </Cluster>
        )}
        {errors.length > 0 ? (
          <Cluster gap="pair" wrap={false} align="start">
            <Icon name="error" size="sm" label="Error" />
            <Text variant="body-sm" tone="danger">
              These colours can’t be generated, so the library still shows the last ones that could: {errors.join('; ')}.
            </Text>
          </Cluster>
        ) : failures.length === 0 ? (
          <Cluster gap="pair" wrap={false} align="start">
            <Icon name="success" size="sm" label="Meets contrast" />
            <Text variant="body-sm">
              All {checked} contrast checks the brand affects pass, in light and dark at standard and more contrast.
            </Text>
          </Cluster>
        ) : (
          <Stack gap="pair">
            <Cluster gap="pair" wrap={false} align="start">
              <Icon name="warning" size="sm" label="Below contrast" />
              <Text variant="body-sm" tone="danger">
                {failures.length} of {checked} contrast checks fail. The library shows these colours so you can see the problem; <Code>npm run tokens:check</Code> would reject them. Try a darker or lighter accent, or mark another colour as the accent.
              </Text>
            </Cluster>
            {failures.slice(0, 6).map((f) => (
              <Text key={`${f.fg}-${f.bg}-${f.context}`} variant="caption" tone="muted">
                --{f.fg.replace(/\./g, '-')} on --{f.bg.replace(/\./g, '-')} ({f.context}): {f.ratio.toFixed(2)}:1, needs {f.min}:1
              </Text>
            ))}
            {failures.length > 6 && (
              <Text variant="caption" tone="muted">
                And {failures.length - 6} more.
              </Text>
            )}
          </Stack>
        )}
        {draft ? (
          <Stack gap="pair">
            <Cluster gap="group" align="center">
              <Text as="span" variant="body-sm">
                A draft in this browser. <Code>colour.config.json</Code> is unchanged; to keep these colours, put this in it and run <Code>npm run tokens</Code>.
              </Text>
              <Button label="Discard draft" size="s" onClick={discardDraft} />
            </Cluster>
            <CodeBlock label="Brand colours for colour.config.json" code={configText(brand)} />
          </Stack>
        ) : (
          <Text variant="body-sm" tone="muted">
            Showing the theme’s colours from <Code>colour.config.json</Code>.
          </Text>
        )}
      </Stack>
      {defined.map((s) => (
        <Stack key={s} gap="group" {...rev({ kind: 'token', identity: { group: `--p-brand-${s}` }, sources: [CONFIG, INSPECTORS] })}>
          <Cluster gap="group" align="baseline">
            <Heading level={3} size={4}>
              {`${s}: ${nameOf(brand, s)}`}
            </Heading>
            <Text as="span" variant="body-sm" tone="muted">
              {brand.accent === Number(s) ? 'The accent, and an identity colour. Private ramp; the same in every context.' : 'An identity colour. Private ramp; the same in every context.'}
            </Text>
          </Cluster>
          <TokenSpecimen kind="ramp" steps={Object.entries(ramps[s] ?? {}).map(([step, hex]) => ({ name: step, token: `--p-brand-${s}-${step}`, value: hex }))} />
        </Stack>
      ))}
    </Stack>
  );
}

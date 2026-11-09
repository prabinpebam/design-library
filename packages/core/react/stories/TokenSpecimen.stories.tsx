import { TokenSpecimen } from '../compounds/TokenSpecimen';
import type { StoryFile } from './story';

export default {
  component: 'TokenSpecimen',
  tier: 'compound',
  summary: 'One token drawn so its value can be seen, the drawing chosen by what the token is.',
  stories: [
    {
      title: 'Colour',
      description: 'A swatch over a checker, so a translucent colour reads; its outline keeps a light one visible.',
      code: `<TokenSpecimen kind="colour" token="--color-accent" />`,
      arrangement: 'row',
      render: () => (
        <>
          <TokenSpecimen kind="colour" token="--color-accent" />
          <TokenSpecimen kind="colour" token="--color-bg-raised" />
          <TokenSpecimen kind="colour" token="--color-accent-subtle" />
        </>
      ),
    },
    {
      title: 'Ramp',
      description: 'A colour’s steps, lightest first, each with its name and value.',
      code: `<TokenSpecimen kind="ramp" steps={[{ name: '100', token: '--spectrum-blue-100', value: '…' }, …]} />`,
      render: () => (
        <TokenSpecimen
          kind="ramp"
          steps={[
            { name: '300', token: '--spectrum-blue-300', value: '#91b4ff' },
            { name: '500', token: '--spectrum-blue-500', value: '#3b65ce' },
            { name: '700', token: '--spectrum-blue-700', value: '#123298' },
          ]}
        />
      ),
    },
    {
      title: 'Contrast',
      description: 'Text in one colour on another, as a reader sees it.',
      code: `<TokenSpecimen kind="contrast" token="--color-status-danger-fg" on="--color-status-danger-bg" />`,
      arrangement: 'row',
      render: () => (
        <>
          <TokenSpecimen kind="contrast" token="--color-status-danger-fg" on="--color-status-danger-bg" />
          <TokenSpecimen kind="contrast" token="--color-status-danger-on-fill" on="--color-status-danger-fill" />
        </>
      ),
    },
    {
      title: 'Type and font',
      description: 'A text style at its real size, a font’s shapes at a glance, and a line set in it.',
      code: `<TokenSpecimen kind="type" token="--type-heading-2">A section heading</TokenSpecimen>`,
      render: () => (
        <>
          <TokenSpecimen kind="type" token="--type-heading-2">
            A section heading
          </TokenSpecimen>
          <TokenSpecimen kind="font" token="--font-text" />
          <TokenSpecimen kind="font" token="--font-code">
            gap: var(--space-stack-group);
          </TokenSpecimen>
        </>
      ),
    },
    {
      title: 'Length and size',
      description: 'A space as a bar of its own length, a small size as a square of its size.',
      code: `<TokenSpecimen kind="length" token="--space-8" />`,
      render: () => (
        <>
          <TokenSpecimen kind="length" token="--space-8" />
          <TokenSpecimen kind="size" token="--size-icon-lg" />
        </>
      ),
    },
    {
      title: 'Radius, stroke and shadow',
      description: 'A tile with the token applied.',
      code: `<TokenSpecimen kind="radius" token="--radius-lg" />`,
      arrangement: 'row',
      render: () => (
        <>
          <TokenSpecimen kind="radius" token="--radius-lg" />
          <TokenSpecimen kind="stroke" token="--border-thick" />
          <TokenSpecimen kind="shadow" token="--shadow-overlay" />
        </>
      ),
    },
    {
      title: 'Duration',
      description: 'A track that fills over the duration once played; it stays still with reduced motion.',
      code: `<TokenSpecimen kind="duration" token="--duration-medium" played={played} />`,
      render: () => <TokenSpecimen kind="duration" token="--duration-medium" played />,
    },
    {
      title: 'Motion roles',
      description: 'A role that moves crosses its track by transform; a role that changes a value fades the fill. Each plays with the role’s own duration, so with reduced motion the travel snaps and the fade still fades.',
      code: `<TokenSpecimen kind="travel" token="--duration-move" played={played} />
<TokenSpecimen kind="fade" token="--duration-change" played={played} />`,
      render: () => (
        <>
          <TokenSpecimen kind="travel" token="--duration-move" played />
          <TokenSpecimen kind="fade" token="--duration-change" played />
        </>
      ),
    },
  ],
} satisfies StoryFile;

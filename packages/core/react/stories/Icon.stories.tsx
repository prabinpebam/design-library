import { Icon } from '../fundamentals/Icon';
import { icons, type IconName } from '../../icons/icons';
import type { StoryFile } from './story';
import { IconOverrides } from '../fundamentals/IconOverrides';
import { Rating } from '../fundamentals/Rating';
import { Button } from '../fundamentals/Button';
import { Stack } from '../fundamentals/Stack';
import { Cluster } from '../fundamentals/Cluster';
import { Text } from '../fundamentals/Text';
import { brandIcons } from './brand-icons';

const shown: IconName[] = ['search', 'close', 'chevron-down', 'menu', 'check', 'info'];

const names = Object.keys(icons) as IconName[];

export default {
  component: 'Icon',
  tier: 'fundamental',
  summary: 'Shows one semantic icon from the active set, drawn in the current text colour.',
  stories: [
    {
      title: 'The set',
      description: 'Semantic names, drawn by a small placeholder set until a provider is approved.',
      arrangement: 'row',
      code: `<Icon name="check" label="check" size="lg" />  // one per name`,
      render: () => (
        <>
          {names.map((name) => (
            <Icon key={name} name={name} label={name} size="lg" />
          ))}
        </>
      ),
    },
    {
      title: 'Sizes',
      description: 'Small inside small text, medium beside body text and in controls, large standalone.',
      arrangement: 'row',
      code: `<Icon name="info" size="sm" label="Information" />
<Icon name="info" size="md" label="Information" />
<Icon name="info" size="lg" label="Information" />`,
      render: () => (
        <>
          <Icon name="info" size="sm" label="Information" />
          <Icon name="info" size="md" label="Information" />
          <Icon name="info" size="lg" label="Information" />
        </>
      ),
    },
    {
      title: 'A few brand icons',
      description:
        'A brand draws only the icons it has (Q113): IconOverrides (one part of the page) or setIconOverrides (the whole site) take glyphs by name, and every component that draws that name uses them: the search field, a menu button, a close, a select’s chevron, Rating’s star. Names it doesn’t give stay on the active set. First row the library’s own; second row the same names inside IconOverrides.',
      code: `import { setIconOverrides, registerIconSet, setIconSet } from '@design-library/core/icons';
import { IconOverrides } from '@design-library/core/react';

<IconOverrides icons={{ search: { v: '0 0 24 24', g: { fill: 'currentColor', stroke: 'none' }, c: [['path', { d: '…' }]] }, … }}>
  …every Icon named search here draws the brand's glyph
</IconOverrides>
setIconOverrides(brandGlyphs);            // site-wide; null clears
registerIconSet({ id: 'acme', name: 'Acme', licence: 'Acme brand licence', glyphs }); void setIconSet('acme'); // a whole set`,
      render: () => (
        <Stack gap="group">
          {[false, true].map((brand) => {
            const row = (
              <Stack gap="item">
                <Text variant="caption">{brand ? 'Brand glyphs, eight names overridden' : 'The library’s own'}</Text>
                <Cluster gap="item">
                  {shown.map((name) => (
                    <Icon key={name} name={name} label={name} size="lg" />
                  ))}
                  <Rating label="Rating" hideLabel value={3} readOnly />
                  <Button icon="more" label="More" emphasis="quiet" iconOnly />
                </Cluster>
              </Stack>
            );
            return brand ? (
              <IconOverrides key="brand" icons={brandIcons}>
                {row}
              </IconOverrides>
            ) : (
              <span key="own">{row}</span>
            );
          })}
        </Stack>
      ),
    },
  ],
} satisfies StoryFile;

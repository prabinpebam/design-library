import { Icon } from '../fundamentals/Icon';
import { icons, type IconName } from '../../icons/icons';
import type { StoryFile } from './story';

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
  ],
} satisfies StoryFile;

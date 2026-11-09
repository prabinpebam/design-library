import { Link } from '../fundamentals/Link';
import { Text } from '../fundamentals/Text';
import type { StoryFile } from './story';
import { WithSettings } from './WithSettings';

const noLine = { '--link-decoration': 'none' };

export default {
  component: 'Link',
  tier: 'fundamental',
  summary: 'Navigates to a URL or route.',
  stories: [
    {
      title: 'In running text',
      description: 'Underlined, so it never relies on colour alone.',
      arrangement: 'row',
      code: `<Text>Read the <Link href="#/colour">colour roles</Link> first.</Text>`,
      render: () => (
        <Text>
          Read the <Link href="#/colour">colour roles</Link> first.
        </Text>
      ),
    },
    {
      title: 'States',
      description: 'Current marks the page the person is on; external says it leaves this site.',
      arrangement: 'row',
      code: `<Link href="#/link" current>Link</Link>
<Link href="https://www.w3.org/WAI/ARIA/apg/" external>ARIA practices</Link>`,
      render: () => (
        <>
          <Link href="#/link" current>
            Link
          </Link>
          <Link href="https://www.w3.org/WAI/ARIA/apg/" external>
            ARIA practices
          </Link>
        </>
      ),
    },
    {
      title: 'No line at rest',
      description:
        'A brand choice, set from the theme: link.decoration none. The link then rests on its colour, which must stand 3:1 from the text around it; point at it or reach it with Tab and the line comes back, so it is never colour alone when reached. Underline stays the default.',
      arrangement: 'row',
      code: `applySettings({ '--link-decoration': 'none' });

<Text>Read the <Link href="#/colour">colour roles</Link> first.</Text>`,
      render: () => (
        <WithSettings settings={noLine}>
          <Text>
            Read the <Link href="#/colour">colour roles</Link> first.
          </Text>
        </WithSettings>
      ),
    },
  ],
} satisfies StoryFile;

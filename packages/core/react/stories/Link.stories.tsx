import { Link } from '../fundamentals/Link';
import { Text } from '../fundamentals/Text';
import type { StoryFile } from './story';

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
  ],
} satisfies StoryFile;

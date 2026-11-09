import { PageHeader } from '../compounds/PageHeader';
import { Link } from '../fundamentals/Link';
import { Text } from '../fundamentals/Text';
import type { StoryFile } from './story';

export default {
  component: 'PageHeader',
  tier: 'compound',
  summary: 'The head of a page: where it sits, its title, what it’s for and where it comes from.',
  stories: [
    {
      title: 'Component page',
      description: 'The eyebrow links back to the page’s section; the lead says what the page is for in a sentence or two.',
      code: `<PageHeader eyebrow={{ label: 'Compound', href: '#/overview' }} title="Navigation" lead="Moves between the pages of an app." file="packages/core/react/compounds/Navigation.tsx" />`,
      render: () => (
        <PageHeader eyebrow={{ label: 'Compound', href: '#/overview' }} title="Navigation" lead="Moves between the pages of an app: grouped links with the current page marked." file="packages/core/react/compounds/Navigation.tsx" />
      ),
    },
    {
      title: 'With a source link',
      description: 'Where the page’s values and decisions come from, as a link under the lead.',
      code: `<PageHeader eyebrow={{ label: 'Tokens', href: '#/overview' }} title="Colour" lead="…" source={{ label: 'Why these values: the foundation plan', href }} />`,
      render: () => (
        <PageHeader
          eyebrow={{ label: 'Tokens', href: '#/overview' }}
          title="Colour"
          lead="A private palette, the semantic roles components read, and the contrast each role holds in every context."
          source={{ label: 'Why these values: the foundation plan', href: 'http://127.0.0.1:8765/#foundation.md' }}
        />
      ),
    },
    {
      title: 'With a note',
      description: 'Anything else the head needs, such as a way out when a page isn’t there.',
      code: `<PageHeader title="Page not found"><Text>There’s no page called “colours”. Go to the <Link href="#/overview">overview</Link>.</Text></PageHeader>`,
      render: () => (
        <PageHeader title="Page not found">
          <Text>
            There’s no page called “colours”. Choose a page from the navigation, or go to the <Link href="#/overview">overview</Link>.
          </Text>
        </PageHeader>
      ),
    },
  ],
} satisfies StoryFile;

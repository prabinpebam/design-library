import type { StoryFile } from '@design-library/core/components';
import { Notice } from './Notice';

export default {
  component: 'ikea.Notice',
  tier: 'fundamental',
  summary: 'A quiet strip with one line about a service and an icon in a disc.',
  stories: [
    {
      title: 'A service',
      description: 'Above a listing: one line that leads to the service.',
      code: `<Notice icon="tag" href="#">Book assembly with your order, in store or online</Notice>`,
      render: () => (
        <Notice icon="tag" href="#">
          Book assembly with your order, in store or online
        </Notice>
      ),
    },
  ],
} satisfies StoryFile;

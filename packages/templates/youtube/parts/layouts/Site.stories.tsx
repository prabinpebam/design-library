import type { StoryFile } from '@design-library/core/components';
import { Site } from './Site';
import shared from '../../content/shared.json';
import type { YoutubeRecord } from '../../types';

const view = shared.record as YoutubeRecord;
export default {
  component: 'youtube.Site',
  tier: 'layout',
  summary: 'A video site home: masthead with search, the guide, feed filters and a grid of videos in neutral frames.',
  stories: [
    { title: 'Home', description: 'Signed out, the guide open, the first filter on.', code: '<Site view={site} />', render: () => <Site view={view} /> },
  ],
} satisfies StoryFile;

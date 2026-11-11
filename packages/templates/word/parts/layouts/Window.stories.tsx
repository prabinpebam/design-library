import type { StoryFile } from '@design-library/core/components';
import { Window } from './Window';
import shared from '../../content/shared.json';
import type { WordRecord } from '../../types';

const view = shared.record as WordRecord;
export default {
  component: 'word.Window',
  tier: 'layout',
  summary: 'A word processor window: title bar, command ribbon, the page on its canvas and a status bar.',
  stories: [
    { title: 'Document', description: 'The Home ribbon over a Letter page.', code: '<Window view={document} />', render: () => <Window view={view} /> },
    { title: 'Navigation', description: 'The headings outline beside the page.', code: '<Window view={document} screen="navigation" />', render: () => <Window view={view} screen="navigation" /> },
    { title: 'Comments', description: 'Comment cards beside the page.', code: '<Window view={document} screen="comments" />', render: () => <Window view={view} screen="comments" /> },
  ],
} satisfies StoryFile;

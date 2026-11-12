import type { StoryFile } from '@design-library/core/components';
import { Workspace } from './Workspace';
import shared from '../../content/shared.json';
import assetsFile from '../../assets.json';
import type { WorkspaceRecord } from '../../types';

const urls = import.meta.glob('../../assets/*', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const picture = (id: string) => {
  const entry = (assetsFile.assets as Record<string, { src: string; alt: string }>)[id];
  if (!entry) return { src: '', alt: '' };
  return { src: urls[`../../${entry.src}`] ?? entry.src, alt: entry.alt };
};

const view = shared.record as WorkspaceRecord;
export default {
  component: 'slack.Workspace',
  tier: 'layout',
  summary: 'A labelled rail, channel sidebar, messages and thread, in a rounded workspace window.',
  stories: [
    { title: 'Channel', description: 'Messages, unfurls, replies, floating pills and a composer.', code: '<Workspace view={workspace} />', render: () => <Workspace view={view} picture={picture} /> },
    { title: 'Thread', description: 'A reply panel beside the channel.', code: '<Workspace view={workspace} screen="thread" />', render: () => <Workspace view={view} screen="thread" picture={picture} /> },
    { title: 'Search', description: 'Find a message by its words.', code: '<Workspace view={workspace} screen="search" />', render: () => <Workspace view={view} screen="search" picture={picture} /> },
  ],
} satisfies StoryFile;

import type { StoryFile } from '@design-library/core/components';
import { Workspace } from './Workspace';
import shared from '../../content/shared.json';
import type { WorkspaceRecord } from '../../types';

const view = shared.record as WorkspaceRecord;
export default {
  component: 'slack.Workspace',
  tier: 'layout',
  summary: 'A labelled rail, channel sidebar, messages and thread, in a rounded workspace window.',
  stories: [
    { title: 'Channel', description: 'Messages, grouped follow-ups, reactions, files and a composer.', code: '<Workspace view={workspace} />', render: () => <Workspace view={view} /> },
    { title: 'Thread', description: 'A reply panel beside the channel.', code: '<Workspace view={workspace} screen="thread" />', render: () => <Workspace view={view} screen="thread" /> },
    { title: 'Search', description: 'Find a message by its words.', code: '<Workspace view={workspace} screen="search" />', render: () => <Workspace view={view} screen="search" /> },
  ],
} satisfies StoryFile;

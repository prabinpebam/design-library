import { ScreenPreview } from '../compounds/ScreenPreview';
import type { StoryFile } from './story';

export default {
  component: 'ScreenPreview',
  tier: 'compound',
  summary: 'A whole screen shown live in a window of a chosen width, so its narrow behaviour is the real thing.',
  stories: [
    {
      title: 'A phone-sized window',
      description: 'The chat app in 375 px: the sidebar is closed and floats over the conversation when opened. Scroll and use it inside the frame.',
      code: `<ScreenPreview src="#/app/chat" title="Chat app in a phone-sized window" width="phone" />`,
      render: () => <ScreenPreview src="#/app/chat" title="Chat app in a phone-sized window" width="phone" caption="375 px: the sidebar opens over the conversation." />,
    },
  ],
} satisfies StoryFile;

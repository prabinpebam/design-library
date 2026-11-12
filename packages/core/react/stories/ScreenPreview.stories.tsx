import { ScreenPreview } from '../compounds/ScreenPreview';
import { EditorLayout } from '../layouts/EditorLayout';
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
    {
      title: 'Filling an editor',
      description: 'With height="fill" the window takes the height its parent gives it, here an editor’s working area, instead of the fixed 40 rem: a page builder shows the page at the room it has.',
      code: `<EditorLayout … ><ScreenPreview src="#/app/chat" title="…" height="fill" /></EditorLayout>`,
      render: () => (
        <EditorLayout height="lg" start={null} startOpen={false} onStartToggle={() => {}} end={null} endOpen={false} onEndToggle={() => {}}>
          <ScreenPreview src="#/app/chat" title="Chat app filling an editor's working area" height="fill" />
        </EditorLayout>
      ),
    },
  ],
} satisfies StoryFile;

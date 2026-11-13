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
    {
      title: 'A desktop window scaled to fit',
      description:
        'With width="desktop" the screen is laid out at least 1280 px wide (the theme’s c.screen-preview.desktop) and drawn scaled down to fit a narrower column, so a page builder’s wide canvas shows the desktop layout, not the narrow one. In a column wider than that it is the column’s width. A template whose canvas makes text too small sets a narrower --c-screen-preview-desktop for a larger scale.',
      code: `<ScreenPreview src="#/app/chat" title="Chat app at desktop width, scaled to fit" width="desktop" />`,
      render: () => <ScreenPreview src="#/app/chat" title="Chat app at desktop width, scaled to fit" width="desktop" caption="Laid out at 1280 px with its sidebar beside the conversation, drawn at the column's width." />,
    },
          {
            title: 'A shimmer while it loads',
            description: 'With showLoading a shimmer fills the window until the screen has loaded, so a slow screen never shows a blank white window. Here it loads at once.',
            code: `<ScreenPreview src="#/app/chat" title="Chat app, loading" width="phone" showLoading />`,
            render: () => <ScreenPreview src="#/app/chat" title="Chat app, with a shimmer while it loads" width="phone" showLoading />,
          },
  ],
} satisfies StoryFile;

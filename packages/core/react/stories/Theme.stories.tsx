import { ScreenPreview } from '../compounds/ScreenPreview';
import type { StoryFile } from './story';

export default {
  component: 'Theme',
  tier: 'fundamental',
  summary: 'Theming from code: a brand’s own colours, canvas and settings through @design-library/core/theme.',
  stories: [
    {
      title: 'A warm paper canvas',
      description:
        'applyBrand takes base beside the brand colours: a temperature (neutral, warm or cool), an optional faint tint and exact steps to pin. Here warm, with the page canvas (25) pinned to paper and the dark end (900, 950) pinned near black, so the dark scheme stays a dark page rather than brown; the greys, text and outlines between follow. Without base, the theme’s own greys stay.',
      code: `import { applyBrand } from '@design-library/core/theme';

applyBrand({
  colours: { 1: { seed: '#1f6f8b' } },
  base: { temperature: 'warm', pins: { 25: '#f7f4ef', 900: '#1b1916', 950: '#121110' } },
});`,
      render: () => <ScreenPreview src="site.html?base=paper#/app/harbour/home" title="Harbour home on a warm paper canvas" caption="Harbour’s home with a warm base: paper canvas, near-black dark end." />,
    },
  ],
} satisfies StoryFile;

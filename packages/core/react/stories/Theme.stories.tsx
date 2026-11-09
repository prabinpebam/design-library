import { ScreenPreview } from '../compounds/ScreenPreview';
import { BrandGuard } from './BrandGuard';
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
    {
      title: 'The contrast guard for bright brands',
      description:
        'A bright brand colour pinned at step 500 (the exact brand colour a site wants on its buttons) leaves links, labels on the fill and the focus ring below their contrast. With contrast: \'guard\', applyBrand measures each pair in light and dark and moves only the failing ones: links and the ring to the nearest darker or lighter step that passes, the label to the ink that reads best (dark on yellow), then the fill if it still fails. Without it nothing changes; brandVars and brandContrast name each failing pair either way. More contrast reads the same accent steps as standard. Pick a seed, switch the guard on and read the pairs.',
      code: `import { applyBrand, brandVars } from '@design-library/core/theme';

const brand = { colours: { 1: { seed: '#ffd400', pins: { 500: '#ffd400' } } }, contrast: 'guard' };
applyBrand(brand);
brandVars(brand).warnings; // "light: link (accent 600) is 2.1:1, needs 4.5:1; moved to accent 800 (6.4:1)", …`,
      render: () => <BrandGuard />,
    },
  ],
} satisfies StoryFile;

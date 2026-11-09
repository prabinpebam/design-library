import { ScreenPreview } from '../compounds/ScreenPreview';
import type { StoryFile } from './story';

export default {
  component: 'Fonts',
  tier: 'fundamental',
  summary: 'A brand’s own typefaces through @design-library/core/theme.',
  stories: [
    {
      title: 'A face the site supplies',
      description:
        'applyFonts takes faces beside the registry: each with an id, a family name, its files (served by the site, under the site’s licence) and, if the swap would move the page, a fallback reshaped to the face’s size and line metrics. Name the id in roles and core headings, text and controls use it. Here the display role is a face the screen serves itself; the text stays on the theme’s. fontFacesCss(choice) gives the same @font-face rules for a stylesheet with no script.',
      code: `import { applyFonts } from '@design-library/core/theme';

void applyFonts({
  roles: { display: 'brand-display' },
  faces: [{
    id: 'brand-display',
    family: 'Brand Display',
    classification: 'sans',
    sources: [{ url: '/fonts/brand-display.woff2', format: 'woff2', weight: '300 700' }],
    fallback: { local: 'Arial', sizeAdjust: '102%', ascentOverride: '96%', descentOverride: '28%' },
  }],
});`,
      render: () => <ScreenPreview src="site.html?face=site#/app/harbour/home" title="Harbour home with a site-supplied display face" caption="Harbour’s home with its headings in a face the site serves itself." />,
    },
  ],
} satisfies StoryFile;

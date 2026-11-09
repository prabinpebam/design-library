import { ScreenPreview } from '../compounds/ScreenPreview';
import type { StoryFile } from './story';

export default {
  component: 'SiteLayout',
  tier: 'layout',
  summary: 'A website’s page: the site header that stays at the top, the page’s parts in one centred column, and the footer.',
  stories: [
    {
      title: 'A landing page',
      description: 'The corporate preset: SiteHeader in the header slot, a Hero and Sections in the column, the Footer under it. The layout owns the margins and the space between parts; scroll and the header stays.',
      code: `<SiteLayout header={<SiteHeader … />} footer={<Footer … />}>
  <Hero … />
  <Section heading="What we do">…</Section>
</SiteLayout>`,
      render: () => <ScreenPreview src="#/app/corporate" title="Corporate site preset" caption="The corporate preset, at the column’s width." />,
    },
    {
      title: 'A flush opening',
      description:
        'The first band meets the header: opening="flush" (or the content setting "opening": "flush"), for an opening picture or tinted band that should start under the header. The other bands keep the page’s gap, and the last keeps its space above the footer.',
      code: `<SiteLayout opening="flush" header={…} footer={…}>
  <Hero standalone picture={…} … />
  …
</SiteLayout>`,
      render: () => <ScreenPreview src="site.html?frame=flush#/app/harbour/home" title="Harbour home, flush opening" caption="Harbour’s home with the first band right under the header." />,
    },
    {
      title: 'Frame settings from the theme',
      description:
        'The column’s width, page margin, the gap between bands and the space above the first and under the last band are theme settings: the published allow-list in tokens/settings.json, set with applySettings or settingsCss from @design-library/core/theme. Here: a 60 rem column, and the section gap between bands and at the ends. Any other --c-* name is refused with what to use instead.',
      code: `import { applySettings } from '@design-library/core/theme';

applySettings({
  '--c-site-layout-width': '60rem',
  '--c-site-layout-gap': 'var(--space-stack-section)',
  '--c-site-layout-padding-block': 'var(--space-stack-section)',
});`,
      render: () => <ScreenPreview src="site.html?frame=tight#/app/harbour/home" title="Harbour home, tighter frame" caption="Harbour’s home with a narrower column and section-sized gaps." />,
    },
  ],
} satisfies StoryFile;

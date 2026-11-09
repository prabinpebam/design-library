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
  ],
} satisfies StoryFile;

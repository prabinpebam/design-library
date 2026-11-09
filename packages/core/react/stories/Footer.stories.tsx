import { Footer, type FooterSection } from '../compounds/Footer';
import type { StoryFile } from './story';

const sections: FooterSection[] = [
  {
    id: 'product',
    heading: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'What’s new', href: '#changes' },
    ],
  },
  {
    id: 'help',
    heading: 'Help',
    links: [
      { label: 'Guides', href: '#guides' },
      { label: 'Contact support', href: '#support' },
      { label: 'Service status', href: 'https://status.example.com', external: true },
    ],
  },
  {
    id: 'company',
    heading: 'Company',
    links: [
      { label: 'About us', href: '#about' },
      { label: 'Jobs', href: '#jobs' },
      { label: 'Press', href: '#press' },
    ],
  },
];

const smallPrint = [
  { label: 'Privacy', href: '#privacy' },
  { label: 'Cookies', href: '#cookies' },
  { label: 'Accessibility statement', href: '#accessibility' },
  { label: 'Terms', href: '#terms' },
];

export default {
  component: 'Footer',
  tier: 'compound',
  summary: 'The foot of every page of a site: where else to go, the small print and who runs it.',
  stories: [
    {
      title: 'A site’s footer',
      description:
        'Link sections side by side, wrapping to fewer columns as the room narrows; then the small print, who runs the site and the legal line. One sunken surface; space alone separates the two groups.',
      code: `<Footer sectionsLabel="More from Atlas" sections={sections} links={smallPrint} identity="Atlas is made by the Northwind design team." legal="© 2026 Northwind. Text under CC BY 4.0, unless it says otherwise." />`,
      render: () => (
        <Footer
          sectionsLabel="More from Atlas"
          sections={sections}
          links={smallPrint}
          identity="Atlas is made by the Northwind design team."
          legal="© 2026 Northwind. Text under CC BY 4.0, unless it says otherwise."
        />
      ),
    },
    {
      title: 'Small print only',
      description: 'A small site or a single service: the support links and the legal line, nothing else.',
      code: `<Footer links={smallPrint} legal="© 2026 Northwind." />`,
      render: () => <Footer links={smallPrint} legal="© 2026 Northwind." />,
    },
  ],
} satisfies StoryFile;

import { Footer, type FooterSection } from '../compounds/Footer';
import { Cluster } from '../fundamentals/Cluster';
import { Icon } from '../fundamentals/Icon';
import { Stack } from '../fundamentals/Stack';
import { Text } from '../fundamentals/Text';
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
      title: 'A long section in two columns',
      description:
        'columns: 2 on a section flows a long list into two columns under its one heading, read down then across, so an archive of years doesn’t make one column far taller than the rest. Where two columns of --c-footer-links-column-min (a theme setting) don’t fit, it falls back to one.',
      code: `{ id: 'archive', heading: 'Archive', columns: 2, links: years.map((y) => ({ label: y, href: \`#\${y}\` })) }`,
      render: () => (
        <Footer
          sectionsLabel="More from Atlas"
          sections={[
            sections[0],
            { id: 'archive', heading: 'Archive', columns: 2, links: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016'].map((y) => ({ label: y, href: `#${y}` })) },
            sections[2],
          ]}
          legal="© 2026 Northwind."
        />
      ),
    },    {
      title: 'Small print only',
      description: 'A small site or a single service: the support links and the legal line, nothing else.',
      code: `<Footer links={smallPrint} legal="© 2026 Northwind." />`,
      render: () => <Footer links={smallPrint} legal="© 2026 Northwind." />,
    },
    {
      title: 'On one line',
      description: 'arrangement="line": the small print side by side on one wrapping line, the links, who runs the site, then the legal line. For a small site; at 320 px it wraps into lines and never scrolls sideways.',
      code: `<Footer arrangement="line" links={smallPrint} identity="Made by the Northwind design team." legal="© 2026 Northwind." />`,
      render: () => <Footer arrangement="line" links={smallPrint} identity="Made by the Northwind design team." legal="© 2026 Northwind." />,
    },
    {
      title: 'Led by the identity',
      description: 'arrangement="identity": the identity, a mark, the name and a line, in its own column beside the link sections, the small print under both. Below 40 rem of footer the identity stacks above the sections.',
      code: `<Footer arrangement="identity" sections={sections} links={smallPrint} legal="© 2026 Northwind."
  identity={<Stack gap="item"><Cluster gap="pair"><Icon name="organisation" size="lg" /><Text variant="lead" as="span">Northwind</Text></Cluster><Text variant="body-sm" tone="muted">Tools for teams who make things.</Text></Stack>} />`,
      render: () => (
        <Footer
          arrangement="identity"
          sectionsLabel="More from Northwind"
          sections={sections}
          links={smallPrint}
          legal="© 2026 Northwind."
          identity={
            <Stack gap="item">
              <Cluster gap="pair">
                <Icon name="organisation" size="lg" />
                <Text variant="lead" as="span">
                  Northwind
                </Text>
              </Cluster>
              <Text variant="body-sm" tone="muted">
                Tools for teams who make things.
              </Text>
            </Stack>
          }
        />
      ),
    },
  ],
} satisfies StoryFile;

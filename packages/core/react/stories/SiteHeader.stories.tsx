import { Button } from '../fundamentals/Button';
import { Icon } from '../fundamentals/Icon';
import { SiteHeader } from '../compounds/SiteHeader';
import type { StoryFile } from './story';

const links = [
  { label: 'Products', href: '#/siteheader', current: true },
  { label: 'Solutions', href: '#/siteheader' },
  { label: 'Customers', href: '#/siteheader' },
  { label: 'About', href: '#/siteheader' },
];

export default {
  component: 'SiteHeader',
  tier: 'compound',
  summary: 'The top of a website: the name linking home, the main places and one or two actions, collapsing to a Menu in a narrow window.',
  stories: [
    {
      title: 'Name, places and an action',
      description: 'The current place keeps a tint; the others take a fill only under the pointer. Narrow the window below about 48 rem (or open a preset in a phone-sized window) and the places move behind Menu.',
      code: `<SiteHeader name="Northwind" href="/" mark={<Icon name="organisation" />}
  links={[{ label: 'Products', href: '/products', current: true }, …]}
  actions={<Button label="Contact sales" emphasis="primary" size="s" />} />`,
      render: () => <SiteHeader name="Northwind" href="#/siteheader" mark={<Icon name="organisation" />} links={links} actions={<Button label="Contact sales" emphasis="primary" size="s" />} />,
    },
    {
      title: 'Name only',
      description: 'A one-page site: the name and an action, no places and so no Menu.',
      code: `<SiteHeader name="Asha Rao" href="/" actions={<Button label="Get in touch" size="s" />} />`,
      render: () => <SiteHeader name="Asha Rao" href="#/siteheader" actions={<Button label="Get in touch" size="s" />} />,
    },
  ],
} satisfies StoryFile;

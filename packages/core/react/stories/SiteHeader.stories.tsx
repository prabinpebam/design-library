import { Button } from '../fundamentals/Button';
import { Icon } from '../fundamentals/Icon';
import { ScreenPreview } from '../compounds/ScreenPreview';
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
    {
      title: 'Places in the middle, a large wordmark',
      description: 'nav="center" centres the places between the name and the actions (nav="end" beside the actions); wordmark="large" sets the name at heading 2 for a brand whose name is its logo.',
      code: `<SiteHeader name="Northwind" href="/" links={links} nav="center" wordmark="large" actions={<Button label="Contact sales" emphasis="primary" size="s" />} />`,
      render: () => <SiteHeader name="Northwind" href="#/siteheader" links={links} nav="center" wordmark="large" actions={<Button label="Contact sales" emphasis="primary" size="s" />} />,
    },
    {
      title: 'Mark only, places at the end',
      description: 'wordmark="mark" shows only the mark; the name still names the home link for screen readers. nav="end" sets the places beside the actions.',
      code: `<SiteHeader name="Northwind" href="/" mark={<Icon name="organisation" size="lg" />} wordmark="mark" links={links} nav="end" />`,
      render: () => <SiteHeader name="Northwind" href="#/siteheader" mark={<Icon name="organisation" size="lg" />} wordmark="mark" links={links} nav="end" actions={<Button label="Contact sales" emphasis="primary" size="s" />} />,
    },
    {
      title: 'How the current place is marked',
      description: 'current="fill" (default) tints it; current="colour" sets its words in the accent text role (4.5:1); current="rule" draws a full hairline around it (3:1). Never a stripe on one side.',
      code: `<SiteHeader … current="colour" />
<SiteHeader … current="rule" />`,
      render: () => (
        <>
          <SiteHeader name="Northwind" href="#/siteheader" links={links} current="colour" />
          <SiteHeader name="Northwind" href="#/siteheader" links={links} current="rule" />
        </>
      ),
    },
    {
      title: 'One row in a narrow window',
      description: 'Phone-sized, with places, a scheme button in tools and a Switch in actions. By default (left) the actions wrap under the name, so the header takes two rows. With narrow="row" (right) the bar stays one row of 64 px, name, tools and Menu, and the actions move into the menu under the places.',
      arrangement: 'row',
      code: `<SiteHeader name="Talks on design" href="/" links={links} narrow="row"
  tools={<SchemeControl form="button" />}
  actions={<Switch label="Fade between pages" … />} />`,
      render: () => (
        <>
          <ScreenPreview src="site.html?demo=router#/" title="Narrow header, default: actions wrap" width="phone" caption="Default: two rows." />
          <ScreenPreview src="site.html?demo=router&header=row#/" title="Narrow header, one row" width="phone" caption={'narrow="row": one row; open Menu for the Switch.'} />
        </>
      ),
    },
    {
      title: 'Named actions listed in the menu',
      description: 'With narrow="row", menuActions="list" lists the actions one per row under the places instead of side by side: each Button’s and MenuButton’s icon and words start on the places’ text edge, so the menu reads as one column. For named actions (Leave feedback, Settings); the default, row, suits one or two short buttons. Open Menu to see it.',
      code: `<SiteHeader name="Talks on design" href="/" links={links} narrow="row" menuActions="list"
  actions={<>
    <Button label="Leave feedback" icon="comment" emphasis="quiet" />
    <MenuButton label="Settings" icon="settings" emphasis="quiet" items={…} onSelect={…} />
  </>} />`,
      render: () => <ScreenPreview src="site.html?demo=router&header=list#/" title="Narrow header, actions listed" width="phone" caption={'menuActions="list": open Menu for the listed actions.'} />,
    },
  ],
} satisfies StoryFile;

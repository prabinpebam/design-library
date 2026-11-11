import { Badge, Button, TextField, type StoryFile } from '@design-library/core/components';
import { StoreHeader } from './StoreHeader';

export default {
  component: 'ikea.StoreHeader',
  tier: 'compound',
  summary: 'A shop’s header: a dark utility bar, then the wordmark, a pill search and icon actions.',
  stories: [
    {
      title: 'The shop’s header',
      description: 'The language and store services above; the search and the bag with its count below.',
      code: `<StoreHeader name="IKEA" href="#" barLabel="Store services" start={[{ label: 'EN', icon: 'globe', href: '#' }]} end={[…]} search={<TextField type="search" … />} actions={…} />`,
      render: () => (
        <StoreHeader
          name="IKEA"
          href="#"
          barLabel="Store services"
          start={[{ label: 'EN', icon: 'globe', href: '#' }]}
          end={[
            { label: 'Enter postcode', icon: 'delivery', href: '#' },
            { label: 'Select store', icon: 'store', href: '#' },
          ]}
          search={<TextField label="Search" hideLabel type="search" icon="search" placeholder="What are you looking for?" value="" mode="form" />}
          actions={
            <>
              <Button label="Your account" icon="person" iconOnly emphasis="quiet" />
              <Button label="Favourites" icon="heart" iconOnly emphasis="quiet" />
              <Badge kind="count" count={2} label="2 items in your bag" anchor={<Button label="Shopping bag" icon="bag" iconOnly emphasis="quiet" />} />
              <Button label="Menu" icon="menu" iconOnly emphasis="quiet" />
            </>
          }
        />
      ),
    },
  ],
} satisfies StoryFile;

import { useState, type ReactNode } from 'react';
import { IconOverrides } from '../fundamentals/IconOverrides';
import { Icon } from '../fundamentals/Icon';
import { Button } from '../fundamentals/Button';
import { MenuButton } from '../fundamentals/MenuButton';
import { Rating } from '../fundamentals/Rating';
import { Select } from '../fundamentals/Select';
import { Stack } from '../fundamentals/Stack';
import { Cluster } from '../fundamentals/Cluster';
import { Switch } from '../fundamentals/Switch';
import { TextField } from '../fundamentals/TextField';
import { Alert } from '../compounds/Alert';
import { Dialog } from '../compounds/Dialog';
import { Section } from '../compounds/Section';
import { SiteHeader } from '../compounds/SiteHeader';
import { bandIcons, brandIcons } from './brand-icons';
import type { BrandGlyph } from '../../icons/sets';
import type { StoryFile } from './story';

const none: Record<string, BrandGlyph> = {};
const links = [
  { label: 'Shop', href: '#/brand-icons', current: true },
  { label: 'Icons', href: '#/icon' },
  { label: 'Ratings', href: '#/rating' },
];
const topics = [
  { value: 'orders', label: 'Orders' },
  { value: 'returns', label: 'Returns' },
  { value: 'account', label: 'Your account' },
];
const more = [
  { value: 'share', label: 'Share' },
  { value: 'print', label: 'Print' },
];

/** Real components and one header, each drawing the names the brand overrides: search, close, chevron-down, menu, check, info, more and Rating's star. */
function Scene() {
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('orders');
  const [rating, setRating] = useState<number | null>(4);
  const [alert, setAlert] = useState(true);
  const [open, setOpen] = useState(false);
  return (
    <Stack gap="group">
      <SiteHeader name="Northwind" href="#/brand-icons" mark={<Icon name="organisation" />} links={links} narrow="row" tools={<Button label="Search" icon="search" iconOnly emphasis="quiet" size="s" />} />
      <Stack gap="item">
        <TextField label="Search help" type="search" icon="search" clearable placeholder="Orders, returns, delivery…" value={query} onCommit={setQuery} />
        <Select label="Topic" value={topic} options={topics} onChange={setTopic} />
        <Rating label="How was this page?" value={rating} onChange={setRating} />
      </Stack>
      {alert ? (
        <Alert tone="info" title="Orders placed today ship on Monday" onClose={() => setAlert(false)}>
          The warehouse is closed for the weekend.
        </Alert>
      ) : (
        <Button label="Show the message again" emphasis="quiet" onClick={() => setAlert(true)} />
      )}
      <Cluster gap="item">
        <MenuButton label="Order actions" icon="more" iconOnly items={more} onSelect={() => undefined} />
        <MenuButton label="Download" items={more} onSelect={() => undefined} />
        <Button label="Open a dialog" onClick={() => setOpen(true)} />
      </Cluster>
      <Dialog open={open} onClose={() => setOpen(false)} size="s" title="Delivery times" description="Its close button draws the brand’s close while the brand icons are on." />
    </Stack>
  );
}

function Toggle({ label = 'Brand icons', children }: { label?: string; children: (brand: boolean) => ReactNode }) {
  const [brand, setBrand] = useState(true);
  return (
    <Stack gap="group">
      <Switch label={label} checked={brand} onChange={setBrand} />
      {children(brand)}
    </Stack>
  );
}

export default {
  component: 'IconOverrides',
  tier: 'fundamental',
  summary: 'A brand’s own icons, a whole set or a few, drawn by name wherever a component or layout draws that icon; every name it doesn’t give falls back to the active set.',
  stories: [
    {
      title: 'Default or brand icons',
      description:
        'Eight brand glyphs (search, close, chevron-down, menu, check, info, more and Rating’s star) drawn for this library. Turn the Switch: the header’s search and, in a narrow window, its Menu, the field’s search and clear, the select’s chevron and the chosen option’s check, the rating’s stars, the message’s icon and close, the menus and the dialog’s close all change; every other icon (the mark) stays on the active set.',
      code: `import { IconOverrides } from '@design-library/core/react';
import brand from './brand/icons.json'; // npx design-library-icons src/brand/icons --out src/brand/icons.json

<IconOverrides icons={brand.glyphs}>
  <SiteHeader … />
  <TextField type="search" icon="search" … />
  <Select … />  <Rating … />  <Alert onClose={…} … />  <MenuButton … />  <Dialog … />
</IconOverrides>

// Site-wide instead: setIconOverrides(brand.glyphs) from '@design-library/core/icons' (null clears).`,
      render: () => <Toggle>{(brand) => <IconOverrides icons={brand ? brandIcons : none}><Scene /></IconOverrides>}</Toggle>,
    },
    {
      title: 'One band overrides its own',
      description: 'An IconOverrides inside another merges with it, the inner winning: this band draws its own search glyph and keeps the outer brand’s close, chevron and star. Outside the band nothing changes.',
      code: `<IconOverrides icons={brand.glyphs}>
  <Section tone="sunken" heading="Find a store">
    <IconOverrides icons={{ search: storeSearch }}>…</IconOverrides>
  </Section>
</IconOverrides>`,
      render: () => (
        <IconOverrides icons={brandIcons}>
          <Section tone="sunken" heading="Find a store" intro="This band’s search is its own; the rest is the brand’s.">
            <IconOverrides icons={bandIcons}>
              <Stack gap="item">
                <TextField label="Town or postcode" type="search" icon="search" clearable value="" onCommit={() => undefined} />
                <Rating label="Store rating" value={4.5} readOnly showValue />
              </Stack>
            </IconOverrides>
          </Section>
        </IconOverrides>
      ),
    },
    {
      title: 'In a dark band',
      description: 'Brand glyphs paint in currentColor, so they follow the text colour in every scheme: the same scene in a dark band, with the same Switch.',
      code: `<Section tone="sunken" data-scheme="dark">
  <IconOverrides icons={brand.glyphs}>…</IconOverrides>
</Section>`,
      render: () => (
        <Section tone="sunken" data-scheme="dark" heading="After dark">
          <Toggle label="Brand icons in the dark band">{(brand) => <IconOverrides icons={brand ? brandIcons : none}><Scene /></IconOverrides>}</Toggle>
        </Section>
      ),
    },
  ],
} satisfies StoryFile;

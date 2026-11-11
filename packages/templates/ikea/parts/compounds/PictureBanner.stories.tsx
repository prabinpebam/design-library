import { Grid, Stack, type StoryFile } from '@design-library/core/components';
import { PictureBanner } from './PictureBanner';

const pic = (name: string) => new URL(`../../assets/${name}.webp`, import.meta.url).href;

export default {
  component: 'ikea.PictureBanner',
  tier: 'compound',
  summary: 'A picture with a caption and an arrow that leads somewhere, or a block of the brand colour.',
  stories: [
    {
      title: 'Caption over the picture',
      description: 'White words on a shade rising from the picture’s foot, with a tag in the corner.',
      code: `<PictureBanner title="Make room for the evenings in" href="…" picture={…} tag="New" ratio="wide" />`,
      render: () => <PictureBanner title="Make room for the evenings in" href="#" picture={{ src: pic('room-living'), alt: '' }} tag="New" ratio="wide" />,
    },
    {
      title: 'A colour block beside pictures',
      description: 'A block of the brand colour opens a row of pictures with their words below.',
      code: `<PictureBanner title="Browse all lower prices" href="…" ratio="portrait" />`,
      render: () => (
        <Grid max={3}>
          <PictureBanner title="Browse all lower prices" href="#" ratio="portrait" />
          <PictureBanner title="Bedroom" href="#" picture={{ src: pic('room-bedroom'), alt: '' }} caption="below" ratio="portrait" tag="Lower price" tagTone="offer" />
          <PictureBanner title="Dining" href="#" picture={{ src: pic('room-dining'), alt: '' }} caption="below" ratio="portrait" />
        </Grid>
      ),
    },
    {
      title: 'The two brand surfaces',
      description: 'A block takes the band surface (the lead colour, blue) or the feature surface (the second colour, yellow), both moved by the brand map.',
      code: `<PictureBanner title="Up to 40% off" surface="feature" titleSize="display" … />`,
      render: () => (
        <Grid max={2}>
          <PictureBanner title="Up to 40% off" text="On bedroom favourites" note="*While stocks last" href="#" surface="feature" titleSize="display" ratio="square" />
          <PictureBanner title="Lower prices on everyday things" href="#" ratio="square" />
        </Grid>
      ),
    },
    {
      title: 'Words on a panel beside or under the picture',
      description: '`side`: a band across the page, the words on a feature panel beside the picture. `panel`: the words on a band panel under it.',
      code: `<PictureBanner caption="side" surface="feature" … />`,
      render: () => (
        <Stack gap="group">
          <PictureBanner title="A new store opens near you" text="Come and see the rooms, then stay for lunch." href="#" picture={{ src: pic('store-band'), alt: '' }} caption="side" surface="feature" ratio="wide" />
          <Grid max={3}>
            <PictureBanner title="Family club members save more" text="Join for free" href="#" picture={{ src: pic('family-cafe'), alt: '' }} caption="panel" ratio="classic" />
          </Grid>
        </Stack>
      ),
    },
  ],
} satisfies StoryFile;

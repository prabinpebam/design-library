import type { StoryFile } from '@design-library/core/components';
import { OfferMosaic } from './OfferMosaic';
import { PictureBanner } from './PictureBanner';

const pic = (name: string) => new URL(`../../assets/${name}.webp`, import.meta.url).href;
const tile = (title: string, name: string, ratio: 'classic' | 'portrait') => (
  <PictureBanner title={title} href="#" picture={{ src: pic(name), alt: '' }} caption="below" ratio={ratio} tag="Member price" tagTone="brand" />
);

export default {
  component: 'ikea.OfferMosaic',
  tier: 'compound',
  summary: 'A sale’s opening: a lead colour block, then two columns of offer pictures.',
  stories: [
    {
      title: 'A sale',
      description: 'The lead is a block of the feature surface (yellow) with the sale’s headline; the offers carry the band surface’s member tag (blue).',
      code: `<OfferMosaic lead={<PictureBanner surface="feature" titleSize="display" … />} columns={[[…, …], […, …]]} />`,
      render: () => (
        <OfferMosaic
          lead={<PictureBanner title="Up to 40% off" text="On bedroom and dining favourites" note="*While stocks last" href="#" surface="feature" titleSize="display" ratio="portrait" />}
          columns={[
            [tile('Bed linen', 'offer-bedsheets', 'classic'), tile('Dinnerware', 'offer-dinnerware', 'portrait')],
            [tile('Candles and decor', 'offer-decor', 'portrait'), tile('Living room', 'room-living', 'classic')],
          ]}
        />
      ),
    },
  ],
} satisfies StoryFile;

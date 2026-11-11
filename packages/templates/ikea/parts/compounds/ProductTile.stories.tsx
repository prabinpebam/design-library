import { Button, Grid, Price, Rating, type StoryFile } from '@design-library/core/components';
import { ProductTile } from './ProductTile';

const pic = (name: string) => new URL(`../../assets/${name}.webp`, import.meta.url).href;

export default {
  component: 'ikea.ProductTile',
  tier: 'compound',
  summary: 'One product in a listing: picture, tag, name in capitals, what it is, price, rating and an add button.',
  stories: [
    {
      title: 'A row of products',
      description: 'A lower price, a new product and an everyday one; one hairline above each, no boxes.',
      code: `<ProductTile name="LÖVNÄS" kind="3-seat sofa, light grey" href="…" picture={…} tag="Lower price" tagTone="offer" price={<Price … />} rating={<Rating … />} action={<Button iconOnly icon="bag-add" emphasis="primary" … />} />`,
      render: () => (
        <Grid max={3}>
          <ProductTile
            name="LÖVNÄS"
            kind="3-seat sofa, light grey"
            href="#"
            picture={{ src: pic('product-sofa'), alt: '' }}
            tag="Lower price"
            tagTone="offer"
            price={<Price value={499} was={549} wasLabel="Previous price €549" currency="EUR" />}
            rating={<Rating label="4.5 out of 5, 312 reviews" value={4.5} precision={0.5} readOnly size="s" />}
            favourite={<Button label="Save LÖVNÄS to favourites" icon="heart" iconOnly emphasis="quiet" pressed={false} />}
            action={<Button label="Add LÖVNÄS to bag" icon="bag-add" iconOnly emphasis="primary" />}
          />
          <ProductTile
            name="RUNDHOLM"
            kind="Coffee table, oak veneer"
            href="#"
            picture={{ src: pic('product-coffee-table'), alt: '' }}
            tag="New"
            price={<Price value={79} currency="EUR" />}
            rating={<Rating label="4 out of 5, 41 reviews" value={4} precision={0.5} readOnly size="s" />}
            action={<Button label="Add RUNDHOLM to bag" icon="bag-add" iconOnly emphasis="primary" />}
          />
          <ProductTile
            name="KRUKVIK"
            kind="Plant pot with stand, white"
            href="#"
            picture={{ src: pic('product-plant-pot'), alt: '' }}
            price={<Price value={15} currency="EUR" highlight />}
            action={<Button label="Add KRUKVIK to bag" icon="bag-add" iconOnly emphasis="primary" />}
          />
        </Grid>
      ),
    },
  ],
} satisfies StoryFile;

import { useState } from 'react';
import { Card } from '../compounds/Card';
import { Button } from '../fundamentals/Button';
import { Badge } from '../fundamentals/Badge';
import { Cluster } from '../fundamentals/Cluster';
import { Grid } from '../fundamentals/Grid';
import { Image } from '../fundamentals/Image';
import { Progress } from '../fundamentals/Progress';
import { Stack } from '../fundamentals/Stack';
import { scenes } from './scenes';
import type { StoryFile } from './story';

const picture = (i: number) => <img src={scenes[i].src} alt={scenes[i].alt} />;

/** Q65 C13: a card that loads on request, so the skeleton → content swap can be watched again. */
function LoadsIn() {
  const [ready, setReady] = useState(true);
  return (
    <Stack gap="item">
      <Cluster>
        <Button
          label="Load"
          onClick={() => {
            setReady(false);
            window.setTimeout(() => setReady(true), 1200);
          }}
        />
      </Cluster>
      <Grid max={3}>
        <Card loading={!ready} href="#/card" media={picture(0)} eyebrow="Walks" title="Morning over the hills" description="A two-hour loop that starts before sunrise." meta="12 Mar · 6 km" />
        <Card loading={!ready} layout="row" href="#/card" media={picture(1)} title="The desert in the last hour of light" meta="3 Apr" />
      </Grid>
    </Stack>
  );
}

export default {
  component: 'Card',
  tier: 'compound',
  summary: 'A bounded group of content about one thing: a picture, a title, a line on what it’s about, its facts and its own actions. The whole card can be one link.',
  stories: [
    {
      title: 'A grid of linked cards',
      description: 'An index: each card is one link, named by its title. Press anywhere on a card, or Tab to it: the ring goes around the whole card. Their facts line up at the bottom whatever the length of the words above.',
      code: `<Grid max={3}>
  <Card href="/trips/hills" media={<img src={hills} alt="…" />} eyebrow="Walks" title="Morning over the hills" description="A two-hour loop that starts before sunrise." meta="12 Mar · 6 km" />
  …
</Grid>`,
      render: () => (
        <Grid max={3}>
          <Card href="#/card" media={picture(0)} eyebrow="Walks" title="Morning over the hills" description="A two-hour loop that starts before sunrise and ends at the bakery." meta="12 Mar · 6 km" />
          <Card href="#/card" media={picture(1)} eyebrow="Drives" title="The desert in the last hour of light" description="Where to stop for the best of the evening." meta="3 Apr · 140 km" />
          <Card href="#/card" media={picture(3)} eyebrow="Swims" title="Low tide at the lagoon" description="Safe water, warm shallows." meta="18 Jul · 2 km" />
        </Grid>
      ),
    },
    {
      title: 'Grey until pointed at',
      description: 'A picture in a card can take a treatment: in grey at rest, in colour while the card is pointed at or has focus (Tab to a card to see it). The card’s link is the trigger, so the whole card counts. More contrast shows the colour picture.',
      code: `<Card href="/trips/hills" media={<Image src={hills} alt="…" treatment={{ rest: 'greyscale', active: 'none' }} />} title="Morning over the hills" … />`,
      render: () => (
        <Grid max={3}>
          {[0, 1, 3].map((i) => (
            <Card key={i} href="#/card" media={<Image src={scenes[i].src} alt={scenes[i].alt} treatment={{ rest: 'greyscale', active: 'none' }} />} title={scenes[i].caption} meta={scenes[i].label} />
          ))}
        </Grid>
      ),
    },
    {
      title: 'With its own actions',
      description: 'A card that isn’t a link holds actions instead. The main action comes last.',
      code: `<Card media={…} title="Lavender fields" description="…" meta="Saved 2 days ago" actions={<><Button label="Remove" emphasis="quiet" /><Button label="Plan a visit" /></>} />`,
      render: () => (
        <Grid max={2}>
          <Card
            media={picture(4)}
            title="Lavender fields in July"
            description="Rows of lavender in full flower, an hour from the city."
            meta="Saved 2 days ago"
            actions={
              <>
                <Button label="Remove" emphasis="quiet" />
                <Button label="Plan a visit" />
              </>
            }
          />
          <Card
            href="#/card"
            media={picture(5)}
            title="First snow on the hills"
            description="A link and actions together: Tab reaches the title first, then each action."
            meta="Saved last week"
            actions={<Button label="Remove" emphasis="quiet" />}
          />
        </Grid>
      ),
    },
    {
      title: 'Content of its own',
      description: 'Under the description, anything that belongs to the one thing: labels, a progress bar. No picture: the words start at the top.',
      code: `<Card title="Spring launch" description="…" meta="Due 30 Apr">
  <Cluster><Badge tone="info">In review</Badge></Cluster>
  <Progress form="bar" label="Tasks done" value={64} />
</Card>`,
      render: () => (
        <Grid max={2}>
          <Card title="Spring launch" description="The site, the store page and the announcement." meta="Due 30 Apr">
            <Cluster><Badge tone="info">In review</Badge></Cluster>
            <Progress form="bar" label="Tasks done" value={64} />
          </Card>
          <Card title="Accessibility review" description="Every page of the partner dashboard against WCAG 2.2." meta="Due 12 May">
            <Cluster><Badge tone="warning">Blocked</Badge></Cluster>
            <Progress form="bar" label="Pages checked" value={20} />
          </Card>
        </Grid>
      ),
    },
    {
      title: 'Status in the meta line',
      description:
        'A status is a Badge in meta, beside the date: no new prop. The badge says the status in words with its tone, so it never rests on colour; the title stays the card’s name.',
      code: `<Card href="…" media={…} title="Spring walks" meta={<Cluster><Badge tone="success">Booking open</Badge>12 Apr</Cluster>} />`,
      render: () => (
        <Grid max={3}>
          <Card href="#/card" media={picture(0)} title="Spring walks in the hills" meta={<Cluster gap="pair"><Badge tone="success">Booking open</Badge>12 Apr</Cluster>} headingLevel={3} />
          <Card href="#/card" media={picture(1)} title="Desert evenings" meta={<Cluster gap="pair"><Badge tone="info">Coming up</Badge>3 Jun</Cluster>} headingLevel={3} />
          <Card href="#/card" media={picture(2)} title="The ridge at night" meta={<Cluster gap="pair"><Badge>Ended</Badge>21 Jan</Cluster>} headingLevel={3} />
        </Grid>
      ),
    },
    {
      title: 'Picture beside the words',
      description: 'A lead item: the picture and the words share the width. Narrow the window and they stack.',
      code: `<Card layout="beside" href="/trips/harvest" media={…} eyebrow="Featured" title="Harvest time in the valley" description="…" meta="Sep · 3 days" />`,
      render: () => (
        <Card layout="beside" href="#/card" media={picture(6)} eyebrow="Featured" title="Harvest time in the valley" description="Three days of walking between the farms as the fields turn gold, with the routes, where to stay and what to eat." meta="Sep · 3 days" headingLevel={3} />
      ),
    },
    {
      title: 'Rows of a list',
      description: 'The words first and a small square picture at the end: a line of a list.',
      code: `<Card layout="row" href="…" media={…} title="The ridge at night" description="…" meta="5 min read" />`,
      render: () => (
        <Grid max={2}>
          <Card layout="row" href="#/card" media={picture(2)} title="The ridge at night" description="Walking by moonlight, safely." meta="5 min read" />
          <Card layout="row" href="#/card" media={picture(0)} title="Packing for the hills" description="What to carry and what to leave." meta="3 min read" />
        </Grid>
      ),
    },
    {
      title: 'Plain, without an enclosure',
      description: 'Where space already groups each card, the outline is one mark too many: a plain card is only its picture and words.',
      code: `<Card variant="plain" href="…" media={…} eyebrow="Walks" title="…" meta="…" />`,
      render: () => (
        <Grid max={3}>
          <Card variant="plain" href="#/card" media={picture(0)} eyebrow="Walks" title="Morning over the hills" meta="12 Mar · 6 km" />
          <Card variant="plain" href="#/card" media={picture(2)} eyebrow="Walks" title="The ridge at night" meta="2 Feb · 4 km" />
          <Card variant="plain" href="#/card" media={picture(5)} eyebrow="Walks" title="First snow on the hills" meta="11 Dec · 8 km" />
        </Grid>
      ),
    },
    {
      title: 'Loading',
      description: 'The card’s shape in shimmer until its content arrives, in each layout. Nothing in it can be used.',
      code: `<Card loading title="Trip" />`,
      render: () => (
        <Grid max={3}>
          <Card loading title="A trip" />
          <Card loading layout="row" title="An article" />
          <Card loading variant="plain" title="A walk" />
        </Grid>
      ),
    },
    {
      title: 'Loading, then loaded',
      description: 'Press Load: the same card keeps its place while its content arrives under the shimmer, which then fades away; nothing shifts or dims. Press again to see it load once more.',
      code: `<Card loading={!ready} media={…} title="Morning over the hills" … />`,
      render: () => <LoadsIn />,
    },
  ],
} satisfies StoryFile;

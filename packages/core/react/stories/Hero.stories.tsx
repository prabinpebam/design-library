import { Hero } from '../layouts/Hero';
import { MediaPlayer } from '../compounds/MediaPlayer';
import { Statistic } from '../compounds/Statistic';
import { Button } from '../fundamentals/Button';
import { Grid } from '../fundamentals/Grid';
import { scenes } from './scenes';
import driftWebm from './media/drift.webm?url';
import driftMp4 from './media/drift.mp4?url';
import driftPoster from './media/drift-poster.jpg?url';
import driftCaptions from './media/drift.en.vtt?url';
import type { StoryFile } from './story';

const go = () => undefined;

export default {
  component: 'Hero',
  tier: 'layout',
  summary: 'A view’s opening: the title set large, a lead, the one or two main actions and, if it helps, a picture.',
  stories: [
    {
      title: 'Media in the picture’s place',
      description: 'media takes any media where the picture would be, with the same arrangement: here a film that plays in place. The media brings its own words (the player’s title and captions). Use picture for one picture: it brings the frame, ratio and focal point.',
      code: `<Hero level={2} title="Watch the evening drift" lead="…" media={<MediaPlayer source={…} title="Colour drift" poster={poster} />} actions={…} />`,
      render: () => (
        <Hero
          level={2}
          title="Watch the evening drift"
          lead="Twelve seconds of night blue drifting into evening orange, made for the opening of a page."
          media={
            <MediaPlayer
              source={{ from: 'file', files: [{ src: driftWebm, type: 'video/webm' }, { src: driftMp4, type: 'video/mp4' }], tracks: [{ src: driftCaptions, label: 'English', lang: 'en' }] }}
              title="Colour drift"
              poster={driftPoster}
            />
          }
          actions={<Button label="See the colours" href="#/colour" emphasis="primary" size="l" />}
        />
      ),
    },
    {
      title: 'With a trail',
      description: 'trail follows the opening inside it, across its width, a section level after the words and picture: key facts here, or a row of partner marks, or a cue to what’s below.',
      code: `<Hero title="…" picture={…} actions={…} trail={<Grid max={3}><Statistic label="Walks" value={48} /> …</Grid>} />`,
      render: () => (
        <Hero
          level={2}
          title="Walks for every season"
          lead="Routes, maps and where to stop, written by people who walk them."
          picture={{ src: scenes[2].src, alt: scenes[2].alt }}
          actions={<Button label="Find a walk" emphasis="primary" size="l" onClick={go} />}
          trail={
            <Grid max={3}>
              <Statistic label="Walks" value={48} />
              <Statistic label="Regions" value={9} />
              <Statistic label="Kilometres mapped" value={612} />
            </Grid>
          }
        />
      ),
    },
    {
      title: 'Fits the first screen',
      description: 'fit="screen": the opening fills the first screen (the window’s height less the sticky header and the layout’s first space) with its parts centred in it, so the next part waits below the fold. Taller content grows it; nothing is cut off. In a SiteLayout, pair it with opening="flush" when the opening should meet the header.',
      code: `<Hero fit="screen" title="…" lead="…" actions={…} />`,
      render: () => (
        <Hero
          level={2}
          fit="screen"
          eyebrow="Open every day"
          title="Books for slow evenings"
          lead="A small shop on the quay, with a reading chair by every window."
          actions={<Button label="See new books" emphasis="primary" size="l" onClick={go} />}
        />
      ),
    },
    {
      title: 'Split',
      description: 'Words and picture side by side, the words centred on the picture; where the room is narrow, the picture goes under the words.',
      code: `<Hero level={2} title="Plan the trip together" lead="One shared plan for routes, bookings and who brings what." picture={{ src: hills, alt: 'Rolling green hills under a pale blue sky and a yellow sun.' }} actions={<><Button label="Start a plan" emphasis="primary" size="l" onClick={start} /><Button label="See an example" size="l" onClick={example} /></>} note="Free for groups of up to six." />`,
      render: () => (
        <Hero
          level={2}
          title="Plan the trip together"
          lead="One shared plan for routes, bookings and who brings what."
          picture={{ src: scenes[0].src, alt: scenes[0].alt }}
          actions={
            <>
              <Button label="Start a plan" emphasis="primary" size="l" onClick={go} />
              <Button label="See an example" size="l" onClick={go} />
            </>
          }
          note="Free for groups of up to six."
        />
      ),
    },
    {
      title: 'Stacked',
      description: 'The words, then the picture below and wide: for the opening of a long page’s section.',
      code: `<Hero level={2} layout="stacked" eyebrow="Field notes" title="The ridge at night" lead="What we saw on three nights of walking above the tree line." picture={{ src: ridge, alt: 'Dark blue hills under a night sky with a white moon.' }} />`,
      render: () => (
        <Hero
          level={2}
          layout="stacked"
          eyebrow="Field notes"
          title="The ridge at night"
          lead="What we saw on three nights of walking above the tree line."
          picture={{ src: scenes[2].src, alt: scenes[2].alt }}
        />
      ),
    },
    {
      title: 'Words only',
      description: 'No picture: the title carries the view.',
      code: `<Hero level={2} eyebrow="Journal" title="Notes" lead="Short pieces on planning, walking and the places in between." />`,
      render: () => <Hero level={2} eyebrow="Journal" title="Notes" lead="Short pieces on planning, walking and the places in between." />,
    },
    {
      title: 'Divided',
      description: 'No picture: the words in one column, the action and its note in the other, so what follows comes up close. They stack where the room is narrow.',
      code: `<Hero level={2} layout="divided" title="Everything for the weekend" lead="Routes, huts and the weather, in one place." actions={<Button label="Find a route" emphasis="primary" onClick={find} />} note="Updated every morning." />`,
      render: () => (
        <Hero
          level={2}
          layout="divided"
          title="Everything for the weekend"
          lead="Routes, huts and the weather, in one place."
          actions={<Button label="Find a route" emphasis="primary" onClick={go} />}
          note="Updated every morning."
        />
      ),
    },
  ],
} satisfies StoryFile;

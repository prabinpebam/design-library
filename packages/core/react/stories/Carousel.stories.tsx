import { Carousel } from '../compounds/Carousel';
import { Heading } from '../fundamentals/Heading';
import { Stack } from '../fundamentals/Stack';
import { Text } from '../fundamentals/Text';
import { scenes } from './scenes';
import type { StoryFile } from './story';

const cards = ['Tokens', 'Fundamentals', 'Compounds', 'Layouts', 'Library', 'Revisions'].map((t, i) => ({
  label: t,
  content: (
    <Stack gap="pair">
      <Heading level={4}>{t}</Heading>
      <Text tone="muted">Tier {Math.min(i, 3)} · {['every value', 'built from tokens', 'built from fundamentals', 'whole pages', 'the catalogue', 'owner comments'][i]}</Text>
    </Stack>
  ),
}));

export default {
  component: 'Carousel',
  tier: 'compound',
  summary: 'Slides shown one or a few at a time, moved by a swipe, the arrow keys, previous and next or a picker; optional peek, loop and autoplay with a visible Pause.',
  stories: [
    {
      title: 'A quiet carousel',
      description: 'The default: it moves only when the reader asks, its ends are real (Previous is unavailable on the first slide), and the counter and dots say where you are. Swipe, scroll sideways or press Left and Right on the slides.',
      code: `<Carousel label="Landscapes" slides={scenes} />`,
      render: () => <Carousel label="Landscapes" slides={scenes} />,
    },
    {
      title: 'With a peek',
      description: 'One slide in the middle with part of each neighbour showing, faded and a little smaller; pressing a neighbour brings it to the middle. Neighbours stay out of the Tab order.',
      code: `<Carousel label="Landscapes" slides={scenes} peek loop />`,
      render: () => <Carousel label="Landscapes with a peek" slides={scenes} peek loop />,
    },
    {
      title: 'Several per view',
      description: 'perView shows 2 to 4 slides at once and moves one slide at a time; the counter says the range (“1–3 of 7”). Under 40 rem the carousel shows one.',
      code: `<Carousel label="Landscapes" slides={scenes} perView={3} />`,
      render: () => <Carousel label="Landscapes, three at a time" slides={scenes} perView={3} />,
    },
    {
      title: 'Autoplay with Pause',
      description: 'autoplay moves on every 6 s (the interval token) and loops; the current dot fills as the time runs. Rotation stops while the pointer is over it, stops for good once focus enters, and the first control says “Stop slide rotation”. With reduced motion it doesn’t start by itself. While rotating, the new slide isn’t announced.',
      code: `<Carousel label="Featured landscapes" slides={scenes} autoplay />`,
      render: () => <Carousel label="Featured landscapes" slides={scenes.slice(0, 5)} autoplay />,
    },
    {
      title: 'Thumbnails',
      description: 'pager="thumbnails": a row of the pictures that scrolls sideways; the current one is outlined. Left and Right move between them.',
      code: `<Carousel label="Landscapes" slides={scenes} pager="thumbnails" />`,
      render: () => <Carousel label="Landscapes with thumbnails" slides={scenes} pager="thumbnails" />,
    },
    {
      title: 'Without the arrows; any content',
      description: 'arrows={false} leaves only the picker, a swipe and the arrow keys. A slide can hold any content (here a short card); the caption and label still name it.',
      code: `<Carousel label="Library tiers" slides={cards} arrows={false} perView={2} />`,
      render: () => <Carousel label="Library tiers" slides={cards} arrows={false} perView={2} />,
    },
    {
      title: 'Pictures with a dark version and a credit',
      description: 'A picture slide takes what Image takes: dark and contrast versions (switch the scheme), a treatment (such as grey until pointed at), an alternate with a reveal, and a focal point; the library’s Image draws such a slide. A credit follows the caption.',
      code: `<Carousel label="Landscapes" slides={scenes.map((s) => ({ ...s, dark: night, focal: { x: 0.5, y: 0.6 }, credit: 'Photo: A. Rivera' }))} />`,
      render: () => (
        <Carousel
          label="Landscapes with a dark version"
          slides={scenes.slice(0, 4).map((s) => ({ ...s, dark: scenes[2].src, focal: { x: 0.5, y: 0.6 }, credit: 'Photo: A. Rivera' }))}
        />
      ),
    },
  ],
} satisfies StoryFile;

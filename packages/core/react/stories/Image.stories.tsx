import { Image } from '../fundamentals/Image';
import { Grid } from '../fundamentals/Grid';
import { Stack } from '../fundamentals/Stack';
import { ContextMatrix } from '../compounds/ContextMatrix';
import { Section } from '../compounds/Section';
import { scenes } from './scenes';
import type { StoryFile } from './story';
import lighthouseDay from './media/scenes/lighthouse-day.webp?url';
import lighthouseNight from './media/scenes/lighthouse-night.webp?url';
import seedlingLight from './media/spot/seedling-light.svg?url';
import seedlingDark from './media/spot/seedling-dark.svg?url';
import seedlingDarkMore from './media/spot/seedling-dark-more.svg?url';

const lighthouseAlt = 'A striped lighthouse on a green headland above the sea.';

export default {
  component: 'Image',
  tier: 'fundamental',
  summary: 'A picture in a frame of a fixed shape that holds its space while it loads and says what it was when it can’t load.',
  stories: [
    {
      title: 'A picture',
      description: 'In a 3:2 frame, rounded, loaded when it nears the window. The frame keeps its space, so the words under it never jump.',
      code: `<Image src={hills} alt="Rolling green hills under a pale blue sky and a yellow sun." />`,
      render: () => <Image src={scenes[0].src} alt={scenes[0].alt} />,
    },
    {
      title: 'Frame shapes',
      description: 'Wide 16:9, photo 3:2, square and portrait 4:5. The picture fills the frame and its edges are cropped.',
      code: `<Image ratio="wide" … />  <Image ratio="photo" … />  <Image ratio="square" … />  <Image ratio="portrait" … />`,
      render: () => (
        <Grid max={4}>
          <Image ratio="wide" src={scenes[1].src} alt={scenes[1].alt} />
          <Image ratio="photo" src={scenes[2].src} alt={scenes[2].alt} />
          <Image ratio="square" src={scenes[3].src} alt={scenes[3].alt} />
          <Image ratio="portrait" src={scenes[4].src} alt={scenes[4].alt} />
        </Grid>
      ),
    },
    {
      title: 'Wider and squarer frames',
      description: 'Ultrawide 21:9 for a band across a page, classic 4:3 for a calmer photo. Same picture, so the crop shows.',
      code: `<Image ratio="ultrawide" … />  <Image ratio="classic" … />`,
      render: () => (
        <Grid max={2}>
          <Image ratio="ultrawide" src={scenes[1].src} alt={scenes[1].alt} />
          <Image ratio="classic" src={scenes[1].src} alt={scenes[1].alt} />
        </Grid>
      ),
    },
    {
      title: 'Treatments',
      description: 'treatment draws a picture in grey or in duotone (grey multiplied over the duotone colour, the accent by default), by prop or by a picture entry’s treatment field. With { rest, active } it changes while the picture, or the link or card around it, is pointed at or focused: grey until you point. More contrast and forced colours show every picture as it is.',
      code: `<Image treatment="greyscale" … />
<Image treatment="duotone" … />
<Image treatment={{ rest: 'greyscale', active: 'none' }} … />  // colour on hover or focus`,
      render: () => (
        <Grid max={3}>
          <Image ratio="square" treatment="greyscale" src={scenes[5].src} alt={scenes[5].alt} caption="Greyscale" />
          <Image ratio="square" treatment="duotone" src={scenes[5].src} alt={scenes[5].alt} caption="Duotone" />
          <Image ratio="square" treatment={{ rest: 'greyscale', active: 'none' }} src={scenes[5].src} alt={scenes[5].alt} caption="Grey, colour when pointed at" />
        </Grid>
      ),
    },
    {
      title: 'Focal point',
      description: 'When cover crops, focal keeps a point in view: x and y from 0 to 1, across from the start edge and down from the top (the same field as a picture entry’s focal). The same tall crop of one picture, centred (default), held on its left part, then on its right part.',
      code: `<Image ratio="portrait" focal={{ x: 0.1, y: 0.5 }} … />`,
      render: () => (
        <Grid max={3}>
          <Image ratio="portrait" src={scenes[1].src} alt={scenes[1].alt} />
          <Image ratio="portrait" focal={{ x: 0.1, y: 0.5 }} src={scenes[1].src} alt={scenes[1].alt} />
          <Image ratio="portrait" focal={{ x: 0.9, y: 0.5 }} src={scenes[1].src} alt={scenes[1].alt} />
        </Grid>
      ),
    },
    {
      title: 'Shown whole',
      description: 'With fit set to contain, the whole picture shows inside the frame, on the frame’s soft fill.',
      code: `<Image ratio="square" fit="contain" src={…} alt="…" />`,
      render: () => (
        <Grid max={2}>
          <Image ratio="square" fit="contain" src={scenes[5].src} alt={scenes[5].alt} />
          <Image ratio="square" src={scenes[5].src} alt={scenes[5].alt} />
        </Grid>
      ),
    },
    {
      title: 'With a caption and a credit',
      description: 'A caption makes it a figure: the caption is read with the picture.',
      code: `<Image src={…} alt="…" caption="Harvest time in the valley." credit="Generated for this library" />`,
      render: () => <Image src={scenes[6].src} alt={scenes[6].alt} caption={scenes[6].caption} credit="Generated for this library" />,
    },
    {
      title: 'Failed to load',
      description: 'A picture that can’t load shows an icon and its alternative text, so nothing goes missing without a word. While a picture is on its way, its frame shimmers instead (seen on a slow connection). The shimmer runs three passes, then holds still.',
      code: `<Image src="/missing.jpg" alt="The team at the spring offsite." />`,
      render: () => (
        <Grid max={2}>
          <Image src="/no-such-picture.jpg" alt="The team at the spring offsite, on the steps of the old library." />
          <Image src="/no-such-picture-either.jpg" alt="" />
        </Grid>
      ),
    },
    {
      title: 'Square corners',
      description: 'For a picture that meets the edge of its container, such as the top of a card.',
      code: `<Image rounded={false} ratio="wide" src={…} alt="…" />`,
      render: () => <Image rounded={false} ratio="wide" src={scenes[3].src} alt={scenes[3].alt} />,
    },
    {
      title: 'Light and dark pictures',
      description:
        'dark names the same picture for a dark scheme, and contrast its files for more contrast (MP17); src stays the light file. Each frame follows the scheme it is drawn in: the page’s, or a band’s own. A photo and an SVG alike, at one ratio under one alt. Only the file in use is fetched; a later switch keeps the old file until the new one has loaded, so nothing flashes or moves. Dark and more contrast falls back to contrast.dark, then dark, then src.',
      code: `<Image src={day} dark={night} alt="A lighthouse on a green headland above the sea." />
<Image src={seedling} dark={seedlingDark} contrast={{ dark: seedlingDarkMore }} ratio="classic" fit="contain" alt="A seedling in a pot." />`,
      render: () => (
        <ContextMatrix
          label="Pictures by scheme"
          rowHeader="Picture"
          columns={[
            { id: 'light', label: 'Light', scheme: 'light', contrast: 'standard' },
            { id: 'dark', label: 'Dark', scheme: 'dark', contrast: 'standard' },
            { id: 'light-more', label: 'Light, more contrast', scheme: 'light', contrast: 'more' },
            { id: 'dark-more', label: 'Dark, more contrast', scheme: 'dark', contrast: 'more' },
          ]}
          rows={[
            {
              id: 'photo',
              label: 'A photo: day and night files',
              cells: Object.fromEntries(['light', 'dark', 'light-more', 'dark-more'].map((c) => [c, <Image src={lighthouseDay} dark={lighthouseNight} alt={lighthouseAlt} />])),
            },
            {
              id: 'svg',
              label: 'An SVG: light, dark and dark with more contrast',
              cells: Object.fromEntries(
                ['light', 'dark', 'light-more', 'dark-more'].map((c) => [c, <Image src={seedlingLight} dark={seedlingDark} contrast={{ dark: seedlingDarkMore }} ratio="classic" fit="contain" alt="A seedling with two leaves in a clay pot." />]),
              ),
            },
          ]}
        />
      ),
    },
    {
      title: 'A dark band on a light page',
      description: 'A band that sets its own data-scheme draws the dark file; the same picture above it, on the light page, draws the light one. No prop changes between the two.',
      code: `<Image src={day} dark={night} alt="…" />
<Section tone="sunken" data-scheme="dark" heading="After dark">
  <Image src={day} dark={night} alt="…" />
</Section>`,
      render: () => (
        <Stack gap="section" data-scheme="light">
          <Image src={lighthouseDay} dark={lighthouseNight} ratio="wide" alt={lighthouseAlt} />
          <Section tone="sunken" data-scheme="dark" heading="After dark" intro="The same picture in a dark band.">
            <Image src={lighthouseDay} dark={lighthouseNight} ratio="wide" alt={lighthouseAlt} />
          </Section>
        </Stack>
      ),
    },
  ],
} satisfies StoryFile;

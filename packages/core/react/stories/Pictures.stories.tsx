import type { ReactElement } from 'react';
import { Image, type PictureTreatment } from '../fundamentals/Image';
import { Grid } from '../fundamentals/Grid';
import { ContextMatrix } from '../compounds/ContextMatrix';
import { Section } from '../compounds/Section';
import type { StoryFile } from './story';
import lighthouseDay from './media/scenes/lighthouse-day.webp?url';
import lighthouseNight from './media/scenes/lighthouse-night.webp?url';
import seedlingLight from './media/spot/seedling-light.webp?url';
import seedlingDark from './media/spot/seedling-dark.webp?url';
import seedlingDarkMore from './media/spot/seedling-dark-more.webp?url';

const alt = 'A striped lighthouse on a green headland above the sea.';
const seedlingAlt = 'A seedling with two leaves in a clay pot.';
const schemes = [
  { id: 'light', label: 'Light', scheme: 'light', contrast: 'standard' },
  { id: 'dark', label: 'Dark', scheme: 'dark', contrast: 'standard' },
  { id: 'light-more', label: 'Light, more contrast', scheme: 'light', contrast: 'more' },
  { id: 'dark-more', label: 'Dark, more contrast', scheme: 'dark', contrast: 'more' },
] as const;
const tones: { id: string; label: string; treatment?: PictureTreatment }[] = [
  { id: 'colour', label: 'Colour (no treatment)' },
  { id: 'greyscale', label: 'Greyscale', treatment: 'greyscale' },
  { id: 'duotone', label: 'Duotone', treatment: 'duotone' },
  { id: 'until', label: 'Grey until pointed at', treatment: { rest: 'greyscale', active: 'none' } },
];
const cells = (draw: () => ReactElement) => Object.fromEntries(schemes.map((s) => [s.id, draw()]));

/** Live examples for the Pictures page (Q115): every version of one picture, drawn by the real Image. */
export default {
  component: 'Image',
  tier: 'fundamental',
  summary: 'Every version of one picture: colour or black and white, and a file for each scheme.',
  stories: [
    {
      title: 'Colour or black and white',
      description:
        'One file, four looks. Greyscale and duotone quiet a picture so it sits with the page; duotone tints it with the accent. Grey until pointed at gives a grid of pictures one calm look and shows colour on the one you point at or move focus to.',
      code: `<Image src={day} alt="…" />
<Image src={day} alt="…" treatment="greyscale" />
<Image src={day} alt="…" treatment="duotone" />
<Image src={day} alt="…" treatment={{ rest: 'greyscale', active: 'none' }} />`,
      render: () => (
        <Grid max={4}>
          {tones.map((t) => (
            <Image key={t.id} ratio="square" src={lighthouseDay} alt={alt} treatment={t.treatment} caption={t.label} />
          ))}
        </Grid>
      ),
    },
    {
      title: 'A file for each scheme',
      description:
        'The same picture drawn for light, dark and more contrast, at one shape under one description. A dark file is never a tinted, filtered or inverted copy: it is the scene as it looks at night (the lighthouse) or the drawing redrawn on a dark canvas with the same light (the seedling), made with AI or supplied by you. Each frame shows the file for the scheme it sits in. A scheme with no file of its own falls back: dark with more contrast to the dark file, then the light one; light with more contrast to the light one.',
      code: `<Image src={day} dark={night} alt="…" />
<Image src={seedling} dark={seedlingDark} contrast={{ dark: seedlingDarkMore }} alt="…" />`,
      render: () => (
        <ContextMatrix
          label="One picture by scheme"
          rowHeader="Files given"
          columns={[...schemes]}
          rows={[
            { id: 'photo', label: 'A photo: light and dark', cells: cells(() => <Image src={lighthouseDay} dark={lighthouseNight} alt={alt} />) },
            {
              id: 'svg',
              label: 'An illustration: light canvas, dark canvas, dark with more contrast',
              cells: cells(() => <Image src={seedlingLight} dark={seedlingDark} contrast={{ dark: seedlingDarkMore }} ratio="classic" fit="contain" alt={seedlingAlt} />),
            },
          ]}
        />
      ),
    },
    {
      title: 'Both together',
      description:
        'The look and the file are chosen apart, so every look works with every file: here the dark file in greyscale and in duotone. With more contrast, every picture shows in full colour, whatever its treatment, so nothing is harder to make out.',
      code: `<Image src={day} dark={night} alt="…" treatment="greyscale" />`,
      render: () => (
        <ContextMatrix
          label="Each look with each file"
          rowHeader="Look"
          columns={[...schemes]}
          rows={tones.map((t) => ({ id: t.id, label: t.label, cells: cells(() => <Image src={lighthouseDay} dark={lighthouseNight} alt={alt} treatment={t.treatment} />) }))}
        />
      ),
    },
    {
      title: 'A band with its own scheme',
      description: 'A dark band on a light page draws the dark file, in the same look as the picture above it. Nothing changes but where the picture sits.',
      code: `<Image src={day} dark={night} treatment="greyscale" alt="…" />
<Section tone="sunken" data-scheme="dark" heading="After dark">
  <Image src={day} dark={night} treatment="greyscale" alt="…" />
</Section>`,
      render: () => (
        <Grid max={2} data-scheme="light">
          <Image src={lighthouseDay} dark={lighthouseNight} treatment="greyscale" alt={alt} caption="On the light page: the light file" />
          <Section tone="sunken" data-scheme="dark" heading="After dark">
            <Image src={lighthouseDay} dark={lighthouseNight} treatment="greyscale" alt={alt} caption="In the dark band: the dark file" />
          </Section>
        </Grid>
      ),
    },
  ],
} satisfies StoryFile;

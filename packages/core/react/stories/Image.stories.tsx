import { Card } from '../compounds/Card';
import { Image } from '../fundamentals/Image';
import type { PictureReveal } from '../behaviour/reveal';
import { layoutStipple, perlin2, stippleRadius, stippleSettings, stippleTime, type StipplePoint } from '../../effects';
import { Grid } from '../fundamentals/Grid';
import { Stack } from '../fundamentals/Stack';
import { ContextMatrix } from '../compounds/ContextMatrix';
import { Section } from '../compounds/Section';
import { ScreenPreview } from '../compounds/ScreenPreview';
import { scenes } from './scenes';
import type { StoryFile } from './story';
import lighthouseDay from './media/scenes/lighthouse-day.webp?url';
import lighthouseNight from './media/scenes/lighthouse-night.webp?url';
import seedlingLight from './media/spot/seedling-light.svg?url';
import seedlingDark from './media/spot/seedling-dark.svg?url';
import seedlingDarkMore from './media/spot/seedling-dark-more.svg?url';

const lighthouseAlt = 'A striped lighthouse on a green headland above the sea.';
/** MP11: two reveals drawn with the one hook. A wipe from the start edge… */
const wipe: PictureReveal = ({ context, width, height, progress, paint }) => {
  paint('picture');
  context.save();
  context.beginPath();
  context.rect(0, 0, width * progress, height);
  context.clip();
  paint('alternate');
  context.restore();
};
/** …and a stipple on the library's own field (MP12, `@design-library/core/effects`): the stipple dots of the pair grow, the
 * darker noise first, drifting as they go, until they cover the picture. */
let field = { width: 0, height: 0, points: [] as StipplePoint[] };
const stipple: PictureReveal = ({ context, width, height, progress, time, paint }) => {
  if (progress >= 1) return paint('alternate');
  paint('picture');
  if (field.width !== width || field.height !== height) field = { width, height, points: layoutStipple(width, height) };
  const t = stippleTime(time);
  const cover = stippleSettings.spacing * 1.25;
  context.save();
  context.beginPath();
  for (const point of field.points) {
    const order = (perlin2(point.n[0] * 4, point.n[1] * 4) + 1) / 2;
    const grow = Math.min(1, Math.max(0, progress * 1.6 - order * 0.6));
    if (grow <= 0) continue;
    const r = grow * (cover + stippleRadius(point, t));
    context.moveTo(point.x + r, point.y);
    context.arc(point.x, point.y, r, 0, Math.PI * 2);
  }
  context.clip();
  paint('alternate');
  context.restore();
};
/** A generic shape set (MP8), the library's own art: drawn in currentColor on a 100-unit square, spilling past it. */
const dots = (
  <svg viewBox="0 0 100 100" focusable="false">
    {Array.from({ length: 16 }, (_, i) => (
      <circle key={i} cx={78 + (i % 4) * 7} cy={-8 + Math.floor(i / 4) * 7} r="1.8" fill="currentColor" />
    ))}
    <circle cx="8" cy="92" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" />
  </svg>
);
const dotsInside = (
  <svg viewBox="0 0 100 100" preserveAspectRatio="xMaxYMin meet" focusable="false">
    {Array.from({ length: 16 }, (_, i) => (
      <circle key={i} cx={74 + (i % 4) * 6} cy={8 + Math.floor(i / 4) * 6} r="1.6" fill="currentColor" />
    ))}
  </svg>
);
const blob = (
  <svg viewBox="0 0 100 100" focusable="false">
    <circle cx="-2" cy="104" r="26" fill="currentColor" opacity="0.35" />
    <rect x="80" y="-8" width="26" height="26" rx="6" fill="currentColor" opacity="0.2" />
  </svg>
);

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
    {
      title: 'A dark file from assets.json',
      description:
        'A picture entry names its dark file (and contrast files) next to src, in the template’s or site’s assets.json (MP18); every block that draws the picture passes them on. Here Harbour Books’ opening picture has a dimmed file for the dark scheme: switch the preview’s scheme and the opening swaps with it.',
      code: `"shopfront": {
  "src": "assets/shopfront.webp",
  "dark": "assets/shopfront-dark.webp",
  "alt": "The shop’s lit window on a cobbled quay at dusk: …"
}`,
      render: () => <ScreenPreview src="site.html?demo=site#/" title="Harbour Books, whose opening picture has a dark file" caption="Harbour’s home: the opening picture follows the preview’s light or dark." />,
    },
    {
      title: 'Shapes over and under a picture',
      description:
        'decoration draws shapes over the picture and under draws them behind it, both the picture’s own size: an SVG in either fills it, and shapes drawn outside its 0–100 box spill past the edge while the picture keeps its corners. Shapes in currentColor take the decoration colour (the accent, a brand setting). Screen readers skip them, the pointer passes through them, and the layout around the picture doesn’t move.',
      code: `<Image ratio="square" src={…} alt="…"
  under={<svg viewBox="0 0 100 100"><circle cx="-2" cy="104" r="26" fill="currentColor" opacity="0.35" /></svg>}
  decoration={<svg viewBox="0 0 100 100">{/* dots at the top corner, a ring at the bottom */}</svg>} />`,
      render: () => (
        <Grid max={3}>
          <Image ratio="square" src={scenes[2].src} alt={scenes[2].alt} caption="Under: shapes behind" under={blob} />
          <Image ratio="square" src={scenes[2].src} alt={scenes[2].alt} caption="Decoration: shapes over" decoration={dots} />
          <Image ratio="square" src={scenes[2].src} alt={scenes[2].alt} caption="Both" under={blob} decoration={dots} />
        </Grid>
      ),
    },
    {
      title: 'Decorated, inside a card you can focus',
      description:
        'The same picture as a card’s media: the card stays one link, its focus ring stays whole, and the grey-until-pointed-at look still turns to colour on hover or focus, through the shapes. A card keeps its own corners, so here the shapes stay inside it.',
      code: `<Card href="/walks/hills" title="Morning over the hills" media={<Image ratio="wide" treatment={{ rest: 'greyscale', active: 'none' }} decoration={dots} src={…} alt="" />} />`,
      render: () => (
        <Grid max={2}>
          <Card href="#/image" eyebrow="Walks" title="Morning over the hills" description="A two-hour loop that starts before sunrise." media={<Image ratio="wide" rounded={false} treatment={{ rest: 'greyscale', active: 'none' }} decoration={dotsInside} src={scenes[0].src} alt="" />} />
        </Grid>
      ),
    },
    {
      title: 'Before and after',
      description:
        'alternate pairs a second picture with the first: it shows while the picture, or the card or link around it, is hovered or focused, fading in on the change timing, and it is fetched only the first time. Both share one shape; screen readers hear alt, so it names both. The same from data: a picture entry’s alternate in assets.json.',
      code: `<Image src={day} alternate={night} alt="Before and after: the lighthouse by day, then lit at night." />

// assets.json
"lighthouse": { "src": "assets/day.webp", "alternate": "assets/night.webp", "alt": "Before and after: …" }`,
      render: () => (
        <Grid max={2}>
          <Image src={lighthouseDay} alternate={lighthouseNight} alt="Before and after: the lighthouse by day, then lit at night." caption="Point at it, or move focus to the card beside it" />
          <Card href="#/image" eyebrow="Lighthouses" title="The headland light, day and night" description="Point at the card or move focus to it to see it lit." media={<Image ratio="photo" rounded={false} src={lighthouseDay} alternate={lighthouseNight} alt="" />} />
        </Grid>
      ),
    },
    {
      title: 'Your own reveal: a wipe and a stipple',
      description:
        'reveal draws the change to the pair yourself, on a canvas over the picture: the library calls it every frame with the progress (0 to 1 while pointed at or focused, back to 0 after) and paint, which draws either picture as the frame fits it. The library keeps the triggers, the timing and reduced motion: with reduced motion your drawing isn’t called and the plain fade shows. Left, a wipe from the start edge; right, a stipple built on the library’s own field from @design-library/core/effects (the dots ImageGeneration draws), growing darker noise first. Same hook, different drawing.',
      code: `const wipe: PictureReveal = ({ context, width, height, progress, paint }) => {
  paint('picture');
  context.save(); context.beginPath(); context.rect(0, 0, width * progress, height); context.clip();
  paint('alternate');
  context.restore();
};
<Image src={day} alternate={night} reveal={wipe} alt="Before and after: …" />

import { layoutStipple, perlin2, stippleRadius, stippleSettings, stippleTime } from '@design-library/core/effects';
const stipple: PictureReveal = ({ context, width, height, progress, time, paint }) => {
  paint('picture');
  const points = layoutStipple(width, height); // keep these for the size
  context.save(); context.beginPath();
  for (const p of points) {
    const grow = Math.min(1, Math.max(0, progress * 1.6 - ((perlin2(p.n[0] * 4, p.n[1] * 4) + 1) / 2) * 0.6));
    const r = grow * (stippleSettings.spacing * 1.25 + stippleRadius(p, stippleTime(time)));
    if (r > 0) { context.moveTo(p.x + r, p.y); context.arc(p.x, p.y, r, 0, Math.PI * 2); }
  }
  context.clip(); paint('alternate'); context.restore();
};`,
      render: () => (
        <Grid max={2}>
          <Image src={lighthouseDay} alternate={lighthouseNight} reveal={wipe} alt="Before and after: the lighthouse by day, then lit at night." caption="A wipe" />
          <Image src={lighthouseDay} alternate={lighthouseNight} reveal={stipple} alt="Before and after: the lighthouse by day, then lit at night." caption="A stipple" />
        </Grid>
      ),
    },
  ],
} satisfies StoryFile;
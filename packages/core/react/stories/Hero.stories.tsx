import { useState } from 'react';
import { Stack } from '../fundamentals/Stack';
import { Cluster } from '../fundamentals/Cluster';
import { Switch } from '../fundamentals/Switch';
import { Text } from '../fundamentals/Text';
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
import { richText } from '../../render/rich-text';
import { ScreenPreview } from '../compounds/ScreenPreview';

const go = () => undefined;
/** A brand's marks around an opening picture (MP9): the library's own shape art, in currentColor (the decoration colour). */
const heroMarks = (
  <svg viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
    <circle cx="96" cy="2" r="9" fill="currentColor" />
    <circle cx="4" cy="98" r="14" fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
  </svg>
);
const heroUnder = (
  <svg viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
    <rect x="6" y="8" width="100" height="100" rx="4" fill="currentColor" opacity="0.25" />
  </svg>
);
const series = [
  { title: 'Atlas', lead: 'A map of every room in a hospital.' },
  { title: 'Paper trail', lead: 'Receipts that file themselves, for a team of four accountants who were tired of shoeboxes.' },
  { title: 'The slow library', lead: 'Lending by appointment.' },
  { title: 'Tide tables', lead: 'Harbour times for small boats, read at a glance from the quay, in sun or rain, with gloves on.' },
  { title: 'Quiet hours', lead: 'Notifications that wait until you are ready for them.' },
  { title: 'Birds of the park, drawn by walkers', lead: 'Forty species, one park.' },
  { title: 'Ledger', lead: 'Shared costs for a house of five, settled every month without a spreadsheet or an argument.' },
  { title: 'Night bus', lead: 'Where the last bus is, live.' },
  { title: 'Seed swap', lead: 'Neighbours trading seeds by the season, with a calendar of what to sow this week and what to save for next year.' },
  { title: 'Studio', lead: 'Booking a shared workshop by the hour.' },
  { title: 'Common ground: a street party', lead: 'From the first idea to the last table folded away.' },
];

function SteadySeries() {
  const [at, setAt] = useState(0);
  const [steady, setSteady] = useState(true);
  const p = series[at];
  return (
    <Stack gap="group">
      <Cluster gap="item">
        <Button label="Previous project" icon="chevron-start" disabled={at === 0} onClick={() => setAt(at - 1)} />
        <Button label="Next project" icon="chevron-end" disabled={at === series.length - 1} onClick={() => setAt(at + 1)} />
        <Switch label="Reserve three lines" checked={steady} onChange={setSteady} />
      </Cluster>
      <Hero eyebrow={`Project ${at + 1} of ${series.length}`} title={p.title} lead={p.lead} reserve={steady ? { title: 3, lead: 3 } : undefined} />
      <Text tone="muted">What follows the opening: it stays in one place while the Switch is on.</Text>
    </Stack>
  );
}

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
    {
      title: 'Rich words from content',
      description:
        'A hero block’s title and lead take rich text in content (DP1): a list of strings and marked runs, no markup. The title takes emphasis, accent and break; the lead also takes strong, code and link. richText from @design-library/core/render draws them, the accent through Text tone="accent" (the accent display role at this size).',
      code: `// content: { "type": "hero", "title": ["Books for ", { "text": "slow evenings", "mark": "accent" }],
//            "lead": ["A small shop on the quay. ", { "text": "Open late", "mark": "strong" }, " on Fridays."] }
import { richText } from '@design-library/core/render';
<Hero title={richText(block.title)} lead={richText(block.lead)} />`,
      render: () => (
        <Hero
          title={richText(['Books for ', { text: 'slow evenings', mark: 'accent' }])}
          lead={richText(['A small shop on the quay. ', { text: 'Open late', mark: 'strong' }, ' on Fridays, ', { text: 'see the hours', mark: 'link', href: '#/hero' }, '.'])}
        />
      ),
    },
    {
      title: 'Breadcrumbs before the opening',
      description:
        'A trail of where the page sits goes before the opening as its own part, not inside it: Breadcrumbs, then Hero, at the layout’s band gap (ID30). It keeps the spacing rules at every width. With opening="flush" the first band meets the header, so the trail would touch it: keep the spaced opening when a trail leads.',
      code: `<SiteLayout header={…}>
  <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Speakers', href: '/speakers' }, { label: 'Mira Okafor' }]} />
  <Hero eyebrow="Speaker" title="Mira Okafor on maps people can read" lead="…" picture={…} />
</SiteLayout>`,
      render: () => <ScreenPreview src="site.html?demo=crumbs" title="A speaker page: breadcrumbs, then the opening" caption="Breadcrumbs as the part before a split opening, under the site header." />,
    },
    {
      title: 'A steady opening across a series',
      description:
        'reserve={{ title: 3, lead: 3 }} keeps room for three lines of each, so stepping through a series of pages (11 projects here, titles from one word to several lines) keeps the opening one height and what follows in one place. Turn the Switch off to see the opening jump. Text longer than the reserve still grows it; nothing clips. In a phone-sized window the display title and lead take more lines, so some openings here grow: reserve for the narrowest window that matters, or keep titles short.',
      code: `<Hero eyebrow="Project 4 of 11" title={project.title} lead={project.lead} reserve={{ title: 3, lead: 3 }} />
// From data: { "type": "hero", "title": "…", "lead": "…", "reserve": { "title": 3, "lead": 3 } }`,
      render: () => <SteadySeries />,
    },
    {
      title: 'A decorated opening picture',
      description:
        'picture.decoration draws a brand’s marks over the opening’s picture and picture.under a shape behind it, offset so it shows past the edge: Image’s decoration layer, hidden from screen readers and never in the way. From data, a hero block names one of the template’s decoration presets (registry.decorations, LR20): the art is the template’s, the block stays a fixed configuration; an unknown name draws nothing and is reported.',
      code: `<Hero title="Books for slow evenings" lead="…"
  picture={{ src, alt: '…', decoration: <BrandMarks />, under: <BrandBackdrop /> }} />

// the template registers its presets: registry: { decorations: { marks: () => <BrandMarks /> } }
// hero block in a page document:
{ "type": "hero", "title": "Books for slow evenings", "picture": "shopfront", "decoration": "marks" }`,
      render: () => (
        <Hero
          eyebrow="Harbour Books"
          title="Books for slow evenings"
          lead="A small shop on the quay, open late."
          actions={<Button label="See this week’s books" emphasis="primary" onClick={go} />}
          picture={{ src: scenes[3].src, alt: scenes[3].alt, decoration: heroMarks, under: heroUnder }}
        />
      ),
    },
  ],
} satisfies StoryFile;
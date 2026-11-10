import { Card } from '../compounds/Card';
import { ContextMatrix } from '../compounds/ContextMatrix';
import { Grid } from '../fundamentals/Grid';
import { Illustration } from '../fundamentals/Illustration';
import { Stack } from '../fundamentals/Stack';
import { Text } from '../fundamentals/Text';
import type { StoryFile } from './story';
import lighthouse from './media/illustrations/lighthouse.svg?url';
import sun from './media/illustrations/sun.svg?url';

/** Art written in code (MP20): a seedling in a pot, its stem and leaves drawing themselves when first seen (MP21). */
const seedling = (
  <svg viewBox="0 0 160 160">
    <rect className="fill" x="0" y="0" width="160" height="160" rx="12" />
    <path className="ink" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" d="M80 112 C80 92 80 80 80 64" data-motion="draw" />
    <path className="accent" d="M80 82 C64 82 52 72 50 56 C66 56 78 66 80 82 Z" data-motion="fade" />
    <path className="accent" d="M80 70 C96 70 108 60 110 44 C94 44 82 54 80 70 Z" data-motion="fade" />
    <path className="muted" d="M54 112 H106 L100 140 H60 Z" />
    <path className="ink" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" d="M54 112 H106 L100 140 H60 Z" />
  </svg>
);
const contexts = ['light', 'dark', 'light-more', 'dark-more'];

export default {
  component: 'Illustration',
  tier: 'fundamental',
  summary: 'Drawn art, inline: colours from tokens in every scheme, art for its space, and motion that stops when asked.',
  stories: [
    {
      title: 'One drawing in every scheme',
      description:
        'The shapes carry role classes (ink, muted, fill, surface, accent) instead of colours, and each role reads a token, so the same file is right in light, dark and more contrast with no second file. Under forced colours the roles take the system’s colours.',
      code: `<Illustration src="/art/lighthouse.svg" ratio="wide" label="A lighthouse on the shore, its beam sweeping the sea" />

<!-- in the file -->
<rect class="fill" … />  <polygon class="accent" … />  <path class="ink" fill="none" stroke="currentColor" … />`,
      render: () => (
        <ContextMatrix
          label="One illustration by scheme"
          rowHeader="Illustration"
          columns={[
            { id: 'light', label: 'Light', scheme: 'light', contrast: 'standard' },
            { id: 'dark', label: 'Dark', scheme: 'dark', contrast: 'standard' },
            { id: 'light-more', label: 'Light, more contrast', scheme: 'light', contrast: 'more' },
            { id: 'dark-more', label: 'Dark, more contrast', scheme: 'dark', contrast: 'more' },
          ]}
          rows={[
            { id: 'file', label: 'From a file', cells: Object.fromEntries(contexts.map((c) => [c, <Illustration src={lighthouse} ratio="wide" label="A lighthouse on the shore, its beam sweeping the sea." />])) },
            { id: 'code', label: 'Written in code', cells: Object.fromEntries(contexts.map((c) => [c, <Illustration label="A seedling with two leaves in a pot.">{seedling}</Illustration>])) },
          ]}
        />
      ),
    },
    {
      title: 'Art for its space',
      description:
        'One file holds three groups marked data-size; the illustration shows the one for its own width, not the window’s: compact below 24rem (the lighthouse and one wave), regular to 48rem (more sea), wide from 48rem (cliffs and birds). Here it has the whole width; the next story puts the same file in less.',
      code: `<g data-size="compact">…</g>  <g data-size="regular">…</g>  <g data-size="wide">…</g>
<Illustration src="/art/lighthouse.svg" ratio="wide" label="…" />`,
      render: () => <Illustration src={lighthouse} ratio="wide" label="A lighthouse on the shore between two cliffs, birds overhead." />,
    },
    {
      title: '…in half the width',
      description: 'The same file in half the width shows its regular art. Narrow the window to see it step down.',
      code: `<Grid max={2}><Illustration src="/art/lighthouse.svg" ratio="wide" label="…" />…</Grid>`,
      render: () => (
        <Grid max={2}>
          <Illustration src={lighthouse} ratio="wide" label="A lighthouse on the shore." />
          <Illustration src={lighthouse} ratio="wide" label="A lighthouse on the shore." />
        </Grid>
      ),
    },
    {
      title: '…and in a third',
      description: 'In a third of the width it shows its compact art: the lighthouse and one wave.',
      code: `<Grid max={3}><Illustration src="/art/lighthouse.svg" ratio="wide" label="…" />…</Grid>`,
      render: () => (
        <Grid max={3}>
          {[1, 2, 3].map((n) => (
            <Illustration key={n} src={lighthouse} ratio="wide" label="A lighthouse." />
          ))}
        </Grid>
      ),
    },
    {
      title: 'Moving the first time it’s seen',
      description:
        'Parts marked data-motion move on the motion tokens: draw (a line drawing itself), fade, float, pulse and spin. play="once" (the default) runs them the first time the illustration comes into view, then everything rests. Turn on Reduced motion in the title bar and reload: every part shows its resting frame at once.',
      code: `<path class="ink" … data-motion="draw" />  <path class="accent" … data-motion="fade" />
<Illustration label="A seedling with two leaves in a pot.">{seedling}</Illustration>`,
      render: () => (
        <Grid max={3}>
          <Stack gap="group">
            <Illustration label="A seedling with two leaves in a pot.">{seedling}</Illustration>
            <Text>Ideas you save grow here.</Text>
          </Stack>
        </Grid>
      ),
    },
    {
      title: 'Moving while pointed at',
      description:
        'play="hover" moves the parts while the illustration, or the card or link around it, is pointed at or focused, and returns them to rest after. Point at the card, or reach it with Tab.',
      code: `<Card href="/weather" title="Sunny spells" media={<Illustration src="/art/sun.svg" play="hover" decorative />} />`,
      render: () => (
        <Grid max={3}>
          <Card href="#weather" title="Sunny spells" description="Bright until the evening, a light breeze from the sea." media={<Illustration src={sun} ratio="wide" play="hover" decorative />} />
        </Grid>
      ),
    },
    {
      title: 'A loop with its Pause',
      description:
        'play="loop" keeps the parts moving while the illustration is on screen, so it always shows a Pause control in its corner (anything that moves for more than five seconds must be stoppable). Off screen it stops; under reduced motion it never starts and the control isn’t shown.',
      code: `<Illustration src="/art/sun.svg" ratio="square" play="loop" label="A sun turning slowly behind a drifting cloud." />`,
      render: () => (
        <Grid max={3}>
          <Illustration src={sun} ratio="square" play="loop" label="A sun turning slowly behind a drifting cloud." />
        </Grid>
      ),
    },
    {
      title: 'From assets.json',
      description:
        'In a template, mark an SVG asset illustration and place it with the illustration block (in a page, a split, a grid or a hero’s media), or name it as a card’s or a prose picture: it’s drawn inline like the ones above. Its alt names it. The content check refuses a play it doesn’t know and an illustration that isn’t an .svg; design-library-check-svg refuses scripts, outside references, its own animation and literal colours in token art.',
      code: `// assets.json
"coast": { "src": "assets/coast.svg", "alt": "A lighthouse on the shore.", "ratio": "wide", "illustration": { "play": "once" } }

// a page's or layout's blocks
{ "type": "illustration", "picture": "coast" }`,
      render: () => (
        <Grid max={2}>
          <Illustration src={lighthouse} ratio="wide" label="A lighthouse on the shore." />
        </Grid>
      ),
    },
  ],
} satisfies StoryFile;

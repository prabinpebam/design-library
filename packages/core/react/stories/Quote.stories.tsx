import { Card } from '../compounds/Card';
import { Carousel } from '../compounds/Carousel';
import { Quote } from '../compounds/Quote';
import { Grid } from '../fundamentals/Grid';
import { Stack } from '../fundamentals/Stack';
import type { StoryFile } from './story';

const voices = [
  { name: 'Mira Okafor', role: 'Research lead, Field Notes', text: 'We stopped arguing about pixels and started arguing about people. That was the whole point.' },
  { name: 'Tomás Lindqvist', role: 'Engineer, Harbour Labs', text: 'Every value had a name I could search for. I shipped the dark theme in an afternoon.' },
  { name: 'Aiko Brandt', role: 'Accessibility consultant', text: 'Keyboard and screen reader behaviour were written down before the first screen was drawn. I rarely see that.' },
];

export default {
  component: 'Quote',
  tier: 'compound',
  summary: 'Words someone said or wrote, with who they’re from and where: a testimonial, a recommendation, a line from an interview or a book.',
  stories: [
    {
      title: 'With its author',
      description: 'The words in the reader’s own quotation marks, then the author with their avatar and role. The marks come from the language, so they’re never typed into the words.',
      code: `<Quote author={{ name: 'Mira Okafor', role: 'Research lead, Field Notes' }}>
  We stopped arguing about pixels and started arguing about people. That was the whole point.
</Quote>`,
      render: () => (
        <Quote author={{ name: 'Mira Okafor', role: 'Research lead, Field Notes' }}>
          We stopped arguing about pixels and started arguing about people. That was the whole point.
        </Quote>
      ),
    },
    {
      title: 'Sizes',
      description: '`s` inside a card or beside other content, `m` (default) set apart inside an article, `l` for the one quote a section leads with. The avatar grows with the type.',
      code: `<Quote size="s" author={…}>…</Quote>
<Quote size="m" author={…}>…</Quote>
<Quote size="l" author={…}>…</Quote>`,
      render: () => (
        <Stack gap="section">
          <Quote size="s" author={{ name: 'Tomás Lindqvist', role: 'Engineer, Harbour Labs' }}>
            Every value had a name I could search for. I shipped the dark theme in an afternoon.
          </Quote>
          <Quote size="m" author={{ name: 'Tomás Lindqvist', role: 'Engineer, Harbour Labs' }}>
            Every value had a name I could search for. I shipped the dark theme in an afternoon.
          </Quote>
          <Quote size="l" author={{ name: 'Tomás Lindqvist', role: 'Engineer, Harbour Labs' }}>
            Every value had a name I could search for. I shipped the dark theme in an afternoon.
          </Quote>
        </Stack>
      ),
    },
    {
      title: 'From a source',
      description: 'A quote from a book, a talk or an article names where it’s from. With a link, the source is the one link and the quote’s cite points to it.',
      code: `<Quote source={{ title: 'Interview with the studio, May 2026', href: 'https://example.com/interview' }} author={{ name: 'Aiko Brandt' }}>
  Keyboard and screen reader behaviour were written down before the first screen was drawn.

  I rarely see that.
</Quote>`,
      render: () => (
        <Stack gap="section">
          <Quote source={{ title: 'Interview with the studio, May 2026', href: 'https://example.com/interview' }} author={{ name: 'Aiko Brandt', role: 'Accessibility consultant' }}>
            {'Keyboard and screen reader behaviour were written down before the first screen was drawn.\n\nI rarely see that.'}
          </Quote>
          <Quote size="s" source={{ title: 'Notes on a shared vocabulary, chapter 3' }}>
            A name is a decision you only have to make once.
          </Quote>
        </Stack>
      ),
    },
    {
      title: 'Recommendations',
      description: 'Several quotes, each in a Card whose title says what it’s about. The card is the one boundary; the quote adds none of its own.',
      code: `<Grid max={3}>
  <Card title="Faster theming">
    <Quote size="s" author={{ name: 'Tomás Lindqvist', role: 'Engineer, Harbour Labs' }}>…</Quote>
  </Card>
  …
</Grid>`,
      render: () => (
        <Grid max={3}>
          <Card title="Faster theming" headingLevel={3}>
            <Quote size="s" author={{ name: voices[1].name, role: voices[1].role }}>{voices[1].text}</Quote>
          </Card>
          <Card title="Research that sticks" headingLevel={3}>
            <Quote size="s" author={{ name: voices[0].name, role: voices[0].role }}>{voices[0].text}</Quote>
          </Card>
          <Card title="Accessible from the start" headingLevel={3}>
            <Quote size="s" author={{ name: voices[2].name, role: voices[2].role }}>{voices[2].text}</Quote>
          </Card>
        </Grid>
      ),
    },
    {
      title: 'Voices',
      description: 'One large quote at a time, centred, in a Carousel: the slide names the quote, the arrows and dots move between them.',
      code: `<Carousel
  label="What people say"
  slides={voices.map((v) => ({
    label: v.name,
    content: <Quote size="l" align="center" author={{ name: v.name, role: v.role }}>{v.text}</Quote>,
  }))}
/>`,
      render: () => (
        <Carousel
          label="What people say"
          slides={voices.map((v) => ({
            label: v.name,
            content: (
              <Quote size="l" align="center" author={{ name: v.name, role: v.role }}>
                {v.text}
              </Quote>
            ),
          }))}
        />
      ),
    },
    {
      title: 'Loading',
      description: 'The words and the author shimmer in the quote’s own shape until they arrive.',
      code: `<Quote loading>{''}</Quote>`,
      render: () => (
        <Grid max={2}>
          <Quote loading>{''}</Quote>
          <Quote loading size="s">{''}</Quote>
        </Grid>
      ),
    },
  ],
} satisfies StoryFile;

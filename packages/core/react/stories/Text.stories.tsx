import { Text } from '../fundamentals/Text';
import { Heading } from '../fundamentals/Heading';
import { ContextMatrix } from '../compounds/ContextMatrix';
import type { StoryFile } from './story';

export default {
  component: 'Text',
  tier: 'fundamental',
  summary: 'Body and supporting text in one of the composite text styles.',
  stories: [
    {
      title: 'Variants',
      description: 'Body for reading, small body for secondary detail, caption for metadata.',
      code: `<Text>Every value in this library is a token.</Text>
<Text variant="body-sm">Tokens build into CSS custom properties.</Text>
<Text variant="caption">Updated with the token build.</Text>`,
      render: () => (
        <>
          <Text>Every value in this library is a token.</Text>
          <Text variant="body-sm">Tokens build into CSS custom properties.</Text>
          <Text variant="caption">Updated with the token build.</Text>
        </>
      ),
    },
    {
      title: 'Tones',
      description: 'Muted for secondary text; status tones always say the status in words too.',
      code: `<Text tone="muted">Three components use this token.</Text>
<Text tone="success">Contrast meets 4.5:1.</Text>
<Text tone="danger">Contrast is below 4.5:1.</Text>
<Text tone="warning">This token has no reader yet.</Text>
<Text tone="info">Generated from the token source.</Text>`,
      render: () => (
        <>
          <Text tone="muted">Three components use this token.</Text>
          <Text tone="success">Contrast meets 4.5:1.</Text>
          <Text tone="danger">Contrast is below 4.5:1.</Text>
          <Text tone="warning">This token has no reader yet.</Text>
          <Text tone="info">Generated from the token source.</Text>
        </>
      ),
    },
    {
      title: 'Lead and statement',
      description:
        'Two needs, two styles (ID9). Lead is body-scale prose a step up (20 px, the text face) for a paragraph that opens or sums up what follows. Statement is one display-scale sentence that isn’t a heading (48 px, between heading 1 and display), for a mission or facts read as a sentence; at most one per view, and the page still has its own heading.',
      code: `<Text variant="lead">Three days of talks and workshops by the water, for people who make things.</Text>
<Text variant="statement">Twelve years, forty cities and one question: how do we make things better?</Text>`,
      render: () => (
        <>
          <Text variant="lead">Three days of talks and workshops by the water, for people who make things.</Text>
          <Text variant="statement">Twelve years, forty cities and one question: how do we make things better?</Text>
        </>
      ),
    },
    {
      title: 'Accent words',
      description:
        'tone="accent" colours words that aren’t links in the brand colour (IP22). A phrase inside a heading or a statement is a span with variant="inherit", so it keeps the size around it. Large text (heading 2 and larger, a statement) reads the accent display role at 3:1; body text and smaller headings read the accent text role at 4.5:1. The words still say what matters: colour is never the only carrier. Shown in light, dark and more contrast.',
      code: `<Heading level={2}>Make <Text as="span" variant="inherit" tone="accent">better things</Text>, together</Heading>
<Heading level={3} tone="accent">Coming up next</Heading>
<Text>Tickets for <Text as="span" variant="inherit" tone="accent">the spring meetup</Text> open on Monday.</Text>`,
      render: () => (
        <ContextMatrix
          label="Accent words by context"
          rowHeader="Where"
          columns={[
            { id: 'light', label: 'Light', scheme: 'light', contrast: 'standard' },
            { id: 'dark', label: 'Dark', scheme: 'dark', contrast: 'standard' },
            { id: 'more', label: 'Light, more contrast', scheme: 'light', contrast: 'more' },
          ]}
          rows={[
            {
              id: 'display',
              label: 'A phrase in a large heading (accent display, 3:1)',
              cells: Object.fromEntries(
                ['light', 'dark', 'more'].map((c) => [
                  c,
                  <Heading level={2}>
                    Make{' '}
                    <Text as="span" variant="inherit" tone="accent">
                      better things
                    </Text>
                    , together
                  </Heading>,
                ]),
              ),
            },
            {
              id: 'heading',
              label: 'A small heading (accent text, 4.5:1)',
              cells: Object.fromEntries(['light', 'dark', 'more'].map((c) => [c, <Heading level={3} tone="accent">Coming up next</Heading>])),
            },
            {
              id: 'body',
              label: 'A phrase in body text (accent text, 4.5:1)',
              cells: Object.fromEntries(
                ['light', 'dark', 'more'].map((c) => [
                  c,
                  <Text>
                    Tickets for{' '}
                    <Text as="span" variant="inherit" tone="accent">
                      the spring meetup
                    </Text>{' '}
                    open on Monday.
                  </Text>,
                ]),
              ),
            },
          ]}
        />
      ),
    },
  ],
} satisfies StoryFile;

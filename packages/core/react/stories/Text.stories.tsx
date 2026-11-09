import { Text } from '../fundamentals/Text';
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
  ],
} satisfies StoryFile;

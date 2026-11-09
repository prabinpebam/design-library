import { useEffect, useState } from 'react';
import { ChatMessage } from '../compounds/ChatMessage';
import { ImageGeneration, type ImageGenerationProps } from '../compounds/ImageGeneration';
import { Button } from '../fundamentals/Button';
import { Grid } from '../fundamentals/Grid';
import { Text } from '../fundamentals/Text';
import { scenes } from './scenes';
import type { StoryFile } from './story';

const steps = ['Creating image', 'Adding the hills', 'Adding the light'];

/** Generates for about six seconds through three steps (with a share for reveal), then shows the picture; Run again restarts. */
function Live({ variant = 'stipple', inReply = false }: { variant?: ImageGenerationProps['variant']; inReply?: boolean }) {
  const [run, setRun] = useState(0);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    setTick(0);
    const timer = window.setInterval(() => setTick((t) => (t >= 12 ? t : t + 1)), 500);
    return () => window.clearInterval(timer);
  }, [run]);
  const done = tick >= 12;
  const image = (
    <ImageGeneration
      state={done ? 'done' : 'generating'}
      variant={variant}
      ratio="photo"
      label={steps[Math.min(2, Math.floor(tick / 4))]}
      value={variant === 'reveal' ? (tick / 12) * 100 : undefined}
      preview={scenes[0].src}
      src={scenes[0].src}
      alt={scenes[0].alt}
    />
  );
  return (
    <>
      {inReply ? (
        <ChatMessage from="assistant" author="Assistant">
          <Text as="p">{done ? 'Here are the morning hills, with the sun just up.' : 'Creating the morning hills for you.'}</Text>
          {image}
        </ChatMessage>
      ) : (
        image
      )}
      <Button label="Run again" icon="retry" onClick={() => setRun((r) => r + 1)} />
    </>
  );
}

export default {
  component: 'ImageGeneration',
  tier: 'compound',
  summary: 'The wait while an image is generated, in the finished picture’s own frame, then the picture in its place.',
  stories: [
    {
      title: 'Generating, then the picture',
      description: 'The owner’s watai state: grey dots on a quiet field, drifting like slow smoke (two layers of Perlin noise over evenly spread dots), with one pill saying what’s happening. The frame has the picture’s shape from the start, so when it’s ready the picture fades in where the wait was and nothing moves. The start and “Image created” are announced (steps aren’t, so it stays quiet); reduced motion holds the field still.',
      code: `<ImageGeneration state={ready ? 'done' : 'generating'} ratio="photo" label="Adding the hills"
  src={url} alt="Rolling green hills under a pale blue sky" />`,
      render: () => <Live />,
    },
    {
      title: 'Four ways to wait',
      description: 'Stipple (default, watai); aurora, the AI colours panning under a soft light, for a model at work; reveal, the model’s partial picture sharpening as the share rises; shimmer, a quiet light passing a few times then still, for a short wait such as downloading a finished picture.',
      code: `<ImageGeneration state="generating" variant="stipple" />
<ImageGeneration state="generating" variant="aurora" />
<ImageGeneration state="generating" variant="reveal" preview={partial} value={40} />
<ImageGeneration state="generating" variant="shimmer" label="Downloading image" />`,
      render: () => (
        <Grid max={2}>
          <ImageGeneration state="generating" variant="stipple" />
          <ImageGeneration state="generating" variant="aurora" />
          <ImageGeneration state="generating" variant="reveal" preview={scenes[3].src} value={40} label="Adding detail" />
          <ImageGeneration state="generating" variant="shimmer" label="Downloading image" />
        </Grid>
      ),
    },
    {
      title: 'Reveal, live',
      description: 'The partial picture starts blurred and sharpens with each step the model reports; the share is shown in words and as a bar, and only from a real total.',
      code: `<ImageGeneration state="generating" variant="reveal" preview={partialUrl} value={share} label="Adding the light" />`,
      render: () => <Live variant="reveal" />,
    },
    {
      title: 'Inside a reply',
      description: 'Placed in an assistant’s message like any other block; several pictures sit in a Grid.',
      code: `<ChatMessage from="assistant" author="Assistant">
  <Text as="p">Creating the morning hills for you.</Text>
  <ImageGeneration state="generating" ratio="photo" />
</ChatMessage>`,
      render: () => <Live inReply />,
    },
    {
      title: 'Couldn’t create it',
      description: 'The failure stays in the picture’s frame, still, with what happened and Try again; it’s announced at once.',
      code: `<ImageGeneration state="failed" error="Couldn’t create this image. Try a different description." onRetry={retry} />`,
      render: () => <ImageGeneration state="failed" ratio="wide" error="Couldn’t create this image. Try a different description." onRetry={() => undefined} />,
    },
  ],
} satisfies StoryFile;

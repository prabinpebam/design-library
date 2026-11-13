import { useState } from 'react';
import { ImageGrid } from '../compounds/ImageGrid';
import { Lightbox } from '../compounds/Lightbox';
import { Button } from '../fundamentals/Button';
import { MediaPlayer } from '../compounds/MediaPlayer';
import driftWebm from './media/drift.webm?url';
import driftMp4 from './media/drift.mp4?url';
import driftPoster from './media/drift-poster.jpg?url';
import { scenes } from './scenes';
import type { StoryFile } from './story';

const photos = scenes.map((s, i) => ({ id: `l${i}`, src: s.src, alt: s.alt, caption: s.caption, width: 640, height: 360 }));

function FromGrid() {
  const [at, setAt] = useState<number | null>(null);
  return (
    <>
      <ImageGrid label="Photos from the trip" items={photos} onSelect={setAt} />
      <Lightbox label="Photos from the trip" items={photos} index={at} onIndexChange={setAt} onClose={() => setAt(null)} />
    </>
  );
}

function FromButton() {
  const [at, setAt] = useState<number | null>(null);
  return (
    <>
      <Button label="View all 7 photos" icon="image" onClick={() => setAt(0)} />
      <Lightbox label="Photos from the trip" items={photos} index={at} onIndexChange={setAt} onClose={() => setAt(null)} />
    </>
  );
}

function RightToLeft() {
  const [at, setAt] = useState<number | null>(null);
  return (
    <div dir="rtl">
      <Button label="View the photos" icon="image" onClick={() => setAt(0)} />
      <Lightbox label="Photos from the trip" items={photos.slice(0, 3)} index={at} onIndexChange={setAt} onClose={() => setAt(null)} />
    </div>
  );
}

const withFilm = [{ id: 'film', src: driftPoster, alt: 'Colour drift', caption: 'Twelve seconds of colour, as a video.', width: 640, height: 360 }, ...photos.slice(0, 2)];

function WithVideo() {
  const [at, setAt] = useState<number | null>(null);
  return (
    <>
      <Button label="View the video and photos" icon="image" onClick={() => setAt(0)} />
      <Lightbox
        label="Video and photos"
        items={withFilm}
        index={at}
        onIndexChange={setAt}
        onClose={() => setAt(null)}
        renderItem={(item) => item.id === 'film' ? <MediaPlayer source={{ from: 'file', files: [{ src: driftWebm, type: 'video/webm' }, { src: driftMp4, type: 'video/mp4' }] }} title={item.alt} poster={item.src} /> : null}
      />
    </>
  );
}

export default {
  component: 'Lightbox',
  tier: 'compound',
  summary: 'The pictures of a set, one at a time and as large as the window allows, with Previous, Next, a counter and the caption.',
  stories: [
    {
      title: 'Opened from a grid',
      description: 'Press a picture: it opens at that picture. Use Previous and Next, the arrow keys, Home and End, or swipe on a touch screen. Escape or Close returns you to the picture you opened.',
      code: `const [at, setAt] = useState<number | null>(null);
<ImageGrid label="Photos from the trip" items={photos} onSelect={setAt} />
<Lightbox label="Photos from the trip" items={photos} index={at} onIndexChange={setAt} onClose={() => setAt(null)} />`,
      render: () => <FromGrid />,
    },
    {
      title: 'Opened from a button',
      description: 'From the first picture. At the first and the last, Previous or Next is left out, so the keyboard never stops on a button that does nothing.',
      code: `<Button label="View all 7 photos" icon="image" onClick={() => setAt(0)} />
<Lightbox … index={at} … />`,
      render: () => <FromButton />,
    },
    {
      title: 'Right to left',
      description: 'Next sits on the left and points left; the arrow keys follow.',
      code: `<div dir="rtl"><Lightbox … /></div>`,
      render: () => <RightToLeft />,
    },
    {
      title: 'A video among the pictures',
      description: 'LR114 renderItem: the stage draws your content for an item (here a video’s player) and the picture for the rest; return nothing to keep the picture. The count, arrows, keys and caption stay the lightbox’s.',
      code: `<Lightbox … renderItem={(item) => item.id === 'film' ? <MediaPlayer source={…} title={item.alt} poster={item.src} /> : null} />`,
      render: () => <WithVideo />,
    },
  ],
} satisfies StoryFile;

import { useState } from 'react';
import { ImageGrid } from '../compounds/ImageGrid';
import { Text } from '../fundamentals/Text';
import { scenes } from './scenes';
import type { StoryFile } from './story';

const shapes: [number, number][] = [[640, 360], [480, 640], [640, 480], [600, 600], [640, 360], [400, 600], [640, 427]];
const photos = scenes.map((s, i) => ({ id: `p${i}`, src: s.src, alt: s.alt, width: shapes[i][0], height: shapes[i][1] }));

function Opening() {
  const [opened, setOpened] = useState<number | null>(null);
  return (
    <>
      <ImageGrid label="Photos from the trip" items={photos.slice(0, 6)} onSelect={setOpened} />
      <Text variant="body-sm" tone="muted">{opened === null ? 'Press a picture.' : `Would open picture ${opened + 1} of 6 in a Lightbox.`}</Text>
    </>
  );
}

export default {
  component: 'ImageGrid',
  tier: 'compound',
  summary: 'A set of pictures arranged as one: equal frames, a quilt with features, masonry columns or justified rows.',
  stories: [
    {
      title: 'Standard',
      description: 'Equal frames in as many columns as fit; fewer as the window narrows.',
      code: `<ImageGrid label="Photos from the trip" items={photos} />`,
      render: () => <ImageGrid label="Photos from the trip" items={photos} />,
    },
    {
      title: 'Quilted',
      description: 'Square cells, with a feature across two columns and two rows. Gaps fill from later pictures.',
      code: `<ImageGrid layout="quilted" label="…" items={[{ …, span: 'large' }, { …, span: 'wide' }, …]} />`,
      render: () => (
        <ImageGrid
          layout="quilted"
          label="Photos from the trip"
          items={photos.map((p, i) => ({ ...p, span: i === 0 ? ('large' as const) : i === 3 ? ('wide' as const) : i === 5 ? ('tall' as const) : undefined }))}
        />
      ),
    },
    {
      title: 'Masonry',
      description: 'Columns of whole pictures, each its own height. It reads down each column, so use it where order doesn’t matter.',
      code: `<ImageGrid layout="masonry" label="…" items={photos} />`,
      render: () => <ImageGrid layout="masonry" label="Photos from the trip" items={photos} />,
    },
    {
      title: 'Justified',
      description: 'Rows of whole pictures at one height that fill the width; nothing is cropped. The last row keeps its natural size.',
      code: `<ImageGrid layout="justified" label="…" items={photos} />`,
      render: () => <ImageGrid layout="justified" label="Photos from the trip" items={photos} />,
    },
    {
      title: 'Pictures that open',
      description: 'With onSelect, each picture is a button named “Open:” and what it shows. Tab through them; the ring sits round the picture.',
      code: `<ImageGrid label="…" items={photos} onSelect={(i) => setOpen(i)} />`,
      render: () => <Opening />,
    },
    {
      title: 'Captions',
      description: 'An item’s caption and credit sit under its picture in standard and masonry grids. Quilted and justified tiles fill their cells by shape and leave captions out.',
      code: `<ImageGrid label="…" items={photos.map((p) => ({ ...p, caption: '…', credit: 'Photo: …' }))} />`,
      render: () => <ImageGrid label="Captioned photos from the trip" items={scenes.slice(0, 3).map((s, i) => ({ ...photos[i], caption: s.caption, credit: 'Photo: A. Rivera' }))} />,
    },
    {
      title: 'Framed pictures',
      description:
        'In standard and masonry grids an item takes under and decoration as Image does: framing art behind and over each picture (a template’s frames, which a media block draws with its frame switch). room keeps space around each picture for its art, so the art stays in the item’s box and never touches a neighbour; the picture and its art blend as one group. Quilted and justified tiles leave it out. Screen readers skip it and the pointer passes through it.',
      code: `<ImageGrid framed label="…" items={photos.map((p) => ({ ...p, room: '6%', under: <svg viewBox="0 0 100 100">…</svg>, decoration: <svg viewBox="0 0 100 100">…</svg> }))} />`,
      render: () => (
        <ImageGrid
          framed
          label="Framed photos from the trip"
          items={photos.slice(0, 3).map((p) => ({
            ...p,
            room: '6%',
            under: (
              <svg viewBox="0 0 100 100">
                <circle cx="-2" cy="-2" r="16" fill="currentColor" />
              </svg>
            ),
            decoration: (
              <svg viewBox="0 0 100 100">
                <rect x="90" y="92" width="14" height="10" fill="currentColor" />
              </svg>
            ),
          }))}
        />
      ),
    },
  ],
} satisfies StoryFile;

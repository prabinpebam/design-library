import { useState } from 'react';
import { ImageGrid } from '../compounds/ImageGrid';
import { Text } from '../fundamentals/Text';
import { scenes } from './scenes';
import type { StoryFile } from './story';
import { WithSettings } from './WithSettings';

const fourColumns = { '--c-image-grid-cell': 'max(8rem, calc((100% - 3 * var(--c-image-grid-gap)) / 4 - 1px))' };

const shapes: [number, number][] = [[640, 360], [480, 640], [640, 480], [600, 600], [640, 360], [400, 600], [640, 427]];
const photos = scenes.map((s, i) => ({ id: `p${i}`, src: s.src, alt: s.alt, width: shapes[i][0], height: shapes[i][1] }));

const marked = photos.slice(0, 4).map((p, i) => ({
  ...p,
  ...(i === 0 ? { badges: [{ label: 'Cover' }] } : {}),
  ...(i === 2 ? { badges: [{ label: 'Needs a description', tone: 'warning' as const }] } : {}),
  ...(i === 3 ? { kind: 'video' as const, duration: 95 } : {}),
}));

function Choosing({ initial, opens }: { initial: string[]; opens?: boolean }) {
  const [ids, setIds] = useState(initial);
  const [last, setLast] = useState('');
  return (
    <>
      <ImageGrid
        label="The album’s pictures"
        items={marked}
        selectable
        selected={ids}
        onSelectionChange={(next, how) => {
          setIds(next);
          setLast(how.range ? 'a run' : how.toggle ? 'one in or out' : 'one alone');
        }}
        onSelect={opens ? (i) => setLast(`opened picture ${i + 1}`) : undefined}
      />
      <Text variant="body-sm" tone="muted">{`${ids.length} chosen${last ? `, last: ${last}` : ''}.`}</Text>
    </>
  );
}

function Opening() {
  const [opened, setOpened] = useState<number | null>(null);
  return (
    <>
      <ImageGrid label="Photos from the trip" items={photos.slice(0, 6)} onSelect={setOpened} />
      <Text variant="body-sm" tone="muted">{opened === null ? 'Press a picture.' : `Would open picture ${opened + 1} of 6 in a Lightbox.`}</Text>
    </>
  );
}

function Dragging() {
  const [ids, setIds] = useState(['p1', 'p2']);
  const [dropped, setDropped] = useState('');
  return (
    <>
      <ImageGrid
        label="The album’s pictures"
        items={marked}
        selectable
        selected={ids}
        onSelectionChange={setIds}
        onItemsDragStart={(dragged, event) => event.dataTransfer.setData('application/x-album-items', dragged.join(' '))}
      />
      <div
        onDragOver={(event) => event.dataTransfer.types.includes('application/x-album-items') && event.preventDefault()}
        onDrop={(event) => setDropped(event.dataTransfer.getData('application/x-album-items'))}
      >
        <Text variant="body-sm" tone="muted">{dropped ? `Dropped here: ${dropped}.` : 'Drag a picture onto this line: a chosen one brings every chosen one with it.'}</Text>
      </div>
    </>
  );
}

/** LR55: the chosen pictures (or the one under the pointer) go before another, or at the end. */
function Ordering() {
  const [items, setItems] = useState(photos.slice(0, 6));
  const [ids, setIds] = useState<string[]>([]);
  const moveBefore = (moving: string[], before: string | null) =>
    setItems((now) => {
      const picked = now.filter((p) => moving.includes(p.id));
      const rest = now.filter((p) => !moving.includes(p.id));
      const at = before === null ? rest.length : rest.findIndex((p) => p.id === before);
      return [...rest.slice(0, at), ...picked, ...rest.slice(at)];
    });
  return <ImageGrid label="The album’s pictures, in order" items={items} selectable selected={ids} onSelectionChange={setIds} reorderable onReorder={moveBefore} />;
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
    {
      title: 'Quilted in four columns from the theme',
      description: 'A quilted grid fits as many 8rem cells as it can by default. A template whose pattern needs a fixed count sets --c-image-grid-cell (a theme setting) to a share of the width with a floor: here four columns, one large feature, never under 8rem.',
      code: `applySettings({ '--c-image-grid-cell': 'max(8rem, calc((100% - 3 * var(--c-image-grid-gap)) / 4 - 1px))' });

<ImageGrid layout="quilted" label="…" items={[{ …, span: 'large' }, …]} />`,
      render: () => (
        <WithSettings settings={fourColumns}>
          <ImageGrid layout="quilted" label="Photos from the trip" items={photos.slice(0, 6).map((p, i) => ({ ...p, span: i === 0 ? ('large' as const) : undefined }))} />
        </WithSettings>
      ),
    },
    {
      title: 'Badges and videos',
      description:
        'An item’s badges sit at its top end corner: a word or two the set’s owner should see at a glance, read after its description. A video’s poster (kind video) carries MediaPlayer’s marks: a play mark in the middle and its length at the bottom end, and its name ends “video” and the spoken length.',
      code: `<ImageGrid label="…" items={[{ …, badges: [{ label: 'Cover' }] }, { …, badges: [{ label: 'Needs a description', tone: 'warning' }] }, { …, kind: 'video', duration: 95 }]} />`,
      render: () => <ImageGrid label="The album’s pictures" items={marked} />,
    },
    {
      title: 'Choosing pictures: none chosen',
      description:
        'With selectable each picture has a check box at its top start corner, named “Select:” and the picture’s name. It shows while the picture is pointed at or focused (always on touch screens). A press chooses the picture alone; Ctrl or Cmd adds it or takes it out; Shift chooses the run from the last one chosen.',
      code: `<ImageGrid selectable selected={ids} onSelectionChange={(next, { range, toggle }) => setIds(next)} label="…" items={photos} />`,
      render: () => <Choosing initial={[]} />,
    },
    {
      title: 'Choosing pictures: one chosen',
      description: 'The chosen picture has the selection outline inside its edge and a checked box; once any is chosen every check box shows.',
      code: `<ImageGrid selectable selected={['p1']} onSelectionChange={…} label="…" items={photos} />`,
      render: () => <Choosing initial={['p1']} />,
    },
    {
      title: 'Choosing pictures: several chosen, pictures that open',
      description: 'With onSelect too, a plain press opens the picture and choosing is the check box’s (or Ctrl, Cmd and Shift). The open action and the choice never get in each other’s way.',
      code: `<ImageGrid selectable selected={ids} onSelectionChange={…} onSelect={(i) => open(i)} label="…" items={photos} />`,
      render: () => <Choosing initial={['p0', 'p2', 'p3']} opens />,
    },
    {
      title: 'Dragging pictures out',
      description:
        'With onItemsDragStart the pictures drag out of the grid (an album’s pictures into its cover). A drag that starts on a chosen picture carries every chosen one, in the grid’s order; otherwise the one under the pointer. The dragged pictures dim in place until the drag ends; the consumer puts the ids on the drag under its own type.',
      code: `<ImageGrid selectable selected={ids} onSelectionChange={setIds} onItemsDragStart={(ids, event) => event.dataTransfer.setData('application/x-album-items', ids.join(' '))} label="…" items={photos} />`,
      render: () => <Dragging />,
    },
    {
      title: 'Putting pictures in order',
      description:
        'With reorderable, pictures are put in order by dragging them within the grid: they go before the picture under the pointer (the next one past its middle), or at the end, and a line in the gap shows where. A chosen picture brings every chosen one. onReorder gets the ids and the id they go before (null: the end); the consumer moves them. Pair it with a keyboard way, such as Move earlier and Move later.',
      code: `<ImageGrid reorderable onReorder={(ids, before) => setItems(moveBefore(items, ids, before))} selectable selected={ids} onSelectionChange={setIds} label="…" items={items} />`,
      render: () => <Ordering />,
    },
    {
      title: 'Pictures still arriving',
      description:
        'An item with progress shows its upload as a bar across its foot, named “Uploading: ” and its description: a share done from a real total, or indeterminate while the server works.',
      code: `<ImageGrid label="…" items={[{ …photo, progress: 40 }, { …photo, progress: 'indeterminate' }]} />`,
      render: () => <ImageGrid label="Pictures being added" items={[{ ...photos[0], progress: 40 }, { ...photos[1], progress: 'indeterminate' }, photos[2]]} />,
    },
    {
      title: 'The whole picture',
      description: 'An item with fit="contain" keeps its whole picture inside the frame instead of cropping it, for a logo or a poster that mustn’t lose its edges.',
      code: `<ImageGrid label="…" items={[{ …photo, fit: 'contain' }, photo, photo]} />`,
      render: () => <ImageGrid label="Pictures, one kept whole" items={[{ ...photos[1], fit: 'contain' }, photos[0], photos[2]]} />,
    },
    {
      title: 'Pictures that go somewhere',
      description: 'An item’s href makes its whole tile a native link, to an album or a talk, instead of opening the picture.',
      code: `<ImageGrid label="…" items={[{ …photo, href: '/albums/hills' }, …]} />`,
      render: () => <ImageGrid label="Albums" items={photos.slice(0, 3).map((p) => ({ ...p, href: '#/imagegrid' }))} />,
    },
    {
      title: 'A fallback picture',
      description: 'When a picture fails to load, its fallbackSrc is tried once instead. The first address here is broken.',
      code: `<ImageGrid label="…" items={[{ …photo, src: '/missing.webp', fallbackSrc: photo.src }, …]} />`,
      render: () => <ImageGrid label="Pictures with a fallback" items={[{ ...photos[0], src: '/missing-picture.webp', fallbackSrc: photos[0].src }, photos[2], photos[3]]} />,
    },
    {
      title: 'A mark for where a video lives',
      description: 'A badge with an icon is a small round mark with no words on the picture; its label is its spoken name, read with the tile.',
      code: `<ImageGrid label="…" items={[{ …video, badges: [{ label: 'YouTube', icon: 'youtube' }] }, { …video, badges: [{ label: 'Vimeo', icon: 'vimeo' }] }]} />`,
      render: () => (
        <ImageGrid
          label="Talk recordings"
          items={[
            { ...photos[0], kind: 'video' as const, duration: 1820, badges: [{ label: 'YouTube', icon: 'youtube' as const }] },
            { ...photos[2], kind: 'video' as const, duration: 2410, badges: [{ label: 'Vimeo', icon: 'vimeo' as const }] },
          ]}
        />
      ),
    },
  ],
} satisfies StoryFile;

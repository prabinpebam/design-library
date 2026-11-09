import { useId, useState } from 'react';
import { flushSync } from 'react-dom';
import { viewTransition, type SharedName } from '../behaviour/motion';
import { Card } from '../compounds/Card';
import { Button } from '../fundamentals/Button';
import { Grid } from '../fundamentals/Grid';
import { Text } from '../fundamentals/Text';
import { scenes } from './scenes';
import type { StoryFile } from './story';

const walks = [
  { scene: 0, title: 'Morning over the hills', meta: '12 Mar · 6 km', about: 'A two-hour loop that starts before sunrise and comes back past the farm shop as it opens.' },
  { scene: 1, title: 'The desert in the last hour of light', meta: '3 Apr · 9 km', about: 'Out along the dry riverbed and back over the dunes while the sand turns copper.' },
  { scene: 2, title: 'The ridge at night', meta: '21 May · 4 km', about: 'A short climb to the ridge for the moonrise, with head torches for the way down.' },
];

/** A card opens to its detail: its picture and title travel to their new place while everything else cross-fades. */
function CardToDetail({ reducedMotion }: { reducedMotion?: 'swap' | 'fade' } = {}) {
  const id = useId();
  const [open, setOpen] = useState<number | null>(null);
  const parts = (key: string): SharedName[] => {
    const card = document.querySelector(`[data-demo-card="${id}-${key}"]`);
    return [
      [card?.querySelector('img'), 'dl-demo-picture'],
      [card?.querySelector('h2, h3, h4, h5, h6'), 'dl-demo-title'],
    ];
  };
  const go = (to: number | null) => {
    const from = open === null ? String(to) : 'detail';
    const next = to === null ? String(open) : 'detail';
    viewTransition(
      () => {
        flushSync(() => setOpen(to));
        // The button that was pressed is gone: focus goes to the matching one in the new view.
        document.querySelector<HTMLElement>(`[data-demo-card="${id}-${next}"] button`)?.focus();
      },
      { from: () => parts(from), to: () => parts(next), reducedMotion },
    );
  };
  if (open !== null) {
    const w = walks[open];
    return (
      <Card
        data-demo-card={`${id}-detail`}
        title={w.title}
        headingLevel={3}
        ratio="wide"
        media={<img src={scenes[w.scene].src} alt={scenes[w.scene].alt} />}
        meta={w.meta}
        actions={<Button label="Back to walks" icon="chevron-start" emphasis="quiet" onClick={() => go(null)} />}
      >
        <Text>{w.about}</Text>
      </Card>
    );
  }
  return (
    <Grid max={3}>
      {walks.map((w, i) => (
        <Card
          key={w.title}
          data-demo-card={`${id}-${i}`}
          title={w.title}
          headingLevel={3}
          media={<img src={scenes[w.scene].src} alt={scenes[w.scene].alt} />}
          meta={w.meta}
          actions={<Button label="Open" emphasis="quiet" size="s" onClick={() => go(i)} />}
        />
      ))}
    </Grid>
  );
}

export default {
  component: 'Motion',
  tier: 'fundamental',
  summary: 'Motion across components: one thing travelling from one view to the next.',
  stories: [
    {
      title: 'A card opens to its detail',
      description:
        'Press Open: the card’s picture and title travel to their place in the detail over 400 ms (duration.shared) while the rest cross-fades over 200 ms; Back reverses it. Only those two are named, and only for the change. Turn on Reduced motion in the title bar and press Open again: the detail replaces the cards in the same frame, with nothing travelling and no fade. A browser without view transitions swaps the same way.',
      code: `viewTransition(() => flushSync(() => setOpen(i)), {
  from: () => [[cardPicture, 'picture'], [cardTitle, 'title']],
  to: () => [[detailPicture, 'picture'], [detailTitle, 'title']],
})`,
      render: () => <CardToDetail />,
    },
    {
      title: 'A fade kept under reduced motion',
      description:
        'For a change that reads better with a short fade even when motion is reduced, pass reducedMotion: ‘fade’. With Reduced motion on, nothing travels and the views cross-fade over 200 ms (duration.change); with it off, this behaves like the story above.',
      code: `viewTransition(() => flushSync(() => setOpen(i)), {
  from: () => [[cardPicture, 'picture'], [cardTitle, 'title']],
  to: () => [[detailPicture, 'picture'], [detailTitle, 'title']],
  reducedMotion: 'fade',
})`,
      render: () => <CardToDetail reducedMotion="fade" />,
    },
  ],
} satisfies StoryFile;

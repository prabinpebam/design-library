import { useLayoutEffect, useRef, useState } from 'react';
import { ScrollArea } from '../fundamentals/ScrollArea';
import { ButtonGroup } from '../fundamentals/ButtonGroup';
import { Button } from '../fundamentals/Button';
import { Grid } from '../fundamentals/Grid';
import { Stack } from '../fundamentals/Stack';
import { Text } from '../fundamentals/Text';
import type { StoryFile } from './story';

const rules = [
  'Every value is a token; components read semantic roles, never primitives.',
  'Fundamentals are sealed: no class or style props, data attributes only.',
  'Compounds combine fundamentals and never restyle them.',
  'Layouts place regions; views map data to them and have no styles.',
  'Space groups first; a border only where tone can’t show the boundary.',
  'Padding sits on the content of a scroll region, never on the box.',
  'Focus rings, borders and shadows are never clipped by accident.',
  'Every z-index reads one of the layer tokens.',
  'Status colour only through the status roles, always with words.',
  'Binary settings use a Switch; a button never toggles.',
  'Notifications dismiss themselves unless reading must be forced.',
  'Segments inside a bar stay square; only its ends round.',
  'No one-sided accent borders on anything.',
  'One component per need: no second variant where one would do.',
  'Hover is an enhancement: every hover rule has a touch and keyboard twin.',
  'Text is truncated only where the full text is one step away.',
];

const Lines = ({ count }: { count: number }) => (
  <Stack gap="item">
    {rules.slice(0, count).map((r) => (
      <Text key={r}>{r}</Text>
    ))}
  </Stack>
);

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Measures the content box of both regions after layout, so the no-shift claim is shown, not asserted. */
function NoShift() {
  const holder = useRef<HTMLDivElement>(null);
  const [widths, setWidths] = useState<number[]>([]);
  useLayoutEffect(() => {
    const read = () => setWidths([...(holder.current?.querySelectorAll<HTMLElement>("[data-dl-part='content']") ?? [])].map((c) => Math.round(c.getBoundingClientRect().width * 10) / 10));
    read();
    const observer = new ResizeObserver(read);
    if (holder.current) observer.observe(holder.current);
    return () => observer.disconnect();
  }, []);
  const [a, b] = widths;
  return (
    <Stack gap="group">
      <div ref={holder} data-story-measure="">
        <Grid max={2}>
          <ScrollArea mode="always" maxSize="sm" inset="sm" surface="sunken" label="Rules, short enough to fit">
            <Lines count={2} />
          </ScrollArea>
          <ScrollArea mode="always" maxSize="sm" inset="sm" surface="sunken" label="Rules, long enough to scroll">
            <Lines count={16} />
          </ScrollArea>
        </Grid>
      </div>
      <Text variant="body-sm" tone="muted">
        {a === undefined ? 'Measuring…' : `Content width: ${a} px without overflow, ${b} px with it${a === b ? ', the same.' : '.'}`}
      </Text>
    </Stack>
  );
}

export default {
  component: 'ScrollArea',
  tier: 'fundamental',
  summary: 'A scroll region whose minimal scrollbar is drawn over the content, so overflowing never moves or narrows anything.',
  stories: [
    {
      title: 'Shown on scroll or hover',
      description: 'The default (auto). Hidden at rest; it appears while scrolling, while the pointer is over the region and while the thumb is dragged, then fades. For navigation, panes and lists.',
      code: `<ScrollArea maxSize="sm" inset="sm" surface="sunken" label="Library rules">…</ScrollArea>`,
      render: () => (
        <ScrollArea maxSize="sm" inset="sm" surface="sunken" label="Library rules">
          <Lines count={16} />
        </ScrollArea>
      ),
    },
    {
      title: 'Always shown',
      description: 'Visible whenever the content overflows, so the length and position can be read at a glance. For the main reading region and long documents.',
      code: `<ScrollArea mode="always" maxSize="sm" inset="sm" surface="sunken" label="Library rules">…</ScrollArea>`,
      render: () => (
        <ScrollArea mode="always" maxSize="sm" inset="sm" surface="sunken" label="Library rules">
          <Lines count={16} />
        </ScrollArea>
      ),
    },
    {
      title: 'Overflowing or not, nothing moves',
      description: 'The bar is an overlay, not a column: the same content box with two lines and with sixteen. The width under them is measured live.',
      code: `<ScrollArea mode="always" maxSize="sm" inset="sm" surface="sunken">{twoLines}</ScrollArea>
<ScrollArea mode="always" maxSize="sm" inset="sm" surface="sunken">{sixteenLines}</ScrollArea>`,
      render: () => <NoShift />,
    },
    {
      title: 'Across, and both ways',
      description: 'axis="inline" scrolls sideways (wide tables, code); axis="both" draws a bar on each edge, each stopping short of the other’s corner.',
      code: `<ScrollArea axis="inline" mode="always" inset="sm" surface="sunken">…</ScrollArea>
<ScrollArea axis="both" mode="always" maxSize="sm" inset="sm" surface="sunken">…</ScrollArea>`,
      render: () => (
        <Stack gap="group">
          <ScrollArea axis="inline" mode="always" inset="sm" surface="sunken" label="Months">
            <ButtonGroup label="Month" arrangement="attached">
              {months.map((m) => (
                <Button key={m} label={m} />
              ))}
            </ButtonGroup>
          </ScrollArea>
          <ScrollArea axis="both" mode="always" maxSize="sm" inset="sm" surface="sunken" label="Month pairs">
            <Stack gap="item">
              {months.map((m) => (
                <ButtonGroup key={m} label={m} arrangement="attached">
                  {months.map((n) => (
                    <Button key={n} size="xs" label={`${m.slice(0, 3)} to ${n.slice(0, 3)}`} />
                  ))}
                </ButtonGroup>
              ))}
            </Stack>
          </ScrollArea>
        </Stack>
      ),
    },
  ],
} satisfies StoryFile;

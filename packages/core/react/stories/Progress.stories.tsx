import { useEffect, useState } from 'react';
import { Button } from '../fundamentals/Button';
import { Cluster } from '../fundamentals/Cluster';
import { Progress } from '../fundamentals/Progress';
import { Stack } from '../fundamentals/Stack';
import { Text } from '../fundamentals/Text';
import type { StoryFile } from './story';

/** A bar that counts through a real total, then starts again. */
function Counting() {
  const total = 40;
  const [done, setDone] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setDone((d) => (d >= total ? 0 : d + 2)), 200);
    return () => clearInterval(t);
  }, []);
  const share = Math.round((done / total) * 100);
  return <Progress form="bar" value={share} label="Uploading pictures" valueText={`${done} of ${total}`} showLabel />;
}

/** Work that sometimes ends before the indicator delay: a fast run shows nothing at all. */
function Delayed() {
  const [running, setRunning] = useState<number | null>(null);
  const run = (ms: number) => {
    setRunning(ms);
    window.setTimeout(() => setRunning(null), ms);
  };
  return (
    <Stack gap="item">
      <Cluster>
        <Button label="Run for 0.2 s" onClick={() => run(200)} />
        <Button label="Run for 2 s" onClick={() => run(2000)} />
      </Cluster>
      {running !== null && <Progress form="bar" label="Checking links" showLabel delay />}
    </Stack>
  );
}

export default {
  component: 'Progress',
  tier: 'fundamental',
  summary: 'The one operation indicator: a compact arc, or a bar that fills to a real share.',
  stories: [
    {
      title: 'Inline arc',
      description: 'Beside a short line that names the work, or inside a busy control (Button, Switch, a field), where the control says it’s busy.',
      code: `<Cluster gap="pair"><Progress /><Text as="span" variant="body-sm" tone="muted">Checking the address…</Text></Cluster>`,
      render: () => (
        <Cluster gap="pair" wrap={false}>
          <Progress />
          <Text as="span" variant="body-sm" tone="muted">
            Checking the address…
          </Text>
        </Cluster>
      ),
    },
    {
      title: 'Bar with a known total',
      description: 'Fills to the share done, from a real count. `showLabel` puts the label at the start and the count and percentage at the end, above the bar; the count is also what a screen reader hears. Each step flows into the next at an even pace over 200 ms (it steps under reduced motion), so the fill never jumps.',
      code: `<Progress form="bar" value={45} label="Uploading pictures" valueText="18 of 40" showLabel />`,
      render: () => <Counting />,
    },
    {
      title: 'Bar without a total',
      description: 'A segment travels while the total isn’t known; with reduced motion it holds still at the start. Never a made-up percentage: the label shows alone.',
      code: `<Progress form="bar" label="Preparing the export" showLabel />`,
      render: () => <Progress form="bar" label="Preparing the export" showLabel />,
    },
    {
      title: 'Delayed appearance',
      description: 'With `delay`, nothing shows for the first 300 ms, so work that ends sooner never flashes an indicator. Once it shows, keep it at least 500 ms before taking it away.',
      code: `{running && <Progress form="bar" label="Checking links" showLabel delay />}`,
      render: () => <Delayed />,
    },
  ],
} satisfies StoryFile;

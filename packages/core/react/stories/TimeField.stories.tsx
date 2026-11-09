import { useState } from 'react';
import { TimeField } from '../fundamentals/TimeField';
import { Text } from '../fundamentals/Text';
import type { StoryFile } from './story';

function Meeting() {
  const [time, setTime] = useState<string | null>('09:30');
  return (
    <>
      <TimeField label="Start time" value={time} onChange={setTime} hint="Arrows move by 15 minutes." step={15} />
      <Text variant="body-sm" tone="muted">
        Stored as {time ?? 'nothing yet'}
      </Text>
    </>
  );
}

function Clocks() {
  const [a, setA] = useState<string | null>('14:05');
  const [b, setB] = useState<string | null>('14:05');
  return (
    <>
      <TimeField label="Pickup, 12-hour clock" value={a} onChange={setA} hourCycle={12} />
      <TimeField label="Pickup, 24-hour clock" value={b} onChange={setB} hourCycle={24} />
    </>
  );
}

function Empty() {
  const [t, setT] = useState<string | null>(null);
  return <TimeField label="Reminder" value={t} onChange={setT} optional seconds error={t === '00:00:00' ? 'Choose a time after midnight.' : undefined} />;
}

export default {
  component: 'TimeField',
  tier: 'fundamental',
  summary: 'A typed time in parts: hours, minutes (and seconds) and AM/PM, each typed or stepped with the arrow keys.',
  stories: [
    {
      title: 'Typed or stepped',
      description:
        'Click a part or Tab to it, then type: two digits (or one that can’t start two) move on by themselves. Up and Down step, here by 15 minutes; Backspace clears. The value is the 24-hour `HH:MM`, whatever the clock shown.',
      code: `<TimeField label="Start time" value={time} onChange={setTime} step={15} />`,
      render: () => <Meeting />,
    },
    {
      title: '12- and 24-hour clocks',
      description: 'The locale chooses the clock; `hourCycle` overrides it. On a 12-hour clock A and P (or Up and Down on the last part) choose AM or PM, in the locale’s words.',
      code: `<TimeField label="Pickup" value="14:05" onChange={set} hourCycle={12} />`,
      render: () => <Clocks />,
    },
    {
      title: 'Empty, with seconds',
      description: 'Empty parts show dashes and are read as “Empty”; the value is set only once every part is filled, and clearing them all sets it back to nothing.',
      code: `<TimeField label="Reminder" value={null} onChange={set} optional seconds />`,
      render: () => <Empty />,
    },
  ],
} satisfies StoryFile;

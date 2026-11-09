import { useState } from 'react';
import { DateField } from '../fundamentals/DateField';
import { Text } from '../fundamentals/Text';
import type { StoryFile } from './story';

function Birth() {
  const [date, setDate] = useState<string | null>(null);
  return (
    <>
      <DateField label="Date of birth" value={date} onChange={setDate} />
      <Text variant="body-sm" tone="muted">
        Stored as {date ?? 'nothing yet'}
      </Text>
    </>
  );
}

function Segmented() {
  const [date, setDate] = useState<string | null>('2026-11-08');
  return (
    <>
      <DateField label="Invoice date" layout="segmented" value={date} onChange={setDate} />
      <Text variant="body-sm" tone="muted">
        Stored as {date ?? 'nothing yet'}
      </Text>
    </>
  );
}

function Locales() {
  const [date, setDate] = useState<string | null>('2026-03-27');
  return (
    <>
      <DateField label="Start date, United States" layout="segmented" locale="en-US" value={date} onChange={setDate} />
      <DateField label="Start date, Japan" layout="segmented" locale="ja-JP" value={date} onChange={setDate} />
      <DateField label="Passport issue date, Germany" locale="de-DE" value={date} onChange={setDate} />
    </>
  );
}

export default {
  component: 'DateField',
  tier: 'fundamental',
  summary: 'A date typed in its parts, day, month and year, in the locale’s order: three labelled boxes, or one field of parts.',
  stories: [
    {
      title: 'Separate, for dates people know',
      description:
        'Three boxes in a fieldset (GOV.UK): the month also takes its name ("mar", "March"). It is checked when focus leaves the date, never while typing, and the problem says which part is missing or wrong. Try 31 February, or leave the year out.',
      code: `<DateField label="Date of birth" value={date} onChange={setDate} />`,
      render: () => <Birth />,
    },
    {
      title: 'Segmented',
      description: 'One field of parts, the typed path of DatePicker: digits move on by themselves, Up and Down step and wrap, Backspace clears. The value is set once the parts make a real date.',
      code: `<DateField label="Invoice date" layout="segmented" value={date} onChange={setDate} />`,
      render: () => <Segmented />,
    },
    {
      title: 'In the locale’s order',
      description: 'The parts follow the locale: month first in the United States, year first in Japan, day first in Germany. The value is always `YYYY-MM-DD`.',
      code: `<DateField label="Start date" layout="segmented" locale="ja-JP" value={date} onChange={setDate} />`,
      render: () => <Locales />,
    },
  ],
} satisfies StoryFile;

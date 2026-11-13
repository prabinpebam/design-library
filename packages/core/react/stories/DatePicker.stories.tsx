import { useState } from 'react';
import { DatePicker, type DatePickerProps } from '../fundamentals/DatePicker';
import type { StoryFile } from './story';

function Pick({ initial = null, ...rest }: Omit<DatePickerProps, 'value' | 'onChange'> & { initial?: string | null }) {
  const [value, setValue] = useState<string | null>(initial);
  return <DatePicker {...rest} value={value} onChange={setValue} />;
}

const weekend = (iso: string) => [0, 6].includes(new Date(`${iso}T00:00`).getDay());

export default {
  component: 'DatePicker',
  tier: 'fundamental',
  summary: 'One date, typed in the locale’s order or chosen from the Calendar in a popover.',
  stories: [
    {
      title: 'Type it or choose it',
      description: 'Type the date in the order shown, or press the button (or Alt+Down) for the Calendar, which zooms out to months, years and decades. A date it can’t read keeps your text and says how to type it.',
      code: `<DatePicker label="Delivery date" value={day} onChange={setDay} />`,
      render: () => (
        <>
          <Pick label="Delivery date" initial="2026-11-18" />
          <Pick label="Start date" hint="The first day the plan applies." optional />
        </>
      ),
    },
    {
      title: 'Limits and unavailable days',
      description: 'Only weekdays from 5 November to 20 December; a typed date outside them is refused with the range to choose from.',
      code: `<DatePicker label="Meeting day" min="2026-11-05" max="2026-12-20" isUnavailable={isWeekend} value={day} onChange={setDay} />`,
      render: () => <Pick label="Meeting day" min="2026-11-05" max="2026-12-20" isUnavailable={weekend} weekNumbers />,
    },
    {
      title: 'By locale, invalid and unavailable',
      description: 'German order and names; an error from the form; a field that can’t change.',
      code: `<DatePicker label="Datum" locale="de-DE" … />`,
      render: () => (
        <>
          <Pick label="Datum" locale="de-DE" initial="2026-11-18" />
          <Pick label="Return date" initial="2026-11-02" error="Choose a return date after the departure." />
          <Pick label="Contract start" initial="2026-01-01" disabled />
        </>
      ),
    },
    {
      title: 'Stored order',
      description: 'format="iso" shows and asks for the day as it’s stored, yyyy-mm-dd, whatever the locale, beside other data kept in that form.',
      code: `<DatePicker label="Published on" format="iso" value={day} onChange={setDay} />`,
      render: () => <Pick label="Published on" format="iso" initial="2026-11-18" />,
    },
  ],
} satisfies StoryFile;

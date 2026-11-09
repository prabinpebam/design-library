import { useState } from 'react';
import { Calendar, type CalendarProps } from '../fundamentals/Calendar';
import { Text } from '../fundamentals/Text';
import type { StoryFile } from './story';

/** One day, kept and said under the calendar. */
function One(props: Omit<CalendarProps, 'value' | 'onChange' | 'mode'> & { initial?: string }) {
  const { initial = null, ...rest } = props;
  const [value, setValue] = useState<string | null>(initial);
  return (
    <>
      <Calendar {...rest} value={value} onChange={setValue} />
      <Text variant="caption" tone="muted">{value ? `Chosen: ${value}` : 'Nothing chosen yet.'}</Text>
    </>
  );
}

/** A first and a last day. */
function Range(props: Omit<CalendarProps, 'range' | 'onRangeChange' | 'mode'> & { initial?: [string | null, string | null] }) {
  const { initial = [null, null], ...rest } = props;
  const [range, setRange] = useState<[string | null, string | null]>(initial);
  return (
    <>
      <Calendar {...rest} mode="range" range={range} onRangeChange={setRange} />
      <Text variant="caption" tone="muted">{range[0] ? `From ${range[0]}${range[1] ? ` to ${range[1]}` : ', choose the last day'}` : 'Choose the first day.'}</Text>
    </>
  );
}

const weekend = (iso: string) => [0, 6].includes(new Date(`${iso}T00:00`).getDay());

export default {
  component: 'Calendar',
  tier: 'fundamental',
  summary: 'A month of days to choose one day or a range, zooming out to months, years and decades like the Windows calendar.',
  stories: [
    {
      title: 'Zoom: days, months, years, decades',
      description: 'Press the title to zoom out: the year’s months, then the decade’s years, then the century’s decades. Choose one to zoom back in. The arrows page by the period shown; Today comes back to today. The levels zoom: the old one shrinks away as the wider one settles in from larger (the reverse going in); press the title twice quickly and the zoom carries on from where it is. Paging cross-fades; a month turned with the arrow keys or Page Down swaps at once. Reduced motion: the levels only cross-fade.',
      code: `<Calendar label="Delivery date" value={day} onChange={setDay} />`,
      render: () => <One label="Delivery date" initial="2026-11-18" />,
    },
    {
      title: 'A range across two months',
      description: 'Choose the first day, then the last: the days between show as one band, rounded only at its ends, previewed as you point. A day before the first starts again from it.',
      code: `<Calendar label="Stay" mode="range" months={2} range={[from, to]} onRangeChange={([f, t]) => { setFrom(f); setTo(t); }} />`,
      render: () => <Range label="Stay" months={2} initial={['2026-11-26', '2026-12-04']} />,
    },
    {
      title: 'Limits, unavailable days and week numbers',
      description: 'Days outside the earliest and latest are dimmed; unavailable days (here, weekends) are struck through and can’t be chosen. Week numbers are ISO weeks.',
      code: `<Calendar label="Meeting day" min="2026-11-05" max="2026-12-20" isUnavailable={isWeekend} weekNumbers value={day} onChange={setDay} />`,
      render: () => <One label="Meeting day" min="2026-11-05" max="2026-12-20" isUnavailable={weekend} weekNumbers initialMonth="2026-11" />,
    },
    {
      title: 'Week starts by locale',
      description: 'The first day of the week and every name come from the language: Sunday first in American English, Monday in German.',
      code: `<Calendar label="Datum" locale="de-DE" value={day} onChange={setDay} />`,
      render: () => (
        <>
          <One label="Date, US English" locale="en-US" initialMonth="2026-11" />
          <One label="Datum, Deutsch" locale="de-DE" initialMonth="2026-11" />
        </>
      ),
    },
  ],
} satisfies StoryFile;

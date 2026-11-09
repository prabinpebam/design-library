import { useState } from 'react';
import { DateRangePicker, type DateRangePickerProps } from '../fundamentals/DateRangePicker';
import type { StoryFile } from './story';

function Pick({ initial = [null, null], ...rest }: Omit<DateRangePickerProps, 'value' | 'onChange'> & { initial?: [string | null, string | null] }) {
  const [value, setValue] = useState<[string | null, string | null]>(initial);
  return <DateRangePicker {...rest} value={value} onChange={setValue} />;
}

export default {
  component: 'DateRangePicker',
  tier: 'fundamental',
  summary: 'A first and a last day, typed in two boxes or chosen on a two-month Calendar.',
  stories: [
    {
      title: 'Type them or choose them',
      description: 'Two boxes in one field, or the two-month Calendar: the first press sets the first day, the second the last, with the days between previewed as you point. A last day before the first is refused, never swapped.',
      code: `<DateRangePicker label="Stay" value={[from, to]} onChange={([f, t]) => { setFrom(f); setTo(t); }} />`,
      render: () => (
        <>
          <Pick label="Stay" initial={['2026-11-26', '2026-12-04']} />
          <Pick label="Report period" hint="Up to one year." min="2025-01-01" max="2026-12-31" />
        </>
      ),
    },
  ],
} satisfies StoryFile;

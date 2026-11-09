import { useState } from 'react';
import { ErrorSummary, type ErrorSummaryItem } from '../compounds/ErrorSummary';
import { Button } from '../fundamentals/Button';
import { Stack } from '../fundamentals/Stack';
import { TextField } from '../fundamentals/TextField';
import type { StoryFile } from './story';

type Values = { name: string; email: string; postcode: string };

function check(v: Values): ErrorSummaryItem[] {
  const errors: ErrorSummaryItem[] = [];
  if (!v.name.trim()) errors.push({ target: 'delivery-name', message: 'Enter your full name' });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email)) errors.push({ target: 'delivery-email', message: 'Enter an email address like name@example.com' });
  if (!/^\d{6}$/.test(v.postcode.replace(/\s/g, ''))) errors.push({ target: 'delivery-postcode', message: 'Enter a postcode of 6 digits, like 560 001' });
  return errors;
}

function DeliveryForm() {
  const [values, setValues] = useState<Values>({ name: '', email: 'mai.tran@', postcode: '' });
  const [errors, setErrors] = useState<ErrorSummaryItem[]>([]);
  const [sent, setSent] = useState(false);
  const errorFor = (target: string) => errors.find((e) => e.target === target)?.message;
  const set = (key: keyof Values) => (next: string) => setValues((v) => ({ ...v, [key]: next }));

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const found = check(values);
        setErrors(found);
        setSent(found.length === 0);
      }}
    >
      <Stack gap="group">
        <ErrorSummary errors={errors} />
        <TextField data-error-target="delivery-name" label="Full name" value={values.name} onCommit={set('name')} error={errorFor('delivery-name')} />
        <TextField data-error-target="delivery-email" label="Email" type="email" value={values.email} onCommit={set('email')} error={errorFor('delivery-email')} />
        <TextField data-error-target="delivery-postcode" label="Postcode" inputMode="numeric" value={values.postcode} onCommit={set('postcode')} error={errorFor('delivery-postcode')} />
        <Button type="submit" emphasis="primary" label={sent ? 'Details sent' : 'Continue'} />
      </Stack>
    </form>
  );
}

export default {
  component: 'ErrorSummary',
  tier: 'compound',
  summary: 'After a failed submit, “There is a problem” at the top of the form with one link per error that takes the person to its field.',
  stories: [
    {
      title: 'After a failed submit',
      description:
        'Press Continue: the summary appears at the top of the form and takes focus, each field shows the same message, and each link moves focus to its field without changing the page’s address. Fix one and press Continue again: the list shrinks.',
      code: `<ErrorSummary errors={[{ target: 'delivery-email', message: 'Enter an email address like name@example.com' }]} />
<TextField data-error-target="delivery-email" label="Email" error="Enter an email address like name@example.com" … />`,
      render: () => <DeliveryForm />,
    },
    {
      title: 'There when the page opens',
      description: 'When the server sends the form back with errors, the summary is already in place: `focusOnShow={false}` leaves focus where the page starts, and it is read in order.',
      code: `<ErrorSummary focusOnShow={false} errors={[{ target: 'card-number', message: 'Enter a card number of 16 digits' }, { target: 'card-expiry', message: 'Enter an expiry date in the future' }]} />`,
      render: () => (
        <ErrorSummary
          focusOnShow={false}
          errors={[
            { target: 'card-number', message: 'Enter a card number of 16 digits' },
            { target: 'card-expiry', message: 'Enter an expiry date in the future' },
          ]}
        />
      ),
    },
  ],
} satisfies StoryFile;

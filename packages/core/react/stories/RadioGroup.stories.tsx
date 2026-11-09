import { useState } from 'react';
import { Field } from '../fundamentals/Field';
import { RadioGroup, type RadioGroupProps } from '../fundamentals/RadioGroup';
import type { StoryFile } from './story';

function Live({ initial, ...rest }: Omit<RadioGroupProps, 'value' | 'onChange'> & { initial: string | null }) {
  const [value, setValue] = useState(initial);
  return <RadioGroup {...rest} value={value} onChange={setValue} />;
}

const contact = [
  { value: 'email', label: 'Email', reveals: <Field label="Email address">{(c) => <input {...c} type="email" autoComplete="email" />}</Field> },
  { value: 'phone', label: 'Phone', reveals: <Field label="Phone number">{(c) => <input {...c} type="tel" autoComplete="tel" />}</Field> },
  { value: 'post', label: 'Post' },
];

const delivery = [
  { value: 'standard', label: 'Standard', description: '3 to 5 working days', meta: 'Free' },
  { value: 'express', label: 'Express', description: 'Next working day, ordered by 4 pm', meta: '₹ 250' },
  { value: 'same-day', label: 'Same day', description: 'Not available for this address', meta: '₹ 600', disabled: true },
];

export default {
  component: 'RadioGroup',
  tier: 'fundamental',
  summary: 'Exactly one of a few visible options, chosen as part of a form: vertical or inline, with descriptions, a revealed question and tiles.',
  stories: [
    {
      title: 'Choose one',
      description: 'One row per option; the whole row is the target. Tab enters the group once; the arrow keys move and choose. Nothing is chosen for the person unless there is a safe default.',
      code: `<RadioGroup label="Where do you live?" options={[{ value: 'in', label: 'India' }, …]} value={country} onChange={setCountry} />`,
      render: () => (
        <Live
          label="Where do you live?"
          initial={null}
          options={[
            { value: 'in', label: 'India' },
            { value: 'uk', label: 'United Kingdom' },
            { value: 'us', label: 'United States' },
            { value: 'other', label: 'Somewhere else' },
          ]}
        />
      ),
    },
    {
      title: 'Inline, for two short options',
      description: 'Yes and No side by side; more or longer options stay one per row.',
      code: `<RadioGroup label="Have you used the library before?" orientation="inline" options={yesNo} … />`,
      render: () => (
        <Live
          label="Have you used the library before?"
          orientation="inline"
          initial="no"
          options={[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ]}
        />
      ),
    },
    {
      title: 'Descriptions and an unavailable option',
      description: 'A line under the label says what choosing it means. An option that can’t be chosen says why in its own description.',
      code: `<RadioGroup label="Delivery" options={[{ value: 'standard', label: 'Standard', description: '3 to 5 working days' }, …]} … />`,
      render: () => <Live label="Delivery" initial="standard" options={delivery.map(({ meta: _meta, ...o }) => o)} />,
    },
    {
      title: 'A related question under the chosen option',
      description: 'Choosing an option reveals one simple question under it; choosing another hides it. Questions only, never other content.',
      code: `<RadioGroup label="How should we contact you?" options={[{ value: 'email', label: 'Email', reveals: <Field label="Email address">…</Field> }, …]} … />`,
      render: () => <Live label="How should we contact you?" hint="We only contact you about this order." initial="email" options={contact} />,
    },
    {
      title: 'Tiles',
      description: 'For a few rich choices (a plan, a delivery speed): each option is a card, the whole card is the target, a fact such as a price sits at its end. The chosen card’s outline thickens inward, so nothing moves.',
      code: `<RadioGroup label="Delivery" appearance="tile" options={[{ value: 'express', label: 'Express', description: '…', meta: '₹ 250' }, …]} … />`,
      render: () => <Live label="Delivery speed" appearance="tile" initial="express" options={delivery} />,
    },
    {
      title: 'An error',
      description: 'Said once for the whole question, under the options: what is wrong and how to fix it. Every circle is marked until one is chosen.',
      code: `<RadioGroup label="Account type" error="Choose an account type" … />`,
      render: () => (
        <RadioGroup
          label="Account type"
          error="Choose an account type"
          value={null}
          onChange={() => undefined}
          options={[
            { value: 'personal', label: 'Personal' },
            { value: 'business', label: 'Business' },
          ]}
        />
      ),
    },
    {
      title: 'Sizes',
      description: 's (16 px circle, 36 px row) for dense filters, normal (20, 44), l (24, 48) for touch-first forms.',
      code: `<RadioGroup size="s" … />`,
      render: () => (
        <>
          {(['s', 'normal', 'l'] as const).map((size) => (
            <Live
              key={size}
              size={size}
              orientation="inline"
              label={`Sort by, ${size}`}
              initial="newest"
              options={[
                { value: 'newest', label: 'Newest' },
                { value: 'oldest', label: 'Oldest' },
                { value: 'name', label: 'Name' },
              ]}
            />
          ))}
        </>
      ),
    },
    {
      title: 'The question as the page heading',
      description: 'On a page that asks one question, the legend is the page’s heading, so the question is said once.',
      code: `<RadioGroup label="Which plan do you want?" heading … />`,
      render: () => (
        <Live
          label="Which plan do you want?"
          heading
          initial={null}
          options={[
            { value: 'free', label: 'Free', description: 'One project, community support' },
            { value: 'team', label: 'Team', description: 'Unlimited projects, shared libraries' },
          ]}
        />
      ),
    },
    {
      title: 'Unavailable',
      description: 'The whole question can’t change; the chosen option keeps its accent, muted. Prefer saying why in the hint.',
      code: `<RadioGroup label="Billing period" disabled hint="Billing changes at renewal." … />`,
      render: () => (
        <Live
          label="Billing period"
          disabled
          hint="Billing changes at renewal."
          initial="year"
          options={[
            { value: 'month', label: 'Monthly' },
            { value: 'year', label: 'Yearly' },
          ]}
        />
      ),
    },
  ],
} satisfies StoryFile;

import { Accordion } from '../compounds/Accordion';
import { useState } from 'react';
import { Switch } from '../fundamentals/Switch';
import type { StoryFile } from './story';

const faq = [
  { id: 'cancel', title: 'Can I cancel my plan at any time?', content: <p>Yes. Your plan stays active until the end of the period you’ve paid for, and you won’t be charged again.</p> },
  { id: 'data', title: 'What happens to my files when I cancel?', content: <p>You can still open and download them for 90 days. After that they’re deleted, and we email you a week before.</p> },
  { id: 'team', title: 'Can I share my plan with my team?', content: <p>Only on the Team plan. Each person gets their own sign-in, and you manage who has access from Settings.</p> },
  { id: 'refund', title: 'Do you give refunds?', content: <p>Within 14 days of paying, for any reason. Write to us from the Help page with the email you signed up with.</p> },
];

function Alerts() {
  const [on, setOn] = useState([true, true, false]);
  const set = (i: number) => (next: boolean) => setOn((now) => now.map((v, j) => (j === i ? next : v)));
  return (
    <>
      <Switch label="Email me when someone comments" checked={on[0]} onChange={set(0)} />
      <Switch label="Push notifications on this device" checked={on[1]} onChange={set(1)} />
      <Switch label="Weekly summary" checked={on[2]} onChange={set(2)} />
    </>
  );
}

export default {
  component: 'Accordion',
  tier: 'compound',
  summary: 'A stack of headed sections that open and close in place: frequently asked questions, optional parts of a long form, settings by topic.',
  stories: [
    {
      title: 'Questions and answers',
      description: 'Any number open at once; the first is open to start. Use the arrow keys to move between the questions.',
      code: `<Accordion defaultOpen={['cancel']} items={[{ id: 'cancel', title: 'Can I cancel my plan at any time?', content: <p>…</p> }, …]} />`,
      render: () => <Accordion defaultOpen={['cancel']} items={faq} />,
    },
    {
      title: 'One at a time',
      description: 'Opening a section closes the one that was open: for a short list where only one answer is wanted.',
      code: `<Accordion single items={faq} />`,
      render: () => <Accordion single items={faq} />,
    },
    {
      title: 'Show all sections',
      description: 'For a long page people scan: one button opens or closes every section, and says which it will do.',
      code: `<Accordion showAll items={sections} />`,
      render: () => <Accordion showAll items={faq} />,
    },
    {
      title: 'Skip closed sections',
      description: 'For many sections of heavy content (past years’ logo walls): closed sections far from the window aren’t styled, laid out or painted. It looks and moves the same.',
      code: `<Accordion skipClosed items={years} />`,
      render: () => <Accordion skipClosed items={faq} />,
    },
    {
      title: 'With summaries and controls inside',
      description: 'A summary line under each heading says what’s inside before it’s opened. A section that can’t be opened yet is dimmed.',
      code: `<Accordion items={[{ id: 'alerts', title: 'Notifications', summary: 'Email and push, 2 of 3 on', content: <>…</> }, …]} />`,
      render: () => (
        <Accordion
          defaultOpen={['alerts']}
          items={[
            {
              id: 'alerts',
              title: 'Notifications',
              summary: 'Email and push, 2 of 3 on',
              content: <Alerts />,
            },
            { id: 'privacy', title: 'Privacy', summary: 'Who can see your profile', content: <p>Your profile is visible to people in your organisation only.</p> },
            { id: 'billing', title: 'Billing', summary: 'Only owners can change billing', disabled: true, content: <p>Billing settings.</p> },
          ]}
        />
      ),
    },
  ],
} satisfies StoryFile;

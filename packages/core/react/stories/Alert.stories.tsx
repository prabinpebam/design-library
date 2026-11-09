import { useState } from 'react';
import { Alert } from '../compounds/Alert';
import { Button } from '../fundamentals/Button';
import { Link } from '../fundamentals/Link';
import type { StoryFile } from './story';

function ClosableBanner() {
  const [open, setOpen] = useState(true);
  return open ? (
    <Alert placement="page" tone="warning" title="Scheduled maintenance on Saturday" onClose={() => setOpen(false)} actions={<Link href="#/alert">See what’s affected</Link>}>
      Atlas will be read-only from 22:00 to 23:30 UTC. Your drafts are kept.
    </Alert>
  ) : (
    <Button label="Show the banner again" onClick={() => setOpen(true)} />
  );
}

function SaveSection() {
  const [state, setState] = useState<'idle' | 'failed' | 'saved'>('idle');
  return (
    <>
      {state === 'failed' && (
        <Alert
          placement="section"
          tone="error"
          title="Couldn’t save the address"
          announce="assertive"
          actions={
            <>
              <Button label="Retry" emphasis="primary" size="s" onClick={() => setState('saved')} />
              <Button label="Revert changes" size="s" onClick={() => setState('idle')} />
            </>
          }
        >
          The server didn’t answer in time. Your changes are still in the form.
        </Alert>
      )}
      {state === 'saved' && (
        <Alert placement="section" tone="success" title="Address saved" announce="polite" onClose={() => setState('idle')}>
          Deliveries from tomorrow go to the new address.
        </Alert>
      )}
      {state === 'idle' && <Button label="Save, failing" onClick={() => setState('failed')} />}
    </>
  );
}

export default {
  component: 'Alert',
  tier: 'compound',
  summary: 'A message that stays in the content until its cause goes: one tinted surface, the tone’s icon with its word, a title, the description and actions.',
  stories: [
    {
      title: 'Tones',
      description:
        'Information, success, warning and error each tint the surface and carry their icon with its spoken word, so colour is never alone. Neutral is a quiet note on a passage, with no icon.',
      code: `<Alert tone="warning" title="Your trial ends in 3 days">Choose a plan to keep your projects.</Alert>`,
      render: () => (
        <>
          <Alert tone="info" title="Sharing is on for this folder">
            Anyone in Northwind with the link can view it.
          </Alert>
          <Alert tone="success" title="All 24 invoices are paid" />
          <Alert tone="warning" title="Your trial ends in 3 days">
            Choose a plan to keep your projects. Nothing is deleted when it ends.
          </Alert>
          <Alert tone="error" title="Couldn’t load the latest figures" actions={<Button label="Refresh" size="s" />}>
            Showing figures from 09:40. Check your connection, then refresh.
          </Alert>
          <Alert tone="neutral">Prices include tax. Delivery is added at checkout.</Alert>
        </>
      ),
    },
    {
      title: 'Inline, beside what it concerns',
      description:
        'The default. Words and actions share a line while the words keep 16 rem; narrower, the actions move under the words. The recovery comes first.',
      code: `<Alert tone="warning" title="2 rows have no owner" actions={<Button label="Assign owners" size="s" />} />`,
      render: () => (
        <>
          <Alert tone="warning" title="2 rows have no owner" actions={<Button label="Assign owners" size="s" />} />
          <Alert tone="info" title="A newer version of this page exists" actions={<Link href="#/alert">Open the newer version</Link>}>
            Edited by Mai Tran 12 minutes ago.
          </Alert>
        </>
      ),
    },
    {
      title: 'Section, at the top of a form',
      description:
        'A section’s failure says what happened, why, what was kept and what to do, with Retry first; it is said at once when it appears after Save (`announce="assertive"`). Success after Save is said politely and can be closed.',
      code: `<Alert placement="section" tone="error" title="Couldn’t save the address" announce="assertive" actions={<><Button label="Retry" emphasis="primary" size="s" /><Button label="Revert changes" size="s" /></>}>The server didn’t answer in time. Your changes are still in the form.</Alert>`,
      render: () => <SaveSection />,
    },
    {
      title: 'Page banner',
      description:
        'A full-width message at the top of the page or app: square, edge to edge, the page margin inside. Close it when it can go; leave Close out while the cause lasts (an outage).',
      code: `<Alert placement="page" tone="warning" title="Scheduled maintenance on Saturday" onClose={hide} actions={<Link href="/status">See what’s affected</Link>}>Atlas will be read-only from 22:00 to 23:30 UTC. Your drafts are kept.</Alert>`,
      render: () => (
        <>
          <ClosableBanner />
          <Alert placement="page" tone="error" title="Payments are down" headingLevel={2}>
            Card payments are failing for everyone. We’re fixing it; orders wait in your basket.
          </Alert>
        </>
      ),
    },
    {
      title: 'Callout on a passage',
      description: 'No title, no close: a neutral note or a warning that sits with the text it qualifies, read in order and never announced.',
      code: `<Alert tone="warning">Deleting a workspace removes its files for everyone. It can’t be undone.</Alert>`,
      render: () => (
        <>
          <Alert tone="neutral">Workspaces created before March use the old storage limits until they are next renewed.</Alert>
          <Alert tone="warning">Deleting a workspace removes its files for everyone. It can’t be undone.</Alert>
        </>
      ),
    },
  ],
} satisfies StoryFile;

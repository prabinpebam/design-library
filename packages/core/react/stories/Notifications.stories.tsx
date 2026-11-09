import { notify } from '../behaviour/notify';
import { Button } from '../fundamentals/Button';
import { Cluster } from '../fundamentals/Cluster';
import type { StoryFile } from './story';

function exportReport() {
  const subject = 'export-report';
  const steps = ['Collecting 4 of 9 sections…', 'Collecting 9 of 9 sections…', 'Writing the PDF…'];
  notify({ subject, tone: 'progress', message: 'Exporting the report…' });
  steps.forEach((step, i) => window.setTimeout(() => notify({ subject, tone: 'progress', message: `Exporting the report: ${step}` }), 900 * (i + 1)));
  window.setTimeout(() => notify({ subject, tone: 'success', message: 'Report exported to Downloads.', action: { label: 'Open', onAction: () => undefined } }), 900 * (steps.length + 1));
}

export default {
  component: 'Notifications',
  tier: 'compound',
  summary: 'One pill at the bottom of the window for outcomes the person can’t see where they are.',
  stories: [
    {
      title: 'Goes by itself',
      description:
        'Information the person can do without, its action also reachable elsewhere: gone after 6 seconds (8 for two or three lines), paused while the pointer is over it, focus is in it or the window is hidden. Press twice: the same words coalesce with a count.',
      code: `notify({ tone: 'success', message: 'Report moved to Archive.', action: { label: 'Undo', onAction: undo } })`,
      arrangement: 'row',
      render: () => (
        <Cluster>
          <Button label="Archive the report" onClick={() => notify({ tone: 'success', message: 'Report moved to Archive.', action: { label: 'Undo', onAction: () => notify({ tone: 'info', message: 'Report back in Reports.' }) } })} />
          <Button label="Copy the link" onClick={() => notify({ tone: 'info', message: 'Link copied.' })} />
        </Cluster>
      ),
    },
    {
      title: 'Stays until closed',
      description:
        'An error, a warning that needs a decision or a partial success: it stays until it is closed, its action is taken or the problem goes away. Errors are said at once; the rest wait for a pause.',
      code: `notify({ tone: 'error', message: 'Couldn’t publish. The server didn’t answer.', action: { label: 'Retry', onAction: publish } })`,
      arrangement: 'row',
      render: () => (
        <Cluster>
          <Button label="Publish, failing" onClick={() => notify({ subject: 'publish', tone: 'error', message: 'Couldn’t publish. The server didn’t answer.', action: { label: 'Retry', onAction: () => notify({ subject: 'publish', tone: 'success', message: 'Published.' }) } })} />
          <Button label="Import pictures" onClick={() => notify({ tone: 'warning', message: '18 of 20 pictures imported. 2 were larger than 50 MB.', action: { label: 'Show', onAction: () => undefined } })} />
        </Cluster>
      ),
    },
    {
      title: 'Work that runs, updated in place',
      description: 'A progress pill updates in place as each step runs (its steps aren’t said), then turns into the outcome, which goes by itself. Each update cross-fades its words in the same pill while the pill’s width eases to the new words (no blink).',
      code: `notify({ subject: 'export', tone: 'progress', message: 'Exporting the report…' }); … notify({ subject: 'export', tone: 'success', message: 'Report exported to Downloads.', action: { label: 'Open', onAction: open } })`,
      arrangement: 'row',
      render: () => <Button label="Export the report" onClick={exportReport} />,
    },
    {
      title: 'Several at once',
      description: 'At most three show, newest nearest the edge; the rest wait, counted above them, errors first, and each starts its clock only when it shows. Close one in the middle: it fades out where it is and the others shift into its place; a new one pushes the others up.',
      code: `files.forEach((f) => notify({ subject: f.id, tone: f.ok ? 'success' : 'error', message: … }))`,
      arrangement: 'row',
      render: () => (
        <Button
          label="Sync five folders"
          onClick={() =>
            ['Photos', 'Invoices', 'Drafts', 'Music', 'Archive'].forEach((name, i) =>
              notify({ subject: `sync-${name}`, tone: i === 3 ? 'error' : 'success', message: i === 3 ? `Couldn’t sync ${name}: the folder is read-only.` : `${name} synced.`, action: i === 3 ? { label: 'Retry', onAction: () => notify({ subject: `sync-${name}`, tone: 'success', message: `${name} synced.` }) } : undefined }),
            )
          }
        />
      ),
    },
  ],
} satisfies StoryFile;

/**
 * The Revision pane: start, name and choose a revision, select blocks, comment, go back to commented blocks, archive
 * with a summary and reopen. Built only from the library's fundamentals (app layer, O21). One quiet status line at the
 * foot says where things are saved; a failure or conflict stays until it's resolved and always offers a way out.
 */
import { useEffect, useState, type MouseEvent } from 'react';
import { Button, Cluster, Code, Heading, Link, Pane, Progress, Select, Stack, Switch, Text, TextArea, TextField, Toolbar } from '@design-library/core/components';
import { STORAGE_PATH, type Revision } from '../../revisions/contract.js';
import { pageById } from '../data/pages';
import { describe } from './capture';
import { MAX_SELECTION, type Revisions } from './useRevisions';

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const when = (iso: string) => new Date(iso).toLocaleString();

function Status({ r }: { r: Revisions }) {
  const s = r.status;
  return (
    <>
      {(s.kind === 'loading' || s.kind === 'saving') && (
        <Text as="span" variant="body-sm" tone="muted">
          <Progress /> {s.kind === 'loading' ? 'Loading revisions…' : 'Saving…'}
        </Text>
      )}
      {(s.kind === 'ready' || s.kind === 'saved') && (
        <Text as="span" variant="body-sm" tone="muted">
          {s.kind === 'saved' ? 'Saved' : 'Saves automatically'} to <Code>{STORAGE_PATH}</Code>
        </Text>
      )}
      {s.kind === 'read-only' && (
        <Text as="span" variant="body-sm" tone="muted">
          Read only: this build has no revision server. Open the library dev server to comment.
        </Text>
      )}
      {(s.kind === 'failed' || s.kind === 'conflict') && (
        <>
          <Text as="span" variant="body-sm" tone="danger">
            {s.kind === 'conflict' ? 'Someone else changed this revision. ' : 'Not saved. '}
            {s.message}
          </Text>
          <Toolbar>
            {r.recovery && s.kind === 'failed' && <Button label="Retry" onClick={() => void r.retry().catch(() => undefined)} />}
            <Button label={r.recovery ? 'Load saved version' : 'Reload'} emphasis="quiet" onClick={() => void (r.recovery ? r.discard() : r.refresh())} />
          </Toolbar>
        </>
      )}
    </>
  );
}

/** A revision's comments, each with a link to every block it's about. Remove only while the revision is active. */
function Comments({ r, revision, editable, onError }: { r: Revisions; revision: Revision; editable: boolean; onError: (e: unknown) => void }) {
  // Links go through the pane so they can reveal and focus the exact block; Enter on a link is a click too.
  const onClick = (event: MouseEvent<HTMLOListElement>) => {
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[data-jump]');
    if (!link) return;
    event.preventDefault();
    const [comment, index] = link.dataset.jump!.split('|');
    const target = revision.comments.find((c) => c.id === comment)?.targets[Number(index)];
    if (target) void r.jumpTo(revision, target, !!pageById(target.route));
  };
  return (
    <ol data-app="rev-comments" onClick={onClick}>
      {revision.comments.map((c) => (
        <li key={c.id}>
          <Text>{c.text}</Text>
          {c.status === 'addressed' && (
            <Text variant="body-sm" tone="muted">
              Addressed
            </Text>
          )}
          <ul data-app="rev-targets">
            {c.targets.map((t, i) => (
              <li key={`${t.route}#${t.anchor}`}>
                <Link href={`#/${t.route}`} data-jump={`${c.id}|${i}`}>
                  {t.page} · {describe(t)}
                </Link>
              </li>
            ))}
          </ul>
          {revision.status === 'active' && (
            <Cluster>
              <Button label="Remove" emphasis="quiet" disabled={!editable} pendingLabel="Removing…" doneLabel="Removed" onCommit={() => r.removeComment(c.id)} onError={onError} />
            </Cluster>
          )}
        </li>
      ))}
    </ol>
  );
}

/** The pane's id, so the title bar's Revisions button can name what it opens. */
export const REVISION_PANE = 'revision-pane';

export function RevisionPane({ r }: { r: Revisions }) {
  const [problem, setProblem] = useState('');
  const [archiving, setArchiving] = useState(false);
  const [summary, setSummary] = useState('');
  const active = r.revisions.filter((x) => x.status === 'active');
  const archived = r.revisions.filter((x) => x.status === 'archived');
  const editable = r.status.kind !== 'read-only' && r.status.kind !== 'loading';
  const current = r.current;
  const { setCurrentId } = r;

  // Choose the newest active revision when none is chosen, or the chosen one was archived elsewhere.
  useEffect(() => {
    if (!current && active.length) setCurrentId(active[0].id);
  }, [current, active, setCurrentId]);

  useEffect(() => {
    setArchiving(false);
    setSummary('');
  }, [current?.id]);

  const fail = (error: unknown) => setProblem(error instanceof Error ? error.message : String(error));

  return (
    <Pane id={REVISION_PANE} title="Revision" closeLabel="Close revision pane" onClose={() => r.setPaneOpen(false)} status={<Status r={r} />}>

      {!current ? (
        <Stack>
          <Text>Start a revision, then select elements on any page and say what should change. Agents act on it and archive it when done.</Text>
          <Cluster>
            <Button label="New revision" emphasis="primary" disabled={!editable} pendingLabel="Starting…" doneLabel="Started" onCommit={r.create} onError={fail} />
          </Cluster>
        </Stack>
      ) : (
        <>
          <Stack>
            <Toolbar start={<Select label="Current revision" value={current.id} options={active.map((x) => ({ value: x.id, label: x.name }))} onChange={setCurrentId} />}>
              <Button label="New revision" icon="plus" iconOnly disabled={!editable} pendingLabel="Starting…" doneLabel="Started" onCommit={r.create} onError={fail} />
            </Toolbar>
            <TextField key={current.id} label="Name" value={current.name} onCommit={r.rename} disabled={!editable} />
          </Stack>

          <Stack>
            <Switch label="Select elements" checked={r.selecting} onChange={r.setSelecting} data-rev-picker-switch="" />
            <Toolbar
              align="center"
              start={
                <Text as="span" variant="body-sm" tone="muted">
                  {r.selection.length
                    ? `${plural(r.selection.length, 'element')} selected${r.selection.length >= MAX_SELECTION ? ' (the most one comment takes)' : ''}`
                    : 'Nothing selected. Turn on Select elements, then point at anything on a page.'}
                </Text>
              }
            >
              {r.selection.length > 0 && <Button label="Clear selection" emphasis="quiet" onClick={() => r.setSelection([])} />}
            </Toolbar>
            {r.selection.length > 0 && (
              <ul data-app="rev-targets">
                {r.selection.map((t) => (
                  <li key={t.key}>
                    <Text as="span" variant="body-sm">
                      {t.page} · {describe(t)}
                    </Text>
                  </li>
                ))}
              </ul>
            )}
            <TextArea label="Comment" value={r.draft} onChange={r.setDraft} hint="Say what should change and why." maxLength={20000} disabled={!editable} data-rev-composer="" />
            <Cluster>
              <Button
                label="Add comment"
                emphasis="primary"
                disabled={!editable || !r.draft.trim() || !r.selection.length}
                pendingLabel="Adding…"
                doneLabel="Added"
                onCommit={() => {
                  setProblem('');
                  return r.addComment();
                }}
                onError={fail}
              />
            </Cluster>
            {problem && (
              <Text variant="body-sm" tone="danger">
                {problem}
              </Text>
            )}
          </Stack>

          <Stack>
            <Heading level={3} size={4}>
              {current.comments.length ? plural(current.comments.length, 'comment') : 'No comments yet'}
            </Heading>
            <Comments r={r} revision={current} editable={editable} onError={fail} />
          </Stack>

          <Stack>
            {archiving ? (
              <>
                <TextArea label="Completion summary" value={summary} onChange={setSummary} rows={3} maxLength={20000} hint="What was done and how it was checked. Archiving marks every comment addressed." />
                <Toolbar>
                  <Button
                    label="Archive"
                    emphasis="primary"
                    disabled={!editable || !summary.trim()}
                    pendingLabel="Archiving…"
                    doneLabel="Archived"
                    onCommit={() => r.archive(current.id, summary)}
                    onError={fail}
                  />
                  <Button label="Cancel" emphasis="quiet" onClick={() => setArchiving(false)} />
                </Toolbar>
              </>
            ) : (
              <Cluster>
                <Button label="Archive revision" disabled={!editable} onClick={() => setArchiving(true)} />
              </Cluster>
            )}
          </Stack>
        </>
      )}

      {archived.length > 0 && (
        <details data-app="rev-archived">
          <summary>Archived ({archived.length})</summary>
          <Stack>
            {archived.map((a) => (
              <Stack key={a.id}>
                <Heading level={3} size={4}>
                  {a.name}
                </Heading>
                <Text variant="body-sm" tone="muted">
                  Archived {when(a.archivedAt!)}: {a.resolution}
                </Text>
                <Comments r={r} revision={a} editable={false} onError={fail} />
                <Cluster>
                  <Button label="Reopen" disabled={!editable} pendingLabel="Reopening…" doneLabel="Reopened" onCommit={() => r.reopen(a.id)} onError={fail} />
                </Cluster>
              </Stack>
            ))}
          </Stack>
        </details>
      )}

    </Pane>
  );
}

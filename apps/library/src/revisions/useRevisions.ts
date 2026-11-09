/**
 * Library revisions in the browser: the list from disk, the current revision, the block selection and the comment
 * draft. Every change is one ordered write through the dev server's API with the version it was based on. Browser
 * storage only keeps recovery (an unsaved change, the selection, the draft); it's never reported as saved.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { SCHEMA_VERSION, archiveRevision, createRevision, newId, reopenRevision, revise, type Revision, type RevisionSource } from '../../revisions/contract.js';
import type { Captured } from './capture';

const API = '/__library/revisions';
const keys = {
  current: 'design-library.revisions.current',
  open: 'design-library.revisions.pane',
  selection: 'design-library.revisions.selection',
  draft: 'design-library.revisions.draft',
  recovery: 'design-library.revisions.recovery',
};

export type SaveStatus =
  | { kind: 'loading' }
  | { kind: 'read-only' }
  | { kind: 'ready' }
  | { kind: 'saving' }
  | { kind: 'saved' }
  | { kind: 'failed'; message: string }
  | { kind: 'conflict'; message: string };

interface Recovery {
  revision: Revision;
  expected: number;
}

class SaveError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

function stored<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : (JSON.parse(v) as T);
  } catch {
    return fallback;
  }
}

function keep(key: string, value: unknown) {
  try {
    if (value === null || value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, init);
  } catch {
    throw new SaveError('The library server didn’t answer. Check it’s still running, then retry.', 0);
  }
  const type = response.headers.get('content-type') ?? '';
  if (!type.includes('application/json')) throw new SaveError('This build has no revision server, so it can’t save.', -1);
  const body = await response.json();
  if (!response.ok) throw new SaveError(body.error ?? `The server refused the change (${response.status}).`, response.status);
  return body as T;
}

const put = (revision: Revision, expected: number) =>
  request<Revision>(`${API}/${revision.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'If-Match': String(expected) },
    body: JSON.stringify(revision),
  });

export const MAX_SELECTION = 100;

/** Where a comment link should land: a page route and a block anchor (with its occurrence when repeated). */
export interface JumpTarget {
  route: string;
  anchor: string;
  occurrence: number;
  /** A picked element's selector and catalogue block, checked together when it's resolved. */
  element?: { selector: string; block: string; tag: string };
}

export function useRevisions() {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [status, setStatus] = useState<SaveStatus>({ kind: 'loading' });
  const [currentId, setCurrentId] = useState<string | null>(() => stored(keys.current, null));
  const [paneOpen, setPaneOpen] = useState<boolean>(() => stored(keys.open, false));
  const [selecting, setSelecting] = useState(false);
  const [selection, setSelection] = useState<Captured[]>(() => stored(keys.selection, []));
  const [draft, setDraft] = useState<string>(() => stored(keys.draft, ''));
  const [recovery, setRecovery] = useState<Recovery | null>(() => stored(keys.recovery, null));
  const [jump, setJump] = useState<JumpTarget | null>(null);
  const [jumpNote, setJumpNote] = useState('');
  const latest = useRef(revisions);
  const chain = useRef<Promise<unknown>>(Promise.resolve());
  latest.current = revisions;

  useEffect(() => void keep(keys.current, currentId), [currentId]);
  useEffect(() => void keep(keys.open, paneOpen), [paneOpen]);
  useEffect(() => void keep(keys.selection, selection), [selection]);
  useEffect(() => void keep(keys.draft, draft), [draft]);

  const refresh = useCallback(async () => {
    try {
      const store = await request<{ kind: string; revisions: Revision[] }>(API);
      if (store.kind !== 'design-library-revision-store') throw new SaveError('This build has no revision server, so it can’t save.', -1);
      setRevisions(store.revisions);
      setStatus(stored<Recovery | null>(keys.recovery, null) ? { kind: 'failed', message: 'A change from earlier wasn’t saved. It’s kept in this browser.' } : { kind: 'ready' });
    } catch (error) {
      const e = error as SaveError;
      setStatus(e.status === -1 ? { kind: 'read-only' } : { kind: 'failed', message: e.message });
    }
  }, []);

  useEffect(() => void refresh(), [refresh]);

  // Reopening the pane reloads what agents changed on disk, unless a change here is still unsaved.
  useEffect(() => {
    if (paneOpen && !stored(keys.recovery, null)) void refresh();
  }, [paneOpen, refresh]);

  /**
   * Goes to a comment's block. A missing page is an error; a changed source is said plainly, and the block is found by
   * its catalogue identity, never by position or approximate text.
   */
  const jumpTo = useCallback(async (revision: Revision, target: Revision['comments'][number]['targets'][number], pageExists: boolean) => {
    setJumpNote('');
    if (!pageExists) {
      setJumpNote(`The page “${target.page}” isn’t in the library any more, so there’s nothing to go to.`);
      return;
    }
    const { element } = target;
    setJump({ route: target.route, anchor: target.anchor, occurrence: target.occurrence, element: element && { selector: element.selector, block: element.block, tag: element.tag } });
    const changed: string[] = [];
    for (const id of target.sourceIds) {
      const source = revision.sources.find((s) => s.id === id);
      if (!source) continue;
      try {
        const now = await request<{ sha256: string }>(`/__library/sources?path=${encodeURIComponent(source.path)}`);
        if (now.sha256 !== source.sha256) changed.push(source.path.split('/').pop()!);
      } catch {
        changed.push(`${source.path.split('/').pop()} (unreadable)`);
      }
    }
    if (changed.length) setJumpNote(`Changed since this comment: ${changed.join(', ')}. Compare with the saved snapshot before acting.`);
  }, []);

  const blocked = () => !!stored<Recovery | null>(keys.recovery, null);

  /** Writes one revision: recovery first, then the server; only the server's answer counts as saved. */
  const save = useCallback(async (revision: Revision, expected: number) => {
    setStatus({ kind: 'saving' });
    const kept = keep(keys.recovery, { revision, expected });
    try {
      const saved = await put(revision, expected);
      keep(keys.recovery, null);
      setRecovery(null);
      setRevisions((list) => [saved, ...list.filter((r) => r.id !== saved.id)]);
      setStatus({ kind: 'saved' });
      return saved;
    } catch (error) {
      const e = error as SaveError;
      setRecovery(kept ? { revision, expected } : null);
      const recoveryNote = kept ? ' Your change is kept in this browser.' : ' This browser couldn’t keep a copy either.';
      setStatus(e.status === 409 ? { kind: 'conflict', message: `${e.message.split('.')[0]}.${recoveryNote}` } : { kind: 'failed', message: `${e.message}${recoveryNote}` });
      throw error;
    }
  }, []);

  /** One change to one revision, applied after every earlier write has finished. */
  const mutate = useCallback(
    (id: string, change: (next: Revision) => void) => {
      const run = async () => {
        if (blocked()) throw new Error('Resolve the unsaved change first.');
        const base = latest.current.find((r) => r.id === id);
        if (!base) throw new Error('That revision isn’t loaded.');
        return save(revise(base, change), base.version);
      };
      const result = chain.current.then(run, run);
      chain.current = result.catch(() => undefined);
      return result;
    },
    [save],
  );

  const current = revisions.find((r) => r.id === currentId && r.status === 'active') ?? null;

  const create = useCallback(async () => {
    if (blocked()) throw new Error('Resolve the unsaved change first.');
    const saved = await save(createRevision(), 0);
    setCurrentId(saved.id);
    return saved;
  }, [save]);

  const rename = (name: string) => (current ? mutate(current.id, (r) => void (r.name = name.trim() || r.name)) : Promise.reject(new Error('No revision')));

  /** Adds the draft as a comment on the selection; the draft and selection clear only once it's saved. */
  const addComment = useCallback(async () => {
    if (!current) throw new Error('Start a revision first.');
    const text = draft.trim();
    if (!text || !selection.length) throw new Error('Select blocks and write a comment first.');
    const have = new Set(current.sources.map((s) => s.path));
    const needed = [...new Set(selection.flatMap((t) => t.sourcePaths))].filter((p) => !have.has(p));
    const fetched: RevisionSource[] = [];
    for (const path of needed) {
      const snapshot = await request<{ path: string; sha256: string; content: string }>(`/__library/sources?path=${encodeURIComponent(path)}`);
      fetched.push({ id: newId('source'), ...snapshot });
    }
    const now = new Date();
    await mutate(current.id, (r) => {
      r.sources.push(...fetched.filter((s) => !r.sources.some((x) => x.path === s.path)));
      // A picked element's anchor is schema 1.1; an older revision moves up when it first holds one.
      if (selection.some((t) => t.element)) r.schemaVersion = SCHEMA_VERSION;
      const idOf = new Map(r.sources.map((s) => [s.path, s.id]));
      r.comments.push({
        id: newId('comment'),
        text,
        status: 'open',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        targets: selection.map(({ key: _key, sourcePaths, ...t }) => ({ ...t, sourceIds: sourcePaths.map((p) => idOf.get(p)!) })),
      });
    });
    setDraft('');
    setSelection([]);
  }, [current, draft, selection, mutate]);

  const removeComment = (commentId: string) => (current ? mutate(current.id, (r) => void (r.comments = r.comments.filter((c) => c.id !== commentId))) : Promise.reject(new Error('No revision')));

  const archive = async (id: string, summary: string) => {
    const base = latest.current.find((r) => r.id === id);
    if (!base) throw new Error('That revision isn’t loaded.');
    return save(archiveRevision(base, summary), base.version);
  };

  const reopen = async (id: string) => {
    const base = latest.current.find((r) => r.id === id);
    if (!base) throw new Error('That revision isn’t loaded.');
    const saved = await save(reopenRevision(base), base.version);
    setCurrentId(saved.id);
    return saved;
  };

  const retry = async () => {
    const r = stored<Recovery | null>(keys.recovery, null);
    if (r) await save(r.revision, r.expected);
  };

  /** Drops the unsaved change (the comment draft and selection stay) and loads what's on disk. */
  const discard = async () => {
    keep(keys.recovery, null);
    setRecovery(null);
    await refresh();
  };

  const toggle = (target: Captured) =>
    setSelection((list) => {
      if (list.some((t) => t.key === target.key)) return list.filter((t) => t.key !== target.key);
      return list.length >= MAX_SELECTION ? list : [...list, target];
    });


  return {
    revisions, status, current, currentId, setCurrentId, paneOpen, setPaneOpen, selecting, setSelecting,
    selection, setSelection, toggle, draft, setDraft, recovery,
    jump, setJump, jumpNote, setJumpNote, jumpTo,
    create, rename, addComment, removeComment, archive, reopen, retry, discard, refresh,
  };
}

export type Revisions = ReturnType<typeof useRevisions>;

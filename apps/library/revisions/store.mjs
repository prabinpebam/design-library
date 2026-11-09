/**
 * The library revision store: `.design-library/revisions/<id>.json` in the repository. Slate's write algorithm (lock,
 * optimistic version check, identical-retry no-op, temporary file, fsync, atomic rename) with the store root and the
 * validator parameterised for the library. Path safety and errors are Slate's, imported unchanged.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { RevisionError, safeFile } from '../../../slate/scripts/revision-store.mjs';
import { MAX_REVISION_BYTES, REVISION_ID, STORAGE_PATH, safeSourcePath, sha256, verifyRevision } from './contract.js';

export { RevisionError, safeFile };

const MAX_SOURCE_CHARACTERS = 1000000;

export function openLibraryRevisionStore(repoRoot) {
  const repo = path.resolve(repoRoot);
  if (!fs.statSync(repo).isDirectory() || fs.lstatSync(repo).isSymbolicLink()) throw new RevisionError('Repository must be a real directory.');

  function directory(create = false) {
    const result = safeFile(repo, STORAGE_PATH);
    if (create) fs.mkdirSync(result, { recursive: true });
    return result;
  }
  function file(id) {
    if (typeof id !== 'string' || !REVISION_ID.test(id)) throw new RevisionError('Invalid revision ID.');
    return safeFile(repo, `${STORAGE_PATH}/${id}.json`);
  }
  async function read(id) {
    const target = file(id);
    if (!fs.existsSync(target)) throw new RevisionError('Revision not found.', 404);
    if (fs.statSync(target).size > MAX_REVISION_BYTES) throw new RevisionError('Revision exceeds 8 MiB.', 413);
    const revision = await verifyRevision(JSON.parse(fs.readFileSync(target, 'utf8')));
    if (revision.id !== id) throw new RevisionError('Revision filename and ID disagree.');
    return revision;
  }
  async function list() {
    const dir = directory();
    if (!fs.existsSync(dir)) return [];
    const revisions = [];
    for (const name of fs.readdirSync(dir).filter((n) => n.endsWith('.json')).sort()) revisions.push(await read(name.slice(0, -5)));
    return revisions.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }
  async function write(revision, expectedVersion) {
    try { await verifyRevision(revision); }
    catch (error) { throw new RevisionError(error.message); }
    if (!Number.isSafeInteger(expectedVersion) || expectedVersion < 0) throw new RevisionError('An expected version is required.');
    const dir = directory(true);
    const lockPath = safeFile(repo, `${STORAGE_PATH}/.write.lock`);
    let lock;
    let temporary;
    try {
      try { lock = fs.openSync(lockPath, 'wx'); }
      catch (error) {
        if (error.code === 'EEXIST') throw new RevisionError('Revision store is locked by another writer. Retry after it finishes; inspect a persistent lock before removing it.', 409);
        throw error;
      }
      fs.writeFileSync(lock, JSON.stringify({ pid: process.pid, createdAt: new Date().toISOString() }));
      const target = file(revision.id);
      const current = fs.existsSync(target) ? JSON.parse(fs.readFileSync(target, 'utf8')) : null;
      if (current) await verifyRevision(current);
      // A lost response may cause the same exact write to be retried.
      if (current && JSON.stringify(current) === JSON.stringify(revision)) return current;
      if ((current?.version || 0) !== expectedVersion) throw new RevisionError('Revision conflict: another writer changed this file. Pending edits remain in browser recovery; reload the saved version before continuing.', 409);
      if (current && (revision.version !== current.version + 1 || revision.createdAt !== current.createdAt)) {
        throw new RevisionError('An update must preserve createdAt and increment version by one.');
      }
      const candidate = path.join(dir, `${revision.id}.${crypto.randomUUID()}.tmp`);
      const descriptor = fs.openSync(candidate, 'wx');
      temporary = candidate;
      try {
        fs.writeFileSync(descriptor, `${JSON.stringify(revision, null, 2)}\n`);
        fs.fsyncSync(descriptor);
      } finally { fs.closeSync(descriptor); }
      fs.renameSync(temporary, target);
      temporary = null;
      return revision;
    } finally {
      if (temporary) fs.rmSync(temporary, { force: true });
      if (lock !== undefined) {
        fs.closeSync(lock);
        fs.rmSync(lockPath);
      }
    }
  }
  /** The current content of one owning source, for a snapshot. Read-only, and only inside the library's source roots. */
  async function readSource(relativePath) {
    if (!safeSourcePath(relativePath)) throw new RevisionError('Not a library source path.');
    const target = safeFile(repo, relativePath);
    if (!fs.existsSync(target) || !fs.statSync(target).isFile()) throw new RevisionError('Source not found.', 404);
    if (fs.statSync(target).size > MAX_SOURCE_CHARACTERS * 4) throw new RevisionError('Source exceeds the snapshot bound.', 413);
    const content = fs.readFileSync(target, 'utf8');
    if (content.length > MAX_SOURCE_CHARACTERS) throw new RevisionError('Source exceeds the snapshot bound.', 413);
    return { path: relativePath, sha256: await sha256(content), content };
  }
  /** Each recorded source against the working tree: current, stale (hash differs) or missing. Never retargets. */
  async function check(id) {
    const revision = await read(id);
    const openSources = new Set(revision.comments.filter((c) => c.status === 'open').flatMap((c) => c.targets.flatMap((t) => t.sourceIds)));
    const results = [];
    for (const source of revision.sources) {
      const target = safeFile(repo, source.path);
      const pending = openSources.has(source.id);
      if (!fs.existsSync(target)) results.push({ path: source.path, status: 'missing', pending });
      else {
        const actual = await sha256(fs.readFileSync(target, 'utf8'));
        results.push({ path: source.path, status: actual === source.sha256 ? 'current' : 'stale', pending, expected: source.sha256, actual });
      }
    }
    return results;
  }
  return { repo, revisionRoot: path.join(repo, ...STORAGE_PATH.split('/')), read, list, write, readSource, check };
}

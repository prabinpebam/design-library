#!/usr/bin/env node
/**
 * Agent CLI for Design Library revisions (`.design-library/revisions`), mirroring Slate's revisions.mjs:
 *   node .\tools\library-revisions.mjs list
 *   node .\tools\library-revisions.mjs show --id REVISION_ID
 *   node .\tools\library-revisions.mjs show --id REVISION_ID --format prompt   (Markdown per comment, for an agent prompt)
 *   node .\tools\library-revisions.mjs check --id REVISION_ID
 *   node .\tools\library-revisions.mjs archive --id REVISION_ID --version N --summary "What was done and verified."
 *   node .\tools\library-revisions.mjs reopen --id REVISION_ID --version N
 * `--repo ROOT` selects another repository root (default: this one).
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { archiveRevision, reopenRevision } from '../apps/library/revisions/contract.js';
import { formatPrompt } from '../apps/library/revisions/prompt.mjs';
import { openLibraryRevisionStore } from '../apps/library/revisions/store.mjs';

const USAGE = 'Usage: library-revisions.mjs list|show|check|archive|reopen [--repo ROOT] [--id ID] [--version N] [--summary TEXT] [--format json|prompt]';

export async function revisionCommand(args, defaultRepo = fileURLToPath(new URL('..', import.meta.url))) {
  const [command, ...flags] = args;
  const options = {};
  for (let index = 0; index < flags.length; index += 2) {
    const flag = flags[index];
    if (!['--repo', '--id', '--version', '--summary', '--format'].includes(flag) || flags[index + 1] === undefined || options[flag] !== undefined) throw new Error(USAGE);
    options[flag] = flags[index + 1];
  }
  if (!['list', 'show', 'check', 'archive', 'reopen'].includes(command)) throw new Error(`Unknown revision command. ${USAGE}`);
  const store = openLibraryRevisionStore(options['--repo'] || defaultRepo);
  if (command === 'list') {
    return (await store.list()).map(({ id, name, status, version, comments, updatedAt }) => ({
      id, name, status, version, comments: comments.length, open: comments.filter((c) => c.status === 'open').length, updatedAt,
    }));
  }
  const format = options['--format'] ?? 'json';
  if (!['json', 'prompt'].includes(format) || (format === 'prompt' && command !== 'show')) throw new Error(`--format prompt is for show only. ${USAGE}`);
  const revision = await store.read(options['--id']);
  if (command === 'show') return format === 'prompt' ? formatPrompt(revision, await store.check(revision.id)) : revision;
  if (command === 'check') return store.check(revision.id);
  const version = Number(options['--version']);
  if (!Number.isSafeInteger(version) || version < 1) throw new Error('Archive and reopen require the --version you read before acting.');
  if (version !== revision.version) throw new Error('Revision conflict: re-read all comments before acting on the new version.');
  return store.write(command === 'archive' ? archiveRevision(revision, options['--summary'] || '') : reopenRevision(revision), version);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await revisionCommand(process.argv.slice(2));
    // A prompt is printed as it is; everything else as JSON.
    if (typeof result === 'string') process.stdout.write(result);
    else console.log(JSON.stringify(result, null, 2));
    if (process.argv[2] === 'check' && result.some((source) => source.pending && source.status !== 'current')) process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

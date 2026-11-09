/**
 * The library revision API: a loopback-only, same-origin middleware mounted in the library dev server (app layer,
 * above core). Fixed routes only: list, read and write revisions in the store, and read one owning source for a
 * snapshot. No CORS, no arbitrary file writes, no agents run. A static build has no API, so the app reads but never
 * pretends to save.
 */
import { fileURLToPath } from 'node:url';
import { MAX_REVISION_BYTES, STORAGE_PATH } from './contract.js';
import { RevisionError, openLibraryRevisionStore } from './store.mjs';

export const API = '/__library/revisions';
export const SOURCE_API = '/__library/sources';

function readBody(request) {
  if (Number(request.headers['content-length']) > MAX_REVISION_BYTES) {
    request.resume();
    return Promise.reject(new RevisionError('Revision request exceeds 8 MiB.', 413));
  }
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    request.on('data', (chunk) => {
      size += chunk.length;
      if (size <= MAX_REVISION_BYTES) chunks.push(chunk);
    });
    request.on('end', () => {
      if (size > MAX_REVISION_BYTES) reject(new RevisionError('Revision request exceeds 8 MiB.', 413));
      else {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
        catch { reject(new RevisionError('Request must contain valid JSON.')); }
      }
    });
    request.on('error', reject);
  });
}

/** `origin` is the one origin allowed, e.g. http://127.0.0.1:8766; requests under other paths pass to `next`. */
export function createRevisionMiddleware({ repoRoot, origin }) {
  const store = openLibraryRevisionStore(repoRoot);
  return async function revisionMiddleware(request, response, next) {
    const pathname = (request.url || '').split('?')[0];
    if (pathname !== API && !pathname.startsWith(`${API}/`) && pathname !== SOURCE_API) {
      next?.();
      return;
    }
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Cache-Control', 'no-store');
    const json = (status, value) => {
      response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify(value));
    };
    try {
      const allowed = new URL(origin);
      if (request.socket.remoteAddress && !['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(request.socket.remoteAddress)) throw new RevisionError('Loopback requests only.', 403);
      if (request.headers.host !== allowed.host) throw new RevisionError('Foreign Host header rejected.', 403);
      if (request.headers.origin && request.headers.origin !== allowed.origin) throw new RevisionError('Foreign origin rejected.', 403);
      if (request.headers['sec-fetch-site'] && !['same-origin', 'none'].includes(request.headers['sec-fetch-site'])) throw new RevisionError('Cross-site requests rejected.', 403);
      if (pathname === SOURCE_API) {
        if (request.method !== 'GET') throw new RevisionError('Sources are read-only.', 405);
        const relative = new URL(request.url, allowed.origin).searchParams.get('path');
        json(200, await store.readSource(relative));
        return;
      }
      if (pathname === API) {
        if (request.method !== 'GET') throw new RevisionError('Only GET is supported here.', 405);
        json(200, { kind: 'design-library-revision-store', storagePath: STORAGE_PATH, revisions: await store.list() });
        return;
      }
      const id = decodeURIComponent(pathname.slice(API.length + 1));
      if (request.method === 'GET') { json(200, await store.read(id)); return; }
      if (request.method !== 'PUT') throw new RevisionError('Only GET and PUT are supported.', 405);
      if (request.headers.origin !== allowed.origin) throw new RevisionError('Same-origin writes are required.', 403);
      if (request.headers['content-type']?.split(';')[0].trim() !== 'application/json') throw new RevisionError('Content-Type must be application/json.', 415);
      const expected = request.headers['if-match'];
      if (!/^(0|[1-9]\d*)$/.test(expected || '')) throw new RevisionError('If-Match must contain the expected numeric version.', 428);
      const revision = await readBody(request);
      if (!revision || revision.id !== id) throw new RevisionError('URL and revision ID disagree.');
      json(200, await store.write(revision, Number(expected)));
    } catch (error) {
      if (response.headersSent) { response.destroy(error); return; }
      json(error.status || 400, { error: error.message });
    }
  };
}

/** Vite plugin: mounts the API before Vite's own middleware, in the dev server only (never in a build or preview). */
export function libraryRevisions({ repoRoot = fileURLToPath(new URL('../../..', import.meta.url)) } = {}) {
  return {
    name: 'design-library-revisions',
    apply: 'serve',
    configureServer(server) {
      const { host, port } = server.config.server;
      if (host !== '127.0.0.1') throw new Error('Library revisions need the dev server bound to 127.0.0.1.');
      server.middlewares.use(createRevisionMiddleware({ repoRoot, origin: `http://127.0.0.1:${port}` }));
    },
  };
}

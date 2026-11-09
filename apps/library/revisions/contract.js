/**
 * Design Library revisions: the executable contract shared by the library app (browser), the store, the API and the
 * agent CLI. Lifecycle, ids, fingerprints and bounds are Slate's, imported unchanged from the Slate checkout; only the
 * document shape differs, because a library block is owned by source files (component, story, token JSON, page data),
 * not by one Markdown page. See docs/foundation.md "Library revisions".
 */
import {
  MAX_REVISION_BYTES, REVISION_ID, archiveRevision, newId, normalizeText, reopenRevision, revise, sha256,
} from '../../../slate/shell/revisions-core.js';

export { MAX_REVISION_BYTES, REVISION_ID, archiveRevision, newId, normalizeText, reopenRevision, revise, sha256 };

export const KIND = 'design-library-revision';
export const STORAGE_PATH = '.design-library/revisions';

/** Selectable block kinds, emitted at pattern level (never per page) as `data-rev-kind`. */
export const TARGET_KINDS = [
  'section', 'heading', 'prose', 'token', 'matrix-row', 'matrix-cell', 'example', 'pane', 'code',
  'prop', 'a11y', 'key', 'built-from', 'index-item', 'element',
];

/**
 * Schema versions this contract reads. 1 is R1-R3 (block targets); 1.1 (F4) adds the picked element's anchor
 * (`target.element`) and the `element` kind. Additive: every 1 document is still valid, and is saved as 1.1 once it
 * holds an element target.
 */
export const SCHEMA_VERSIONS = [1, 1.1];
export const SCHEMA_VERSION = 1.1;

/** Catalogue identity fields a target may carry: the stable names an agent resolves, never DOM positions. */
export const IDENTITY_KEYS = [
  'page', 'section', 'component', 'story', 'context', 'token', 'pair', 'group', 'prop', 'key', 'note', 'item',
];

/** Owning sources are files in the library's own source trees, read-only, never anything else in the repository. */
export const SOURCE_ROOTS = ['packages/core/', 'apps/library/src/'];

const COMMENT_ID = /^comment-[a-f0-9-]{36}$/;
const SOURCE_ID = /^source-[a-f0-9-]{36}$/;
const HASH = /^[a-f0-9]{64}$/;
const ROUTE = /^[a-z0-9][a-z0-9-]{0,99}$/;
const ANCHOR = /^[a-z][a-z-]*:[^\u0000-\u001f]{1,1000}$/;

/** A repository-relative owning-source path inside the library's source roots. */
export function safeSourcePath(value) {
  return typeof value === 'string' && value.length <= 1024
    && !/[\\:%?#\u0000-\u001f]/.test(value)
    && SOURCE_ROOTS.some((root) => value.startsWith(root))
    && /\.(?:tsx?|css|json|js)$/.test(value)
    && value.split('/').every((part) => part && part !== '.' && part !== '..' && !part.startsWith('.'));
}

export function createRevision(now = new Date()) {
  const timestamp = now.toISOString();
  return {
    schemaVersion: SCHEMA_VERSION, kind: KIND, id: newId('rev'),
    name: `Revision ${now.toLocaleString()}`, status: 'active', version: 1,
    createdAt: timestamp, updatedAt: timestamp, archivedAt: null, resolution: null,
    sources: [], comments: [],
  };
}

export function validateRevision(revision) {
  function fail(message) { throw new Error(`Invalid revision: ${message}`); }
  function object(value, fields, label) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`${label} must be an object`);
    const keys = Object.keys(value);
    if (keys.length !== fields.length || keys.some((key) => !fields.includes(key))) fail(`${label} has missing or unknown fields`);
  }
  function text(value, max, label, empty = false) {
    if (typeof value !== 'string' || value.length > max || (!empty && !value.trim())) fail(`${label} must be ${empty ? 'a' : 'a nonempty'} string of at most ${max} characters`);
  }
  function timestamp(value, label) {
    if (typeof value !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value)
        || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString() !== value) fail(`${label} must be a UTC ISO timestamp`);
  }
  function integer(value, min, max, label) {
    if (!Number.isSafeInteger(value) || value < min || value > max) fail(`${label} is outside ${min}..${max}`);
  }
  object(revision, ['schemaVersion', 'kind', 'id', 'name', 'status', 'version', 'createdAt', 'updatedAt', 'archivedAt', 'resolution', 'sources', 'comments'], 'root');
  if (!SCHEMA_VERSIONS.includes(revision.schemaVersion) || revision.kind !== KIND) fail('unsupported schema or kind');
  if (!REVISION_ID.test(revision.id)) fail('invalid id');
  text(revision.name, 200, 'name');
  if (!['active', 'archived'].includes(revision.status)) fail('invalid status');
  integer(revision.version, 1, Number.MAX_SAFE_INTEGER, 'version');
  timestamp(revision.createdAt, 'createdAt');
  timestamp(revision.updatedAt, 'updatedAt');
  if (revision.updatedAt < revision.createdAt) fail('updatedAt precedes createdAt');
  if (revision.status === 'archived') {
    timestamp(revision.archivedAt, 'archivedAt');
    text(revision.resolution, 20000, 'resolution');
    if (revision.archivedAt < revision.createdAt || revision.archivedAt > revision.updatedAt) fail('archive timestamp is outside the revision lifetime');
  } else if (revision.archivedAt !== null || revision.resolution !== null) fail('active revision cannot have archive metadata');
  if (!Array.isArray(revision.sources) || revision.sources.length > 128) fail('sources must be an array of at most 128 snapshots');
  const sourceIds = new Set();
  const sourcePaths = new Set();
  for (const source of revision.sources) {
    object(source, ['id', 'path', 'sha256', 'content'], 'source');
    if (!SOURCE_ID.test(source.id) || sourceIds.has(source.id)) fail('invalid or duplicate source id');
    sourceIds.add(source.id);
    if (!safeSourcePath(source.path) || sourcePaths.has(source.path)) fail('unsafe, foreign or duplicate source path');
    sourcePaths.add(source.path);
    text(source.content, 1000000, 'source content', true);
    if (!HASH.test(source.sha256)) fail('invalid source hash');
  }
  if (!Array.isArray(revision.comments) || revision.comments.length > 1000) fail('comments must be an array of at most 1000 entries');
  const commentIds = new Set();
  for (const comment of revision.comments) {
    object(comment, ['id', 'text', 'status', 'createdAt', 'updatedAt', 'targets'], 'comment');
    if (!COMMENT_ID.test(comment.id) || commentIds.has(comment.id)) fail('invalid or duplicate comment id');
    commentIds.add(comment.id);
    text(comment.text, 20000, 'comment text');
    if (!['open', 'addressed'].includes(comment.status)) fail('invalid comment status');
    if (revision.status === 'archived' && comment.status !== 'addressed') fail('archived revisions cannot contain open comments');
    timestamp(comment.createdAt, 'comment createdAt');
    timestamp(comment.updatedAt, 'comment updatedAt');
    if (comment.createdAt < revision.createdAt || comment.updatedAt < comment.createdAt || comment.updatedAt > revision.updatedAt) fail('comment timestamp is outside the revision lifetime');
    if (!Array.isArray(comment.targets) || !comment.targets.length || comment.targets.length > 100) fail('a comment requires 1..100 targets');
    const targets = new Set();
    for (const target of comment.targets) {
      const picked = !!target && typeof target === 'object' && 'element' in target;
      object(target, ['route', 'page', 'kind', 'anchor', 'identity', 'sourceIds', 'text', 'html', 'sha256', 'occurrence', 'matches', 'headings', 'before', 'after', ...(picked ? ['element'] : [])], 'target');
      if (picked !== (target.kind === 'element')) fail('an element target, and only an element target, carries an element anchor');
      if (picked && revision.schemaVersion < 1.1) fail('element anchors need schema 1.1');
      if (picked) validateElement(target.element, { fail, object, text, integer });
      if (typeof target.route !== 'string' || !ROUTE.test(target.route)) fail('invalid route');
      text(target.page, 500, 'page title');
      if (!TARGET_KINDS.includes(target.kind)) fail('invalid target kind');
      if (typeof target.anchor !== 'string' || !ANCHOR.test(target.anchor)) fail('invalid anchor');
      if (targets.has(`${target.route}#${target.anchor}`)) fail('duplicate target');
      targets.add(`${target.route}#${target.anchor}`);
      if (!target.identity || typeof target.identity !== 'object' || Array.isArray(target.identity)) fail('identity must be an object');
      const identity = Object.entries(target.identity);
      if (!identity.length || identity.some(([key]) => !IDENTITY_KEYS.includes(key))) fail('identity needs known catalogue fields');
      for (const [key, value] of identity) text(value, 500, `identity ${key}`);
      if (!Array.isArray(target.sourceIds) || !target.sourceIds.length || target.sourceIds.length > 16
          || new Set(target.sourceIds).size !== target.sourceIds.length || target.sourceIds.some((id) => !sourceIds.has(id))) fail('a target needs 1..16 distinct recorded sources');
      text(target.text, 1000000, 'target text', true);
      text(target.html, 1000000, 'target HTML');
      if (!HASH.test(target.sha256)) fail('invalid target hash');
      integer(target.matches, 1, 100000, 'matches');
      integer(target.occurrence, 1, target.matches, 'occurrence');
      text(target.before, 1000, 'before', true);
      text(target.after, 1000, 'after', true);
      if (!Array.isArray(target.headings) || target.headings.length > 6) fail('invalid heading context');
      for (const heading of target.headings) {
        object(heading, ['level', 'text', 'id'], 'heading');
        integer(heading.level, 1, 6, 'heading level');
        text(heading.text, 10000, 'heading text', true);
        text(heading.id, 1024, 'heading id', true);
      }
    }
  }
  if (new TextEncoder().encode(`${JSON.stringify(revision, null, 2)}\n`).length > MAX_REVISION_BYTES) fail('file exceeds 8 MiB');
  return revision;
}

/** The picked element's anchor (schema 1.1): bounded, typed and closed, like every other part of the document. */
function validateElement(element, { fail, object, text, integer }) {
  object(element, ['tag', 'role', 'name', 'selector', 'path', 'box', 'viewport', 'htmlTruncated', 'block', 'component', 'frames', 'sourceNote', 'context', 'tokens', 'states'], 'element');
  if (typeof element.tag !== 'string' || !/^[a-z][a-z0-9-]{0,63}$/.test(element.tag)) fail('invalid element tag');
  text(element.role, 100, 'element role', true);
  text(element.name, 500, 'element name', true);
  text(element.selector, 1000, 'element selector', true);
  if (!Array.isArray(element.path) || !element.path.length || element.path.length > 16) fail('element path needs 1..16 steps');
  for (const step of element.path) text(step, 200, 'element path step');
  object(element.box, ['x', 'y', 'width', 'height'], 'element box');
  for (const key of ['x', 'y', 'width', 'height']) integer(element.box[key], -1000000, 1000000, `element box ${key}`);
  object(element.viewport, ['width', 'height'], 'element viewport');
  for (const key of ['width', 'height']) integer(element.viewport[key], 0, 1000000, `element viewport ${key}`);
  if (typeof element.htmlTruncated !== 'boolean') fail('htmlTruncated must be a boolean');
  text(element.block, 1000, 'element block', true);
  text(element.component, 200, 'element component', true);
  if (!Array.isArray(element.frames) || element.frames.length > 12) fail('element frames must be at most 12');
  for (const frame of element.frames) {
    object(frame, ['component', 'file', 'line', 'column'], 'frame');
    text(frame.component, 200, 'frame component', true);
    text(frame.file, 1024, 'frame file');
    if (/[\\:\u0000-\u001f]/.test(frame.file) || frame.file.split('/').some((part) => part === '..')) fail('frame file must be a repository-relative path or a base name');
    integer(frame.line, 1, 10000000, 'frame line');
    integer(frame.column, 1, 10000000, 'frame column');
  }
  text(element.sourceNote, 500, 'source note', true);
  object(element.context, ['scheme', 'contrast', 'specimen'], 'element context');
  text(element.context.scheme, 50, 'context scheme', true);
  text(element.context.contrast, 50, 'context contrast', true);
  if (typeof element.context.specimen !== 'boolean') fail('context specimen must be a boolean');
  if (!Array.isArray(element.tokens) || element.tokens.length > 48) fail('element tokens must be at most 48');
  for (const token of element.tokens) {
    object(token, ['property', 'token', 'value', 'from'], 'token');
    text(token.property, 100, 'token property');
    if (typeof token.token !== 'string' || !/^--[a-z0-9-]{1,100}$/i.test(token.token)) fail('invalid token name');
    text(token.value, 200, 'token value', true);
    text(token.from, 200, 'token origin');
  }
  if (!Array.isArray(element.states) || element.states.length > 16) fail('element states must be at most 16');
  for (const state of element.states) text(state, 100, 'element state');
}

/** Validates, then recomputes every source and block fingerprint, so a snapshot can't claim content it doesn't hold. */
export async function verifyRevision(revision) {
  validateRevision(revision);
  for (const source of revision.sources) {
    if (await sha256(source.content) !== source.sha256) throw new Error(`Source snapshot fingerprint mismatch: ${source.path}`);
  }
  for (const comment of revision.comments) {
    for (const target of comment.targets) {
      if (await sha256(target.html) !== target.sha256) throw new Error(`Block snapshot fingerprint mismatch: ${target.route}#${target.anchor}`);
    }
  }
  return revision;
}

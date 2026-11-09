/** Types for contract.js, the shared library revision contract (see that file). */
export interface RevisionHeading {
  level: number;
  text: string;
  id: string;
}

export interface RevisionTarget {
  route: string;
  page: string;
  kind: TargetKind;
  anchor: string;
  identity: Partial<Record<IdentityKey, string>>;
  sourceIds: string[];
  text: string;
  html: string;
  sha256: string;
  occurrence: number;
  matches: number;
  headings: RevisionHeading[];
  before: string;
  after: string;
  /** Schema 1.1: present on, and only on, `element` targets picked with the element picker. */
  element?: ElementAnchor;
}

/** What a picked element is, where its source is, what it belongs to and what styles it (schema 1.1). */
export interface ElementAnchor {
  tag: string;
  role: string;
  /** Accessible name, where the element has one. */
  name: string;
  /** A unique selector within the page's article (@medv/finder); empty when none could be found. */
  selector: string;
  /** Ancestor path from the article, as tag[marker="value"] steps. */
  path: string[];
  /** Viewport box when picked, in CSS pixels. */
  box: { x: number; y: number; width: number; height: number };
  viewport: { width: number; height: number };
  htmlTruncated: boolean;
  /** Anchor of the nearest catalogue block (`data-rev`), or empty. */
  block: string;
  /** Nearest React component. */
  component: string;
  /** React component stack, innermost first: repository paths (or a base name when ambiguous), 1-based line and column. */
  frames: { component: string; file: string; line: number; column: number }[];
  /** Why there are no frames, when there are none. */
  sourceNote: string;
  context: { scheme: string; contrast: string; specimen: boolean };
  /** Custom properties read by the rules that style the element, with the resolved value of the property they set. */
  tokens: { property: string; token: string; value: string; from: string }[];
  states: string[];
}

export interface RevisionComment {
  id: string;
  text: string;
  status: 'open' | 'addressed';
  createdAt: string;
  updatedAt: string;
  targets: RevisionTarget[];
}

export interface RevisionSource {
  id: string;
  path: string;
  sha256: string;
  content: string;
}

export interface Revision {
  schemaVersion: 1 | 1.1;
  kind: 'design-library-revision';
  id: string;
  name: string;
  status: 'active' | 'archived';
  version: number;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  resolution: string | null;
  sources: RevisionSource[];
  comments: RevisionComment[];
}

export type TargetKind =
  | 'section' | 'heading' | 'prose' | 'token' | 'matrix-row' | 'matrix-cell' | 'example' | 'pane' | 'code'
  | 'prop' | 'a11y' | 'key' | 'built-from' | 'index-item' | 'element';
export type IdentityKey = 'page' | 'section' | 'component' | 'story' | 'context' | 'token' | 'pair' | 'group' | 'prop' | 'key' | 'note' | 'item';

export const MAX_REVISION_BYTES: number;
export const KIND: 'design-library-revision';
export const SCHEMA_VERSIONS: (1 | 1.1)[];
export const SCHEMA_VERSION: 1.1;
export const STORAGE_PATH: string;
export const TARGET_KINDS: TargetKind[];
export const IDENTITY_KEYS: IdentityKey[];
export const SOURCE_ROOTS: string[];
export function safeSourcePath(value: unknown): boolean;
export function sha256(value: string): Promise<string>;
export function newId(prefix: string): string;
export function normalizeText(value: string): string;
export function createRevision(now?: Date): Revision;
export function revise(revision: Revision, change: (next: Revision) => void, now?: Date): Revision;
export function archiveRevision(revision: Revision, summary: string, now?: Date): Revision;
export function reopenRevision(revision: Revision): Revision;
export function validateRevision(revision: unknown): Revision;
export function verifyRevision(revision: unknown): Promise<Revision>;

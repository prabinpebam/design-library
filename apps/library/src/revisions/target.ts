/**
 * Revision targets, emitted once per pattern (never per page): a stable anchor built from catalogue identity, the
 * block kind and its owning source files. The selection layer reads these attributes; nothing else does.
 */
import type { IdentityKey, TargetKind } from '../../revisions/contract.js';
import { tokenFiles } from '../data/tokens';

export const PAGES = 'apps/library/src/data/pages.ts';
export const INSPECTORS = 'apps/library/src/inspectors/inspectors.tsx';
export const SPECIMENS = 'apps/library/src/inspectors/specimens.tsx';
export const CONTRACT = 'apps/library/src/inspectors/contract.tsx';

export type Identity = Partial<Record<IdentityKey, string>>;

export interface TargetSpec {
  kind: TargetKind;
  identity: Identity;
  /** Owning files, repository-relative, in packages/core or apps/library/src. */
  sources: string[];
}

/** Data attributes for a selectable block. The anchor is the kind plus its identity values, so it's stable and readable. */
export function rev({ kind, identity, sources }: TargetSpec): Record<`data-${string}`, string> {
  return {
    'data-rev': `${kind}:${Object.values(identity).join('/')}`,
    'data-rev-kind': kind,
    'data-rev-identity': JSON.stringify(identity),
    'data-rev-sources': [...new Set(sources)].join(' '),
  };
}

/** A token's own block: the token JSON files that define it, then the inspector that draws it. */
export const tokenRev = (path: string, css: string, kind: TargetKind = 'token', extra: Identity = {}) =>
  rev({ kind, identity: { token: css, ...extra }, sources: [...tokenFiles(path), INSPECTORS] });

/** A component's source and its stories. */
export const componentSources = (file: string | undefined, component: string) =>
  [file, `packages/core/react/stories/${component}.stories.tsx`].filter((f): f is string => !!f);

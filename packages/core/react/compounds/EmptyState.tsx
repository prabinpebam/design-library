import { useEffect, type ReactNode } from 'react';
import { announce as say } from '../behaviour/announce';
import { Heading } from '../fundamentals/Heading';
import { Text } from '../fundamentals/Text';
import type { DataAttributes } from '../types';

export interface EmptyStateProps extends DataAttributes {
  /**
   * Why it's empty, which sets nothing visible but documents the tone: `first-use` (never had anything: welcoming),
   * `cleared` (the person emptied it), `no-results` (a search or filter: plain, names the query), `no-access` (it
   * exists, this person can't see it: plain) or `done` (zero as success: a short celebration). A failure to load is
   * never an empty state: show an Alert at that scope.
   */
  reason: 'first-use' | 'cleared' | 'no-results' | 'no-access' | 'done';
  /** The wrapper it fills: a whole `view`'s content area, a `section` (card, panel) or a `component` (menu, picker). */
  scope?: 'view' | 'section' | 'component';
  /** Names the state: "No projects yet", "No projects match “budget”", "All caught up". */
  title: ReactNode;
  /** The title's level in the page's outline. Defaults to 2 for a view, 3 for a section; a component has no heading. */
  headingLevel?: 2 | 3 | 4;
  /** The reason and the next step, in a sentence or two. */
  children?: ReactNode;
  /** The way out: one Button or Link that fixes it ("Create a project", "Clear filters"), quiet when many show at once. */
  actions?: ReactNode;
  /** A faint, still outline of the content to come (decorative, hidden from screen readers); never on `no-access`. */
  silhouette?: 'list' | 'tiles' | 'table';
  /**
   * **Under test (VS4, AF11): only the EmptyState review story uses it; no template does until the check passes.** A small
   * decorative spot illustration of what will appear, in the silhouette's place (it replaces the silhouette), at its own
   * CSS size (`width` × `height`) and never wider than the silhouette; hidden from screen readers.
   */
  illustration?: { src: string; width: number; height: number };
  /** Says the title through the polite announcer when it appears: only when the person caused it (a search, a filter, clearing). */
  announce?: boolean;
}

const rows = { list: 3, tiles: 3, table: 4 } as const;

/**
 * What a list, table, card or view shows when it has nothing: in the content's own wrapper at its least size, it says
 * what would be here, why it's empty and what to do. The wrapper's toolbar, search and Add stay where they are.
 * Not for loading (Skeleton) or a failure to load (Alert with Retry); not for a table cell (a dash with the name
 * "None").
 * @tier compound
 * @family feedback
 * @a11y The title is a heading in the page's outline (view and section), read before the reason and the action. The
 * silhouette is `aria-hidden`. With `announce` the title is said once through the polite announcer, for an empty result
 * the person caused; a view that opens empty is read in order instead. After the last item is removed, move focus to
 * the action or the title.
 */
export function EmptyState({ reason, scope = 'section', title, headingLevel, children, actions, silhouette, illustration, announce = false, ...data }: EmptyStateProps) {
  const level = headingLevel ?? (scope === 'view' ? 2 : 3);
  const spoken = typeof title === 'string' ? title : '';

  useEffect(() => {
    if (announce && spoken) say(spoken, 'polite');
  }, [announce, spoken]);

  return (
    <div {...data} data-dl="empty-state" data-reason={reason} data-scope={scope}>
      {illustration && reason !== 'no-access' && scope !== 'component' && (
        <img data-dl-part="illustration" src={illustration.src} width={illustration.width} height={illustration.height} alt="" aria-hidden="true" />
      )}
      {!illustration && silhouette && reason !== 'no-access' && scope !== 'component' && (
        <div data-dl-part="silhouette" data-shape={silhouette} aria-hidden="true">
          {Array.from({ length: rows[silhouette] }, (_, i) => (
            <span key={i} data-dl-part="shape" />
          ))}
        </div>
      )}
      <div data-dl-part="words">
        {scope === 'component' ? (
          <Text as="p">{title}</Text>
        ) : (
          <Heading level={level} size={scope === 'view' ? 3 : 4}>
            {title}
          </Heading>
        )}
        {children && (
          <Text tone="muted" variant={scope === 'component' ? 'body-sm' : 'body'}>
            {children}
          </Text>
        )}
      </div>
      {actions && <div data-dl-part="actions">{actions}</div>}
    </div>
  );
}

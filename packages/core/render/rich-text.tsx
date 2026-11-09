/**
 * Rich inline text in content (DP1): a string, or a list of strings and marked runs, with no markup. One renderer for
 * every block field that accepts it; each field's schema names the marks it takes (`$defs.richText` all of them,
 * `$defs.richHeading` emphasis, accent and break).
 *
 *   "title": ["Make ", { "text": "better things", "mark": "accent" }, ", together"]
 */
import { Fragment, type ReactNode } from 'react';
import { Code, Link, Text } from '../react';
import type { RichText as RichValue } from './types';

/** Draws a rich text value: plain strings as they are, each marked run through the core part for its mark. */
export function richText(value: RichValue | undefined): ReactNode {
  if (value === undefined || typeof value === 'string') return value;
  return value.map((run, n) => {
    if (typeof run === 'string') return <Fragment key={n}>{run}</Fragment>;
    switch (run.mark) {
      case 'emphasis':
        return <em key={n}>{run.text}</em>;
      case 'strong':
        return <strong key={n}>{run.text}</strong>;
      case 'accent':
        return (
          <Text key={n} as="span" variant="inherit" tone="accent">
            {run.text}
          </Text>
        );
      case 'code':
        return <Code key={n}>{run.text}</Code>;
      case 'link':
        return (
          <Link key={n} href={run.href}>
            {run.text}
          </Link>
        );
      case 'break':
        return <br key={n} />;
    }
  });
}

/** The words of a rich text value without its marks, for a name, a title or an alternative. */
export function plainText(value: RichValue | undefined): string {
  if (value === undefined || typeof value === 'string') return value ?? '';
  return value.map((run) => (typeof run === 'string' ? run : run.mark === 'break' ? ' ' : run.text)).join('');
}

/** Rich text as a component, for views: `<RichText value={content.title} />`. */
export function RichText({ value }: { value: RichValue | undefined }) {
  return <>{richText(value)}</>;
}

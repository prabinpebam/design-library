import type { ReactNode } from 'react';

/** One example of a component: what it shows, and its source as the library displays it. */
export interface Story {
  title: string;
  /** One line: when to use this variant or what this state means. */
  description: string;
  /** The example's source, shown under "Show the code". The S4 catalogue extracts it from this file instead. */
  code: string;
  /** How the example's parts sit in the specimen: stacked (default) or in a wrapping row. */
  arrangement?: 'stack' | 'row';
  render: () => ReactNode;
}

export interface StoryFile {
  component: string;
  tier: 'fundamental' | 'compound' | 'layout';
  summary: string;
  stories: Story[];
}

import type { ReactNode } from 'react';
import { Heading } from '../fundamentals/Heading';
import { ScrollArea } from '../fundamentals/ScrollArea';
import { Text } from '../fundamentals/Text';
import type { DataAttributes } from '../types';

export interface ExampleProps extends DataAttributes {
  /** What the example shows, as a short heading. */
  title: string;
  /** One line: when to use this variant or what this state means. */
  description: string;
  /** The live preview. */
  children: ReactNode;
  /** How the preview's parts sit: stacked (default), in a wrapping row, or `fill`: stacked and stretched to the canvas's width (a preview of a full-width part, such as a menu bar). */
  arrangement?: 'stack' | 'row' | 'fill';
  /** The title's heading level, so the example fits the page's outline: 3 by default (under a page's h2 sections). Its look doesn't change. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Colour scheme the preview renders in; set so a picked element records its context. */
  scheme?: 'light' | 'dark';
  /** Contrast the preview renders in. */
  contrast?: 'standard' | 'more';
  /** The example's source, behind "Show the code": a CodeBlock passed in as slot content. */
  source?: ReactNode;
  /** `data-*` attributes for the preview pane, for tooling such as revision anchors. */
  previewData?: DataAttributes;
}

/**
 * A working specimen: a title and one line, the live preview in one outline, and its source behind "Show the code".
 * Not for a screenshot or a static picture of a component, or for a demo with no source to show.
 * @tier compound
 * @family documentation
 * @a11y A `section` named by its title. The preview scrolls sideways in its own region when it is wider than the page.
 * "Show the code" is a native `details` disclosure: Enter or Space opens it, and its state is announced.
 * @key Enter / Space: on "Show the code", shows or hides the source
 */
export function Example({ title, description, children, arrangement = 'stack', headingLevel = 3, scheme, contrast, source, previewData, ...data }: ExampleProps) {
  return (
    <section {...data} data-dl="example" aria-label={title}>
      <div data-dl-part="head">
        <Heading level={headingLevel} size={4}>
          {title}
        </Heading>
        <Text tone="muted">{description}</Text>
      </div>
      <div data-dl-part="canvas">
        <ScrollArea axis="inline" data-scheme={scheme} data-contrast={contrast}>
          <section {...previewData} data-dl-part="preview" data-scheme={scheme} data-contrast={contrast}>
            <div data-dl-part="content" data-arrangement={arrangement}>
              {children}
            </div>
          </section>
        </ScrollArea>
      </div>
      {source && (
        <details data-dl-part="source">
          <summary>Show the code</summary>
          {source}
        </details>
      )}
    </section>
  );
}

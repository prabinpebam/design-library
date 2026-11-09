import { useState } from 'react';
import { Button } from '../fundamentals/Button';
import { ScrollArea } from '../fundamentals/ScrollArea';
import { Text } from '../fundamentals/Text';
import type { DataAttributes } from '../types';

export interface CodeBlockProps extends DataAttributes {
  /** The source, exactly as it should be copied. */
  code: string;
  /** Names the scrollable code region, e.g. "Code: Icons". */
  label: string;
  /** Long lines wrap instead of scrolling sideways: for a narrow panel (a design tool's Dev mode), where reading beats keeping the layout of the source. Copying still gives the source exactly. */
  wrap?: boolean;
}

/**
 * Source code to read and copy: the code scrolls sideways in its own region, and a copy action at its top end confirms
 * on itself ("Code copied") or says, under the code, when the browser won't allow it.
 * Not for a token or a key inside a sentence (use Code).
 * @tier compound
 * @family content
 * @a11y The code region is focusable and named by `label`, so keyboard users can scroll it. The copy action keeps
 * focus while it works and confirms in its own name; a failure is announced in a status line that offers the way out.
 * @key Tab: moves to the code region, then to Copy code
 * @key Arrow keys: scroll the code region while it has focus
 */
export function CodeBlock({ code, label, wrap = false, ...data }: CodeBlockProps) {
  const [failed, setFailed] = useState(false);
  return (
    <div {...data} data-dl="code-block" data-wrap={wrap ? '' : undefined}>
      <div data-dl-part="well">
        <ScrollArea axis="inline" label={label}>
          <pre>
            <code>{code}</code>
          </pre>
        </ScrollArea>
      </div>
      <span data-dl-part="action">
        <Button
          label="Copy code"
          icon="copy"
          iconOnly
          emphasis="quiet"
          pendingLabel="Copying code"
          doneLabel="Code copied"
          onCommit={async () => {
            setFailed(false);
            await navigator.clipboard.writeText(code);
          }}
          onError={() => setFailed(true)}
        />
      </span>
      <div role="status">
        {failed && (
          <Text variant="body-sm" tone="danger">
            This browser didn’t allow copying. Press Copy code again, or select the code and copy it.
          </Text>
        )}
      </div>
    </div>
  );
}

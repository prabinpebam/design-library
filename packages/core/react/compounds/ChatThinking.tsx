import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { announce } from '../behaviour/announce';
import { Icon } from '../fundamentals/Icon';
import { Progress } from '../fundamentals/Progress';
import { Reveal } from '../fundamentals/Reveal';
import { Text } from '../fundamentals/Text';
import type { DataAttributes } from '../types';

export interface ChatThinkingProps extends DataAttributes {
  /** `working` while the assistant thinks or uses a tool; `done` once the reply starts, keeping a short summary. */
  state: 'working' | 'done';
  /** What it's doing now, as a short present-tense phrase ("Thinking", "Searching the web", "Reading 4 sources"), or, when done, what it did ("Thought for 12 seconds"). */
  label: string;
  /** The reasoning or the steps taken, shown when the person opens it. Closed by default. */
  children?: ReactNode;
}

/**
 * The assistant's thinking and tool activity before (and above) a reply: a quiet line with a turning arc and a
 * shimmer while it works, which settles into a summary such as "Thought for 12 seconds"; opening it shows the
 * reasoning or the steps. Not for the reply itself (ChatMessage) or for a long operation with a known total (Progress).
 * @tier compound
 * @family chat
 * @a11y A disclosure button (`aria-expanded`, `aria-controls`) when there is reasoning to open; it says the label and
 * whether it's open. Each new label while working is announced politely, once; the shimmer and the arc are decoration
 * (the words carry the state) and stop under reduced motion.
 * Motion (Q65 C18, K-12): one box from working to done; when it settles, the tick and the summary fade in where the arc
 * and the working words were, and the reasoning opens in place (Reveal). Reasoning that arrives later keeps the box.
 * @key Enter or Space on the line: opens or closes the reasoning
 */
export function ChatThinking({ state, label, children, ...data }: ChatThinkingProps) {
  const said = useRef('');
  const [open, setOpen] = useState(false);
  const [settled, setSettled] = useState(false);
  const steps = useId();
  useEffect(() => setSettled(true), []);
  useEffect(() => {
    if (state === 'working' && label !== said.current) announce(label);
    said.current = label;
  }, [state, label]);

  const line = (
    <>
      {state === 'working' ? <Progress key="mark-working" /> : <Icon key="mark-done" name="check" />}
      <Text key={`label-${state}`} as="span" variant="body-sm" tone="muted" data-dl-part="label">
        {label}
      </Text>
    </>
  );

  return (
    <div {...data} data-dl="chat-thinking" data-state={state} data-open={open ? '' : undefined} data-settled={settled ? '' : undefined}>
      {children ? (
        <button type="button" data-dl-part="line" aria-expanded={open} aria-controls={steps} onClick={() => setOpen((o) => !o)}>
          {line}
          <span data-dl-part="chevron" aria-hidden="true">
            <Icon name="chevron-down" />
          </span>
        </button>
      ) : (
        <span data-dl-part="line">{line}</span>
      )}
      {children && (
        <Reveal open={open}>
          <div id={steps} data-dl-part="steps">
            {children}
          </div>
        </Reveal>
      )}
    </div>
  );
}
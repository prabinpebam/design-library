/**
 * The Design tool's comment mode (Q66, F15.T6): the editor's properties panel becomes the page's comment threads, each
 * pinned to a layer. Choosing a thread's layer selects it on the canvas and in the layers; selecting a layer lists its
 * threads first. A reply joins its thread at once (the new comment is the confirmation); resolving a thread folds it
 * away in place (Reveal) unless resolved threads are shown. Words and threads come from the record. No styles.
 */
import { useState } from 'react';
import { Button, Cluster, Heading, Persona, Reveal, Stack, Switch, Text, TextArea, notify } from '@design-library/core/react';
import { fill } from '@design-library/core/render';
import type { DesignCommentsSpec, DesignShape, DesignThread } from './types';

export function DesignComments({ spec, layerOf, selected, onShow }: { spec: DesignCommentsSpec; layerOf: (id: string) => DesignShape | undefined; selected?: string; onShow: (layer: string) => void }) {
  const s = spec.strings;
  const [threads, setThreads] = useState<DesignThread[]>(spec.threads);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [showResolved, setShowResolved] = useState(false);
  const change = (id: string, fn: (t: DesignThread) => DesignThread) => setThreads((all) => all.map((t) => (t.id === id ? fn(t) : t)));
  const reply = (t: DesignThread) => {
    const text = drafts[t.id]?.trim();
    if (!text) return;
    change(t.id, (x) => ({ ...x, replies: [...x.replies, { author: spec.me, time: s.now, text }] }));
    setDrafts((d) => ({ ...d, [t.id]: '' }));
  };
  const resolve = (t: DesignThread) => {
    change(t.id, (x) => ({ ...x, resolved: !x.resolved }));
    if (!t.resolved) notify({ message: fill(s.resolved, { layer: layerOf(t.layer)?.label ?? '' }) });
  };
  // The selected layer's threads first, then the rest in the record's order.
  const ordered = [...threads].sort((a, b) => Number(b.layer === selected) - Number(a.layer === selected));
  const open = threads.filter((t) => !t.resolved).length;

  return (
    <Stack gap="group">
      <Heading level={2} size={4}>
        {s.heading}
      </Heading>
      <Switch label={s.showResolved} checked={showResolved} onChange={setShowResolved} size="s" />
      {!open && !showResolved && (
        <Text variant="body-sm" tone="muted">
          {s.none}
        </Text>
      )}
      {ordered.map((t) => (
        <Reveal key={t.id} open={!t.resolved || showResolved}>
          <Stack gap="item">
            <Button label={fill(s.onLayer, { layer: layerOf(t.layer)?.label ?? t.layer })} icon="comment" emphasis="quiet" size="s" onClick={() => onShow(t.layer)} />
            {[t, ...t.replies].map((c, n) => (
              <Stack key={n} gap="pair">
                <Persona name={c.author} secondary={c.time} size={24} />
                <Text variant="body-sm">{c.text}</Text>
              </Stack>
            ))}
            {!t.resolved && <TextArea label={s.replyLabel} rows={2} grow value={drafts[t.id] ?? ''} onChange={(v) => setDrafts((d) => ({ ...d, [t.id]: v }))} />}
            <Cluster gap="item">
              {!t.resolved && <Button label={s.reply} emphasis="primary" size="s" onClick={() => reply(t)} />}
              <Button label={t.resolved ? s.reopen : s.resolve} icon={t.resolved ? undefined : 'check'} size="s" onClick={() => resolve(t)} />
            </Cluster>
          </Stack>
        </Reveal>
      ))}
    </Stack>
  );
}

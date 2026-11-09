import { useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import { announce } from '../behaviour/announce';
import { durationOf, useFlipList } from '../behaviour/flip';
import { useExiting } from '../behaviour/presence';
import { cssMs } from '../behaviour/anchor';
import { dismissNotification, notificationsSnapshot, subscribeNotifications, type NotificationItem, type NotificationTone } from '../behaviour/notify';
import { Badge } from '../fundamentals/Badge';
import { Button } from '../fundamentals/Button';
import { Icon } from '../fundamentals/Icon';
import { Morph } from '../fundamentals/Morph';
import { Progress } from '../fundamentals/Progress';
import { Text } from '../fundamentals/Text';
import type { DataAttributes } from '../types';

export interface NotificationsProps extends DataAttributes {
  /** Names the region, e.g. "Notifications". */
  label?: string;
}

const toneIcon: Record<Exclude<NotificationTone, 'progress'>, 'info' | 'success' | 'warning' | 'error'> = { info: 'info', success: 'success', warning: 'warning', error: 'error' };
const toneWord: Record<NotificationTone, string> = { info: 'Information', success: 'Done', warning: 'Warning', error: 'Error', progress: 'In progress' };

function Pill({ item, leaving = false }: { item: NotificationItem; leaving?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const said = useRef<string>('');
  const width = useRef(0);

  // Q65 C15: updated in place, the pill's width eases from the old words' to the new ones' while they cross-fade.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const before = width.current;
    for (const a of el.getAnimations()) if (a.id === 'dl-pill-width') a.cancel();
    const after = el.getBoundingClientRect().width;
    width.current = after;
    const move = durationOf(el, '--duration-move');
    if (!before || !move || Math.abs(before - after) < 1) return;
    const easing = getComputedStyle(el).getPropertyValue('--easing-standard').trim() || 'ease-out';
    el.animate([{ inlineSize: `${before}px`, overflow: 'clip' }, { inlineSize: `${after}px`, overflow: 'clip' }], { duration: move, easing, id: 'dl-pill-width' });
  }, [item.version]);

  // Said once when it becomes visible, and again when its words change; a progress pill's steps aren't said.
  useEffect(() => {
    const key = `${item.version}`;
    if (said.current === key) return;
    const wasProgress = said.current !== '' && item.tone === 'progress';
    said.current = key;
    if (wasProgress) return;
    announce(item.count > 1 ? `${item.message} (${item.count} times)` : item.message, item.tone === 'error' ? 'assertive' : 'polite');
  }, [item.version, item.tone, item.message, item.count]);

  // Auto-dismiss: counted from when it is visible; paused on hover, on focus inside and while the window is hidden.
  useEffect(() => {
    const el = ref.current;
    if (!el || item.dismiss !== 'auto' || item.tone === 'progress') return;
    const message = el.querySelector<HTMLElement>('[data-dl-part="message"]');
    const lines = message ? message.getBoundingClientRect().height / parseFloat(getComputedStyle(message).lineHeight || '1') : 1;
    let left = cssMs(el, lines > 1.5 ? '--duration-notice-long' : '--duration-notice');
    let started = 0;
    let timer = 0;
    const held = { hover: false, focus: false };
    const run = () => {
      if (held.hover || held.focus || document.hidden || timer) return;
      started = performance.now();
      timer = window.setTimeout(() => dismissNotification(item.id), left);
    };
    const pause = () => {
      if (!timer) return;
      window.clearTimeout(timer);
      timer = 0;
      left = Math.max(0, left - (performance.now() - started));
    };
    const on = (key: keyof typeof held, value: boolean) => () => {
      held[key] = value;
      if (value) pause();
      else run();
    };
    const enter = on('hover', true);
    const leave = on('hover', false);
    const focusIn = on('focus', true);
    const focusOut = (e: FocusEvent) => {
      if (!el.contains(e.relatedTarget as Node)) on('focus', false)();
    };
    const visibility = () => (document.hidden ? pause() : run());
    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointerleave', leave);
    el.addEventListener('focusin', focusIn);
    el.addEventListener('focusout', focusOut);
    document.addEventListener('visibilitychange', visibility);
    run();
    return () => {
      window.clearTimeout(timer);
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointerleave', leave);
      el.removeEventListener('focusin', focusIn);
      el.removeEventListener('focusout', focusOut);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [item.id, item.version, item.dismiss, item.tone]);

  return (
    <div
      ref={ref}
      data-dl-part="pill"
      data-material="floating"
      data-elevation="3"
      data-flip-key={item.id}
      data-tone={item.tone}
      data-leaving={leaving ? '' : undefined}
      inert={leaving}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          dismissNotification(item.id);
        }
      }}
    >
      <span data-dl-part="status">
        <Morph state={item.tone} size="hold">
          {item.tone === 'progress' ? <Progress label={toneWord.progress} /> : <Icon name={toneIcon[item.tone]} label={toneWord[item.tone]} />}
        </Morph>
      </span>
      <div data-dl-part="message">
        <Morph state={`${item.tone}:${item.message}`}>{item.message}</Morph>
      </div>
      {item.count > 1 && <Badge kind="count" count={item.count} label={`${item.count} times`} />}
      {item.action && (
        <Button
          label={item.action.label}
          emphasis="quiet"
          size="s"
          onClick={() => {
            item.action!.onAction();
            dismissNotification(item.id);
          }}
        />
      )}
      {item.dismiss === 'manual' && <Button label="Close notification" icon="close" iconOnly emphasis="quiet" size="s" onClick={() => dismissNotification(item.id)} />}
    </div>
  );
}

/**
 * The one place for outcomes the person can't see where they are: background work finished or failed, a change that
 * left the view with Undo, a partial success. Place it once at the app's root; anything calls `notify()`. Pills sit at
 * the bottom, centred, newest nearest the edge, at most three, the rest counted as waiting.
 * Not for a field's save (its own tick), a validation error (on the field), a failure of the view in front of the
 * person (that scope's Alert) or a question (a Dialog).
 * @tier compound
 * @family overlays
 * @a11y A named region in the top layer (above an open modal dialog) that never takes focus. Each pill is said once
 * through the page's live announcer when it becomes visible: polite, or assertive for errors; a progress pill's steps
 * aren't said, only its start and its end. Its icon has a word, its action and Close have names, Escape closes the
 * focused pill and Tab reaches its buttons. Auto-dismiss pauses on hover, on focus and while the window is hidden.
 */
export function Notifications({ label = 'Notifications', ...data }: NotificationsProps) {
  const { visible, waiting } = useSyncExternalStore(subscribeNotifications, notificationsSnapshot, notificationsSnapshot);
  const newest = visible.length ? Math.max(...visible.map((v) => v.at)) : 0;
  // Q65 C15: a dismissed pill fades out where it is before it goes; the region stays open until it has.
  const pills = useExiting(visible, (v) => v.id);
  // The other pills shift into place when one arrives, leaves or changes height (C15, S5), several as one change.
  const ref = useFlipList<HTMLElement>(pills.map(({ item, leaving }) => `${item.id}:${item.version}${leaving ? ':leaving' : ''}`).join('|'), { travel: 'block' });

  // In the top layer while there is something to show; shown again for a new pill so it sits above a dialog opened since.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !el.showPopover) return;
    if (el.matches(':popover-open')) el.hidePopover();
    if (pills.length) el.showPopover();
  }, [pills.length > 0, newest]);

  return (
    <section {...data} ref={ref} data-dl="notifications" aria-label={label} popover="manual">
      {waiting > 0 && (
        <Text as="span" variant="body-sm" tone="muted">
          {waiting} more waiting
        </Text>
      )}
      {pills.map(({ item, leaving }) => (
        <Pill key={item.id} item={item} leaving={leaving} />
      ))}
    </section>
  );
}

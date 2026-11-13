import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { durationToken, useCommit } from '../behaviour/commit';
import { Button } from './Button';
import { Text } from './Text';
import type { DataAttributes } from '../types';

export interface FocalPointValue { x: number; y: number }

export interface FocalPointProps extends DataAttributes {
  /** The uncropped picture. */
  src: string;
  /** The picture's alternative text. */
  alt: string;
  /** Names the control, visibly and accessibly. */
  label: string;
  /** Instructions for pointer and keyboard users. */
  hint: string;
  /** Compact bounds the preview height; fill uses the available width at the picture's natural aspect. */
  preview?: 'compact' | 'fill';
  /** The point as fractions from the picture's physical left and top edges. */
  value: FocalPointValue;
  /** Preview updates; save in onChangeEnd. */
  onChange: (value: FocalPointValue) => void;
  /** Once per pointer gesture or keyboard pause/blur; may reject to retain input and offer Retry. */
  onChangeEnd?: (value: FocalPointValue) => void | Promise<void>;
  /** Localised coordinate description, e.g. "50% across, 50% down". */
  format: (value: FocalPointValue) => string;
  /** Localised saving, saved, retry and failed-image messages. */
  messages: { saving: string; saved: string; retry: string; imageFailed: string };
  disabled?: boolean;
}

const clamp = (n: number) => Math.min(1, Math.max(0, n));

/**
 * One movable dot on an uncropped picture sets the part every crop should keep. Not a crop rectangle or an image editor.
 * @tier fundamental
 * @family inputs
 * @a11y One named slider; its numeric value is the horizontal percentage, with both axes in aria-valuetext.
 * The whole picture is the pointer target. Physical left/top coordinates do not mirror in RTL.
 * @key Arrows: move five percent; Shift + arrows: one percent. Home: centre. Pause or blur: commit.
 */
export function FocalPoint({ src, alt, label, hint, preview = 'compact', value, onChange, onChangeEnd, format, messages, disabled = false, ...data }: FocalPointProps) {
  const id = useId();
  const [point, setPoint] = useState(value);
  const [loaded, setLoaded] = useState('');
  const [failed, setFailed] = useState('');
  const [problem, setProblem] = useState('');
  const latest = useRef(value);
  const origin = useRef<FocalPointValue | null>(null);
  const changed = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { phase, run } = useCommit('--duration-confirm-read');
  const locked = disabled || loaded !== src || failed === src || phase === 'on';
  useEffect(() => { latest.current = value; setPoint(value); }, [value.x, value.y]);
  useEffect(() => () => clearTimeout(timer.current), []);
  const update = (next: FocalPointValue) => {
    latest.current = next; setPoint(next); changed.current = true; onChange(next);
  };
  const commit = () => {
    clearTimeout(timer.current);
    if (!changed.current || locked) return;
    changed.current = false;
    const next = latest.current;
    setProblem('');
    void run(() => onChangeEnd?.(next)).then(result => {
      if (!result.ok) {
        changed.current = true;
        setProblem(result.error instanceof Error ? result.error.message : messages.retry);
      }
    });
  };
  const atPointer = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: clamp((event.clientX - rect.left) / rect.width), y: clamp((event.clientY - rect.top) / rect.height) };
  };
  const key = (event: KeyboardEvent<HTMLDivElement>) => {
    if (locked) return;
    const step = event.shiftKey ? 0.01 : 0.05;
    const now = latest.current;
    const next = event.key === 'Home' ? { x: 0.5, y: 0.5 }
      : event.key === 'ArrowLeft' ? { ...now, x: clamp(now.x - step) }
      : event.key === 'ArrowRight' ? { ...now, x: clamp(now.x + step) }
      : event.key === 'ArrowUp' ? { ...now, y: clamp(now.y - step) }
      : event.key === 'ArrowDown' ? { ...now, y: clamp(now.y + step) } : null;
    if (!next) return;
    event.preventDefault();
    update(next); clearTimeout(timer.current);
    timer.current = setTimeout(commit, durationToken('--duration-commit-pause', event.currentTarget));
  };
  return <div {...data} data-dl="focal-point" data-preview={preview} data-commit={phase}>
    <Text id={`${id}-label`} weight="strong">{label}</Text>
    <div data-dl-part="picture" role="slider" tabIndex={0} aria-labelledby={`${id}-label`}
      aria-describedby={`${id}-hint`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(point.x * 100)}
      aria-valuetext={format(point)} aria-disabled={locked || undefined} aria-busy={phase === 'on' || undefined}
      onKeyDown={key} onBlur={commit}
      onPointerDown={event => {
        if (locked || event.button !== 0) return;
        event.preventDefault(); clearTimeout(timer.current); event.currentTarget.focus();
        event.currentTarget.setPointerCapture(event.pointerId); origin.current = latest.current;
        update(atPointer(event));
      }}
      onPointerMove={event => { if (!locked && origin.current) update(atPointer(event)); }}
      onPointerUp={event => {
        if (!origin.current) return;
        update(atPointer(event)); origin.current = null; commit();
        event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => {
        if (origin.current) { const before = origin.current; origin.current = null; update(before); changed.current = false; }
      }}>
      <img src={src} alt={alt} draggable={false} onLoad={() => { setLoaded(src); setFailed(''); }} onError={() => setFailed(src)} />
      {loaded === src && failed !== src && <span data-dl-part="point" aria-hidden="true"
        style={{ '--dl-focal-x': `${point.x * 100}%`, '--dl-focal-y': `${point.y * 100}%` } as CSSProperties} />}
    </div>
    <Text id={`${id}-hint`} variant="body-sm" tone="muted">{hint}</Text>
    <Text variant="caption" aria-live="polite">{phase === 'on' ? messages.saving : phase === 'done' ? messages.saved : format(point)}</Text>
    {failed === src && <Text tone="danger">{messages.imageFailed}</Text>}
    {problem && <><div role="alert"><Text tone="danger">{problem}</Text></div><Button label={messages.retry} onClick={commit} /></>}
  </div>;
}

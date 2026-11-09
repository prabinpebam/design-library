import { useEffect, useId, useRef, type MouseEvent } from 'react';
import { Alert } from './Alert';
import type { DataAttributes } from '../types';

export interface ErrorSummaryItem {
  /**
   * The field the error belongs to: its control's `id`, or the `data-error-target` value set on the field (for
   * components that make their own ids, e.g. `<TextField data-error-target="email" … />`).
   */
  target: string;
  /** The same words as the field's own error message, e.g. "Enter an email address like name@example.com". */
  message: string;
}

export interface ErrorSummaryProps extends DataAttributes {
  /** Every error in the form, in the order the fields come. Nothing renders while it is empty. */
  errors: ErrorSummaryItem[];
  /** Defaults to "There is a problem". */
  title?: string;
  /** The title's level in the page's outline. Defaults to 2. */
  headingLevel?: 2 | 3 | 4;
  /**
   * Takes focus when it appears or its errors change, so the person learns at once that the form didn't go through
   * and where to go. Defaults to true; set false only when the summary is there as the page opens.
   */
  focusOnShow?: boolean;
}

function findControl(target: string): HTMLElement | null {
  const el = document.getElementById(target) ?? document.querySelector<HTMLElement>(`[data-error-target="${CSS.escape(target)}"]`);
  if (!el) return null;
  if (el.matches('input, select, textarea, button, [tabindex]')) return el;
  return el.querySelector<HTMLElement>('input:not([type="hidden"]), select, textarea, [role="combobox"], [role="radio"][tabindex="0"], [role="slider"], button') ?? el;
}

/**
 * The list of a form's errors at its top after a failed submit: "There is a problem", then one link per error that
 * takes the person to its field. Built on Alert's error tone in the section placement.
 * Not for one error near its field (Field's message does that) or for a failure of saving (an Alert with Retry).
 * @tier compound
 * @family feedback
 * @a11y Takes focus when it appears, so a screen reader reads the title and the list at once (no live region, so it
 * is never said twice). Each link moves focus to its field's control and scrolls its label into view; the page's
 * address doesn't change. Each message repeats the field's own error, which the field still shows.
 */
export function ErrorSummary({ errors, title = 'There is a problem', headingLevel = 2, focusOnShow = true, ...data }: ErrorSummaryProps) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const key = errors.map((e) => `${e.target}:${e.message}`).join('|');

  useEffect(() => {
    if (focusOnShow && key) ref.current?.focus();
  }, [focusOnShow, key]);

  if (!errors.length) return null;

  const go = (e: MouseEvent<HTMLElement>) => {
    const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-error-link]');
    if (!link) return;
    e.preventDefault();
    const control = findControl(link.dataset.errorLink!);
    if (!control) return;
    control.focus({ preventScroll: true });
    (control.closest<HTMLElement>('[data-dl="field"], fieldset, [data-dl="text-field"]') ?? control).scrollIntoView({ block: 'nearest' });
  };

  return (
    <div {...data} ref={ref} data-dl="error-summary" tabIndex={-1} aria-labelledby={titleId} onClick={go}>
      <Alert placement="section" tone="error" headingLevel={headingLevel} title={<span id={titleId}>{title}</span>}>
        <ul data-dl-part="list">
          {errors.map((err) => (
            <li key={`${err.target}:${err.message}`}>
              <a href={`#${err.target}`} data-dl="link" data-error-link={err.target}>
                {err.message}
              </a>
            </li>
          ))}
        </ul>
      </Alert>
    </div>
  );
}

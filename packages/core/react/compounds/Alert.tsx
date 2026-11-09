import type { ReactNode } from 'react';
import { Button } from '../fundamentals/Button';
import { Icon } from '../fundamentals/Icon';
import type { IconName } from '../../icons/icons';
import type { DataAttributes } from '../types';

export type AlertTone = 'neutral' | 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends DataAttributes {
  /** What kind of message it is; colour, icon and the spoken word all follow it. Defaults to `info`. */
  tone?: AlertTone;
  /**
   * Where it sits: `inline` beside what it concerns (words and actions on one line when there is room), `section` at
   * the top of a section or form (actions under the words), `page` a full-width banner at the top of the page or app.
   */
  placement?: 'inline' | 'section' | 'page';
  /** One short line: what happened or what to know, e.g. "Couldn’t save the address". */
  title?: ReactNode;
  /** Gives the title a heading level from the page's outline (page banners and section alerts that head a region). */
  headingLevel?: 2 | 3 | 4;
  /** Why, what was kept and what to do. */
  children?: ReactNode;
  /** One or two Buttons or Links: the recovery first (Retry, Review), then the rest. */
  actions?: ReactNode;
  /** Shows Close. Leave it out for a message that must stay while its cause does (an outage, a blocked form). */
  onClose?: () => void;
  /** Names Close. Defaults to "Close message". */
  closeLabel?: string;
  /** A different icon for the tone's own, or `false` for none (a neutral note never has one by default). */
  icon?: IconName | false;
  /**
   * Said when it appears after something the person did: `polite` waits for a pause (`role="status"`), `assertive`
   * interrupts (`role="alert"`, only for a failure the person must know now). Leave it out for a message that is there
   * when the page opens: it is read in order, never announced.
   */
  announce?: 'polite' | 'assertive';
}

const toneIcon: Record<AlertTone, IconName | undefined> = { neutral: undefined, info: 'info', success: 'success', warning: 'warning', error: 'error' };
const toneWord: Record<AlertTone, string> = { neutral: 'Note', info: 'Information', success: 'Done', warning: 'Warning', error: 'Error' };

/**
 * A message that stays in the content until its cause goes: a section's error with Retry, a warning before a costly
 * step, a success at the end of a journey, an outage banner, a note on a passage. One tinted surface, the tone's icon
 * with its word, a title, the description, actions and an optional Close.
 * Not for an outcome away from where the person is (use `notify()`), a field's error (Field's message), the list of a
 * form's errors (ErrorSummary) or a question that must be answered (an alert Dialog).
 * @tier compound
 * @family feedback
 * @a11y The icon carries the tone's word ("Error", "Warning") so meaning is never colour alone. Silent by default; with
 * `announce` it is a `status` or `alert` live region, mounted with its words so they are said once. Close has a name;
 * when it closes, move focus to what the message was about. The tint is dropped for a full outline in forced colours.
 */
export function Alert({ tone = 'info', placement = 'inline', title, headingLevel, children, actions, onClose, closeLabel = 'Close message', icon, announce, ...data }: AlertProps) {
  const iconName = icon === false ? undefined : (icon ?? toneIcon[tone]);
  const role = announce === 'assertive' ? 'alert' : announce === 'polite' ? 'status' : undefined;
  const TitleTag = headingLevel ? (`h${headingLevel}` as const) : 'p';

  return (
    <div {...data} data-dl="alert" data-tone={tone} data-placement={placement} role={role}>
      <div data-dl-part="inner">
        {iconName && (
          <span data-dl-part="status">
            <Icon name={iconName} label={toneWord[tone]} />
          </span>
        )}
        <div data-dl-part="body">
          <div data-dl-part="words">
            {title && <TitleTag data-dl-part="title">{title}</TitleTag>}
            {children && <div data-dl-part="description">{children}</div>}
          </div>
          {actions && <div data-dl-part="actions">{actions}</div>}
        </div>
        {onClose && <Button label={closeLabel} icon="close" iconOnly emphasis="quiet" size="s" onClick={onClose} data-dl-part="close" />}
      </div>
    </div>
  );
}

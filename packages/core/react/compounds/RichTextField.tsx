import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { richFieldHtml, richFieldMarkdown, richGroups, richShortcut, safeRichHref, type RichOperation } from '../behaviour/rich-field';
import { useCommit } from '../behaviour/commit';
import { Button } from '../fundamentals/Button';
import { Field } from '../fundamentals/Field';
import { Text } from '../fundamentals/Text';
import type { DataAttributes } from '../types';

export interface RichTextFieldProps extends DataAttributes {
  /** Visible field name. */
  label: string;
  /** Accessible toolbar name. */
  toolsLabel: string;
  /** Markdown: paragraphs, nested lists, bold, italic, strike, code and safe links; never raw HTML. */
  value: string;
  /** The current Markdown while editing. */
  onChange?: (markdown: string) => void;
  /** Saves on leaving the whole field. A rejected promise keeps the draft with Retry. */
  onCommit: (markdown: string) => unknown;
  /** The page's link dialog: empty removes a link, null cancels; preserve the selected words until it resolves. */
  askLink: (href: string) => Promise<string | null>;
  /** Localised button names, including their shortcuts. */
  tools: Record<Exclude<RichOperation, 'heading' | 'quote'>, string> & Partial<Record<'heading' | 'quote', string>>;
  /** Opt-in page editing: a same-origin renderer's text root. Ordinary field markup is unchanged when absent. */
  target?: HTMLElement;
  /** Ends target editing after saving or Escape; failed saves keep the editor and Retry. */
  onClose?: () => void;
  /** The page's first Markdown heading level (matches RichBlocks). Default 1. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Explicit toolbar operations; the ordinary field keeps its existing three groups by default. */
  operations?: readonly RichOperation[];
  /** Localised status and recovery copy. */
  words: { saving: string; saved: string; failed: string; retry: string; tooLong: string; invalidLink: string };
  hint?: string;
  optional?: boolean;
  /** A soft Markdown-length limit: excess input is kept and shown as an error, never discarded. */
  maxLength?: number;
  name?: string;
  readOnly?: boolean;
  disabled?: boolean;
}

const commands: Partial<Record<RichOperation, string>> = {
  bold: 'bold', italic: 'italic', strikethrough: 'strikeThrough', bulleted: 'insertUnorderedList', numbered: 'insertOrderedList',
};
const toggles = new Set<RichOperation>(['bold', 'italic', 'strikethrough', 'bulleted', 'numbered']);

/**
 * Words edited as they read, with a formatting toolbar, safe-subset paste and Markdown storage. Not a source-code editor.
 * @tier compound
 * @family inputs
 * @a11y Labelled multiline textbox; named toolbar, pressed marks, named shortcuts, list-only indent/outdent.
 * Toolbar pointer presses retain the selection; the page owns the link dialog. Failed saves retain editable input.
 * @key Ctrl/Meta+B, I, Shift+X, E, K: bold, italic, strikethrough, code, link
 * @key Ctrl/Meta+Shift+8, Shift+7: bulleted, numbered list
 * @key Ctrl/Meta+], [: indent, outdent within lists only
 * @key Tab: toolbar buttons, textbox, then the next field; leaving the whole field commits
 */
export function RichTextField({ label, toolsLabel, value, onChange, onCommit, askLink, tools, words, hint, optional = false, maxLength, name, readOnly = false, disabled = false, target, onClose, headingLevel = 1, operations, ...data }: RichTextFieldProps) {
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLElement>(null);
  const selection = useRef<Range | null>(null);
  const saved = useRef(value);
  const latest = useRef(value);
  const busy = useRef(false);
  const linking = useRef(false);
  const again = useRef(false);
  const closing = useRef(false);
  const commitRef = useRef<() => void>(() => undefined);
  const [draft, setDraft] = useState(value);
  const [problem, setProblem] = useState('');
  const [pressed, setPressed] = useState<Partial<Record<RichOperation, boolean>>>({});
  const [inList, setInList] = useState(false);
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
  const [showTools, setShowTools] = useState(false);
  const { phase, run } = useCommit('--duration-confirm-read');
  const locked = disabled || readOnly;
  const doc = target?.ownerDocument ?? document;
  useEffect(() => {
    if (input.current && (latest.current === saved.current || value === latest.current)) {
      if (latest.current !== value || !input.current.hasChildNodes()) input.current.innerHTML = richFieldHtml(value, headingLevel);
      latest.current = value; setDraft(value);
    }
    saved.current = value;
  }, [value]);
  const reflect = () => {
    const s = doc.getSelection();
    const range = s?.rangeCount ? s.getRangeAt(0) : null;
    if (!range || !input.current?.contains(range.commonAncestorContainer)) {
      if (!linking.current && !root.current?.contains(doc.activeElement)) setShowTools(false);
      return;
    }
    selection.current = range.cloneRange();
    const element = range.commonAncestorContainer.nodeType === 1 ? range.commonAncestorContainer as Element : range.commonAncestorContainer.parentElement;
    setInList(!!element?.closest('li'));
    setPressed({ ...Object.fromEntries(Object.entries(commands).map(([op, command]) => [op, doc.queryCommandState(command)])),
      heading: !!element?.closest('h1,h2,h3,h4,h5,h6'), quote: !!element?.closest('blockquote') });
    if (target) {
      const rect = range.getBoundingClientRect();
      setShowTools(!range.collapsed);
      if (!range.collapsed) setPoint({ x: rect.left + rect.width / 2, y: rect.top });
    }
  };
  useEffect(() => {
    doc.addEventListener('selectionchange', reflect);
    doc.defaultView?.addEventListener('scroll', reflect, true);
    doc.defaultView?.addEventListener('resize', reflect);
    return () => {
      doc.removeEventListener('selectionchange', reflect);
      doc.defaultView?.removeEventListener('scroll', reflect, true);
      doc.defaultView?.removeEventListener('resize', reflect);
    };
  }, [doc, target]);
  const changed = () => {
    if (!input.current) return;
    latest.current = richFieldMarkdown(input.current, headingLevel); setDraft(latest.current); setProblem('');
    onChange?.(latest.current); reflect();
  };
  const commit = () => {
    if (locked || linking.current) return;
    if (latest.current === saved.current) { if (closing.current) onClose?.(); return; }
    if (busy.current) { again.current = true; return; }
    if (maxLength !== undefined && [...latest.current].length > maxLength) { setProblem(words.tooLong); return; }
    const next = latest.current;
    busy.current = true; setProblem('');
    void run(() => onCommit(next), () => { saved.current = next; }).then(result => {
      busy.current = false;
      if (!result.ok) setProblem(result.error instanceof Error ? result.error.message : words.failed);
      else if (closing.current) onClose?.();
      if (again.current) { again.current = false; if (result.ok) commitRef.current(); }
    });
  };
  commitRef.current = commit;
  const restore = () => {
    const editor = input.current;
    if (!editor) return null;
    editor.focus({ preventScroll: true });
    const s = doc.getSelection();
    let range = selection.current;
    if (!range || !editor.contains(range.commonAncestorContainer)) {
      range = doc.createRange(); range.selectNodeContents(editor); range.collapse(false);
    }
    s?.removeAllRanges(); s?.addRange(range);
    return range;
  };
  const operate = async (op: RichOperation) => {
    if (locked) return;
    const range = restore();
    if (!range) return;
    const element = range.commonAncestorContainer.nodeType === 1 ? range.commonAncestorContainer as Element : range.commonAncestorContainer.parentElement;
    const command = commands[op];
    if (command) doc.execCommand(command);
    else if (op === 'heading' || op === 'quote') {
      const existing = element?.closest(op === 'heading' ? 'h1,h2,h3,h4,h5,h6' : 'blockquote');
      doc.execCommand('formatBlock', false, existing ? 'p' : op === 'heading' ? `h${headingLevel}` : 'blockquote');
    }
    else if (op === 'indent' || op === 'outdent') {
      if (element?.closest('li')) doc.execCommand(op);
    } else if (op === 'code') {
      const code = element?.closest('code');
      if (code) code.replaceWith(doc.createTextNode(code.textContent ?? ''));
      else if (!range.collapsed) {
        const code = doc.createElement('code'); code.textContent = range.toString();
        range.deleteContents(); range.insertNode(code); range.selectNodeContents(code);
        doc.getSelection()?.removeAllRanges(); doc.getSelection()?.addRange(range);
      }
    } else if (op === 'link') {
      selection.current = range.cloneRange(); linking.current = true;
      try {
        const href = await askLink(element?.closest('a')?.getAttribute('href') ?? '');
        restore();
        if (href !== null) {
          if (href && !safeRichHref(href)) throw new Error(words.invalidLink);
          if (href) doc.execCommand('createLink', false, href);
          else doc.execCommand('unlink');
          changed();
        }
      } catch (error) { setProblem(error instanceof Error ? error.message : words.failed); }
      finally { linking.current = false; }
      return;
    }
    changed();
  };
  const handlers = useRef({ changed, operate, commit });
  handlers.current = { changed, operate, commit };
  useLayoutEffect(() => {
    if (!target || !root.current || !point) return;
    const bar = root.current, win = doc.defaultView;
    if (!win) return;
    const gap = parseFloat(win.getComputedStyle(bar).getPropertyValue('--space-inline-pair')) || 0;
    bar.style.left = `${Math.max(gap, Math.min(point.x - bar.offsetWidth / 2, win.innerWidth - bar.offsetWidth - gap))}px`;
    bar.style.top = `${Math.max(gap, point.y - bar.offsetHeight - gap)}px`;
  }, [target, point, problem, doc]);
  useEffect(() => {
    if (!target) return;
    input.current = target;
    const original = [...target.childNodes];
    const attributes = ['contenteditable', 'role', 'aria-label', 'aria-multiline', 'data-rich-editing'];
    const before = attributes.map(key => target.getAttribute(key));
    target.innerHTML = richFieldHtml(value, headingLevel);
    target.contentEditable = locked ? 'false' : 'true';
    target.setAttribute('role', 'textbox'); target.setAttribute('aria-label', label);
    target.setAttribute('aria-multiline', 'true'); target.setAttribute('data-rich-editing', '');
    target.focus({ preventScroll: true });
    const changed = () => handlers.current.changed();
    const key = (event: KeyboardEvent) => {
      event.stopPropagation();
      if (event.isComposing || locked) return;
      if (event.key === 'Escape') { event.preventDefault(); onClose?.(); return; }
      const op = richShortcut(event);
      if (op) { event.preventDefault(); void handlers.current.operate(op); }
    };
    const paste = (event: ClipboardEvent) => {
      if (locked) return;
      event.preventDefault();
      const html = event.clipboardData?.getData('text/html'), text = event.clipboardData?.getData('text/plain') ?? '';
      const parsed = doc.createElement('div'); parsed.innerHTML = html ?? '';
      doc.execCommand('insertHTML', false, richFieldHtml(html ? richFieldMarkdown(parsed, headingLevel) : text, headingLevel));
      changed();
    };
    const blur = (event: FocusEvent) => {
      if (linking.current || (event.relatedTarget && root.current?.contains(event.relatedTarget as Node))) return;
      closing.current = true; handlers.current.commit();
    };
    const toolbar = root.current;
    const keepSelection = (event: MouseEvent) => {
      const button = (event.target as Element).closest('button');
      if (button && toolbar?.contains(button)) event.preventDefault();
    };
    const action = (event: MouseEvent) => {
      const button = (event.target as Element).closest<HTMLButtonElement>('button');
      if (button?.hasAttribute('data-rich-retry')) { handlers.current.commit(); return; }
      const op = button?.dataset.richOp;
      const allowed = operations ?? richGroups.flat();
      const operation = allowed.find(one => one === op);
      if (button && !button.disabled && operation) void handlers.current.operate(operation);
    };
    // The target document may have a separate React root; its native events belong to that document.
    toolbar?.addEventListener('mousedown', keepSelection);
    toolbar?.addEventListener('click', action);
    target.addEventListener('input', changed); target.addEventListener('keydown', key);
    target.addEventListener('paste', paste); target.addEventListener('blur', blur);
    return () => {
      target.removeEventListener('input', changed); target.removeEventListener('keydown', key);
      target.removeEventListener('paste', paste); target.removeEventListener('blur', blur);
      toolbar?.removeEventListener('mousedown', keepSelection);
      toolbar?.removeEventListener('click', action);
      target.replaceChildren(...original);
      attributes.forEach((key, n) => before[n] === null ? target.removeAttribute(key) : target.setAttribute(key, before[n]!));
      input.current = null;
    };
  }, [target]);
  if (operations?.some(op => !tools[op])) throw new Error('RichTextField: every requested operation needs a localised tool label.');
  if (target) return createPortal(<div {...data} ref={root} data-dl="rich-text-field" data-in-place="" data-commit={phase} data-density="compact"
    data-material="floating" data-elevation="3" hidden={!showTools && !problem && phase === 'rest'}
    style={{ left: point?.x ?? 0, top: point?.y ?? 0 }}
    onMouseDown={event => { if ((event.target as Element).closest('button')) event.preventDefault(); }}>
    <div data-dl-part="tools" role="toolbar" aria-label={toolsLabel} hidden={!showTools}>
      {(operations ?? richGroups.flat()).map(op =>
        /* binary-setting: formatting acts on the selected words, not a standalone setting. */
        <Button key={op} label={tools[op]!} icon={op === 'heading' || op === 'quote' ? undefined : op}
          iconOnly={op !== 'heading' && op !== 'quote'} emphasis="quiet" size="xs"
          disabled={locked}
          pressed={toggles.has(op) || op === 'heading' || op === 'quote' ? !!pressed[op] : undefined}
          data-rich-op={op} />)}
    </div>
    <Text variant="caption" aria-live="polite">{problem || (phase === 'on' ? words.saving : phase === 'done' ? words.saved : '')}</Text>
    {problem && <Button label={words.retry} emphasis="quiet" size="s" data-rich-retry="" />}
  </div>, doc.body);
  return <div {...data} ref={root} data-dl="rich-text-field" data-commit={phase}>
    <Field label={label} hint={hint} necessity={optional ? 'optional' : undefined}
      error={problem || undefined}
      after={<>
        <Text variant="caption" aria-live="polite">{phase === 'on' ? words.saving : phase === 'done' ? words.saved : ''}</Text>
        {problem && <Button label={words.retry} emphasis="quiet" size="s" onClick={commit} />}
      </>}>
      {control => <div data-dl-part="content" onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) commit();
      }}>
        <div data-dl-part="tools" role="toolbar" aria-label={toolsLabel} aria-controls={control.id}
          onMouseDown={event => { if ((event.target as Element).closest('button')) event.preventDefault(); }}>
          {richGroups.map((group, index) => <span key={index} data-dl-part="group">
            {group.map(op =>
              /* binary-setting: these are selection-formatting marks inside a compact toolbar, not standalone settings. */
              <Button key={op} label={tools[op]!} icon={op === 'heading' || op === 'quote' ? undefined : op} iconOnly emphasis="quiet" size="xs" pressed={toggles.has(op) ? !!pressed[op] : undefined}
                disabled={locked || ((op === 'indent' || op === 'outdent') && !inList)}
                data-rich-op={op} onClick={() => { void operate(op); }} />)}
          </span>)}
        </div>
        <div ref={node => { input.current = node; }} id={control.id} data-dl-part="input" contentEditable={!locked} suppressContentEditableWarning
          role="textbox" aria-multiline="true" aria-labelledby={`${control.id}-label`} aria-describedby={control['aria-describedby']}
          aria-invalid={control['aria-invalid']} aria-readonly={readOnly || undefined} aria-disabled={disabled || undefined}
          aria-busy={phase === 'on' || undefined} tabIndex={disabled ? -1 : 0}
          onInput={changed} onKeyDown={event => {
            if (locked || event.nativeEvent.isComposing) return;
            const op = richShortcut(event);
            if (op) { event.preventDefault(); void operate(op); }
            else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'u') event.preventDefault();
          }} onPaste={event => {
            if (locked) return;
            event.preventDefault();
            const html = event.clipboardData.getData('text/html'), text = event.clipboardData.getData('text/plain');
            const md = html ? richFieldMarkdown(new DOMParser().parseFromString(html, 'text/html').body, headingLevel) : text;
            document.execCommand('insertHTML', false, richFieldHtml(md, headingLevel)); changed();
          }} />
      </div>}
    </Field>
    {name && <input type="hidden" name={name} value={draft} />}
  </div>;
}

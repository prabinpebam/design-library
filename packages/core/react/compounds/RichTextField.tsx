import { useEffect, useRef, useState } from 'react';
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
  tools: Record<RichOperation, string>;
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
export function RichTextField({ label, toolsLabel, value, onChange, onCommit, askLink, tools, words, hint, optional = false, maxLength, name, readOnly = false, disabled = false, ...data }: RichTextFieldProps) {
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLDivElement>(null);
  const selection = useRef<Range | null>(null);
  const saved = useRef(value);
  const latest = useRef(value);
  const busy = useRef(false);
  const linking = useRef(false);
  const again = useRef(false);
  const commitRef = useRef<() => void>(() => undefined);
  const [draft, setDraft] = useState(value);
  const [problem, setProblem] = useState('');
  const [pressed, setPressed] = useState<Partial<Record<RichOperation, boolean>>>({});
  const [inList, setInList] = useState(false);
  const { phase, run } = useCommit('--duration-confirm-read');
  const locked = disabled || readOnly;
  useEffect(() => {
    if (input.current && (latest.current === saved.current || value === latest.current)) {
      if (latest.current !== value || !input.current.hasChildNodes()) input.current.innerHTML = richFieldHtml(value);
      latest.current = value; setDraft(value);
    }
    saved.current = value;
  }, [value]);
  const reflect = () => {
    const s = document.getSelection();
    const range = s?.rangeCount ? s.getRangeAt(0) : null;
    if (!range || !input.current?.contains(range.commonAncestorContainer)) return;
    selection.current = range.cloneRange();
    const element = range.commonAncestorContainer.nodeType === 1 ? range.commonAncestorContainer as Element : range.commonAncestorContainer.parentElement;
    setInList(!!element?.closest('li'));
    setPressed(Object.fromEntries(Object.entries(commands).map(([op, command]) => [op, document.queryCommandState(command)])));
  };
  useEffect(() => {
    document.addEventListener('selectionchange', reflect);
    return () => document.removeEventListener('selectionchange', reflect);
  }, []);
  const changed = () => {
    if (!input.current) return;
    latest.current = richFieldMarkdown(input.current); setDraft(latest.current); setProblem('');
    onChange?.(latest.current); reflect();
  };
  const commit = () => {
    if (locked || linking.current || latest.current === saved.current) return;
    if (busy.current) { again.current = true; return; }
    if (maxLength !== undefined && [...latest.current].length > maxLength) { setProblem(words.tooLong); return; }
    const next = latest.current;
    busy.current = true; setProblem('');
    void run(() => onCommit(next), () => { saved.current = next; }).then(result => {
      busy.current = false;
      if (!result.ok) setProblem(result.error instanceof Error ? result.error.message : words.failed);
      if (again.current) { again.current = false; if (result.ok) commitRef.current(); }
    });
  };
  commitRef.current = commit;
  const restore = () => {
    const editor = input.current;
    if (!editor) return null;
    editor.focus({ preventScroll: true });
    const s = document.getSelection();
    let range = selection.current;
    if (!range || !editor.contains(range.commonAncestorContainer)) {
      range = document.createRange(); range.selectNodeContents(editor); range.collapse(false);
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
    if (command) document.execCommand(command);
    else if (op === 'indent' || op === 'outdent') {
      if (element?.closest('li')) document.execCommand(op);
    } else if (op === 'code') {
      const code = element?.closest('code');
      if (code) code.replaceWith(document.createTextNode(code.textContent ?? ''));
      else if (!range.collapsed) {
        const code = document.createElement('code'); code.textContent = range.toString();
        range.deleteContents(); range.insertNode(code); range.selectNodeContents(code);
        document.getSelection()?.removeAllRanges(); document.getSelection()?.addRange(range);
      }
    } else if (op === 'link') {
      selection.current = range.cloneRange(); linking.current = true;
      try {
        const href = await askLink(element?.closest('a')?.getAttribute('href') ?? '');
        restore();
        if (href !== null) {
          if (href && !safeRichHref(href)) throw new Error(words.invalidLink);
          if (href) document.execCommand('createLink', false, href);
          else document.execCommand('unlink');
          changed();
        }
      } catch (error) { setProblem(error instanceof Error ? error.message : words.failed); }
      finally { linking.current = false; }
      return;
    }
    changed();
  };
  return <div {...data} ref={root} data-dl="rich-text-field" data-commit={phase}>
    <Field label={label} hint={hint} necessity={optional ? 'optional' : undefined}
      error={problem || undefined} count={maxLength === undefined ? undefined : { value: draft, max: maxLength }}
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
              <Button key={op} label={tools[op]} icon={op} iconOnly emphasis="quiet" size="xs" pressed={toggles.has(op) ? !!pressed[op] : undefined}
                disabled={locked || ((op === 'indent' || op === 'outdent') && !inList)}
                data-rich-op={op} onClick={() => { void operate(op); }} />)}
          </span>)}
        </div>
        <div ref={input} id={control.id} data-dl-part="input" contentEditable={!locked} suppressContentEditableWarning
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
            const md = html ? richFieldMarkdown(new DOMParser().parseFromString(html, 'text/html').body) : text;
            document.execCommand('insertHTML', false, richFieldHtml(md)); changed();
          }} />
      </div>}
    </Field>
    {name && <input type="hidden" name={name} value={draft} />}
  </div>;
}

/**
 * Rich-text editing (tier 0 behaviour, G6): turns any element the app renders into an editing surface for formatted
 * text. Commands act on the person's last selection in the surface, even after focus went to a toolbar or ribbon, and
 * the selection's formatting is read back after every change so the command surface shows what's on (Bold pressed,
 * the alignment chosen, the block's style, its size). Undo and redo are the browser's own history for the surface.
 * Behaviour only: no styles. The app owns the element, its look and its content; spread `surface` on it.
 */
import { useCallback, useEffect, useRef, useState, type FormEvent, type RefObject } from 'react';

/** A command that toggles a property of the selection and reports whether it's on. */
export type RichTextToggle =
  | 'bold' | 'italic' | 'underline' | 'strikethrough' | 'subscript' | 'superscript'
  | 'align-left' | 'align-center' | 'align-right' | 'justify'
  | 'bullets' | 'numbering';

/**
 * Every command `run` takes. Those with a value: `block` (a tag: `p`, `h1`–`h6`, `blockquote`, `pre`), `font` (a family),
 * `size` (a CSS length), `colour` and `highlight` (a CSS colour), `line-height` (a CSS line height, set on each block the
 * selection touches), `insert-text` and `insert-html`.
 */
export type RichTextCommand =
  | RichTextToggle
  | 'indent' | 'outdent' | 'clear' | 'undo' | 'redo' | 'cut' | 'copy' | 'select-all'
  | 'block' | 'font' | 'size' | 'colour' | 'highlight' | 'line-height' | 'insert-text' | 'insert-html';

/** What the selection in the surface is, read after every selection change and command. */
export interface RichTextState {
  /** Each toggle that's on for the selection. */
  active: Partial<Record<RichTextToggle, boolean>>;
  /** The tag of the block the selection starts in (`p`, `h1`, `li`, `blockquote` …). */
  block?: string;
  /** How deep in lists the selection sits: 0 outside a list, 2 or more in a nested list. */
  listDepth: number;
  /** The first family of the selection's font. */
  font?: string;
  /** The selection's font size as a share of the surface's own (1 is the surface's size). */
  sizeRatio?: number;
  /** Some text is selected, not only a caret. */
  selected: boolean;
  /** The surface's history has a step to undo or redo. */
  canUndo: boolean;
  canRedo: boolean;
}

export interface RichTextOptions {
  /** The toggles shown as on before the person first selects in the surface (for example { 'align-left': true }). */
  initial?: Partial<Record<RichTextToggle, boolean>>;
  /** After the content changes: typing, pasting or any command. */
  onChange?: () => void;
}

export interface RichText {
  /** The selection's formatting, for the command surface's pressed states and fields. */
  state: RichTextState;
  /** Spread on the editing element: makes it editable, a multiline textbox, and reports typing. */
  surface: { contentEditable: true; suppressContentEditableWarning: true; role: 'textbox'; 'aria-multiline': true; onInput: (e: FormEvent<HTMLElement>) => void };
  /** Runs a command on the last selection in the surface. False when the surface isn't in the page. */
  run: (command: RichTextCommand, value?: string) => boolean;
  /** Puts focus and the last selection (or a caret at the end) back in the surface, so a command acts where the person was. */
  focus: () => boolean;
  /** Selects `range` in the surface and focuses it. */
  select: (range: Range) => void;
  /** The last selection in the surface, if any. */
  selection: () => Range | null;
  /** Reads the selection's formatting now and returns it (the `state` follows on the next render). */
  read: () => RichTextState;
  /** Forgets the saved selection, for example after the app replaced the surface's content. */
  reset: () => void;
}

const toggles: Record<RichTextToggle, string> = {
  bold: 'bold', italic: 'italic', underline: 'underline', strikethrough: 'strikeThrough', subscript: 'subscript', superscript: 'superscript',
  'align-left': 'justifyLeft', 'align-center': 'justifyCenter', 'align-right': 'justifyRight', justify: 'justifyFull',
  bullets: 'insertUnorderedList', numbering: 'insertOrderedList',
};
const named: Partial<Record<RichTextCommand, string>> = {
  ...toggles, indent: 'indent', outdent: 'outdent', clear: 'removeFormat', undo: 'undo', redo: 'redo', cut: 'cut', copy: 'copy', 'select-all': 'selectAll',
  block: 'formatBlock', font: 'fontName', colour: 'foreColor', highlight: 'hiliteColor', 'insert-text': 'insertText', 'insert-html': 'insertHTML',
};
const BLOCKS = ':is(p, h1, h2, h3, h4, h5, h6, blockquote, pre, li)';
const empty: RichTextState = { active: {}, listDepth: 0, selected: false, canUndo: false, canRedo: false };
const query = (fn: 'queryCommandState' | 'queryCommandEnabled', name: string) => {
  try {
    return document[fn](name);
  } catch {
    return false;
  }
};

/** Makes the element in `element` a rich-text surface; see `RichText`. */
export function useRichText(element: RefObject<HTMLElement | null>, { onChange, initial }: RichTextOptions = {}): RichText {
  const range = useRef<Range | null>(null);
  const [state, setState] = useState<RichTextState>(() => ({ ...empty, active: { ...initial } }));
  const last = useRef(state);
  const changed = useRef(onChange);
  changed.current = onChange;

  const read = useCallback((): RichTextState => {
    const ed = element.current;
    const sel = getSelection();
    if (!ed?.isConnected || !sel?.rangeCount || !ed.contains(sel.anchorNode)) return last.current;
    range.current = sel.getRangeAt(0).cloneRange();
    const at = sel.anchorNode instanceof Element ? sel.anchorNode : sel.anchorNode?.parentElement;
    const active: RichTextState['active'] = {};
    for (const [t, name] of Object.entries(toggles)) active[t as RichTextToggle] = query('queryCommandState', name);
    let listDepth = 0;
    for (let n = at; n && n !== ed; n = n.parentElement) if (n.tagName === 'LI') listDepth++;
    const style = at ? getComputedStyle(at) : undefined;
    const next: RichTextState = {
      active,
      block: at?.closest(BLOCKS)?.tagName.toLowerCase(),
      listDepth,
      font: style?.fontFamily.split(',')[0].replace(/["']/g, '').trim(),
      sizeRatio: style ? parseFloat(style.fontSize) / parseFloat(getComputedStyle(ed).fontSize) : undefined,
      selected: !sel.isCollapsed,
      canUndo: query('queryCommandEnabled', 'undo'),
      canRedo: query('queryCommandEnabled', 'redo'),
    };
    last.current = next;
    setState(next);
    return next;
  }, [element]);

  useEffect(() => {
    const onSelection = () => void read();
    document.addEventListener('selectionchange', onSelection);
    return () => document.removeEventListener('selectionchange', onSelection);
  }, [read]);

  const focus = useCallback(() => {
    const ed = element.current;
    const sel = getSelection();
    if (!ed?.isConnected || !sel) return false;
    ed.focus({ preventScroll: true });
    sel.removeAllRanges();
    if (range.current && ed.contains(range.current.startContainer)) sel.addRange(range.current);
    else {
      const r = document.createRange();
      r.selectNodeContents(ed.lastElementChild ?? ed);
      r.collapse(false);
      sel.addRange(r);
    }
    return true;
  }, [element]);

  const after = () => {
    changed.current?.();
    read();
  };

  const run = useCallback((command: RichTextCommand, value?: string) => {
    const ed = element.current;
    if (!ed || !focus()) return false;
    if (command === 'line-height') {
      const r = range.current;
      if (r) ed.querySelectorAll<HTMLElement>(`:scope > ${BLOCKS}, li`).forEach((b) => r.intersectsNode(b) && b.style.setProperty('line-height', value ?? ''));
      after();
      return true;
    }
    document.execCommand('styleWithCSS', false, 'false');
    if (command === 'size') {
      // The browser's own sizes are 1–7: size 7 marks the run, then each mark takes the asked length.
      document.execCommand('fontSize', false, '7');
      ed.querySelectorAll<HTMLElement>('font[size="7"]').forEach((f) => {
        f.removeAttribute('size');
        f.style.fontSize = value ?? '';
      });
    } else document.execCommand(named[command] ?? command, false, command === 'block' && value ? `<${value}>` : value);
    after();
    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element, focus]);

  const select = useCallback((r: Range) => {
    range.current = r;
    focus();
  }, [focus]);

  return {
    state,
    surface: { contentEditable: true, suppressContentEditableWarning: true, role: 'textbox', 'aria-multiline': true, onInput: after },
    run,
    focus,
    select,
    selection: () => range.current,
    read,
    reset: () => {
      range.current = null;
    },
  };
}

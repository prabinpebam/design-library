import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useFlipList } from '../behaviour/flip';
import { usePresence } from '../behaviour/presence';
import { Button } from '../fundamentals/Button';
import { ScrollArea } from '../fundamentals/ScrollArea';
import type { DataAttributes } from '../types';

export interface ChatLayoutProps extends DataAttributes {
  /** The sidebar: New chat, Search chats, a ConversationList. It scrolls on its own above `sidebarFooter`. */
  sidebar: ReactNode;
  /** Pinned to the bottom of the sidebar, never scrolling away: the account (a Persona and its menu, with Settings). */
  sidebarFooter?: ReactNode;
  /** Names the sidebar region: "Chat history" (default). */
  sidebarLabel?: string;
  /** Whether the sidebar shows. In a narrow window it floats over the conversation while open. */
  sidebarOpen: boolean;
  /** The sidebar toggle in the header was pressed. */
  onSidebarToggle: () => void;
  /** The header after the toggle: the model's MenuButton at the start, Share and the rest at the end (`headerEnd`). */
  header?: ReactNode;
  headerEnd?: ReactNode;
  /** The messages, in order (ChatMessage). The layout gives them the reading column and the space between turns. */
  children?: ReactNode;
  /** Names the conversation region, usually the chat's title. */
  label: string;
  /** The Composer, under the conversation in the same column, never scrolling away. */
  composer: ReactNode;
  /** A new chat: shown instead of the messages, centred with the composer under it (a greeting and suggestions). */
  empty?: ReactNode;
  /** `fill` takes the height its parent gives it; `screen` the whole window (an app on its own); `lg` holds 32 rem (a demonstration). */
  height?: 'fill' | 'screen' | 'lg';
}

/** How close to the end still counts as "at the newest", so new words keep it there. */
const stickSlack = 48;

/**
 * A conversation with an assistant: a collapsible sidebar of chats, a header, the messages in a reading column that
 * scrolls on its own, and the composer under it that never scrolls away. While the person is at the newest message, new
 * words keep them there; once they scroll up, a Jump to newest button appears. A new chat centres a greeting and the
 * composer instead.
 * Not for a document beside a list (ListDetail) or a page of reading (PageLayout).
 * @tier 3
 * @a11y The sidebar is a labelled `aside` the header's toggle controls (`aria-expanded`); the conversation is a labelled
 * region whose scroller is focusable, so the keyboard can scroll it; the composer follows it in the source. Jump to
 * newest moves the view, not focus. In a narrow window the floating sidebar closes with Escape and returns focus to the
 * toggle.
 * @key Escape: closes the floating sidebar
 */
export function ChatLayout({ sidebar, sidebarFooter, sidebarLabel = 'Chat history', sidebarOpen, onSidebarToggle, header, headerEnd, children, label, composer, empty, height = 'fill', ...data }: ChatLayoutProps) {
  const sidebarId = useId();
  const scroller = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLSpanElement>(null);
  const atEnd = useRef(true);
  const [away, setAway] = useState(false);
  // The pinned footer's hairline shows only while the list runs on under it (materials AD2): one boolean, set on change only.
  const [listUnder, setListUnder] = useState(false);
  const readList = useCallback((el: HTMLElement | null) => {
    if (el) setListUnder(el.scrollHeight - el.scrollTop - el.clientHeight > 1);
  }, []);
  const list = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = list.current;
    if (!el || !sidebarFooter) return;
    const grown = new ResizeObserver(() => readList(el));
    grown.observe(el);
    if (el.firstElementChild) grown.observe(el.firstElementChild);
    const scrolled = () => readList(el);
    el.addEventListener('scroll', scrolled, { passive: true });
    readList(el);
    return () => {
      grown.disconnect();
      el.removeEventListener('scroll', scrolled);
    };
  }, [readList, sidebarFooter, sidebarOpen]);

  const measure = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    atEnd.current = el.scrollHeight - el.scrollTop - el.clientHeight <= stickSlack;
    setAway(!atEnd.current);
  }, []);

  // New content (a message sent, words streaming) keeps the view at the newest when it was there.
  useLayoutEffect(() => {
    const el = scroller.current;
    const column = el?.firstElementChild;
    if (!el || !column) return;
    const grown = new ResizeObserver(() => {
      if (atEnd.current) el.scrollTop = el.scrollHeight;
      measure();
    });
    grown.observe(column);
    el.addEventListener('scroll', measure, { passive: true });
    el.scrollTop = el.scrollHeight;
    return () => {
      grown.disconnect();
      el.removeEventListener('scroll', measure);
    };
  }, [measure, empty]);

  // Q65 C12/C18: a new chat becoming a conversation is one screen changing state. The composer and greeting travel to
  // their new places (FLIP); the greeting fades out on the way and the messages fade in; back to a new chat reverses it.
  const root = useFlipList<HTMLDivElement>(empty ? 'empty' : 'chat');
  const greeting = usePresence(!!empty);
  const shownGreeting = useRef<ReactNode>(empty);
  if (empty) shownGreeting.current = empty;

  // Below 48 rem of its own width (the stylesheet's container query) the open sidebar floats over the conversation; Escape closes it then.
  useEffect(() => {
    if (!sidebarOpen) return;
    const close = (event: KeyboardEvent) => {
      const el = root.current;
      if (event.key !== 'Escape' || !el || el.clientWidth >= parseFloat(getComputedStyle(document.documentElement).fontSize) * 48) return;
      onSidebarToggle();
      toggle.current?.querySelector('button')?.focus();
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [sidebarOpen, onSidebarToggle]);

  return (
    <div ref={root} {...data} data-dl="chat-layout" data-sidebar={sidebarOpen ? 'open' : 'closed'} data-height={height} data-empty={empty ? '' : undefined}>
      {/* The sidebar is app chrome (Q97): the compact density context, small text and tighter corners. */}
      <aside id={sidebarId} data-dl-part="sidebar" data-density="compact" aria-label={sidebarLabel} hidden={!sidebarOpen} data-footer={sidebarFooter ? '' : undefined}>
        {/* Every scroll region is a ScrollArea (Q96): the library's bar, at the sidebar's edge, padding on the content. */}
        <ScrollArea data-dl-part="sidebar-list" viewportRef={list}>
          <div data-dl-part="sidebar-content">{sidebar}</div>
        </ScrollArea>
        {sidebarFooter && (
          <div data-dl-part="sidebar-footer" data-under={listUnder ? '' : undefined}>
            {sidebarFooter}
          </div>
        )}
      </aside>
      <div data-dl-part="main">
        <header data-dl-part="header">
          <span ref={toggle} data-dl-part="toggle">
            <Button label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'} icon="menu" iconOnly size="s" emphasis="quiet" expanded={sidebarOpen} controls={sidebarId} onClick={onSidebarToggle} />
          </span>
          <span data-dl-part="header-start">{header}</span>
          <span data-dl-part="header-end">{headerEnd}</span>
        </header>
        <section data-dl-part="conversation" aria-label={label}>
          {greeting && (
            <div data-dl-part="greeting-area" data-flip-key="greeting" data-leaving={empty ? undefined : ''} inert={!empty} aria-hidden={!empty || undefined}>
              <div data-dl-part="column">
                <div data-dl-part="greeting">{empty ?? shownGreeting.current}</div>
              </div>
            </div>
          )}
          {!empty && (
            <>
              <ScrollArea data-dl-part="scroll" viewportRef={scroller} tabIndex={0}>
                <div data-dl-part="column">{children}</div>
              </ScrollArea>
              {away && (
                <span data-dl-part="jump" data-material="floating" data-elevation="3">
                  <Button
                    label="Jump to newest"
                    icon="chevron-down"
                    iconOnly
                    size="s"
                    onClick={() => scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}
                  />
                </span>
              )}
            </>
          )}
        </section>
        {/* One composer in both states, so it keeps its words and focus and travels from the middle to the bottom. */}
        <div data-dl-part="composer" data-flip-key="composer">
          <div data-dl-part="column">{composer}</div>
        </div>
      </div>
    </div>
  );
}

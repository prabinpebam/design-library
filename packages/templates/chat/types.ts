/**
 * The AI chat template's record (Q57.3, Q64): what content/chat.json holds, checked by content.schema.json
 * (generated from these types). Pictures are asset ids in assets.json.
 */
import type { ChatAttachment, ComposerTool, ConversationGroup, MenuButtonItem } from '@design-library/core/react';

/** One block of a message, in order. Words may hold `inline code` between backticks. */
export type ChatBlock =
  | { type: 'text'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'list'; items: string[]; numbered?: boolean }
  | { type: 'code'; label: string; code: string }
  | { type: 'table'; label: string; columns: { key: string; header: string }[]; rows: Record<string, string>[] }
  | { type: 'image'; picture: string; ratio?: 'wide' | 'photo' | 'square' }
  /** A picture being drawn; it becomes `picture` once drawn (after `seconds`). */
  | { type: 'generating'; label: string; picture: string; variant?: 'stipple' | 'aurora' | 'reveal' | 'shimmer'; ratio?: 'photo' | 'square' | 'wide'; seconds?: number }
  | { type: 'card'; title: string; eyebrow?: string; description: string; picture?: string; action?: string }
  | { type: 'sources'; items: { label: string; href: string }[] }
  /** A reply that didn't finish: the reason, with Try again; trying again writes `retry`. */
  | { type: 'error'; text: string; retry: ChatBlock[] };

export interface ChatTurn {
  id: string;
  from: 'person' | 'assistant';
  blocks: ChatBlock[];
  /** Earlier versions of a reply (after Try again), oldest first; `blocks` is the newest. */
  earlier?: ChatBlock[][];
  attachments?: ChatAttachment[];
  /** What the assistant thought or did before replying, closed under its summary. */
  thinking?: { summary: string; steps: string[] };
}

export interface ChatThread {
  id: string;
  title: string;
  turns: ChatTurn[];
}

export interface ChatAppView {
  /** Who replies, said before each reply ("Assistant said"). */
  assistant: string;
  sidebar: {
    groups: ConversationGroup[];
    account: { name: string; plan: string; menu: MenuButtonItem[] };
  };
  models: MenuButtonItem[];
  model: string;
  tools: ComposerTool[];
  disclaimer: string;
  welcome: { greeting: string; suggestions: string[]; temporary: { greeting: string; note: string } };
  threads: ChatThread[];
  /** The chat open at the start. */
  current: string;
  /** What the assistant writes to a new message, and with the Create image tool. */
  replies: { thinking: string[]; text: ChatBlock[]; image: ChatBlock[] };
  /** The link Share offers. */
  shareBase: string;
  /** Every interface word the chat shows. */
  strings: ChatStrings;
}

/** The chat's interface words (Q64: every word a person reads is content). `{name}` marks a value filled in. */
export interface ChatStrings {
  notInExample: string;
  sources: string;
  replyFailed: string;
  tryAgain: string;
  thoughtFor: string;
  todayGroup: string;
  branchTitle: string;
  branched: string;
  archived: string;
  undo: string;
  you: string;
  stopped: string;
  creatingImage: string;
  dictation: string;
  newChat: string;
  searchChats: string;
  account: string;
  model: string;
  temporaryChat: string;
  share: string;
  shareTitle: string;
  shareDescription: string;
  done: string;
  link: string;
  copyLink: string;
  linkCopied: string;
  search: string;
  chats: string;
  noMatch: string;
  deleteTitle: string;
  deleteDescription: string;
  cancel: string;
  delete: string;
  deleted: string;
  settings: string;
  suggestions: string;
  suggestionsDescription: string;
  memory: string;
  memoryDescription: string;
}

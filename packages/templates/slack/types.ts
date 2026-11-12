export type WorkspaceIcon = 'organisation' | 'comment' | 'speaker' | 'file' | 'more' | 'list' | 'edit' | 'frame' | 'person' | 'plus' | 'thumb-up' | 'heart' | 'headphones' | 'hash' | 'person-add' | 'clock' | 'emoji' | 'leaf' | 'food' | 'ball' | 'plane' | 'lightbulb' | 'flag';
export interface WorkspaceSubmenuItem {
  value: string;
  label: string;
  description?: string;
  icon?: WorkspaceIcon;
  tone?: 'danger';
  startsGroup?: boolean;
  /** A round plate behind the icon: neutral, or a category 1-8 the theme tints. */
  plate?: 'neutral' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
}
export interface WorkspaceMenuItem extends WorkspaceSubmenuItem {
  /** A submenu opened beside the item. */
  items?: WorkspaceSubmenuItem[];
}
export interface WorkspaceEmoji {
  char: string;
  label: string;
}
export interface WorkspaceMessage {
  id: string;
  author: string;
  time: string;
  text: string;
  grouped?: boolean;
  isNew?: boolean;
  reactions?: { emoji: string; label: string; count: number }[];
  replies?: number;
  file?: { name: string; detail: string };
  unfurl?: { title: string; site: string; text: string };
}
export interface WorkspaceRecord {
  name: string;
  currentUser: string;
  channel: string;
  topic: string;
  members: string[];
  memberCount: number;
  date: string;
  rail: { label: string; icon: WorkspaceIcon }[];
  sections: { title?: string; items: { name: string; icon?: WorkspaceIcon; presence?: 'available' | 'away'; unread?: boolean; mentions?: number }[] }[];
  messages: WorkspaceMessage[];
  replies: WorkspaceMessage[];
  messageMenu: WorkspaceMenuItem[];
  createMenu: WorkspaceMenuItem[];
  emojiPicker: { categories: { label: string; icon: WorkspaceIcon }[]; groups: { title: string; items: WorkspaceEmoji[] }[]; handy: WorkspaceEmoji[] };
  copy: Record<string, string>;
}

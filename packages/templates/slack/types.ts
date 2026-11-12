export type WorkspaceIcon =
  | 'organisation' | 'comment' | 'speaker' | 'file' | 'more' | 'list' | 'edit' | 'frame' | 'person' | 'plus'
  | 'thumb-up' | 'heart' | 'headphones' | 'hash' | 'person-add' | 'clock' | 'emoji' | 'leaf' | 'food' | 'ball'
  | 'plane' | 'lightbulb' | 'flag' | 'home' | 'messages' | 'bell' | 'check-circle' | 'star' | 'bookmark' | 'pin'
  | 'inbox' | 'contacts' | 'sidebar' | 'help' | 'video' | 'quote' | 'code-block' | 'shortcut' | 'filter-lines'
  | 'window-maximize' | 'layers' | 'grid' | 'bot' | 'search' | 'settings' | 'external' | 'play';

export interface WorkspaceSubmenuItem {
  value: string;
  label: string;
  description?: string;
  shortcut?: string;
  badge?: string;
  checked?: boolean;
  heading?: string;
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

export interface WorkspaceUnfurl {
  title: string;
  site: string;
  text: string;
  thumb?: string;
  banner?: string;
}

export interface WorkspaceMessage {
  id: string;
  author: string;
  avatar?: string;
  statusEmoji?: string;
  time: string;
  text: string;
  mention?: string;
  edited?: boolean;
  linkText?: string;
  grouped?: boolean;
  isNew?: boolean;
  dateAbove?: string;
  reactions?: { emoji: string; label: string; count: number }[];
  replies?: number;
  replyAvatars?: string[];
  file?: { name: string; detail: string };
  unfurl?: WorkspaceUnfurl;
}

export interface WorkspaceChannelItem {
  name: string;
  icon?: WorkspaceIcon;
  avatar?: string;
  presence?: 'available' | 'away';
  unread?: boolean;
  mentions?: number;
  mentionsLabel?: string;
}

export interface WorkspaceTile {
  id: string;
  initials: string;
  name: string;
  tone: 'coral' | 'sage';
  current?: boolean;
  mentions?: number;
}

export interface WorkspaceTabItem {
  id: string;
  label: string;
  icon: WorkspaceIcon;
}

export interface WorkspaceRecord {
  name: string;
  workspaceBadge: string;
  currentUser: string;
  currentUserAvatar: string;
  channel: string;
  topicPrefix: string;
  topicMiddle: string;
  topicLink: string;
  members: { name: string; avatar: string }[];
  memberCountText: string;
  date: string;
  newMessagesBanner?: string;
  moreUnreadsLabel: string;
  vipPrompt: {
    body: string;
    later: string;
    start: string;
  };
  welcomePrompt: {
    title: string;
    cta: string;
  };
  vipModal: {
    title: string;
    description: string;
    searchPlaceholder: string;
    listHeading: string;
    emptyText: string;
    remindLater: string;
    save: string;
  };
  amaChannel: {
    channel: string;
    topicText: string;
    memberCountText: string;
    activityMentions: number;
    tabs: WorkspaceTabItem[];
    channelBadges: Record<string, string>;
    messages: WorkspaceMessage[];
  };
  workspaces: WorkspaceTile[];
  rail: { id: string; label: string; icon: WorkspaceIcon; mentions?: number }[];
  tabs: WorkspaceTabItem[];
  sections: { title?: string; collapsible?: boolean; items: WorkspaceChannelItem[] }[];
  messages: WorkspaceMessage[];
  replies: WorkspaceMessage[];
  quickReactions: { emoji: string; label: string }[];
  messageMenu: WorkspaceMenuItem[];
  channelMenu: WorkspaceMenuItem[];
  createMenu: WorkspaceMenuItem[];
  emojiPicker: { categories: { label: string; icon: WorkspaceIcon }[]; groups: { title: string; items: WorkspaceEmoji[] }[]; handy: WorkspaceEmoji[] };
  copy: Record<string, string>;
}

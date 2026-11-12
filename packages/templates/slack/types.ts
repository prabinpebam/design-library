export type WorkspaceIcon =
  | 'organisation' | 'comment' | 'speaker' | 'file' | 'more' | 'list' | 'edit' | 'frame' | 'person' | 'people' | 'plus'
  | 'thumb-up' | 'heart' | 'headphones' | 'hash' | 'person-add' | 'clock' | 'emoji' | 'leaf' | 'food' | 'ball'
  | 'plane' | 'lightbulb' | 'flag' | 'home' | 'messages' | 'bell' | 'check-circle' | 'star' | 'bookmark' | 'pin'
  | 'inbox' | 'contacts' | 'sidebar' | 'help' | 'video' | 'quote' | 'code-block' | 'shortcut' | 'filter-lines'
  | 'window-maximize' | 'layers' | 'grid' | 'bot' | 'search' | 'settings' | 'external' | 'play'
  | 'arrow-start' | 'compose' | 'forward' | 'list-search' | 'hash-box' | 'bold' | 'italic' | 'underline'
  | 'strikethrough' | 'pilcrow' | 'link' | 'list-numbered' | 'list-bulleted' | 'code' | 'mic' | 'send'
  | 'chevron-down' | 'chevron-start' | 'chevron-end' | 'close' | 'minus' | 'menu' | 'scheme-dark' | 'text-format'
  | 'emoji-add' | 'more-vertical' | 'caret-down' | 'globe' | 'book' | 'arrow-end';

export interface WorkspaceSubmenuItem {
  value: string;
  label: string;
  description?: string;
  meta?: string;
  shortcut?: string;
  badge?: string;
  inset?: boolean;
  checked?: boolean;
  heading?: string;
  highlighted?: boolean;
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
  subText?: string;
  afterLinkText?: string;
  mention?: string;
  edited?: boolean;
  linkText?: string;
  grouped?: boolean;
  hovered?: boolean;
  italic?: boolean;
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
    before: string;
    bold: string;
    after: string;
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
    channels?: WorkspaceChannelItem[];
    messages: WorkspaceMessage[];
  };
  workspaces: WorkspaceTile[];
  dualRailWorkspaces: WorkspaceTile[];
  dualRailChannels: WorkspaceChannelItem[];
  directoriesView: {
    title: string;
    tabs: WorkspaceTabItem[];
    searchPlaceholder: string;
    inviteLabel: string;
    filters: { label: string; icon?: WorkspaceIcon }[];
    sortLabel: string;
    people: { name: string; avatar: string; presence: 'available' | 'away' | 'snooze'; role?: string }[];
  };
  huddlesView: {
    title: string;
    newHuddle: string;
    heroTitle: string;
    heroBody: string;
    heroAction: string;
    dmTitle: string;
    dmSubtitle: string;
    dms: { name: string; statusEmoji?: string; status: string; presence?: 'away' | 'available'; banner: string; leftAvatar: string; rightAvatar: string }[];
    channelsTitle: string;
    channelsSubtitle: string;
    channels: string[];
  };
  unreadsView: {
    title: string;
    filterLabel: string;
    sortLabel: string;
    channel: string;
    countLabel: string;
    pressLabel: string;
    keycap: string;
    toLabel: string;
    markRead: string;
    date: string;
    messages: WorkspaceMessage[];
  };
  welcomeBackView: {
    title: string;
    heroTitle: string;
    unreadHeading: string;
    unreadSubtitle: string;
    viewMessage: string;
    unreadGroups: {
      date: string;
      items: { channel: string; author: string; avatar: string; time: string; text: string }[];
    }[];
    teammatesHeading: string;
    teammatesSubtitle: string;
    sayHi: string;
    teammates: { name: string; avatar: string; snooze?: boolean }[];
  };
  slackbotView: {
    workspaceInitials: string;
    searchPlaceholder: string;
    railLabel: string;
    adminLabel: string;
    sidebarTitle: string;
    navItems: { id: string; label: string; icon: WorkspaceIcon }[];
    starredTitle: string;
    starredHintBefore: string;
    starredHintEmoji: string;
    starredHintAfter: string;
    recentsTitle: string;
    allConversations: string;
    heroTitle: string;
    promptPlaceholder: string;
    disclaimer: string;
    recommendedTitle: string;
    prompts: { id: string; text: string; icon: WorkspaceIcon; tone: 'mint' | 'sky' }[];
    bannerText: string;
    bannerLink: string;
  };
  activityView: {
    title: string;
    countLabel: string;
    unreadsLabel: string;
    items: {
      id: string;
      context: string;
      author: string;
      avatar: string;
      date: string;
      mention?: string;
      text: string;
      unread?: boolean;
      badge?: number;
    }[];
  };
  createHeading: string;
  filterMenu: WorkspaceMenuItem[];
  rail: { id: string; label: string; icon: WorkspaceIcon; mentions?: number }[];
  tabs: WorkspaceTabItem[];
  sections: { title?: string; collapsible?: boolean; dividerBefore?: boolean; items: WorkspaceChannelItem[] }[];
  messages: WorkspaceMessage[];
  replies: WorkspaceMessage[];
  quickReactions: { emoji: string; label: string }[];
  messageMenu: WorkspaceMenuItem[];
  channelMenu: WorkspaceMenuItem[];
  createMenu: WorkspaceMenuItem[];
  emojiPicker: { categories: { label: string; icon: WorkspaceIcon }[]; groups: { title: string; items: WorkspaceEmoji[] }[]; handy: WorkspaceEmoji[] };
  copy: Record<string, string>;
}

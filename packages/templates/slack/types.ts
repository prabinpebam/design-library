export type WorkspaceIcon = 'organisation' | 'comment' | 'speaker' | 'file' | 'more' | 'list' | 'edit' | 'frame' | 'person' | 'plus' | 'thumb-up' | 'heart';
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
  copy: Record<string, string>;
}

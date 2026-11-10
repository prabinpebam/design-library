/** The Project management template's records (Q61, Q62, Q64): the project (content/shared.json) and one issue in full (content/issue.json). */
import type { BadgeTone } from '@design-library/core/components';

export type IssueType = 'Story' | 'Bug' | 'Task';

export interface Issue {
  id: string;
  key: string;
  title: string;
  type: IssueType;
  status: string;
  assignee?: string;
  points: number;
  /** In the current sprint; otherwise waiting in the backlog. */
  sprint: boolean;
}

export interface IssueDetail {
  id: string;
  description: string[];
  checklist: { id: string; label: string; done: boolean }[];
  reporter: string;
  created: string;
  comments: { name: string; when: string; text: string }[];
}

export interface ProjectRecord {
  project: string;
  sprint: { name: string; ends: string };
  places: { id: string; label: string }[];
  people: string[];
  statuses: { id: string; title: string; limit?: number }[];
  types: Record<IssueType, BadgeTone>;
  issues: Issue[];
  /** Every interface word the screens show. */
  strings: ProjectStrings;
}


/** Interface words (Q64: every word a person reads is content). `{name}` marks a value filled in; `me` is the person using the app. */
export interface ProjectStrings {
  point: string;
  points: string;
  key: string;
  summary: string;
  type: string;
  status: string;
  assignee: string;
  pointsHeader: string;
  unassigned: string;
  sprintBoard: string;
  backlog: string;
  pointsDone: string;
  sprintIntro: string;
  sprintIssues: string;
  backlogIntro: string;
  backlogIssues: string;
  description: string;
  doneWhen: string;
  doneCount: string;
  checklist: string;
  comments: string;
  addComment: string;
  comment: string;
  justNow: string;
  sprint: string;
  reporter: string;
  created: string;
  softwareProject: string;
  planning: string;
  searchBoard: string;
  createIssue: string;
  creatingIssues: string;
  notInExample: string;
  me: string;
  /** The issue's edit action (Q65 TP4) and its form, which takes the issue's place in the same box. */
  edit: string;
  editIssue: string;
  title: string;
  titleMissing: string;
  descriptionHint: string;
  saveChanges: string;
  cancel: string;
  changesSaved: string;
}

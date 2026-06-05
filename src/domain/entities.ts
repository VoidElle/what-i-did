// Opaque rich content container — domain knows it exists but not its format
export interface RichContent {
  readonly raw: unknown;
}

// Core domain entities - source-agnostic (no Jira, no Tauri, no React)

export interface StatusChange {
  id: string;
  from: string;
  to: string;
  author: { displayName: string; email?: string };
  changedAt: string; // ISO 8601
}

export interface IssueComment {
  id: string;
  author: { displayName: string; email?: string };
  body: string; // plain text for standup
  bodyRich: RichContent | null;
  createdAt: string;
  updatedAt: string;
}

export interface Worklog {
  id: string;
  author: { displayName: string };
  comment: string; // plain text
  timeSpent: string;
  startedAt: string;
}

export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  contentUrl: string; // raw URL - requires auth to fetch
  createdAt: string;
  author: { displayName: string };
}

export interface ActivityIssue {
  id: string;
  key: string;
  summary: string;
  description: string; // plain text for standup
  descriptionRich: RichContent | null;
  descriptionLastChangedAt: string | null; // from changelog, null if never explicitly changed
  status: { name: string; colorName: string };
  issueType: { name: string; iconUrl?: string };
  priority: { name: string; iconUrl?: string } | null;
  assignee: { displayName: string; email: string } | null;
  updatedAt: string;
  attachments: Attachment[];
  comments: IssueComment[];
  statusChanges: StatusChange[]; // pre-filtered from changelog
  project: { key: string; name: string };
  sourceConnectionId: string;
  sourceConnectionName: string;
}

export interface JiraConnection {
  id: string;
  name: string;
  baseUrl: string;
  email: string;
  token: string;
}

export interface SourceConfig {
  connections: JiraConnection[];
  devMode?: boolean;
  theme?: string;
}

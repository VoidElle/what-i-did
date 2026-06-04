export interface JiraAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  content: string;
  created: string;
  author: { displayName: string };
}

export interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description: AdfNode | string | null;
    status: {
      name: string;
      statusCategory: { colorName: string };
    };
    issuetype: { name: string; iconUrl?: string };
    priority: { name: string; iconUrl?: string } | null;
    assignee: { displayName: string; emailAddress: string } | null;
    updated: string;
    attachment: JiraAttachment[];
    comment: {
      comments: JiraComment[];
      total: number;
    };
    project: { key: string; name: string };
  };
  changelog?: Changelog;
}

export interface JiraComment {
  id: string;
  author: { displayName: string; emailAddress?: string };
  // Atlassian Document Format body
  body: AdfNode | string | null;
  created: string;
  updated: string;
}

export interface AdfNode {
  type: string;
  text?: string;
  content?: AdfNode[];
  attrs?: Record<string, unknown>;
  marks?: AdfMark[];
}

export interface AdfMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export interface WorklogEntry {
  id: string;
  author: { displayName: string };
  comment?: AdfNode | string | null;
  timeSpent: string;
  started: string;
}

export interface ChangelogItem {
  field: string;
  fieldtype: string;
  from: string | null;
  fromString: string | null;
  to: string | null;
  toString: string | null;
}

export interface ChangelogHistory {
  id: string;
  author: { displayName: string; emailAddress?: string };
  created: string;
  items: ChangelogItem[];
}

export interface Changelog {
  histories: ChangelogHistory[];
}

export interface JiraConfig {
  baseUrl: string;
  email: string;
  token: string;
}

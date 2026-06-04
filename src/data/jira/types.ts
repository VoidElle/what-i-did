// Raw Jira REST API v3 response shapes - internal to data/jira, not exposed to domain

export interface JiraAdfMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export interface JiraAdfNode {
  type: string;
  text?: string;
  content?: JiraAdfNode[];
  attrs?: Record<string, unknown>;
  marks?: JiraAdfMark[];
}

export interface JiraAttachmentRaw {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  content: string; // URL
  created: string;
  author: { displayName: string };
}

export interface JiraCommentRaw {
  id: string;
  author: { displayName: string; emailAddress?: string };
  body: JiraAdfNode | string | null;
  created: string;
  updated: string;
}

export interface JiraChangelogItem {
  field: string;
  fieldtype: string;
  from: string | null;
  fromString: string | null;
  to: string | null;
  toString: string | null;
}

export interface JiraChangelogHistory {
  id: string;
  author: { displayName: string; emailAddress?: string };
  created: string;
  items: JiraChangelogItem[];
}

export interface JiraIssueRaw {
  id: string;
  key: string;
  fields: {
    summary: string;
    description: JiraAdfNode | string | null;
    status: {
      name: string;
      statusCategory: { colorName: string };
    };
    issuetype: { name: string; iconUrl?: string };
    priority: { name: string; iconUrl?: string } | null;
    assignee: { displayName: string; emailAddress: string } | null;
    updated: string;
    attachment: JiraAttachmentRaw[];
    comment: {
      comments: JiraCommentRaw[];
      total: number;
    };
    project: { key: string; name: string };
  };
  changelog?: {
    histories: JiraChangelogHistory[];
  };
}

export interface JiraWorklogRaw {
  id: string;
  author: { displayName: string };
  comment?: JiraAdfNode | string | null;
  timeSpent: string;
  started: string;
}

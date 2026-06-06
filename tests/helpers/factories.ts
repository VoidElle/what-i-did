import type { ActivityIssue } from "../../src/domain/entities";

export function makeIssue(overrides: Partial<ActivityIssue> = {}): ActivityIssue {
  return {
    id: "mock-1",
    key: "PROJ-1",
    summary: "Test issue",
    description: "A test issue",
    descriptionRich: null,
    descriptionLastChangedAt: null,
    status: { name: "In Progress", colorName: "blue" },
    issueType: { name: "Story" },
    priority: { name: "Medium" },
    assignee: { displayName: "You", email: "dev@example.com" },
    updatedAt: new Date().toISOString(),
    attachments: [],
    comments: [],
    statusChanges: [],
    project: { key: "PROJ", name: "My Project" },
    sourceConnectionId: "conn-1",
    sourceConnectionName: "Work",
    ...overrides,
  };
}

export function makeStatusChange(
  from: string,
  to: string,
  changedAt: string,
  authorEmail = "dev@example.com"
) {
  return {
    id: crypto.randomUUID(),
    from,
    to,
    author: { displayName: "Dev", email: authorEmail },
    changedAt,
  };
}

export function makeComment(
  createdAt: string,
  authorEmail = "dev@example.com",
  body = "A comment"
) {
  return {
    id: crypto.randomUUID(),
    author: { displayName: "Dev", email: authorEmail },
    body,
    bodyRich: null,
    createdAt,
    updatedAt: createdAt,
  };
}

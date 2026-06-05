import type {
  ActivityIssue,
  Attachment,
  IssueComment,
  RichContent,
  StatusChange,
  Worklog,
} from "../../domain/entities";
import type {
  JiraAdfNode,
  JiraAttachmentRaw,
  JiraChangelogHistory,
  JiraCommentRaw,
  JiraIssueRaw,
  JiraWorklogRaw,
} from "./types";

// ── ADF → plain text ─────────────────────────────────────────────────────────

export function extractAdfText(
  node: JiraAdfNode | string | null | undefined
): string {
  if (!node) return "";
  if (typeof node === "string") return node;

  const { type, text, content, attrs } = node;

  switch (type) {
    case "text":
      return text ?? "";
    case "hardBreak":
      return "\n";
    case "paragraph":
    case "heading":
    case "blockquote":
      return (content?.map(extractAdfText).join("") ?? "") + "\n";
    case "bulletList":
    case "orderedList":
      return (content?.map(extractAdfText).join("") ?? "") + "\n";
    case "listItem":
      return "• " + (content?.map(extractAdfText).join("").trim() ?? "") + "\n";
    case "codeBlock": {
      const code = content?.map(extractAdfText).join("") ?? "";
      return "```\n" + code + "\n```\n";
    }
    case "inlineCode":
      return "`" + (text ?? "") + "`";
    case "mention":
      return "@" + String(attrs?.text ?? attrs?.displayName ?? "someone");
    case "emoji":
      return String(attrs?.text ?? attrs?.shortName ?? "");
    case "media": {
      const mediaType = String(attrs?.mediaType ?? attrs?.type ?? "file");
      const name = attrs?.fileName ? ` (${String(attrs.fileName)})` : "";
      if (mediaType === "video") return `[🎬 Video${name}]`;
      if (mediaType === "image") return `[🖼 Image${name}]`;
      return `[📎 File${name}]`;
    }
    case "mediaSingle":
    case "mediaGroup":
      return (content?.map(extractAdfText).join("") ?? "") + "\n";
    case "inlineCard":
    case "blockCard": {
      const url = String(attrs?.url ?? "");
      return url ? `[${url}]\n` : "";
    }
    case "rule":
      return "─────\n";
    case "table":
    case "tableRow":
    case "tableHeader":
    case "tableCell":
      return (content?.map(extractAdfText).join(" | ") ?? "") + "\n";
    default:
      return content?.map(extractAdfText).join("").trim() ?? "";
  }
}

// ── Mappers: Jira raw → domain ────────────────────────────────────────────────

function mapAttachment(raw: JiraAttachmentRaw): Attachment {
  return {
    id: raw.id,
    filename: raw.filename,
    mimeType: raw.mimeType,
    size: raw.size,
    contentUrl: raw.content,
    createdAt: raw.created,
    author: { displayName: raw.author.displayName },
  };
}

function toRichContent(
  node: JiraAdfNode | string | null | undefined
): RichContent | null {
  if (!node || typeof node === "string") return null;
  return { raw: node };
}

function mapComment(raw: JiraCommentRaw): IssueComment {
  return {
    id: raw.id,
    author: {
      displayName: raw.author.displayName,
      email: raw.author.emailAddress,
    },
    body: extractAdfText(raw.body),
    bodyRich: toRichContent(raw.body),
    createdAt: raw.created,
    updatedAt: raw.updated,
  };
}

function mapDescriptionLastChangedAt(
  histories: JiraChangelogHistory[]
): string | null {
  // Walk histories newest-first (Jira returns oldest-first, so reverse)
  for (let i = histories.length - 1; i >= 0; i--) {
    const h = histories[i];
    if (h.items.some((item) => item.field === "description")) {
      return h.created;
    }
  }
  return null;
}

function mapStatusChanges(histories: JiraChangelogHistory[]): StatusChange[] {
  const changes: StatusChange[] = [];
  for (const history of histories) {
    for (const item of history.items) {
      if (item.field === "status") {
        changes.push({
          id: history.id,
          from: item.fromString ?? "",
          to: item.toString ?? "",
          author: {
            displayName: history.author.displayName,
            email: history.author.emailAddress,
          },
          changedAt: history.created,
        });
      }
    }
  }
  return changes;
}

export function mapWorklog(raw: JiraWorklogRaw): Worklog {
  return {
    id: raw.id,
    author: { displayName: raw.author.displayName },
    comment: extractAdfText(raw.comment),
    timeSpent: raw.timeSpent,
    startedAt: raw.started,
  };
}

export function mapIssue(raw: JiraIssueRaw): ActivityIssue {
  return {
    id: raw.id,
    key: raw.key,
    summary: raw.fields.summary,
    description: extractAdfText(raw.fields.description),
    descriptionRich: toRichContent(raw.fields.description),
    descriptionLastChangedAt: mapDescriptionLastChangedAt(
      raw.changelog?.histories ?? []
    ),
    status: {
      name: raw.fields.status.name,
      colorName: raw.fields.status.statusCategory.colorName,
    },
    issueType: raw.fields.issuetype,
    priority: raw.fields.priority,
    assignee: raw.fields.assignee
      ? {
          displayName: raw.fields.assignee.displayName,
          email: raw.fields.assignee.emailAddress,
        }
      : null,
    updatedAt: raw.fields.updated,
    attachments: (raw.fields.attachment ?? []).map(mapAttachment),
    comments: (raw.fields.comment?.comments ?? []).map(mapComment),
    statusChanges: mapStatusChanges(raw.changelog?.histories ?? []),
    project: raw.fields.project,
  };
}

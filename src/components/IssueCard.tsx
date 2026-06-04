import { useState } from "react";
import type { AdfNode, JiraConfig, JiraIssue, WorklogEntry } from "../types/jira";
import { fetchWorklog } from "../api/jira";
import { AttachmentList } from "./AttachmentList";

export function extractAdfText(node: AdfNode | string | null | undefined): string {
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
      return "@" + (String(attrs?.text ?? attrs?.displayName ?? "someone"));

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

const STATUS_COLOR: Record<string, string> = {
  "blue-grey": "#5e6c84",
  yellow: "#ff991f",
  green: "#00875a",
  red: "#de350b",
};

const TYPE_EMOJI: Record<string, string> = {
  Bug: "🐛",
  Story: "📖",
  Task: "✅",
  Epic: "⚡",
  Subtask: "↳",
};

interface IssueCardProps {
  issue: JiraIssue;
  config: JiraConfig;
}

export function IssueCard({ issue, config }: IssueCardProps) {
  const { key, fields } = issue;
  const [expanded, setExpanded] = useState(false);
  const [worklogs, setWorklogs] = useState<WorklogEntry[] | null>(null);
  const [loadingWorklogs, setLoadingWorklogs] = useState(false);

  const color = STATUS_COLOR[fields.status.statusCategory.colorName] ?? "#5e6c84";
  const typeEmoji = TYPE_EMOJI[fields.issuetype.name] ?? "📌";
  const comments = fields.comment?.comments ?? [];
  const description = extractAdfText(fields.description);

  const toggle = async () => {
    const next = !expanded;
    setExpanded(next);
    if (next && worklogs === null) {
      setLoadingWorklogs(true);
      const logs = await fetchWorklog(config, key);
      setWorklogs(logs);
      setLoadingWorklogs(false);
    }
  };

  return (
    <div className={`issue-card${expanded ? " issue-card--expanded" : ""}`}>
      {/* ── Header row (always visible, click to expand) ── */}
      <div className="issue-header issue-header--clickable" onClick={toggle}>
        <div className="issue-key-row">
          <span className="issue-type-icon" title={fields.issuetype.name}>{typeEmoji}</span>
          <span className="issue-key">{key}</span>
          {fields.assignee && (
            <span className="meta-chip muted">{fields.assignee.displayName}</span>
          )}
        </div>
        <div className="issue-header-right">
          <span className="issue-status" style={{ backgroundColor: color }}>
            {fields.status.name}
          </span>
          <span className="expand-chevron">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      <p className="issue-summary">{fields.summary}</p>

      <div className="issue-meta">
        {fields.priority && <span className="meta-chip">{fields.priority.name}</span>}
        <span className="meta-chip muted">{new Date(fields.updated).toLocaleDateString()}</span>
        {comments.length > 0 && (
          <span className="meta-chip muted">💬 {comments.length}</span>
        )}
      </div>

      {/* ── Expanded details ── */}
      {expanded && (
        <div className="issue-details">
          {/* Description */}
          {description && (
            <div className="detail-section">
              <div className="detail-label">Description</div>
              <div className="detail-body">{description}</div>
            </div>
          )}

          {/* Attachments */}
          <AttachmentList
            attachments={fields.attachment ?? []}
            config={config}
          />

          {/* Comments */}
          {comments.length > 0 && (
            <div className="detail-section">
              <div className="detail-label">Comments ({comments.length})</div>
              <div className="comments-list">
                {comments.map((c) => (
                  <div key={c.id} className="comment-entry">
                    <div className="comment-meta">
                      <strong>{c.author.displayName}</strong>
                      <span className="comment-date">
                        {new Date(c.updated).toLocaleString()}
                      </span>
                    </div>
                    <div className="comment-body">{extractAdfText(c.body)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Worklogs */}
          <div className="detail-section">
            <div className="detail-label">Worklogs</div>
            {loadingWorklogs && <span className="detail-muted">Loading…</span>}
            {!loadingWorklogs && worklogs?.length === 0 && (
              <span className="detail-muted">No worklogs</span>
            )}
            {!loadingWorklogs && worklogs && worklogs.length > 0 && (
              <div className="worklogs-list">
                {worklogs.map((w) => (
                  <div key={w.id} className="worklog-entry">
                    <span className="worklog-time">{w.timeSpent}</span>
                    <span className="worklog-author">{w.author.displayName}</span>
                    <span className="comment-date">
                      {new Date(w.started).toLocaleDateString()}
                    </span>
                    {w.comment && (
                      <span className="worklog-comment">{extractAdfText(w.comment)}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

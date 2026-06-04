import { useState } from "react";
import type { ActivityIssue, Worklog } from "../../domain/entities";
import { AttachmentList } from "./AttachmentList";

const WINDOW_MS = 24 * 60 * 60 * 1000;

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
  issue: ActivityIssue;
  onLoadWorklogs: (issueKey: string) => Promise<Worklog[]>;
  onFetchAttachmentUrl: (contentUrl: string, mimeType: string) => Promise<string>;
}

export function IssueCard({
  issue,
  onLoadWorklogs,
  onFetchAttachmentUrl,
}: IssueCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [worklogs, setWorklogs] = useState<Worklog[] | null>(null);
  const [loadingWorklogs, setLoadingWorklogs] = useState(false);

  const color = STATUS_COLOR[issue.status.colorName] ?? "#5e6c84";
  const typeEmoji = TYPE_EMOJI[issue.issueType.name] ?? "📌";

  const cutoff = Date.now() - WINDOW_MS;
  const recentStatusChanges = issue.statusChanges.filter(
    (s) => new Date(s.changedAt).getTime() >= cutoff
  );

  const toggle = async () => {
    const next = !expanded;
    setExpanded(next);
    if (next && worklogs === null) {
      setLoadingWorklogs(true);
      const logs = await onLoadWorklogs(issue.key);
      setWorklogs(logs);
      setLoadingWorklogs(false);
    }
  };

  return (
    <div className={`issue-card${expanded ? " issue-card--expanded" : ""}`}>
      {/* ── Header row (always visible, click to expand) ── */}
      <div className="issue-header issue-header--clickable" onClick={toggle}>
        <div className="issue-key-row">
          <span className="issue-type-icon" title={issue.issueType.name}>
            {typeEmoji}
          </span>
          <span className="issue-key">{issue.key}</span>
          {issue.assignee && (
            <span className="meta-chip muted">
              {issue.assignee.displayName}
            </span>
          )}
        </div>
        <div className="issue-header-right">
          <span className="issue-status" style={{ backgroundColor: color }}>
            {issue.status.name}
          </span>
          <span className="expand-chevron">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      <p className="issue-summary">{issue.summary}</p>

      <div className="issue-meta">
        {issue.priority && (
          <span className="meta-chip">{issue.priority.name}</span>
        )}
        <span className="meta-chip muted">
          {new Date(issue.updatedAt).toLocaleDateString()}
        </span>
        {issue.comments.length > 0 && (
          <span className="meta-chip muted">
            💬 {issue.comments.length}
          </span>
        )}
        {recentStatusChanges.length > 0 && (
          <span
            className="meta-chip status-changed"
            title="Status changed yesterday"
          >
            🔄 Status changed
          </span>
        )}
      </div>

      {/* ── Expanded details ── */}
      {expanded && (
        <div className="issue-details">
          {/* Description */}
          {issue.description && (
            <div className="detail-section">
              <div className="detail-label">Description</div>
              <div className="detail-body">{issue.description}</div>
            </div>
          )}

          {/* Status changes */}
          {recentStatusChanges.length > 0 && (
            <div className="detail-section">
              <div className="detail-label">Yesterday's Status Changes</div>
              <div className="status-changes-list">
                {recentStatusChanges.map((s, idx) => (
                  <div key={`${s.id}-${idx}`} className="status-change-entry">
                    <span className="status-change-arrow">
                      <span className="status-change-from">{s.from || "—"}</span>
                      {" → "}
                      <span className="status-change-to">{s.to || "—"}</span>
                    </span>
                    <span className="comment-date">
                      {new Date(s.changedAt).toLocaleString()}
                    </span>
                    <span className="meta-chip muted">{s.author.displayName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          <AttachmentList
            attachments={issue.attachments}
            onFetchUrl={onFetchAttachmentUrl}
          />

          {/* Comments */}
          {issue.comments.length > 0 && (
            <div className="detail-section">
              <div className="detail-label">
                Comments ({issue.comments.length})
              </div>
              <div className="comments-list">
                {issue.comments.map((c) => (
                  <div key={c.id} className="comment-entry">
                    <div className="comment-meta">
                      <strong>{c.author.displayName}</strong>
                      <span className="comment-date">
                        {new Date(c.updatedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="comment-body">{c.body}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Worklogs */}
          <div className="detail-section">
            <div className="detail-label">Worklogs</div>
            {loadingWorklogs && (
              <span className="detail-muted">Loading…</span>
            )}
            {!loadingWorklogs && worklogs?.length === 0 && (
              <span className="detail-muted">No worklogs</span>
            )}
            {!loadingWorklogs && worklogs && worklogs.length > 0 && (
              <div className="worklogs-list">
                {worklogs.map((w) => (
                  <div key={w.id} className="worklog-entry">
                    <span className="worklog-time">{w.timeSpent}</span>
                    <span className="worklog-author">
                      {w.author.displayName}
                    </span>
                    <span className="comment-date">
                      {new Date(w.startedAt).toLocaleDateString()}
                    </span>
                    {w.comment && (
                      <span className="worklog-comment">{w.comment}</span>
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

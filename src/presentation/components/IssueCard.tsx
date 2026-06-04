import { useState } from "react";
import {
  Bug,
  BookOpen,
  CheckSquare,
  Lightning,
  ArrowBendDownRight,
  PushPin,
  ChatCircle,
  ArrowsClockwise,
  CaretDown,
  ArrowRight,
} from "@phosphor-icons/react";
import type { ActivityIssue, Worklog } from "../../domain/entities";
import { AttachmentList } from "./AttachmentList";

const WINDOW_MS = 24 * 60 * 60 * 1000;

const STATUS_COLOR: Record<string, string> = {
  "blue-grey": "#5e6c84",
  yellow:      "#f59e0b",
  green:       "#34d399",
  red:         "#f87171",
};

function IssueTypeIcon({ typeName }: { typeName: string }) {
  const p = { size: 13, weight: "duotone" as const };
  switch (typeName) {
    case "Bug":     return <Bug               {...p} color="#f87171" />;
    case "Story":   return <BookOpen          {...p} color="#60a5fa" />;
    case "Task":    return <CheckSquare       {...p} color="#34d399" />;
    case "Epic":    return <Lightning         {...p} color="#f59e0b" />;
    case "Subtask": return <ArrowBendDownRight {...p} color="#94a3b8" />;
    default:        return <PushPin           {...p} color="#6b7280" />;
  }
}

interface IssueCardProps {
  issue: ActivityIssue;
  staggerIndex?: number;
  onLoadWorklogs: (issueKey: string) => Promise<Worklog[]>;
  onFetchAttachmentUrl: (contentUrl: string, mimeType: string) => Promise<string>;
}

export function IssueCard({
  issue,
  staggerIndex = 0,
  onLoadWorklogs,
  onFetchAttachmentUrl,
}: IssueCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [worklogs, setWorklogs] = useState<Worklog[] | null>(null);
  const [loadingWorklogs, setLoadingWorklogs] = useState(false);

  const dotColor = STATUS_COLOR[issue.status.colorName] ?? "#5e6c84";

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
    <div
      className={`issue-card${expanded ? " issue-card--expanded" : ""}`}
      style={{ animationDelay: `${staggerIndex * 45}ms` }}
    >
      <div className="issue-header issue-header--clickable" onClick={toggle}>
        <div className="issue-key-row">
          <span className="issue-type-icon">
            <IssueTypeIcon typeName={issue.issueType.name} />
          </span>
          <span className="issue-key">{issue.key}</span>
          {issue.assignee && (
            <span className="assignee-chip">{issue.assignee.displayName}</span>
          )}
        </div>
        <div className="issue-header-right">
          <span className="issue-status">
            <span className="status-dot" style={{ backgroundColor: dotColor }} />
            {issue.status.name}
          </span>
          <span className={`expand-chevron${expanded ? " expand-chevron--open" : ""}`}>
            <CaretDown size={11} weight="bold" />
          </span>
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
          <span className="meta-chip muted" style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <ChatCircle size={10} />
            {issue.comments.length}
          </span>
        )}
        {recentStatusChanges.length > 0 && (
          <span className="meta-chip status-changed" style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <ArrowsClockwise size={10} />
            Status changed
          </span>
        )}
      </div>

      {expanded && (
        <div className="issue-details">
          {issue.description && (
            <div className="detail-section">
              <div className="detail-label">Description</div>
              <div className="detail-body">{issue.description}</div>
            </div>
          )}

          {recentStatusChanges.length > 0 && (
            <div className="detail-section">
              <div className="detail-label">Status Changes</div>
              <div className="status-changes-list">
                {recentStatusChanges.map((s, idx) => (
                  <div key={`${s.id}-${idx}`} className="status-change-entry">
                    <span className="status-change-arrow">
                      <span className="status-change-from">{s.from || "-"}</span>
                      <ArrowRight size={10} color="var(--text-faint)" />
                      <span className="status-change-to">{s.to || "-"}</span>
                    </span>
                    <span className="status-change-meta">
                      <span>{new Date(s.changedAt).toLocaleString()}</span>
                      <span>·</span>
                      <span>{s.author.displayName}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <AttachmentList
            attachments={issue.attachments}
            onFetchUrl={onFetchAttachmentUrl}
          />

          {issue.comments.length > 0 && (
            <div className="detail-section">
              <div className="detail-label">Comments ({issue.comments.length})</div>
              <div className="comments-list">
                {issue.comments.map((c) => (
                  <div key={c.id} className="comment-entry">
                    <div className="comment-meta">
                      <span className="comment-author">{c.author.displayName}</span>
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

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
      className={[
        "bg-surface border rounded p-[14px_16px] mb-1.5 animate-[card-in_0.35s_cubic-bezier(0.16,1,0.3,1)_both]",
        "transition-[border-color,background] duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
        expanded
          ? "border-[#32323a] bg-surface-2"
          : "border-bdr hover:bg-surface-hover hover:border-[#32323a]",
      ].join(" ")}
      style={{ animationDelay: `${staggerIndex * 45}ms` }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between mb-1.5 cursor-pointer select-none group"
        onClick={toggle}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="flex-shrink-0 flex items-center opacity-90">
            <IssueTypeIcon typeName={issue.issueType.name} />
          </span>
          <span className="text-[11px] font-semibold text-accent font-mono tracking-[0.3px] flex-shrink-0 group-hover:underline underline-offset-2">
            {issue.key}
          </span>
          {issue.assignee && (
            <span className="text-[11px] text-ink-muted truncate">{issue.assignee.displayName}</span>
          )}
        </div>
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <span className="flex items-center gap-1 text-[11px] font-medium text-ink-muted whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: dotColor }} />
            {issue.status.name}
          </span>
          <span className={`text-ink-faint flex items-center transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${expanded ? "rotate-180" : ""}`}>
            <CaretDown size={11} weight="bold" />
          </span>
        </div>
      </div>

      <p className="text-[13px] text-ink mb-2.5 leading-[1.45]">{issue.summary}</p>

      {/* Meta chips */}
      <div className="flex gap-1 flex-wrap">
        {issue.priority && (
          <span className="text-[10px] font-medium bg-surface-2 border border-bdr text-ink-muted px-[7px] py-[2px] rounded">
            {issue.priority.name}
          </span>
        )}
        <span className="text-[10px] font-medium bg-surface-2 border border-bdr text-ink-muted/90 px-[7px] py-[2px] rounded">
          {new Date(issue.updatedAt).toLocaleDateString()}
        </span>
        {issue.comments.length > 0 && (
          <span className="flex items-center gap-[3px] text-[10px] font-medium bg-surface-2 border border-bdr text-ink-muted/90 px-[7px] py-[2px] rounded">
            <ChatCircle size={10} />
            {issue.comments.length}
          </span>
        )}
        {recentStatusChanges.length > 0 && (
          <span className="flex items-center gap-[3px] text-[10px] font-medium bg-warn-dim border border-warn-border text-warn px-[7px] py-[2px] rounded">
            <ArrowsClockwise size={10} />
            Status changed
          </span>
        )}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-3.5 border-t border-bdr-subtle pt-4 flex flex-col gap-[18px] animate-details-in">
          {issue.description && (
            <div>
              <div className="text-[9px] font-bold uppercase tracking-[0.8px] text-ink-muted mb-2 font-mono">Description</div>
              <div className="text-xs text-ink leading-[1.65] whitespace-pre-wrap">{issue.description}</div>
            </div>
          )}

          {recentStatusChanges.length > 0 && (
            <div>
              <div className="text-[9px] font-bold uppercase tracking-[0.8px] text-ink-muted mb-2 font-mono">Status Changes</div>
              <div className="flex flex-col gap-[7px]">
                {recentStatusChanges.map((s, idx) => (
                  <div key={`${s.id}-${idx}`} className="flex items-center gap-2.5 text-xs flex-wrap">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="text-ink-faint">{s.from || "-"}</span>
                      <ArrowRight size={10} className="text-ink-faint" />
                      <span className="text-ink font-semibold">{s.to || "-"}</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-ink-faint text-[11px] ml-auto">
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
            <div>
              <div className="text-[9px] font-bold uppercase tracking-[0.8px] text-ink-muted mb-2 font-mono">
                Comments ({issue.comments.length})
              </div>
              <div className="flex flex-col gap-2">
                {issue.comments.map((c) => (
                  <div key={c.id} className="border-l-2 border-bdr pl-3 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-semibold text-ink">{c.author.displayName}</span>
                      <span className="text-[10px] text-ink-faint font-mono">
                        {new Date(c.updatedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-ink leading-[1.55] whitespace-pre-wrap">{c.body}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.8px] text-ink-muted mb-2 font-mono">Worklogs</div>
            {loadingWorklogs && <span className="text-xs text-ink-faint">Loading...</span>}
            {!loadingWorklogs && worklogs?.length === 0 && (
              <span className="text-xs text-ink-faint">No worklogs</span>
            )}
            {!loadingWorklogs && worklogs && worklogs.length > 0 && (
              <div className="flex flex-col">
                {worklogs.map((w) => (
                  <div key={w.id} className="flex items-center gap-2.5 text-[11px] text-ink-muted py-1.5 border-b border-bdr-subtle last:border-b-0">
                    <span className="font-bold text-accent font-mono min-w-[44px]">{w.timeSpent}</span>
                    <span className="font-medium text-ink min-w-[80px]">{w.author.displayName}</span>
                    <span className="text-[10px] text-ink-faint font-mono">
                      {new Date(w.startedAt).toLocaleDateString()}
                    </span>
                    {w.comment && (
                      <span className="text-ink-muted flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{w.comment}</span>
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

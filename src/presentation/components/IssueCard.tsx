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
  CaretUp,
  CaretDoubleUp,
  CaretDoubleDown,
  Equals,
  ArrowRight,
} from "@phosphor-icons/react";
import type { ActivityIssue, Worklog } from "../../domain/entities";
import { AdfRenderer } from "./AdfRenderer";

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  "blue-gray":   { bg: "rgba(101,118,148,0.18)", text: "#aab7c9" },
  "blue-grey":   { bg: "rgba(101,118,148,0.18)", text: "#aab7c9" },
  "medium-gray": { bg: "rgba(101,118,148,0.18)", text: "#aab7c9" },
  "medium-grey": { bg: "rgba(101,118,148,0.18)", text: "#aab7c9" },
  yellow:        { bg: "rgba(12,102,228,0.18)",  text: "#7eb0ff" },
  green:         { bg: "rgba(0,135,90,0.20)",    text: "#4cce9a" },
  brown:         { bg: "rgba(255,153,31,0.18)",  text: "#ffb868" },
  "warm-red":    { bg: "rgba(222,53,11,0.18)",   text: "#ff8f73" },
  red:           { bg: "rgba(222,53,11,0.18)",   text: "#ff8f73" },
};

const DEFAULT_STATUS_STYLE = STATUS_STYLE["blue-gray"];

function IssueTypeIcon({ typeName }: { typeName: string }) {
  const p = { size: 13, weight: "duotone" as const };
  switch (typeName) {
    case "Bug":     return <Bug               {...p} color="#f87171" />;
    case "Story":   return <BookOpen          {...p} color="#60a5fa" />;
    case "Task":    return <CheckSquare       {...p} color="var(--accent)" />;
    case "Epic":    return <Lightning         {...p} color="#f59e0b" />;
    case "Subtask": return <ArrowBendDownRight {...p} color="#94a3b8" />;
    default:        return <PushPin           {...p} color="#6b7280" />;
  }
}

function PriorityBadge({ name }: { name: string }) {
  const n = name.toLowerCase();
  let color = "#94a3b8";
  let Icon = Equals;
  if (n.includes("highest") || n.includes("critical") || n.includes("blocker")) {
    color = "#cd1317"; Icon = CaretDoubleUp;
  } else if (n.includes("high") || n.includes("major")) {
    color = "#e9494a"; Icon = CaretUp;
  } else if (n.includes("medium") || n.includes("normal")) {
    color = "#e97f33"; Icon = Equals;
  } else if (n.includes("lowest") || n.includes("trivial")) {
    color = "#4fade6"; Icon = CaretDoubleDown;
  } else if (n.includes("low") || n.includes("minor")) {
    color = "#2d8738"; Icon = CaretDown;
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-surface-2 border border-bdr px-[7px] py-[2px] rounded" style={{ color }}>
      <Icon size={11} weight="bold" />
      {name}
    </span>
  );
}

type StatusCategory = "todo" | "progress" | "done" | "blocked";

const CATEGORY_STYLE: Record<StatusCategory, { bg: string; text: string; dot: string }> = {
  todo:     { bg: "rgba(101,118,148,0.18)", text: "#b6c1d1", dot: "#7a8aa3" },
  progress: { bg: "rgba(12,102,228,0.22)",  text: "#8bb8ff", dot: "#3b82f6" },
  done:     { bg: "rgba(0,135,90,0.24)",    text: "#5bd6a4", dot: "#22c55e" },
  blocked:  { bg: "rgba(222,53,11,0.22)",   text: "#ff9b80", dot: "#ef4444" },
};

function statusCategory(name: string): StatusCategory {
  const n = name.toLowerCase();
  if (/(block|hold|impediment|stuck|waiting)/.test(n)) return "blocked";
  if (/(done|closed|resolved|complete|merged|deployed|released|finished|shipped|approved)/.test(n)) return "done";
  if (/(progress|review|develop|doing|testing|qa|implement|started|active)/.test(n)) return "progress";
  return "todo";
}

function StatusPill({ name }: { name: string }) {
  const label = name || "—";
  const style = CATEGORY_STYLE[statusCategory(label)];
  return (
    <span
      className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.4px] rounded-sm leading-none whitespace-nowrap px-2 py-[4px]"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {label}
    </span>
  );
}

interface IssueCardProps {
  issue: ActivityIssue;
  staggerIndex?: number;
  windowStart: number;
  windowEnd: number;
  currentUserEmail: string;
  onLoadWorklogs: (issueKey: string) => Promise<Worklog[]>;
  onFetchAttachmentUrl: (contentUrl: string, mimeType: string) => Promise<string>;
}

export function IssueCard({
  issue,
  staggerIndex = 0,
  windowStart,
  windowEnd,
  currentUserEmail,
  onLoadWorklogs,
  onFetchAttachmentUrl,
}: IssueCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [worklogs, setWorklogs] = useState<Worklog[] | null>(null);
  const [showOlderStatus, setShowOlderStatus] = useState(false);
  const [showDesc, setShowDesc] = useState(false);
  const [showOlderComments, setShowOlderComments] = useState(false);

  const isSelf = (author: { email?: string }) =>
    !!author.email && author.email.toLowerCase() === currentUserEmail.toLowerCase();

  const statusStyle = STATUS_STYLE[issue.status.colorName] ?? DEFAULT_STATUS_STYLE;

  const recentStatusChanges = issue.statusChanges
    .filter((s) => {
      const t = new Date(s.changedAt).getTime();
      return t >= windowStart && t < windowEnd;
    })
    .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());

  const toggle = async () => {
    const next = !expanded;
    setExpanded(next);
    if (next && worklogs === null) {
      const logs = await onLoadWorklogs(issue.key);
      setWorklogs(logs);
    }
  };

  return (
    <div
      className="card-shell animate-card-in select-none cursor-pointer"
      style={{
        animationDelay: `${staggerIndex * 50}ms`,
        transition: "box-shadow 220ms cubic-bezier(0.16,1,0.3,1), border-color 220ms cubic-bezier(0.16,1,0.3,1)",
      }}
      onClick={toggle}
    >
      <div
        className="card-core p-[14px_16px]"
        style={{
          transition: "background 220ms cubic-bezier(0.16,1,0.3,1)",
          background: expanded ? "#151519" : "#111114",
        }}
        onMouseEnter={e => { if (!expanded) (e.currentTarget.style.background = "#141418"); }}
        onMouseLeave={e => { if (!expanded) (e.currentTarget.style.background = "#111114"); }}
      >
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5 group">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="flex-shrink-0 flex items-center opacity-80">
            <IssueTypeIcon typeName={issue.issueType.name} />
          </span>
          <span className="text-[10.5px] font-semibold text-accent font-mono tracking-[0.4px] flex-shrink-0 group-hover:underline underline-offset-2">
            {issue.key}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="text-[9.5px] font-bold uppercase tracking-[0.5px] px-[7px] py-[3px] rounded whitespace-nowrap leading-none"
            style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
          >
            {issue.status.name}
          </span>
          <span className={`text-ink-faint flex items-center ${expanded ? "rotate-180" : ""}`}
            style={{ transition: "transform 260ms cubic-bezier(0.16,1,0.3,1)" }}>
            <CaretDown size={10} weight="bold" />
          </span>
        </div>
      </div>

      <p className="text-[13px] text-ink mb-2.5 leading-[1.45] tracking-[-0.1px]">{issue.summary}</p>

      {/* Meta chips */}
      <div className="flex gap-1 flex-wrap">
        {issue.priority && <PriorityBadge name={issue.priority.name} />}
        {issue.comments.length > 0 && (
          <span className="flex items-center gap-[3px] text-[10px] font-medium text-ink-faint px-[7px] py-[2px] rounded"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <ChatCircle size={10} />
            {issue.comments.length}
          </span>
        )}
        {recentStatusChanges.length > 0 && (
          <span className="flex items-center gap-[3px] text-[10px] font-medium text-warn px-[7px] py-[2px] rounded"
            style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(245,158,11,0.18)" }}>
            <ArrowsClockwise size={10} />
            Status changed
          </span>
        )}
      </div>

      {/*
        Expand / collapse — CSS grid trick.
        gridTemplateRows: 0fr → 1fr animates height via CSS transition.
        Always rendered in DOM (accessible, interruptible).
      */}
      <div
        className="grid overflow-hidden"
        style={{
          gridTemplateRows: expanded ? "1fr" : "0fr",
          transition: "grid-template-rows 300ms cubic-bezier(0.16,1,0.3,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden min-h-0">
          <div
            className="mt-3.5 pt-4 flex flex-col gap-[18px]"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.05)",
              opacity: expanded ? 1 : 0,
              transition: `opacity 180ms cubic-bezier(0.16,1,0.3,1) ${expanded ? "80ms" : "0ms"}`,
            }}
          >
            {/* ── Status changes ───────────────────────────────────────────── */}
            {(() => {
              const olderStatusChanges = issue.statusChanges
                .filter((s) => {
                  const t = new Date(s.changedAt).getTime();
                  return t < windowStart || t >= windowEnd;
                })
                .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());

              const renderStatusList = (changes: typeof recentStatusChanges) => (
                <div className="flex flex-col">
                  {changes.map((s, idx) => {
                    const toDot = CATEGORY_STYLE[statusCategory(s.to || "")].dot;
                    const last = idx === changes.length - 1;
                    return (
                      <div key={`${s.id}-${idx}`} className="flex gap-3">
                        <div className="flex flex-col items-center w-[10px] flex-shrink-0">
                          <span className="w-[10px] h-[10px] rounded-full flex-shrink-0 border-2 border-surface-2"
                            style={{ backgroundColor: toDot }}
                          />
                          {!last && <span className="w-px flex-1 bg-[#3a3a44]" />}
                        </div>
                        <div className={`flex-1 min-w-0 -mt-[1px] ${last ? "" : "pb-4"}`}>
                          <div className="flex items-center gap-2 flex-wrap">
                            <StatusPill name={s.from} />
                            <ArrowRight size={13} weight="bold" className="text-ink-muted flex-shrink-0" />
                            <StatusPill name={s.to} />
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-ink-faint mt-1.5">
                            {!isSelf(s.author) && (
                              <>
                                <span className="font-medium text-ink-muted">{s.author.displayName}</span>
                                <span>·</span>
                              </>
                            )}
                            <span className="font-mono">{new Date(s.changedAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );

              if (recentStatusChanges.length === 0 && olderStatusChanges.length === 0) return null;
              return (
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.8px] text-ink-muted mb-2.5 font-mono">Status Changes</div>
                  {recentStatusChanges.length > 0 && renderStatusList(recentStatusChanges)}
                  {olderStatusChanges.length > 0 && (
                    <div className={recentStatusChanges.length > 0 ? "mt-2" : ""}>
                      <button
                        className="flex items-center gap-1 text-[10px] text-ink-faint hover:text-ink-muted transition-colors duration-150 mb-2"
                        onClick={(e) => { e.stopPropagation(); setShowOlderStatus((v) => !v); }}
                      >
                        <CaretDown size={10} weight="bold" className={`transition-transform duration-150 ${showOlderStatus ? "rotate-180" : ""}`} />
                        {showOlderStatus ? "Hide" : `Show ${olderStatusChanges.length} older change${olderStatusChanges.length > 1 ? "s" : ""}`}
                      </button>
                      {showOlderStatus && (
                        <div className="opacity-70">
                          {renderStatusList(olderStatusChanges)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ── Description ──────────────────────────────────────────────── */}
            {issue.description && (() => {
              const changedInWindow = issue.descriptionLastChangedAt
                ? (() => {
                    const t = new Date(issue.descriptionLastChangedAt).getTime();
                    return t >= windowStart && t < windowEnd;
                  })()
                : false;

              if (changedInWindow) {
                return (
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.8px] text-ink-muted mb-2.5 font-mono">Description</div>
                    <AdfRenderer rich={issue.descriptionRich} fallback={issue.description} attachments={issue.attachments} onFetchUrl={onFetchAttachmentUrl} />
                  </div>
                );
              }
              return (
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.8px] text-ink-muted mb-2.5 font-mono">Description</div>
                  <button
                    className="flex items-center gap-1 text-[10px] text-ink-faint hover:text-ink-muted transition-colors duration-150"
                    onClick={(e) => { e.stopPropagation(); setShowDesc((v) => !v); }}
                  >
                    <CaretDown size={10} weight="bold" className={`transition-transform duration-150 ${showDesc ? "rotate-180" : ""}`} />
                    {showDesc ? "Hide description" : "Show description"}
                  </button>
                  {showDesc && (
                    <div className="mt-2 opacity-80">
                      <AdfRenderer rich={issue.descriptionRich} fallback={issue.description} attachments={issue.attachments} onFetchUrl={onFetchAttachmentUrl} />
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ── Comments ─────────────────────────────────────────────────── */}
            {issue.comments.length > 0 && (() => {
              const inWindow = (iso: string) => {
                const t = new Date(iso).getTime();
                return t >= windowStart && t < windowEnd;
              };
              const recentComments = issue.comments.filter(
                (c) => inWindow(c.createdAt) || inWindow(c.updatedAt)
              );
              const olderComments = issue.comments.filter(
                (c) => !inWindow(c.createdAt) && !inWindow(c.updatedAt)
              );

              const renderComment = (c: typeof issue.comments[0]) => (
                <div key={c.id} className="border-l-2 border-bdr pl-3 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    {!isSelf(c.author) && (
                      <span className="text-[11px] font-semibold text-ink">{c.author.displayName}</span>
                    )}
                    <span className="text-[10px] text-ink-faint font-mono">
                      {new Date(c.updatedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-ink leading-[1.55]">
                    <AdfRenderer rich={c.bodyRich} fallback={c.body} attachments={issue.attachments} onFetchUrl={onFetchAttachmentUrl} />
                  </div>
                </div>
              );

              return (
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.8px] text-ink-muted mb-2.5 font-mono">
                    Comments{recentComments.length > 0 ? ` (${recentComments.length})` : ""}
                  </div>
                  {recentComments.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {recentComments.map(renderComment)}
                    </div>
                  )}
                  {olderComments.length > 0 && (
                    <div className={recentComments.length > 0 ? "mt-2" : ""}>
                      <button
                        className="flex items-center gap-1 text-[10px] text-ink-faint hover:text-ink-muted transition-colors duration-150 mb-2"
                        onClick={(e) => { e.stopPropagation(); setShowOlderComments((v) => !v); }}
                      >
                        <CaretDown size={10} weight="bold" className={`transition-transform duration-150 ${showOlderComments ? "rotate-180" : ""}`} />
                        {showOlderComments
                          ? "Hide older comments"
                          : `Show ${olderComments.length} older comment${olderComments.length > 1 ? "s" : ""}`}
                      </button>
                      {showOlderComments && (
                        <div className="flex flex-col gap-2 opacity-70">
                          {olderComments.map(renderComment)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ── Worklogs ─────────────────────────────────────────────────── */}
            {worklogs && worklogs.length > 0 && (
              <div>
                <div className="text-[9px] font-bold uppercase tracking-[0.8px] text-ink-muted mb-2.5 font-mono">Worklogs</div>
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
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

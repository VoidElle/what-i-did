import { useState, useEffect } from "react";
import { Warning } from "@phosphor-icons/react";
import type { ActivityIssue, SourceConfig } from "../../domain/entities";
import type { IActivityRepository } from "../../domain/ports";
import { fetchYesterdayActivity } from "../../application/fetchYesterdayActivity";
import { IssueCard } from "./IssueCard";
import { StandupSummary } from "./StandupSummary";
import { BrandIcon } from "./BrandIcon";

interface Props {
  config: SourceConfig;
  repo: IActivityRepository;
  onOpenSettings: () => void;
}

function groupByProject(issues: ActivityIssue[]): Map<string, ActivityIssue[]> {
  const map = new Map<string, ActivityIssue[]>();
  for (const issue of issues) {
    const proj = issue.key.split("-")[0];
    if (!map.has(proj)) map.set(proj, []);
    map.get(proj)!.push(issue);
  }
  return map;
}

function formatYesterday(): string {
  const d = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function SkeletonCard() {
  return (
    <div className="bg-surface border border-bdr-subtle rounded p-4 mb-2">
      <div className="shimmer-bg animate-shimmer h-2.5 rounded-full w-[30%] mb-2" />
      <div className="shimmer-bg animate-shimmer h-2.5 rounded-full w-[90%] mb-3" />
      <div className="flex gap-1.5 mt-2.5">
        <div className="shimmer-bg animate-shimmer w-[52px] h-[18px] rounded" />
        <div className="shimmer-bg animate-shimmer w-[52px] h-[18px] rounded" />
        <div className="shimmer-bg animate-shimmer w-[52px] h-[18px] rounded" />
      </div>
    </div>
  );
}

export function MainScreen({ config, repo, onOpenSettings }: Props) {
  const [issues, setIssues] = useState<ActivityIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = (cancelled?: { current: boolean }) => {
    setLoading(true);
    setError(null);
    fetchYesterdayActivity(repo, config)
      .then((data) => { if (!cancelled?.current) setIssues(data); })
      .catch((e: Error) => { if (!cancelled?.current) setError(e.message); })
      .finally(() => { if (!cancelled?.current) setLoading(false); });
  };

  useEffect(() => {
    const c = { current: false };
    load(c);
    return () => { c.current = true; };
  }, [config, repo]);

  const grouped = groupByProject(issues);
  const projects = [...grouped.keys()];
  let cardIndex = 0;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-sidebar min-w-sidebar flex-shrink-0 border-r border-bdr-subtle bg-surface flex flex-col overflow-hidden">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-[18px] pt-5 pb-4 border-b border-bdr-subtle">
          <div className="w-[26px] h-[26px] bg-accent-dim border border-accent-border rounded-[7px] flex items-center justify-center flex-shrink-0 text-accent">
            <BrandIcon size={14} />
          </div>
          <span className="text-[13px] font-semibold text-ink tracking-[-0.2px]">WhatDidIDo</span>
        </div>

        {/* Date */}
        <div className="px-[18px] py-3.5 border-b border-bdr-subtle">
          <span className="block text-[10px] font-semibold tracking-[0.7px] uppercase text-ink-faint mb-1">
            Activity date
          </span>
          <span className="text-[13px] font-medium text-ink">{formatYesterday()}</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 scrollbar-custom">
          <span className="block text-[10px] font-semibold tracking-[0.7px] uppercase text-ink-faint px-2 pt-1 pb-2">
            Projects
          </span>
          {!loading && !error && projects.length === 0 && (
            <span className="block text-[11px] text-ink-faint px-2 py-1">No activity</span>
          )}
          {projects.map((proj) => (
            <a
              key={proj}
              className="flex items-center justify-between px-2 py-1.5 rounded-sm no-underline text-ink-muted text-xs font-medium transition-colors duration-150 cursor-pointer hover:bg-surface-2 hover:text-ink"
              href={`#${proj}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(proj)?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <span className="font-mono text-[11px] text-accent">{proj}</span>
              <span className="text-[10px] font-semibold bg-surface-2 border border-bdr text-ink-muted rounded-full px-1.5 min-w-[18px] text-center">
                {grouped.get(proj)!.length}
              </span>
            </a>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-2.5 py-3 border-t border-bdr-subtle flex flex-col gap-1.5">
          {!loading && !error && <StandupSummary issues={issues} />}
          <button
            className="flex items-center gap-1.5 bg-transparent text-ink-muted px-2 py-1.5 rounded-sm border border-transparent text-xs font-medium transition-[background,color,border-color,transform] duration-150 ease-ui w-full hover:bg-surface-2 hover:text-ink hover:border-bdr active:scale-[0.97]"
            onClick={onOpenSettings}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M12 2v2M12 20v2M4.93 4.93a10 10 0 0 0 0 14.14M2 12h2M20 12h2" />
            </svg>
            Settings
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-8 pt-7 pb-10 scrollbar-custom">
        {loading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {!loading && error && (
          <div className="bg-danger-bg border border-danger-border rounded p-[18px_20px] max-w-[480px]">
            <div className="flex items-center gap-2 font-semibold text-[13px] text-danger-text mb-1.5">
              <Warning size={14} />
              Error fetching activity
            </div>
            <p className="text-xs text-danger-text/80 mb-3.5 leading-relaxed">{error}</p>
            <button
              className="bg-transparent text-ink-muted px-3.5 py-2 rounded-sm border border-bdr text-[13px] transition-[border-color,color,transform] duration-150 ease-ui hover:border-[#3a3a44] hover:text-ink active:scale-[0.97]"
              onClick={() => load()}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && issues.length === 0 && (
          <div className="py-[72px] text-ink-muted text-[13px] flex flex-col items-start gap-2">
            <span className="text-[15px] font-medium text-ink">No activity yesterday</span>
            <span>No comments or status changes found for your account.</span>
          </div>
        )}

        {!loading && !error &&
          [...grouped.entries()].map(([proj, projIssues]) => (
            <section key={proj} id={proj} className="mb-9">
              <h2 className="text-[10px] font-bold tracking-[0.8px] uppercase text-ink-muted mb-3 font-mono">
                {proj}
              </h2>
              {projIssues.map((issue) => {
                const idx = cardIndex++;
                return (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    staggerIndex={idx}
                    onLoadWorklogs={(key) => repo.fetchWorklogs(config, key)}
                    onFetchAttachmentUrl={(url, mime) =>
                      repo.fetchAttachmentUrl(config, url, mime)
                    }
                  />
                );
              })}
            </section>
          ))}
      </main>
    </div>
  );
}

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
    <div className="skeleton-card">
      <div className="skeleton-line skeleton-line--short" />
      <div className="skeleton-line skeleton-line--long" />
      <div className="skeleton-meta">
        <div className="skeleton-chip" />
        <div className="skeleton-chip" />
        <div className="skeleton-chip" />
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
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <BrandIcon size={14} />
          </div>
          <span className="brand-name">WhatDidIDo</span>
        </div>

        <div className="sidebar-meta">
          <span className="sidebar-label">Activity date</span>
          <span className="sidebar-date">{formatYesterday()}</span>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-nav-label">Projects</span>
          {!loading && !error && projects.length === 0 && (
            <span style={{ fontSize: 11, color: "var(--text-faint)", padding: "4px 8px", display: "block" }}>
              No activity
            </span>
          )}
          {projects.map((proj) => (
            <a
              key={proj}
              className="sidebar-nav-item"
              href={`#${proj}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(proj)?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <span className="nav-proj-key">{proj}</span>
              <span className="nav-proj-count">{grouped.get(proj)!.length}</span>
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          {!loading && !error && <StandupSummary issues={issues} />}
          <button className="btn-settings" onClick={onOpenSettings}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M12 2v2M12 20v2M4.93 4.93a10 10 0 0 0 0 14.14M2 12h2M20 12h2" />
            </svg>
            Settings
          </button>
        </div>
      </aside>

      {/* ── Content ── */}
      <main className="content-area">
        {loading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {!loading && error && (
          <div className="state-error">
            <div className="state-error-header">
              <Warning size={14} />
              Error fetching activity
            </div>
            <p>{error}</p>
            <button className="btn-secondary" onClick={() => load()}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && issues.length === 0 && (
          <div className="state-empty">
            <span className="state-empty-title">No activity yesterday</span>
            <span>No comments or status changes found for your account.</span>
          </div>
        )}

        {!loading &&
          !error &&
          [...grouped.entries()].map(([proj, projIssues]) => (
            <section key={proj} id={proj} className="project-group">
              <h2 className="project-name">{proj}</h2>
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

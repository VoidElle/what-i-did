import { useState, useEffect, useRef } from "react";
import { Warning } from "@phosphor-icons/react";
import type { ActivityIssue, SourceConfig } from "../../domain/entities";
import type { IActivityRepository } from "../../domain/ports";
import { fetchYesterdayActivity, dayWindow } from "../../application/fetchYesterdayActivity";
import { mockActivity } from "../../data/mock/mockActivity";
import { IssueCard } from "./IssueCard";
import { StandupSummary } from "./StandupSummary";
import { Calendar } from "./Calendar";
import { BrandIcon } from "./BrandIcon";

interface Props {
  config: SourceConfig;
  repo: IActivityRepository;
  onOpenSettings: () => void;
  onOpenCustomization: () => void;
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

function defaultDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(0, 0, 0, 0);
  return d;
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

export function MainScreen({ config, repo, onOpenSettings, onOpenCustomization }: Props) {
  const [issues, setIssues] = useState<ActivityIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(defaultDate);

  const load = (cancelled?: { current: boolean }) => {
    if (config.devMode) {
      setIssues(mockActivity);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetchYesterdayActivity(repo, config, date)
      .then((data) => { if (!cancelled?.current) setIssues(data); })
      .catch((e: Error) => { if (!cancelled?.current) setError(e.message); })
      .finally(() => { if (!cancelled?.current) setLoading(false); });
  };

  useEffect(() => {
    const c = { current: false };
    load(c);
    return () => { c.current = true; };
  }, [config, repo, date]);

  const window = dayWindow(date);
  const grouped = groupByProject(issues);
  const projects = [...grouped.keys()];
  let cardIndex = 0;

  const [activeProject, setActiveProject] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current?.disconnect();
    if (!projects.length) return;
    const entries = new Map<string, number>();
    observerRef.current = new IntersectionObserver(
      (obs) => {
        obs.forEach((entry) => entries.set(entry.target.id, entry.intersectionRatio));
        const top = [...entries.entries()].sort((a, b) => b[1] - a[1])[0];
        if (top && top[1] > 0) setActiveProject(top[0]);
      },
      { threshold: [0, 0.1, 0.5, 1] }
    );
    projects.forEach((p) => {
      const el = document.getElementById(p);
      if (el) observerRef.current!.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, [projects.join(",")]);

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Sidebar — glass panel with inset highlight */}
      <aside className="w-sidebar min-w-sidebar flex-shrink-0 flex flex-col overflow-hidden relative"
        style={{ background: "linear-gradient(180deg, #141418 0%, #0f0f12 100%)", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
        {/* Inset top highlight */}
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.07) 50%, transparent 100%)" }} />

        {/* Brand */}
        <div className="flex items-center gap-2.5 px-4 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="w-7 h-7 flex items-center justify-center flex-shrink-0 relative"
            style={{ color: "var(--accent)", background: "rgba(var(--accent-rgb), 0.08)", border: "1px solid rgba(var(--accent-rgb), 0.2)", borderRadius: "8px", boxShadow: "0 0 12px rgba(var(--accent-rgb), 0.08)" }}>
            <BrandIcon size={15} />
          </div>
          <span className="text-[13px] font-semibold text-ink tracking-[-0.3px]">What I Did</span>
        </div>

        {/* Date */}
        <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <span className="block text-[9px] font-semibold tracking-[0.9px] uppercase text-ink-faint mb-2">
            Activity date
          </span>
          <Calendar value={date} onChange={setDate} />
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 scrollbar-custom">
          <span className="block text-[9px] font-semibold tracking-[0.9px] uppercase text-ink-faint px-2 pt-0.5 pb-2.5">
            Projects
          </span>
          {!loading && !error && projects.length === 0 && (
            <span className="block text-[11px] text-ink-faint px-2 py-1">No activity</span>
          )}
          {projects.map((proj) => {
            const isActive = activeProject === proj || (!activeProject && proj === projects[0]);
            return (
            <a
              key={proj}
              className="flex items-center justify-between px-2 py-1.5 rounded no-underline text-xs font-medium cursor-pointer"
              style={{
                color: isActive ? "#ededf2" : "#5e5e72",
                transition: "color 200ms cubic-bezier(0.16,1,0.3,1), background 200ms cubic-bezier(0.16,1,0.3,1)",
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = "#9898a8"; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = "#5e5e72"; }}
              href={`#${proj}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(proj)?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <div className="flex items-center gap-1.5">
                <div className="w-[3px] h-[3px] rounded-full flex-shrink-0"
                  style={{
                    background: isActive ? "var(--accent)" : "rgba(255,255,255,0.15)",
                    transition: "background 200ms cubic-bezier(0.16,1,0.3,1)",
                  }} />
                <span className="font-mono text-[11px] tracking-[-0.2px]">{proj}</span>
              </div>
              <span className="text-[10px] font-semibold tabular-nums"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  color: isActive ? "#9898a8" : "#3e3e52",
                  borderRadius: "99px", padding: "1px 6px",
                  transition: "color 200ms cubic-bezier(0.16,1,0.3,1)",
                }}>
                {grouped.get(proj)!.length}
              </span>
            </a>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-2.5 py-3 flex flex-col gap-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {!loading && !error && <StandupSummary issues={issues} windowStart={window.start} windowEnd={window.end} />}
          <button
            className="flex items-center gap-1.5 text-ink-faint px-2 py-1.5 rounded text-xs font-medium w-full"
            style={{ transition: "background 200ms cubic-bezier(0.16,1,0.3,1), color 200ms cubic-bezier(0.16,1,0.3,1)", background: "transparent" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#9898a8"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#5e5e72"; }}
            onMouseDown={e => (e.currentTarget.style.transform = "scale(0.97)")}
            onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
            onClick={onOpenCustomization}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
            Customization
          </button>
          <button
            className="flex items-center gap-1.5 text-ink-faint px-2 py-1.5 rounded text-xs font-medium w-full"
            style={{ transition: "background 200ms cubic-bezier(0.16,1,0.3,1), color 200ms cubic-bezier(0.16,1,0.3,1)", background: "transparent" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#9898a8"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#5e5e72"; }}
            onMouseDown={e => (e.currentTarget.style.transform = "scale(0.97)")}
            onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
            onClick={onOpenSettings}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M12 2v2M12 20v2M4.93 4.93a10 10 0 0 0 0 14.14M2 12h2M20 12h2" />
            </svg>
            Settings
          </button>
        </div>
      </aside>

      {/* Content — ambient orb behind */}
      <main className="ambient-orb flex-1 overflow-y-auto px-7 pt-7 pb-12 scrollbar-custom relative">
        {loading && (
          <div className="flex flex-col gap-2.5">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {!loading && error && (
          <div className="card-shell max-w-[480px] mt-2">
            <div className="card-core p-5">
              <div className="flex items-center gap-2 font-semibold text-[13px] text-danger-text mb-1.5">
                <Warning size={13} weight="duotone" />
                Error fetching activity
              </div>
              <p className="text-xs text-danger-text/70 mb-4 leading-relaxed">{error}</p>
              <button
                className="text-ink-muted px-3.5 py-1.5 rounded text-xs font-medium"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", transition: "all 200ms cubic-bezier(0.16,1,0.3,1)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                onClick={() => load()}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!loading && !error && issues.length === 0 && (
          <div className="py-16 flex flex-col items-start gap-1.5">
            <span className="text-[15px] font-medium text-ink tracking-[-0.2px]">No activity found</span>
            <span className="text-[13px] text-ink-faint">No comments or status changes for your account on this date.</span>
          </div>
        )}

        {!loading && !error &&
          [...grouped.entries()].map(([proj, projIssues]) => (
            <section key={proj} id={proj} className="mb-10">
              {/* Project title */}
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-[9px] font-bold tracking-[1px] uppercase text-ink-faint font-mono">{proj}</h2>
                <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.05) 0%, transparent 100%)" }} />
              </div>
              <div className="flex flex-col gap-2">
                {projIssues.map((issue) => {
                  const idx = cardIndex++;
                  return (
                    <IssueCard
                      key={issue.id}
                      issue={issue}
                      staggerIndex={idx}
                      windowStart={window.start}
                      windowEnd={window.end}
                      currentUserEmail={config.email}
                      onLoadWorklogs={(key) => repo.fetchWorklogs(config, key)}
                      onFetchAttachmentUrl={(url, mime) =>
                        repo.fetchAttachmentUrl(config, url, mime)
                      }
                    />
                  );
                })}
              </div>
            </section>
          ))}
      </main>
    </div>
  );
}

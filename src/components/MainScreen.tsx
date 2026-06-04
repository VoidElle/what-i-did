import { useState, useEffect } from "react";
import type { JiraConfig, JiraIssue } from "../types/jira";
import { fetchYesterdayIssues } from "../api/jira";
import { IssueCard } from "./IssueCard";
import { StandupSummary } from "./StandupSummary";

interface Props {
  config: JiraConfig;
  onOpenSettings: () => void;
}

function groupByProject(issues: JiraIssue[]): Map<string, JiraIssue[]> {
  const map = new Map<string, JiraIssue[]>();
  for (const issue of issues) {
    const proj = issue.key.split("-")[0];
    if (!map.has(proj)) map.set(proj, []);
    map.get(proj)!.push(issue);
  }
  return map;
}

export function MainScreen({ config, onOpenSettings }: Props) {
  const [issues, setIssues] = useState<JiraIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchYesterdayIssues(config)
      .then((data) => {
        if (!cancelled) setIssues(data);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [config]);

  const grouped = groupByProject(issues);

  return (
    <div className="main-screen">
      <header className="main-header">
        <h1 className="app-title">WhatDidIDo?</h1>
        <div className="header-actions">
          {!loading && !error && <StandupSummary issues={issues} />}
          <button
            className="btn-icon"
            onClick={onOpenSettings}
            title="Settings"
          >
            ⚙️
          </button>
        </div>
      </header>

      <main className="main-content">
        {loading && (
          <div className="state-message">
            <span className="spinner" />
            Fetching yesterday's activity…
          </div>
        )}

        {!loading && error && (
          <div className="state-error">
            <strong>⚠️ Error</strong>
            <p>{error}</p>
            <button
              className="btn-secondary"
              onClick={() => {
                setLoading(true);
                setError(null);
                fetchYesterdayIssues(config)
                  .then(setIssues)
                  .catch((e: Error) => setError(e.message))
                  .finally(() => setLoading(false));
              }}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && issues.length === 0 && (
          <div className="state-empty">No activity found yesterday 🎉</div>
        )}

        {!loading &&
          !error &&
          [...grouped.entries()].map(([proj, projIssues]) => (
            <section key={proj} className="project-group">
              <h2 className="project-name">{proj}</h2>
              {projIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} config={config} />
              ))}
            </section>
          ))}
      </main>
    </div>
  );
}

import type { ActivityIssue, JiraConnection, SourceConfig } from "../domain/entities";
import type { IActivityRepository } from "../domain/ports";

export function dayWindow(date: Date): { start: number; end: number } {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start: start.getTime(), end: end.getTime() };
}

function userActedOnIssue(
  issue: ActivityIssue,
  email: string,
  window: { start: number; end: number }
): boolean {
  const userEmail = email.toLowerCase();

  const byUser = (a: { email?: string }) =>
    a.email ? a.email.toLowerCase() === userEmail : false;

  const inWindow = (iso: string) => {
    const t = new Date(iso).getTime();
    return t >= window.start && t < window.end;
  };

  const commentedYesterday = issue.comments.some(
    (c) => byUser(c.author) && (inWindow(c.createdAt) || inWindow(c.updatedAt))
  );
  if (commentedYesterday) return true;

  return issue.statusChanges.some(
    (s) => byUser(s.author) && inWindow(s.changedAt)
  );
}

export interface FetchResult {
  issues: ActivityIssue[];
  errors: { connectionId: string; connectionName: string; message: string }[];
}

export async function fetchYesterdayActivity(
  repo: IActivityRepository,
  config: SourceConfig,
  date: Date
): Promise<FetchResult> {
  const window = dayWindow(date);

  const results = await Promise.allSettled(
    config.connections.map((conn: JiraConnection) =>
      repo
        .fetchYesterdayIssues(conn, date)
        .then((issues) =>
          issues.filter((issue) => userActedOnIssue(issue, conn.email, window))
        )
    )
  );

  const issues: ActivityIssue[] = [];
  const errors: FetchResult["errors"] = [];

  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      issues.push(...result.value);
    } else {
      const conn = config.connections[i];
      errors.push({
        connectionId: conn.id,
        connectionName: conn.name,
        message: (result.reason as Error)?.message ?? "Unknown error",
      });
    }
  });

  return { issues, errors };
}

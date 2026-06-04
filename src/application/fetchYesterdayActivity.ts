import type { ActivityIssue, SourceConfig } from "../domain/entities";
import type { IActivityRepository } from "../domain/ports";

const WINDOW_MS = 24 * 60 * 60 * 1000;

function userActedOnIssue(issue: ActivityIssue, email: string): boolean {
  const cutoff = Date.now() - WINDOW_MS;
  const userEmail = email.toLowerCase();

  const byUser = (a: { email?: string }) =>
    a.email ? a.email.toLowerCase() === userEmail : false;

  const inWindow = (iso: string) => new Date(iso).getTime() >= cutoff;

  const commentedYesterday = issue.comments.some(
    (c) => byUser(c.author) && (inWindow(c.createdAt) || inWindow(c.updatedAt))
  );
  if (commentedYesterday) return true;

  return issue.statusChanges.some(
    (s) => byUser(s.author) && inWindow(s.changedAt)
  );
}

export async function fetchYesterdayActivity(
  repo: IActivityRepository,
  config: SourceConfig
): Promise<ActivityIssue[]> {
  const issues = await repo.fetchYesterdayIssues(config);
  return issues.filter((issue) => userActedOnIssue(issue, config.email));
}

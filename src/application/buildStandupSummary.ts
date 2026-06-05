import type { ActivityIssue } from "../domain/entities";

function inWindow(iso: string, windowStart: number, windowEnd: number): boolean {
  const t = new Date(iso).getTime();
  return t >= windowStart && t < windowEnd;
}

export function buildStandupSummary(
  issues: ActivityIssue[],
  windowStart: number,
  windowEnd: number
): string {
  if (!issues.length) return "";

  // Group by project
  const byProject = new Map<string, ActivityIssue[]>();
  for (const issue of issues) {
    const key = issue.project.name;
    if (!byProject.has(key)) byProject.set(key, []);
    byProject.get(key)!.push(issue);
  }

  const sections: string[] = [];

  for (const [projectName, projectIssues] of byProject) {
    const lines: string[] = [`[${projectName}]`];

    for (const issue of projectIssues) {
      const parts: string[] = [];

      // Status transition in window
      const inWindowChanges = issue.statusChanges.filter(
        (s) => inWindow(s.changedAt, windowStart, windowEnd)
      );
      if (inWindowChanges.length > 0) {
        const oldest = inWindowChanges[inWindowChanges.length - 1];
        const newest = inWindowChanges[0];
        if (oldest.from && oldest.from !== newest.to) {
          parts.push(`${oldest.from} → ${newest.to}`);
        } else {
          parts.push(newest.to);
        }
      } else {
        parts.push(issue.status.name);
      }

      // Comments added in window
      const recentComments = issue.comments.filter(
        (c) => inWindow(c.createdAt, windowStart, windowEnd)
      );
      if (recentComments.length === 1) parts.push("1 comment added");
      else if (recentComments.length > 1) parts.push(`${recentComments.length} comments added`);

      // Description updated in window
      if (
        issue.descriptionLastChangedAt &&
        inWindow(issue.descriptionLastChangedAt, windowStart, windowEnd)
      ) {
        parts.push("description updated");
      }

      lines.push(`• [${issue.key}] ${issue.summary} (${parts.join(", ")})`);
    }

    sections.push(lines.join("\n"));
  }

  const label = new Date(windowStart).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return `${label}:\n\n${sections.join("\n\n")}`;
}

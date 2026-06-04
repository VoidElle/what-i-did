import type { ActivityIssue } from "../domain/entities";

export function buildStandupSummary(issues: ActivityIssue[]): string {
  const lines = issues.map(
    (i) => `- [${i.key}] ${i.summary} → ${i.status.name}`
  );
  return `Yesterday:\n${lines.join("\n")}`;
}

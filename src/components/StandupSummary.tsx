import { useState } from "react";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import type { JiraIssue } from "../types/jira";

interface Props {
  issues: JiraIssue[];
}

function buildStandup(issues: JiraIssue[]): string {
  const lines = issues.map(
    (i) => `- [${i.key}] ${i.fields.summary} → ${i.fields.status.name}`
  );
  return `Yesterday:\n${lines.join("\n")}`;
}

export function StandupSummary({ issues }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await writeText(buildStandup(issues));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      className="btn-copy"
      onClick={handleCopy}
      disabled={issues.length === 0}
      title="Copy standup summary to clipboard"
    >
      {copied ? "✓ Copied!" : "📋 Copy standup summary"}
    </button>
  );
}

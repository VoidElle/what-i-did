import { useState } from "react";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import type { ActivityIssue } from "../../domain/entities";
import { buildStandupSummary } from "../../application/buildStandupSummary";

interface Props {
  issues: ActivityIssue[];
}

export function StandupSummary({ issues }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await writeText(buildStandupSummary(issues));
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

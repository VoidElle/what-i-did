import { useState } from "react";
import { ClipboardText, Check } from "@phosphor-icons/react";
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
      className={`btn-copy${copied ? " btn-copy--success" : ""}`}
      onClick={handleCopy}
      disabled={issues.length === 0}
      title="Copy standup summary to clipboard"
    >
      {copied
        ? <><Check size={12} weight="bold" /> Copied</>
        : <><ClipboardText size={12} /> Copy standup</>
      }
    </button>
  );
}

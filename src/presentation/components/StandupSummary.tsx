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
      className={[
        "flex items-center justify-center gap-1.5 px-3 py-[7px] rounded-sm border font-medium text-xs w-full",
        "transition-[background,border-color,color] duration-150",
        "disabled:opacity-35 disabled:cursor-not-allowed active:not(:disabled):scale-[0.98]",
        copied
          ? "text-accent border-accent-border bg-accent-dim"
          : "bg-surface-2 text-ink-muted border-bdr hover:bg-surface-hover hover:border-accent-border hover:text-accent",
      ].join(" ")}
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

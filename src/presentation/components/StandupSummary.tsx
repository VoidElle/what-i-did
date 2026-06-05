import { useState } from "react";
import { ClipboardText, Check } from "@phosphor-icons/react";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import type { ActivityIssue } from "../../domain/entities";
import { buildStandupSummary } from "../../application/buildStandupSummary";

interface Props {
  issues: ActivityIssue[];
  windowStart: number;
  windowEnd: number;
}

export function StandupSummary({ issues, windowStart, windowEnd }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await writeText(buildStandupSummary(issues, windowStart, windowEnd));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      className={[
        "flex items-center justify-center gap-1.5 px-3 py-[7px] rounded-sm border font-medium text-xs w-full",
        "transition-[background,border-color,color] duration-150 ease-ui",
        "disabled:opacity-35 disabled:cursor-not-allowed",
        "active:not-disabled:scale-[0.97] transition-transform duration-[100ms] ease-ui",
        copied
          ? "text-accent border-accent-border bg-accent-dim"
          : "bg-surface-2 text-ink-muted border-bdr hover:bg-surface-hover hover:border-accent-border hover:text-accent",
      ].join(" ")}
      onClick={handleCopy}
      disabled={issues.length === 0}
      title="Copy standup summary to clipboard"
    >
      {/* key-swap triggers fade-up re-mount on state change */}
      <span key={copied ? "copied" : "copy"} className="flex items-center gap-1.5 animate-fade-up">
        {copied
          ? <><Check size={12} weight="bold" /> Copied</>
          : <><ClipboardText size={12} /> Copy standup</>
        }
      </span>
    </button>
  );
}

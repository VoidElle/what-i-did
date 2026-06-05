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
      className="group flex items-center justify-center gap-2 px-3 py-[8px] rounded-lg w-full font-medium text-xs relative overflow-hidden disabled:opacity-30 disabled:cursor-not-allowed"
      style={{
        background: copied
          ? "rgba(var(--accent-rgb), 0.12)"
          : "rgba(255,255,255,0.04)",
        border: copied
          ? "1px solid rgba(var(--accent-rgb), 0.25)"
          : "1px solid rgba(255,255,255,0.08)",
        color: copied ? "var(--accent)" : "#9898a8",
        transition: "all 250ms cubic-bezier(0.16,1,0.3,1)",
        boxShadow: copied ? "0 0 16px rgba(var(--accent-rgb), 0.08)" : "none",
      }}
      onMouseEnter={e => {
        if (!copied) {
          e.currentTarget.style.background = "rgba(255,255,255,0.07)";
          e.currentTarget.style.color = "#ededf2";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
        }
      }}
      onMouseLeave={e => {
        if (!copied) {
          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
          e.currentTarget.style.color = "#9898a8";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
        }
      }}
      onMouseDown={e => (e.currentTarget.style.transform = "scale(0.97)")}
      onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
      onClick={handleCopy}
      disabled={issues.length === 0}
      title="Copy standup recap summary to clipboard"
    >
      <span key={copied ? "copied" : "copy"} className="flex items-center gap-1.5 animate-fade-up">
        {/* Nested icon circle — button-in-button */}
        <span className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
          style={{
            background: copied ? "rgba(var(--accent-rgb), 0.15)" : "rgba(255,255,255,0.07)",
            transition: "background 250ms cubic-bezier(0.16,1,0.3,1)",
          }}>
          {copied
            ? <Check size={10} weight="bold" />
            : <ClipboardText size={10} />
          }
        </span>
        {copied ? "Copied" : "Copy standup recap"}
      </span>
    </button>
  );
}

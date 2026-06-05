import type React from "react";
import type { RichContent } from "../../domain/entities";
import { extractAdfText } from "../../data/jira/mapper";
import type { JiraAdfNode } from "../../data/jira/types";

// ── helpers ──────────────────────────────────────────────────────────────────

function isAdfNode(v: unknown): v is JiraAdfNode {
  return typeof v === "object" && v !== null && "type" in v;
}

function hasContent(node: JiraAdfNode): boolean {
  return Array.isArray(node.content) && node.content.length > 0;
}

// ── inline renderer ───────────────────────────────────────────────────────────

function renderInline(node: JiraAdfNode, key: number | string): React.ReactNode {
  if (node.type === "text") {
    let el: React.ReactNode = node.text ?? "";
    const marks = node.marks ?? [];
    for (const mark of marks) {
      switch (mark.type) {
        case "strong":   el = <strong key={key}>{el}</strong>; break;
        case "em":       el = <em key={key}>{el}</em>; break;
        case "code":     el = <code key={key} className="px-[5px] py-[1px] bg-surface-2 border border-bdr rounded text-[11px] font-mono text-accent">{el}</code>; break;
        case "strike":   el = <del key={key}>{el}</del>; break;
        case "underline":el = <u key={key}>{el}</u>; break;
        case "link": {
          const href = String(mark.attrs?.href ?? "");
          el = <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2 hover:opacity-80">{el}</a>;
          break;
        }
        case "textColor": {
          const color = String(mark.attrs?.color ?? "inherit");
          el = <span key={key} style={{ color }}>{el}</span>;
          break;
        }
      }
    }
    return el;
  }
  if (node.type === "hardBreak") return <br key={key} />;
  if (node.type === "mention")
    return <span key={key} className="text-accent font-medium">@{String(node.attrs?.text ?? node.attrs?.displayName ?? "someone")}</span>;
  if (node.type === "emoji")
    return <span key={key}>{String(node.attrs?.text ?? node.attrs?.shortName ?? "")}</span>;
  if (node.type === "inlineCard") {
    const url = String(node.attrs?.url ?? "");
    return url ? <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2 text-xs">{url}</a> : null;
  }
  // Unknown inline — recurse into children or fall back to text
  if (hasContent(node)) return <>{node.content!.map((c, i) => renderInline(c, i))}</>;
  return extractAdfText(node) || null;
}

// ── block renderer ────────────────────────────────────────────────────────────

function renderBlock(node: JiraAdfNode, key: number | string): React.ReactNode {
  switch (node.type) {
    case "doc":
      return <div key={key} className="adf-doc">{node.content?.map((c, i) => renderBlock(c, i))}</div>;

    case "paragraph":
      return (
        <p key={key} className="text-xs text-ink leading-[1.65] mb-2 last:mb-0">
          {node.content?.map((c, i) => renderInline(c, i))}
        </p>
      );

    case "heading": {
      const level = Number(node.attrs?.level ?? 2);
      const text = node.content?.map((c, i) => renderInline(c, i));
      const base = "font-bold text-ink mb-2 mt-3 first:mt-0";
      if (level === 1) return <h1 key={key} className={`${base} text-[15px]`}>{text}</h1>;
      if (level === 2) return <h2 key={key} className={`${base} text-[13px]`}>{text}</h2>;
      return           <h3 key={key} className={`${base} text-[11px] uppercase tracking-[0.5px] text-ink-muted`}>{text}</h3>;
    }

    case "bulletList":
      return (
        <ul key={key} className="list-none mb-2 flex flex-col gap-[3px]">
          {node.content?.map((c, i) => renderBlock(c, i))}
        </ul>
      );

    case "orderedList":
      return (
        <ol key={key} className="list-none mb-2 flex flex-col gap-[3px] counter-reset-[list]">
          {node.content?.map((item, i) => (
            <li key={i} className="flex gap-1.5 text-xs text-ink leading-[1.6]">
              <span className="text-ink-faint font-mono flex-shrink-0 min-w-[16px]">{i + 1}.</span>
              <span>{item.content?.map((c, j) => renderBlock(c, j))}</span>
            </li>
          ))}
        </ol>
      );

    case "listItem":
      return (
        <li key={key} className="flex gap-1.5 text-xs text-ink leading-[1.6]">
          <span className="text-ink-faint flex-shrink-0 mt-[1px]">•</span>
          <span className="flex-1 min-w-0">{node.content?.map((c, i) => renderBlock(c, i))}</span>
        </li>
      );

    case "codeBlock": {
      const lang = node.attrs?.language ? String(node.attrs.language) : null;
      const code = node.content?.map(c => c.text ?? "").join("") ?? "";
      return (
        <div key={key} className="mb-2 rounded bg-surface-2 border border-bdr overflow-hidden">
          {lang && (
            <div className="px-3 py-1 text-[9px] font-bold uppercase tracking-[0.5px] text-ink-faint border-b border-bdr-subtle font-mono">
              {lang}
            </div>
          )}
          <pre className="px-3 py-2.5 text-[11px] font-mono text-ink leading-[1.6] overflow-x-auto whitespace-pre">
            <code>{code}</code>
          </pre>
        </div>
      );
    }

    case "blockquote":
      return (
        <blockquote key={key} className="border-l-2 border-bdr pl-3 mb-2 text-ink-muted italic">
          {node.content?.map((c, i) => renderBlock(c, i))}
        </blockquote>
      );

    case "rule":
      return <hr key={key} className="border-none border-t border-bdr-subtle my-3" />;

    case "panel": {
      const panelType = String(node.attrs?.panelType ?? "info");
      const colors: Record<string, string> = {
        info:    "border-[#1d7afc] bg-[rgba(29,122,252,0.08)]",
        note:    "border-[#fbbf24] bg-[rgba(251,191,36,0.08)]",
        warning: "border-[#f59e0b] bg-[rgba(245,158,11,0.08)]",
        error:   "border-[#ef4444] bg-[rgba(239,68,68,0.08)]",
        success: "border-[#22c55e] bg-[rgba(34,197,94,0.08)]",
      };
      const cls = colors[panelType] ?? colors.info;
      return (
        <div key={key} className={`border-l-2 pl-3 py-2 mb-2 rounded-r ${cls}`}>
          {node.content?.map((c, i) => renderBlock(c, i))}
        </div>
      );
    }

    case "table":
      return (
        <div key={key} className="overflow-x-auto mb-2">
          <table className="text-xs border-collapse w-full">
            <tbody>{node.content?.map((c, i) => renderBlock(c, i))}</tbody>
          </table>
        </div>
      );
    case "tableRow":
      return <tr key={key}>{node.content?.map((c, i) => renderBlock(c, i))}</tr>;
    case "tableHeader":
      return <th key={key} className="border border-bdr px-2 py-1 text-left font-semibold text-ink bg-surface-2">{node.content?.map((c, i) => renderBlock(c, i))}</th>;
    case "tableCell":
      return <td key={key} className="border border-bdr px-2 py-1 text-ink">{node.content?.map((c, i) => renderBlock(c, i))}</td>;

    case "mediaSingle":
    case "mediaGroup":
    case "media": {
      const name = node.attrs?.fileName ? String(node.attrs.fileName) : null;
      const mediaType = String(node.attrs?.mediaType ?? node.attrs?.type ?? "file");
      const icon = mediaType === "video" ? "🎬" : mediaType === "image" ? "🖼" : "📎";
      return (
        <div key={key} className="inline-flex items-center gap-1 text-[11px] text-ink-muted bg-surface-2 border border-bdr rounded px-2 py-1 mb-1 mr-1">
          <span>{icon}</span>
          {name && <span className="font-mono">{name}</span>}
        </div>
      );
    }

    case "blockCard":
    case "inlineCard": {
      const url = String(node.attrs?.url ?? "");
      return url ? (
        <a key={key} href={url} target="_blank" rel="noopener noreferrer"
          className="block text-accent underline underline-offset-2 text-xs mb-1 truncate">
          {url}
        </a>
      ) : null;
    }

    default:
      // Unknown block node — try children first, then plain-text fallback
      if (hasContent(node)) {
        return <div key={key}>{node.content!.map((c, i) => renderBlock(c, i))}</div>;
      }
      {
        const fallback = extractAdfText(node);
        return fallback ? <p key={key} className="text-xs text-ink leading-[1.65] mb-2">{fallback}</p> : null;
      }
  }
}

// ── public component ──────────────────────────────────────────────────────────

interface Props {
  rich: RichContent | null;
  fallback: string;
  className?: string;
}

export function AdfRenderer({ rich, fallback, className = "" }: Props) {
  if (rich && isAdfNode(rich.raw)) {
    const node = rich.raw;
    return (
      <div className={className}>
        {node.type === "doc"
          ? node.content?.map((c, i) => renderBlock(c, i))
          : renderBlock(node, 0)
        }
      </div>
    );
  }
  // Plain-text fallback
  return <div className={`text-xs text-ink leading-[1.65] whitespace-pre-wrap ${className}`}>{fallback}</div>;
}

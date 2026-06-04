import { useState } from "react";
import { FilmStrip, Image, FilePdf, Paperclip, Play, MagnifyingGlass } from "@phosphor-icons/react";
import type { Attachment } from "../../domain/entities";

function FileIcon({ mimeType }: { mimeType: string }) {
  const p = { size: 14, weight: "duotone" as const, className: "text-ink-faint" };
  if (mimeType.startsWith("video/")) return <FilmStrip {...p} />;
  if (mimeType.startsWith("image/")) return <Image    {...p} />;
  if (mimeType.includes("pdf"))      return <FilePdf  {...p} />;
  return <Paperclip {...p} />;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface AttachmentItemProps {
  attachment: Attachment;
  onFetchUrl: (contentUrl: string, mimeType: string) => Promise<string>;
}

function AttachmentItem({ attachment, onFetchUrl }: AttachmentItemProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isVideo = attachment.mimeType.startsWith("video/");
  const isImage = attachment.mimeType.startsWith("image/");

  const load = async () => {
    if (blobUrl) return;
    setLoading(true);
    setError(null);
    try {
      const url = await onFetchUrl(attachment.contentUrl, attachment.mimeType);
      setBlobUrl(url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-2 border border-bdr-subtle rounded-sm overflow-hidden">
      <div className="flex items-center gap-2 px-2.5 py-2">
        <span className="flex-shrink-0 flex items-center text-ink-faint">
          <FileIcon mimeType={attachment.mimeType} />
        </span>
        <span className="flex-1 text-xs text-ink font-medium overflow-hidden text-ellipsis whitespace-nowrap">
          {attachment.filename}
        </span>
        <span className="text-[10px] text-ink-faint font-mono flex-shrink-0">
          {formatSize(attachment.size)}
        </span>
        {(isVideo || isImage) && !blobUrl && !loading && (
          <button
            className="flex items-center gap-1 bg-transparent text-accent border border-accent-border px-[9px] py-[2px] rounded text-[11px] font-medium font-sans cursor-pointer flex-shrink-0 transition-colors duration-150 hover:bg-accent-dim"
            onClick={load}
          >
            {isVideo
              ? <><Play size={10} weight="fill" /> Play</>
              : <><MagnifyingGlass size={10} /> View</>
            }
          </button>
        )}
        {loading && <span className="text-xs text-ink-faint">Loading...</span>}
        {error && <span className="text-[11px] text-danger-text">{error}</span>}
      </div>

      {blobUrl && isVideo && (
        <video
          className="block w-full max-h-80 bg-black"
          src={blobUrl}
          controls
          autoPlay={false}
        />
      )}

      {blobUrl && isImage && (
        <img
          className="block w-full max-h-[360px] object-contain bg-bg"
          src={blobUrl}
          alt={attachment.filename}
        />
      )}
    </div>
  );
}

interface AttachmentListProps {
  attachments: Attachment[];
  onFetchUrl: (contentUrl: string, mimeType: string) => Promise<string>;
}

export function AttachmentList({ attachments, onFetchUrl }: AttachmentListProps) {
  if (!attachments.length) return null;
  return (
    <div>
      <div className="text-[9px] font-bold uppercase tracking-[0.8px] text-ink-muted mb-2 font-mono">
        Attachments ({attachments.length})
      </div>
      <div className="flex flex-col gap-1.5">
        {attachments.map((a) => (
          <AttachmentItem key={a.id} attachment={a} onFetchUrl={onFetchUrl} />
        ))}
      </div>
    </div>
  );
}

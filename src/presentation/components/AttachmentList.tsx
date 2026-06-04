import { useState } from "react";
import { FilmStrip, Image, FilePdf, Paperclip, Play, MagnifyingGlass } from "@phosphor-icons/react";
import type { Attachment } from "../../domain/entities";

function FileIcon({ mimeType }: { mimeType: string }) {
  const p = { size: 14, weight: "duotone" as const, color: "var(--text-faint)" };
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
    <div className="attachment-item">
      <div className="attachment-meta">
        <span className="attachment-icon"><FileIcon mimeType={attachment.mimeType} /></span>
        <span className="attachment-name">{attachment.filename}</span>
        <span className="attachment-size">{formatSize(attachment.size)}</span>
        {(isVideo || isImage) && !blobUrl && !loading && (
          <button className="btn-load-media" onClick={load}>
            {isVideo
              ? <><Play size={10} weight="fill" /> Play</>
              : <><MagnifyingGlass size={10} /> View</>
            }
          </button>
        )}
        {loading && <span className="detail-muted">Loading…</span>}
        {error && <span className="attachment-error">⚠️ {error}</span>}
      </div>

      {blobUrl && isVideo && (
        <video
          className="attachment-video"
          src={blobUrl}
          controls
          autoPlay={false}
        />
      )}

      {blobUrl && isImage && (
        <img
          className="attachment-image"
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
    <div className="detail-section">
      <div className="detail-label">Attachments ({attachments.length})</div>
      <div className="attachments-list">
        {attachments.map((a) => (
          <AttachmentItem key={a.id} attachment={a} onFetchUrl={onFetchUrl} />
        ))}
      </div>
    </div>
  );
}

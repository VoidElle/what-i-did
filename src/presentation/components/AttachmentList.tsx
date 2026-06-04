import { useState } from "react";
import type { Attachment } from "../../domain/entities";

function fileIcon(mimeType: string): string {
  if (mimeType.startsWith("video/")) return "🎬";
  if (mimeType.startsWith("image/")) return "🖼";
  if (mimeType.includes("pdf")) return "📄";
  return "📎";
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
        <span className="attachment-icon">{fileIcon(attachment.mimeType)}</span>
        <span className="attachment-name">{attachment.filename}</span>
        <span className="attachment-size">{formatSize(attachment.size)}</span>
        {(isVideo || isImage) && !blobUrl && !loading && (
          <button className="btn-load-media" onClick={load}>
            {isVideo ? "▶ Play" : "🔍 View"}
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

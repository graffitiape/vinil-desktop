import { AlertCircle, Check, Music2, X } from 'lucide-react';

export type UploadStatus = 'pending' | 'uploading' | 'complete' | 'error';

export interface QueuedAudioFile {
  file: File;
  name: string;
  size: string;
  progress: number;
  status: UploadStatus;
  error?: string;
}

interface UploadQueueProps {
  files: QueuedAudioFile[];
  liveProgress: number;
  isLocked: boolean;
  onRemove: (index: number) => void;
}

export const formatFileSize = (bytes: number) => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, bytes / 1024).toFixed(1)} KB`;
};

export const getRequestError = (error: unknown, fallback: string) => {
  if (typeof error !== 'object' || error === null) return fallback;

  const response = 'response' in error ? error.response : undefined;
  if (typeof response !== 'object' || response === null || !('data' in response)) return fallback;

  const data = response.data;
  if (typeof data !== 'object' || data === null || !('error' in data)) return fallback;

  return typeof data.error === 'string' ? data.error : fallback;
};

export const DropzoneRecord = () => (
  <svg className="dz-disc" width="76" height="76" viewBox="0 0 76 76" aria-hidden="true">
    <circle cx="38" cy="38" r="37" fill="var(--vinyl)" />
    {[10, 17, 24, 31].map((radius) => (
      <circle
        key={radius}
        cx="38"
        cy="38"
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="0.7"
      />
    ))}
    <circle cx="38" cy="38" r="10" fill="var(--clay)" />
    <circle cx="38" cy="38" r="2" fill="var(--paper-4)" />
  </svg>
);

export const UploadQueue = ({ files, liveProgress, isLocked, onRemove }: UploadQueueProps) => (
  <section className="upload-progress" aria-label="Selected audio files">
    <h3 className="serif">
      {files.length} {files.length === 1 ? 'track' : 'tracks'} ready
    </h3>
    <div className="upload-list">
      {files.map((file, index) => {
        const progress = file.status === 'uploading' ? liveProgress : file.progress;

        return (
          <div className="upload-row" key={`${file.name}-${index}`}>
            <span className="up-icon" aria-hidden="true">
              {file.status === 'complete' ? (
                <Check size={16} />
              ) : file.status === 'error' ? (
                <AlertCircle size={16} />
              ) : (
                <Music2 size={16} />
              )}
            </span>
            <div className="upload-file-copy" style={{ minWidth: 0 }}>
              <p
                className="up-name upload-file-name"
                title={file.name}
                style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {file.name}
              </p>
              <div className="up-bar" aria-hidden="true">
                <div className="up-fill" style={{ width: `${progress}%` }} />
              </div>
              {file.error && <p className="field-error" style={{ marginTop: 5 }}>{file.error}</p>}
            </div>
            <span className="mono small dim" style={{ textAlign: 'right' }}>{file.size}</span>
            {file.status === 'pending' || file.status === 'error' ? (
              <button
                className="ghost-btn"
                type="button"
                disabled={isLocked}
                onClick={() => onRemove(index)}
                aria-label={`Remove ${file.name}`}
              >
                <X size={15} />
              </button>
            ) : (
              <span />
            )}
          </div>
        );
      })}
    </div>
  </section>
);

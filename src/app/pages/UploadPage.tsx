import { Upload as UploadIcon, Image, X, Check, Plus } from 'lucide-react';
import { useState, useRef } from 'react';
import { useUploadTrack } from '@/app/hooks/useUpload';
import { useAlbums, useCreateAlbum } from '@/app/hooks/useAlbums';

interface FileUpload {
  file: File;
  name: string;
  size: string;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
}

export const UploadPage = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [showNewAlbum, setShowNewAlbum] = useState(false);
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [newAlbumArtist, setNewAlbumArtist] = useState('');
  const [newAlbumGenre, setNewAlbumGenre] = useState('');
  const [newAlbumYear, setNewAlbumYear] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: albums = [] } = useAlbums();
  const createAlbum = useCreateAlbum();
  const uploadTrack = useUploadTrack();

  const formatSize = (bytes: number) => {
    if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const addFiles = (fileList: FileList | File[]) => {
    const audioFiles = Array.from(fileList).filter((f) =>
      f.type.startsWith('audio/') || /\.(flac|wav|mp3|aac|ogg|alac)$/i.test(f.name)
    );
    const newFiles: FileUpload[] = audioFiles.map((f) => ({
      file: f,
      name: f.name,
      size: formatSize(f.size),
      progress: 0,
      status: 'pending',
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateAlbumAndUpload = async () => {
    let albumId = selectedAlbumId;

    if (showNewAlbum && newAlbumTitle && newAlbumArtist) {
      const album = await createAlbum.mutateAsync({
        title: newAlbumTitle,
        artist: newAlbumArtist,
        genre: newAlbumGenre || undefined,
        year: newAlbumYear ? parseInt(newAlbumYear) : undefined,
      });
      albumId = album.id;
      setSelectedAlbumId(album.id);
      setShowNewAlbum(false);
    }

    if (!albumId) return;

    for (let i = 0; i < files.length; i++) {
      if (files[i].status === 'complete') continue;

      setFiles((prev) =>
        prev.map((f, idx) => (idx === i ? { ...f, status: 'uploading' as const } : f))
      );

      try {
        await uploadTrack.mutateAsync({ file: files[i].file, albumId });
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: 'complete' as const, progress: 100 } : f
          )
        );
      } catch (err: any) {
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? { ...f, status: 'error' as const, error: err?.response?.data?.error || 'Upload failed' }
              : f
          )
        );
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8" style={{ paddingBottom: '120px' }}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*,.flac,.wav,.mp3,.aac,.ogg"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2" style={{ color: 'var(--text-primary)' }}>Upload Music</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Add albums to your personal library</p>
      </div>

      {/* Upload Zone */}
      <div
        className="mb-8 flex flex-col items-center justify-center rounded-xl cursor-pointer transition-all"
        style={{
          height: '250px',
          background: isDragging ? 'rgba(245, 166, 35, 0.05)' : 'var(--bg-deep)',
          border: `2px dashed ${isDragging ? 'var(--accent-primary)' : 'var(--border-default)'}`,
          boxShadow: isDragging ? '0 0 24px rgba(245, 166, 35, 0.3)' : 'none',
        }}
        onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onDrop={handleDrop}
        onClick={handleBrowse}
      >
        <UploadIcon
          className="w-16 h-16 mb-4"
          style={{ color: isDragging ? 'var(--accent-primary)' : 'var(--text-muted)' }}
        />
        <p className="text-lg font-medium mb-2" style={{ color: isDragging ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
          Drag & drop audio files here
        </p>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>or click to browse</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Supports FLAC, WAV, MP3, AAC, OGG</p>
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div className="rounded-lg p-6 mb-8" style={{ background: 'var(--bg-secondary)' }}>
          <h3 className="mb-4" style={{ color: 'var(--text-primary)' }}>
            Files ({files.length})
          </h3>
          <div className="space-y-3">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 rounded-md"
                style={{ background: 'var(--bg-tertiary)' }}
              >
                <div
                  className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded"
                  style={{ background: 'var(--bg-deep)' }}
                >
                  {file.status === 'complete' ? (
                    <Check className="w-5 h-5" style={{ color: 'var(--success)' }} />
                  ) : file.status === 'error' ? (
                    <X className="w-5 h-5" style={{ color: 'var(--error)' }} />
                  ) : file.status === 'uploading' ? (
                    <span className="text-xs" style={{ color: 'var(--accent-primary)' }}>
                      {uploadTrack.progress}%
                    </span>
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {index + 1}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {file.name}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{file.size}</span>
                  </div>
                  {file.status === 'uploading' && (
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-deep)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${uploadTrack.progress}%`, background: 'var(--accent-primary)' }}
                      />
                    </div>
                  )}
                  {file.error && (
                    <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>{file.error}</p>
                  )}
                </div>
                {file.status === 'pending' && (
                  <button onClick={() => removeFile(index)} className="p-1 rounded transition-colors">
                    <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Album Selection */}
      {files.length > 0 && (
        <div className="rounded-lg p-6" style={{ background: 'var(--bg-secondary)' }}>
          <h3 className="mb-6" style={{ color: 'var(--text-primary)' }}>Select Album</h3>

          {/* Existing Albums */}
          {albums.length > 0 && !showNewAlbum && (
            <div className="space-y-2 mb-4">
              {albums.map((album) => (
                <button
                  key={album.id}
                  onClick={() => setSelectedAlbumId(album.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors text-left"
                  style={{
                    background: selectedAlbumId === album.id ? 'rgba(245, 166, 35, 0.1)' : 'var(--bg-tertiary)',
                    border: `1px solid ${selectedAlbumId === album.id ? 'var(--accent-primary)' : 'transparent'}`,
                  }}
                >
                  <img
                    src={album.artwork_url || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200&h=200&fit=crop'}
                    alt={album.title}
                    className="w-10 h-10 rounded"
                  />
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{album.title}</div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{album.artist}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* New Album Button / Form */}
          {!showNewAlbum ? (
            <button
              onClick={() => { setShowNewAlbum(true); setSelectedAlbumId(null); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors"
              style={{ border: '1px dashed var(--border-default)', color: 'var(--accent-primary)' }}
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm font-medium">Create New Album</span>
            </button>
          ) : (
            <div className="space-y-4 p-4 rounded-md" style={{ background: 'var(--bg-tertiary)' }}>
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Album Title</label>
                <input
                  type="text"
                  value={newAlbumTitle}
                  onChange={(e) => setNewAlbumTitle(e.target.value)}
                  placeholder="Enter album title"
                  className="w-full px-4 py-2 rounded-md"
                  style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Artist Name</label>
                <input
                  type="text"
                  value={newAlbumArtist}
                  onChange={(e) => setNewAlbumArtist(e.target.value)}
                  placeholder="Enter artist name"
                  className="w-full px-4 py-2 rounded-md"
                  style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Genre</label>
                  <input
                    type="text"
                    value={newAlbumGenre}
                    onChange={(e) => setNewAlbumGenre(e.target.value)}
                    placeholder="Genre"
                    className="w-full px-4 py-2 rounded-md"
                    style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Year</label>
                  <input
                    type="number"
                    value={newAlbumYear}
                    onChange={(e) => setNewAlbumYear(e.target.value)}
                    placeholder="2024"
                    className="w-full px-4 py-2 rounded-md"
                    style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
              <button
                onClick={() => setShowNewAlbum(false)}
                className="text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                Cancel — select existing album
              </button>
            </div>
          )}

          {/* Upload Button */}
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={() => { setFiles([]); setSelectedAlbumId(null); setShowNewAlbum(false); }}
              className="px-6 py-2.5 rounded-md transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleCreateAlbumAndUpload}
              disabled={
                files.length === 0 ||
                (!selectedAlbumId && !(showNewAlbum && newAlbumTitle && newAlbumArtist)) ||
                uploadTrack.isPending
              }
              className="px-6 py-2.5 rounded-md transition-all hover:scale-105"
              style={{
                background: 'var(--accent-primary)',
                color: 'var(--text-on-accent)',
                opacity:
                  files.length === 0 ||
                  (!selectedAlbumId && !(showNewAlbum && newAlbumTitle && newAlbumArtist))
                    ? 0.5
                    : 1,
              }}
            >
              {uploadTrack.isPending ? 'Uploading...' : 'Upload to Library'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

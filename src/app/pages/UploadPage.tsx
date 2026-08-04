import { Disc3, Plus, Upload as UploadIcon } from 'lucide-react';
import { useRef } from 'react';
import type { CSSProperties } from 'react';
import { DropzoneRecord, UploadQueue } from '@/app/pages/vinilUploadParts';
import { NEW_ALBUM_VALUE, useVinilUploadFlow } from '@/app/pages/useVinilUploadFlow';

const SELECT_STYLE: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  background: 'var(--paper-4)',
  border: '1px solid var(--rule)',
  color: 'var(--ink)',
};

export const UploadPage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    actionError,
    albums,
    albumsError,
    albumsLoading,
    allComplete,
    destinationReady,
    files,
    handleDestinationChange,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileChange,
    handleUpload,
    isDragging,
    isWorking,
    newAlbumArtist,
    newAlbumGenre,
    newAlbumTitle,
    newAlbumYear,
    refetchAlbums,
    removeFile,
    resetUpload,
    selectedAlbum,
    selectedAlbumId,
    setNewAlbumArtist,
    setNewAlbumGenre,
    setNewAlbumTitle,
    setNewAlbumYear,
    showNewAlbum,
    uploadProgress,
  } = useVinilUploadFlow();

  return (
    <div className="page" data-screen-label="Upload">
      <input
        ref={fileInputRef}
        className="visually-hidden"
        type="file"
        multiple
        accept="audio/*,.flac,.wav,.mp3,.aac,.ogg,.alac"
        onChange={handleFileChange}
        disabled={isWorking}
      />

      <header className="page-head">
        <p className="eyebrow mono">Your library</p>
        <h1 className="serif">Add to your collection</h1>
        <p className="lead">Bring in the records you own and keep every detail in one place.</p>
      </header>

      <div
        className={`dropzone${isDragging && !isWorking ? ' over' : ''}${isWorking ? ' locked' : ''}`}
        aria-disabled={isWorking}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <DropzoneRecord />
        <h3 className="serif">Drop your audio files here</h3>
        <p className="lead">or</p>
        <button
          className="btn-clay"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isWorking}
        >
          <UploadIcon size={16} /> Browse files
        </button>
        <p className="mono small dim">FLAC · WAV · MP3 · AAC · OGG · ALAC</p>
      </div>

      {actionError && files.length === 0 && <p className="form-error">{actionError}</p>}

      {files.length > 0 && (
        <>
          <UploadQueue
            files={files}
            liveProgress={uploadProgress}
            isLocked={isWorking}
            onRemove={removeFile}
          />

          <section className="metadata-edit">
            <h3 className="serif">Choose a home for these tracks</h3>
            <div className="me-grid">
              <div className="me-art" style={{ cursor: 'default', textAlign: 'center', padding: 18 }}>
                {showNewAlbum ? <Plus size={34} /> : <Disc3 size={34} />}
                <span className="serif" style={{ fontSize: 20 }}>
                  {showNewAlbum ? 'A new record' : selectedAlbum?.title || 'Album details'}
                </span>
                <span className="mono small">
                  {showNewAlbum ? 'Complete the fields' : selectedAlbum?.artist || 'Select a destination'}
                </span>
              </div>

              <div className="me-fields">
                <label>
                  Destination album
                  <select
                    className="upload-destination-select"
                    value={showNewAlbum ? NEW_ALBUM_VALUE : selectedAlbumId || ''}
                    onChange={(event) => handleDestinationChange(event.target.value)}
                    style={SELECT_STYLE}
                    disabled={isWorking}
                  >
                    <option value="">{albumsLoading ? 'Loading albums…' : 'Choose an album'}</option>
                    {albums.map((album) => (
                      <option key={album.id} value={album.id}>{album.title} — {album.artist}</option>
                    ))}
                    <option value={NEW_ALBUM_VALUE}>＋ Create a new album</option>
                  </select>
                </label>

                {albumsError && (
                  <div className="form-error">
                    Albums could not be loaded.{' '}
                    <button type="button" onClick={() => refetchAlbums()} style={{ textDecoration: 'underline' }}>
                      Try again
                    </button>
                  </div>
                )}
                {!albumsLoading && !albumsError && albums.length === 0 && !showNewAlbum && (
                  <p className="st-sub">Your library is empty. Choose “Create a new album” to begin.</p>
                )}

                {showNewAlbum && (
                  <>
                    <div className="me-two">
                      <label>
                        Album title
                        <input
                          value={newAlbumTitle}
                          onChange={(event) => setNewAlbumTitle(event.target.value)}
                          placeholder="Kind of Blue"
                          required
                          disabled={isWorking}
                        />
                      </label>
                      <label>
                        Artist
                        <input
                          value={newAlbumArtist}
                          onChange={(event) => setNewAlbumArtist(event.target.value)}
                          placeholder="Miles Davis"
                          required
                          disabled={isWorking}
                        />
                      </label>
                    </div>
                    <div className="me-two">
                      <label>
                        Genre
                        <input
                          value={newAlbumGenre}
                          onChange={(event) => setNewAlbumGenre(event.target.value)}
                          placeholder="Jazz"
                          disabled={isWorking}
                        />
                      </label>
                      <label>
                        Year
                        <input
                          type="number"
                          min="1000"
                          max="9999"
                          value={newAlbumYear}
                          onChange={(event) => setNewAlbumYear(event.target.value)}
                          placeholder="1959"
                          disabled={isWorking}
                        />
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>

            {actionError && <p className="form-error" style={{ marginTop: 18 }}>{actionError}</p>}
            <div className="me-actions">
              <button className="btn-ghost" type="button" onClick={resetUpload} disabled={isWorking}>
                Clear
              </button>
              <button
                className="btn-clay"
                type="button"
                onClick={handleUpload}
                disabled={!destinationReady || isWorking || allComplete}
                style={{ opacity: !destinationReady || isWorking || allComplete ? 0.55 : 1 }}
              >
                <UploadIcon size={16} />
                {isWorking ? 'Adding tracks…' : allComplete ? 'Added to library' : 'Add to library'}
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

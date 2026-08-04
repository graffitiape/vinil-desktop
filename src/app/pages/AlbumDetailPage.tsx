import { ArrowLeft, Check, Download, Heart, MoreHorizontal, Music, Play } from 'lucide-react';
import { useState } from 'react';
import { usePlayer } from '@/app/context/PlayerContext';
import { useAlbum } from '@/app/hooks/useAlbums';
import { useDownloadAlbum } from '@/app/hooks/useOffline';
import type { Track } from '@/app/types/api';
import { formatDuration, formatTotalDuration } from '@/app/utils/format';

interface AlbumDetailPageProps {
  albumId: string;
  onBack: () => void;
}

const VinylRecord = () => (
  <svg className="ah-vinyl" viewBox="0 0 280 220" aria-hidden="true">
    <circle cx="164" cy="110" r="108" fill="#1a1714" />
    {[16, 28, 40, 52, 64, 76, 88, 100].map((radius) => (
      <circle
        key={radius}
        cx="164"
        cy="110"
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.075)"
        strokeWidth="0.7"
      />
    ))}
    <circle cx="164" cy="110" r="27" fill="var(--clay)" />
    <circle cx="164" cy="110" r="4" fill="var(--paper-4)" />
  </svg>
);

export const AlbumDetailPage = ({ albumId, onBack }: AlbumDetailPageProps) => {
  const { currentTrack, isPlaying, playTrack: playTrackInQueue } = usePlayer();
  const { data: album, isLoading, isError, refetch } = useAlbum(albumId);
  const { download, isDownloading, progress } = useDownloadAlbum();
  const [isLiked, setIsLiked] = useState(false);
  const [hoveredTrackId, setHoveredTrackId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="page" data-screen-label="Album">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className="empty" role="status">
          <Music size={30} />
          <p className="serif">Finding the record…</p>
        </div>
      </div>
    );
  }

  if (isError || !album) {
    return (
      <div className="page" data-screen-label="Album">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className="empty">
          <Music size={30} />
          <p className="serif">{isError ? 'This record could not be loaded.' : 'Album not found.'}</p>
          {isError && (
            <button className="btn-ghost" onClick={() => refetch()} style={{ marginTop: 16 }}>
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  const playTrack = (track: Track) => {
    playTrackInQueue(track, album.tracks);
  };

  const meta = [
    album.year,
    album.genre,
    `${album.track_count} ${album.track_count === 1 ? 'track' : 'tracks'}`,
    formatTotalDuration(album.duration),
  ].filter(Boolean);

  return (
    <div className="page" data-screen-label="Album">
      <button className="back-btn" onClick={onBack}>
        <ArrowLeft size={16} /> Back to library
      </button>

      <section className="album-hero">
        <div className="ah-art">
          {album.artwork_url ? (
            <img src={album.artwork_url} alt={`${album.title} cover`} />
          ) : (
            <div
              className="artwork-fallback album-artwork-fallback"
              role="img"
              aria-label={`${album.title} has no cover artwork`}
              style={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-2)',
              }}
            >
              <Music size={64} strokeWidth={1.1} />
            </div>
          )}
          <VinylRecord />
        </div>

        <div className="ah-info">
          <p className="eyebrow mono">Album</p>
          <h1 className="ah-title serif">{album.title}</h1>
          <p className="ah-artist serif italic">{album.artist}</p>
          <p className="ah-meta mono">{meta.join(' · ')}</p>
          {album.quality && <span className="quality-tag mono">{album.quality}</span>}

          <div className="ah-actions">
            <button
              className="btn-clay"
              onClick={() => album.tracks[0] && playTrack(album.tracks[0])}
              disabled={album.tracks.length === 0}
              style={{ opacity: album.tracks.length === 0 ? 0.55 : 1 }}
            >
              <Play size={16} fill="currentColor" /> Play album
            </button>
            <button
              className={`btn-ghost${isLiked ? ' active' : ''}`}
              onClick={() => setIsLiked((liked) => !liked)}
              aria-pressed={isLiked}
            >
              <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
              {isLiked ? 'Liked' : 'Like'}
            </button>
            <button
              className="btn-ghost"
              onClick={() => download(album.tracks)}
              disabled={isDownloading || album.tracks.length === 0}
              title="Download album for offline listening"
            >
              {isDownloading ? <Check size={16} /> : <Download size={16} />}
              {isDownloading ? `${progress.current} of ${progress.total}` : 'Download'}
            </button>
            <button className="btn-ghost" aria-label="More album options" title="More options">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>
      </section>

      {album.tracks.length === 0 ? (
        <div className="empty">
          <Music size={30} />
          <p className="serif">No tracks have been added yet.</p>
        </div>
      ) : (
        <section className="track-table" aria-label={`${album.title} track list`}>
          <div className="tt-head mono" aria-hidden="true">
            <span>#</span>
            <span>Title</span>
            <span>Length</span>
            <span>Format</span>
          </div>
          {album.tracks.map((track, index) => {
            const isCurrent = currentTrack?.id === track.id;
            const isHovered = hoveredTrackId === track.id;
            const trackNumber = track.track_number ?? index + 1;

            return (
              <button
                key={track.id}
                className={`tt-row${isCurrent ? ' current' : ''}`}
                onClick={() => playTrack(track)}
                onMouseEnter={() => setHoveredTrackId(track.id)}
                onMouseLeave={() => setHoveredTrackId(null)}
                aria-label={`Play ${track.title}`}
              >
                <span className="tt-num mono">
                  {isCurrent && isPlaying ? (
                    <span className="eq" aria-label="Playing">
                      <span />
                      <span />
                      <span />
                    </span>
                  ) : isHovered ? (
                    <Play size={13} fill="currentColor" />
                  ) : (
                    String(trackNumber).padStart(2, '0')
                  )}
                </span>
                <span className="tt-title" style={{ textAlign: 'left' }}>{track.title}</span>
                <span className="mono small dim">{formatDuration(track.duration)}</span>
                <span className="mono small dim">{track.quality}</span>
              </button>
            );
          })}
        </section>
      )}
    </div>
  );
};

import { ArrowLeft, Play, Heart, Download, MoreHorizontal, Music, Check } from 'lucide-react';
import { formatDuration, formatTotalDuration } from '@/app/utils/format';
import { usePlayer } from '@/app/context/PlayerContext';
import { useAlbum } from '@/app/hooks/useAlbums';
import { useDownloadAlbum } from '@/app/hooks/useOffline';
import { useState } from 'react';
import type { Track } from '@/app/types/api';

interface AlbumDetailPageProps {
  albumId: string;
  onBack: () => void;
}

export const AlbumDetailPage = ({ albumId, onBack }: AlbumDetailPageProps) => {
  const { currentTrack, isPlaying, playTrack } = usePlayer();
  const { data: album, isLoading } = useAlbum(albumId);
  const [isLiked, setIsLiked] = useState(false);
  const [hoveredTrack, setHoveredTrack] = useState<number | null>(null);
  const { download, isDownloading, progress } = useDownloadAlbum();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading...</div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p style={{ color: 'var(--text-muted)' }}>Album not found</p>
      </div>
    );
  }

  const isCurrentAlbum = currentTrack?.album_id === albumId;

  const handlePlayTrack = (track: Track) => {
    playTrack(track, album.tracks);
  };

  return (
    <div className="flex-1 overflow-y-auto" style={{ paddingBottom: '120px' }}>
      {/* Hero Section with Gradient */}
      <div
        className="relative px-8 pt-8 pb-12"
        style={{
          background: `linear-gradient(180deg, rgba(245, 166, 35, 0.15) 0%, var(--bg-primary) 100%)`,
        }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-8 px-3 py-2 rounded-md transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-tertiary)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="flex items-end gap-8">
          <div className="relative flex-shrink-0 group">
            <div className="relative">
              <img
                src={album.artwork_url || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop'}
                alt={album.title}
                className="w-72 h-72 rounded-lg shadow-2xl"
                style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)' }}
              />
              <div
                className="absolute -right-3 top-8 bottom-8 w-8 rounded-r transition-all group-hover:w-12 group-hover:-right-4"
                style={{
                  background: 'var(--vinyl-black)',
                  borderTop: '3px solid var(--vinyl-highlight)',
                  borderBottom: '3px solid var(--vinyl-highlight)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)',
                }}
              />
            </div>
          </div>

          <div className="flex-1 pb-4">
            <p className="text-xs uppercase tracking-wider font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>
              Album
            </p>
            <h1 className="mb-4" style={{ color: 'var(--text-primary)' }}>{album.title}</h1>
            <button className="mb-4 transition-colors hover:underline" style={{ color: 'var(--accent-primary)' }}>
              <h3>{album.artist}</h3>
            </button>
            <div className="flex items-center gap-2 mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>
              {album.genre && <><span>{album.genre}</span><span>•</span></>}
              {album.year && <><span>{album.year}</span><span>•</span></>}
              <span>{album.track_count} tracks</span>
              <span>•</span>
              <span>{formatTotalDuration(album.duration)}</span>
            </div>
            {album.quality && (
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-8"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--accent-primary)' }}
              >
                <Music className="w-3 h-3" />
                {album.quality}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => album.tracks[0] && handlePlayTrack(album.tracks[0])}
                className="flex items-center gap-2 px-8 py-3 rounded-md transition-all hover:scale-105 active:scale-95"
                style={{ background: 'var(--accent-primary)', color: 'var(--text-on-accent)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent-primary)'; }}
              >
                <Play className="w-5 h-5" fill="var(--text-on-accent)" />
                <span className="font-semibold">Play All</span>
              </button>
              <button
                onClick={() => setIsLiked(!isLiked)}
                className="p-3 rounded-md transition-colors"
                style={{
                  border: `1px solid ${isLiked ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                  color: isLiked ? 'var(--accent-primary)' : 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <Heart className="w-5 h-5" fill={isLiked ? 'var(--accent-primary)' : 'none'} />
              </button>
              <button
                onClick={() => album.tracks.length > 0 && download(album.tracks)}
                disabled={isDownloading}
                className="p-3 rounded-md transition-colors"
                style={{ border: '1px solid var(--border-default)', color: isDownloading ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                title={isDownloading ? `Downloading ${progress.current}/${progress.total}` : 'Download for offline'}
              >
                {isDownloading ? (
                  <span className="text-xs font-mono">{progress.current}/{progress.total}</span>
                ) : (
                  <Download className="w-5 h-5" />
                )}
              </button>
              <button
                className="p-3 rounded-md transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Track List */}
      <div className="px-8 py-6">
        {album.tracks.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            No tracks uploaded yet
          </div>
        ) : (
          <div className="rounded-lg overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
            <div
              className="grid grid-cols-12 gap-4 px-6 py-3 text-xs uppercase tracking-wider"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
            >
              <div className="col-span-1">#</div>
              <div className="col-span-7">Title</div>
              <div className="col-span-2">Duration</div>
              <div className="col-span-2">Quality</div>
            </div>

            {album.tracks.map((track) => {
              const isCurrentTrack = currentTrack?.id === track.id;
              const isHovered = hoveredTrack === track.track_number;

              return (
                <div
                  key={track.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center cursor-pointer group transition-all"
                  style={{
                    background: isCurrentTrack ? 'var(--bg-tertiary)' : 'transparent',
                    borderLeft: `3px solid ${isCurrentTrack ? 'var(--accent-primary)' : 'transparent'}`,
                  }}
                  onClick={() => handlePlayTrack(track)}
                  onMouseEnter={() => setHoveredTrack(track.track_number)}
                  onMouseLeave={() => setHoveredTrack(null)}
                  onMouseOver={(e) => {
                    if (!isCurrentTrack) e.currentTarget.style.background = 'var(--bg-tertiary)';
                  }}
                  onMouseOut={(e) => {
                    if (!isCurrentTrack) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div className="col-span-1">
                    {isCurrentTrack && isPlaying ? (
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="w-0.5 rounded-full animate-pulse"
                            style={{
                              height: `${8 + i * 2}px`,
                              background: 'var(--accent-primary)',
                              animationDelay: `${i * 0.1}s`,
                            }}
                          />
                        ))}
                      </div>
                    ) : isHovered ? (
                      <Play className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                    ) : (
                      <span style={{ color: isCurrentTrack ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                        {track.track_number}
                      </span>
                    )}
                  </div>
                  <div className="col-span-7">
                    <div className="font-medium" style={{ color: isCurrentTrack ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                      {track.title}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span style={{ color: 'var(--text-secondary)' }}>{formatDuration(track.duration)}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs px-2 py-1 rounded" style={{ background: 'var(--bg-deep)', color: 'var(--text-secondary)' }}>
                      {track.quality}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

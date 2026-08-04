import { Disc3, Play } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { usePlayer } from '@/app/context/PlayerContext';
import { albumRepository } from '@/app/repositories/albumRepository';
import type { Album } from '@/app/types/api';

interface AlbumCardProps {
  album: Album;
  onClick?: () => void;
  onPlay?: () => void | Promise<void>;
  dense?: boolean;
}

export const AlbumCard = ({
  album,
  onClick,
  onPlay,
  dense = false,
}: AlbumCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocusWithin, setHasFocusWithin] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [canHover, setCanHover] = useState(() => (
    typeof window === 'undefined'
      ? true
      : window.matchMedia('(hover: hover) and (pointer: fine)').matches
  ));
  const queryClient = useQueryClient();
  const { playTrack } = usePlayer();

  useEffect(() => {
    const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const handleChange = (event: MediaQueryListEvent) => setCanHover(event.matches);
    setCanHover(hoverQuery.matches);
    hoverQuery.addEventListener('change', handleChange);
    return () => hoverQuery.removeEventListener('change', handleChange);
  }, []);

  const handlePlay = async () => {
    if (isStarting) return;
    setIsStarting(true);

    try {
      if (onPlay) {
        await onPlay();
        return;
      }

      const albumDetail = await queryClient.fetchQuery({
        queryKey: ['albums', album.id],
        queryFn: () => albumRepository.get(album.id),
      });
      const firstTrack = albumDetail.tracks[0];
      if (firstTrack) playTrack(firstTrack, albumDetail.tracks);
    } catch (error) {
      console.error(`Failed to start album ${album.id}:`, error);
    } finally {
      setIsStarting(false);
    }
  };

  const showPlay = isHovered || hasFocusWithin || !canHover;

  return (
    <article
      className="album-card"
      aria-label={`${album.title} by ${album.artist}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setHasFocusWithin(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setHasFocusWithin(false);
        }
      }}
    >
      {onClick && (
        <button
          type="button"
          aria-label={`Open ${album.title} by ${album.artist}`}
          onClick={onClick}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            borderRadius: 'var(--radius)',
          }}
        >
          <span className="visually-hidden">Open {album.title}</span>
        </button>
      )}

      <div className="album-art-wrap">
        {album.artwork_url ? (
          <img src={album.artwork_url} alt={album.title} className="album-art" />
        ) : (
          <div
            className="album-art"
            role="img"
            aria-label={`${album.title} has no artwork`}
            style={{
              background: 'var(--paper-3)',
              color: 'var(--ink-3)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Disc3 size={40} strokeWidth={1.2} />
          </div>
        )}

        <div
          className="album-vinyl"
          style={{ transform: isHovered ? 'translateX(14%)' : 'translateX(2%)' }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="49" fill="#1a1714" />
            <g fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.3">
              {[12, 18, 24, 30, 36, 42].map((radius) => (
                <circle key={radius} cx="50" cy="50" r={radius} />
              ))}
            </g>
            <circle cx="50" cy="50" r="12" fill="var(--clay)" />
            <circle cx="50" cy="50" r="1" fill="#0a0908" />
          </svg>
        </div>

        <button
          type="button"
          className="album-play"
          aria-label={`Play ${album.title}`}
          aria-busy={isStarting}
          disabled={isStarting}
          onClick={() => void handlePlay()}
          style={{
            zIndex: 2,
            opacity: showPlay ? 1 : 0,
            transform: showPlay ? 'translateY(0)' : 'translateY(8px)',
          }}
        >
          <Play size={16} fill="currentColor" />
        </button>
      </div>

      <div className="album-meta">
        <div className="album-title">{album.title}</div>
        <div className="album-artist">{album.artist}</div>
        {!dense && (album.year || album.genre) && (
          <div className="album-line">
            {album.year && <span className="mono">{album.year}</span>}
            {album.year && album.genre && <span className="dot">·</span>}
            {album.genre && <span>{album.genre}</span>}
          </div>
        )}
      </div>
    </article>
  );
};

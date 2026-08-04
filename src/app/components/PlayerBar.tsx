import {
  useState,
  type CSSProperties,
  type ChangeEvent,
} from 'react';
import {
  Disc3,
  Heart,
  ListMusic,
  Moon,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Sun,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { PlaybackProgress } from '@/app/components/PlaybackProgress';
import { usePlayer } from '@/app/context/PlayerContext';
import { useVinilTheme } from '@/app/hooks/useVinilTheme';
import { formatDuration } from '@/app/utils/format';

interface PlayerBarProps {
  onOpenNowPlaying: () => void;
}

export const PlayerBar = ({ onOpenNowPlaying }: PlayerBarProps) => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    togglePlay,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
  } = usePlayer();
  const [likedTrackIds, setLikedTrackIds] = useState<Set<string>>(() => new Set());
  const { theme, toggleTheme } = useVinilTheme();

  if (!currentTrack) return null;

  const trackDuration = duration || currentTrack.duration;
  const isLiked = likedTrackIds.has(currentTrack.id);
  const repeatLabel = repeatMode === 'one'
    ? 'Repeat one enabled'
    : repeatMode === 'all'
      ? 'Repeat queue enabled'
      : 'Repeat off';

  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(event.target.value));
  };

  const toggleLike = () => {
    setLikedTrackIds((currentLikedTracks) => {
      const nextLikedTracks = new Set(currentLikedTracks);
      if (nextLikedTracks.has(currentTrack.id)) {
        nextLikedTracks.delete(currentTrack.id);
      } else {
        nextLikedTracks.add(currentTrack.id);
      }
      return nextLikedTracks;
    });
  };

  return (
    <section className="player-bar" aria-label="Now playing">
      <div className="pb-left">
        <button
          type="button"
          className="pb-art"
          style={{ isolation: 'isolate' }}
          onClick={onOpenNowPlaying}
          aria-label={`Open Now Playing for ${currentTrack.title}`}
        >
          {currentTrack.artwork_url ? (
            <img src={currentTrack.artwork_url} alt="" />
          ) : (
            <span
              className="flex h-full w-full items-center justify-center rounded-md"
              style={{ background: 'var(--paper-3)', color: 'var(--clay)' }}
              aria-hidden="true"
            >
              <Disc3 size={22} strokeWidth={1.4} />
            </span>
          )}
          <span
            className="pb-art-vinyl"
            aria-hidden="true"
            style={{
              borderRadius: '50%',
              background: 'repeating-radial-gradient(circle, var(--vinyl) 0 3px, #2b2723 4px 5px)',
            }}
          />
        </button>

        <div className="pb-track">
          <button type="button" className="pb-title text-left" onClick={onOpenNowPlaying}>
            {currentTrack.title}
          </button>
          <div className="pb-artist">{currentTrack.artist}</div>
        </div>
        <button
          type="button"
          className={`icon-btn ${isLiked ? 'active' : ''}`}
          onClick={toggleLike}
          aria-label={isLiked ? `Unlike ${currentTrack.title}` : `Like ${currentTrack.title}`}
          aria-pressed={isLiked}
        >
          <Heart size={17} fill={isLiked ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="pb-center">
        <div className="pb-controls">
          <button
            type="button"
            className={`icon-btn ${isShuffle ? 'active' : ''}`}
            onClick={toggleShuffle}
            aria-label={isShuffle ? 'Turn shuffle off' : 'Turn shuffle on'}
            aria-pressed={isShuffle}
          >
            <Shuffle size={17} />
          </button>
          <button type="button" className="icon-btn" onClick={previousTrack} aria-label="Previous track or restart">
            <SkipBack size={19} />
          </button>
          <button
            type="button"
            className="play-btn"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
          </button>
          <button type="button" className="icon-btn" onClick={nextTrack} aria-label="Next track">
            <SkipForward size={19} />
          </button>
          <button
            type="button"
            className={`icon-btn ${repeatMode !== 'off' ? 'active' : ''}`}
            onClick={toggleRepeat}
            aria-label={repeatLabel}
            aria-pressed={repeatMode !== 'off'}
          >
            {repeatMode === 'one' ? <Repeat1 size={17} /> : <Repeat size={17} />}
          </button>
        </div>

        <div className="pb-progress">
          <span className="time mono">{formatDuration(Math.floor(currentTime))}</span>
          <PlaybackProgress value={currentTime} maximum={trackDuration} onChange={seekTo} />
          <span className="time mono">{formatDuration(Math.floor(trackDuration))}</span>
        </div>
      </div>

      <div className="pb-right">
        <span className="icon-btn" role="img" aria-label="Queue" title="Queue">
          <ListMusic size={17} />
        </span>
        <button
          type="button"
          className="icon-btn"
          onClick={onOpenNowPlaying}
          aria-label="Open full-screen Now Playing"
        >
          <Disc3 size={17} />
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          aria-pressed={isMuted}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={handleVolumeChange}
          className="vol-slider"
          style={{ '--v': `${volume}%` } as CSSProperties}
          aria-label="Volume"
          aria-valuetext={isMuted ? 'Muted' : `${Math.round(volume)} percent`}
        />
        <button
          type="button"
          className="icon-btn"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Use light theme' : 'Use dark theme'}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </section>
  );
};

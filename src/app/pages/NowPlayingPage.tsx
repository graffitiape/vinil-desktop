import {
  ArrowLeft,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { PlaybackProgress } from '@/app/components/PlaybackProgress';
import { VinylTurntable } from '@/app/components/VinylTurntable';
import { usePlayer } from '@/app/context/PlayerContext';
import { useAlbum } from '@/app/hooks/useAlbums';
import { formatDuration } from '@/app/utils/format';

interface NowPlayingPageProps {
  onBack: () => void;
}

export const NowPlayingPage = ({ onBack }: NowPlayingPageProps) => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    isShuffle,
    repeatMode,
    togglePlay,
    nextTrack,
    previousTrack,
    seekTo,
    toggleShuffle,
    toggleRepeat,
  } = usePlayer();
  const { data: album } = useAlbum(currentTrack?.album_id ?? '');

  if (!currentTrack) return null;

  const trackDuration = duration || currentTrack.duration;
  const repeatLabel = repeatMode === 'one'
    ? 'Repeat one enabled'
    : repeatMode === 'all'
      ? 'Repeat queue enabled'
      : 'Repeat off';

  return (
    <section className="now-playing" aria-label={`Now playing ${currentTrack.title}`}>
      {currentTrack.artwork_url && (
        <div
          className="np-bg"
          style={{ backgroundImage: `url(${currentTrack.artwork_url})` }}
          aria-hidden="true"
        />
      )}

      <header className="np-top">
        <button type="button" className="back-btn" style={{ marginBottom: 0 }} onClick={onBack}>
          <ArrowLeft size={17} />
          Back
        </button>
        <div className="np-quality">
          <span className="dot-live" aria-hidden="true" />
          {currentTrack.quality}
        </div>
      </header>

      <div className="np-main">
        <VinylTurntable />

        <div className="np-text">
          <h1 className="np-title serif">{currentTrack.title}</h1>
          <p className="np-artist serif">{currentTrack.artist}</p>
          <p className="np-album mono">{album?.title ?? 'Personal library'}</p>
        </div>

        <div className="np-progress">
          <PlaybackProgress value={currentTime} maximum={trackDuration} onChange={seekTo} large />
          <div className="np-times mono">
            <span>{formatDuration(Math.floor(currentTime))}</span>
            <span>{formatDuration(Math.floor(trackDuration))}</span>
          </div>
        </div>

        <div className="np-controls" aria-label="Playback controls">
          <button
            type="button"
            className={`icon-btn lg ${isShuffle ? 'active' : ''}`}
            onClick={toggleShuffle}
            aria-label={isShuffle ? 'Turn shuffle off' : 'Turn shuffle on'}
            aria-pressed={isShuffle}
          >
            <Shuffle size={22} />
          </button>
          <button type="button" className="icon-btn lg" onClick={previousTrack} aria-label="Previous track or restart">
            <SkipBack size={27} />
          </button>
          <button
            type="button"
            className="play-btn lg"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={28} /> : <Play size={28} fill="currentColor" />}
          </button>
          <button type="button" className="icon-btn lg" onClick={nextTrack} aria-label="Next track">
            <SkipForward size={27} />
          </button>
          <button
            type="button"
            className={`icon-btn lg ${repeatMode !== 'off' ? 'active' : ''}`}
            onClick={toggleRepeat}
            aria-label={repeatLabel}
            aria-pressed={repeatMode !== 'off'}
          >
            {repeatMode === 'one' ? <Repeat1 size={22} /> : <Repeat size={22} />}
          </button>
        </div>
      </div>
    </section>
  );
};

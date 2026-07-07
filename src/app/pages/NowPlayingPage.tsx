import { ArrowLeft, Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Repeat1, Volume2, VolumeX, List, FileText, MoreVertical } from 'lucide-react';
import { usePlayer } from '@/app/context/PlayerContext';
import { formatDuration } from '@/app/utils/format';
import { VinylTurntable } from '@/app/components/VinylTurntable';
import { useState } from 'react';

interface NowPlayingPageProps {
  onBack: () => void;
}

export const NowPlayingPage = ({ onBack }: NowPlayingPageProps) => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isShuffle,
    repeatMode,
    togglePlay,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume,
    toggleShuffle,
    toggleRepeat,
  } = usePlayer();

  const [isMuted, setIsMuted] = useState(false);

  if (!currentTrack) return null;

  const trackDuration = duration || currentTrack.duration;
  const progress = trackDuration > 0 ? (currentTime / trackDuration) * 100 : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = Math.floor(percentage * trackDuration);
    seekTo(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      setVolume(0);
    } else {
      setVolume(70);
    }
  };

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ background: 'var(--bg-deep)', zIndex: 100 }}
    >
      {/* Background with blurred album art */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${currentTrack.artwork_url || ''})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(60px)',
          opacity: 0.12,
        }}
      />

      {/* Top bar */}
      <div className="relative flex items-center justify-between p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors"
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
        <div className="flex items-center gap-4">
          <div
            className="px-3 py-1.5 rounded-full flex items-center gap-2"
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-default)' }}
          >
            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-primary)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
              {currentTrack.quality}
            </span>
          </div>
          <button
            className="p-2 rounded-md transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-12 pb-12">
        <div className="mb-12">
          <VinylTurntable />
        </div>

        {/* Track Info */}
        <div className="text-center space-y-2 mb-8 max-w-2xl">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {currentTrack.title}
          </h1>
          <button className="text-lg hover:underline" style={{ color: 'var(--accent-primary)' }}>
            {currentTrack.artist}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-3xl space-y-2 mb-8">
          <div
            className="h-1.5 rounded-full cursor-pointer group relative"
            style={{ background: 'var(--bg-secondary)', boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)' }}
            onClick={handleSeek}
          >
            <div
              className="h-full rounded-full relative"
              style={{ width: `${progress}%`, background: 'var(--accent-primary)' }}
            >
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'var(--text-primary)', boxShadow: '0 0 12px rgba(245, 166, 35, 0.8)' }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono tabular-nums" style={{ color: 'var(--text-muted)' }}>
              {formatDuration(Math.floor(currentTime))}
            </span>
            <span className="text-sm font-mono tabular-nums" style={{ color: 'var(--text-muted)' }}>
              {formatDuration(Math.floor(trackDuration))}
            </span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-6 mb-12">
          <button onClick={toggleShuffle} className="p-2 rounded-md transition-colors"
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <Shuffle className="w-7 h-7" style={{ color: isShuffle ? 'var(--accent-primary)' : 'var(--text-secondary)' }} />
          </button>
          <button onClick={previousTrack} className="p-2 rounded-md transition-colors"
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <SkipBack className="w-9 h-9" style={{ color: 'var(--text-primary)' }} />
          </button>
          <button
            onClick={togglePlay}
            className="flex items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95"
            style={{
              width: '64px', height: '64px',
              background: 'var(--accent-primary)',
              boxShadow: '0 4px 16px rgba(245, 166, 35, 0.4)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent-primary)'; }}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7" style={{ color: 'var(--text-on-accent)' }} />
            ) : (
              <Play className="w-7 h-7 ml-1" style={{ color: 'var(--text-on-accent)' }} />
            )}
          </button>
          <button onClick={nextTrack} className="p-2 rounded-md transition-colors"
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <SkipForward className="w-9 h-9" style={{ color: 'var(--text-primary)' }} />
          </button>
          <button onClick={toggleRepeat} className="p-2 rounded-md transition-colors"
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-7 h-7" style={{ color: 'var(--accent-primary)' }} />
            ) : (
              <Repeat className="w-7 h-7" style={{ color: repeatMode === 'all' ? 'var(--accent-primary)' : 'var(--text-secondary)' }} />
            )}
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center justify-between w-full max-w-3xl">
          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="p-2 rounded-md transition-colors"
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-6 h-6" style={{ color: 'var(--text-secondary)' }} />
              ) : (
                <Volume2 className="w-6 h-6" style={{ color: 'var(--text-secondary)' }} />
              )}
            </button>
            <input
              type="range" min="0" max="100"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-24 h-1 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--accent-primary) 0%, var(--accent-primary) ${volume}%, var(--bg-secondary) ${volume}%, var(--bg-secondary) 100%)`,
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors"
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
              <List className="w-5 h-5" />
              <span className="text-sm font-medium">Queue</span>
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors"
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
              <FileText className="w-5 h-5" />
              <span className="text-sm font-medium">Lyrics</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import { Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Repeat1, Heart, Volume2, VolumeX, List, Disc3 } from 'lucide-react';
import { usePlayer } from '@/app/context/PlayerContext';
import { formatDuration } from '@/app/utils/format';
import { useState } from 'react';

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

  const [isLiked, setIsLiked] = useState(false);
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
      className="flex items-center justify-between px-4 py-3 gap-6 shrink-0"
      style={{
        height: '90px',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-default)',
        zIndex: 50,
      }}
    >
      {/* Left - Now Playing */}
      <div className="flex items-center gap-4 w-[30%]">
        <div className="relative group cursor-pointer" onClick={onOpenNowPlaying}>
          <img
            src={currentTrack.artwork_url || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop'}
            alt={currentTrack.title}
            className="w-14 h-14 rounded"
          />
          <div
            className="absolute -right-1 top-0 bottom-0 w-2 rounded-r"
            style={{
              background: 'var(--vinyl-black)',
              borderTop: '1px solid var(--vinyl-highlight)',
              borderBottom: '1px solid var(--vinyl-highlight)',
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {currentTrack.title}
          </div>
          <button
            className="text-xs truncate hover:underline"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            {currentTrack.artist}
          </button>
        </div>
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="p-2 rounded-md transition-colors"
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <Heart
            className="w-5 h-5"
            style={{
              color: isLiked ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fill: isLiked ? 'var(--accent-primary)' : 'none',
            }}
          />
        </button>
      </div>

      {/* Center - Controls */}
      <div className="flex flex-col items-center gap-2 w-[40%]">
        <div className="flex items-center gap-3">
          <button onClick={toggleShuffle} className="p-2 rounded-md transition-colors"
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <Shuffle className="w-5 h-5" style={{ color: isShuffle ? 'var(--accent-primary)' : 'var(--text-secondary)' }} />
          </button>
          <button onClick={previousTrack} className="p-2 rounded-md transition-colors"
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <SkipBack className="w-6 h-6" style={{ color: 'var(--text-primary)' }} />
          </button>
          <button
            onClick={togglePlay}
            className="flex items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95"
            style={{ width: '40px', height: '40px', background: 'var(--accent-primary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent-primary)'; }}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" style={{ color: 'var(--text-on-accent)' }} />
            ) : (
              <Play className="w-5 h-5" style={{ color: 'var(--text-on-accent)' }} />
            )}
          </button>
          <button onClick={nextTrack} className="p-2 rounded-md transition-colors"
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <SkipForward className="w-6 h-6" style={{ color: 'var(--text-primary)' }} />
          </button>
          <button onClick={toggleRepeat} className="p-2 rounded-md transition-colors"
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
            ) : (
              <Repeat className="w-5 h-5" style={{ color: repeatMode === 'all' ? 'var(--accent-primary)' : 'var(--text-secondary)' }} />
            )}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 w-full">
          <span className="text-xs font-mono tabular-nums" style={{ color: 'var(--text-muted)' }}>
            {formatDuration(Math.floor(currentTime))}
          </span>
          <div
            className="flex-1 h-1.5 rounded-full cursor-pointer group relative"
            style={{ background: 'var(--bg-deep)' }}
            onClick={handleSeek}
          >
            <div
              className="h-full rounded-full relative"
              style={{ width: `${progress}%`, background: 'var(--accent-primary)' }}
            >
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'var(--text-primary)', boxShadow: '0 0 8px rgba(245, 166, 35, 0.6)' }}
              />
            </div>
          </div>
          <span className="text-xs font-mono tabular-nums" style={{ color: 'var(--text-muted)' }}>
            {formatDuration(Math.floor(trackDuration))}
          </span>
        </div>
      </div>

      {/* Right - Extras */}
      <div className="flex items-center justify-end gap-3 w-[30%]">
        <button onClick={onOpenNowPlaying} className="p-2 rounded-md transition-colors" title="Now Playing"
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <Disc3 className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
        </button>
        <button className="p-2 rounded-md transition-colors" title="Queue"
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <List className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
        </button>
        <div className="flex items-center gap-2">
          <button onClick={toggleMute} className="p-2 rounded-md transition-colors"
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            ) : (
              <Volume2 className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--accent-primary) 0%, var(--accent-primary) ${volume}%, var(--bg-deep) ${volume}%, var(--bg-deep) 100%)`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

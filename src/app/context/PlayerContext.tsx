import { createContext, useContext, useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import { trackRepository } from '@/app/repositories/trackRepository';
import { offlineCache } from '@/app/services/offlineCache';
import type { Track } from '@/app/types/api';

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  queue: Track[];
  playTrack: (track: Track, queue?: Track[]) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (track: Track) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
};

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(70);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [queue, setQueue] = useState<Track[]>([]);

  // Create audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.volume = 0.7;
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    audio.addEventListener('ended', () => {
      handleTrackEnded();
    });

    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const handleTrackEnded = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (repeatMode === 'one') {
      audio.currentTime = 0;
      audio.play();
      return;
    }

    // Find next track
    const currentIndex = queue.findIndex((t) => t.id === currentTrack?.id);
    if (currentIndex < queue.length - 1) {
      const nextTrackInQueue = isShuffle
        ? queue[Math.floor(Math.random() * queue.length)]
        : queue[currentIndex + 1];
      loadAndPlay(nextTrackInQueue);
    } else if (repeatMode === 'all' && queue.length > 0) {
      loadAndPlay(queue[0]);
    } else {
      setIsPlaying(false);
    }
  }, [queue, currentTrack, repeatMode, isShuffle]);

  // Update ended handler when deps change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handler = () => handleTrackEnded();
    audio.addEventListener('ended', handler);
    return () => audio.removeEventListener('ended', handler);
  }, [handleTrackEnded]);

  const loadAndPlay = async (track: Track) => {
    const audio = audioRef.current;
    if (!audio) return;

    setCurrentTrack(track);
    setCurrentTime(0);
    setDuration(track.duration);

    try {
      // Try local cache first, fall back to streaming
      const localUrl = await offlineCache.getLocalUrl(track.id).catch(() => null);
      if (localUrl) {
        audio.src = localUrl;
      } else {
        const streamUrl = await trackRepository.getStreamUrl(track.id);
        audio.src = streamUrl;
      }
      await audio.play();
    } catch (err) {
      console.error('Failed to play track:', err);
      setIsPlaying(false);
    }
  };

  const playTrack = useCallback((track: Track, newQueue?: Track[]) => {
    if (newQueue) {
      setQueue(newQueue);
    }
    loadAndPlay(track);
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }, []);

  const nextTrack = useCallback(() => {
    const currentIndex = queue.findIndex((t) => t.id === currentTrack?.id);
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * queue.length);
      loadAndPlay(queue[randomIndex]);
    } else if (currentIndex < queue.length - 1) {
      loadAndPlay(queue[currentIndex + 1]);
    } else if (repeatMode === 'all' && queue.length > 0) {
      loadAndPlay(queue[0]);
    }
  }, [queue, currentTrack, isShuffle, repeatMode]);

  const previousTrack = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }

    const currentIndex = queue.findIndex((t) => t.id === currentTrack?.id);
    if (currentIndex > 0) {
      loadAndPlay(queue[currentIndex - 1]);
    }
  }, [queue, currentTrack]);

  const seekTo = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol / 100;
    }
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
    setRepeatMode((prev) => {
      const currentIndex = modes.indexOf(prev);
      return modes[(currentIndex + 1) % modes.length];
    });
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setQueue((prev) => [...prev, track]);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isShuffle,
        repeatMode,
        queue,
        playTrack,
        togglePlay,
        nextTrack,
        previousTrack,
        seekTo,
        setVolume,
        toggleShuffle,
        toggleRepeat,
        addToQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

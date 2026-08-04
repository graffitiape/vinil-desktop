import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  appendTrackToQueue,
  buildQueue,
  createEmptyShuffleCycle,
  createShuffleCycle,
  getNextQueueTrack,
  getPreviousQueueTrack,
  type RepeatMode,
  type ShuffleCycle,
} from '@/app/context/playerQueue';
import { useAudioEngine } from '@/app/context/useAudioEngine';
import type { Track } from '@/app/types/api';

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  queue: Track[];
  playTrack: (track: Track, queue?: Track[]) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (track: Track) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within PlayerProvider');
  return context;
};

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const engine = useAudioEngine();
  const {
    audioRef,
    currentTrack,
    loadAndPlay,
    markPlaybackStopped,
    restartTrack,
  } = engine;
  const shuffleCycleRef = useRef<ShuffleCycle>(createEmptyShuffleCycle());
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [queue, setQueue] = useState<Track[]>([]);

  const takeNextQueueTrack = useCallback(() => {
    if (!currentTrack) return null;
    const step = getNextQueueTrack(
      queue,
      currentTrack.id,
      isShuffle,
      repeatMode,
      shuffleCycleRef.current,
    );
    shuffleCycleRef.current = step.cycle;
    return step.track;
  }, [currentTrack, isShuffle, queue, repeatMode]);

  const takePreviousQueueTrack = useCallback(() => {
    if (!currentTrack) return null;
    const step = getPreviousQueueTrack(
      queue,
      currentTrack.id,
      isShuffle,
      repeatMode,
      shuffleCycleRef.current,
    );
    shuffleCycleRef.current = step.cycle;
    return step.track;
  }, [currentTrack, isShuffle, queue, repeatMode]);

  const handleTrackEnded = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;

    if (repeatMode === 'one') {
      restartTrack(true);
      return;
    }

    const next = takeNextQueueTrack();
    if (next) {
      void loadAndPlay(next);
    } else {
      markPlaybackStopped();
    }
  }, [
    audioRef,
    currentTrack,
    loadAndPlay,
    markPlaybackStopped,
    repeatMode,
    restartTrack,
    takeNextQueueTrack,
  ]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.addEventListener('ended', handleTrackEnded);
    return () => audio.removeEventListener('ended', handleTrackEnded);
  }, [audioRef, handleTrackEnded]);

  const playTrack = useCallback((track: Track, requestedQueue?: Track[]) => {
    setQueue((currentQueue) => {
      const nextQueue = buildQueue(track, requestedQueue, currentQueue);
      shuffleCycleRef.current = isShuffle
        ? createShuffleCycle(nextQueue, track.id)
        : createEmptyShuffleCycle();
      return nextQueue;
    });
    void loadAndPlay(track);
  }, [isShuffle, loadAndPlay]);

  const nextTrack = useCallback(() => {
    const next = takeNextQueueTrack();
    if (next) void loadAndPlay(next);
  }, [loadAndPlay, takeNextQueueTrack]);

  const previousTrack = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (audio.currentTime > 3) {
      restartTrack(false);
      return;
    }

    const previous = takePreviousQueueTrack();
    if (previous) {
      void loadAndPlay(previous);
    } else {
      restartTrack(false);
    }
  }, [audioRef, currentTrack, loadAndPlay, restartTrack, takePreviousQueueTrack]);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((enabled) => {
      const nextEnabled = !enabled;
      shuffleCycleRef.current = nextEnabled && currentTrack
        ? createShuffleCycle(queue, currentTrack.id)
        : createEmptyShuffleCycle();
      return nextEnabled;
    });
  }, [currentTrack, queue]);

  const toggleRepeat = useCallback(() => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    setRepeatMode((currentMode) => modes[(modes.indexOf(currentMode) + 1) % modes.length]);
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setQueue((currentQueue) => {
      const result = appendTrackToQueue(
        currentQueue,
        track,
        isShuffle,
        currentTrack?.id,
        shuffleCycleRef.current,
      );
      shuffleCycleRef.current = result.cycle;
      return result.queue;
    });
  }, [currentTrack, isShuffle]);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack: engine.currentTrack,
        isPlaying: engine.isPlaying,
        currentTime: engine.currentTime,
        duration: engine.duration,
        volume: engine.volume,
        isMuted: engine.isMuted,
        isShuffle,
        repeatMode,
        queue,
        playTrack,
        togglePlay: engine.togglePlay,
        nextTrack,
        previousTrack,
        seekTo: engine.seekTo,
        setVolume: engine.setVolume,
        toggleMute: engine.toggleMute,
        toggleShuffle,
        toggleRepeat,
        addToQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

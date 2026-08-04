import { useCallback, useEffect, useRef, useState } from 'react';
import { trackRepository } from '@/app/repositories/trackRepository';
import { offlineCache } from '@/app/services/offlineCache';
import type { Track } from '@/app/types/api';

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), maximum);

export const useAudioEngine = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeObjectUrlRef = useRef<string | null>(null);
  const loadRequestRef = useRef(0);
  const lastAudibleVolumeRef = useRef(70);
  const hasLoadedSourceRef = useRef(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(70);

  const revokeActiveObjectUrl = useCallback(() => {
    if (!activeObjectUrlRef.current) return;
    URL.revokeObjectURL(activeObjectUrlRef.current);
    activeObjectUrlRef.current = null;
  }, []);

  const loadAndPlay = useCallback(async (track: Track) => {
    const audio = audioRef.current;
    if (!audio || !track) return;

    const requestId = ++loadRequestRef.current;
    audio.pause();
    hasLoadedSourceRef.current = false;
    revokeActiveObjectUrl();
    audio.removeAttribute('src');
    audio.load();
    setCurrentTrack(track);
    setCurrentTime(0);
    setDuration(track.duration);

    let localUrl: string | null = null;

    try {
      localUrl = await offlineCache.getLocalUrl(track.id).catch(() => null);
      const sourceUrl = localUrl ?? await trackRepository.getStreamUrl(track.id);

      if (requestId !== loadRequestRef.current || audioRef.current !== audio) {
        if (localUrl) URL.revokeObjectURL(localUrl);
        return;
      }

      if (localUrl) activeObjectUrlRef.current = localUrl;
      audio.src = sourceUrl;
      hasLoadedSourceRef.current = true;
      audio.load();
      await audio.play();
    } catch (error) {
      if (requestId !== loadRequestRef.current) return;
      console.error('Failed to play track:', error);
      setIsPlaying(false);
    }
  }, [revokeActiveObjectUrl]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = 0.7;
    audioRef.current = audio;

    const handleTimeUpdate = () => setCurrentTime(Number.isFinite(audio.currentTime) ? audio.currentTime : 0);
    const handleMetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) setDuration(audio.duration);
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      hasLoadedSourceRef.current = false;
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleMetadata);
    audio.addEventListener('durationchange', handleMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      loadRequestRef.current += 1;
      hasLoadedSourceRef.current = false;
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleMetadata);
      audio.removeEventListener('durationchange', handleMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.removeAttribute('src');
      audioRef.current = null;
      revokeActiveObjectUrl();
    };
  }, [revokeActiveObjectUrl]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack || !hasLoadedSourceRef.current) return;

    if (audio.paused) {
      void audio.play().catch((error) => {
        console.error('Failed to resume track:', error);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [currentTrack]);

  const restartTrack = useCallback((shouldPlay: boolean) => {
    const audio = audioRef.current;
    if (!audio || !hasLoadedSourceRef.current) return;

    audio.currentTime = 0;
    setCurrentTime(0);
    if (!shouldPlay) return;

    void audio.play().catch((error) => {
      console.error('Failed to repeat track:', error);
      setIsPlaying(false);
    });
  }, []);

  const seekTo = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const maximum = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : duration;
    const nextTime = clamp(Number.isFinite(time) ? time : 0, 0, Math.max(maximum, 0));
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  }, [duration]);

  const setVolume = useCallback((nextVolume: number) => {
    const normalizedVolume = clamp(Number.isFinite(nextVolume) ? nextVolume : 0, 0, 100);
    if (normalizedVolume > 0) lastAudibleVolumeRef.current = normalizedVolume;
    setVolumeState(normalizedVolume);
    if (audioRef.current) audioRef.current.volume = normalizedVolume / 100;
  }, []);

  const toggleMute = useCallback(() => {
    setVolume(volume > 0 ? 0 : lastAudibleVolumeRef.current || 70);
  }, [setVolume, volume]);

  const markPlaybackStopped = useCallback(() => setIsPlaying(false), []);

  return {
    audioRef,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted: volume === 0,
    loadAndPlay,
    togglePlay,
    restartTrack,
    seekTo,
    setVolume,
    toggleMute,
    markPlaybackStopped,
  };
};

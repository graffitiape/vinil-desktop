import { useState, useEffect } from 'react';
import { offlineCache } from '@/app/services/offlineCache';
import type { Track } from '@/app/types/api';

export function useDownloadAlbum() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const download = async (tracks: Track[]) => {
    setIsDownloading(true);
    setProgress({ current: 0, total: tracks.length });

    for (let i = 0; i < tracks.length; i++) {
      const cached = await offlineCache.isCached(tracks[i].id).catch(() => false);
      if (!cached) {
        await offlineCache.download(tracks[i].id).catch((err) => {
          console.error(`Failed to download track ${tracks[i].title}:`, err);
        });
      }
      setProgress({ current: i + 1, total: tracks.length });
    }

    setIsDownloading(false);
  };

  return { download, isDownloading, progress };
}

export function useTrackCacheStatus(trackId: string) {
  const [isCached, setIsCached] = useState(false);

  useEffect(() => {
    offlineCache.isCached(trackId).then(setIsCached).catch(() => setIsCached(false));
  }, [trackId]);

  return isCached;
}

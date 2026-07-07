import { exists, mkdir, writeFile, readFile, BaseDirectory } from '@tauri-apps/plugin-fs';
import { trackRepository } from '@/app/repositories/trackRepository';

const CACHE_DIR = 'offline';

async function ensureCacheDir(): Promise<void> {
  const dirExists = await exists(CACHE_DIR, { baseDir: BaseDirectory.AppData }).catch(() => false);
  if (!dirExists) {
    await mkdir(CACHE_DIR, { baseDir: BaseDirectory.AppData, recursive: true });
  }
}

function trackPath(trackId: string): string {
  return `${CACHE_DIR}/${trackId}.audio`;
}

export const offlineCache = {
  /** Check if a track is cached locally. */
  async isCached(trackId: string): Promise<boolean> {
    return exists(trackPath(trackId), { baseDir: BaseDirectory.AppData }).catch(() => false);
  },

  /** Download a track from the backend and save it locally. Returns the local blob URL. */
  async download(trackId: string): Promise<string> {
    await ensureCacheDir();

    const streamUrl = await trackRepository.getStreamUrl(trackId);
    const response = await fetch(streamUrl);
    const arrayBuffer = await response.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    await writeFile(trackPath(trackId), data, { baseDir: BaseDirectory.AppData });

    // Return a blob URL for immediate playback
    const blob = new Blob([data], { type: 'audio/mpeg' });
    return URL.createObjectURL(blob);
  },

  /** Get a blob URL from cached data. Returns null if not cached. */
  async getLocalUrl(trackId: string): Promise<string | null> {
    const cached = await offlineCache.isCached(trackId);
    if (!cached) return null;

    const data = await readFile(trackPath(trackId), { baseDir: BaseDirectory.AppData });
    const blob = new Blob([data], { type: 'audio/mpeg' });
    return URL.createObjectURL(blob);
  },
};

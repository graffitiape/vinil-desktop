import { apiClient } from '@/app/services/axios';
import type { Track } from '@/app/types/api';

export const uploadRepository = {
  uploadTrack: (file: File, albumId: string, onProgress?: (percent: number) => void) => {
    const form = new FormData();
    form.append('file', file);
    form.append('album_id', albumId);

    return apiClient
      .post<Track>('/upload', form, {
        onUploadProgress: (e) => {
          if (e.total && onProgress) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        },
      })
      .then((r) => r.data);
  },
};

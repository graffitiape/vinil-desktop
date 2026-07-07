import { apiClient } from '@/app/services/axios';
import type { Track } from '@/app/types/api';

export const trackRepository = {
  list: (params?: { album_id?: string; artist?: string; genre?: string }) =>
    apiClient.get<Track[]>('/tracks', { params }).then((r) => r.data),

  get: (id: string) => apiClient.get<Track>(`/tracks/${id}`).then((r) => r.data),

  delete: (id: string) => apiClient.delete(`/tracks/${id}`),

  /** Fetches the presigned stream URL (follows the redirect). */
  getStreamUrl: async (id: string): Promise<string> => {
    // The backend returns a 307 redirect to S3. We fetch with redirect: 'manual'
    // to grab the Location header, so the Audio element can use the direct URL.
    const token = localStorage.getItem('vinil_token');
    const res = await fetch(`http://localhost:3333/api/tracks/${id}/stream`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      redirect: 'follow',
    });
    // After following the redirect, res.url is the final presigned S3 URL
    return res.url;
  },
};

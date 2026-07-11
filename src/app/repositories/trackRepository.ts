import { apiClient, apiUrl } from '@/app/services/axios';
import type { Track } from '@/app/types/api';

export const trackRepository = {
  list: (params?: { album_id?: string; artist?: string; genre?: string }) =>
    apiClient.get<Track[]>('/tracks', { params }).then((r) => r.data),

  get: (id: string) => apiClient.get<Track>(`/tracks/${id}`).then((r) => r.data),

  delete: (id: string) => apiClient.delete(`/tracks/${id}`),

  /** Builds an authenticated stream URL that the Audio element can request directly. */
  getStreamUrl: async (id: string): Promise<string> => {
    const token = localStorage.getItem('vinil_token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const url = new URL(apiUrl(`/tracks/${id}/stream`));
    url.searchParams.set('token', token);
    return url.toString();
  },
};

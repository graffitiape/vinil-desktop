import { apiClient } from '@/app/services/axios';
import type { Playlist, PlaylistDetail, CreatePlaylistRequest } from '@/app/types/api';

export const playlistRepository = {
  list: () => apiClient.get<Playlist[]>('/playlists').then((r) => r.data),

  get: (id: string) => apiClient.get<PlaylistDetail>(`/playlists/${id}`).then((r) => r.data),

  create: (data: CreatePlaylistRequest) =>
    apiClient.post<Playlist>('/playlists', data).then((r) => r.data),

  update: (id: string, data: Partial<CreatePlaylistRequest>) =>
    apiClient.put<Playlist>(`/playlists/${id}`, data).then((r) => r.data),

  delete: (id: string) => apiClient.delete(`/playlists/${id}`),

  addTrack: (playlistId: string, trackId: string) =>
    apiClient.post(`/playlists/${playlistId}/tracks`, { track_id: trackId }),

  removeTrack: (playlistId: string, trackId: string) =>
    apiClient.delete(`/playlists/${playlistId}/tracks/${trackId}`),
};

import { apiClient } from '@/app/services/axios';
import type { Album, AlbumDetail, CreateAlbumRequest } from '@/app/types/api';

export const albumRepository = {
  list: () => apiClient.get<Album[]>('/albums').then((r) => r.data),

  get: (id: string) => apiClient.get<AlbumDetail>(`/albums/${id}`).then((r) => r.data),

  create: (data: CreateAlbumRequest) =>
    apiClient.post<Album>('/albums', data).then((r) => r.data),

  update: (id: string, data: Partial<CreateAlbumRequest>) =>
    apiClient.put<Album>(`/albums/${id}`, data).then((r) => r.data),

  delete: (id: string) => apiClient.delete(`/albums/${id}`),
};

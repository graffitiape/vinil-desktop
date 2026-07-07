import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { playlistRepository } from '@/app/repositories/playlistRepository';
import type { CreatePlaylistRequest } from '@/app/types/api';

export function usePlaylists() {
  return useQuery({
    queryKey: ['playlists'],
    queryFn: playlistRepository.list,
  });
}

export function usePlaylist(id: string) {
  return useQuery({
    queryKey: ['playlists', id],
    queryFn: () => playlistRepository.get(id),
    enabled: !!id,
  });
}

export function useCreatePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePlaylistRequest) => playlistRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
}

export function useDeletePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => playlistRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
}

export function useAddTrackToPlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playlistId, trackId }: { playlistId: string; trackId: string }) =>
      playlistRepository.addTrack(playlistId, trackId),
    onSuccess: (_, { playlistId }) => {
      queryClient.invalidateQueries({ queryKey: ['playlists', playlistId] });
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
}

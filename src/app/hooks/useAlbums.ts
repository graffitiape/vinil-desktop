import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { albumRepository } from '@/app/repositories/albumRepository';
import type { CreateAlbumRequest } from '@/app/types/api';

export function useAlbums() {
  return useQuery({
    queryKey: ['albums'],
    queryFn: albumRepository.list,
  });
}

export function useAlbum(id: string) {
  return useQuery({
    queryKey: ['albums', id],
    queryFn: () => albumRepository.get(id),
    enabled: !!id,
  });
}

export function useCreateAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAlbumRequest) => albumRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    },
  });
}

export function useDeleteAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => albumRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    },
  });
}

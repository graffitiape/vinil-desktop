import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trackRepository } from '@/app/repositories/trackRepository';

export function useTracks(params?: { album_id?: string; artist?: string; genre?: string }) {
  return useQuery({
    queryKey: ['tracks', params],
    queryFn: () => trackRepository.list(params),
  });
}

export function useTrack(id: string) {
  return useQuery({
    queryKey: ['tracks', id],
    queryFn: () => trackRepository.get(id),
    enabled: !!id,
  });
}

export function useDeleteTrack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => trackRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    },
  });
}

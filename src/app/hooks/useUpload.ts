import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadRepository } from '@/app/repositories/uploadRepository';
import { useState } from 'react';

export function useUploadTrack() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: ({ file, albumId }: { file: File; albumId: string }) =>
      uploadRepository.uploadTrack(file, albumId, setProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      setProgress(0);
    },
  });

  return { ...mutation, progress };
}

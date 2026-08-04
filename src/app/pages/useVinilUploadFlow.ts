import { useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { useAlbums, useCreateAlbum } from '@/app/hooks/useAlbums';
import { useUploadTrack } from '@/app/hooks/useUpload';
import {
  formatFileSize,
  getRequestError,
  type QueuedAudioFile,
} from '@/app/pages/vinilUploadParts';

export const NEW_ALBUM_VALUE = '__new_album__';
const AUDIO_FILE_PATTERN = /\.(flac|wav|mp3|aac|ogg|alac)$/i;

export const useVinilUploadFlow = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<QueuedAudioFile[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [showNewAlbum, setShowNewAlbum] = useState(false);
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [newAlbumArtist, setNewAlbumArtist] = useState('');
  const [newAlbumGenre, setNewAlbumGenre] = useState('');
  const [newAlbumYear, setNewAlbumYear] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [isUploadingBatch, setIsUploadingBatch] = useState(false);
  const batchLockRef = useRef(false);

  const {
    data: albums = [],
    isLoading: albumsLoading,
    isError: albumsError,
    refetch: refetchAlbums,
  } = useAlbums();
  const createAlbum = useCreateAlbum();
  const uploadTrack = useUploadTrack();
  const isWorking = isUploadingBatch || uploadTrack.isPending || createAlbum.isPending;

  const addFiles = (fileList: FileList | File[]) => {
    if (batchLockRef.current || isWorking) return;

    const audioFiles = Array.from(fileList).filter(
      (file) => file.type.startsWith('audio/') || AUDIO_FILE_PATTERN.test(file.name),
    );

    if (audioFiles.length === 0) {
      setActionError('No supported audio files were found.');
      return;
    }

    setActionError(null);
    setFiles((current) => [
      ...current,
      ...audioFiles.map((file) => ({
        file,
        name: file.name,
        size: formatFileSize(file.size),
        progress: 0,
        status: 'pending' as const,
      })),
    ]);
  };

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isWorking) setIsDragging(true);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => event.preventDefault();

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) addFiles(event.target.files);
    event.target.value = '';
  };

  const handleDestinationChange = (value: string) => {
    setActionError(null);
    if (value === NEW_ALBUM_VALUE) {
      setShowNewAlbum(true);
      setSelectedAlbumId(null);
      return;
    }

    setShowNewAlbum(false);
    setSelectedAlbumId(value || null);
  };

  const removeFile = (index: number) => {
    if (batchLockRef.current || isWorking) return;
    setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
  };

  const resetUpload = () => {
    if (batchLockRef.current || isWorking) return;
    setFiles([]);
    setSelectedAlbumId(null);
    setShowNewAlbum(false);
    setNewAlbumTitle('');
    setNewAlbumArtist('');
    setNewAlbumGenre('');
    setNewAlbumYear('');
    setActionError(null);
  };

  const handleUpload = async () => {
    if (batchLockRef.current || isWorking) return;

    batchLockRef.current = true;
    setIsUploadingBatch(true);
    setActionError(null);
    try {
      let albumId = selectedAlbumId;

      if (showNewAlbum) {
        try {
          const album = await createAlbum.mutateAsync({
            title: newAlbumTitle.trim(),
            artist: newAlbumArtist.trim(),
            genre: newAlbumGenre.trim() || undefined,
            year: newAlbumYear ? Number.parseInt(newAlbumYear, 10) : undefined,
          });
          albumId = album.id;
          setSelectedAlbumId(album.id);
          setShowNewAlbum(false);
        } catch (error) {
          setActionError(getRequestError(error, 'The album could not be created.'));
          return;
        }
      }

      if (!albumId) return;

      for (let index = 0; index < files.length; index += 1) {
        if (files[index].status === 'complete') continue;

        setFiles((current) => current.map((file, fileIndex) =>
          fileIndex === index ? { ...file, status: 'uploading' as const, error: undefined } : file,
        ));

        try {
          await uploadTrack.mutateAsync({ file: files[index].file, albumId });
          setFiles((current) => current.map((file, fileIndex) =>
            fileIndex === index ? { ...file, status: 'complete' as const, progress: 100 } : file,
          ));
        } catch (error) {
          setFiles((current) => current.map((file, fileIndex) =>
            fileIndex === index
              ? { ...file, status: 'error' as const, error: getRequestError(error, 'Upload failed.') }
              : file,
          ));
        }
      }
    } finally {
      batchLockRef.current = false;
      setIsUploadingBatch(false);
    }
  };

  const isNewAlbumValid = Boolean(newAlbumTitle.trim() && newAlbumArtist.trim());
  const destinationReady = Boolean(selectedAlbumId || (showNewAlbum && isNewAlbumValid));
  const allComplete = files.length > 0 && files.every((file) => file.status === 'complete');
  const selectedAlbum = albums.find((album) => album.id === selectedAlbumId);

  return {
    actionError,
    albums,
    albumsError,
    albumsLoading,
    allComplete,
    destinationReady,
    files,
    handleDestinationChange,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileChange,
    handleUpload,
    isDragging,
    isWorking,
    newAlbumArtist,
    newAlbumGenre,
    newAlbumTitle,
    newAlbumYear,
    refetchAlbums,
    removeFile,
    resetUpload,
    selectedAlbum,
    selectedAlbumId,
    setNewAlbumArtist,
    setNewAlbumGenre,
    setNewAlbumTitle,
    setNewAlbumYear,
    showNewAlbum,
    uploadProgress: uploadTrack.progress,
  };
};

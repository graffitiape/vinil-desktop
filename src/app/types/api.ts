// Types matching backend API responses

export interface User {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artwork_url: string | null;
  year: number | null;
  genre: string | null;
  quality: string | null;
  track_count: number;
  duration: number;
  created_at: string;
}

export interface AlbumDetail extends Album {
  tracks: Track[];
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album_id: string;
  track_number: number | null;
  duration: number;
  quality: string;
  genre: string | null;
  year: number | null;
  artwork_url: string | null;
  created_at: string;
}

export interface Playlist {
  id: string;
  name: string;
  artwork_url: string | null;
  track_count: number;
  created_at: string;
}

export interface PlaylistDetail extends Playlist {
  tracks: Track[];
}

export interface SearchResults {
  albums: Album[];
  tracks: Track[];
}

export interface CreateAlbumRequest {
  title: string;
  artist: string;
  artwork_url?: string;
  year?: number;
  genre?: string;
  quality?: string;
}

export interface CreatePlaylistRequest {
  name: string;
  artwork_url?: string;
}

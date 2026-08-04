import { ChevronDown, Disc3, Grid3X3, List } from 'lucide-react';
import { useState } from 'react';
import { AlbumCard } from '@/app/components/AlbumCard';
import { useAlbums } from '@/app/hooks/useAlbums';
import { formatTotalDuration } from '@/app/utils/format';

interface LibraryPageProps {
  onNavigateToAlbum: (albumId: string) => void;
}

type LibraryFilter = 'all' | 'albums' | 'artists' | 'playlists';

const filters: Array<{ id: LibraryFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'albums', label: 'Albums' },
  { id: 'artists', label: 'Artists' },
  { id: 'playlists', label: 'Playlists' },
];

export const LibraryPage = ({ onNavigateToAlbum }: LibraryPageProps) => {
  const albumsQuery = useAlbums();
  const albums = albumsQuery.data ?? [];
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<LibraryFilter>('all');

  return (
    <div className="page" data-screen-label="Library">
      <header className="page-head">
        <h1 className="serif">Your <em>library</em></h1>
        <p className="lead">
          {albumsQuery.isLoading
            ? 'Counting your collection…'
            : `${albums.length} ${albums.length === 1 ? 'record' : 'records'} in your collection`}
        </p>
      </header>

      <div className="library-controls">
        <div className="chip-row" aria-label="Library type">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={`chip${filterType === filter.id ? ' active' : ''}`}
              aria-pressed={filterType === filter.id}
              onClick={() => setFilterType(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="control-right">
          <button type="button" className="chip" aria-label="Sort library by date added">
            Sort: Date added <ChevronDown size={14} />
          </button>
          <div className="view-toggle" role="group" aria-label="Library view">
            <button
              type="button"
              className={viewMode === 'grid' ? 'on' : ''}
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              type="button"
              className={viewMode === 'list' ? 'on' : ''}
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {albumsQuery.isLoading ? (
        <div className="page-state" role="status">
          <Disc3 className="loading-disc" size={38} />
          <p>Gathering your records…</p>
        </div>
      ) : albumsQuery.isError ? (
        <div className="page-state error" role="alert">
          <h2>We couldn’t load your library.</h2>
          <p>{albumsQuery.error instanceof Error ? albumsQuery.error.message : 'Please try again.'}</p>
          <button type="button" className="btn-clay" onClick={() => void albumsQuery.refetch()}>
            Try again
          </button>
        </div>
      ) : albums.length === 0 ? (
        <div className="empty">
          <Disc3 size={42} strokeWidth={1.2} />
          <p className="serif">No records yet.</p>
          <span className="small">Upload music to build your library.</span>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="album-grid lg">
          {albums.map((album) => (
            <AlbumCard
              key={album.id}
              album={album}
              onClick={() => onNavigateToAlbum(album.id)}
            />
          ))}
        </div>
      ) : (
        <div className="list-table">
          <div className="lt-head mono" aria-hidden="true">
            <span>#</span>
            <span>Title</span>
            <span>Artist</span>
            <span>Year</span>
            <span>Tracks</span>
            <span>Length</span>
          </div>
          {albums.map((album, index) => (
            <button
              key={album.id}
              type="button"
              className="lt-row"
              style={{ width: '100%', textAlign: 'left' }}
              onClick={() => onNavigateToAlbum(album.id)}
            >
              <span className="mono small dim">{String(index + 1).padStart(2, '0')}</span>
              <span className="lt-title">
                {album.artwork_url ? (
                  <img src={album.artwork_url} alt="" />
                ) : (
                  <span
                    className="artwork-fallback"
                    aria-hidden="true"
                    style={{ width: 36, height: 36, borderRadius: 4, flex: '0 0 auto' }}
                  >
                    <Disc3 size={18} strokeWidth={1.2} />
                  </span>
                )}
                <span>{album.title}</span>
              </span>
              <span className="dim">{album.artist}</span>
              <span className="mono small dim">{album.year ?? '—'}</span>
              <span className="mono small dim">{album.track_count}</span>
              <span className="mono small dim">{formatTotalDuration(album.duration)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

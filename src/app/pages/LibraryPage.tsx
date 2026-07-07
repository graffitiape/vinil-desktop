import { Grid3x3, List, ChevronDown } from 'lucide-react';
import { formatTotalDuration } from '@/app/utils/format';
import { AlbumCard } from '@/app/components/AlbumCard';
import { usePlayer } from '@/app/context/PlayerContext';
import { useAlbums } from '@/app/hooks/useAlbums';
import { useState } from 'react';

interface LibraryPageProps {
  onNavigateToAlbum: (albumId: string) => void;
}

export const LibraryPage = ({ onNavigateToAlbum }: LibraryPageProps) => {
  const { playTrack } = usePlayer();
  const { data: albums = [], isLoading } = useAlbums();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<'all' | 'albums' | 'artists' | 'playlists'>('all');

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'albums', label: 'Albums' },
    { id: 'artists', label: 'Artists' },
    { id: 'playlists', label: 'Playlists' },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ paddingBottom: '120px' }}>
      {/* Header */}
      <div className="p-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 style={{ color: 'var(--text-primary)' }}>Your Library</h1>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center rounded-md overflow-hidden"
              style={{ border: '1px solid var(--border-default)' }}
            >
              <button
                onClick={() => setViewMode('grid')}
                className="p-2 transition-colors"
                style={{
                  background: viewMode === 'grid' ? 'var(--accent-primary)' : 'transparent',
                  color: viewMode === 'grid' ? 'var(--text-on-accent)' : 'var(--text-secondary)',
                }}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className="p-2 transition-colors"
                style={{
                  background: viewMode === 'list' ? 'var(--accent-primary)' : 'transparent',
                  color: viewMode === 'list' ? 'var(--text-on-accent)' : 'var(--text-secondary)',
                }}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            <button
              className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors"
              style={{
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-default)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
            >
              <span className="text-sm">Sort by: Date Added</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setFilterType(filter.id as any)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                background: filterType === filter.id ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                color: filterType === filter.id ? 'var(--text-on-accent)' : 'var(--text-secondary)',
                border: `1px solid ${filterType === filter.id ? 'var(--accent-primary)' : 'var(--border-default)'}`,
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading...</div>
          </div>
        ) : albums.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <h3 className="mb-2" style={{ color: 'var(--text-primary)' }}>No albums yet</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Upload music to build your library</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-5 gap-4 p-2 pb-8">
            {albums.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                onClick={() => onNavigateToAlbum(album.id)}
              />
            ))}
          </div>
        ) : (
          <div
            className="rounded-lg overflow-hidden mb-8"
            style={{ background: 'var(--bg-secondary)' }}
          >
            <div
              className="grid grid-cols-12 gap-4 px-4 py-3 text-xs uppercase tracking-wider"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
            >
              <div className="col-span-1">Cover</div>
              <div className="col-span-4">Title</div>
              <div className="col-span-3">Artist</div>
              <div className="col-span-2">Tracks</div>
              <div className="col-span-2">Duration</div>
            </div>

            {albums.map((album, index) => (
              <div
                key={album.id}
                className="grid grid-cols-12 gap-4 px-4 py-3 items-center cursor-pointer group transition-all"
                style={{
                  background: index % 2 === 0 ? 'var(--bg-secondary)' : '#232326',
                  borderLeft: '3px solid transparent',
                }}
                onClick={() => onNavigateToAlbum(album.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                  e.currentTarget.style.borderLeftColor = 'var(--accent-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = index % 2 === 0 ? 'var(--bg-secondary)' : '#232326';
                  e.currentTarget.style.borderLeftColor = 'transparent';
                }}
              >
                <div className="col-span-1">
                  <img
                    src={album.artwork_url || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop'}
                    alt={album.title}
                    className="w-12 h-12 rounded"
                  />
                </div>
                <div className="col-span-4">
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{album.title}</div>
                </div>
                <div className="col-span-3">
                  <div style={{ color: 'var(--text-secondary)' }}>{album.artist}</div>
                </div>
                <div className="col-span-2">
                  <div style={{ color: 'var(--text-secondary)' }}>{album.track_count}</div>
                </div>
                <div className="col-span-2">
                  <div style={{ color: 'var(--text-secondary)' }}>{formatTotalDuration(album.duration)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

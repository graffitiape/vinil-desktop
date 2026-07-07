import { Search as SearchIcon, X, Clock } from 'lucide-react';
import { AlbumCard } from '@/app/components/AlbumCard';
import { usePlayer } from '@/app/context/PlayerContext';
import { useSearch } from '@/app/hooks/useSearch';
import { useState } from 'react';
import { formatDuration } from '@/app/utils/format';

interface SearchPageProps {
  onNavigateToAlbum: (albumId: string) => void;
}

export const SearchPage = ({ onNavigateToAlbum }: SearchPageProps) => {
  const { playTrack } = usePlayer();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'albums' | 'tracks' | 'artists'>('all');
  const { data: results, isLoading } = useSearch(searchQuery);

  const recentSearches = ['Electronic', 'Jazz', 'Rock'];

  const filteredAlbums = results?.albums || [];
  const filteredTracks = results?.tracks || [];

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'albums', label: 'Albums' },
    { id: 'tracks', label: 'Tracks' },
    { id: 'artists', label: 'Artists' },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ paddingBottom: '120px' }}>
      {/* Search Input */}
      <div className="p-8 pb-6">
        <div className="relative">
          <SearchIcon
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Search your library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-4 rounded-md text-base transition-all"
            style={{
              background: 'var(--bg-deep)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded transition-colors"
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </div>
      </div>

      {/* Recent Searches (when no query) */}
      {!searchQuery && (
        <div className="px-8 pb-6">
          <h3 className="mb-4" style={{ color: 'var(--text-primary)' }}>Recent Searches</h3>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => setSearchQuery(search)}
                className="flex items-center gap-2 px-4 py-2 rounded-full transition-colors"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-secondary)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <Clock className="w-4 h-4" />
                <span className="text-sm">{search}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchQuery && (
        <>
          <div className="px-8 pb-4">
            <div
              className="flex items-center gap-1 p-1 rounded-lg inline-flex"
              style={{ background: 'var(--bg-secondary)' }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className="px-4 py-2 rounded-md text-sm font-medium transition-all relative"
                  style={{
                    background: activeTab === tab.id ? 'var(--accent-primary)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--text-on-accent)' : 'var(--text-secondary)',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-pulse" style={{ color: 'var(--text-muted)' }}>Searching...</div>
              </div>
            ) : (
              <>
                {(activeTab === 'all' || activeTab === 'albums') && filteredAlbums.length > 0 && (
                  <div className="mb-8">
                    <h3 className="mb-4" style={{ color: 'var(--text-primary)' }}>Albums</h3>
                    <div className="grid grid-cols-5 gap-4 p-2">
                      {filteredAlbums.map((album) => (
                        <AlbumCard
                          key={album.id}
                          album={album}
                          onClick={() => onNavigateToAlbum(album.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {(activeTab === 'all' || activeTab === 'tracks') && filteredTracks.length > 0 && (
                  <div className="mb-8">
                    <h3 className="mb-4" style={{ color: 'var(--text-primary)' }}>Tracks</h3>
                    <div className="rounded-lg overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                      {filteredTracks.map((track) => (
                        <div
                          key={track.id}
                          className="flex items-center gap-4 px-4 py-3 cursor-pointer group transition-colors"
                          onClick={() => playTrack(track)}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          <img
                            src={track.artwork_url || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop'}
                            alt={track.title}
                            className="w-12 h-12 rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{track.title}</div>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{track.artist}</div>
                          </div>
                          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            {formatDuration(track.duration)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {filteredAlbums.length === 0 && filteredTracks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16">
                    <SearchIcon className="w-16 h-16 mb-4" style={{ color: 'var(--text-muted)' }} />
                    <h3 className="mb-2" style={{ color: 'var(--text-primary)' }}>No results for "{searchQuery}"</h3>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Try different keywords</p>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

import { Clock, Disc3, Search as SearchIcon, X } from 'lucide-react';
import { useState, type CSSProperties } from 'react';
import { AlbumCard } from '@/app/components/AlbumCard';
import { usePlayer } from '@/app/context/PlayerContext';
import { useSearch } from '@/app/hooks/useSearch';
import { formatDuration } from '@/app/utils/format';

interface SearchPageProps {
  onNavigateToAlbum: (albumId: string) => void;
}
type SearchTab = 'all' | 'albums' | 'tracks' | 'artists';
const tabs: Array<{ id: SearchTab; label: string }> = [
  { id: 'all', label: 'All' }, { id: 'albums', label: 'Albums' },
  { id: 'tracks', label: 'Tracks' }, { id: 'artists', label: 'Artists' },
];
const recentSearches = ['Tame Impala', 'Jazz', 'Electronic', 'Acoustic Sessions'];
const genres = [
  { name: 'Jazz', hue: 38 }, { name: 'Electronic', hue: 220 },
  { name: 'Folk', hue: 80 }, { name: 'Hip Hop', hue: 12 },
  { name: 'Synthwave', hue: 280 }, { name: 'Ambient', hue: 200 },
  { name: 'Techno', hue: 320 }, { name: 'Chillwave', hue: 165 },
];

export const SearchPage = ({ onNavigateToAlbum }: SearchPageProps) => {
  const { playTrack } = usePlayer();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const trimmedQuery = searchQuery.trim();
  const search = useSearch(trimmedQuery);
  const albums = search.data?.albums ?? [];
  const tracks = search.data?.tracks ?? [];
  const artists = Array.from(new Set([
    ...albums.map((album) => album.artist),
    ...tracks.map((track) => track.artist),
  ])).sort((left, right) => left.localeCompare(right));
  const hasVisibleResults = activeTab === 'all'
    ? albums.length > 0 || tracks.length > 0
    : activeTab === 'albums'
      ? albums.length > 0
      : activeTab === 'tracks'
        ? tracks.length > 0
        : artists.length > 0;

  const chooseSuggestion = (value: string) => {
    setSearchQuery(value);
    setActiveTab('all');
  };

  return (
    <div className="page" data-screen-label="Search">
      <header className="page-head">
        <h1 className="serif"><em>Search</em> your library</h1>
        <p className="lead">Find a record, artist, or track in your collection.</p>
      </header>

      <div className="search-input-wrap">
        <SearchIcon size={20} aria-hidden="true" />
        <input
          autoFocus
          type="search"
          className="search-input"
          placeholder="Search albums, artists, tracks…"
          aria-label="Search your library"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className="icon-btn"
            aria-label="Clear search"
            onClick={() => setSearchQuery('')}
          >
            <X size={17} />
          </button>
        )}
      </div>

      {!trimmedQuery ? (
        <>
          <section className="row" aria-labelledby="recent-searches-heading">
            <h3 id="recent-searches-heading" className="serif">Recent searches</h3>
            <div className="recent-chips">
              {recentSearches.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="chip"
                  onClick={() => chooseSuggestion(item)}
                >
                  <Clock size={13} />
                  {item}
                </button>
              ))}
            </div>
          </section>

          <section className="row" aria-labelledby="genres-heading">
            <h3 id="genres-heading" className="serif">Browse by genre</h3>
            <div className="genre-grid">
              {genres.map((genre) => (
                <button
                  key={genre.name}
                  type="button"
                  className="serif genre-card"
                  style={{ '--gh': genre.hue } as CSSProperties}
                  onClick={() => chooseSuggestion(genre.name)}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          <nav className="chip-row" aria-label="Search result type" style={{ marginBottom: 28 }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`chip${activeTab === tab.id ? ' active' : ''}`}
                aria-pressed={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {search.isLoading || search.isFetching ? (
            <div className="page-state" role="status">
              <Disc3 className="loading-disc" size={38} />
              <p>Searching your shelves…</p>
            </div>
          ) : search.isError ? (
            <div className="page-state error" role="alert">
              <h2>Search is unavailable.</h2>
              <p>{search.error instanceof Error ? search.error.message : 'Please try again.'}</p>
              <button type="button" className="btn-clay" onClick={() => void search.refetch()}>
                Try again
              </button>
            </div>
          ) : !hasVisibleResults ? (
            <div className="empty">
              <SearchIcon size={42} strokeWidth={1.2} />
              <p className="serif">Nothing matched “{trimmedQuery}”.</p>
              <span className="small">Try another title, artist, track, or genre.</span>
            </div>
          ) : (
            <>
              {(activeTab === 'all' || activeTab === 'albums') && albums.length > 0 && (
                <section className="row" aria-labelledby="album-results-heading">
                  <div className="row-head">
                    <h3 id="album-results-heading" className="serif">Albums</h3>
                    <span className="mono small dim">{albums.length} found</span>
                  </div>
                  <div className="album-grid">
                    {albums.map((album) => (
                      <AlbumCard
                        key={album.id}
                        album={album}
                        onClick={() => onNavigateToAlbum(album.id)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {(activeTab === 'all' || activeTab === 'tracks') && tracks.length > 0 && (
                <section className="row" aria-labelledby="track-results-heading">
                  <div className="row-head">
                    <h3 id="track-results-heading" className="serif">Tracks</h3>
                    <span className="mono small dim">{tracks.length} found</span>
                  </div>
                  <div className="track-list-card">
                    {tracks.map((track) => (
                      <button
                        key={track.id}
                        type="button"
                        className="tl-row"
                        style={{ width: '100%', textAlign: 'left' }}
                        onClick={() => playTrack(track, tracks)}
                      >
                        {track.artwork_url ? (
                          <img src={track.artwork_url} alt="" />
                        ) : (
                          <span
                            className="artwork-fallback"
                            aria-hidden="true"
                            style={{ width: 40, height: 40, borderRadius: 4, flex: '0 0 auto' }}
                          >
                            <Disc3 size={20} strokeWidth={1.2} />
                          </span>
                        )}
                        <span className="tl-meta">
                          <span className="tl-title">{track.title}</span>
                          <span className="tl-sub" style={{ display: 'block' }}>
                            {track.artist}{track.genre && <><span className="dot">·</span>{track.genre}</>}
                          </span>
                        </span>
                        <span className="mono small dim">{formatDuration(track.duration)}</span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {activeTab === 'artists' && artists.length > 0 && (
                <section className="row" aria-labelledby="artist-results-heading">
                  <div className="row-head">
                    <h3 id="artist-results-heading" className="serif">Artists</h3>
                    <span className="mono small dim">{artists.length} found</span>
                  </div>
                  <div className="track-list-card">
                    {artists.map((artist) => (
                      <button
                        key={artist}
                        type="button"
                        className="tl-row"
                        style={{ width: '100%', textAlign: 'left' }}
                        onClick={() => chooseSuggestion(artist)}
                      >
                        <span
                          className="artwork-fallback"
                          aria-hidden="true"
                          style={{ width: 40, height: 40, borderRadius: '50%', flex: '0 0 auto' }}
                        >
                          <Disc3 size={20} strokeWidth={1.2} />
                        </span>
                        <span className="tl-meta">
                          <span className="tl-title">{artist}</span>
                          <span className="tl-sub" style={{ display: 'block' }}>Artist</span>
                        </span>
                        <span className="mono small dim" aria-hidden="true">→</span>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

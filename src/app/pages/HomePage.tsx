import { ChevronRight, Disc3, Pause, Play } from 'lucide-react';
import { AlbumCard } from '@/app/components/AlbumCard';
import { useAuth } from '@/app/context/AuthContext';
import { usePlayer } from '@/app/context/PlayerContext';
import { useAlbums } from '@/app/hooks/useAlbums';
import { usePlaylists } from '@/app/hooks/usePlaylists';
import { formatDuration } from '@/app/utils/format';

interface HomePageProps {
  onNavigateToAlbum: (albumId: string) => void;
  onNavigateToLibrary: () => void;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 5) return 'Late night';
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const today = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
}).format(new Date());

export const HomePage = ({ onNavigateToAlbum, onNavigateToLibrary }: HomePageProps) => {
  const { user } = useAuth();
  const {
    currentTrack,
    currentTime,
    duration,
    isPlaying,
    togglePlay,
  } = usePlayer();
  const albumsQuery = useAlbums();
  const playlistsQuery = usePlaylists();
  const albums = albumsQuery.data ?? [];
  const playlists = playlistsQuery.data ?? [];
  const recentlyPlayed = albums.slice(0, 6);
  const recentlyAdded = [...albums]
    .sort((left, right) => (
      new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
    ))
    .slice(0, 6);
  const currentAlbum = albums.find((album) => album.id === currentTrack?.album_id);
  const totalDuration = duration || currentTrack?.duration || 0;
  const progress = totalDuration > 0
    ? Math.min((currentTime / totalDuration) * 100, 100)
    : 0;
  const displayName = (
    user?.display_name.trim() || user?.email.split('@')[0] || 'there'
  ).split(/\s+/)[0];

  return (
    <div className="page" data-screen-label="Home">
      <header className="page-head">
        <h1 className="serif">
          {getGreeting()}, <em>{displayName}</em>
        </h1>
        <p className="mono date">{today}</p>
      </header>

      {currentTrack && (
        <section className="continue-card" aria-labelledby="continue-heading">
          <div className="cc-art">
            {currentTrack.artwork_url ? (
              <img src={currentTrack.artwork_url} alt={currentTrack.title} />
            ) : (
              <div
                className="artwork-fallback"
                role="img"
                aria-label={`${currentTrack.title} has no artwork`}
                style={{ width: 132, height: 132, borderRadius: 'var(--radius)' }}
              >
                <Disc3 size={42} strokeWidth={1.2} />
              </div>
            )}
            <svg className="cc-vinyl" viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r="49" fill="#1a1714" />
              <g fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.35">
                {[15, 22, 29, 36, 43].map((radius) => (
                  <circle key={radius} cx="50" cy="50" r={radius} />
                ))}
              </g>
              <circle cx="50" cy="50" r="12" fill="var(--clay)" />
              <circle cx="50" cy="50" r="1.2" fill="#0a0908" />
            </svg>
          </div>

          <div className="cc-info">
            <p className="eyebrow">Continue listening</p>
            <h2 id="continue-heading" className="serif">{currentTrack.title}</h2>
            <p className="cc-meta">
              {currentTrack.artist}
              {currentAlbum && <><span className="dot">·</span>{currentAlbum.title}</>}
            </p>
            <div className="cc-actions">
              <button type="button" className="btn-clay" onClick={togglePlay}>
                {isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
                {isPlaying ? 'Pause' : 'Continue'}
              </button>
              <div className="cc-progress" aria-label="Listening progress">
                <span className="mono small dim">{formatDuration(Math.floor(currentTime))}</span>
                <div className="progress-track" aria-hidden="true">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <span className="mono small dim">{formatDuration(Math.floor(totalDuration))}</span>
              </div>
            </div>
          </div>
        </section>
      )}

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
          <p className="serif">Your library is waiting for its first record.</p>
          <span className="small">Upload music to begin your collection.</span>
        </div>
      ) : (
        <>
          <section className="row" aria-labelledby="recently-played-heading">
            <div className="row-head">
              <h3 id="recently-played-heading" className="serif">Recently played</h3>
              <button type="button" className="link-btn" onClick={onNavigateToLibrary}>
                See all <ChevronRight size={14} />
              </button>
            </div>
            <div className="album-grid">
              {recentlyPlayed.map((album) => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  onClick={() => onNavigateToAlbum(album.id)}
                />
              ))}
            </div>
          </section>

          <section className="row" aria-labelledby="recently-added-heading">
            <div className="row-head">
              <h3 id="recently-added-heading" className="serif">Recently added</h3>
              <button type="button" className="link-btn" onClick={onNavigateToLibrary}>
                See all <ChevronRight size={14} />
              </button>
            </div>
            <div className="album-grid">
              {recentlyAdded.map((album) => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  onClick={() => onNavigateToAlbum(album.id)}
                />
              ))}
            </div>
          </section>
        </>
      )}

      {(playlistsQuery.isLoading || playlistsQuery.isError || playlists.length > 0) && (
        <section className="row" aria-labelledby="shelves-heading">
          <div className="row-head">
            <h3 id="shelves-heading" className="serif">From your shelves</h3>
          </div>
          {playlistsQuery.isLoading ? (
            <p className="small dim">Loading shelves…</p>
          ) : playlistsQuery.isError ? (
            <p className="small dim" role="alert">Your shelves are unavailable right now.</p>
          ) : (
            <div className="shelf-grid">
              {playlists.slice(0, 4).map((playlist) => (
                <button
                  key={playlist.id}
                  type="button"
                  className="shelf-card"
                  onClick={onNavigateToLibrary}
                  aria-label={`Open ${playlist.name} in your library`}
                >
                  {playlist.artwork_url ? (
                    <img src={playlist.artwork_url} alt="" />
                  ) : (
                    <span className="playlist-art-fallback" aria-hidden="true">
                      <Disc3 size={22} strokeWidth={1.2} />
                    </span>
                  )}
                  <div>
                    <div className="serif shelf-name">{playlist.name}</div>
                    <div className="mono shelf-sub">
                      {playlist.track_count} {playlist.track_count === 1 ? 'track' : 'tracks'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

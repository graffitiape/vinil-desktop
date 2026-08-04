import { Disc3, Home, Library, Plus, Search, Settings, Upload } from 'lucide-react';
import { usePlaylists } from '@/app/hooks/usePlaylists';
import { useAuth } from '@/app/context/AuthContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'library', label: 'Library', icon: Library },
  { id: 'upload', label: 'Upload', icon: Upload },
] as const;

export const Sidebar = ({ currentPage, onNavigate }: SidebarProps) => {
  const { data: playlists = [], isLoading, isError } = usePlaylists();
  const { user } = useAuth();

  const initials =
    user?.display_name
      ?.split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'VI';

  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <button className="sidebar-brand" type="button" onClick={() => onNavigate('home')}>
        <span className="vinil-logo-disc" aria-hidden="true">
          <span />
        </span>
        <span className="brand-word">Vinil</span>
      </button>

      <nav className="sidebar-nav">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            className={`nav-item${currentPage === id ? ' active' : ''}`}
            key={id}
            type="button"
            onClick={() => onNavigate(id)}
          >
            <Icon size={18} strokeWidth={1.6} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <section className="sidebar-section" aria-labelledby="playlists-label">
        <div className="section-label" id="playlists-label">
          <span>Playlists</span>
          <button
            className="ghost-btn"
            type="button"
            aria-label="View playlists"
            title="View playlists"
            onClick={() => onNavigate('library')}
          >
            <Plus size={16} strokeWidth={1.6} />
          </button>
        </div>

        <div className="playlist-list">
          {isLoading && <div className="sidebar-message">Loading shelves…</div>}
          {isError && <div className="sidebar-message">Shelves unavailable</div>}
          {!isLoading && !isError && playlists.length === 0 && (
            <button className="sidebar-empty" type="button" onClick={() => onNavigate('library')}>
              Your shelves are waiting
            </button>
          )}

          {playlists.map((playlist) => (
            <button
              className="playlist-item"
              key={playlist.id}
              type="button"
              onClick={() => onNavigate('library')}
              title={playlist.name}
            >
              {playlist.artwork_url ? (
                <img src={playlist.artwork_url} alt="" />
              ) : (
                <span className="playlist-art-fallback" aria-hidden="true">
                  <Disc3 size={16} strokeWidth={1.3} />
                </span>
              )}
              <span className="playlist-copy">
                <span className="pl-name">{playlist.name}</span>
                <span className="pl-sub mono">{playlist.track_count} tracks</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <footer className="sidebar-foot">
        <div className="user-row">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.display_name || 'Vinil listener'}</div>
            <div className="user-sub">{user?.email || 'Your private library'}</div>
          </div>
          <button
            className={`icon-btn${currentPage === 'settings' ? ' active' : ''}`}
            type="button"
            aria-label="Settings"
            onClick={() => onNavigate('settings')}
          >
            <Settings size={18} strokeWidth={1.6} />
          </button>
        </div>
      </footer>
    </aside>
  );
};

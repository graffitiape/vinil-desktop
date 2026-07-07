import { Home, Search, Library, Upload, Settings, Plus, Disc3 } from 'lucide-react';
import { usePlaylists } from '@/app/hooks/usePlaylists';
import { useAuth } from '@/app/context/AuthContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar = ({ currentPage, onNavigate }: SidebarProps) => {
  const { data: playlists = [] } = usePlaylists();
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Library', icon: Library },
    { id: 'upload', label: 'Upload', icon: Upload },
  ];

  const initials = user?.display_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??';

  return (
    <div
      className="flex flex-col h-full relative"
      style={{
        width: '240px',
        background: 'linear-gradient(0deg, var(--bg-secondary) 0%, rgba(42, 42, 46, 0.95) 100%)',
        borderRight: '1px solid var(--border-default)',
      }}
    >
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at top left, var(--accent-primary) 0%, transparent 50%)',
        }}
      />

      <div className="flex items-center gap-3 p-6 relative">
        <div
          className="flex items-center justify-center rounded-full relative"
          style={{
            width: '40px',
            height: '40px',
            background: 'var(--accent-primary)',
            boxShadow: '0 0 20px rgba(245, 166, 35, 0.3)',
          }}
        >
          <Disc3 className="w-6 h-6 animate-spin-slow" style={{ color: 'var(--text-on-accent)' }} />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text" style={{ color: 'var(--text-primary)' }}>
          Vinil
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all relative group"
              style={{
                background: isActive ? 'rgba(245, 166, 35, 0.1)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                transform: isActive ? 'translateX(2px)' : 'translateX(0)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.transform = 'translateX(2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }
              }}
            >
              <div className={`transition-all ${isActive ? 'scale-110' : 'scale-100'} group-hover:scale-110`}>
                <Icon
                  className="w-5 h-5"
                  style={{
                    color: isActive ? 'var(--accent-primary)' : 'inherit',
                    strokeWidth: isActive ? 2.5 : 2,
                    filter: isActive ? 'drop-shadow(0 0 4px rgba(245, 166, 35, 0.5))' : 'none',
                  }}
                />
              </div>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-4 space-y-3 relative">
        <div
          className="absolute top-0 left-3 right-3 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, var(--border-default), transparent)' }}
        />
        <div className="flex items-center justify-between px-3 pt-2">
          <span
            className="text-xs uppercase font-bold tracking-wider"
            style={{ color: 'var(--text-muted)', textShadow: '0 0 10px rgba(245, 166, 35, 0.3)' }}
          >
            Playlists
          </span>
        </div>
        <button
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all group"
          style={{ color: 'var(--accent-primary)', border: '1px dashed rgba(245, 166, 35, 0.3)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(245, 166, 35, 0.05)';
            e.currentTarget.style.borderColor = 'var(--accent-primary)';
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'rgba(245, 166, 35, 0.3)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          <span className="text-sm font-medium">New Playlist</span>
        </button>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left group"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-tertiary)';
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.transform = 'translateX(2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <div className="relative">
                <img
                  src={playlist.artwork_url || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200&h=200&fit=crop'}
                  alt={playlist.name}
                  className="w-8 h-8 rounded transition-all group-hover:shadow-lg"
                  style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)' }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{playlist.name}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {playlist.track_count} tracks
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div
        className="p-4 space-y-4 relative"
        style={{
          borderTop: '1px solid var(--border-default)',
          background: 'linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.2))',
        }}
      >
        <div className="flex items-center gap-3 group cursor-pointer">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold relative transition-all"
            style={{
              background: 'var(--accent-primary)',
              color: 'var(--text-on-accent)',
              boxShadow: '0 0 0 0 rgba(245, 166, 35, 0.4)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 0 4px rgba(245, 166, 35, 0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 0 0 rgba(245, 166, 35, 0.4)'; }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {user?.display_name || 'User'}
            </div>
          </div>
          <button
            className="p-1.5 rounded-lg transition-all group/settings"
            onClick={() => onNavigate('settings')}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-tertiary)';
              e.currentTarget.style.transform = 'rotate(90deg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'rotate(0deg)';
            }}
          >
            <Settings className="w-5 h-5 transition-all" style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
      </div>
    </div>
  );
};

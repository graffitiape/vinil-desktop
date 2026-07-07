import { Play, ChevronRight } from "lucide-react";
import { formatDuration } from "@/app/utils/format";
import { AlbumCard } from "@/app/components/AlbumCard";
import { usePlayer } from "@/app/context/PlayerContext";
import { useAlbums } from "@/app/hooks/useAlbums";

interface HomePageProps {
  onNavigateToAlbum: (albumId: string) => void;
}

export const HomePage = ({ onNavigateToAlbum }: HomePageProps) => {
  const { currentTrack, playTrack } = usePlayer();
  const { data: albums = [], isLoading } = useAlbums();

  const recentlyPlayed = albums.slice(0, 6);
  const recentlyAdded = [...albums].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto p-8"
      style={{ paddingBottom: "120px" }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2" style={{ color: "var(--text-primary)" }}>
          Welcome back
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Continue Listening - Hero Card */}
      {currentTrack && (
        <div
          className="mb-12 p-6 rounded-xl flex items-center gap-8 group cursor-pointer transition-all"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--accent-primary)";
            e.currentTarget.style.boxShadow = "0 0 24px rgba(245, 166, 35, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-default)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.4)";
          }}
        >
          <div className="relative flex-shrink-0">
            <div className="relative">
              <img
                src={currentTrack.artwork_url || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop'}
                alt={currentTrack.title}
                className="w-32 h-32 rounded-lg"
              />
              <div
                className="absolute -right-2 top-4 bottom-4 w-6 rounded-r"
                style={{
                  background: "var(--vinyl-black)",
                  borderTop: "2px solid var(--vinyl-highlight)",
                  borderBottom: "2px solid var(--vinyl-highlight)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.6)",
                }}
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
              Continue Listening
            </p>
            <h3 className="mb-1" style={{ color: "var(--text-primary)" }}>
              {currentTrack.title}
            </h3>
            <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
              {currentTrack.artist}
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => playTrack(currentTrack)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-md transition-all hover:scale-105 active:scale-95"
                style={{
                  background: "var(--accent-primary)",
                  color: "var(--text-on-accent)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-hover)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent-primary)"; }}
              >
                <Play className="w-4 h-4" fill="var(--text-on-accent)" />
                <span className="font-semibold text-sm">Continue</span>
              </button>
              <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                {formatDuration(currentTrack.duration)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 style={{ color: "var(--text-primary)" }}>Recently Played</h2>
            <button
              className="flex items-center gap-1 text-sm font-medium transition-colors"
              style={{ color: "var(--accent-primary)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--accent-primary)"; }}
            >
              See All
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-6 gap-4 p-2">
            {recentlyPlayed.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                onClick={() => onNavigateToAlbum(album.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recently Added */}
      {recentlyAdded.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 style={{ color: "var(--text-primary)" }}>Recently Added</h2>
            <button
              className="flex items-center gap-1 text-sm font-medium transition-colors"
              style={{ color: "var(--accent-primary)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--accent-primary)"; }}
            >
              See All
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-5 gap-4 p-2">
            {recentlyAdded.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                onClick={() => onNavigateToAlbum(album.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {albums.length === 0 && !currentTrack && (
        <div className="flex flex-col items-center justify-center py-24">
          <h3 className="mb-2" style={{ color: 'var(--text-primary)' }}>Your library is empty</h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Upload some music to get started
          </p>
        </div>
      )}
    </div>
  );
};

import { Play } from "lucide-react";
import type { Album } from "@/app/types/api";
import { useState } from "react";

interface AlbumCardProps {
  album: Album;
  onClick?: () => void;
  onPlay?: () => void;
}

export const AlbumCard = ({ album, onClick, onPlay }: AlbumCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group cursor-pointer transition-all duration-1000 relative"
      style={{
        background: "var(--bg-secondary)",
        borderRadius: "8px",
        padding: "12px",
        border: "1px solid transparent",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: isHovered
          ? "0 0 20px rgba(245, 166, 35, 0.4), 0 0 0 1px rgba(245, 166, 35, 0.6), inset 0 0 8px rgba(245, 166, 35, 0.1), 0 2px 0 0 rgba(245, 166, 35, 0.3), 0 -2px 0 0 rgba(245, 166, 35, 0.3), 2px 0 0 0 rgba(245, 166, 35, 0.3), -2px 0 0 0 rgba(245, 166, 35, 0.3), 3px 3px 0 0 rgba(245, 166, 35, 0.2), -3px 3px 0 0 rgba(245, 166, 35, 0.2), 3px -3px 0 0 rgba(245, 166, 35, 0.2), -3px -3px 0 0 rgba(245, 166, 35, 0.2), 5px 5px 4px 0 rgba(245, 166, 35, 0.15), -5px 5px 4px 0 rgba(245, 166, 35, 0.15), 5px -5px 4px 0 rgba(245, 166, 35, 0.15), -5px -5px 4px 0 rgba(245, 166, 35, 0.15), 7px 0 6px 0 rgba(245, 166, 35, 0.1), -7px 0 6px 0 rgba(245, 166, 35, 0.1), 0 7px 6px 0 rgba(245, 166, 35, 0.1), 0 -7px 6px 0 rgba(245, 166, 35, 0.1)"
          : "0 2px 8px rgba(0, 0, 0, 0.4)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="relative mb-3">
        {/* Album Art with Vinyl Edge */}
        <div className="relative">
          <img
            src={album.artwork_url || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop'}
            alt={album.title}
            className="w-full aspect-square object-cover rounded"
          />
          {/* Vinyl edge peeking out */}
          {isHovered && (
            <div
              className="absolute -right-1 top-2 bottom-2 w-3 rounded-r"
              style={{
                background: "var(--vinyl-black)",
                borderTop: "1px solid var(--vinyl-highlight)",
                borderBottom: "1px solid var(--vinyl-highlight)",
              }}
            />
          )}
        </div>

        {/* Play Button Overlay */}
        {isHovered && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay?.();
            }}
            className="absolute bottom-2 right-2 flex items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95"
            style={{
              width: "48px",
              height: "48px",
              background: "var(--accent-primary)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
            }}
          >
            <Play
              className="w-5 h-5 ml-0.5"
              style={{ color: "var(--text-on-accent)" }}
              fill="var(--text-on-accent)"
            />
          </button>
        )}
      </div>

      {/* Album Info */}
      <div>
        <h4
          className="font-semibold text-sm mb-1 truncate"
          style={{ color: "var(--text-primary)" }}
        >
          {album.title}
        </h4>
        <p
          className="text-xs truncate"
          style={{ color: "var(--text-secondary)" }}
        >
          {album.artist}
        </p>
      </div>
    </div>
  );
};

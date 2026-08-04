import { Music2 } from 'lucide-react';
import { usePlayer } from '@/app/context/PlayerContext';

export const VinylTurntable = () => {
  const { currentTrack, isPlaying } = usePlayer();

  return (
    <div
      className="np-turntable"
      role="img"
      aria-label={currentTrack ? `Vinyl record for ${currentTrack.title}` : 'Vinyl record'}
    >
      <div
        className="np-platter"
        style={{ width: 'calc(100% - 24px)', aspectRatio: '1' }}
        aria-hidden="true"
      >
        <div
          className="vinyl-spin relative h-full w-full overflow-hidden rounded-full"
          style={{
            animationPlayState: isPlaying ? 'running' : 'paused',
            background: [
              'repeating-radial-gradient(circle at center, transparent 0 4px, color-mix(in srgb, var(--rule-2) 14%, transparent) 4px 5px)',
              'var(--vinyl)',
            ].join(', '),
            border: '1px solid color-mix(in srgb, var(--rule-2) 32%, transparent)',
            boxShadow: 'inset 0 0 42px rgba(0, 0, 0, 0.45), 0 8px 22px rgba(0, 0, 0, 0.18)',
          }}
        >
          <span
            className="absolute inset-[4%] rounded-full border border-white/4"
            aria-hidden="true"
          />
          <span
            className="absolute inset-[18%] rounded-full border border-white/4"
            aria-hidden="true"
          />

          <div
            className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full"
            style={{
              width: '32.5%',
              aspectRatio: '1',
              background: 'var(--clay)',
              border: 'clamp(2px, 0.7vw, 3px) solid var(--paper-2)',
              boxShadow: '0 0 0 1px color-mix(in srgb, var(--clay) 55%, transparent)',
            }}
          >
            {currentTrack?.artwork_url ? (
              <img
                src={currentTrack.artwork_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <Music2 style={{ width: '34%', height: '34%', color: 'var(--clay-on)' }} />
            )}
          </div>

          <span
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: '2.8%',
              aspectRatio: '1',
              background: 'var(--paper-2)',
              border: '2px solid var(--vinyl)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.45)',
            }}
            aria-hidden="true"
          />
        </div>
      </div>

      <svg
        className={`np-tonearm ${isPlaying ? 'on' : ''}`}
        viewBox="0 0 200 200"
        style={{ width: '45.5%', height: '45.5%' }}
        aria-hidden="true"
      >
        <circle cx="172" cy="23" r="22" fill="var(--paper-3)" stroke="var(--rule-2)" strokeWidth="2" />
        <circle cx="172" cy="23" r="8" fill="var(--tonearm-base)" />
        <rect x="164" y="0" width="16" height="12" rx="5" fill="var(--tonearm)" />
        <path
          d="M169 30 C160 72 138 102 94 132"
          fill="none"
          stroke="var(--tonearm-base)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M169 29 C159 70 137 99 93 130"
          fill="none"
          stroke="var(--tonearm)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <g transform="translate(79 124) rotate(-35)">
          <rect width="31" height="15" rx="3" fill="var(--tonearm-base)" />
          <rect x="5" y="4" width="18" height="7" rx="2" fill="var(--ink-3)" />
          <circle cx="2" cy="13" r="3" fill="var(--clay)" />
        </g>
      </svg>
    </div>
  );
};

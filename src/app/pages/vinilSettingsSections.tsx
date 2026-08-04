import { LogOut } from 'lucide-react';
import type { User } from '@/app/types/api';

interface ToggleRowProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

export type VinilTheme = 'light' | 'dark';

export const ToggleRow = ({ title, description, checked, onChange }: ToggleRowProps) => (
  <div className="set-toggle">
    <div>
      <p className="st-title">{title}</p>
      <p className="st-sub">{description}</p>
    </div>
    <button
      type="button"
      className={`switch${checked ? ' on' : ''}`}
      role="switch"
      aria-checked={checked}
      aria-label={title}
      onClick={onChange}
    >
      <span />
    </button>
  </div>
);

const SectionHeading = ({ title, copy }: { title: string; copy: string }) => (
  <>
    <h3 className="serif">{title}</h3>
    <p className="lead">{copy}</p>
  </>
);

export const AccountSettings = ({ user, onLogout }: { user: User | null; onLogout: () => void }) => {
  const joined = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : 'Not available';

  return (
    <section className="set-section">
      <SectionHeading title="Account" copy="The identity connected to this Vinil library." />
      <div className="set-card">
        <div className="set-toggle">
          <div>
            <p className="st-title">Display name</p>
            <p className="st-sub">How you appear inside the app</p>
          </div>
          <span>{user?.display_name || 'Vinil listener'}</span>
        </div>
        <div className="set-toggle">
          <div>
            <p className="st-title">Email</p>
            <p className="st-sub">Used to sign in to your library</p>
          </div>
          <span className="mono small">{user?.email || 'Not available'}</span>
        </div>
        <div className="set-toggle">
          <div>
            <p className="st-title">Member since</p>
            <p className="st-sub">Your Vinil account creation date</p>
          </div>
          <span>{joined}</span>
        </div>
        <div style={{ paddingTop: 18, borderTop: '1px solid var(--rule)' }}>
          <button className="btn-ghost danger" type="button" onClick={onLogout}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </div>
    </section>
  );
};

interface PlaybackSettingsProps {
  resumePlayback: boolean;
  autoplay: boolean;
  onResumeChange: () => void;
  onAutoplayChange: () => void;
}

export const PlaybackSettings = ({
  resumePlayback,
  autoplay,
  onResumeChange,
  onAutoplayChange,
}: PlaybackSettingsProps) => (
  <section className="set-section">
    <SectionHeading title="Playback" copy="Shape how listening sessions move from one record to the next." />
    <div className="set-card">
      <ToggleRow
        title="Resume playback"
        description="Return to the last track when Vinil opens"
        checked={resumePlayback}
        onChange={onResumeChange}
      />
      <ToggleRow
        title="Autoplay"
        description="Continue with related music when the queue ends"
        checked={autoplay}
        onChange={onAutoplayChange}
      />
      <p className="st-sub" style={{ paddingTop: 12, borderTop: '1px solid var(--rule)' }}>
        Playback preferences currently apply to this app session.
      </p>
    </div>
  </section>
);

interface AudioQualitySettingsProps {
  quality: string;
  preferLossless: boolean;
  gapless: boolean;
  onQualityChange: (quality: string) => void;
  onPreferLosslessChange: () => void;
  onGaplessChange: () => void;
}

export const AudioQualitySettings = ({
  quality,
  preferLossless,
  gapless,
  onQualityChange,
  onPreferLosslessChange,
  onGaplessChange,
}: AudioQualitySettingsProps) => (
  <section className="set-section">
    <SectionHeading title="Audio quality" copy="Choose the listening quality Vinil should prefer." />
    <div className="set-card">
      <div className="set-field">
        <label htmlFor="stream-quality">Preferred quality</label>
        <select id="stream-quality" value={quality} onChange={(event) => onQualityChange(event.target.value)}>
          <option value="auto">Auto</option>
          <option value="high">High · 320 kbps</option>
          <option value="lossless">Lossless · FLAC</option>
        </select>
      </div>
      <ToggleRow
        title="Prefer lossless when available"
        description="Select the highest available quality"
        checked={preferLossless}
        onChange={onPreferLosslessChange}
      />
      <ToggleRow
        title="Gapless playback"
        description="Move between consecutive tracks without silence"
        checked={gapless}
        onChange={onGaplessChange}
      />
      <p className="st-sub" style={{ paddingTop: 12, borderTop: '1px solid var(--rule)' }}>
        Audio preferences currently apply to this app session.
      </p>
    </div>
  </section>
);

export const StorageSettings = () => (
  <section className="set-section">
    <SectionHeading title="Storage" copy="A clear view of where Vinil keeps your music." />
    <div className="set-card">
      <div className="storage-big">
        <p className="eyebrow mono">Offline listening</p>
        <p className="huge serif">On-device</p>
      </div>
      <p className="lead">Downloaded albums are cached locally by the desktop app.</p>
      <div style={{ marginTop: 18 }}>
        <p className="st-title">Local cache footprint</p>
        <div className="storage-bar lg" aria-hidden="true">
          <div className="storage-fill" style={{ width: '42%' }} />
        </div>
        <p className="st-sub" style={{ marginTop: 7 }}>
          Illustrative only — the current cache service does not report exact disk usage.
        </p>
      </div>
      <div className="storage-breakdown">
        <div><span>Offline albums</span><span>Stored on this device</span></div>
        <div><span>Original uploads</span><span>Stored in your library</span></div>
        <div><span>Cache management</span><span>Automatic</span></div>
      </div>
      <p className="st-sub">Storage totals and cache clearing are not exposed by the current app service.</p>
    </div>
  </section>
);

export const AppearanceSettings = ({ theme, onChange }: {
  theme: VinilTheme;
  onChange: (theme: VinilTheme) => void;
}) => (
  <section className="set-section">
    <SectionHeading title="Appearance" copy="Set the atmosphere around your collection." />
    <div className="set-card">
      <ToggleRow
        title="Dark appearance"
        description="Use Vinil's darker palette; this choice is saved on this device"
        checked={theme === 'dark'}
        onChange={() => onChange(theme === 'dark' ? 'light' : 'dark')}
      />
    </div>
  </section>
);

const AboutRecord = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
    <circle cx="60" cy="60" r="59" fill="var(--vinyl)" />
    {[19, 31, 43, 53].map((radius) => (
      <circle key={radius} cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,.08)" />
    ))}
    <circle cx="60" cy="60" r="18" fill="var(--clay)" />
    <circle cx="60" cy="60" r="3" fill="var(--paper-4)" />
  </svg>
);

export const AboutSettings = () => (
  <section className="set-section">
    <SectionHeading title="About" copy="A quiet home for the music you care about." />
    <div className="set-card about-card">
      <div className="about-disc"><AboutRecord /></div>
      <h2 className="serif italic">Vinil</h2>
      <p className="mono small dim">Version 0.0.1</p>
      <p className="lead" style={{ margin: '16px auto 0' }}>
        A personal desktop library for collecting, playing, and keeping music close at hand.
      </p>
    </div>
  </section>
);

import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import {
  AboutSettings,
  AccountSettings,
  AppearanceSettings,
  AudioQualitySettings,
  PlaybackSettings,
  StorageSettings,
  type VinilTheme,
} from '@/app/pages/vinilSettingsSections';

interface SettingsPageProps {
  onBack: () => void;
}

const THEME_STORAGE_KEY = 'vinil-theme';
const SETTINGS_CATEGORIES = [
  { id: 'account', label: 'Account' },
  { id: 'playback', label: 'Playback' },
  { id: 'audio-quality', label: 'Audio quality' },
  { id: 'storage', label: 'Storage' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'about', label: 'About' },
] as const;

type CategoryId = (typeof SETTINGS_CATEGORIES)[number]['id'];

const getInitialTheme = (): VinilTheme => {
  if (typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark') {
    return 'dark';
  }
  return 'light';
};

export const SettingsPage = ({ onBack }: SettingsPageProps) => {
  const { user, logout } = useAuth();
  const [activeCategory, setActiveCategory] = useState<CategoryId>('audio-quality');
  const [theme, setTheme] = useState<VinilTheme>(getInitialTheme);
  const [resumePlayback, setResumePlayback] = useState(true);
  const [autoplay, setAutoplay] = useState(false);
  const [quality, setQuality] = useState('lossless');
  const [preferLossless, setPreferLossless] = useState(true);
  const [gapless, setGapless] = useState(true);

  const changeTheme = (nextTheme: VinilTheme) => {
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  };

  let section: ReactNode = null;
  switch (activeCategory) {
    case 'account':
      section = <AccountSettings user={user} onLogout={logout} />;
      break;
    case 'playback':
      section = (
        <PlaybackSettings
          resumePlayback={resumePlayback}
          autoplay={autoplay}
          onResumeChange={() => setResumePlayback((value) => !value)}
          onAutoplayChange={() => setAutoplay((value) => !value)}
        />
      );
      break;
    case 'audio-quality':
      section = (
        <AudioQualitySettings
          quality={quality}
          preferLossless={preferLossless}
          gapless={gapless}
          onQualityChange={setQuality}
          onPreferLosslessChange={() => setPreferLossless((value) => !value)}
          onGaplessChange={() => setGapless((value) => !value)}
        />
      );
      break;
    case 'storage':
      section = <StorageSettings />;
      break;
    case 'appearance':
      section = <AppearanceSettings theme={theme} onChange={changeTheme} />;
      break;
    case 'about':
      section = <AboutSettings />;
      break;
  }

  return (
    <div className="page settings-page" data-screen-label="Settings">
      <button className="back-btn" type="button" onClick={onBack}>
        <ArrowLeft size={16} /> Back
      </button>

      <header className="page-head">
        <h1 className="serif italic">Settings</h1>
      </header>

      <div className="settings-shell">
        <nav className="settings-nav" aria-label="Settings sections">
          {SETTINGS_CATEGORIES.map((category) => (
            <button
              key={category.id}
              className={`set-link${activeCategory === category.id ? ' active' : ''}`}
              type="button"
              aria-current={activeCategory === category.id ? 'page' : undefined}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.label}
            </button>
          ))}
        </nav>
        {section}
      </div>
    </div>
  );
};

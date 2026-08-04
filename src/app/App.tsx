import { useState } from 'react';
import { Disc3 } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { PlayerProvider, usePlayer } from '@/app/context/PlayerContext';
import { Sidebar } from '@/app/components/Sidebar';
import { PlayerBar } from '@/app/components/PlayerBar';
import { LoginPage } from '@/app/pages/LoginPage';
import { HomePage } from '@/app/pages/HomePage';
import { LibraryPage } from '@/app/pages/LibraryPage';
import { AlbumDetailPage } from '@/app/pages/AlbumDetailPage';
import { NowPlayingPage } from '@/app/pages/NowPlayingPage';
import { UploadPage } from '@/app/pages/UploadPage';
import { SearchPage } from '@/app/pages/SearchPage';
import { SettingsPage } from '@/app/pages/SettingsPage';

type BrowsePage = 'home' | 'library' | 'upload' | 'search';
type Page = BrowsePage | 'settings' | 'album';

function LoadingScreen() {
  return (
    <div className="vinil-splash" role="status" aria-label="Loading Vinil">
      <div className="vinil-splash-disc">
        <Disc3 size={28} strokeWidth={1.4} />
      </div>
      <div>
        <div className="brand-word">Vinil</div>
        <div className="eyebrow">Preparing your library</div>
      </div>
    </div>
  );
}

function AuthenticatedApp() {
  const { currentTrack } = usePlayer();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [lastBrowsePage, setLastBrowsePage] = useState<BrowsePage>('home');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [showNowPlaying, setShowNowPlaying] = useState(false);

  const handleNavigate = (page: string) => {
    if (page === 'album') return;

    const nextPage = page as Exclude<Page, 'album'>;
    if (nextPage !== 'settings') {
      setLastBrowsePage(nextPage);
      setSelectedAlbumId(null);
    }

    setCurrentPage(nextPage);
    setShowNowPlaying(false);
  };

  const handleNavigateToAlbum = (albumId: string) => {
    if (currentPage !== 'album' && currentPage !== 'settings') {
      setLastBrowsePage(currentPage);
    }
    setSelectedAlbumId(albumId);
    setCurrentPage('album');
    setShowNowPlaying(false);
  };

  const handleBack = () => {
    setCurrentPage(lastBrowsePage);
    setSelectedAlbumId(null);
  };

  return (
    <div className="app-shell">
      {!showNowPlaying && (
        <div className={`app-body${currentTrack ? '' : ' no-player'}`}>
          <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
          <main className="main">
            {currentPage === 'home' && (
              <HomePage
                onNavigateToAlbum={handleNavigateToAlbum}
                onNavigateToLibrary={() => handleNavigate('library')}
              />
            )}
            {currentPage === 'library' && <LibraryPage onNavigateToAlbum={handleNavigateToAlbum} />}
            {currentPage === 'upload' && <UploadPage />}
            {currentPage === 'search' && <SearchPage onNavigateToAlbum={handleNavigateToAlbum} />}
            {currentPage === 'settings' && <SettingsPage onBack={handleBack} />}
            {currentPage === 'album' && selectedAlbumId && (
              <AlbumDetailPage albumId={selectedAlbumId} onBack={handleBack} />
            )}
          </main>
        </div>
      )}

      {showNowPlaying && <NowPlayingPage onBack={() => setShowNowPlaying(false)} />}
      {!showNowPlaying && <PlayerBar onOpenNowPlaying={() => setShowNowPlaying(true)} />}
    </div>
  );
}

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <LoginPage />;

  return (
    <PlayerProvider>
      <AuthenticatedApp />
    </PlayerProvider>
  );
}

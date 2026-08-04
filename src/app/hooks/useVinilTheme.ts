import { useCallback, useEffect, useState } from 'react';

type VinilTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'vinil-theme';

const readDocumentTheme = (): VinilTheme => (
  typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark'
    ? 'dark'
    : 'light'
);

const applyDocumentTheme = (theme: VinilTheme) => {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
};

export const useVinilTheme = () => {
  const [theme, setTheme] = useState<VinilTheme>(readDocumentTheme);

  useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () => setTheme(readDocumentTheme());
    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      const nextTheme = event.newValue === 'dark' ? 'dark' : 'light';
      root.dataset.theme = nextTheme;
      root.style.colorScheme = nextTheme;
      setTheme(nextTheme);
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      observer.disconnect();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    const nextTheme = readDocumentTheme() === 'dark' ? 'light' : 'dark';
    applyDocumentTheme(nextTheme);
    setTheme(nextTheme);
  }, []);

  return { theme, toggleTheme };
};

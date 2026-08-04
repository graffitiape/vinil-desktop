import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/app/context/AuthContext';
import App from './app/App.tsx';
import './styles/index.css';

const rootElement = document.documentElement;
const storedTheme = localStorage.getItem('vinil-theme') === 'dark' ? 'dark' : 'light';
rootElement.dataset.theme = storedTheme;
rootElement.style.colorScheme = storedTheme;
rootElement.dataset.accent = localStorage.getItem('vinil-accent') || 'clay';
rootElement.dataset.density = localStorage.getItem('vinil-density') || 'cozy';
rootElement.dataset.cardstyle = localStorage.getItem('vinil-card-style') || 'soft';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </QueryClientProvider>
);

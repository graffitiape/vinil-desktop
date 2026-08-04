import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authRepository } from '@/app/repositories/authRepository';
import type { User } from '@/app/types/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const token = localStorage.getItem('vinil_token');

      if (!token) {
        if (!cancelled) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const currentUser = await authRepository.me();
        localStorage.setItem('vinil_user', JSON.stringify(currentUser));
        if (!cancelled) {
          setUser(currentUser);
        }
      } catch {
        localStorage.removeItem('vinil_token');
        localStorage.removeItem('vinil_user');
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  // Listen for forced logout (401)
  useEffect(() => {
    const handleLogout = () => {
      queryClient.clear();
      setUser(null);
    };
    window.addEventListener('vinil:logout', handleLogout);
    return () => window.removeEventListener('vinil:logout', handleLogout);
  }, [queryClient]);

  const setAuth = useCallback((token: string, user: User) => {
    queryClient.clear();
    localStorage.setItem('vinil_token', token);
    localStorage.setItem('vinil_user', JSON.stringify(user));
    setUser(user);
  }, [queryClient]);

  const logout = useCallback(() => {
    queryClient.clear();
    localStorage.removeItem('vinil_token');
    localStorage.removeItem('vinil_user');
    setUser(null);
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        setAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

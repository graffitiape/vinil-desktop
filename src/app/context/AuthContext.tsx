import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('vinil_token');
    const savedUser = localStorage.getItem('vinil_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  // Listen for forced logout (401)
  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
    };
    window.addEventListener('vinil:logout', handleLogout);
    return () => window.removeEventListener('vinil:logout', handleLogout);
  }, []);

  const setAuth = useCallback((token: string, user: User) => {
    localStorage.setItem('vinil_token', token);
    localStorage.setItem('vinil_user', JSON.stringify(user));
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('vinil_token');
    localStorage.removeItem('vinil_user');
    setUser(null);
  }, []);

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

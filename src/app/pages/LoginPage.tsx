import { Disc3 } from 'lucide-react';
import { useState } from 'react';
import { useLogin, useRegister } from '@/app/hooks/useAuth';

export const LoginPage = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const login = useLogin();
  const register = useRegister();

  const isLoading = login.isPending || register.isPending;
  const error = login.error || register.error;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      login.mutate({ email, password });
    } else {
      register.mutate({ email, password, display_name: displayName });
    }
  };

  return (
    <div
      className="flex items-center justify-center h-screen"
      style={{ background: 'var(--bg-deep)' }}
    >
      <div
        className="w-full max-w-sm p-8 rounded-xl"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-default)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: '48px',
              height: '48px',
              background: 'var(--accent-primary)',
              boxShadow: '0 0 24px rgba(245, 166, 35, 0.3)',
            }}
          >
            <Disc3 className="w-7 h-7 animate-spin-slow" style={{ color: 'var(--text-on-accent)' }} />
          </div>
          <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Vinil
          </span>
        </div>

        {/* Tabs */}
        <div
          className="flex mb-6 rounded-lg overflow-hidden"
          style={{ background: 'var(--bg-deep)' }}
        >
          <button
            onClick={() => setMode('login')}
            className="flex-1 py-2.5 text-sm font-medium transition-all"
            style={{
              background: mode === 'login' ? 'var(--accent-primary)' : 'transparent',
              color: mode === 'login' ? 'var(--text-on-accent)' : 'var(--text-secondary)',
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            className="flex-1 py-2.5 text-sm font-medium transition-all"
            style={{
              background: mode === 'register' ? 'var(--accent-primary)' : 'transparent',
              color: mode === 'register' ? 'var(--text-on-accent)' : 'var(--text-secondary)',
            }}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full px-4 py-2.5 rounded-md text-sm"
                style={{
                  background: 'var(--bg-deep)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          )}
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-2.5 rounded-md text-sm"
              style={{
                background: 'var(--bg-deep)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="w-full px-4 py-2.5 rounded-md text-sm"
              style={{
                background: 'var(--bg-deep)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {error && (
            <p className="text-xs" style={{ color: 'var(--error)' }}>
              {(error as any)?.response?.data?.error || 'Something went wrong'}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-md text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'var(--accent-primary)',
              color: 'var(--text-on-accent)',
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

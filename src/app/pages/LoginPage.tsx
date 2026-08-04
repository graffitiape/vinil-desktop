import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useLogin, useRegister } from '@/app/hooks/useAuth';

type AuthMode = 'login' | 'register';

const getAuthError = (error: unknown) => {
  if (typeof error !== 'object' || error === null || !('response' in error)) {
    return 'Something went wrong. Please try again.';
  }

  const response = error.response;
  if (typeof response !== 'object' || response === null || !('data' in response)) {
    return 'Something went wrong. Please try again.';
  }

  const data = response.data;
  if (typeof data !== 'object' || data === null || !('error' in data)) {
    return 'Something went wrong. Please try again.';
  }

  return typeof data.error === 'string' ? data.error : 'Something went wrong. Please try again.';
};

export const LoginPage = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const login = useLogin();
  const register = useRegister();

  const isLoading = login.isPending || register.isPending;
  const error = login.error || register.error;

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    login.reset();
    register.reset();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === 'login') {
      login.mutate({ email: email.trim(), password });
      return;
    }
    register.mutate({ email: email.trim(), password, display_name: displayName.trim() });
  };

  return (
    <main className="auth-page" data-screen-label="Authentication">
      <section className="auth-ambient" aria-label="Vinil introduction">
        <div className="auth-brand">
          <span className="vinil-logo-disc" aria-hidden="true"><span /></span>
          <span className="brand-word">Vinil</span>
        </div>
        <div className="auth-copy">
          <p className="eyebrow mono">Your personal listening room</p>
          <h1 className="serif">Keep the music that <em>stays with you.</em></h1>
          <p className="lead">
            Collect records, play them in full fidelity, and carry your library offline.
          </p>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-form">
          <p className="eyebrow mono">Welcome to Vinil</p>
          <h2 className="serif">{mode === 'login' ? 'Welcome back.' : 'Start a collection.'}</h2>
          <p className="lead">
            {mode === 'login'
              ? 'Sign in to return to your library.'
              : 'Create an account for your personal music library.'}
          </p>

          <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
            <button
              className={`auth-tab${mode === 'login' ? ' active' : ''}`}
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              onClick={() => changeMode('login')}
            >
              Sign in
            </button>
            <button
              className={`auth-tab${mode === 'register' ? ' active' : ''}`}
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              onClick={() => changeMode('register')}
            >
              Create account
            </button>
          </div>

          <form className="auth-fields" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <label className="auth-field">
                Display name
                <input
                  type="text"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="How should we address you?"
                  autoComplete="name"
                  required
                />
              </label>
            )}
            <label className="auth-field">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>
            <label className="auth-field">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
              />
            </label>

            {error && <p className="form-error" role="alert">{getAuthError(error)}</p>}

            <button className="btn-clay auth-submit" type="submit" disabled={isLoading}>
              {isLoading
                ? mode === 'login' ? 'Signing in…' : 'Creating account…'
                : mode === 'login' ? 'Enter your library' : 'Create your library'}
              {!isLoading && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="auth-note mono">Private by design · Your collection stays yours</p>
        </div>
      </section>
    </main>
  );
};

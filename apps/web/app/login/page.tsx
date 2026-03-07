'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '../components/ThemeToggle';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [authError, setAuthError] = useState('');

  // Redirect to /app if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/app');
    });
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setAuthError(error.message); return; }
    router.push('/app');
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/app` },
    });
  }

  const inputCls =
    'w-full bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm px-4 py-3.5 rounded-2xl outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors';

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center px-4 sm:px-6 py-16">

      {/* Logo + toggle */}
      <div className="flex items-center justify-between w-full max-w-sm mb-10">
        <a href="/" aria-label="Home">
          <span className="text-2xl font-extrabold tracking-tight leading-none">
            <span className="text-white">myother</span><span className="text-brand-500">pair</span>
          </span>
        </a>
        <ThemeToggle />
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-dark-800 border border-white/5 rounded-3xl px-5 sm:px-8 py-8 sm:py-10">

        <h1 className="text-2xl font-bold text-white tracking-tight text-center mb-2">Sign in</h1>
        <p className="text-sm text-white/40 text-center mb-8">Welcome back to MyOtherPair.</p>

        {/* Social */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {['Google', 'Apple'].map(provider => (
            <button key={provider} type="button"
              onClick={provider === 'Google' ? handleGoogle : undefined}
              className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-sm font-medium py-3 rounded-2xl transition-colors"
            >
              {provider === 'Google' ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11" />
                </svg>
              )}
              {provider}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-white/8" />
          <span className="text-xs text-white/25">or with email</span>
          <div className="flex-1 h-px bg-white/8" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-white/50 mb-1.5">Email</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
              required placeholder="you@email.com" className={inputCls} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-white/50">Password</label>
              <a href="#" className="text-xs font-medium text-brand-500 hover:text-brand-400 transition-colors">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <input id="password" type={showPass ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                className={inputCls + ' pr-11'} />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                aria-label="Toggle password">
                <EyeIcon open={showPass} />
              </button>
            </div>
          </div>

          {authError && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2.5">{authError}</p>
          )}

          <button type="submit" disabled={loading || !email || !password}
            className="mt-1 w-full inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold py-3.5 rounded-2xl active:scale-[.98] transition-all"
            style={{ background: 'linear-gradient(to right, #fd267a, #ff6036)' }}
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in…
              </>
            ) : 'Sign In'}
          </button>

        </form>

        <p className="text-center text-sm text-white/30 mt-8">
          Don't have an account?{' '}
          <a href="/signup" className="font-semibold text-brand-500 hover:text-brand-400 transition-colors">
            Create one
          </a>
        </p>

      </div>

      <p className="mt-8 text-xs text-white/20 text-center max-w-xs">
        By continuing, you agree to our{' '}
        <a href="#" className="underline underline-offset-2 hover:text-white/40 transition-colors">Terms</a>
        {' '}and{' '}
        <a href="#" className="underline underline-offset-2 hover:text-white/40 transition-colors">Privacy Policy</a>.
      </p>

    </div>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

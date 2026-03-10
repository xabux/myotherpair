'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [authError,  setAuthError]  = useState('');
  const [checking,   setChecking]   = useState(true);
  const [redirectTo, setRedirectTo] = useState('/app');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get('redirect');
    if (r && r.startsWith('/')) setRedirectTo(r);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace(r && r.startsWith('/') ? r : '/app');
      } else {
        setChecking(false);
      }
    });
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setAuthError(error.message); return; }
    router.replace(redirectTo);
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-accent animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Top bar */}
      <div className="px-4 py-4 flex items-center justify-between max-w-lg mx-auto w-full">
        <a href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </a>
        <span className="font-display text-sm font-bold text-foreground tracking-[0.08em] uppercase">myotherpair</span>
        <div className="w-14" />
      </div>

      {/* Form */}
      <div className="flex-1 flex items-start justify-center px-4 pt-8 pb-8">
        <div className="w-full max-w-sm animate-fade-in">
          <span className="text-3xl block mb-4">👋</span>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">Welcome back</h1>
          <p className="text-sm text-muted-foreground mb-8">Log in to your myotherpair account.</p>

          {/* Google */}
          <button type="button" onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-800 text-sm font-semibold py-3.5 rounded-xl border border-border transition-all active:scale-[.98] shadow-sm mb-6">
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground/60">or with email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs text-muted-foreground font-medium block">Email</label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="you@example.com"
                className="w-full bg-background border border-input text-foreground placeholder-muted-foreground/50 text-sm px-4 py-3 rounded-xl outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors h-12" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs text-muted-foreground font-medium">Password</label>
                <button type="button" className="text-xs text-accent font-medium hover:underline">Forgot?</button>
              </div>
              <div className="relative">
                <input id="password" type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                  className="w-full bg-background border border-input text-foreground placeholder-muted-foreground/50 text-sm px-4 py-3 rounded-xl outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors h-12 pr-11" />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                  aria-label="Toggle password">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-2.5">{authError}</p>
            )}

            <button type="submit" disabled={loading || !email || !password}
              className="w-full gradient-warm text-accent-foreground text-sm font-semibold h-13 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[.98] shadow-card hover:shadow-card-hover mt-1"
              style={{ height: 52 }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </span>
              ) : 'Log in'}
            </button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-8">
            Don&apos;t have an account?{' '}
            <a href="/signup" className="text-accent font-semibold hover:underline">Sign up</a>
          </p>
        </div>
      </div>

    </div>
  );
}

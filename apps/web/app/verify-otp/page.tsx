'use client';

import { useState, useRef, useEffect, type KeyboardEvent, type ClipboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { ArrowLeft } from 'lucide-react';

export default function VerifyOtpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEmail(params.get('email') ?? '');
  }, []);

  const [digits,    setDigits]    = useState(['', '', '', '', '', '']);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [resending, setResending] = useState(false);
  const [resent,    setResent]    = useState(false);

  const refs = useRef<Array<HTMLInputElement | null>>([null, null, null, null, null, null]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  function handleChange(val: string, idx: number) {
    const digit = val.replace(/[^0-9]/g, '').slice(-1);
    setDigits(prev => {
      const next = [...prev];
      next[idx] = digit;
      return next;
    });
    if (digit && idx < 5) {
      refs.current[idx + 1]?.focus();
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>, idx: number) {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      setDigits(prev => {
        const next = [...prev];
        next[idx - 1] = '';
        return next;
      });
      refs.current[idx - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && idx > 0) refs.current[idx - 1]?.focus();
    if (e.key === 'ArrowRight' && idx < 5) refs.current[idx + 1]?.focus();
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasted) return;
    const next = ['', '', '', '', '', ''];
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    const focusIdx = Math.min(pasted.length, 5);
    refs.current[focusIdx]?.focus();
  }

  async function handleVerify() {
    const token = digits.join('');
    if (token.length !== 6) { setError('Please enter all 6 digits.'); return; }
    setLoading(true);
    setError('');

    const { data, error: verifyErr } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    });

    if (verifyErr || !data.session) {
      setError(verifyErr?.message ?? 'Invalid or expired code. Please try again.');
      setLoading(false);
      return;
    }

    // Email verified — now safely create the user profile from stored signup data
    const uid         = data.session.user.id;
    const profileRaw  = sessionStorage.getItem('signup_profile');
    const profile     = profileRaw ? JSON.parse(profileRaw) : null;

    if (profile) {
      await supabase.from('users').upsert({
        id:              uid,
        email,
        name:            profile.name            ?? null,
        location:        profile.location         ?? null,
        foot_size_left:  profile.foot_size_left   ?? null,
        foot_size_right: profile.foot_size_right  ?? null,
        is_amputee:      profile.is_amputee       ?? false,
      });
      sessionStorage.removeItem('signup_profile');
    } else {
      // Fallback: create minimal profile from auth metadata
      const meta = data.session.user.user_metadata;
      await supabase.from('users').upsert({
        id:    uid,
        email,
        name:  meta?.full_name ?? null,
      });
    }

    router.replace('/app');
  }

  async function handleResend() {
    setResending(true);
    await supabase.auth.resend({ type: 'signup', email });
    setResending(false);
    setResent(true);
    setTimeout(() => setResent(false), 5000);
  }

  const filled = digits.join('').length === 6;

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Top bar */}
      <div className="px-4 py-4 flex items-center justify-between max-w-lg mx-auto w-full">
        <button
          onClick={() => router.push('/signup')}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <span className="font-display text-sm font-bold text-foreground tracking-[0.08em] uppercase">
          myotherpair
        </span>
        <div className="w-14" />
      </div>

      <div className="flex-1 flex items-start justify-center px-4 pt-8 pb-8">
        <div className="w-full max-w-sm animate-fade-in text-center">

          <span className="text-5xl block mb-4">📬</span>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Check your email</h1>
          <p className="text-sm text-muted-foreground mb-2">We sent a 6-digit code to</p>
          <p className="text-sm font-semibold text-foreground mb-8 break-all">{email}</p>

          {/* 6-digit OTP boxes */}
          <div className="flex justify-center gap-2.5 mb-6">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={r => { refs.current[i] = r; }}
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={d}
                onChange={e => handleChange(e.target.value, i)}
                onKeyDown={e => handleKeyDown(e, i)}
                onPaste={i === 0 ? handlePaste : undefined}
                onFocus={e => e.target.select()}
                className={`w-12 h-14 rounded-xl border-2 text-center text-xl font-bold text-foreground bg-background outline-none transition-all duration-150 ${
                  d
                    ? 'border-accent bg-accent/10'
                    : 'border-border focus:border-accent/60 focus:ring-1 focus:ring-accent/20'
                }`}
              />
            ))}
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-2.5 mb-4">
              {error}
            </p>
          )}

          <button
            onClick={handleVerify}
            disabled={loading || !filled}
            className="w-full gradient-warm text-accent-foreground text-sm font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[.98] shadow-card hover:shadow-card-hover flex items-center justify-center gap-2 mb-4"
            style={{ height: 52 }}
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Verifying…
              </>
            ) : 'Verify email'}
          </button>

          <button
            onClick={handleResend}
            disabled={resending || resent}
            className={`text-sm transition-colors ${
              resent
                ? 'text-green-500'
                : 'text-muted-foreground hover:text-foreground'
            } disabled:cursor-not-allowed`}
          >
            {resent ? '✓ Code resent!' : resending ? 'Sending…' : "Didn't receive it? Resend code"}
          </button>

        </div>
      </div>
    </div>
  );
}

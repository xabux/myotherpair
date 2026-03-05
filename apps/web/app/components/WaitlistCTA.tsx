'use client';

import { useState, type FormEvent } from 'react';

export default function GetStartedCTA() {
  const [email, setEmail]         = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <section id="waitlist" className="relative bg-dark-800 py-20 px-6 overflow-hidden">

      {/* Gradient glow background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[600px] h-[400px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(ellipse, #fd267a 0%, transparent 70%)' }} />
      </div>

      <div className="relative max-w-xl mx-auto text-center">
        <p className="text-sm font-bold text-gradient mb-4 tracking-wider uppercase">Free to join</p>

        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.08] mb-5">
          Find your other<br />
          <span className="text-gradient">shoe today.</span>
        </h2>
        <p className="text-lg text-white/50 leading-relaxed mb-10 max-w-sm mx-auto">
          Sign up free. List your spare in minutes. Your match might already be waiting.
        </p>

        {submitted ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #fd267a, #ff6036)' }}>
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-xl font-bold text-white">You're in. Welcome.</p>
            <p className="text-sm text-white/50">Check your inbox to verify your email.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col sm:flex-row gap-3">
            <label htmlFor="signup-email" className="sr-only">Email address</label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@email.com"
              className="flex-1 bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm px-5 py-4 rounded-2xl outline-none focus:border-brand-500 focus:bg-white/8 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !email}
              className="inline-flex items-center justify-center gap-2 bg-tinder disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold px-7 py-4 rounded-2xl active:scale-[.97] transition-all shadow-glow whitespace-nowrap"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Joining...
                </>
              ) : 'Get Started Free'}
            </button>
          </form>
        )}

        <p className="text-xs text-white/25 mt-5">
          No credit card required.{' '}
          <a href="#" className="underline hover:text-white/50 transition-colors">Privacy policy</a>.
        </p>
      </div>
    </section>
  );
}

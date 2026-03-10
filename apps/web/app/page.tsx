'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import {
  ArrowRight, Search, ArrowLeftRight, MessageCircle,
  Shield, Zap, Heart, Minus,
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/app');
      } else {
        setChecking(false);
      }
    });
  }, [router]);

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
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/20">

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 sm:px-12 py-6 flex items-center justify-between">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-transparent pointer-events-none" />
        <h1 className="relative font-display text-lg font-bold tracking-[0.08em] uppercase text-foreground">
          myotherpair
        </h1>
        <a href="/login" className="relative text-[13px] font-medium tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-500">
          Log in
        </a>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute top-1/3 right-1/4 w-[60vw] h-[60vh] bg-accent/[0.04] rounded-full blur-[150px]" />

        <div className="relative z-10 px-6 sm:px-12 max-w-7xl mx-auto w-full pt-24">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-8 h-px bg-accent" />
              <p className="text-accent text-[11px] font-medium tracking-[0.3em] uppercase">Est. 2026</p>
            </div>
            <h2 className="font-display text-[clamp(3rem,9vw,7.5rem)] font-bold leading-[0.88] tracking-[-0.04em] mb-10 text-foreground">
              The art of<br />
              the perfect<br />
              <span className="text-accent italic">match.</span>
            </h2>
            <p className="text-muted-foreground text-lg sm:text-xl max-w-lg leading-[1.7] mb-14 font-normal">
              A curated marketplace for single shoes. List yours, find its counterpart,
              and complete the pair — effortlessly.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <a href="/signup"
                className="gradient-warm inline-flex items-center gap-2 h-14 px-12 text-[13px] font-semibold tracking-[0.15em] uppercase text-accent-foreground transition-all hover:opacity-90 active:scale-[.98]">
                Begin <ArrowRight className="h-4 w-4" />
              </a>
              <a href="/signup" className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-500 tracking-[0.1em] uppercase">
                Explore collection
              </a>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-px h-10 bg-gradient-to-b from-transparent to-border" />
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/50">Scroll</p>
        </div>
      </section>

      {/* ── Marquee ──────────────────────────────────────────────────────── */}
      <div className="border-y border-border py-4 overflow-hidden">
        <div className="flex items-center gap-8 whitespace-nowrap text-[11px] tracking-[0.25em] uppercase text-muted-foreground/30 font-medium animate-marquee">
          {Array(12).fill(null).map((_, i) => (
            <span key={i} className="flex items-center gap-8">
              <span>Single shoes</span>
              <Minus className="h-3 w-3 opacity-30" />
              <span>Perfect matches</span>
              <Minus className="h-3 w-3 opacity-30" />
              <span>Zero waste</span>
              <Minus className="h-3 w-3 opacity-30" />
            </span>
          ))}
        </div>
      </div>

      {/* ── Problem / Solution ───────────────────────────────────────────── */}
      <section className="relative">
        <div className="grid sm:grid-cols-2">
          <div className="relative p-10 sm:p-20 flex flex-col justify-center min-h-[50vh] sm:min-h-[70vh] bg-secondary/50">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-6 h-px bg-accent/60" />
              <p className="text-accent/70 text-[10px] font-medium tracking-[0.3em] uppercase">The problem</p>
            </div>
            <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] font-bold text-foreground leading-[1.0] tracking-[-0.02em] mb-8">
              20 million people<br />
              <span className="text-muted-foreground">buy two pairs</span><br />
              <span className="text-muted-foreground">to wear one.</span>
            </h2>
            <p className="text-muted-foreground text-[15px] leading-[1.8] max-w-sm">
              Different-sized feet. Limb difference. One shoe sits unworn.
              Billions wasted every year.
            </p>
          </div>
          <div className="relative p-10 sm:p-20 flex flex-col justify-center min-h-[50vh] sm:min-h-[70vh] border-l border-border bg-background">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-6 h-px bg-accent" />
              <p className="text-accent text-[10px] font-medium tracking-[0.3em] uppercase">The solution</p>
            </div>
            <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] font-bold text-foreground leading-[1.0] tracking-[-0.02em] mb-8">
              List one.<br />
              Match one.<br />
              <span className="text-accent italic">Walk away happy.</span>
            </h2>
            <p className="text-muted-foreground text-[15px] leading-[1.8] max-w-sm">
              myotherpair connects people who need opposite shoes.
              Same brand, same size, opposite foot. Split the cost.
            </p>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="py-28 sm:py-40 px-6 sm:px-12 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-accent" />
            <p className="text-accent text-[10px] font-medium tracking-[0.3em] uppercase">Process</p>
          </div>
          <h2 className="font-display text-3xl sm:text-[2.8rem] font-bold text-foreground mb-24 max-w-md leading-[1.05] tracking-[-0.02em]">
            Effortless by design.
          </h2>
          <div className="grid sm:grid-cols-3 gap-0">
            {[
              { num: 'I',   title: 'List',     desc: 'Photograph your shoe. Select side and size. Set your price. Sixty seconds.' },
              { num: 'II',  title: 'Match',    desc: 'Our algorithm finds the complementary shoe — same brand, same size, opposite foot.' },
              { num: 'III', title: 'Complete', desc: 'Connect with your match. Agree on terms. Both walk away with a perfect pair.' },
            ].map((step, i) => (
              <div key={i} className="relative py-10 sm:py-0 sm:pr-16">
                {i < 2 && <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-px bg-border" />}
                {i > 0 && <div className="sm:hidden absolute left-0 right-0 top-0 h-px bg-border" />}
                <span className="font-display text-5xl sm:text-6xl font-bold text-accent/[0.1] leading-none block mb-6 italic">
                  {step.num}
                </span>
                <h3 className="font-display text-lg font-bold text-foreground mb-3 tracking-[-0.01em]">{step.title}</h3>
                <p className="text-[13px] text-muted-foreground leading-[1.8] max-w-[260px]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="py-28 sm:py-40 px-6 sm:px-12 border-t border-border bg-secondary/30">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-20 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-px bg-accent" />
                <p className="text-accent text-[10px] font-medium tracking-[0.3em] uppercase">Capabilities</p>
              </div>
              <h2 className="font-display text-3xl sm:text-[2.8rem] font-bold text-foreground max-w-sm leading-[1.05] tracking-[-0.02em]">
                Precision-built for purpose.
              </h2>
            </div>
            <p className="text-muted-foreground text-[13px] max-w-xs leading-[1.8]">
              Every detail crafted to connect you with your match, faster.
            </p>
          </div>
          <div className="space-y-0">
            {[
              { icon: <Search className="h-4 w-4" />,        title: 'Intelligent matching', desc: 'Automatic pairing by brand, size, and foot side.' },
              { icon: <MessageCircle className="h-4 w-4" />, title: 'Private messaging',    desc: 'Negotiate price, condition, and shipping — in-app.' },
              { icon: <Shield className="h-4 w-4" />,        title: 'Verified profiles',    desc: 'Ratings, reviews, and identity verification.' },
              { icon: <ArrowLeftRight className="h-4 w-4" />,title: 'Universal sizing',     desc: 'UK, US, EU conversion built into every listing.' },
              { icon: <Zap className="h-4 w-4" />,           title: 'Instant alerts',       desc: 'Notified the moment a compatible shoe appears.' },
              { icon: <Heart className="h-4 w-4" />,         title: 'Curated wishlist',     desc: 'Save styles. Get alerted when your size drops.' },
            ].map((f, i) => (
              <div key={i} className="group flex items-center gap-6 py-6 border-b border-border first:border-t">
                <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground flex-shrink-0 group-hover:border-accent group-hover:text-accent transition-all duration-500">
                  {f.icon}
                </div>
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <h3 className="font-medium text-foreground text-[15px] tracking-[-0.01em] group-hover:text-accent transition-colors duration-500">{f.title}</h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed sm:text-right max-w-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-background">
        <div className="max-w-6xl mx-auto grid grid-cols-3 divide-x divide-border">
          {[
            { value: '20M+', label: 'Affected globally' },
            { value: '£120', label: 'Average saved' },
            { value: '<60s', label: 'Time to list' },
          ].map((stat, i) => (
            <div key={i} className="py-16 sm:py-24 text-center px-4">
              <p className="font-display text-3xl sm:text-5xl font-bold text-accent mb-3 tracking-[-0.03em]">{stat.value}</p>
              <p className="text-[11px] sm:text-[12px] text-muted-foreground font-medium tracking-[0.15em] uppercase">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Who It's For ─────────────────────────────────────────────────── */}
      <section className="py-28 sm:py-40 px-6 sm:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-accent" />
            <p className="text-accent text-[10px] font-medium tracking-[0.3em] uppercase">For whom</p>
          </div>
          <h2 className="font-display text-3xl sm:text-[2.8rem] font-bold text-foreground mb-20 max-w-md leading-[1.05] tracking-[-0.02em]">
            Made for those who<br />
            <span className="text-accent italic">deserve better.</span>
          </h2>
          <div className="space-y-0">
            {[
              { title: 'Different-sized feet',       desc: 'No more buying two pairs. Find someone with the opposite mismatch.' },
              { title: 'Amputees & limb-different',  desc: 'Your spare shoe is someone\'s perfect match. Save money, reduce waste.' },
              { title: 'Conscious consumers',        desc: 'Split the cost with a stranger who needs the other shoe.' },
            ].map((s, i) => (
              <div key={i} className="group flex items-baseline gap-8 py-8 border-b border-border first:border-t cursor-default">
                <span className="font-display text-[11px] tracking-[0.2em] text-muted-foreground/40 flex-shrink-0 w-8 uppercase">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1">
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2 tracking-[-0.01em] group-hover:text-accent transition-colors duration-500">
                    {s.title}
                  </h3>
                  <p className="text-[13px] sm:text-sm text-muted-foreground leading-[1.8] max-w-lg">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="py-32 sm:py-44 px-6 sm:px-12 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl sm:text-[3.5rem] font-bold text-foreground leading-[0.92] tracking-[-0.03em] mb-8">
            Stop paying for shoes<br />
            <span className="text-accent italic">you&apos;ll never wear.</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg mb-12 max-w-md mx-auto leading-[1.7]">
            Join a community matching single shoes and saving money — beautifully.
          </p>
          <a href="/signup"
            className="gradient-warm inline-flex items-center gap-3 h-14 px-14 text-[13px] font-semibold tracking-[0.15em] uppercase text-accent-foreground hover:opacity-90 active:scale-[.98] transition-all">
            Create account <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-border px-6 sm:px-12 py-16 bg-secondary/20">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between gap-10">
          <div>
            <h4 className="font-display text-base font-bold text-foreground tracking-[0.05em] uppercase mb-2">myotherpair</h4>
            <p className="text-[11px] text-muted-foreground/60 tracking-[0.1em]">The single-shoe marketplace.</p>
          </div>
          <div className="flex gap-16 text-[12px] tracking-[0.08em]">
            <ul className="space-y-3 text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors duration-500">Privacy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors duration-500">Terms</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors duration-500">FAQ</a></li>
            </ul>
            <ul className="space-y-3 text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors duration-500">Instagram</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors duration-500">TikTok</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors duration-500">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-12 pt-8 border-t border-border/50">
          <p className="text-[10px] text-muted-foreground/40 tracking-[0.1em] uppercase">© 2026 myotherpair. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}

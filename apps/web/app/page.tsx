'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { useTranslations } from '../lib/locale';
import {
  ArrowRight, Search, ArrowLeftRight, MessageCircle,
  Shield, Zap, Heart, Minus,
} from 'lucide-react';
import ThemeToggle from './components/ThemeToggle';
import LanguageSelector from './components/LanguageSelector';

const stories = [
  {
    names: 'Sarah & James',
    location: 'London, UK',
    text: "Within a week of listing my spare right Nike, I matched with James. We both saved £60 and walked away with shoes that actually fit.",
    image: '/assets/shoe-card-1.jpg',
  },
  {
    names: 'Priya & Tom',
    location: 'Manchester, UK',
    text: "My feet are two different sizes. I've always bought two pairs. myotherpair matched me with Tom. Opposite problem, same solution.",
    image: '/assets/shoe-card-2.jpg',
  },
  {
    names: 'Marcus & Elin',
    location: 'Stockholm, SE',
    text: "As an amputee, I listed my unworn Sambas and matched with Elin the same day. She'd been searching for months.",
    image: '/assets/shoe-card-3.jpg',
  },
  {
    names: 'Aisha & Dan',
    location: 'Bristol, UK',
    text: "Size 4 left, size 5 right. My first match was Dan. Opposite sizes, same taste. We've now matched three times on different styles.",
    image: '/assets/shoe-card-4.jpg',
  },
];

export default function LandingPage() {
  const router = useRouter();
  const t = useTranslations();
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

  const features = [
    { icon: <Search className="h-4 w-4" />,         title: t.feat1_title, desc: t.feat1_desc },
    { icon: <MessageCircle className="h-4 w-4" />,  title: t.feat2_title, desc: t.feat2_desc },
    { icon: <Shield className="h-4 w-4" />,         title: t.feat3_title, desc: t.feat3_desc },
    { icon: <ArrowLeftRight className="h-4 w-4" />, title: t.feat4_title, desc: t.feat4_desc },
    { icon: <Zap className="h-4 w-4" />,            title: t.feat5_title, desc: t.feat5_desc },
    { icon: <Heart className="h-4 w-4" />,          title: t.feat6_title, desc: t.feat6_desc },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/20">

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 sm:px-12 py-6 flex items-center justify-between">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-transparent pointer-events-none" />
        <h1 className="relative font-display text-lg font-bold tracking-[0.08em] uppercase text-foreground">
          myotherpair
        </h1>
        <nav className="relative hidden sm:flex items-center gap-8 text-[13px] font-medium tracking-[0.12em] uppercase text-muted-foreground" />
        <div className="relative flex items-center gap-2">
          <LanguageSelector variant="compact" />
          <ThemeToggle />
          <a href="/login" className="text-[13px] font-medium tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-500 px-3 py-1.5">
            {t.login}
          </a>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute top-1/3 right-1/4 w-[60vw] h-[60vh] bg-accent/[0.04] rounded-full blur-[150px]" />
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[180px] sm:w-[240px] rounded-xl overflow-hidden opacity-[0.06]"
            style={{ left: '2%', top: '15%', transform: 'rotate(-12deg)' }}>
            <img src="/assets/shoe-card-1.jpg" alt="" className="w-full h-auto" />
          </div>
          <div className="absolute w-[160px] sm:w-[220px] rounded-xl overflow-hidden opacity-[0.05]"
            style={{ right: '3%', top: '20%', transform: 'rotate(8deg)' }}>
            <img src="/assets/shoe-card-2.jpg" alt="" className="w-full h-auto" />
          </div>
          <div className="absolute w-[140px] sm:w-[190px] rounded-xl overflow-hidden opacity-[0.04]"
            style={{ right: '8%', bottom: '12%', transform: 'rotate(-5deg)' }}>
            <img src="/assets/shoe-card-4.jpg" alt="" className="w-full h-auto" />
          </div>
        </div>

        <div className="relative z-10 px-6 sm:px-12 max-w-7xl mx-auto w-full pt-24">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-8 h-px bg-accent" />
              <p className="text-accent text-[11px] font-medium tracking-[0.3em] uppercase">Est. 2026</p>
            </div>
            <h2 className="font-display text-[clamp(3rem,9vw,7.5rem)] font-bold leading-[0.88] tracking-[-0.04em] mb-10 text-foreground">
              {t.hero_line1}<br />
              {t.hero_line2}<br />
              <span className="text-accent italic">{t.hero_accent}</span>
            </h2>
            <p className="text-muted-foreground text-lg sm:text-xl max-w-lg leading-[1.7] mb-14 font-normal">
              {t.hero_body}
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <a href="/signup"
                className="gradient-warm inline-flex items-center gap-2 h-14 px-12 text-[13px] font-semibold tracking-[0.15em] uppercase text-accent-foreground transition-all hover:opacity-90 active:scale-[.98]">
                {t.hero_cta} <ArrowRight className="h-4 w-4" />
              </a>
              <a href="/app/browse"
                className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-500 tracking-[0.1em] uppercase">
                {t.hero_explore}
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
              <span>{t.marquee_1}</span>
              <Minus className="h-3 w-3 opacity-30" />
              <span>{t.marquee_2}</span>
              <Minus className="h-3 w-3 opacity-30" />
              <span>{t.marquee_3}</span>
              <Minus className="h-3 w-3 opacity-30" />
            </span>
          ))}
        </div>
      </div>

      {/* ── Problem / Solution ───────────────────────────────────────────── */}
      <section className="relative">
        <div className="grid sm:grid-cols-2">
          <div className="relative p-10 sm:p-20 flex flex-col justify-center min-h-[50vh] sm:min-h-[70vh] bg-secondary/50">
            <div className="relative">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-6 h-px bg-accent/60" />
                <p className="text-accent/70 text-[10px] font-medium tracking-[0.3em] uppercase">{t.problem_label}</p>
              </div>
              <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] font-bold text-foreground leading-[1.0] tracking-[-0.02em] mb-8 whitespace-pre-line">
                {t.problem_headline.split('\n')[0]}<br />
                <span className="text-muted-foreground">{t.problem_headline.split('\n')[1]}</span><br />
                <span className="text-muted-foreground">{t.problem_headline.split('\n')[2]}</span>
              </h2>
              <p className="text-muted-foreground text-[15px] leading-[1.8] max-w-sm">
                {t.problem_body}
              </p>
            </div>
          </div>
          <div className="relative p-10 sm:p-20 flex flex-col justify-center min-h-[50vh] sm:min-h-[70vh] border-l border-border bg-background">
            <div className="relative">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-6 h-px bg-accent" />
                <p className="text-accent text-[10px] font-medium tracking-[0.3em] uppercase">{t.solution_label}</p>
              </div>
              <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] font-bold text-foreground leading-[1.0] tracking-[-0.02em] mb-8">
                {t.solution_line1}<br />
                {t.solution_line2}<br />
                <span className="text-accent italic">{t.solution_accent}</span>
              </h2>
              <p className="text-muted-foreground text-[15px] leading-[1.8] max-w-sm">
                {t.solution_body}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-40 px-6 sm:px-12 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-8 h-px bg-accent" />
            <p className="text-accent text-[10px] font-medium tracking-[0.3em] uppercase">{t.process_label}</p>
          </div>
          <h2 className="font-display text-3xl sm:text-[2.8rem] font-bold text-foreground mb-12 sm:mb-24 max-w-md leading-[1.05] tracking-[-0.02em]">
            {t.process_headline}
          </h2>
          <div className="grid sm:grid-cols-3 gap-0">
            {[
              { num: 'I',   title: t.step1_title, desc: t.step1_desc },
              { num: 'II',  title: t.step2_title, desc: t.step2_desc },
              { num: 'III', title: t.step3_title, desc: t.step3_desc },
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
                <p className="text-accent text-[10px] font-medium tracking-[0.3em] uppercase">{t.features_label}</p>
              </div>
              <h2 className="font-display text-3xl sm:text-[2.8rem] font-bold text-foreground max-w-sm leading-[1.05] tracking-[-0.02em]">
                {t.features_headline}
              </h2>
            </div>
            <p className="text-muted-foreground text-[13px] max-w-xs leading-[1.8]">
              {t.features_subtitle}
            </p>
          </div>
          <div className="space-y-0">
            {features.map((f, i) => (
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
            { value: '20M+', label: t.stat1_label },
            { value: '£120', label: t.stat2_label },
            { value: '<60s', label: t.stat3_label },
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
            <p className="text-accent text-[10px] font-medium tracking-[0.3em] uppercase">{t.for_whom_label}</p>
          </div>
          <h2 className="font-display text-3xl sm:text-[2.8rem] font-bold text-foreground mb-20 max-w-md leading-[1.05] tracking-[-0.02em]">
            {t.for_whom_headline1}<br />
            <span className="text-accent italic">{t.for_whom_accent}</span>
          </h2>
          <div className="space-y-0">
            {[
              { title: t.who1_title, desc: t.who1_desc },
              { title: t.who2_title, desc: t.who2_desc },
              { title: t.who3_title, desc: t.who3_desc },
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

      {/* ── Stories ──────────────────────────────────────────────────────── */}
      <section className="border-t border-border bg-secondary/20">
        <div className="px-6 sm:px-12 py-16 max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-accent" />
            <p className="text-accent text-[10px] font-medium tracking-[0.3em] uppercase">{t.testimonials_label}</p>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-[-0.02em]">
            {t.testimonials_headline}
          </h2>
        </div>
        <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-16 gap-4 px-6 sm:px-12">
          {stories.map((story, i) => (
            <div key={i} className="snap-start flex-shrink-0 w-[75vw] sm:w-[360px] group">
              <div className="overflow-hidden h-full">
                <div className="aspect-[3/4] overflow-hidden mb-5 rounded-sm">
                  <img
                    src={story.image}
                    alt={story.names}
                    className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-base font-bold text-foreground tracking-[-0.01em]">{story.names}</h3>
                    <span className="text-[10px] text-muted-foreground/50 tracking-[0.1em] uppercase">{story.location}</span>
                  </div>
                  <p className="text-[13px] text-muted-foreground leading-[1.7]">{story.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="py-32 sm:py-44 px-6 sm:px-12 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl sm:text-[3.5rem] font-bold text-foreground leading-[0.92] tracking-[-0.03em] mb-8">
            {t.cta_line1}<br />
            <span className="text-accent italic">{t.cta_accent}</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg mb-12 max-w-md mx-auto leading-[1.7]">
            {t.cta_body}
          </p>
          <a href="/signup"
            className="gradient-warm inline-flex items-center gap-3 h-14 px-14 text-[13px] font-semibold tracking-[0.15em] uppercase text-accent-foreground hover:opacity-90 active:scale-[.98] transition-all">
            {t.cta_button} <ArrowRight className="h-4 w-4" />
          </a>
          <div className="mt-12 flex flex-col items-center gap-4">
            <p className="text-[11px] text-muted-foreground/50 tracking-[0.2em] uppercase">{t.coming_soon}</p>
            <div className="flex items-center gap-4">
              <a href="#" className="transition-opacity hover:opacity-80">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                  alt="Download on the App Store"
                  className="h-[44px]"
                />
              </a>
              <a href="#" className="transition-opacity hover:opacity-80">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                  alt="Get it on Google Play"
                  className="h-[64px]"
                />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-border px-6 sm:px-12 py-16 bg-secondary/20">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between gap-10">
          <div>
            <h4 className="font-display text-base font-bold text-foreground tracking-[0.05em] uppercase mb-2">myotherpair</h4>
            <p className="text-[11px] text-muted-foreground/60 tracking-[0.1em]">{t.footer_tagline}</p>
          </div>
          <div className="flex gap-16 text-[12px] tracking-[0.08em]">
            <ul className="space-y-3 text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors duration-500">{t.footer_privacy}</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors duration-500">{t.footer_terms}</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors duration-500">{t.footer_faq}</a></li>
            </ul>
            <ul className="space-y-3 text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors duration-500">Instagram</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors duration-500">TikTok</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors duration-500">{t.footer_contact}</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-12 pt-8 border-t border-border/50">
          <p className="text-[10px] text-muted-foreground/40 tracking-[0.1em] uppercase">{t.footer_copyright}</p>
        </div>
      </footer>

    </div>
  );
}

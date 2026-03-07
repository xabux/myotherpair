'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '../components/ThemeToggle';
import { supabase } from '../../lib/supabase';
import type { User } from '@supabase/supabase-js';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'discover' | 'matches' | 'messages' | 'listings' | 'profile';
type Foot = 'Left' | 'Right' | 'Either';
type Condition = 'new_with_tags' | 'new_without_tags' | 'excellent' | 'good' | 'fair' | 'poor';

// DB ↔ UI conversion helpers
function toDbFoot(f: Foot): string {
  if (f === 'Left')  return 'L';
  if (f === 'Right') return 'R';
  return 'single';
}
function fromDbFoot(s: string): Foot {
  if (s === 'L') return 'Left';
  if (s === 'R') return 'Right';
  return 'Either';
}

const CONDITION_LABELS: Record<Condition, string> = {
  new_with_tags:    'New (tags on)',
  new_without_tags: 'New',
  excellent:        'Excellent',
  good:             'Good',
  fair:             'Fair',
  poor:             'Poor',
};

interface Shoe {
  id: string;
  brand: string;
  model: string;
  size: string;
  foot: Foot;
  condition: Condition;
  price: string;
  user: string;
  location: string;
  color: string; // gradient for placeholder
  listingId?: string; // DB UUID when loaded from Supabase
}

interface Match {
  id: string;
  brand: string;
  model: string;
  size: string;
  foot: Foot;
  user: string;
  avatar: string;
  lastMsg: string;
  time: string;
}

interface Message {
  id: string;
  from: 'me' | 'them';
  text: string;
  time: string;
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const BG      = 'var(--app-bg)';
const SURFACE = 'var(--app-surface)';
const ACCENT  = '#e63946';
const BORDER  = 'var(--app-border)';

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'discover', label: 'Discover',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
      </svg>
    ),
  },
  {
    id: 'matches', label: 'Matches',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    id: 'messages', label: 'Messages',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    id: 'listings', label: 'Listings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    id: 'profile', label: 'Profile',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

// ─── Discover tab ─────────────────────────────────────────────────────────────

const CARD_COLORS = [
  'from-blue-600 to-blue-400', 'from-green-600 to-emerald-400', 'from-red-600 to-rose-400',
  'from-gray-600 to-slate-400', 'from-zinc-700 to-zinc-500', 'from-sky-600 to-cyan-400',
  'from-orange-600 to-amber-400', 'from-purple-600 to-violet-400',
];

// ─── Loading / error helpers ───────────────────────────────────────────────────

function DiscoverSkeleton() {
  return (
    <div className="h-full flex flex-col items-center justify-between py-4 px-4">
      <div className="w-full max-w-sm flex items-center justify-between mb-2">
        <div className="h-6 w-24 rounded-lg bg-white/[0.07] animate-pulse" />
        <div className="h-4 w-28 rounded-lg bg-white/[0.07] animate-pulse" />
      </div>
      <div className="relative w-full max-w-sm flex-1 max-h-[480px] my-2">
        <div className="absolute inset-0 rounded-3xl bg-white/[0.07] animate-pulse" />
      </div>
      <div className="flex items-center gap-4 pb-2">
        {[0, 1, 2].map(i => (
          <div key={i} className={`rounded-full bg-white/[0.07] animate-pulse ${i === 1 ? 'w-12 h-12' : 'w-14 h-14'}`} />
        ))}
      </div>
    </div>
  );
}

function CardGridSkeleton() {
  return (
    <div className="px-4 py-6">
      <div className="h-6 w-32 rounded-lg bg-white/[0.07] animate-pulse mb-5 mx-1" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="rounded-2xl overflow-hidden" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
            <div className="h-32 bg-white/[0.07] animate-pulse" />
            <div className="p-3 flex flex-col gap-2">
              <div className="h-3 w-24 rounded bg-white/[0.07] animate-pulse" />
              <div className="h-2.5 w-16 rounded bg-white/[0.07] animate-pulse" />
              <div className="h-8 w-full rounded-xl bg-white/[0.07] animate-pulse mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConversationSkeleton() {
  return (
    <div className="flex flex-col w-full lg:w-72 xl:w-80">
      <div className="px-4 py-5 border-b" style={{ borderColor: BORDER }}>
        <div className="h-6 w-24 rounded-lg bg-white/[0.07] animate-pulse" />
      </div>
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} className="flex items-center gap-3 px-4 py-3.5">
          <div className="w-10 h-10 rounded-full bg-white/[0.07] animate-pulse flex-shrink-0" />
          <div className="flex-1">
            <div className="h-3 w-24 rounded bg-white/[0.07] animate-pulse mb-2" />
            <div className="h-2.5 w-36 rounded bg-white/[0.07] animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="h-full overflow-y-auto px-4 py-6">
      <div className="h-6 w-20 rounded-lg bg-white/[0.07] animate-pulse mb-6 mx-1" />
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full bg-white/[0.07] animate-pulse mb-4" />
        <div className="h-6 w-36 rounded-lg bg-white/[0.07] animate-pulse mb-2" />
        <div className="h-4 w-28 rounded-lg bg-white/[0.07] animate-pulse" />
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[0, 1, 2].map(i => (
          <div key={i} className="rounded-2xl p-4 text-center" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
            <div className="h-7 w-8 rounded bg-white/[0.07] animate-pulse mx-auto mb-1" />
            <div className="h-3 w-12 rounded bg-white/[0.07] animate-pulse mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

function TabError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8">
      <div className="text-4xl mb-4">⚠️</div>
      <p className="text-white/50 text-sm font-dmsans mb-4">Something went wrong. Please try again.</p>
      <button onClick={onRetry}
        className="px-5 py-2.5 text-sm font-bold text-white rounded-2xl transition-all active:scale-95"
        style={{ background: ACCENT }}>
        Try again
      </button>
    </div>
  );
}

function DiscoverTab({ userId }: { userId?: string }) {
  const THRESHOLD = 80;
  const DURATION  = 350;
  const EASE      = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';

  const [deck,       setDeck]       = useState<Shoe[]>([]);
  const [head,       setHead]       = useState(0);
  const [phase,      setPhase]      = useState<'idle' | 'exiting'>('idle');
  const [exitDir,    setExitDir]    = useState<'pass' | 'match' | 'super'>('pass');
  const [drag,       setDrag]       = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos,   setStartPos]   = useState({ x: 0, y: 0 });
  const [loading,    setLoading]    = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [retryKey,   setRetryKey]   = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Load unseen listings from Supabase
  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    setFetchError(false);
    (async () => {
      try {
        // IDs the user has already swiped
        const { data: swiped } = await supabase
          .from('swipes')
          .select('listing_id')
          .eq('swiper_id', userId);
        const swipedIds = (swiped ?? []).map((s: { listing_id: string }) => s.listing_id);

        // Active listings from other users
        const query = supabase
          .from('listings')
          .select('id, shoe_brand, shoe_model, size, foot_side, condition, price, photos, user_id, users!listings_user_id_fkey(name, location)')
          .eq('status', 'active')
          .neq('user_id', userId);

        const { data, error } = swipedIds.length
          ? await query.not('id', 'in', `(${swipedIds.join(',')})`)
          : await query;

        if (error) throw error;

        const mapped: Shoe[] = (data ?? []).map((r: Record<string, unknown>, i: number) => {
          const profile = r.users as Record<string, string> | null;
          return {
            id:        r.id as string,
            listingId: r.id as string,
            brand:     r.shoe_brand as string,
            model:     r.shoe_model as string,
            size:      `US ${r.size as string}`,
            foot:      fromDbFoot(r.foot_side as string),
            condition: r.condition as Condition,
            price:     r.price ? `$${r.price}` : '$—',
            user:      profile?.name ?? 'User',
            location:  profile?.location ?? '',
            color:     CARD_COLORS[i % CARD_COLORS.length],
          };
        });
        setDeck(mapped);
        setHead(0);
      } catch {
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, retryKey]);

  const TOTAL = deck.length || 1;
  // Visible window: always 3 cards, looping
  const cards = [0, 1, 2].map(i => deck[(head + i) % TOTAL]);

  // Trigger an exit in a given direction; locks input until advance completes
  const triggerExit = useCallback((dir: 'pass' | 'match' | 'super') => {
    if (phase !== 'idle') return;
    const topCard = deck[head % TOTAL];
    setIsDragging(false);
    setDrag({ x: 0, y: 0 });
    setExitDir(dir);
    setPhase('exiting');

    // Record swipe in DB
    if (userId && topCard?.listingId) {
      (async () => {
        await supabase.from('swipes').insert({
          swiper_id:  userId,
          listing_id: topCard.listingId,
          direction:  dir,
        });

        // Check for mutual match when direction is 'match' or 'super'
        if (dir === 'match' || dir === 'super') {
          // Has the listing owner swiped match/super on any of our listings?
          const { data: myListings } = await supabase
            .from('listings').select('id').eq('user_id', userId).eq('status', 'active');
          if (myListings && myListings.length > 0) {
            const myIds = (myListings as { id: string }[]).map(l => l.id);
            const { data: reverseSwipe } = await supabase
              .from('swipes')
              .select('listing_id')
              .eq('swiper_id', topCard.listingId ?? '') // listing owner user_id
              .in('direction', ['match', 'super'])
              .in('listing_id', myIds)
              .limit(1);

            // Simpler approach: check via listing owner
            const { data: ownerListing } = await supabase
              .from('listings').select('user_id').eq('id', topCard.listingId).single();
            if (ownerListing) {
              const ownerId = (ownerListing as { user_id: string }).user_id;
              const { data: theirSwipe } = await supabase
                .from('swipes')
                .select('listing_id')
                .eq('swiper_id', ownerId)
                .in('direction', ['match', 'super'])
                .in('listing_id', myIds)
                .limit(1);
              if (theirSwipe && theirSwipe.length > 0) {
                await supabase.from('matches').insert({
                  listing_id_1: (theirSwipe[0] as { listing_id: string }).listing_id,
                  listing_id_2: topCard.listingId,
                  user_id_1:    userId,
                  user_id_2:    ownerId,
                  status:       'pending',
                });
              }
            }
            void reverseSwipe; // suppress unused warning
          }
        }
      })();
    }

    // Advance the queue after animation completes
    setTimeout(() => {
      setHead(h => (h + 1) % TOTAL);
      setPhase('idle');
    }, DURATION + 20);
  }, [phase, deck, head, TOTAL, userId]);

  const doPass  = useCallback(() => triggerExit('pass'),  [triggerExit]);
  const doMatch = useCallback(() => triggerExit('match'), [triggerExit]);
  const doSuper = useCallback(() => triggerExit('super'), [triggerExit]);

  // Keyboard shortcuts: ← pass, → match, ↑ super
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  doPass();
      if (e.key === 'ArrowRight') doMatch();
      if (e.key === 'ArrowUp')    doSuper();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [doPass, doMatch, doSuper]);

  // Pointer / drag handlers
  const onPointerDown = (e: React.PointerEvent) => {
    if (phase !== 'idle') return;
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    cardRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setDrag({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if      (drag.x >  THRESHOLD) doMatch();
    else if (drag.x < -THRESHOLD) doPass();
    else if (drag.y < -THRESHOLD) doSuper();
    else setDrag({ x: 0, y: 0 }); // spring back
  };

  // ── Top card style ───────────────────────────────────────────────────────────

  const tilt         = isDragging ? drag.x / 18 : 0;
  const matchOpacity = Math.max(0, Math.min(1,  drag.x / THRESHOLD));
  const passOpacity  = Math.max(0, Math.min(1, -drag.x / THRESHOLD));

  // Exit directions: pass→left+clockwise, match→right+counter, super→up+scale
  const EXIT_TRANSFORM: Record<string, string> = {
    pass:  'translate(-130%, 20px) rotate(20deg)',
    match: 'translate(130%,  20px) rotate(-20deg)',
    super: 'translate(0, -130%) scale(1.05)',
  };

  const topTransform = phase === 'exiting'
    ? EXIT_TRANSFORM[exitDir]
    : isDragging
      ? `translate(${drag.x}px, ${drag.y}px) rotate(${tilt}deg)`
      : 'translate(0,0) rotate(0deg)';

  // Transition: off during drag (live tracking), on for exit animation and spring-back
  const topTransition = isDragging
    ? 'none'
    : `transform ${DURATION}ms ${EASE}, opacity ${DURATION}ms ${EASE}`;

  // ── Background card style ────────────────────────────────────────────────────
  // Depth positions (i=0 is second card, i=1 is third):
  //   idle:    scale(0.95 - i*0.04)  translateY((i+1)*14px)  opacity 0.70-i*0.20
  //   exiting: scale(1.00 - i*0.04)  translateY(i*14px)      opacity 0.85-i*0.15
  // After DURATION ms the exiting positions are reached; head advances;
  // the new bg i=0 card (was bg i=1 = ended at scale(0.96), ty=14) snaps to
  // idle bg i=0 (scale(0.95), ty=14) — a 0.01 scale delta, imperceptible.
  const bgCardStyle = (i: number): React.CSSProperties => ({
    transform:  phase === 'exiting'
      ? `scale(${1     - i * 0.04}) translateY(${i       * 14}px)`
      : `scale(${0.95  - i * 0.04}) translateY(${(i + 1) * 14}px)`,
    opacity:    phase === 'exiting' ? 0.85 - i * 0.15 : 0.70 - i * 0.20,
    transition: phase === 'exiting'
      ? `transform ${DURATION}ms ${EASE}, opacity ${DURATION}ms ${EASE}`
      : 'none',
    zIndex:     10 - i,
    border:     `1px solid ${BORDER}`,
    background: SURFACE,
  });

  if (loading) return <DiscoverSkeleton />;
  if (fetchError) return <TabError onRetry={() => { setFetchError(false); setRetryKey(k => k + 1); }} />;
  if (deck.length === 0) return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8">
      <div className="text-5xl mb-4">👟</div>
      <p className="text-white/50 text-sm font-dmsans">No new shoes to discover.</p>
      <p className="text-white/25 text-xs mt-2 font-dmsans">Check back soon!</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col items-center justify-between py-4 px-4 overflow-hidden">
      {/* Header */}
      <div className="w-full max-w-sm flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-white font-syne">Discover</h2>
        <span className="text-xs text-white/30 font-dmsans">← pass · match →</span>
      </div>

      {/* Card stack */}
      <div className="relative w-full max-w-sm flex-1 max-h-[480px] my-2 touch-none">

        {/* Background cards — key=card.id so React reuses DOM elements across advances */}
        {cards.slice(1).map((card, i) => (
          <div
            key={card.id}
            className="absolute inset-0 rounded-3xl"
            style={bgCardStyle(i)}
          />
        ))}

        {/* Top card — key=head forces a fresh mount on each advance, preventing
            the exited card from fading back in as the new card */}
        <div
          key={head}
          ref={cardRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="absolute inset-0 rounded-3xl overflow-hidden select-none touch-none"
          style={{
            border:                `1px solid ${BORDER}`,
            background:            SURFACE,
            transform:             topTransform,
            opacity:               phase === 'exiting' ? 0 : 1,
            transition:            topTransition,
            zIndex:                20,
            cursor:                isDragging ? 'grabbing' : 'grab',
            WebkitTouchCallout:    'none',
            touchAction:           'none',
          }}
        >
          {/* Shoe image placeholder */}
          <div className={`h-64 bg-gradient-to-br ${cards[0].color} relative flex items-end p-5`}>
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <span className="text-[120px]">👟</span>
            </div>

            {/* MATCH stamp — fades in proportional to rightward drag */}
            <div className="absolute top-6 left-6 rotate-[-20deg]"
              style={{ opacity: matchOpacity, transition: 'opacity 40ms linear' }}>
              <span className="text-3xl font-black tracking-wider text-green-400 border-4 border-green-400 px-4 py-1 rounded-xl uppercase">Match!</span>
            </div>
            {/* PASS stamp — fades in proportional to leftward drag */}
            <div className="absolute top-6 right-6 rotate-[20deg]"
              style={{ opacity: passOpacity, transition: 'opacity 40ms linear' }}>
              <span className="text-3xl font-black tracking-wider text-red-400 border-4 border-red-400 px-4 py-1 rounded-xl uppercase">Pass</span>
            </div>

            {/* Foot badge */}
            <span className="relative z-10 text-xs font-bold text-white bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
              {cards[0].foot} foot
            </span>
          </div>

          {/* Card info */}
          <div className="p-5 flex flex-col gap-3">
            <div>
              <h3 className="text-xl font-bold text-white font-syne leading-tight">{cards[0].brand} {cards[0].model}</h3>
              <p className="text-sm text-white/50 font-dmsans mt-0.5">{cards[0].size} · {CONDITION_LABELS[cards[0].condition]}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                  {cards[0].user[0]}
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/70 font-dmsans">{cards[0].user}</p>
                  <p className="text-[10px] text-white/30">{cards[0].location}</p>
                </div>
              </div>
              <span className="text-lg font-extrabold text-white font-syne">{cards[0].price}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-4 pb-2">
        <button onClick={doPass}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90 border"
          style={{ background: SURFACE, borderColor: BORDER }}
          aria-label="Pass">
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <button onClick={doSuper}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 border"
          style={{ background: SURFACE, borderColor: BORDER }}
          aria-label="Super like">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
        <button onClick={doMatch}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg"
          style={{ background: ACCENT }}
          aria-label="Match">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Matches tab ──────────────────────────────────────────────────────────────

function MatchesTab({ onMessage, userId }: { onMessage: (id: string) => void; userId?: string }) {
  const [matches,    setMatches]    = useState<Match[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [retryKey,   setRetryKey]   = useState(0);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    setFetchError(false);
    (async () => {
      try {
        const { data, error } = await supabase
          .from('matches')
          .select(`
            id, status, created_at,
            listing1:listing_id_1(shoe_brand, shoe_model, size, foot_side),
            listing2:listing_id_2(shoe_brand, shoe_model, size, foot_side),
            profile1:user_id_1(name, avatar_url),
            profile2:user_id_2(name, avatar_url)
          `)
          .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const mapped: Match[] = (data ?? []).map((r: Record<string, unknown>) => {
          const isUser1      = r.user_id_1 === userId;
          const myListing    = isUser1 ? r.listing1 : r.listing2;
          const theirProfile = isUser1 ? r.profile2 : r.profile1;
          const ml = myListing    as Record<string, unknown> | null;
          const tp = theirProfile as Record<string, string>  | null;
          return {
            id:      r.id as string,
            brand:   (ml?.shoe_brand as string) ?? '',
            model:   (ml?.shoe_model as string) ?? '',
            size:    `US ${ml?.size ?? ''}`,
            foot:    fromDbFoot((ml?.foot_side as string) ?? ''),
            user:    tp?.name ?? 'User',
            avatar:  tp?.name?.slice(0, 2).toUpperCase() ?? '??',
            lastMsg: '',
            time:    new Date(r.created_at as string).toLocaleDateString([], { month: 'short', day: 'numeric' }),
          };
        });
        setMatches(mapped);
      } catch {
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, retryKey]);

  if (loading) return <CardGridSkeleton />;
  if (fetchError) return <TabError onRetry={() => { setFetchError(false); setRetryKey(k => k + 1); }} />;

  return (
    <div className="h-full overflow-y-auto px-4 py-6">
      <h2 className="text-lg font-bold text-white font-syne mb-5 px-1">Your matches</h2>
      {matches.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">💝</div>
          <p className="text-white/40 text-sm font-dmsans">No matches yet. Keep swiping!</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {matches.map(m => (
          <div key={m.id} className="rounded-2xl overflow-hidden flex flex-col"
            style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
            {/* Image placeholder */}
            <div className="h-32 flex items-center justify-center bg-gradient-to-br from-white/5 to-white/[0.02] relative">
              <span className="text-5xl opacity-40">👟</span>
              <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                m.foot === 'Left' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'
              }`}>{m.foot}</span>
            </div>
            {/* Info */}
            <div className="p-3 flex flex-col gap-2 flex-1">
              <div>
                <p className="text-xs font-bold text-white font-dmsans leading-tight">{m.brand} {m.model}</p>
                <p className="text-[10px] text-white/40">{m.size}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                  style={{ background: ACCENT }}>{m.avatar}</div>
                <span className="text-[10px] text-white/50 font-dmsans truncate">{m.user}</span>
              </div>
              <button onClick={() => onMessage(m.id)}
                className="mt-auto w-full py-2 rounded-xl text-[11px] font-bold text-white transition-all active:scale-95"
                style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}40` }}>
                Message
              </button>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}

// ─── Messages tab ─────────────────────────────────────────────────────────────

function MessagesTab({ initialId, userId }: { initialId?: string; userId?: string }) {
  const [activeId, setActiveId] = useState<string | null>(initialId ?? null);
  const [newMsg, setNewMsg] = useState('');
  const [localMessages, setLocalMessages] = useState<Record<string, Message[]>>({});
  const [dbMatches, setDbMatches] = useState<Match[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialId) setActiveId(initialId);
  }, [initialId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeId, localMessages]);

  // Load match list with latest message previews
  useEffect(() => {
    if (!userId) { setMatchesLoading(false); return; }
    setMatchesLoading(true);
    (async () => {
      try {
        const { data } = await supabase
          .from('matches')
          .select(`id, created_at, user_id_1, user_id_2, profile1:user_id_1(name, avatar_url), profile2:user_id_2(name, avatar_url), messages(content, created_at)`)
          .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
          .order('created_at', { ascending: false });

        const mapped: Match[] = (data ?? []).map((r: Record<string, unknown>) => {
          const isUser1 = r.user_id_1 === userId;
          const tp      = (isUser1 ? r.profile2 : r.profile1) as Record<string, string> | null;
          const msgs    = (r.messages as { content: string; created_at: string }[] | null) ?? [];
          const latest  = msgs.sort((a, b) => a.created_at > b.created_at ? -1 : 1)[0];
          return {
            id:      r.id as string,
            brand:   '', model:  '', size: '', foot: 'Left' as Foot,
            user:    tp?.name ?? 'User',
            avatar:  tp?.name?.slice(0, 2).toUpperCase() ?? '??',
            lastMsg: latest?.content ?? '',
            time:    new Date(r.created_at as string).toLocaleDateString([], { month: 'short', day: 'numeric' }),
          };
        });
        setDbMatches(mapped);
      } finally {
        setMatchesLoading(false);
      }
    })();
  }, [userId]);

  // Load messages for active conversation
  useEffect(() => {
    if (!activeId || !userId) return;
    (async () => {
      const { data } = await supabase
        .from('messages')
        .select('id, sender_id, content, created_at')
        .eq('match_id', activeId)
        .order('created_at', { ascending: true });

      if (data && data.length > 0) {
        const msgs: Message[] = (data as { id: string; sender_id: string; content: string; created_at: string }[]).map(m => ({
          id:   m.id,
          from: m.sender_id === userId ? 'me' : 'them',
          text: m.content,
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));
        setLocalMessages(prev => ({ ...prev, [activeId]: msgs }));
      }
    })();
  }, [activeId, userId]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!activeId || !userId) return;
    const channel = supabase
      .channel(`messages:${activeId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `match_id=eq.${activeId}`,
      }, payload => {
        const m = payload.new as { id: string; sender_id: string; content: string; created_at: string };
        const newMessage: Message = {
          id:   m.id,
          from: m.sender_id === userId ? 'me' : 'them',
          text: m.content,
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setLocalMessages(prev => ({
          ...prev,
          [activeId]: [...(prev[activeId] ?? []), newMessage],
        }));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeId, userId]);

  const sendMessage = async () => {
    if (!newMsg.trim() || !activeId || !userId) return;
    const text = newMsg.trim();
    setNewMsg('');
    // Optimistic update
    const optimistic: Message = {
      id:   `opt-${Date.now()}`,
      from: 'me',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setLocalMessages(prev => ({ ...prev, [activeId]: [...(prev[activeId] ?? []), optimistic] }));
    // Persist to DB
    await supabase.from('messages').insert({ match_id: activeId, sender_id: userId, content: text });
  };

  const displayMatches = dbMatches;

  const activeMatch = displayMatches.find(m => m.id === activeId);
  const messages    = activeId ? (localMessages[activeId] ?? []) : [];

  return (
    <div className="h-full flex overflow-hidden">
      {/* Conversation list */}
      <div className={`flex-shrink-0 flex flex-col ${activeId ? 'hidden lg:flex' : 'flex'} w-full lg:w-72 xl:w-80 border-r overflow-y-auto`}
        style={{ borderColor: BORDER }}>
        {matchesLoading ? <ConversationSkeleton /> : (
          <>
            <div className="px-4 py-5 border-b" style={{ borderColor: BORDER }}>
              <h2 className="text-lg font-bold text-white font-syne">Messages</h2>
            </div>
            {displayMatches.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 text-center p-8">
                <div className="text-4xl mb-3">💬</div>
                <p className="text-white/40 text-sm font-dmsans">No conversations yet.</p>
              </div>
            ) : displayMatches.map(m => (
              <button key={m.id} onClick={() => setActiveId(m.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors text-left"
                style={{ background: activeId === m.id ? `${ACCENT}15` : 'transparent' }}>
                <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: ACCENT }}>
                  {m.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white font-dmsans truncate">{m.user}</p>
                    <span className="text-[10px] text-white/30 flex-shrink-0">{m.time}</span>
                  </div>
                  <p className="text-xs text-white/40 truncate">{m.lastMsg}</p>
                </div>
              </button>
            ))}
          </>
        )}
      </div>

      {/* Chat view */}
      {activeId && activeMatch ? (
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-4 border-b flex-shrink-0"
            style={{ borderColor: BORDER }}>
            <button onClick={() => setActiveId(null)}
              className="lg:hidden text-white/50 hover:text-white transition-colors mr-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ background: ACCENT }}>
              {activeMatch.avatar}
            </div>
            <div>
              <p className="text-sm font-bold text-white font-dmsans">{activeMatch.user}</p>
              <p className="text-[11px] text-white/35">{activeMatch.brand} {activeMatch.model} · {activeMatch.size}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[75%] rounded-2xl px-4 py-2.5"
                  style={{
                    background: msg.from === 'me' ? ACCENT : SURFACE,
                    border:     msg.from === 'me' ? 'none' : `1px solid ${BORDER}`,
                  }}>
                  <p className="text-sm text-white font-dmsans leading-relaxed">{msg.text}</p>
                  <p className="text-[10px] text-white/40 mt-1 text-right">{msg.time}</p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t flex items-center gap-3 flex-shrink-0"
            style={{ borderColor: BORDER, background: BG }}>
            <input
              type="text"
              value={newMsg}
              onChange={e => setNewMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Send a message…"
              className="flex-1 bg-white/5 border text-sm text-white placeholder-white/25 px-4 py-3 rounded-2xl outline-none transition-colors font-dmsans"
              style={{ borderColor: BORDER }}
              onFocus={e => e.target.style.borderColor = ACCENT}
              onBlur={e => e.target.style.borderColor = BORDER}
            />
            <button onClick={sendMessage} disabled={!newMsg.trim()}
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90 disabled:opacity-40"
              style={{ background: ACCENT }}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center flex-col gap-3 text-center">
          <div className="text-5xl mb-2">💬</div>
          <p className="text-white/50 text-sm font-dmsans">Select a conversation</p>
        </div>
      )}
    </div>
  );
}

// ─── Listings tab ─────────────────────────────────────────────────────────────

const CONDITIONS: Condition[] = ['new_with_tags', 'new_without_tags', 'excellent', 'good', 'fair', 'poor'];
const FEET: Foot[] = ['Left', 'Right', 'Either'];
const BRANDS = ['Nike', 'Adidas', 'Jordan', 'New Balance', 'Vans', 'Converse', 'Timberland', 'Puma', 'Reebok', 'Other'];

function ListingsTab({ userId }: { userId?: string }) {
  const [myListings, setMyListings] = useState<Shoe[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    brand: '', model: '', size: '', foot: 'Left' as Foot, condition: 'good' as Condition, price: '',
  });
  const [listingPhoto, setListingPhoto] = useState<File | null>(null);
  const [listingPhotoUrl, setListingPhotoUrl] = useState<string | null>(null);
  const listingPhotoRef = useRef<HTMLInputElement>(null);

  // Load current user's listings
  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    (async () => {
      try {
        const { data } = await supabase
          .from('listings')
          .select('id, shoe_brand, shoe_model, size, foot_side, condition, price, photos')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        const mapped: Shoe[] = (data ?? []).map((r: Record<string, unknown>, i: number) => ({
          id:        r.id as string,
          listingId: r.id as string,
          brand:     r.shoe_brand as string,
          model:     r.shoe_model as string,
          size:      `US ${r.size}`,
          foot:      ((r.foot_side as string) === 'left' ? 'Left' : 'Right') as Foot,
          condition: r.condition as Condition,
          price:     r.price ? `$${r.price}` : '$—',
          user:      'Me',
          location:  '',
          color:     CARD_COLORS[i % CARD_COLORS.length],
        }));
        setMyListings(mapped);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const addListing = async () => {
    if (!form.brand || !form.model || !form.size) return;

    let imageUrls: string[] = [];

    if (userId && listingPhoto) {
      const ext  = listingPhoto.name.split('.').pop() ?? 'jpg';
      const path = `${userId}/${Date.now()}.${ext}`;
      const { data: stored } = await supabase.storage
        .from('shoe-images')
        .upload(path, listingPhoto, { upsert: true });
      if (stored) {
        const { data: { publicUrl } } = supabase.storage.from('shoe-images').getPublicUrl(path);
        imageUrls = [publicUrl];
      }
    }

    if (userId) {
      const { data: inserted } = await supabase.from('listings').insert({
        user_id:   userId,
        shoe_brand: form.brand,
        shoe_model: form.model,
        size:       parseFloat(form.size),
        foot_side:  toDbFoot(form.foot),
        condition:  form.condition,
        price:      parseFloat(form.price || '0'),
        photos:     imageUrls,
        status:     'active',
      }).select('id').single();

      if (inserted) {
        const next: Shoe = {
          id:        (inserted as { id: string }).id,
          listingId: (inserted as { id: string }).id,
          brand:     form.brand,
          model:     form.model,
          size:      `US ${form.size}`,
          foot:      form.foot,
          condition: form.condition,
          price:     `$${form.price || '0'}`,
          user:      'Me',
          location:  '',
          color:     CARD_COLORS[myListings.length % CARD_COLORS.length],
        };
        setMyListings(l => [next, ...l]);
      }
    } else {
      // Fallback (no session) — local only
      const next: Shoe = {
        id: String(Date.now()), brand: form.brand, model: form.model, size: `US ${form.size}`,
        foot: form.foot, condition: form.condition, price: `$${form.price || '0'}`,
        user: 'Me', location: '', color: 'from-white/10 to-white/5',
      };
      setMyListings(l => [next, ...l]);
    }

    setForm({ brand: '', model: '', size: '', foot: 'Left', condition: 'good', price: '' });
    setListingPhoto(null);
    setListingPhotoUrl(null);
    if (listingPhotoRef.current) listingPhotoRef.current.value = '';
    setAdding(false);
  };

  const inputCls = `w-full bg-white/5 border text-sm text-white placeholder-white/25 px-4 py-3 rounded-2xl outline-none transition-colors font-dmsans`;

  return (
    <div className="h-full overflow-y-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5 px-1">
        <h2 className="text-lg font-bold text-white font-syne">My Listings</h2>
        <button onClick={() => setAdding(v => !v)}
          className="flex items-center gap-2 text-sm font-bold text-white px-4 py-2 rounded-2xl transition-all active:scale-95"
          style={{ background: adding ? SURFACE : ACCENT, border: adding ? `1px solid ${BORDER}` : 'none' }}>
          {adding ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              New listing
            </>
          )}
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="rounded-3xl p-5 mb-5 flex flex-col gap-4"
          style={{ background: SURFACE, border: `1px solid ${BORDER}`, animation: 'step-enter-right 0.25s ease-out' }}>
          <h3 className="text-sm font-bold text-white font-syne">Add a new listing</h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-white/40 mb-1.5 font-dmsans">Brand</label>
              <select value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                className={inputCls + ' appearance-none'} style={{ borderColor: BORDER }}>
                <option value="" className="bg-zinc-900">Select…</option>
                {BRANDS.map(b => <option key={b} value={b} className="bg-zinc-900">{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-white/40 mb-1.5 font-dmsans">Model</label>
              <input type="text" value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                placeholder="Air Force 1" className={inputCls} style={{ borderColor: BORDER }} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-white/40 mb-1.5 font-dmsans">US Size</label>
              <input type="number" step="0.5" min="4" max="16" value={form.size}
                onChange={e => setForm(f => ({ ...f, size: e.target.value }))}
                placeholder="9.5" className={inputCls} style={{ borderColor: BORDER }} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-white/40 mb-1.5 font-dmsans">Foot</label>
              <select value={form.foot} onChange={e => setForm(f => ({ ...f, foot: e.target.value as Foot }))}
                className={inputCls + ' appearance-none'} style={{ borderColor: BORDER }}>
                {FEET.map(f => <option key={f} value={f} className="bg-zinc-900">{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-white/40 mb-1.5 font-dmsans">Price $</label>
              <input type="number" min="0" value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="45" className={inputCls} style={{ borderColor: BORDER }} />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-white/40 mb-2 font-dmsans">Condition</label>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map(c => (
                <button key={c} type="button" onClick={() => setForm(f => ({ ...f, condition: c }))}
                  className="px-3 py-1.5 text-xs font-semibold rounded-full border transition-all font-dmsans"
                  style={{
                    background:   form.condition === c ? ACCENT : 'rgba(255,255,255,0.04)',
                    borderColor:  form.condition === c ? ACCENT : BORDER,
                    color:        form.condition === c ? '#fff' : 'rgba(255,255,255,0.5)',
                  }}>
                  {CONDITION_LABELS[c]}
                </button>
              ))}
            </div>
          </div>

          {/* Photo upload */}
          <div>
            <label className="block text-[11px] font-semibold text-white/40 mb-1.5 font-dmsans">Photo (optional)</label>
            <input ref={listingPhotoRef} type="file" accept="image/*"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (!f) return;
                if (listingPhotoUrl) URL.revokeObjectURL(listingPhotoUrl);
                setListingPhoto(f);
                setListingPhotoUrl(URL.createObjectURL(f));
              }}
            />
            <button type="button"
              onClick={() => listingPhotoRef.current?.click()}
              className="w-full py-2.5 text-xs font-semibold rounded-2xl border transition-all font-dmsans flex items-center justify-center gap-2"
              style={{ borderColor: BORDER, color: 'var(--app-text-muted)', background: 'transparent' }}>
              {listingPhotoUrl ? (
                <><img src={listingPhotoUrl} className="w-5 h-5 rounded object-cover" alt="" /> Change photo</>
              ) : (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> Add photo</>
              )}
            </button>
          </div>

          <button onClick={addListing} disabled={!form.brand || !form.model || !form.size}
            className="w-full py-3.5 text-sm font-bold text-white rounded-2xl transition-all active:scale-[.97] disabled:opacity-40"
            style={{ background: ACCENT }}>
            List shoe
          </button>
        </div>
      )}

      {/* Listings grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl overflow-hidden" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
              <div className="h-28 bg-white/[0.07] animate-pulse" />
              <div className="p-3 flex flex-col gap-2">
                <div className="h-3 w-24 rounded bg-white/[0.07] animate-pulse" />
                <div className="h-2.5 w-16 rounded bg-white/[0.07] animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {myListings.map(listing => (
          <div key={listing.id} className="rounded-2xl overflow-hidden flex flex-col"
            style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
            <div className={`h-28 bg-gradient-to-br ${listing.color} flex items-center justify-center relative`}>
              <span className="text-4xl opacity-30">👟</span>
              <span className="absolute top-2 right-2 text-[10px] font-bold text-white/60 bg-black/30 px-2 py-0.5 rounded-full">
                {CONDITION_LABELS[listing.condition]}
              </span>
            </div>
            <div className="p-3">
              <p className="text-xs font-bold text-white font-dmsans">{listing.brand} {listing.model}</p>
              <p className="text-[10px] text-white/40 mb-2">{listing.size} · {listing.foot}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-white font-syne">{listing.price}</span>
                <button className="text-[10px] text-red-400/70 hover:text-red-400 transition-colors font-dmsans"
                  onClick={async () => {
                    if (listing.listingId) {
                      await supabase.from('listings').update({ status: 'sold' }).eq('id', listing.listingId);
                    }
                    setMyListings(l => l.filter(x => x.id !== listing.id));
                  }}>
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {myListings.length === 0 && !adding && !loading && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-white/40 text-sm font-dmsans">No listings yet. Add your first shoe!</p>
        </div>
      )}
    </div>
  );
}

// ─── Profile tab ──────────────────────────────────────────────────────────────

interface ProfileData {
  name?: string; email?: string;
  avatar_url?: string; location?: string;
  foot_size_left?: number; foot_size_right?: number;
  is_amputee?: boolean; created_at?: string;
}

function ProfileTab({ userId }: { userId?: string }) {
  const router  = useRouter();
  const [profile,  setProfile]  = useState<ProfileData>({});
  const [loading,  setLoading]  = useState(true);
  const [stats,    setStats]    = useState({ listings: '—', matches: '—', trades: '—' });
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [saveErr,  setSaveErr]  = useState('');
  const [editForm, setEditForm] = useState({
    name: '', location: '', leftSize: '', rightSize: '', isAmputee: false,
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarRef = useRef<HTMLInputElement>(null);

  const loadProfile = async (uid: string) => {
    const [profileRes, listingsRes, matchesRes, tradesRes] = await Promise.all([
      supabase.from('users').select('*').eq('id', uid).single(),
      supabase.from('listings').select('id', { count: 'exact', head: true }).eq('user_id', uid).eq('status', 'active'),
      supabase.from('matches').select('id', { count: 'exact', head: true }).or(`user_id_1.eq.${uid},user_id_2.eq.${uid}`),
      supabase.from('matches').select('id', { count: 'exact', head: true }).or(`user_id_1.eq.${uid},user_id_2.eq.${uid}`).eq('status', 'completed'),
    ]);
    if (profileRes.data) setProfile(profileRes.data as ProfileData);
    setStats({
      listings: String(listingsRes.count ?? 0),
      matches:  String(matchesRes.count  ?? 0),
      trades:   String(tradesRes.count   ?? 0),
    });
  };

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    loadProfile(userId).finally(() => setLoading(false));
  }, [userId]);

  function openEdit() {
    setEditForm({
      name:       profile.name       ?? '',
      location:   profile.location   ?? '',
      leftSize:   profile.foot_size_left  != null ? String(profile.foot_size_left)  : '',
      rightSize:  profile.foot_size_right != null ? String(profile.foot_size_right) : '',
      isAmputee:  profile.is_amputee ?? false,
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    setSaveErr('');
    setEditing(true);
  }

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    setSaveErr('');
    try {
      let avatar_url = profile.avatar_url;
      if (avatarFile) {
        const ext  = avatarFile.name.split('.').pop() ?? 'jpg';
        const path = `${userId}/avatar.${ext}`;
        const { data: stored } = await supabase.storage
          .from('avatars').upload(path, avatarFile, { upsert: true });
        if (stored) {
          const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
          avatar_url = publicUrl;
        }
      }
      const { error } = await supabase.from('users').update({
        name:            editForm.name.trim() || null,
        location:        editForm.location.trim() || null,
        foot_size_left:  editForm.leftSize  ? parseFloat(editForm.leftSize)  : null,
        foot_size_right: editForm.rightSize ? parseFloat(editForm.rightSize) : null,
        is_amputee:      editForm.isAmputee,
        avatar_url,
      }).eq('id', userId);
      if (error) throw error;
      await loadProfile(userId);
      setEditing(false);
    } catch (e: unknown) {
      setSaveErr(e instanceof Error ? e.message : 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/');
  }

  const name      = profile.name || '';
  const initials  = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  const email     = profile.email || '';
  const location  = profile.location || '';
  const leftSize  = profile.foot_size_left  ? `US ${profile.foot_size_left}`  : null;
  const rightSize = profile.foot_size_right ? `US ${profile.foot_size_right}` : null;
  const since     = profile.created_at ? new Date(profile.created_at).getFullYear() : null;

  const inputCls = `w-full bg-white/5 border text-sm text-white placeholder-white/25 px-4 py-3 rounded-2xl outline-none transition-colors font-dmsans`;

  if (loading) return <ProfileSkeleton />;

  return (
    <div className="h-full overflow-y-auto px-4 py-6">
      <h2 className="text-lg font-bold text-white font-syne mb-6 px-1">Profile</h2>

      {/* Avatar + name */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-extrabold text-white mb-4 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #e63946, #ff6b6b)' }}>
          {(avatarPreview || profile.avatar_url)
            ? <img src={avatarPreview ?? profile.avatar_url!} alt={name} className="w-full h-full object-cover" />
            : initials}
        </div>
        <h3 className="text-2xl font-extrabold text-white font-syne">{name || 'No name set'}</h3>
        {email && <p className="text-sm text-white/40 font-dmsans">{email}</p>}
        <p className="text-xs text-white/25 mt-1 font-dmsans">
          {[location, since ? `Member since ${since}` : null].filter(Boolean).join(' · ')}
        </p>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="rounded-3xl p-5 mb-4 flex flex-col gap-4"
          style={{ background: SURFACE, border: `1px solid ${BORDER}`, animation: 'step-enter-right 0.25s ease-out' }}>
          <h3 className="text-sm font-bold text-white font-syne">Edit profile</h3>

          {/* Avatar upload */}
          <div>
            <label className="block text-[11px] font-semibold text-white/40 mb-1.5 font-dmsans">Profile photo</label>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (!f) return;
                if (avatarPreview) URL.revokeObjectURL(avatarPreview);
                setAvatarFile(f);
                setAvatarPreview(URL.createObjectURL(f));
              }}
            />
            <button type="button" onClick={() => avatarRef.current?.click()}
              className="flex items-center gap-3 text-xs font-semibold rounded-2xl border px-4 py-2.5 transition-all font-dmsans"
              style={{ borderColor: BORDER, color: 'rgba(255,255,255,0.5)', background: 'transparent' }}>
              {avatarPreview
                ? <><img src={avatarPreview} className="w-6 h-6 rounded-full object-cover" alt="" /> Change photo</>
                : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> Upload photo</>
              }
            </button>
          </div>

          {/* Name */}
          <div>
            <label className="block text-[11px] font-semibold text-white/40 mb-1.5 font-dmsans">Full name</label>
            <input type="text" value={editForm.name}
              onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Your name" className={inputCls} style={{ borderColor: BORDER }} />
          </div>

          {/* Location */}
          <div>
            <label className="block text-[11px] font-semibold text-white/40 mb-1.5 font-dmsans">Location</label>
            <input type="text" value={editForm.location}
              onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))}
              placeholder="City, State" className={inputCls} style={{ borderColor: BORDER }} />
          </div>

          {/* Foot sizes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-white/40 mb-1.5 font-dmsans">Left foot (US)</label>
              <input type="number" step="0.5" min="4" max="16" value={editForm.leftSize}
                onChange={e => setEditForm(f => ({ ...f, leftSize: e.target.value }))}
                placeholder="9.5" className={inputCls} style={{ borderColor: BORDER }} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-white/40 mb-1.5 font-dmsans">Right foot (US)</label>
              <input type="number" step="0.5" min="4" max="16" value={editForm.rightSize}
                onChange={e => setEditForm(f => ({ ...f, rightSize: e.target.value }))}
                placeholder="9.5" className={inputCls} style={{ borderColor: BORDER }} />
            </div>
          </div>

          {/* Amputee toggle */}
          <button type="button"
            onClick={() => setEditForm(f => ({ ...f, isAmputee: !f.isAmputee }))}
            className="flex items-center gap-3 text-sm font-dmsans text-white/70 text-left">
            <div className={`w-10 h-6 rounded-full flex-shrink-0 flex items-center px-0.5 transition-colors ${editForm.isAmputee ? '' : 'bg-white/10'}`}
              style={editForm.isAmputee ? { background: ACCENT } : {}}>
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${editForm.isAmputee ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
            I am an amputee / missing limb
          </button>

          {saveErr && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2.5">{saveErr}</p>
          )}

          <div className="flex gap-3">
            <button onClick={() => setEditing(false)}
              className="flex-1 py-3 text-sm font-bold text-white/60 rounded-2xl border transition-all"
              style={{ background: 'transparent', borderColor: BORDER }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-3 text-sm font-bold text-white rounded-2xl transition-all active:scale-[.97] disabled:opacity-50"
              style={{ background: ACCENT }}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      )}

      {/* Size badges */}
      <div className="rounded-3xl p-5 mb-4"
        style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
        <p className="text-xs font-bold text-white/50 mb-4 font-dmsans uppercase tracking-wider">My shoe sizes</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] text-white/35 font-dmsans mb-2">Left foot</p>
            <div className="flex flex-wrap gap-1.5">
              {leftSize ? (
                <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold font-dmsans"
                  style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}40` }}>{leftSize}</span>
              ) : (
                <span className="text-[11px] text-white/25 font-dmsans">Not set</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-[11px] text-white/35 font-dmsans mb-2">Right foot</p>
            <div className="flex flex-wrap gap-1.5">
              {rightSize ? (
                <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold font-dmsans"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: `1px solid ${BORDER}` }}>{rightSize}</span>
              ) : (
                <span className="text-[11px] text-white/25 font-dmsans">Not set</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Listings', value: stats.listings },
          { label: 'Matches',  value: stats.matches  },
          { label: 'Trades',   value: stats.trades   },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 text-center"
            style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
            <p className="text-2xl font-extrabold text-white font-syne">{s.value}</p>
            <p className="text-[11px] text-white/40 font-dmsans mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <button onClick={editing ? () => setEditing(false) : openEdit}
          className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-semibold text-white/70 hover:text-white transition-all font-dmsans"
          style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          {editing ? 'Cancel editing' : 'Edit profile'}
        </button>
        <button onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-semibold transition-all font-dmsans"
          style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}30` }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </div>
  );
}

// ─── Main app shell ───────────────────────────────────────────────────────────

export default function AppPage() {
  const router  = useRouter();
  const [tab,   setTab]   = useState<Tab>('discover');
  const [msgId, setMsgId] = useState<string | undefined>(undefined);
  const [user,  setUser]  = useState<User | null>(null);
  const [userEmail,    setUserEmail]    = useState('');
  const [userInitials, setUserInitials] = useState('A');
  const [sessionChecked, setSessionChecked] = useState(false);

  // Session guard + auth state listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login?redirect=%2Fapp');
      } else {
        setUser(session.user);
        setUserEmail(session.user.email ?? '');
      }
      setSessionChecked(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        if (event === 'SIGNED_OUT') {
          router.replace('/');
        } else {
          router.replace('/login?redirect=%2Fapp');
        }
      } else {
        setUser(session.user);
        setUserEmail(session.user.email ?? '');
      }
    });
    return () => subscription.unsubscribe();
  }, [router]);

  // Load profile initials for sidebar chip
  useEffect(() => {
    if (!user?.id) return;
    supabase.from('users').select('name').eq('id', user.id).single()
      .then(({ data }) => {
        if (data) {
          const d = data as { name?: string };
          const i = (d.name ?? '').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
          if (i) setUserInitials(i);
        }
      });
  }, [user?.id]);

  const goToMessage = (id: string) => {
    setMsgId(id);
    setTab('messages');
  };

  // Don't render until session is confirmed (avoids flash before redirect)
  if (!sessionChecked) return null;

  const userId = user?.id;

  return (
    <div className="flex h-screen overflow-hidden font-dmsans" style={{ background: BG, color: 'var(--app-text)' }}>

      {/* ═══ Desktop sidebar ═══════════════════════════════════════════════════ */}
      <aside className="hidden lg:flex flex-col w-60 xl:w-64 flex-shrink-0 border-r"
        style={{ background: SURFACE, borderColor: BORDER }}>
        {/* Logo */}
        <div className="px-6 py-6 border-b" style={{ borderColor: BORDER }}>
          <a href="/" className="text-xl font-extrabold tracking-tight font-syne">
            <span className="text-white">myother</span>
            <span style={{ color: ACCENT }}>pair</span>
          </a>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all text-left"
              style={{
                background: tab === item.id ? `${ACCENT}20` : 'transparent',
                color:      tab === item.id ? ACCENT : 'var(--app-text-muted)',
              }}>
              <span style={{ color: tab === item.id ? ACCENT : 'var(--app-text-faint)' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Theme toggle */}
        <div className="px-4 pb-2 flex justify-end">
          <ThemeToggle />
        </div>

        {/* User chip */}
        <div className="px-4 py-4 border-t" style={{ borderColor: BORDER }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: ACCENT }}>{userInitials}</div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{userInitials}</p>
              <p className="text-[10px] text-white/30 truncate">{userEmail}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ═══ Main content ═══════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Tab content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {tab === 'discover'  && <DiscoverTab userId={userId} />}
          {tab === 'matches'   && <MatchesTab  onMessage={goToMessage} userId={userId} />}
          {tab === 'messages'  && <MessagesTab initialId={msgId} userId={userId} />}
          {tab === 'listings'  && <ListingsTab userId={userId} />}
          {tab === 'profile'   && <ProfileTab  userId={userId} />}
        </div>

        {/* ═══ Mobile bottom nav ═════════════════════════════════════════════ */}
        <nav className="lg:hidden flex-shrink-0 flex items-center border-t"
          style={{ background: SURFACE, borderColor: BORDER, paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              className="flex-1 flex flex-col items-center gap-1 py-3 transition-colors"
              style={{ color: tab === item.id ? ACCENT : 'rgba(128,128,140,0.7)' }}>
              <span>{item.icon}</span>
              <span className="text-[9px] font-semibold">{item.label}</span>
            </button>
          ))}
          <div className="flex-shrink-0 flex items-center justify-center px-2">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </div>
  );
}

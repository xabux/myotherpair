'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const SHOE_EMOJIS = ['👟', '🥿', '👠', '👞', '🥾'];

const CARDS = [
  { emoji: '👟', brand: 'Nike',         model: 'Air Max 90',   size: 'US 9',  condition: 'Like New',  foot: 'Right', dist: '2 mi',
    bg: 'linear-gradient(155deg, #1c1030 0%, #2b1245 55%, #170d22 100%)', accent: '#c026d3' },
  { emoji: '🥾', brand: 'Timberland',   model: '6" Boot',      size: 'US 10', condition: 'Good',      foot: 'Left',  dist: '4 mi',
    bg: 'linear-gradient(155deg, #0c1e12 0%, #13281a 55%, #091510 100%)', accent: '#16a34a' },
  { emoji: '👞', brand: 'Clarks',       model: 'Desert Boot',  size: 'US 8',  condition: 'Excellent', foot: 'Right', dist: '1 mi',
    bg: 'linear-gradient(155deg, #1e1408 0%, #2c1e0d 55%, #17100a 100%)', accent: '#d97706' },
  { emoji: '🥿', brand: 'Birkenstock',  model: 'Arizona',      size: 'EU 40', condition: 'Good',      foot: 'Left',  dist: '7 mi',
    bg: 'linear-gradient(155deg, #081b1f 0%, #0c272d 55%, #061418 100%)', accent: '#0891b2' },
  { emoji: '👠', brand: 'Steve Madden', model: 'Heeled Mule',  size: 'US 7',  condition: 'New',       foot: 'Right', dist: '3 mi',
    bg: 'linear-gradient(155deg, #190d2e 0%, #240f40 55%, #130a25 100%)', accent: '#7c3aed' },
];

export default function Hero() {
  const heroRef    = useRef<HTMLElement>(null);
  const cardRef    = useRef<HTMLDivElement>(null);
  const dragStart  = useRef({ x: 0, y: 0 });
  const animating  = useRef(false);

  const [cardIndex,  setCardIndex]  = useState(0);
  const [swipeDir,   setSwipeDir]   = useState<'left' | 'right' | 'up' | null>(null);
  const [dragX,      setDragX]      = useState(0);
  const [dragY,      setDragY]      = useState(0);
  const [dragging,   setDragging]   = useState(false);
  const [rightCount, setRightCount] = useState(0);
  const [showMatch,  setShowMatch]  = useState(false);

  /* ── Inject falling shoe emojis ── */
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const wrap = document.createElement('div');
    wrap.setAttribute('aria-hidden', 'true');
    wrap.style.cssText = 'position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:1;';

    for (let i = 0; i < 35; i++) {
      const el    = document.createElement('span');
      const emoji = SHOE_EMOJIS[Math.floor(Math.random() * SHOE_EMOJIS.length)];
      const size  = 14 + Math.random() * 14;          // 14–28 px
      const left  = Math.random() * 100;
      const dur   = 6  + Math.random() * 12;          // 6–18 s
      const delay = -(Math.random() * dur);            // negative → already mid-fall
      const opacity = 0.06 + Math.random() * 0.12;    // 0.06–0.18
      const rot   = Math.floor(Math.random() * 720 - 360);

      el.textContent = emoji;
      el.style.cssText =
        `position:absolute;left:${left}%;top:-40px;font-size:${size}px;` +
        `opacity:${opacity};animation:fall-shoe ${dur}s linear ${delay}s infinite;`;
      el.style.setProperty('--rot', `${rot}deg`);
      wrap.appendChild(el);
    }

    hero.insertBefore(wrap, hero.firstChild);
    return () => { if (hero.contains(wrap)) hero.removeChild(wrap); };
  }, []);

  /* ── Swipe logic ── */
  const handleSwipe = useCallback((dir: 'left' | 'right' | 'up') => {
    if (animating.current || swipeDir || showMatch) return;
    animating.current = true;
    setSwipeDir(dir);
    setDragX(0);
    setDragY(0);

    if (dir === 'right') {
      setRightCount(prev => {
        const next = prev + 1;
        if (next % 3 === 0) setTimeout(() => setShowMatch(true), 450);
        return next;
      });
    }

    setTimeout(() => {
      setCardIndex(i => i + 1);
      setSwipeDir(null);
      animating.current = false;
    }, 500);
  }, [swipeDir, showMatch]);

  /* ── Mouse drag ── */
  const onMouseDown = (e: React.MouseEvent) => {
    if (swipeDir || showMatch) return;
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging || swipeDir) return;
    setDragX(e.clientX - dragStart.current.x);
    setDragY(e.clientY - dragStart.current.y);
  };

  const commitDrag = useCallback(() => {
    if (!dragging) return;
    setDragging(false);
    if (Math.abs(dragX) > 80) {
      handleSwipe(dragX > 0 ? 'right' : 'left');
    } else {
      setDragX(0);
      setDragY(0);
    }
  }, [dragging, dragX, handleSwipe]);

  /* ── Touch drag ── */
  const onTouchStart = (e: React.TouchEvent) => {
    if (swipeDir || showMatch) return;
    setDragging(true);
    dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging || swipeDir) return;
    setDragX(e.touches[0].clientX - dragStart.current.x);
    setDragY(e.touches[0].clientY - dragStart.current.y);
  };

  const onTouchEnd = useCallback(() => {
    if (!dragging) return;
    setDragging(false);
    if (Math.abs(dragX) > 60) {
      handleSwipe(dragX > 0 ? 'right' : 'left');
    } else {
      setDragX(0);
      setDragY(0);
    }
  }, [dragging, dragX, handleSwipe]);

  /* ── Derived values ── */
  const current      = CARDS[cardIndex % CARDS.length];
  const tilt         = dragX / 18;
  const stampOpacity = Math.min(Math.abs(dragX) / 80, 1);
  const isRight      = dragX > 25;
  const isLeft       = dragX < -25;

  const cardTransform = () => {
    if (swipeDir === 'left')  return 'translateX(-160%) rotate(-25deg)';
    if (swipeDir === 'right') return 'translateX(160%)  rotate(25deg)';
    if (swipeDir === 'up')    return 'translateY(-150%) rotate(12deg)';
    if (dragging || dragX !== 0)
      return `translateX(${dragX}px) translateY(${dragY * 0.25}px) rotate(${tilt}deg)`;
    return 'none';
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center bg-dark-900 overflow-hidden px-6 pt-24 pb-16"
    >
      {/* Background glow — z-0, behind falling shoes */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse at center, #fd267a 0%, transparent 70%)' }}
        />
      </div>

      {/* Main content — z-10 */}
      <div className="relative z-10 max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">

        {/* ── Left copy ── */}
        <div>
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/70 text-xs font-semibold px-4 py-2 rounded-full mb-8">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'linear-gradient(to right, #fd267a, #ff6036)' }}
              aria-hidden="true"
            />
            Now available · Free to join
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.04] tracking-tight mb-6">
            Find your<br />
            <span className="text-gradient">perfect match.</span>
          </h1>

          <p className="text-lg text-white/60 leading-relaxed max-w-md mb-10">
            The marketplace for individual shoes. Match with someone who needs exactly
            your complement — by brand, model, size, and foot side.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <a
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-tinder text-white text-sm font-bold px-8 py-4 rounded-full hover:opacity-90 active:scale-[.97] transition-all shadow-glow"
            >
              Find my match
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          <div className="flex items-center gap-6 flex-wrap">
            {[
              { value: '300M+',  label: 'potential matches'  },
              { value: '$0',     label: 'to list your shoe'  },
              { value: '1 in 4', label: 'people need this'   },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-base font-bold text-white">{value}</p>
                <p className="text-xs text-white/40">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right — phone mockup ── */}
        <div
          className="relative hidden lg:flex items-center justify-center"
          style={{ height: '640px' }}
        >
          {/* Floating chip 1 */}
          <div className="absolute left-0 top-16 z-20 bg-dark-800 border border-white/10 rounded-2xl px-3 py-2 text-xs text-white/80 font-semibold shadow-card flex items-center gap-2 animate-float-1 whitespace-nowrap">
            <span className="text-green-400">✓</span> Match confirmed!
          </div>

          {/* Floating chip 2 */}
          <div className="absolute right-0 top-40 z-20 bg-dark-800 border border-white/10 rounded-2xl px-3 py-2 text-xs text-white/80 font-semibold shadow-card flex items-center gap-2 animate-float-2 whitespace-nowrap">
            📍 New listing nearby
          </div>

          {/* Floating chip 3 */}
          <div className="absolute left-2 bottom-24 z-20 bg-dark-800 border border-white/10 rounded-2xl px-3 py-2 text-xs text-white/80 font-semibold shadow-card flex items-center gap-2 animate-float-3 whitespace-nowrap">
            📏 0.5 mi away
          </div>

          {/* Phone shell */}
          <div className="relative flex-shrink-0" style={{ width: '280px', height: '590px' }}>

            {/* Side buttons */}
            <div className="absolute -left-[5px] top-24  w-[5px] h-7  bg-dark-600 rounded-l-sm" />
            <div className="absolute -left-[5px] top-36  w-[5px] h-12 bg-dark-600 rounded-l-sm" />
            <div className="absolute -left-[5px] top-52  w-[5px] h-12 bg-dark-600 rounded-l-sm" />
            <div className="absolute -right-[5px] top-32 w-[5px] h-16 bg-dark-600 rounded-r-sm" />

            {/* Phone body */}
            <div
              className="relative w-full h-full bg-dark-900 rounded-[44px] overflow-hidden"
              style={{
                border: '2px solid rgba(255,255,255,0.12)',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 0 60px rgba(253,38,122,0.12), 0 40px 80px rgba(0,0,0,0.7)',
              }}
            >
              {/* Screen glow */}
              <div
                className="absolute inset-0 pointer-events-none z-0 rounded-[42px]"
                style={{ background: 'radial-gradient(ellipse at 50% 20%, rgba(253,38,122,0.18) 0%, transparent 60%)' }}
                aria-hidden="true"
              />

              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-dark-900 rounded-b-3xl z-30 flex items-center justify-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-white/10" />
                <div className="w-10 h-1.5 rounded-full bg-white/10" />
              </div>

              {/* Screen content */}
              <div className="absolute inset-0 pt-8 flex flex-col z-10">

                {/* App bar */}
                <div className="flex items-center justify-between px-5 pt-4 pb-2 flex-shrink-0">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">MyOtherPair</span>
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  </div>
                </div>

                {/* Card stack */}
                <div className="relative flex-1 mx-3 mb-2" style={{ minHeight: 0 }}>

                  {/* Back depth card */}
                  <div
                    className="absolute inset-x-5 inset-y-2 bg-dark-700 rounded-3xl border border-white/5"
                    style={{ zIndex: 1, transform: 'scale(0.88) translateY(18px)' }}
                  />

                  {/* Middle depth card */}
                  <div
                    className="absolute inset-x-3 inset-y-1 bg-dark-800 rounded-3xl border border-white/5"
                    style={{ zIndex: 2, transform: 'scale(0.94) translateY(9px)' }}
                  />

                  {/* Front card — draggable */}
                  <div
                    ref={cardRef}
                    className="absolute inset-0 bg-dark-800 rounded-3xl overflow-hidden select-none"
                    style={{
                      zIndex: 10,
                      border: '1px solid rgba(255,255,255,0.10)',
                      transform: cardTransform() === 'none' ? undefined : cardTransform() ?? undefined,
                      transition: dragging ? 'none' : 'transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94)',
                      cursor: dragging ? 'grabbing' : 'grab',
                    }}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={commitDrag}
                    onMouseLeave={commitDrag}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                  >
                    {/* Full-bleed card background */}
                    <div className="absolute inset-0" style={{ background: current.bg }} />

                    {/* Decorative rings — upper portion */}
                    <div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      style={{ paddingBottom: '38%' }}
                    >
                      <div className="absolute w-48 h-48 rounded-full border border-white/5" />
                      <div className="absolute w-32 h-32 rounded-full border border-white/5" />
                      <div
                        className="absolute w-20 h-20 rounded-full"
                        style={{ background: `radial-gradient(circle, ${current.accent}35 0%, transparent 70%)` }}
                      />
                    </div>

                    {/* Shoe emoji */}
                    <div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      style={{ paddingBottom: '38%' }}
                    >
                      <span
                        style={{
                          fontSize: '84px',
                          lineHeight: 1,
                          filter: `drop-shadow(0 0 30px ${current.accent}80) drop-shadow(0 8px 20px rgba(0,0,0,0.7))`,
                        }}
                      >
                        {current.emoji}
                      </span>
                    </div>

                    {/* Distance badge */}
                    <div className="absolute top-3 right-3 z-10 bg-black/50 backdrop-blur-sm text-white/70 text-[10px] px-2.5 py-1 rounded-full font-semibold">
                      📍 {current.dist}
                    </div>

                    {/* Bottom info overlay */}
                    <div
                      className="absolute bottom-0 inset-x-0 z-10 px-4 pb-4 pt-10"
                      style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(10,11,14,0.90) 38%, rgba(10,11,14,0.99) 65%)' }}
                    >
                      <div className="flex items-end justify-between mb-2">
                        <div>
                          <p className="text-white font-extrabold text-base leading-tight">{current.brand}</p>
                          <p className="text-white/50 text-xs mt-0.5">{current.model}</p>
                        </div>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white flex-shrink-0 ml-2"
                          style={{ background: 'linear-gradient(to right, #fd267a, #ff6036)' }}
                        >
                          {current.foot}
                        </span>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {[`Size ${current.size}`, current.condition].map(chip => (
                          <span
                            key={chip}
                            className="text-[10px] bg-white/10 border border-white/10 text-white/60 px-2 py-0.5 rounded-full"
                          >
                            {chip}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* MATCH stamp */}
                    {isRight && (
                      <div
                        className="absolute z-20 left-4 border-[2.5px] border-green-400 text-green-400 text-sm font-black px-3 py-1 rounded-lg uppercase tracking-widest pointer-events-none"
                        style={{ opacity: stampOpacity, top: '30%', transform: 'translateY(-50%) rotate(-22deg)' }}
                      >
                        MATCH
                      </div>
                    )}

                    {/* PASS stamp */}
                    {isLeft && (
                      <div
                        className="absolute z-20 right-4 border-[2.5px] border-red-400 text-red-400 text-sm font-black px-3 py-1 rounded-lg uppercase tracking-widest pointer-events-none"
                        style={{ opacity: stampOpacity, top: '30%', transform: 'translateY(-50%) rotate(22deg)' }}
                      >
                        PASS
                      </div>
                    )}
                  </div>

                  {/* It's a Match overlay — inside phone screen */}
                  {showMatch && (
                    <div
                      className="absolute inset-0 z-20 rounded-3xl flex flex-col items-center justify-center text-center p-5"
                      style={{ background: 'linear-gradient(145deg, rgba(253,38,122,0.97), rgba(255,96,54,0.97))' }}
                    >
                      <div className="text-5xl mb-3">🎉</div>
                      <p className="text-white font-extrabold text-base mb-1">It's a Match!</p>
                      <p className="text-white/75 text-xs mb-5 leading-relaxed">
                        You both need the<br />same shoe — reach out!
                      </p>
                      <button
                        onClick={() => setShowMatch(false)}
                        className="bg-white text-brand-500 text-xs font-bold px-6 py-2 rounded-full active:scale-95 transition-all"
                      >
                        Keep swiping
                      </button>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-center gap-5 px-5 pb-5 pt-1 flex-shrink-0">
                  <button
                    onClick={() => handleSwipe('left')}
                    className="w-11 h-11 rounded-full bg-dark-700 border border-white/10 flex items-center justify-center text-base hover:border-red-400/50 hover:bg-red-400/10 transition-all active:scale-90"
                    aria-label="Pass"
                  >
                    ✕
                  </button>
                  <button
                    onClick={() => handleSwipe('up')}
                    className="w-10 h-10 rounded-full bg-dark-700 border border-white/10 flex items-center justify-center text-sm hover:border-yellow-400/50 hover:bg-yellow-400/10 transition-all active:scale-90"
                    aria-label="Super like"
                  >
                    ⭐
                  </button>
                  <button
                    onClick={() => handleSwipe('right')}
                    className="w-11 h-11 rounded-full flex items-center justify-center text-base transition-all active:scale-90"
                    style={{ background: 'linear-gradient(to bottom right, #fd267a, #ff6036)', boxShadow: '0 4px 18px rgba(253,38,122,0.4)' }}
                    aria-label="Match"
                  >
                    👟
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

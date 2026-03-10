import { useState, useRef, useCallback, useEffect } from "react";

const SHOE_LISTINGS = [
  { emoji: "👟", brand: "Nike", model: "Air Force 1", size: "UK 7", side: "Left", condition: "New", color: "hsl(215 65% 52%)" },
  { emoji: "🥿", brand: "Adidas", model: "Samba OG", size: "UK 8", side: "Right", condition: "Good", color: "hsl(152 55% 42%)" },
  { emoji: "👠", brand: "Jimmy Choo", model: "Romy 85", size: "UK 5", side: "Left", condition: "New", color: "hsl(345 60% 52%)" },
  { emoji: "👞", brand: "Clarks", model: "Wallabee", size: "UK 9", side: "Right", condition: "Used", color: "hsl(24 70% 50%)" },
  { emoji: "🥾", brand: "Dr. Martens", model: "1460 Boot", size: "UK 6", side: "Left", condition: "Good", color: "hsl(30 10% 25%)" },
];

const CONTEXT_CHIPS = [
  { text: "🔗 Match confirmed!", delay: 0 },
  { text: "📍 2.3 mi away", delay: 2 },
  { text: "✨ New listing!", delay: 4 },
];

const PhoneMockup = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeX, setSwipeX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [rightSwipeCount, setRightSwipeCount] = useState(0);
  const dragStartX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const currentShoe = SHOE_LISTINGS[currentIndex % SHOE_LISTINGS.length];
  const nextShoe = SHOE_LISTINGS[(currentIndex + 1) % SHOE_LISTINGS.length];

  const handleSwipe = useCallback((direction: "left" | "right") => {
    setExitDirection(direction);

    if (direction === "right") {
      const newCount = rightSwipeCount + 1;
      setRightSwipeCount(newCount);
      if (newCount % 3 === 0) {
        setTimeout(() => setShowMatch(true), 300);
        setTimeout(() => setShowMatch(false), 2200);
      }
    }

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setExitDirection(null);
      setSwipeX(0);
    }, 400);
  }, [rightSwipeCount]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setSwipeX(e.clientX - dragStartX.current);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (swipeX > 60) {
      handleSwipe("right");
    } else if (swipeX < -60) {
      handleSwipe("left");
    } else {
      setSwipeX(0);
    }
  };

  const rotation = swipeX * 0.08;
  const stampOpacity = Math.min(Math.abs(swipeX) / 80, 1);

  const getCardStyle = () => {
    if (exitDirection === "left") {
      return { transform: "translateX(-120%) rotate(-15deg)", opacity: 0, transition: "all 0.4s ease-out" };
    }
    if (exitDirection === "right") {
      return { transform: "translateX(120%) rotate(15deg)", opacity: 0, transition: "all 0.4s ease-out" };
    }
    return {
      transform: `translateX(${swipeX}px) rotate(${rotation}deg)`,
      transition: isDragging ? "none" : "transform 0.3s ease-out",
    };
  };

  return (
    <div className="relative w-[260px] mx-auto" style={{ height: 480 }}>
      {/* Floating context chips */}
      {CONTEXT_CHIPS.map((chip, i) => (
        <div
          key={i}
          className="absolute text-[10px] font-semibold px-2.5 py-1 rounded-full bg-card shadow-card border border-border/50 text-foreground whitespace-nowrap"
          style={{
            animation: `phonechip-orbit-${i} 8s ease-in-out infinite`,
            animationDelay: `${chip.delay}s`,
            zIndex: 20,
            ...(i === 0 ? { top: "8%", right: "-40px" } : i === 1 ? { bottom: "18%", left: "-44px" } : { top: "38%", right: "-48px" }),
          }}
        >
          {chip.text}
        </div>
      ))}

      {/* Phone shell */}
      <div
        className="relative w-full h-full rounded-[36px] border-[3px] border-foreground/15 bg-card overflow-hidden shadow-elevated"
        style={{ boxShadow: "0 20px 60px hsl(30 10% 12% / 0.15), inset 0 0 0 1px hsl(0 0% 100% / 0.1)" }}
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90px] h-[22px] bg-foreground/10 rounded-b-2xl z-30" />

        {/* Side buttons */}
        <div className="absolute -right-[5px] top-[90px] w-[3px] h-[28px] rounded-r-sm bg-foreground/15" />
        <div className="absolute -left-[5px] top-[80px] w-[3px] h-[20px] rounded-l-sm bg-foreground/15" />
        <div className="absolute -left-[5px] top-[110px] w-[3px] h-[36px] rounded-l-sm bg-foreground/15" />

        {/* Screen content */}
        <div className="absolute inset-[3px] rounded-[33px] overflow-hidden bg-background flex flex-col">
          {/* Status bar */}
          <div className="flex items-center justify-between px-5 pt-7 pb-1 text-[9px] font-semibold text-muted-foreground">
            <span>9:41</span>
            <span className="font-display text-[11px] font-bold text-foreground">myotherpair</span>
            <span>●●●</span>
          </div>

          {/* Card stack area */}
          <div className="flex-1 relative px-3 py-2 overflow-hidden">
            {/* Next card (beneath) */}
            <div className="absolute inset-3 rounded-2xl bg-muted/50 border border-border/30 flex flex-col items-center justify-center"
              style={{ transform: "scale(0.95)", opacity: 0.6 }}
            >
              <span className="text-4xl mb-2">{nextShoe.emoji}</span>
              <p className="text-[10px] text-muted-foreground">{nextShoe.brand}</p>
            </div>

            {/* Active card */}
            <div
              ref={cardRef}
              className="absolute inset-3 rounded-2xl bg-card border border-border/50 shadow-card cursor-grab active:cursor-grabbing flex flex-col overflow-hidden select-none"
              style={getCardStyle()}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              {/* Shoe image area */}
              <div
                className="flex-1 flex items-center justify-center relative"
                style={{ background: `linear-gradient(135deg, ${currentShoe.color}10, ${currentShoe.color}05)` }}
              >
                <span className="text-6xl select-none" style={{ filter: "drop-shadow(0 4px 8px hsl(0 0% 0% / 0.1))" }}>
                  {currentShoe.emoji}
                </span>

                {/* MATCH stamp */}
                {swipeX > 20 && (
                  <div
                    className="absolute top-4 left-3 border-[2.5px] border-match-green text-match-green font-bold text-lg px-2 py-0.5 rounded-md -rotate-12"
                    style={{ opacity: stampOpacity }}
                  >
                    MATCH
                  </div>
                )}

                {/* PASS stamp */}
                {swipeX < -20 && (
                  <div
                    className="absolute top-4 right-3 border-[2.5px] border-destructive text-destructive font-bold text-lg px-2 py-0.5 rounded-md rotate-12"
                    style={{ opacity: stampOpacity }}
                  >
                    PASS
                  </div>
                )}
              </div>

              {/* Card info */}
              <div className="p-3 border-t border-border/30">
                <p className="font-semibold text-xs text-foreground">{currentShoe.brand} {currentShoe.model}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{currentShoe.size} · {currentShoe.side} shoe</p>
                <div className="flex gap-1.5 mt-1.5">
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">
                    {currentShoe.condition}
                  </span>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: currentShoe.side === "Left" ? "hsl(215 65% 52% / 0.12)" : "hsl(345 60% 52% / 0.12)",
                      color: currentShoe.side === "Left" ? "hsl(215 65% 52%)" : "hsl(345 60% 52%)",
                    }}
                  >
                    {currentShoe.side}
                  </span>
                </div>
              </div>
            </div>

            {/* Match overlay */}
            {showMatch && (
              <div className="absolute inset-3 rounded-2xl bg-match-green/90 backdrop-blur-sm flex flex-col items-center justify-center z-20 animate-scale-in">
                <span className="text-4xl mb-2">🎉</span>
                <p className="text-lg font-bold text-match-green-foreground">It's a Match!</p>
                <p className="text-[10px] text-match-green-foreground/80 mt-1">You both need this shoe</p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-4 px-4 pb-4 pt-1">
            <button
              onClick={() => handleSwipe("left")}
              className="w-11 h-11 rounded-full border-2 border-destructive/30 flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors active:scale-90"
            >
              <span className="text-base font-bold">✕</span>
            </button>
            <button
              onClick={() => handleSwipe("right")}
              className="w-14 h-14 rounded-full gradient-warm flex items-center justify-center text-accent-foreground shadow-card hover:shadow-card-hover transition-all active:scale-90"
            >
              <span className="text-xl">👟</span>
            </button>
            <button
              onClick={() => handleSwipe("right")}
              className="w-11 h-11 rounded-full border-2 border-accent/30 flex items-center justify-center text-accent hover:bg-accent/10 transition-colors active:scale-90"
            >
              <span className="text-base">⭐</span>
            </button>
          </div>

          {/* Home indicator */}
          <div className="w-24 h-1 rounded-full bg-foreground/10 mx-auto mb-2" />
        </div>
      </div>
    </div>
  );
};

export default PhoneMockup;

import { useState, useCallback } from "react";
import { sampleListings, sampleUsers, findMatches } from "@/data/sampleData";
import { Badge } from "@/components/ui/badge";
import { Heart, X, ArrowRight, Sparkles, MapPin } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";

const currentUser = sampleUsers[0];
const SWIPE_THRESHOLD = 80;

const Home = () => {
  const [liked, setLiked] = useState<string[]>([]);
  const [passed, setPassed] = useState<string[]>([]);
  const [swiping, setSwiping] = useState(false);
  const [exitX, setExitX] = useState(0);
  const navigate = useNavigate();

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-18, 0, 18]);
  const likeOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const passOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);
  const bgScale = useTransform(x, [-200, 0, 200], [1, 0.95, 1]);

  const availableListings = sampleListings.filter(
    (l) => l.userId !== currentUser.id && !passed.includes(l.id) && !liked.includes(l.id)
  );

  const currentListing = availableListings[0];
  const nextListing = availableListings[1];
  const seller = currentListing ? sampleUsers.find((u) => u.id === currentListing.userId) : null;
  const nextSeller = nextListing ? sampleUsers.find((u) => u.id === nextListing.userId) : null;

  const matches = currentListing
    ? findMatches(currentListing, sampleListings.filter((l) => l.userId === currentUser.id))
    : [];

  const completeSwipe = useCallback((direction: number) => {
    if (!currentListing || swiping) return;
    setSwiping(true);
    setExitX(direction * 500);

    if (direction > 0) {
      setTimeout(() => {
        setLiked((prev) => [...prev, currentListing.id]);
        setSwiping(false);
        x.set(0);
        navigate(`/messages/${currentListing.id}`);
      }, 300);
    } else {
      setTimeout(() => {
        setPassed((prev) => [...prev, currentListing.id]);
        setSwiping(false);
        x.set(0);
      }, 300);
    }
  }, [currentListing, swiping, navigate, x]);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    if (offset > SWIPE_THRESHOLD || velocity > 500) {
      completeSwipe(1);
    } else if (offset < -SWIPE_THRESHOLD || velocity < -500) {
      completeSwipe(-1);
    }
  }, [completeSwipe]);

  return (
    <div className="min-h-screen bg-background pb-24 overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/30">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
        <div className="relative flex items-center justify-between px-5 py-4 max-w-lg mx-auto">
          <h1 className="font-display text-[15px] font-bold tracking-[0.1em] uppercase text-foreground">
            myotherpair
          </h1>
          <span className="text-[11px] text-muted-foreground/50 tracking-[0.15em] uppercase">
            {availableListings.length} left
          </span>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-4">
        {currentListing ? (
          <div className="mb-4">
            {/* Card stack area */}
            <div className="relative touch-none" style={{ height: "calc(100vh - 220px)", maxHeight: 640 }}>

              {/* Background card (next) */}
              {nextListing && (
                <motion.div
                  className="absolute inset-x-0 top-2 bottom-0"
                  style={{ scale: bgScale }}
                >
                  <div className="w-full h-full rounded-2xl overflow-hidden bg-card border border-border/30 shadow-card">
                    <img
                      src={nextListing.photo}
                      alt=""
                      className="w-full h-full object-cover opacity-60"
                      draggable={false}
                    />
                  </div>
                </motion.div>
              )}

              {/* Active card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentListing.id}
                  style={{ x, rotate }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.8}
                  onDragEnd={handleDragEnd}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={swiping
                    ? { x: exitX, rotate: exitX > 0 ? 15 : -15, opacity: 0 }
                    : { opacity: 1, scale: 1, x: 0 }
                  }
                  exit={{ opacity: 0 }}
                  transition={swiping
                    ? { duration: 0.3, ease: [0.4, 0, 1, 1] }
                    : { type: "spring", stiffness: 300, damping: 26 }
                  }
                  className="absolute inset-0 cursor-grab active:cursor-grabbing z-10"
                >
                  {/* LIKE stamp */}
                  <motion.div
                    className="absolute top-8 left-6 z-20 pointer-events-none"
                    style={{ opacity: likeOpacity }}
                  >
                    <div className="border-[3px] border-match-green rounded-lg px-5 py-2 rotate-[-20deg]">
                      <span className="font-display text-3xl font-bold text-match-green tracking-wider uppercase">
                        Like
                      </span>
                    </div>
                  </motion.div>

                  {/* NOPE stamp */}
                  <motion.div
                    className="absolute top-8 right-6 z-20 pointer-events-none"
                    style={{ opacity: passOpacity }}
                  >
                    <div className="border-[3px] border-destructive rounded-lg px-5 py-2 rotate-[20deg]">
                      <span className="font-display text-3xl font-bold text-destructive tracking-wider uppercase">
                        Nope
                      </span>
                    </div>
                  </motion.div>

                  {/* Card itself */}
                  <div className="w-full h-full rounded-2xl overflow-hidden bg-card border border-border/30 shadow-elevated relative">
                    {/* Full-bleed image */}
                    <img
                      src={currentListing.photo}
                      alt={`${currentListing.brand} ${currentListing.model}`}
                      className="w-full h-full object-cover pointer-events-none select-none"
                      draggable={false}
                    />

                    {/* Gradient overlay — bottom heavy */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Top badges */}
                    <div className="absolute top-4 left-4 flex gap-2 z-10">
                      <Badge
                        variant={currentListing.side === "Left" ? "left" : "right"}
                        className="text-[10px] px-3 py-1.5 tracking-[0.06em] uppercase font-semibold rounded-full shadow-lg"
                      >
                        {currentListing.side} foot
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-3 py-1.5 tracking-[0.06em] uppercase bg-black/40 backdrop-blur-md border-white/20 text-white rounded-full shadow-lg">
                        {currentListing.condition}
                      </Badge>
                    </div>

                    {/* Match indicator — top right */}
                    {matches.length > 0 && (
                      <div className="absolute top-4 right-4 z-10">
                        <div className="flex items-center gap-1.5 bg-accent/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
                          <Sparkles className="h-3 w-3 text-accent-foreground" />
                          <span className="text-[10px] font-bold text-accent-foreground tracking-wide uppercase">Match</span>
                        </div>
                      </div>
                    )}

                    {/* Bottom info — Tinder style */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                      {/* Name + Price row */}
                      <div className="flex items-end justify-between mb-2">
                        <div>
                          <h3 className="font-display text-[1.6rem] font-bold text-white leading-tight tracking-[-0.01em]">
                            {currentListing.brand} <span className="text-white/70 font-normal text-xl">{currentListing.model}</span>
                          </h3>
                        </div>
                        <span className="font-display text-2xl font-bold text-white">
                          £{currentListing.price}
                        </span>
                      </div>

                      {/* Details row */}
                      <div className="flex items-center gap-3 text-white/60 text-[13px] mb-3">
                        <span>UK {currentListing.size}</span>
                        <span className="w-1 h-1 rounded-full bg-white/30" />
                        <span>{currentListing.category}</span>
                      </div>

                      {/* Seller row */}
                      {seller && (
                        <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                          <img
                            src={seller.avatar}
                            alt={seller.name}
                            className="w-8 h-8 rounded-full object-cover border border-white/20 pointer-events-none"
                            draggable={false}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-white truncate">{seller.name}</p>
                          </div>
                          <div className="flex items-center gap-1 text-white/40">
                            <MapPin className="h-3 w-3" />
                            <span className="text-[11px]">{seller.location}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Action buttons — Tinder style */}
            <div className="flex items-center justify-center gap-6 mt-5">
              <motion.button
                onClick={() => completeSwipe(-1)}
                className="w-[3.5rem] h-[3.5rem] rounded-full border-2 border-border flex items-center justify-center text-muted-foreground hover:border-destructive hover:text-destructive hover:shadow-lg transition-colors duration-200"
                whileTap={{ scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
              >
                <X className="h-6 w-6" strokeWidth={2.5} />
              </motion.button>
              <motion.button
                onClick={() => completeSwipe(1)}
                className="w-[4.25rem] h-[4.25rem] rounded-full gradient-warm flex items-center justify-center text-accent-foreground shadow-elevated"
                whileTap={{ scale: 0.8 }}
                whileHover={{ scale: 1.1, boxShadow: "0 0 30px hsl(38 65% 52% / 0.35)" }}
              >
                <Heart className="h-7 w-7" strokeWidth={2.5} />
              </motion.button>
            </div>
          </div>
        ) : (
          <motion.div
            className="text-center py-32"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-px h-12 bg-border/40 mx-auto mb-8" />
            <h3 className="font-display text-2xl font-bold text-foreground tracking-[-0.02em] mb-3">
              All caught up
            </h3>
            <p className="text-[13px] text-muted-foreground/50 max-w-[260px] mx-auto leading-relaxed">
              You've explored every listing. New shoes drop daily.
            </p>
            <button
              onClick={() => { setLiked([]); setPassed([]); }}
              className="mt-8 text-[11px] tracking-[0.15em] uppercase font-semibold text-accent hover:text-accent/80 transition-colors inline-flex items-center gap-2"
            >
              Start over
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;

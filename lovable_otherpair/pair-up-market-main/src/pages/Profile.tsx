import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { sampleUsers, sampleListings, findMatches } from "@/data/sampleData";
import BottomNav from "@/components/BottomNav";
import { MapPin, Edit, Search, Check, X, Heart, ChevronRight, ShoppingBag, Star, Settings, HelpCircle, LogOut, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: "easeOut" as const },
});

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  to?: string;
  value?: string;
  onClick?: () => void;
}

const MenuItem = ({ icon, label, to, value, onClick }: MenuItemProps) => {
  const content = (
    <div
      className="flex items-center gap-4 px-6 py-4 hover:bg-secondary/30 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <span className="text-muted-foreground/50">{icon}</span>
      <span className="flex-1 text-[14px] font-medium text-foreground">{label}</span>
      {value && <span className="text-[12px] text-muted-foreground/40">{value}</span>}
      <ChevronRight className="h-4 w-4 text-muted-foreground/20" />
    </div>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }
  return content;
};

const Profile = () => {
  const { userId } = useParams();
  const user = sampleUsers.find((u) => u.id === userId);
  const isOwnProfile = userId === "u1";

  const [searchStatus, setSearchStatus] = useState("Looking for a right Nike Air Force 1, UK 7");
  const [editingStatus, setEditingStatus] = useState(false);
  const [statusDraft, setStatusDraft] = useState(searchStatus);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  const userListings = sampleListings.filter((l) => l.userId === user.id);
  const avgRating = user.reviews.length > 0
    ? (user.reviews.reduce((sum, r) => sum + r.rating, 0) / user.reviews.length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/30">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
        <div className="relative flex items-center justify-center px-6 py-4 max-w-lg mx-auto">
          <h1 className="text-[14px] font-semibold text-foreground tracking-[0.05em] uppercase">Profile</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto">
        {/* User card */}
        <motion.div {...fadeUp(0)} className="px-5 pt-5 pb-2">
          <div className="border border-border/40 bg-card p-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-border/30 grayscale hover:grayscale-0 transition-all duration-500"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-match-green border-[2.5px] border-card" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-lg font-bold text-foreground tracking-[-0.01em]">
                  {user.name}
                </h2>
                <div className="flex items-center gap-1.5 text-muted-foreground/40 mt-0.5">
                  <MapPin className="h-3 w-3" />
                  <span className="text-[11px] tracking-[0.08em] uppercase">{user.location}</span>
                </div>
              </div>
              {isOwnProfile && (
                <button className="text-muted-foreground/30 hover:text-accent transition-colors">
                  <Edit className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Quick stats row */}
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border/20">
              {[
                { label: "Listings", value: userListings.length },
                { label: "Rating", value: avgRating ? `${avgRating} ★` : "—" },
                { label: "L: UK " + user.leftFootSize, value: "R: UK " + user.rightFootSize },
              ].map((stat, i) => (
                <div key={i} className="text-center flex-1">
                  <p className="text-[13px] font-bold text-foreground leading-none">{stat.value}</p>
                  <p className="text-[9px] text-muted-foreground/35 tracking-[0.15em] uppercase mt-1.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Search status */}
        <motion.div {...fadeUp(0.05)} className="px-5 pb-2 pt-1">
          <div className="border border-accent/15 bg-accent/[0.03] px-5 py-4">
            <div className="flex items-start gap-3">
              <Search className="h-3.5 w-3.5 text-accent mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[9px] text-accent/50 tracking-[0.25em] uppercase font-medium mb-1">Searching for</p>
                {editingStatus && isOwnProfile ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={statusDraft}
                      onChange={(e) => setStatusDraft(e.target.value)}
                      className="flex-1 bg-transparent text-[13px] text-foreground outline-none border-b border-accent/30 pb-1 placeholder:text-muted-foreground/30"
                      placeholder="e.g. Right Nike Dunk, UK 8"
                      autoFocus
                    />
                    <button onClick={() => { setSearchStatus(statusDraft); setEditingStatus(false); }} className="text-accent"><Check className="h-4 w-4" /></button>
                    <button onClick={() => { setStatusDraft(searchStatus); setEditingStatus(false); }} className="text-muted-foreground/40"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <p
                    className={`text-[13px] text-foreground/70 leading-relaxed ${isOwnProfile ? 'cursor-pointer' : ''}`}
                    onClick={() => isOwnProfile && setEditingStatus(true)}
                  >
                    {searchStatus}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Banner — List a shoe */}
        {isOwnProfile && (
          <motion.div {...fadeUp(0.08)} className="px-5 pt-1 pb-3">
            <Link to="/create">
              <div className="relative overflow-hidden gradient-warm p-5 flex items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-display text-[1.1rem] font-bold text-accent-foreground mb-1">List a shoe</h3>
                  <p className="text-[12px] text-accent-foreground/70 leading-relaxed mb-3">Find a match for your spare single shoe</p>
                  <div className="inline-flex items-center gap-1.5 bg-accent-foreground/10 backdrop-blur-sm px-3 py-1.5 text-[10px] tracking-[0.12em] uppercase font-semibold text-accent-foreground">
                    <PlusCircle className="h-3 w-3" />
                    List now
                  </div>
                </div>
                <div className="w-20 h-20 rounded-lg bg-accent-foreground/10 flex items-center justify-center">
                  <ShoppingBag className="h-8 w-8 text-accent-foreground/40" />
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Menu sections */}
        <motion.div {...fadeUp(0.1)} className="mt-2">
          {/* Section 1 */}
          <div className="border-t border-border/20">
            <MenuItem icon={<Heart className="h-[18px] w-[18px]" />} label="Favourite items" to="/browse" />
            <div className="border-t border-border/10" />
            <MenuItem icon={<ShoppingBag className="h-[18px] w-[18px]" />} label="My listings" to={`/profile/${userId}`} value={`${userListings.length}`} />
            <div className="border-t border-border/10" />
            <MenuItem icon={<Star className="h-[18px] w-[18px]" />} label="Reviews" value={user.reviews.length > 0 ? `${avgRating} ★` : "None"} />
          </div>

          {/* Spacer */}
          <div className="h-2 bg-secondary/30" />

          {/* Section 2 */}
          <div className="border-t border-border/20">
            <MenuItem icon={<Search className="h-[18px] w-[18px]" />} label="Foot sizes" value={`L${user.leftFootSize} · R${user.rightFootSize}`} />
            <div className="border-t border-border/10" />
            <MenuItem icon={<Settings className="h-[18px] w-[18px]" />} label="Settings" />
          </div>

          {/* Spacer */}
          <div className="h-2 bg-secondary/30" />

          {/* Section 3 */}
          <div className="border-t border-border/20">
            <MenuItem icon={<HelpCircle className="h-[18px] w-[18px]" />} label="Help centre" />
            <div className="border-t border-border/10" />
            <MenuItem icon={<LogOut className="h-[18px] w-[18px]" />} label="Log out" to="/login" />
          </div>

          <div className="h-2 bg-secondary/30" />

          {/* Footer */}
          <div className="py-6 text-center">
            <p className="text-[10px] text-muted-foreground/25 tracking-[0.15em] uppercase">
              Privacy Policy · Terms & Conditions
            </p>
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { motion } from 'framer-motion';
import {
  MapPin, Edit, Search, Check, X,
  ChevronRight, ShoppingBag, Settings,
  HelpCircle, LogOut, PlusCircle, MessageCircle,
} from 'lucide-react';
import { formatSizeLabel } from '../../../lib/sizeConversion';

interface ProfileData {
  name?: string;
  email?: string;
  avatar_url?: string;
  location?: string;
  foot_size_left?: number | null;
  foot_size_right?: number | null;
  is_amputee?: boolean;
  bio?: string | null;
  created_at?: string;
}

interface Stats {
  listings: number;
  matches:  number;
  trades:   number;
}

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 10 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: 'easeOut' as const },
});

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
  value?: string;
  onClick?: () => void;
  destructive?: boolean;
}

function MenuItem({ icon, label, href, value, onClick, destructive }: MenuItemProps) {
  const content = (
    <div
      className={`flex items-center gap-4 px-6 py-4 hover:bg-secondary/30 transition-colors cursor-pointer ${destructive ? 'text-destructive' : ''}`}
      onClick={onClick}
    >
      <span className={destructive ? 'text-destructive/60' : 'text-muted-foreground/50'}>{icon}</span>
      <span className={`flex-1 text-[14px] font-medium ${destructive ? 'text-destructive' : 'text-foreground'}`}>{label}</span>
      {value && <span className="text-[12px] text-muted-foreground/40">{value}</span>}
      <ChevronRight className="h-4 w-4 text-muted-foreground/20" />
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

export default function ProfilePage() {
  const router = useRouter();
  const [userId,        setUserId]        = useState<string | null>(null);
  const [profile,       setProfile]       = useState<ProfileData>({});
  const [stats,         setStats]         = useState<Stats>({ listings: 0, matches: 0, trades: 0 });
  const [loading,       setLoading]       = useState(true);
  const [searchStatus,  setSearchStatus]  = useState('');
  const [editingStatus, setEditingStatus] = useState(false);
  const [statusDraft,   setStatusDraft]   = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUserId(session.user.id);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const [profileRes, listingsRes, matchesRes, tradesRes] = await Promise.all([
        supabase.from('users').select('*').eq('id', userId).single(),
        supabase.from('listings').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'active'),
        supabase.from('matches').select('id', { count: 'exact', head: true }).or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`),
        supabase.from('matches').select('id', { count: 'exact', head: true }).or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`).eq('status', 'completed'),
      ]);
      if (profileRes.data) {
        const d = profileRes.data as ProfileData;
        setProfile(d);
        const defaultStatus = d.bio || (d.location ? `Looking for shoes in ${d.location}` : 'Looking for the perfect match');
        setSearchStatus(defaultStatus);
        setStatusDraft(defaultStatus);
      }
      setStats({
        listings: listingsRes.count ?? 0,
        matches:  matchesRes.count  ?? 0,
        trades:   tradesRes.count   ?? 0,
      });
      setLoading(false);
    })();
  }, [userId]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  const name       = profile.name ?? '';
  const initials   = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  const leftSize   = profile.foot_size_left  != null ? formatSizeLabel(String(profile.foot_size_left),  'UK') : null;
  const rightSize  = profile.foot_size_right != null ? formatSizeLabel(String(profile.foot_size_right), 'UK') : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="sticky top-0 z-40 border-b border-border/30">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
          <div className="relative flex items-center justify-center px-6 py-4 max-w-lg mx-auto">
            <h1 className="text-[14px] font-semibold text-foreground tracking-[0.05em] uppercase">Profile</h1>
          </div>
        </header>
        <div className="flex flex-col items-center px-5 pt-8 pb-4">
          <div className="w-14 h-14 rounded-full bg-muted animate-pulse mb-4" />
          <div className="h-5 w-32 rounded-lg bg-muted animate-pulse mb-2" />
          <div className="h-3 w-24 rounded-lg bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

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
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-border/30 grayscale hover:grayscale-0 transition-all duration-500"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center text-xl font-bold text-accent-foreground border-2 border-border/30">
                    {initials}
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-match-green border-[2.5px] border-card" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-lg font-bold text-foreground tracking-[-0.01em]">
                  {name || 'No name set'}
                </h2>
                {profile.location && (
                  <div className="flex items-center gap-1.5 text-muted-foreground/40 mt-0.5">
                    <MapPin className="h-3 w-3" />
                    <span className="text-[11px] tracking-[0.08em] uppercase">{profile.location}</span>
                  </div>
                )}
              </div>
              <Link href="/app/profile/edit" className="text-muted-foreground/30 hover:text-accent transition-colors">
                <Edit className="h-4 w-4" />
              </Link>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border/20">
              {[
                { label: 'Listings', value: stats.listings },
                { label: 'Matches',  value: stats.matches  },
                { label: 'Sizes',    value: leftSize && rightSize ? `L · R` : leftSize ? `L` : rightSize ? `R` : '—' },
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
                {editingStatus ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={statusDraft}
                      onChange={(e) => setStatusDraft(e.target.value)}
                      className="flex-1 bg-transparent text-[13px] text-foreground outline-none border-b border-accent/30 pb-1 placeholder:text-muted-foreground/30"
                      placeholder="e.g. Right Nike Dunk, UK 8"
                      autoFocus
                    />
                    <button onClick={async () => {
                      setSearchStatus(statusDraft);
                      setEditingStatus(false);
                      if (userId) {
                        await supabase.from('users').update({ bio: statusDraft }).eq('id', userId);
                      }
                    }} className="text-accent">
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={() => { setStatusDraft(searchStatus); setEditingStatus(false); }} className="text-muted-foreground/40">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <p
                    className="text-[13px] text-foreground/70 leading-relaxed cursor-pointer"
                    onClick={() => setEditingStatus(true)}
                  >
                    {searchStatus}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Banner */}
        <motion.div {...fadeUp(0.08)} className="px-5 pt-1 pb-3">
          <Link href="/app/create">
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

        {/* Menu sections */}
        <motion.div {...fadeUp(0.1)} className="mt-2">
          {/* Section 1 */}
          <div className="border-t border-border/20">
            <MenuItem icon={<ShoppingBag className="h-[18px] w-[18px]" />} label="My listings" href="/app/listings" value={`${stats.listings}`} />
            <div className="border-t border-border/10" />
            <MenuItem icon={<MessageCircle className="h-[18px] w-[18px]" />} label="My matches" href="/app/messages" value={`${stats.matches}`} />
          </div>

          {/* Spacer */}
          <div className="h-2 bg-secondary/30" />

          {/* Section 2 */}
          <div className="border-t border-border/20">
            <MenuItem icon={<Edit className="h-[18px] w-[18px]" />}       label="Edit profile"  href="/app/profile/edit" />
            <div className="border-t border-border/10" />
            <MenuItem icon={<Settings className="h-[18px] w-[18px]" />}   label="Settings"      href="/app/profile/edit" />
          </div>

          {/* Spacer */}
          <div className="h-2 bg-secondary/30" />

          {/* Section 3 */}
          <div className="border-t border-border/20">
            <MenuItem icon={<HelpCircle className="h-[18px] w-[18px]" />} label="Help centre" />
            <div className="border-t border-border/10" />
            <MenuItem
              icon={<LogOut className="h-[18px] w-[18px]" />}
              label="Log out"
              onClick={handleSignOut}
              destructive
            />
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
    </div>
  );
}

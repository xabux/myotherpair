'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag, PlusCircle } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

interface Listing {
  id: string;
  shoe_brand: string;
  shoe_model: string;
  size: number;
  foot_side: string;
  condition: string;
  price: number | null;
  photos: string[];
}

const CONDITION_LABELS: Record<string, string> = {
  new_with_tags: 'New (tags)', new_without_tags: 'New', excellent: 'Excellent',
  good: 'Good', fair: 'Fair', poor: 'Poor',
};

export default function ListingsPage() {
  const router   = useRouter();
  const [userId,   setUserId]   = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUserId(session.user.id);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data } = await supabase
        .from('listings')
        .select('id, shoe_brand, shoe_model, size, foot_side, condition, price, photos')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      setListings((data ?? []).map((r: Record<string, unknown>) => ({
        id:         r.id         as string,
        shoe_brand: r.shoe_brand as string,
        shoe_model: r.shoe_model as string,
        size:       r.size       as number,
        foot_side:  r.foot_side  as string,
        condition:  r.condition  as string,
        price:      r.price      as number | null,
        photos:     Array.isArray(r.photos) ? (r.photos as string[]) : [],
      })));
      setLoading(false);
    })();
  }, [userId]);

  const removeListing = async (id: string) => {
    await supabase.from('listings').update({ status: 'sold' }).eq('id', id);
    setListings(prev => prev.filter(l => l.id !== id));
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border/30">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
        <div className="relative flex items-center justify-between px-4 py-3.5 max-w-lg mx-auto">
          <button
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-[14px] font-semibold text-foreground tracking-[0.05em] uppercase">My Listings</h1>
          <Link href="/app/create" className="text-accent hover:text-accent/80 transition-colors">
            <PlusCircle className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-5 pt-5 pb-12">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[0,1,2,3].map(i => (
              <div key={i} className="rounded-2xl overflow-hidden bg-card border border-border/20">
                <div className="aspect-square bg-muted animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
                  <div className="h-2.5 w-1/2 rounded bg-muted animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <motion.div
            className="grid grid-cols-2 gap-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {listings.map((listing) => {
              const sideLabel   = listing.foot_side === 'L' ? 'Left' : listing.foot_side === 'R' ? 'Right' : 'Either';
              const sideVariant = listing.foot_side === 'L' ? 'left' as const : 'right' as const;
              return (
                <div key={listing.id} className="overflow-hidden rounded-2xl bg-card shadow-card border border-border/30 group">
                  <Link href={`/app/listing/${listing.id}`}>
                    <div className="aspect-square overflow-hidden bg-muted relative">
                      {listing.photos[0] ? (
                        <img
                          src={listing.photos[0]}
                          alt={`${listing.shoe_brand} ${listing.shoe_model}`}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-5xl opacity-30">👟</div>
                      )}
                      <div className="absolute top-2 left-2">
                        <Badge variant={sideVariant} className="text-[10px] shadow-sm backdrop-blur-sm">
                          {sideLabel}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-3 space-y-1">
                      <p className="font-semibold text-sm text-foreground leading-tight truncate">
                        {listing.shoe_brand} {listing.shoe_model}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Size US {listing.size} · {CONDITION_LABELS[listing.condition] ?? listing.condition}
                      </p>
                      <p className="font-bold text-base text-foreground">
                        {listing.price != null ? `$${listing.price}` : '$—'}
                      </p>
                    </div>
                  </Link>
                  <div className="px-3 pb-3">
                    <button
                      onClick={() => removeListing(listing.id)}
                      className="w-full text-[11px] text-destructive/60 hover:text-destructive transition-colors py-1.5 border border-destructive/20 rounded-lg hover:bg-destructive/5"
                    >
                      Remove listing
                    </button>
                  </div>
                </div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            className="text-center py-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <ShoppingBag className="h-8 w-8 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground/50">No listings yet</p>
            <Link
              href="/app/create"
              className="text-xs text-accent font-semibold mt-3 inline-block hover:underline"
            >
              List your first shoe
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}

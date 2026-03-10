'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SlidersHorizontal, X, Search, Heart } from 'lucide-react';

interface Listing {
  id: string;
  shoe_brand: string;
  shoe_model: string;
  size: number;
  foot_side: string;
  condition: string;
  price: number | null;
  photos: string[];
  sellerName: string;
  sellerLocation: string;
}

interface Filters {
  size: string;
  side: string;
  condition: string;
  brand: string;
  maxPrice: number;
}

const CONDITIONS = ['new_with_tags', 'new_without_tags', 'excellent', 'good', 'fair', 'poor'];
const CONDITION_LABELS: Record<string, string> = {
  new_with_tags: 'New (tags)', new_without_tags: 'New', excellent: 'Excellent',
  good: 'Good', fair: 'Fair', poor: 'Poor',
};

function ListingCard({ listing }: { listing: Listing }) {
  const sideVariant = listing.foot_side === 'L' ? 'left' : 'right';
  const sideLabel   = listing.foot_side === 'L' ? 'Left' : listing.foot_side === 'R' ? 'Right' : 'Either';

  return (
    <Link href={`/app/listing/${listing.id}`} className="group block">
      <div className="overflow-hidden rounded-2xl bg-card shadow-card hover-lift border border-border/30">
        <div className="aspect-square overflow-hidden bg-muted relative">
          {listing.photos[0] ? (
            <img
              src={listing.photos[0]}
              alt={`${listing.shoe_brand} ${listing.shoe_model}`}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-5xl opacity-30">👟</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-2 left-2">
            <Badge variant={sideVariant} className="shadow-sm backdrop-blur-sm text-[10px]">
              {sideLabel}
            </Badge>
          </div>
          <button className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-card/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-card shadow-sm">
            <Heart className="h-3.5 w-3.5 text-foreground" />
          </button>
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
      </div>
    </Link>
  );
}

export default function BrowsePage() {
  const [listings,    setListings]    = useState<Listing[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({
    size: 'all', side: 'all', condition: 'all', brand: 'all', maxPrice: 500,
  });

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('listings')
        .select('id, shoe_brand, shoe_model, size, foot_side, condition, price, photos, users!listings_user_id_fkey(name, location)')
        .eq('status', 'active')
        .limit(50);

      const mapped: Listing[] = (data ?? []).map((r: Record<string, unknown>) => {
        const profile = r.users as Record<string, string> | null;
        return {
          id:              r.id as string,
          shoe_brand:      r.shoe_brand as string,
          shoe_model:      r.shoe_model as string,
          size:            r.size as number,
          foot_side:       r.foot_side as string,
          condition:       r.condition as string,
          price:           r.price as number | null,
          photos:          Array.isArray(r.photos) ? (r.photos as string[]) : [],
          sellerName:      profile?.name ?? 'User',
          sellerLocation:  profile?.location ?? '',
        };
      });
      setListings(mapped);
      setLoading(false);
    })();
  }, []);

  const brands = useMemo(() => [...new Set(listings.map(l => l.shoe_brand))], [listings]);

  const filtered = useMemo(() => {
    return listings.filter(l => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!l.shoe_brand.toLowerCase().includes(q) && !l.shoe_model.toLowerCase().includes(q)) return false;
      }
      if (filters.size !== 'all' && String(l.size) !== filters.size) return false;
      if (filters.side !== 'all' && l.foot_side !== filters.side) return false;
      if (filters.condition !== 'all' && l.condition !== filters.condition) return false;
      if (filters.brand !== 'all' && l.shoe_brand !== filters.brand) return false;
      if (l.price != null && l.price > filters.maxPrice) return false;
      return true;
    });
  }, [filters, searchQuery, listings]);

  const activeFilterCount = [filters.size, filters.side, filters.condition, filters.brand].filter(f => f !== 'all').length +
    (filters.maxPrice < 500 ? 1 : 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 glass-nav border-b border-border/50 px-4 pt-3 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-display text-lg font-bold text-foreground">Browse</h1>
          <Button
            variant={showFilters ? 'accent' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-1.5 rounded-full relative"
          >
            {showFilters ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
            Filters
            {activeFilterCount > 0 && !showFilters && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full gradient-warm text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search brand or model..."
            className="w-full pl-9 pr-3 h-10 bg-secondary/50 border border-border/30 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-accent/50 transition-colors"
          />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4">
        {/* Filters panel */}
        {showFilters && (
          <div className="mb-4 p-4 rounded-2xl bg-card border border-border/30 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-foreground">Filters</h3>
              <button
                onClick={() => setFilters({ size: 'all', side: 'all', condition: 'all', brand: 'all', maxPrice: 500 })}
                className="text-xs text-accent font-semibold"
              >
                Reset all
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {/* Side */}
              <div>
                <label className="text-[11px] text-muted-foreground font-medium mb-1 block">Side</label>
                <select
                  value={filters.side}
                  onChange={e => setFilters(f => ({ ...f, side: e.target.value }))}
                  className="w-full h-9 rounded-lg bg-secondary border border-border/30 text-sm text-foreground px-2 outline-none"
                >
                  <option value="all">All</option>
                  <option value="L">Left</option>
                  <option value="R">Right</option>
                </select>
              </div>
              {/* Condition */}
              <div>
                <label className="text-[11px] text-muted-foreground font-medium mb-1 block">Condition</label>
                <select
                  value={filters.condition}
                  onChange={e => setFilters(f => ({ ...f, condition: e.target.value }))}
                  className="w-full h-9 rounded-lg bg-secondary border border-border/30 text-sm text-foreground px-2 outline-none"
                >
                  <option value="all">All</option>
                  {CONDITIONS.map(c => <option key={c} value={c}>{CONDITION_LABELS[c]}</option>)}
                </select>
              </div>
              {/* Brand */}
              <div>
                <label className="text-[11px] text-muted-foreground font-medium mb-1 block">Brand</label>
                <select
                  value={filters.brand}
                  onChange={e => setFilters(f => ({ ...f, brand: e.target.value }))}
                  className="w-full h-9 rounded-lg bg-secondary border border-border/30 text-sm text-foreground px-2 outline-none"
                >
                  <option value="all">All brands</option>
                  {brands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              {/* Max price */}
              <div>
                <label className="text-[11px] text-muted-foreground font-medium mb-1 block">
                  Max price: ${filters.maxPrice}
                </label>
                <input
                  type="range"
                  min="0" max="500" step="10"
                  value={filters.maxPrice}
                  onChange={e => setFilters(f => ({ ...f, maxPrice: Number(e.target.value) }))}
                  className="w-full accent-accent"
                />
              </div>
            </div>
            <Button variant="accent" className="w-full rounded-xl" onClick={() => setShowFilters(false)}>
              Apply filters
            </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground mb-4 font-medium">
          {loading ? 'Loading...' : `${filtered.length} listing${filtered.length !== 1 ? 's' : ''} available`}
        </p>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[0,1,2,3].map(i => (
              <div key={i} className="rounded-2xl overflow-hidden bg-card border border-border/20">
                <div className="aspect-square bg-muted animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
                  <div className="h-2.5 w-1/2 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((listing, i) => (
              <div
                key={listing.id}
                className={`opacity-0 animate-fade-in stagger-${Math.min(i + 1, 6)}`}
              >
                <ListingCard listing={listing} />
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Search className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-foreground font-semibold mb-1">No listings found</p>
            <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters or search</p>
            <Button
              variant="accent"
              className="rounded-full"
              onClick={() => { setFilters({ size: 'all', side: 'all', condition: 'all', brand: 'all', maxPrice: 500 }); setSearchQuery(''); }}
            >
              Clear all
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

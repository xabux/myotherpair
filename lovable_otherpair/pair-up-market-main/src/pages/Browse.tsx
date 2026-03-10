import { useState, useMemo } from "react";
import { sampleListings, findMatches } from "@/data/sampleData";
import ListingCard from "@/components/ListingCard";
import FiltersPanel, { FiltersState } from "@/components/FiltersPanel";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SlidersHorizontal, X, Search } from "lucide-react";

const Browse = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FiltersState>({
    size: "all", side: "all", condition: "all", brand: "all", maxPrice: 200,
  });

  const brands = useMemo(() => [...new Set(sampleListings.map((l) => l.brand))], []);

  const filtered = useMemo(() => {
    return sampleListings.filter((l) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!l.brand.toLowerCase().includes(q) && !l.model.toLowerCase().includes(q)) return false;
      }
      if (filters.size !== "all" && l.size !== Number(filters.size)) return false;
      if (filters.side !== "all" && l.side !== filters.side) return false;
      if (filters.condition !== "all" && l.condition !== filters.condition) return false;
      if (filters.brand !== "all" && l.brand !== filters.brand) return false;
      if (l.price > filters.maxPrice) return false;
      return true;
    });
  }, [filters, searchQuery]);

  const activeFilterCount = [filters.size, filters.side, filters.condition, filters.brand].filter(f => f !== "all").length + (filters.maxPrice < 200 ? 1 : 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 glass-nav border-b border-border/50 px-4 pt-3 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-display text-lg font-bold text-foreground">Browse</h1>
          <Button
            variant={showFilters ? "accent" : "outline"}
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
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search brand or model..."
            className="pl-9 rounded-xl h-10 bg-muted/50 border-border/30"
          />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4">
        {showFilters && (
          <div className="mb-4 animate-fade-in">
            <FiltersPanel
              filters={filters}
              onChange={setFilters}
              onClose={() => setShowFilters(false)}
              brands={brands}
            />
          </div>
        )}

        <p className="text-xs text-muted-foreground mb-4 font-medium">
          {filtered.length} listing{filtered.length !== 1 ? "s" : ""} available
        </p>

        <div className="grid grid-cols-2 gap-3">
          {filtered.map((listing, i) => (
            <div key={listing.id} className={`opacity-0 animate-fade-in stagger-${Math.min(i + 1, 6)}`}>
              <ListingCard
                listing={listing}
                matchCount={findMatches(listing, sampleListings).length}
              />
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Search className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-foreground font-semibold mb-1">No listings found</p>
            <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters or search</p>
            <Button variant="accent" className="rounded-full" onClick={() => { setFilters({ size: "all", side: "all", condition: "all", brand: "all", maxPrice: 200 }); setSearchQuery(""); }}>
              Clear all
            </Button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Browse;

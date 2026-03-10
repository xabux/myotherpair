import { useParams, Link } from "react-router-dom";
import { sampleListings, sampleUsers, findMatches } from "@/data/sampleData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MatchCard from "@/components/MatchCard";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft, MapPin, MessageCircle, Star, Heart, Share2, ArrowLeftRight } from "lucide-react";

const ListingDetail = () => {
  const { id } = useParams();
  const listing = sampleListings.find((l) => l.id === id);

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Listing not found</p>
      </div>
    );
  }

  const seller = sampleUsers.find((u) => u.id === listing.userId);
  const matches = findMatches(listing, sampleListings);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Image */}
      <div className="relative">
        <div className="aspect-[4/3] bg-muted overflow-hidden">
          <img src={listing.photo} alt={`${listing.brand} ${listing.model}`} className="w-full h-full object-cover" />
        </div>
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <Link
            to="/browse"
            className="h-10 w-10 rounded-full bg-card/80 backdrop-blur-md flex items-center justify-center shadow-card border border-border/30"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex gap-2">
            <button className="h-10 w-10 rounded-full bg-card/80 backdrop-blur-md flex items-center justify-center shadow-card border border-border/30">
              <Share2 className="h-4 w-4" />
            </button>
            <button className="h-10 w-10 rounded-full bg-card/80 backdrop-blur-md flex items-center justify-center shadow-card border border-border/30">
              <Heart className="h-4 w-4" />
            </button>
          </div>
        </div>
        {/* Floating badges */}
        <div className="absolute bottom-3 left-4 flex gap-2">
          <Badge variant={listing.side === "Left" ? "left" : "right"} className="shadow-sm backdrop-blur-sm text-xs px-3 py-1">
            {listing.side} shoe
          </Badge>
          <Badge variant="condition" className="shadow-sm backdrop-blur-sm text-xs px-3 py-1">
            {listing.condition}
          </Badge>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-5 animate-fade-in">
        {/* Title & price */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground leading-tight">
              {listing.brand} {listing.model}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Size UK {listing.size} · {listing.category}</p>
          </div>
          <p className="text-3xl font-bold text-foreground whitespace-nowrap">£{listing.price}</p>
        </div>

        {/* Description */}
        <div className="p-4 rounded-2xl bg-muted/30 border border-border/30">
          <p className="text-sm text-foreground leading-relaxed">{listing.description}</p>
        </div>

        {/* Seller */}
        {seller && (
          <Link to={`/profile/${seller.id}`} className="flex items-center gap-3 p-4 rounded-2xl gradient-card shadow-card border border-border/30 hover-lift">
            <div className="relative">
              <img src={seller.avatar} alt={seller.name} className="w-12 h-12 rounded-xl object-cover" />
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-match-green border-2 border-card" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground">{seller.name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" /> {seller.location}
              </p>
              {seller.reviews.length > 0 && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="h-3 w-3 fill-accent text-accent" />
                  <span className="text-xs font-medium text-foreground">
                    {(seller.reviews.reduce((s, r) => s + r.rating, 0) / seller.reviews.length).toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">({seller.reviews.length})</span>
                </div>
              )}
            </div>
          </Link>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Link to={`/messages/${listing.id}`} className="flex-1">
            <Button variant="hero" size="lg" className="w-full gap-2 rounded-xl text-base shadow-elevated hover:shadow-glow transition-shadow" style={{ height: 52 }}>
              <MessageCircle className="h-5 w-5" /> Message seller
            </Button>
          </Link>
        </div>

        {/* Matches */}
        {matches.length > 0 && (
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-match-green/10 flex items-center justify-center">
                <ArrowLeftRight className="h-3.5 w-3.5 text-match-green" />
              </div>
              <h2 className="font-display text-lg font-bold text-foreground">
                Compatible matches
              </h2>
              <span className="ml-auto text-xs font-semibold text-match-green bg-match-green/10 px-2.5 py-1 rounded-full">
                {matches.length} found
              </span>
            </div>
            <div className="space-y-3">
              {matches.map((m, i) => (
                <div key={m.id} className={`opacity-0 animate-fade-in stagger-${i + 1}`}>
                  <MatchCard listing={m} originalListing={listing} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default ListingDetail;

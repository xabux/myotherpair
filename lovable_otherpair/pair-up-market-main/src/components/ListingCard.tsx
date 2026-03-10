import { Listing } from "@/data/sampleData";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

interface ListingCardProps {
  listing: Listing;
  matchCount?: number;
}

const ListingCard = ({ listing, matchCount }: ListingCardProps) => {
  return (
    <Link to={`/listing/${listing.id}`} className="group block">
      <div className="overflow-hidden rounded-2xl gradient-card shadow-card hover-lift border border-border/30">
        <div className="aspect-square overflow-hidden bg-muted relative">
          <img
            src={listing.photo}
            alt={`${listing.brand} ${listing.model}`}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-2 left-2">
            <Badge variant={listing.side === "Left" ? "left" : "right"} className="shadow-sm backdrop-blur-sm text-[10px]">
              {listing.side}
            </Badge>
          </div>
          {matchCount !== undefined && matchCount > 0 && (
            <div className="absolute top-2 right-2">
              <Badge variant="match" className="shadow-sm backdrop-blur-sm text-[10px]">
                {matchCount} match{matchCount > 1 ? "es" : ""}
              </Badge>
            </div>
          )}
          {/* Wishlist button */}
          <button className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-card/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-card shadow-sm">
            <Heart className="h-3.5 w-3.5 text-foreground" />
          </button>
        </div>
        <div className="p-3 space-y-1">
          <p className="font-semibold text-sm text-foreground leading-tight truncate">
            {listing.brand} {listing.model}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Size UK {listing.size} · {listing.condition}
          </p>
          <p className="font-bold text-base text-foreground">£{listing.price}</p>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;

import { Listing } from "@/data/sampleData";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowLeftRight } from "lucide-react";

interface MatchCardProps {
  listing: Listing;
  originalListing: Listing;
}

const MatchCard = ({ listing, originalListing }: MatchCardProps) => {
  return (
    <Link to={`/listing/${listing.id}`} className="group block">
      <div className="overflow-hidden rounded-2xl border border-match-green/20 hover-lift bg-match-green/[0.03]">
        <div className="bg-match-green/[0.06] px-4 py-2.5 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-match-green/15 flex items-center justify-center">
            <ArrowLeftRight className="h-3 w-3 text-match-green" />
          </div>
          <span className="text-xs font-semibold text-match-green">Compatible Match</span>
          <span className="ml-auto text-[10px] text-match-green/60 font-medium">Same size · Opposite side</span>
        </div>
        <div className="flex p-3 gap-3">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0 shadow-sm">
            <img
              src={listing.photo}
              alt={`${listing.brand} ${listing.model}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="flex-1 min-w-0 py-0.5">
            <p className="font-semibold text-sm text-foreground truncate">
              {listing.brand} {listing.model}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Badge variant={listing.side === "Left" ? "left" : "right"} className="text-[10px] px-2 py-0">
                {listing.side}
              </Badge>
              <span className="text-xs text-muted-foreground">UK {listing.size}</span>
              <span className="text-xs text-muted-foreground">· {listing.condition}</span>
            </div>
            <p className="font-bold text-base text-foreground mt-1.5">£{listing.price}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MatchCard;

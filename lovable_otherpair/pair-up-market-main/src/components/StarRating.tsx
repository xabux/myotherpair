import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  size?: number;
}

const StarRating = ({ rating, size = 14 }: StarRatingProps) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${i <= rating ? "fill-accent text-accent" : "text-border"}`}
          style={{ width: size, height: size }}
        />
      ))}
    </div>
  );
};

export default StarRating;

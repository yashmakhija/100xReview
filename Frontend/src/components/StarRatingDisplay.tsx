import React from "react";
import { Star, StarOff } from "lucide-react";

interface StarRatingDisplayProps {
  rating?: number;
}

export const StarRatingDisplay: React.FC<StarRatingDisplayProps> = ({ rating }) => {
  if (!rating) return null;
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {star <= rating ? (
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            ) : (
              <StarOff className="w-5 h-5 text-gray-300" />
            )}
          </span>
        ))}
      </div>
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {rating}/5
      </span>
    </div>
  );
}; 
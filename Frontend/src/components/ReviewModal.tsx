import React from "react";
import { X, Star, StarOff } from "lucide-react";

interface ReviewModalProps {
  review: {
    reviewNotes?: string | null;
    reviewVideoUrl?: string | null;
    projectName: string;
    userName: string;
    rating?: number | null;
  };
  onClose: () => void;
}

// Static Star Rating Display
const StarRatingDisplay: React.FC<{ rating?: number }> = ({ rating }) => {
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

const ReviewModal: React.FC<ReviewModalProps> = ({ review, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-800 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-zinc-700">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold dark:text-white">
                {review.projectName}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Submitted by: {review.userName}
              </p>
              {review.rating && (
                <div className="mt-3">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Project Rating
                  </h3>
                  <StarRatingDisplay rating={review.rating} />
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Review Notes */}
          {review.reviewNotes && (
            <div>
              <h3 className="text-lg font-semibold mb-3 dark:text-white">
                Review Notes
              </h3>
              <div className="bg-gray-50 dark:bg-zinc-700 rounded-lg p-4">
                <div className="prose dark:prose-invert max-w-none">
                  {review.reviewNotes.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-2 last:mb-0 text-gray-700 dark:text-gray-300">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Review Video */}
          {review.reviewVideoUrl && (
            <div>
              <h3 className="text-lg font-semibold mb-4 dark:text-white">
                Review Video
              </h3>
              <div className="relative w-full rounded-lg overflow-hidden bg-gray-50 dark:bg-zinc-700" style={{ paddingTop: "56.25%" }}>
                <iframe
                  src={review.reviewVideoUrl}
                  className="absolute inset-0 w-full h-full"
                  loading="lazy"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-zinc-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;

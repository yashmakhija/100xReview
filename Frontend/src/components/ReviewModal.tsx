import React from "react";
import { X } from "lucide-react";

interface ReviewModalProps {
  review: {
    reviewNotes?: string;
    reviewVideoUrl?: string;
    projectName?: string;
    userName?: string;
  };
  onClose: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ review, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            Review for {review.projectName}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Submitted by: {review.userName}
        </p>
        {review.reviewVideoUrl && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Review Video</h3>
            <video
              src={review.reviewVideoUrl}
              controls
              className="w-full rounded-lg"
            />
          </div>
        )}
        {review.reviewNotes && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Review Notes</h3>
            <div className="bg-gray-100 dark:bg-zinc-700 rounded-lg p-4">
              <pre className="whitespace-pre-wrap">{review.reviewNotes}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;

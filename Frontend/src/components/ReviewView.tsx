import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ReviewViewProps {
  reviewNotes?: string;
  reviewVideo?: string;
  projectName?: string;
  userName?: string;
}

export const ReviewView: React.FC<ReviewViewProps> = ({
  reviewNotes,
  reviewVideo,
  projectName,
  userName,
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold">Review for {projectName}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Submitted by {userName}
          </p>
        </div>
      </div>

      {reviewVideo && (
        <div className="aspect-video rounded-lg overflow-hidden bg-black">
          <video
            src={reviewVideo}
            controls
            className="w-full h-full"
            autoPlay
          />
        </div>
      )}

      {reviewNotes && (
        <div className="space-y-2">
          <h2 className="text-lg font-medium">Review Notes</h2>
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-zinc-800/50">
            <pre className="whitespace-pre-wrap text-sm">{reviewNotes}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

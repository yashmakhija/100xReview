import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRecoilState, useResetRecoilState } from "recoil";
import {
  Github,
  Globe,
  Send,
  ArrowLeft,
  X,
  Zap,
  CheckCircle,
  Star,
  StarOff,
} from "lucide-react";
import {
  getSubmittedProjectsCourse,
  reviewProject,
  uploadReviewVideo,
} from "../lib/api";
import ScreenRecorder from "./ScreenRecorder";
import {
  submissionState,
  reviewNotesState,
  reviewErrorState,
  isLoadingState,
  validationErrorsState,
  newRecordingBlobState,
} from "../atoms/projectReviewAtoms";
import { Submission } from "../types/submission";
import Loading from "./Loader";
import { LoadingSpinner } from "./LoadingSpinner";

// Toast Component
const Toast: React.FC<{
  message: string;
  type: "success" | "error";
  onClose: () => void;
}> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white ${
        type === "success" ? "bg-green-500" : "bg-red-500"
      }`}
    >
      {message}
    </div>
  );
};

// Add ProgressBar component
const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
    <div
      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
      style={{ width: `${progress}%` }}
    />
  </div>
);

// Add StarRating component
const StarRating: React.FC<{
  rating: number;
  onRatingChange: (rating: number) => void;
  disabled?: boolean;
}> = ({ rating, onRatingChange, disabled = false }) => {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onRatingChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(null)}
          className={`focus:outline-none transition-colors ${
            disabled ? "cursor-default" : "cursor-pointer hover:scale-110"
          }`}
        >
          {(hover || rating) >= star ? (
            <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
          ) : (
            <StarOff className="w-8 h-8 text-gray-300" />
          )}
        </button>
      ))}
      <span className="ml-2 text-gray-600 font-medium">
        {rating > 0 ? `${rating}/5` : "Select rating"}
      </span>
    </div>
  );
};

const ProjectReview: React.FC = () => {
  const navigate = useNavigate();
  const { projectId, submissionId } = useParams<{
    projectId: string;
    submissionId: string;
  }>();

  const [submission, setSubmission] = useRecoilState(submissionState);
  const [reviewNotes, setReviewNotes] = useRecoilState(reviewNotesState);
  const [error, setError] = useRecoilState(reviewErrorState);
  const [isLoading, setIsLoading] = useRecoilState(isLoadingState);
  const [validationErrors, setValidationErrors] = useRecoilState(
    validationErrorsState
  );
  const [newRecordingBlob, setNewRecordingBlob] = useRecoilState(
    newRecordingBlobState
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [uploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "processing" | "success" | "error"
  >("idle");
  const [rating, setRating] = useState<number>(0);

  const resetSubmission = useResetRecoilState(submissionState);
  const resetReviewNotes = useResetRecoilState(reviewNotesState);
  const resetError = useResetRecoilState(reviewErrorState);
  const resetValidationErrors = useResetRecoilState(validationErrorsState);
  const resetNewRecordingBlob = useResetRecoilState(newRecordingBlobState);

  const predefinedTags: ("Good Work" | "Amazing" | "Okayish")[] = [
    "Good Work",
    "Amazing",
    "Okayish",
  ];
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  const toggleTag = useCallback(
    (tag: "Good Work" | "Amazing" | "Okayish") => {
      const messages = {
        "Good Work":
          "The project demonstrates solid implementation and good understanding of core concepts. The code is well-structured and follows best practices. Good job on completing the requirements effectively.",
        Amazing:
          "Exceptional work! The implementation shows advanced understanding and excellent attention to detail. The code quality is outstanding with great organization and proper use of design patterns.",
        Okayish:
          "The project meets the basic requirements. Consider improving code organization and implementing more robust error handling. There's room for enhancement in terms of best practices and code structure.",
      };

      setSelectedTags([tag]); // Only allow one tag at a time
      setReviewNotes(messages[tag]); // Set the review notes directly
    },
    [setReviewNotes]
  );

  useEffect(() => {
    const fetchSubmission = async () => {
      setIsLoading(true);
      try {
        const submissions = await getSubmittedProjectsCourse(Number(projectId));
        const foundSubmission = submissions.find(
          (sub: Submission) => sub.id === Number(submissionId)
        );
        if (foundSubmission) {
          setSubmission({
            ...foundSubmission,
            rating: foundSubmission.rating || null,
            reviewNotes: foundSubmission.reviewNotes || null,
            reviewVideoUrl: foundSubmission.reviewVideoUrl || null
          } as Submission);
          
          // Set existing review data if available
          if (foundSubmission.isReviewed) {
            setReviewNotes(foundSubmission.reviewNotes || "");
            setRating(foundSubmission.rating || 0);
          }
        } else {
          setError("Submission not found");
        }
      } catch (error) {
        console.error("Error fetching submission:", error);
        setError("Failed to fetch submission");
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId && submissionId) {
      fetchSubmission();
    }

    return () => {
      resetSubmission();
      resetReviewNotes();
      resetError();
      resetValidationErrors();
      resetNewRecordingBlob();
    };
  }, [
    projectId,
    submissionId,
    setSubmission,
    setReviewNotes,
    setError,
    setIsLoading,
    resetSubmission,
    resetReviewNotes,
    resetError,
    resetValidationErrors,
    resetNewRecordingBlob,
  ]);

  const handleRecordingComplete = (blob: Blob) => {
    setNewRecordingBlob(blob);
    setUploadStatus("idle");
  };

  const handleReviewSubmit = async () => {
    if (!submission || isSubmitting) return;
    setIsSubmitting(true);
    setValidationErrors({});

    try {
      // Validate required fields
      if (!reviewNotes.trim()) {
        setValidationErrors((prev) => ({
          ...prev,
          reviewNotes: "Review notes are required",
        }));
        showToast("Review notes are required", "error");
        setIsSubmitting(false);
        return;
      }

      if (!rating || rating === 0) {
        setValidationErrors((prev) => ({
          ...prev,
          rating: "Rating is required",
        }));
        showToast("Rating is required", "error");
        setIsSubmitting(false);
        return;
      }

      // Get the current review video URL or use the existing one
      let reviewVideoUrl = null;

      if (newRecordingBlob) {
        try {
          setUploadStatus("uploading");
          const file = new File([newRecordingBlob], "review.webm", {
            type: newRecordingBlob.type,
          });

          const uploadResult = await uploadReviewVideo(submission.id, file);

          if (
            uploadResult?.success &&
            uploadResult?.submission?.reviewVideoUrl
          ) {
            reviewVideoUrl = uploadResult.submission.reviewVideoUrl;
            setUploadStatus("success");
          } else {
            throw new Error("Failed to get video URL after upload");
          }
        } catch (error) {
          setUploadStatus("error");
          showToast(
            "Video upload failed: " +
              (error instanceof Error ? error.message : "Unknown error"),
            "error"
          );
          setIsSubmitting(false);
          return;
        }
      } else if (submission.reviewVideoUrl) {
        reviewVideoUrl = submission.reviewVideoUrl;
      } else {
        setValidationErrors((prev) => ({
          ...prev,
          video: "Review video is required",
        }));
        showToast("Please record a review video", "error");
        setIsSubmitting(false);
        return;
      }

      // Submit the review with all required data
      console.log("Submitting review:", {
        submissionId: submission.id,
        reviewNotes,
        reviewVideoUrl,
        rating,
      });

      const response = await reviewProject(
        submission.id,
        reviewNotes,
        reviewVideoUrl,
        rating
      );

      if (response.success) {
        showToast("Review submitted successfully", "success");
        
        // Update local state with type safety
        if (submission) {
          setSubmission({
            ...submission,
            isReviewed: true,
            reviewNotes: reviewNotes,
            reviewVideoUrl: reviewVideoUrl || undefined,
            rating: rating
          } as Submission);  // Add type assertion here
        }

        // Navigate after success
        setTimeout(() => navigate("/admin"), 1500);
      } else {
        throw new Error(response.error || "Failed to submit review");
      }
    } catch (error) {
      console.error("Review submission error:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to submit review",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderUploadStatus = () => {
    if (uploadStatus === "idle") return null;

    const statusConfig = {
      uploading: {
        text: "Uploading video...",
        color: "text-blue-500",
      },
      processing: {
        text: "Processing video...",
        color: "text-yellow-500",
      },
      success: {
        text: "Video uploaded successfully!",
        color: "text-green-500",
      },
      error: {
        text: "Failed to upload video",
        color: "text-red-500",
      },
    };

    const config = statusConfig[uploadStatus];

    return (
      <div className={`mt-2 flex items-center ${config.color}`}>
        {uploadStatus === "uploading" || uploadStatus === "processing" ? (
          <LoadingSpinner />
        ) : uploadStatus === "success" ? (
          <CheckCircle className="w-5 h-5 mr-2" />
        ) : (
          <X className="w-5 h-5 mr-2" />
        )}
        <span>{config.text}</span>
        {uploadProgress > 0 && uploadProgress < 100 && (
          <ProgressBar progress={uploadProgress} />
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <Loading size="medium" />
        <p className="mt-4 text-lg font-medium text-gray-600">
          Loading submission...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => navigate("/admin")}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Section */}
      <header className="bg-white shadow-md py-4 px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/admin")}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Project Review
              </h1>
              <p className="text-sm text-gray-500">
                Submission ID: {submissionId}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <img
              className="h-10 w-10 rounded-full"
              src="https://appx-wsb-gcp.akamai.net.in/subject/2023-01-17-0.17044360120951185.jpg"
              alt="100xReview Logo"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Details Card */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Project Details</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Project Name
                  </h3>
                  <p className="mt-1 text-lg text-gray-900">
                    {submission?.project.name}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Description
                  </h3>
                  <p className="mt-1 text-gray-600">
                    {submission?.project.description}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Submitted By
                  </h3>
                  <div className="mt-1">
                    <p className="text-gray-900">{submission?.user.name}</p>
                    <p className="text-gray-500 text-sm">
                      {submission?.user.email}
                    </p>
                  </div>
                </div>

                {/* Project Links */}
                <div className="pt-4 space-y-3">
                  {submission?.githubUrl && (
                    <a
                      href={submission.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
                    >
                      <Github className="w-5 h-5 mr-2" />
                      View GitHub Repository
                    </a>
                  )}
                  {submission?.deployUrl && (
                    <a
                      href={submission.deployUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      <Globe className="w-5 h-5 mr-2" />
                      View Deployed Project
                    </a>
                  )}
                  {submission?.wsUrl && (
                    <a
                      href={submission.wsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      View WebSocket URL
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Review Form Card */}
          {submission?.isReviewed ? (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Project Already Reviewed
                </h3>
                <p className="text-gray-600 mb-4">
                  This project has already been reviewed. You can view the
                  review details above.
                </p>
                <button
                  onClick={() => navigate("/admin")}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Quick Review Templates */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Quick Review Templates
                </h3>
                <div className="flex flex-wrap gap-2">
                  {predefinedTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all transform hover:scale-105 ${
                        selectedTags.includes(tag)
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                      }`}
                    >
                      {tag}
                      {selectedTags.includes(tag) && (
                        <X className="w-4 h-4 ml-2 inline-block" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating Section */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Project Rating</h3>
                <StarRating
                  rating={rating}
                  onRatingChange={setRating}
                  disabled={isSubmitting || uploadStatus === "processing"}
                />
                {validationErrors.rating && (
                  <p className="mt-2 text-sm text-red-600">
                    {validationErrors.rating}
                  </p>
                )}
              </div>

              {/* Review Notes */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Review Notes</h3>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className={`w-full px-4 py-3 text-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.reviewNotes
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  rows={6}
                  placeholder="Enter your detailed review notes here..."
                />
                {validationErrors.reviewNotes && (
                  <p className="mt-2 text-sm text-red-600">
                    {validationErrors.reviewNotes}
                  </p>
                )}
              </div>

              {/* Screen Recording */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Screen Recording</h3>
                <ScreenRecorder onRecordingComplete={handleRecordingComplete} />
                {renderUploadStatus()}
                {newRecordingBlob && (
                  <div className="mt-4">
                    <video
                      src={URL.createObjectURL(newRecordingBlob)}
                      controls
                      className="w-full rounded-lg"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
                {validationErrors.video && (
                  <p className="mt-2 text-sm text-red-600">
                    {validationErrors.video}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleReviewSubmit}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center px-6 py-3 rounded-lg text-white text-lg font-medium transition-all transform hover:scale-105 bg-blue-600 hover:bg-blue-700 shadow-lg"
              >
                <Send className="w-5 h-5 mr-2" />
                Submit Review
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ProjectReview;

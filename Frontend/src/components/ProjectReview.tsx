import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRecoilState, useResetRecoilState } from "recoil";
import { Github, Globe, Send, ArrowLeft, X } from "lucide-react";
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
          setSubmission(foundSubmission);
          setReviewNotes(foundSubmission.reviewNotes || "");
        } else {
          setError("Submission not found");
        }
      } catch (error) {
        setError("Failed to fetch submission");
        console.error("Error fetching submission:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmission();

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
  };

  const handleReviewSubmit = async () => {
    if (!submission || isSubmitting) return;
    setIsSubmitting(true);
    setValidationErrors({});

    try {
      if (!reviewNotes.trim()) {
        setValidationErrors((prev) => ({
          ...prev,
          reviewNotes: "Review notes are required",
        }));
        showToast("Review notes are required", "error");
        return;
      }

      let reviewVideoUrl = submission.reviewVideoUrl;

      if (newRecordingBlob) {
        const file = new File([newRecordingBlob], "review.webm", {
          type: newRecordingBlob.type,
        });

        const uploadResult = await uploadReviewVideo(submission.id, file);
        if (uploadResult?.submission?.reviewVideoUrl) {
          reviewVideoUrl = uploadResult.submission.reviewVideoUrl;
        } else {
          throw new Error("Failed to upload video");
        }
      }

      if (!reviewVideoUrl) {
        setValidationErrors((prev) => ({
          ...prev,
          reviewVideoUrl: "Review video is required",
        }));
        showToast("Review video is required", "error");
        return;
      }

      await reviewProject(submission.id, reviewNotes, reviewVideoUrl);

      setSubmission({
        ...submission,
        isReviewed: true,
        reviewNotes,
        reviewVideoUrl,
      });

      setNewRecordingBlob(null);
      localStorage.setItem("reviewSuccess", "true");
      localStorage.setItem("reviewTimestamp", Date.now().toString());
      showToast("Review submitted successfully", "success");
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Give toast time to show
      navigate("/admin");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit review";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
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
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-7xl mx-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/admin")}
              className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold">{submission?.project.name}</h1>
          </div>
          <div className="text-sm text-gray-500">
            Submission ID: {submissionId}
          </div>
        </div>

        <div className="md:flex">
          <div className="md:w-1/2 p-6 bg-white">
            <h2 className="text-2xl font-bold mb-4">Project Details</h2>
            <p className="text-gray-600 mb-6">
              {submission?.project.description}
            </p>
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Submitted by</h3>
              <p className="text-gray-700">{submission?.user.name}</p>
              <p className="text-gray-500">{submission?.user.email}</p>
            </div>
            <div className="space-y-4">
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
            </div>
          </div>

          <div className="md:w-1/2 p-6 bg-gray-50 border-t md:border-t-0 md:border-l border-gray-200">
            <h2 className="text-2xl font-bold mb-6">Review Submission</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Review Templates
              </label>
              <div className="flex flex-wrap gap-2">
                {predefinedTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedTags.includes(tag)
                        ? "bg-blue-600 text-white"
                        : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                    }`}
                  >
                    {tag}
                    {selectedTags.includes(tag) && (
                      <X className="w-4 h-4 ml-1 inline-block" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="reviewNotes"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Review Notes
              </label>
              <textarea
                id="reviewNotes"
                rows={6}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className={`w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.reviewNotes
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Enter your review notes here..."
              />
              {validationErrors.reviewNotes && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.reviewNotes}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Screen Recording
              </label>
              <ScreenRecorder onRecordingComplete={handleRecordingComplete} />
            </div>

            <button
              onClick={handleReviewSubmit}
              disabled={isSubmitting}
              className={`w-full flex items-center justify-center px-4 py-2 rounded-md text-white transition-colors ${
                isSubmitting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loading size="small" />
                  Uploading...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Upload Video and Submit Review
                </>
              )}
            </button>

            {validationErrors.reviewVideoUrl && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.reviewVideoUrl}
              </p>
            )}

            {newRecordingBlob && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">New Recording</h3>
                <video
                  src={URL.createObjectURL(newRecordingBlob)}
                  controls
                  className="w-full rounded-lg"
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
                <p className="mt-2 text-sm text-gray-600">
                  Video size:{" "}
                  {(newRecordingBlob.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            )}

            {submission?.reviewVideoUrl && !newRecordingBlob && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">
                  Previous Review Video
                </h3>
                <video
                  src={submission.reviewVideoUrl}
                  controls
                  className="w-full rounded-lg"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </div>
        </div>
      </div>

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

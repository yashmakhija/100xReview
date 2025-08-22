import React, { useState } from "react";
import { X, BookOpen, Upload } from "lucide-react";
import { toast } from "react-hot-toast";

import { createCourse } from "../../../lib/admin-api";

interface CreateCourseModalProps {
  onClose: () => void;
  isDark: boolean;
  onCourseCreated: () => Promise<void>;
}

const CreateCourseModal: React.FC<CreateCourseModalProps> = ({
  onClose,
  isDark,
  onCourseCreated,
}) => {
  const [courseData, setCourseData] = useState({
    name: "",
    description: "",
    imageUrl: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createCourse(
        courseData.name,
        courseData.description,
        courseData.imageUrl || undefined
      );

      // Refresh courses list
      await onCourseCreated();

      // Show success toast
      toast.success(`Course "${courseData.name}" created successfully!`, {
        duration: 4000,
        position: "top-right",
      });

      onClose();
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create course. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className={`${
          isDark ? "bg-zinc-900" : "bg-white"
        } rounded-lg p-6 w-full max-w-md`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create New Course</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-opacity-80 ${
              isDark ? "hover:bg-zinc-800" : "hover:bg-gray-100"
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Course Name
            </label>
            <input
              type="text"
              required
              value={courseData.name}
              onChange={(e) =>
                setCourseData((prev) => ({ ...prev, name: e.target.value }))
              }
              className={`w-full p-2 rounded-md border ${
                isDark
                  ? "bg-zinc-800 border-zinc-700 text-white"
                  : "bg-white border-gray-200"
              }`}
              placeholder="Introduction to Web Development"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              required
              value={courseData.description}
              onChange={(e) =>
                setCourseData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className={`w-full p-2 rounded-md border ${
                isDark
                  ? "bg-zinc-800 border-zinc-700 text-white"
                  : "bg-white border-gray-200"
              }`}
              rows={4}
              placeholder="Provide a detailed description of the course..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Image URL <span className="text-gray-400">(Optional)</span>
            </label>
            <div className="relative">
              <input
                type="url"
                value={courseData.imageUrl}
                onChange={(e) =>
                  setCourseData((prev) => ({
                    ...prev,
                    imageUrl: e.target.value,
                  }))
                }
                className={`w-full p-2 pl-10 rounded-md border ${
                  isDark
                    ? "bg-zinc-800 border-zinc-700 text-white"
                    : "bg-white border-gray-200"
                }`}
                placeholder="https://example.com/course-image.jpg"
              />
              <Upload className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
              Provide a URL to an image that represents this course
            </p>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-md ${
                isDark
                  ? "bg-zinc-800 hover:bg-zinc-700"
                  : "bg-gray-100 hover:bg-gray-200"
              } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                isDark
                  ? "bg-white text-black hover:bg-gray-100"
                  : "bg-black text-white hover:bg-gray-900"
              } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4" />
                  Create Course
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourseModal;

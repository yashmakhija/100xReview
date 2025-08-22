import React, { useState, useEffect } from "react";
import { X, User } from "lucide-react";
import { toast } from "react-hot-toast";

import { createUser, fetchAllCoursesAdmin } from "../../../lib/admin-api";
import { AdminCourse } from "../../../types/admin-dashboard";

interface CreateUserModalProps {
  onClose: () => void;
  courses: AdminCourse[];
  isDark: boolean;
  onUserCreated: () => Promise<void>;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  onClose,
  courses: propCourses,
  isDark,
  onUserCreated,
}) => {
  const [localCourses, setLocalCourses] = useState<AdminCourse[]>(propCourses);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

  // Fetch courses directly from API to ensure we have the latest data
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoadingCourses(true);
        const fetchedCourses = await fetchAllCoursesAdmin();
        console.log("Fetched courses directly:", fetchedCourses);
        setLocalCourses(fetchedCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Failed to load courses");
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    number: "",
    role: "USER" as "USER" | "ADMIN",
    courseId: undefined as number | undefined,
  });

  // We no longer auto-select the first course
  // Let the user explicitly choose a course or select "No course assignment"

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create a new object without courseId if it's not selected
      const userDataToSubmit = { ...userData };

      // If courseId is undefined or empty string, remove it from the request
      if (!userDataToSubmit.courseId) {
        delete userDataToSubmit.courseId;
      }

      console.log("Submitting user data:", userDataToSubmit);
      await createUser(userDataToSubmit);

      // Refresh users list
      await onUserCreated();

      // Show success toast
      toast.success(`User ${userData.name} created successfully!`, {
        duration: 4000,
        position: "top-right",
      });

      onClose();
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create user. Please try again."
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
          <h2 className="text-xl font-semibold">Add New User</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-opacity-80 ${
              isDark ? "hover:bg-zinc-800" : "hover:bg-gray-100"
            }`}
          >
            <X className="h-5 w-5 cursor-pointer" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              required
              value={userData.name}
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, name: e.target.value }))
              }
              className={`w-full p-2 rounded-md border ${
                isDark
                  ? "bg-zinc-800 border-zinc-700 text-white"
                  : "bg-white border-gray-200"
              }`}
              placeholder="Yash Makhija"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={userData.email}
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, email: e.target.value }))
              }
              className={`w-full p-2 rounded-md border ${
                isDark
                  ? "bg-zinc-800 border-zinc-700 text-white"
                  : "bg-white border-gray-200"
              }`}
              placeholder="yash@100xDevs.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Phone Number <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="tel"
              value={userData.number}
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, number: e.target.value }))
              }
              className={`w-full p-2 rounded-md border ${
                isDark
                  ? "bg-zinc-800 border-zinc-700 text-white"
                  : "bg-white border-gray-200"
              }`}
              placeholder="+91 1234567890"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">User Role</label>
            <select
              value={userData.role}
              onChange={(e) =>
                setUserData((prev) => ({
                  ...prev,
                  role: e.target.value as "USER" | "ADMIN",
                }))
              }
              className={`w-full p-2 rounded-md border ${
                isDark
                  ? "bg-zinc-800 border-zinc-700 text-white"
                  : "bg-white border-gray-200"
              }`}
            >
              <option value="USER">Regular User</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Assign to Course <span className="text-gray-400">(Optional)</span>
            </label>
            <select
              value={userData.courseId === undefined ? "" : userData.courseId}
              onChange={(e) => {
                const value = e.target.value;
                setUserData((prev) => ({
                  ...prev,
                  courseId: value === "" ? undefined : Number(value),
                }));
              }}
              className={`w-full p-2 rounded-md border ${
                isDark
                  ? "bg-zinc-800 border-zinc-700 text-white"
                  : "bg-white border-gray-200"
              }`}
              disabled={isLoadingCourses}
            >
              <option value="">No course assignment</option>
              {isLoadingCourses ? (
                <option disabled>Loading courses...</option>
              ) : (
                localCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))
              )}
            </select>
            {isLoadingCourses && (
              <p className="text-xs mt-1 text-blue-500">
                Loading available courses...
              </p>
            )}
            <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
              A temporary password will be generated and sent to the user's
              email.
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
                  <User className="h-4 w-4" />
                  Create User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;

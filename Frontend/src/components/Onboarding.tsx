import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../utils/darkMode";
import {
  fetchAllCourses,
  enrollInCourse,
  completeOnboarding,
  checkOnboardingStatus,
} from "../lib/api";

interface Course {
  id: number;
  name: string;
  description: string;
}

const Onboarding: React.FC = () => {
  const [step] = useState(2); // Start directly at step 2
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { isOnboarded } = await checkOnboardingStatus();
        if (isOnboarded) {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      }
    };
    checkStatus();
  }, [navigate]);

  useEffect(() => {
    if (step === 2) {
      const loadCourses = async () => {
        try {
          setIsLoading(true);
          const coursesData = await fetchAllCourses();
          setCourses(coursesData);
          setError(null);
        } catch (err) {
          console.error("An error occurred:", err);
          setError("Failed to load courses. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      };
      loadCourses();
    }
  }, [step]);

  const handleCourseEnroll = async (courseId: number) => {
    setIsLoading(true);
    try {
      await enrollInCourse(courseId);
      setSelectedCourses((prev) => [...prev, courseId]);
      setError(null);
    } catch (err) {
      console.error("An error occurred:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while enrolling. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToDashboard = async () => {
    try {
      await completeOnboarding();
      navigate("/dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      setError("Failed to complete onboarding. Please try again.");
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${
        darkMode ? "bg-black" : "bg-white"
      }`}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`p-8 rounded-lg shadow-xl w-full max-w-md border ${
          darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"
        }`}
      >
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${
              darkMode ? "bg-zinc-800 text-white" : "bg-gray-100 text-black"
            }`}
          >
            {darkMode ? "Light" : "Dark"}
          </button>
        </div>
        <AnimatePresence mode="wait">
          {/* Commented out Step 1 */}
          {/* {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-2xl font-bold text-center mb-4">
                Enter Your MAC Addresses
              </h1>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <button
                onClick={handleMacSubmit}
                className={`w-full mt-4 py-2 rounded ${
                  darkMode
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : "Next Step"}
              </button>
            </motion.div>
          )} */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-2xl font-bold text-center mb-4">
                Select Your Courses
              </h1>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <div className="space-y-4">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className={`p-4 border rounded ${
                      darkMode
                        ? "border-zinc-700 bg-zinc-800"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <h2
                      className={`text-lg font-bold ${
                        darkMode ? "text-white" : "text-black"
                      }`}
                    >
                      {course.name}
                    </h2>
                    <p className={`${darkMode ? "text-white" : "text-black"}`}>
                      {course.description}
                    </p>
                    <button
                      onClick={() => handleCourseEnroll(course.id)}
                      disabled={
                        selectedCourses.includes(course.id) || isLoading
                      }
                      className={`mt-2 py-1 px-4 rounded ${
                        selectedCourses.includes(course.id)
                          ? "bg-green-500 text-white cursor-not-allowed"
                          : darkMode
                          ? "bg-blue-500 text-white hover:bg-blue-600"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {selectedCourses.includes(course.id)
                        ? "Enrolled"
                        : "Enroll"}
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={handleProceedToDashboard}
                className={`w-full mt-4 py-2 rounded ${
                  darkMode
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                Finish and Go to Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Onboarding;

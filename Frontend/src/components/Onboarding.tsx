import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
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
  imageUrl?: string;
}

const CourseCard: React.FC<{
  course: Course;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ course, isSelected, onSelect }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 flex flex-col h-full transform transition-transform hover:scale-105"
  >
    <div className="relative h-48 overflow-hidden">
      <img
        src={
          course.imageUrl ||
          "https://appxcontent.kaxa.in/paid_course3/2024-09-19-0.309826215873515.png"
        }
        alt={course.name}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <h3 className="absolute bottom-4 left-4 text-xl font-bold text-white">
        {course.name}
      </h3>
    </div>

    <div className="p-6 flex-grow flex flex-col">
      <div className="flex-grow">
        <div className="prose prose-sm max-w-none">
          <div className="space-y-4">
            {/* Course Features */}
            <div className="flex items-center gap-3 text-sm text-gray-600 border-b border-gray-100 pb-4">
              <div className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2" />
                Offline Course
              </div>
            </div>

            {/* Course Description */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                About This Course
              </h4>
              <div className="text-gray-600 text-sm space-y-2">
                {course.description.split("\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Course Highlights */}
            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                What You'll Learn
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Hands-on practical experience</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Industry-relevant skills</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Project-based learning</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onSelect}
        disabled={isSelected}
        className={`mt-6 w-full px-4 py-3 rounded-md transition-all ${
          isSelected
            ? "bg-green-100 text-green-700 flex items-center justify-center gap-2"
            : "bg-indigo-600 text-white hover:bg-indigo-700 transform hover:-translate-y-1"
        }`}
      >
        {isSelected ? (
          <>
            <CheckCircle className="h-5 w-5" />
            Enrolled
          </>
        ) : (
          "Enroll Now"
        )}
      </button>
    </div>
  </motion.div>
);

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStatusAndLoadCourses = async () => {
      try {
        const { isOnboarded } = await checkOnboardingStatus();
        if (isOnboarded) {
          const token = localStorage.getItem("authorization");
          if (token) {
            const payload = token.split(".")[1];
            const decodedToken = JSON.parse(atob(payload));
            navigate(decodedToken.role === "ADMIN" ? "/admin" : "/dashboard");
            return;
          }
        }

        const coursesData = await fetchAllCourses();
        setCourses(coursesData);
      } catch (error) {
        console.error("Error:", error);
        setError("Failed to load courses. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    checkStatusAndLoadCourses();
  }, [navigate]);

  const handleCourseSelect = async (courseId: number) => {
    try {
      await enrollInCourse(courseId);
      setSelectedCourses((prev) => [...prev, courseId]);
      toast.success("Successfully enrolled in course!");
    } catch (error) {
      console.error("Error enrolling:", error);
      toast.error("Failed to enroll in course");
    }
  };

  const handleComplete = async () => {
    if (selectedCourses.length === 0) {
      toast.error("Please select at least one course");
      return;
    }

    setIsSubmitting(true);
    try {
      await completeOnboarding();
      toast.success("Onboarding completed!");

      // Check user role and redirect accordingly
      const token = localStorage.getItem("authorization");
      if (token) {
        const payload = token.split(".")[1];
        const decodedToken = JSON.parse(atob(payload));
        navigate(decodedToken.role === "ADMIN" ? "/admin" : "/dashboard");
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Failed to complete onboarding");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-2 text-gray-600">
            Loading your personalized experience...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to
            <span className="text-3xl font-bold  bg-gradient-to-r from-blue-400 to-blue-700  inline-block text-transparent bg-clip-text">
              100xReview
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from our curated selection of courses designed to help you
            master web development. Select the courses that match your learning
            goals.
          </p>
        </motion.div>

        {error ? (
          <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg">
            {error}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isSelected={selectedCourses.includes(course.id)}
                  onSelect={() => handleCourseSelect(course.id)}
                />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-12 text-center"
            >
              <div className="mb-6">
                <p className="text-gray-600">
                  Selected {selectedCourses.length} of {courses.length} courses
                </p>
                <div className="w-full max-w-xs mx-auto h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        (selectedCourses.length / courses.length) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <button
                onClick={handleComplete}
                disabled={isSubmitting || selectedCourses.length === 0}
                className="inline-flex items-center px-8 py-3 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-1"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="h-5 w-5 mr-2" />
                )}
                {isSubmitting ? "Completing..." : "Complete Onboarding"}
              </button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default Onboarding;

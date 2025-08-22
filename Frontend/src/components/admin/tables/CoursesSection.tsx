import React, { useState } from "react";
import { Search, Plus, BookOpen } from "lucide-react";
import { AdminCourse } from "../../../types/admin-dashboard";

interface CoursesSectionProps {
  courses: AdminCourse[];
  isDark: boolean;
  onAddCourse: () => void;
}

const CoursesSection: React.FC<CoursesSectionProps> = ({
  courses,
  isDark,
  onAddCourse,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter courses based on search
  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.description &&
        course.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  console.log("[CoursesSection] courses prop:", courses);
  console.log("[CoursesSection] filteredCourses:", filteredCourses.length);

  return (
    <div className="space-y-6">
      {/* Search and Add Course Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDark
                  ? "bg-zinc-800 border-zinc-700 text-white"
                  : "bg-white border-gray-200"
              }`}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <button
          onClick={onAddCourse}
          className={`px-4 py-2 rounded-md flex items-center gap-2 ${
            isDark
              ? "bg-white text-black hover:bg-gray-100"
              : "bg-black text-white hover:bg-gray-900"
          }`}
        >
          <Plus className="h-4 w-4" />
          <span>Add Course</span>
        </button>
      </div>

      {/* Empty State (No Courses) */}
      {filteredCourses.length === 0 && !searchTerm && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium">No courses found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first course
          </p>
          <button
            onClick={onAddCourse}
            className="mt-4 px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
          >
            Create your first course
          </button>
        </div>
      )}

      {/* No Search Results */}
      {filteredCourses.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium">No matching courses</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try a different search term or clear your search
          </p>
        </div>
      )}

      {/* Courses Grid */}
      {filteredCourses.length > 0 && (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className={`rounded-lg border overflow-hidden ${
                isDark ? "border-zinc-800" : "border-gray-200"
              }`}
            >
              {/* Course Image */}
              <div className="h-40 bg-gray-200 relative">
                {course.imageUrl ? (
                  <img
                    src={course.imageUrl}
                    alt={course.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className={`w-full h-full flex items-center justify-center ${
                      isDark ? "bg-zinc-800" : "bg-gray-100"
                    }`}
                  >
                    <BookOpen className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Course Info */}
              <div className={`p-4 ${isDark ? "bg-zinc-900" : "bg-white"}`}>
                <h3 className="font-semibold text-lg mb-2">{course.name}</h3>
                <p
                  className={`text-sm line-clamp-2 mb-4 ${
                    isDark ? "text-zinc-400" : "text-gray-600"
                  }`}
                >
                  {course.description || "No description available"}
                </p>

                {/* Course Stats */}
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`px-2 py-1 rounded-full ${
                      isDark
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    0 Students
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full ${
                      isDark
                        ? "bg-green-500/10 text-green-400"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    0 Projects
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesSection;

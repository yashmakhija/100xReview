import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Course } from "../lib/api";

interface CourseSelectorProps {
  courses: Course[];
  selectedCourseId: number;
  onSelectCourse: (courseId: number) => void;
  darkMode: boolean;
}

export const CourseSelector: React.FC<CourseSelectorProps> = ({
  courses,
  selectedCourseId,
  onSelectCourse,
  darkMode,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCourse = courses.find(
    (course) => course.id === selectedCourseId
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-64 px-4 py-2 text-sm font-medium ${
          darkMode
            ? "bg-gray-700 text-white hover:bg-gray-600"
            : "bg-white text-gray-900 hover:bg-gray-100"
        } border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
      >
        <span className="truncate">
          {selectedCourse ? selectedCourse.name : "Select a course"}
        </span>
        <ChevronDown
          className={`ml-2 h-4 w-4 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div
          className={`absolute z-10 w-full mt-1 rounded-md shadow-lg ${
            darkMode ? "bg-gray-800" : "bg-white"
          } ring-1 ring-black ring-opacity-5`}
        >
          <ul className="py-1 max-h-60 overflow-auto" role="listbox">
            {courses.map((course) => (
              <li
                key={course.id}
                onClick={() => {
                  onSelectCourse(course.id);
                  setIsOpen(false);
                }}
                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 ${
                  darkMode
                    ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                    : "text-gray-900 hover:bg-gray-100"
                } ${
                  course.id === selectedCourseId
                    ? darkMode
                      ? "bg-gray-600"
                      : "bg-blue-100"
                    : ""
                }`}
                role="option"
              >
                <span className="block truncate">{course.name}</span>
                {course.id === selectedCourseId && (
                  <span
                    className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                      darkMode ? "text-white" : "text-blue-600"
                    }`}
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

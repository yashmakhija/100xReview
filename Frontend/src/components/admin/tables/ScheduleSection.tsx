import React from "react";
import ScheduleManager from "../../ScheduleManager";
import { BookOpen } from "lucide-react";

interface Course {
  id: number;
  name: string;
}

interface ScheduleSectionProps {
  courses: Course[];
  selectedCourseId: string;
  setSelectedCourseId: (id: string) => void;
  isDark: boolean;
  onAddCourse?: () => void;
}

const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  courses,
  selectedCourseId,
  setSelectedCourseId,
  isDark,
  onAddCourse,
}) => {
  if (!courses.length) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="w-64">
          <label className="block text-sm font-medium mb-1">
            Select Course
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className={`w-full p-2 rounded-md border ${
              isDark
                ? "bg-zinc-800 border-zinc-700 text-white"
                : "bg-white border-gray-200"
            }`}
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>
        
        {onAddCourse && (
          <button
            onClick={onAddCourse}
            className={`px-4 py-2 rounded-md flex items-center gap-2 ${
              isDark
                ? "bg-white text-black hover:bg-gray-100"
                : "bg-black text-white hover:bg-gray-900"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Add Course</span>
          </button>
        )}
      </div>

      <ScheduleManager
        darkMode={isDark}
        courseId={selectedCourseId}
        key={selectedCourseId}
      />
    </div>
  );
};

export default ScheduleSection;

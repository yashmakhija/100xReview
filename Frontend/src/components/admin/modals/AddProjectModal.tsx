import React, { useState } from "react";
import { Calendar } from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "../../../lib/utils";
import { createProject } from "../../../lib/api";

interface Course {
  id: number;
  name: string;
}

interface AddProjectModalProps {
  onClose: () => void;
  courses: Course[];
  isDark: boolean;
  onProjectAdded: () => Promise<void>;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({
  onClose,
  courses,
  isDark,
  onProjectAdded,
}) => {
  const [projectData, setProjectData] = useState({
    name: "",
    description: "",
    dueDate: "",
    courseId: courses[0]?.id || 0,
    notion: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedCourse = courses.find((c) => c.id === projectData.courseId);
      await createProject(projectData);

      // Refresh projects list
      await onProjectAdded();

      // Show success toast
      toast.success(
        `Project added to ${selectedCourse?.name || "course"} successfully!`,
        {
          duration: 4000,
          position: "top-right",
          style: {
            background: isDark ? "#27272a" : "#fff",
            color: isDark ? "#fff" : "#000",
            border: `1px solid ${isDark ? "#3f3f46" : "#e5e7eb"}`,
          },
        }
      );

      onClose();
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project. Please try again.", {
        duration: 4000,
        position: "top-right",
        style: {
          background: isDark ? "#27272a" : "#fff",
          color: isDark ? "#fff" : "#000",
          border: `1px solid ${isDark ? "#3f3f46" : "#e5e7eb"}`,
        },
      });
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
          <h2 className="text-xl font-semibold">Add New Project</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-opacity-80 ${
              isDark ? "hover:bg-zinc-800" : "hover:bg-gray-100"
            }`}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Project Name
            </label>
            <input
              type="text"
              required
              value={projectData.name}
              onChange={(e) =>
                setProjectData((prev) => ({ ...prev, name: e.target.value }))
              }
              className={`w-full p-2 rounded-md border ${
                isDark
                  ? "bg-zinc-800 border-zinc-700 text-white"
                  : "bg-white border-gray-200"
              }`}
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              required
              value={projectData.description}
              onChange={(e) =>
                setProjectData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className={`w-full p-2 rounded-md border ${
                isDark
                  ? "bg-zinc-800 border-zinc-700 text-white"
                  : "bg-white border-gray-200"
              }`}
              rows={3}
              placeholder="Enter project description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Notion Link <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="url"
              value={projectData.notion}
              onChange={(e) =>
                setProjectData((prev) => ({
                  ...prev,
                  notion: e.target.value,
                }))
              }
              className={`w-full p-2 rounded-md border ${
                isDark
                  ? "bg-zinc-800 border-zinc-700 text-white"
                  : "bg-white border-gray-200"
              }`}
              placeholder="Enter Notion documentation link (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Course</label>
            <select
              required
              value={projectData.courseId}
              onChange={(e) =>
                setProjectData((prev) => ({
                  ...prev,
                  courseId: Number(e.target.value),
                }))
              }
              className={`w-full p-2 rounded-md border ${
                isDark
                  ? "bg-zinc-800 border-zinc-700 text-white"
                  : "bg-white border-gray-200"
              }`}
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <div className="relative">
              <input
                type="date"
                required
                value={projectData.dueDate}
                onChange={(e) =>
                  setProjectData((prev) => ({
                    ...prev,
                    dueDate: e.target.value,
                  }))
                }
                className={`w-full p-2 rounded-md border ${
                  isDark
                    ? "bg-zinc-800 border-zinc-700 text-white"
                    : "bg-white border-gray-200"
                }`}
              />
              <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-md ${
                isDark
                  ? "bg-zinc-800 hover:bg-zinc-700"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-md ${
                isDark
                  ? "bg-white text-black hover:bg-gray-100"
                  : "bg-black text-white hover:bg-gray-900"
              }`}
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProjectModal;

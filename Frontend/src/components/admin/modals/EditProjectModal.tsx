import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";
import { editProject } from "../../../lib/api";

interface Project {
  id: number;
  name: string;
  description: string;
  dueDate: string;
  notion?: string;
}

interface EditProjectModalProps {
  project: Project;
  onClose: () => void;
  isDark: boolean;
  onProjectUpdated: () => Promise<void>;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({
  project,
  onClose,
  isDark,
  onProjectUpdated,
}) => {
  const [projectData, setProjectData] = useState({
    title: project.name,
    description: project.description,
    dueDate: new Date(project.dueDate).toISOString().split("T")[0],
    notionUrl: project.notion || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await editProject(project.id, projectData);

      // Refresh projects list
      await onProjectUpdated();

      toast.success("Project updated successfully!", {
        duration: 4000,
        position: "top-right",
        style: {
          background: isDark ? "#27272a" : "#fff",
          color: isDark ? "#fff" : "#000",
          border: `1px solid ${isDark ? "#3f3f46" : "#e5e7eb"}`,
        },
      });

      onClose();
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update project. Please try again.",
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
          <h2 className="text-xl font-semibold">Edit Project</h2>
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
              Project Name
            </label>
            <input
              type="text"
              required
              value={projectData.title}
              onChange={(e) =>
                setProjectData((prev) => ({ ...prev, title: e.target.value }))
              }
              className={`w-full p-2 rounded-md border ${
                isDark
                  ? "bg-zinc-800 border-zinc-700"
                  : "bg-white border-gray-200"
              }`}
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
                  ? "bg-zinc-800 border-zinc-700"
                  : "bg-white border-gray-200"
              }`}
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
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
                  ? "bg-zinc-800 border-zinc-700"
                  : "bg-white border-gray-200"
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Notion Link <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="url"
              value={projectData.notionUrl}
              onChange={(e) =>
                setProjectData((prev) => ({
                  ...prev,
                  notionUrl: e.target.value,
                }))
              }
              className={`w-full p-2 rounded-md border ${
                isDark
                  ? "bg-zinc-800 border-zinc-700"
                  : "bg-white border-gray-200"
              }`}
              placeholder="https://notion.so/..."
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
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
              className={`px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 
                ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;

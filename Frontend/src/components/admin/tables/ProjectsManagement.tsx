import React, { useState } from "react";
import { Search, Plus, Pencil } from "lucide-react";
import { cn } from "../../../lib/utils";

interface Project {
  id: number;
  name: string;
  description: string;
  dueDate: string;
  courseId: number;
  notion?: string;
  submissions?: any[];
}

interface Course {
  id: number;
  name: string;
}

interface ProjectsManagementProps {
  projects: Project[];
  courses: Course[];
  isDark: boolean;
  onAddProject: () => void;
  onEditProject: (project: Project) => void;
}

const ProjectsManagement: React.FC<ProjectsManagementProps> = ({
  projects,
  courses,
  isDark,
  onAddProject,
  onEditProject,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse =
      !selectedCourse || project.courseId.toString() === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Manage Projects</h2>
        <button
          onClick={onAddProject}
          className={`px-4 py-2 rounded-md flex items-center gap-2 ${
            isDark ? "bg-white text-black" : "bg-black text-white"
          } hover:opacity-90`}
        >
          <Plus className="h-4 w-4" />
          Add Project
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-md border ${
              isDark
                ? "bg-zinc-800 border-zinc-700"
                : "bg-white border-gray-200"
            }`}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className={`w-48 px-4 py-2 rounded-md border ${
            isDark ? "bg-zinc-800 border-zinc-700" : "bg-white border-gray-200"
          }`}
        >
          <option value="">All Courses</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className={`p-4 rounded-lg border ${
              isDark
                ? "bg-zinc-800/50 border-zinc-700"
                : "bg-white border-gray-200"
            } hover:border-blue-500 transition-colors`}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold truncate">{project.name}</h3>
              <button
                onClick={() => onEditProject(project)}
                className="p-2 rounded-md hover:bg-blue-500/10 text-blue-500"
                title="Edit Project"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>

            <p
              className={`text-sm mb-3 line-clamp-2 ${
                isDark ? "text-zinc-400" : "text-gray-600"
              }`}
            >
              {project.description}
            </p>

            <div className="flex flex-wrap gap-2 text-sm">
              <span
                className={`px-2 py-1 rounded-full ${
                  isDark
                    ? "bg-zinc-700 text-zinc-300"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                Due: {new Date(project.dueDate).toLocaleDateString()}
              </span>
              <span
                className={`px-2 py-1 rounded-full ${
                  project.submissions?.length
                    ? "bg-blue-500/10 text-blue-500"
                    : "bg-gray-500/10 text-gray-500"
                }`}
              >
                {project.submissions?.length || 0} submissions
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsManagement;

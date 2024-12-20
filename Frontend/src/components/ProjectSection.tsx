import React, { useState } from "react";
import { Plus, X, Github, ExternalLink } from "lucide-react";
import { Course } from "../lib/api";

interface Submission {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  githubUrl: string;
  deployUrl: string;
  submittedAt: string;
  isReviewed: boolean;
}

interface Project {
  id: number;
  name: string;
  description: string;
  dueDate: string;
  courseId: number;
  submissionId: number | null;
  message: string;
  status: string;
  submissions: Submission[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ProjectWithSubmissions extends Project {}

interface NewProject {
  name: string;
  description: string;
  dueDate: string;
  courseId: number;
}

interface ProjectSectionProps {
  projects: ProjectWithSubmissions[];
  courses: Course[];
  darkMode: boolean;
  navigate: (path: string) => void;
  onAddProject: (project: NewProject) => Promise<void>;
}

export const ProjectSection: React.FC<ProjectSectionProps> = ({
  projects,
  courses,
  darkMode,
  navigate,
  onAddProject,
}) => {
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProject, setNewProject] = useState<NewProject>({
    name: "",
    description: "",
    dueDate: "",
    courseId: courses[0]?.id || 0,
  });

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddProject(newProject);
    setIsAddingProject(false);
    setNewProject({
      name: "",
      description: "",
      dueDate: "",
      courseId: courses[0]?.id || 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2
          className={`text-2xl font-bold ${
            darkMode ? "text-white" : "text-gray-800"
          }`}
        >
          Projects
        </h2>
        <button
          onClick={() => setIsAddingProject(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
            ${
              darkMode
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-blue-500 text-white hover:bg-blue-600"
            } transition-colors`}
        >
          <Plus className="w-4 h-4" />
          Add Project
        </button>
      </div>

      {isAddingProject && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`}
        >
          <div
            className={`${
              darkMode ? "bg-gray-800" : "bg-white"
            } p-6 rounded-lg w-full max-w-md`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3
                className={`text-xl font-bold ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Add New Project
              </h3>
              <button
                onClick={() => setIsAddingProject(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className={`block text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Project Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                  className={`mt-1 block w-full rounded-md ${
                    darkMode
                      ? "bg-gray-700 text-white"
                      : "bg-white text-gray-900"
                  } border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className={`block text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      description: e.target.value,
                    })
                  }
                  className={`mt-1 block w-full rounded-md ${
                    darkMode
                      ? "bg-gray-700 text-white"
                      : "bg-white text-gray-900"
                  } border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                  rows={3}
                  required
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="dueDate"
                  className={`block text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Due Date
                </label>
                <input
                  type="date"
                  id="dueDate"
                  value={newProject.dueDate}
                  onChange={(e) =>
                    setNewProject({ ...newProject, dueDate: e.target.value })
                  }
                  className={`mt-1 block w-full rounded-md ${
                    darkMode
                      ? "bg-gray-700 text-white"
                      : "bg-white text-gray-900"
                  } border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="courseId"
                  className={`block text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Course
                </label>
                <select
                  id="courseId"
                  value={newProject.courseId}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      courseId: Number(e.target.value),
                    })
                  }
                  className={`mt-1 block w-full rounded-md ${
                    darkMode
                      ? "bg-gray-700 text-white"
                      : "bg-white text-gray-900"
                  } border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                  required
                >
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className={`w-full px-4 py-2 rounded-md text-sm font-medium ${
                  darkMode
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                } transition-colors`}
              >
                Add Project
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className={`${
              darkMode ? "bg-gray-800" : "bg-white"
            } rounded-lg overflow-hidden shadow-lg transition-shadow duration-300 hover:shadow-xl`}
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3
                  className={`text-xl font-semibold ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  {project.name}
                </h3>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    project.submissions && project.submissions.length > 0
                      ? project.submissions.every((s) => s.isReviewed)
                        ? "bg-green-500/10 text-green-500"
                        : "bg-amber-500/10 text-amber-500"
                      : "bg-gray-500/10 text-gray-500"
                  }`}
                >
                  {project.submissions && project.submissions.length > 0
                    ? project.submissions.every((s) => s.isReviewed)
                      ? "Reviewed"
                      : "Pending"
                    : "Not Submitted"}
                </span>
              </div>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {project.description}
              </p>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Due: {new Date(project.dueDate).toLocaleDateString()}
              </p>
              {project.submissions && project.submissions.length > 0 && (
                <div className="mt-4">
                  <h4
                    className={`text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Submissions:
                  </h4>
                  <ul className="space-y-2">
                    {project.submissions.map((submission) => (
                      <li
                        key={submission.id}
                        className="flex items-center justify-between"
                      >
                        <span
                          className={`text-sm ${
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {submission.user.name}
                        </span>
                        <div className="flex items-center space-x-2">
                          <a
                            href={submission.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-1 rounded-md transition-colors ${
                              darkMode
                                ? "hover:bg-gray-700"
                                : "hover:bg-gray-100"
                            }`}
                          >
                            <Github className="w-4 h-4" />
                          </a>
                          <a
                            href={submission.deployUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-1 rounded-md transition-colors ${
                              darkMode
                                ? "hover:bg-gray-700"
                                : "hover:bg-gray-100"
                            }`}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() =>
                              navigate(
                                `/project-review/${project.courseId}/${submission.id}`
                              )
                            }
                            className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                              submission.isReviewed
                                ? darkMode
                                  ? "bg-green-500/20 text-green-500"
                                  : "bg-green-100 text-green-800"
                                : darkMode
                                ? "bg-blue-500 text-white hover:bg-blue-600"
                                : "bg-blue-500 text-white hover:bg-blue-600"
                            }`}
                          >
                            {submission.isReviewed ? "Reviewed" : "Review"}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

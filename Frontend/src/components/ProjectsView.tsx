import React from "react";
import { NavigateFunction } from "react-router-dom";

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
  courseId: number;
  submissions?: Submission[];
}

interface ProjectsViewProps {
  projects: Project[];
  darkMode: boolean;
  navigate: NavigateFunction;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  darkMode,
  navigate,
}) => (
  <div className="space-y-6">
    {projects.map((project) => (
      <div
        key={project.id}
        className={`${
          darkMode ? "bg-gray-700" : "bg-gray-50"
        } rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg`}
      >
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">{project.name}</h3>
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${
                project.submissions && project.submissions.length > 0
                  ? project.submissions.every((s) => s.isReviewed)
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {project.submissions && project.submissions.length > 0
                ? project.submissions.every((s) => s.isReviewed)
                  ? "Reviewed"
                  : "Pending"
                : "Not Submitted"}
            </span>
          </div>
          {project.submissions?.map((submission) => (
            <div
              key={submission.id}
              className="bg-white dark:bg-gray-600 rounded-lg p-4 shadow-sm"
            >
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Submitted by:{" "}
                <span className="font-medium ">{submission.user.name}</span>
              </p>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Date:{" "}
                <span className="font-medium">
                  {new Date(submission.submittedAt).toLocaleDateString()}
                </span>
              </p>
              <button
                onClick={() =>
                  navigate(
                    `/project-review/${project.courseId}/${submission.id}`
                  )
                }
                className={`mt-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  darkMode
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                }`}
              >
                Review Project
              </button>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

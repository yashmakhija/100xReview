import React from "react";
import { Project, ProjectStatus } from "../lib/api";

interface ProjectCardProps {
  project: Project;
  projectStatus: ProjectStatus | undefined;
  onSubmitClick: (project: Project) => void;
  onReviewClick: (projectStatus: ProjectStatus) => void;
  darkMode: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  projectStatus,
  onSubmitClick,
  onReviewClick,
  darkMode,
}) => {
  return (
    <div
      className={`${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } border rounded-lg shadow-sm p-6`}
    >
      <h3
        className={`text-xl font-semibold mb-2 ${
          darkMode ? "text-white" : "text-black"
        }`}
      >
        {project.name}
      </h3>
      <p className={`mb-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
        {project.description}
      </p>
      <div className="flex justify-between items-center">
        <span
          className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
        >
          Due: {new Date(project.dueDate).toLocaleDateString()}
        </span>
        <div className="space-x-2">
          {projectStatus ? (
            <>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  projectStatus.status === "REVIEWED"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {projectStatus.status === "REVIEWED"
                  ? "Reviewed"
                  : "Pending Review"}
              </span>
              {projectStatus.status === "REVIEWED" && (
                <button
                  onClick={() => onReviewClick(projectStatus)}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    darkMode
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                  } transition-colors`}
                >
                  View Review
                </button>
              )}
            </>
          ) : (
            <button
              onClick={() => onSubmitClick(project)}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                darkMode
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-blue-100 text-blue-800 hover:bg-blue-200"
              } transition-colors`}
            >
              Submit Project
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

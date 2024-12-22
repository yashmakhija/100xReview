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
        darkMode ? "bg-gray-800" : "bg-white"
      } rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 p-6`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {project.description}
          </p>
        </div>

        {/* Status and Actions */}
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <span 
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${projectStatus?.status === "REVIEWED"
                    ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                    : projectStatus
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400"
                  }`}
              >
                {projectStatus?.status === "REVIEWED" 
                  ? "Reviewed" 
                  : projectStatus 
                  ? "Pending Review" 
                  : "Not Submitted"}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Due: {new Date(project.dueDate).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {projectStatus ? (
                projectStatus.status === "REVIEWED" && (
                  <button
                    onClick={() => onReviewClick(projectStatus)}
                    className={`px-4 py-2 text-sm font-medium rounded-md
                      ${darkMode
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                      } transition-colors`}
                  >
                    View Review
                  </button>
                )
              ) : (
                <button
                  onClick={() => onSubmitClick(project)}
                  className={`px-4 py-2 text-sm font-medium rounded-md
                    ${darkMode
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
      </div>
    </div>
  );
};

import { Project, ProjectStatus } from "../lib/api";
import { Clock3, CheckCircle, ChevronRight, FileText } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  projectStatus?: ProjectStatus;
  onSubmitClick: (project: Project) => void;
  onReviewClick: (status: ProjectStatus) => void;
  darkMode: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  projectStatus,
  onSubmitClick,
  onReviewClick,
  darkMode,
}) => {
  const dueDate = new Date(project.dueDate);
  const isOverdue = dueDate < new Date();

  return (
    <div
      className={`${
        darkMode ? "bg-gray-800" : "bg-white"
      } rounded-lg shadow overflow-hidden`}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">{project.name}</h3>
          {projectStatus && (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                projectStatus.status === "REVIEWED"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {projectStatus.status === "REVIEWED" ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 mr-1" />
                  Completed
                </>
              ) : (
                <>
                  <Clock3 className="w-3.5 h-3.5 mr-1" />
                  Pending Review
                </>
              )}
            </span>
          )}
        </div>

        <p
          className={`text-sm mb-4 ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          {project.description}
        </p>

        {project.notion && (
          <div className="mb-4">
            <div
              className={`rounded-lg p-4 ${
                darkMode
                  ? "bg-gray-700/50 border border-gray-600"
                  : "bg-blue-50 border border-blue-100"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    darkMode ? "bg-gray-600" : "bg-blue-100"
                  }`}
                >
                  <FileText
                    className={`w-5 h-5 ${
                      darkMode ? "text-blue-400" : "text-blue-600"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <h4
                    className={`text-sm font-medium mb-1 ${
                      darkMode ? "text-gray-200" : "text-gray-900"
                    }`}
                  >
                    Project Requirements
                  </h4>
                  <a
                    href={project.notion}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-sm ${
                      darkMode
                        ? "text-blue-400 hover:text-blue-300"
                        : "text-blue-600 hover:text-blue-700"
                    } flex items-center gap-1`}
                  >
                    View Documentation
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <div>
            <p
              className={`text-xs ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Due Date
            </p>
            <p
              className={`text-sm font-medium ${
                isOverdue
                  ? "text-red-500"
                  : darkMode
                  ? "text-white"
                  : "text-gray-900"
              }`}
            >
              {dueDate.toLocaleDateString()}
            </p>
          </div>

          {projectStatus ? (
            projectStatus.status === "REVIEWED" ? (
              <button
                onClick={() => onReviewClick(projectStatus)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  darkMode
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                } transition-colors`}
              >
                View Review
              </button>
            ) : (
              <span
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Review Pending
              </span>
            )
          ) : (
            <button
              onClick={() => onSubmitClick(project)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
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

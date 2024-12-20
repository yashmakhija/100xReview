import React from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { motion } from "framer-motion";
import { ChevronRight, Eye } from "lucide-react";
import {
  darkModeState,
  projectsState,
  isModalOpenState,
  selectedProjectState,
  selectedCourseIdState,
  isReviewModalOpenState,
} from "../atoms/dashboardAtoms";
import { Project } from "../types/dashboard";
import { useProjectData } from "../hooks/useProjectData";
import Loading from "./Loader";

const ProjectList: React.FC = () => {
  const darkMode = useRecoilValue(darkModeState);
  const projects = useRecoilValue(projectsState);
  const setIsModalOpen = useSetRecoilState(isModalOpenState);
  const setSelectedProject = useSetRecoilState(selectedProjectState);
  const selectedCourseId = useRecoilValue(selectedCourseIdState);
  const setIsReviewModalOpen = useSetRecoilState(isReviewModalOpenState);

  const { loading, error } = useProjectData(selectedCourseId.toString());

  const handleSubmitClick = (project: Project) => {
    if (project.submission) {
      console.log(
        "This project has already been submitted and cannot be resubmitted."
      );
      return;
    }
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleShowReviewClick = (project: Project) => {
    if (project.submission?.isReviewed) {
      setSelectedProject(project);
      setIsReviewModalOpen(true);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "No due date" : date.toLocaleDateString();
  };

  const getProjectStatus = (project: Project) => {
    if (!project.submission) return "not_submitted";
    return project.submission.isReviewed ? "reviewed" : "pending_review";
  };

  const renderProjectStatus = (project: Project) => {
    const status = getProjectStatus(project);

    switch (status) {
      case "not_submitted":
        return (
          <button
            onClick={() => handleSubmitClick(project)}
            className={`px-4 py-2 rounded-lg flex items-center ${
              darkMode
                ? "bg-white text-black hover:bg-gray-100"
                : "bg-black text-white hover:bg-gray-900"
            }`}
          >
            Submit
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        );
      case "pending_review":
        return (
          <span className="px-4 py-2 rounded-lg bg-yellow-500 text-white">
            Pending Review
          </span>
        );
      case "reviewed":
        return (
          <button
            onClick={() => handleShowReviewClick(project)}
            className={`px-4 py-2 rounded-lg flex items-center ${
              darkMode
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            Show Review
            <Eye className="w-4 h-4 ml-1" />
          </button>
        );
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`p-4 rounded-lg border ${
            darkMode
              ? "border-zinc-800 bg-zinc-900"
              : "border-gray-200 bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3
                className={`font-semibold ${
                  darkMode ? "text-white" : "text-black"
                }`}
              >
                {project.name}
              </h3>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {project.description}
              </p>
              <p
                className={`text-sm mt-2 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Due: {formatDate(project.dueDate)}
              </p>
              <p
                className={`text-sm mt-2 ${
                  getProjectStatus(project) === "pending_review"
                    ? "text-yellow-500"
                    : getProjectStatus(project) === "reviewed"
                    ? "text-green-500"
                    : darkMode
                    ? "text-gray-400"
                    : "text-gray-600"
                }`}
              >
                Status: {getProjectStatus(project).replace("_", " ")}
              </p>
            </div>
            {renderProjectStatus(project)}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ProjectList;

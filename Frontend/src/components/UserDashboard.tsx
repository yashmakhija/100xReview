import React, { useState, useEffect } from "react";
import {
  X,
  Github,
  Globe,
  ChevronRight,
  Moon,
  Sun,
  Zap,
  CheckCircle,
  Clock3,
  Award,
  Briefcase,
  LogOut,
  User,
} from "lucide-react";
import { useDarkMode } from "../utils/darkMode";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorMessage } from "./ErrorMessage";
import * as api from "../lib/api";
import { Project, ProjectStatus, ScheduleItem, Course } from "../lib/api";
import { ProjectCard } from "./ProjectCard";
import { ScheduleItemComponent } from "./ScheduleItemComponent";
import { CourseSelector } from "./CourseSelector";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import ReviewModal from "./ReviewModal";

const UserDashboard: React.FC = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("projects");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number>(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [weeklySchedule, setWeeklySchedule] = useState<ScheduleItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [deployUrl, setDeployUrl] = useState("");
  const [wsUrl, setWsUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [projectStatuses, setProjectStatuses] = useState<ProjectStatus[]>([]);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [, setSelectedVideoUrl] = useState("");
  const [selectedReview, setSelectedReview] = useState<ProjectStatus | null>(
    null
  );
  const [userStats, setUserStats] = useState({
    totalSubmissions: 0,
    completedProjects: 0,
    pendingReviews: 0,
    lastSubmission: null as Date | null,
    productivityScore: 0,
    activeStreak: 0,
  });

  useEffect(() => {
    async function fetchInitialData() {
      try {
        setLoading(true);
        const coursesData = await api.fetchCourses();
        setCourses(coursesData);
        if (coursesData.length > 0) {
          setSelectedCourseId(coursesData[0].id);
        }
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError("Failed to load initial data");
      } finally {
        setLoading(false);
      }
    }
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedCourseId === 0) return;

    async function fetchCourseData() {
      try {
        setLoading(true);
        const [projectsData, scheduleData, projectStatusData] =
          await Promise.all([
            api.fetchProjects(selectedCourseId.toString()),
            api.fetchWeeklySchedule(selectedCourseId.toString()),
            api.getUserProjectStatuses(),
          ]);

        setProjects(projectsData);
        setWeeklySchedule(scheduleData);
        setProjectStatuses(projectStatusData);

        // Calculate user stats
        const completedProjects = projectStatusData.filter(
          (status) => status.status === "REVIEWED"
        ).length;
        const pendingReviews = projectStatusData.filter(
          (status) => status.status === "PENDING_REVIEW"
        ).length;
        const lastSubmission =
          projectStatusData.length > 0
            ? new Date(
                Math.max(
                  ...projectStatusData.map((status) =>
                    new Date(status.submittedAt).getTime()
                  )
                )
              )
            : null;

        // Calculate productivity score (example algorithm)
        const productivityScore = Math.min(
          Math.round(
            (completedProjects * 100) / Math.max(projectsData.length, 1) +
              pendingReviews * 10
          ),
          100
        );

        // Calculate active streak (example)
        const streak = calculateStreak(projectStatusData);

        setUserStats({
          totalSubmissions: projectStatusData.length,
          completedProjects,
          pendingReviews,
          lastSubmission,
          productivityScore,
          activeStreak: streak,
        });

        setError(null);
      } catch (err) {
        console.error("Error fetching course data:", err);
        setError("Failed to load course data");
      } finally {
        setLoading(false);
      }
    }

    fetchCourseData();
  }, [selectedCourseId]);

  const calculateStreak = (statuses: ProjectStatus[]) => {
    if (statuses.length === 0) return 0;

    const sortedDates = statuses
      .map((status) => new Date(status.submittedAt))
      .sort((a, b) => b.getTime() - a.getTime());

    let streak = 1;
    const today = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    // Check if there's a submission in the last 24 hours
    if (today.getTime() - sortedDates[0].getTime() > oneDay) {
      return 0;
    }

    for (let i = 1; i < sortedDates.length; i++) {
      const diff = sortedDates[i - 1].getTime() - sortedDates[i].getTime();
      if (diff <= oneDay) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const handleSubmitClick = (project: Project) => {
    const projectStatus = projectStatuses.find(
      (status) => status.projectId === project.id
    );
    if (projectStatus) {
      setError(
        "This project has already been submitted and cannot be resubmitted."
      );
      return;
    }
    setSelectedProject(project);
    setIsModalOpen(true);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) {
      setError("No project selected for submission.");
      return;
    }

    try {
      setSubmitting(true);
      const updatedProject = await api.submitProject({
        projectId: selectedProject.id,
        githubUrl,
        deployUrl,
        wsUrl,
      });

      // Create new project status
      const newProjectStatus: ProjectStatus = {
        id: updatedProject.submissionId!,
        projectId: selectedProject.id,
        status: "PENDING_REVIEW",
        projectName: selectedProject.name,
        projectDescription: selectedProject.description,
        dueDate: selectedProject.dueDate,
        submittedAt: new Date().toISOString(),
        githubUrl,
        deployUrl,
        wsUrl,
        userName: "",
        rating: undefined
      };

      // Update both states immediately
      setProjectStatuses((prevStatuses) => [...prevStatuses, newProjectStatus]);

      // Update user stats
      setUserStats((prev) => ({
        ...prev,
        totalSubmissions: prev.totalSubmissions + 1,
        pendingReviews: prev.pendingReviews + 1,
        lastSubmission: new Date(),
        activeStreak: calculateStreak([...projectStatuses, newProjectStatus]),
      }));

      // Close modal and reset form
      setIsModalOpen(false);
      setGithubUrl("");
      setDeployUrl("");
      setWsUrl("");
      setError(null);

      // Show success toast if you're using toast notifications
      toast.success("Project submitted successfully!");
    } catch (err) {
      console.error("Error submitting project:", err);
      setError("Failed to submit project. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewClick = (projectStatus: ProjectStatus) => {
    setSelectedReview(projectStatus);
    if (projectStatus.reviewVideoUrl) {
      setSelectedVideoUrl(projectStatus.reviewVideoUrl);
    }
    setIsVideoModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("authorization");
    navigate("/login");
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      ) : (
        <header
          className={`py-4 px-4 sm:px-6 ${
            darkMode ? "bg-gray-800" : "bg-white"
          } shadow-md`}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <a className="flex gap-2 items-center" href="#">
                <img
                  className="size-10 rounded-full"
                  src="https://appx-wsb-gcp.akamai.net.in/subject/2023-01-17-0.17044360120951185.jpg"
                />
                <div className="text-3xl font-bold  bg-gradient-to-r from-blue-400 to-blue-700  inline-block text-transparent bg-clip-text">
                  100xReview
                </div>
              </a>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <CourseSelector
                  courses={courses}
                  selectedCourseId={selectedCourseId}
                  onSelectCourse={setSelectedCourseId}
                  darkMode={darkMode}
                />
                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-full ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-200 hover:bg-gray-300"
                  } transition-colors`}
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button
                  onClick={() => navigate("/profile")}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md ${
                    darkMode
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  } transition-colors`}
                >
                  <div className="relative">
                    <User size={18} className="text-white" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"></span>
                  </div>
                  <span className="hidden sm:inline font-medium">Profile</span>
                </button>
                <button
                  onClick={handleLogout}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md ${
                    darkMode
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-red-500 hover:bg-red-600"
                  } text-white transition-colors`}
                >
                  <LogOut size={18} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && <ErrorMessage message={error} />}

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 px-4 sm:px-0">
          <div
            className={`${
              darkMode ? "bg-gray-800" : "bg-white"
            } overflow-hidden shadow rounded-lg`}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div
                  className={`flex-shrink-0 ${
                    darkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  <Briefcase className="h-6 w-6" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt
                      className={`text-sm font-medium ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      } truncate`}
                    >
                      Total Submissions
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {userStats.totalSubmissions}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`${
              darkMode ? "bg-gray-800" : "bg-white"
            } overflow-hidden shadow rounded-lg`}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div
                  className={`flex-shrink-0 ${
                    darkMode ? "text-green-400" : "text-green-600"
                  }`}
                >
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt
                      className={`text-sm font-medium ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      } truncate`}
                    >
                      Completed Projects
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {userStats.completedProjects}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`${
              darkMode ? "bg-gray-800" : "bg-white"
            } overflow-hidden shadow rounded-lg`}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div
                  className={`flex-shrink-0 ${
                    darkMode ? "text-amber-400" : "text-amber-600"
                  }`}
                >
                  <Clock3 className="h-6 w-6" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt
                      className={`text-sm font-medium ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      } truncate`}
                    >
                      Pending Reviews
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {userStats.pendingReviews}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`${
              darkMode ? "bg-gray-800" : "bg-white"
            } overflow-hidden shadow rounded-lg`}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div
                  className={`flex-shrink-0 ${
                    darkMode ? "text-purple-400" : "text-purple-600"
                  }`}
                >
                  <Award className="h-6 w-6" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt
                      className={`text-sm font-medium ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      } truncate`}
                    >
                      Active Streak
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {userStats.activeStreak} days
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`${
            darkMode ? "bg-gray-800" : "bg-white"
          } shadow overflow-hidden sm:rounded-lg`}
        >
          <div className="px-4 py-5 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg leading-6 font-medium">
              Projects & Schedule
            </h3>
            <div className="flex space-x-2 sm:space-x-4 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab("projects")}
                className={`flex-1 sm:flex-none px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === "projects"
                    ? darkMode
                      ? "bg-blue-600 text-white"
                      : "bg-blue-100 text-blue-800"
                    : darkMode
                    ? "text-gray-300 hover:bg-gray-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Projects
              </button>
              <button
                onClick={() => setActiveTab("schedule")}
                className={`flex-1 sm:flex-none px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === "schedule"
                    ? darkMode
                      ? "bg-blue-600 text-white"
                      : "bg-blue-100 text-blue-800"
                    : darkMode
                    ? "text-gray-300 hover:bg-gray-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Weekly Schedule
              </button>
            </div>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                {activeTab === "projects" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                    {projects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        projectStatus={projectStatuses.find(
                          (status) => status.projectId === project.id
                        )}
                        onSubmitClick={handleSubmitClick}
                        onReviewClick={handleReviewClick}
                        darkMode={darkMode}
                      />
                    ))}
                  </div>
                )}
                {activeTab === "schedule" && (
                  <div className="space-y-6">
                    {weeklySchedule.map((item) => (
                      <ScheduleItemComponent
                        key={item.id}
                        item={item}
                        darkMode={darkMode}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {isModalOpen && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-lg ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } border p-6`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2
                className={`text-xl font-semibold ${
                  darkMode ? "text-white" : "text-black"
                }`}
              >
                Submit Project
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`p-2 rounded-full ${
                  darkMode
                    ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                    : "hover:bg-gray-100 text-gray-600 hover:text-black"
                }`}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="githubUrl"
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  GitHub URL <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    id="githubUrl"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-black placeholder-gray-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="https://github.com/username/repo"
                    required
                    disabled={submitting}
                  />
                  <Github
                    className={`absolute left-3 top-2.5 w-5 h-5 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="deployUrl"
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Deploy URL <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    id="deployUrl"
                    value={deployUrl}
                    onChange={(e) => setDeployUrl(e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-black placeholder-gray-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="https://your-app.vercel.app"
                    required
                    disabled={submitting}
                  />
                  <Globe
                    className={`absolute left-3 top-2.5 w-5 h-5 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="wsUrl"
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  WebSocket URL (Optional)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    id="wsUrl"
                    value={wsUrl}
                    onChange={(e) => setWsUrl(e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-black placeholder-gray-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="ws://your-app.xyz"
                    disabled={submitting}
                  />
                  <Zap
                    className={`absolute left-3 top-2.5 w-5 h-5 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-2 px-4 rounded-lg flex items-center justify-center ${
                  darkMode
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                } ${
                  submitting ? "opacity-50 cursor-not-allowed" : ""
                } transition-colors`}
              >
                {submitting ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    Submit Project
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {isVideoModalOpen && selectedReview && (
        <ReviewModal
          review={{
            reviewNotes: selectedReview.reviewNotes,
            reviewVideoUrl: selectedReview.reviewVideoUrl,
            projectName: selectedReview.projectName,
            userName: selectedReview.userName,
            rating: selectedReview.rating,
          }}
          onClose={() => {
            setIsVideoModalOpen(false);
            setSelectedReview(null);
            setSelectedVideoUrl("");
          }}
        />
      )}
    </div>
  );
};

export default UserDashboard;

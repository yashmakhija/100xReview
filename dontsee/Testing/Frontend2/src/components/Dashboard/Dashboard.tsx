import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
} from "recharts";
import {
  Clock,
  Wifi,
  Activity,
  ChevronDown,
  Search,
  Bell,
  Sun,
  Moon,
  Code,
  GitBranch,
  Coffee,
  Zap,
} from "lucide-react";

// Mock data (updated to reflect initial state)
const mockData = {
  user: {
    name: "John Doe",
    avatar: "/placeholder.svg?height=128&width=128",
    role: "Senior Developer",
  },
  dailyUptime: 450,
  connectedWifi: "Office-Main",
  productivityScore: 85,
  tasks: [
    {
      id: 1,
      name: "Implement OAuth2 authentication",
      status: "In Progress",
      dueDate: "2024-02-10",
      priority: "High",
    },
    {
      id: 2,
      name: "Code review: API refactoring",
      status: "Completed",
      dueDate: "2024-02-08",
      priority: "Medium",
    },
    {
      id: 3,
      name: "Optimize database queries",
      status: "Upcoming",
      dueDate: "2024-02-15",
      priority: "High",
    },
    {
      id: 4,
      name: "Update Docker containers",
      status: "In Progress",
      dueDate: "2024-02-12",
      priority: "Medium",
    },
    {
      id: 5,
      name: "Write unit tests for new features",
      status: "Not Started",
      dueDate: "2024-02-18",
      priority: "Low",
    },
  ],
  projects: [
    {
      id: 1,
      name: "Microservices Architecture",
      dueDate: "2024-02-20",
      status: "In Progress",
      completion: 0,
      submissionStatus: "Not Submitted",
      adminReviewed: false,
    },
    {
      id: 2,
      name: "AI-Powered Code Assistant",
      dueDate: "2024-02-25",
      status: "Not Started",
      completion: 0,
      submissionStatus: "Not Submitted",
      adminReviewed: false,
    },
    {
      id: 3,
      name: "Blockchain Integration",
      dueDate: "2024-02-18",
      status: "In Progress",
      completion: 0,
      submissionStatus: "Not Submitted",
      adminReviewed: false,
    },
    {
      id: 4,
      name: "Serverless Backend Refactor",
      dueDate: "2024-03-05",
      status: "In Progress",
      completion: 0,
      submissionStatus: "Not Submitted",
      adminReviewed: false,
    },
  ],
  weeklyAttendance: [
    { day: "Mon", hours: 8 },
    { day: "Tue", hours: 7.5 },
    { day: "Wed", hours: 8 },
    { day: "Thu", hours: 7 },
    { day: "Fri", hours: 8 },
  ],
  monthlyAttendance: { present: 18, absent: 2, late: 1 },
  productivityTrend: [
    { date: "2024-01-01", score: 75 },
    { date: "2024-01-08", score: 80 },
    { date: "2024-01-15", score: 78 },
    { date: "2024-01-22", score: 82 },
    { date: "2024-01-29", score: 85 },
    { date: "2024-02-05", score: 88 },
  ],
};

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e"];

const DeveloperDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("This Week");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState("tasks");
  const [projects, setProjects] = useState(mockData.projects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const calculateUptimePercentage = (minutes: number) => {
    const workdayMinutes = 8 * 60;
    return Math.min((minutes / workdayMinutes) * 100, 100);
  };

  const priorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-400/20 text-red-400";
      case "medium":
        return "bg-yellow-400/20 text-yellow-400";
      case "low":
        return "bg-green-400/20 text-green-400";
      default:
        return "bg-gray-400/20 text-gray-400";
    }
  };

  const statusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-400/20 text-green-400";
      case "in progress":
        return "bg-blue-400/20 text-blue-400";
      case "not started":
        return "bg-gray-400/20 text-gray-400";
      case "upcoming":
        return "bg-purple-400/20 text-purple-400";
      default:
        return "bg-gray-400/20 text-gray-400";
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const openModal = (project: any) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedProject(null);
    setGithubUrl("");
    setIsModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProject) {
      const updatedProjects = projects.map((project) =>
        project.id === selectedProject.id
          ? { ...project, submissionStatus: "Pending Review", completion: 100, githubUrl }
          : project
      );
      setProjects(updatedProjects);
      closeModal();
    }
  };

  const handleBulkSubmit = () => {
    setIsBulkSubmitting(true);
    const updatedProjects = projects.map(project => ({
      ...project,
      submissionStatus: "Pending Review",
      completion: 100,
    }));
    setProjects(updatedProjects);
    setIsBulkSubmitting(false);
  };

  const simulateAdminReview = (projectId: number, isApproved: boolean) => {
    const updatedProjects = projects.map((project) =>
      project.id === projectId
        ? {
            ...project,
            status: isApproved ? "Completed" : "In Progress",
            completion: isApproved ? 100 : 0,
            submissionStatus: isApproved ? "Approved" : "Rejected",
            adminReviewed: true,
          }
        : project
    );
    setProjects(updatedProjects);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <motion.div
              className="text-2xl font-bold cursor-pointer"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              onClick={() => navigate("/")}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                Dev
              </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
                Dashboard
              </span>
            </motion.div>
            <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1">
              <Search className="h-4 w-4 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none focus:outline-none text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 rounded-full bg-gray-100 dark:bg-gray-700"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-400" />
              )}
            </motion.button>
            <div className="relative">
              <img
                src={mockData.user.avatar}
                alt={mockData.user.name}
                className="w-8 h-8 rounded-full"
              />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium">{mockData.user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {mockData.user.role}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        {/* Time Range Selector */}
        <div className="mb-6 flex justify-between items-center">
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-4 py-2 pr-8 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="This Quarter">This Quarter</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            View Reports
          </motion.button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence>
            <motion.div
              key="current-time"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Current Time
                </h3>
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                {format(currentTime, "hh:mm:ss a")}
              </p>
              <div className="mt-4 h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: "0%" }}
                  animate={{
                    width: `${
                      ((currentTime.getHours() *
                        60 +
                        currentTime.getMinutes()) /
                        (24 * 60)) *
                      100
                    }%`,
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Work hours: 09:00 AM - 05:00 PM
              </p>
            </motion.div>

            <motion.div
              key="daily-uptime"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Connected WiFi
                </h3>
                <Wifi className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-400">
                {mockData.connectedWifi}
              </p>
              <div className="mt-4 flex items-center">
                <div className="flex-1 space-y-1">
                  <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-400"
                      initial={{ width: "0%" }}
                      animate={{ width: "80%" }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
                <div className="ml-4 text-3xl font-bold text-blue-500">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    5G
                  </motion.div>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Strong connection
              </p>
            </motion.div>

            <motion.div
              key="productivity-score"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Productivity Score
                </h3>
                <Zap className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-orange-500">
                {mockData.productivityScore}/100
              </p>
              <div className="mt-4 h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                  initial={{ width: "0%" }}
                  animate={{ width: `${mockData.productivityScore}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Based on task completion and activity
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Tasks and Projects Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex" aria-label="Tabs">
                <button
                  className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                    activeTab === "tasks"
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("tasks")}
                >
                  <Code className="inline-block mr-2 h-5 w-5" />
                  Tasks
                </button>
                <button
                  className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                    activeTab === "projects"
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("projects")}
                >
                  <GitBranch className="inline-block mr-2 h-5 w-5" />
                  Projects
                </button>
              </nav>
            </div>
            <div className="p-4">
              <AnimatePresence mode="wait">
                {activeTab === "tasks" ? (
                  <motion.div
                    key="tasks"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-lg font-semibold mb-4">
                      Today's Tasks
                    </h3>
                    <div className="space-y-4">
                      {mockData.tasks.map((task, index) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700 shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex items-start space-x-4">
                            <input type="checkbox" className="mt-1" />
                            <div>
                              <h4 className="font-medium">{task.name}</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Due:{" "}
                                {format(parseISO(task.dueDate), "MMM d, yyyy")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColor(
                                task.priority
                              )}`}
                            >
                              {task.priority}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(
                                task.status
                              )}`}
                            >
                              {task.status}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="projects"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Current Projects</h3>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleBulkSubmit}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
                        disabled={isBulkSubmitting}
                      >
                        {isBulkSubmitting ? "Submitting..." : "Submit All Projects"}
                      </motion.button>
                    </div>
                    <div className="space-y-4">
                      {projects.map((project, index) => (
                        <motion.div
                          key={project.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700 shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-600"
                        >
                          <div>
                            <h4 className="font-medium">{project.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Due:{" "}
                              {format(parseISO(project.dueDate), "MMM d, yyyy")}
                            </p>
                            <div className="mt-2 w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                              <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${project.completion}%` }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                              />
                            </div>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {project.completion}% complete
                            </p>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(
                                project.status
                              )}`}
                            >
                              {project.status}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                project.submissionStatus === "Approved"
                                  ? "bg-green-400/20 text-green-400"
                                  : project.submissionStatus === "Rejected"
                                  ? "bg-red-400/20 text-red-400"
                                  : project.submissionStatus === "Pending Review"
                                  ? "bg-yellow-400/20 text-yellow-400"
                                  : "bg-gray-400/20 text-gray-400"
                              }`}
                            >
                              {project.submissionStatus}
                            </span>
                            {project.submissionStatus === "Not Submitted" && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => openModal(project)}
                                className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
                              >
                                Submit
                              </motion.button>
                            )}
                            {project.submissionStatus === "Pending Review" && !project.adminReviewed && (
                              <div className="flex space-x-2">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => simulateAdminReview(project.id, true)}
                                  className="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 transition-colors"
                                >
                                  Approve
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => simulateAdminReview(project.id, false)}
                                  className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition-colors"
                                >
                                  Reject
                                </motion.button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Attendance Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 grid gap-6 md:grid-cols-2"
        >
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Weekly Attendance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockData.weeklyAttendance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "none",
                    borderRadius: "0.375rem",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                  }}
                  itemStyle={{ color: "#D1D5DB" }}
                  labelStyle={{ color: "#F3F4F6" }}
                />
                <Bar dataKey="hours" fill="#8884d8">
                  {mockData.weeklyAttendance.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Monthly Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(mockData.monthlyAttendance).map(
                    ([key, value]) => ({ name: key, value })
                  )}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(mockData.monthlyAttendance).map(
                    (entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    )
                  )}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "none",
                    borderRadius: "0.375rem",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                   }}
                  labelStyle={{ color: "#F3F4F6" }}
                />
                <Legend
                  formatter={(value, entry, index) => (
                    <span style={{ color: "#9CA3AF" }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Productivity Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8"
        >
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Productivity Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockData.productivityTrend}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "none",
                    borderRadius: "0.375rem",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                  }}
                  labelStyle={{ color: "#F3F4F6" }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#8884d8"
                  fillOpacity={1}
                  fill="url(#colorScore)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </main>

      {/* Project Submission Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-xl border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                Submit Project: {selectedProject?.name}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="githubUrl"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    id="githubUrl"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                    placeholder="https://github.com/username/repo"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors dark:border-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Submit
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeveloperDashboard;


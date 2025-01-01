import React, { useState, useEffect } from "react";
import {
  Users,
  Briefcase,
  TrendingUp,
  Award,
  Moon,
  Sun,
  Plus,
  Search,
  Filter,
  LogOut,
  Calendar,
  Github,
  Globe,
  Zap,
  CheckCircle,
  Clock3,
  User,
  Pencil,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ScheduleManager from "./ScheduleManager";
import { useDarkMode } from "../utils/darkMode";
import {
  fetchUsers,
  fetchAllProjects,
  fetchAllCourses,
  Project,
  getSubmittedProjects,
  createProject,
  promoteToAdmin,
  demoteToUser,
  getUserProfile,
  editProject,
} from "../lib/api";
import ReviewModal from "./ReviewModal";
import { toast } from "react-hot-toast";
import { LoadingSpinner } from "./LoadingSpinner";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  projects?: number;
  productivity?: number;
  attendance?: number;
  uptime?: string;
  connectedWifi?: string;
}

interface ProjectWithSubmissions extends Project {
  submissions?: {
    courseName: string;
    projectDueDate: string;
    projectDescription: string;
    rating: number | undefined;
    projectId: number;
    courseId: number;
    id: number;
    userId: number;
    userName: string;
    userEmail: string;
    githubUrl: string;
    deployUrl: string;
    wsUrl?: string; // Add workshop URL
    submittedAt: string;
    isReviewed: boolean;
    projectName?: string;
    reviewNotes?: string;
    reviewVideo?: string;
    reviewVideoUrl?: string;
  }[];
}

interface SubmissionData {
  id: number;
  projectId: number;
  projectName: string;
  projectDescription: string;
  projectDueDate: string;
  courseId: number;
  courseName: string;
  userId: number;
  userName: string;
  userEmail: string;
  githubUrl: string;
  deployUrl: string;
  wsUrl?: string;
  submittedAt: string;
  isReviewed: boolean;
  reviewNotes?: string | null;
  reviewVideoUrl?: string | null;
  rating?: number | null;
}

interface FilterState {
  status: "all" | "pending" | "reviewed";
  project: string | null;
  search: string;
}

interface Course {
  id: number;
  name: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState("schedule");
  const [filter, setFilter] = useState<FilterState>({
    status: "all",
    project: null,
    search: "",
  });
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<ProjectWithSubmissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReview, setSelectedReview] = useState<SubmissionData | null>(
    null
  );
  const [showAddProject, setShowAddProject] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "ADMIN" | "USER">("ALL");
  const [editingProject, setEditingProject] =
    useState<ProjectWithSubmissions | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  useEffect(() => {
    const validateAdminAccess = async () => {
      try {
        const userProfile = await getUserProfile();
        if (userProfile.role !== "ADMIN") {
          toast.error("Unauthorized: Admin access required");
          navigate("/");
          return;
        }
        setLoading(false);
      } catch (error) {
        console.error("Error validating admin access:", error);
        toast.error("Failed to validate admin access");
        navigate("/");
      }
    };

    validateAdminAccess();
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch courses first
        const coursesData = await fetchAllCourses();
        if (!coursesData || coursesData.length === 0) {
          setError("No courses found. Please add a course first.");
          setLoading(false);
          return;
        }

        setCourses(coursesData);
        setSelectedCourseId(coursesData[0].id.toString());

        // Fetch other data in parallel
        const [usersData, projectsData, submissionsData] = await Promise.all([
          fetchUsers(),
          fetchAllProjects(),
          getSubmittedProjects(),
        ]);

        // Process and combine the data
        const enhancedProjects = projectsData.map((project) => ({
          ...project,
          submissions: submissionsData
            .filter((sub: SubmissionData) => sub.projectId === project.id)
            .map((sub: SubmissionData) => ({
              ...sub,
              projectName: project.name,
            })),
        }));

        setUsers(usersData);
        setProjects(enhancedProjects);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          `Failed to fetch data: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getFilteredSubmissions = () => {
    let submissions = projects.flatMap((p) => p.submissions || []);

    if (filter.project) {
      submissions = submissions.filter(
        (s) => s.projectId.toString() === filter.project
      );
    }

    if (filter.status !== "all") {
      submissions = submissions.filter((s) =>
        filter.status === "reviewed" ? s.isReviewed : !s.isReviewed
      );
    }

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      submissions = submissions.filter(
        (s) =>
          s.userName.toLowerCase().includes(searchLower) ||
          s.userEmail.toLowerCase().includes(searchLower) ||
          s.projectName?.toLowerCase().includes(searchLower)
      );
    }

    return submissions;
  };

  const getTotalStats = () => {
    const allSubmissions = projects.flatMap((p) => p.submissions || []);
    return {
      total: allSubmissions.length,
      reviewed: allSubmissions.filter((s) => s.isReviewed).length,
      pending: allSubmissions.filter((s) => !s.isReviewed).length,
    };
  };

  const getProjectStats = (projectId: number) => {
    const submissions = projects.flatMap((p) => p.submissions || []);
    const pending = submissions.filter(
      (s) => s.projectId === projectId && !s.isReviewed
    ).length;
    const reviewed = submissions.filter(
      (s) => s.projectId === projectId && s.isReviewed
    ).length;
    return { pending, reviewed };
  };

  const renderProjectSection = () => {
    const filteredSubmissions = getFilteredSubmissions();
    const totalStats = getTotalStats();

    return (
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
          <div className="flex-1 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search submissions..."
                value={filter.search}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, search: e.target.value }))
                }
                className={`w-full pl-10 pr-4 py-2 rounded-md border ${
                  darkMode
                    ? "bg-zinc-800 border-zinc-700"
                    : "bg-white border-gray-200"
                }`}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-md border transition-colors ${
                showFilters
                  ? darkMode
                    ? "bg-white text-black"
                    : "bg-black text-white"
                  : darkMode
                  ? "border-zinc-800 hover:border-zinc-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Filter className="h-5 w-5" />
            </button>

            <button
              onClick={() => setShowAddProject(true)}
              className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                darkMode
                  ? "bg-white text-black hover:bg-gray-100"
                  : "bg-black text-white hover:bg-gray-900"
              }`}
            >
              <Plus className="h-4 w-4" />
              <span>Add Project</span>
            </button>
          </div>
        </div>

        {showFilters && (
          <div
            className={`p-4 rounded-lg border ${
              darkMode
                ? "border-zinc-800 bg-zinc-900/50"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Filter by status</h3>
                <div className="flex gap-2">
                  {[
                    { label: "All", value: "all", count: totalStats.total },
                    {
                      label: "Reviewed",
                      value: "reviewed",
                      count: totalStats.reviewed,
                      icon: CheckCircle,
                    },
                    {
                      label: "Pending",
                      value: "pending",
                      count: totalStats.pending,
                      icon: Clock3,
                    },
                  ].map(({ label, value, count, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() =>
                        setFilter((prev) => ({
                          ...prev,
                          status: value as FilterState["status"],
                        }))
                      }
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors flex items-center gap-2 ${
                        filter.status === value
                          ? value === "reviewed"
                            ? "bg-green-500 text-white"
                            : value === "pending"
                            ? "bg-amber-500 text-white"
                            : darkMode
                            ? "bg-white text-black"
                            : "bg-black text-white"
                          : value === "reviewed"
                          ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                          : value === "pending"
                          ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                          : darkMode
                          ? "bg-zinc-800 hover:bg-zinc-700"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      <span>{label}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-xs ${
                          filter.status === value
                            ? "bg-black/20 text-white"
                            : darkMode
                            ? "bg-zinc-700 text-zinc-300"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Filter by project</h3>
                <div className="flex flex-wrap gap-2">
                  {projects.map((project) => {
                    const stats = getProjectStats(project.id);
                    return (
                      <button
                        key={project.id}
                        onClick={() =>
                          setFilter((prev) => ({
                            ...prev,
                            project:
                              prev.project === project.id.toString()
                                ? null
                                : project.id.toString(),
                          }))
                        }
                        className={`group px-4 py-2 rounded-md transition-all ${
                          filter.project === project.id.toString()
                            ? darkMode
                              ? "bg-white text-black"
                              : "bg-black text-white"
                            : `${
                                darkMode
                                  ? "bg-zinc-800 hover:bg-zinc-700"
                                  : "bg-gray-100 hover:bg-gray-200"
                              }`
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{project.name}</span>
                          <div className="flex items-center gap-2 text-sm">
                            {stats.pending > 0 && (
                              <span
                                className={`px-2 py-0.5 rounded-full ${
                                  filter.project === project.id.toString()
                                    ? "bg-amber-500 text-white"
                                    : darkMode
                                    ? "bg-amber-500/20 text-amber-500"
                                    : "bg-amber-100 text-amber-500"
                                }`}
                              >
                                {stats.pending} pending
                              </span>
                            )}
                            {stats.reviewed > 0 && (
                              <span
                                className={`px-2 py-0.5 rounded-full ${
                                  filter.project === project.id.toString()
                                    ? "bg-green-500 text-white"
                                    : darkMode
                                    ? "bg-green-500/20 text-green-500"
                                    : "bg-green-100 text-green-500"
                                }`}
                              >
                                {stats.reviewed} reviewed
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table section */}
        <div
          className={`rounded-lg overflow-hidden border ${
            darkMode ? "border-zinc-800" : "border-gray-200"
          }`}
        >
          <table className="w-full">
            <thead
              className={`text-left ${
                darkMode ? "bg-zinc-800/50" : "bg-gray-50"
              }`}
            >
              <tr>
                <th className="px-6 py-3 text-sm font-medium">Name</th>
                <th className="px-6 py-3 text-sm font-medium">Email</th>
                <th className="px-6 py-3 text-sm font-medium">Project</th>
                <th className="px-6 py-3 text-sm font-medium">
                  Submission Date
                </th>
                <th className="px-6 py-3 text-sm font-medium">Status</th>
                <th className="px-6 py-3 text-sm font-medium">Links</th>
                <th className="px-6 py-3 text-sm font-medium">Action</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                darkMode ? "divide-zinc-800" : "divide-gray-200"
              }`}
            >
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className={`px-6 py-8 text-center text-sm ${
                      darkMode ? "text-zinc-400" : "text-gray-500"
                    }`}
                  >
                    {filter.search
                      ? "No submissions found matching your search."
                      : filter.status !== "all"
                      ? `No ${filter.status} submissions found.`
                      : "No submissions found."}
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((submission) => (
                  <tr
                    key={submission.id}
                    className={`group ${
                      darkMode ? "hover:bg-zinc-800/50" : "hover:bg-gray-50"
                    } transition-colors`}
                  >
                    <td className="px-6 py-4 text-sm">{submission.userName}</td>
                    <td className="px-6 py-4 text-sm">
                      {submission.userEmail}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {submission.projectName}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          submission.isReviewed
                            ? "bg-green-500/10 text-green-500"
                            : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {submission.isReviewed ? (
                          <>
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            Reviewed
                          </>
                        ) : (
                          <>
                            <Clock3 className="h-3.5 w-3.5 mr-1" />
                            Pending
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-3">
                        <a
                          href={submission.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`transition-colors ${
                            darkMode
                              ? "text-zinc-400 hover:text-white"
                              : "text-gray-500 hover:text-black"
                          }`}
                        >
                          <Github className="h-5 w-5" />
                        </a>
                        <a
                          href={submission.deployUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`transition-colors ${
                            darkMode
                              ? "text-zinc-400 hover:text-white"
                              : "text-gray-500 hover:text-black"
                          }`}
                        >
                          <Globe className="h-5 w-5" />
                        </a>
                        {submission.wsUrl && (
                          <a
                            href={submission.wsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`transition-colors ${
                              darkMode
                                ? "text-zinc-400 hover:text-white"
                                : "text-gray-500 hover:text-black"
                            }`}
                          >
                            <Zap className="h-5 w-5" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => {
                          if (submission.isReviewed) {
                            const reviewData: SubmissionData = {
                              id: submission.id,
                              projectId: submission.projectId,
                              projectName: submission.projectName || "Unknown Project",
                              projectDescription: submission.projectDescription,
                              projectDueDate: submission.projectDueDate,
                              courseId: submission.courseId,
                              courseName: submission.courseName,
                              userId: submission.userId,
                              userName: submission.userName,
                              userEmail: submission.userEmail,
                              githubUrl: submission.githubUrl,
                              deployUrl: submission.deployUrl,
                              wsUrl: submission.wsUrl,
                              submittedAt: submission.submittedAt,
                              isReviewed: submission.isReviewed,
                              reviewNotes: submission.reviewNotes || null,
                              reviewVideoUrl: submission.reviewVideoUrl || null,
                              rating: submission.rating || null,
                            };
                            setSelectedReview(reviewData);
                          } else {
                            navigate(`/project-review/${submission.courseId || 1}/${submission.id}`);
                          }
                        }}
                        className={`px-4 py-2 rounded-md transition-colors ${
                          submission.isReviewed
                            ? "text-blue-500 bg-blue-500/10 hover:bg-blue-500/20"
                            : "text-red-500 bg-red-500/10 hover:bg-red-500/20"
                        }`}
                      >
                        {submission.isReviewed ? "View Review" : "Review Project"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderScheduleSection = () => {
    if (!courses.length) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-64">
            <label className="block text-sm font-medium mb-1">
              Select Course
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className={`w-full p-2 rounded-md border ${
                darkMode
                  ? "bg-zinc-800 border-zinc-700 text-white"
                  : "bg-white border-gray-200"
              }`}
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <ScheduleManager
          darkMode={darkMode}
          courseId={selectedCourseId}
          key={selectedCourseId}
        />
      </div>
    );
  };

  const renderUsersSection = () => {
    const handleRoleChange = async (
      userId: number,
      userName: string,
      newRole: "ADMIN" | "USER"
    ) => {
      try {
        const response =
          newRole === "ADMIN"
            ? await promoteToAdmin(userId)
            : await demoteToUser(userId);

        // Update local state
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, role: newRole } : user
          )
        );

        toast.success(
          response.message ||
            `${userName}'s role has been updated to ${newRole}`,
          {
            duration: 4000,
            position: "top-right",
            style: {
              background: darkMode ? "#27272a" : "#fff",
              color: darkMode ? "#fff" : "#000",
              border: `1px solid ${darkMode ? "#3f3f46" : "#e5e7eb"}`,
            },
          }
        );
      } catch (error) {
        console.error("Error changing user role:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : `Failed to change user role to ${newRole}`;
        toast.error(errorMessage, {
          duration: 4000,
          position: "top-right",
          style: {
            background: darkMode ? "#27272a" : "#fff",
            color: darkMode ? "#fff" : "#000",
            border: `1px solid ${darkMode ? "#3f3f46" : "#e5e7eb"}`,
          },
        });
      }
    };

    // Filter users based on search and role
    const filteredUsers = usersWithStats.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });

    return (
      <div className="space-y-6">
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 w-full sm:max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  darkMode
                    ? "bg-zinc-800 border-zinc-700 text-white"
                    : "bg-white border-gray-200"
                }`}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="flex gap-2">
            {["ALL", "ADMIN", "USER"].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role as "ALL" | "ADMIN" | "USER")}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  roleFilter === role
                    ? darkMode
                      ? "bg-white text-black"
                      : "bg-black text-white"
                    : darkMode
                    ? "bg-zinc-800 text-white hover:bg-zinc-700"
                    : "bg-gray-100 text-black hover:bg-gray-200"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div
          className={`rounded-lg border ${
            darkMode ? "border-zinc-800" : "border-gray-200"
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={darkMode ? "bg-zinc-800/50" : "bg-gray-50"}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium">
                    Stats
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium">
                    Last Active
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  darkMode ? "divide-zinc-800" : "divide-gray-200"
                }`}
              >
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-sm text-gray-500"
                    >
                      No users found matching your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className={`${
                        darkMode ? "hover:bg-zinc-800/50" : "hover:bg-gray-50"
                      } transition-colors`}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                              darkMode ? "bg-zinc-800" : "bg-gray-100"
                            }`}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{user.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">{user.email}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            user.role === "ADMIN"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm">
                            <span
                              className={`${
                                darkMode ? "text-zinc-400" : "text-gray-500"
                              }`}
                            >
                              Total:
                            </span>
                            <span className="font-medium">
                              {user.totalSubmissions}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3" />
                              {user.completedSubmissions}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              <Clock3 className="w-3 h-3" />
                              {user.pendingSubmissions}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {user.lastSubmission ? (
                          <div className="flex flex-col">
                            <span>
                              {user.lastSubmission.toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span
                              className={`text-xs ${
                                darkMode ? "text-zinc-400" : "text-gray-500"
                              }`}
                            >
                              {user.lastSubmission.toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        ) : (
                          <span
                            className={`text-sm ${
                              darkMode ? "text-zinc-400" : "text-gray-500"
                            }`}
                          >
                            No activity
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() =>
                            handleRoleChange(
                              user.id,
                              user.name,
                              user.role === "ADMIN" ? "USER" : "ADMIN"
                            )
                          }
                          className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                            user.role === "ADMIN"
                              ? darkMode
                                ? "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                                : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                              : darkMode
                              ? "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20"
                              : "bg-purple-100 text-purple-800 hover:bg-purple-200"
                          }`}
                        >
                          Make {user.role === "ADMIN" ? "User" : "Admin"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderEditProjectsSection = () => {
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
            onClick={() => setShowAddProject(true)}
            className={`px-4 py-2 rounded-md flex items-center gap-2 ${
              darkMode ? "bg-white text-black" : "bg-black text-white"
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
                darkMode
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
              darkMode
                ? "bg-zinc-800 border-zinc-700"
                : "bg-white border-gray-200"
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
                darkMode
                  ? "bg-zinc-800/50 border-zinc-700"
                  : "bg-white border-gray-200"
              } hover:border-blue-500 transition-colors`}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold truncate">{project.name}</h3>
                <button
                  onClick={() => setEditingProject(project)}
                  className="p-2 rounded-md hover:bg-blue-500/10 text-blue-500"
                  title="Edit Project"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>

              <p
                className={`text-sm mb-3 line-clamp-2 ${
                  darkMode ? "text-zinc-400" : "text-gray-600"
                }`}
              >
                {project.description}
              </p>

              <div className="flex flex-wrap gap-2 text-sm">
                <span
                  className={`px-2 py-1 rounded-full ${
                    darkMode
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

  const AddProjectModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [projectData, setProjectData] = useState({
      name: "",
      description: "",
      dueDate: "",
      courseId: courses[0]?.id || 0,
      notion: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const selectedCourse = courses.find(
          (c) => c.id === projectData.courseId
        );
        await createProject(projectData);

        // Refresh projects list
        const updatedProjects = await fetchAllProjects();
        setProjects(updatedProjects);

        // Show success toast
        toast.success(
          `Project added to ${selectedCourse?.name || "course"} successfully!`,
          {
            duration: 4000,
            position: "top-right",
            style: {
              background: darkMode ? "#27272a" : "#fff",
              color: darkMode ? "#fff" : "#000",
              border: `1px solid ${darkMode ? "#3f3f46" : "#e5e7eb"}`,
            },
          }
        );

        onClose();
      } catch (error) {
        console.error("Error creating project:", error);
        toast.error("Failed to create project. Please try again.", {
          duration: 4000,
          position: "top-right",
          style: {
            background: darkMode ? "#27272a" : "#fff",
            color: darkMode ? "#fff" : "#000",
            border: `1px solid ${darkMode ? "#3f3f46" : "#e5e7eb"}`,
          },
        });
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div
          className={`${
            darkMode ? "bg-zinc-900" : "bg-white"
          } rounded-lg p-6 w-full max-w-md`}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Add New Project</h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-full hover:bg-opacity-80 ${
                darkMode ? "hover:bg-zinc-800" : "hover:bg-gray-100"
              }`}
            >
              ×
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
                value={projectData.name}
                onChange={(e) =>
                  setProjectData((prev) => ({ ...prev, name: e.target.value }))
                }
                className={`w-full p-2 rounded-md border ${
                  darkMode
                    ? "bg-zinc-800 border-zinc-700 text-white"
                    : "bg-white border-gray-200"
                }`}
                placeholder="Enter project name"
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
                  darkMode
                    ? "bg-zinc-800 border-zinc-700 text-white"
                    : "bg-white border-gray-200"
                }`}
                rows={3}
                placeholder="Enter project description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Notion Link <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="url"
                value={projectData.notion}
                onChange={(e) =>
                  setProjectData((prev) => ({
                    ...prev,
                    notion: e.target.value,
                  }))
                }
                className={`w-full p-2 rounded-md border ${
                  darkMode
                    ? "bg-zinc-800 border-zinc-700 text-white"
                    : "bg-white border-gray-200"
                }`}
                placeholder="Enter Notion documentation link (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Course</label>
              <select
                required
                value={projectData.courseId}
                onChange={(e) =>
                  setProjectData((prev) => ({
                    ...prev,
                    courseId: Number(e.target.value),
                  }))
                }
                className={`w-full p-2 rounded-md border ${
                  darkMode
                    ? "bg-zinc-800 border-zinc-700 text-white"
                    : "bg-white border-gray-200"
                }`}
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <div className="relative">
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
                    darkMode
                      ? "bg-zinc-800 border-zinc-700 text-white"
                      : "bg-white border-gray-200"
                  }`}
                />
                <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-md ${
                  darkMode
                    ? "bg-zinc-800 hover:bg-zinc-700"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 rounded-md ${
                  darkMode
                    ? "bg-white text-black hover:bg-gray-100"
                    : "bg-black text-white hover:bg-gray-900"
                }`}
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const EditProjectModal: React.FC<{
    project: ProjectWithSubmissions;
    onClose: () => void;
  }> = ({ project, onClose }) => {
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
        const updatedProjects = await fetchAllProjects();
        setProjects(updatedProjects);

        toast.success("Project updated successfully!", {
          duration: 4000,
          position: "top-right",
          style: {
            background: darkMode ? "#27272a" : "#fff",
            color: darkMode ? "#fff" : "#000",
            border: `1px solid ${darkMode ? "#3f3f46" : "#e5e7eb"}`,
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
              background: darkMode ? "#27272a" : "#fff",
              color: darkMode ? "#fff" : "#000",
              border: `1px solid ${darkMode ? "#3f3f46" : "#e5e7eb"}`,
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
            darkMode ? "bg-zinc-900" : "bg-white"
          } rounded-lg p-6 w-full max-w-md`}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Edit Project</h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-full hover:bg-opacity-80 ${
                darkMode ? "hover:bg-zinc-800" : "hover:bg-gray-100"
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
                  darkMode
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
                  darkMode
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
                  darkMode
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
                  darkMode
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
                  darkMode
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

  const handleLogout = () => {
    localStorage.removeItem("authorization");
    navigate("/login");
  };

  // Calculate usersWithStats at component level
  const usersWithStats = users
    .map((user) => {
      const userSubmissions = projects
        .flatMap((p) => p.submissions || [])
        .filter((s) => s.userId === user.id);

      return {
        ...user,
        totalSubmissions: userSubmissions.length,
        completedSubmissions: userSubmissions.filter((s) => s.isReviewed)
          .length,
        pendingSubmissions: userSubmissions.filter((s) => !s.isReviewed).length,
        lastSubmission:
          userSubmissions.length > 0
            ? new Date(
                Math.max(
                  ...userSubmissions.map((s) =>
                    new Date(s.submittedAt).getTime()
                  )
                )
              )
            : null,
      };
    })
    .sort((a, b) => b.totalSubmissions - a.totalSubmissions);

  return (
    <div
      className={`flex flex-col min-h-screen ${
        darkMode ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      ) : (
        <header
          className={`sticky top-0 z-10 ${
            darkMode ? "bg-zinc-900" : "bg-white"
          } border-b ${darkMode ? "border-zinc-800" : "border-gray-200"}`}
        >
          <div className="flex flex-col p-4 max-w-7xl mx-auto">
            {/* Top row with title and controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <a className="flex gap-2 items-center" href="/admin">
                <img
                  className="size-10 rounded-full"
                  src="https://appx-wsb-gcp.akamai.net.in/subject/2023-01-17-0.17044360120951185.jpg"
                />
                <div className="text-3xl font-bold  bg-gradient-to-r from-blue-400 to-blue-700  inline-block text-transparent bg-clip-text">
                  100xReview
                </div>
              </a>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-full ${
                    darkMode
                      ? "bg-zinc-800 text-white hover:bg-zinc-700"
                      : "bg-gray-100 text-black hover:bg-gray-200"
                  } transition-colors`}
                >
                  {darkMode ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
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
                  className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-md ${
                    darkMode
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-red-500 hover:bg-red-600"
                  } text-white transition-colors`}
                >
                  <LogOut size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="text-sm sm:text-base">Logout</span>
                </button>
              </div>
            </div>

            {/* Stats grid - make it more responsive */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div
                className={`${
                  darkMode ? "bg-zinc-800" : "bg-gray-100"
                } rounded-lg p-3 sm:p-4`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      darkMode ? "bg-zinc-700" : "bg-white"
                    }`}
                  >
                    <Users className="h-4 sm:h-5 w-4 sm:w-5" />
                  </div>
                  <div>
                    <p
                      className={`text-xs sm:text-sm ${
                        darkMode ? "text-zinc-400" : "text-gray-500"
                      }`}
                    >
                      Total Users
                    </p>
                    <p className="text-base sm:text-lg font-semibold mt-0.5">
                      {users.length}
                    </p>
                  </div>
                </div>
              </div>
              <div
                className={`${
                  darkMode ? "bg-zinc-800" : "bg-gray-100"
                } rounded-lg p-3 sm:p-4`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      darkMode ? "bg-zinc-700" : "bg-white"
                    }`}
                  >
                    <Award className="h-4 sm:h-5 w-4 sm:w-5" />
                  </div>
                  <div>
                    <p
                      className={`text-xs sm:text-sm ${
                        darkMode ? "text-zinc-400" : "text-gray-500"
                      }`}
                    >
                      Most Active User
                    </p>
                    <p className="text-base sm:text-lg font-semibold mt-0.5">
                      {usersWithStats[0]?.name || "N/A"}
                    </p>
                    <p
                      className={`text-xs ${
                        darkMode ? "text-zinc-500" : "text-gray-400"
                      }`}
                    >
                      {usersWithStats[0]?.totalSubmissions || 0} submissions
                    </p>
                  </div>
                </div>
              </div>
              <div
                className={`${
                  darkMode ? "bg-zinc-800" : "bg-gray-100"
                } rounded-lg p-3 sm:p-4`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      darkMode ? "bg-zinc-700" : "bg-white"
                    }`}
                  >
                    <TrendingUp className="h-4 sm:h-5 w-4 sm:w-5" />
                  </div>
                  <div>
                    <p
                      className={`text-xs sm:text-sm ${
                        darkMode ? "text-zinc-400" : "text-gray-500"
                      }`}
                    >
                      Average Submissions
                    </p>
                    <p className="text-base sm:text-lg font-semibold mt-0.5">
                      {(
                        usersWithStats.reduce(
                          (acc, user) => acc + user.totalSubmissions,
                          0
                        ) / users.length
                      ).toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
              <div
                className={`${
                  darkMode ? "bg-zinc-800" : "bg-gray-100"
                } rounded-lg p-3 sm:p-4`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      darkMode ? "bg-zinc-700" : "bg-white"
                    }`}
                  >
                    <Briefcase className="h-4 sm:h-5 w-4 sm:w-5" />
                  </div>
                  <div>
                    <p
                      className={`text-xs sm:text-sm ${
                        darkMode ? "text-zinc-400" : "text-gray-500"
                      }`}
                    >
                      Total Submissions
                    </p>
                    <p className="text-base sm:text-lg font-semibold mt-0.5">
                      {usersWithStats.reduce(
                        (acc, user) => acc + user.totalSubmissions,
                        0
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          <div
            className={`${
              darkMode
                ? "bg-zinc-900 border-zinc-800"
                : "bg-white border-gray-200"
            } border rounded-lg overflow-hidden`}
          >
            <div className="p-3 sm:p-4 md:p-6">
              <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                {["schedule", "projects", "edit-projects", "users"].map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-sm sm:text-base transition-colors ${
                        activeTab === tab
                          ? darkMode
                            ? "bg-white text-black"
                            : "bg-black text-white"
                          : darkMode
                          ? "bg-zinc-800 text-white hover:bg-zinc-700"
                          : "bg-gray-100 text-black hover:bg-gray-200"
                      }`}
                    >
                      {tab
                        .split("-")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </button>
                  )
                )}
              </div>

              <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  {activeTab === "schedule" && renderScheduleSection()}
                  {activeTab === "projects" && renderProjectSection()}
                  {activeTab === "edit-projects" && renderEditProjectsSection()}
                  {activeTab === "users" && renderUsersSection()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {selectedReview && (
        <ReviewModal
          review={{
            reviewNotes: selectedReview.reviewNotes || undefined,
            reviewVideoUrl: selectedReview.reviewVideoUrl || undefined,
            projectName: selectedReview.projectName,
            userName: selectedReview.userName,
            rating: selectedReview.rating || undefined,
          }}
          onClose={() => {
            console.log('Closing review modal with data:', selectedReview);
            setSelectedReview(null);
          }}
        />
      )}
      {showAddProject && (
        <AddProjectModal onClose={() => setShowAddProject(false)} />
      )}
      {editingProject && (
        <EditProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;

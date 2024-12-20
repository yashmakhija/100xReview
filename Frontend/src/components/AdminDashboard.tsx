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
} from "../lib/api";
import ReviewModal from "./ReviewModal";
import { toast } from "react-hot-toast";

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

interface ScheduleItem {
  id: number;
  date: string;
  topic: string;
  description: string;
}

interface ProjectWithSubmissions extends Project {
  submissions?: {
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
  projectId: number;
  courseId: number;
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  githubUrl: string;
  deployUrl: string;
  wsUrl?: string;
  submittedAt: string;
  isReviewed: boolean;
  reviewNotes?: string;
  reviewVideoUrl?: string;
  projectName: string;
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
  const [activeTab, setActiveTab] = useState("projects");
  const [filter, setFilter] = useState<FilterState>({
    status: "all",
    project: null,
    search: "",
  });
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<ProjectWithSubmissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReview, setSelectedReview] = useState<SubmissionData | null>(null);
  const [showAddProject, setShowAddProject] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

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
    const pending = submissions.filter(s => s.projectId === projectId && !s.isReviewed).length;
    const reviewed = submissions.filter(s => s.projectId === projectId && s.isReviewed).length;
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
              onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
              className={`w-full pl-10 pr-4 py-2 rounded-md border ${
                darkMode ? "bg-zinc-800 border-zinc-700" : "bg-white border-gray-200"
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
        <div className={`rounded-lg overflow-hidden border ${
          darkMode ? "border-zinc-800" : "border-gray-200"
        }`}>
          <table className="w-full">
            <thead className={`text-left ${darkMode ? "bg-zinc-800/50" : "bg-gray-50"}`}>
              <tr>
                <th className="px-6 py-3 text-sm font-medium">Name</th>
                <th className="px-6 py-3 text-sm font-medium">Email</th>
                <th className="px-6 py-3 text-sm font-medium">Project</th>
                <th className="px-6 py-3 text-sm font-medium">Submission Date</th>
                <th className="px-6 py-3 text-sm font-medium">Status</th>
                <th className="px-6 py-3 text-sm font-medium">Links</th>
                <th className="px-6 py-3 text-sm font-medium">Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? "divide-zinc-800" : "divide-gray-200"}`}>
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className={`px-6 py-8 text-center text-sm ${
                    darkMode ? "text-zinc-400" : "text-gray-500"
                  }`}>
                    {filter.search
                      ? "No submissions found matching your search."
                      : filter.status !== "all"
                      ? `No ${filter.status} submissions found.`
                      : "No submissions found."}
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((submission) => (
                  <tr key={submission.id} className={`group ${
                    darkMode ? "hover:bg-zinc-800/50" : "hover:bg-gray-50"
                  } transition-colors`}>
                    <td className="px-6 py-4 text-sm">{submission.userName}</td>
                    <td className="px-6 py-4 text-sm">{submission.userEmail}</td>
                    <td className="px-6 py-4 text-sm">{submission.projectName}</td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        submission.isReviewed
                          ? "bg-green-500/10 text-green-500"
                          : "bg-amber-500/10 text-amber-500"
                      }`}>
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
                            setSelectedReview({
                              ...submission,
                              projectId:
                                Number(filter.project) || submission.projectId,
                              projectName:
                                submission.projectName || "Unknown Project",
                              courseId: submission.courseId || 1,
                            });
                          } else {
                            navigate(
                              `/project-review/${submission.courseId || 1}/${
                                submission.id
                              }`
                            );
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
            <label className="block text-sm font-medium mb-1">Select Course</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className={`w-full p-2 rounded-md border ${
                darkMode
                  ? "bg-zinc-800 border-zinc-700 text-white"
                  : "bg-white border-gray-200"
              }`}
            >
              {courses.map(course => (
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
    // Sort users based on number of project submissions
    const usersWithStats = users.map(user => {
      const userSubmissions = projects.flatMap(p => p.submissions || [])
        .filter(s => s.userId === user.id);
      
      return {
        ...user,
        totalSubmissions: userSubmissions.length,
        completedSubmissions: userSubmissions.filter(s => s.isReviewed).length,
        pendingSubmissions: userSubmissions.filter(s => !s.isReviewed).length,
        lastSubmission: userSubmissions.length > 0 
          ? new Date(Math.max(...userSubmissions.map(s => new Date(s.submittedAt).getTime())))
          : null
      };
    }).sort((a, b) => b.totalSubmissions - a.totalSubmissions);

    return (
      <div className="space-y-6">
        {/* Users Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Users",
              value: users.length,
              icon: Users,
            },
            {
              label: "Most Active User",
              value: usersWithStats[0]?.name || "N/A",
              subtext: `${usersWithStats[0]?.totalSubmissions || 0} submissions`,
              icon: Award,
            },
            {
              label: "Average Submissions",
              value: (usersWithStats.reduce((acc, user) => acc + user.totalSubmissions, 0) / users.length).toFixed(1),
              icon: TrendingUp,
            },
            {
              label: "Total Submissions",
              value: usersWithStats.reduce((acc, user) => acc + user.totalSubmissions, 0),
              icon: Briefcase,
            },
          ].map((stat, index) => (
            <div
              key={index}
              className={`${
                darkMode
                  ? "bg-zinc-900 border-zinc-800"
                  : "bg-white border-gray-200"
              } border rounded-lg p-6`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${
                  darkMode ? "bg-zinc-800" : "bg-gray-100"
                }`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className={`text-sm ${
                    darkMode ? "text-zinc-400" : "text-gray-500"
                  }`}>
                    {stat.label}
                  </p>
                  <p className="text-xl font-semibold mt-1">{stat.value}</p>
                  {stat.subtext && (
                    <p className={`text-sm ${
                      darkMode ? "text-zinc-500" : "text-gray-400"
                    }`}>
                      {stat.subtext}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Users Table */}
        <div className={`rounded-lg border ${
          darkMode ? "border-zinc-800" : "border-gray-200"
        }`}>
          <table className="w-full">
            <thead className={darkMode ? "bg-zinc-800/50" : "bg-gray-50"}>
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">User</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Role</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Total Submissions</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Completed</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Pending</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Last Submission</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              darkMode ? "divide-zinc-800" : "divide-gray-200"
            }`}>
              {usersWithStats.map((user) => (
                <tr key={user.id} className={`${
                  darkMode ? "hover:bg-zinc-800/50" : "hover:bg-gray-50"
                } transition-colors`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        darkMode ? "bg-zinc-800" : "bg-gray-100"
                      }`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{user.totalSubmissions}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {user.completedSubmissions}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      {user.pendingSubmissions}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {user.lastSubmission 
                      ? user.lastSubmission.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : 'No submissions'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const AddProjectModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [projectData, setProjectData] = useState({
      name: "",
      description: "",
      dueDate: "",
      courseId: courses[0]?.id || 0
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const selectedCourse = courses.find(c => c.id === projectData.courseId);
        await createProject(projectData);
        
        // Refresh projects list
        const updatedProjects = await fetchAllProjects();
        setProjects(updatedProjects);
        
        // Show success toast
        toast.success(`Project added to ${selectedCourse?.name || 'course'} successfully!`, {
          duration: 4000,
          position: 'top-right',
          style: {
            background: darkMode ? '#27272a' : '#fff',
            color: darkMode ? '#fff' : '#000',
            border: `1px solid ${darkMode ? '#3f3f46' : '#e5e7eb'}`,
          },
        });
        
        onClose();
      } catch (error) {
        console.error("Error creating project:", error);
        toast.error("Failed to create project. Please try again.", {
          duration: 4000,
          position: 'top-right',
          style: {
            background: darkMode ? '#27272a' : '#fff',
            color: darkMode ? '#fff' : '#000',
            border: `1px solid ${darkMode ? '#3f3f46' : '#e5e7eb'}`,
          },
        });
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className={`${darkMode ? "bg-zinc-900" : "bg-white"} rounded-lg p-6 w-full max-w-md`}>
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
              <label className="block text-sm font-medium mb-1">Project Name</label>
              <input
                type="text"
                required
                value={projectData.name}
                onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full p-2 rounded-md border ${
                  darkMode
                    ? "bg-zinc-800 border-zinc-700 text-white"
                    : "bg-white border-gray-200"
                }`}
                placeholder="Enter project name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                required
                value={projectData.description}
                onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
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
              <label className="block text-sm font-medium mb-1">Course</label>
              <select
                required
                value={projectData.courseId}
                onChange={(e) => setProjectData(prev => ({ ...prev, courseId: Number(e.target.value) }))}
                className={`w-full p-2 rounded-md border ${
                  darkMode
                    ? "bg-zinc-800 border-zinc-700 text-white"
                    : "bg-white border-gray-200"
                }`}
              >
                <option value="">Select a course</option>
                {courses.map(course => (
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
                  onChange={(e) => setProjectData(prev => ({ ...prev, dueDate: e.target.value }))}
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

  const handleLogout = () => {
    localStorage.removeItem("authorization");
    navigate("/login");
  };

  return (
    <div className={`flex flex-col min-h-screen ${darkMode ? "bg-black text-white" : "bg-white text-black"}`}>
      <header className={`sticky top-0 z-10 ${darkMode ? "bg-zinc-900" : "bg-white"} border-b ${darkMode ? "border-zinc-800" : "border-gray-200"}`}>
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${darkMode ? "bg-zinc-800 text-white hover:bg-zinc-700" : "bg-gray-100 text-black hover:bg-gray-200"} transition-colors`}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={handleLogout}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                darkMode
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-red-500 hover:bg-red-600"
              } text-white transition-colors`}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Users,
                label: "Total Users",
                value: users.length.toString(),
              },
              {
                icon: Briefcase,
                label: "Active Projects",
                value: projects.length.toString(),
              },
              {
                icon: TrendingUp,
                label: "Average Productivity",
                value: `${(
                  users.reduce(
                    (sum, user) => sum + (user.productivity || 0),
                    0
                  ) / Math.max(users.length, 1)
                ).toFixed(1)}%`,
              },
              {
                icon: Award,
                label: "Top Performer",
                value:
                  users.length > 0
                    ? users.reduce((max, user) =>
                        (max.productivity || 0) > (user.productivity || 0)
                          ? max
                          : user
                      ).name
                    : "N/A",
              },
            ].map((stat, index) => (
              <div
                key={index}
                className={`${
                  darkMode
                    ? "bg-zinc-900 border-zinc-800"
                    : "bg-white border-gray-200"
                } border rounded-lg p-6 flex items-center`}
              >
                <stat.icon
                  className={`w-12 h-12 rounded-full ${
                    darkMode
                      ? "bg-zinc-800 text-white"
                      : "bg-gray-100 text-black"
                  } p-2 mr-4`}
                />
                <div>
                  <h2
                    className={`text-sm font-medium ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {stat.label}
                  </h2>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={`${darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"} border rounded-lg overflow-hidden`}>
            <div className="p-6">
              <div className="flex flex-wrap gap-2 mb-6">
                {["schedule", "projects", "users"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      activeTab === tab
                        ? darkMode
                          ? "bg-white text-black"
                          : "bg-black text-white"
                        : darkMode
                        ? "bg-zinc-800 text-white hover:bg-zinc-700"
                        : "bg-gray-100 text-black hover:bg-gray-200"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                {activeTab === "projects" && renderProjectSection()}
                {activeTab === "schedule" && renderScheduleSection()}
                {activeTab === "users" && renderUsersSection()}
              </div>
            </div>
          </div>
        </div>
      </main>

      {selectedReview && (
        <ReviewModal review={selectedReview} onClose={() => setSelectedReview(null)} />
      )}
      {showAddProject && <AddProjectModal onClose={() => setShowAddProject(false)} />}
    </div>
  );
};

export default AdminDashboard;

import React, { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  CheckCircle,
  Clock3,
  Github,
  Globe,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../../lib/utils";
import { ProjectWithSubmissions, Submission } from "@/types/submission";

interface FilterState {
  status: "all" | "pending" | "reviewed";
  project: string | null;
  search: string;
}

interface ProjectsTableProps {
  projects: ProjectWithSubmissions[];
  isDark: boolean;
  onAddProject: () => void;
  onViewReview: (submission: Submission) => void;
}

const ProjectsTable: React.FC<ProjectsTableProps> = ({
  projects,
  isDark,
  onAddProject,
  onViewReview,
}) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterState>({
    status: "all",
    project: null,
    search: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Helper functions
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
          s.user.name.toLowerCase().includes(searchLower) ||
          s.user.email.toLowerCase().includes(searchLower) ||
          s.project.name.toLowerCase().includes(searchLower)
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
              className={cn(
                "w-full pl-10 pr-4 py-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-sky-500/20",
                isDark
                  ? "bg-zinc-800/50 border-zinc-700 text-white"
                  : "bg-white border-gray-200"
              )}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "p-2.5 rounded-lg transition-colors",
              showFilters
                ? "bg-sky-500 text-white"
                : isDark
                ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-black"
            )}
          >
            <Filter className="h-5 w-5" />
          </button>

          <button
            onClick={onAddProject}
            className={cn(
              "px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 font-medium",
              isDark
                ? "bg-white text-black hover:bg-gray-100"
                : "bg-sky-500 text-white hover:bg-sky-600"
            )}
          >
            <Plus className="h-4 w-4" />
            <span>Add Project</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <div
          className={cn(
            "p-5 rounded-xl border",
            isDark
              ? "border-zinc-800 bg-zinc-900/50"
              : "border-gray-100 bg-gray-50/50"
          )}
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
                          : isDark
                          ? "bg-white text-black"
                          : "bg-black text-white"
                        : value === "reviewed"
                        ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                        : value === "pending"
                        ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                        : isDark
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
                          : isDark
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
                          ? isDark
                            ? "bg-white text-black"
                            : "bg-black text-white"
                          : `${
                              isDark
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
                                  : isDark
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
                                  : isDark
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
          isDark ? "border-zinc-800" : "border-gray-200"
        }`}
      >
        <table className="w-full">
          <thead
            className={`text-left ${isDark ? "bg-zinc-800/50" : "bg-gray-50"}`}
          >
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
          <tbody
            className={`divide-y ${
              isDark ? "divide-zinc-800" : "divide-gray-200"
            }`}
          >
            {filteredSubmissions.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className={`px-6 py-8 text-center text-sm ${
                    isDark ? "text-zinc-400" : "text-gray-500"
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
                    isDark ? "hover:bg-zinc-800/50" : "hover:bg-gray-50"
                  } transition-colors`}
                >
                  <td className="px-6 py-4 text-sm">{submission.user.name}</td>
                  <td className="px-6 py-4 text-sm">{submission.user.email}</td>
                  <td className="px-6 py-4 text-sm">
                    {submission.project.name}
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
                          isDark
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
                          isDark
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
                            isDark
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
                          onViewReview(submission);
                        } else {
                          navigate(`/project-review/1/${submission.id}`);
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

export default ProjectsTable;

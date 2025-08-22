import React, { useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { toast } from "react-hot-toast";
import { promoteToAdmin, demoteToUser } from "../../../lib/api";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  number?: string | null;
  isOnboarded?: boolean;
  createdAt?: string;
  enrollments?: Array<{
    id: number;
    courseId: number;
    course?: { id: number; name: string };
  }>;
  totalSubmissions?: number;
  completedSubmissions?: number;
  pendingSubmissions?: number;
  lastSubmission?: Date | null;
}

interface UsersTableProps {
  users: User[];
  isDark: boolean;
  onAddUser?: () => void;
}

const UsersTable: React.FC<UsersTableProps> = ({
  users,
  isDark,
  onAddUser,
}) => {
  console.log("[UsersTable] users prop count:", users.length);
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "ADMIN" | "USER">("ALL");

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

      toast.success(
        response.message || `${userName}'s role has been updated to ${newRole}`,
        {
          duration: 4000,
          position: "top-right",
          style: {
            background: isDark ? "#27272a" : "#fff",
            color: isDark ? "#fff" : "#000",
            border: `1px solid ${isDark ? "#3f3f46" : "#e5e7eb"}`,
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
          background: isDark ? "#27272a" : "#fff",
          color: isDark ? "#fff" : "#000",
          border: `1px solid ${isDark ? "#3f3f46" : "#e5e7eb"}`,
        },
      });
    }
  };

  // Filter users based on search and role
  const filteredUsers = users.filter((user) => {
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
                isDark
                  ? "bg-zinc-800 border-zinc-700 text-white"
                  : "bg-white border-gray-200"
              }`}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {["ALL", "ADMIN", "USER"].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role as "ALL" | "ADMIN" | "USER")}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  roleFilter === role
                    ? isDark
                      ? "bg-white text-black"
                      : "bg-black text-white"
                    : isDark
                    ? "bg-zinc-800 text-white hover:bg-zinc-700"
                    : "bg-gray-100 text-black hover:bg-gray-200"
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {onAddUser && (
            <button
              onClick={onAddUser}
              className={`px-4 cursor-pointer py-2 rounded-md flex items-center gap-2 text-sm ${
                isDark
                  ? "bg-white text-black hover:bg-gray-100"
                  : "bg-black text-white hover:bg-gray-900"
              }`}
            >
              <UserPlus className="h-4  w-4" />
              <span>Add User</span>
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div
        className={`rounded-lg border ${
          isDark ? "border-zinc-800" : "border-gray-200"
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={isDark ? "bg-zinc-800/50" : "bg-gray-50"}>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium">
                  Onboarded
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium">
                  Enrollments
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                isDark ? "divide-zinc-800" : "divide-gray-200"
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
                      isDark ? "hover:bg-zinc-800/50" : "hover:bg-gray-50"
                    } transition-colors`}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                            isDark ? "bg-zinc-800" : "bg-gray-100"
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
                    <td className="px-4 py-4 text-sm">{user.number ?? "-"}</td>
                    <td className="px-4 py-4 text-sm">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          user.isOnboarded
                            ? isDark
                              ? "bg-green-500/10 text-green-400"
                              : "bg-green-100 text-green-800"
                            : isDark
                            ? "bg-zinc-800 text-zinc-300"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {user.isOnboarded ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "-"}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {user.enrollments && user.enrollments.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs">
                            {user.enrollments.length} course(s)
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {user.enrollments.map((enr) => (
                              <span
                                key={enr.id}
                                className={`text-[11px] px-2 py-0.5 rounded-full ${
                                  isDark
                                    ? "bg-blue-500/10 text-blue-400"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {enr.course?.name ?? `Course #${enr.courseId}`}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span
                          className={isDark ? "text-zinc-400" : "text-gray-500"}
                        >
                          None
                        </span>
                      )}
                    </td>
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
                            ? isDark
                              ? "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                              : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                            : isDark
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

export default UsersTable;

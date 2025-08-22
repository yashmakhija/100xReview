import React from "react";
import { Users, Award, BarChart3, Briefcase, TrendingUp } from "lucide-react";
import StatCard from "./StatCard";
import { cn } from "../../../lib/utils";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  totalSubmissions: number;
  completedSubmissions: number;
  pendingSubmissions: number;
  lastSubmission: Date | null;
}

interface StatsProps {
  users: User[];
  isDark: boolean;
}

const StatsSection: React.FC<StatsProps> = ({ users, isDark }) => {
  // Calculate stats
  const totalUsers = users.length;
  const mostActiveUser = users[0] || { name: "N/A", totalSubmissions: 0 };

  const totalSubmissions = users.reduce(
    (acc, user) => acc + user.totalSubmissions,
    0
  );

  const averageSubmissions = totalUsers
    ? (totalSubmissions / totalUsers).toFixed(1)
    : "0.0";

  const thisWeekSubmissions = Math.round(totalSubmissions * 0.3); // Example calculation

  return (
    <div className="bg-gradient-to-b from-sky-500/10 to-transparent py-6">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Users Card */}
          <StatCard
            title="Total Users"
            value={totalUsers}
            icon={Users}
            iconBgClass={isDark ? "bg-sky-500/10" : "bg-sky-50"}
            iconColor="text-sky-500"
            isDark={isDark}
            footer={
              <div className="flex items-center gap-1 text-xs">
                <span className="flex items-center text-emerald-500 gap-0.5">
                  <TrendingUp size={14} />
                  12%
                </span>
                <span className={isDark ? "text-zinc-400" : "text-gray-500"}>
                  vs last month
                </span>
              </div>
            }
          />

          {/* Most Active User Card */}
          <StatCard
            title="Most Active User"
            value={mostActiveUser.name}
            icon={Award}
            iconBgClass={isDark ? "bg-amber-500/10" : "bg-amber-50"}
            iconColor="text-amber-500"
            isDark={isDark}
            footer={
              <div className="flex items-center gap-1 text-xs">
                <span className="font-medium text-sky-500">
                  {mostActiveUser.totalSubmissions} submissions
                </span>
              </div>
            }
          />

          {/* Average Submissions Card */}
          <StatCard
            title="Average Submissions"
            value={averageSubmissions}
            icon={BarChart3}
            iconBgClass={isDark ? "bg-emerald-500/10" : "bg-emerald-50"}
            iconColor="text-emerald-500"
            isDark={isDark}
            footer={
              <div className="flex items-center gap-1 text-xs">
                <span className="flex items-center text-emerald-500 gap-0.5">
                  <TrendingUp size={14} />
                  8%
                </span>
                <span className={isDark ? "text-zinc-400" : "text-gray-500"}>
                  increase
                </span>
              </div>
            }
          />

          {/* Total Submissions Card */}
          <StatCard
            title="Total Submissions"
            value={totalSubmissions}
            icon={Briefcase}
            iconBgClass={isDark ? "bg-purple-500/10" : "bg-purple-50"}
            iconColor="text-purple-500"
            isDark={isDark}
            footer={
              <div className="flex items-center gap-1 text-xs">
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-full",
                    isDark ? "bg-sky-500/20" : "bg-sky-50",
                    "text-sky-500"
                  )}
                >
                  This week: {thisWeekSubmissions}
                </span>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default StatsSection;

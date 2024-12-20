import React from "react";
import { type LucideIcon } from "lucide-react";

interface Stat {
  icon: LucideIcon;
  label: string;
  value: string;
}

interface StatsGridProps {
  stats: Stat[];
  darkMode: boolean;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats, darkMode }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {stats.map((stat, index) => (
      <div
        key={index}
        className={`${
          darkMode ? "bg-gray-800" : "bg-white"
        } rounded-lg shadow-md p-6 flex items-center transition-all duration-300 hover:shadow-lg`}
      >
        <div
          className={`p-3 rounded-full ${
            darkMode ? "bg-gray-700" : "bg-gray-100"
          } mr-4`}
        >
          <stat.icon
            className={`h-6 w-6 ${
              darkMode ? "text-gray-200" : "text-gray-700"
            }`}
          />
        </div>
        <div>
          <p
            className={`text-sm font-medium ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {stat.label}
          </p>
          <p className="text-2xl font-semibold mt-1">{stat.value}</p>
        </div>
      </div>
    ))}
  </div>
);

import React from "react";
import { cn } from "../../../lib/utils";

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDark: boolean;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  setActiveTab,
  isDark,
}) => {
  const tabs = [
    { id: "schedule", label: "Schedule" },
    { id: "courses", label: "Courses" },
    { id: "projects", label: "Projects" },
    { id: "edit-projects", label: "Edit Projects" },
    { id: "users", label: "Users" },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            activeTab === tab.id
              ? "bg-sky-500 text-white"
              : isDark
              ? "bg-zinc-800 hover:bg-zinc-700"
              : "bg-gray-100 hover:bg-gray-200"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;

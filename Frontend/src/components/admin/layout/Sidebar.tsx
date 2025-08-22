import React from "react";
import {
  Home,
  ClipboardList,
  Settings,
  Users,
  Sun,
  PanelLeft,
  Calendar,
  Moon,
  BookOpen,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { images } from "../../../assets";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isDark: boolean;
  toggleDarkMode: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  sidebarCollapsed,
  setSidebarCollapsed,
  isDark,
  toggleDarkMode,
}) => {
  // Navigation menu items
  const navItems = [
    { name: "Dashboard", icon: Home, isActive: activeTab === "dashboard" },
    {
      name: "Courses",
      icon: BookOpen,
      isActive: activeTab === "courses",
    },
    {
      name: "Schedule",
      icon: Calendar,
      isActive: activeTab === "schedule",
    },
    {
      name: "Projects",
      icon: ClipboardList,
      isActive: activeTab === "projects",
    },
    {
      name: "Manage Projects",
      icon: Settings,
      isActive: activeTab === "edit-projects",
    },
    { name: "Users", icon: Users, isActive: activeTab === "users" },
  ];

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 z-30 flex flex-col transition-all duration-300 ease-in-out border-r",
        isDark ? "bg-[#0a0a0a] border-zinc-800" : "bg-white border-gray-100",
        sidebarCollapsed ? "w-[70px]" : "w-[250px]"
      )}
    >
      {/* Sidebar Header */}
      <div
        className={cn(
          "flex items-center gap-2 py-6",
          sidebarCollapsed ? "justify-center" : "px-4"
        )}
      >
        <img
          src={isDark ? images.logoWhite : images.logoDark}
          alt="100x Dashboard"
          className="w-10 h-10 rounded-xl"
        />
        {!sidebarCollapsed && (
          <span className="text-lg font-semibold font-poppins truncate">
            100<span className="text-sky-500">x</span>Dashboard
          </span>
        )}
      </div>

      {/* Sidebar Nav */}
      <div className="flex-1 py-6">
        <div className="px-2">
          {navItems.map((item) => (
            <button
              key={item.name.toLowerCase()}
              onClick={() =>
                setActiveTab(item.name.toLowerCase().replace(" ", "-"))
              }
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg mb-1 transition-colors font-medium",
                item.isActive
                  ? "bg-sky-500/10 text-sky-500"
                  : isDark
                  ? "hover:bg-zinc-800"
                  : "hover:bg-gray-50",
                sidebarCollapsed ? "justify-center" : ""
              )}
            >
              <item.icon size={20} />
              {!sidebarCollapsed && (
                <span className="truncate">{item.name}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sidebar Footer */}
      <div
        className={cn(
          "mt-auto py-6 border-t",
          isDark ? "border-zinc-800" : "border-gray-100",
          sidebarCollapsed ? "px-2" : "px-4"
        )}
      >
        <button
          onClick={toggleDarkMode}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-colors",
            isDark ? "hover:bg-zinc-800" : "hover:bg-gray-100",
            sidebarCollapsed ? "justify-center" : ""
          )}
        >
          {isDark ? (
            <>
              <Sun size={20} />
              {!sidebarCollapsed && <span>Light Mode</span>}
            </>
          ) : (
            <>
              <Moon size={20} />
              {!sidebarCollapsed && <span>Dark Mode</span>}
            </>
          )}
        </button>

        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg mt-2 transition-colors",
            isDark ? "hover:bg-zinc-800" : "hover:bg-gray-100",
            sidebarCollapsed ? "justify-center" : ""
          )}
        >
          <PanelLeft size={20} />
          {!sidebarCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

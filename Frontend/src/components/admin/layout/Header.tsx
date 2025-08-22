import React from "react";
import { Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../../lib/utils";

interface HeaderProps {
  activeTab: string;
  isDark: boolean;
  handleLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, isDark, handleLogout }) => {
  const navigate = useNavigate();

  return (
    <header
      className={cn(
        "sticky top-0 z-20 border-b py-4",
        isDark ? "bg-[#111111] border-zinc-800" : "bg-white border-gray-100"
      )}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto px-6">
        {/* Page Title */}
        <h1 className="text-xl font-semibold font-poppins">
          {activeTab === "dashboard" && "Dashboard Overview"}
          {activeTab === "schedule" && "Schedule Manager"}
          {activeTab === "projects" && "Projects Submissions"}
          {activeTab === "edit-projects" && "Manage Projects"}
          {activeTab === "users" && "User Management"}
        </h1>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button
            className={cn(
              "p-2 rounded-full relative",
              isDark ? "hover:bg-zinc-800" : "hover:bg-gray-100"
            )}
          >
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-sky-500" />
          </button>

          {/* Profile Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-3"
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-white",
                  "bg-gradient-to-br from-sky-400 to-sky-600"
                )}
              >
                <span className="text-sm font-medium">A</span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium">Admin User</p>
                <p
                  className={cn(
                    "text-xs",
                    isDark ? "text-zinc-400" : "text-gray-500"
                  )}
                >
                  admin@100xdevs.com
                </p>
              </div>
            </button>

            <button
              onClick={handleLogout}
              className={cn(
                "p-2 rounded-full text-red-500",
                isDark ? "hover:bg-zinc-800" : "hover:bg-gray-100"
              )}
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

import React from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

interface LogoutButtonProps {
  variant?: "icon" | "text" | "full";
  className?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = "full",
  className = "",
}) => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success("Successfully logged out");
    navigate("/signin");
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleLogout}
        className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
        aria-label="Logout"
      >
        <LogOut className="h-5 w-5" />
      </button>
    );
  }

  if (variant === "text") {
    return (
      <button
        onClick={handleLogout}
        className={`text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors ${className}`}
      >
        Logout
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      className={`flex items-center gap-2 px-4 py-2 rounded-md bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 transition-colors ${className}`}
    >
      <LogOut className="h-4 w-4" />
      <span>Logout</span>
    </button>
  );
};

export default LogoutButton;

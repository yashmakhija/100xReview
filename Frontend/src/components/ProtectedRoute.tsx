import { Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { fetchWithAuth } from "../lib/api";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: "ADMIN" | "USER";
}

const API_URL =
  import.meta.env.VITE_API_URL || "https://api.review.100xdevs.com";

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const location = useLocation();
  const {
    isAuthenticated,
    token,
    user,
    setUser,
    logout,
    isLoading,
    setLoading,
  } = useAuthStore();

  useEffect(() => {
    const validateToken = async () => {
      if (!token) return;

      try {
        setLoading(true);
        console.log("Validating token...");
        const response = await fetchWithAuth(`${API_URL}/api/auth/validate`);
        console.log("Token validation response:", response);

        setUser(response.user);
        console.log(
          "Authentication successful. User role:",
          response.user.role
        );
      } catch (error) {
        console.error("Token validation error:", error);
        // Clear invalid token
        logout();
        toast.error("Your session has expired. Please sign in again.");
      } finally {
        setLoading(false);
      }
    };

    if (token && (!user || !user.role)) {
      validateToken();
    }
  }, [token, user, setUser, logout, setLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !token) {
    console.log("Not authenticated, redirecting to signin");
    return (
      <Navigate to="/signin" state={{ from: location.pathname }} replace />
    );
  }

  if (requiredRole === "ADMIN" && user?.role !== "ADMIN") {
    console.log("User is not an admin, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  if (
    requiredRole === "USER" &&
    user?.role !== "ADMIN" &&
    user?.role !== "USER"
  ) {
    console.log("User has invalid role, redirecting to signin");
    return <Navigate to="/signin" replace />;
  }

  console.log("Route access granted");
  return <>{children}</>;
};

export default ProtectedRoute;

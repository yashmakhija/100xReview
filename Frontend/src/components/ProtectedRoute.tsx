import { Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchWithAuth } from "../lib/api";
import toast from "react-hot-toast";

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
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      try {
        console.log("Validating token...");
        const response = await fetchWithAuth(`${API_URL}/api/auth/validate`);
        console.log("Token validation response:", response);

        const { user } = response;
        setUserRole(user.role);
        setIsAuthenticated(true);
        console.log("Authentication successful. User role:", user.role);
      } catch (error) {
        console.error("Token validation error:", error);
        // Clear invalid token
        localStorage.removeItem("authorization");
        setIsAuthenticated(false);
        toast.error("Your session has expired. Please sign in again.");
      } finally {
        setIsLoading(false);
      }
    };

    const token = localStorage.getItem("authorization");
    if (!token) {
      console.log("No token found in localStorage");
      setIsLoading(false);
      setIsAuthenticated(false);
      return;
    }

    console.log("Token found, validating...");
    validateToken();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to signin");
    return (
      <Navigate to="/signin" state={{ from: location.pathname }} replace />
    );
  }

  if (requiredRole === "ADMIN" && userRole !== "ADMIN") {
    console.log("User is not an admin, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredRole === "USER" && userRole !== "ADMIN" && userRole !== "USER") {
    console.log("User has invalid role, redirecting to signin");
    return <Navigate to="/signin" replace />;
  }

  console.log("Route access granted");
  return <>{children}</>;
};

export default ProtectedRoute;

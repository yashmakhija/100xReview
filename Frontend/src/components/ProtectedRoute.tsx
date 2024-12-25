import { Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchWithAuth } from "../lib/api";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: "ADMIN" | "USER";
}

const API_URL =
  import.meta.env.VITE_API_URL || "https://api.review.100xdevs.com/";

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
        const response = await fetchWithAuth(`${API_URL}/api/auth/validate`);
        const { user } = response;
        setUserRole(user.role);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Token validation error:", error);
        // Clear invalid token
        localStorage.removeItem("authorization");
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    const token = localStorage.getItem("authorization");
    if (!token) {
      setIsLoading(false);
      setIsAuthenticated(false);
      return;
    }

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
    return (
      <Navigate to="/signin" state={{ from: location.pathname }} replace />
    );
  }

  if (requiredRole === "ADMIN" && userRole !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredRole === "USER" && userRole !== "ADMIN" && userRole !== "USER") {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

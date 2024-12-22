import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: "ADMIN" | "USER";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const location = useLocation();

  const token = localStorage.getItem("authorization");
  if (!token) {
    return (
      <Navigate to="/signin" state={{ from: location.pathname }} replace />
    );
  }

  try {
    const payload = token.split(".")[1];
    const decodedToken = JSON.parse(atob(payload));
    const userRole = decodedToken.role;

    if (requiredRole === "ADMIN" && userRole !== "ADMIN") {
      return <Navigate to="/dashboard" replace />;
    }

    if (
      requiredRole === "USER" &&
      userRole !== "ADMIN" &&
      userRole !== "USER"
    ) {
      return <Navigate to="/signin" replace />;
    }

    return <>{children}</>;
  } catch (error) {
    console.error("Token validation error:", error);
    localStorage.removeItem("authorization");
    return <Navigate to="/signin" replace />;
  }
};

export default ProtectedRoute;

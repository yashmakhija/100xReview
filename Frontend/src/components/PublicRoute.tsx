import React from "react";
import { Navigate } from "react-router-dom";

// This function checks if the user is logged in (same as in PrivateRoute)
const isUserLoggedIn = () => {
  const token = localStorage.getItem("authorization");
  return !!token;
};

type PublicRouteProps = {
  children: React.ReactNode;
};

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  if (isUserLoggedIn()) {
    // If user is already logged in, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  } else {
    // If user is not logged in, show the public component (children)
    return <>{children}</>;
  }
};

export default PublicRoute;

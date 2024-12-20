import React from "react";
import { Navigate } from "react-router-dom";

const isUserLoggedIn = () => {
  const token = localStorage.getItem("authorization");
  return !!token;
};

type PrivateRouteProps = {
  children: React.ReactNode;
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  if (isUserLoggedIn()) {
    return <>{children}</>;
  } else {
    return <Navigate to="/signin" replace />;
  }
};

export default PrivateRoute;

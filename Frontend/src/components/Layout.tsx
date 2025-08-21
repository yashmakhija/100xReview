import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Footer from "./Footer";
import { useAuthStore } from "../store/authStore";

interface LayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideFooter = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    const isAuthPage = ["/signin", "/password-reset"].includes(
      location.pathname
    );

    if (isAuthenticated && isAuthPage) {
      // Redirect to appropriate dashboard based on role
      if (user?.role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [location.pathname, navigate, isAuthenticated, user]);

  const handleProtectedLink = (path: string) => {
    const isAuthPage = ["/signin", "/password-reset"].includes(path);

    if (!isAuthenticated && !isAuthPage) {
      navigate("/signin", { state: { from: path } });
    } else if (isAuthenticated && isAuthPage) {
      // Redirect based on role
      if (user?.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } else {
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">{children}</main>
      {!hideFooter && <Footer onProtectedLinkClick={handleProtectedLink} />}
    </div>
  );
};

export default Layout;

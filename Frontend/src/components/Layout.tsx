import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Footer from "./Footer";
import { useAuthStore } from "../store/authStore";
import { ThemeToggle } from "./ThemeToggle";
import { useThemeHook } from "../hooks/useThemeHook";

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

  const { theme } = useThemeHook();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: theme === "dark" ? "#111111" : "#ffffff",
        color: theme === "dark" ? "#f5f5f5" : "#111111",
      }}
    >
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <main className="grow">{children}</main>
      {!hideFooter && <Footer onProtectedLinkClick={handleProtectedLink} />}
    </div>
  );
};

export default Layout;

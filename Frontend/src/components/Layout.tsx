import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideFooter = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("authorization");
    const isAuthPage = ["/signin", "/signup", "/password-reset"].includes(
      location.pathname
    );

    if (token && isAuthPage) {
      navigate("/dashboard", { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleProtectedLink = (path: string) => {
    const token = localStorage.getItem("authorization");
    const isAuthPage = ["/signin", "/signup", "/password-reset"].includes(path);

    if (!token && !isAuthPage) {
      navigate("/signin", { state: { from: path } });
    } else if (token && isAuthPage) {
      navigate("/dashboard");
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

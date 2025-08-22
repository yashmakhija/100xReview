import { images } from "../assets";
import { LoginForm } from "./ui/login-form";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useThemeHook } from "../hooks/useThemeHook";

export default function SignInPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { theme } = useThemeHook();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user?.role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: theme === "dark" ? "#111111" : "#ffffff" }}
    >
      <div className="flex w-full max-w-6xl shadow-2xl rounded-2xl overflow-hidden">
        {/* Left side - Image with overlay */}
        <div className="relative w-0 flex-1 hidden md:block">
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
          <div className="absolute inset-0">
            <img
              src={images.campus}
              alt="Login"
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000"
              style={{
                animation: "slideShow 10s infinite",
              }}
            />
            <img
              src={images.placement}
              alt="100x Logo"
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000"
              style={{
                animation: "slideShow 10s infinite 5s",
                opacity: 0,
              }}
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
            <div className="flex items-center mb-4">
              <div className="h-1.5 w-12 bg-sky-500 rounded-full mr-2" />
              <div className="h-1.5 w-6 bg-white/70 rounded-full" />
            </div>
            <h2 className="text-white text-3xl font-bold font-poppins">
              Empowering the next generation of developers
            </h2>
            <p className="text-white/80 mt-2 text-sm">
              <span className="font-bold">
                100<span className="text-sky-500">x</span>School
              </span>{" "}
              <span>
                is a community of ambitious learners and industry mentors
                driving each other to greatness.
              </span>
            </p>
          </div>
          <style>
            {`
              @keyframes slideShow {
                0%, 45% { opacity: 1; }
                50% { opacity: 0; }
                95% { opacity: 0; }
                100% { opacity: 1; }
              }
            `}
          </style>
        </div>

        {/* Right side - Form */}
        <div
          className="flex-1 flex flex-col p-6 md:p-10 bg-card"
          style={{ backgroundColor: theme === "dark" ? "#0a0a0a" : "#ffffff" }}
        >
          <div className="flex justify-between items-center mb-8">
            <a href="/" className="flex items-center">
              <img
                src={theme === "dark" ? images.logoWhite : images.logoDark}
                alt="Logo"
                className="w-10 h-10 rounded-xl"
              />
              <span className="ml-3 text-xl font-semibold font-poppins">
                100<span className="text-sky-500">x</span>Dashboard
              </span>
            </a>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Online
              </span>
            </div>
          </div>

          <div className="flex flex-col my-auto max-w-md mx-auto w-full">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold tracking-tight font-poppins mb-2">
                Welcome back!
              </h1>
              <p className="text-muted-foreground text-sm">
                Use your credentials to access your account
              </p>
            </div>
            <div className="bg-background/30 p-6 rounded-xl backdrop-blur-sm border border-muted/30">
              <LoginForm />
            </div>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              Need help?{" "}
              <a href="#" className="text-sky-500 hover:underline">
                Contact Support
              </a>
            </div>
            <br />
          </div>

          <div className="mt-auto pt-6 text-xs text-center text-muted-foreground border-t">
            &copy; {new Date().getFullYear()} 100xDashboard. All rights
            reserved.
          </div>
        </div>
      </div>
    </div>
  );
}

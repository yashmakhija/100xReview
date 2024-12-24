import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";
import ProjectReview from "./components/ProjectReview";
import SignInPage from "./components/SignInPage";
import SignUpPage from "./components/SignUpPage";
import PasswordResetPage from "./components/PasswordResetPage";
import Onboarding from "./components/Onboarding";
import { RecoilRoot } from "recoil";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";

const App: React.FC = () => {
  return (
    <RecoilRoot>
      <Router>
        <Routes>
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/password-reset" element={<PasswordResetPage />} />

          <Route
            path="/onboarding"
            element={
              <ProtectedRoute requiredRole="USER">
                <Onboarding />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="USER">
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/project-review/:projectId/:submissionId"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <ProjectReview />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      </Router>
      <Toaster />
    </RecoilRoot>
  );
};

export default App;

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
import Onboarding from "./components/Onboarding";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import { RecoilRoot } from "recoil";
import { Toaster } from 'react-hot-toast';

const App: React.FC = () => {
  return (
    <RecoilRoot>
      <Router>
        <Routes>
          <Route
            path="/signin"
            element={
              <PublicRoute>
                <SignInPage />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignUpPage />
              </PublicRoute>
            }
          />
          <Route
            path="/onboarding"
            element={
              <PrivateRoute>
                <Onboarding />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <UserDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/project-review/:projectId/:submissionId"
            element={
              <PrivateRoute>
                <ProjectReview />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {/* Redirect all other routes to signin */}
          <Route
            path="*"
            element={
              <PublicRoute>
                <SignInPage />
              </PublicRoute>
            }
          />
        </Routes>
      </Router>
      <Toaster />
    </RecoilRoot>
  );
};

export default App;

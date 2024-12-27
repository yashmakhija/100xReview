import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { RecoilRoot } from "recoil";
import { Toaster } from "react-hot-toast";
import SignInPage from "./components/SignInPage";
import SignUpPage from "./components/SignUpPage";
import PasswordResetPage from "./components/PasswordResetPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";
import ProjectReview from "./components/ProjectReview";
import Onboarding from "./components/Onboarding";
import Profile from "./components/Profile";

function App() {
  return (
    <RecoilRoot>
      <Router>
        <Toaster position="top-center" />
        <Routes>
          {/* Auth routes without footer */}
          <Route
            path="/signin"
            element={
              <Layout hideFooter>
                <SignInPage />
              </Layout>
            }
          />
          <Route
            path="/signup"
            element={
              <Layout hideFooter>
                <SignUpPage />
              </Layout>
            }
          />
          <Route
            path="/password-reset"
            element={
              <Layout hideFooter>
                <PasswordResetPage />
              </Layout>
            }
          />

          {/* Protected routes with footer */}
          <Route
            path="/dashboard"
            element={
              <Layout>
                <ProtectedRoute requiredRole="USER">
                  <UserDashboard />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path="/admin"
            element={
              <Layout>
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminDashboard />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path="/project-review/:projectId/:submissionId"
            element={
              <Layout>
                <ProtectedRoute requiredRole="ADMIN">
                  <ProjectReview />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path="/onboarding"
            element={
              <Layout>
                <ProtectedRoute requiredRole="USER">
                  <Onboarding />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path="/profile"
            element={
              <Layout>
                <ProtectedRoute requiredRole="USER">
                  <Profile />
                </ProtectedRoute>
              </Layout>
            }
          />

          {/* Default routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      </Router>
    </RecoilRoot>
  );
}

export default App;

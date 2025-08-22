import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useThemeHook } from "../../hooks/useThemeHook";
import { getUserProfile } from "../../lib/api";
import { LoadingSpinner } from "../LoadingSpinner";
import ReviewModal from "../ReviewModal";

// Layout Components
import Sidebar from "./layout/Sidebar";
import Header from "./layout/Header";
import ContentWrapper from "./layout/ContentWrapper";
import TabNavigation from "./layout/TabNavigation";

// Stats Components
import StatsSection from "./stats/StatsSection";

// Table Components
import ProjectsTable from "./tables/ProjectsTable";
import UsersTable from "./tables/UsersTable";
import ProjectsManagement from "./tables/ProjectsManagement";
import ScheduleSection from "./tables/ScheduleSection";
import CoursesSection from "./tables/CoursesSection";

// Modal Components
import AddProjectModal from "./modals/AddProjectModal";
import EditProjectModal from "./modals/EditProjectModal";
import CreateUserModal from "./modals/CreateUserModal";
import CreateCourseModal from "./modals/CreateCourseModal";

// Store
import { useAdminStore } from "../../store/adminStore";

// Toast notifications
import toast from "react-hot-toast";

// Types
import { AdminProject, AdminSubmission } from "../../types/admin-dashboard";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useThemeHook();

  // UI State from local state
  const [activeTab, setActiveTab] = useState("courses");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);

  // Get state and actions from Zustand store
  const {
    users,
    projects,
    courses,
    selectedCourseId,
    selectedProject,
    selectedSubmission,
    error,
    isLoading,

    // Actions
    fetchAllData,
    fetchUsers,
    fetchProjects,
    fetchCourses,
    setSelectedCourseId,
    setSelectedProject,
    setSelectedSubmission,
    reviewSubmission,
  } = useAdminStore();

  const isDark = theme === "dark";

  const toggleDarkMode = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Initial admin access validation
  useEffect(() => {
    const validateAdminAccess = async () => {
      try {
        const userProfile = await getUserProfile();
        if (userProfile.role !== "ADMIN") {
          toast.error("Unauthorized: Admin access required");
          navigate("/");
          return;
        }

        // After validating admin access, fetch all data
        console.log("[AdminDashboard] calling fetchAllData()");
        await fetchAllData();
        console.log("[AdminDashboard] fetchAllData() done");
        setLoading(false);
      } catch (error) {
        console.error("Error validating admin access:", error);
        toast.error("Failed to validate admin access");
        navigate("/");
      }
    };

    validateAdminAccess();
  }, [navigate, fetchAllData]);

  // One-time tab-guarded fetch: only if corresponding data is empty
  useEffect(() => {
    if (activeTab === "courses" && courses.length === 0) {
      console.log(
        "[AdminDashboard] tab=courses, empty courses -> fetchCourses()"
      );
      fetchCourses();
    }
    if (activeTab === "users" && users.length === 0) {
      console.log("[AdminDashboard] tab=users, empty users -> fetchUsers()");
      fetchUsers();
    }
    if (
      (activeTab === "projects" || activeTab === "edit-projects") &&
      projects.length === 0
    ) {
      console.log(
        "[AdminDashboard] tab=projects, empty projects -> fetchProjects()"
      );
      fetchProjects();
    }
  }, [
    activeTab,
    courses.length,
    users.length,
    projects.length,
    fetchCourses,
    fetchUsers,
    fetchProjects,
  ]);

  // Removed tab-switch refetch to rely on initial fetchAllData + store cache

  // Handle errors from store
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleLogout = () => {
    localStorage.removeItem("authorization");
    navigate("/signin");
  };

  const handleAddProject = () => {
    setShowAddProject(true);
  };

  const handleEditProject = (project: AdminProject) => {
    setSelectedProject(project);
  };

  const handleViewReview = (submission: AdminSubmission) => {
    setSelectedSubmission(submission);
  };

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(Number(courseId));
  };

  const renderContent = () => {
    if (activeTab === "schedule") {
      return (
        <ScheduleSection
          courses={courses}
          selectedCourseId={selectedCourseId ? selectedCourseId.toString() : ""}
          setSelectedCourseId={handleCourseChange}
          isDark={isDark}
          onAddCourse={() => setShowAddCourse(true)}
        />
      );
    } else if (activeTab === "courses") {
      return (
        <CoursesSection
          courses={courses}
          isDark={isDark}
          onAddCourse={() => setShowAddCourse(true)}
        />
      );
    } else if (activeTab === "projects") {
      return (
        <ProjectsTable
          projects={projects}
          isDark={isDark}
          onAddProject={handleAddProject}
          onViewReview={handleViewReview}
        />
      );
    } else if (activeTab === "edit-projects") {
      return (
        <ProjectsManagement
          projects={projects}
          courses={courses}
          isDark={isDark}
          onAddProject={handleAddProject}
          onEditProject={handleEditProject}
        />
      );
    } else if (activeTab === "users") {
      return (
        <UsersTable
          users={users}
          isDark={isDark}
          onAddUser={() => setShowAddUser(true)}
        />
      );
    }

    return null;
  };

  // Show loading spinner if initial loading or any critical data is loading
  const showLoadingSpinner = loading || isLoading.users || isLoading.courses;

  return (
    <div
      className="flex min-h-screen"
      style={{
        fontFamily: '"Poppins", sans-serif',
        backgroundColor: isDark ? "#111111" : "#ffffff",
        color: isDark ? "#f5f5f5" : "#111111",
      }}
    >
      {showLoadingSpinner ? (
        <div className="flex items-center justify-center min-h-screen w-full">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
            isDark={isDark}
            toggleDarkMode={toggleDarkMode}
          />

          <div className="flex-1 flex flex-col min-h-screen">
            <Header
              activeTab={activeTab}
              isDark={isDark}
              handleLogout={handleLogout}
            />

            <StatsSection users={users} isDark={isDark} />

            <ContentWrapper isDark={isDark}>
              {activeTab !== "dashboard" && (
                <TabNavigation
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  isDark={isDark}
                />
              )}

              {renderContent()}
            </ContentWrapper>
          </div>
        </>
      )}

      {selectedSubmission && (
        <ReviewModal
          review={{
            reviewNotes: selectedSubmission.reviewNotes || undefined,
            reviewVideoUrl: selectedSubmission.reviewVideoUrl || undefined,
            projectName: selectedSubmission.project.name || "",
            userName: selectedSubmission.user.name || "",
            rating: selectedSubmission.rating || undefined,
          }}
          onClose={() => setSelectedSubmission(null)}
          onSubmit={(reviewData) => {
            reviewSubmission({
              submissionId: selectedSubmission.id,
              reviewNotes: reviewData.reviewNotes || "",
              reviewVideoUrl: reviewData.reviewVideoUrl,
              rating: reviewData.rating,
            });
          }}
          isEditable={!selectedSubmission.isReviewed}
        />
      )}

      {showAddProject && (
        <AddProjectModal
          onClose={() => setShowAddProject(false)}
          courses={courses}
          isDark={isDark}
          onProjectAdded={async () => {
            await fetchAllData();
            setShowAddProject(false);
          }}
        />
      )}

      {selectedProject && (
        <EditProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          isDark={isDark}
          onProjectUpdated={async () => {
            await fetchAllData();
          }}
        />
      )}

      {showAddUser && (
        <CreateUserModal
          onClose={() => setShowAddUser(false)}
          courses={courses}
          isDark={isDark}
          onUserCreated={async () => {
            await fetchAllData();
          }}
        />
      )}

      {showAddCourse && (
        <CreateCourseModal
          onClose={() => setShowAddCourse(false)}
          isDark={isDark}
          onCourseCreated={async () => {
            await fetchAllData();
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;

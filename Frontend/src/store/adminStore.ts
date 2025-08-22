import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  AdminCourse,
  AdminDashboardStats,
  AdminFilterState,
  AdminProject,
  AdminScheduleItem,
  AdminSubmission,
  AdminUser,
  CreateProjectPayload,
  CreateSchedulePayload,
  CreateUserPayload,
  EditProjectPayload,
  EditSchedulePayload,
  ReviewSubmissionPayload,
} from "../types/admin-dashboard";
import * as adminApi from "../lib/admin-api";
import toast from "react-hot-toast";

interface AdminState {
  // Data
  users: AdminUser[];
  projects: AdminProject[];
  courses: AdminCourse[];
  submissions: AdminSubmission[];
  scheduleItems: AdminScheduleItem[];
  stats: AdminDashboardStats | null;
  selectedCourseId: number | null;

  // UI State
  isLoading: {
    users: boolean;
    projects: boolean;
    courses: boolean;
    submissions: boolean;
    scheduleItems: boolean;
    stats: boolean;
  };
  error: string | null;
  filters: AdminFilterState;

  // Selected Items
  selectedProject: AdminProject | null;
  selectedSubmission: AdminSubmission | null;

  // Actions - Data Fetching
  fetchUsers: () => Promise<void>;
  fetchProjects: () => Promise<void>;
  fetchCourses: () => Promise<void>;
  fetchSubmissions: () => Promise<void>;
  fetchSchedule: (courseId: number) => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchAllData: () => Promise<void>;

  // Actions - Data Manipulation
  createUser: (userData: CreateUserPayload) => Promise<AdminUser | null>;
  resetUserPassword: (userId: number) => Promise<boolean>;
  changeUserRole: (userId: number, role: "USER" | "ADMIN") => Promise<boolean>;

  createCourse: (
    name: string,
    description?: string,
    imageUrl?: string
  ) => Promise<AdminCourse | null>;
  assignUserToCourse: (userId: number, courseId: number) => Promise<boolean>;

  createProject: (
    project: CreateProjectPayload
  ) => Promise<AdminProject | null>;
  editProject: (
    projectId: number,
    projectData: EditProjectPayload
  ) => Promise<AdminProject | null>;

  reviewSubmission: (
    review: ReviewSubmissionPayload
  ) => Promise<AdminSubmission | null>;

  createScheduleItem: (
    scheduleData: CreateSchedulePayload
  ) => Promise<AdminScheduleItem | null>;
  updateScheduleItem: (
    scheduleData: EditSchedulePayload
  ) => Promise<AdminScheduleItem | null>;
  deleteScheduleItem: (scheduleId: number) => Promise<boolean>;

  // Actions - UI State
  setSelectedCourseId: (courseId: number | null) => void;
  setSelectedProject: (project: AdminProject | null) => void;
  setSelectedSubmission: (submission: AdminSubmission | null) => void;
  setFilters: (filters: Partial<AdminFilterState>) => void;
  resetFilters: () => void;
  clearError: () => void;
}

export const useAdminStore = create<AdminState>()(
  devtools(
    (set, get) => ({
      // Initial Data State
      users: [],
      projects: [],
      courses: [],
      submissions: [],
      scheduleItems: [],
      stats: null,
      selectedCourseId: null,

      // Initial UI State
      isLoading: {
        users: false,
        projects: false,
        courses: false,
        submissions: false,
        scheduleItems: false,
        stats: false,
      },
      error: null,
      filters: {
        status: "all",
        project: null,
        search: "",
      },

      // Selected Items
      selectedProject: null,
      selectedSubmission: null,

      // Data Fetching Actions
      fetchUsers: async () => {
        try {
          if (get().users.length > 0) return;

          set((state) => ({
            isLoading: { ...state.isLoading, users: true },
            error: null,
          }));

          const users = await adminApi.fetchAllUsers();

          set((state) => ({
            users,
            isLoading: { ...state.isLoading, users: false },
          }));

          return;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch users";
          set((state) => ({
            error: errorMessage,
            isLoading: { ...state.isLoading, users: false },
          }));
          toast.error(errorMessage);
        }
      },

      fetchProjects: async () => {
        try {
          // simple cache guard: avoid re-fetching if projects already present
          if (get().projects.length > 0) return;

          set((state) => ({
            isLoading: { ...state.isLoading, projects: true },
            error: null,
          }));

          const projects = await adminApi.fetchAllProjectsAdmin();

          set((state) => ({
            projects,
            isLoading: { ...state.isLoading, projects: false },
          }));

          return;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch projects";
          set((state) => ({
            error: errorMessage,
            isLoading: { ...state.isLoading, projects: false },
          }));
          toast.error(errorMessage);
        }
      },

      fetchCourses: async () => {
        try {
          // simple cache guard: avoid re-fetching if courses already present
          if (get().courses.length > 0) return;

          set((state) => ({
            isLoading: { ...state.isLoading, courses: true },
            error: null,
          }));

          const courses = await adminApi.fetchAllCoursesAdmin();

          set((state) => ({
            courses,
            isLoading: { ...state.isLoading, courses: false },
            selectedCourseId:
              state.selectedCourseId ||
              (courses.length > 0 ? courses[0].id : null),
          }));

          return;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch courses";
          set((state) => ({
            error: errorMessage,
            isLoading: { ...state.isLoading, courses: false },
          }));
          toast.error(errorMessage);
        }
      },

      fetchSubmissions: async () => {
        try {
          set((state) => ({
            isLoading: { ...state.isLoading, submissions: true },
            error: null,
          }));

          const submissions = await adminApi.fetchAllSubmissions();

          set((state) => ({
            submissions,
            isLoading: { ...state.isLoading, submissions: false },
          }));

          return;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch submissions";
          set((state) => ({
            error: errorMessage,
            isLoading: { ...state.isLoading, submissions: false },
          }));
          toast.error(errorMessage);
        }
      },

      fetchSchedule: async (courseId: number) => {
        try {
          set((state) => ({
            isLoading: { ...state.isLoading, scheduleItems: true },
            error: null,
          }));

          const scheduleItems = await adminApi.fetchCourseSchedule(courseId);

          set((state) => ({
            scheduleItems,
            isLoading: { ...state.isLoading, scheduleItems: false },
          }));

          return;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch schedule";
          set((state) => ({
            error: errorMessage,
            isLoading: { ...state.isLoading, scheduleItems: false },
          }));
          toast.error(errorMessage);
        }
      },

      fetchStats: async () => {
        try {
          set((state) => ({
            isLoading: { ...state.isLoading, stats: true },
            error: null,
          }));

          const stats = await adminApi.fetchDashboardStats();

          set((state) => ({
            stats,
            isLoading: { ...state.isLoading, stats: false },
          }));

          return;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch dashboard stats";
          set((state) => ({
            error: errorMessage,
            isLoading: { ...state.isLoading, stats: false },
          }));
          toast.error(errorMessage);
        }
      },

      fetchAllData: async () => {
        try {
          set(() => ({
            isLoading: {
              users: true,
              projects: true,
              courses: true,
              submissions: true,
              scheduleItems: false, // Will be fetched after course selection
              stats: true,
            },
            error: null,
          }));

          console.log(
            "[AdminStore] fetchAllData: starting initial parallel fetch"
          );
          // Fetch all data in parallel
          const [users, projects, courses, submissions, stats] =
            await Promise.all([
              adminApi.fetchAllUsers(),
              adminApi.fetchAllProjectsAdmin(),
              adminApi.fetchAllCoursesAdmin(),
              adminApi.fetchAllSubmissions(),
              adminApi.fetchDashboardStats().catch(() => null), // Make stats optional
            ]);

          console.log("[AdminStore] fetchAllData: results", {
            users: users.length,
            projects: projects.length,
            courses: courses.length,
            submissions: submissions.length,
            stats: !!stats,
          });

          const selectedCourseId =
            get().selectedCourseId ||
            (courses.length > 0 ? courses[0].id : null);

          // Set all data at once to minimize UI updates
          set({
            users,
            projects,
            courses,
            submissions,
            stats,
            selectedCourseId,
            isLoading: {
              users: false,
              projects: false,
              courses: false,
              submissions: false,
              scheduleItems: false,
              stats: false,
            },
          });

          console.log(
            "[AdminStore] fetchAllData: state set, selectedCourseId:",
            selectedCourseId
          );

          // Fetch schedule if we have a selected course
          if (selectedCourseId) {
            console.log(
              "[AdminStore] fetchAllData: fetching schedule for course",
              selectedCourseId
            );
            get().fetchSchedule(selectedCourseId);
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch data";
          set({
            error: errorMessage,
            isLoading: {
              users: false,
              projects: false,
              courses: false,
              submissions: false,
              scheduleItems: false,
              stats: false,
            },
          });
          toast.error(errorMessage);
        }
      },

      // Data Manipulation Actions
      createUser: async (userData: CreateUserPayload) => {
        try {
          set({ error: null });
          const user = await adminApi.createUser(userData);

          // Update users list
          set((state) => ({
            users: [...state.users, user],
          }));

          toast.success(`User ${user.name} created successfully`);
          return user;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to create user";
          set({ error: errorMessage });
          toast.error(errorMessage);
          return null;
        }
      },

      resetUserPassword: async (userId: number) => {
        try {
          set({ error: null });
          await adminApi.resetUserPassword(userId);
          toast.success(
            "Password reset successful. User will receive an email with the new password."
          );
          return true;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to reset password";
          set({ error: errorMessage });
          toast.error(errorMessage);
          return false;
        }
      },

      changeUserRole: async (userId: number, role: "USER" | "ADMIN") => {
        try {
          set({ error: null });
          const response = await adminApi.changeUserRole(userId, role);

          // Update user in the list
          set((state) => ({
            users: state.users.map((user) =>
              user.id === userId ? { ...user, role: response.user.role } : user
            ),
          }));

          toast.success(`User role changed to ${role} successfully`);
          return true;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : `Failed to change user role to ${role}`;
          set({ error: errorMessage });
          toast.error(errorMessage);
          return false;
        }
      },

      createCourse: async (
        name: string,
        description?: string,
        imageUrl?: string
      ) => {
        try {
          set({ error: null });
          const course = await adminApi.createCourse(
            name,
            description,
            imageUrl
          );

          // Update courses list
          set((state) => ({
            courses: [...state.courses, course],
          }));

          toast.success(`Course ${course.name} created successfully`);
          return course;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to create course";
          set({ error: errorMessage });
          toast.error(errorMessage);
          return null;
        }
      },

      assignUserToCourse: async (userId: number, courseId: number) => {
        try {
          set({ error: null });
          await adminApi.assignUserToCourse(userId, courseId);
          toast.success("User assigned to course successfully");
          return true;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to assign user to course";
          set({ error: errorMessage });
          toast.error(errorMessage);
          return false;
        }
      },

      createProject: async (project: CreateProjectPayload) => {
        try {
          set({ error: null });
          const newProject = await adminApi.createProjectAdmin(project);

          // Update projects list
          set((state) => ({
            projects: [...state.projects, newProject],
          }));

          toast.success(`Project ${newProject.name} created successfully`);
          return newProject;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to create project";
          set({ error: errorMessage });
          toast.error(errorMessage);
          return null;
        }
      },

      editProject: async (
        projectId: number,
        projectData: EditProjectPayload
      ) => {
        try {
          set({ error: null });
          const updatedProject = await adminApi.editProjectAdmin(
            projectId,
            projectData
          );

          // Update project in the list
          set((state) => ({
            projects: state.projects.map((project) =>
              project.id === projectId
                ? { ...project, ...updatedProject }
                : project
            ),
            selectedProject: null,
          }));

          toast.success(`Project ${updatedProject.name} updated successfully`);
          return updatedProject;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to update project";
          set({ error: errorMessage });
          toast.error(errorMessage);
          return null;
        }
      },

      reviewSubmission: async (review: ReviewSubmissionPayload) => {
        try {
          set({ error: null });
          const updatedSubmission = await adminApi.reviewSubmission(review);

          // Update submission in the list
          set((state) => ({
            submissions: state.submissions.map((submission) =>
              submission.id === review.submissionId
                ? { ...submission, ...updatedSubmission }
                : submission
            ),
            selectedSubmission: null,
          }));

          toast.success("Review submitted successfully");
          return updatedSubmission;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to submit review";
          set({ error: errorMessage });
          toast.error(errorMessage);
          return null;
        }
      },

      createScheduleItem: async (scheduleData: CreateSchedulePayload) => {
        try {
          set({ error: null });
          const newScheduleItem = await adminApi.createScheduleItem(
            scheduleData
          );

          // Update schedule items list
          set((state) => ({
            scheduleItems: [...state.scheduleItems, newScheduleItem],
          }));

          toast.success("Schedule item created successfully");
          return newScheduleItem;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to create schedule item";
          set({ error: errorMessage });
          toast.error(errorMessage);
          return null;
        }
      },

      updateScheduleItem: async (scheduleData: EditSchedulePayload) => {
        try {
          set({ error: null });
          const updatedScheduleItem = await adminApi.updateScheduleItem(
            scheduleData
          );

          // Update schedule item in the list
          set((state) => ({
            scheduleItems: state.scheduleItems.map((item) =>
              item.id === scheduleData.id
                ? { ...item, ...updatedScheduleItem }
                : item
            ),
          }));

          toast.success("Schedule item updated successfully");
          return updatedScheduleItem;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to update schedule item";
          set({ error: errorMessage });
          toast.error(errorMessage);
          return null;
        }
      },

      deleteScheduleItem: async (scheduleId: number) => {
        try {
          set({ error: null });
          await adminApi.deleteScheduleItem(scheduleId);

          // Remove schedule item from the list
          set((state) => ({
            scheduleItems: state.scheduleItems.filter(
              (item) => item.id !== scheduleId
            ),
          }));

          toast.success("Schedule item deleted successfully");
          return true;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to delete schedule item";
          set({ error: errorMessage });
          toast.error(errorMessage);
          return false;
        }
      },

      // UI State Actions
      setSelectedCourseId: (courseId: number | null) => {
        set({ selectedCourseId: courseId });

        // Fetch schedule for the selected course
        if (courseId !== null) {
          get().fetchSchedule(courseId);
        }
      },

      setSelectedProject: (project: AdminProject | null) => {
        set({ selectedProject: project });
      },

      setSelectedSubmission: (submission: AdminSubmission | null) => {
        set({ selectedSubmission: submission });
      },

      setFilters: (filters: Partial<AdminFilterState>) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }));
      },

      resetFilters: () => {
        set({
          filters: {
            status: "all",
            project: null,
            search: "",
          },
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    { name: "admin-store" }
  )
);

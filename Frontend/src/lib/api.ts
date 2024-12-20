import { z } from "zod";

// Base API configuration
const API_BASE = "http://localhost:8012";

// Interfaces
export interface Project {
  submissionId: number | null;
  message: string;
  id: number;
  name: string;
  description: string;
  dueDate: string;
  courseId: number;
  status: "not_submitted" | "pending" | "completed";
  submission: ProjectSubmission | null;
}

export interface ProjectSubmission {
  id: number;
  githubUrl: string;
  deployUrl: string;
  submittedAt: string;
  isReviewed: boolean;
}

export interface Course {
  id: number;
  name: string;
}

export interface ScheduleItem {
  id: number;
  courseId: number;
  date: string;
  items: { title: string; description: string }[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

export interface ProjectStatus {
  id: number;
  projectId: number;
  status: "PENDING_REVIEW" | "REVIEWED";
  reviewNotes?: string;
  reviewVideoUrl?: string;
  projectName: string;
  projectDescription: string;
  dueDate: string;
  submittedAt: string;
}

// Error handling
export class APIError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "APIError";
  }
}

// Implement a more robust error handling mechanism
async function handleAPIResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new APIError(
      errorData.message || `HTTP error! status: ${response.status}`,
      response.status
    );
  }
  return response.json();
}

// Helper function for authenticated requests
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("authorization");
  const headers = {
    "Content-Type": "application/json",
    Authorization: token || "",
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  return handleAPIResponse(response);
}

// Authentication
export async function signUp(signUpData: {
  name: string;
  number: string;
  email: string;
  password: string;
}) {
  return fetchWithAuth(`${API_BASE}/api/auth/signup`, {
    method: "POST",
    body: JSON.stringify(signUpData),
  });
}

export async function signIn(signInData: { email: string; password: string }) {
  return fetchWithAuth(`${API_BASE}/api/auth/login`, {
    method: "POST",
    body: JSON.stringify(signInData),
  });
}

// Projects
export async function fetchProjects(courseId: string): Promise<Project[]> {
  const projects: Project[] = await fetchWithAuth(
    `${API_BASE}/api/projects/course/${courseId}`
  );
  return projects.map((project) => ({
    ...project,
    status: project.submission
      ? project.submission.isReviewed
        ? "completed"
        : "pending"
      : "not_submitted",
  }));
}

export async function fetchAllProjects(): Promise<Project[]> {
  const projects: Project[] = await fetchWithAuth(
    `${API_BASE}/api/projects/all-courses`
  );
  return projects.map((project) => ({
    ...project,
    status: project.submission
      ? project.submission.isReviewed
        ? "completed"
        : "pending"
      : "not_submitted",
  }));
}

export async function submitProject(projectData: {
  projectId: number;
  githubUrl: string;
  deployUrl: string;
  wsUrl: string;
}): Promise<Project> {
  const result: Project = await fetchWithAuth(
    `${API_BASE}/api/projects/submit`,
    {
      method: "POST",
      body: JSON.stringify(projectData),
    }
  );

  return {
    ...result,
    status: "pending",
    submission: {
      id: result.submission?.id || 0,
      githubUrl: projectData.githubUrl,
      deployUrl: projectData.deployUrl,
      submittedAt: new Date().toISOString(),
      isReviewed: false,
    },
  };
}

export async function createProject(projectData: {
  name: string;
  description: string;
  dueDate: string;
  courseId: number;
}): Promise<Project> {
  const result: Project = await fetchWithAuth(
    `${API_BASE}/api/projects/create`,
    {
      method: "POST",
      body: JSON.stringify(projectData),
    }
  );

  return {
    ...result,
    status: "not_submitted",
    submission: null,
  };
}

export async function getSubmittedProjects() {
  return fetchWithAuth(`${API_BASE}/api/projects/list`);
}

export async function reviewProject(
  submissionId: number,
  reviewNotes: string,
  reviewVideoUrl: string
) {
  const schema = z.object({
    submissionId: z.number(),
    reviewNotes: z.string().min(1).max(1000),
    reviewVideoUrl: z.string().url().optional(),
  });

  const validatedData = schema.parse({
    submissionId,
    reviewNotes,
    reviewVideoUrl,
  });

  return fetchWithAuth(`${API_BASE}/api/projects/review`, {
    method: "POST",
    body: JSON.stringify(validatedData),
  });
}

export async function uploadReviewVideo(submissionId: number, videoFile: File) {
  const formData = new FormData();
  formData.append("video", videoFile);

  const token = localStorage.getItem("authorization");
  const response = await fetch(
    `${API_BASE}/api/projects/review/${submissionId}/video`,
    {
      method: "POST",
      headers: {
        Authorization: token || "",
      },
      body: formData,
    }
  );

  return handleAPIResponse(response);
}

// Courses
export async function fetchWeeklySchedule(courseId: string) {
  return fetchWithAuth(`${API_BASE}/api/schedule/weekly/${courseId}`);
}

export async function fetchDailySchedule(courseId: string) {
  return fetchWithAuth(`${API_BASE}/api/schedule/daily/${courseId}`);
}

export async function fetchAllCourses() {
  return fetchWithAuth(`${API_BASE}/api/courses/`);
}

export async function fetchCourses() {
  return fetchWithAuth(`${API_BASE}/api/course/my-courses`);
}

export async function enrollInCourse(courseId: number) {
  return fetchWithAuth(`${API_BASE}/api/course/enroll`, {
    method: "POST",
    body: JSON.stringify({ courseId }),
  });
}

// Attendance
export async function fetchAttendance() {
  return fetchWithAuth(`${API_BASE}/api/attendance`);
}

// MAC Addresses
export async function submitMacAddresses(macAddresses: string[]) {
  return fetchWithAuth(`${API_BASE}/api/auth/mac-address`, {
    method: "POST",
    body: JSON.stringify({
      macAddresses: macAddresses.filter((mac) => mac.length === 17),
    }),
  });
}

// Onboarding
export async function checkOnboardingStatus() {
  return fetchWithAuth(`${API_BASE}/api/onboarding/status`);
}

export async function completeOnboarding() {
  return fetchWithAuth(`${API_BASE}/api/onboarding/complete`, {
    method: "POST",
  });
}

// Users
export async function fetchUsers() {
  return fetchWithAuth(`${API_BASE}/api/users`);
}

// User project statuses
export async function getUserProjectStatuses(): Promise<ProjectStatus[]> {
  return fetchWithAuth(`${API_BASE}/api/projects/user-project-statuses`);
}

export async function getSubmittedProjectsCourse(courseId: number) {
  return fetchWithAuth(
    `${API_BASE}/api/projects/course/${courseId}/submissions`
  );
}

// Schedule routes
export async function getDailySchedule(
  courseId: string
): Promise<ScheduleItem[]> {
  return fetchWithAuth(`${API_BASE}/api/schedule/daily/${courseId}`);
}

export async function getWeeklySchedule(
  courseId: string
): Promise<ScheduleItem[]> {
  return fetchWithAuth(`${API_BASE}/api/schedule/weekly/${courseId}`);
}

export async function addDaySchedule(scheduleData: {
  courseId: number;
  date: string;
  topic: string;
  description: string;
}): Promise<ScheduleItem> {
  return fetchWithAuth(`${API_BASE}/api/schedule/add`, {
    method: "POST",
    body: JSON.stringify(scheduleData),
  });
}

export async function updateDaySchedule(
  scheduleId: number,
  scheduleData: {
    date?: string;
    items?: { title: string; description: string }[];
  }
): Promise<ScheduleItem> {
  return fetchWithAuth(`${API_BASE}/api/schedule/${scheduleId}`, {
    method: "PUT",
    body: JSON.stringify(scheduleData),
  });
}

export async function deleteDaySchedule(scheduleId: number): Promise<void> {
  return fetchWithAuth(`${API_BASE}/api/schedule/${scheduleId}`, {
    method: "DELETE",
  });
}

// Example of using the new error handling
export async function exampleAPICall() {
  try {
    const data = await fetchWithAuth(`${API_BASE}/api/example`);
    return data;
  } catch (error) {
    if (error instanceof APIError) {
      console.error(`API Error (${error.status}): ${error.message}`);
      // Handle specific error cases based on status or message
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
}

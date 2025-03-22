// Base API configuration
export const API_BASE =
  import.meta.env.VITE_API_URL || "https://api.review.100xdevs.com";
export const API_URL = `${API_BASE}`;

// Interfaces
export interface Project {
  submissionId: number | null;
  message: string;
  id: number;
  name: string;
  description: string;
  dueDate: string;
  courseId: number;
  notion?: string;
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
  topic: string;
  description: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

export interface ProjectStatus {
  userName: string;
  rating: number | null | undefined;
  id: number;
  projectId: number;
  status: "PENDING_REVIEW" | "REVIEWED";
  reviewNotes?: string;
  reviewVideoUrl?: string;
  projectName: string;
  projectDescription: string;
  dueDate: string;
  submittedAt: string;
  githubUrl: string;
  deployUrl: string;
  wsUrl?: string;
}

export interface UserProfile {
  id: number;
  name: string;
  number: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  biodata: {
    bio: string | null;
    techStack: string[];
    resume: string | null;
  };
  stats: {
    totalProjects: number;
    completedProjects: number;
    pendingProjects: number;
    activeStreak: number;
  };
  recentSubmissions: {
    projectName: string;
    projectDescription: string;
    submittedAt: string;
    status: "REVIEWED" | "PENDING_REVIEW";
    githubUrl: string;
    deployUrl: string | null;
  }[];
}

interface UpdateBiodataRequest {
  bio?: string;
  techStack?: string[];
  resume?: string;
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
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("authorization");

  // Ensure token has Bearer prefix
  const authToken = token
    ? token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`
    : "";

  const headers = {
    "Content-Type": "application/json",
    Authorization: authToken,
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

export interface SignupResponse {
  message: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  token?: string;
}

export async function initializeSignup(email: string): Promise<SignupResponse> {
  return fetchWithAuth(`${API_BASE}/api/auth/signup/init`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyOTP(
  email: string,
  otp: string
): Promise<SignupResponse> {
  return fetchWithAuth(`${API_BASE}/api/auth/signup/verify-otp`, {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
}

export async function completeSignup(userData: {
  name: string;
  email: string;
  password: string;
  number: string;
  otp: string;
}): Promise<SignupResponse> {
  return fetchWithAuth(`${API_BASE}/api/auth/signup/complete`, {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

// Password Reset
export interface PasswordResetResponse {
  message: string;
}

export async function initializePasswordReset(
  email: string
): Promise<PasswordResetResponse> {
  const response = await fetch(`${API_BASE}/api/auth/password-reset/init`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to send password reset OTP");
  }
  return data;
}

export async function verifyPasswordResetOTP(
  email: string,
  otp: string
): Promise<PasswordResetResponse> {
  const response = await fetch(
    `${API_BASE}/api/auth/password-reset/verify-otp`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to verify OTP");
  }
  return data;
}

export async function completePasswordReset(
  email: string,
  otp: string,
  newPassword: string
): Promise<PasswordResetResponse> {
  const response = await fetch(`${API_BASE}/api/auth/password-reset/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp, newPassword }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to reset password");
  }
  return data;
}

// Resend OTP
export async function resendOTP(email: string): Promise<PasswordResetResponse> {
  return fetchWithAuth(`${API_BASE}/api/auth/signup/resend-otp`, {
    method: "POST",
    body: JSON.stringify({ email }),
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
  notion: string;
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
  try {
    const response = await fetchWithAuth(`${API_BASE}/api/projects/list`);
    console.log("Submissions response:", response); // Debug log
    return response;
  } catch (error) {
    console.error("Error fetching submissions:", error);
    throw error;
  }
}

export async function reviewProject(
  submissionId: number,
  reviewNotes: string,
  reviewVideoUrl: string,
  rating: number
) {
  try {
    const validatedData = {
      submissionId,
      reviewNotes,
      reviewVideoUrl: reviewVideoUrl || null,
      rating,
    };

    console.log("Sending review data:", validatedData);

    // Get token and ensure it has Bearer prefix
    const token = localStorage.getItem("authorization");
    const authToken = token
      ? token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`
      : "";

    const response = await fetch(`${API_BASE}/api/projects/review`, {
      method: "POST",
      headers: {
        Authorization: authToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validatedData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to submit review");
    }

    console.log("Review response:", data);
    return data;
  } catch (error) {
    console.error("Error submitting review:", error);
    throw error;
  }
}

export async function uploadReviewVideo(submissionId: number, videoFile: File) {
  const formData = new FormData();
  formData.append("video", videoFile);

  const token = localStorage.getItem("authorization");
  // Ensure token has Bearer prefix
  const authToken = token
    ? token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`
    : "";

  try {
    // First upload the video
    const uploadResponse = await fetch(
      `${API_BASE}/api/projects/review/${submissionId}/video`,
      {
        method: "POST",
        headers: {
          Authorization: authToken,
        },
        body: formData,
      }
    );

    const uploadData = await uploadResponse.json();

    if (!uploadResponse.ok) {
      throw new Error(uploadData.error || "Failed to upload video");
    }

    // If upload is successful, get the updated submission details
    const submissionResponse = await fetch(
      `${API_BASE}/api/projects/submission/${submissionId}`,
      {
        headers: {
          Authorization: authToken,
        },
      }
    );

    const submissionData = await submissionResponse.json();

    if (!submissionResponse.ok) {
      throw new Error(
        submissionData.error || "Failed to get submission details"
      );
    }

    return {
      success: true,
      submission: submissionData,
      message: uploadData.message,
    };
  } catch (error) {
    console.error("Error uploading video:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to upload video"
    );
  }
}

// Add a new function to get submission details
export async function getSubmissionDetails(submissionId: number) {
  try {
    const response = await fetchWithAuth(
      `${API_BASE}/api/projects/submission/${submissionId}`
    );

    if (!response) {
      throw new Error("Failed to get submission details");
    }

    return response;
  } catch (error) {
    console.error("Error getting submission details:", error);
    throw error;
  }
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

// Schedule Management
export async function getDailySchedule(
  courseId: string
): Promise<ScheduleItem[]> {
  try {
    const response = await fetchWithAuth(
      `${API_BASE}/api/schedule/daily/${courseId}`
    );
    if (!Array.isArray(response)) {
      console.warn("Unexpected response format:", response);
      return [];
    }
    return response;
  } catch (error) {
    console.error("Error in getDailySchedule:", error);
    throw error;
  }
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
    topic?: string;
    description?: string;
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

// Course Management
export async function fetchCourses() {
  return fetchWithAuth(`${API_BASE}/api/course/my-courses`);
}

export async function enrollInCourse(courseId: number) {
  return fetchWithAuth(`${API_BASE}/api/course/enroll`, {
    method: "POST",
    body: JSON.stringify({ courseId }),
  });
}

// User Management
export async function fetchUsers() {
  return fetchWithAuth(`${API_BASE}/api/users`);
}

export async function getUserProjectStatuses(): Promise<ProjectStatus[]> {
  return fetchWithAuth(`${API_BASE}/api/projects/user-project-statuses`);
}

export async function getSubmittedProjectsCourse(courseId: number) {
  return fetchWithAuth(
    `${API_BASE}/api/projects/course/${courseId}/submissions`
  );
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

// MAC Addresses
export async function submitMacAddresses(macAddresses: string[]) {
  return fetchWithAuth(`${API_BASE}/api/auth/mac-address`, {
    method: "POST",
    body: JSON.stringify({
      macAddresses: macAddresses.filter((mac) => mac.length === 17),
    }),
  });
}

// Attendance
export async function fetchAttendance() {
  return fetchWithAuth(`${API_BASE}/api/attendance`);
}

export const getUserProfile = async (): Promise<UserProfile> => {
  return fetchWithAuth(`${API_BASE}/api/users/profile`);
};

export const updateUserBiodata = async (
  data: UpdateBiodataRequest
): Promise<{ message: string; biodata: unknown }> => {
  return fetchWithAuth(`${API_BASE}/api/users/profile/biodata`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<{ message: string }> => {
  if (newPassword !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  if (newPassword.length < 6) {
    throw new Error("New password must be at least 6 characters long");
  }

  try {
    const response = await fetchWithAuth(
      `${API_BASE}/api/auth/change-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to change password");
    }

    return data;
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("Failed to change password");
  }
};

// Add promoteToAdmin function
export const promoteToAdmin = async (
  userId: number
): Promise<{
  message: string;
  user: { id: number; email: string; role: string };
}> => {
  try {
    const response = await fetchWithAuth(`${API_BASE}/api/users/Admin-role`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });

    console.log("Admin promotion response:", response);
    return response;
  } catch (error) {
    console.error("Error in promoteToAdmin:", error);
    throw error instanceof APIError
      ? error
      : new APIError("Failed to promote user to admin", 500);
  }
};

// Add demoteToUser function
export const demoteToUser = async (
  userId: number
): Promise<{
  message: string;
  user: { id: number; email: string; role: string };
}> => {
  try {
    const response = await fetchWithAuth(`${API_BASE}/api/users/user-role`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });

    console.log("User demotion response:", response);
    return response;
  } catch (error) {
    console.error("Error in demoteToUser:", error);
    throw error instanceof APIError
      ? error
      : new APIError("Failed to change user role", 500);
  }
};

// Add this interface
export interface EditProjectData {
  title: string;
  description: string;
  dueDate: string;
  notionUrl: string;
}

// Add this function
export async function editProject(
  projectId: number,
  projectData: EditProjectData
) {
  try {
    const response = await fetchWithAuth(
      `${API_BASE}/api/projects/edit-project/${projectId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: projectData.title,
          description: projectData.description,
          dueDate: projectData.dueDate,
          notionUrl: projectData.notionUrl,
        }),
      }
    );

    if (!response.id) {
      throw new Error(response.error || "Failed to update project");
    }

    return response;
  } catch (error) {
    console.error("Error editing project:", error);
    throw error instanceof APIError
      ? error
      : new APIError(
          error instanceof Error ? error.message : "Failed to edit project",
          500
        );
  }
}

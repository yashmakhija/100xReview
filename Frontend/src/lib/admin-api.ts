import { API_BASE, fetchWithAuth } from "./api";
import {
  AdminCourse,
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

/**
 * Admin API Service
 *
 * This service contains all API calls related to admin functionality.
 * It's separated from the main API file to maintain clean code organization
 * and separation of concerns.
 */

// User Management
export async function fetchAllUsers(): Promise<AdminUser[]> {
  try {
    const response = await fetchWithAuth(`${API_BASE}/api/users`);
    return response;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function createUser(
  userData: CreateUserPayload
): Promise<AdminUser> {
  try {
    const response = await fetchWithAuth(`${API_BASE}/api/auth/create-user`, {
      method: "POST",
      body: JSON.stringify(userData),
    });
    return response.user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function resetUserPassword(
  userId: number
): Promise<{ message: string }> {
  try {
    const response = await fetchWithAuth(
      `${API_BASE}/api/auth/reset-password`,
      {
        method: "POST",
        body: JSON.stringify({ userId }),
      }
    );
    return response;
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
}

export async function changeUserRole(
  userId: number,
  role: "USER" | "ADMIN"
): Promise<{
  message: string;
  user: { id: number; email: string; role: string };
}> {
  try {
    const endpoint =
      role === "ADMIN"
        ? `${API_BASE}/api/users/Admin-role`
        : `${API_BASE}/api/users/user-role`;

    const response = await fetchWithAuth(endpoint, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });

    return response;
  } catch (error) {
    console.error(`Error changing user role to ${role}:`, error);
    throw error;
  }
}

// Course Management
export async function fetchAllCoursesAdmin(): Promise<AdminCourse[]> {
  try {
    const response = await fetchWithAuth(`${API_BASE}/api/courses/`);
    return response;
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
}

export async function createCourse(
  name: string,
  description?: string,
  imageUrl?: string
): Promise<AdminCourse> {
  try {
    const response = await fetchWithAuth(`${API_BASE}/api/courses`, {
      method: "POST",
      body: JSON.stringify({ name, description, imageUrl }),
    });
    return response.course;
  } catch (error) {
    console.error("Error creating course:", error);
    throw error;
  }
}

export async function assignUserToCourse(
  userId: number,
  courseId: number
): Promise<{ message: string }> {
  try {
    const response = await fetchWithAuth(`${API_BASE}/api/enrollment/assign`, {
      method: "POST",
      body: JSON.stringify({ userId, courseId }),
    });
    return response;
  } catch (error) {
    console.error("Error assigning user to course:", error);
    throw error;
  }
}

// Project Management
export async function fetchAllProjectsAdmin(): Promise<AdminProject[]> {
  try {
    const projects = await fetchWithAuth(`${API_BASE}/api/projects/all`);
    return projects;
  } catch (error) {
    console.error("Error fetching all projects:", error);
    throw error;
  }
}

export async function createProjectAdmin(
  project: CreateProjectPayload
): Promise<AdminProject> {
  try {
    const response = await fetchWithAuth(`${API_BASE}/api/projects/create`, {
      method: "POST",
      body: JSON.stringify(project),
    });
    return response;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
}

export async function editProjectAdmin(
  projectId: number,
  projectData: EditProjectPayload
): Promise<AdminProject> {
  try {
    const response = await fetchWithAuth(
      `${API_BASE}/api/projects/edit-project/${projectId}`,
      {
        method: "PUT",
        body: JSON.stringify({
          title: projectData.name,
          description: projectData.description,
          dueDate: projectData.dueDate,
          notionUrl: projectData.notion || "",
        }),
      }
    );
    return response;
  } catch (error) {
    console.error("Error editing project:", error);
    throw error;
  }
}

// Submission Management
export async function fetchAllSubmissions(): Promise<AdminSubmission[]> {
  try {
    const submissions = await fetchWithAuth(`${API_BASE}/api/projects/list`);
    return submissions;
  } catch (error) {
    console.error("Error fetching submissions:", error);
    throw error;
  }
}

export async function reviewSubmission(
  review: ReviewSubmissionPayload
): Promise<AdminSubmission> {
  try {
    const validatedData = {
      submissionId: review.submissionId,
      reviewNotes: review.reviewNotes,
      reviewVideoUrl: review.reviewVideoUrl || null,
      rating: review.rating || null,
    };

    const response = await fetchWithAuth(`${API_BASE}/api/projects/review`, {
      method: "POST",
      body: JSON.stringify(validatedData),
    });

    return response;
  } catch (error) {
    console.error("Error submitting review:", error);
    throw error;
  }
}

// Schedule Management
export async function fetchCourseSchedule(
  courseId: number
): Promise<AdminScheduleItem[]> {
  try {
    const response = await fetchWithAuth(
      `${API_BASE}/api/schedule/course/${courseId}`
    );
    return response;
  } catch (error) {
    console.error("Error fetching course schedule:", error);
    throw error;
  }
}

export async function createScheduleItem(
  scheduleData: CreateSchedulePayload
): Promise<AdminScheduleItem> {
  try {
    const response = await fetchWithAuth(`${API_BASE}/api/schedule/add`, {
      method: "POST",
      body: JSON.stringify(scheduleData),
    });
    return response;
  } catch (error) {
    console.error("Error creating schedule item:", error);
    throw error;
  }
}

export async function updateScheduleItem(
  scheduleData: EditSchedulePayload
): Promise<AdminScheduleItem> {
  try {
    const response = await fetchWithAuth(
      `${API_BASE}/api/schedule/${scheduleData.id}`,
      {
        method: "PUT",
        body: JSON.stringify({
          date: scheduleData.date,
          topic: scheduleData.topic,
          description: scheduleData.description,
        }),
      }
    );
    return response;
  } catch (error) {
    console.error("Error updating schedule item:", error);
    throw error;
  }
}

export async function deleteScheduleItem(scheduleId: number): Promise<void> {
  try {
    await fetchWithAuth(`${API_BASE}/api/schedule/${scheduleId}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Error deleting schedule item:", error);
    throw error;
  }
}

// Dashboard Statistics
export async function fetchDashboardStats() {
  try {
    const response = await fetchWithAuth(
      `${API_BASE}/api/admin/dashboard-stats`
    );
    return response;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
}

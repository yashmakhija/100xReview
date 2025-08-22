// Admin Dashboard Types
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  totalSubmissions: number;
  completedSubmissions: number;
  pendingSubmissions: number;
  lastSubmission: Date | null;
}

export interface AdminProject {
  id: number;
  name: string;
  description: string;
  dueDate: string;
  courseId: number;
  notion?: string;
  submissions?: AdminSubmission[];
}

export interface AdminSubmission {
  id: number;
  projectId: number;
  userId: number;
  githubUrl: string;
  deployUrl: string;
  wsUrl?: string;
  submittedAt: string;
  isReviewed: boolean;
  reviewNotes?: string | null;
  reviewVideoUrl?: string | null;
  rating?: number | null;
  project: {
    id: number;
    name: string;
    description: string;
    dueDate: string;
  };
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface AdminCourse {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface AdminScheduleItem {
  id: number;
  date: string;
  topic: string;
  description: string;
  courseId: number;
}

export interface AdminFilterState {
  status: "all" | "pending" | "reviewed";
  project: string | null;
  search: string;
}

export interface CreateProjectPayload {
  name: string;
  description: string;
  dueDate: string;
  courseId: number;
  notion?: string;
}

export interface EditProjectPayload {
  name: string;
  description: string;
  dueDate: string;
  notion?: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  number?: string;
  role?: "USER" | "ADMIN";
  courseId?: number;
}

export interface ReviewSubmissionPayload {
  submissionId: number;
  reviewNotes: string;
  reviewVideoUrl?: string;
  rating?: number;
}

export interface CreateSchedulePayload {
  courseId: number;
  date: string;
  topic: string;
  description: string;
}

export interface EditSchedulePayload {
  id: number;
  date?: string;
  topic?: string;
  description?: string;
}

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalSubmissions: number;
  pendingReviews: number;
  completedReviews: number;
  mostActiveUser?: {
    id: number;
    name: string;
    submissions: number;
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  projects?: number;
  productivity?: number;
  attendance?: number;
  uptime?: string;
  connectedWifi?: string;
  totalSubmissions: number;
  completedSubmissions: number;
  pendingSubmissions: number;
  lastSubmission: Date | null;
}

export interface Submission {
  id: number;
  projectId: number;
  projectName?: string;
  projectDescription: string;
  projectDueDate: string;
  courseId: number;
  courseName: string;
  userId: number;
  userName: string;
  userEmail: string;
  githubUrl: string;
  deployUrl: string;
  wsUrl?: string;
  submittedAt: string;
  isReviewed: boolean;
  reviewNotes?: string | null;
  reviewVideoUrl?: string | null;
  rating?: number | null;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  dueDate: string;
  courseId: number;
  notion?: string;
  submissions?: Submission[];
}

export interface Course {
  id: number;
  name: string;
}

export interface FilterState {
  status: "all" | "pending" | "reviewed";
  project: string | null;
  search: string;
}

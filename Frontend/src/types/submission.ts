export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
}

export interface Submission {
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

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
  wsUrl: string | undefined;
  id: number;
  githubUrl: string;
  deployUrl: string;
  isReviewed: boolean;
  reviewNotes?: string;
  reviewVideoUrl?: string;
  user: User;
  project: Project;
}

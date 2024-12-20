import prisma from "../config/prisma";

export const getProjectsByCourseId = async (courseId: number) => {
  return prisma.project.findMany({
    where: { courseId },
    include: {
      submissions: {
        include: { user: true },
      },
    },
  });
};

export const createProject = async (data: {
  name: string;
  description: string;
  dueDate: Date;
  courseId: number;
}) => {
  return prisma.project.create({ data });
};

export const submitProject = async (data: {
  githubUrl: string;
  projectId: number;
  userId: number;
}) => {
  return prisma.projectSubmission.create({ data });
};

export const reviewProject = async (
  submissionId: number,
  reviewNotes: string
) => {
  return prisma.projectSubmission.update({
    where: { id: submissionId },
    data: {
      isReviewed: true,
      reviewNotes,
    },
  });
};

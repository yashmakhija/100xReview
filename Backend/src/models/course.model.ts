import prisma from "../config/prisma";

export const getAllCourses = async () => {
  return prisma.course.findMany({
    include: {
      schedules: true,
      projects: true,
    },
  });
};

export const getCourseById = async (id: number) => {
  return prisma.course.findUnique({
    where: { id },
    include: {
      schedules: true,
      projects: {
        include: {
          submissions: {
            include: { user: true },
          },
        },
      },
    },
  });
};

export const createCourse = async (data: {
  name: string;
  description: string;
  createdBy: number;
}) => {
  return prisma.course.create({ data });
};

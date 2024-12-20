import prisma from "../config/prisma";

export const getUserById = async (id: number) => {
  return prisma.user.findUnique({
    where: { id },
    include: {
      biodata: true,
      enrollments: {
        include: { course: true },
      },
      macAddresses: true,
    },
  });
};

export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
  role: "USER" | "ADMIN";
}) => {
  return prisma.user.create({ data });
};

export const getAllUsers = async () => {
  return prisma.user.findMany({
    include: {
      biodata: true,
      enrollments: {
        include: { course: true },
      },
    },
  });
};

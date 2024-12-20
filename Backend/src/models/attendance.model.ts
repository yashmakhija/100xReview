import prisma from "../config/prisma";

export const markAttendance = async (data: {
  userId: number;
  scheduleId: number;
  timeWorked: number;
}) => {
  return prisma.attendance.upsert({
    where: {
      userId_scheduleId: {
        userId: data.userId,
        scheduleId: data.scheduleId,
      },
    },
    create: data,
    update: {
      timeWorked: {
        increment: data.timeWorked,
      },
    },
  });
};

export const getAttendanceByUser = async (userId: number) => {
  return prisma.attendance.findMany({
    where: { userId },
    include: { schedule: true },
  });
};

export const getAttendanceBySchedule = async (scheduleId: number) => {
  return prisma.attendance.findMany({
    where: { scheduleId },
    include: { user: true },
  });
};

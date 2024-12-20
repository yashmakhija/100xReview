import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../types/auth-request";

// Self-enroll in a course
export const selfEnroll = async (req: AuthRequest, res: Response) => {
  const { courseId } = req.body;

  if (!req.user || !req.user.id) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const userId = req.user.id;

  try {
    // Check if the course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }

    // Check if the user is already enrolled
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: { userId, courseId },
    });
    if (existingEnrollment) {
      res.status(400).json({ error: "Already enrolled in this course" });
      return;
    }

    // Enroll the user
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
      },
    });

    res.status(201).json({ message: "Enrolled successfully", enrollment });
  } catch (error) {
    console.error("Error enrolling user:", error);
    res.status(500).json({ error: "Failed to enroll in course" });
  }
};

export const adminEnroll = async (req: AuthRequest, res: Response) => {
  const { userId, courseId } = req.body;

  try {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const existingEnrollment = await prisma.enrollment.findFirst({
      where: { userId, courseId },
    });
    if (existingEnrollment) {
      res
        .status(400)
        .json({ error: "User is already enrolled in this course" });
      return;
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
      },
    });

    res.status(201).json({ message: "User enrolled successfully", enrollment });
  } catch (error) {
    console.error("Error enrolling user:", error);
    res.status(500).json({ error: "Failed to enroll user in course" });
  }
};

export const getMyCourses = async (req: AuthRequest, res: Response) => {
  const userId = (req.user as { id: number }).id;

  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            schedules: true,
            projects: true,
          },
        },
      },
    });

    const myCourses = enrollments.map((enrollment) => ({
      id: enrollment.course.id,
      name: enrollment.course.name,
      description: enrollment.course.description,
      schedules: enrollment.course.schedules,
      projects: enrollment.course.projects,
    }));

    res.json(myCourses);
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    res.status(500).json({ error: "Failed to fetch enrolled courses" });
  }
};

import { Request, Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../types/auth-request";

export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
      },
    });

    res.json(courses);
  } catch (error) {
    console.error("Error fetching all courses:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

export const getCourseById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user as { id: number; role: string } | undefined;

  try {
    const course = await prisma.course.findUnique({
      where: { id: Number(id) },
      include: {
        schedules: true,
        projects: true,
        enrollments: true,
      },
    });

    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }

    if (!user) {
      res.json({
        id: course.id,
        name: course.name,
        description: course.description,
      });
      return;
    }

    if (user.role === "ADMIN") {
      res.json(course);
      return;
    }

    const isEnrolled = course.enrollments.some(
      (enrollment) => enrollment.userId === user.id
    );

    if (isEnrolled) {
      res.json({
        id: course.id,
        name: course.name,
        description: course.description,
        schedules: course.schedules,
        projects: course.projects,
      });
    } else {
      res.json({
        id: course.id,
        name: course.name,
        description: course.description,
      });
    }
  } catch (error) {
    console.error("Error fetching course details:", error);
    res.status(500).json({ error: "Failed to fetch course details" });
  }
};

export const createCourse = async (req: AuthRequest, res: Response) => {
  const { name, description, imageUrl } = req.body;
  const user = req.user as { id: number };

  try {
    const course = await prisma.course.create({
      data: {
        name,
        description,
        createdBy: user.id,
        imageUrl,
      },
    });

    res.status(201).json({ message: "Course created successfully", course });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ error: "Failed to create course" });
  }
};

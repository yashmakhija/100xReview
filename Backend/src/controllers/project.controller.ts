import { Request, Response } from "express";
import { AuthRequest } from "../types/auth-request";
import prisma from "../config/prisma";
import { uploadToBunnyCDN } from "../Utils/bunnycdn";
import { z } from "zod";
import { sendProjectReviewEmail } from "../services/EmailService";

// Get Projects by Course (Enrolled Students Only)
export const getProjectsByCourse = async (req: AuthRequest, res: Response) => {
  const { courseId } = req.params;
  const userId = (req.user as { id: number }).id;

  try {
    // Check if the user is enrolled in the course
    const enrollment = await prisma.enrollment.findFirst({
      where: { userId, courseId: Number(courseId) },
    });

    if (!enrollment) {
      res.status(403).json({ error: "You are not enrolled in this course" });
      return;
    }

    // Fetch projects related to the course
    const projects = await prisma.project.findMany({
      where: { courseId: Number(courseId) },
      include: {
        submissions: {
          where: { userId },
          select: { id: true, isReviewed: true },
        },
      },
    });

    const projectsWithStatus = projects.map((project) => ({
      ...project,
      status:
        project.submissions.length > 0
          ? project.submissions[0].isReviewed
            ? "completed"
            : "pending"
          : "not_submitted",
    }));

    res.json(projectsWithStatus);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

// Create a Project (Admin Only)
export const createProject = async (req: AuthRequest, res: Response) => {
  const { name, description, dueDate, courseId, notion } = req.body;
  const user = req.user as { id: number; role: string };

  try {
    if (user.role !== "ADMIN") {
      res.status(403).json({ error: "Access denied. Admins only." });
      return;
    }

    // Check if the course exists
    const course = await prisma.course.findUnique({
      where: { id: Number(courseId) },
    });

    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }

    // Create the project
    const project = await prisma.project.create({
      data: {
        name,
        description,
        dueDate: new Date(dueDate),
        courseId: Number(courseId),
        notion,
      },
    });

    res.status(201).json({ message: "Project created successfully", project });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
};

// Submit a Project (Enrolled Students Only)
export const submitProject = async (req: AuthRequest, res: Response) => {
  const { githubUrl, projectId, deployUrl, wsUrl } = req.body;
  const userId = (req.user as { id: number }).id;

  try {
    // Check if the project exists
    const project = await prisma.project.findUnique({
      where: { id: Number(projectId) },
      include: { course: true },
    });

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    // Check if the user is enrolled in the course
    const enrollment = await prisma.enrollment.findFirst({
      where: { courseId: project.courseId, userId },
    });

    if (!enrollment) {
      res
        .status(403)
        .json({ error: "You are not enrolled in the course for this project" });
      return;
    }

    // Check if a submission already exists
    const existingSubmission = await prisma.projectSubmission.findFirst({
      where: { projectId: Number(projectId), userId },
    });

    if (existingSubmission) {
      res
        .status(400)
        .json({ error: "You have already submitted this project" });
      return;
    }

    // Submit the project
    const submission = await prisma.projectSubmission.create({
      data: {
        githubUrl,
        projectId: Number(projectId),
        deployUrl,
        wsUrl,
        userId,
      },
    });

    res
      .status(201)
      .json({ message: "Project submitted successfully", submission });
  } catch (error) {
    console.error("Error submitting project:", error);
    res.status(500).json({ error: "Failed to submit project" });
  }
};

// Get Submitted Projects by Course (Admin Only)
export const getSubmittedProjectsByCourse = async (
  req: AuthRequest,
  res: Response
) => {
  const { courseId } = req.params;
  const user = req.user as { id: number; role: string };

  try {
    if (user.role !== "ADMIN") {
      res.status(403).json({ error: "Access denied. Admins only." });
      return;
    }

    const submissions = await prisma.projectSubmission.findMany({
      where: {
        project: {
          courseId: Number(courseId),
        },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        project: {
          select: { id: true, name: true, description: true },
        },
      },
    });

    res.json(submissions);
  } catch (error) {
    console.error("Error fetching submitted projects:", error);
    res.status(500).json({ error: "Failed to fetch submitted projects" });
  }
};

// Upload Review Video (Admin Only)
export const uploadReviewVideo = async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    submissionId: z.string().regex(/^\d+$/).transform(Number),
  });

  try {
    const { submissionId } = schema.parse(req.params);
    const user = req.user as { id: number; role: string };

    if (user.role !== "ADMIN") {
      res.status(403).json({ error: "Access denied. Admins only." });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "No video file provided" });
      return;
    }

    const submission = await prisma.projectSubmission.findUnique({
      where: { id: submissionId },
      include: {
        project: { select: { name: true } },
        user: { select: { email: true } },
      },
    });

    if (!submission) {
      res.status(404).json({ error: "Submission not found" });
      return;
    }

    try {
      const videoBuffer = req.file.buffer;
      const fileName = `review_${submissionId}_${Date.now()}.mp4`;
      const videoUrl = await uploadToBunnyCDN(videoBuffer, fileName);

      const updatedSubmission = await prisma.projectSubmission.update({
        where: { id: submissionId },
        data: { 
          reviewVideoUrl: videoUrl,
        },
      });

      res.json({
        success: true,
        submission: updatedSubmission,
        message: "Video uploaded successfully"
      });
    } catch (error) {
      console.error("Error in video processing:", error);
      res.status(500).json({ error: "Failed to process video" });
    }
  } catch (error) {
    console.error("Error in upload handler:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid input", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Failed to process upload" });
  }
};

// Review Project (Admin Only)
export const reviewProject = async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    submissionId: z.number(),
    reviewNotes: z.string().min(1),
    reviewVideoUrl: z.string().url().nullable(),
    rating: z.number().min(1).max(5),
  });

  try {
    const { submissionId, reviewNotes, reviewVideoUrl, rating } = schema.parse(
      req.body
    );
    console.log("Received review data:", {
      submissionId,
      reviewNotes,
      reviewVideoUrl,
      rating,
    });

    const user = req.user as { id: number; role: string };

    if (user.role !== "ADMIN") {
      res.status(403).json({ error: "Access denied. Admins only." });
      return;
    }

    const submission = await prisma.projectSubmission.findUnique({
      where: { id: submissionId },
      include: {
        project: { select: { name: true } },
        user: { select: { email: true, name: true } },
      },
    });

    if (!submission) {
      res.status(404).json({ error: "Submission not found" });
      return;
    }

    const updatedSubmission = await prisma.projectSubmission.update({
      where: { id: submissionId },
      data: {
        isReviewed: true,
        reviewNotes,
        reviewVideoUrl,
        rating,
      },
    });

    console.log("Updated submission:", updatedSubmission);

    // Send email notification
    try {
      await sendProjectReviewEmail(
        submission.user.email,
        submission.project.name,
        `${reviewNotes}\n\nProject Rating: ${rating}/5`
      );
    } catch (emailError) {
      console.error("Email notification failed:", emailError);
      // Continue even if email fails
    }

    res.status(200).json({
      success: true,
      message: "Project reviewed successfully",
      submission: updatedSubmission,
    });
    return;
  } catch (error) {
    console.error("Error reviewing project:", error);

    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Invalid input",
        details: error.errors,
      });
      return;
    }

    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to review project",
    });
    return;
  }
};

// Get User Project Statuses
export const getUserProjectStatuses = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = (req.user as { id: number }).id;

  try {
    const submissions = await prisma.projectSubmission.findMany({
      where: { userId },
      select: {
        id: true,
        projectId: true,
        isReviewed: true,
        reviewNotes: true,
        reviewVideoUrl: true,
        rating: true,
        submittedAt: true,
        project: {
          select: {
            name: true,
            description: true,
            dueDate: true,
          },
        },
      },
    });

    const projectStatuses = submissions.map((submission) => ({
      id: submission.id,
      projectId: submission.projectId,
      projectName: submission.project.name,
      projectDescription: submission.project.description,
      dueDate: submission.project.dueDate,
      submittedAt: submission.submittedAt,
      status: submission.isReviewed ? "REVIEWED" : "PENDING_REVIEW",
      reviewNotes: submission.reviewNotes,
      reviewVideoUrl: submission.reviewVideoUrl,
      rating: submission.rating,
    }));

    res.json(projectStatuses);
  } catch (error) {
    console.error("Error fetching user project statuses:", error);
    res.status(500).json({ error: "Failed to fetch user project statuses" });
  }
};

// Get All Project Submissions (Admin Only)
export const getAllProjectSubmissions = async (
  req: AuthRequest,
  res: Response
) => {
  const user = req.user as { id: number; role: string };

  try {
    if (user.role !== "ADMIN") {
      res.status(403).json({ error: "Access denied. Admins only." });
      return;
    }

    const submissions = await prisma.projectSubmission.findMany({
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            dueDate: true,
            course: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { project: { courseId: "asc" } },
        { project: { id: "asc" } },
        { submittedAt: "desc" },
      ],
    });

    const formattedSubmissions = submissions.map((submission) => ({
      id: submission.id,
      projectId: submission.projectId,
      projectName: submission.project.name,
      projectDescription: submission.project.description,
      projectDueDate: submission.project.dueDate,
      courseId: submission.project.course.id,
      courseName: submission.project.course.name,
      userId: submission.userId,
      userName: submission.user.name,
      userEmail: submission.user.email,
      githubUrl: submission.githubUrl,
      deployUrl: submission.deployUrl,
      wsUrl: submission.wsUrl,
      submittedAt: submission.submittedAt,
      isReviewed: submission.isReviewed,
      reviewNotes: submission.reviewNotes,
      reviewVideoUrl: submission.reviewVideoUrl,
      rating: submission.rating,
    }));

    res.json(formattedSubmissions);
  } catch (error) {
    console.error("Error fetching all project submissions:", error);
    res.status(500).json({ error: "Failed to fetch project submissions" });
  }
};

// Get All Projects for Admin
export const getAllProjectsForAdmin = async (
  req: AuthRequest,
  res: Response
) => {
  const user = req.user as { id: number; role: string };

  try {
    if (user.role !== "ADMIN") {
      res.status(403).json({ error: "Access denied. Admins only." });
      return;
    }

    const projects = await prisma.project.findMany({
      include: {
        course: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        submissions: {
          select: {
            id: true,
            userId: true,
            submittedAt: true,
            isReviewed: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    const projectsWithStats = projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      dueDate: project.dueDate,
      courseId: project.courseId,
      courseName: project.course.name,
      courseDescription: project.course.description,
      totalSubmissions: project.submissions.length,
      reviewedSubmissions: project.submissions.filter((sub) => sub.isReviewed)
        .length,
      submissions: project.submissions.map((sub) => ({
        id: sub.id,
        userId: sub.userId,
        userName: sub.user.name,
        userEmail: sub.user.email,
        submittedAt: sub.submittedAt,
        isReviewed: sub.isReviewed,
      })),
    }));

    res.json(projectsWithStats);
  } catch (error) {
    console.error("Error fetching all projects for admin:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

export const editProject = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, dueDate, notionUrl } = req.body;

  if (!id) {
    res.status(400).json({
      msg: `Project id not found`,
    });
    return;
  }

  try {
    const projectId = parseInt(id, 10);

    const projectFind = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!projectFind) {
      res.status(400).json({
        msg: `Project not found`,
      });
      return;
    }

    const updateProject = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        name: title,
        description: description,
        dueDate: new Date(dueDate),
        notion: notionUrl,
      },
    });

    res.status(200).json({
      id: updateProject.id,
      name: updateProject.name,
      description: updateProject.description,
      dueDate: updateProject.dueDate,
      notion: updateProject.notion,
    });
  } catch (err) {
    console.error("Error updating project:", err);
    res.status(500).json({ error: "Failed to update project" });
  }
};

// Get Submission Details
export const getSubmissionDetails = async (req: AuthRequest, res: Response) => {
  const { submissionId } = req.params;
  const user = req.user as { id: number; role: string };

  try {
    if (user.role !== "ADMIN") {
      res.status(403).json({ error: "Access denied. Admins only." });
      return;
    }

    const submission = await prisma.projectSubmission.findUnique({
      where: { id: Number(submissionId) },
      include: {
        project: {
          select: { name: true },
        },
        user: {
          select: { email: true, name: true },
        },
      },
    });

    if (!submission) {
      res.status(404).json({ error: "Submission not found" });
      return;
    }

    res.json(submission);
  } catch (error) {
    console.error("Error fetching submission:", error);
    res.status(500).json({ error: "Failed to fetch submission" });
  }
};

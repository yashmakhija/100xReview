import { Request, Response } from "express";
import { AuthRequest } from "../types/auth-request";
import prisma from "../config/prisma";
import { UserModel } from "../models";

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = (req.user as { id: number; role: string }).id;
    const requestedUserId = req.params.id
      ? parseInt(req.params.id)
      : currentUserId;

    // If trying to access another user's profile, check if current user is admin
    if (requestedUserId !== currentUserId) {
      const currentUserRole = (req.user as { role: string }).role;
      if (currentUserRole !== "ADMIN") {
        res.status(403).json({ error: "Access denied. Admin only." });
        return;
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: requestedUserId },
      include: {
        biodata: true,
        projectSubmissions: {
          include: {
            project: {
              select: {
                name: true,
                description: true,
              },
            },
          },
          orderBy: {
            submittedAt: "desc",
          },
          take: 5,
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const projectStats = await prisma.projectSubmission.groupBy({
      by: ["isReviewed"],
      where: {
        userId: requestedUserId,
      },
      _count: {
        _all: true,
      },
    });

    const totalProjects = projectStats.reduce(
      (acc, curr) => acc + curr._count._all,
      0
    );
    const completedProjects =
      projectStats.find((stat) => stat.isReviewed)?._count._all || 0;
    const pendingProjects =
      projectStats.find((stat) => !stat.isReviewed)?._count._all || 0;

    // Calculate active streak
    const submissions = await prisma.projectSubmission.findMany({
      where: { userId: requestedUserId },
      orderBy: { submittedAt: "desc" },
      select: { submittedAt: true },
    });

    let streak = 0;
    if (submissions.length > 0) {
      const today = new Date();
      const oneDay = 24 * 60 * 60 * 1000;
      let currentDate = new Date(submissions[0].submittedAt);

      if (today.getTime() - currentDate.getTime() <= oneDay) {
        streak = 1;
        for (let i = 1; i < submissions.length; i++) {
          const prevDate = new Date(submissions[i].submittedAt);
          if (currentDate.getTime() - prevDate.getTime() <= oneDay) {
            streak++;
            currentDate = prevDate;
          } else {
            break;
          }
        }
      }
    }

    // Format the response
    const profileData = {
      id: user.id,
      name: user.name,
      number: user.number,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      biodata: {
        bio: user.biodata?.bio || null,
        techStack: user.biodata?.techStack || [],
        resume: user.biodata?.resume || null,
      },
      stats: {
        totalProjects,
        completedProjects,
        pendingProjects,
        activeStreak: streak,
      },
      recentSubmissions: user.projectSubmissions.map((submission) => ({
        projectName: submission.project.name,
        projectDescription: submission.project.description,
        submittedAt: submission.submittedAt,
        status: submission.isReviewed ? "REVIEWED" : "PENDING_REVIEW",
        githubUrl: submission.githubUrl,
        deployUrl: submission.deployUrl || null,
      })),
    };

    res.json(profileData);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
};

// Update current user's biodata
export const updateUserBiodata = async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req.user as { id: number }).id;
    const { bio, techStack, resume } = req.body;

    // Validate input
    if (bio && typeof bio !== "string") {
      res.status(400).json({ error: "Bio must be a string" });
      return;
    }
    if (techStack && !Array.isArray(techStack)) {
      res.status(400).json({ error: "Tech stack must be an array" });
      return;
    }
    if (resume && typeof resume !== "string") {
      res.status(400).json({ error: "Resume URL must be a string" });
      return;
    }

    const updatedBiodata = await prisma.userBiodata.upsert({
      where: {
        userId: userId,
      },
      update: {
        bio,
        techStack,
        resume,
      },
      create: {
        userId: userId,
        bio,
        techStack,
        resume,
      },
    });

    res.json({
      message: "Biodata updated successfully",
      biodata: updatedBiodata,
    });
  } catch (error) {
    console.error("Error updating user biodata:", error);
    res.status(500).json({ error: "Failed to update user biodata" });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserModel.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const updateAdminRole = async (req: Request, res: Response) => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400).json({
      error: "Please provide userId in the request body",
    });
    return;
  }

  try {
    const findUser = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
    });

    if (!findUser) {
      res.status(404).json({
        error: "User not found",
      });
      return;
    }

    const updateUser = await prisma.user.update({
      where: {
        id: findUser.id,
      },
      data: {
        role: "ADMIN",
      },
    });

    res.status(200).json({
      message: "User role has been updated to Admin",
      user: {
        id: updateUser.id,
        email: updateUser.email,
        role: updateUser.role,
      },
    });
    return;
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({
      error: "Failed to update user role",
    });
    return;
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400).json({
      error: "Please provide userId in the request body",
    });
    return;
  }
  try {
    const findUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!findUser) {
      res.status(404).json({
        error: "User doesn't exist",
      });
      return;
    }

    const updateRole = await prisma.user.update({
      where: {
        id: findUser.id,
      },
      data: {
        role: "USER",
      },
    });

    res.status(200).json({
      message: "Admin role has been updated to User",
      user: {
        id: updateRole.id,
        email: updateRole.email,
        role: updateRole.role,
      },
    });
    return;
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({
      error: "Failed to update user role",
    });
    return;
  }
};

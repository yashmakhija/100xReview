import { NextFunction, Request, Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../types/auth-request";

// Get Onboarding Status
export const getOnboardingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id; // Extract user ID from the token
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isOnboarded: true },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ isOnboarded: user.isOnboarded });
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    res.status(500).json({ error: "Failed to check onboarding status" });
  }
};

export const completeOnboarding = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    await prisma.user.update({
      where: { id: userId },
      data: { isOnboarded: true },
    });

    res.json({ message: "Onboarding completed successfully" });
  } catch (error) {
    console.error("Error marking onboarding complete:", error);
    res.status(500).json({ error: "Failed to mark onboarding complete" });
  }
};

export const requireOnboarding = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id; // Extract user ID from the token
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isOnboarded: true },
    });

    if (user?.isOnboarded) {
      res.status(403).json({ error: "Onboarding already completed" });
      return;
    }

    next();
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    res.status(500).json({ error: "Failed to check onboarding status" });
  }
};

export const renderOnboardingPage = async (req: AuthRequest, res: Response) => {
  try {
    res.json({ message: "Proceed with onboarding" });
  } catch (error) {
    console.error("Error rendering onboarding page:", error);
    res.status(500).json({ error: "Failed to render onboarding page" });
  }
};

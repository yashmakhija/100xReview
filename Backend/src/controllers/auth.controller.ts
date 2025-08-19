import { Request, Response } from "express";
import { AuthRequest } from "../types/auth-request";
import { AuthService } from "../services/AuthService";
import { z } from "zod";
import { asyncHandler, ErrorType, createError } from "../errors";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  number: z.string().optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
  courseId: z.number().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

const resetPasswordSchema = z.object({
  userId: z.number({
    required_error: "User ID is required",
    invalid_type_error: "User ID must be a number",
  }),
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);

  const result = await AuthService.authenticate(email, password);

  res.json({
    user: result.user,
    accessToken: result.token.accessToken,
    expiresAt: result.token.expiresAt,
  });
});

export const createUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userData = createUserSchema.parse(req.body);
    const adminId = (req.user as { id: number }).id;

    const newUser = await AuthService.createUser(adminId, userData);

    res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  }
);

export const changePassword = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { currentPassword, newPassword } = changePasswordSchema.parse(
      req.body
    );
    const userId = (req.user as { id: number }).id;

    await AuthService.changePassword(userId, currentPassword, newPassword);

    res.json({ message: "Password updated successfully" });
  }
);

export const resetUserPassword = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { userId } = resetPasswordSchema.parse(req.body);
    const adminId = (req.user as { id: number }).id;

    await AuthService.resetUserPassword(adminId, userId);

    res.json({ message: "Password reset successful" });
  }
);

export const validateToken = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = (req.user as { id: number }).id;
    const userRole = (req.user as { role: string }).role;
    const userEmail = (req.user as { email: string }).email;

    res.json({
      valid: true,
      user: {
        id: userId,
        email: userEmail,
        role: userRole,
      },
    });
  }
);

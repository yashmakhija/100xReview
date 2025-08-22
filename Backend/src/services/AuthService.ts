import bcrypt from "bcrypt";
import prisma from "../config/prisma";
import { generateSecurePassword } from "../Utils/passwordGenerator";
import { EmailService } from "./EmailService";
import { TokenService } from "./TokenService";
import { AppError, ErrorType, createError } from "../errors";

export interface AuthPayload {
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
  token: {
    accessToken: string;
    expiresAt: Date;
  };
}

export class AuthService {
  static async authenticate(
    email: string,
    password: string
  ): Promise<AuthPayload> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        throw createError(ErrorType.INVALID_CREDENTIALS);
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw createError(ErrorType.INVALID_CREDENTIALS);
      }

      const token = TokenService.generateAccessToken(user);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw createError(
        ErrorType.INTERNAL_SERVER_ERROR,
        "Authentication failed"
      );
    }
  }

  static async createUser(
    adminId: number,
    userData: {
      name: string;
      email: string;
      number?: string;
      role?: "USER" | "ADMIN";
      courseId?: number;
    }
  ) {
    try {
      const admin = await prisma.user.findUnique({
        where: { id: adminId },
      });

      if (!admin || admin.role !== "ADMIN") {
        throw createError(ErrorType.FORBIDDEN, "Only admins can create users");
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email.toLowerCase() },
      });

      if (existingUser) {
        throw createError(ErrorType.USER_ALREADY_EXISTS);
      }

      const plainPassword = generateSecurePassword();
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name: userData.name,
            email: userData.email.toLowerCase(),
            number: userData.number || null,
            password: hashedPassword,
            role: userData.role || "USER",
          },
        });

        let enrollment = null;

        if (userData.courseId) {
          const course = await tx.course.findUnique({
            where: {
              id: userData.courseId,
            },
            select: {
              id: true,
              name: true,
            },
          });

          if (course) {
            enrollment = await tx.enrollment.create({
              data: {
                userId: user.id,
                courseId: course.id,
              },
              include: {
                course: {
                  select: {
                    name: true,
                  },
                },
              },
            });
          }
        }

        return { user, enrollment };
      });

      console.log(
        `secure Password of that ${userData.email} >> ${plainPassword}`
      );
      await EmailService.sendAccountCreationEmail(
        userData.email,
        userData.name,
        plainPassword
      );

      return {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        enrollment: result.enrollment
          ? {
              courseId: result.enrollment.courseId,
              courseName: result.enrollment.course.name,
            }
          : null,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw createError(
        ErrorType.INTERNAL_SERVER_ERROR,
        "Failed to create user"
      );
    }
  }

  static async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        throw createError(ErrorType.USER_NOT_FOUND);
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!isPasswordValid) {
        throw createError(ErrorType.PASSWORD_INCORRECT);
      }

      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        throw createError(
          ErrorType.PASSWORD_MATCH,
          "New password must be different from current password"
        );
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      return true;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw createError(
        ErrorType.INTERNAL_SERVER_ERROR,
        "Failed to change password"
      );
    }
  }

  static async resetUserPassword(adminId: number, targetUserId: number) {
    try {
      const admin = await prisma.user.findUnique({
        where: { id: adminId },
      });

      if (!admin || admin.role !== "ADMIN") {
        throw createError(
          ErrorType.FORBIDDEN,
          "Only admins can reset passwords"
        );
      }

      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
      });

      if (!targetUser) {
        throw createError(ErrorType.USER_NOT_FOUND, "Target user not found");
      }

      const plainPassword = generateSecurePassword();
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      await prisma.user.update({
        where: { id: targetUserId },
        data: { password: hashedPassword },
      });

      await EmailService.sendPasswordResetEmail(
        targetUser.email,
        targetUser.name,
        plainPassword
      );

      return true;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw createError(
        ErrorType.INTERNAL_SERVER_ERROR,
        "Failed to reset password"
      );
    }
  }
}

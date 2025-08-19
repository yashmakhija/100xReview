import { Request, Response, NextFunction } from "express";
import { AppError, ErrorType, createError } from "../errors";

interface AuthRequest extends Request {
  user?: {
    role: string;
  };
}
export const requireRole = (role: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw createError(ErrorType.UNAUTHORIZED, "Authentication required");
      }

      if (req.user.role !== role) {
        throw createError(
          ErrorType.FORBIDDEN,
          "Access denied: insufficient permissions"
        );
      }

      next();
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          status: "error",
          message: error.message,
          code: error.name,
        });
        return;
      }

      res.status(403).json({
        status: "error",
        message: "Access denied",
        code: ErrorType.FORBIDDEN,
      });
    }
  };
};

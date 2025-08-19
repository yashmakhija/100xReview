import { Request, Response, NextFunction } from "express";
import { TokenService } from "../services/TokenService";
import { AppError, ErrorType, createError } from "../errors";

interface AuthRequest extends Request {
  user?: Record<string, any>;
}

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw createError(
        ErrorType.UNAUTHORIZED,
        "Authorization token is required"
      );
    }

    const token = authHeader.split(" ")[1];
    const payload = TokenService.verifyAccessToken(token);

    if (!payload) {
      throw createError(ErrorType.INVALID_TOKEN, "Invalid or expired token");
    }

    req.user = payload;
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

    res.status(401).json({
      status: "error",
      message: "Authentication failed",
      code: ErrorType.UNAUTHORIZED,
    });
  }
};

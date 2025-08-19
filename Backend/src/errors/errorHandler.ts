import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { AppError } from "./AppError";
import { ErrorType, createError } from "./errorTypes";
import { logError } from "../services/LoggerService";

/**
 * Standard API error response format
 */
interface ErrorResponse {
  status: "error";
  message: string;
  code?: string;
  details?: unknown;
  stack?: string;
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error with context
  logError("Request error", err, {
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  // Standard error response
  const errorResponse: ErrorResponse = {
    status: "error",
    message: "Something went wrong",
  };

  // Handle AppError instances
  if (err instanceof AppError) {
    errorResponse.message = err.message;
    errorResponse.code = err.name;

    if (process.env.NODE_ENV === "development") {
      errorResponse.stack = err.stack;
    }

    res.status(err.statusCode).json(errorResponse);
    return;
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    errorResponse.message = "Validation failed";
    errorResponse.code = ErrorType.VALIDATION_ERROR;
    errorResponse.details = err.errors;

    res.status(400).json(errorResponse);
    return;
  }

  // Handle Prisma database errors
  if (err instanceof PrismaClientKnownRequestError) {
    errorResponse.code = ErrorType.DATABASE_ERROR;

    switch (err.code) {
      case "P2002": // Unique constraint failed
        errorResponse.message = "A record with this value already exists";
        res.status(409).json(errorResponse);
        return;
      case "P2025": // Record not found
        errorResponse.message = "Requested record not found";
        res.status(404).json(errorResponse);
        return;
      default:
        errorResponse.message = "Database operation failed";
        res.status(500).json(errorResponse);
        return;
    }
  }

  // Handle JWT token errors
  if (err.name === "JsonWebTokenError") {
    errorResponse.message = "Invalid token";
    errorResponse.code = ErrorType.INVALID_TOKEN;
    res.status(401).json(errorResponse);
    return;
  }

  if (err.name === "TokenExpiredError") {
    errorResponse.message = "Token expired";
    errorResponse.code = ErrorType.TOKEN_EXPIRED;
    res.status(401).json(errorResponse);
    return;
  }

  // Default error response
  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = err.stack;
  }

  res.status(500).json(errorResponse);
}

/**
 * Async error handler for route handlers
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}
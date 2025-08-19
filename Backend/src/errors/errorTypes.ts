/**
 * Common error types used throughout the application
 */

import { AppError } from "./AppError";

export enum ErrorType {
  UNAUTHORIZED = "UNAUTHORIZED",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  INVALID_TOKEN = "INVALID_TOKEN",
  FORBIDDEN = "FORBIDDEN",

  USER_NOT_FOUND = "USER_NOT_FOUND",
  USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS",
  INVALID_USER_INPUT = "INVALID_USER_INPUT",

  PASSWORD_INCORRECT = "PASSWORD_INCORRECT",
  PASSWORD_WEAK = "PASSWORD_WEAK",
  PASSWORD_MATCH = "PASSWORD_MATCH",

  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  RESOURCE_ALREADY_EXISTS = "RESOURCE_ALREADY_EXISTS",

  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  EMAIL_DELIVERY_FAILED = "EMAIL_DELIVERY_FAILED",

  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
}

export interface ErrorDetail {
  type: ErrorType;
  message: string;
  statusCode: number;
}

export const ErrorTypes: Record<ErrorType, ErrorDetail> = {
  [ErrorType.UNAUTHORIZED]: {
    type: ErrorType.UNAUTHORIZED,
    message: "Authentication required for this operation",
    statusCode: 401,
  },
  [ErrorType.INVALID_CREDENTIALS]: {
    type: ErrorType.INVALID_CREDENTIALS,
    message: "Invalid credentials provided",
    statusCode: 401,
  },
  [ErrorType.TOKEN_EXPIRED]: {
    type: ErrorType.TOKEN_EXPIRED,
    message: "Authentication token has expired",
    statusCode: 401,
  },
  [ErrorType.INVALID_TOKEN]: {
    type: ErrorType.INVALID_TOKEN,
    message: "Invalid or malformed authentication token",
    statusCode: 401,
  },
  [ErrorType.FORBIDDEN]: {
    type: ErrorType.FORBIDDEN,
    message: "You don't have permission to perform this action",
    statusCode: 403,
  },

  [ErrorType.USER_NOT_FOUND]: {
    type: ErrorType.USER_NOT_FOUND,
    message: "User not found",
    statusCode: 404,
  },
  [ErrorType.USER_ALREADY_EXISTS]: {
    type: ErrorType.USER_ALREADY_EXISTS,
    message: "User with this email already exists",
    statusCode: 409,
  },
  [ErrorType.INVALID_USER_INPUT]: {
    type: ErrorType.INVALID_USER_INPUT,
    message: "Invalid user input provided",
    statusCode: 400,
  },

  [ErrorType.PASSWORD_INCORRECT]: {
    type: ErrorType.PASSWORD_INCORRECT,
    message: "Current password is incorrect",
    statusCode: 400,
  },
  [ErrorType.PASSWORD_WEAK]: {
    type: ErrorType.PASSWORD_WEAK,
    message: "Password does not meet security requirements",
    statusCode: 400,
  },
  [ErrorType.PASSWORD_MATCH]: {
    type: ErrorType.PASSWORD_MATCH,
    message: "New password must be different from current password",
    statusCode: 400,
  },

  [ErrorType.RESOURCE_NOT_FOUND]: {
    type: ErrorType.RESOURCE_NOT_FOUND,
    message: "Requested resource not found",
    statusCode: 404,
  },
  [ErrorType.RESOURCE_ALREADY_EXISTS]: {
    type: ErrorType.RESOURCE_ALREADY_EXISTS,
    message: "Resource already exists",
    statusCode: 409,
  },

  [ErrorType.SERVICE_UNAVAILABLE]: {
    type: ErrorType.SERVICE_UNAVAILABLE,
    message: "Service is temporarily unavailable",
    statusCode: 503,
  },
  [ErrorType.EMAIL_DELIVERY_FAILED]: {
    type: ErrorType.EMAIL_DELIVERY_FAILED,
    message: "Failed to deliver email notification",
    statusCode: 500,
  },

  [ErrorType.INTERNAL_SERVER_ERROR]: {
    type: ErrorType.INTERNAL_SERVER_ERROR,
    message: "Internal server error occurred",
    statusCode: 500,
  },
  [ErrorType.VALIDATION_ERROR]: {
    type: ErrorType.VALIDATION_ERROR,
    message: "Validation failed for provided data",
    statusCode: 400,
  },
  [ErrorType.DATABASE_ERROR]: {
    type: ErrorType.DATABASE_ERROR,
    message: "Database operation failed",
    statusCode: 500,
  },
};

export function createError(type: ErrorType, customMessage?: string): AppError {
  const error = ErrorTypes[type];
  return new AppError(customMessage || error.message, error.statusCode);
}

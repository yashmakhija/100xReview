import winston from "winston";
import path from "path";
import { NextFunction, Request, Response } from "express";

const logDir = process.env.LOG_DIR || "logs";

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""
    }`;
  })
);

const Logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: logFormat,
  defaultMeta: { service: "100xDashboard-API" },
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, "exceptions.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, "rejections.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  exitOnError: false,
});

if (process.env.NODE_ENV !== "production") {
  Logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

export default Logger;

export const logInfo = (message: string, meta: Record<string, any> = {}) => {
  Logger.info(message, meta);
};

export const logError = (
  message: string,
  error?: Error,
  meta: Record<string, any> = {}
) => {
  if (error) {
    meta.errorMessage = error.message;
    meta.stack = error.stack;
    meta.name = error.name;
  }
  Logger.error(message, meta);
};

export const logWarning = (message: string, meta: Record<string, any> = {}) => {
  Logger.warn(message, meta);
};

export const logDebug = (message: string, meta: Record<string, any> = {}) => {
  Logger.debug(message, meta);
};

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = new Date().getTime();

  res.on("finish", () => {
    const duration = new Date().getTime() - startTime;
    const logData = {
      method: req.method,
      url: req.originalUrl || req.url || "",
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.get("User-Agent"),
    };

    if (res.statusCode >= 400) {
      logWarning(`HTTP ${req.method} ${res.statusCode}`, logData);
    } else {
      logInfo(`HTTP ${req.method} ${res.statusCode}`, logData);
    }
  });

  next();
};

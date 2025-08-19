import express from "express";
import { Request, Response } from "express";
import {
  authRoutes,
  userRoutes,
  courseRoutes,
  projectRoutes,
  attendanceRoutes,
  enrollmentRoutes,
  scheduleRoutes,
  onboardingRoutes,
} from "./routes";
import cors from "cors";
import { errorHandler } from "./errors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import { requestLogger, logInfo, logError } from "./services/LoggerService";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swaggerConfig";
import fs from "fs";
import { pingDatabase } from "./config/prisma";

const logDir = process.env.LOG_DIR || "logs";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: "deny" },
    xssFilter: true,
  })
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

app.use(
  compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (
        req.headers["user-agent"] &&
        /MSIE [1-6]\./.test(req.headers["user-agent"] as string)
      ) {
        return false;
      }

      return compression.filter(req, res);
    },
  })
);

app.use(requestLogger);

const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // default 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "250"), // default limit each IP to 250 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many requests, please try again later.",
  },
  skip: (req) => process.env.NODE_ENV === "development",
});
app.use(apiLimiter);

// API Documentation
if (process.env.NODE_ENV !== "production") {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "100x Dashboard API Documentation",
    })
  );
}

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/course", enrollmentRoutes);
app.use("/api/schedule", scheduleRoutes);

app.get("/health", (req: Request, res: Response) => {
  pingDatabase()
    .then((dbConnected) => {
      const healthStatus = {
        status: dbConnected ? "healthy" : "unhealthy",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        uptime: `${Math.floor(process.uptime())} seconds`,
        memory: process.memoryUsage(),
        database: {
          connected: dbConnected,
          message: dbConnected ? "Connected" : "Connection failed",
        },
      };

      logInfo("Health check", healthStatus);

      if (!dbConnected) {
        res.status(503).json(healthStatus);
        return;
      }

      res.status(200).json(healthStatus);
    })
    .catch((error) => {
      logError("Health check error", error as Error);
      res.status(500).json({
        status: "error",
        message: "Health check failed",
        timestamp: new Date().toISOString(),
      });
    });
});

// Global error handler
app.use(errorHandler);

export default app;

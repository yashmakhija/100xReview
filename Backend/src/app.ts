import express from "express";
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

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/course", enrollmentRoutes);
app.use("/api/schedule", scheduleRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "health is okay",
    timestamp: new Date().toISOString(),
  });
});

// app.use("/api/attendance", attendanceRoutes); // Attendance endpoints

export default app;

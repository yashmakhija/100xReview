import express from "express";
import { AttendanceController } from "../controllers";
import { requireAuth } from "../middleware";

const router = express.Router();

// Routes
router.post("/mark", requireAuth, AttendanceController.markAttendance); // Mark Attendance
router.get(
  "/user/:userId",
  requireAuth,
  AttendanceController.getUserAttendance
); // Get User Attendance

export default router;

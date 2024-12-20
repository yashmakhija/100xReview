import express from "express";
import { ScheduleController } from "../controllers";
import { requireAuth, requireRole } from "../middleware";

const router = express.Router();

// Get daily schedule for a course (Students & Admin)
router.get(
  "/daily/:courseId",
  requireAuth,
  ScheduleController.getDailySchedule
);

// Get weekly schedule for a course (Students & Admin)
router.get(
  "/weekly/:courseId",
  requireAuth,
  ScheduleController.getWeeklySchedule
);

// Add a schedule for a specific day (Admin Only)
router.post(
  "/add",
  requireAuth,
  requireRole("ADMIN"),
  ScheduleController.addDaySchedule
);

// Update a specific day's schedule (Admin Only)
router.put(
  "/:scheduleId",
  requireAuth,
  requireRole("ADMIN"),
  ScheduleController.updateDaySchedule
);

// Delete a specific day's schedule (Admin Only)
router.delete(
  "/:scheduleId",
  requireAuth,
  requireRole("ADMIN"),
  ScheduleController.deleteDaySchedule
);

export default router;

import express from "express";
import { CourseController } from "../controllers";
import { requireAuth, requireRole } from "../middleware";

const router = express.Router();

// Routes
router.get("/", requireAuth, CourseController.getAllCourses); // Get All Courses
router.get("/:id", requireAuth, CourseController.getCourseById); // Get Course Details
router.post(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  CourseController.createCourse
); // Admin: Create Course

export default router;

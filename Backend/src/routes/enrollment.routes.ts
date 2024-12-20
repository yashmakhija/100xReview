import express from "express";
import { requireAuth, requireRole } from "../middleware";
import { EnrollmentController } from "../controllers";

const router = express.Router();

router.post("/enroll", requireAuth, EnrollmentController.selfEnroll);

// Admin assigns a user to a course
router.post(
  "/assign",
  requireAuth,
  requireRole("ADMIN"),
  EnrollmentController.adminEnroll
);
router.get("/my-courses", requireAuth, EnrollmentController.getMyCourses);

export default router;

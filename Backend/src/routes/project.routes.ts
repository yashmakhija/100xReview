import express from "express";
import multer from "multer";
import { ProjectController } from "../controllers";
import { requireAuth, requireRole } from "../middleware";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.get(
  "/course/:courseId",
  requireAuth,
  ProjectController.getProjectsByCourse
);
router.get(
  "/all-courses",
  requireAuth,
  requireRole("ADMIN"),
  ProjectController.getAllProjectsForAdmin
);
router.post(
  "/create",
  requireAuth,
  requireRole("ADMIN"),
  ProjectController.createProject
);
router.post("/submit", requireAuth, ProjectController.submitProject);
router.get(
  "/course/:courseId/submissions",
  requireAuth,
  requireRole("ADMIN"),
  ProjectController.getSubmittedProjectsByCourse
);
router.post(
  "/review",
  requireAuth,
  requireRole("ADMIN"),
  ProjectController.reviewProject
);
router.post(
  "/review/:submissionId/video",
  requireAuth,
  requireRole("ADMIN"),
  upload.single("video"),
  ProjectController.uploadReviewVideo
);
router.get(
  "/list",
  requireAuth,
  requireRole("ADMIN"),
  ProjectController.getAllProjectSubmissions
);
router.get(
  "/user-project-statuses",
  requireAuth,
  ProjectController.getUserProjectStatuses
);

router.put(
  "/edit-project/:id",
  requireAuth,
  requireRole("ADMIN"),
  ProjectController.editProject
);

router.get("/submission/:submissionId", requireAuth, ProjectController.getSubmissionDetails);

export default router;

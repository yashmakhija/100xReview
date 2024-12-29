import express from "express";
import { UserController } from "../controllers";
import { requireAuth, requireRole } from "../middleware";

const router = express.Router();

// Public routes (if any)
router.get("/profile", requireAuth, UserController.getUserProfile);
router.put("/profile/biodata", requireAuth, UserController.updateUserBiodata);

// Admin routes
router.get(
  "/profile/:id",
  requireAuth,
  requireRole("ADMIN"),
  UserController.getUserProfile
);
router.get("/", requireAuth, requireRole("ADMIN"), UserController.getAllUsers);
router.post(
  "/Admin-role",
  requireAuth,
  requireRole("ADMIN"),
  UserController.updateAdminRole
);
router.post(
  "/user-role",
  requireAuth,
  requireRole("ADMIN"),
  UserController.updateUserRole
);

export default router;

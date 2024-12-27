import express from "express";
import { UserController } from "../controllers";
import { requireAuth, requireRole } from "../middleware";

const router = express.Router();

// Public routes (if any)

// Protected routes (require authentication)
router.get("/profile", requireAuth, UserController.getUserProfile); // Get current user's profile
router.put("/profile/biodata", requireAuth, UserController.updateUserBiodata); // Update current user's biodata

// Admin routes
router.get(
  "/profile/:id",
  requireAuth,
  requireRole("ADMIN"),
  UserController.getUserProfile
); // Admin: Get any user's profile
router.get("/", requireAuth, requireRole("ADMIN"), UserController.getAllUsers); // Admin: Get all users

export default router;

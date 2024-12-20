import express from "express";
import { UserController } from "../controllers";
import { requireAuth, requireRole } from "../middleware";

const router = express.Router();

// Routes
router.get(
  "/profile/:id",
  requireAuth,
  requireRole("ADMIN"),
  UserController.getUserProfile
); // Get User Profile
router.get("/", requireAuth, requireRole("ADMIN"), UserController.getAllUsers); // Admin: Get All Users

export default router;

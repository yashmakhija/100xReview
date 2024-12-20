import express from "express";
import { OnboardingController } from "../controllers";
import { requireAuth } from "../middleware";

const router = express.Router();

// Routes
router.get("/status", requireAuth, OnboardingController.getOnboardingStatus);
router.post("/complete", requireAuth, OnboardingController.completeOnboarding);

router.get(
  "/",
  requireAuth,
  OnboardingController.requireOnboarding,
  OnboardingController.renderOnboardingPage
);

export default router;

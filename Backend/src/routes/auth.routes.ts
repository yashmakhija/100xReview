import express from "express";
import { AuthController } from "../controllers";
import { requireAuth } from "../middleware";
import {
  authLimiter,
  otpLimiter,
  passwordResetLimiter,
} from "../middleware/rateLimiter";

const router = express.Router();

router.get("/validate", requireAuth, AuthController.validateToken);

router.post("/signup/init", AuthController.initializeSignup);
router.post("/signup/verify-otp", AuthController.verifyOTP);
router.post("/signup/complete", AuthController.verifyAndSignup);
router.post("/signup/resend-otp", AuthController.resendOTP);

router.post(
  "/password-reset/init",
  passwordResetLimiter,
  AuthController.initializePasswordReset
);
router.post(
  "/password-reset/verify-otp",
  otpLimiter,
  AuthController.verifyPasswordResetOTP
);
router.post("/password-reset/complete", AuthController.resetPassword);

router.post("/login", authLimiter, AuthController.login);

router.post("/mac-address", requireAuth, AuthController.macAddr);

router.post("/change-password", requireAuth, AuthController.changePassword);

export default router;

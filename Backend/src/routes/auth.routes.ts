import express from "express";
import { AuthController } from "../controllers";
import { requireAuth } from "../middleware";

const router = express.Router();

// Routes
router.post("/signup", AuthController.signUp); // User Signup
router.post("/login", AuthController.login); // User Login
router.post("/mac-address", requireAuth, AuthController.macAddr);


export default router;

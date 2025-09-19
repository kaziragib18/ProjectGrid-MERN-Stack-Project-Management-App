import express from "express";
import authenticateUser from "../middleware/auth-middleware.js";
import { upload } from "../middleware/upload.js";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  update2FAPreference,
  verify2FAOtp,
} from "../controllers/user-profile.js"; // removed phone functions
import authMiddleware from "../middleware/auth-middleware.js";

const router = express.Router();

// Get user profile
router.get("/profile", authenticateUser, getUserProfile);

// Update user profile (name, avatar, phone number)
router.put(
  "/profile",
  authenticateUser,
  upload.single("profilePicture"),
  updateUserProfile
);

// Change password
router.put("/change-password", authenticateUser, changePassword);

// 2FA Routes
router.post("/2fa-preference", authenticateUser, update2FAPreference);

// Verify 2FA OTP sent to email
router.post("/verify-otp-2fa", authenticateUser, verify2FAOtp);

export default router;

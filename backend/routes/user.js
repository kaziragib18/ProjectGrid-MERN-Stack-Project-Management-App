import express from "express";
import authenticateUser from "../middleware/auth-middleware.js";
import { upload } from "../middleware/upload.js";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  update2FAPreference,
} from "../controllers/user-profile.js";

const router = express.Router();

// Get user profile
router.get("/profile", authenticateUser, getUserProfile);

// Update user profile (name, avatar)
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

export default router;

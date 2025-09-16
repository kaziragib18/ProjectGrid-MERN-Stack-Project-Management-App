import express from "express";
import authenticateUser from "../middleware/auth-middleware.js";
import { upload } from "../middleware/upload.js";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
} from "../controllers/user-profile.js";

const router = express.Router();

// Get user profile
router.get("/profile", authenticateUser, getUserProfile);

// Update user profile with optional profile picture
router.put(
  "/profile",
  authenticateUser,
  upload.single("profilePicture"),
  updateUserProfile
);

// Change password
router.put("/change-password", authenticateUser, changePassword);

export default router;

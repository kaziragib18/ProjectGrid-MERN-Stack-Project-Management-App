import User from "../models/user.js";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";

// ================================
// Get user profile
// ================================
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================================
// Update user profile (name + avatar)
// ================================
const updateUserProfile = async (req, res) => {
  try {
    const { name } = req.body;

    // Find user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update name
    user.name = name;

    // If a file was uploaded via multer
    if (req.file) {
      // Optionally delete previous avatar file if stored locally
      if (
        user.profilePicture &&
        fs.existsSync(path.join("uploads", user.profilePicture))
      ) {
        fs.unlinkSync(path.join("uploads", user.profilePicture));
      }

      // Save new profile picture path
      user.profilePicture = req.file.filename; // multer saves filename by default
    }

    await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================================
// Change user password
// ================================
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "New password and confirm password do not match" });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(403).json({ message: "Invalid old password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export { getUserProfile, updateUserProfile, changePassword };

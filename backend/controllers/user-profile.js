// backend/controllers/user-profile.js
import User from "../models/user.js";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { sendEmail } from "../libs/send-email.js";
import jwt from "jsonwebtoken";

/**
 * ================================
 * Get user profile
 * ================================
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.profilePicture && !user.profilePicture.startsWith("http")) {
      user.profilePicture = `${req.protocol}://${req.get("host")}/uploads/${
        user.profilePicture
      }`;
    }
    // prevent caching
    res.setHeader("Cache-Control", "no-store");

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ================================
 * Update user profile (name + avatar)
 * ================================
 */
const updateUserProfile = async (req, res) => {
  try {
    const { name } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;

    if (req.file) {
      if (
        user.profilePicture &&
        fs.existsSync(path.join("uploads", path.basename(user.profilePicture)))
      ) {
        fs.unlinkSync(path.join("uploads", path.basename(user.profilePicture)));
      }
      user.profilePicture = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
      }`;
    }

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ================================
 * Change user password
 * ================================
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    if (!user) return res.status(404).json({ message: "User not found" });
    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid)
      return res.status(403).json({ message: "Invalid old password" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * ================================
 * Toggle 2FA preference
 * ================================
 */
// backend/controllers/user-profile.js
// backend/controllers/user-profile.js
const update2FAPreference = async (req, res) => {
  try {
    const { enable2FA } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.is2FAEnabled = !!enable2FA;
    await user.save();

    res.status(200).json({
      message: `2FA ${enable2FA ? "enabled" : "disabled"} successfully`,
      is2FAEnabled: user.is2FAEnabled,
    });
  } catch (error) {
    console.error("Error updating 2FA preference:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ================================
 * Verify 2FA OTP (Email)
 * ================================
 */
const verify2FAOtp = async (req, res) => {
  try {
    const { otp, otpToken } = req.body;

    if (!otp || !otpToken) {
      return res.status(400).json({ message: "OTP and token are required" });
    }

    // Decode OTP token to get userId
    let decoded;
    try {
      decoded = jwt.verify(otpToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "Invalid OTP token" });
    }

    const user = await User.findById(decoded.userId).select(
      "+twoFAOtp +twoFAOtpExpires"
    );

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.twoFAOtp || !user.twoFAOtpExpires)
      return res.status(400).json({ message: "No OTP requested" });
    if (user.twoFAOtpExpires < new Date())
      return res.status(400).json({ message: "OTP expired" });
    if (otp !== user.twoFAOtp)
      return res.status(400).json({ message: "Invalid OTP" });

    // OTP valid — enable 2FA and clear temp OTP
    // OTP valid — enable 2FA and clear temp OTP
    user.is2FAEnabled = true;
    user.twoFAOtp = null;
    user.twoFAOtpExpires = null;
    await user.save();

    // Generate JWT for login
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // same as normal login
    );

    res.status(200).json({
      message: "Login successful with 2FA",
      token,
      user: {
        id: user._id,
        email: user.email,
        is2FAEnabled: user.is2FAEnabled,
      },
    });
  } catch (err) {
    console.error("Error verifying 2FA OTP:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export {
  getUserProfile,
  updateUserProfile,
  changePassword,
  update2FAPreference,
  verify2FAOtp,
};

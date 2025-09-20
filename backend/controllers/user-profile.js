// backend/controllers/user-profile.js
import User from "../models/user.js";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { sendEmail } from "../libs/send-email.js";

/**
 * ================================
 * Get user profile
 * ================================
 * - Returns user info without password
 * - If profilePicture is stored locally, prepends full URL
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    // Ensure profile picture has a valid public URL
    if (user.profilePicture && !user.profilePicture.startsWith("http")) {
      user.profilePicture = `${req.protocol}://${req.get("host")}/uploads/${
        user.profilePicture
      }`;
    }

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

    // Save profile picture if uploaded
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

// 2FA email template
const getTwoFAEmailTemplate = (code, name) => `
  <div style="font-family: Arial, sans-serif; background-color:#f9fafb; padding:30px;">
    <div style="max-width:600px; margin:auto; background:white; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1); padding:40px; text-align:center;">
      
      <h2 style="color:#0d9488; margin-bottom:12px;">ProjectGrid 2FA Code</h2>
      <p style="color:#4b5563; font-size:16px; margin-bottom:24px;">
        Hi <b>${name}</b>,<br>
        Use the following code for Two-Factor Authentication (2FA):
      </p>

      <!-- Code Card -->
      <div style="
          display:inline-block;
          background:#f1f3f5;
          padding:20px 30px;
          font-size:28px;
          font-weight:bold;
          letter-spacing:6px;
          border-radius:8px;
          margin-bottom:20px;
      ">
        ${code}
      </div>
      
      <p style="color:#6b7280; font-size:13px; margin-top:10px;">
        This code will expire in <b>2 minutes 30 seconds</b>. Do not share it with anyone.
      </p>

      <hr style="margin:30px 0; border:none; border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af; font-size:12px;">&copy; 2025 ProjectGrid. </p>
    </div>
  </div>
`;

/**
 * ================================
 * Toggle 2FA preference (Email OTP)
 * ================================
 */
const update2FAPreference = async (req, res) => {
  try {
    const { enable2FA } = req.body;
    const user = await User.findById(req.user._id).select(
      "+twoFAOtp +twoFAOtpExpires"
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    if (enable2FA) {
      // Generate OTP for email verification
      user.twoFAOtp = crypto.randomInt(100000, 999999).toString();
      user.twoFAOtpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      await user.save();

      await sendEmail(
        user.email,
        "Your 2FA Verification Code",
        getTwoFAEmailTemplate(user.twoFAOtp, user.name)
      );
      return res.status(200).json({ requiresOtp: true });
    } else {
      // Disable 2FA
      user.is2FAEnabled = false;
      await user.save();
      return res.status(200).json({ message: "2FA disabled successfully" });
    }
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
    const { otp } = req.body;
    const user = await User.findById(req.user._id).select(
      "+twoFAOtp +twoFAOtpExpires"
    );

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.twoFAOtp || !user.twoFAOtpExpires)
      return res.status(400).json({ message: "No OTP requested" });
    if (user.twoFAOtpExpires < new Date())
      return res.status(400).json({ message: "OTP expired" });
    if (otp !== user.twoFAOtp)
      return res.status(400).json({ message: "Invalid OTP" });

    user.is2FAEnabled = true;
    user.twoFAOtp = null;
    user.twoFAOtpExpires = null;

    await user.save();

    res.status(200).json({ message: "2FA enabled successfully" });
  } catch (err) {
    console.error(err);
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

import User from "../models/user.js";
import bcrypt from "bcrypt";
import { sendEmail } from "../libs/send-email.js";
import aj from "../libs/arcjet.js";
import Verification from "../models/verification.js";
import jwt from "jsonwebtoken";

// Email verification template
const getVerificationEmailTemplate = (verificationLink, name) => `
  <div style="font-family: Arial, sans-serif; background-color:#f9fafb; padding:30px;">
    <div style="max-width:600px; margin:auto; background:white; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1); padding:40px; text-align:center;">
      <h2 style="color:#0d9488; margin-bottom:12px;">Verify Your Email</h2>
      <p style="color:#4b5563; font-size:16px; margin-bottom:24px;">
        Hi <b>${name}</b>,<br>
        Thanks for joining ProjectGrid! Please confirm your email address to activate your account.
      </p>
      <a href="${verificationLink}" 
        style="display:inline-block; background:#0d9488; color:white; text-decoration:none; padding:14px 28px; border-radius:8px; font-weight:600;"
        onmouseover="this.style.background='#0f766e';"
        onmouseout="this.style.background='#0d9488';">
        Verify Email
      </a>
      <p style="color:#6b7280; font-size:13px; margin-top:20px;">
        If the button above doesn't work, copy and paste this link into your browser:<br>
        <span style="color:#0d9488;">${verificationLink}</span>
      </p>
      <hr style="margin:30px 0; border:none; border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af; font-size:12px;">This link will expire in 1 hour.</p>
    </div>
  </div>
`;

// Password reset template
const getResetPasswordEmailTemplate = (resetPasswordLink, name) => `
  <div style="font-family: Arial, sans-serif; background-color:#f9fafb; padding:30px;">
    <div style="max-width:600px; margin:auto; background:white; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1); padding:40px; text-align:center;">
      <h2 style="color:#0d9488; margin-bottom:12px;">Reset Your Password</h2>
      <p style="color:#4b5563; font-size:16px; margin-bottom:24px;">
        Hi <b>${name}</b>,<br>
        You requested to reset your password. Click below to set up a new one.
      </p>
      <a href="${resetPasswordLink}" 
        style="display:inline-block; background:#0d9488; color:white; text-decoration:none; padding:14px 28px; border-radius:8px; font-weight:600;"
        onmouseover="this.style.background='#0f766e';"
        onmouseout="this.style.background='#0d9488';">
        Reset Password
      </a>
      <p style="color:#6b7280; font-size:13px; margin-top:20px;">
        If the button above doesn't work, copy and paste this link into your browser:<br>
        <span style="color:#0d9488;">${resetPasswordLink}</span>
      </p>
      <hr style="margin:30px 0; border:none; border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af; font-size:12px;">This link will expire in 10 minutes. If you didn’t request this, please ignore this email.</p>
    </div>
  </div>
`;

// 2FA email template
const getTwoFAEmailTemplate = (otp, name) => `
  <div style="font-family: Arial, sans-serif; background-color:#f9fafb; padding:30px;">
    <div style="max-width:600px; margin:auto; background:white; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1); padding:40px; text-align:center;">
      <h2 style="color:#0d9488; margin-bottom:12px;">ProjectGrid 2FA Sign in OTP</h2>
      <p style="color:#4b5563; font-size:16px; margin-bottom:24px;">
        Hi <b>${name}</b>,<br>
        Use the following OTP for Two-Factor Authentication (2FA):
      </p>
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
        ${otp}
      </div>
      <p style="color:#6b7280; font-size:13px; margin-top:10px;">
        This code will expire in <b>2 minutes 30 seconds</b>. Do not share it with anyone.
      </p>
      <hr style="margin:30px 0; border:none; border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af; font-size:12px;">&copy; 2025 ProjectGrid. </p>
    </div>
  </div>
`;

// --- Register User ---
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const decision = await aj.protect(req, { email });
    if (decision.isDenied()) {
      return res.status(403).json({ message: "Invalid email address" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(400)
        .json({ message: "User already exists with this email" });

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      email,
      password: hashPassword,
      name,
      isEmailVerified: false,
    });

    const verificationToken = jwt.sign(
      {
        userId: newUser._id,
        email: newUser.email,
        purpose: "email-verification",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    await Verification.create({
      userId: newUser._id,
      token: verificationToken,
      expiresAt: new Date(Date.now() + 3600000),
    });

    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const emailBody = getVerificationEmailTemplate(verificationLink, name);
    const emailSubject = "Verify Your Email - ProjectGrid";

    const isEmailSent = await sendEmail(email, emailSubject, emailBody);
    if (!isEmailSent) {
      return res
        .status(500)
        .json({ message: "Failed to send verification email" });
    }

    return res.status(201).json({
      message:
        "A verification email has been sent. Please verify your email to complete registration.",
      user: { name, email },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

// --- Login User ---
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    if (!user.isEmailVerified) {
      const existingVerification = await Verification.findOne({
        userId: user._id,
      });
      if (existingVerification && existingVerification.expiresAt > new Date()) {
        return res.status(400).json({
          message:
            "Please verify your email before logging in. A verification email has already been sent.",
        });
      } else {
        if (existingVerification)
          await Verification.findByIdAndDelete(existingVerification._id);

        const verificationToken = jwt.sign(
          { userId: user._id, purpose: "email-verification" },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        await Verification.create({
          userId: user._id,
          token: verificationToken,
          expiresAt: new Date(Date.now() + 3600000),
        });

        const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
        const emailBody = getVerificationEmailTemplate(
          verificationLink,
          user.name
        );
        const emailSubject = "Verify Your Email - ProjectGrid";
        await sendEmail(email, emailSubject, emailBody);

        return res.status(201).json({
          message: "Verification email sent. Please check your inbox.",
        });
      }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ message: "Invalid email or password" });

    // --- 2FA check: only email OTP ---
    if (user.is2FAEnabled) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpToken = jwt.sign(
        { userId: user._id, purpose: "2fa-otp" },
        process.env.JWT_SECRET,
        { expiresIn: 150 } // 2 min 30 sec
      );

      user.twoFAOtp = otp;
      user.twoFAOtpExpires = new Date(Date.now() + 150 * 1000); // 150 seconds
      await user.save();

      const emailBody = getTwoFAEmailTemplate(otp, user.name);
      await sendEmail(user.email, "Your Login OTP - ProjectGrid", emailBody);

      return res.status(200).json({
        message: "2FA enabled. OTP sent to email.",
        requiresOtp: true,
        otpToken,
        userId: user._id,
      });
    }

    // --- Normal login ---
    const token = jwt.sign(
      { userId: user._id, purpose: "login" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    user.lastLogin = new Date();
    await user.save();

    const userData = user.toObject();
    delete userData.password;

    res
      .status(200)
      .json({ message: "Login successful", token, user: userData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// --- Verify OTP during login (2FA) ---
const verifyLoginOtp = async (req, res) => {
  try {
    const { otp, otpToken } = req.body;
    if (!otp || !otpToken)
      return res.status(400).json({ message: "OTP and token are required" });

    let payload;
    try {
      payload = jwt.verify(otpToken, process.env.JWT_SECRET);
      if (payload.purpose !== "2fa-otp")
        throw new Error("Invalid token purpose");
    } catch {
      return res.status(401).json({ message: "Invalid or expired OTP token" });
    }

    const user = await User.findById(payload.userId).select(
      "+twoFAOtp +twoFAOtpExpires"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.twoFAOtp || user.twoFAOtpExpires < new Date())
      return res.status(400).json({ message: "OTP expired or not requested" });
    if (otp !== user.twoFAOtp)
      return res.status(400).json({ message: "Invalid OTP" });

    user.twoFAOtp = null;
    user.twoFAOtpExpires = null;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, purpose: "login" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({
      message: "OTP verified. Login successful.",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Error verifying login OTP:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Verify Email ---
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token is required" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const { userId, purpose } = decoded;
    if (purpose !== "email-verification")
      return res.status(401).json({ message: "Invalid token purpose" });

    const verification = await Verification.findOne({ userId, token });
    if (!verification)
      return res
        .status(401)
        .json({ message: "Invalid or expired verification token" });
    if (verification.expiresAt < new Date())
      return res
        .status(401)
        .json({ message: "Verification token has expired" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isEmailVerified)
      return res.status(400).json({ message: "Email is already verified" });

    user.isEmailVerified = true;
    await user.save();
    await Verification.findByIdAndDelete(verification._id);

    res.status(200).json({
      message: "Email verified successfully",
      user: { name: user.name, email: user.email },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "internal server error", error: error.message });
  }
};

// --- Reset Password Request ---
const resetPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (!user.isEmailVerified)
      return res.status(400).json({
        message:
          "Email is not verified. Please verify your email before resetting the password.",
      });

    const existingVerification = await Verification.findOne({
      userId: user._id,
    });
    if (existingVerification && existingVerification.expiresAt > new Date())
      return res.status(400).json({
        message:
          "A password reset request is already in progress. Please check your email.",
      });
    if (existingVerification && existingVerification.expiresAt < new Date())
      await Verification.findByIdAndDelete(existingVerification._id);

    const resetPasswordToken = jwt.sign(
      { userId: user._id, purpose: "password-reset" },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    await Verification.create({
      userId: user._id,
      token: resetPasswordToken,
      expiresAt: new Date(Date.now() + 600000),
    });

    const resetPasswordLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetPasswordToken}`;
    const emailBody = getResetPasswordEmailTemplate(
      resetPasswordLink,
      user.name
    );
    const emailSubject = "Password Reset Request - ProjectGrid";

    const isEmailSent = await sendEmail(email, emailSubject, emailBody);
    if (!isEmailSent)
      return res
        .status(500)
        .json({ message: "Failed to send password reset email" });

    res
      .status(200)
      .json({ message: "A password reset link has been sent to your email." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// --- Verify and Reset Password ---
const verifyAndResetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload)
      return res.status(401).json({ message: "Unauthorized request" });

    const { userId, purpose } = payload;
    if (purpose !== "password-reset")
      return res.status(401).json({ message: "Invalid token purpose" });

    const verification = await Verification.findOne({ userId, token });
    if (!verification) return res.status(401).json({ message: "Unauthorized" });
    if (verification.expiresAt < new Date())
      return res
        .status(401)
        .json({ message: "Verification token has expired" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (newPassword !== confirmPassword)
      return res
        .status(400)
        .json({ message: "New password and confirm password do not match" });

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashPassword;
    await user.save();
    await Verification.findByIdAndDelete(verification._id);

    res.status(200).json({
      message: "Password reset successfully",
      user: { name: user.name, email: user.email },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export {
  loginUser,
  verifyLoginOtp,
  registerUser,
  verifyEmail,
  resetPasswordRequest,
  verifyAndResetPassword,
};

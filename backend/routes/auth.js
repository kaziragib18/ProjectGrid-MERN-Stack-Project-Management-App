import express from "express";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";
import {
  emailSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../libs/validate-schema.js";
import {
  loginUser,
  registerUser,
  resetPasswordRequest,
  verifyAndResetPassword,
  verifyEmail,
  verifyLoginOtp,
} from "../controllers/auth-controller.js";
import { verify2FAOtp } from "../controllers/user-profile.js"; // updated
import authMiddleware from "../middleware/auth-middleware.js";

const router = express.Router();

// Register user
router.post(
  "/register",
  validateRequest({ body: registerSchema }),
  registerUser
);

// Login
router.post("/login", validateRequest({ body: loginSchema }), loginUser);

// Verify OTP during login (2FA)
router.post("/verify-otp", verifyLoginOtp);

// Verify 2FA via email OTP
router.post("/verify-otp-2fa", authMiddleware, verify2FAOtp);

// Verify email
router.post(
  "/verify-email",
  validateRequest({ body: verifyEmailSchema }),
  verifyEmail
);

// Request password reset
router.post(
  "/reset-password-request",
  validateRequest({ body: emailSchema }),
  resetPasswordRequest
);

// Reset password
router.post(
  "/reset-password",
  validateRequest({ body: resetPasswordSchema }),
  verifyAndResetPassword
);

export default router;

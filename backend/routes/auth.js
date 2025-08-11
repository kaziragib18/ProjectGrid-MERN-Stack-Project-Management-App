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
} from "../controllers/auth-controller.js";

const router = express.Router();
// Import the authentication controller
router.post(
  "/register",
  validateRequest({
    // Validate the request body against the registerSchema
    body: registerSchema,
  }),
  // Call the registerUser function from the controller
  registerUser
);

router.post(
  "/login",
  validateRequest({
    // Validate the request body against the registerSchema
    body: loginSchema,
  }),
  // Call the registerUser function from the controller
  loginUser
);

router.post(
  "/verify-email",
  validateRequest({
    body: verifyEmailSchema,
  }),
  verifyEmail
);
// Endpoint for requesting a password reset
// This endpoint allows users to request a password reset by providing their email address
// It validates the email format and sends a reset link if the email is registered
router.post("/reset-password-request", validateRequest({
  body: emailSchema,
}), resetPasswordRequest);

// This endpoint allows users to reset their password by providing a new password and a token
// It validates the token and the new password, then updates the user's password in the database
router.post(
  "/reset-password",
  validateRequest({
    body: resetPasswordSchema,
  }),
  verifyAndResetPassword
);

export default router;

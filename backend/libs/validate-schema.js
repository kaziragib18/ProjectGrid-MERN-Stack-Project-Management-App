import z from "zod";

// Schema for validating user registration, login, and email verification
// Using Zod for schema validation
const registerSchema = z.object({
  name: z.string().min(3, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

// Schema for validating user login
// This schema ensures that the email is in a valid format and the password meets the minimum length requirement
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

// Schema for validating email verification
// This schema checks that the token is a non-empty string
// The token is used to verify the user's email address
const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

// Schema for validating password reset request
// This schema checks that the email is in a valid format
// It is used when a user requests a password reset link
const resetPasswordRequestSchema = z.object({
  email: z.string().email("Invalid email format"),
});

// Schema for validating password reset
// This schema checks that the token is a non-empty string and the new password meets the minimum length requirement
// It is used when a user resets their password after receiving a reset link
const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters long"),
  confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters long"),
});

const emailSchema = z.object({
  email: z.string().email("Invalid email format"),
});


export { loginSchema, registerSchema, verifyEmailSchema, resetPasswordSchema, emailSchema };

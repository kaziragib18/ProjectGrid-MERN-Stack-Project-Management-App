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

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export { loginSchema, registerSchema, verifyEmailSchema };

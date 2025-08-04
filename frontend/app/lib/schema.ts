import { z } from "zod";

// The SignInSchema is used to validate the sign-in form data.
export const SignInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password is required")
})

// It ensures that the name, email, password, and confirmPassword fields are valid.
export const SignUpSchema = z.object({
  name: z.string().min(3, "Name is required"), 
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z.string().min(8, "Confirm Password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  // This checks if the password and confirmPassword fields match. // If they don't match, it returns an error message.
  path: ["confirmPassword"],
  message: "Passwords do not match",
})
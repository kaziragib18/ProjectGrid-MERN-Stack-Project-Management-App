import { ProjectStatus } from "@/types";
import { z } from "zod";


// Auth Schemas
// The SignInSchema is used to validate the sign-in form data.
export const SignInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password is required"),
});


// The SignUpSchema validates new user registration.
export const SignUpSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be 8 characters"),
    name: z.string().min(3, "Name must be at least 3 characters"),
    confirmPassword: z.string().min(8, "Password must be 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

// The resetPasswordSchema is used when a user resets their password.
// Both newPassword and confirmPassword are required
export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be 8 characters"),
    confirmPassword: z.string().min(8, "Password must be 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

  
// The forgotPasswordSchema validates the email input for forgot password form
export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Workspace Schema
// Validates a workspace entity
export const workspaceSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  color: z.string().min(3, "Color must be at least 3 characters"),
  description: z.string().optional(),
});

// Project Schema
// Validates a project entity
// - Status must be one of the ProjectStatus enum values
// - startDate and dueDate must be valid dates (converted to JS Date objects)
// - dueDate must not be earlier than startDate
export const projectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  status: z.nativeEnum(ProjectStatus),
  startDate: z.string().min(10, "Start date is required"),
  dueDate: z.string().min(10, "Due date is required"),
  members: z
    .array(
      z.object({
        user: z.string(),
        role: z.enum(["manager", "contributor", "viewer"]),
      })
    )
    .optional(),
  tags: z.string().optional(),
});

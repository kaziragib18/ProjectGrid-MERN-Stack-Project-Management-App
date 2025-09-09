import { z } from "zod";

// Schema for validating user registration, login, and email verification
// Using Zod for schema validation
const email = z.string().email("Invalid email format");

const registerSchema = z.object({
  name: z.string().min(3, "Name is required"),
  email,
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

// Schema for validating user login
// This schema ensures that the email is in a valid format and the password meets the minimum length requirement
const loginSchema = z.object({
  email,
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
  email,
});

// Schema for validating password reset
// This schema checks that the token is a non-empty string and the new password meets the minimum length requirement
// It is used when a user resets their password after receiving a reset link
const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters long"),
    confirmPassword: z
      .string()
      .min(8, "Confirm password must be at least 8 characters long"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const emailSchema = z.object({
  email,
});

// Schema for validating workspace creation
const workspaceSchema = z.object({
  name: z.string().min(3, "Workspace name is required"),
  color: z
    .string()
    .min(3, "Color is required")
    // Optional: validate color hex code format, e.g. #RRGGBB
    .regex(/^#([0-9A-Fa-f]{3}){1,2}$/, "Color must be a valid hex code"),
  description: z
    .string()
    .optional()
    .refine((desc) => desc === undefined || desc.trim().length > 0, {
      message: "Description cannot be empty",
    }),
});

// Schema for updating workspace
const updateWorkspaceSchema = z.object({
  name: z
    .string()
    .min(3, "Workspace name must be at least 3 characters")
    .optional(),
  color: z
    .string()
    .regex(/^#([0-9A-Fa-f]{3}){1,2}$/, "Color must be a valid hex code")
    .optional(),
  description: z
    .string()
    .optional()
    .refine((desc) => desc === undefined || desc.trim().length > 0, {
      message: "Description cannot be empty",
    }),
});

const projectSchema = z
  .object({
    title: z.string().min(3, "Title is required"),
    description: z.string().optional(),
    status: z.enum([
      "Backlog", // Task is logged but not started
      "To Do", // Task is ready to start
      "In Progress", // Task is currently being worked on
      "In Review", // Task is completed and under review
      "On Hold", // Task is paused temporarily
      "Completed", // Task is finished successfully
      "Cancelled", // Task will not be completed
      "Archived", // Task is finished and stored for reference
    ]),
    startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid start date",
    }),
    dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid due date",
    }),
    members: z
      .array(
        z.object({
          user: z.string(),
          role: z.enum(["manager", "contributor", "viewer"]),
        })
      )
      .optional(),
  })
  .refine((data) => new Date(data.dueDate) >= new Date(data.startDate), {
    message: "Due date must be on or after start date",
    path: ["dueDate"],
  });

const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  status: z.enum(["To Do", "In Progress", "Completed"]),
  priority: z.enum(["Low", "Medium", "High"]),
  dueDate: z.string().min(1, "Due date is required"),
  assignees: z.array(z.string()).min(1, "At least one assignee is required"),
});

export {
  loginSchema,
  registerSchema,
  verifyEmailSchema,
  resetPasswordSchema,
  resetPasswordRequestSchema,
  emailSchema,
  workspaceSchema,
  projectSchema,
  taskSchema,
  updateWorkspaceSchema,
};

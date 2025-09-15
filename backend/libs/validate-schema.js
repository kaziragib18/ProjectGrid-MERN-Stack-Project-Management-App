import { z } from "zod";

// ================================
// Schema for validating user registration, login, and email verification
// Using Zod for schema validation
// ================================
const email = z.string().email("Invalid email format");

const registerSchema = z.object({
  name: z.string().min(3, "Name is required"),
  email,
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

// ================================
// Schema for validating user login
// This schema ensures that the email is in a valid format and the password meets the minimum length requirement
// ================================
const loginSchema = z.object({
  email,
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

// ================================
// Schema for validating email verification
// This schema checks that the token is a non-empty string
// ================================
const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

// ================================
// Schema for validating password reset request
// ================================
const resetPasswordRequestSchema = z.object({
  email,
});

// ================================
// Schema for validating password reset
// ================================
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

// ================================
// Schema for validating workspace invite via email
// ================================
const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "member", "viewer"]),
});

const tokenSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

// ================================
// Schema for validating workspace creation
// ================================
const workspaceSchema = z.object({
  name: z.string().min(3, "Workspace name is required"),
  color: z
    .string()
    .min(3, "Color is required")
    .regex(/^#([0-9A-Fa-f]{3}){1,2}$/, "Color must be a valid hex code"),
  description: z
    .string()
    .optional()
    .refine((desc) => desc === undefined || desc.trim().length > 0, {
      message: "Description cannot be empty",
    }),
});

// ================================
// Schema for updating workspace
// ================================
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

// ================================
// Project schema
// ================================
const projectSchema = z
  .object({
    title: z.string().min(3, "Title is required"),
    description: z.string().optional(),
    status: z.enum([
      "Backlog",
      "To Do",
      "In Progress",
      "In Review",
      "On Hold",
      "Completed",
      "Cancelled",
      "Archived",
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

// ================================
// Partial schema for project updates
// ================================
const updateProjectSchema = z
  .object({
    title: z.string().min(3, "Title is required").optional(),
    description: z.string().optional(),
    status: z
      .enum([
        "Backlog",
        "To Do",
        "In Progress",
        "In Review",
        "On Hold",
        "Completed",
        "Cancelled",
        "Archived",
      ])
      .optional(),
    startDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid start date",
      })
      .optional(),
    dueDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid due date",
      })
      .optional(),
    members: z
      .array(
        z.object({
          user: z.string(),
          role: z.enum(["manager", "contributor", "viewer"]),
        })
      )
      .optional(),
  })
  .refine(
    (data) =>
      !data.startDate ||
      !data.dueDate ||
      new Date(data.dueDate) >= new Date(data.startDate),
    {
      message: "Due date must be on or after start date",
      path: ["dueDate"],
    }
  );

// ================================
// Task schema
// ================================
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
  updateProjectSchema,
  taskSchema,
  updateWorkspaceSchema,
  inviteMemberSchema,
  tokenSchema,
};

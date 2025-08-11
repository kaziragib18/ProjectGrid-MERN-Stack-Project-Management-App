import { z } from "zod";

// The SignInSchema is used to validate the sign-in form data.
export const SignInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password is required"),
});

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

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be 8 characters"),
    confirmPassword: z.string().min(8, "Password must be 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
  
export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

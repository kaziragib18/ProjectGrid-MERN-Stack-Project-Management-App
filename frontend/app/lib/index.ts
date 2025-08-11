// This file contains the public routes of the application
// These routes are accessible without authentication
// They are used to define which routes do not require the user to be logged in
export const publicRoutes = [
  "/",
  "/sign-in",
  "/sign-up",
  "/verify-email",
  "/reset-password",
  "/forgot-password",
  "*",
];
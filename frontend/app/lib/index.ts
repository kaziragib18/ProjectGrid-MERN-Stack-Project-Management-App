// This file contains the public routes of the application
// These routes are accessible without authentication

import type { ProjectStatus, TaskStatus } from "@/types";

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

// --------------------
// Project Status Colors
// --------------------
export const getProjectStatusColor = (status: ProjectStatus) => {
  switch (status) {
    case "Backlog":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    case "To Do":
      return "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300";
    case "In Progress":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "In Review":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300";
    case "On Hold":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    case "Completed":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "Cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    case "Archived":
      return "bg-gray-200 text-gray-800 dark:bg-gray-700/30 dark:text-gray-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
};

// --------------------
// Task Status Colors
// --------------------
export const getTaskStatusColor = (status: TaskStatus) => {
  switch (status) {
    case "To Do":
      return "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300";
    case "In Progress":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "Completed":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
};

// --------------------
// Calculates the progress of a project based on its tasks.
// --------------------
export const getProjectProgress = (tasks: { status: TaskStatus }[]) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task?.status === "Completed").length;
  return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
};

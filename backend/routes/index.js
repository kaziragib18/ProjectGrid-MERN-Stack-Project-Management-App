import express from "express";
import authRoutes from "./auth.js";
import workspaceRoutes from "./workspace.js";
import projectRoutes from "./project.js";
import taskRoutes from "./task.js";
// This file serves as the main entry point for routing in the application.
const router = express.Router();

// Base route for authentication
router.use("/auth", authRoutes);

// Base route for workspace management
// This route handles all workspace-related operations such as creating, updating, and deleting workspaces
// It uses the workspaceRoutes defined in the workspace.js file
router.use("/workspaces", workspaceRoutes);

router.use("/projects", projectRoutes);

router.use("/tasks", taskRoutes);

export default router;

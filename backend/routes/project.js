import express from "express";
import authMiddleware from "../middleware/auth-middleware.js";
import { validateRequest } from "zod-express-middleware";
import { z } from "zod";

import {
  createProject,
  deleteProject,
  getProjectDetails,
  getProjectTasks,
  getWorkspaceProjects,
  updateProject,
} from "../controllers/project.js";

import { projectSchema, updateProjectSchema } from "../libs/validate-schema.js";

const router = express.Router(); // Create a new router instance

// ================================
// Create a new project under a specific workspace
// ================================
router.post(
  "/:workspaceId/create-project",
  authMiddleware,
  validateRequest({
    params: z.object({
      workspaceId: z.string(), // Validate workspaceId in URL
    }),
    body: projectSchema, // Validate request body against project schema
  }),
  createProject
);

// ================================
// Fetch details of a specific project
// ================================
router.get(
  "/:projectId",
  authMiddleware,
  validateRequest({
    params: z.object({ projectId: z.string() }), // Validate projectId
  }),
  getProjectDetails
);

// ================================
// Get all tasks for a specific project
// ================================
router.get(
  "/:projectId/tasks",
  authMiddleware,
  validateRequest({
    params: z.object({ projectId: z.string() }), // Validate projectId
  }),
  getProjectTasks
);

// ================================
// Project update route
// ================================
router.put(
  "/:projectId",
  authMiddleware,
  validateRequest({
    params: z.object({ projectId: z.string() }), // Validate projectId
    body: updateProjectSchema, // Validate request body for partial updates
  }),
  updateProject
);

// ================================
// Project delete route
// ================================
router.delete(
  "/:projectId",
  authMiddleware,
  validateRequest({
    params: z.object({ projectId: z.string() }), // Validate projectId
  }),
  deleteProject
);

// ================================
// Get all projects in a workspace
// ================================
router.get(
  "/:workspaceId/projects",
  authMiddleware,
  validateRequest({
    params: z.object({ workspaceId: z.string() }),
  }),
  getWorkspaceProjects
);

export default router;

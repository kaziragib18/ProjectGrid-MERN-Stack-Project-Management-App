import express from "express";
import authMiddleware from "../middleware/auth-middleware.js";
import { validateRequest } from "zod-express-middleware";
import { projectSchema } from "../libs/validate-schema.js";
import { z } from "zod";

import {
  createProject,
  getProjectDetails,
  getProjectTasks,
} from "../controllers/project.js";

const router = express.Router(); // Create a new router instance

//  Create a new project under a specific workspace
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

//  Fetch details of a specific project
router.get(
  "/:projectId",
  authMiddleware,
  validateRequest({
    params: z.object({ projectId: z.string() }), // Validate projectId
  }),
  getProjectDetails
);

// Get all tasks for a specific project

router.get(
  "/:projectId/tasks",
  authMiddleware,
  validateRequest({
    params: z.object({ projectId: z.string() }), // Validate projectId
  }),
  getProjectTasks
);

export default router;

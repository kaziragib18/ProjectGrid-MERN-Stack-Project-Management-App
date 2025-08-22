import express from "express";
import authMiddleware from "../middleware/auth-middleware.js";
import { validateRequest } from "zod-express-middleware";
import { projectSchema } from "../libs/validate-schema.js";
import { z } from "zod";
import { createProject } from "../controllers/project.js";

const router = express.Router();

/*
Create a new project inside a workspace
 * Validates:
  - params: { workspaceId: string }
  - body: must match projectSchema
 */
router.post(
  "/:workspaceId/create-project",
  authMiddleware,
  validateRequest({
    params: z.object({
      workspaceId: z.string(),
    }),
    body: projectSchema,
  }),
  createProject
);

export default router;

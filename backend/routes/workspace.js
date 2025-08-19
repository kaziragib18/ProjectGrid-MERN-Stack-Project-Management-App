import express from "express";
import { validateRequest } from "zod-express-middleware";
import authMiddleware from "../middleware/auth-middleware.js";
import {
  createWorkspace,
  getWorkspaceDetails,
  getWorkspaceProjects,
  getWorkspaces,
} from "../controllers/workspace.js";
import { workspaceSchema } from "../libs/validate-schema.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  validateRequest({ body: workspaceSchema }),
  createWorkspace
);
// Route to get all workspaces
router.get("/", authMiddleware, getWorkspaces);
// Route to get a single workspace
router.get("/:workspaceId", authMiddleware, getWorkspaceDetails);
// Route to create a project
router.get("/:workspaceId/projects", authMiddleware, getWorkspaceProjects);

export default router;

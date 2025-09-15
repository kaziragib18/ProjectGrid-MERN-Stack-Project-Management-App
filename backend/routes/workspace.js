import express from "express";
import { validateRequest } from "zod-express-middleware";
import authMiddleware from "../middleware/auth-middleware.js";
import {
  acceptGenerateInvite,
  acceptInviteByToken,
  createWorkspace,
  deleteWorkspace,
  getWorkspaceDetails,
  getWorkspaceProjects,
  getWorkspaces,
  getWorkspaceStats,
  inviteUserToWorkspace,
  removeWorkspaceMember,
  transferWorkspaceOwnership,
  updateWorkspace,
} from "../controllers/workspace.js";
import {
  inviteMemberSchema,
  tokenSchema,
  updateWorkspaceSchema,
  workspaceSchema,
} from "../libs/validate-schema.js";
import z from "zod";

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

// Route to get worksapce stats
router.get("/:workspaceId/stats", authMiddleware, getWorkspaceStats);

// Route to update a workspace
router.put(
  "/:workspaceId",
  authMiddleware,
  validateRequest({ body: updateWorkspaceSchema }),
  updateWorkspace
);

// Remove a member from workspace (owner only)
router.delete(
  "/:workspaceId/members/:memberId",
  authMiddleware,
  removeWorkspaceMember
);

// Transfer ownership of the workspace (owner only)
router.post(
  "/:workspaceId/transfer-ownership/:memberId",
  authMiddleware,
  transferWorkspaceOwnership
);

//delete workspace and all related projects + tasks
router.delete("/:workspaceId", authMiddleware, deleteWorkspace);

//route for invite
router.post(
  "/accept-invite-token",
  authMiddleware,
  validateRequest({ body: tokenSchema }),
  acceptInviteByToken
);

router.post(
  "/:workspaceId/invite-member",
  authMiddleware,
  validateRequest({
    params: z.object({ workspaceId: z.string() }),
    body: inviteMemberSchema,
  }),
  inviteUserToWorkspace
);

router.post(
  "/:workspaceId/accept-generate-invite",
  authMiddleware,
  validateRequest({ params: z.object({ workspaceId: z.string() }) }),
  acceptGenerateInvite
);

export default router;

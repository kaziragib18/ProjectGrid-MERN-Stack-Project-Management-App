import express from "express";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";

import { taskSchema } from "../libs/validate-schema.js";

import {
  createTask,
  getTaskById,
  updateTaskAssignees,
  updateTaskDescription,
  updateTaskPriority,
  updateTaskStatus,
  updateTaskTitle,
} from "../controllers/task.js";

import authMiddleware from "../middleware/auth-middleware.js";

const router = express.Router();

// ================================
//  Create a new task in a project
// ================================
router.post(
  "/:projectId/create-task",
  authMiddleware, // Ensure user is logged in
  validateRequest({
    params: z.object({
      projectId: z.string(), // Validate that projectId is a string
    }),
    body: taskSchema, // Validate request body using the custom task schema
  }),
  createTask // Call controller to handle creation
);

// ================================
// Update a task's title
// ================================
router.put(
  "/:taskId/title",
  authMiddleware,
  validateRequest({
    params: z.object({
      taskId: z.string(),
    }),
    body: z.object({
      title: z.string(),
    }),
  }),
  updateTaskTitle
);
// ================================
// Update a task's description
// ================================

router.put(
  "/:taskId/description",
  authMiddleware,
  validateRequest({
    params: z.object({
      taskId: z.string(),
    }),
    body: z.object({
      description: z.string(),
    }),
  }),
  updateTaskDescription
);

// ================================
// Update a task's status
// ================================

router.put(
  "/:taskId/status",
  authMiddleware,
  validateRequest({
    params: z.object({
      taskId: z.string(),
    }),
    body: z.object({
      status: z.string(),
    }),
  }),
  updateTaskStatus
);

// ================================
// Update a task's assignees
// ================================

router.put(
  "/:taskId/assignees",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
    body: z.object({ assignees: z.array(z.string()) }),
  }),
  updateTaskAssignees
);

// ================================
// Update a task's proirity
// =

router.put(
  "/:taskId/priority",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
    body: z.object({ priority: z.string() }),
  }),
  updateTaskPriority
);

// ================================
// Get task by ID
// ================================
router.get(
  "/:taskId/",
  authMiddleware,
  validateRequest({
    params: z.object({
      taskId: z.string(), // Validate taskId
    }),
  }),
  getTaskById // Controller returns the task and project info
);

export default router;

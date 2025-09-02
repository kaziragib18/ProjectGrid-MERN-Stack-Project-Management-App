import express from "express";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";

import { taskSchema } from "../libs/validate-schema.js";

import {
  addComment,
  addSubTask,
  archivedTask,
  createTask,
  deleteTaskComment,
  getActivityByResourceId,
  getCommentsByTaskId,
  getTaskById,
  updateSubTask,
  updateTaskAssignees,
  updateTaskComment,
  updateTaskDescription,
  updateTaskPriority,
  updateTaskStatus,
  updateTaskTitle,
  watchTask,
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
//  Create a new sub task in a project
// ================================
router.post(
  "/:taskId/add-subtask",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
    body: z.object({ title: z.string() }),
  }),
  addSubTask
);

// ================================
//  Create a new comment in a task
// ================================
router.post(
  "/:taskId/add-comment",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
    body: z.object({ text: z.string() }),
  }),
  addComment
);

// ================================
//  Create comment reactions
// ================================
// router.post(
//   "/:taskId/add-reactions",
//   authMiddleware,
//   validateRequest({
//     params: z.object({ taskId: z.string() }),
//     body: z.object({ text: z.string() }),
//   }),
//   commentReaction
// );

// ================================
//  Create watcher
// ================================
router.post(
  "/:taskId/watch",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
  }),
  watchTask
);

// ================================
//  Create archieve
// ================================
router.post(
  "/:taskId/archived",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
  }),
  archivedTask
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
// ================================

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

// ================================
// Update sub task
// ================================
router.put(
  "/:taskId/update-subtask/:subTaskId",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string(), subTaskId: z.string() }),
    body: z.object({ completed: z.boolean() }),
  }),
  updateSubTask
);

// ================================
// Get activity by resource Id
// ================================
router.get(
  "/:resourceId/activity",
  authMiddleware,
  validateRequest({
    params: z.object({ resourceId: z.string() }),
  }),
  getActivityByResourceId
);

// ================================
// Get commnets by tassk Id
// ================================

router.get(
  "/:taskId/comments",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
  }),
  getCommentsByTaskId
);

// ================================
// Update a specific comment by ID
// ================================
router.put(
  "/:taskId/comments/:commentId",
  authMiddleware,
  validateRequest({
    params: z.object({
      taskId: z.string(),
      commentId: z.string(),
    }),
    body: z.object({
      text: z.string().min(1),
      mentions: z
        .array(
          z.object({
            user: z.string(),
            offset: z.number(),
            length: z.number(),
          })
        )
        .optional(),
      attachments: z
        .array(
          z.object({
            fileName: z.string(),
            fileUrl: z.string().url(),
            fileType: z.string(),
            fileSize: z.number(),
          })
        )
        .optional(),
    }),
  }),
  updateTaskComment
);

// ================================
// Delete a specific comment by ID
// ================================

router.delete(
  "/:taskId/comments/:commentId",
  authMiddleware,
  validateRequest({
    params: z.object({
      taskId: z.string(),
      commentId: z.string(),
    }),
  }),
  deleteTaskComment
);

export default router;

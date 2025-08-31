import { recordActivity } from "../libs/index.js";
import Project from "../models/project.js";
import Task from "../models/task.js";
import Workspace from "../models/workspace.js";

// ==================================================
// Create a New Task
// ==================================================
const createTask = async (req, res) => {
  try {
    // Extract project ID from route parameter
    const { projectId } = req.params;

    // Extract task details from request body
    const { title, description, status, priority, dueDate, assignees } =
      req.body;

    // Step 1: Find the project using its ID
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Step 2: Get the workspace the project belongs to
    const workspace = await Workspace.findById(project.workspace);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Step 3: Check if the logged-in user is a member of the workspace
    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this workspace" });
    }

    // Step 4: Create a new task document in the database
    const newTask = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      assignees,
      project: projectId,
      createdBy: req.user._id,
    });

    // Step 5: Add the task ID to the project's task list
    project.tasks.push(newTask._id);
    await project.save();

    // Step 6: Record the activity in the activity log
    await recordActivity(req.user._id, "created_task", "Task", newTask._id, {
      description: `Created task "${title}"`,
    });

    // Step 7: Send the created task as the response
    res.status(201).json(newTask);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ==================================================
// Get Task by ID
// ==================================================
const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Step 1: Find task and populate assignee and watcher user info
    const task = await Task.findById(taskId)
      .populate("assignees", "name profilePicture")
      .populate("watchers", "name profilePicture");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Step 2: Find the project related to the task and include member info
    const project = await Project.findById(task.project).populate(
      "members.user",
      "name profilePicture"
    );

    // Step 3: Send the task and project as the response
    res.status(200).json({ task, project });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ==================================================
// Update Task Title
// ==================================================
const updateTaskTitle = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title } = req.body;

    // Step 1: Find the task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Step 2: Get the related project
    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Step 3: Ensure user is part of the project
    const isMember = project.members.some(
      (member) => member.user._id.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this project" });
    }

    // Step 4: Save old title for activity logging
    const oldTitle = task.title;

    // Step 5: Update title and save task
    task.title = title;
    await task.save();

    // Step 6: Record the title change in the activity log
    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `Updated task title from "${oldTitle}" to "${title}"`,
    });

    // Step 7: Return the updated task
    return res.status(200).json(task);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ==================================================
// Update Task Description
// ==================================================
const updateTaskDescription = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { description } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isMember = project.members.some(
      (member) => member.user._id.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this project" });
    }

    // Store trimmed old and new descriptions for logging
    const oldDescription = task.description?.substring(0, 50) || "(empty)";
    const newDescription = description?.substring(0, 50) || "(empty)";

    // Update description and save
    task.description = description;
    await task.save();

    //Log the description change
    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `Updated task description from "${oldDescription}" to "${newDescription}"`,
    });

    return res.status(200).json(task);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ==================================================
// Update Task Status
// ==================================================
const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const oldStatus = task.status;

    task.status = status;
    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `Updated task status from ${oldStatus} to ${status}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// ==================================================
// Update Task Assinees
// ==================================================

const updateTaskAssignees = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { assignees } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const oldAssignees = task.assignees;

    task.assignees = assignees;
    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `updated task assignees from ${oldAssignees.length} to ${assignees.length}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// ==================================================
// Update Task Priority
// ==================================================

const updateTaskPriority = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { priority } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const oldPriority = task.priority;

    task.priority = priority;
    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `updated task priority from ${oldPriority} to ${priority}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export {
  createTask,
  getTaskById,
  updateTaskTitle,
  updateTaskDescription,
  updateTaskStatus,
  updateTaskAssignees,
  updateTaskPriority,
};

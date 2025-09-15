import Workspace from "../models/workspace.js";
import Project from "../models/project.js";
import Task from "../models/task.js";

// ================================
// Create a new project inside a workspace
// ================================
const createProject = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { title, description, status, startDate, dueDate, members } =
      req.body;

    // Find the workspace by its ID
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Ensure the requesting user is a member of the workspace
    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this workspace" });
    }

    // Create the new project
    const newProject = await Project.create({
      title,
      description,
      status,
      startDate: new Date(startDate),
      dueDate: new Date(dueDate),
      workspace: workspaceId,
      members,
      createdBy: req.user._id,
    });

    // Add the project to the workspace's projects array
    workspace.projects.push(newProject._id);
    await workspace.save();

    return res.status(201).json(newProject);
  } catch (error) {
    console.error("Error creating project:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ================================
// Get project details by projectId
// ================================
const getProjectDetails = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Find the project and populate workspace + members
    const project = await Project.findById(projectId)
      .populate("members.user", "name profilePicture email")
      .populate("workspace", "members"); // include workspace for member check

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Ensure the requesting user is a member of the workspace
    const workspace = await Workspace.findById(project.workspace._id);
    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this workspace" });
    }

    return res.status(200).json(project);
  } catch (error) {
    console.error("Error fetching project details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ================================
// Get all active (non-archived) tasks in a project
// ================================
const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Find the project
    const project = await Project.findById(projectId).populate(
      "workspace",
      "members"
    );
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Ensure the requesting user is a member of the workspace
    const workspace = await Workspace.findById(project.workspace._id);
    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this workspace" });
    }

    // Fetch tasks associated with this project (non-archived)
    const tasks = await Task.find({ project: projectId, isArchived: false })
      .populate("assignees", "name profilePicture email")
      .populate("createdBy", "name profilePicture email")
      .populate("watchers", "name profilePicture email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ project, tasks });
  } catch (error) {
    console.error("Error fetching project tasks:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { createProject, getProjectDetails, getProjectTasks };

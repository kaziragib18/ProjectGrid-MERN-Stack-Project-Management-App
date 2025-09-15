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

// ================================
// Update project
// ================================
const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, status } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Only workspace members should update
    const workspace = await Workspace.findById(project.workspace);
    const isMember = workspace.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!isMember) return res.status(403).json({ message: "Not authorized" });

    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (status !== undefined) project.status = status;

    await project.save();
    res.status(200).json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================================
// Delete project
// ================================
const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const workspace = await Workspace.findById(project.workspace);
    if (!workspace)
      return res.status(404).json({ message: "Workspace not found" });

    // Only owner/admin allowed
    const member = workspace.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!member || !["owner", "admin"].includes(member.role)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Remove from workspace projects
    workspace.projects = workspace.projects.filter(
      (id) => id.toString() !== projectId
    );
    await workspace.save();

    await Project.findByIdAndDelete(projectId);

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================================
// Get all projects in a workspace
// ================================
const getWorkspaceProjects = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId).populate({
      path: "projects",
      populate: { path: "members.user", select: "name email profilePicture" },
    });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Only members can view projects
    const isMember = workspace.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member" });
    }

    if (!workspace.projects.length) {
      return res
        .status(200)
        .json({
          projects: [],
          message: "No projects created in this workspace",
        });
    }

    return res.status(200).json({ projects: workspace.projects });
  } catch (error) {
    console.error("Error fetching workspace projects:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export {
  createProject,
  getProjectDetails,
  getProjectTasks,
  updateProject,
  deleteProject,
  getWorkspaceProjects,
};

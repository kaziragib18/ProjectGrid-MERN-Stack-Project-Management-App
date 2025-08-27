import Workspace from "../models/workspace.js";
import Project from "../models/project.js";
import Task from "../models/task.js";

// Creates a new project inside a given workspace.
const createProject = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { title, description, status, startDate, dueDate, members } =
      req.body;

    // Find the workspace by its ID
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    // Check if the current user is a member of the workspace
    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    // Create a new project and convert dates from string to Date objects
    const newProject = await Project.create({
      title, // Use title instead of name
      description,
      status,
      startDate: new Date(startDate),
      dueDate: new Date(dueDate),
      workspace: workspaceId, // Associate project with workspace
      members, // Array of project members
      createdBy: req.user._id, // Set the creator of the project
    });

    // Add the newly created project to the workspace's projects list
    workspace.projects.push(newProject._id);
    await workspace.save(); // Persist the update to the workspace document

    return res.status(201).json(newProject);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

//Fetches project details by projectId.
const getProjectDetails = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Find the project by ID
    const project = await Project.findById(projectId).populate(
      "members.user",
      "name profilePicture email"
    );

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Check if the requesting user is a member of the project
    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    res.status(200).json(project);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

//Retrieves all active (non-archived) tasks in a project.
const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Find the project and populate member user info
    const project = await Project.findById(projectId).populate("members.user");

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Check if the requesting user is a member of the project
    const isMember = project.members.some(
      (member) => member.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    // Query tasks associated with this project, excluding archived ones
    const tasks = await Task.find({
      project: projectId,
      isArchived: false,
    })
      .populate("assignees", "name profilePicture") // Populate basic assignee info
      .sort({ createdAt: -1 }); // Sort tasks by newest first

    // Respond with project and its tasks
    res.status(200).json({
      project,
      tasks,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Export controller functions
export { createProject, getProjectDetails, getProjectTasks };

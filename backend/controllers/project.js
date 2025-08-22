import Workspace from "../models/workspace.js";
import Project from "../models/project.js";

const createProject = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { title, description, status, startDate, dueDate, members } =
      req.body;

    // Find workspace by ID
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    // Check if user is a member of workspace
    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }
    // Create new project with proper tags array and date conversion
    const newProject = await Project.create({
      title, // not name
      description,
      status,
      startDate: new Date(startDate),
      dueDate: new Date(dueDate),
      workspace: workspaceId,
      members,
      createdBy: req.user._id,
    });

    // Add project reference to workspace and save
    workspace.projects.push(newProject._id);
    await workspace.save();

    return res.status(201).json(newProject);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export { createProject };

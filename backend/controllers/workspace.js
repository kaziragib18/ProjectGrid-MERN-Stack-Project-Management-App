// Importing Mongoose models
import Project from "../models/project.js";
import Workspace from "../models/workspace.js";

/**
 * CREATE WORKSPACE
 * - Creates a new workspace document
 * - Sets the owner as a member with role "owner"
 */
const createWorkspace = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    const workspace = await Workspace.create({
      name,
      description,
      color,
      owner: req.user._id, // assumes auth middleware has set req.user
      members: [
        {
          user: req.user._id,
          role: "owner",
          joinedAt: new Date(),
        },
      ],
    });

    res.status(201).json(workspace); // return created workspace
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET ALL WORKSPACES OF CURRENT USER
 * - Finds all workspaces where the current user is a member
 */
const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      "members.user": req.user._id,
    }).sort({ createAt: -1 }); // Newest first

    res.status(200).json(workspaces);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET A SINGLE WORKSPACE DETAILS
 * - Only if user is a member
 * - Populates member user details
 */
const getWorkspaceDetails = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      "members.user": req.user._id, // Must be a member
    }).populate("members.user", "name email profilePicture");

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    res.status(200).json(workspace);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET PROJECTS OF A WORKSPACE
 * - Only if user is a member
 * - Returns non-archived projects
 */
const getWorkspaceProjects = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      "members.user": req.user._id,
    }).populate("members.user", "name email profilePicture");

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const projects = await Project.find({
      workspace: workspaceId,
      isArchived: false, // Only active projects
    }).sort({ createAt: -1 });

    res.status(200).json({ projects, workspace });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET DASHBOARD STATS FOR A WORKSPACE
 * - Task trends, priority, project status, productivity, upcoming tasks
 */
const getWorkspaceStats = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this workspace" });
    }

    // Get projects and tasks in parallel
    const [totalProjects, projects] = await Promise.all([
      Project.countDocuments({ workspace: workspaceId }),
      Project.find({ workspace: workspaceId })
        .populate(
          "tasks",
          "title status dueDate project updatedAt isArchived priority"
        )
        .sort({ createdAt: -1 }),
    ]);

    // Aggregate task data
    const totalTasks = projects.reduce((sum, p) => sum + p.tasks.length, 0);
    const totalProjectInProgress = projects.filter(
      (p) => p.status === "In Progress"
    ).length;

    const totalTaskCompleted = projects.reduce(
      (sum, p) => sum + p.tasks.filter((t) => t.status === "Completed").length,
      0
    );

    const totalTaskToDo = projects.reduce(
      (sum, p) => sum + p.tasks.filter((t) => t.status === "To Do").length,
      0
    );

    const totalTaskInProgress = projects.reduce(
      (sum, p) =>
        sum + p.tasks.filter((t) => t.status === "In Progress").length,
      0
    );

    const tasks = projects.flatMap((p) => p.tasks);

    // UPCOMING TASKS in next 7 days
    const today = new Date();
    const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingTasks = tasks.filter((task) => {
      const due = new Date(task.dueDate);
      return due > today && due <= sevenDaysLater;
    });

    // TASK TRENDS (last 7 days)
    const taskTrendsData = [
      { name: "Sat", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Sun", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Mon", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Tue", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Wed", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Thu", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Fri", completed: 0, inProgress: 0, toDo: 0 },
    ];

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();

    // Process tasks for trend data
    for (const project of projects) {
      for (const task of project.tasks) {
        const taskDate = new Date(task.updatedAt);
        const index = last7Days.findIndex(
          (date) =>
            date.getDate() === taskDate.getDate() &&
            date.getMonth() === taskDate.getMonth() &&
            date.getFullYear() === taskDate.getFullYear()
        );

        if (index !== -1) {
          const dayName = last7Days[index].toLocaleDateString("en-US", {
            weekday: "short",
          });
          const dayData = taskTrendsData.find((day) => day.name === dayName);

          if (dayData) {
            switch (task.status) {
              case "Completed":
                dayData.completed++;
                break;
              case "In Progress":
                dayData.inProgress++;
                break;
              case "To Do":
                dayData.toDo++;
                break;
            }
          }
        }
      }
    }

    // PROJECT STATUS DISTRIBUTION
    const projectStatusData = [
      { name: "Completed", value: 0, color: "#10b981" },
      { name: "In Progress", value: 0, color: "#3b82f6" },
      { name: "Planning", value: 0, color: "#f59e0b" },
    ];
    for (const project of projects) {
      switch (project.status) {
        case "Completed":
          projectStatusData[0].value++;
          break;
        case "In Progress":
          projectStatusData[1].value++;
          break;
        case "Planning":
          projectStatusData[2].value++;
          break;
      }
    }

    // TASK PRIORITY DISTRIBUTION
    const taskPriorityData = [
      { name: "High", value: 0, color: "#ef4444" },
      { name: "Medium", value: 0, color: "#f59e0b" },
      { name: "Low", value: 0, color: "#6b7280" },
    ];
    for (const task of tasks) {
      switch (task.priority) {
        case "High":
          taskPriorityData[0].value++;
          break;
        case "Medium":
          taskPriorityData[1].value++;
          break;
        case "Low":
          taskPriorityData[2].value++;
          break;
      }
    }

    // WORKSPACE PRODUCTIVITY PER PROJECT
    const workspaceProductivityData = [];
    for (const project of projects) {
      const projectTasks = tasks.filter(
        (t) => t.project.toString() === project._id.toString()
      );
      const completed = projectTasks.filter(
        (t) => t.status === "Completed" && !t.isArchived
      );
      workspaceProductivityData.push({
        name: project.title,
        completed: completed.length,
        total: projectTasks.length,
      });
    }

    const stats = {
      totalProjects,
      totalTasks,
      totalProjectInProgress,
      totalTaskCompleted,
      totalTaskToDo,
      totalTaskInProgress,
    };

    res.status(200).json({
      stats,
      taskTrendsData,
      projectStatusData,
      taskPriorityData,
      workspaceProductivityData,
      upcomingTasks,
      recentProjects: projects.slice(0, 5),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * UPDATE WORKSPACE
 * - Updates workspace name, description, and color
 * - Only members with appropriate roles can update
 */
const updateWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { name, description, color } = req.body;

    // Find workspace where user is a member
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      "members.user": req.user._id,
    });

    if (!workspace) {
      return res
        .status(404)
        .json({ message: "Workspace not found or access denied" });
    }

    // Optionally check if user has admin or owner role to allow edit
    const member = workspace.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!member || (member.role !== "owner" && member.role !== "admin")) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    // Update fields if provided
    if (name !== undefined) workspace.name = name;
    if (description !== undefined) workspace.description = description;
    if (color !== undefined) workspace.color = color;

    await workspace.save();

    res.status(200).json(workspace);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {
  createWorkspace,
  getWorkspaces,
  getWorkspaceDetails,
  getWorkspaceProjects,
  getWorkspaceStats,
  updateWorkspace,
};

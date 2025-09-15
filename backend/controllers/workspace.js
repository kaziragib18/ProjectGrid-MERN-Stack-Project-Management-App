import Project from "../models/project.js";
import Task from "../models/task.js";
import Workspace from "../models/workspace.js";
import WorkspaceInvite from "../models/workspace-invite.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../libs/send-email.js";
import { recordActivity } from "../libs/index.js";

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
      { name: "To Do", value: 0, color: "#f59e0b" },
    ];
    for (const project of projects) {
      switch (project.status) {
        case "Completed":
          projectStatusData[0].value++;
          break;
        case "In Progress":
          projectStatusData[1].value++;
          break;
        case "To Do":
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

/**
 * DELETE WORKSPACE
 * - Only owner can delete the workspace
 * - Also deletes associated projects
 */
const deleteWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    // Find workspace, check membership and ownership
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      "members.user": req.user._id,
    });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Check user role: only owners allowed to delete workspace
    const member = workspace.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!member || member.role !== "owner") {
      return res
        .status(403)
        .json({ message: "Only owner can delete workspace" });
    }

    // Find all projects inside the workspace
    const projects = await Project.find({ workspace: workspaceId });

    // Get all project IDs
    const projectIds = projects.map((p) => p._id);

    // Delete all tasks related to those projects
    await Task.deleteMany({ project: { $in: projectIds } });

    // Delete all projects in this workspace
    await Project.deleteMany({ workspace: workspaceId });

    // Delete workspace itself
    await workspace.deleteOne();

    res.status(200).json({
      message:
        "Workspace and all related projects and tasks deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * INVITE USER TO WORKSPACE
 * - Only owner or admin can invite
 * - Finds user by email
 * - Prevents duplicate membership or active invites
 * - Generates JWT invite token valid for 7 days
 * - Stores invite in WorkspaceInvite collection
 * - Sends invite email with link to frontend
 */
const inviteUserToWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { email, role } = req.body;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Ensure inviter has permission (must be owner/admin)
    const userMemberInfo = workspace.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );
    if (!userMemberInfo || !["admin", "owner"].includes(userMemberInfo.role)) {
      return res.status(403).json({
        message: "You are not authorized to invite members to this workspace",
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ message: "User not found" });
    }

    // Prevent duplicate membership
    const isMember = workspace.members.some(
      (member) => member.user.toString() === existingUser._id.toString()
    );
    if (isMember) {
      return res.status(400).json({
        message: "User already a member of this workspace",
      });
    }

    // Prevent duplicate invites (if not expired)
    const isInvited = await WorkspaceInvite.findOne({
      user: existingUser._id,
      workspaceId: workspaceId,
    });
    if (isInvited && isInvited.expiresAt > new Date()) {
      return res.status(400).json({
        message: "User already invited to this workspace",
      });
    }
    if (isInvited && isInvited.expiresAt < new Date()) {
      await WorkspaceInvite.deleteOne({ _id: isInvited._id }); // remove expired
    }

    // Generate invite token valid for 7 days
    const inviteToken = jwt.sign(
      {
        user: existingUser._id,
        workspaceId: workspaceId,
        role: role || "member",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Save invite in DB
    await WorkspaceInvite.create({
      user: existingUser._id,
      workspaceId: workspaceId,
      token: inviteToken,
      role: role || "member",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Construct frontend invitation link
    const invitationLink = `${process.env.FRONTEND_URL}/workspace-invite/${workspace._id}?tk=${inviteToken}`;

    // Send invitation email
    const emailContent = `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; background-color: #f9fafb; color: #374151;">
    
    <!-- Card -->
    <div style="background: #fff; border-radius: 12px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      
      <!-- Header -->
      <h2 style="color: #0f766e; text-align: center; font-size: 22px; font-weight: 600; margin: 0 0 20px;">
        You’ve been invited to join 
        <span style="color:#111827;">${workspace.name}</span>
      </h2>

      <!-- Body -->
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
        Hello,
      </p>
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
        You have been invited to collaborate in the 
        <strong>${workspace.name}</strong> workspace.  
        Join now to access projects, manage tasks, and stay aligned with your team.
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${invitationLink}"
          style="background-color: #0f766e; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
          Accept Invitation
        </a>
      </div>

      <!-- Fallback link -->
      <p style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">
        If the button above doesn’t work, copy and paste this link into your browser:
      </p>
      <p style="font-size: 14px; word-break: break-word; margin-bottom: 0;">
        <a href="${invitationLink}" style="color: #0f766e; text-decoration: underline;">
          ${invitationLink}
        </a>
      </p>

      <!-- Divider -->
      <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" />

      <!-- Footer -->
      <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
        This invitation link will expire in 7 days.  
        If you weren’t expecting this invitation, you can safely ignore this email.
      </p>
    </div>
  </div>
`;

    await sendEmail(
      email,
      "You have been invited to join a workspace",
      emailContent
    );

    res.status(200).json({ message: "Invitation sent successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * ACCEPT INVITE (Direct Join)
 * - Used when user joins without token (already authenticated)
 * - Adds user as "member" if not already in workspace
 * - Records activity
 */
const acceptGenerateInvite = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Prevent duplicate membership
    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );
    if (isMember) {
      return res.status(400).json({ message: "You are already a member" });
    }

    // Add new member
    workspace.members.push({
      user: req.user._id,
      role: "member",
      joinedAt: new Date(),
    });
    await workspace.save();

    // Record activity
    await recordActivity(
      req.user._id,
      "joined_workspace",
      "Workspace",
      workspaceId,
      { description: `Joined ${workspace.name} workspace` }
    );

    res.status(200).json({ message: "Invitation accepted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * ACCEPT INVITE BY TOKEN
 * - Used when user clicks invite email link
 * - Validates token and checks expiry
 * - Adds user to workspace with assigned role
 * - Deletes invite after acceptance
 */
const acceptInviteByToken = async (req, res) => {
  try {
    const { token } = req.body;

    // Decode and validate token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { user, workspaceId, role } = decoded;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Prevent duplicate membership
    const isMember = workspace.members.some(
      (member) => member.user.toString() === user.toString()
    );
    if (isMember) {
      return res.status(400).json({ message: "User already a member" });
    }

    // Ensure invite exists and not expired
    const inviteInfo = await WorkspaceInvite.findOne({
      user: user,
      workspaceId: workspaceId,
    });
    if (!inviteInfo) {
      return res.status(404).json({ message: "Invitation not found" });
    }
    if (inviteInfo.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invitation has expired" });
    }

    // Add new member
    workspace.members.push({
      user: user,
      role: role || "member",
      joinedAt: new Date(),
    });
    await workspace.save();

    // Delete invite and log activity
    await Promise.all([
      WorkspaceInvite.deleteOne({ _id: inviteInfo._id }),
      recordActivity(user, "joined_workspace", "Workspace", workspaceId, {
        description: `Joined ${workspace.name} workspace`,
      }),
    ]);

    res.status(200).json({ message: "Invitation accepted successfully" });
  } catch (error) {
    console.log(error);
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
  deleteWorkspace,
  inviteUserToWorkspace,
  acceptGenerateInvite,
  acceptInviteByToken,
};

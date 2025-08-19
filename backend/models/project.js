import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
    required: true,
  },
  status: {
    type: String,
    enum: [
      "Backlog", // Task is logged but not started
      "To Do", // Task is ready to start
      "In Progress", // Task is currently being worked on
      "Review", // Task is completed and under review
      "Blocked", // Task cannot proceed due to dependency/issues
      "On Hold", // Task is paused temporarily
      "Cancelled", // Task will not be completed
      "Completed", // Task is finished successfully
      "Archived", // Task is finished and stored for reference
    ],
    default: "Backlog",
  },
  startDate: {
    type: Date,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
  ],
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    {
      role: {
        type: String,
        enum: ["manager", "contributor", "viewer"],
        default: "contributor",
      },
    },
  ],
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  tags: [
    {
      type: String,
      trim: true,
    },
  ],
  isArchived: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Project = mongoose.model("Project", projectSchema);

export default Project;

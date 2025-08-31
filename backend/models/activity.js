import mongoose, { Schema } from "mongoose";

// ==============================
// Activity Log Schema
// ==============================
const activityLogSchema = new Schema(
  {
    // Reference to the user who performed the action
    user: {
      type: Schema.Types.ObjectId,
      ref: "User", // Refers to the User model
      required: true,
    },

    // The type of action performed
    action: {
      type: String,
      required: true,
      enum: [
        "created_task",
        "updated_task",
        "created_subtask",
        "updated_subtask",
        "completed_task",
        "created_project",
        "updated_project",
        "completed_project",
        "created_workspace",
        "updated_workspace",
        "added_comment",
        "added_member",
        "removed_member",
        "joined_workspace",
        "transferred_workspace_ownership",
        "added_attachment",
      ], // Restricts actions to predefined valid values
    },

    // Type of resource the action was performed on
    resourceType: {
      type: String,
      required: true,
      enum: ["Task", "Project", "Workspace", "Comment", "User"],
    },

    // ID of the specific resource affected by the action
    resourceId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    // Additional details related to the action
    details: {
      type: Object, // Could include fields like previousValue, newValue, reason, etc.
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;

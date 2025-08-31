import ActivityLog from "../models/activity.js";

// Define an asynchronous function to record user activity in the database
const recordActivity = async (
  userId, // ID of the user performing the action
  action, // Type of action ("create", "delete", "update")
  resourceType, // Type of resource affected ("post", "comment")
  resourceId, // Unique identifier of the resource
  details // extra info or context about the action
) => {
  try {
    // Create a new document in the ActivityLog collection
    await ActivityLog.create({
      user: userId,
      action,
      resourceType,
      resourceId,
      details,
    });
  } catch (error) {
    console.log(error);
  }
};

export { recordActivity };

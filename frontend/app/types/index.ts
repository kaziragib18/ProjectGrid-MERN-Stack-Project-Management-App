 // This file defines TypeScript interfaces for the application types used in the frontend.

// Represents a user in the application
// It includes details such as user ID, email, name, creation date, email verification status, and an optional profile picture.
 export interface User {
  _id: string;
  email: string;
  name: string;
  createdAt: Date;
  isEmailVerified: boolean;
  updatedAt: Date;  
  profilePicture?: string; // Optional field for profile picture URL
}

// Represents a workspace in the application
// It includes details about the workspace such as its name, description, owner, color, members, and timestamps.
export interface Workspace {
  _id: string;
  name: string;
  description?: string;
  owner: User | string;
  color: string;
  members: {
    user: User;
    role: "owner" | "admin" | "member" | "viewer";
    joinedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export enum ProjectStatus {
  Backlog = "Backlog",       // Task is logged but not started
  ToDo = "To Do",            // Task is ready to start
  InProgress = "In Progress",// Task is currently being worked on
  Review = "Review",         // Task is completed and under review
  Blocked = "Blocked",       // Task cannot proceed due to dependency/issues
  OnHold = "On Hold",        // Task is paused temporarily
  Cancelled = "Cancelled",   // Task will not be completed
  Completed = "Completed",   // Task is finished successfully
  Archived = "Archived",     // Task is finished and stored for reference
}

export interface Project {
  _id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  workspace: Workspace;
  startDate: Date;
  dueDate: Date;
  tasks: Task[];
  members: {
    user: User;
    role: "owner" | "admin" | "member" | "viewer";
    joinedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;

}

export type TaskStatus = "To Do" | "In Progress" | "Done";
export type TaskPriority = "High" | "Medium" | "Low";
export enum ProjectMemberRole {
  MANAGER = "manager",
  CONTRIBUTOR = "contributor",
  VIEWER = "viewer",
}

export interface Subtask {
  _id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface Attachment {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: Date;
  _id: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  project: Project;
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
  dueDate: Date;
  priority: TaskPriority;
  assignee: User | string;
  createdBy: User | string;
  assignees: User[];
  subtasks?: Subtask[];
  watchers?: User[];
  attachments?: Attachment[];
}


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
  description: string;
  ower: User | string;
  color: string;
  members: {
    user: User;
    role: "owner" | "admin" | "member" | "viewer";
    joinedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

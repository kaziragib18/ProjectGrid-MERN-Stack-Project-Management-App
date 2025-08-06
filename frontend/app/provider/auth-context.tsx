import type { User } from "@/types"; // Importing User type from types module
import React, { createContext, useState, useContext } from "react";

// This context will be used to provide user authentication state throughout the application
interface AuthContextType {
  // The user object representing the authenticated user
  user: User | null;
  isAuthenticated: boolean; // Boolean indicating if the user is authenticated
  isLoading: boolean; // Boolean indicating if the authentication state is being loaded

  login: (email: string, password: string) => Promise<void>; // Function to log in the user
  logout: () => Promise<void>; // Function to log out the user
}

const AuthContext = createContext<AuthContextType | undefined>(undefined); // Creating the AuthContext with an initial value of undefined

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null); // State to hold the authenticated user
  const [isAuthenticated, setIsAuthenticated] = useState(false); // State to hold authentication status
  const [isLoading, setIsLoading] = useState(false); // State to indicate if authentication is in progress

  // Function to log in the user
  const login = async (email: string, password: string) => {
    console.log(email, password); // Log the email and password for debugging purposes
  };

  // Function to log out the user
  const logout = async () => {
    // Implement logout logic here
    console.log("logout");
    // For example, clear user state and update isAuthenticated state
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// This custom hook allows components to access the authentication context easily
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context; // Return the authentication context
};

import type { User } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";
import { queryClient } from "./react-query-provider";
import { useLocation, useNavigate } from "react-router";
import { publicRoutes } from "@/lib";

// This file provides the authentication context for the application
// It manages user authentication state, login, and logout functionality
// The context is used to provide authentication data and methods to components throughout the app
interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void; // <-- added setUser
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

// Create a context for authentication state
// This context will provide user information and authentication methods to the components
// that need access to the authentication state
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Use the useLocation hook to get the current path
  // and determine if the current route is a public route
  // This helps in redirecting users to the sign-in page if they are not authenticated
  const navigate = useNavigate();
  const currentPath = useLocation().pathname;
  const isPublicRoute = publicRoutes.includes(currentPath);

  // check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setIsAuthenticated(true);
          } catch (err) {
            console.error("Failed to parse stored user:", err);
            localStorage.removeItem("user");
            setUser(null);
            setIsAuthenticated(false);
            if (!isPublicRoute) {
              navigate("/sign-in");
            }
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
          if (!isPublicRoute) {
            navigate("/sign-in");
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, isPublicRoute]);

  // Listen for a custom event to handle logout
  // This allows the application to respond to logout events triggered from anywhere in the app
  // For example, if a user is forced to log out due to a session expiration or security reason
  useEffect(() => {
    const handleLogout = () => {
      logout();
      navigate("/sign-in");
    };
    window.addEventListener("force-logout", handleLogout);
    return () => window.removeEventListener("force-logout", handleLogout);
  }, [navigate]);

  const login = async (data: any) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setUser(data.user);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setIsAuthenticated(false);

    queryClient.clear(); // consider queryClient.removeQueries() if you only want to clear auth-related queries
  };

  const values = {
    user,
    setUser, // <-- provide setUser in context
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

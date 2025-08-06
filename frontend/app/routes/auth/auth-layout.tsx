import { useAuth } from "@/provider/auth-context";
import React from "react";
import { Navigate, Outlet } from "react-router";

const AuthLayout = () => {
  // This component is used to protect the routes that require authentication
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  // If the user is authenticated, redirect them to the dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  // If the user is authenticated, render the Outlet to display the nested routes
  // The Outlet component will render the child routes defined in the auth layout
  return <Outlet />;
};

export default AuthLayout;

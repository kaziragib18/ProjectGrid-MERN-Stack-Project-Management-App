import { useAuth } from "@/provider/auth-context";
import React from "react";
import { Navigate, Outlet } from "react-router";

const AuthLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    // If the user is authenticated, redirect them to the dashboard
    return <Navigate to="/dashboard" />;
  }
  // If the user is not authenticated, render the Outlet to show the auth routes
  // The Outlet component will render the child routes defined in the auth layout
  return <Outlet />;
};

export default AuthLayout;

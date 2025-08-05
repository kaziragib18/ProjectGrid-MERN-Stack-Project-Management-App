import React from "react";
//tanstack/react-query provider for managing server state in a React application
// This file sets up the React Query client and provides it to the application
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner"; // Sonner is a library for displaying toast notifications in React applications
import { AuthProvider } from "./auth-context";

export const queryClient = new QueryClient();
// This client can be configured with options like cache time, retry behavior, etc.
const ReactQueryProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default ReactQueryProvider;

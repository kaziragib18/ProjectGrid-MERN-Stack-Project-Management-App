import { Header } from "@/components/layout/header";
import { SidebarComponent } from "@/components/layout/sidebar-component";
import { Button } from "@/components/ui/button";
import CustomLoader from "@/components/ui/customLoader";
import { CreateWorkspace } from "@/components/workspace/create-workspace";
import { useAuth } from "@/provider/auth-context";
import type { Workspace } from "@/types";
import React, { useState } from "react";
import { Navigate, Outlet } from "react-router";

const DashboardLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);

  // This state can be used to manage the current workspace selection
  // For now, it's initialized to null, but you can set it based on user selection
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(
    null
  );

  if (isLoading) {
    return <CustomLoader />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  const handleWorkspaceSelected = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
  };

  return (
    <div className="flex h-screen w-full">
      <SidebarComponent currentWorkspace={currentWorkspace} />

      <div className="flex flex-1 flex-col h-full">
        <Header
          onWorkspaceSelected={handleWorkspaceSelected}
          selectedWorkspace={currentWorkspace}
          onCreateWorkspace={() => setIsCreatingWorkspace(true)}
        />
        <main className="flex-1 overflow-y-auto h-full w-full">
          <div className="mx-auto container px-2 sm:px-2 lg:px-8 py-0 md:py-8 w-full h-full">
            <Outlet />
          </div>
        </main>
      </div>
      <CreateWorkspace
        isCreatingWorkspace={isCreatingWorkspace}
        setIsCreatingWorkspace={setIsCreatingWorkspace}
      />
    </div>
  );
};

export default DashboardLayout;

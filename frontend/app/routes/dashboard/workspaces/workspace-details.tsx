import { CreateProjectDialog } from "@/components/project/create-project";
import CustomLoader from "@/components/ui/customLoader";
import { InviteMemberDialog } from "@/components/workspace/invite-member";
import { ProjectList } from "@/components/workspace/project-list";
import { WorkspaceHeader } from "@/components/workspace/workspace-header";
import { useGetWorkspaceQuery } from "@/hooks/use-workspace";
import type { Project, Workspace } from "@/types";
import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";

const WorkspaceDetails = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();

  const [isCreateProject, setIsCreateProject] = useState(false);
  const [isInviteMember, setIsInviteMember] = useState(false);

  if (!workspaceId) return <div>No Workspace found</div>;

  const { data, isLoading, error } = useGetWorkspaceQuery(workspaceId) as {
    data?: {
      workspace: Workspace;
      projects: Project[];
    };
    isLoading: boolean;
    error?: any;
  };

  if (isLoading) return <CustomLoader />;

  // Handle removed user / no access
  if (!data?.workspace || error?.response?.status === 403) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">
            You do not have access to this workspace
          </h2>
          <p className="text-muted-foreground">
            It seems you have been removed from this workspace.
          </p>
          <Button onClick={() => navigate("/dashboard")}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <WorkspaceHeader
        workspace={data.workspace}
        members={data.workspace.members as any}
        onCreateProject={() => setIsCreateProject(true)}
        onInviteMember={() => setIsInviteMember(true)}
      />

      <ProjectList
        workspaceId={workspaceId}
        projects={data.projects}
        onCreateProject={() => setIsCreateProject(true)}
      />

      <CreateProjectDialog
        isOpen={isCreateProject}
        onOpenChange={setIsCreateProject}
        workspaceId={workspaceId}
        workspaceMembers={data.workspace.members as any}
      />

      <InviteMemberDialog
        isOpen={isInviteMember}
        onOpenChange={setIsInviteMember}
        workspaceId={workspaceId}
      />
    </div>
  );
};

export default WorkspaceDetails;

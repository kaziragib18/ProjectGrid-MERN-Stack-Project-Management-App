import { NoDataFound } from "@/components/NoDataFound";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CustomLoader from "@/components/ui/customLoader";
import { CreateWorkspace } from "@/components/workspace/create-workspace";
import { WorkspaceAvatar } from "@/components/workspace/workspace-avatar";
import { useGetWorkspacesQuery } from "@/hooks/use-workspace";
import type { Workspace } from "@/types";
import { PlusCircle, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { format } from "date-fns";

const Workspaces = () => {
  // State to manage workspace creation modal visibility
  // This state is used to control the visibility of the CreateWorkspace component
  // It is set to true when the user clicks on the "New Workspace" button
  // and set to false when the modal is closed
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);

  // Ensuring workspaces defaults to [] to avoid undefined errors
  const { data: workspaces = [], isLoading } = useGetWorkspacesQuery() as {
    data: Workspace[];
    isLoading: boolean;
  };

  // Show loader while fetching data
  if (isLoading) {
    return <CustomLoader />;
  }

  return (
    <>
      <div className="space-y-6 sm:space-y-8 px-4 md:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
            Workspaces
          </h2>

          {/* New Workspace button with hover color effect */}
          <Button
            onClick={() => setIsCreatingWorkspace(true)}
            className="w-full sm:w-auto transition-colors duration-200 hover:bg-teal-600"
          >
            <PlusCircle className="size-4 mr-2" />
            New Workspace
          </Button>
        </div>

        {/* Responsive workspace grid for all screen sizes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {workspaces.map((ws) => (
            <WorkspaceCard key={ws._id} workspace={ws} />
          ))}

          {workspaces.length === 0 && (
            <NoDataFound
              title="No Workspaces Found"
              description="You haven't created any workspaces yet. Get started by creating one below."
              buttonText="Create Workspace"
              buttonAction={() => setIsCreatingWorkspace(true)}
            />
          )}
        </div>
      </div>

      {/* Modal for workspace creation */}
      <CreateWorkspace
        isCreatingWorkspace={isCreatingWorkspace}
        setIsCreatingWorkspace={setIsCreatingWorkspace}
      />
    </>
  );
};

const WorkspaceCard = ({ workspace }: { workspace: Workspace }) => {
  // State to manage border color on hover
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link to={`/workspaces/${workspace._id}`}>
      <Card
        // Animate hover and show colored border
        className="transition-all hover:shadow-md hover:-translate-y-1 border-2 flex flex-col h-full cursor-pointer"
        style={{
          borderColor: isHovered ? workspace.color : "transparent",
        }}
        // Set border color to workspace color on hover
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className="pb-2 flex-1">
          <div className="flex items-start justify-between">
            <div className="flex gap-3 items-start">
              <WorkspaceAvatar name={workspace.name} color={workspace.color} />
              <div className="space-y-0.5">
                <CardTitle className="text-base">{workspace.name}</CardTitle>
                {/* This format string specifies how the date should be displayed: day (d), month (MMM), year (yyyy), hour (h), minutes (mm), and AM/PM (a). */}
                <span className="text-xs text-muted-foreground">
                  Created at {format(workspace.createdAt, "d MMM yyyy h:mm a")}
                </span>
              </div>
            </div>

            {/* Show number of members in the workspace */}
            <div className="flex items-center text-muted-foreground mt-1">
              <Users className="size-4 mr-1" />
              <span className="text-xs">{workspace.members.length}</span>
            </div>
          </div>

          {/* Limit description to max 2 lines */}
          <CardDescription className="text-sm text-muted-foreground line-clamp-2 mt-2">
            {workspace.description || "No description"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground">
            View workspace details and projects
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default Workspaces;

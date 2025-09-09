import { useGetArchivedTasksQuery } from "@/hooks/use-task";
import { useAuth } from "@/provider/auth-context";
import React, { useContext } from "react";

const ArchivedTasksPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const workspaceId = user?.currentWorkspaceId || null;

  if (!workspaceId) {
    return <p>Please select a workspace to view archived tasks.</p>;
  }

  const {
    data: archivedTasks,
    isLoading,
    error,
    isError,
  } = useGetArchivedTasksQuery(workspaceId);

  if (authLoading) return <p>Checking authentication...</p>;
  if (isLoading) return <p>Loading archived tasks...</p>;
  if (isError) return <p>Failed to load archived tasks: {error?.message}</p>;

  return (
    <div>
      {archivedTasks?.map((task) => (
        <div key={task._id}>
          <h3>{task.title}</h3>
          <p>Status: {task.status}</p>
          <p>Priority: {task.priority}</p>
          {/* other task details */}
        </div>
      ))}
    </div>
  );
};

export default ArchivedTasksPage;

import CustomLoader from "@/components/ui/customLoader";
import { useTaskByIdQuery } from "@/hooks/use-task";
import { useAuth } from "@/provider/auth-context";
import type { Project, Task } from "@/types";
import { useNavigate, useParams } from "react-router";

const TaskDetails = () => {
  const { user } = useAuth();
  const { taskId, projectId, workspaceId } = useParams<{
    taskId: string;
    projectId: string;
    workspaceId: string;
  }>();

  const navigate = useNavigate();

  const { data, isLoading } = useTaskByIdQuery(taskId!) as {
    data: {
      task: Task;
      project: Project;
    };
    isLoading: boolean;
  };
  if (isLoading)
    return (
      <div>
        <CustomLoader />
      </div>
    );

  if (!data) {
    return (
      <div className=" flex items-center justify-center h-full">
        <div className=" text-2xl font-bold">Task not found</div>
      </div>
    );
  }

  const { task, project } = data;
  const isUserWatching = task?.watchers?.some(
    (watcher) => watcher._id.toString() === user?._id.toString()
  );

  const goBack = () => navigate(-1);

  const members = task?.assignees || [];

  return <div>Task Details Page</div>;
};
export default TaskDetails;

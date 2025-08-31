import { TaskAssigneesSelector } from "@/components/task/task-assignees-selector";
import { TaskDescription } from "@/components/task/task-description";
import { TaskPrioritySelector } from "@/components/task/task-priority-selector";
import { TaskStatusSelector } from "@/components/task/task-status-selector";
import { TaskTitle } from "@/components/task/task-title";
import { BackButton } from "@/components/ui/backButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CustomLoader from "@/components/ui/customLoader";
import { useTaskByIdQuery } from "@/hooks/use-task";
import { useAuth } from "@/provider/auth-context";
import type { Project, Task } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Archive, Eye, EyeOff } from "lucide-react";
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

  return (
    <div className="container mx-auto p-0 py-4 md:px-4">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <div className="flex flex-col md:flex-row md:items-center">
          <BackButton />

          <h1 className="text-xl md:text-2xl font-bold">{task.title}</h1>

          {task.isArchived && (
            <Badge className="ml-2" variant={"outline"}>
              Archived
            </Badge>
          )}
        </div>

        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button
            variant={"outline"}
            size="sm"
            onClick={() => {}}
            className="w-fit"
            // disabled={isWatching}
          >
            {isUserWatching ? (
              <>
                <EyeOff className="mr-2 size-4" />
                Unwatch
              </>
            ) : (
              <>
                <Eye className="mr-2 size-4" />
                Watch
              </>
            )}
          </Button>

          <Button
            variant={"outline"}
            size="sm"
            // onClick={handleAchievedTask}
            onClick={() => {}}
            className="w-fit"
            // disabled={isAchieved}
          >
            <Archive className="mr-2 size-4" />
            {task.isArchived ? "Unarchive" : "Archive"}
          </Button>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start mb-4">
              <div>
                <Badge
                  variant={
                    task.priority === "High"
                      ? "destructive"
                      : task.priority === "Medium"
                        ? "default"
                        : "outline"
                  }
                  className="mb-2 capitalize"
                >
                  {task.priority} Priority
                </Badge>

                <TaskTitle title={task.title} taskId={task._id} />

                <div className="text-sm md:text-base text-muted-foreground">
                  Created at:{" "}
                  {formatDistanceToNow(new Date(task.createdAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 md:mt-0">
                <TaskStatusSelector status={task.status} taskId={task._id} />

                <Button
                  variant={"destructive"}
                  size="sm"
                  onClick={() => {}}
                  className="hidden md:block"
                >
                  Delete Task
                </Button>
              </div>
            </div>
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-0">
                Description
              </h3>

              <TaskDescription
                description={task.description || ""}
                taskId={task._id}
              />
            </div>
            <TaskAssigneesSelector
              task={task}
              assignees={task.assignees}
              projectMembers={project.members as any}
            />
            <TaskPrioritySelector priority={task.priority} taskId={task._id} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default TaskDetails;

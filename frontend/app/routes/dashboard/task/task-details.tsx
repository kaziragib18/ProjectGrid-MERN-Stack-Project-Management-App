import { CommentSection } from "@/components/task/comment-section";
import { SubTasksDetails } from "@/components/task/sub-tasks";
import { TaskActivity } from "@/components/task/task-activity";
import { TaskAssigneesSelector } from "@/components/task/task-assignees-selector";
import { TaskDescription } from "@/components/task/task-description";
import { TaskPrioritySelector } from "@/components/task/task-priority-selector";
import { TaskStatusSelector } from "@/components/task/task-status-selector";
import { TaskTitle } from "@/components/task/task-title";
import { Watchers } from "@/components/task/watchers";
import { BackButton } from "@/components/ui/backButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CustomLoader from "@/components/ui/customLoader";
import {
  useArchivedTaskMutation,
  useTaskByIdQuery,
  useWatchTaskMutation,
} from "@/hooks/use-task";
import { useAuth } from "@/provider/auth-context";
import type { Project, Task } from "@/types";
import { format, formatDistanceToNow } from "date-fns";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

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

  const { mutate: watchTask, isPending: isWatching } = useWatchTaskMutation();
  const { mutate: archivedTask, isPending: isArchived } =
    useArchivedTaskMutation();

  if (isLoading) {
    return (
      <div>
        <CustomLoader />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl font-bold">Task not found</div>
      </div>
    );
  }

  const { task, project } = data;

  const isUserWatching = task?.watchers?.some(
    (watcher) => watcher._id.toString() === user?._id.toString()
  );

  const goBack = () => navigate(-1);

  const handleWatchTask = () => {
    watchTask(
      { taskId: task._id },
      {
        onSuccess: () => toast.success("Task watched"),
        onError: () => toast.error("Failed to watch task"),
      }
    );
  };

  const handleArchivedTask = () => {
    archivedTask(
      { taskId: task._id },
      {
        onSuccess: () => toast.success("Task archived"),
        onError: () => toast.error("Failed to archived task"),
      }
    );
  };

  // Calculate time since creation
  const createdAtDate = new Date(task.createdAt);
  const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;
  const timeSinceCreation = Date.now() - createdAtDate.getTime();

  return (
    <div className="container mx-auto p-0 py-4 md:px-4">
      {/* Back Button with Horizontal Line */}
      <div className="w-full mb-6">
        <div className="flex items-center gap-4 px-2">
          <BackButton />
          <hr className="flex-grow border-t border-gray-300" />
        </div>
      </div>

      {/* Title and Action Buttons */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 px-2">
        <div className="flex flex-col md:flex-row md:items-center">
          <h1 className="text-xl md:text-2xl font-semibold">{task.title}</h1>
          {task.isArchived && (
            <Badge className="ml-2" variant="outline">
              Archived
            </Badge>
          )}
        </div>

        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleWatchTask}
            className="w-fit"
            disabled={isWatching}
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
            variant="outline"
            size="sm"
            onClick={handleArchivedTask}
            className="w-fit"
            disabled={isArchived}
          >
            {task.isArchived ? "Unarchive" : "Archive"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left side - 3/4 */}
        <div className="lg:w-3/4 w-full">
          <div className="bg-card rounded-lg p-6 shadow-sm mb-6">
            {/* Top Row */}
            <div className="flex items-center justify-between mb-2 px-2">
              {/* Right side: Priority Badge */}
              <div>
                <Badge
                  className={`
                    capitalize
                    ${
                      task.priority === "High"
                        ? "bg-red-100 text-red-700"
                        : task.priority === "Medium"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-green-100 text-green-700"
                    }
                  `}
                >
                  {task.priority} Priority
                </Badge>
              </div>

              {/* Left side: Status Selector, Priority Selector, Trash Button */}
              <div className="flex items-center space-x-4">
                <TaskStatusSelector status={task.status} taskId={task._id} />
                <TaskPrioritySelector
                  priority={task.priority}
                  taskId={task._id}
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {}}
                  className=""
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
            <hr className="mb-4" />
            {/* Task Title */}
            <div className="px-2 mb-6">
              <TaskTitle title={task.title} taskId={task._id} />
            </div>
            {/* Created at info */}
            <div className="text-sm text-muted-foreground mb-6 px-2">
              Created at:{" "}
              {timeSinceCreation < twoDaysInMs
                ? formatDistanceToNow(createdAtDate, { addSuffix: true })
                : format(createdAtDate, "PPpp")}
            </div>
            {/* Description */}
            <div className="mb-6 px-2">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Description
              </h3>
              <TaskDescription
                description={task.description || ""}
                taskId={task._id}
              />
            </div>
            <hr className="mb-6" /> {/* <-- Added horizontal line here */}
            {/* Subtasks and Assignees side by side with only middle border */}
            <div className="flex flex-col md:flex-row gap-6 px-2">
              <div className="md:w-1/2 w-full pr-4 md:pr-6 border-r border-gray-300">
                <SubTasksDetails
                  subTasks={task.subtasks || []}
                  taskId={task._id}
                />
              </div>

              <div className="md:w-1/2 w-full pl-4 md:pl-6">
                <TaskAssigneesSelector
                  task={task}
                  assignees={task.assignees}
                  projectMembers={project.members as any}
                />
              </div>
            </div>
          </div>
          {user && (
            <CommentSection
              taskId={task._id}
              members={project.members as any}
              currentUser={user}
            />
          )}
        </div>

        {/* Right side - 1/4 */}
        <div className="lg:w-1/4 w-full flex flex-col gap-6">
          <Watchers watchers={task.watchers || []} />
          <TaskActivity resourceId={task._id} />
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;

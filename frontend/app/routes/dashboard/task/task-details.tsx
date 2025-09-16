"use client";

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
import { AlertTriangle, Eye, EyeOff, Trash2 } from "lucide-react";
import {
  useArchivedTaskMutation,
  useTaskByIdQuery,
  useWatchTaskMutation,
  useDeleteTaskMutation,
} from "@/hooks/use-task";
import { useAuth } from "@/provider/auth-context";
import type { Project, Task } from "@/types";
import { format, formatDistanceToNow } from "date-fns";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { useState } from "react";

const TaskDetails = () => {
  const { user } = useAuth();
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // ================================
  // Fetch task
  // ================================
  const { data, isLoading } = useTaskByIdQuery(taskId || "") as {
    data: { task: Task; project: Project } | undefined;
    isLoading: boolean;
  };

  const { mutate: watchTask, isPending: isWatching } = useWatchTaskMutation();
  const { mutate: archivedTask, isPending: isArchived } =
    useArchivedTaskMutation();
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTaskMutation();

  if (isLoading) return <CustomLoader />;

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl font-bold">Task not found</div>
      </div>
    );
  }

  const { task, project } = data;

  const isUserWatching =
    task?.watchers?.some(
      (watcher) => watcher._id?.toString() === user?._id?.toString()
    ) ?? false;

  const goBack = () => navigate(-1);

  // ================================
  // Watch/Unwatch Task
  // ================================
  const handleWatchTask = () => {
    watchTask(
      { taskId: task._id },
      {
        onSuccess: () =>
          toast.success(isUserWatching ? "Task unwatched" : "Task watched"),
        onError: () => toast.error("Failed to update watch status"),
      }
    );
  };

  // ================================
  // Archive/Unarchive Task
  // ================================
  const handleArchivedTask = () => {
    archivedTask(
      { taskId: task._id },
      {
        onSuccess: () =>
          toast.success(task.isArchived ? "Task unarchived" : "Task archived"),
        onError: () => toast.error("Failed to update archive status"),
      }
    );
  };

  // ================================
  // Delete Task
  // ================================
  const handleDeleteTask = () => {
    deleteTask(
      { taskId: task._id },
      {
        onSuccess: () => {
          toast.success("Task deleted successfully");
          navigate(-1);
        },
        onError: () => toast.error("Failed to delete task"),
      }
    );
  };

  // ================================
  // Time since creation
  // ================================
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
          {/* Watch/Unwatch */}
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

          {/* Archive/Unarchive */}
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
        {/* Left panel - 3/4 */}
        <div className="lg:w-3/4 w-full space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            {/* Top Row: Status, Priority, Delete */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <TaskStatusSelector status={task.status} taskId={task._id} />
                <TaskPrioritySelector
                  priority={task.priority}
                  taskId={task._id}
                />
              </div>

              {/* Delete */}
              <Button
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
              >
                <Trash2 className="size-4" /> Delete
              </Button>
            </div>

            <hr className="mb-6" />

            {/* Task Title */}
            <div className="px-2 mb-4">
              <TaskTitle
                title={task.title}
                taskId={task._id}
                className="text-2xl font-bold"
              />
            </div>

            {/* Created at */}
            <div className="text-sm text-gray-500 mb-6 px-2">
              Created at:{" "}
              {timeSinceCreation < twoDaysInMs
                ? formatDistanceToNow(createdAtDate, { addSuffix: true })
                : format(createdAtDate, "PPpp")}
            </div>

            {/* Description */}
            <div className="mb-6 px-2 bg-white rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Description
              </h3>
              {task.description ? (
                <TaskDescription
                  description={task.description}
                  taskId={task._id}
                />
              ) : (
                <p className="text-gray-400 italic">No description provided.</p>
              )}
            </div>

            {/* Subtasks and Assignees */}
            <div className="flex flex-col md:flex-row gap-4 px-2">
              <div className="md:w-1/2 w-full bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <SubTasksDetails
                  subTasks={task.subtasks || []}
                  taskId={task._id}
                />
              </div>

              <div className="md:w-1/2 w-full bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <TaskAssigneesSelector
                  task={task}
                  assignees={task.assignees}
                  projectMembers={project.members as any}
                />
              </div>
            </div>
          </div>

          {/* Comment Section */}
          {user && (
            <CommentSection
              taskId={task._id}
              members={project.members as any}
              currentUser={user}
            />
          )}
        </div>

        {/* Right panel - 1/4 */}
        <div className="lg:w-1/4 w-full flex flex-col gap-6">
          <Watchers watchers={task.watchers || []} />
          <TaskActivity resourceId={task._id} />
        </div>
      </div>

      {/* ================================
          Delete Task Dialog
      ================================ */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <div className="flex items-center mb-4 space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-semibold text-black">
                Delete this Task?
              </h2>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Deleting this task is irreversible and will remove all associated
              data. Task: <strong>{task.title}</strong>
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteTask}
                disabled={isDeleting}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetails;

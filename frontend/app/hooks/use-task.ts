import type { CreateTaskFormData } from "@/components/task/create-task-dialog";
import { deleteData, fetchData, postData, updateData } from "@/lib/fetch-util";
import type { TaskPriority, TaskStatus } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ================================
// Hook to create a new task in a specific project
// ================================
export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { projectId: string; taskData: CreateTaskFormData }) =>
      postData(`/tasks/${data.projectId}/create-task`, data.taskData),

    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["project", data.project] });
    },
  });
};

// ================================
// Hook to fetch a task by its ID
// ================================
export const useTaskByIdQuery = (taskId: string) => {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: () => fetchData(`/tasks/${taskId}`),
  });
};

// ================================
// Hook to update a task's title
// ================================
export const useUpdateTaskTitleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; title: string }) =>
      updateData(`/tasks/${data.taskId}/title`, { title: data.title }),

    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["task", data._id] });
      queryClient.invalidateQueries({ queryKey: ["task-activity", data._id] });
    },
  });
};

// ================================
// Hook to update a task's status
// ================================
export const useUpdateTaskStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; status: TaskStatus }) =>
      updateData(`/tasks/${data.taskId}/status`, { status: data.status }),

    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["task", data._id] });
      queryClient.invalidateQueries({ queryKey: ["task-activity", data._id] });
    },
  });
};

// ================================
// Hook to update a task's description
// ================================
export const useUpdateTaskDescriptionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; description: string }) =>
      updateData(`/tasks/${data.taskId}/description`, {
        description: data.description,
      }),

    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["task", data._id] });
      queryClient.invalidateQueries({ queryKey: ["task-activity", data._id] });
    },
  });
};

// ================================
// Hook to update the list of assignees for a task
// ================================
export const useUpdateTaskAssigneesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; assignees: string[] }) =>
      updateData(`/tasks/${data.taskId}/assignees`, {
        assignees: data.assignees,
      }),

    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["task", data._id] });
      queryClient.invalidateQueries({ queryKey: ["task-activity", data._id] });
    },
  });
};

// ================================
// Hook to update a task's priority
// ================================
export const useUpdateTaskPriorityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; priority: TaskPriority }) =>
      updateData(`/tasks/${data.taskId}/priority`, { priority: data.priority }),

    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["task", data._id] });
      queryClient.invalidateQueries({ queryKey: ["task-activity", data._id] });
    },
  });
};

// ================================
// Hook to add a new subtask to a task
// ================================
export const useAddSubTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; title: string }) =>
      postData(`/tasks/${data.taskId}/add-subtask`, { title: data.title }),

    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["task", data._id] });
      queryClient.invalidateQueries({ queryKey: ["task-activity", data._id] });
    },
  });
};

// ================================
// Hook to update the completion status of a subtask
// ================================
export const useUpdateSubTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      taskId: string;
      subTaskId: string;
      completed: boolean;
    }) =>
      updateData(`/tasks/${data.taskId}/update-subtask/${data.subTaskId}`, {
        completed: data.completed,
      }),

    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["task", data._id] });
      queryClient.invalidateQueries({ queryKey: ["task-activity", data._id] });
    },
  });
};

// ================================
// Hook to add a comment to a task
// ================================
export const useAddCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; text: string }) =>
      postData(`/tasks/${data.taskId}/add-comment`, { text: data.text }),

    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["comments", data.task] });
      queryClient.invalidateQueries({ queryKey: ["task-activity", data.task] });
    },
  });
};

// ================================
// Hook to fetch comments for a task
// ================================
export const useGetCommentsByTaskIdQuery = (taskId: string) => {
  return useQuery({
    queryKey: ["comments", taskId],
    queryFn: () => fetchData(`/tasks/${taskId}/comments`),
  });
};

// ================================
// Hook to update a comment by its ID
// ================================
export const useUpdateTaskCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { commentId: string; text: string; taskId: string }) =>
      updateData(`/tasks/${data.taskId}/comments/${data.commentId}`, {
        text: data.text,
      }),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.taskId],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", variables.taskId],
      });
    },
  });
};

// ================================
// Hook to delete a comment by its ID
// ================================
interface DeleteCommentVariables {
  commentId: string;
  taskId: string;
}

export const useDeleteCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteCommentVariables>({
    mutationFn: ({ taskId, commentId }) =>
      deleteData(`/tasks/${taskId}/comments/${commentId}`),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.taskId],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", variables.taskId],
      });
    },

    onError: (error) => {
      console.error("Failed to delete comment:", error);
    },
  });
};

// ================================
// Hook to "watch" a task
// ================================
export const useWatchTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string }) =>
      postData(`/tasks/${data.taskId}/watch`, {}),

    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["task", data._id] });
      queryClient.invalidateQueries({ queryKey: ["task-activity", data._id] });
    },
  });
};

// ================================
// Hook to mark a task as archived/unarchived
// ================================
export const useArchivedTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string }) =>
      postData(`/tasks/${data.taskId}/archived`, {}),

    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["task", data._id] });
      queryClient.invalidateQueries({ queryKey: ["task-activity", data._id] });
      queryClient.invalidateQueries({ queryKey: ["archived"] });
    },
  });
};

// ================================
// Hook to fetch the current user's assigned tasks
// ================================
export const useGetMyTasksQuery = () => {
  return useQuery({
    queryKey: ["my-tasks", "user"],
    queryFn: () => fetchData("/tasks/my-tasks"),
  });
};

// ================================
// Hook to fetch archived tasks
// ================================
export const useArchivedTasksQuery = () => {
  return useQuery({
    queryKey: ["archived"],
    queryFn: () => fetchData("/tasks/archived"),
  });
};

// ================================
// Hook to delete a task by ID
// ================================
export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { taskId: string }>({
    mutationFn: ({ taskId }) => deleteData(`/tasks/${taskId}`),

    onSuccess: (_data, variables) => {
      // Invalidate related queries so UI updates
      queryClient.invalidateQueries({ queryKey: ["my-tasks", "user"] });
      queryClient.invalidateQueries({ queryKey: ["task", variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ["archived"] });
    },

    onError: (error) => {
      console.error("Failed to delete task:", error);
    },
  });
};

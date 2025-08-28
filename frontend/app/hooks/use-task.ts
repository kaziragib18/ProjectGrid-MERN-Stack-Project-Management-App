import type { CreateTaskFormData } from "@/components/task/create-task-dialog";
import { fetchData, postData, updateData } from "@/lib/fetch-util";
import type { TaskPriority, TaskStatus } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Hook to create a new task in a specific project
export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient(); // Access React Query's cache manager

  return useMutation({
    // Function that makes the API call to create a task
    mutationFn: (data: { projectId: string; taskData: CreateTaskFormData }) =>
      postData(`/tasks/${data.projectId}/create-task`, data.taskData),

    // After success, invalidate the relevant project query to refresh the task list
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["project", data.project],
      });
    },
  });
};

// Hook to fetch a task by its ID
export const useTaskByIdQuery = (taskId: string) => {
  return useQuery({
    queryKey: ["task", taskId], // Unique cache key for this task
    queryFn: () => fetchData(`/tasks/${taskId}`), // Fetch task data from backend
  });
};

// Hook to update a task's title
export const useUpdateTaskTitleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; title: string }) =>
      updateData(`/tasks/${data.taskId}/title`, { title: data.title }),

    // Invalidate related caches (task and activity) to reflect updates
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["task", data._id] });
      queryClient.invalidateQueries({ queryKey: ["task-activity", data._id] });
    },
  });
};

// Hook to update a task's status
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

// Hook to update a task's description
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

// Hook to update the list of assignees for a task
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

// Hook to update a task's priority
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

// Hook to add a new subtask to a task
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

// Hook to update the completion status of a subtask
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

// Hook to add a comment to a task
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

// Hook to fetch comments for a task
export const useGetCommentsByTaskIdQuery = (taskId: string) => {
  return useQuery({
    queryKey: ["comments", taskId], // Unique key per task's comments
    queryFn: () => fetchData(`/tasks/${taskId}/comments`),
  });
};

// Hook to "watch" a task 
export const useWatchTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string }) =>
      postData(`/tasks/${data.taskId}/watch`, {}), // POST without payload

    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["task", data._id] });
      queryClient.invalidateQueries({ queryKey: ["task-activity", data._id] });
    },
  });
};

// Hook to mark a task as achieved (completed milestone)
export const useAchievedTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string }) =>
      postData(`/tasks/${data.taskId}/achieved`, {}),

    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["task", data._id] });
      queryClient.invalidateQueries({ queryKey: ["task-activity", data._id] });
    },
  });
};

// Hook to fetch the current user's assigned tasks
export const useGetMyTasksQuery = () => {
  return useQuery({
    queryKey: ["my-tasks", "user"], // Unique key for current user’s tasks
    queryFn: () => fetchData("/tasks/my-tasks"),
  });
};

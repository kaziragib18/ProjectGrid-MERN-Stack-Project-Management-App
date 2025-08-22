// Hooks for project operations: create project & fetch project tasks

import type { CreateProjectFormData } from "@/components/project/create-project";
import { fetchData, postData } from "@/lib/fetch-util";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

//Hook to create a new project inside a workspace
export const UseCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // API call for creating a new project
    mutationFn: async (data: {
      projectData: CreateProjectFormData;
      workspaceId: string;
    }) =>
      postData(
        `/projects/${data.workspaceId}/create-project`,
        data.projectData
      ),

    // When successful, invalidate workspace query so project list updates
    onSuccess: (data: any) => {
    // Making sure the server returns "workspace"
      queryClient.invalidateQueries({
        queryKey: ["workspace", data.workspace],
      });
    },
  });
};

//Hook to fetch tasks for a given project
export const UseProjectQuery = (projectId: string) => {
  return useQuery({
    queryKey: ["project", projectId], // unique cache key
    queryFn: () => fetchData(`/projects/${projectId}/tasks`),
  });
};

import type { WorkspaceForm } from "@/components/workspace/create-workspace";
import { fetchData, postData } from "@/lib/fetch-util";
import { useMutation, useQuery } from "@tanstack/react-query"

// Hook to create a new workspace
// This hook uses the useMutation hook from react-query to create a workspace
export const useCreateWorkspace = () => {
  return useMutation({
    mutationFn: async (data: WorkspaceForm) => postData("/workspaces", data),
  });
};

// Hook to get all workspaces
// This hook uses the useQuery hook from react-query to fetch workspaces
export const useGetWorkspacesQuery =()=>{
  return useQuery({
    queryKey:["workspaces"],
    queryFn:async() => fetchData("/workspaces"),
  });
};

// Hook to get a single workspace
// to fetch a single workspace
export const useGetWorkspaceQuery = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => fetchData(`/workspaces/${workspaceId}/projects`),
  });
}



// Hook to get workspace stats (dashboard)
// Includes task trends, priorities, project statuses, etc.
export const useGetWorkspaceStatsQuery = (workspaceId: string) => { 
  return useQuery({
    queryKey: ["workspace", workspaceId, "stats"],
    queryFn: async () => fetchData(`/workspaces/${workspaceId}/stats`),
  });
}
import type { WorkspaceForm } from "@/components/workspace/create-workspace";
import { fetchData, postData } from "@/lib/fetch-util";
import type { Workspace } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

// Hook to create a new workspace
// This hook uses the useMutation hook from react-query to create a workspace
export const useCreateWorkspace = () => {
  return useMutation({
    mutationFn: async (data: WorkspaceForm) => postData("/workspaces", data),
  });
};

// Hook to get all workspaces
// This hook uses the useQuery hook from react-query to fetch workspaces
export const useGetWorkspacesQuery = () => {
  return useQuery<Workspace[]>({
    queryKey: ["workspaces"],
    queryFn: async () => fetchData("/workspaces"),
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
export const useGetWorkspaceStatsQuery = (workspaceId: string, options = {}) => {
  return useQuery({
    queryKey: ["workspace", workspaceId, "stats"],
    queryFn: async () => fetchData(`/workspaces/${workspaceId}/stats`),
    enabled: !!workspaceId,
    ...options,
  });
};

// Hook to get workspace details (members, settings, etc.)
export const useGetWorkspaceDetailsQuery = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace", workspaceId, "details"],
    queryFn: async () => fetchData(`/workspaces/${workspaceId}`),
  });
};

// Hook to invite a member to a workspace
export const useInviteMemberMutation = () => {
  return useMutation({
    mutationFn: (data: { email: string; role: string; workspaceId: string }) =>
      postData(`/workspaces/${data.workspaceId}/invite-member`, data),
  });
};


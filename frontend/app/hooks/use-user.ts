import { fetchData, updateData } from "@/lib/fetch-util";
import type { ChangePasswordFormData } from "@/routes/user/profile";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

const queryKey: QueryKey = ["user"];

// ================================
// Fetch user profile
// ================================
export const useUserProfileQuery = () => {
  return useQuery({
    queryKey,
    queryFn: () => fetchData("/users/profile"),
  });
};

// ================================
// Change password
// ================================
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordFormData) =>
      updateData("/users/change-password", data),
  });
};

// ================================
// Update user profile (name + avatar)
// Accepts FormData to support file upload
// ================================
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<AxiosResponse<any>, unknown, FormData>({
    // Use updateData helper (already uses BASE_URL from fetch-util)
    mutationFn: (formData: FormData) => updateData("/users/profile", formData),

    // On success, refetch user profile query so frontend updates automatically
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },

    // Optional error handling
    onError: (error: any) => {
      console.error("Error updating profile:", error);
    },
  });
};

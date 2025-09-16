import { fetchData, updateData } from "@/lib/fetch-util"; // keep fetchData for profile query
import type { ChangePasswordFormData } from "@/routes/user/profile";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import axios from "axios";

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

  // Use full backend URL and multipart/form-data
  const API_BASE =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api-v1";

  return useMutation<AxiosResponse<any>, unknown, FormData>({
    mutationFn: (formData: FormData) => {
      // Get JWT token from localStorage or auth context
      const token = localStorage.getItem("token");
      return axios.put(`${API_BASE}/users/profile`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
    },

    // Refetch user profile after success
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },

    onError: (error: any) => {
      console.error("Error updating profile:", error);
    },
  });
};

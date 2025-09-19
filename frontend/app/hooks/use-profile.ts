import { fetchData, updateData } from "@/lib/fetch-util"; // keep fetchData for profile query
import type { ChangePasswordFormData } from "@/routes/user/profile";
import type { LoginResponse } from "@/types";
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
  const API_BASE =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api-v1";

  return useMutation<AxiosResponse<any>, unknown, FormData>({
    mutationFn: (formData: FormData) => {
      const token = localStorage.getItem("token");
      return axios.put(`${API_BASE}/users/profile`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: (error: any) => console.error("Error updating profile:", error),
  });
};

// ================================
// Enable / Disable 2FA
// ================================
export const useUpdate2FAPreference = () => {
  const queryClient = useQueryClient();
  const API_BASE =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api-v1";

  return useMutation<
    { requiresOtp?: boolean; otpToken?: string },
    unknown,
    { enable2FA: boolean }
  >({
    mutationFn: ({ enable2FA }) => {
      const token = localStorage.getItem("token");
      return axios
        .post(
          `${API_BASE}/users/2fa-preference`,
          { enable2FA },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((res) => res.data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: (error: any) =>
      console.error("Error updating 2FA preference:", error),
  });
};

// ================================
// Verify 2FA OTP (email verification)
// ================================
export const useVerify2FAOtp = () => {
  const queryClient = useQueryClient();
  const API_BASE =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api-v1";

  return useMutation<LoginResponse, unknown, { otp: string }>({
    mutationFn: ({ otp }) => {
      const token = localStorage.getItem("token");
      return axios
        .post(
          `${API_BASE}/users/verify-otp-2fa`,
          { otp },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((res) => res.data);
    },
    onSuccess: (data: LoginResponse) =>
      queryClient.invalidateQueries({ queryKey }),
    onError: (error: any) => console.error("Error verifying OTP:", error),
  });
};

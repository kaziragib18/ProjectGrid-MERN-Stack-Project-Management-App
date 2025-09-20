import { fetchData, updateData } from "@/lib/fetch-util"; // fetchData for profile query
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
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api-v1";

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
// Accepts FormData for file upload
// ================================
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

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
          { headers: { Authorization: `Bearer ${token}` } }
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

  return useMutation<LoginResponse, unknown, { otp: string; otpToken: string }>(
    {
      mutationFn: ({ otp, otpToken }) => {
        return axios
          .post(
            `${API_BASE}/auth/verify-otp-2fa`,
            { otp, otpToken },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
          .then((res) => res.data)
          .catch((err) => {
            console.error(
              "OTP verification request failed:",
              err.response || err
            );
            throw err;
          });
      },
      onSuccess: (data: LoginResponse) => {
        queryClient.invalidateQueries({ queryKey });
      },
      onError: (error: any) => console.error("Error verifying OTP:", error),
    }
  );
};

import { postData } from "@/lib/fetch-util";
import type { SignupFormData } from "@/routes/auth/sign-up";
import type { LoginResponse } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useSignUpMutation = () => {
  return useMutation({
    mutationFn: (data: SignupFormData) => postData("/auth/register", data),
    onSuccess: () => {
      // toast.success("Account created successfully! Please sign in.");
      console;
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Something went wrong!";
      // toast.error(errorMessage);
    },
  });
};

// This hook is used to verify the user's email address
// It sends a request to the backend with the verification token
// and updates the UI based on the success or failure of the verification
export const useVerifyEmailMutation = () => {
  return useMutation({
    //
    mutationFn: (token: string) => postData("/auth/verify-email", { token }),
    onSuccess: () => {
      toast.success("Email verified successfully! You can now sign in.");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Verification failed!";
      // toast.error(errorMessage);
    },
  });
};

export const useLoginMutation = () => {
  return useMutation<LoginResponse, any, { email: string; password: string }>({
    mutationFn: (data) => postData("/auth/login", data),
    onSuccess: (data) => {
      // 2FA handling can now safely use data.requiresOtp
      console.log("Login successful", data);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Login failed!";
      console.error("Login error:", errorMessage);
    },
  });
};

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: (data: { email: string }) =>
      postData("/auth/reset-password-request", data),
    onSuccess: () => {
      toast.success("Password reset link sent to your email.");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to send password reset link!";
      // toast.error(errorMessage);
    },
  });
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: (data: {
      token: string;
      newPassword: string;
      confirmPassword: string;
    }) => postData("/auth/reset-password", data),
    onSuccess: () => {
      toast.success("Password reset successfull!");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to send password reset link!";
      // toast.error(errorMessage);
    },
  });
};

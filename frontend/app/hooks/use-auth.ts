import { postData } from "@/lib/fetch-util";
import type { SignupFormData } from "@/routes/auth/sign-up";
import type { LoginResponse } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * ================================
 * Register
 * ================================
 */
export const useSignUpMutation = () => {
  return useMutation({
    mutationFn: (data: SignupFormData) => postData("/auth/register", data),
    onSuccess: () => {
      toast.success("Account created successfully! Please sign in.");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Something went wrong!";
      toast.error(errorMessage);
    },
  });
};

/**
 * ================================
 * Email verification
 * ================================
 */
export const useVerifyEmailMutation = () => {
  return useMutation({
    mutationFn: (token: string) => postData("/auth/verify-email", { token }),
    onSuccess: () => {
      toast.success("Email verified successfully! You can now sign in.");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Verification failed!";
      toast.error(errorMessage);
    },
  });
};

/**
 * ================================
 * Login (step 1: email + password)
 * ================================
 */
export const useLoginMutation = () => {
  return useMutation<LoginResponse, any, { email: string; password: string }>({
    mutationFn: (data) => postData("/auth/login", data),
    onSuccess: (data) => {
      // if 2FA is enabled, backend responds with requiresOtp
      if (data.requiresOtp) {
        toast.info("Enter your OTP to continue");
      } else {
        toast.success("Login successful");
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Login failed!";
      toast.error(errorMessage);
    },
  });
};

/**
 * ================================
 * Login (step 2: OTP verification)
 * ================================
 */
export const useVerifyLoginOtpMutation = () => {
  return useMutation<LoginResponse, unknown, { otp: string; otpToken: string }>(
    {
      mutationFn: ({ otp, otpToken }) =>
        postData("/auth/verify-otp", { otp, otpToken }),
      onSuccess: () => {
        toast.success("Login successful with 2FA");
      },
      onError: (error: any) => {
        const errorMessage =
          error?.response?.data?.message || "Invalid or expired OTP!";
        toast.error(errorMessage);
      },
    }
  );
};

// ================================
// Resend OTP
// ================================
export const useResendOtp = () => {
  return useMutation<LoginResponse, unknown, { email: string }>({
    mutationFn: ({ email }) => postData("/auth/resend-otp", { email }),
    onSuccess: (data) => {
      toast.success("A new OTP has been sent to your email.");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to resend OTP";
      toast.error(message);
    },
  });
};
/**
 * ================================
 * Forgot password
 * ================================
 */
export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: (data: { email: string }) =>
      postData("/auth/reset-password-request", data),
    onSuccess: () => {
      toast.success("Password reset link sent to your email.");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to send reset link!";
      toast.error(errorMessage);
    },
  });
};

/**
 * ================================
 * Reset password
 * ================================
 */
export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: (data: {
      token: string;
      newPassword: string;
      confirmPassword: string;
    }) => postData("/auth/reset-password", data),
    onSuccess: () => {
      toast.success("Password reset successfully!");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Password reset failed!";
      toast.error(errorMessage);
    },
  });
};

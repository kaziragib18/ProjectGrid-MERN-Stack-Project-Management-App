import { postData } from "@/lib/fetch-util";
import type { SignupFormData } from "@/routes/auth/sign-up";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useSignUpMutation = () => {
  return useMutation({
    mutationFn: (data: SignupFormData) => postData("/auth/register", data),
    onSuccess: () => {
      // toast.success("Account created successfully! Please sign in.");
      console
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Something went wrong!";
      toast.error(errorMessage);
    }
  });
};


export const useVerifyEmailMutation = () => {
  return useMutation({
    mutationFn: (token: string) => postData("/auth/verify-email", { token }),
    onSuccess: () => {
      toast.success("Email verified successfully! You can now sign in.");
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Verification failed!";
      toast.error(errorMessage);
    }
  });
}

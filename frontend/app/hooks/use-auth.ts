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
      const errorMessage = error?.response?.data?.message || "Verification failed!";
      toast.error(errorMessage);
    }
  });
}

 export const useLoginMutation = () => {
  return useMutation({
    // This mutation function sends a POST request to the login endpoint with email and password
    // It returns a promise that resolves to the response data
    mutationFn: (data: { email: string; password: string }) => postData("/auth/login", data),
    onSuccess: (data) => {
      // toast.success("Login successful!");
      console.log("Login successful", data);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Login failed!";
      // toast.error(errorMessage);
      console.error("Login error:", errorMessage);
    }
  });
};

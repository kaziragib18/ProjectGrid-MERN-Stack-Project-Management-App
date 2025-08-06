import { postData } from "@/lib/fetch-util";
import type { SignUpFormData } from "@/routes/auth/sign-up";
import { useMutation } from "@tanstack/react-query";

// This file contains a custom hook for signing up users using the React Query library.
// It exports a useSignUpMutation hook that can be used in components to perform the sign-up operation.
export const useSignUpMutation = () => {
  return useMutation({
    mutationFn: (data: SignUpFormData) => postData("/auth/register", data),
  });
};

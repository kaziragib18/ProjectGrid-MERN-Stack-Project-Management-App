import type { SignUpFormData } from "@/routes/auth/sign-up";
import { useMutation } from "@tanstack/react-query"
import type { Sign } from "crypto"
import { s } from "node_modules/react-router/dist/development/components-CjQijYga.mjs"
import { data } from "react-router"

export const useSignUpMutation = () => {
  return useMutation({
    mutationFn: (data: SignUpFormData) =>  signUp(data),
  })
};
     


import { SignInSchema } from "@/lib/schema";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react"; // 👈 added Eye & EyeOff icons
import { useLoginMutation } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useAuth } from "@/provider/auth-context";

// Type inferred from schema
type SignInFormData = z.infer<typeof SignInSchema>;

const SignIn = () => {
  const navigate = useNavigate(); // Using useNavigate hook to programmatically navigate
  const { login } = useAuth(); // Accessing the login function from AuthContext

  // Initialize the form with the SignInSchema
  // This schema defines the structure and validation rules for the sign-in form
  const form = useForm<SignInFormData>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // This function handles the form submission
  // It uses the useLoginMutation hook to perform the login operation
  const { mutate, isPending } = useLoginMutation();

  // 👇 state for password visibility toggle
  const [showPassword, setShowPassword] = useState(false);

  const handleOnSubmit = (values: SignInFormData) => {
    mutate(values, {
      onSuccess: (data) => {
        login(data);
        // Handle successful login, e.g., redirect to dashboard or show success message
        console.log("Login successful", data);
      },
      onError: (error) => {
        const errorMessage =
          error?.response?.data?.message || "An error occurred during login";
        toast.error(errorMessage);
        console.error("Login error:", errorMessage);
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4 relative">
      {/* Back to Home Icon Button */}
      <Link
        to="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 p-2 rounded-full border border-gray-300 hover:bg-gray-200 transition-colors"
        aria-label="Back to Home"
      >
        <ArrowLeft className="w-5 h-5 text-gray-700" />
      </Link>

      <Card className="w-full max-w-md p-6 bg-white shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Sign In
          </CardTitle>
          <CardDescription className="text-center text-sm text-muted-foreground">
            Please enter your email and password to sign in.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleOnSubmit)}
              className="space-y-5"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link
                        to="/forgot-password"
                        className="text-sm text-blue-500 hover:underline"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="*********"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          tabIndex={-1} // prevent focus trap
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-black text-white hover:bg-blue-400 transition-colors duration-200"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Signing in
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>

          <CardFooter className="mt-4 flex justify-center text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              to="/sign-up"
              className="text-sm text-blue-500 hover:underline ml-0.5"
            >
              Sign Up
            </Link>
          </CardFooter>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;

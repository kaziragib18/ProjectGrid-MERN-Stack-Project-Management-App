import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { SignInSchema } from "@/lib/schema";
import { useLoginMutation } from "@/hooks/use-auth";
import { useAuth } from "@/provider/auth-context";

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
import type { LoginResponse } from "@/types";
import { useVerify2FAOtp } from "@/hooks/use-profile";

// -------------------------------
// Types
// -------------------------------
type SignInFormData = z.infer<typeof SignInSchema>;

// -------------------------------
// Component
// -------------------------------
const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  // 2FA / OTP state
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [otpToken, setOtpToken] = useState<string | null>(null);
  const [otp, setOtp] = useState("");

  // Form setup
  const form = useForm<SignInFormData>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Mutations
  const { mutate: loginMutate, isPending } = useLoginMutation();
  const { mutate: verifyOtp, isPending: isVerifyingOtp } = useVerify2FAOtp();

  // -------------------------------
  // Handle email/password login
  // -------------------------------
  const handleOnSubmit = (values: SignInFormData) => {
    loginMutate(values, {
      onSuccess: (data) => {
        if (data.requiresOtp) {
          setRequiresOtp(true);
          setOtpToken(data.otpToken ?? null);
          toast("2FA enabled. Enter the OTP sent to your email.");
        } else {
          login(data);
          navigate("/dashboard");
        }
      },
      onError: (error: any) => {
        const message =
          error?.response?.data?.message || "An error occurred during login";
        toast.error(message);
      },
    });
  };

  // -------------------------------
  // Handle OTP verification
  // -------------------------------
  const handleOtpSubmit = () => {
    if (!otp || !otpToken) return;

    verifyOtp(
      { otp },
      {
        onSuccess: (data: LoginResponse) => {
          login(data); // complete login
          navigate("/dashboard");
          toast.success("Login successful!");
          setOtp("");
          setRequiresOtp(false);
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || "OTP verification failed"
          );
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4 relative">
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
            {!requiresOtp
              ? "Please enter your email and password to sign in."
              : "Enter the 6-digit OTP sent to your email."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!requiresOtp ? (
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
                            tabIndex={-1}
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
          ) : (
            <div className="space-y-5">
              <FormLabel>OTP Code</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </FormControl>
              <Button
                onClick={handleOtpSubmit}
                className="w-full"
                disabled={isVerifyingOtp}
              >
                {isVerifyingOtp ? (
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                ) : (
                  "Verify OTP"
                )}
              </Button>
            </div>
          )}

          <CardFooter className="mt-4 flex justify-center text-center text-sm text-muted-foreground">
            {!requiresOtp && (
              <>
                Don&apos;t have an account?{" "}
                <Link
                  to="/sign-up"
                  className="text-sm text-blue-500 hover:underline ml-0.5"
                >
                  Sign Up
                </Link>
              </>
            )}
          </CardFooter>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;

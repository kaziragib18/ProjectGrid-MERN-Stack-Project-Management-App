import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Loader2, Eye, EyeOff, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import { SignInSchema } from "@/lib/schema";
import { useLoginMutation } from "@/hooks/use-auth";
import { useAuth } from "@/provider/auth-context";
import { useVerify2FAOtp } from "@/hooks/use-profile";

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
import type z from "zod";

type SignInFormData = z.infer<typeof SignInSchema>;

const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const [requiresOtp, setRequiresOtp] = useState(false);
  const [otpToken, setOtpToken] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(150);
  const [otpResendDisabled, setOtpResendDisabled] = useState(true);

  const form = useForm<SignInFormData>({
    resolver: zodResolver(SignInSchema),
    defaultValues: { email: "", password: "" },
  });

  const { mutate: loginMutate, isPending } = useLoginMutation();
  const { mutate: verifyOtp, isPending: isVerifyingOtp } = useVerify2FAOtp();

  // OTP countdown
  useEffect(() => {
    if (!requiresOtp) return;
    if (otpCountdown <= 0) return setOtpResendDisabled(false);

    const interval = setInterval(
      () => setOtpCountdown((prev) => prev - 1),
      1000
    );
    return () => clearInterval(interval);
  }, [requiresOtp, otpCountdown]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // -------------------------------
  // Login submit
  // -------------------------------
  const handleOnSubmit = (values: SignInFormData) => {
    loginMutate(values, {
      onSuccess: (data) => {
        if (data.requiresOtp) {
          setRequiresOtp(true);
          setOtpToken(data.otpToken ?? null);
          setOtpCountdown(150);
          setOtpResendDisabled(true);
          toast("2FA enabled. Enter the OTP sent to your email.");
        } else {
          login(data);
          navigate("/dashboard");
        }
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Login failed");
      },
    });
  };

  // -------------------------------
  // OTP verification
  // -------------------------------
  const handleOtpSubmit = () => {
    if (!otp || !otpToken) return toast.error("OTP or token missing");

    verifyOtp(
      { otp, otpToken },
      {
        onSuccess: (data: LoginResponse) => {
          login(data);
          navigate("/dashboard");
          toast.success("Login successful!");
          setOtp("");
          setRequiresOtp(false);
          setOtpToken(null);
          setOtpCountdown(0); // stop countdown
          setOtpResendDisabled(true);
        },
        onError: (err: any) => {
          toast.error(
            err?.response?.data?.message || "OTP verification failed"
          );
        },
      }
    );
  };

  // -------------------------------
  // Resend OTP
  // -------------------------------
  const handleResendOtp = () => {
    const email = form.getValues("email");
    const password = form.getValues("password");
    if (!email || !password) return;

    loginMutate(
      { email, password },
      {
        onSuccess: (data) => {
          if (data.requiresOtp) {
            setOtpToken(data.otpToken ?? null);
            setOtpCountdown(150);
            setOtpResendDisabled(true);
            toast.success("A new OTP has been sent to your email.");
          }
        },
        onError: (err: any) =>
          toast.error(err?.response?.data?.message || "Failed to resend OTP"),
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4 relative">
      <Link
        to="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 p-2 rounded-full border border-gray-300 hover:bg-gray-200 transition-colors"
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
              ? "Enter email and password."
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
                      <FormLabel>Password</FormLabel>
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
                  className="w-full bg-black text-white hover:bg-blue-400"
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">OTP Code</label>
                <Input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                />
              </div>

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

              <Button
                variant="outline"
                onClick={handleResendOtp}
                disabled={otpResendDisabled || isVerifyingOtp}
                className="w-full flex items-center justify-center"
              >
                {isVerifyingOtp ? (
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                ) : (
                  <RefreshCcw className="w-4 h-4 mr-1" />
                )}
                Resend OTP{" "}
                {otpCountdown > 0 ? `(${formatTime(otpCountdown)})` : ""}
              </Button>
            </div>
          )}

          <CardFooter className="mt-4 flex justify-center text-sm text-muted-foreground">
            {!requiresOtp && (
              <>
                Don&apos;t have an account?{" "}
                <Link
                  to="/sign-up"
                  className="text-blue-500 hover:underline ml-0.5"
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

import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  useUserProfileQuery,
  useUpdateUserProfile,
  useChangePassword,
  useUpdate2FAPreference,
  useVerify2FAOtp,
} from "@/hooks/use-profile";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BackButton } from "@/components/ui/backButton";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CustomLoader from "@/components/ui/customLoader";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/provider/auth-context";
import type { User } from "@/types";
import { z } from "zod";

// ================================
// Validation schemas
// ================================
const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  profilePicture: z.string().optional(),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ================================
// Types
// ================================
export type ProfileFormData = z.infer<typeof profileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// ================================
// Profile component
// ================================
const Profile = () => {
  const { data: user, isPending } = useUserProfileQuery() as {
    data: User;
    isPending: boolean;
  };
  const { user: authUser, setUser, logout } = useAuth();
  const navigate = useNavigate();

  // ================================
  // Password visibility toggles
  // ================================
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Avatar file
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // 2FA / OTP state
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean>(false);
  const [otpRequired, setOtpRequired] = useState(false);
  const [otp, setOtp] = useState("");
  const [is2FALoading, setIs2FALoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpTimer, setOtpTimer] = useState(150); // 2.30 minute timer for Otp input
  const [otpExpired, setOtpExpired] = useState(false);

  // ================================
  // Forms setup
  // ================================
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", profilePicture: "" },
  });

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // ================================
  // Mutations
  // ================================
  const { mutate: updateUserProfile, isPending: isUpdatingProfile } =
    useUpdateUserProfile();
  const { mutate: changePassword, isPending: isChangingPassword } =
    useChangePassword();
  const { mutate: update2FA } = useUpdate2FAPreference();
  const { mutate: verify2FA } = useVerify2FAOtp();

  // ================================
  // Populate form & 2FA state on mount
  // ================================
  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name,
        profilePicture: user.profilePicture || "",
      });
      setIs2FAEnabled(user.is2FAEnabled ?? false);
    }
  }, [user]);

  // ================================
  // Avatar handler
  // ================================
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () =>
      profileForm.setValue("profilePicture", reader.result as string);
    reader.readAsDataURL(file);
  };

  // ================================
  // Check if form has changes
  // ================================
  const hasProfileChanged = () => {
    if (!user) return false;

    const nameChanged = profileForm.getValues("name") !== user.name;
    const avatarChanged = !!avatarFile;

    return nameChanged || avatarChanged;
  };

  // ================================
  // Profile submit
  // ================================
  const handleProfileSubmit = (values: ProfileFormData) => {
    const formData = new FormData();
    formData.append("name", values.name);
    if (avatarFile) formData.append("profilePicture", avatarFile);

    updateUserProfile(formData, {
      onSuccess: (response: any) => {
        toast.success("Profile updated successfully");
        if (response.data) setUser(response.data);

        profileForm.reset({
          name: response.data.name,
          profilePicture: response.data.profilePicture || "",
        });

        setAvatarFile(null);
      },
      onError: (error: any) =>
        toast.error(
          error.response?.data?.message || "Failed to update profile"
        ),
    });
  };

  // ================================
  // Password submit
  // ================================
  const handlePasswordSubmit = (values: ChangePasswordFormData) => {
    changePassword(values, {
      onSuccess: () => {
        toast.success("Password updated successfully. Logging out...");
        passwordForm.reset();
        setTimeout(() => {
          logout();
          navigate("/sign-in");
        }, 3000);
      },
      onError: (error: any) =>
        toast.error(
          error.response?.data?.message || "Failed to update password"
        ),
    });
  };

  // ================================
  // 2FA toggle
  // ================================
  const handle2FAToggle = (enable: boolean) => {
    setIs2FALoading(true);
    update2FA(
      { enable2FA: enable },
      {
        onSuccess: (data) => {
          setIs2FALoading(false);
          if (data.requiresOtp) {
            setOtpRequired(true);
            setOtpTimer(150);
            setOtpExpired(false);
            toast("2FA requires OTP verification. Check your email.");
          } else {
            setIs2FAEnabled(enable);
            toast.success(`2FA ${enable ? "enabled" : "disabled"}`);
          }
        },
        onError: (error: any) => {
          setIs2FALoading(false);
          toast.error(error.response?.data?.message || "Failed to update 2FA");
        },
      }
    );
  };

  // ================================
  // OTP submit
  // ================================
  const handleOtpSubmit = () => {
    if (!otp) return;
    setOtpError("");

    verify2FA(
      { otp },
      {
        onSuccess: () => {
          toast.success("2FA enabled successfully!");
          setIs2FAEnabled(true);
          setOtpRequired(false);
          setOtp("");
        },
        onError: (error: any) => {
          setOtpError(
            error.response?.data?.message || "OTP verification failed"
          );
        },
      }
    );
  };

  // ================================
  // OTP countdown timer
  // ================================
  useEffect(() => {
    if (!otpRequired) return;

    const timer = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setOtpRequired(false);
          setOtpExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [otpRequired]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (isPending) return <CustomLoader />;

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4 md:px-0">
      <div className="flex items-center space-x-4 mb-4">
        <BackButton />
        <h2 className="text-2xl font-semibold">Profile Settings</h2>
      </div>

      {/* Personal Information */}
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Manage your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form
              onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
              className="space-y-6"
            >
              <div className="flex items-center space-x-6">
                <Avatar className="h-24 w-24 bg-gray-600">
                  <AvatarImage
                    src={
                      profileForm.watch("profilePicture") ||
                      user?.profilePicture
                    }
                    alt={user?.name}
                  />
                  <AvatarFallback>
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    document.getElementById("avatar-upload")?.click()
                  }
                >
                  Change Avatar
                </Button>

                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleAvatarChange}
                />
              </div>

              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Your Name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-1">
                <Label>Email Address</Label>
                <Input type="email" value={user?.email} disabled />
                <p className="text-xs text-muted-foreground">
                  Your email cannot be changed
                </p>
              </div>

              {/* 2FA Toggle */}
              <div className="flex items-center space-x-4 mt-4">
                <Label>Two-Factor Authentication (2FA)</Label>
                <Switch
                  checked={is2FAEnabled}
                  disabled={otpRequired || is2FALoading}
                  onCheckedChange={handle2FAToggle}
                />
                {is2FALoading && <Loader2 className="animate-spin h-4 w-4" />}
              </div>

              {/* OTP Input */}
              {otpRequired && !otpExpired && (
                <div className="flex items-center space-x-2 mt-2">
                  <Input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <Button onClick={handleOtpSubmit}>Verify OTP</Button>
                  <span className="text-sm text-muted-foreground">
                    Expires in: {formatTimer(otpTimer)}
                  </span>
                  {otpError && (
                    <p className="text-red-500 text-sm ml-2">{otpError}</p>
                  )}
                </div>
              )}

              {otpExpired && (
                <p className="text-red-500 text-sm mt-2">
                  OTP expired. Please toggle 2FA again to request a new code.
                </p>
              )}

              <Button
                type="submit"
                disabled={isUpdatingProfile || !hasProfileChanged()}
                className="mt-4"
              >
                {isUpdatingProfile ? (
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Security / Password */}
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Update your password</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
              className="space-y-4"
            >
              {passwordForm.formState.errors?.confirmPassword?.message && (
                <Alert variant="destructive" className="mb-2">
                  <AlertCircle />
                  <AlertDescription>
                    {passwordForm.formState.errors.confirmPassword.message}
                  </AlertDescription>
                </Alert>
              )}

              {["currentPassword", "newPassword", "confirmPassword"].map(
                (fieldName) => {
                  const show =
                    fieldName === "currentPassword"
                      ? showCurrent
                      : fieldName === "newPassword"
                        ? showNew
                        : showConfirm;
                  const toggle =
                    fieldName === "currentPassword"
                      ? () => setShowCurrent(!showCurrent)
                      : fieldName === "newPassword"
                        ? () => setShowNew(!showNew)
                        : () => setShowConfirm(!showConfirm);

                  return (
                    <FormField
                      key={fieldName}
                      control={passwordForm.control}
                      name={fieldName as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {fieldName === "currentPassword"
                              ? "Current Password"
                              : fieldName === "newPassword"
                                ? "New Password"
                                : "Confirm Password"}
                          </FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                {...field}
                                type={show ? "text" : "password"}
                                placeholder="********"
                              />
                            </FormControl>
                            <button
                              type="button"
                              className="absolute right-2 top-1/2 -translate-y-1/2"
                              onClick={toggle}
                            >
                              {show ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
                }
              )}

              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword ? (
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;

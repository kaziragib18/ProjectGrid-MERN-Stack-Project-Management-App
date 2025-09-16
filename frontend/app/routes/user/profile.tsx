import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  useUserProfileQuery,
  useUpdateUserProfile,
  useChangePassword,
} from "@/hooks/use-user";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BackButton } from "@/components/ui/backButton";
import { Button } from "@/components/ui/button";
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
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Local state for password visibility
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Selected avatar file
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

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
  // Hooks for mutation
  // ================================
  const { mutate: updateUserProfile, isPending: isUpdatingProfile } =
    useUpdateUserProfile();
  const {
    mutate: changePassword,
    isPending: isChangingPassword,
    error: passwordError,
  } = useChangePassword();

  // ================================
  // Populate profile form when user loads
  // ================================
  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name,
        profilePicture: user.profilePicture,
      });
    }
  }, [user]);

  // ================================
  // Handle avatar selection
  // ================================
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      profileForm.setValue("profilePicture", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // ================================
  // Profile form submit
  // ================================
  const handleProfileSubmit = (values: ProfileFormData) => {
    const formData = new FormData();
    formData.append("name", values.name);
    if (avatarFile) formData.append("profilePicture", avatarFile);

    // Using updated hook with FormData
    updateUserProfile(formData, {
      onSuccess: () => {
        toast.success("Profile updated successfully");
      },
      onError: (error: any) =>
        toast.error(
          error.response?.data?.message || "Failed to update profile"
        ),
    });
  };

  // ================================
  // Password form submit
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

  if (isPending) return <CustomLoader />;

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4 md:px-0">
      {/* Back button */}
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

              <Button type="submit" disabled={isUpdatingProfile}>
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
              {passwordError && (
                <Alert variant="destructive">
                  <AlertCircle />
                  <AlertDescription>
                    {(passwordError as any).message}
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

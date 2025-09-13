import type { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Check, Copy, Mail, UserCog, Users, Eye } from "lucide-react";
import { Label } from "../ui/label";
import { useInviteMemberMutation } from "@/hooks/use-workspace";
import { toast } from "sonner";
import { inviteMemberSchema } from "@/lib/schema";

interface InviteMemberDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
}
export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;

const ROLES = [
  { value: "admin", label: "Admin", icon: UserCog },
  { value: "member", label: "Member", icon: Users },
  { value: "viewer", label: "Viewer", icon: Eye },
] as const;

export const InviteMemberDialog = ({
  isOpen,
  onOpenChange,
  workspaceId,
}: InviteMemberDialogProps) => {
  const [inviteTab, setInviteTab] = useState("email");
  const [linkCopied, setLinkCopied] = useState(false);

  const form = useForm<InviteMemberFormData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const { mutate, isPending } = useInviteMemberMutation();

  const onSubmit = async (data: InviteMemberFormData) => {
    if (!workspaceId) return;

    mutate(
      {
        workspaceId,
        ...data,
      },
      {
        onSuccess: () => {
          toast.success("Invite sent successfully");
          form.reset();
          setInviteTab("email");
          onOpenChange(false);
        },
        onError: (error: any) => {
          toast.error(error.response.data.message);
          console.log(error);
        },
      }
    );
  };

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/workspace-invite/${workspaceId}`
    );
    setLinkCopied(true);

    setTimeout(() => {
      setLinkCopied(false);
    }, 3000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Invite to Workspace
          </DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="email"
          value={inviteTab}
          onValueChange={setInviteTab}
        >
          <TabsList className="w-full grid grid-cols-2 mb-6 rounded-lg bg-gray-100 p-1">
            <TabsTrigger
              value="email"
              disabled={isPending}
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
            >
              <Mail className="w-4 h-4 mr-2" /> Email
            </TabsTrigger>
            <TabsTrigger
              value="link"
              disabled={isPending}
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
            >
              <Copy className="w-4 h-4 mr-2" /> Link
            </TabsTrigger>
          </TabsList>

          {/* Email Tab */}
          <TabsContent value="email">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex flex-col space-y-6 w-full">
                  {/* Email Input */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter email"
                            className="focus:ring-2 focus:ring-teal-600"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Role Selection */}
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assign Role</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-3 gap-3">
                            {ROLES.map((role) => {
                              const Icon = role.icon;
                              return (
                                <label
                                  key={role.value}
                                  className={cn(
                                    "flex flex-col items-center justify-center rounded-xl border cursor-pointer p-3 transition-all hover:shadow-md",
                                    field.value === role.value
                                      ? "border-teal-600 bg-teal-50"
                                      : "border-gray-200"
                                  )}
                                >
                                  <input
                                    type="radio"
                                    value={role.value}
                                    className="hidden"
                                    checked={field.value === role.value}
                                    onChange={() => field.onChange(role.value)}
                                  />
                                  <Icon
                                    className={cn(
                                      "w-6 h-6 mb-2",
                                      field.value === role.value
                                        ? "text-teal-600"
                                        : "text-gray-500"
                                    )}
                                  />
                                  <span className="capitalize text-sm font-medium">
                                    {role.label}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Submit */}
                  <Button
                    className="mt-4 w-full bg-teal-600 hover:bg-teal-700 transition-colors"
                    size={"lg"}
                    disabled={isPending}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Invite
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          {/* Link Tab */}
          <TabsContent value="link">
            <div className="grid gap-4">
              <Label>Share this link to invite people</Label>
              <div className="flex items-center space-x-2">
                <Input
                  readOnly
                  value={`${window.location.origin}/workspace-invite/${workspaceId}`}
                />
                <Button
                  onClick={handleCopyInviteLink}
                  disabled={isPending}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800"
                >
                  {linkCopied ? (
                    <>
                      <Check className="mr-2 h-4 w-4 text-teal-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Anyone with the link can join this workspace
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Trash2,
  AlertTriangle,
  Settings as SettingsIcon,
  UserX as RemoveIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import CustomLoader from "@/components/ui/customLoader";
import { workspaceSchema } from "@/lib/schema";
import { fetchData, updateData, deleteData } from "@/lib/fetch-util";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { WorkspaceForm } from "@/components/workspace/create-workspace";
import type { MemberProps, Workspace } from "@/types";
import { useAuth } from "@/provider/auth-context";

export const colorOptions = [
  "#4F46E5",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#3B82F6",
  "#6366F1",
  "#6B7280",
  "#14B8A6",
];

const Settings = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<MemberProps[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<
    "owner" | "admin" | "member" | "viewer" | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // For remove member dialog
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberProps | null>(
    null
  );

  const form = useForm<WorkspaceForm>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: "",
      description: "",
      color: colorOptions[0],
    },
  });

  useEffect(() => {
    const loadWorkspace = async () => {
      setLoading(true);
      try {
        const data = await fetchData<Workspace>(`/workspaces/${workspaceId}`);
        form.reset({
          name: data.name,
          description: data.description || "",
          color: data.color || colorOptions[0],
        });

        const mappedMembers = (data.members || []).map((m) => ({
          _id: m.user._id,
          user: m.user,
          role: m.role,
          joinedAt: m.joinedAt,
        }));
        setMembers(mappedMembers);

        const current = mappedMembers.find(
          (m) => m.user._id === currentUser?._id
        );
        setCurrentUserRole(current?.role || null);
      } catch {
        toast.error("Failed to load workspace details");
      } finally {
        setLoading(false);
      }
    };
    if (workspaceId) loadWorkspace();
  }, [workspaceId, form, currentUser]);

  const onSubmit = async (data: WorkspaceForm) => {
    setIsSubmitting(true);
    try {
      await updateData(`/workspaces/${workspaceId}`, data);
      toast.success("Workspace updated successfully!");
      form.reset(data);
      navigate(`/workspaces/${workspaceId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDeleteWorkspace = async () => {
    setIsDeleting(true);
    try {
      await deleteData(`/workspaces/${workspaceId}`);
      toast.success("Workspace deleted successfully!");
      setShowDeleteDialog(false);
      navigate(`/workspaces`);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to delete workspace"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const removeMember = (member: MemberProps) => {
    setSelectedMember(member);
    setShowRemoveDialog(true);
  };

  const confirmRemoveMember = async () => {
    if (!selectedMember) return;
    try {
      await deleteData(
        `/workspaces/${workspaceId}/members/${selectedMember.user._id}`
      );
      setMembers((prev) =>
        prev.filter((m) => m.user._id !== selectedMember.user._id)
      );
      toast.success("Member removed successfully");
    } catch {
      toast.error("Failed to remove member");
    } finally {
      setSelectedMember(null);
      setShowRemoveDialog(false);
    }
  };

  if (!workspaceId) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-semibold mb-2">No workspace selected</h2>
        <p className="text-muted-foreground">
          Please select a workspace to continue.
        </p>
      </div>
    );
  }

  if (loading) return <CustomLoader />;

  return (
    <main className="max-w-xl mx-auto py-8 px-4 space-y-10">
      <header className="mb-6 flex items-center space-x-3">
        <SettingsIcon className="w-7 h-7 text-teal-600" />
        <h1 className="text-3xl font-bold">Workspace Settings</h1>
      </header>

      {/* Update Workspace Card */}
      <div className="border rounded-lg p-6 shadow-sm bg-white">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Workspace Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Workspace Description"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <div className="flex gap-3 flex-wrap">
                      {colorOptions.map((color) => (
                        <div
                          key={color}
                          onClick={() => field.onChange(color)}
                          className={cn(
                            "w-8 h-8 rounded-full cursor-pointer hover:opacity-80 transition-all duration-300 border",
                            field.value === color
                              ? "ring-2 ring-offset-2 ring-blue-500 border-blue-500"
                              : "border-transparent"
                          )}
                          style={{ backgroundColor: color }}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) =>
                            e.key === "Enter" && field.onChange(color)
                          }
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end mt-4">
              <Button
                type="submit"
                className="bg-black text-white hover:bg-teal-600 transition-colors duration-200"
                disabled={isSubmitting || !form.formState.isDirty}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Members Card */}
      <div className="border rounded-lg p-6 shadow-sm bg-white">
        <h2 className="text-xl font-semibold mb-4">Workspace Members</h2>
        {members.length === 0 ? (
          <p className="text-muted-foreground">No members found.</p>
        ) : (
          <ul className="space-y-3">
            {members.map((member) => (
              <li
                key={member.user._id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {member.user.profilePicture && (
                    <img
                      src={member.user.profilePicture}
                      alt={member.user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium">{member.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-sm font-semibold px-2 py-1 rounded-full",
                      member.role === "owner"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    )}
                  >
                    {member.role}
                  </span>

                  {currentUserRole === "owner" && member.role !== "owner" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeMember(member)}
                      className="px-2 py-1"
                    >
                      <RemoveIcon className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Danger Zone Card */}
      <div className="border rounded-lg p-6 shadow-sm bg-white">
        <div className="flex items-center mb-4 space-x-3">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <h2 className="text-xl font-semibold text-red-600">Danger Zone</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Deleting your workspace is irreversible and will remove all associated
          projects and data. Please proceed with caution.
        </p>
        <Button
          type="button"
          variant="destructive"
          className="w-full flex justify-center items-center gap-2 text-sm px-4 py-2 transition-colors duration-200 hover:bg-red-700"
          onClick={() => setShowDeleteDialog(true)}
          disabled={isDeleting}
        >
          <Trash2 className="w-4 h-4" />
          Delete Workspace
        </Button>
      </div>

      {/* Delete Workspace Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="mb-4">
            Are you sure you want to delete this workspace? This action cannot
            be undone.
          </p>
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onDeleteWorkspace}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Remove</DialogTitle>
          </DialogHeader>
          <p className="mb-4">Are you sure you want to remove this user?</p>
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowRemoveDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmRemoveMember}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Settings;

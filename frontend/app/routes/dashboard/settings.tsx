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
  Crown as OwnerIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import CustomLoader from "@/components/ui/customLoader";
import { workspaceSchema, projectSchema } from "@/lib/schema";
import { fetchData, updateData, deleteData, postData } from "@/lib/fetch-util";
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
import type { MemberProps, Workspace, Project } from "@/types";
import { ProjectStatus } from "@/types";
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

type ProjectFormData = {
  title: string;
  description?: string;
  status: ProjectStatus;
};

const Settings = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<MemberProps[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<
    "owner" | "admin" | "member" | "viewer" | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleteProjectDialog, setShowDeleteProjectDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberProps | null>(
    null
  );

  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [transferTarget, setTransferTarget] = useState<MemberProps | null>(
    null
  );
  const [isTransferring, setIsTransferring] = useState(false);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isProjectUpdating, setIsProjectUpdating] = useState(false);

  const [activeTab, setActiveTab] = useState<"workspace" | "project">(
    "workspace"
  );

  const form = useForm<WorkspaceForm>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: { name: "", description: "", color: colorOptions[0] },
  });

  const projectForm = useForm<ProjectFormData>({
    resolver: zodResolver(
      projectSchema.pick({ title: true, description: true, status: true })
    ),
    defaultValues: { title: "", description: "", status: ProjectStatus.ToDo },
  });

  useEffect(() => {
    const loadWorkspaceAndProjects = async () => {
      setLoading(true);
      try {
        const data = await fetchData<{
          projects: Project[];
          workspace: Workspace;
        }>(`/workspaces/${workspaceId}/projects`);

        const ws = data.workspace;

        form.reset({
          name: ws.name,
          description: ws.description || "",
          color: ws.color || colorOptions[0],
        });

        const mappedMembers = (ws.members || []).map((m) => ({
          _id: m.user._id,
          user: m.user,
          role: m.role,
          joinedAt: m.joinedAt,
        }));
        setMembers(mappedMembers);
        setProjects(data.projects || []);

        const current = mappedMembers.find(
          (m) => m.user._id === currentUser?._id
        );
        setCurrentUserRole(current?.role || null);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load workspace details or projects");
      } finally {
        setLoading(false);
      }
    };
    if (workspaceId) loadWorkspaceAndProjects();
  }, [workspaceId, form, currentUser]);

  // ==================== Workspace Handlers ====================
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

  // ==================== Member Handlers ====================
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

  const transferOwnership = (member: MemberProps) => {
    setTransferTarget(member);
    setShowTransferDialog(true);
  };

  const confirmTransferOwnership = async () => {
    if (!transferTarget) return;
    setIsTransferring(true);
    try {
      await postData(
        `/workspaces/${workspaceId}/transfer-ownership/${transferTarget.user._id}`,
        {}
      );
      setMembers((prev) =>
        prev.map((m) => {
          if (m.user._id === transferTarget.user._id)
            return { ...m, role: "owner" };
          if (m.user._id === currentUser?._id) return { ...m, role: "member" };
          return m;
        })
      );
      setCurrentUserRole("member");
      toast.success("Ownership transferred successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to transfer ownership");
    } finally {
      setTransferTarget(null);
      setShowTransferDialog(false);
      setIsTransferring(false);
    }
  };

  // ==================== Project Handlers ====================
  const openProject = (projectId: string) => {
    if (!["owner", "admin"].includes(currentUserRole!)) return;
    const project = projects.find((p) => p._id === projectId);
    if (!project) return;
    setSelectedProject(project);
    projectForm.reset({
      title: project.title,
      description: project.description,
      status: project.status,
    });
  };

  const updateProjectHandler = async (data: ProjectFormData) => {
    if (!selectedProject) return;
    setIsProjectUpdating(true);
    try {
      await updateData(`/projects/${selectedProject._id}`, data);
      setProjects((prev) =>
        prev.map((p) => (p._id === selectedProject._id ? { ...p, ...data } : p))
      );
      toast.success("Project updated successfully");
      setSelectedProject(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update project");
    } finally {
      setIsProjectUpdating(false);
    }
  };

  const confirmDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setShowDeleteProjectDialog(true);
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      await deleteData(`/projects/${projectToDelete._id}`);
      setProjects((prev) => prev.filter((p) => p._id !== projectToDelete._id));
      toast.success("Project deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete project");
    } finally {
      setShowDeleteProjectDialog(false);
      setProjectToDelete(null);
    }
  };

  if (loading) return <CustomLoader />;

  return (
    <main className="max-w-6xl mx-auto py-6 px-4 sm:py-4 sm:px-4 lg:px-4 space-y-4">
      <header className="mb-6 flex items-center space-x-3">
        <SettingsIcon className="w-7 h-7 text-teal-600" />
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
      </header>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 border-b mb-6 overflow-x-auto">
        <button
          className={cn(
            "py-2 px-4 font-semibold transition-colors whitespace-nowrap",
            activeTab === "workspace"
              ? "border-b-2 border-teal-600 text-teal-600"
              : "text-gray-500 hover:text-teal-600"
          )}
          onClick={() => setActiveTab("workspace")}
        >
          Workspace Settings
        </button>
        <button
          className={cn(
            "py-2 px-4 font-semibold transition-colors whitespace-nowrap",
            activeTab === "project"
              ? "border-b-2 border-teal-600 text-teal-600"
              : "text-gray-500 hover:text-teal-600"
          )}
          onClick={() => setActiveTab("project")}
        >
          Project Settings
        </button>
      </div>

      {/* ================= Workspace Tab ================= */}
      {activeTab === "workspace" && (
        <section className="space-y-6">
          {/* Workspace Form */}
          <div className="border rounded-lg p-4 sm:p-6 shadow-sm bg-white">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Workspace Name"
                          className="w-full"
                        />
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
                          className="w-full"
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
                              role="button"
                              tabIndex={0}
                              onClick={() => field.onChange(color)}
                              onKeyDown={(e) =>
                                e.key === "Enter" && field.onChange(color)
                              }
                              className={cn(
                                "w-8 h-8 rounded-full cursor-pointer hover:opacity-80 border",
                                field.value === color
                                  ? "ring-2 ring-offset-2 ring-blue-500 border-blue-500"
                                  : "border-transparent"
                              )}
                              style={{ backgroundColor: color }}
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

          {/* Members List */}
          <div className="border rounded-lg p-4 sm:p-6 shadow-sm bg-white overflow-hidden">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">
              Workspace Members
            </h2>
            {members.length === 0 ? (
              <p className="text-muted-foreground">No members found.</p>
            ) : (
              <ul className="space-y-3">
                {members.map((member) => (
                  <li
                    key={member.user._id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0"
                  >
                    <div className="flex items-center gap-3">
                      {member.user.profilePicture ? (
                        <img
                          src={member.user.profilePicture}
                          alt={member.user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-700">
                          {member.user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {member.user.name}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {member.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 justify-start sm:justify-end">
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
                      {currentUserRole === "owner" &&
                        member.role !== "owner" && (
                          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => transferOwnership(member)}
                            >
                              <OwnerIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeMember(member)}
                            >
                              <RemoveIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Danger Zone */}
          <div className="border rounded-lg p-4 sm:p-6 shadow-sm bg-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h2 className="text-lg sm:text-xl font-semibold text-red-600">
                Danger Zone
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Deleting your workspace is irreversible and will remove all
              associated projects and data. Please proceed with caution.
            </p>
            <Button
              variant="destructive"
              className="w-full flex justify-center items-center gap-2 text-sm px-4 py-2 hover:bg-red-700"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4" /> Delete Workspace
            </Button>
          </div>
        </section>
      )}

      {/* ================= Project Tab ================= */}
      {activeTab === "project" && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.length === 0 ? (
            <p className="text-muted-foreground col-span-full text-center py-6">
              No projects have been created in this workspace.
            </p>
          ) : (
            projects.map((project) => (
              <div
                key={project._id}
                className="border p-4 sm:p-6 rounded-md shadow-sm flex flex-col justify-between min-h-[150px] bg-white"
              >
                <div>
                  <p className="font-medium truncate">{project.title}</p>
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mt-1">
                      {project.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-between mt-4 gap-2">
                  <span
                    className={cn(
                      "text-sm font-semibold px-2 py-1 rounded-full",
                      project.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : project.status === "In Progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                    )}
                  >
                    {project.status}
                  </span>
                  <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                    {["owner", "admin"].includes(currentUserRole!) && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openProject(project._id)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => confirmDeleteProject(project)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {/* ================= Edit Project Dialog ================= */}
      <Dialog
        open={!!selectedProject}
        onOpenChange={() => setSelectedProject(null)}
      >
        <DialogContent className="max-w-lg mx-auto w-full sm:px-6">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <Form {...projectForm}>
            <form
              onSubmit={projectForm.handleSubmit(updateProjectHandler)}
              className="space-y-4"
            >
              <FormField
                control={projectForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={projectForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={projectForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <select {...field} className="border p-2 rounded w-full">
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedProject(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isProjectUpdating || !projectForm.formState.isDirty}
                >
                  {isProjectUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ================= Delete Project Dialog ================= */}
      <Dialog
        open={showDeleteProjectDialog}
        onOpenChange={() => setShowDeleteProjectDialog(false)}
      >
        <DialogContent className="max-w-md mx-auto w-full sm:px-6">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete{" "}
            <strong>{projectToDelete?.title}</strong>? This action cannot be
            undone.
          </p>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteProjectDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProject}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================= Remove Member Dialog ================= */}
      <Dialog
        open={showRemoveDialog}
        onOpenChange={() => setShowRemoveDialog(false)}
      >
        <DialogContent className="max-w-md mx-auto w-full sm:px-6">
          <DialogHeader>
            <DialogTitle>Remove Member?</DialogTitle>
          </DialogHeader>
          <p className="mt-2">
            Are you sure you want to remove{" "}
            <strong>{selectedMember?.user.name}</strong> from this workspace?
          </p>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowRemoveDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRemoveMember}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================= Transfer Ownership Dialog ================= */}
      <Dialog
        open={showTransferDialog}
        onOpenChange={() => setShowTransferDialog(false)}
      >
        <DialogContent className="max-w-md mx-auto w-full sm:px-6">
          <DialogHeader>
            <DialogTitle>Transfer Ownership?</DialogTitle>
          </DialogHeader>
          <p className="mt-2">
            Are you sure you want to transfer ownership to{" "}
            <strong>{transferTarget?.user.name}</strong>?
          </p>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowTransferDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmTransferOwnership}
              disabled={isTransferring}
            >
              Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================= Delete Workspace Dialog ================= */}
      <Dialog
        open={showDeleteDialog}
        onOpenChange={() => setShowDeleteDialog(false)}
      >
        <DialogContent className="max-w-md mx-auto w-full sm:px-6">
          <DialogHeader>
            <DialogTitle>Delete Workspace?</DialogTitle>
          </DialogHeader>
          <p className="mt-2">
            Are you sure you want to delete this workspace? This action cannot
            be undone.
          </p>
          <DialogFooter className="flex justify-end gap-2 mt-4">
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
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Settings;

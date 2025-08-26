import { projectSchema } from "@/lib/schema";
import { ProjectStatus, type MemberProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { Checkbox } from "../ui/checkbox";
import { UseCreateProject } from "@/hooks/use-project";
import { toast } from "sonner";
import { useState } from "react";
import { ZodError } from "zod/v3";

interface CreateProjectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  workspaceMembers: MemberProps[];
}

export type CreateProjectFormData = z.infer<typeof projectSchema>;

export const CreateProjectDialog = ({
  isOpen,
  onOpenChange,
  workspaceId,
  workspaceMembers,
}: CreateProjectDialogProps) => {
  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      status: ProjectStatus.Backlog,
      startDate: "",
      dueDate: "",
      members: [],
      // tags: undefined,
    },
  });
  const { mutate, isPending } = UseCreateProject();

  const onSubmit = (values: CreateProjectFormData) => {
    console.log("Submitting payload:", values);
    if (!workspaceId) return;

    mutate(
      {
        projectData: values,
        workspaceId,
      },
      {
        onSuccess: () => {
          toast.success("Project created successfully");
          form.reset();
          onOpenChange(false);
        },
        onError: (error: any) => {
          if (error instanceof ZodError) {
            const errorMessage = error.errors
              .map((err) => err.message)
              .join(", ");
            toast.error(errorMessage);
          } else if (error.response?.data?.message) {
            toast.error(error.response.data.message);
          } else {
            toast.error("Invalid input form value");
          }
          console.log(error);
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>
            Create a new project to get started
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Project Title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Project Description"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Status</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Project Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(ProjectStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Start & Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Popover modal>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="size-4 mr-2" />
                            {field.value
                              ? format(new Date(field.value), "PPPP")
                              : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(date) =>
                              field.onChange(date?.toISOString() || "")
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Popover modal>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="size-4 mr-2" />
                            {field.value
                              ? format(new Date(field.value), "PPPP")
                              : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(date) =>
                              field.onChange(date?.toISOString() || "")
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage /> {/* <-- This will show the dueDate error */}
                  </FormItem>
                )}
              />
            </div>

            {/* Tags */}
            {/* <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Tags separated by comma" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            {/* Members */}
            <FormField
              control={form.control}
              name="members"
              render={({ field }) => {
                const selectedMembers = field.value || [];
                const [popoverOpen, setPopoverOpen] = useState(false);

                return (
                  <FormItem>
                    <FormLabel>Members</FormLabel>
                    <FormControl>
                      <Popover
                        modal
                        open={popoverOpen}
                        onOpenChange={setPopoverOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button className="w-full justify-start text-left">
                            {selectedMembers.length === 0 ? (
                              <span className="text-white">Select Members</span>
                            ) : selectedMembers.length <= 2 ? (
                              selectedMembers
                                .map((m) => {
                                  const member = workspaceMembers.find(
                                    (wm) => wm.user._id === m.user
                                  );
                                  return member
                                    ? `${member.user.name} (${m.role})`
                                    : "Unknown";
                                })
                                .join(", ")
                            ) : (
                              `${selectedMembers.length} members selected`
                            )}
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent
                          className="pointer-events-auto w-full max-w-100 overflow-y-auto"
                          align="start"
                          onInteractOutside={(e) => {
                            if (
                              (e.target as HTMLElement).closest(
                                ".prevent-close"
                              )
                            ) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <div className="flex flex-col gap-2">
                            {workspaceMembers.map((member) => {
                              const isSelected = selectedMembers.some(
                                (m) => m.user === member.user._id
                              );
                              const selectedMember = selectedMembers.find(
                                (m) => m.user === member.user._id
                              );

                              return (
                                <div
                                  key={member._id}
                                  className="prevent-close flex items-center gap-2 p-2 border rounded"
                                >
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={(checked) => {
                                      const isChecked = checked === true;
                                      field.onChange(
                                        isChecked
                                          ? [
                                              ...selectedMembers,
                                              {
                                                user: member.user._id,
                                                role: "contributor",
                                              },
                                            ]
                                          : selectedMembers.filter(
                                              (m) => m.user !== member.user._id
                                            )
                                      );
                                    }}
                                    id={`member-${member.user._id}`}
                                  />
                                  <span className="truncate flex-1">
                                    {member.user.name}
                                  </span>

                                  {isSelected && (
                                    <Select
                                      value={selectedMember?.role}
                                      onValueChange={(role) => {
                                        field.onChange(
                                          selectedMembers.map((m) =>
                                            m.user === member.user._id
                                              ? { ...m, role }
                                              : m
                                          )
                                        );
                                      }}
                                    >
                                      <SelectTrigger className="min-w-[100px]">
                                        <SelectValue placeholder="Role" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="manager">
                                          Manager
                                        </SelectItem>
                                        <SelectItem value="contributor">
                                          Contributor
                                        </SelectItem>
                                        <SelectItem value="viewer">
                                          Viewer
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

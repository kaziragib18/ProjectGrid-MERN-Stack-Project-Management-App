import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import CustomLoader from "@/components/ui/customLoader";
import type { WorkspaceForm } from "@/components/workspace/create-workspace";
import { workspaceSchema } from "@/lib/schema";
import { fetchData, updateData } from "@/lib/fetch-util";
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
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<WorkspaceForm>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: "",
      description: "",
      color: colorOptions[0],
    },
  });

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

  useEffect(() => {
    const loadWorkspace = async () => {
      setLoading(true);
      try {
        const data = await fetchData<WorkspaceForm>(
          `/workspaces/${workspaceId}`
        );
        form.reset({
          name: data.name,
          description: data.description || "",
          color: data.color || colorOptions[0],
        });
      } catch {
        toast.error("Failed to load workspace details");
      } finally {
        setLoading(false);
      }
    };

    loadWorkspace();
  }, [workspaceId, form]);

  const onSubmit = async (data: WorkspaceForm) => {
    setIsSubmitting(true);
    try {
      await updateData(`/workspaces/${workspaceId}`, data);
      toast.success("Workspace updated successfully!");
      form.reset(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <CustomLoader />;

  return (
    <main className="max-w-xl mx-auto py-8 px-4">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Workspace Settings</h1>
        <p className="text-muted-foreground mt-1">
          Update the details of your workspace below.
        </p>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-6">
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
                            "w-6 h-6 rounded-full cursor-pointer hover:opacity-80 transition-all duration-300",
                            field.value === color &&
                              "ring-2 ring-offset-2 ring-blue-500"
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
          </div>

          <div className="mt-8">
            <Button
              type="submit"
              className="bg-black text-white hover:bg-teal-600 transition-colors duration-200"
              disabled={isSubmitting}
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
    </main>
  );
};

export default Settings;

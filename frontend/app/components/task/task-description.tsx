import { useUpdateTaskDescriptionMutation } from "@/hooks/use-task";
import { Edit, Check, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

export const TaskDescription = ({
  description,
  taskId,
}: {
  description: string;
  taskId: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newDescription, setNewDescription] = useState(description);
  const { mutate, isPending } = useUpdateTaskDescriptionMutation();

  const updateDescription = () => {
    mutate(
      { taskId, description: newDescription },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success("Description updated successfully");
        },
        onError: (error: any) => {
          const errorMessage = error.response.data.message;
          toast.error(errorMessage);
          console.error(error);
        },
      }
    );
  };

  const cancelEdit = () => {
    setNewDescription(description);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-start gap-3">
      {isEditing ? (
        <>
          <Textarea
            className="flex-grow min-w-0 resize-none"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            disabled={isPending}
            rows={4}
            placeholder="Update task description..."
            autoFocus
          />
          <div className="flex space-x-2 items-center">
            <Button
              className="hover:bg-teal-600 hover:text-white"
              size="sm"
              variant="default"
              onClick={updateDescription}
              disabled={isPending || newDescription.trim().length === 0}
            >
              <Check className="mr-1 size-4" />
            </Button>
            <Button
              className="hover:bg-red-600 hover:text-white"
              size="sm"
              variant="outline"
              onClick={cancelEdit}
              disabled={isPending}
            >
              <X className="mr-1 size-4" />
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm md:text-base text-muted-foreground flex-grow whitespace-pre-wrap">
            {description || "No description provided."}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="p-1"
            onClick={() => setIsEditing(true)}
            aria-label="Edit description"
          >
            <Edit className="size-4 text-muted-foreground hover:text-primary" />
          </Button>
        </>
      )}
    </div>
  );
};

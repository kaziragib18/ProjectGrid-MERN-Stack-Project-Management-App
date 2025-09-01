import { useState } from "react";
import { Input } from "../ui/input";
import { Edit, Check, X } from "lucide-react";
import { Button } from "../ui/button";
import { useUpdateTaskTitleMutation } from "@/hooks/use-task";
import { toast } from "sonner";

export const TaskTitle = ({
  title,
  taskId,
}: {
  title: string;
  taskId: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);

  const { mutate, isPending } = useUpdateTaskTitleMutation();

  const updateTitle = () => {
    if (!newTitle.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    mutate(
      { taskId, title: newTitle.trim() },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success("Title updated successfully");
        },
        onError: (error: any) => {
          const errorMessage =
            error.response?.data?.message || "Error updating title";
          toast.error(errorMessage);
          console.error(error);
        },
      }
    );
  };

  const cancelEdit = () => {
    setNewTitle(title);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-3 w-full max-w-full">
      {isEditing ? (
        <>
          <Input
            className="text-xl font-semibold flex-grow min-w-0"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            disabled={isPending}
            autoFocus
            aria-label="Edit task title"
          />
          <div className="flex gap-2">
            <Button
              className="hover:bg-teal-600 hover:text-white"
              size="sm"
              variant="default"
              onClick={updateTitle}
              disabled={isPending || newTitle.trim().length === 0}
              aria-label="Save title"
            >
              <Check className="mr-1 size-4" />
            </Button>
            <Button
              className="hover:bg-red-600 hover:text-white"
              size="sm"
              variant="outline"
              onClick={cancelEdit}
              disabled={isPending}
              aria-label="Cancel editing title"
            >
              <X className="mr-1 size-4" />
            </Button>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-xl font-semibold flex-grow truncate">{title}</h2>
          <Button
            variant="ghost"
            size="sm"
            className="p-1"
            onClick={() => setIsEditing(true)}
            aria-label="Edit title"
          >
            <Edit className="size-5 text-muted-foreground hover:text-primary" />
          </Button>
        </>
      )}
    </div>
  );
};

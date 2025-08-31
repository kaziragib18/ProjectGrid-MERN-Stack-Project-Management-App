import { useState } from "react";
import { Input } from "../ui/input";
import { Edit } from "lucide-react";
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
    mutate(
      { taskId, title: newTitle },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success("Title updated successfully");
        },
        onError: (error: any) => {
          const errorMessage = error.response.data.massage;
          toast.error(errorMessage);
          console.log(error);
        },
      }
    );
    // API call to update the title
    // Example: await api.updateTaskTitle(taskId, newTitle);
  };

  return (
    <div className="flex items-center gap-2">
      {isEditing ? (
        <Input
          className="text-xl! font-semibold w-full min-w-3xl"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
      ) : (
        <h2 className="text-xl flex-1 font-semibold">{title}</h2>
      )}
      {isEditing ? (
        <Button
          className="py-0 hover:bg-teal-600"
          size="sm"
          onClick={updateTitle}
          disabled={isPending}
        >
          Save
        </Button>
      ) : (
        <Edit
          className="cursor-pointer size-4"
          onClick={() => setIsEditing(true)}
        />
      )}
    </div>
  );
};

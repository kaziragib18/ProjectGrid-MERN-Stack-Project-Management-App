import type { Subtask } from "@/types";
import { useState } from "react";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  useAddSubTaskMutation,
  useUpdateSubTaskMutation,
} from "@/hooks/use-task";
import { toast } from "sonner";

export const SubTasksDetails = ({
  subTasks,
  taskId,
}: {
  subTasks: Subtask[];
  taskId: string;
}) => {
  const [newSubTask, setNewSubTask] = useState("");
  const { mutate: addSubTask, isPending: isAdding } = useAddSubTaskMutation();
  const { mutate: updateSubTask, isPending: isUpdating } =
    useUpdateSubTaskMutation();

  const handleToggleTask = (subTaskId: string, checked: boolean) => {
    updateSubTask(
      { taskId, subTaskId, completed: checked },
      {
        onSuccess: () => {
          toast.success("Subtask updated successfully");
        },
        onError: (error: any) => {
          const errMessage =
            error?.response?.data?.message || "Error updating subtask";
          console.error(error);
          toast.error(errMessage);
        },
      }
    );
  };

  const handleAddSubTask = () => {
    if (newSubTask.trim().length === 0) return;

    addSubTask(
      { taskId, title: newSubTask.trim() },
      {
        onSuccess: () => {
          setNewSubTask("");
          toast.success("Subtask added successfully");
        },
        onError: (error: any) => {
          const errMessage =
            error?.response?.data?.message || "Error adding subtask";
          console.error(error);
          toast.error(errMessage);
        },
      }
    );
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-muted-foreground mb-3">
        Subtasks
      </h3>

      <div className="space-y-3 mb-4">
        {subTasks.length > 0 ? (
          subTasks.map((subTask) => (
            <label
              key={subTask._id}
              htmlFor={subTask._id}
              className={cn(
                "flex items-center cursor-pointer select-none",
                subTask.completed ? "opacity-70" : "opacity-100",
                "transition-opacity duration-200 ease-in-out"
              )}
            >
              <Checkbox
                id={subTask._id}
                checked={subTask.completed}
                onCheckedChange={(checked) =>
                  handleToggleTask(subTask._id, !!checked)
                }
                disabled={isUpdating}
                className="mr-3 shrink-0"
              />
              <span
                className={cn(
                  "text-sm break-words",
                  subTask.completed ? "line-through text-muted-foreground" : ""
                )}
              >
                {subTask.title}
              </span>
            </label>
          ))
        ) : (
          <div className="text-sm text-muted-foreground italic">
            No subtasks yet
          </div>
        )}
      </div>

      <div className="flex flex-col space-y-2">
        <Input
          placeholder="Add a subtask"
          value={newSubTask}
          onChange={(e) => setNewSubTask(e.target.value)}
          disabled={isAdding}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddSubTask();
            }
          }}
          aria-label="Add new subtask"
        />
        <Button
          onClick={handleAddSubTask}
          disabled={isAdding || newSubTask.trim().length === 0}
          className="self-start whitespace-nowrap"
        >
          Add
        </Button>
      </div>
    </div>
  );
};

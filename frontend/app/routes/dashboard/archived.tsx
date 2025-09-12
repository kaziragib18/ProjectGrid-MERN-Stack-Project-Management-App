import {
  useArchivedTasksQuery,
  useArchivedTaskMutation,
} from "@/hooks/use-task";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Task, User } from "@/types";
import CustomLoader from "@/components/ui/customLoader";
import { useNavigate } from "react-router";
import { ArchiveX, Search, X } from "lucide-react";
import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ArchivedTasksResponse {
  tasks: Task[];
  total: number;
}

const ITEMS_PER_PAGE = 7;

// Priority badge classes
const getPriorityBadgeClass = (priority: string) => {
  switch (priority) {
    case "High":
      return "bg-red-50 text-red-800";
    case "Low":
      return "bg-green-50 text-green-800";
    default:
      return "bg-yellow-50 text-yellow-800"; // Medium
  }
};

// Status badge classes
const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "To Do":
      return "bg-blue-50 text-blue-800";
    case "In Progress":
      return "bg-indigo-50 text-indigo-800";
    case "Completed":
      return "bg-green-50 text-green-800";
    case "Archived":
      return "bg-gray-50 text-gray-800";
    case "Review":
      return "bg-purple-50 text-purple-800";
    case "Blocked":
      return "bg-red-50 text-red-800";
    case "On Hold":
      return "bg-yellow-50 text-yellow-800";
    case "Cancelled":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-50 text-gray-800";
  }
};

const Archived = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("");

  const { data, isLoading } = useArchivedTasksQuery() as {
    data: ArchivedTasksResponse | undefined;
    isLoading: boolean;
  };

  const { mutate: toggleArchive, isPending } = useArchivedTaskMutation();

  const handleUnarchive = (taskId: string) => {
    toggleArchive(
      { taskId },
      {
        onSuccess: () => toast.success("Task unarchived"),
        onError: () => toast.error("Failed to unarchive task"),
      }
    );
  };

  const goToTask = (task: Task) => {
    if (task.project && task.project._id && task.project.workspace) {
      navigate(
        `/workspaces/${task.project.workspace._id}/projects/${task.project._id}/tasks/${task._id}`
      );
    } else {
      toast.error("Project or workspace information missing");
    }
  };

  // Extract all assignees for filter
  const allAssignees: User[] = useMemo(() => {
    if (!data) return [];
    const assigneesMap: Record<string, User> = {};
    data.tasks.forEach((task) => {
      task.assignees.forEach((a) => {
        assigneesMap[a._id] = a;
      });
    });
    return Object.values(assigneesMap);
  }, [data]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    if (!data) return [];
    return data.tasks.filter((task) => {
      const matchesSearch =
        searchText === "" ||
        task.title.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = filterStatus === "" || task.status === filterStatus;
      const matchesPriority =
        filterPriority === "" || task.priority === filterPriority;
      const matchesAssignee =
        filterAssignee === "" ||
        task.assignees.some((a) => a._id === filterAssignee);
      return (
        matchesSearch && matchesStatus && matchesPriority && matchesAssignee
      );
    });
  }, [data, searchText, filterStatus, filterPriority, filterAssignee]);

  // Pagination
  const totalPages = Math.max(
    Math.ceil(filteredTasks.length / ITEMS_PER_PAGE),
    1
  );
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const paginatedTasks = filteredTasks.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  if (page > totalPages) setPage(1);

  const clearFilters = () => {
    setSearchText("");
    setFilterStatus("");
    setFilterPriority("");
    setFilterAssignee("");
    setPage(1);
  };

  return (
    <div className="p-6 w-full max-w-full mx-auto">
      <h1 className="text-3xl font-bold mb-6">Archived Tasks</h1>

      {isLoading ? (
        <CustomLoader />
      ) : (
        <>
          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative w-full md:w-1/4">
              <Input
                type="text"
                placeholder="Search tasks..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setPage(1);
                }}
                className="pr-10"
              />
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
              {/* Status */}
              <Select
                value={filterStatus || "all"}
                onValueChange={(value) =>
                  setFilterStatus(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="To Do">To Do</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              {/* Priority */}
              <Select
                value={filterPriority || "all"}
                onValueChange={(value) =>
                  setFilterPriority(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>

              {/* Assignee */}
              <Select
                value={filterAssignee || "all"}
                onValueChange={(value) =>
                  setFilterAssignee(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="All Assignees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  {allAssignees.map((a) => (
                    <SelectItem key={a._id} value={a._id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                size="sm"
                variant="ghost"
                className="flex items-center gap-1 border border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition"
                onClick={clearFilters}
              >
                <X className="w-4 h-4" /> Clear Filters
              </Button>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <p className="text-center text-muted-foreground mt-6">
              No archived tasks
            </p>
          ) : (
            <>
              {/* Desktop / Tablet Table View */}
              <div className="hidden md:block overflow-x-auto w-full">
                <table className="w-full table-auto border-collapse border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-left border-b border-gray-200 w-[20%]">
                        Title
                      </th>
                      <th className="p-3 text-left border-b border-gray-200 w-[10%]">
                        Priority
                      </th>
                      <th className="p-3 text-left border-b border-gray-200 w-[10%]">
                        Status
                      </th>
                      <th className="p-3 text-left border-b border-gray-200 w-[15%]">
                        Project
                      </th>
                      <th className="p-3 text-left border-b border-gray-200 w-[10%]">
                        Due Date
                      </th>
                      <th className="p-3 text-left border-b border-gray-200 w-[15%]">
                        Assignees
                      </th>
                      <th className="p-3 text-left border-b border-gray-200 w-[15%]">
                        Created At
                      </th>
                      <th className="p-3 text-center border-b border-gray-200 w-[5%]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTasks.map((task) => (
                      <tr
                        key={task._id}
                        className="hover:bg-gray-50 transition cursor-pointer"
                        onClick={() => goToTask(task)}
                      >
                        <td className="p-3">{task.title}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityBadgeClass(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeClass(
                              task.status
                            )}`}
                          >
                            {task.status}
                          </span>
                        </td>
                        <td className="p-3">{task.project.title}</td>
                        <td className="p-3">
                          {task.dueDate
                            ? format(new Date(task.dueDate), "PP")
                            : "-"}
                        </td>
                        <td className="p-3">
                          {task.assignees.length > 0
                            ? task.assignees.map((a) => a.name).join(", ")
                            : "-"}
                        </td>
                        <td className="p-3">
                          {format(new Date(task.createdAt), "PPpp")}
                        </td>
                        <td className="p-3 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-1 border-gray-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnarchive(task._id);
                            }}
                            disabled={isPending}
                          >
                            <ArchiveX className="w-4 h-4" /> Unarchive
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden flex flex-col gap-4">
                {paginatedTasks.map((task) => (
                  <div
                    key={task._id}
                    className="border rounded-lg p-4 shadow-sm flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-start">
                      <h2 className="font-semibold">{task.title}</h2>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityBadgeClass(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span>Status: {task.status}</span>
                      <span>Project: {task.project.title}</span>
                      <span>
                        Due:{" "}
                        {task.dueDate
                          ? format(new Date(task.dueDate), "PP")
                          : "-"}
                      </span>
                      <span>
                        Assignees:{" "}
                        {task.assignees.length > 0
                          ? task.assignees.map((a) => a.name).join(", ")
                          : "-"}
                      </span>
                      <span>
                        Created: {format(new Date(task.createdAt), "PPpp")}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1 border-gray-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 mt-2"
                      onClick={() => handleUnarchive(task._id)}
                      disabled={isPending}
                    >
                      <ArchiveX className="w-4 h-4" /> Unarchive
                    </Button>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm font-medium">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Archived;

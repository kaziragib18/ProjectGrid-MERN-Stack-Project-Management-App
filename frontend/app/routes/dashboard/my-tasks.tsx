import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CustomLoader from "@/components/ui/customLoader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetMyTasksQuery } from "@/hooks/use-task";
import type { Task } from "@/types";
import { format } from "date-fns";
import { ArrowUpRight, CheckCircle, Clock, FilterIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";

/**
 * Returns badge props (variant & className) for task status with modern colors
 */
const getStatusBadgeProps = (status: string) => {
  switch (status) {
    case "Completed":
      return {
        variant: "default" as const,
        className: "bg-green-100 text-green-800",
      };
    case "In Progress":
      return {
        variant: "default" as const,
        className: "bg-orange-100 text-orange-800",
      };
    case "To Do":
      return {
        variant: "default" as const,
        className: "bg-gray-200 text-black-800",
      };
    default:
      return { variant: "default" as const, className: "" };
  }
};

/**
 * Returns badge props for priority with modern colors
 */
const getPriorityBadgeProps = (priority: string) => {
  switch (priority) {
    case "High":
      return {
        variant: "destructive" as const,
        className: "",
      };
    case "Low":
      return {
        variant: "default" as const,
        className: "bg-blue-100 text-blue-800",
      };
    default:
      return {
        variant: "secondary" as const,
        className: "",
      };
  }
};

// Mapping of filter keys to user-friendly labels
const FILTER_LABELS: Record<string, string> = {
  all: "All Tasks",
  todo: "To Do",
  inprogress: "In Progress",
  completed: "Completed",
  archieved: "Archived",
  high: "High Priority",
};

const TASKS_PER_PAGE = 7;

/**
 * Main component to display and manage "My Tasks"
 */
const MyTasks = () => {
  // URL params and initial filter/sort/search state
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get("filter") || "all";
  const initialSort = searchParams.get("sort") || "desc";
  const initialSearch = searchParams.get("search") || "";

  // Local UI state
  const [filter, setFilter] = useState<string>(initialFilter);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    initialSort === "asc" ? "asc" : "desc"
  );
  const [search, setSearch] = useState<string>(initialSearch);

  // Pagination state (page starts at 1)
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Update URL params when filter/sort/search changes
  useEffect(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => (params[key] = value));

    params.filter = filter;
    params.sort = sortDirection;
    params.search = search;

    setSearchParams(params, { replace: true });
    setCurrentPage(1); // reset to first page on filter/sort/search change
  }, [filter, sortDirection, search]);

  // Sync state if URL params change externally
  useEffect(() => {
    const urlFilter = searchParams.get("filter") || "all";
    const urlSort = searchParams.get("sort") || "desc";
    const urlSearch = searchParams.get("search") || "";

    if (urlFilter !== filter) setFilter(urlFilter);
    if (urlSort !== sortDirection)
      setSortDirection(urlSort === "asc" ? "asc" : "desc");
    if (urlSearch !== search) setSearch(urlSearch);
  }, [searchParams]);

  // Fetch tasks assigned to user
  const { data: myTasks, isLoading } = useGetMyTasksQuery() as {
    data: Task[];
    isLoading: boolean;
  };

  // Filter tasks by status and search term
  const filteredTasks = myTasks?.length
    ? myTasks
        .filter((task) => {
          if (filter === "all") return true;
          if (filter === "todo") return task.status === "To Do";
          if (filter === "inprogress") return task.status === "In Progress";
          if (filter === "completed") return task.status === "Completed";
          if (filter === "archieved") return task.isArchived === true;
          if (filter === "high") return task.priority === "High";
          return true;
        })
        .filter((task) =>
          [task.title, task.description]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase())
        )
    : [];

  // Sort tasks by due date
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.dueDate && b.dueDate) {
      return sortDirection === "asc"
        ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    }
    return 0;
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedTasks.length / TASKS_PER_PAGE);
  const paginatedTasks = sortedTasks.slice(
    (currentPage - 1) * TASKS_PER_PAGE,
    currentPage * TASKS_PER_PAGE
  );

  // Divide tasks by status (for board view)
  const todoTasks = sortedTasks.filter((task) => task.status === "To Do");
  const inProgressTasks = sortedTasks.filter(
    (task) => task.status === "In Progress"
  );
  const completedTasks = sortedTasks.filter(
    (task) => task.status === "Completed"
  );

  // Loading state
  if (isLoading) return <CustomLoader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">My Tasks</h1>

        {/* Sorting and filtering */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
          {/* Sort button toggles ascending/descending */}
          <Button
            variant="outline"
            onClick={() =>
              setSortDirection(sortDirection === "asc" ? "desc" : "asc")
            }
          >
            {sortDirection === "asc" ? "Oldest First" : "Newest First"}
          </Button>

          {/* Filter dropdown shows current filter in button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <FilterIcon className="w-4 h-4 mr-1" />
                {FILTER_LABELS[filter] || "Filter"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filter Tasks</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(FILTER_LABELS).map(([key, label]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => setFilter(key)}
                  className={key === filter ? "font-semibold" : ""}
                >
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search input */}
      <Input
        placeholder="Search tasks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      {/* Tabs for List View and Board View */}
      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="board">Board View</TabsTrigger>
        </TabsList>

        {/* === LIST VIEW with Pagination === */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>My Tasks</CardTitle>
              <CardDescription>
                {sortedTasks.length} tasks assigned to you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {paginatedTasks.map((task) => {
                  const statusBadge = getStatusBadgeProps(task.status);
                  const priorityBadge = task.priority
                    ? getPriorityBadgeProps(task.priority)
                    : null;
                  return (
                    <div
                      key={task._id}
                      className="p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Left: status icon, title, badges */}
                        <div className="flex items-start gap-3">
                          {task.status === "Completed" ? (
                            <CheckCircle className="size-5 text-green-500 mt-1" />
                          ) : (
                            <Clock className="size-5 text-yellow-500 mt-1" />
                          )}
                          <div>
                            <Link
                              to={`/workspaces/${task.project.workspace}/projects/${task.project._id}/tasks/${task._id}`}
                              className="font-medium hover:text-primary hover:underline flex items-center"
                            >
                              {task.title}
                              <ArrowUpRight className="size-4 ml-1" />
                            </Link>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <Badge
                                variant={statusBadge.variant}
                                className={statusBadge.className}
                              >
                                {task.status}
                              </Badge>
                              {priorityBadge && (
                                <Badge
                                  variant={priorityBadge.variant}
                                  className={priorityBadge.className}
                                >
                                  {task.priority}
                                </Badge>
                              )}
                              {task.isArchived && (
                                <Badge variant="outline">Archived</Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: due date, project, updated */}
                        <div className="text-sm text-muted-foreground space-y-1">
                          {task.dueDate && (
                            <div>Due: {format(task.dueDate, "PPPP")}</div>
                          )}
                          <div>
                            Project:{" "}
                            <span className="font-medium">
                              {task.project.title}
                            </span>
                          </div>
                          <div>Updated: {format(task.updatedAt, "PPPP")}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {sortedTasks.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No tasks found.
                  </div>
                )}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-center space-x-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-3">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* === BOARD VIEW === */}
        <TabsContent value="board">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "To Do", tasks: todoTasks },
              { title: "In Progress", tasks: inProgressTasks },
              { title: "Completed", tasks: completedTasks },
            ].map(({ title, tasks }) => (
              <Card key={title} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {title}
                    <Badge variant="outline">{tasks.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 py-3 space-y-4 max-h-[600px] overflow-y-auto">
                  {tasks.map((task) => {
                    const priorityBadge = task.priority
                      ? getPriorityBadgeProps(task.priority)
                      : null;
                    return (
                      <Card
                        key={task._id}
                        className="p-4 border rounded-md shadow-sm hover:shadow-md transition-shadow"
                      >
                        <Link
                          to={`/workspaces/${task.project.workspace}/projects/${task.project._id}/tasks/${task._id}`}
                          className="block space-y-2"
                        >
                          <h3 className="font-semibold">{task.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {task.description || "No description"}
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            {priorityBadge && (
                              <Badge
                                variant={priorityBadge.variant}
                                className={priorityBadge.className}
                              >
                                {task.priority}
                              </Badge>
                            )}
                            {task.dueDate && (
                              <span className="text-xs text-muted-foreground">
                                {format(task.dueDate, "PPPP")}
                              </span>
                            )}
                          </div>
                        </Link>
                      </Card>
                    );
                  })}
                  {tasks.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-4">
                      No tasks in this column.
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyTasks;

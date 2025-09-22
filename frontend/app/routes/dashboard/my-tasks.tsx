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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetMyTasksQuery } from "@/hooks/use-task";
import type { Task } from "@/types";
import { format } from "date-fns";
import { CheckCircle, Clock, FilterIcon, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

/** Badge helpers */
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

const getPriorityBadgeProps = (priority: string) => {
  switch (priority) {
    case "High":
      return { variant: "destructive" as const, className: "" };
    case "Low":
      return {
        variant: "default" as const,
        className: "bg-blue-100 text-blue-800",
      };
    default:
      return { variant: "secondary" as const, className: "" };
  }
};

// Filter options
const STATUS_FILTERS: Record<string, string> = {
  all: "All Status",
  todo: "To Do",
  inprogress: "In Progress",
  completed: "Completed",
  archieved: "Archived",
};

const PRIORITY_FILTERS: Record<string, string> = {
  all: "All Priorities",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const TASKS_PER_PAGE = 6;

const MyTasks = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialStatusFilter = searchParams.get("status") || "all";
  const initialPriorityFilter = searchParams.get("priority") || "all";
  const initialSort = searchParams.get("sort") || "desc";
  const initialSearch = searchParams.get("search") || "";

  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);
  const [priorityFilter, setPriorityFilter] = useState<string>(
    initialPriorityFilter
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    initialSort === "asc" ? "asc" : "desc"
  );
  const [search, setSearch] = useState<string>(initialSearch);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [tab, setTab] = useState<"list" | "board">("list");

  /** Update URL params on filter/sort/search change */
  useEffect(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => (params[key] = value));
    params.status = statusFilter;
    params.priority = priorityFilter;
    params.sort = sortDirection;
    params.search = search;
    setSearchParams(params, { replace: true });
    setCurrentPage(1);
  }, [statusFilter, priorityFilter, sortDirection, search]);

  /** Sync URL changes */
  useEffect(() => {
    const urlStatus = searchParams.get("status") || "all";
    const urlPriority = searchParams.get("priority") || "all";
    const urlSort = searchParams.get("sort") || "desc";
    const urlSearch = searchParams.get("search") || "";
    if (urlStatus !== statusFilter) setStatusFilter(urlStatus);
    if (urlPriority !== priorityFilter) setPriorityFilter(urlPriority);
    if (urlSort !== sortDirection)
      setSortDirection(urlSort === "asc" ? "asc" : "desc");
    if (urlSearch !== search) setSearch(urlSearch);
  }, [searchParams]);

  const { data: myTasks, isLoading } = useGetMyTasksQuery() as {
    data: Task[];
    isLoading: boolean;
  };

  /** Apply filters */
  const filteredTasks = myTasks?.length
    ? myTasks
        .filter((task) => {
          if (statusFilter === "all") return true;
          if (statusFilter === "todo") return task.status === "To Do";
          if (statusFilter === "inprogress")
            return task.status === "In Progress";
          if (statusFilter === "completed") return task.status === "Completed";
          if (statusFilter === "archieved") return task.isArchived === true;
          return true;
        })
        .filter((task) => {
          if (priorityFilter === "all") return true;
          if (priorityFilter === "high") return task.priority === "High";
          if (priorityFilter === "medium") return task.priority === "Medium";
          if (priorityFilter === "low") return task.priority === "Low";
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

  /** Sort */
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.dueDate && b.dueDate) {
      return sortDirection === "asc"
        ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedTasks.length / TASKS_PER_PAGE);
  const paginatedTasks = sortedTasks.slice(
    (currentPage - 1) * TASKS_PER_PAGE,
    currentPage * TASKS_PER_PAGE
  );

  const todoTasks = sortedTasks.filter((task) => task.status === "To Do");
  const inProgressTasks = sortedTasks.filter(
    (task) => task.status === "In Progress"
  );
  const completedTasks = sortedTasks.filter(
    (task) => task.status === "Completed"
  );

  if (isLoading) return <CustomLoader />;

  /** Clear filters */
  const clearFilters = () => {
    setStatusFilter("all");
    setPriorityFilter("all");
    setSearch("");
    setSortDirection("desc");
  };

  /** Navigate to task */
  const goToTask = (task: Task) => {
    navigate(
      `/workspaces/${task.project.workspace}/projects/${task.project._id}/tasks/${task._id}`
    );
  };

  return (
    <div className="container mx-auto space-y-6 px-4">
      {/* Header with toggle, search, filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">My Tasks</h1>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full md:w-auto">
          {/* View toggle */}
          <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as "list" | "board")}
          >
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="board">Board View</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10 py-2"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          {/* Status filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <FilterIcon className="w-4 h-4 mr-1" />
                {STATUS_FILTERS[statusFilter]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Status Filter</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(STATUS_FILTERS).map(([key, label]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={key === statusFilter ? "font-semibold" : ""}
                >
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Priority filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <FilterIcon className="w-4 h-4 mr-1" />
                {PRIORITY_FILTERS[priorityFilter]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Priority Filter</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(PRIORITY_FILTERS).map(([key, label]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => setPriorityFilter(key)}
                  className={key === priorityFilter ? "font-semibold" : ""}
                >
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort button */}
          <Button
            variant="outline"
            onClick={() =>
              setSortDirection(sortDirection === "asc" ? "desc" : "asc")
            }
          >
            {sortDirection === "asc" ? "Oldest First" : "Newest First"}
          </Button>

          {/* Clear filters */}
          <Button
            variant="secondary"
            onClick={clearFilters}
            className="flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </Button>
        </div>
      </div>

      {/* === LIST VIEW === */}
      {tab === "list" && (
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
                    onClick={() => goToTask(task)}
                    className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: icon + title + badges */}
                      <div className="flex items-start gap-3">
                        {task.status === "Completed" ? (
                          <CheckCircle className="size-5 text-green-500 mt-1" />
                        ) : (
                          <Clock className="size-5 text-yellow-500 mt-1" />
                        )}
                        <div>
                          {/* Task title */}
                          <div className="font-medium hover:text-primary">
                            {task.title}
                          </div>

                          {/* Status / Priority / Archived badges */}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
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

                      {/* Right: metadata */}
                      <div className="text-sm text-muted-foreground space-y-1 text-right md:text-left">
                        {task.dueDate && (
                          <div>Created: {format(task.createdAt, "PPPP")}</div>
                        )}
                        <div>
                          Project:{" "}
                          <span className="font-medium">
                            {task.project?.title || "Project unavailable"}
                          </span>
                        </div>
                        <div className="text-amber-600">
                          Due: {format(task.dueDate, "PPPP")}
                        </div>
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
      )}

      {/* === BOARD VIEW === */}
      {tab === "board" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* To Do */}
          <Card>
            <CardHeader>
              <CardTitle>
                To Do{" "}
                <Badge variant="secondary" className="ml-2">
                  {todoTasks.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {todoTasks.map((task) => {
                const priorityBadge = task.priority
                  ? getPriorityBadgeProps(task.priority)
                  : null;
                return (
                  <div
                    key={task._id}
                    onClick={() => goToTask(task)}
                    className="p-3 bg-muted rounded cursor-pointer hover:bg-muted/70"
                  >
                    <div className="font-semibold">{task.title}</div>
                    <div className="flex flex-wrap gap-2 mt-1">
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
                );
              })}
              {todoTasks.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No tasks in To Do.
                </div>
              )}
            </CardContent>
          </Card>

          {/* In Progress */}
          <Card>
            <CardHeader>
              <CardTitle>
                In Progress{" "}
                <Badge variant="secondary" className="ml-2">
                  {inProgressTasks.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {inProgressTasks.map((task) => {
                const priorityBadge = task.priority
                  ? getPriorityBadgeProps(task.priority)
                  : null;
                return (
                  <div
                    key={task._id}
                    onClick={() => goToTask(task)}
                    className="p-3 bg-muted rounded cursor-pointer hover:bg-muted/70"
                  >
                    <div className="font-semibold">{task.title}</div>
                    <div className="flex flex-wrap gap-2 mt-1">
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
                );
              })}
              {inProgressTasks.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No tasks in progress.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Completed */}
          <Card>
            <CardHeader>
              <CardTitle>
                Completed{" "}
                <Badge variant="secondary" className="ml-2">
                  {completedTasks.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {completedTasks.map((task) => {
                const priorityBadge = task.priority
                  ? getPriorityBadgeProps(task.priority)
                  : null;
                return (
                  <div
                    key={task._id}
                    onClick={() => goToTask(task)}
                    className="p-3 bg-muted rounded cursor-pointer hover:bg-muted/70"
                  >
                    <div className="font-semibold">{task.title}</div>
                    <div className="flex flex-wrap gap-2 mt-1">
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
                );
              })}
              {completedTasks.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No completed tasks.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MyTasks;

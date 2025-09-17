import { RecentProjects } from "@/components/dashboard/recent-projects";
import { StatsCard } from "@/components/dashboard/stat-card";
import { StatisticsCharts } from "@/components/dashboard/statistics-charts";
import CustomLoader from "@/components/ui/customLoader";
import { UpcomingTasks } from "@/components/dashboard/upcoming-tasks";
import {
  useGetWorkspaceStatsQuery,
  useGetWorkspacesQuery,
} from "@/hooks/use-workspace";
import type {
  Project,
  ProjectStatusData,
  StatsCardProps,
  Task,
  TaskPriorityData,
  TaskTrendsData,
  Workspace,
  WorkspaceProductivityData,
} from "@/types";
import { useSearchParams } from "react-router";
import { useMemo } from "react";

interface WorkspaceStatsData {
  stats: StatsCardProps;
  taskTrendsData: TaskTrendsData[];
  projectStatusData: ProjectStatusData[];
  taskPriorityData: TaskPriorityData[];
  workspaceProductivityData: WorkspaceProductivityData[];
  upcomingTasks: Task[];
  recentProjects: Project[];
}

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const {
    data: workspaces = [],
    isLoading: workspacesLoading,
    isError: workspacesError,
  } = useGetWorkspacesQuery() as {
    data: Workspace[];
    isLoading: boolean;
    isError: boolean;
  };

  // Get workspaceId from URL or use the first workspace as default
  const workspaceId = useMemo(() => {
    const paramId = searchParams.get("workspaceId");
    if (paramId) return paramId;
    if (workspaces.length > 0) return workspaces[0]._id; // default to first workspace
    return "";
  }, [searchParams, workspaces]);

  // Get the current workspace based on workspaceId
  const currentWorkspace = useMemo(() => {
    return workspaces.find((ws) => ws._id === workspaceId);
  }, [workspaces, workspaceId]);

  // Fetch workspace stats
  const { data, isLoading, isError } = useGetWorkspaceStatsQuery(workspaceId);

  // If no workspace is selected and none are available
  if (!workspaceId) {
    return (
      <div className="p-8 text-center text-red-600 font-semibold">
        Please select a workspace.
      </div>
    );
  }

  // Show loader while fetching workspaces or stats
  if (isLoading || workspacesLoading) {
    return <CustomLoader />;
  }

  // Show error if failed to load
  if (isError || !data || workspacesError) {
    return (
      <div className="p-8 text-center text-red-600 font-semibold">
        Failed to load workspace stats. Please try again later.
      </div>
    );
  }

  const statsData = data as WorkspaceStatsData;

  return (
    <div className="space-y-8 2xl:space-y-8 pb-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {currentWorkspace && (
          <p className="text-muted-foreground text-sm">
            Workspace:{" "}
            <span className="font-medium">{currentWorkspace.name}</span>
          </p>
        )}
      </div>

      <StatsCard data={statsData.stats} />
      <StatisticsCharts
        stats={statsData.stats}
        taskTrendsData={statsData.taskTrendsData}
        projectStatusData={statsData.projectStatusData}
        taskPriorityData={statsData.taskPriorityData}
        workspaceProductivityData={statsData.workspaceProductivityData}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentProjects data={statsData.recentProjects} />
        <UpcomingTasks data={statsData.upcomingTasks} />
      </div>
    </div>
  );
};

export default Dashboard;

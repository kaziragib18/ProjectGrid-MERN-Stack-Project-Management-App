import { RecentProjects } from "@/components/dashboard/recent-projects";
import { StatsCard } from "@/components/dashboard/stat-card";
import { StatisticsCharts } from "@/components/dashboard/statistics-charts";
import CustomLoader from "@/components/ui/customLoader";
import { UpcomingTasks } from "@/components/dashboard/upcoming-tasks";
import { useGetWorkspaceStatsQuery } from "@/hooks/use-workspace";
import type {
  Project,
  ProjectStatusData,
  StatsCardProps,
  Task,
  TaskPriorityData,
  TaskTrendsData,
  WorkspaceProductivityData,
} from "@/types";
import { useSearchParams } from "react-router";

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
  const workspaceId = searchParams.get("workspaceId") ?? "";

  const { data, isLoading, isError } = useGetWorkspaceStatsQuery(workspaceId);

  if (!workspaceId) {
    return (
      <div className="p-8 text-center text-red-600 font-semibold">
        Please select a workspace.
      </div>
    );
  }

  if (isLoading) {
    return <CustomLoader />;
  }

  if (isError || !data) {
    return (
      <div className="p-8 text-center text-red-600 font-semibold">
        Failed to load workspace stats. Please try again later.
      </div>
    );
  }

  const statsData = data as WorkspaceStatsData;

  return (
    <div className="space-y-8 2xl:space-y-12 pb-8">
      {" "}
      {/* smaller bottom padding */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
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

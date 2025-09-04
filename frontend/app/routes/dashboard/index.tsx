import { StatsCard } from "@/components/dashboard/stat-card";
import CustomLoader from "@/components/ui/customLoader";
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

const Dashboard = () => {
  const [searchParam] = useSearchParams();
  const workspaceId = searchParam.get("workspaceId");
  if (!workspaceId) {
    return (
      <div className="p-8 text-center text-red-600 font-semibold">
        Please select a workspace.
      </div>
    );
  }

  const { data, isPending, isError } = useGetWorkspaceStatsQuery(
    workspaceId
  ) as {
    data: {
      stats: StatsCardProps;
      taskTrendsData: TaskTrendsData[];
      projectStatusData: ProjectStatusData[];
      taskPriorityData: TaskPriorityData[];
      workspaceProductivityData: WorkspaceProductivityData[];
      upcomingTasks: Task[];
      recentProjects: Project[];
    };
    isPending: boolean;
    isError: boolean;
  };

  if (!workspaceId) {
    return (
      <div className="p-8 text-center text-red-600 font-semibold">
        Please select a workspace.
      </div>
    );
  }

  if (isPending) {
    return <CustomLoader />;
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-600 font-semibold">
        Failed to load workspace stats. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-8 2xl:space-y-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      <StatsCard data={data.stats} />
    </div>
  );
};

export default Dashboard;

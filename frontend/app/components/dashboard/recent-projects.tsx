import type { Project } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  getProjectProgress,
  getProjectStatusColor,
  getTaskStatusColor,
} from "@/lib";
import { Link, useSearchParams } from "react-router";
import { cn } from "@/lib/utils";
import { Progress } from "../ui/progress";

interface RecentProjectsProps {
  data: Project[];
}

export const RecentProjects: React.FC<RecentProjectsProps> = ({ data }) => {
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Projects</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {data.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No recent projects yet.
          </p>
        ) : (
          data.map((project) => {
            const projectProgress = getProjectProgress(project.tasks);

            return (
              <div key={project._id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Link
                    to={`/workspaces/${workspaceId}/projects/${project._id}`}
                    className="font-medium hover:text-primary transition-colors"
                  >
                    {project.title}
                  </Link>

                  <span
                    className={cn(
                      "px-2 py-1 text-xs rounded-full",
                      getProjectStatusColor(project.status)
                    )}
                  >
                    {project.status}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                  {project.description ?? "No description"}
                </p>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>Progress</span>
                    <span>{projectProgress}%</span>
                  </div>

                  <Progress value={projectProgress} className="h-2" />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

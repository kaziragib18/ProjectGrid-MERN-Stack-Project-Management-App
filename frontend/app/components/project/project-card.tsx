import type { Project } from "@/types";
import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { cn } from "@/lib/utils";
import { getTaskStatusColor } from "@/lib";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { Progress } from "../ui/progress";

interface ProjectCardProps {
  project: Project;
  progress: number;
  workspaceId: string;
}

export const ProjectCard = ({
  project,
  progress,
  workspaceId,
}: ProjectCardProps) => {
  return (
    <Link to={`/workspaces/${workspaceId}/projects/${project._id}`}>
      <Card className="transition-transform duration-300 hover:shadow-lg hover:-translate-y-1 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold line-clamp-1 text-zinc-900 dark:text-white">
              {project.title}
            </CardTitle>
            <span
              className={cn(
                "text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap",
                getTaskStatusColor(project.status)
              )}
            >
              {project.status}
            </span>
          </div>
          <CardDescription className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
            {project.description || "No description"}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-zinc-700 dark:text-zinc-400">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress
                value={progress}
                className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-700"
              />
            </div>

            <div className="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{project.tasks.length}</span>
                <span>Tasks</span>
              </div>

              {project.dueDate && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarDays className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  <span>{format(project.dueDate, "MMM d, yyyy")}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

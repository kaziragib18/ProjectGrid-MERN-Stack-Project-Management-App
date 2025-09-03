import type { StatsCardProps } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CheckCircle, ClipboardList, Clock, Play } from "lucide-react";

export const StatsCard = ({ data }: { data: StatsCardProps }) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Projects */}
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-blue-500" />
            Total Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-extrabold text-gray-900">
            {data.totalProjects}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {data.totalProjectInProgress} in progress
          </p>
        </CardContent>
      </Card>

      {/* Total Tasks */}
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Total Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-extrabold text-gray-900">
            {data.totalTasks}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {data.totalTaskCompleted} completed
          </p>
        </CardContent>
      </Card>

      {/* To Do */}
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            To Do
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-extrabold text-gray-900">
            {data.totalTaskToDo}
          </p>
          <p className="mt-1 text-xs text-gray-500">Tasks waiting to be done</p>
        </CardContent>
      </Card>

      {/* In Progress */}
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Play className="h-5 w-5 text-indigo-500" />
            In Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-extrabold text-gray-900">
            {data.totalTaskInProgress}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Tasks currently in progress
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

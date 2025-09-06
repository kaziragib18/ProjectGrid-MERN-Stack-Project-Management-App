import type {
  ProjectStatusData,
  StatsCardProps,
  TaskPriorityData,
  TaskTrendsData,
  WorkspaceProductivityData,
} from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ChartBarBig, ChartLine, ChartPie } from "lucide-react";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

interface StatisticsChartsProps {
  stats: StatsCardProps;
  taskTrendsData: TaskTrendsData[];
  projectStatusData: ProjectStatusData[];
  taskPriorityData: TaskPriorityData[];
  workspaceProductivityData: WorkspaceProductivityData[];
}

export const StatisticsCharts = ({
  taskTrendsData,
  projectStatusData,
  taskPriorityData,
  workspaceProductivityData,
}: StatisticsChartsProps) => {
  // Custom label line with connector polyline for Project Status pie chart
  const renderLabelLine = (props: any) => {
    const { cx, cy, midAngle, outerRadius, percent } = props;
    const RADIAN = Math.PI / 180;
    const sin = Math.sin(-midAngle * RADIAN);
    const cos = Math.cos(-midAngle * RADIAN);
    const sx = cx + outerRadius * cos;
    const sy = cy + outerRadius * sin;
    const mx = cx + (outerRadius + 15) * cos;
    const my = cy + (outerRadius + 15) * sin;
    const ex = mx + (cos >= 0 ? 10 : -10);
    const ey = my;

    if (percent === 0) return <></>;

    return (
      <polyline
        points={`${sx},${sy} ${mx},${my} ${ex},${ey}`}
        stroke="#ccc"
        fill="none"
      />
    );
  };

  // Custom label text positioned outside pie slices
  const renderLabelText = (props: any) => {
    const { cx, cy, midAngle, outerRadius, percent, name } = props;
    const RADIAN = Math.PI / 180;
    const cos = Math.cos(-midAngle * RADIAN);
    const sx = cx + (outerRadius + 25) * cos;
    const sy = cy + (outerRadius + 25) * Math.sin(-midAngle * RADIAN);

    if (percent === 0) return <></>;

    return (
      <text
        x={sx}
        y={sy}
        textAnchor={cos >= 0 ? "start" : "end"}
        dominantBaseline="central"
        fill="#000"
        style={{ fontSize: 11, fontWeight: 600 }}
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  // Custom tooltip content with colored boxes and black font color
  const CustomTooltipContent = (props: any) => {
    if (!props.payload || props.payload.length === 0) return null;

    return (
      <div className="custom-tooltip-content bg-white p-2 rounded shadow">
        {props.payload.map((entry: any, index: number) => (
          <div
            key={`tooltip-item-${index}`}
            style={{
              display: "flex",
              alignItems: "center",
              color: "#000", // black text
              marginBottom: 4,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {/* Colored box icon */}
            <div
              style={{
                width: 12,
                height: 12,
                backgroundColor: entry.color,
                marginRight: 8,
                borderRadius: 2,
              }}
            />
            {/* Label and value with a space */}
            <span>
              {entry.name}&nbsp;{entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
      {/* Task Trends Line Chart */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex justify-between items-center pb-2">
          <div>
            <CardTitle className="text-base font-medium">Task Trends</CardTitle>
            <CardDescription>Daily task status changes</CardDescription>
          </div>
          <ChartLine className="size-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <ChartContainer
            className="h-[300px] w-full"
            config={{
              completed: { color: "#10b981" },
              inProgress: { color: "#3b82f6" },
              toDo: { color: "#6b7280" },
            }}
          >
            <LineChart
              data={taskTrendsData}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="name"
                fontSize={12}
                stroke="#888"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                fontSize={12}
                stroke="#888"
                tickLine={false}
                axisLine={false}
              />
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <ChartTooltip />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="inProgress"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="toDo"
                stroke="#FFA500"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Project Status Pie Chart with outside labels and connector lines */}
      {/* Project Status Pie Chart with fallback when no data */}
      <Card>
        <CardHeader className="flex justify-between items-center pb-2">
          <div>
            <CardTitle className="text-base font-medium">
              Project Status
            </CardTitle>
            <CardDescription>Project status breakdown</CardDescription>
          </div>
          <ChartPie className="size-5 text-muted-foreground" />
        </CardHeader>

        <CardContent>
          <ChartContainer
            className="h-[300px] w-full flex items-center justify-center"
            config={{
              Completed: { color: "#10b981" },
              "In Progress": { color: "#3b82f6" },
              Planning: { color: "#f59e0b" },
            }}
          >
            {projectStatusData.filter((entry) => entry.value > 0).length > 0 ? (
              <PieChart>
                <Pie
                  data={projectStatusData.filter((entry) => entry.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {projectStatusData
                    .filter((entry) => entry.value > 0)
                    .map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <ChartTooltip />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            ) : (
              <div className="text-center text-muted-foreground text-sm">
                Currently no task is in progress or completed.
              </div>
            )}
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Task Priority Pie Chart with filtering out zero-value slices */}
      <Card>
        <CardHeader className="flex justify-between items-center pb-2">
          <div>
            <CardTitle className="text-base font-medium">
              Task Priority
            </CardTitle>
            <CardDescription>Task priority breakdown</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <ChartContainer
            className="h-[300px] w-full"
            config={{
              High: { color: "#ef4444" },
              Medium: { color: "#f59e0b" },
              Low: { color: "#6b7280" },
            }}
          >
            <PieChart>
              <Pie
                data={taskPriorityData.filter((entry) => entry.value > 0)} // <-- Filter here
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {taskPriorityData
                  .filter((entry) => entry.value > 0)
                  .map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
              </Pie>
              <ChartTooltip />
              <ChartLegend content={<ChartLegendContent />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Workspace Productivity Bar Chart */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex justify-between items-center pb-2">
          <div>
            <CardTitle className="text-base font-medium">
              Workspace Productivity
            </CardTitle>
            <CardDescription>Task completion by project</CardDescription>
          </div>
          <ChartBarBig className="size-5 text-muted-foreground" />
        </CardHeader>

        <CardContent>
          <ChartContainer
            className="h-[300px] w-full"
            config={{
              total: { color: "#ef4444" },
              completed: { color: "#3b82f6" },
            }}
          >
            <BarChart
              data={workspaceProductivityData}
              barGap={4}
              barSize={20}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="name"
                fontSize={12}
                stroke="#888"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                fontSize={12}
                stroke="#888"
                tickLine={false}
                axisLine={false}
              />
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              {/* Use custom tooltip content with colored boxes and black font */}
              <ChartTooltip content={<CustomTooltipContent />} />
              <Bar
                dataKey="total"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
                name="Total Tasks:"
              />
              <Bar
                dataKey="completed"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                name="Completed Tasks:"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

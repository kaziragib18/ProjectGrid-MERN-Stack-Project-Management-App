import { fetchData } from "@/lib/fetch-util";
import { useQuery } from "@tanstack/react-query";
import type { ActivityLog } from "@/types";
import { getActivityIcon } from "./task-icon";
import CustomLoader from "../ui/customLoader";
import { useState } from "react";
import { Button } from "../ui/button";
import { formatDistanceToNow } from "date-fns";

export const TaskActivity = ({ resourceId }: { resourceId: string }) => {
  const [showAll, setShowAll] = useState(false);

  const { data, isPending } = useQuery({
    queryKey: ["task-activity", resourceId],
    queryFn: () => fetchData(`/tasks/${resourceId}/activity`),
  }) as {
    data: ActivityLog[];
    isPending: boolean;
  };

  if (isPending) return <CustomLoader />;

  const visibleLogs = showAll ? data : data?.slice(0, 7);

  return (
    <div className="bg-card rounded-lg p-4 sm:p-6 shadow-sm w-full">
      <h3 className="text-lg text-muted-foreground mb-4">Activity Logs</h3>

      {visibleLogs && visibleLogs.length > 0 ? (
        <div className="space-y-4">
          {visibleLogs.map((activity) => (
            <div key={activity._id} className="flex gap-3 items-start">
              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                {getActivityIcon(activity.action)}
              </div>

              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {activity.user.name}
                  </span>{" "}
                  {activity.details?.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(activity.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          ))}

          {data && data.length > 7 && (
            <div className="text-center mt-2">
              <Button
                variant="link"
                size="sm"
                onClick={() => setShowAll((prev) => !prev)}
                aria-label="Toggle activity view"
              >
                {showAll ? "Show Less" : "Show More"}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">
          No activity yet
        </p>
      )}
    </div>
  );
};

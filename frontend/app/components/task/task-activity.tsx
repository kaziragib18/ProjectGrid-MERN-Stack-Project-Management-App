import { formatDistanceToNow, format } from "date-fns";
import { Button } from "../ui/button";
import type { ActivityLog } from "@/types";
import { fetchData } from "@/lib/fetch-util";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import CustomLoader from "../ui/customLoader";
import { getActivityIcon } from "./task-icon";

export const TaskActivity = ({ resourceId }: { resourceId: string }) => {
  // State to toggle between showing all activities or just a subset
  const [showAll, setShowAll] = useState(false);

  // Fetch the activity logs for the given task/resource ID
  const { data, isPending } = useQuery({
    queryKey: ["task-activity", resourceId],
    queryFn: () => fetchData(`/tasks/${resourceId}/activity`),
  }) as {
    data: ActivityLog[];
    isPending: boolean;
  };

  // Show loader while data is being fetched
  if (isPending) return <CustomLoader />;

  // Show either all activity logs or the first 7 based on showAll state
  const visibleLogs = showAll ? data : data?.slice(0, 7);

  /**
   * Helper function to determine if a date is older than 2 days from now.
   *ISO string representation of the date
   * returns boolean - true if the date is older than 2 days
   */
  const isOlderThanTwoDays = (dateInput: string | Date) => {
    const date =
      typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    return date < twoDaysAgo;
  };

  return (
    <div className="bg-card rounded-lg p-4 sm:p-6 shadow-sm w-full">
      <h3 className="text-lg text-muted-foreground mb-4">Activity Logs</h3>

      {visibleLogs && visibleLogs.length > 0 ? (
        <div className="space-y-4">
          {visibleLogs.map((activity) => {
            // Check if activity is older than 2 days
            const olderThanTwoDays = isOlderThanTwoDays(activity.createdAt);

            const exactDateTime = format(new Date(activity.createdAt), "PPpp");

            return (
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

                  {/* Timestamp:
                      - Shows relative time (e.g., "3 hours ago") if activity is less than 2 days old
                      - Otherwise, shows exact date/time
                      - Tooltip (native title) always shows exact date/time for clarity */}
                  <p
                    className="text-xs text-muted-foreground mt-1"
                    title={exactDateTime} // Native tooltip with exact timestamp
                  >
                    {!olderThanTwoDays
                      ? formatDistanceToNow(new Date(activity.createdAt), {
                          addSuffix: true,
                        })
                      : exactDateTime}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Show toggle button if there are more than 7 activities */}
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
        // Message when there are no activities to show
        <p className="text-sm text-muted-foreground text-center py-8">
          No activity yet
        </p>
      )}
    </div>
  );
};

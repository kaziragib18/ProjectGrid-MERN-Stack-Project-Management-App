import { cn } from "@/lib/utils";
import type { Workspace } from "@/types";
import type { LucideIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useLocation, useNavigate } from "react-router";

// This component renders a sidebar navigation with a list of items
// Each item can be a link to a different page in the application.
// It also handles the active state of the items based on the current URL.
interface SidebarNavProps extends React.HtmlHTMLAttributes<HTMLElement> { //
  items: {
    title: string;
    href: string;
    icon: LucideIcon;
  }[];
  
  isCollapsed: boolean;
  currentWorkspace: Workspace | null; 
  className?: string; //
}

// SidebarNav component
// It takes a list of items, a flag for collapsed state, and the current workspace.
// It uses the `useLocation` hook to determine the current URL and highlight the active item.
export const SidebarNav = ({
  items,
  isCollapsed,
  className,
  currentWorkspace,
  ...props
}: SidebarNavProps) => { 
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className={cn("flex flex-col gap-y-2", className)} {...props}>
      {items.map((el) => {
        // Destructure the icon and title from the item
        // Determine if the item is active based on the current URL
        // If the item is a workspace link, it appends the workspace ID to the URL
        const Icon = el.icon;
        const isActive = location.pathname === el.href;

        const handleClick = () => {
          if (el.href === "/workspaces") {
            navigate(el.href);
            // If the current workspace is selected, navigate to the workspace page
          } else if (currentWorkspace && currentWorkspace._id) {
            // If the item is a workspace link, append the workspace ID to the URL
            // This allows the application to handle workspace-specific routes
            navigate(`${el.href}?workspaceId=${currentWorkspace._id}`);
          } else {
            navigate(el.href);
          }
        };

        return (
          <Button
            key={el.href}
            variant={isActive ? "outline" : "ghost"}
            className={cn(
              "justify-start",
              isActive && "bg-blue-400/20 text-blue-600 font-medium"
            )}
            onClick={handleClick}
          >
            <Icon className="mr-2 size-4" />
            {isCollapsed ? (
              <span className="sr-only">{el.title}</span>
            ) : (
              el.title
            )}
          </Button>
        );
      })}
    </nav>
  );
};
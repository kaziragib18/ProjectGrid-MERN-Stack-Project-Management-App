import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  // Root layout
  layout("routes/auth/auth-layout.tsx", [
    //  Root index route
    index("routes/root/home.tsx"),
    // Auth routes
    // These routes will be rendered inside the AuthLayout
    // The Outlet component in AuthLayout will render these routes
    // The path for these routes will be prefixed with /auth
    // For example, /auth/sign-in will render the SignIn component
    // The SignIn component will be rendered inside the AuthLayout
    // The AuthLayout component will be rendered for all auth routes
    route("sign-in", "routes/auth/sign-in.tsx"),
    route("sign-up", "routes/auth/sign-up.tsx"),
    route("forgot-password", "routes/auth/forgot-password.tsx"),
    route("reset-password", "routes/auth/reset-password.tsx"),
    route("verify-email", "routes/auth/verify-email.tsx"),
  ]),
  // Dashboard layout
  layout("routes/dashboard/dashboard-layout.tsx", [
    // Dashboard index route
    route("dashboard", "routes/dashboard/index.tsx"),
    // Workspaces route
    route("workspaces", "routes/dashboard/workspaces/index.tsx"),
    route(
      "workspaces/:workspaceId",
      "routes/dashboard/workspaces/workspace-details.tsx"
    ),
    route(
      "workspaces/:workspaceId/projects/:projectId",
      "routes/dashboard/project/project-details.tsx"
    ),
    route(
      "workspaces/:workspaceId/projects/:projectId/tasks/:taskId",
      "routes/dashboard/task/task-details.tsx"
    ),
    // My Tasks page
    route("my-tasks", "routes/dashboard/my-tasks.tsx"),
    // Members page
    route("members", "routes/dashboard/members.tsx"),
    // Archived tasks page
    route("archived", "routes/dashboard/archived.tsx"),
    //workspace settings page
    route("workspaces/:workspaceId/settings", "routes/dashboard/settings.tsx"),
  ]),
  route(
    "workspace-invite/:workspaceId",
    "routes/dashboard/workspaces/workspace-invite.tsx"
  ),
] satisfies RouteConfig;

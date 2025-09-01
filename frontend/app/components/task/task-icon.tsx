import type { ActionType } from "@/types";
import {
  Building2,
  CheckCircle,
  CheckCircle2,
  CheckSquare,
  FileEdit,
  FolderEdit,
  FolderPlus,
  LogIn,
  MessageSquare,
  Trash2,
  Upload,
  UserMinus,
  UserPlus,
} from "lucide-react";

const iconWrapperClasses =
  "p-2 rounded-lg flex items-center justify-center shadow-sm";

export const getActivityIcon = (action: ActionType) => {
  switch (action) {
    case "created_task":
      return (
        <div
          className={`${iconWrapperClasses} bg-gradient-to-tr from-green-50 to-green-100`}
        >
          <CheckSquare className="h-4.5 w-4.5 text-green-400" />
        </div>
      );
    case "created_subtask":
      return (
        <div
          className={`${iconWrapperClasses} bg-gradient-to-tr from-emerald-50 to-emerald-100`}
        >
          <CheckSquare className="h-4.5 w-4.5 text-emerald-400" />
        </div>
      );
    case "updated_task":
    case "updated_subtask":
      return (
        <div
          className={`${iconWrapperClasses} bg-gradient-to-tr from-blue-50 to-blue-100`}
        >
          <FileEdit className="h-4.5 w-4.5 text-blue-400" />
        </div>
      );
    case "completed_task":
      return (
        <div
          className={`${iconWrapperClasses} bg-gradient-to-tr from-green-50 to-green-100`}
        >
          <CheckCircle className="h-4.5 w-4.5 text-green-400" />
        </div>
      );
    case "created_project":
      return (
        <div
          className={`${iconWrapperClasses} bg-gradient-to-tr from-blue-50 to-blue-100`}
        >
          <FolderPlus className="h-4.5 w-4.5 text-blue-400" />
        </div>
      );
    case "updated_project":
      return (
        <div
          className={`${iconWrapperClasses} bg-gradient-to-tr from-blue-50 to-blue-100`}
        >
          <FolderEdit className="h-4.5 w-4.5 text-blue-400" />
        </div>
      );
    case "completed_project":
      return (
        <div
          className={`${iconWrapperClasses} bg-gradient-to-tr from-green-50 to-green-100`}
        >
          <CheckCircle2 className="h-4.5 w-4.5 text-green-400" />
        </div>
      );
    case "created_workspace":
      return (
        <div
          className={`${iconWrapperClasses} bg-gradient-to-tr from-blue-50 to-blue-100`}
        >
          <Building2 className="h-4.5 w-4.5 text-blue-400" />
        </div>
      );
    case "added_comment":
      return (
        <div
          className={`${iconWrapperClasses} bg-gradient-to-tr from-blue-50 to-blue-100`}
        >
          <MessageSquare className="h-4.5 w-4.5 text-blue-400" />
        </div>
      );
    case "updated_comment":
      return (
        <div
          className={`${iconWrapperClasses} bg-gradient-to-tr from-yellow-50 to-yellow-100`}
        >
          <FileEdit className="h-4.5 w-4.5 text-yellow-500" />
        </div>
      );
    case "deleted_comment":
      return (
        <div
          className={`${iconWrapperClasses} bg-gradient-to-tr from-red-50 to-red-100`}
        >
          <Trash2 className="h-4.5 w-4.5 text-red-400" />
        </div>
      );

    case "added_member":
      return (
        <div
          className={`${iconWrapperClasses} bg-gradient-to-tr from-blue-50 to-blue-100`}
        >
          <UserPlus className="h-4.5 w-4.5 text-blue-400" />
        </div>
      );
    case "removed_member":
      return (
        <div
          className={`${iconWrapperClasses} bg-gradient-to-tr from-red-50 to-red-100`}
        >
          <UserMinus className="h-4.5 w-4.5 text-red-400" />
        </div>
      );
    case "joined_workspace":
      return (
        <div
          className={`${iconWrapperClasses} bg-gradient-to-tr from-blue-50 to-blue-100`}
        >
          <LogIn className="h-4.5 w-4.5 text-blue-400" />
        </div>
      );
    case "added_attachment":
      return (
        <div
          className={`${iconWrapperClasses} bg-gradient-to-tr from-blue-50 to-blue-100`}
        >
          <Upload className="h-4.5 w-4.5 text-blue-400" />
        </div>
      );
    default:
      return null;
  }
};

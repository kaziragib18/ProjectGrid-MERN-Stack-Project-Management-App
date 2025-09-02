import type { Comment, User } from "@/types";
import { useState } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import {
  useAddCommentMutation,
  useUpdateTaskCommentMutation,
  useGetCommentsByTaskIdQuery,
  useDeleteCommentMutation,
} from "@/hooks/use-task";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { format, formatDistanceToNow } from "date-fns";
import CustomLoader from "../ui/customLoader";
import { Separator } from "../ui/separator";
import { Edit, Check, X, Trash2 } from "lucide-react";

export const CommentSection = ({
  taskId,
  members,
  currentUser,
}: {
  taskId: string;
  members: User[];
  currentUser: User;
}) => {
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [showAll, setShowAll] = useState(false);

  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const { mutate: addComment, isPending } = useAddCommentMutation();
  const { mutate: updateComment, isPending: isUpdating } =
    useUpdateTaskCommentMutation();
  const { mutate: deleteComment, isPending: isDeleting } =
    useDeleteCommentMutation();

  const { data: comments, isLoading } = useGetCommentsByTaskIdQuery(taskId) as {
    data: Comment[];
    isLoading: boolean;
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    addComment(
      { taskId, text: newComment },
      {
        onSuccess: () => {
          setNewComment("");
          toast.success("Comment added successfully");
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to add comment");
        },
      }
    );
  };

  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment._id);
    setEditingText(comment.text);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditingText("");
  };

  const saveEdit = (commentId: string) => {
    if (!editingText.trim()) {
      toast.error("Comment text cannot be empty");
      return;
    }

    updateComment(
      { commentId, text: editingText, taskId },
      {
        onSuccess: () => {
          setEditingCommentId(null);
          setEditingText("");
          toast.success("Comment updated successfully");
        },
        onError: (error: any) => {
          toast.error(
            error.response?.data?.message || "Error updating comment"
          );
        },
      }
    );
  };

  const handleDeleteClick = (commentId: string) => {
    setCommentToDelete(commentId);
    setIsConfirmOpen(true);
  };

  const cancelDelete = () => {
    setIsConfirmOpen(false);
    setCommentToDelete(null);
  };

  const confirmDelete = () => {
    if (!commentToDelete) return;

    deleteComment(
      { commentId: commentToDelete, taskId },
      {
        onSuccess: () => {
          toast.success("Comment deleted successfully");
          setIsConfirmOpen(false);
          setCommentToDelete(null);
        },
        onError: (error: any) => {
          toast.error(
            error.response?.data?.message || "Failed to delete comment"
          );
          setIsConfirmOpen(false);
          setCommentToDelete(null);
        },
      }
    );
  };

  // Toggle this flag to true if testing with 3-minute threshold instead of 2 days
  const TEST_MODE = false;

  // Utility to check if date is older than 2 days (or 3 minutes in test mode)
  const isOlderThanTwoDays = (dateInput: string | Date) => {
    const date =
      typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    const threshold = new Date();
    TEST_MODE
      ? threshold.setMinutes(threshold.getMinutes() - 3)
      : threshold.setDate(threshold.getDate() - 2);
    return date < threshold;
  };

  if (isLoading) return <CustomLoader />;

  const displayedComments = showAll ? comments : comments?.slice(0, 5);

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm relative">
      <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
        Comments
      </h3>

      <div className="flex flex-col gap-4">
        {displayedComments?.length > 0 ? (
          displayedComments.map((comment) => (
            <div
              key={comment._id}
              className="flex gap-4 p-4 bg-muted/30 border border-border/50 rounded-md transition-all"
            >
              {/* Avatar */}
              <Avatar className="size-8 mt-1 border-1 border-slate-300">
                <AvatarImage src={comment.author.profilePicture} />
                <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
              </Avatar>

              {/* Comment Content */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-sm text-foreground">
                    {comment.author.name}
                  </span>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground/80 cursor-default">
                    {(() => {
                      const createdAt = new Date(comment.createdAt);
                      const isOld = isOlderThanTwoDays(createdAt);
                      const formattedFull = format(createdAt, "PPpp");

                      return (
                        <span className="text-xs" title={formattedFull}>
                          {isOld
                            ? formattedFull
                            : formatDistanceToNow(createdAt, {
                                addSuffix: true,
                              })}
                        </span>
                      );
                    })()}

                    {comment.isEdited && (
                      <span
                        className="italic cursor-default"
                        title={`Edited at: ${format(
                          new Date(comment.updatedAt ?? comment.createdAt),
                          "PPpp"
                        )}`}
                      >
                        (edited)
                      </span>
                    )}
                  </div>
                </div>

                {/* If editing this comment */}
                {editingCommentId === comment._id ? (
                  <>
                    <Textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="mb-2"
                      disabled={isUpdating}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        className="hover:bg-teal-600 hover:text-white"
                        size="sm"
                        variant="default"
                        onClick={() => saveEdit(comment._id)}
                        disabled={isUpdating || !editingText.trim()}
                      >
                        <Check className="mr-1 size-4" />
                      </Button>
                      <Button
                        className="hover:bg-red-600 hover:text-white"
                        size="sm"
                        variant="outline"
                        onClick={cancelEditing}
                        disabled={isUpdating}
                      >
                        <X className="mr-1 size-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      {comment.text}
                    </p>

                    {/* Edit and Delete buttons (if current user is the author) */}
                    {comment.author._id === currentUser._id && (
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 text-muted-foreground/70 hover:text-primary"
                          onClick={() => startEditing(comment)}
                        >
                          <Edit className="size-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 text-muted-foreground/70 hover:text-primary"
                          onClick={() => handleDeleteClick(comment._id)}
                          disabled={isDeleting}
                          aria-label="Delete comment"
                        >
                          <Trash2 className="size-3" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-sm text-muted-foreground py-6">
            No comments yet.
          </div>
        )}

        {/* See More / See Less */}
        {comments && comments.length > 5 && (
          <div className="text-center">
            <Button
              variant="link"
              className="text-sm text-muted-foreground hover:underline"
              onClick={() => setShowAll((prev) => !prev)}
            >
              {showAll ? "See Less" : `See More (${comments.length - 5})`}
            </Button>
          </div>
        )}
      </div>

      <Separator className="my-6" />

      {/* New Comment Input */}
      <div>
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <div className="flex justify-end mt-4">
          <Button
            className="hover:bg-primary/80 transition-colors"
            disabled={!newComment.trim() || isPending}
            onClick={handleAddComment}
          >
            Post Comment
          </Button>
        </div>
      </div>

      {/* Confirmation Popup */}
      {isConfirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div
            className="bg-white rounded-md p-6 max-w-sm w-full shadow-lg pointer-events-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
          >
            <h2
              id="confirm-dialog-title"
              className="text-lg font-semibold mb-4"
            >
              Are you sure?
            </h2>
            <p className="mb-6">
              Do you really want to delete this comment? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={cancelDelete}>
                No
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

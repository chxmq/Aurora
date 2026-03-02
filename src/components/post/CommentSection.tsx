import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AvatarWithVerify } from "@/components/ui/avatar-with-verify";
import { Comment } from "@/lib/types";
import { useWallet } from "@/providers/walletUtils";
import { useData } from "@/providers/DataProvider";
import { toast } from "sonner";

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (content: string) => void;
}

export default function CommentSection({ comments, onAddComment }: CommentSectionProps) {
  const [commentText, setCommentText] = useState("");
  const { isConnected } = useWallet();
  const { currentUser } = useData();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) {
      toast.error("Please enter a comment");
      return;
    }
    if (!isConnected) {
      toast.error("Please connect your wallet to comment");
      return;
    }
    onAddComment(commentText);
    setCommentText("");
    toast.success("Comment added");
  };

  const avatar = currentUser?.avatar ?? "/placeholder.svg";
  const displayName = currentUser?.displayName ?? "You";
  const isVerified = currentUser?.isVerified ?? false;

  return (
    <div className="space-y-6 mt-4">
      <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>

      {isConnected ? (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <AvatarWithVerify
            src={avatar}
            fallback={displayName}
            isVerified={isVerified}
            size="sm"
          />
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="min-h-[80px] w-full"
            />
            <div className="flex justify-end">
              <Button type="submit">Post Comment</Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="text-center p-4 bg-secondary/50 rounded-md">
          <p className="text-muted-foreground mb-2">
            Connect your wallet to join the conversation
          </p>
        </div>
      )}

      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <AvatarWithVerify
                src={comment.user?.avatar ?? "/placeholder.svg"}
                fallback={comment.user?.displayName ?? "User"}
                isVerified={comment.user?.isVerified ?? false}
                size="sm"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{comment.user?.displayName ?? "Anonymous"}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-1">{comment.content}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-muted-foreground">No comments yet</p>
        )}
      </div>
    </div>
  );
}

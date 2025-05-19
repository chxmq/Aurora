
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AvatarWithVerify } from "@/components/ui/avatar-with-verify";
import { Comment, User } from "@/lib/types";
import { useWallet } from "@/lib/walletUtils";
import { toast } from "sonner";
import { mockUsers } from "@/lib/mockData";

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (content: string) => void;
}

export default function CommentSection({ comments, onAddComment }: CommentSectionProps) {
  const [commentText, setCommentText] = useState('');
  const { isConnected, address } = useWallet();
  
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
    setCommentText('');
    toast.success("Comment added successfully");
  };
  
  // Get current user to show their avatar in the comment form
  const currentUser: User | undefined = isConnected ? 
    mockUsers.find(u => u.walletAddress?.toLowerCase() === address?.toLowerCase()) || {
      id: "current",
      username: "@you",
      displayName: "You",
      avatar: "/placeholder.svg",
      isVerified: false,
      followers: 0,
      following: 0,
      posts: 0
    } : undefined;
  
  return (
    <div className="space-y-6 mt-4">
      <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>
      
      {isConnected && (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <AvatarWithVerify
            src={currentUser?.avatar || "/placeholder.svg"}
            fallback={currentUser?.displayName || "You"}
            isVerified={currentUser?.isVerified || false}
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
      )}
      
      {!isConnected && (
        <div className="text-center p-4 bg-secondary/50 rounded-md">
          <p className="text-muted-foreground mb-2">Connect your wallet to join the conversation</p>
          <Button variant="outline" onClick={() => {/* wallet connection handled elsewhere */}}>
            Connect Wallet
          </Button>
        </div>
      )}
      
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <AvatarWithVerify
                src={comment.user?.avatar || "/placeholder.svg"}
                fallback={comment.user?.displayName || "User"}
                isVerified={comment.user?.isVerified || false}
                size="sm"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{comment.user?.displayName}</span>
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

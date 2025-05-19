
import { useState } from "react";
import { Post, User, Comment } from "@/lib/types";
import { AvatarWithVerify } from "@/components/ui/avatar-with-verify";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, MessageSquare, Share2, Music } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import CommentSection from "@/components/CommentSection";
import { playTrack } from "@/components/MusicPlayer";
import { mockTracks } from "@/lib/mockData";
import { useWallet } from "@/lib/walletUtils";
import { generateId } from "@/lib/utils";

interface PostCardProps {
  post: Post & { user?: User };
}

export default function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const { isConnected } = useWallet();
  
  const handleLike = () => {
    if (!isConnected) {
      toast.error("Please connect your wallet to like posts");
      return;
    }
    
    if (isLiked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
      toast.success("Post liked");
    }
    setIsLiked(!isLiked);
  };
  
  const handleCommentClick = () => {
    setShowComments(!showComments);
  };
  
  const handleAddComment = (content: string) => {
    if (!isConnected) {
      toast.error("Please connect your wallet to comment");
      return;
    }
    
    // Create a new comment
    const newComment: Comment = {
      id: generateId(),
      content,
      userId: '1', // In a real app, this would be the current user's ID
      postId: post.id,
      createdAt: new Date().toISOString(),
      user: {
        id: '1',
        username: "@currentuser",
        displayName: "Current User",
        avatar: "/placeholder.svg",
        isVerified: false,
        followers: 0,
        following: 0,
        posts: 0
      }
    };
    
    setComments([newComment, ...comments]);
    toast.success("Comment added");
  };
  
  // Check if this post has an associated track
  const getAssociatedTrack = () => {
    // This is a simple implementation - in a real app, posts would have a trackId field
    // For this demo we'll just check if any track title appears in the post content
    if (!post.content) return null;
    
    return mockTracks.find(track => 
      post.content.toLowerCase().includes(track.title.toLowerCase())
    );
  };
  
  const associatedTrack = getAssociatedTrack();
  
  const handlePlayTrack = () => {
    if (associatedTrack) {
      playTrack(associatedTrack.id);
      toast.success(`Now playing: ${associatedTrack.title}`);
    }
  };
  
  if (!post.user) return null;
  
  return (
    <div className="border border-border bg-secondary/20 rounded-xl p-4 mb-4">
      <div className="flex items-center mb-3">
        <Link to={`/profile/${post.userId}`} className="flex items-center">
          <AvatarWithVerify
            src={post.user.avatar}
            fallback={post.user.displayName}
            isVerified={post.user.isVerified}
            size="md"
            className="mr-3"
          />
          <div>
            <h3 className="font-semibold">{post.user.displayName}</h3>
            <p className="text-xs text-muted-foreground">{post.user.username}</p>
          </div>
        </Link>
        
        <div className="ml-auto text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
        </div>
      </div>
      
      <div className="mb-4">
        <p className="whitespace-pre-line">{post.content}</p>
        
        {/* Show track info if post has associated track */}
        {associatedTrack && (
          <div 
            className="flex items-center mt-3 p-2 bg-music-primary/10 rounded-lg cursor-pointer hover:bg-music-primary/20"
            onClick={handlePlayTrack}
          >
            <img 
              src={associatedTrack.coverArt} 
              alt={associatedTrack.title} 
              className="w-10 h-10 rounded mr-3"
            />
            <div>
              <p className="text-sm font-medium">{associatedTrack.title}</p>
              <p className="text-xs text-muted-foreground">{associatedTrack.artist.displayName}</p>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto">
              <Music className="h-4 w-4 text-music-primary" />
            </Button>
          </div>
        )}
      </div>
      
      {post.image && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img src={post.image} alt="Post" className="w-full h-auto" />
        </div>
      )}
      
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
          onClick={handleLike}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500' : ''}`} />
          <span>{likeCount}</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1 text-muted-foreground"
          onClick={handleCommentClick}
        >
          <MessageSquare className="h-4 w-4" />
          <span>{comments.length + post.comments}</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1 text-muted-foreground ml-auto"
        >
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </Button>
      </div>
      
      {showComments && (
        <div className="mt-4 pt-4 border-t border-border">
          <CommentSection 
            comments={comments} 
            onAddComment={handleAddComment} 
          />
        </div>
      )}
    </div>
  );
}

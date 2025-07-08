import { useState, useEffect, useMemo } from "react";
import { Post, User, Comment } from "@/lib/types";
import { AvatarWithVerify } from "@/components/ui/avatar-with-verify";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, MessageSquare, Share2, Music, MoreHorizontal, Trash2, Image as ImageIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import CommentSection from "@/components/CommentSection";
import { playTrack } from "@/components/MusicPlayer";
import { mockTracks } from "@/lib/mockData";
import { useWallet } from "@/lib/walletUtils";
import { generateId } from "@/lib/utils";
import { getFileUrl } from "@/lib/fileStorage";
import { deletePost } from "@/lib/mockData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { getGatewayUrl } from "@/lib/utils";

// Default images and tracks for fallbacks
const DEFAULT_IMAGES = [
  "/images/ncs1.jpg",
  "/images/ncs2.jpg",
  "/images/ncs3.jpg"
];

const DEFAULT_TRACKS = mockTracks.slice(0, 3);

interface PostCardProps {
  post: Post & { user: User };
  onDelete?: () => void;
  className?: string;
}

export default function PostCard({ post, onDelete, className }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const { isConnected, address } = useWallet();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState(DEFAULT_TRACKS[0]);
  const [timeAgo, setTimeAgo] = useState('');
  
  // Defensive fallback for missing user
  const safeUser = post.user || {
    id: 'unknown',
    username: 'unknown',
    displayName: 'Unknown',
    avatar: '/placeholder.svg',
    isVerified: false,
    followers: 0,
    following: 0,
    posts: 0,
    walletAddress: ''
  };

  // Check if current user is the post owner
  const isOwner = address && safeUser.walletAddress?.toLowerCase() === address.toLowerCase();

  // Get a random default image
  const getRandomDefaultImage = () => {
    return DEFAULT_IMAGES[Math.floor(Math.random() * DEFAULT_IMAGES.length)];
  };

  // Get a random default track
  const getRandomDefaultTrack = () => {
    return DEFAULT_TRACKS[Math.floor(Math.random() * DEFAULT_TRACKS.length)];
  };

  // Find associated track
  useEffect(() => {
    try {
      if (!post.content) {
        setCurrentTrack(getRandomDefaultTrack());
        return;
      }
      
      const track = mockTracks.find(track => 
        post.content.toLowerCase().includes(track.title.toLowerCase())
      );
      
      if (!track) {
        setCurrentTrack(getRandomDefaultTrack());
      } else {
        setCurrentTrack(track);
      }
    } catch (error) {
      console.error('Error getting associated track:', error);
      setCurrentTrack(getRandomDefaultTrack());
    }
  }, [post.content]);

  // Handle image URL conversion and fallback
  useEffect(() => {
    const loadImage = async () => {
      if (post.image) {
        try {
          let url = post.image;
          if (post.image.startsWith('file://')) {
            const fileId = post.image.replace('file://', '');
            const storedUrl = getFileUrl(fileId);
            url = storedUrl || getRandomDefaultImage();
          } else if (post.image.startsWith('ipfs://')) {
            url = getGatewayUrl(post.image);
          }
          setImageUrl(url);
        } catch (error) {
          console.error('Error loading image:', error);
          setImageUrl(getRandomDefaultImage());
        }
      }
    };
    
    loadImage();
  }, [post.image]);

  // Update timeAgo every minute
  useEffect(() => {
    const updateTimeAgo = () => {
      setTimeAgo(formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }));
    };
    
    // Initial update
    updateTimeAgo();
    
    // Update every minute
    const interval = setInterval(updateTimeAgo, 60000);
    
    return () => clearInterval(interval);
  }, [post.createdAt]);

  const handleImageError = () => {
    setImageUrl(getRandomDefaultImage());
  };

  const handlePlayTrack = () => {
    try {
      playTrack(currentTrack.id);
      toast.success(`Now playing: ${currentTrack.title}`);
    } catch (error) {
      console.error('Error playing track:', error);
      const defaultTrack = getRandomDefaultTrack();
      setCurrentTrack(defaultTrack);
      playTrack(defaultTrack.id);
    }
  };

  const handleLike = () => {
    if (!isConnected) {
      toast.error("Connect wallet to like posts");
      return;
    }
    
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
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
  
  const handleDelete = async () => {
    try {
      const success = await deletePost(post.id);
      if (success) {
        toast.success("Post deleted successfully");
        onDelete?.();
      } else {
        toast.error("Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };
  
  return (
    <div className={cn(
      "border border-border bg-secondary/20 rounded-xl p-4 mb-4",
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <Link to={`/profile/${safeUser.id}`} className="flex items-center">
          <AvatarWithVerify
            src={safeUser.avatar}
            fallback={safeUser.displayName}
            isVerified={safeUser.isVerified}
            className="h-10 w-10"
          />
          <div className="ml-3">
            <p className="font-semibold">{safeUser.displayName}</p>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">{safeUser.username}</p>
              <span className="text-xs text-muted-foreground">•</span>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
          </div>
        </Link>
        
        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      <div className="mb-4">
        <p className="whitespace-pre-line">{post.content}</p>
      </div>
      
      {imageUrl && (
        <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
          <img
            src={imageUrl}
            alt="Post media"
            className="absolute inset-0 w-full h-full object-cover"
            onError={handleImageError}
          />
        </div>
      )}
      
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className={`gap-2 ${isLiked ? 'text-music-primary' : ''}`}
          onClick={handleLike}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          {likeCount}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={handleCommentClick}
        >
          <MessageSquare className="h-4 w-4" />
          {comments.length}
        </Button>
        
        <Button variant="ghost" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </div>
      
      {showComments && (
        <CommentSection
          comments={comments}
          onAddComment={handleAddComment}
        />
      )}
    </div>
  );
}

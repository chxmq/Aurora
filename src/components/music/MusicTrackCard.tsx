import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AvatarWithVerify } from "@/components/ui/avatar-with-verify";
import { Button } from "@/components/ui/button";
import { Track } from "@/lib/types";
import { Link } from "react-router-dom";
import { Play, Pause, Heart, MessageSquare, MoreHorizontal, Trash2, ListPlus } from "lucide-react";
import { cn, getGatewayUrl } from "@/lib/utils";
import { playTrack, pauseTrack, getCurrentTrackId, getIsPlaying } from "../layout/MusicPlayer";
import { audioStore } from "../layout/MusicPlayer";
import { toast } from "sonner";
import CommentSection from "../post/CommentSection";
import AddToPlaylistModal from "../playlist/AddToPlaylistModal";
import { useWallet } from "@/providers/walletUtils";
import { useData } from "@/providers/DataProvider";
import { deleteTrack } from "@/services/data";
import { toggleTrackLike, isTrackLiked, addComment, getTrackComments, saveNotification } from "@/services/localStorage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MusicTrackCardProps {
  track: Track;
  compact?: boolean;
  index?: number;
  onDelete?: () => void;
  className?: string;
}

export default function MusicTrackCard({ track, compact = false, index, onDelete, className }: MusicTrackCardProps) {
  const { isConnected, address } = useWallet();
  const { currentUser } = useData();
  const userId = currentUser?.id ?? "";
  const [isLiked, setIsLiked] = useState(() => isTrackLiked(track.id, userId));
  const [addToPlaylistOpen, setAddToPlaylistOpen] = useState(false);
  const [likeCount, setLikeCount] = useState(track.likes);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(() => getTrackComments(track.id));
  const [isCurrentTrack, setIsCurrentTrack] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Check if current user is the track owner
  const isOwner = address && track.artist.walletAddress?.toLowerCase() === address.toLowerCase();
  
  useEffect(() => {
    const updatePlaybackState = (currentTrackId: string | null, playing: boolean) => {
      setIsCurrentTrack(currentTrackId === track.id);
      setIsPlaying(currentTrackId === track.id && playing);
    };
    
    // Set initial state
    updatePlaybackState(getCurrentTrackId(), getIsPlaying());
    
    // Subscribe to changes
    const unsubscribe = audioStore.subscribe(updatePlaybackState);
    return () => unsubscribe();
  }, [track.id]);
  
  const handlePlay = () => {
    try {
      if (isCurrentTrack) {
        if (isPlaying) {
          pauseTrack();
        } else {
          playTrack(track.id);
        }
      } else {
        toast.success(`Now playing: ${track.title}`);
        playTrack(track.id);
      }
    } catch (error) {
      console.error("Error handling play:", error);
      toast.error("Error playing track. Please try again.");
    }
  };

  const handleLike = () => {
    if (!isConnected || !userId) {
      toast.error("Connect wallet to like tracks");
      return;
    }
    const nowLiked = toggleTrackLike(track.id, userId);
    setIsLiked(nowLiked);
    setLikeCount(prev => nowLiked ? prev + 1 : Math.max(0, prev - 1));

    if (nowLiked && track.artist.id !== userId) {
      saveNotification({
        id: `like-track-${track.id}-${userId}-${Date.now()}`,
        type: "like",
        fromUserId: userId,
        fromUser: currentUser ?? undefined,
        toUserId: track.artist.id,
        trackId: track.id,
        content: `${currentUser?.displayName ?? "Someone"} liked your track "${track.title}".`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  };

  const handleCommentClick = () => {
    setShowComments(!showComments);
  };

  const handleAddComment = (content: string) => {
    if (!isConnected || !userId) return;
    const newComment = {
      id: `c-${Date.now()}`,
      userId,
      trackId: track.id,
      content,
      createdAt: new Date().toISOString(),
      user: currentUser ?? undefined,
    };
    addComment(newComment);
    setComments(getTrackComments(track.id));
  };

  const handleDelete = async () => {
    try {
      const success = await deleteTrack(track.id);
      if (success) {
        toast.success("Track deleted successfully");
        onDelete?.();
      } else {
        toast.error("Failed to delete track");
      }
    } catch (error) {
      console.error("Error deleting track:", error);
      toast.error("Failed to delete track");
    }
  };
  
  if (compact) {
    return (
      <div className={cn(
        "flex items-center gap-3 p-3 hover:bg-accent/50 rounded-xl group transition-all duration-200",
        isCurrentTrack && "bg-accent/30",
        className
      )}>
        <div className="relative">
          <AvatarWithVerify
            src={track.coverArt}
            fallback={track.title.substring(0, 2)}
            isVerified={track.artist.isVerified}
            size="sm"
          />
          {isCurrentTrack && (
            <div className="absolute inset-0 rounded-full bg-primary/20 flex items-center justify-center">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-hidden">
          <p className={cn(
            "text-sm font-medium truncate transition-colors",
            isCurrentTrack && "text-primary"
          )}>
            {track.title}
          </p>
          <Link to={`/profile/${track.artist.id}`} className="text-xs text-muted-foreground hover:underline">
            {track.artist.displayName}
          </Link>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110",
            isCurrentTrack && "opacity-100"
          )}
          onClick={handlePlay}
        >
          {isCurrentTrack && isPlaying ? (
            <Pause className="h-4 w-4 text-primary" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 hover:shadow-lg",
      isCurrentTrack && "ring-2 ring-primary/50 shadow-lg",
      className
    )}>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row md:h-[180px]">
          <div className="relative md:w-[180px] h-[180px] bg-secondary group">
            <img 
              src={track.coverArt ? getGatewayUrl(track.coverArt) : "/placeholder.svg"}
              alt={track.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <Button 
                variant="secondary" 
                size="icon"
                className="rounded-full bg-background/90 hover:bg-background shadow-lg hover:scale-110 transition-all duration-200"
                onClick={handlePlay}
              >
                {isCurrentTrack && isPlaying ? (
                  <Pause className="h-6 w-6 text-primary" />
                ) : (
                  <Play className="h-6 w-6 ml-0.5" />
                )}
              </Button>
            </div>
            {isCurrentTrack && (
              <div className="absolute top-3 left-3 flex items-center gap-2 px-2 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium">
                <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
                Now Playing
              </div>
            )}
          </div>
          
          <div className="p-6 flex flex-col flex-1">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div className="min-w-0 flex-1">
                  <h3 className={cn(
                    "font-bold text-lg mb-2 transition-colors",
                    isCurrentTrack && "text-primary"
                  )}>
                    {track.title}
                  </h3>
                  <Link 
                    to={`/profile/${track.artist.id}`} 
                    className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <AvatarWithVerify
                      src={track.artist.avatar}
                      fallback={track.artist.displayName}
                      isVerified={track.artist.isVerified}
                      size="xs"
                      className="mr-2"
                    />
                    {track.artist.displayName}
                  </Link>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLike}
                    className="text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Heart className={cn("h-4 w-4", isLiked && "fill-current text-red-500")} />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {isConnected && (
                        <DropdownMenuItem onClick={() => setAddToPlaylistOpen(true)}>
                          <ListPlus className="h-4 w-4 mr-2" />
                          Add to Playlist
                        </DropdownMenuItem>
                      )}
                      {isOwner && (
                        <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Track
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <div className="flex items-center gap-6 mt-auto">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{track.plays.toLocaleString()}</span>
                  <span>plays</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{likeCount}</span>
                  <span>likes</span>
                </div>
                <button 
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  onClick={handleCommentClick}
                >
                  <span className="font-medium text-foreground">{comments.length}</span>
                  <span>comments</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {showComments && (
          <div className="p-6 border-t bg-muted/30">
            <CommentSection 
              comments={comments} 
              onAddComment={handleAddComment} 
            />
          </div>
        )}
      </CardContent>
      <AddToPlaylistModal
        trackId={track.id}
        trackTitle={track.title}
        open={addToPlaylistOpen}
        onOpenChange={setAddToPlaylistOpen}
      />
    </Card>
  );
}

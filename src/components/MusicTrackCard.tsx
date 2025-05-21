import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AvatarWithVerify } from "@/components/ui/avatar-with-verify";
import { Button } from "@/components/ui/button";
import { Track } from "@/lib/types";
import { Link } from "react-router-dom";
import { Play, Pause, Heart, MessageSquare, MoreHorizontal, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { playTrack, pauseTrack, getCurrentTrackId, getIsPlaying } from "./MusicPlayer";
import { audioStore } from "./MusicPlayer";
import { toast } from "sonner";
import CommentSection from "./CommentSection";
import { useWallet } from "@/lib/walletUtils";
import { deleteTrack } from "@/lib/mockData";
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
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isCurrentTrack, setIsCurrentTrack] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { isConnected, address } = useWallet();
  
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
        playTrack(track.id);
        toast.success(`Now playing: ${track.title}`);
      }
    } catch (error) {
      console.error("Error handling play:", error);
      toast.error("Error playing track. Please try again.");
    }
  };
  
  const handleLike = () => {
    setIsLiked(!isLiked);
    if (!isLiked) {
      track.likes += 1;
      toast.success(`Liked ${track.title}`);
    } else {
      track.likes -= 1;
    }
  };
  
  const handleCommentClick = () => {
    setShowComments(!showComments);
  };
  
  const handleAddComment = (content: string) => {
    // In a real app, this would add the comment to the database
    track.comments += 1;
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
        "flex items-center gap-3 p-2 hover:bg-accent rounded-md group",
        className
      )}>
        <AvatarWithVerify
          src={track.coverArt}
          fallback={track.title.substring(0, 2)}
          isVerified={track.artist.isVerified}
          size="sm"
        />
        
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium truncate">{track.title}</p>
          <Link to={`/profile/${track.artist.id}`} className="text-xs text-muted-foreground hover:underline">
            {track.artist.displayName}
          </Link>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100"
          onClick={handlePlay}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
      </div>
    );
  }

  return (
    <Card className={cn(
      "overflow-hidden",
      className
    )}>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row md:h-[150px]">
          <div className="relative md:w-[150px] h-[150px] bg-secondary group">
            <img 
              src="/images/music-cover.jpg" 
              alt={track.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to track.coverArt if the default image fails to load
                const target = e.target as HTMLImageElement;
                if (target.src !== track.coverArt) {
                  target.src = track.coverArt;
                }
              }}
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="secondary" 
                size="icon"
                className="rounded-full bg-background/80 hover:bg-background/90"
                onClick={handlePlay}
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>
            </div>
          </div>
          
          <div className="p-4 flex flex-col flex-1">
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold">{track.title}</h3>
                  <Link 
                    to={`/profile/${track.artist.id}`} 
                    className="flex items-center text-sm text-muted-foreground hover:text-primary mt-1"
                  >
                    <AvatarWithVerify
                      src={track.artist.avatar}
                      fallback={track.artist.displayName}
                      isVerified={track.artist.isVerified}
                      size="xs"
                      className="mr-1"
                    />
                    {track.artist.displayName}
                  </Link>
                </div>
                
                {isOwner && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Track
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              
              <div className="flex gap-4 mt-auto pt-4">
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{track.plays}</span> plays
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{track.likes}</span> likes
                </div>
                <div 
                  className="text-xs text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={handleCommentClick}
                >
                  <span className="font-medium text-foreground">{track.comments}</span> comments
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {showComments && (
          <div className="p-4 border-t">
            <CommentSection 
              comments={[]} 
              onAddComment={handleAddComment} 
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

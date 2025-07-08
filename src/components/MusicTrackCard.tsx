import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AvatarWithVerify } from "@/components/ui/avatar-with-verify";
import { Button } from "@/components/ui/button";
import { Track } from "@/lib/types";
import { Link } from "react-router-dom";
import { Play, Pause, Heart, MessageSquare, MoreHorizontal, Trash2 } from "lucide-react";
import { cn, getGatewayUrl } from "@/lib/utils";
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
    console.log('MusicTrackCard handlePlay called for track:', track.title, track.id);
    console.log('isCurrentTrack:', isCurrentTrack, 'isPlaying:', isPlaying);
    
    try {
      if (isCurrentTrack) {
        if (isPlaying) {
          console.log('Pausing current track');
          pauseTrack();
        } else {
          console.log('Playing current track');
          playTrack(track.id);
        }
      } else {
        console.log('Playing new track:', track.title);
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
              src={getGatewayUrl(track.coverArt)}
              alt={track.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to a default image if the cover art fails to load
                const target = e.target as HTMLImageElement;
                if (!target.src.includes('default-track-fallback.jpg')) {
                  target.src = '/images/music-cover.jpg';
                }
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
                          Delete Track
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-6 mt-auto">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{track.plays.toLocaleString()}</span>
                  <span>plays</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{track.likes}</span>
                  <span>likes</span>
                </div>
                <button 
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  onClick={handleCommentClick}
                >
                  <span className="font-medium text-foreground">{track.comments}</span>
                  <span>comments</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {showComments && (
          <div className="p-6 border-t bg-muted/30">
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

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AvatarWithVerify } from "@/components/ui/avatar-with-verify";
import { Image, X, Music, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/lib/walletUtils";
import { addPost } from "@/lib/mockData";
import { mockUsers, mockTracks } from "@/lib/mockData";
import { toast } from "sonner";
import { Track } from "@/lib/types";
import { useData } from "@/lib/DataProvider";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { playTrack } from "@/components/MusicPlayer";

export default function CreatePostForm({ onPostCreated }: { onPostCreated?: () => void }) {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { isConnected, address } = useWallet();
  const { currentUser, refreshPosts } = useData();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error("Please connect your wallet to post");
      return;
    }
    
    if (!content.trim() && !selectedTrack) {
      toast.error("Post cannot be empty");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Use current user from DataProvider or fallback to first mock user
      const user = currentUser || mockUsers.find(
        (user) => user.walletAddress?.toLowerCase() === address?.toLowerCase()
      );

      if (!user) {
        toast.error("User not found. Please make sure your wallet is connected properly.");
        return;
      }
      
      // Add track info to the post content if a track is selected
      let finalContent = content;
      if (selectedTrack) {
        finalContent += `\n\n🎵 Listening to: ${selectedTrack.title} by ${selectedTrack.artist.displayName}`;
      }
      
      // Create new post
      const newPost = await addPost({
        userId: user.id,
        content: finalContent,
        image: imageUrl || undefined
      });

      if (!newPost) {
        throw new Error("Failed to create post - no post data returned");
      }
      
      // Reset form
      setContent("");
      setImageUrl("");
      setShowImageInput(false);
      setSelectedTrack(null);
      
      toast.success("Post created successfully!");
      
      // Refresh posts immediately
      refreshPosts();
      
      // Notify parent component
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create post. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleTrackSelect = (track: Track) => {
    setSelectedTrack(track);
    setSearchQuery("");
    toast.success(`Added "${track.title}" to your post`);
  };
  
  const handlePlayPreview = (track: Track, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the track from being selected
    toast.success(`Playing: ${track.title}`);
    playTrack(track.id);
  };
  
  const clearSelectedTrack = () => {
    setSelectedTrack(null);
  };
  
  // Filter tracks based on search query
  const filteredTracks = searchQuery
    ? mockTracks.filter(track => 
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.displayName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockTracks.slice(0, 5); // Just show first 5 if no search
  
  return (
    <div className="bg-secondary/20 rounded-xl p-4 mb-6">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start gap-3">
          <AvatarWithVerify
            src={mockUsers[0].avatar}
            fallback={mockUsers[0].displayName}
            isVerified={mockUsers[0].isVerified}
            size="md"
          />
          
          <div className="flex-1">
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="resize-none border-0 bg-transparent focus:ring-0 p-0 mb-4 h-[100px]"
            />
            
            {showImageInput && (
              <div className="mb-4 relative">
                <Input
                  type="url"
                  placeholder="Paste image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => {
                    setImageUrl("");
                    setShowImageInput(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {imageUrl && (
              <div className="mb-4 relative">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="h-40 max-w-full object-cover rounded-lg"
                  onError={() => {
                    toast.error("Invalid image URL");
                    setImageUrl("");
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="absolute top-2 right-2 bg-background/80"
                  onClick={() => setImageUrl("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {selectedTrack && (
              <div className="mb-4 p-2 bg-music-primary/10 rounded-lg flex items-center">
                <img 
                  src={selectedTrack.coverArt} 
                  alt={selectedTrack.title}
                  className="w-10 h-10 rounded mr-3" 
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{selectedTrack.title}</p>
                  <p className="text-xs text-muted-foreground">{selectedTrack.artist.displayName}</p>
                </div>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="icon" 
                  onClick={clearSelectedTrack}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="flex flex-wrap justify-between items-center gap-2">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => !showImageInput && setShowImageInput(true)}
                  disabled={showImageInput}
                >
                  <Image className="h-4 w-4 mr-2" />
                  Add Image
                </Button>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={!!selectedTrack}
                    >
                      <Music className="h-4 w-4 mr-2" />
                      Add Music
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-3">
                      <h4 className="font-medium">Add a track to your post</h4>
                      <Input 
                        placeholder="Search for tracks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <div className="max-h-60 overflow-y-auto space-y-1">
                        {filteredTracks.length > 0 ? (
                          filteredTracks.map(track => (
                            <div 
                              key={track.id}
                              className="flex items-center p-2 hover:bg-accent rounded-md cursor-pointer"
                              onClick={() => handleTrackSelect(track)}
                            >
                              <img 
                                src={track.coverArt} 
                                alt={track.title} 
                                className="w-8 h-8 rounded mr-2"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{track.title}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {track.artist.displayName}
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => handlePlayPreview(track, e)}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-sm text-muted-foreground py-2">
                            No tracks found
                          </p>
                        )}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              
              <Button
                type="submit"
                className="bg-music-primary hover:bg-music-secondary"
                disabled={isSubmitting || (!content.trim() && !selectedTrack)}
              >
                {isSubmitting ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

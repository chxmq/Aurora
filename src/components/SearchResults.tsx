
import React from "react";
import { Link } from "react-router-dom";
import { User, Track, Post } from "@/lib/types";
import { AvatarWithVerify } from "@/components/ui/avatar-with-verify";
import MusicTrackCard from "@/components/MusicTrackCard";
import PostCard from "@/components/PostCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Music, Users, MessageSquare } from "lucide-react";

interface SearchResultsProps {
  results: {
    users: User[];
    tracks: Track[];
    posts: Post[];
  };
  onClose?: () => void;
}

export default function SearchResults({ results, onClose }: SearchResultsProps) {
  const { users, tracks, posts } = results;
  const isEmpty = users.length === 0 && tracks.length === 0 && posts.length === 0;
  
  if (isEmpty) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No results found
      </div>
    );
  }
  
  return (
    <ScrollArea className="max-h-[60vh]">
      {users.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
            <h3 className="text-sm font-medium">People</h3>
          </div>
          
          <div className="space-y-4">
            {users.map(user => (
              <Link 
                to={`/profile/${user.id}`} 
                key={user.id} 
                className="flex items-center p-2 hover:bg-secondary/50 rounded-lg"
                onClick={onClose}
              >
                <AvatarWithVerify
                  src={user.avatar}
                  fallback={user.displayName}
                  isVerified={user.isVerified}
                  size="md"
                  className="mr-3"
                />
                <div>
                  <p className="font-medium">{user.displayName}</p>
                  <p className="text-sm text-muted-foreground">{user.username}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {tracks.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <Music className="h-4 w-4 mr-2 text-muted-foreground" />
            <h3 className="text-sm font-medium">Tracks</h3>
          </div>
          
          <div className="space-y-4">
            {tracks.map(track => (
              <div key={track.id} onClick={onClose}>
                <MusicTrackCard track={track} compact />
              </div>
            ))}
          </div>
        </div>
      )}
      
      {posts.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
            <h3 className="text-sm font-medium">Posts</h3>
          </div>
          
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post.id} onClick={onClose}>
                <PostCard post={post} />
              </div>
            ))}
          </div>
        </div>
      )}
    </ScrollArea>
  );
}

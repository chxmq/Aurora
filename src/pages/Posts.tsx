import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPopulatedPosts } from "@/services/data";
import { STORAGE_PREFIX } from "@/services/localStorage";
import PostCard from "@/components/post/PostCard";
import CreatePostForm from "@/components/post/CreatePostForm";
import { Post, User } from "@/lib/types";

export default function PostsPage() {
  const [posts, setPosts] = useState<(Post & { user: User })[]>([]);

  const refresh = () => {
    setPosts(getPopulatedPosts(50) as (Post & { user: User })[]);
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key?.startsWith(STORAGE_PREFIX)) refresh();
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Community Posts</h1>
        <p className="text-muted-foreground text-lg">
          What the Aurora community is sharing right now.
        </p>
      </div>

      <CreatePostForm onPostCreated={refresh} />

      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onDelete={refresh} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 rounded-3xl border-2 border-dashed border-border/50 bg-muted/20 mt-4">
          <MessageSquare className="h-16 w-16 text-muted-foreground/40 mb-4" />
          <h3 className="text-xl font-semibold text-muted-foreground mb-2">No posts yet</h3>
          <p className="text-muted-foreground mb-6 text-center max-w-xs">
            Connect your wallet and write the first post — the community starts with you.
          </p>
          <Button asChild variant="outline">
            <Link to="/profile">Connect &amp; Get Started</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

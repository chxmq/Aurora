import React from "react";
import { mockPosts } from "@/lib/mockData";
import PostCard from "@/components/PostCard";

export default function PostsPage() {
  return (
    <div className="max-w-5xl mx-auto py-10">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-2">All Posts</h1>
        <p className="text-muted-foreground text-lg">Browse all posts from the Aurora community.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockPosts.map((post) => (
          <PostCard key={post.id} post={{ ...post, user: post.user! }} />
        ))}
      </div>
    </div>
  );
} 
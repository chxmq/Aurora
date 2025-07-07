import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import CreatePostForm from '../components/CreatePostForm';
import PostCard from '../components/PostCard';
import { Post, User } from '@/lib/types';
import { getAllPostsFromPinata } from '@/lib/mockData';

export default function HomePage() {
  const [posts, setPosts] = useState<(Post & { user: User })[]>([]);
  const [loading, setLoading] = useState(true);

  // Load posts function
  const loadPosts = useCallback(async () => {
    setLoading(true);
    const allPosts = await getAllPostsFromPinata();
    // Optionally, populate user info if needed
    setPosts(allPosts as any);
    setLoading(false);
  }, []);

  // Load initial posts and set up refresh interval
  useEffect(() => {
    loadPosts();

    // Refresh posts every 5 seconds
    const interval = setInterval(loadPosts, 5000);

    return () => clearInterval(interval);
  }, [loadPosts]);

  const handleNewPost = () => {
    // Immediately refresh posts when a new one is created
    loadPosts();
  };

  const handlePostDelete = (deletedPostId: string) => {
    // Immediately remove the deleted post from the list
    setPosts(currentPosts => currentPosts.filter(post => post.id !== deletedPostId));
    // Then refresh the full list
    loadPosts();
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4">
        <CreatePostForm onPostCreated={handleNewPost} />
        
        <div className="mt-6 space-y-6">
          {loading ? (
            <div className="text-center py-10 bg-secondary/20 rounded-xl">
              <p className="text-muted-foreground">Loading posts...</p>
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                onDelete={() => handlePostDelete(post.id)} 
              />
            ))
          ) : (
            <div className="text-center py-10 bg-secondary/20 rounded-xl">
              <p className="text-muted-foreground">No posts yet. Be the first to post!</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 
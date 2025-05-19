
import { useState } from "react";
import Layout from "@/components/Layout";
import MusicTrackCard from "@/components/MusicTrackCard";
import PostCard from "@/components/PostCard";
import { mockPosts, mockTracks, mockUsers } from "@/lib/mockData";
import { Post, Track } from "@/lib/types";

export default function ViralSoundsPage() {
  const [tracks] = useState<Track[]>(mockTracks);
  const [posts] = useState<Post[]>(mockPosts.map(post => ({
    ...post,
    user: mockUsers.find(user => user.id === post.userId)
  })));

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Viral Sounds</h1>
      
      <section className="mb-8">
        <div className="grid grid-cols-1 gap-4">
          {tracks.map((track, index) => (
            <div key={track.id} className="bg-secondary/20 border border-border rounded-xl p-4">
              <MusicTrackCard track={track} index={index} />
              
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  <span className="font-medium">The Blockchain Coders</span> brings together organizations from across web3 to create the
                  largest community learning blockchain education.
                </p>
                
                <div className="text-xs text-muted-foreground">
                  FeedBack: {track.likes} likes, {track.comments} comments
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      <section>
        <h2 className="text-xl font-semibold mb-4">Featured Posts</h2>
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </section>
    </Layout>
  );
}


import { useState, useEffect } from "react";
import { useWallet } from "@/lib/walletUtils";
import Layout from "@/components/Layout";
import CreatePostForm from "@/components/CreatePostForm";
import PostCard from "@/components/PostCard";
import MusicTrackCard from "@/components/MusicTrackCard";
import SuggestedFollows from "@/components/SuggestedFollows";
import { getPopulatedPosts, getPopularTracks, getSuggestedUsers } from "@/lib/mockData";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

export default function HomePage() {
  const [posts, setPosts] = useState(getPopulatedPosts());
  const [popularTracks, setPopularTracks] = useState(getPopularTracks().slice(0, 5));
  const [suggestedUsers, setSuggestedUsers] = useState(getSuggestedUsers('1').slice(0, 5));
  const { isConnected } = useWallet();
  const isMobile = useIsMobile();
  
  const handlePostCreated = () => {
    // Fetch updated posts
    setPosts(getPopulatedPosts());
  };
  
  // Simulate real-time updates periodically
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly update something every 60 seconds to simulate activity
      const updateType = Math.floor(Math.random() * 3);
      
      switch (updateType) {
        case 0:
          // Update posts
          setPosts(getPopulatedPosts());
          break;
        case 1:
          // Update popular tracks
          setPopularTracks(getPopularTracks().slice(0, 5));
          break;
        case 2:
          // Update suggested users
          setSuggestedUsers(getSuggestedUsers('1').slice(0, 5));
          break;
      }
    }, 60000); // Every 60 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6">Home Feed</h2>
          
          <CreatePostForm onPostCreated={handlePostCreated} />
          
          <section>
            <h3 className="text-xl font-semibold mb-4">Popular Music</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {popularTracks.map((track) => (
                <MusicTrackCard key={track.id} track={track} />
              ))}
            </div>
          </section>
          
          <section>
            <h3 className="text-xl font-semibold mb-4">Latest Posts</h3>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </section>
        </div>
        
        {!isMobile && (
          <aside className="space-y-6">
            <SuggestedFollows users={suggestedUsers} />
            
            <div className="bg-secondary/50 rounded-xl p-4">
              <h2 className="font-semibold mb-4">What is MUSICNFT?</h2>
              <p className="text-sm text-muted-foreground mb-3">
                MUSICNFT is a decentralized music platform where artists and fans connect directly using blockchain technology.
              </p>
              <p className="text-sm text-muted-foreground">
                Support your favorite artists by collecting their music NFTs, tipping them with cryptocurrency, and engaging with their content.
              </p>
            </div>
            
            {!isConnected && (
              <div className="bg-music-primary/10 border border-music-primary/30 rounded-xl p-4">
                <h2 className="font-semibold mb-2">Connect Your Wallet</h2>
                <p className="text-sm text-muted-foreground mb-3">
                  Connect your MetaMask wallet to start supporting artists and collecting music NFTs.
                </p>
              </div>
            )}
          </aside>
        )}
      </div>
    </Layout>
  );
}

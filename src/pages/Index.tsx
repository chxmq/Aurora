import { useEffect } from "react";
import { useWallet } from "@/lib/walletUtils";
import Layout from "@/components/Layout";
import CreatePostForm from "@/components/CreatePostForm";
import PostCard from "@/components/PostCard";
import MusicTrackCard from "@/components/MusicTrackCard";
import SuggestedFollows from "@/components/SuggestedFollows";
import { useData } from "@/lib/DataProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Music, Headphones, TrendingUp, Clock, Sparkles } from "lucide-react";

export default function HomePage() {
  const { posts, popularTracks, suggestedUsers, refreshData } = useData();
  const { isConnected } = useWallet();
  const isMobile = useIsMobile();
  
  const handlePostCreated = () => {
    // Refresh data when a new post is created
    refreshData();
  };

  // Sort tracks by different criteria
  const trendingTracks = [...popularTracks].sort((a, b) => b.likes - a.likes);
  const newTracks = [...popularTracks].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const mostPlayed = [...popularTracks].sort((a, b) => b.plays - a.plays);

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-music-primary/20 via-purple-500/10 to-music-secondary/20 py-12 mb-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-music-primary to-music-secondary">
              Discover. Create. Connect.
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Your gateway to the decentralized music universe
            </p>
            {!isConnected && (
              <Button size="lg" className="bg-music-primary hover:bg-music-secondary">
                Connect Wallet to Start
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CreatePostForm onPostCreated={handlePostCreated} />
            
            {/* Featured Music Section */}
            <section className="mt-12">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="h-6 w-6 text-music-primary" />
                <h2 className="text-2xl font-bold">Featured Music</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trendingTracks.slice(0, 6).map((track) => (
                  <MusicTrackCard 
                    key={track.id} 
                    track={track} 
                    compact 
                    className="bg-secondary/10 hover:bg-secondary/20 transition-colors"
                  />
                ))}
              </div>
            </section>

            {/* Latest Releases Section */}
            <section className="mt-12">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="h-6 w-6 text-music-primary" />
                <h2 className="text-2xl font-bold">Latest Releases</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {newTracks.slice(0, 4).map((track) => (
                  <MusicTrackCard 
                    key={track.id} 
                    track={track} 
                    compact 
                    className="bg-secondary/10 hover:bg-secondary/20 transition-colors"
                  />
                ))}
              </div>
            </section>

            {/* Most Played Section */}
            <section className="mt-12">
              <div className="flex items-center gap-2 mb-6">
                <Headphones className="h-6 w-6 text-music-primary" />
                <h2 className="text-2xl font-bold">Most Played</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mostPlayed.slice(0, 4).map((track) => (
                  <MusicTrackCard 
                    key={track.id} 
                    track={track} 
                    compact 
                    className="bg-secondary/10 hover:bg-secondary/20 transition-colors"
                  />
                ))}
              </div>
            </section>
            
            {/* Latest Posts Section */}
            <section className="mt-12">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-6 w-6 text-music-primary" />
                <h2 className="text-2xl font-bold">Latest Posts</h2>
              </div>
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    className="bg-secondary/10 hover:bg-secondary/20 transition-colors"
                  />
                ))}
              </div>
            </section>
          </div>
          
          {!isMobile && (
            <aside className="space-y-8">
              <SuggestedFollows 
                users={suggestedUsers} 
                className="bg-secondary/10 rounded-xl p-4 hover:bg-secondary/20 transition-colors"
              />
              
              <div className="bg-gradient-to-br from-music-primary/10 to-purple-500/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Music className="h-6 w-6 text-music-primary" />
                  <h2 className="text-xl font-bold">What is MUSICNFT?</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  MUSICNFT is a decentralized music platform where artists and fans connect directly using blockchain technology.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Support your favorite artists by collecting their music NFTs, tipping them with cryptocurrency, and engaging with their content.
                </p>
              </div>
              
              {!isConnected && (
                <div className="bg-gradient-to-br from-music-primary/20 to-music-secondary/20 rounded-xl p-6">
                  <h2 className="text-xl font-bold mb-4">Connect Your Wallet</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect your MetaMask wallet to start supporting artists and collecting music NFTs.
                  </p>
                  <Button className="w-full bg-music-primary hover:bg-music-secondary">
                    Connect Wallet
                  </Button>
                </div>
              )}
            </aside>
          )}
        </div>
      </div>
    </Layout>
  );
}

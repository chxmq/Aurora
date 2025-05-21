import { useState } from "react";
import Layout from "@/components/Layout";
import { mockUsers, mockTracks } from "@/lib/mockData";
import { AvatarWithVerify } from "@/components/ui/avatar-with-verify";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MusicTrackCard from "@/components/MusicTrackCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ExplorePage() {
  const [allUsers] = useState(mockUsers);
  const [featuredUsers] = useState([...mockUsers].sort(() => Math.random() - 0.5));
  const [activeTab, setActiveTab] = useState("featured");

  // Sort tracks by different criteria
  const verifiedArtists = allUsers.filter(user => user.isVerified);
  const risingStars = [...mockTracks]
    .sort((a, b) => {
      const aGrowth = (a.likes + a.plays) / ((Date.now() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      const bGrowth = (b.likes + b.plays) / ((Date.now() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      return bGrowth - aGrowth;
    })
    .slice(0, 8);

  const popularTracks = [...mockTracks].sort((a, b) => b.plays - a.plays).slice(0, 8);
  const trendingTracks = [...mockTracks].sort((a, b) => b.likes - a.likes).slice(0, 8);
  const newTracks = [...mockTracks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Explore</h1>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Featured Artists</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredUsers.slice(0, 8).map((user) => (
              <Link 
                key={user.id} 
                to={`/profile/${user.id}`}
                className="bg-secondary/50 rounded-lg p-4 hover:bg-secondary/70 transition"
              >
                <div className="flex flex-col items-center text-center">
                  <AvatarWithVerify
                    src={user.avatar}
                    fallback={user.displayName}
                    isVerified={user.isVerified}
                    size="lg"
                    className="mb-3"
                  />
                  <h3 className="font-semibold">{user.displayName}</h3>
                  <p className="text-sm text-muted-foreground">{user.username}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {user.followers.toLocaleString()} followers
                  </p>
                  
                  <Button variant="outline" size="sm" className="mt-3">
                    Follow
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="featured">Featured</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="rising">Rising Stars</TabsTrigger>
            </TabsList>

            <TabsContent value="featured">
              <div className="grid grid-cols-1 gap-4">
                {popularTracks.slice(0, 6).map((track) => (
                  <MusicTrackCard key={track.id} track={track} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="trending">
              <div className="grid grid-cols-1 gap-4">
                {trendingTracks.map((track) => (
                  <MusicTrackCard key={track.id} track={track} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="new">
              <div className="grid grid-cols-1 gap-4">
                {newTracks.map((track) => (
                  <MusicTrackCard key={track.id} track={track} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="popular">
              <div className="grid grid-cols-1 gap-4">
                {popularTracks.map((track) => (
                  <MusicTrackCard key={track.id} track={track} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="rising">
              <div className="grid grid-cols-1 gap-4">
                {risingStars.map((track) => (
                  <MusicTrackCard key={track.id} track={track} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Verified Artists</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {verifiedArtists.slice(0, 8).map((user) => (
              <Link 
                key={user.id} 
                to={`/profile/${user.id}`}
                className="bg-secondary/50 rounded-lg p-4 hover:bg-secondary/70 transition"
              >
                <div className="flex flex-col items-center text-center">
                  <AvatarWithVerify
                    src={user.avatar}
                    fallback={user.displayName}
                    isVerified={user.isVerified}
                    size="lg"
                    className="mb-3"
                  />
                  <h3 className="font-semibold">{user.displayName}</h3>
                  <p className="text-sm text-muted-foreground">{user.username}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {user.followers.toLocaleString()} followers
                  </p>
                  
                  <Button variant="outline" size="sm" className="mt-3">
                    Follow
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}

import { useState, useEffect, useCallback } from "react";
import { AvatarWithVerify } from "@/components/ui/avatar-with-verify";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Music } from "lucide-react";
import MusicTrackCard from "@/components/MusicTrackCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUsers, getTracks } from "@/services/localStorage";
import { User, Track } from "@/lib/types";

export default function ExplorePage() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [activeTab, setActiveTab] = useState("featured");

  const refresh = useCallback(() => {
    const users = getUsers();
    const tracks = getTracks();
    setAllUsers(users);
    setAllTracks(tracks);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key?.startsWith("sai_music_")) refresh();
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [refresh]);

  const verifiedArtists = allUsers.filter((u) => u.isVerified);
  const featuredUsers = [...allUsers].sort(() => Math.random() - 0.5).slice(0, 8);

  const risingStars = [...allTracks]
    .sort((a, b) => {
      const aAge = (Date.now() - new Date(a.createdAt).getTime()) / 86400000;
      const bAge = (Date.now() - new Date(b.createdAt).getTime()) / 86400000;
      return (b.likes + b.plays) / (bAge || 1) - (a.likes + a.plays) / (aAge || 1);
    })
    .slice(0, 8);

  const popularTracks = [...allTracks].sort((a, b) => b.plays - a.plays).slice(0, 8);
  const trendingTracks = [...allTracks].sort((a, b) => b.likes - a.likes).slice(0, 8);
  const newTracks = [...allTracks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  const EmptyTracks = () => (
    <div className="flex flex-col items-center justify-center py-16 rounded-3xl border-2 border-dashed border-border/50 bg-muted/20">
      <Music className="h-12 w-12 text-muted-foreground/40 mb-3" />
      <h3 className="text-lg font-semibold text-muted-foreground mb-1">No tracks yet</h3>
      <p className="text-sm text-muted-foreground mb-4">Be the first to upload a track.</p>
      <Button asChild size="sm">
        <Link to="/create">Upload Track</Link>
      </Button>
    </div>
  );

  const EmptyUsers = () => (
    <div className="flex flex-col items-center justify-center py-12 rounded-3xl border-2 border-dashed border-border/50 bg-muted/20">
      <Users className="h-12 w-12 text-muted-foreground/40 mb-3" />
      <h3 className="text-lg font-semibold text-muted-foreground mb-1">No artists yet</h3>
      <p className="text-sm text-muted-foreground">Connect your wallet to create a profile.</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Explore</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Featured Artists</h2>
        {featuredUsers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredUsers.map((user) => (
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
        ) : (
          <EmptyUsers />
        )}
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

          {[
            { value: "featured", list: popularTracks.slice(0, 6) },
            { value: "trending", list: trendingTracks },
            { value: "new", list: newTracks },
            { value: "popular", list: popularTracks },
            { value: "rising", list: risingStars },
          ].map(({ value, list }) => (
            <TabsContent key={value} value={value}>
              {list.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {list.map((track) => (
                    <MusicTrackCard key={track.id} track={track} />
                  ))}
                </div>
              ) : (
                <EmptyTracks />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </section>

      {verifiedArtists.length > 0 && (
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
      )}
    </div>
  );
}

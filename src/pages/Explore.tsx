import { useState, useEffect, useCallback, useMemo } from "react";
import { AvatarWithVerify } from "@/components/ui/avatar-with-verify";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Music } from "lucide-react";
import MusicTrackCard from "@/components/music/MusicTrackCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUsers, getTracks, STORAGE_PREFIX, followUser, unfollowUser, getIsFollowing } from "@/services/localStorage";
import { User, Track } from "@/lib/types";
import { useData } from "@/providers/DataProvider";
import { toast } from "sonner";

export default function ExplorePage() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [activeTab, setActiveTab] = useState("trending");
  const { currentUser } = useData();

  const refresh = useCallback(() => {
    setAllUsers(getUsers());
    setAllTracks(getTracks());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key?.startsWith(STORAGE_PREFIX)) refresh();
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [refresh]);

  // Stable featured selection: sort by follower count instead of random
  const featuredUsers = useMemo(
    () => [...allUsers].sort((a, b) => b.followers - a.followers).slice(0, 8),
    [allUsers]
  );
  const verifiedArtists = allUsers.filter((u) => u.isVerified);

  const risingStars = useMemo(() =>
    [...allTracks]
      .sort((a, b) => {
        const aAge = Math.max(1, (Date.now() - new Date(a.createdAt).getTime()) / 86400000);
        const bAge = Math.max(1, (Date.now() - new Date(b.createdAt).getTime()) / 86400000);
        return (b.likes + b.plays) / bAge - (a.likes + a.plays) / aAge;
      })
      .slice(0, 8),
  [allTracks]);

  const popularTracks = useMemo(() =>
    [...allTracks].sort((a, b) => b.plays - a.plays).slice(0, 8),
  [allTracks]);

  const trendingTracks = useMemo(() =>
    [...allTracks].sort((a, b) => b.likes - a.likes).slice(0, 8),
  [allTracks]);

  const newTracks = useMemo(() =>
    [...allTracks]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8),
  [allTracks]);

  const handleFollow = (targetUser: User) => {
    if (!currentUser) {
      toast.error("Connect your wallet to follow artists");
      return;
    }
    if (currentUser.id === targetUser.id) return;

    const already = getIsFollowing(currentUser.id, targetUser.id);
    if (already) {
      unfollowUser(currentUser.id, targetUser.id);
      toast.success(`Unfollowed ${targetUser.displayName}`);
    } else {
      followUser(currentUser.id, targetUser.id);
      toast.success(`Following ${targetUser.displayName}`);
    }
    refresh();
  };

  const ArtistCard = ({ user }: { user: User }) => {
    const isFollowing = currentUser ? getIsFollowing(currentUser.id, user.id) : false;
    const isSelf = currentUser?.id === user.id;
    return (
      <div className="bg-secondary/50 rounded-lg p-4 hover:bg-secondary/70 transition">
        <div className="flex flex-col items-center text-center">
          <Link to={`/profile/${user.id}`}>
            <AvatarWithVerify
              src={user.avatar}
              fallback={user.displayName}
              isVerified={user.isVerified}
              size="lg"
              className="mb-3"
            />
          </Link>
          <Link to={`/profile/${user.id}`} className="hover:underline">
            <h3 className="font-semibold">{user.displayName}</h3>
          </Link>
          <p className="text-sm text-muted-foreground">{user.username}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {user.followers.toLocaleString()} followers
          </p>
          {!isSelf && (
            <Button
              variant={isFollowing ? "default" : "outline"}
              size="sm"
              className="mt-3"
              onClick={() => handleFollow(user)}
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
          )}
        </div>
      </div>
    );
  };

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
              <ArtistCard key={user.id} user={user} />
            ))}
          </div>
        ) : (
          <EmptyUsers />
        )}
      </section>

      <section>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="rising">Rising Stars</TabsTrigger>
          </TabsList>

          {[
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
              <ArtistCard key={user.id} user={user} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Track } from "@/lib/types";
import { getLikedTracks, STORAGE_KEYS } from "@/services/localStorage";
import MusicTrackCard from "@/components/music/MusicTrackCard";
import { useData } from "@/providers/DataProvider";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function LikedSongsPage() {
  const { currentUser } = useData();
  const [tracks, setTracks] = useState<Track[]>([]);

  const load = () => {
    if (currentUser) setTracks(getLikedTracks(currentUser.id));
  };

  useEffect(() => {
    load();
  }, [currentUser]);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.TRACKS) load();
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Heart className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Connect your wallet</h2>
        <p className="text-muted-foreground">Connect your wallet to see your liked songs.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
          <Heart className="h-8 w-8 text-white fill-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Liked Songs</h1>
          <p className="text-muted-foreground mt-1">
            {tracks.length} {tracks.length === 1 ? "track" : "tracks"}
          </p>
        </div>
      </div>

      {tracks.length > 0 ? (
        <div className="space-y-4">
          {tracks.map((track) => (
            <MusicTrackCard key={track.id} track={track} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl border-2 border-dashed border-border/50 bg-muted/20 text-center">
          <Heart className="h-14 w-14 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No liked songs yet</h3>
          <p className="text-muted-foreground mb-6">
            Like tracks to save them here for easy listening.
          </p>
          <Button asChild>
            <Link to="/explore">Discover Music</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

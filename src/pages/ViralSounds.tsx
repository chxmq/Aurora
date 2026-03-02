import { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MusicTrackCard from "@/components/MusicTrackCard";
import { getTracks } from "@/services/localStorage";
import { calculateTrackScore } from "@/lib/algorithms";
import { Track } from "@/lib/types";

export default function ViralSoundsPage() {
  const [tracks, setTracks] = useState<Track[]>([]);

  const buildList = () => {
    const all = getTracks();
    const scored = all
      .map((track) => ({ track, score: calculateTrackScore(track) }))
      .sort((a, b) => b.score - a.score)
      .reduce((acc: Track[], { track }) => {
        const creatorCount = acc.filter((t) => t.artist.id === track.artist.id).length;
        if (creatorCount < 2) acc.push(track);
        return acc;
      }, [])
      .slice(0, 12);
    setTracks(scored);
  };

  useEffect(() => {
    buildList();
  }, []);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key?.startsWith("sai_music_tracks")) buildList();
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Viral Sounds</h1>
        <p className="text-lg text-muted-foreground">
          The hottest tracks on Aurora ranked by plays, likes, and recency.
        </p>
      </div>

      {tracks.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {tracks.map((track) => (
            <MusicTrackCard key={track.id} track={track} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 rounded-3xl border-2 border-dashed border-border/50 bg-muted/20">
          <TrendingUp className="h-16 w-16 text-muted-foreground/40 mb-4" />
          <h3 className="text-xl font-semibold text-muted-foreground mb-2">Nothing trending yet</h3>
          <p className="text-muted-foreground mb-6 text-center max-w-xs">
            Upload tracks and get plays — the chart fills up as the community grows.
          </p>
          <Button asChild>
            <Link to="/create">Upload a Track</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

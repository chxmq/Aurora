import { useState, useEffect } from "react";

import MusicTrackCard from "@/components/MusicTrackCard";
import { mockTracks, mockUsers } from "@/lib/mockData";
import { Track } from "@/lib/types";

// Calculate track score based on multiple factors
const calculateTrackScore = (track: Track) => {
  const now = new Date();
  const trackDate = new Date(track.createdAt);
  const daysSinceCreation = (now.getTime() - trackDate.getTime()) / (1000 * 60 * 60 * 24);
  
  // Normalize values to a 0-1 scale
  const likesScore = track.likes / 5000; // Increased max likes threshold
  const playsScore = track.plays / 100000; // Increased max plays threshold
  const followersScore = track.artist.followers / 100000;
  const commentsScore = track.comments / 200;
  const recencyScore = Math.max(0, 1 - daysSinceCreation / 30);
  
  // Weight the different factors
  const weights = {
    likes: 0.3,
    plays: 0.3,
    followers: 0.2,
    comments: 0.1,
    recency: 0.1
  };
  
  // Calculate final score
  return (
    likesScore * weights.likes +
    playsScore * weights.plays +
    followersScore * weights.followers +
    commentsScore * weights.comments +
    recencyScore * weights.recency
  );
};

export default function ViralSoundsPage() {
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    // Get all tracks with their scores
    const tracksWithScores = mockTracks.map(track => ({
      track,
      score: calculateTrackScore(track)
    }));

    // Sort by score and get top tracks from different creators
    const sortedTracks = tracksWithScores
      .sort((a, b) => b.score - a.score)
      .reduce((acc: Track[], curr) => {
        // Only add if we don't already have too many tracks from this creator
        const creatorTracks = acc.filter(track => track.artist.id === curr.track.artist.id);
        if (creatorTracks.length < 2) { // Allow up to 2 tracks per creator
          acc.push(curr.track);
        }
        return acc;
      }, [])
      .slice(0, 12); // Show top 12 tracks

    setTracks(sortedTracks);
  }, []);

  return (
    
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Viral Sounds</h1>
          <p className="text-lg text-muted-foreground">
            Discover the hottest tracks from the most talented artists on musicnft.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {tracks.map((track) => (
            <MusicTrackCard key={track.id} track={track} />
          ))}
        </div>
      </div>
    
  );
}

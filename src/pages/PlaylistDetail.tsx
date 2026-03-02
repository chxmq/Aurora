import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Music, ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Playlist, Track } from "@/lib/types";
import { getPlaylists, getTracks, deletePlaylist, removeTrackFromPlaylist, updatePlaylist } from "@/services/localStorage";
import MusicTrackCard from "@/components/music/MusicTrackCard";
import { useData } from "@/providers/DataProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function PlaylistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useData();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");

  const load = () => {
    const found = getPlaylists().find(p => p.id === id) ?? null;
    setPlaylist(found);
    if (found) {
      const allTracks = getTracks();
      setTracks(found.trackIds.map(tid => allTracks.find(t => t.id === tid)).filter(Boolean) as Track[]);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleDelete = () => {
    if (!playlist) return;
    deletePlaylist(playlist.id);
    toast.success(`Deleted "${playlist.name}"`);
    navigate("/playlists");
  };

  const handleRemoveTrack = (trackId: string) => {
    if (!playlist) return;
    removeTrackFromPlaylist(playlist.id, trackId);
    load();
    toast.success("Track removed from playlist");
  };

  const handleRename = () => {
    if (!playlist || !editName.trim()) return;
    const updated = { ...playlist, name: editName.trim(), updatedAt: new Date().toISOString() };
    updatePlaylist(updated);
    setPlaylist(updated);
    setIsEditing(false);
    toast.success("Playlist renamed");
  };

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Music className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Playlist not found</h2>
        <Button variant="outline" onClick={() => navigate("/playlists")} className="gap-2 mt-4">
          <ArrowLeft className="h-4 w-4" /> Back to Playlists
        </Button>
      </div>
    );
  }

  const isOwner = currentUser?.id === playlist.userId;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Button variant="ghost" size="sm" onClick={() => navigate("/playlists")} className="gap-2 mb-6 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      {/* Header */}
      <div className="flex items-start gap-6 mb-8">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-brand-400/30 to-purple-500/30 flex items-center justify-center shrink-0 overflow-hidden shadow-lg">
          {playlist.coverArt ? (
            <img src={playlist.coverArt} alt={playlist.name} className="w-full h-full object-cover" />
          ) : (
            <Music className="h-10 w-10 text-brand-500/60" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex gap-2 mb-2">
              <Input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleRename(); if (e.key === "Escape") setIsEditing(false); }}
                className="text-2xl font-bold h-auto py-1"
                autoFocus
              />
              <Button size="sm" onClick={handleRename}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          ) : (
            <h1 className="text-3xl font-bold truncate">{playlist.name}</h1>
          )}
          {playlist.description && (
            <p className="text-muted-foreground mt-1">{playlist.description}</p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            {tracks.length} {tracks.length === 1 ? "track" : "tracks"}
          </p>
          {isOwner && !isEditing && (
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => { setEditName(playlist.name); setIsEditing(true); }}
              >
                <Pencil className="h-3.5 w-3.5" /> Rename
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:text-destructive" onClick={handleDelete}>
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tracks */}
      {tracks.length > 0 ? (
        <div className="space-y-4">
          {tracks.map(track => (
            <div key={track.id} className="group relative">
              <MusicTrackCard track={track} />
              {isOwner && (
                <button
                  onClick={() => handleRemoveTrack(track.id)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 bg-background/80 hover:bg-destructive/10 hover:text-destructive transition-all duration-200 z-10"
                  title="Remove from playlist"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl border-2 border-dashed border-border/50 bg-muted/20 text-center">
          <Music className="h-14 w-14 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tracks yet</h3>
          <p className="text-muted-foreground">
            Add tracks to this playlist using the menu on any track card.
          </p>
        </div>
      )}
    </div>
  );
}

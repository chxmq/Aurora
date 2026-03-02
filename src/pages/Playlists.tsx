import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Music, Plus, Trash2 } from "lucide-react";
import { Playlist } from "@/lib/types";
import { getPlaylistsForUser, deletePlaylist, STORAGE_KEYS } from "@/services/localStorage";
import { useData } from "@/providers/DataProvider";
import { Button } from "@/components/ui/button";
import CreatePlaylistModal from "@/components/playlist/CreatePlaylistModal";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function PlaylistsPage() {
  const { currentUser } = useData();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [createOpen, setCreateOpen] = useState(false);

  const load = () => {
    if (currentUser) setPlaylists(getPlaylistsForUser(currentUser.id));
  };

  useEffect(() => {
    load();
  }, [currentUser]);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.PLAYLISTS) load();
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [currentUser]);

  const handleDelete = (id: string, name: string) => {
    deletePlaylist(id);
    setPlaylists(prev => prev.filter(p => p.id !== id));
    toast.success(`Deleted "${name}"`);
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Music className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Connect your wallet</h2>
        <p className="text-muted-foreground">Connect your wallet to manage your playlists.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Music className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">My Playlists</h1>
            <p className="text-muted-foreground mt-1">
              {playlists.length} {playlists.length === 1 ? "playlist" : "playlists"}
            </p>
          </div>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Playlist
        </Button>
      </div>

      {playlists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {playlists.map(playlist => (
            <div key={playlist.id} className="group relative bg-secondary/30 hover:bg-secondary/50 rounded-2xl p-4 transition-all duration-200 border border-border/50">
              <Link to={`/playlist/${playlist.id}`} className="block">
                <div className="aspect-square rounded-xl bg-gradient-to-br from-brand-400/30 to-purple-500/30 flex items-center justify-center mb-3 overflow-hidden">
                  {playlist.coverArt ? (
                    <img src={playlist.coverArt} alt={playlist.name} className="w-full h-full object-cover" />
                  ) : (
                    <Music className="h-12 w-12 text-brand-500/60" />
                  )}
                </div>
                <h3 className="font-semibold truncate">{playlist.name}</h3>
                {playlist.description && (
                  <p className="text-sm text-muted-foreground truncate mt-0.5">{playlist.description}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {playlist.trackIds.length} {playlist.trackIds.length === 1 ? "track" : "tracks"} ·{" "}
                  {formatDistanceToNow(new Date(playlist.updatedAt), { addSuffix: true })}
                </p>
              </Link>
              <button
                onClick={() => handleDelete(playlist.id, playlist.name)}
                className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                title="Delete playlist"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl border-2 border-dashed border-border/50 bg-muted/20 text-center">
          <Music className="h-14 w-14 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No playlists yet</h3>
          <p className="text-muted-foreground mb-6">
            Create a playlist to organise your favourite tracks.
          </p>
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Playlist
          </Button>
        </div>
      )}

      <CreatePlaylistModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={load}
      />
    </div>
  );
}

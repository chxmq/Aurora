import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Music, Plus, Check } from "lucide-react";
import { Playlist } from "@/lib/types";
import { getPlaylistsForUser, addTrackToPlaylist, createPlaylist } from "@/services/localStorage";
import { useData } from "@/providers/DataProvider";
import { generateId } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface AddToPlaylistModalProps {
  trackId: string;
  trackTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddToPlaylistModal({ trackId, trackTitle, open, onOpenChange }: AddToPlaylistModalProps) {
  const { currentUser } = useData();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newName, setNewName] = useState("");
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    if (open && currentUser) setPlaylists(getPlaylistsForUser(currentUser.id));
  }, [open, currentUser]);

  const handleAdd = (playlist: Playlist) => {
    if (playlist.trackIds.includes(trackId)) {
      toast.info(`Already in "${playlist.name}"`);
      return;
    }
    addTrackToPlaylist(playlist.id, trackId);
    setPlaylists(getPlaylistsForUser(currentUser!.id));
    toast.success(`Added to "${playlist.name}"`);
  };

  const handleCreateAndAdd = () => {
    if (!newName.trim() || !currentUser) return;
    const playlist: Playlist = {
      id: generateId(),
      name: newName.trim(),
      trackIds: [trackId],
      userId: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    createPlaylist(playlist);
    setPlaylists(getPlaylistsForUser(currentUser.id));
    setNewName("");
    setShowNew(false);
    toast.success(`Added to new playlist "${playlist.name}"`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add to Playlist</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground -mt-2 truncate">"{trackTitle}"</p>

        <div className="space-y-2 mt-2 max-h-64 overflow-y-auto">
          {playlists.length === 0 && !showNew && (
            <p className="text-sm text-muted-foreground text-center py-4">No playlists yet.</p>
          )}
          {playlists.map(playlist => {
            const already = playlist.trackIds.includes(trackId);
            return (
              <button
                key={playlist.id}
                onClick={() => handleAdd(playlist)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-400/30 to-purple-500/30 flex items-center justify-center shrink-0">
                  <Music className="h-4 w-4 text-brand-500/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{playlist.name}</p>
                  <p className="text-xs text-muted-foreground">{playlist.trackIds.length} tracks</p>
                </div>
                {already && <Check className="h-4 w-4 text-brand-500 shrink-0" />}
              </button>
            );
          })}
        </div>

        <div className="border-t pt-3 mt-1">
          {showNew ? (
            <div className="flex gap-2">
              <Input
                placeholder="New playlist name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleCreateAndAdd(); if (e.key === "Escape") setShowNew(false); }}
                autoFocus
                className="flex-1"
              />
              <Button size="sm" onClick={handleCreateAndAdd} disabled={!newName.trim()}>Create</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => setShowNew(true)}>
              <Plus className="h-4 w-4" /> New Playlist
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

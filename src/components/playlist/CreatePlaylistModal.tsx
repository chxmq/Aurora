import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createPlaylist } from "@/services/localStorage";
import { useData } from "@/providers/DataProvider";
import { generateId } from "@/lib/utils";
import { toast } from "sonner";

interface CreatePlaylistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

export default function CreatePlaylistModal({ open, onOpenChange, onCreated }: CreatePlaylistModalProps) {
  const { currentUser } = useData();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) { toast.error("Connect your wallet first"); return; }
    if (!name.trim()) { toast.error("Playlist name is required"); return; }

    setIsSubmitting(true);
    try {
      createPlaylist({
        id: generateId(),
        name: name.trim(),
        description: description.trim() || undefined,
        trackIds: [],
        userId: currentUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      toast.success(`Playlist "${name.trim()}" created`);
      setName("");
      setDescription("");
      onOpenChange(false);
      onCreated?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Playlist</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="playlist-name">Name</Label>
            <Input
              id="playlist-name"
              placeholder="My awesome playlist"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="playlist-desc">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Textarea
              id="playlist-desc"
              placeholder="What's this playlist about?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

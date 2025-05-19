
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AvatarWithVerify } from "@/components/ui/avatar-with-verify";
import { User } from "@/lib/types";
import { useWallet } from "@/lib/walletUtils";
import { toast } from "sonner";

interface TipArtistModalProps {
  artist: User;
  buttonText?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export default function TipArtistModal({
  artist,
  buttonText = "Support Artist",
  variant = "default",
  size = "default",
  className = "",
}: TipArtistModalProps) {
  const [amount, setAmount] = useState("0.01");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isConnected, connectWallet, tipArtist, balance } = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    if (balance && parseFloat(amount) > parseFloat(balance)) {
      toast.error("Insufficient funds in your wallet");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Mock artist address (in a real app this would come from the artist's profile)
      const artistAddress = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
      
      await tipArtist(artistAddress, amount, () => {
        toast.success(`Successfully supported ${artist.displayName} with ${amount} ETH!`);
        setIsOpen(false);
      });
    } catch (error) {
      console.error("Error sending tip:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const presetAmounts = ["0.01", "0.05", "0.1", "0.5", "1"];
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          {buttonText}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Support {artist.displayName}</DialogTitle>
          <DialogDescription>
            Send a tip directly to the artist using your connected wallet.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center justify-center py-4">
          <AvatarWithVerify
            src={artist.avatar}
            fallback={artist.displayName}
            isVerified={artist.isVerified}
            size="lg"
          />
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount (ETH)
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-5 gap-2">
              {presetAmounts.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(preset)}
                >
                  {preset} ETH
                </Button>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            {!isConnected ? (
              <Button type="button" onClick={connectWallet}>
                Connect Wallet
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting} className="bg-music-primary hover:bg-music-secondary">
                {isSubmitting ? "Processing..." : `Support with ${amount} ETH`}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

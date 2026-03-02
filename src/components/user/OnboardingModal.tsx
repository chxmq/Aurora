import { useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, ArrowRight, Music2, CheckCircle2 } from "lucide-react";
import { User } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { getUsers, saveUsers, saveCurrentUser } from "@/services/localStorage";
import { storeFile } from "@/services/fileStorage";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface OnboardingModalProps {
  open: boolean;
  walletAddress: string;
  onComplete: (user: User) => void;
}

const STEP_COUNT = 2;

export default function OnboardingModal({ open, walletAddress, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const shortAddress = `${walletAddress.substring(0, 6)}…${walletAddress.substring(walletAddress.length - 4)}`;

  const validateUsername = (value: string) => {
    const clean = value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(clean);
    if (clean.length < 3) {
      setUsernameError("Username must be at least 3 characters");
    } else if (getUsers().some(u => u.username === `@${clean}` && u.walletAddress !== walletAddress)) {
      setUsernameError("Username already taken");
    } else {
      setUsernameError("");
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image"); return; }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = ev => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleNext = () => {
    if (!displayName.trim()) { toast.error("Please enter your name"); return; }
    if (username.length < 3 || usernameError) { toast.error(usernameError || "Invalid username"); return; }
    setStep(2);
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      let avatarUrl = "/placeholder.svg";
      if (avatarFile) {
        const fileId = await storeFile(avatarFile);
        avatarUrl = `file://${fileId}`;
      }

      const newUser: User = {
        id: generateId(),
        username: `@${username}`,
        displayName: displayName.trim(),
        avatar: avatarUrl,
        isVerified: false,
        followers: 0,
        following: 0,
        followersList: [],
        followingList: [],
        posts: 0,
        bio: bio.trim() || undefined,
        walletAddress,
      };

      const users = getUsers();
      saveUsers([...users, newUser]);
      saveCurrentUser(newUser);
      onComplete(newUser);
      toast.success("Welcome to Aurora!");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong, please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md p-0 overflow-hidden gap-0 [&>button]:hidden"
        onInteractOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
      >
        {/* Progress bar */}
        <div className="h-1 bg-secondary">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-purple-500 transition-all duration-500"
            style={{ width: `${(step / STEP_COUNT) * 100}%` }}
          />
        </div>

        <div className="p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Music2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">
                {step === 1 ? "Create your profile" : "Personalise it"}
              </h2>
              <p className="text-xs text-muted-foreground">Step {step} of {STEP_COUNT}</p>
            </div>
          </div>

          {/* Step 1 — name + username */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="ob-name">Display Name <span className="text-destructive">*</span></Label>
                <Input
                  id="ob-name"
                  placeholder="Your name"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ob-username">Username <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground select-none">@</span>
                  <Input
                    id="ob-username"
                    placeholder="yourhandle"
                    value={username}
                    onChange={e => validateUsername(e.target.value)}
                    className={cn("pl-7", usernameError && "border-destructive")}
                  />
                </div>
                {usernameError && <p className="text-xs text-destructive">{usernameError}</p>}
                {!usernameError && username.length >= 3 && (
                  <p className="text-xs text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> @{username} is available
                  </p>
                )}
              </div>

              <div className="pt-1 p-3 rounded-xl bg-muted/50 text-xs text-muted-foreground">
                Connected wallet: <span className="font-mono font-medium">{shortAddress}</span>
              </div>

              <Button
                className="w-full gap-2 mt-2"
                onClick={handleNext}
                disabled={!displayName.trim() || username.length < 3 || !!usernameError}
              >
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Step 2 — avatar + bio */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Avatar upload */}
              <div className="flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="relative group"
                >
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarPreview ?? undefined} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-brand-400/30 to-purple-500/30 text-2xl font-bold">
                      {displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="text-sm text-brand-500 hover:underline"
                >
                  {avatarPreview ? "Change photo" : "Upload profile photo"}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ob-bio">
                  Bio <span className="text-muted-foreground font-normal text-xs">(optional)</span>
                </Label>
                <Textarea
                  id="ob-bio"
                  placeholder="Tell the world about yourself..."
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={3}
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground text-right">{bio.length}/160</p>
              </div>

              <div className="flex gap-3 pt-1">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleFinish}
                  disabled={isSubmitting}
                  className="flex-1 gap-2"
                >
                  {isSubmitting ? "Creating…" : "Let's go!"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

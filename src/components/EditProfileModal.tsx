
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from "lucide-react";

interface EditProfileModalProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdate: (updatedUser: Partial<User>) => void;
}

export default function EditProfileModal({ 
  user, 
  open, 
  onOpenChange,
  onProfileUpdate 
}: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    displayName: user.displayName,
    username: user.username,
    bio: user.bio || "",
    avatarUrl: user.avatar
  });
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reset form when user changes or modal opens
  React.useEffect(() => {
    if (open) {
      setFormData({
        displayName: user.displayName,
        username: user.username,
        bio: user.bio || "",
        avatarUrl: user.avatar
      });
      setPreviewImage(null);
    }
  }, [user, open]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is too large. Maximum size is 5MB.");
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      toast.error("Uploaded file is not an image.");
      return;
    }
    
    // Create a data URL for preview
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreviewImage(reader.result);
        toast.success("Image preview loaded");
      }
    };
    reader.readAsDataURL(file);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate form data
    if (!formData.displayName.trim()) {
      toast.error("Display name cannot be empty");
      setIsSubmitting(false);
      return;
    }
    
    if (!formData.username.trim()) {
      toast.error("Username cannot be empty");
      setIsSubmitting(false);
      return;
    }
    
    // In a real app, you'd upload the image to a server here
    
    // Simulating API call delay
    setTimeout(() => {
      const updatedUserData = {
        displayName: formData.displayName,
        username: formData.username,
        bio: formData.bio,
        avatar: previewImage || formData.avatarUrl
      };
      
      onProfileUpdate(updatedUserData);
      
      toast.success("Profile updated successfully!");
      onOpenChange(false);
      setIsSubmitting(false);
    }, 500);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Profile picture upload */}
          <div className="flex flex-col items-center space-y-3">
            <Avatar className="h-24 w-24">
              <AvatarImage 
                src={previewImage || formData.avatarUrl}
                alt={formData.displayName}
              />
              <AvatarFallback>{formData.displayName.substring(0, 2)}</AvatarFallback>
            </Avatar>
            
            <div className="relative">
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Label 
                htmlFor="avatar-upload"
                className="flex items-center gap-2 px-4 py-2 text-sm border rounded-md cursor-pointer hover:bg-accent"
              >
                <Upload className="h-4 w-4" />
                Upload Profile Picture
              </Label>
              {previewImage && (
                <p className="text-xs text-green-600 mt-1 text-center">New image selected</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={3}
              placeholder="Tell us about yourself..."
            />
          </div>
          
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting} className="bg-music-primary hover:bg-music-secondary">
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

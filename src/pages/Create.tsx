import { useState, useRef, useEffect } from "react";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music, Upload, FileMusic, X } from "lucide-react";
import { useWallet } from "@/lib/walletUtils";
import { toast } from "sonner";
import { addPost, addTrack, getUserByWalletAddress } from "@/lib/mockData";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function CreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isConnected, connectWallet, address } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'post' ? 'post' : 'track');
  
  // Update active tab when URL parameter changes
  useEffect(() => {
    setActiveTab(searchParams.get('tab') === 'post' ? 'post' : 'track');
  }, [searchParams]);

  // Track form state
  const [trackForm, setTrackForm] = useState({
    title: "",
    description: "",
    price: "0.01"
  });
  
  // File states
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverArtFile, setCoverArtFile] = useState<File | null>(null);
  const [coverArtPreview, setCoverArtPreview] = useState<string | null>(null);
  const [postMediaFile, setPostMediaFile] = useState<File | null>(null);
  const [postMediaPreview, setPostMediaPreview] = useState<string | null>(null);
  
  // Refs for file inputs
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverArtInputRef = useRef<HTMLInputElement>(null);
  const postMediaInputRef = useRef<HTMLInputElement>(null);
  
  // Post form state
  const [postForm, setPostForm] = useState({
    content: ""
  });
  
  const handleTrackFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTrackForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePostFormChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPostForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'audio' | 'coverArt' | 'postMedia') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'audio') {
      // Accept any audio file and trust the browser's audio support
      if (!file.type.startsWith('audio/') && 
          !file.name.toLowerCase().match(/\.(mp3|wav|ogg|m4a|aac|mp4)$/)) {
        toast.error('Please select a valid audio file (MP3, WAV, OGG, M4A, AAC, MP4)');
        return;
      }
      
      setAudioFile(file);
      toast.success('Audio file selected successfully!');
    } else if (type === 'coverArt' || type === 'postMedia') {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file (JPG, PNG, GIF)');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        if (type === 'coverArt') {
          setCoverArtFile(file);
          setCoverArtPreview(preview);
          toast.success('Cover art uploaded successfully!');
        } else {
          setPostMediaFile(file);
          setPostMediaPreview(preview);
          toast.success('Media uploaded successfully!');
        }
      };

      reader.onerror = () => {
        toast.error('Error reading the image file. Please try another one.');
      };

      reader.readAsDataURL(file);
    }
  };

  const clearFile = (type: 'audio' | 'coverArt' | 'postMedia') => {
    if (type === 'audio') {
      setAudioFile(null);
      if (audioInputRef.current) audioInputRef.current.value = '';
    } else if (type === 'coverArt') {
      setCoverArtFile(null);
      setCoverArtPreview(null);
      if (coverArtInputRef.current) coverArtInputRef.current.value = '';
    } else {
      setPostMediaFile(null);
      setPostMediaPreview(null);
      if (postMediaInputRef.current) postMediaInputRef.current.value = '';
    }
  };
  
  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    if (!trackForm.title.trim()) {
      toast.error("Track title is required");
      return;
    }

    if (!audioFile) {
      toast.error("Audio file is required");
      return;
    }

    if (!coverArtFile) {
      toast.error("Cover art is required");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get the current user by wallet address
      const user = getUserByWalletAddress(address || "");
      if (!user) {
        toast.error("User not found");
        return;
      }

      // Create a static audio URL that can be accessed later
      const audioFileName = `track-${Date.now()}-${audioFile.name}`;
      const audioUrl = `/music/${audioFileName}`;

      // For mock data, we'll use a sample audio URL that we know works
      const sampleAudioUrl = "/src/music/electronic-future-beats-117997.mp3";
      
      // Add the track using mockData function
      const newTrack = addTrack({
        title: trackForm.title,
        artist: user,
        coverArt: coverArtPreview || '/images/music-cover.jpg',
        audioUrl: sampleAudioUrl, // Use sample audio URL for now
        duration: 180 // Default duration for sample track
      });

      // Reset form
      setTrackForm({
        title: "",
        description: "",
        price: "0.01"
      });
      setAudioFile(null);
      setCoverArtFile(null);
      setCoverArtPreview(null);

      toast.success("Track created successfully! View it on your profile.", {
        action: {
          label: "View Profile",
          onClick: () => navigate('/profile')
        }
      });
    } catch (error) {
      console.error("Error creating track:", error);
      toast.error("Failed to create track. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    if (!postForm.content.trim()) {
      toast.error("Post content is required");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get the current user by wallet address
      const user = getUserByWalletAddress(address || "");
      if (!user) {
        toast.error("User not found");
        return;
      }

      // Add the post using mockData function
      const newPost = addPost({
        userId: user.id,
        content: postForm.content,
        image: postMediaPreview || undefined
      });

      // Reset form
      setPostForm({ content: "" });
      setPostMediaFile(null);
      setPostMediaPreview(null);

      toast.success("Post created successfully! View it on your profile.", {
        action: {
          label: "View Profile",
          onClick: () => navigate('/profile')
        }
      });
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a function to handle tab changes
  const handleTabChange = (value: string) => {
    // Reset forms when switching tabs
    if (value === 'track') {
      setPostForm({ content: "" });
      setPostMediaFile(null);
      setPostMediaPreview(null);
    } else {
      setTrackForm({
        title: "",
        description: "",
        price: "0.01"
      });
      setAudioFile(null);
      setCoverArtFile(null);
      setCoverArtPreview(null);
    }
  };
  
  if (!isConnected) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20">
          <h1 className="text-2xl font-bold mb-6">Connect Wallet to Create</h1>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            You need to connect your MetaMask wallet to create tracks as NFTs or post content.
          </p>
          <Button onClick={connectWallet} className="bg-music-primary hover:bg-music-secondary">
            Connect Wallet
          </Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Create</h1>
      
      <Tabs 
        value={activeTab} 
        className="max-w-2xl mx-auto" 
        onValueChange={(value) => {
          setActiveTab(value);
          handleTabChange(value);
          // Update URL without navigation
          const newSearchParams = new URLSearchParams(searchParams);
          if (value === 'post') {
            newSearchParams.set('tab', 'post');
          } else {
            newSearchParams.delete('tab');
          }
          navigate(`?${newSearchParams.toString()}`, { replace: true });
        }}
      >
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="track" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            <span>Create Track NFT</span>
          </TabsTrigger>
          <TabsTrigger value="post" className="flex items-center gap-2">
            <FileMusic className="h-4 w-4" />
            <span>Create Post</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="track">
          <div className="bg-secondary/20 rounded-lg p-6 mt-4">
            <form onSubmit={handleTrackSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Track Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter track title"
                    value={trackForm.title}
                    onChange={handleTrackFormChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your track"
                    rows={4}
                    value={trackForm.description}
                    onChange={handleTrackFormChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="audio">Upload Audio File</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center relative">
                    {audioFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <Music className="h-6 w-6 text-music-primary" />
                        <span className="text-sm">{audioFile.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 absolute top-2 right-2"
                          onClick={() => clearFile('audio')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground mb-2">
                          Drag and drop an audio file here, or click to browse
                        </p>
                        <Input
                          ref={audioInputRef}
                          type="file"
                          accept="audio/*,.mp3,.wav,.ogg,.m4a"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, 'audio')}
                        />
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => audioInputRef.current?.click()}
                        >
                          Choose File
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="coverArt">Upload Cover Art</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center relative">
                    {coverArtPreview ? (
                      <div className="relative">
                        <img
                          src={coverArtPreview}
                          alt="Cover Art Preview"
                          className="max-h-40 mx-auto rounded"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 absolute top-2 right-2"
                          onClick={() => clearFile('coverArt')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground mb-2">
                          Drag and drop an image file here, or click to browse
                        </p>
                        <Input
                          ref={coverArtInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, 'coverArt')}
                        />
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => coverArtInputRef.current?.click()}
                        >
                          Choose File
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="price">Price (ETH)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.01"
                    value={trackForm.price}
                    onChange={handleTrackFormChange}
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-music-primary hover:bg-music-secondary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating Track NFT..." : "Create Track NFT"}
                </Button>
              </div>
            </form>
          </div>
        </TabsContent>
        
        <TabsContent value="post">
          <div className="bg-secondary/20 rounded-lg p-6 mt-4">
            <form onSubmit={handlePostSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="content">Post Content</Label>
                  <Textarea
                    id="content"
                    name="content"
                    placeholder="What's on your mind?"
                    rows={6}
                    value={postForm.content}
                    onChange={handlePostFormChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="media">Add Media (Optional)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center relative">
                    {postMediaPreview ? (
                      <div className="relative">
                        <img
                          src={postMediaPreview}
                          alt="Media Preview"
                          className="max-h-40 mx-auto rounded"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 absolute top-2 right-2"
                          onClick={() => clearFile('postMedia')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground mb-2">
                          Drag and drop an image file here, or click to browse
                        </p>
                        <Input
                          ref={postMediaInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, 'postMedia')}
                        />
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => postMediaInputRef.current?.click()}
                        >
                          Choose File
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-music-primary hover:bg-music-secondary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating Post..." : "Create Post"}
                </Button>
              </div>
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}

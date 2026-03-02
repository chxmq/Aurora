import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserByWalletAddress, updateUser } from "@/services/data";
import { getTracks, getPosts, getUsers, saveUsers, saveIPFSMapping, followUser, unfollowUser, getIsFollowing, saveNotification } from "@/services/localStorage";
import { User, Track, Post } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AvatarWithVerify } from "@/components/ui/avatar-with-verify";
import { Button } from "@/components/ui/button";
import MusicTrackCard from "@/components/music/MusicTrackCard";
import PostCard from "@/components/post/PostCard";
import TipArtistModal from "@/components/user/TipArtistModal";
import EditProfileModal from "@/components/user/EditProfileModal";
import { useWallet } from "@/providers/walletUtils";
import { useData } from "@/providers/DataProvider";
import { toast } from "sonner";
import { saveUserToPinata } from "@/services/pinata";
import { FEATURES } from "@/lib/config";
import { useStorage } from "@/providers/StorageProvider";

export default function ProfilePage() {
  const { id } = useParams();
  const { isConnected, address, connectWallet } = useWallet();
  const { isPinataInitialized } = useStorage();
  const { currentUser } = useData();
  const [user, setUser] = useState<User | null>(null);
  const [userTracks, setUserTracks] = useState<Track[]>([]);
  const [userPosts, setUserPosts] = useState<(Post & { user: User })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const navigate = useNavigate();
  
  // Load user data - either by ID or by connected wallet
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const users = getUsers();
        
        let userData: User | null = null;
        
        // Different ways to load user data
        if (id) {
          // Specific user by ID
          userData = users.find(u => u.id === id) || null;
        } else if (address) {
          // Current user by wallet address
          userData = users.find(u => u.walletAddress?.toLowerCase() === address.toLowerCase());
          
          // New wallet with no profile yet — OnboardingGate handles creation
          if (!userData && isConnected) {
            setIsLoading(false);
            return;
          }
        }
        
        if (!userData) {
          if (!id && !isConnected) {
            toast.error("Please connect your wallet to view your profile");
            navigate('/');
            return;
          }
          throw new Error("User not found");
        }
        
        setUser(userData);

        // Initialise follow state from persisted data
        if (currentUser && userData.id !== currentUser.id) {
          setIsFollowing(getIsFollowing(currentUser.id, userData.id));
        }

        // Get user's tracks
        const tracks = userData ? getTracks().filter(track => track.artist.id === userData.id) : [];
        setUserTracks(tracks);
        
        // Get user's posts from localStorage
        const posts = userData
          ? getPosts().filter((p) => p.userId === userData.id)
          : [];
        setUserPosts(posts.map((p) => ({ ...p, user: userData! })));
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [id, address, isConnected, navigate, currentUser]);
  
  const handleProfileUpdate = async (updatedUserData: Partial<User>) => {
    if (user) {
      try {
        toast.loading("Updating profile...");
        
        // Get fresh users data from local storage
        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === user.id);
        
        if (userIndex === -1) {
          throw new Error('User not found');
        }
        
        // Update user data
        const updatedUser = {
          ...users[userIndex],
          ...updatedUserData
        };
        
        // Update in local storage
        users[userIndex] = updatedUser;
        saveUsers(users);
        
        // Try to save to Pinata if enabled
        if (FEATURES.ENABLE_PINATA && isPinataInitialized) {
          try {
            const hash = await saveUserToPinata(updatedUser);
            // Save Pinata mapping
            saveIPFSMapping({
              id: updatedUser.id,
              cid: hash,
              type: 'user',
              timestamp: Date.now()
            });
          } catch (pinataError) {
            console.warn('Failed to save to Pinata, continuing with local storage:', pinataError);
          }
        }
        
        // Update local state
        setUser(updatedUser);
        
        // Update user reference in tracks
        const updatedTracks = userTracks.map(track => ({
          ...track,
          artist: track.artist.id === user.id ? updatedUser : track.artist
        }));
        setUserTracks(updatedTracks);
        
        // Update user reference in posts
        const updatedPosts = userPosts.map(post => ({
          ...post,
          user: updatedUser
        }));
        setUserPosts(updatedPosts);
        
        toast.dismiss(); // Dismiss the loading toast
        toast.success("Profile updated successfully");
      } catch (error) {
        toast.dismiss(); // Dismiss the loading toast
        console.error("Error updating profile:", error);
        toast.error("Failed to update profile");
      }
    }
  };
  
  const handleFollow = () => {
    if (!isConnected || !currentUser) {
      toast.error("Connect wallet to follow users");
      return;
    }
    if (!user) return;

    if (isFollowing) {
      unfollowUser(currentUser.id, user.id);
      setIsFollowing(false);
      toast.success(`You unfollowed ${user.displayName}`);
    } else {
      followUser(currentUser.id, user.id);
      setIsFollowing(true);
      toast.success(`You are now following ${user.displayName}`);
      saveNotification({
        id: `follow-${currentUser.id}-${user.id}-${Date.now()}`,
        type: "follow",
        fromUserId: currentUser.id,
        fromUser: currentUser,
        toUserId: user.id,
        content: `${currentUser.displayName} started following you.`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
    // Refresh user data from storage to reflect updated counts
    const fresh = getUsers().find(u => u.id === user.id);
    if (fresh) setUser(fresh);
  };
  
  const handleWalletConnect = async () => {
    if (!isConnected) {
      await connectWallet();
      toast.success("Wallet connected successfully");
    }
  };
  
  const handleTrackDelete = () => {
    // Refresh user's tracks
    if (user) {
      const tracks = getTracks().filter(track => track.artist.id === user.id);
      setUserTracks(tracks);
    }
  };
  
  const handlePostDelete = () => {
    if (user) {
      const posts = getPosts().filter((p) => p.userId === user.id);
      setUserPosts(posts.map((p) => ({ ...p, user: user! })));
    }
  };
  
  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-pulse-slow">Loading profile...</div>
      </div>
    );
  }
  
  const isCurrentUser = address && address.toLowerCase() === user.walletAddress?.toLowerCase();
  
  return (
    <div>
      <div className="relative">
        {/* Banner */}
        <div className="h-40 bg-music-primary/30 rounded-xl mb-16"></div>
        
        {/* Profile info */}
        <div className="absolute top-24 left-6 right-6 flex flex-col md:flex-row gap-6 items-start md:items-end">
          <AvatarWithVerify
            src={user.avatar}
            fallback={user.displayName}
            isVerified={user.isVerified}
            size="xl"
          />
          
          <div className="mt-4 md:mt-0 flex-1">
            <h1 className="text-2xl font-bold">{user.displayName}</h1>
            <p className="text-muted-foreground">{user.username}</p>
            {user.bio && <p className="mt-2 text-sm">{user.bio}</p>}
            {user.walletAddress && (
              <p className="text-xs text-muted-foreground mt-1">
                Wallet: {user.walletAddress.substring(0, 6)}...{user.walletAddress.substring(user.walletAddress.length - 4)}
              </p>
            )}
          </div>
          
          <div className="flex gap-3 mt-4 md:mt-0">
            {!isConnected ? (
              <Button onClick={handleWalletConnect} className="bg-music-primary hover:bg-music-secondary">
                Connect Wallet
              </Button>
            ) : isCurrentUser ? (
              <Button variant="outline" onClick={() => setEditModalOpen(true)}>Edit Profile</Button>
            ) : (
              <>
                <Button 
                  variant={isFollowing ? "outline" : "default"}
                  className={isFollowing ? "" : "bg-music-primary hover:bg-music-secondary"}
                  onClick={handleFollow}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </Button>
                <TipArtistModal artist={user} />
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-20">
        <div className="flex flex-wrap gap-6 mb-6 justify-center md:justify-start">
          <div className="text-center px-4">
            <span className="text-lg font-bold">{userPosts.length}</span>
            <p className="text-sm text-muted-foreground">Posts</p>
          </div>
          <div className="text-center px-4">
            <span className="text-lg font-bold">{userTracks.length}</span>
            <p className="text-sm text-muted-foreground">Tracks</p>
          </div>
          <div className="text-center px-4">
            <span className="text-lg font-bold">{user.followers}</span>
            <p className="text-sm text-muted-foreground">Followers</p>
          </div>
          <div className="text-center px-4">
            <span className="text-lg font-bold">{user.following}</span>
            <p className="text-sm text-muted-foreground">Following</p>
          </div>
        </div>
        
        <Tabs defaultValue="tracks" className="mt-6">
          <TabsList className="mb-4">
            <TabsTrigger value="tracks">Tracks</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="collected">Collected</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tracks" className="pt-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Tracks</h2>
              {isCurrentUser && (
                <Button 
                  onClick={() => navigate('/create')} 
                  className="bg-gradient-to-r from-brand-500 to-purple-600 text-white font-semibold shadow-lg hover:from-brand-600 hover:to-purple-700 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:outline-none transition-all duration-200"
                >
                  Create New Track
                </Button>
              )}
            </div>
            <div className="space-y-4">
              {userTracks.length > 0 ? (
                userTracks.map((track, index) => (
                  <MusicTrackCard
                    key={track.id}
                    track={track}
                    index={index}
                    onDelete={handleTrackDelete}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No tracks found
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="posts" className="pt-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Posts</h2>
              {isCurrentUser && (
                <Button 
                  onClick={() => navigate('/create?tab=post')} 
                  className="bg-music-primary hover:bg-music-secondary"
                >
                  Create New Post
                </Button>
              )}
            </div>
            {userPosts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {userPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={{ ...post, user: user! }}
                    onDelete={handlePostDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-secondary/20 rounded-xl">
                <p className="text-muted-foreground mb-4">No posts yet</p>
                {isCurrentUser && (
                  <Button 
                    onClick={() => navigate('/create?tab=post')} 
                    className="bg-music-primary hover:bg-music-secondary"
                  >
                    Create Your First Post
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="collected" className="pt-4">
            <div className="text-center py-10 bg-secondary/20 rounded-xl">
              <p className="text-muted-foreground">No collected NFTs yet</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {user && (
        <EditProfileModal
          user={user}
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
}

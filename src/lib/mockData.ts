import { Music } from "lucide-react";
import { User, Post, Track, Notification } from "./types";
import { generateId } from "./utils";

// all the users
export const mockUsers: User[] = [
  {
    id: "1",
    username: "@soiiii",
    displayName: "soiiii",
    avatar: "/images/ncs3.jpg",
    isVerified: true,
    followers: 15200,
    following: 350,
    posts: 42,
    bio: "Music producer and DJ based in LA. Creating vibes since 2010.",
    walletAddress: "0x123"
  },
  {
    id: "2",
    username: "@user1",
    displayName: "user1 ",
    avatar: "/images/ncs2.jpg",
    isVerified: true,
    followers: 986,
    following: 124,
    posts: 28,
    walletAddress: "0x456"
  },
  {
    id: "3",
    username: "@metaverse",
    displayName: "Meta Verse",
    avatar: "/images/ncs1.jpg",
    isVerified: false,
    followers: 245,
    following: 512,
    posts: 15,
    walletAddress: "0x789"
  },
  {
    id: "4",
    username: "@musicwave",
    displayName: "music Wave",
    avatar: "/images/ncs1.jpg",
    isVerified: true,
    followers: 2340,
    following: 120,
    posts: 76,
    walletAddress: "0xabc"
  },
  {
    id: "5",
    username: "@s",
    displayName: "yash",
    avatar: "/images/ncs2.jpg",
    isVerified: false,
    followers: 76000,
    following: 240,
    posts: 34,
    walletAddress: "0xdef"
  },
  {
    id: "6",
    username: "@necromancer",
    displayName: "necromancer",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyqUZxJpKXJKa3PV6JkWk8RbXn9om6j1AmlQ&s",
    isVerified: true,
    followers: 1810,
    following: 98,
    posts: 53,
    bio: "Exploring the intersection of sound and tech. NFTs + beats.",
    walletAddress: "0xbeef"
  },
  {
    id: "7",
    username: "@neoncol",
    displayName: "Neon col",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyqUZxJpKXJKa3PV6JkWk8RbXn9om6j1AmlQ&s",
    isVerified: false,
    followers: 432,
    following: 301,
    posts: 21,
    bio: "Underground synthwave artist. New EP out now!",
    walletAddress: "0xcafe"
  },
  {
    id: "8",
    username: "@ghostrider",
    displayName: "ghost Rider",
    avatar: "/images/ncs1.jpg",
    isVerified: true,
    followers: 1205,
    following: 188,
    posts: 39,
    bio: "Live loop artist. Everything I play is made on the spot.",
    walletAddress: "0xdeed"
  },
  {
    id: "9",
    username: "@echoverse",
    displayName: "Echo Verse",
    avatar: "/images/ncs1.jpg",
    isVerified: false,
    followers: 682,
    following: 310,
    posts: 24,
    bio: "Floating through genres and galaxies. Music is my spaceship.",
    walletAddress: "0xdead"
  },
  {
    id: "10",
    username: "@vanya",
    displayName: "vanya ",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyqUZxJpKXJKa3PV6JkWk8RbXn9om6j1AmlQ&s",
    isVerified: true,
    followers: 3100,
    following: 54,
    posts: 88,
    bio: "Study beats and chill vibes. Streaming 24/7.",
    walletAddress: "0xface"
  },
  {
    id: "11",
    username: "@kingg",
    displayName: "kinggg",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyqUZxJpKXJKa3PV6JkWk8RbXn9om6j1AmlQ&s",
    isVerified: true,
    followers: 2750,
    following: 200,
    posts: 61,
    bio: "Beat drops heavier than your WiFi signal.",
    walletAddress: "0xfade"
  },
  {
    id: "12",
    username: "@ambipotent",
    displayName: "Ambi potemt",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyqUZxJpKXJKa3PV6JkWk8RbXn9om6j1AmlQ&s",
    isVerified: false,
    followers: 198,
    following: 432,
    posts: 12,
    bio: "Ambience for your soul. Minimal sounds, maximal vibes.",
    walletAddress: "0xfeed"
  }
];



// Sample music tracks
const sampleTracks = [
  {
    title: "Brain Implant",
    coverArt: "/images/ncs1.jpg",
    audioUrl: "/src/music/brain-implant-cyberpunk-sci-fi-trailer-action-intro-330416.mp3",
    likes: 345,
    comments: 42,
    plays: 12568,
    duration: 144
  },
  {
    title: "Cyberpunk Dreams",
    coverArt: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVVsk7YAXX4qXyWuQHMcyujEYp_Ainduco9P3frk_QbJk4ShSuok2-YGjZfhteSiEJeyw&usqp=CAU",
    audioUrl: "/src/music/electronic-future-beats-117997.mp3",
    likes: 512,
    comments: 63,
    plays: 18924,
    duration: 151
  },
  {
    title: "Neural Network",
    coverArt: "/images/ncs1.jpg",
    audioUrl: "/src/music/track1.mp3",
    likes: 287,
    comments: 32,
    plays: 8954,
    duration: 176
  },
  {
    title: "Digital Mind",
    coverArt: "/images/ncs2.jpg",
    audioUrl: "/src/music/track2.mp3",
    likes: 723,
    comments: 85,
    plays: 25631,
    duration: 176
  },
  {
    title: "Future Beats",
    coverArt: "/images/ncs3.jpg",
    audioUrl: "/src/music/track3.mp3",
    likes: 431,
    comments: 57,
    plays: 14892,
    duration: 176
  },
  {
    title: "soiiiiplay",
    coverArt: "/images/ncs2.jpg",
    audioUrl: "/src/music/track4.mp3",
    likes: 4312,
    comments: 157,
    plays: 148922,
    duration: 176
  }
];

// Generate mock tracks with users
export const mockTracks: Track[] = [];

// Distribute tracks among users
sampleTracks.forEach((track, index) => {
  const userId = ((index % mockUsers.length) + 1).toString();
  const user = mockUsers.find(u => u.id === userId);
  
  if (user) {
    mockTracks.push({
      id: generateId(),
      title: track.title,
      artist: user,
      coverArt: track.coverArt,
      audioUrl: track.audioUrl,
      likes: track.likes,
      comments: track.comments,
      plays: track.plays,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      duration: track.duration
    });
  }
});

// More sample tracks for specific users
mockUsers.forEach(user => {
  // Add 2-3 more tracks per user
  const numTracks = Math.floor(Math.random() * 2) + 2;
  
  for (let i = 0; i < numTracks; i++) {
    const randomTrack = sampleTracks[Math.floor(Math.random() * sampleTracks.length)];
    mockTracks.push({
      id: generateId(),
      title: `${randomTrack.title} ${i+1}`,
      artist: user,
      coverArt: `/images/ncs${i}.jpg`,
      audioUrl: randomTrack.audioUrl,
      likes: Math.floor(Math.random() * 1000),
      comments: Math.floor(Math.random() * 100),
      plays: Math.floor(Math.random() * 50000),
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      duration: randomTrack.duration
    });
  }
});

// Mock posts
export const mockPosts: Post[] = [
  {
    id: "p1",
    userId: "1",
    content: "Just released a new track! Check it out on my profile and let me know what you think.",
    image: "/images/ncs1.jpg",
    createdAt: "2023-05-15T12:30:00Z",
    likes: 24,
    comments: 5
  },
  {
    id: "p2",
    userId: "2",
    content: "Working on some new blockchain music integration. The future of music is here!",
    createdAt: "2023-05-14T09:15:00Z",
    likes: 42,
    comments: 7
  },
  {
    id: "p3",
    userId: "3",
    content: "Just minted my first music NFT! So excited to share my art on the blockchain.",
    image: "/images/ncs1.jpg",
    createdAt: "2023-05-13T15:45:00Z",
    likes: 18,
    comments: 3
  },
  {
    id: "p4",
    userId: "4",
    content: "Live streaming my remix session tonight at 8 PM EST. Don't miss it!",
    createdAt: "2023-05-12T11:20:00Z",
    likes: 31,
    comments: 9
  },
  {
    id: "p5",
    userId: "5",
    content: "Just collected this amazing track as an NFT. Supporting artists directly feels amazing.",
    image: "https://source.unsplash.com/random/600x400/?music,vinyl",
    createdAt: "2023-05-11T17:10:00Z",
    likes: 56,
    comments: 12
  },
  {
    id: "p6",
    userId: "1",
    content: "Collaboration coming soon with @musicman! Can't wait for you all to hear what we've been working on.",
    createdAt: "2023-05-10T08:25:00Z",
    likes: 47,
    comments: 8
  },
  {
    id: "p7",
    userId: "2",
    content: "My thoughts on the future of music in the web3 space. Thread 👇",
    createdAt: "2023-05-09T13:40:00Z",
    likes: 63,
    comments: 15
  }
];

// Mock notifications
export const mockNotifications: Notification[] = [
  {
    id: "n1",
    type: "like",
    fromUserId: "2",
    toUserId: "1",
    postId: "p1",
    content: "liked your post",
    isRead: false,
    createdAt: "2023-05-15T14:30:00Z"
  },
  {
    id: "n2",
    type: "comment",
    fromUserId: "3",
    toUserId: "1",
    postId: "p1",
    content: "commented on your post",
    isRead: false,
    createdAt: "2023-05-15T13:45:00Z"
  },
  {
    id: "n3",
    type: "follow",
    fromUserId: "4",
    toUserId: "1",
    content: "started following you",
    isRead: true,
    createdAt: "2023-05-14T09:20:00Z"
  },
  {
    id: "n4",
    type: "mention",
    fromUserId: "2",
    toUserId: "1",
    postId: "p7",
    content: "mentioned you in a post",
    isRead: true,
    createdAt: "2023-05-13T16:10:00Z"
  },
  {
    id: "n5",
    type: "system",
    toUserId: "1",
    content: "Your track has been successfully minted as an NFT",
    isRead: false,
    createdAt: "2023-05-12T11:30:00Z"
  }
];

// Helper function to get user notifications
export const getUserNotifications = (userId: string) => {
  return mockNotifications
    .filter(notification => notification.toUserId === userId)
    .map(notification => {
      if (notification.fromUserId) {
        notification.fromUser = mockUsers.find(user => user.id === notification.fromUserId);
      }
      return notification;
    });
};

// Add the missing getUserByWalletAddress function
export const getUserByWalletAddress = (address: string): User | null => {
  const user = mockUsers.find(u => u.walletAddress?.toLowerCase() === address.toLowerCase());
  return user || null;
};

// Helper functions to modify mock data (for real-time updates)
export const addPost = (post: Omit<Post, "id" | "createdAt" | "likes" | "comments">): Post => {
  const newPost: Post = {
    id: `p${mockPosts.length + 1}`,
    ...post,
    createdAt: new Date().toISOString(),
    likes: 0,
    comments: 0
  };
  
  mockPosts.unshift(newPost);
  
  // Update user post count
  const userIndex = mockUsers.findIndex(u => u.id === post.userId);
  if (userIndex !== -1) {
    mockUsers[userIndex].posts += 1;
  }
  
  return newPost;
};

export const addTrack = (track: Omit<Track, "id" | "createdAt" | "likes" | "comments" | "plays">): Track => {
  const newTrack: Track = {
    id: generateId(),
    ...track,
    createdAt: new Date().toISOString(),
    likes: 0,
    comments: 0,
    plays: 0
  };
  
  mockTracks.unshift(newTrack);
  return newTrack;
};

export const likePost = (postId: string, userId: string): Post | null => {
  const postIndex = mockPosts.findIndex(p => p.id === postId);
  if (postIndex !== -1) {
    mockPosts[postIndex].likes += 1;
    
    // Add notification
    if (mockPosts[postIndex].userId !== userId) {
      const newNotification: Notification = {
        id: generateId(),
        type: 'like',
        fromUserId: userId,
        toUserId: mockPosts[postIndex].userId,
        postId,
        content: "liked your post",
        isRead: false,
        createdAt: new Date().toISOString()
      };
      mockNotifications.unshift(newNotification);
    }
    
    return mockPosts[postIndex];
  }
  return null;
};

export const getPopulatedPosts = () => {
  return mockPosts.map(post => {
    const user = mockUsers.find(u => u.id === post.userId);
    return { ...post, user };
  });
};

export const getPopularTracks = () => {
  return [...mockTracks].sort((a, b) => b.plays - a.plays);
};

export const getSuggestedUsers = (excludeUserId?: string) => {
  let users = [...mockUsers];
  if (excludeUserId) {
    users = users.filter(u => u.id !== excludeUserId);
  }
  return users.sort(() => Math.random() - 0.5);
};

export const searchContent = (query: string) => {
  if (!query) return { users: [], tracks: [], posts: [] };
  
  const lowerQuery = query.toLowerCase();
  
  const users = mockUsers.filter(user => 
    user.displayName.toLowerCase().includes(lowerQuery) || 
    user.username.toLowerCase().includes(lowerQuery)
  );
  
  const tracks = mockTracks.filter(track => 
    track.title.toLowerCase().includes(lowerQuery) || 
    track.artist.displayName.toLowerCase().includes(lowerQuery)
  );
  
  const posts = getPopulatedPosts().filter(post => 
    post.content.toLowerCase().includes(lowerQuery)
  );
  
  return { users, tracks, posts };
};

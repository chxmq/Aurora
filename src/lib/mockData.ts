import { Music } from "lucide-react";
import { User, Post, Track, Notification } from "./types";
import { generateId } from "./utils";
import { getUsers, getTracks, getPosts, saveUsers, saveTracks, savePosts, initializeLocalStorage } from './localStorage';
import { saveUserToIPFS, saveTrackToIPFS, savePostToIPFS } from './ipfsStorage';
import { saveIPFSMapping } from './localStorage';
import { FEATURES } from './config';
import { deleteFile } from './fileStorage';
import { uploadImageToIPFS, uploadAudioToIPFS } from './ipfsStorage';
import { broadcastUpdate } from './realtimeSync';
import { PostInput, TrackInput } from './types';
import { mergeSort, recommendContent, calculateUserEngagementScore as calculateUserScore, generateOptimalPlaylist } from './algorithms';
import {
  savePostToPinata,
  saveTrackToPinata,
  saveUserToPinata,
  uploadImageToPinata,
  uploadAudioToPinata,
  unpinFromPinata,
  updateGlobalIndex,
  getGlobalIndex,
  getContentFromPinata
} from './pinataStorage';

// Initialize with mock data if local storage is empty
const initMockUsers: User[] = [
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
    walletAddress: "0xeCd5dFD2cF4F4A76dDCacCc9d3580a2363CBB30f"
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
  },
  // Adding more diverse artists
  {
    id: "13",
    username: "@synthmaster",
    displayName: "Synth Master",
    avatar: "https://images.unsplash.com/photo-1520209759809-a9bcb6cb3241",
    isVerified: true,
    followers: 5600,
    following: 245,
    posts: 67,
    bio: "Synthesizer wizard creating electronic soundscapes",
    walletAddress: "0xaaaa"
  },
  {
    id: "14",
    username: "@beatsmith",
    displayName: "Beat Smith",
    avatar: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
    isVerified: true,
    followers: 8900,
    following: 320,
    posts: 92,
    bio: "Crafting beats that move your soul",
    walletAddress: "0xbbbb"
  },
  {
    id: "15",
    username: "@cosmicjazz",
    displayName: "Cosmic Jazz",
    avatar: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c",
    isVerified: false,
    followers: 3400,
    following: 180,
    posts: 45,
    bio: "Where jazz meets the cosmos",
    walletAddress: "0xcccc"
  },
  {
    id: "16",
    username: "@bassmaster",
    displayName: "Bass Master",
    avatar: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819",
    isVerified: true,
    followers: 12500,
    following: 420,
    posts: 156,
    bio: "All about that bass, no treble",
    walletAddress: "0xdddd"
  },
  {
    id: "17",
    username: "@groovemaker",
    displayName: "Groove Maker",
    avatar: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
    isVerified: true,
    followers: 9200,
    following: 280,
    posts: 88,
    bio: "Creating grooves that move you",
    walletAddress: "0xeeee"
  },
  {
    id: "18",
    username: "@melodicflow",
    displayName: "Melodic Flow",
    avatar: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c",
    isVerified: false,
    followers: 4100,
    following: 210,
    posts: 52,
    bio: "Melodies that touch your heart",
    walletAddress: "0xffff"
  }
];

// Sample tracks data
const initMockTracks: Track[] = [
  {
    id: generateId(),
    title: "Brain Implant",
    artist: initMockUsers[0],
    coverArt: "/images/ncs1.jpg",
    audioUrl: "/music/brain-implant-cyberpunk-sci-fi-trailer-action-intro-330416.mp3",
    likes: 1200,
    comments: 45,
    plays: 15000,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 180
  },
  {
    id: generateId(),
    title: "Electronic Future",
    artist: initMockUsers[1],
    coverArt: "/images/ncs2.jpg",
    audioUrl: "/music/electronic-future-beats-117997.mp3",
    likes: 890,
    comments: 32,
    plays: 12000,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 240
  },
  {
    id: generateId(),
    title: "Cyberpunk Dreams",
    artist: initMockUsers[5], // necromancer
    coverArt: "https://images.unsplash.com/photo-1614149162883-504ce4d13909",
    audioUrl: "/music/electronic-future-beats-117997.mp3",
    likes: 3512,
    comments: 163,
    plays: 78924,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 195
  },
  {
    id: generateId(),
    title: "Neural Network",
    artist: initMockUsers[9], // vanya
    coverArt: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04",
    audioUrl: "/music/brain-implant-cyberpunk-sci-fi-trailer-action-intro-330416.mp3",
    likes: 2287,
    comments: 132,
    plays: 58954,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 176
  },
  {
    id: generateId(),
    title: "Digital Mind",
    artist: initMockUsers[4], // yash
    coverArt: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c",
    audioUrl: "/music/electronic-future-beats-117997.mp3",
    likes: 4723,
    comments: 285,
    plays: 95631,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 176
  },
  {
    id: generateId(),
    title: "Future Beats",
    artist: initMockUsers[10], // kingg
    coverArt: "https://images.unsplash.com/photo-1520209759809-a9bcb6cb3241",
    audioUrl: "/music/brain-implant-cyberpunk-sci-fi-trailer-action-intro-330416.mp3",
    likes: 3431,
    comments: 157,
    plays: 74892,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 176
  },
  {
    id: generateId(),
    title: "soiiiiplay",
    artist: initMockUsers[0], // soiiii
    coverArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
    audioUrl: "/music/electronic-future-beats-117997.mp3",
    likes: 6312,
    comments: 357,
    plays: 148922,
    createdAt: new Date(Date.now()).toISOString(),
    duration: 176
  },
  {
    id: generateId(),
    title: "Neon Dreams",
    artist: initMockUsers[4], // yash
    coverArt: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819",
    audioUrl: "/music/electronic-future-beats-117997.mp3",
    likes: 5500,
    comments: 280,
    plays: 125000,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 195
  },
  {
    id: generateId(),
    title: "Digital Horizon",
    artist: initMockUsers[10], // vanya
    coverArt: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04",
    audioUrl: "/music/brain-implant-cyberpunk-sci-fi-trailer-action-intro-330416.mp3",
    likes: 4800,
    comments: 195,
    plays: 98000,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 210
  },
  {
    id: generateId(),
    title: "Synthwave Paradise",
    artist: initMockUsers[6], // neoncol
    coverArt: "https://images.unsplash.com/photo-1614149162883-504ce4d13909",
    audioUrl: "/music/electronic-future-beats-117997.mp3",
    likes: 3450,
    comments: 168,
    plays: 68000,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 225
  },
  {
    id: generateId(),
    title: "Cyber Beats",
    artist: initMockUsers[3], // musicwave
    coverArt: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c",
    audioUrl: "/music/brain-implant-cyberpunk-sci-fi-trailer-action-intro-330416.mp3",
    likes: 3980,
    comments: 165,
    plays: 89000,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 195
  },
  {
    id: generateId(),
    title: "Ghost Protocol",
    artist: initMockUsers[7], // ghostrider
    coverArt: "https://images.unsplash.com/photo-1520209759809-a9bcb6cb3241",
    audioUrl: "/music/electronic-future-beats-117997.mp3",
    likes: 4750,
    comments: 242,
    plays: 94500,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 240
  },
  {
    id: generateId(),
    title: "Echo Chamber",
    artist: initMockUsers[8], // echoverse
    coverArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
    audioUrl: "/music/brain-implant-cyberpunk-sci-fi-trailer-action-intro-330416.mp3",
    likes: 3520,
    comments: 175,
    plays: 79800,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 180
  },
  {
    id: generateId(),
    title: "Ambient Flow",
    artist: initMockUsers[11], // ambipotent
    coverArt: "https://images.unsplash.com/photo-1614149162883-504ce4d13909",
    audioUrl: "/music/electronic-future-beats-117997.mp3",
    likes: 2920,
    comments: 145,
    plays: 56500,
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 300
  },
  {
    id: generateId(),
    title: "Meta Verse",
    artist: initMockUsers[2], // metaverse
    coverArt: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04",
    audioUrl: "/music/brain-implant-cyberpunk-sci-fi-trailer-action-intro-330416.mp3",
    likes: 3420,
    comments: 130,
    plays: 67800,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 210
  },
  {
    id: generateId(),
    title: "Synthwave Dreams",
    artist: initMockUsers[12], // synthmaster
    coverArt: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c",
    audioUrl: "/music/electronic-future-beats-117997.mp3",
    likes: 5500,
    comments: 330,
    plays: 115000,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 245
  },
  {
    id: generateId(),
    title: "Bass Odyssey",
    artist: initMockUsers[15], // bassmaster
    coverArt: "https://images.unsplash.com/photo-1520209759809-a9bcb6cb3241",
    audioUrl: "/music/brain-implant-cyberpunk-sci-fi-trailer-action-intro-330416.mp3",
    likes: 4800,
    comments: 285,
    plays: 102000,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 218
  },
  {
    id: generateId(),
    title: "Cosmic Rhythms",
    artist: initMockUsers[14], // cosmicjazz
    coverArt: "https://images.unsplash.com/photo-1614149162883-504ce4d13909",
    audioUrl: "/music/electronic-future-beats-117997.mp3",
    likes: 3900,
    comments: 245,
    plays: 87000,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 265
  },
  {
    id: generateId(),
    title: "Groove Theory",
    artist: initMockUsers[16], // groovemaker
    coverArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
    audioUrl: "/music/brain-implant-cyberpunk-sci-fi-trailer-action-intro-330416.mp3",
    likes: 4200,
    comments: 268,
    plays: 91000,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 232
  },
  {
    id: generateId(),
    title: "Melodic Journey",
    artist: initMockUsers[17], // melodicflow
    coverArt: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c",
    audioUrl: "/music/electronic-future-beats-117997.mp3",
    likes: 3600,
    comments: 232,
    plays: 78000,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 255
  }
];

const initMockPosts: Post[] = [
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

// Initialize local storage with mock data
initializeLocalStorage(initMockUsers, initMockTracks, initMockPosts);

// Export getters that use local storage
export const mockUsers = getUsers();
export const mockTracks = getTracks();
export const mockPosts = getPosts();

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
  const users = getUsers();
  const user = users.find(u => u.walletAddress?.toLowerCase() === address.toLowerCase());
  return user || null;
};

// Helper functions to modify mock data (for real-time updates)
export const addPost = async (postInput: PostInput): Promise<Post> => {
  const newPost: Post = {
    id: `p${Date.now()}`, // Use timestamp to ensure unique IDs
    userId: postInput.userId,
    content: postInput.content,
    image: postInput.image as string, // Will be updated if it's a File
    createdAt: new Date().toISOString(),
    likes: 0,
    comments: 0
  };
  
  try {
    // Try to save to Pinata if enabled
    if (FEATURES.ENABLE_PINATA) {
      try {
        // If post has an image file, upload it to Pinata first
        if (postInput.image && postInput.image instanceof File) {
          const imageHash = await uploadImageToPinata(postInput.image);
          newPost.image = `ipfs://${imageHash}`;
        }
        
        // Save post to Pinata
        const hash = await savePostToPinata(newPost);
        
        // Save Pinata mapping
        saveIPFSMapping({
          id: newPost.id,
          cid: hash,
          type: 'post',
          timestamp: Date.now()
        });
        // Update global posts index
        await updateGlobalIndex('post', hash);
      } catch (pinataError) {
        console.warn('Failed to save to Pinata, continuing with local storage:', pinataError);
      }
    }
    // Fallback to IPFS if enabled
    else if (FEATURES.ENABLE_IPFS) {
      try {
        // If post has an image file, upload it to IPFS first
        if (postInput.image && postInput.image instanceof File) {
          const imageCid = await uploadImageToIPFS(postInput.image);
          newPost.image = `ipfs://${imageCid}`;
        }
        
        // Save post to IPFS
        const cid = await savePostToIPFS(newPost);
        
        // Save IPFS mapping
        saveIPFSMapping({
          id: newPost.id,
          cid,
          type: 'post',
          timestamp: Date.now()
        });

        // Broadcast the update to other clients
        await broadcastUpdate('post', newPost.id, cid);
      } catch (ipfsError) {
        console.warn('Failed to save to IPFS, continuing with local storage:', ipfsError);
      }
    }
    
    // Update local storage
    const posts = getPosts();
    posts.unshift(newPost);
    savePosts(posts);
    
    // Update user post count
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === postInput.userId);
    if (userIndex !== -1) {
      users[userIndex].posts += 1;
      saveUsers(users);
      
      // Try to save updated user to Pinata if enabled
      if (FEATURES.ENABLE_PINATA) {
        try {
          const hash = await saveUserToPinata(users[userIndex]);
          saveIPFSMapping({
            id: users[userIndex].id,
            cid: hash,
            type: 'user',
            timestamp: Date.now()
          });
        } catch (pinataError) {
          console.warn('Failed to save user to Pinata, continuing with local storage:', pinataError);
        }
      }
      // Fallback to IPFS if enabled
      else if (FEATURES.ENABLE_IPFS) {
        try {
          const cid = await saveUserToIPFS(users[userIndex]);
          saveIPFSMapping({
            id: users[userIndex].id,
            cid,
            type: 'user',
            timestamp: Date.now()
          });
          
          // Broadcast the user update
          await broadcastUpdate('user', users[userIndex].id, cid);
        } catch (ipfsError) {
          console.warn('Failed to save user to IPFS, continuing with local storage:', ipfsError);
        }
      }
    }
    
    return newPost;
  } catch (error) {
    console.error('Error adding post:', error);
    throw error;
  }
};

export const addTrack = async (trackInput: TrackInput): Promise<Track> => {
  const track: Track = {
    id: generateId(),
    title: trackInput.title,
    artist: trackInput.artist,
    coverArt: trackInput.coverArt as string, // Will be updated if it's a File
    audioUrl: trackInput.audioUrl as string, // Will be updated if it's a File
    likes: trackInput.likes,
    comments: trackInput.comments,
    plays: trackInput.plays,
    createdAt: trackInput.createdAt,
    duration: trackInput.duration
  };

  try {
    // Try to save to Pinata if enabled
    if (FEATURES.ENABLE_PINATA) {
      try {
        // If track has audio or cover art files, upload them to Pinata first
        if (trackInput.audioUrl instanceof File) {
          const audioHash = await uploadAudioToPinata(trackInput.audioUrl);
          track.audioUrl = `ipfs://${audioHash}`;
        }
        
        if (trackInput.coverArt instanceof File) {
          const coverArtHash = await uploadImageToPinata(trackInput.coverArt);
          track.coverArt = `ipfs://${coverArtHash}`;
        }
        
        // Save track to Pinata
        const hash = await saveTrackToPinata(track);
        
        // Save Pinata mapping
        saveIPFSMapping({
          id: track.id,
          cid: hash,
          type: 'track',
          timestamp: Date.now()
        });
      } catch (pinataError) {
        console.warn('Failed to save to Pinata, continuing with local storage:', pinataError);
      }
    }
    // Fallback to IPFS if enabled
    else if (FEATURES.ENABLE_IPFS) {
      try {
        // If track has audio or cover art files, upload them to IPFS first
        if (trackInput.audioUrl instanceof File) {
          const audioCid = await uploadAudioToIPFS(trackInput.audioUrl);
          track.audioUrl = `ipfs://${audioCid}`;
        }
        
        if (trackInput.coverArt instanceof File) {
          const coverArtCid = await uploadImageToIPFS(trackInput.coverArt);
          track.coverArt = `ipfs://${coverArtCid}`;
        }
        
        // Save track to IPFS
        const cid = await saveTrackToIPFS(track);
        
        // Save IPFS mapping
        saveIPFSMapping({
          id: track.id,
          cid,
          type: 'track',
          timestamp: Date.now()
        });

        // Broadcast the update to other clients
        await broadcastUpdate('track', track.id, cid);
      } catch (ipfsError) {
        console.warn('Failed to save to IPFS, continuing with local storage:', ipfsError);
      }
    }
    
    // Update local storage
    const tracks = getTracks();
    tracks.unshift(track);
    saveTracks(tracks);
    
    return track;
  } catch (error) {
    console.error('Error adding track:', error);
    throw error;
  }
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<User> => {
  try {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) throw new Error('User not found');
    
    const updatedUser = { ...users[userIndex], ...updates };
    users[userIndex] = updatedUser;
    
    // Save to IPFS first
    const cid = await saveUserToIPFS(updatedUser);
    
    // Save IPFS mapping
    saveIPFSMapping({
      id: updatedUser.id,
      cid,
      type: 'user',
      timestamp: Date.now()
    });
    
    // Update local storage
    saveUsers(users);
    
    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Advanced algorithms for content ranking and recommendations

// Time decay factor using exponential decay
const calculateTimeDecay = (date: string, halfLifeDays: number = 7) => {
  const now = new Date().getTime();
  const postDate = new Date(date).getTime();
  const age = (now - postDate) / (1000 * 60 * 60 * 24); // age in days
  return Math.pow(2, -age / halfLifeDays);
};

// Normalized value between 0 and 1 using sigmoid function
const normalize = (value: number, midPoint: number): number => {
  return 1 / (1 + Math.exp(-(value - midPoint) / midPoint));
};

// Helper function to calculate user engagement score with sophisticated weighting
const calculateUserEngagementScore = (user: User): number => {
  // Normalize metrics
  const normalizedFollowers = normalize(user.followers, 10000);
  const normalizedPosts = normalize(user.posts, 50);
  const normalizedFollowing = normalize(user.following, 200);
  
  // Weighted components
  const weights = {
    followers: 0.5,    // High impact
    posts: 0.3,        // Medium impact
    following: 0.1,    // Low impact
    verified: 0.1      // Bonus for verified users
  };
  
  // Calculate base score
  let score = 
    normalizedFollowers * weights.followers +
    normalizedPosts * weights.posts +
    normalizedFollowing * weights.following;
  
  // Add verification bonus
  if (user.isVerified) {
    score += weights.verified;
  }
  
  return score;
};

// Helper function to calculate track engagement score with time decay
const calculateTrackEngagementScore = (track: Track): number => {
  // Normalize metrics
  const normalizedPlays = normalize(track.plays, 50000);
  const normalizedLikes = normalize(track.likes, 5000);
  const normalizedComments = normalize(track.comments, 200);
  
  // Time decay factor (half-life of 30 days)
  const timeDecay = calculateTimeDecay(track.createdAt, 30);
  
  // Weighted components
  const weights = {
    plays: 0.3,
    likes: 0.3,
    comments: 0.2,
    timeDecay: 0.2
  };
  
  // Calculate final score with time decay
  return (
    normalizedPlays * weights.plays +
    normalizedLikes * weights.likes +
    normalizedComments * weights.comments
  ) * (1 + timeDecay * weights.timeDecay);
};

// Helper function to calculate post engagement score with recency bonus
const calculatePostEngagementScore = (post: Post): number => {
  // Normalize metrics
  const normalizedLikes = normalize(post.likes, 1000);
  const normalizedComments = normalize(post.comments, 100);
  
  // Time decay factor (half-life of 7 days for posts)
  const timeDecay = calculateTimeDecay(post.createdAt, 7);
  
  // Weighted components
  const weights = {
    likes: 0.4,
    comments: 0.4,
    timeDecay: 0.2
  };
  
  // Calculate final score with time decay
  return (
    normalizedLikes * weights.likes +
    normalizedComments * weights.comments
  ) * (1 + timeDecay * weights.timeDecay);
};

// Get suggested users using sophisticated ranking and diversity algorithm
export const getSuggestedUsers = (excludeUserId?: string, limit: number = 5) => {
  let users = getUsers();
  
  // Calculate engagement scores for all users
  const usersWithScores = users
    .filter(u => u.id !== excludeUserId)
    .map(user => ({
      ...user,
      engagementScore: calculateUserScore(user, getPosts().filter(p => p.userId === user.id))
    }));
  
  // Use merge sort with custom comparison function
  const sortedUsers = mergeSort(usersWithScores, (a, b) => b.engagementScore - a.engagementScore);
  
  // Apply diversity balancing
  const diverseUsers: User[] = [];
  const categories = {
    verifiedHigh: { count: 0, max: Math.ceil(limit * 0.4) },
    verifiedLow: { count: 0, max: Math.ceil(limit * 0.2) },
    unverifiedHigh: { count: 0, max: Math.ceil(limit * 0.2) },
    unverifiedLow: { count: 0, max: Math.ceil(limit * 0.2) }
  };
  
  for (const user of sortedUsers) {
    const isHighFollowers = user.followers > 10000;
    let category = user.isVerified
      ? (isHighFollowers ? 'verifiedHigh' : 'verifiedLow')
      : (isHighFollowers ? 'unverifiedHigh' : 'unverifiedLow');
    
    if (categories[category].count < categories[category].max) {
      diverseUsers.push(user);
      categories[category].count++;
    }
    
    if (diverseUsers.length >= limit) break;
  }
  
  return diverseUsers;
};

// Get popular tracks using engagement scoring and diversity
export const getPopularTracks = (limit: number = 10) => {
  const tracks = getTracks();
  if (!tracks || tracks.length === 0) {
    console.warn('No tracks found in local storage, initializing with mock data');
    saveTracks(initMockTracks);
    return sortTracksByEngagement(initMockTracks, limit);
  }
  return sortTracksByEngagement(tracks, limit);
};

// Helper function to sort tracks by engagement with artist diversity
const sortTracksByEngagement = (tracks: Track[], limit: number) => {
  // Use merge sort for efficient sorting
  const sortedTracks = mergeSort(tracks, (a, b) => {
    const scoreA = calculateTrackEngagementScore(a);
    const scoreB = calculateTrackEngagementScore(b);
    return scoreB - scoreA;
  });
  
  // Apply artist diversity
  const maxTracksPerArtist = Math.max(1, Math.floor(limit * 0.3));
  const diverseTracks = [];
  const artistTrackCount: Record<string, number> = {};
  
  for (const track of sortedTracks) {
    const artistId = track.artist.id;
    artistTrackCount[artistId] = (artistTrackCount[artistId] || 0) + 1;
    
    if (artistTrackCount[artistId] <= maxTracksPerArtist) {
      diverseTracks.push(track);
    }
    
    if (diverseTracks.length >= limit) break;
  }
  
  return diverseTracks;
};

// Get populated posts sorted by engagement with content type diversity
export const getPopulatedPosts = (limit: number = 20) => {
  const posts = getPosts();
  const users = getUsers();
  
  // Calculate scores and add user data
  const postsWithScores = posts
    .map(post => ({
      ...post,
      user: users.find(u => u.id === post.userId),
      engagementScore: calculatePostEngagementScore(post)
    }))
    .filter(post => post.user) // Ensure user exists
    .sort((a, b) => b.engagementScore - a.engagementScore);
  
  // Apply content type diversity (text, image, etc.)
  const diversePosts = [];
  const contentTypes = {
    withImage: { count: 0, max: Math.ceil(limit * 0.6) },    // 60% posts with images
    textOnly: { count: 0, max: Math.ceil(limit * 0.4) }      // 40% text-only posts
  };
  
  for (const post of postsWithScores) {
    const category = post.image ? 'withImage' : 'textOnly';
    
    if (contentTypes[category].count < contentTypes[category].max) {
      diversePosts.push(post);
      contentTypes[category].count++;
    }
    
    if (diversePosts.length >= limit) break;
  }
  
  // Fill remaining slots if needed
  while (diversePosts.length < limit && postsWithScores.length > diversePosts.length) {
    const nextPost = postsWithScores.find(p => !diversePosts.includes(p));
    if (nextPost) diversePosts.push(nextPost);
  }
  
  return diversePosts;
};

// Initialize local storage with mock data if empty
export const initializeIfEmpty = () => {
  const existingUsers = getUsers();
  const existingTracks = getTracks();
  const existingPosts = getPosts();

  if (!existingUsers || existingUsers.length === 0 || 
      !existingTracks || existingTracks.length === 0 || 
      !existingPosts || existingPosts.length === 0) {
    console.log('Initializing local storage with mock data');
    initializeLocalStorage(initMockUsers, initMockTracks, initMockPosts);
  }
};

// Call initialization when the module loads
initializeIfEmpty();

export const deletePost = async (postId: string): Promise<boolean> => {
  try {
    // Get current posts
    const posts = getPosts();
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex === -1) {
      return false;
    }
    
    // Get the post to be deleted
    const post = posts[postIndex];
    
    // Delete any associated files
    if (post.image && post.image.startsWith('file://')) {
      const fileId = post.image.replace('file://', '');
      deleteFile(fileId);
    }
    
    // Remove the post
    posts.splice(postIndex, 1);
    savePosts(posts);
    
    // Update user post count
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === post.userId);
    if (userIndex !== -1) {
      users[userIndex].posts = Math.max(0, (users[userIndex].posts || 0) - 1);
      saveUsers(users);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    return false;
  }
};

export const deleteTrack = async (trackId: string): Promise<boolean> => {
  try {
    const tracks = getTracks();
    const trackIndex = tracks.findIndex(track => track.id === trackId);
    
    if (trackIndex === -1) {
      return false;
    }

    const track = tracks[trackIndex];

    // Remove track from storage
    tracks.splice(trackIndex, 1);
    saveTracks(tracks);

    // If the track has a file:// URL, delete the file from storage
    if (track.audioUrl.startsWith('file://')) {
      const audioFileId = track.audioUrl.replace('file://', '');
      await deleteFile(audioFileId);
    }
    if (track.coverArt.startsWith('file://')) {
      const coverArtFileId = track.coverArt.replace('file://', '');
      await deleteFile(coverArtFileId);
    }

    // Update user's track count
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === track.artist.id);
    if (userIndex !== -1) {
      saveUsers(users);
    }

    return true;
  } catch (error) {
    console.error('Error deleting track:', error);
    return false;
  }
};

export const searchContent = (query: string) => {
  if (!query) return { users: [], tracks: [], posts: [] };
  
  const lowerQuery = query.toLowerCase();
  
  const users = getUsers().filter(user => 
    user.displayName.toLowerCase().includes(lowerQuery) || 
    user.username.toLowerCase().includes(lowerQuery)
  );
  
  const tracks = getTracks().filter(track => 
    track.title.toLowerCase().includes(lowerQuery) || 
    track.artist.displayName.toLowerCase().includes(lowerQuery)
  );
  
  const posts = getPosts().filter(post => 
    post.content.toLowerCase().includes(lowerQuery)
  );
  
  return { users, tracks, posts };
};

// Get personalized track recommendations for a user
export const getRecommendedTracks = (userId: string, limit: number = 10) => {
  const user = mockUsers.find(u => u.id === userId);
  if (!user) return [];
  
  const tracks = getTracks();
  return recommendContent(user, tracks).slice(0, limit);
};

// Generate optimal playlist based on duration and preferences
export const generatePlaylist = (userId: string, duration: number, maxTracks: number = 10) => {
  const tracks = getTracks();
  return generateOptimalPlaylist(tracks, duration, maxTracks);
};

export { getTracks } from './localStorage';

/**
 * Fetch all posts from Pinata using the global posts index.
 */
export async function getAllPostsFromPinata(): Promise<Post[]> {
  try {
    const postHashes = await getGlobalIndex('post');
    const posts: Post[] = [];
    for (const hash of postHashes) {
      try {
        const post = await getContentFromPinata<Post>(hash);
        posts.push(post);
      } catch (e) {
        console.warn('Failed to fetch post from Pinata:', hash, e);
      }
    }
    return posts;
  } catch (e) {
    console.error('Error fetching all posts from Pinata:', e);
    return [];
  }
}

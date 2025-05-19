
export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  isVerified: boolean;
  followers: number;
  following: number;
  posts: number;
  bio?: string;
  walletAddress?: string;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  image?: string;
  createdAt: string;
  likes: number;
  comments: number;
  user?: User;
}

export interface Track {
  id: string;
  title: string;
  artist: User;
  coverArt: string;
  audioUrl: string;
  likes: number;
  comments: number;
  plays: number;
  createdAt: string;
  duration: number; // in seconds
}

export interface Comment {
  id: string;
  userId: string;
  postId: string; // Adding this missing field to match the usage in PostCard.tsx
  content: string;
  createdAt: string;
  user?: User;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'system';
  fromUserId?: string;
  toUserId: string;
  postId?: string;
  trackId?: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  fromUser?: User;
}

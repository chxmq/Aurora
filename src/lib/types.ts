export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  isVerified: boolean;
  followers: number;
  following: number;
  followersList?: string[];
  followingList?: string[];
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
  likedBy?: string[];
  commentsList?: Comment[];
}

export interface PostInput {
  userId: string;
  content: string;
  image?: File | string;
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
  duration: number;
  lyrics?: string;
  likedBy?: string[];
  commentsList?: Comment[];
}

export interface TrackInput {
  id?: string;
  title: string;
  artist: User;
  audioUrl: File | string;
  coverArt: File | string;
  likes: number;
  comments: number;
  plays: number;
  createdAt: string;
  duration: number;
  lyrics?: string;
}

export interface Comment {
  id: string;
  userId: string;
  postId: string;
  content: string;
  createdAt: string;
  user?: User;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'system';
  fromUserId?: string;
  fromUser?: User;
  toUserId: string;
  postId?: string;
  trackId?: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

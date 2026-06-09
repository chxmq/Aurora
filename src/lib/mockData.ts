import { User, Track, Post } from './types';
import { initializeLocalStorage } from '../services/localStorage';

// Deterministic helpers for demo media so the app has something to show on a
// fresh install. Avatars/cover art come from public demo services; audio uses
// the royalty-free SoundHelix sample tracks so playback actually works.
const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(seed)}`;
const cover = (seed: string) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/400/400`;
const song = (n: number) =>
  `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`;

const daysAgo = (n: number) =>
  new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

export const mockUsers: User[] = [
  {
    id: 'u1',
    username: '@novawave',
    displayName: 'Nova Wave',
    avatar: avatar('novawave'),
    isVerified: true,
    followers: 18400,
    following: 312,
    posts: 2,
    bio: 'Synthwave producer chasing neon sunsets.',
    walletAddress: '0xa11ce0000000000000000000000000000000001',
    followersList: [],
    followingList: ['u2', 'u3'],
  },
  {
    id: 'u2',
    username: '@lofileaf',
    displayName: 'Lofi Leaf',
    avatar: avatar('lofileaf'),
    isVerified: false,
    followers: 5200,
    following: 180,
    posts: 1,
    bio: 'Chill beats to study and relax to.',
    walletAddress: '0xb0b0000000000000000000000000000000000002',
    followersList: ['u1'],
    followingList: ['u1'],
  },
  {
    id: 'u3',
    username: '@bassbloom',
    displayName: 'Bass Bloom',
    avatar: avatar('bassbloom'),
    isVerified: true,
    followers: 42100,
    following: 95,
    posts: 1,
    bio: 'Heavy low end, bigger drops.',
    walletAddress: '0xc0de000000000000000000000000000000000003',
    followersList: ['u1'],
    followingList: [],
  },
  {
    id: 'u4',
    username: '@emberkeys',
    displayName: 'Ember Keys',
    avatar: avatar('emberkeys'),
    isVerified: false,
    followers: 980,
    following: 410,
    posts: 1,
    bio: 'Piano-driven indie. Songs about cities at night.',
    walletAddress: '0xdead000000000000000000000000000000000004',
    followersList: [],
    followingList: ['u1', 'u3'],
  },
];

export const mockTracks: Track[] = [
  {
    id: 't1',
    title: 'Neon Horizon',
    artist: mockUsers[0],
    coverArt: cover('neon-horizon'),
    audioUrl: song(1),
    likes: 3200,
    comments: 84,
    plays: 145000,
    createdAt: daysAgo(3),
    duration: 372,
    lyrics: 'Driving through the neon lights\nChasing down the endless night',
    likedBy: [],
  },
  {
    id: 't2',
    title: 'Paper Moon',
    artist: mockUsers[1],
    coverArt: cover('paper-moon'),
    audioUrl: song(2),
    likes: 1100,
    comments: 27,
    plays: 38000,
    createdAt: daysAgo(10),
    duration: 426,
    likedBy: [],
  },
  {
    id: 't3',
    title: 'Subterranean',
    artist: mockUsers[2],
    coverArt: cover('subterranean'),
    audioUrl: song(3),
    likes: 8700,
    comments: 210,
    plays: 512000,
    createdAt: daysAgo(1),
    duration: 348,
    likedBy: [],
  },
  {
    id: 't4',
    title: 'City Lights at 3AM',
    artist: mockUsers[3],
    coverArt: cover('city-lights'),
    audioUrl: song(4),
    likes: 420,
    comments: 12,
    plays: 9400,
    createdAt: daysAgo(6),
    duration: 401,
    likedBy: [],
  },
  {
    id: 't5',
    title: 'Afterglow',
    artist: mockUsers[0],
    coverArt: cover('afterglow'),
    audioUrl: song(5),
    likes: 2600,
    comments: 65,
    plays: 98000,
    createdAt: daysAgo(14),
    duration: 389,
    likedBy: [],
  },
];

export const mockPosts: Post[] = [
  {
    id: 'p_seed_1',
    userId: 'u1',
    content: 'Just dropped "Neon Horizon" 🌅 Three months in the making. Let me know what you think!',
    image: cover('post-neon'),
    createdAt: daysAgo(3),
    likes: 312,
    comments: 0,
    likedBy: [],
    commentsList: [],
  },
  {
    id: 'p_seed_2',
    userId: 'u2',
    content: 'New lofi pack coming this weekend. Rainy day vibes only. ☔️🎧',
    createdAt: daysAgo(2),
    likes: 88,
    comments: 0,
    likedBy: [],
    commentsList: [],
  },
  {
    id: 'p_seed_3',
    userId: 'u3',
    content: 'That moment when the bass hits exactly right 🔊 "Subterranean" is live now.',
    image: cover('post-bass'),
    createdAt: daysAgo(1),
    likes: 540,
    comments: 0,
    likedBy: [],
    commentsList: [],
  },
  {
    id: 'p_seed_4',
    userId: 'u4',
    content: 'Wrote this one at a piano by a window overlooking the city. Hope it finds you well.',
    createdAt: daysAgo(6),
    likes: 47,
    comments: 0,
    likedBy: [],
    commentsList: [],
  },
];

/**
 * Seeds localStorage with demo content on first run. Existing data is never
 * overwritten (see initializeLocalStorage), so user-created content is safe.
 */
export const seedMockData = (): void => {
  initializeLocalStorage(mockUsers, mockTracks, mockPosts);
};

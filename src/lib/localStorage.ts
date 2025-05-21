import { User, Track, Post } from './types';

const STORAGE_KEYS = {
  USERS: 'sai_music_users',
  TRACKS: 'sai_music_tracks',
  POSTS: 'sai_music_posts',
  CURRENT_USER: 'sai_music_current_user',
  IPFS_MAPPINGS: 'sai_music_ipfs_mappings'
} as const;

// Type for IPFS mappings
export interface IPFSMapping {
  id: string;
  cid: string;
  type: 'user' | 'track' | 'post' | 'audio';
  timestamp: number;
}

// Generic storage operations
const getFromStorage = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from localStorage [${key}]:`, error);
    return null;
  }
};

const setToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage [${key}]:`, error);
  }
};

// User operations
export const saveUsers = (users: User[]): void => {
  setToStorage(STORAGE_KEYS.USERS, users);
};

export const getUsers = (): User[] => {
  return getFromStorage<User[]>(STORAGE_KEYS.USERS) || [];
};

export const saveCurrentUser = (user: User): void => {
  setToStorage(STORAGE_KEYS.CURRENT_USER, user);
};

export const getCurrentUser = (): User | null => {
  return getFromStorage<User>(STORAGE_KEYS.CURRENT_USER);
};

// Track operations
export const saveTracks = (tracks: Track[]): void => {
  setToStorage(STORAGE_KEYS.TRACKS, tracks);
};

export const getTracks = (): Track[] => {
  return getFromStorage<Track[]>(STORAGE_KEYS.TRACKS) || [];
};

// Post operations
export const savePosts = (posts: Post[]): void => {
  setToStorage(STORAGE_KEYS.POSTS, posts);
};

export const getPosts = (): Post[] => {
  return getFromStorage<Post[]>(STORAGE_KEYS.POSTS) || [];
};

// IPFS mapping operations
export const saveIPFSMapping = (mapping: IPFSMapping): void => {
  const mappings = getIPFSMappings();
  const existingIndex = mappings.findIndex(m => m.id === mapping.id && m.type === mapping.type);
  
  if (existingIndex !== -1) {
    mappings[existingIndex] = mapping;
  } else {
    mappings.push(mapping);
  }
  
  setToStorage(STORAGE_KEYS.IPFS_MAPPINGS, mappings);
};

export const getIPFSMappings = (): IPFSMapping[] => {
  return getFromStorage<IPFSMapping[]>(STORAGE_KEYS.IPFS_MAPPINGS) || [];
};

export const getIPFSMappingById = (id: string, type: IPFSMapping['type']): IPFSMapping | null => {
  const mappings = getIPFSMappings();
  return mappings.find(m => m.id === id && m.type === type) || null;
};

// Initialize local storage with mock data
export const initializeLocalStorage = (
  users: User[],
  tracks: Track[],
  posts: Post[]
): void => {
  const existingUsers = getUsers();
  const existingTracks = getTracks();
  const existingPosts = getPosts();

  // Only initialize if data doesn't exist
  if (!existingUsers || existingUsers.length === 0) {
    console.log('Initializing users with mock data');
    saveUsers(users);
  }
  
  if (!existingTracks || existingTracks.length === 0) {
    console.log('Initializing tracks with mock data');
    saveTracks(tracks);
  }
  
  if (!existingPosts || existingPosts.length === 0) {
    console.log('Initializing posts with mock data');
    savePosts(posts);
  }
}; 
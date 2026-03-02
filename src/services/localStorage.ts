import { User, Track, Post, Comment, Notification, Playlist } from '../lib/types';

export const STORAGE_PREFIX = 'aurora_';

export const STORAGE_KEYS = {
  USERS: `${STORAGE_PREFIX}users`,
  TRACKS: `${STORAGE_PREFIX}tracks`,
  POSTS: `${STORAGE_PREFIX}posts`,
  CURRENT_USER: `${STORAGE_PREFIX}current_user`,
  IPFS_MAPPINGS: `${STORAGE_PREFIX}ipfs_mappings`,
  NOTIFICATIONS: `${STORAGE_PREFIX}notifications`,
  PLAYLISTS: `${STORAGE_PREFIX}playlists`,
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

// ─── Like persistence ─────────────────────────────────────────────────────────

export const togglePostLike = (postId: string, userId: string): boolean => {
  const posts = getPosts();
  const idx = posts.findIndex(p => p.id === postId);
  if (idx === -1) return false;
  const likedBy = posts[idx].likedBy ?? [];
  const alreadyLiked = likedBy.includes(userId);
  posts[idx].likedBy = alreadyLiked
    ? likedBy.filter(id => id !== userId)
    : [...likedBy, userId];
  posts[idx].likes = posts[idx].likedBy!.length;
  savePosts(posts);
  return !alreadyLiked;
};

export const toggleTrackLike = (trackId: string, userId: string): boolean => {
  const tracks = getTracks();
  const idx = tracks.findIndex(t => t.id === trackId);
  if (idx === -1) return false;
  const likedBy = tracks[idx].likedBy ?? [];
  const alreadyLiked = likedBy.includes(userId);
  tracks[idx].likedBy = alreadyLiked
    ? likedBy.filter(id => id !== userId)
    : [...likedBy, userId];
  tracks[idx].likes = tracks[idx].likedBy!.length;
  saveTracks(tracks);
  return !alreadyLiked;
};

export const isPostLiked = (postId: string, userId: string): boolean =>
  (getPosts().find(p => p.id === postId)?.likedBy ?? []).includes(userId);

export const isTrackLiked = (trackId: string, userId: string): boolean =>
  (getTracks().find(t => t.id === trackId)?.likedBy ?? []).includes(userId);

// ─── Comment persistence ──────────────────────────────────────────────────────

export const addComment = (comment: Comment): void => {
  if (comment.postId) {
    const posts = getPosts();
    const idx = posts.findIndex(p => p.id === comment.postId);
    if (idx !== -1) {
      posts[idx].commentsList = [comment, ...(posts[idx].commentsList ?? [])];
      posts[idx].comments = posts[idx].commentsList!.length;
      savePosts(posts);
    }
  } else if (comment.trackId) {
    const tracks = getTracks();
    const idx = tracks.findIndex(t => t.id === comment.trackId);
    if (idx !== -1) {
      tracks[idx].commentsList = [comment, ...(tracks[idx].commentsList ?? [])];
      tracks[idx].comments = tracks[idx].commentsList!.length;
      saveTracks(tracks);
    }
  }
};

export const getPostComments = (postId: string): Comment[] =>
  getPosts().find(p => p.id === postId)?.commentsList ?? [];

export const getTrackComments = (trackId: string): Comment[] =>
  getTracks().find(t => t.id === trackId)?.commentsList ?? [];

// ─── Follow persistence ───────────────────────────────────────────────────────

export const followUser = (followerId: string, followeeId: string): void => {
  const users = getUsers();
  const fi = users.findIndex(u => u.id === followerId);
  const ei = users.findIndex(u => u.id === followeeId);
  if (fi === -1 || ei === -1) return;
  users[fi].followingList = [...new Set([...(users[fi].followingList ?? []), followeeId])];
  users[fi].following = users[fi].followingList!.length;
  users[ei].followersList = [...new Set([...(users[ei].followersList ?? []), followerId])];
  users[ei].followers = users[ei].followersList!.length;
  saveUsers(users);
};

export const unfollowUser = (followerId: string, followeeId: string): void => {
  const users = getUsers();
  const fi = users.findIndex(u => u.id === followerId);
  const ei = users.findIndex(u => u.id === followeeId);
  if (fi === -1 || ei === -1) return;
  users[fi].followingList = (users[fi].followingList ?? []).filter(id => id !== followeeId);
  users[fi].following = users[fi].followingList!.length;
  users[ei].followersList = (users[ei].followersList ?? []).filter(id => id !== followerId);
  users[ei].followers = users[ei].followersList!.length;
  saveUsers(users);
};

export const getIsFollowing = (followerId: string, followeeId: string): boolean =>
  (getUsers().find(u => u.id === followerId)?.followingList ?? []).includes(followeeId);

// ─── Notification persistence ─────────────────────────────────────────────────

export const saveNotification = (notification: Notification): void => {
  const all = getFromStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS) ?? [];

  // Deduplicate: skip if same type+from+to (+ optional postId/trackId) within 10 seconds
  const isDuplicate = all.some(n =>
    n.type === notification.type &&
    n.fromUserId === notification.fromUserId &&
    n.toUserId === notification.toUserId &&
    n.postId === notification.postId &&
    n.trackId === notification.trackId &&
    Math.abs(
      new Date(n.createdAt).getTime() - new Date(notification.createdAt).getTime()
    ) < 10_000
  );
  if (isDuplicate) return;

  setToStorage(STORAGE_KEYS.NOTIFICATIONS, [notification, ...all]);
};

export const getNotificationsForUser = (userId: string): Notification[] =>
  (getFromStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS) ?? []).filter(
    n => n.toUserId === userId
  );

export const getUnreadCount = (userId: string): number =>
  getNotificationsForUser(userId).filter(n => !n.isRead).length;

export const markAllNotificationsRead = (userId: string): void => {
  const all = getFromStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS) ?? [];
  setToStorage(
    STORAGE_KEYS.NOTIFICATIONS,
    all.map(n => (n.toUserId === userId ? { ...n, isRead: true } : n))
  );
};

// ─── Playlist persistence ─────────────────────────────────────────────────────

export const getPlaylists = (): Playlist[] =>
  getFromStorage<Playlist[]>(STORAGE_KEYS.PLAYLISTS) ?? [];

export const savePlaylists = (playlists: Playlist[]): void =>
  setToStorage(STORAGE_KEYS.PLAYLISTS, playlists);

export const getPlaylistsForUser = (userId: string): Playlist[] =>
  getPlaylists().filter(p => p.userId === userId);

export const createPlaylist = (playlist: Playlist): void => {
  savePlaylists([...getPlaylists(), playlist]);
};

export const updatePlaylist = (updated: Playlist): void => {
  savePlaylists(getPlaylists().map(p => (p.id === updated.id ? updated : p)));
};

export const deletePlaylist = (id: string): void => {
  savePlaylists(getPlaylists().filter(p => p.id !== id));
};

export const addTrackToPlaylist = (playlistId: string, trackId: string): void => {
  const playlists = getPlaylists();
  const idx = playlists.findIndex(p => p.id === playlistId);
  if (idx === -1) return;
  if (playlists[idx].trackIds.includes(trackId)) return;
  playlists[idx].trackIds = [...playlists[idx].trackIds, trackId];
  playlists[idx].updatedAt = new Date().toISOString();
  savePlaylists(playlists);
};

export const removeTrackFromPlaylist = (playlistId: string, trackId: string): void => {
  const playlists = getPlaylists();
  const idx = playlists.findIndex(p => p.id === playlistId);
  if (idx === -1) return;
  playlists[idx].trackIds = playlists[idx].trackIds.filter(id => id !== trackId);
  playlists[idx].updatedAt = new Date().toISOString();
  savePlaylists(playlists);
};

export const getLikedTracks = (userId: string): Track[] =>
  getTracks().filter(t => t.likedBy?.includes(userId));

// ─── Initialize local storage with mock data ──────────────────────────────────
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
    saveUsers(users);
  }

  if (!existingTracks || existingTracks.length === 0) {
    saveTracks(tracks);
  }

  if (!existingPosts || existingPosts.length === 0) {
    savePosts(posts);
  }
}; 
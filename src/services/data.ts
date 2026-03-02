import { User, Post, Track, PostInput, TrackInput } from "../lib/types";
import { generateId } from "../lib/utils";
import {
  getUsers,
  getTracks,
  getPosts,
  saveUsers,
  saveTracks,
  savePosts,
  saveIPFSMapping,
} from "./localStorage";
import { saveUserToIPFS, saveTrackToIPFS, savePostToIPFS } from "./ipfs";
import { FEATURES } from "../lib/config";
import { deleteFile } from "./fileStorage";
import { uploadImageToIPFS, uploadAudioToIPFS } from "./ipfs";
import {
  savePostToPinata,
  saveTrackToPinata,
  saveUserToPinata,
  uploadImageToPinata,
  uploadAudioToPinata,
  unpinFromPinata,
  updateGlobalIndex,
  getGlobalIndex,
  getContentFromPinata,
} from "./pinata";
import {
  mergeSort,
  recommendContent,
  calculateUserEngagementScore as calculateUserScore,
  generateOptimalPlaylist,
} from "../lib/algorithms";

// ─── User helpers ────────────────────────────────────────────────────────────

export const getUserByWalletAddress = (address: string): User | null => {
  const user = getUsers().find(
    (u) => u.walletAddress?.toLowerCase() === address.toLowerCase()
  );
  return user || null;
};

// ─── Scoring helpers (used by ranking functions below) ───────────────────────

const calculateTimeDecay = (date: string, halfLifeDays = 7) => {
  const age =
    (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24);
  return Math.pow(2, -age / halfLifeDays);
};

const normalize = (value: number, midPoint: number) =>
  1 / (1 + Math.exp(-(value - midPoint) / midPoint));

const calculateTrackEngagementScore = (track: Track) => {
  const normalizedPlays = normalize(track.plays, 50000);
  const normalizedLikes = normalize(track.likes, 5000);
  const normalizedComments = normalize(track.comments, 200);
  const timeDecay = calculateTimeDecay(track.createdAt, 30);
  return (
    normalizedPlays * 0.3 +
    normalizedLikes * 0.3 +
    normalizedComments * 0.2
  ) * (1 + timeDecay * 0.2);
};

const calculatePostEngagementScore = (post: Post) => {
  const normalizedLikes = normalize(post.likes, 1000);
  const normalizedComments = normalize(post.comments, 100);
  const timeDecay = calculateTimeDecay(post.createdAt, 7);
  return (normalizedLikes * 0.4 + normalizedComments * 0.4) * (1 + timeDecay * 0.2);
};

// ─── Posts ───────────────────────────────────────────────────────────────────

export const addPost = async (postInput: PostInput): Promise<Post> => {
  const newPost: Post = {
    id: `p${Date.now()}`,
    userId: postInput.userId,
    content: postInput.content,
    image: postInput.image as string,
    createdAt: new Date().toISOString(),
    likes: 0,
    comments: 0,
  };

  try {
    if (FEATURES.ENABLE_PINATA) {
      try {
        if (postInput.image && postInput.image instanceof File) {
          const imageHash = await uploadImageToPinata(postInput.image);
          newPost.image = `ipfs://${imageHash}`;
        }
        const hash = await savePostToPinata(newPost);
        saveIPFSMapping({ id: newPost.id, cid: hash, type: "post", timestamp: Date.now() });
        await updateGlobalIndex("post", hash);
      } catch (e) {
        console.warn("Failed to save post to Pinata, continuing with local storage:", e);
      }
    } else if (FEATURES.ENABLE_IPFS) {
      try {
        if (postInput.image && postInput.image instanceof File) {
          const imageCid = await uploadImageToIPFS(postInput.image);
          newPost.image = `ipfs://${imageCid}`;
        }
        const cid = await savePostToIPFS(newPost);
        saveIPFSMapping({ id: newPost.id, cid, type: "post", timestamp: Date.now() });
      } catch (e) {
        console.warn("Failed to save post to IPFS, continuing with local storage:", e);
      }
    }

    const posts = getPosts();
    posts.unshift(newPost);
    savePosts(posts);

    const users = getUsers();
    const userIndex = users.findIndex((u) => u.id === postInput.userId);
    if (userIndex !== -1) {
      users[userIndex].posts += 1;
      saveUsers(users);

      if (FEATURES.ENABLE_PINATA) {
        try {
          const hash = await saveUserToPinata(users[userIndex]);
          saveIPFSMapping({ id: users[userIndex].id, cid: hash, type: "user", timestamp: Date.now() });
        } catch (e) {
          console.warn("Failed to save user to Pinata:", e);
        }
      } else if (FEATURES.ENABLE_IPFS) {
        try {
          const cid = await saveUserToIPFS(users[userIndex]);
          saveIPFSMapping({ id: users[userIndex].id, cid, type: "user", timestamp: Date.now() });
        } catch (e) {
          console.warn("Failed to save user to IPFS:", e);
        }
      }
    }

    return newPost;
  } catch (error) {
    console.error("Error adding post:", error);
    throw error;
  }
};

export const deletePost = async (postId: string): Promise<boolean> => {
  try {
    const posts = getPosts();
    const postIndex = posts.findIndex((p) => p.id === postId);
    if (postIndex === -1) return false;

    const post = posts[postIndex];
    if (post.image?.startsWith("file://")) {
      deleteFile(post.image.replace("file://", ""));
    }

    posts.splice(postIndex, 1);
    savePosts(posts);

    const users = getUsers();
    const userIndex = users.findIndex((u) => u.id === post.userId);
    if (userIndex !== -1) {
      users[userIndex].posts = Math.max(0, (users[userIndex].posts || 0) - 1);
      saveUsers(users);
    }

    return true;
  } catch (error) {
    console.error("Error deleting post:", error);
    return false;
  }
};

// ─── Tracks ──────────────────────────────────────────────────────────────────

export const addTrack = async (trackInput: TrackInput): Promise<Track> => {
  const track: Track = {
    id: generateId(),
    title: trackInput.title,
    artist: trackInput.artist,
    coverArt: trackInput.coverArt as string,
    audioUrl: trackInput.audioUrl as string,
    likes: trackInput.likes,
    comments: trackInput.comments,
    plays: trackInput.plays,
    createdAt: trackInput.createdAt,
    duration: trackInput.duration,
  };

  try {
    if (FEATURES.ENABLE_PINATA) {
      try {
        if (trackInput.audioUrl instanceof File) {
          const audioHash = await uploadAudioToPinata(trackInput.audioUrl);
          track.audioUrl = `ipfs://${audioHash}`;
        }
        if (trackInput.coverArt instanceof File) {
          const coverArtHash = await uploadImageToPinata(trackInput.coverArt);
          track.coverArt = `ipfs://${coverArtHash}`;
        }
        const hash = await saveTrackToPinata(track);
        saveIPFSMapping({ id: track.id, cid: hash, type: "track", timestamp: Date.now() });
      } catch (e) {
        console.warn("Failed to save track to Pinata, continuing with local storage:", e);
      }
    } else if (FEATURES.ENABLE_IPFS) {
      try {
        if (trackInput.audioUrl instanceof File) {
          const audioCid = await uploadAudioToIPFS(trackInput.audioUrl);
          track.audioUrl = `ipfs://${audioCid}`;
        }
        if (trackInput.coverArt instanceof File) {
          const coverArtCid = await uploadImageToIPFS(trackInput.coverArt);
          track.coverArt = `ipfs://${coverArtCid}`;
        }
        const cid = await saveTrackToIPFS(track);
        saveIPFSMapping({ id: track.id, cid, type: "track", timestamp: Date.now() });
      } catch (e) {
        console.warn("Failed to save track to IPFS, continuing with local storage:", e);
      }
    }

    const tracks = getTracks();
    tracks.unshift(track);
    saveTracks(tracks);

    return track;
  } catch (error) {
    console.error("Error adding track:", error);
    throw error;
  }
};

export const deleteTrack = async (trackId: string): Promise<boolean> => {
  try {
    const tracks = getTracks();
    const trackIndex = tracks.findIndex((t) => t.id === trackId);
    if (trackIndex === -1) return false;

    const track = tracks[trackIndex];
    tracks.splice(trackIndex, 1);
    saveTracks(tracks);

    if (track.audioUrl.startsWith("file://")) {
      await deleteFile(track.audioUrl.replace("file://", ""));
    }
    if (track.coverArt.startsWith("file://")) {
      await deleteFile(track.coverArt.replace("file://", ""));
    }

    return true;
  } catch (error) {
    console.error("Error deleting track:", error);
    return false;
  }
};

// ─── Users ───────────────────────────────────────────────────────────────────

export const updateUser = async (
  userId: string,
  updates: Partial<User>
): Promise<User> => {
  try {
    const users = getUsers();
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) throw new Error("User not found");

    const updatedUser = { ...users[userIndex], ...updates };
    users[userIndex] = updatedUser;
    saveUsers(users);

    if (FEATURES.ENABLE_PINATA) {
      try {
        const hash = await saveUserToPinata(updatedUser);
        saveIPFSMapping({ id: updatedUser.id, cid: hash, type: "user", timestamp: Date.now() });
      } catch (e) {
        console.warn("Failed to save user to Pinata, continuing with local storage:", e);
      }
    } else if (FEATURES.ENABLE_IPFS) {
      try {
        const cid = await saveUserToIPFS(updatedUser);
        saveIPFSMapping({ id: updatedUser.id, cid, type: "user", timestamp: Date.now() });
      } catch (e) {
        console.warn("Failed to save user to IPFS, continuing with local storage:", e);
      }
    }

    return updatedUser;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// ─── Ranking & recommendations ────────────────────────────────────────────────

export const getPopulatedPosts = (limit = 20) => {
  const posts = getPosts();
  const users = getUsers();

  const postsWithScores = posts
    .map((post) => ({
      ...post,
      user: users.find((u) => u.id === post.userId),
      engagementScore: calculatePostEngagementScore(post),
    }))
    .filter((p) => p.user)
    .sort((a, b) => b.engagementScore - a.engagementScore);

  const diverse: typeof postsWithScores = [];
  const counts = {
    withImage: { count: 0, max: Math.ceil(limit * 0.6) },
    textOnly: { count: 0, max: Math.ceil(limit * 0.4) },
  };

  for (const post of postsWithScores) {
    const cat = post.image ? "withImage" : "textOnly";
    if (counts[cat].count < counts[cat].max) {
      diverse.push(post);
      counts[cat].count++;
    }
    if (diverse.length >= limit) break;
  }

  while (diverse.length < limit && postsWithScores.length > diverse.length) {
    const next = postsWithScores.find((p) => !diverse.includes(p));
    if (next) diverse.push(next);
    else break;
  }

  return diverse;
};

export const getPopularTracks = (limit = 10) => {
  const tracks = getTracks();
  if (!tracks || tracks.length === 0) return [];
  return sortTracksByEngagement(tracks, limit);
};

const sortTracksByEngagement = (tracks: Track[], limit: number) => {
  const sorted = mergeSort(tracks, (a, b) =>
    calculateTrackEngagementScore(b) - calculateTrackEngagementScore(a)
  );
  const maxPerArtist = Math.max(1, Math.floor(limit * 0.3));
  const result: Track[] = [];
  const artistCount: Record<string, number> = {};
  for (const track of sorted) {
    const aid = track.artist.id;
    artistCount[aid] = (artistCount[aid] || 0) + 1;
    if (artistCount[aid] <= maxPerArtist) result.push(track);
    if (result.length >= limit) break;
  }
  return result;
};

export const getSuggestedUsers = (excludeUserId?: string, limit = 5) => {
  const users = getUsers();
  const usersWithScores = users
    .filter((u) => u.id !== excludeUserId)
    .map((user) => ({
      ...user,
      engagementScore: calculateUserScore(
        user,
        getPosts().filter((p) => p.userId === user.id)
      ),
    }));

  const sorted = mergeSort(
    usersWithScores,
    (a, b) => b.engagementScore - a.engagementScore
  );

  const diverse: User[] = [];
  const cats = {
    verifiedHigh: { count: 0, max: Math.ceil(limit * 0.4) },
    verifiedLow: { count: 0, max: Math.ceil(limit * 0.2) },
    unverifiedHigh: { count: 0, max: Math.ceil(limit * 0.2) },
    unverifiedLow: { count: 0, max: Math.ceil(limit * 0.2) },
  };

  for (const user of sorted) {
    const isHigh = user.followers > 10000;
    const cat = user.isVerified
      ? isHigh ? "verifiedHigh" : "verifiedLow"
      : isHigh ? "unverifiedHigh" : "unverifiedLow";

    if (cats[cat].count < cats[cat].max) {
      diverse.push(user);
      cats[cat].count++;
    }
    if (diverse.length >= limit) break;
  }

  return diverse;
};

export const searchContent = (query: string) => {
  if (!query) return { users: [], tracks: [], posts: [] };
  const q = query.toLowerCase();
  return {
    users: getUsers().filter(
      (u) =>
        u.displayName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q)
    ),
    tracks: getTracks().filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.displayName.toLowerCase().includes(q)
    ),
    posts: getPosts().filter((p) => p.content.toLowerCase().includes(q)),
  };
};

export const getRecommendedTracks = (userId: string, limit = 10) => {
  const user = getUsers().find((u) => u.id === userId);
  if (!user) return [];
  return recommendContent(user, getTracks()).slice(0, limit);
};

export const generatePlaylist = (
  userId: string,
  duration: number,
  maxTracks = 10
) => generateOptimalPlaylist(getTracks(), duration, maxTracks);

// ─── Pinata helpers ───────────────────────────────────────────────────────────

export async function getAllPostsFromPinata(): Promise<Post[]> {
  try {
    const postHashes = await getGlobalIndex("post");
    const posts: Post[] = [];
    for (const hash of postHashes) {
      try {
        posts.push(await getContentFromPinata<Post>(hash));
      } catch (e) {
        console.warn("Failed to fetch post from Pinata:", hash, e);
      }
    }
    return posts;
  } catch (e) {
    console.error("Error fetching all posts from Pinata:", e);
    return [];
  }
}

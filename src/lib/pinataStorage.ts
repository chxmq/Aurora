import axios from 'axios';
import { User, Track, Post } from './types';

const PINATA_API_URL = 'https://api.pinata.cloud';
export const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

interface PinataConfig {
  apiKey: string;
  apiSecret: string;
  jwt: string;
}

interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

interface PinataUsageResponse {
  pinCount: {
    permanent: number;
    temporary: number;
  };
  storageUsed: {
    permanent: number;
    temporary: number;
  };
  bandwidthUsed: {
    permanent: number;
    temporary: number;
  };
}

interface PinListResponse {
  count: number;
  rows: {
    id: string;
    ipfs_pin_hash: string;
    size: number;
    user_id: string;
    date_pinned: string;
    date_unpinned: string | null;
    metadata: {
      name: string;
      keyvalues: Record<string, string>;
    };
  }[];
}

let pinataConfig: PinataConfig | null = null;

export const initializePinata = (config: PinataConfig) => {
  pinataConfig = config;
};

const getPinataAxiosConfig = () => {
  if (!pinataConfig) throw new Error('Pinata not initialized');
  
  return {
    headers: {
      'Authorization': `Bearer ${pinataConfig.jwt}`,
      'Content-Type': 'application/json'
    }
  };
};

// Upload JSON data to Pinata
export const uploadJSONToPinata = async (data: any, name: string) => {
  if (!pinataConfig) throw new Error('Pinata not initialized');

  try {
    const response = await axios.post<PinataResponse>(
      `${PINATA_API_URL}/pinning/pinJSONToIPFS`,
      {
        pinataContent: data,
        pinataMetadata: {
          name: `sai-music-app_${name}`
        }
      },
      getPinataAxiosConfig()
    );

    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading JSON to Pinata:', error);
    throw error;
  }
};

// Upload file to Pinata
export const uploadFileToPinata = async (file: File) => {
  if (!pinataConfig) throw new Error('Pinata not initialized');

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('pinataMetadata', JSON.stringify({
      name: `sai-music-app_${file.name}`
    }));

    const response = await axios.post<PinataResponse>(
      `${PINATA_API_URL}/pinning/pinFileToIPFS`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${pinataConfig.jwt}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading file to Pinata:', error);
    throw error;
  }
};

// User data management
export const saveUserToPinata = async (user: User) => {
  const hash = await uploadJSONToPinata(user, `user-${user.id}`);
  return hash;
};

// Track data management
export const saveTrackToPinata = async (track: Track) => {
  const hash = await uploadJSONToPinata(track, `track-${track.id}`);
  return hash;
};

// Post data management
export const savePostToPinata = async (post: Post) => {
  const hash = await uploadJSONToPinata(post, `post-${post.id}`);
  return hash;
};

// Audio file upload
export const uploadAudioToPinata = async (audioFile: File) => {
  const hash = await uploadFileToPinata(audioFile);
  return hash;
};

// Image upload
export const uploadImageToPinata = async (imageFile: File) => {
  const hash = await uploadFileToPinata(imageFile);
  return hash;
};

// Get content from Pinata Gateway
export const getContentFromPinata = async <T>(hash: string): Promise<T> => {
  try {
    const response = await axios.get<T>(`${PINATA_GATEWAY}${hash}`);
    return response.data;
  } catch (error) {
    console.error('Error getting content from Pinata:', error);
    throw error;
  }
};

// Unpin content from Pinata
export const unpinFromPinata = async (hash: string) => {
  if (!pinataConfig) throw new Error('Pinata not initialized');

  try {
    await axios.delete(
      `${PINATA_API_URL}/pinning/unpin/${hash}`,
      getPinataAxiosConfig()
    );
    return true;
  } catch (error) {
    console.error('Error unpinning from Pinata:', error);
    throw error;
  }
};

// Get total storage usage
export const getPinataUsage = async () => {
  if (!pinataConfig) throw new Error('Pinata not initialized');

  try {
    const response = await axios.get<PinataUsageResponse>(
      `${PINATA_API_URL}/data/usageInfo`,
      getPinataAxiosConfig()
    );

    return {
      totalPins: response.data.pinCount.permanent + response.data.pinCount.temporary,
      storageUsed: {
        permanent: formatBytes(response.data.storageUsed.permanent),
        temporary: formatBytes(response.data.storageUsed.temporary),
        total: formatBytes(response.data.storageUsed.permanent + response.data.storageUsed.temporary)
      },
      bandwidthUsed: {
        permanent: formatBytes(response.data.bandwidthUsed.permanent),
        temporary: formatBytes(response.data.bandwidthUsed.temporary),
        total: formatBytes(response.data.bandwidthUsed.permanent + response.data.bandwidthUsed.temporary)
      }
    };
  } catch (error) {
    console.error('Error getting Pinata usage:', error);
    throw error;
  }
};

// Get list of pinned content with pagination
export const getPinnedContent = async (offset = 0, limit = 10) => {
  if (!pinataConfig) throw new Error('Pinata not initialized');

  try {
    const response = await axios.get<PinListResponse>(
      `${PINATA_API_URL}/data/pinList?status=pinned&pageOffset=${offset}&pageLimit=${limit}`,
      getPinataAxiosConfig()
    );

    return {
      total: response.data.count,
      items: response.data.rows.map(item => ({
        hash: item.ipfs_pin_hash,
        name: item.metadata.name,
        size: formatBytes(item.size),
        pinned: new Date(item.date_pinned).toLocaleString(),
        type: getContentType(item.metadata.name)
      }))
    };
  } catch (error) {
    console.error('Error getting pinned content:', error);
    throw error;
  }
};

// Helper function to format bytes into human-readable format
const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Helper function to determine content type from filename
const getContentType = (filename: string) => {
  if (filename.includes('user-')) return 'User Data';
  if (filename.includes('track-')) return 'Music Track';
  if (filename.includes('post-')) return 'Post';
  
  const extension = filename.split('.').pop()?.toLowerCase();
  if (['mp3', 'wav', 'ogg'].includes(extension || '')) return 'Audio';
  if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) return 'Image';
  
  return 'Other';
};

/**
 * Fetches the global index file (e.g., posts.json, tracks.json, users.json) from Pinata.
 * Returns an array of hashes (or objects if you want to store full objects inline).
 */
export async function getGlobalIndex(type: 'post' | 'track' | 'user'): Promise<string[]> {
  const indexName = `sai-music-app_${type}s.json`;
  try {
    // Hardcoded initial index hashes for each type (update these as needed)
    const initialHashes: Record<string, string> = {
      post: 'QmYourPostsJsonHashHere', // <-- Replace with your actual posts.json hash from Pinata
      track: '',
      user: ''
    };
    const hashKey = `pinata_index_hash_${type}`;
    let indexHash = localStorage.getItem(hashKey) || initialHashes[type];
    if (!indexHash) {
      throw new Error('Index hash not found for ' + type);
    }
    const url = `https://gateway.pinata.cloud/ipfs/${indexHash}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch global index');
    return await response.json();
  } catch (error) {
    console.error('Error fetching global index:', error);
    return [];
  }
}

/**
 * Updates the global index file on Pinata by adding a new hash.
 * Uploads the new index and stores the new hash in localStorage.
 */
export async function updateGlobalIndex(type: 'post' | 'track' | 'user', hash: string): Promise<void> {
  const indexName = `sai-music-app_${type}s.json`;
  const hashKey = `pinata_index_hash_${type}`;
  let index: string[] = [];
  try {
    index = await getGlobalIndex(type);
  } catch {
    index = [];
  }
  if (!index.includes(hash)) {
    index.push(hash);
  }
  // Upload the updated index to Pinata
  const newHash = await uploadJSONToPinata(index, indexName);
  localStorage.setItem(hashKey, newHash);
} 
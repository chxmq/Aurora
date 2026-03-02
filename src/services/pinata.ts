import axios from 'axios';
import { User, Track, Post } from '../lib/types';
import { PINATA_CONFIG } from '../lib/config';

const PINATA_API_URL = 'https://api.pinata.cloud';

export const PINATA_GATEWAY = PINATA_CONFIG.GATEWAY;

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

// Matches the actual Pinata v2 /data/userPinnedDataTotal response shape
interface PinataUsageResponse {
  pin_count: number;
  pin_size_total: number;
  pin_size_with_replications_total: number;
}

interface PinListRow {
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
}

interface PinListResponse {
  count: number;
  rows: PinListRow[];
}

let pinataConfig: PinataConfig | null = null;

export const initializePinata = (config: PinataConfig) => {
  pinataConfig = config;
};

const getPinataAxiosConfig = () => {
  if (!pinataConfig) throw new Error('Pinata not initialized');

  return {
    headers: {
      Authorization: `Bearer ${pinataConfig.jwt}`,
      'Content-Type': 'application/json',
    },
  };
};

export const uploadJSONToPinata = async (data: object, name: string) => {
  if (!pinataConfig) throw new Error('Pinata not initialized');

  try {
    const response = await axios.post<PinataResponse>(
      `${PINATA_API_URL}/pinning/pinJSONToIPFS`,
      {
        pinataContent: data,
        pinataMetadata: { name },
      },
      getPinataAxiosConfig()
    );

    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading JSON to Pinata:', error);
    throw error;
  }
};

export const uploadFileToPinata = async (file: File) => {
  if (!pinataConfig) throw new Error('Pinata not initialized');

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append(
      'pinataMetadata',
      JSON.stringify({ name: `aurora_${file.name}` })
    );

    const response = await axios.post<PinataResponse>(
      `${PINATA_API_URL}/pinning/pinFileToIPFS`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${pinataConfig.jwt}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading file to Pinata:', error);
    throw error;
  }
};

export const saveUserToPinata = async (user: User) => {
  return uploadJSONToPinata(user, `aurora_user-${user.id}.json`);
};

export const saveTrackToPinata = async (track: Track) => {
  return uploadJSONToPinata(track, `aurora_track-${track.id}.json`);
};

export const savePostToPinata = async (post: Post) => {
  return uploadJSONToPinata(post, `aurora_post-${post.id}.json`);
};

export const uploadAudioToPinata = async (audioFile: File) => {
  return uploadFileToPinata(audioFile);
};

export const uploadImageToPinata = async (imageFile: File) => {
  return uploadFileToPinata(imageFile);
};

export const getContentFromPinata = async <T>(hash: string): Promise<T> => {
  try {
    const response = await axios.get<T>(`${PINATA_GATEWAY}${hash}`);
    return response.data;
  } catch (error) {
    console.error('Error getting content from Pinata:', error);
    throw error;
  }
};

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

// Uses the correct Pinata v2 endpoint: /data/userPinnedDataTotal
export const getPinataUsage = async () => {
  if (!pinataConfig) throw new Error('Pinata not initialized');

  try {
    const response = await axios.get<PinataUsageResponse>(
      `${PINATA_API_URL}/data/userPinnedDataTotal`,
      getPinataAxiosConfig()
    );

    return {
      totalPins: response.data.pin_count,
      storageUsed: formatBytes(response.data.pin_size_total),
      storageWithReplications: formatBytes(
        response.data.pin_size_with_replications_total
      ),
    };
  } catch (error) {
    console.error('Error getting Pinata usage:', error);
    throw error;
  }
};

export const getPinnedContent = async (offset = 0, limit = 10) => {
  if (!pinataConfig) throw new Error('Pinata not initialized');

  try {
    const response = await axios.get<PinListResponse>(
      `${PINATA_API_URL}/data/pinList?status=pinned&pageOffset=${offset}&pageLimit=${limit}`,
      getPinataAxiosConfig()
    );

    return {
      total: response.data.count,
      items: response.data.rows.map((item) => ({
        hash: item.ipfs_pin_hash,
        name: item.metadata.name,
        size: formatBytes(item.size),
        pinned: new Date(item.date_pinned).toLocaleString(),
        type: getContentType(item.metadata.name),
      })),
    };
  } catch (error) {
    console.error('Error getting pinned content:', error);
    throw error;
  }
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

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
 * Fetches the global index (array of IPFS hashes) for the given content type.
 * The index hash is stored in localStorage after the first upload.
 * Returns [] when no index has been created yet.
 */
export async function getGlobalIndex(
  type: 'post' | 'track' | 'user'
): Promise<string[]> {
  const hashKey = `aurora_index_hash_${type}`;
  const indexHash = localStorage.getItem(hashKey);

  if (!indexHash) {
    return [];
  }

  try {
    const url = `${PINATA_GATEWAY}${indexHash}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch global index');
    return await response.json();
  } catch (error) {
    console.error('Error fetching global index:', error);
    return [];
  }
}

/**
 * Appends a new content hash to the global index for the given type,
 * re-uploads the index to Pinata, and stores the new index hash in localStorage.
 */
export async function updateGlobalIndex(
  type: 'post' | 'track' | 'user',
  hash: string
): Promise<void> {
  const hashKey = `aurora_index_hash_${type}`;
  const indexName = `aurora_${type}s-index.json`;

  const index = await getGlobalIndex(type);
  if (!index.includes(hash)) {
    index.push(hash);
  }

  const newHash = await uploadJSONToPinata(index, indexName);
  localStorage.setItem(hashKey, newHash);
}

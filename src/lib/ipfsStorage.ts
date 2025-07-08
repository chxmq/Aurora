import { create } from '@web3-storage/w3up-client';
import { User, Track, Post } from './types';

// Initialize Web3.Storage client
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: any = null; // Web3.Storage client doesn't export proper types

export const initializeIPFSStorage = async (email: string) => {
  try {
    client = await create();
    await client.login(email);
    const space = await client.createSpace('sai-music-app');
    await space.save();
    await client.setCurrentSpace(space.did());
  } catch (error) {
    console.error('Error initializing IPFS storage:', error);
    throw error;
  }
};

export const uploadToIPFS = async (data: File | object, filename: string, isBinary: boolean = false) => {
  if (!client) throw new Error('IPFS storage not initialized');

  try {
    // Handle binary data differently from JSON data
    const blob = isBinary && data instanceof File
      ? new Blob([data], { type: data.type || 'application/octet-stream' })
      : new Blob([JSON.stringify(data)], { type: 'application/json' });
    const file = new File([blob], filename);

    // Upload to IPFS
    const cid = await client.uploadFile(file);
    return cid.toString();
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
};

export const retrieveFromIPFS = async (cid: string) => {
  if (!client) throw new Error('IPFS storage not initialized');

  try {
    const res = await client.get(cid);
    if (!res) throw new Error('Not found');

    const content = await res.json();
    return content;
  } catch (error) {
    console.error('Error retrieving from IPFS:', error);
    throw error;
  }
};

// User data management
export const saveUserToIPFS = async (user: User) => {
  const cid = await uploadToIPFS(user, `user-${user.id}.json`);
  return cid;
};

// Track data management
export const saveTrackToIPFS = async (track: Track) => {
  const cid = await uploadToIPFS(track, `track-${track.id}.json`);
  return cid;
};

// Post data management
export const savePostToIPFS = async (post: Post) => {
  const cid = await uploadToIPFS(post, `post-${post.id}.json`);
  return cid;
};

// Audio file upload
export const uploadAudioToIPFS = async (audioFile: File) => {
  if (!client) throw new Error('IPFS storage not initialized');

  try {
    const cid = await client.uploadFile(audioFile);
    return cid.toString();
  } catch (error) {
    console.error('Error uploading audio to IPFS:', error);
    throw error;
  }
};

// Add image upload function
export const uploadImageToIPFS = async (imageFile: File) => {
  if (!client) throw new Error('IPFS storage not initialized');

  try {
    const cid = await uploadToIPFS(imageFile, imageFile.name, true);
    return cid;
  } catch (error) {
    console.error('Error uploading image to IPFS:', error);
    throw error;
  }
}; 
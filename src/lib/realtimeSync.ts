import { create } from '@web3-storage/w3up-client';
import { retrieveFromIPFS } from './ipfsStorage';
import { getIPFSMappings, saveIPFSMapping } from './localStorage';
import { getTracks, getPosts, getUsers, saveTracks, savePosts, saveUsers } from './localStorage';
import { Track, Post, User } from './types';

const SYNC_CHANNEL = 'sai-music-app-sync';
let pubsubClient: any = null;

// Initialize pubsub client
export const initializePubSub = async () => {
  try {
    pubsubClient = await create();
    await pubsubClient.subscribe(SYNC_CHANNEL, handlePubSubMessage);
    console.log('PubSub initialized and subscribed to channel');
  } catch (error) {
    console.error('Error initializing PubSub:', error);
    throw error;
  }
};

// Handle incoming messages
const handlePubSubMessage = async (message: any) => {
  try {
    const { type, id, cid, timestamp } = JSON.parse(message.data);
    
    // Check if we already have a newer version
    const existingMapping = getIPFSMappings().find(m => m.id === id && m.type === type);
    if (existingMapping && existingMapping.timestamp > timestamp) {
      return; // We have a newer version, ignore this update
    }

    // Retrieve the updated content from IPFS
    const content = await retrieveFromIPFS(cid);
    
    // Update local storage based on content type
    switch (type) {
      case 'track':
        updateTracks(content);
        break;
      case 'post':
        updatePosts(content);
        break;
      case 'user':
        updateUsers(content);
        break;
    }

    // Save the new IPFS mapping
    saveIPFSMapping({ id, cid, type, timestamp });
  } catch (error) {
    console.error('Error handling PubSub message:', error);
  }
};

// Update functions for different content types
const updateTracks = (newTrack: Track) => {
  const tracks = getTracks();
  const index = tracks.findIndex(t => t.id === newTrack.id);
  if (index !== -1) {
    tracks[index] = newTrack;
  } else {
    tracks.unshift(newTrack);
  }
  saveTracks(tracks);
};

const updatePosts = (newPost: Post) => {
  const posts = getPosts();
  const index = posts.findIndex(p => p.id === newPost.id);
  if (index !== -1) {
    posts[index] = newPost;
  } else {
    posts.unshift(newPost);
  }
  savePosts(posts);
};

const updateUsers = (newUser: User) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === newUser.id);
  if (index !== -1) {
    users[index] = newUser;
  } else {
    users.push(newUser);
  }
  saveUsers(users);
};

// Function to broadcast updates to other clients
export const broadcastUpdate = async (type: 'track' | 'post' | 'user', id: string, cid: string) => {
  if (!pubsubClient) {
    console.warn('PubSub not initialized');
    return;
  }

  try {
    const message = {
      type,
      id,
      cid,
      timestamp: Date.now()
    };
    await pubsubClient.publish(SYNC_CHANNEL, JSON.stringify(message));
  } catch (error) {
    console.error('Error broadcasting update:', error);
  }
}; 
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Post, Track } from './types';
import { getPopulatedPosts, getPopularTracks, getSuggestedUsers } from './mockData';
import { getUsers, getPosts, getTracks, getCurrentUser } from './localStorage';

interface DataContextType {
  posts: (Post & { user: User })[];
  popularTracks: Track[];
  suggestedUsers: User[];
  currentUser: User | null;
  refreshData: () => void;
  refreshPosts: () => void;
  refreshUser: () => void;
}

const DataContext = createContext<DataContextType>({
  posts: [],
  popularTracks: [],
  suggestedUsers: [],
  currentUser: null,
  refreshData: () => {},
  refreshPosts: () => {},
  refreshUser: () => {}
});

export const useData = () => useContext(DataContext);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<(Post & { user: User })[]>([]);
  const [popularTracks, setPopularTracks] = useState<Track[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const refreshPosts = useCallback(() => {
    try {
      console.log('Refreshing posts...');
      const updatedPosts = getPopulatedPosts();
      if (!Array.isArray(updatedPosts)) {
        console.error('Invalid posts data:', updatedPosts);
        return;
      }
      setPosts(updatedPosts);
      console.log('Posts refreshed successfully:', updatedPosts.length);
    } catch (error) {
      console.error('Error refreshing posts:', error);
    }
  }, []);

  const refreshUser = useCallback(() => {
    try {
      console.log('Refreshing user data...');
      const user = getCurrentUser();
      setCurrentUser(user);
      console.log('User refreshed successfully:', user?.id);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, []);

  const refreshSuggestedUsers = useCallback(() => {
    try {
      console.log('Refreshing suggested users...');
      const users = getUsers()
        .sort((a, b) => (b.followers || 0) - (a.followers || 0))
        .filter(u => u.id !== currentUser?.id)
        .slice(0, 5);
      setSuggestedUsers(users);
      console.log('Suggested users refreshed successfully:', users.length);
    } catch (error) {
      console.error('Error refreshing suggested users:', error);
    }
  }, [currentUser?.id]);

  const refreshTracks = useCallback(() => {
    try {
      console.log('Refreshing tracks...');
      setPopularTracks(getPopularTracks().slice(0, 5));
      console.log('Tracks refreshed successfully');
    } catch (error) {
      console.error('Error refreshing tracks:', error);
    }
  }, []);

  const refreshData = useCallback(() => {
    console.log('Refreshing all data...');
    refreshUser();
    refreshPosts();
    refreshTracks();
    refreshSuggestedUsers();
  }, [refreshUser, refreshPosts, refreshTracks, refreshSuggestedUsers]);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Set up periodic refresh for dynamic content
  useEffect(() => {
    const postInterval = setInterval(refreshPosts, 3000); // Refresh posts every 3 seconds
    const userInterval = setInterval(refreshSuggestedUsers, 10000); // Refresh users every 10 seconds
    const trackInterval = setInterval(refreshTracks, 15000); // Refresh tracks every 15 seconds

    return () => {
      clearInterval(postInterval);
      clearInterval(userInterval);
      clearInterval(trackInterval);
    };
  }, [refreshPosts, refreshSuggestedUsers, refreshTracks]);

  return (
    <DataContext.Provider 
      value={{ 
        posts, 
        popularTracks, 
        suggestedUsers, 
        currentUser,
        refreshData,
        refreshPosts,
        refreshUser
      }}
    >
      {children}
    </DataContext.Provider>
  );
} 